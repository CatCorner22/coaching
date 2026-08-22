import type { BetterAuthPlugin } from "better-auth";
import {
  APIError,
  createAuthMiddleware,
  getSessionFromCtx,
} from "better-auth/api";
import {
  parseSetCookieHeader,
  setRequestCookie,
  setSessionCookie,
} from "better-auth/cookies";
import { handleOAuthUserInfo } from "better-auth/oauth2";
import {
  GATE_IDENTITY_HEADER,
  gateIdentityEnabled,
  gateIdentityFromHeaders,
  sessionBoundToGateIdentity,
} from "./gate-identity.server";
import {
  removeRequestCookieFamily,
  requestCookieFamilyNames,
} from "./gate-cookie-core";

export const GATE_PROVIDER_ID = "grok-gate";
const GATE_ACCOUNT_ISSUER = "https://grok.com";
const LOG = "[gate-identity]";

type GateAccount = Parameters<typeof handleOAuthUserInfo>[1]["account"];

/**
 * Emit the signed session cookie so the browser actually receives it.
 *
 * `setSessionCookie` writes into the Better Auth middleware header bag, but on
 * TanStack Start that bag is not always copied onto the final HTTP response
 * (the response can end up with no `Set-Cookie`). Sign the token ourselves and
 * push it through TanStack's `setCookie` + `responseHeaders` so both the
 * framework cookie store and any after-hooks see it.
 */
async function emitSessionCookie(
  ctx: Parameters<Parameters<typeof createAuthMiddleware>[0]>[0],
  sessionTokenName: string,
  sessionToken: string,
): Promise<string | null> {
  const attributes = ctx.context.authCookies.sessionToken.attributes;
  const maxAge = ctx.context.sessionConfig.expiresIn;
  const cookieOptions = {
    ...attributes,
    maxAge,
  };

  let signedCookie: string;
  try {
    signedCookie = await ctx.setSignedCookie(
      sessionTokenName,
      sessionToken,
      ctx.context.secret,
      cookieOptions,
    );
  } catch (err) {
    console.error(`${LOG} setSignedCookie failed`, err);
    return null;
  }

  const sessionValue = parseSetCookieHeader(signedCookie).get(
    sessionTokenName,
  )?.value;
  if (!sessionValue) {
    console.error(`${LOG} signed Set-Cookie missing session token value`, {
      cookieName: sessionTokenName,
      byteLength: Buffer.byteLength(signedCookie, "utf8"),
    });
    return null;
  }

  // Primary path: TanStack Start's response cookie store (reaches the browser).
  let delivered = false;
  try {
    const { setCookie } = await import("@tanstack/react-start/server");
    setCookie(sessionTokenName, sessionValue, {
      path: cookieOptions.path ?? "/",
      httpOnly: cookieOptions.httpOnly ?? true,
      secure: cookieOptions.secure ?? true,
      sameSite: (cookieOptions.sameSite as "lax" | "strict" | "none") ?? "lax",
      maxAge: typeof maxAge === "number" ? maxAge : undefined,
      domain: cookieOptions.domain,
    });
    delivered = true;
  } catch (err) {
    console.error(`${LOG} TanStack setCookie failed`, err);
  }

  // Also stash on Better Auth responseHeaders so after-hooks (tanstackStartCookies)
  // can forward it if they run.
  try {
    const responseHeaders = ctx.context.responseHeaders;
    if (responseHeaders) {
      responseHeaders.append("set-cookie", signedCookie);
      delivered = true;
    } else {
      console.error(`${LOG} ctx.context.responseHeaders is missing`);
    }
  } catch (err) {
    console.error(`${LOG} responseHeaders.append(set-cookie) failed`, err);
  }

  return delivered ? sessionValue : null;
}

/**
 * Expire the previous user's `session_data` cookie cache after an identity
 * swap. The cache is signed against the old session and outlives it (5-min
 * TTL), so without this `/get-session` keeps serving the replaced user.
 * Mirrors `emitSessionCookie`'s dual-path delivery: TanStack's response
 * cookie store plus Better Auth's `responseHeaders` bag.
 */
async function expireSessionDataCookies(
  ctx: Parameters<Parameters<typeof createAuthMiddleware>[0]>[0],
  cookie: { name: string; attributes: { path?: string; secure?: boolean } },
  names: readonly string[],
): Promise<void> {
  const path = cookie.attributes.path ?? "/";
  const secure = cookie.attributes.secure ?? true;
  for (const name of names) {
    try {
      const { setCookie } = await import("@tanstack/react-start/server");
      setCookie(name, "", {
        path,
        httpOnly: true,
        secure,
        sameSite: "lax",
        maxAge: 0,
      });
    } catch (err) {
      console.error(`${LOG} TanStack setCookie (expire session_data) failed`, err);
    }
    try {
      ctx.context.responseHeaders?.append(
        "set-cookie",
        `${name}=; Path=${path}; HttpOnly; ` +
          `${secure ? "Secure; " : ""}SameSite=Lax; Max-Age=0`,
      );
    } catch (err) {
      console.error(
        `${LOG} responseHeaders.append (expire session_data) failed`,
        err,
      );
    }
  }
}

export function gateIdentitySessions() {
  return {
    id: "grok-gate-identity",
    hooks: {
      before: [
        {
          matcher: (ctx: { path?: string }) => ctx.path === "/get-session",
          handler: createAuthMiddleware(async (ctx) => {
            if (!gateIdentityEnabled()) return;
            // Prefer headers produced by earlier Better Auth hooks (notably the
            // bearer-to-cookie translation) over the immutable raw request.
            const inbound = ctx.headers ?? ctx.request?.headers;
            if (!inbound) {
              console.error(`${LOG} no request headers on /get-session`);
              return;
            }
            if (!inbound.has(GATE_IDENTITY_HEADER)) return;

            const identity = await gateIdentityFromHeaders(inbound);
            if (!identity) {
              console.error(
                `${LOG} ${GATE_IDENTITY_HEADER} present but verification failed`,
              );
              throw new APIError("UNAUTHORIZED", {
                message: "The hosting identity assertion could not be verified.",
              });
            }

            try {
              const sessionCookieName =
                ctx.context.authCookies.sessionToken.name;
              const sessionDataCookie = ctx.context.authCookies.sessionData;
              const sessionDataCookieNames = requestCookieFamilyNames(
                inbound,
                sessionDataCookie.name,
              );
              const cookieHeader = inbound.get("cookie") ?? "";
              if (cookieHeader.includes(`${sessionCookieName}=`)) {
                // These adapter operations intentionally have no local catch.
                // If inspection or deletion fails, the outer APIError path
                // rejects /get-session before handleOAuthUserInfo can mint a
                // second valid identity alongside the stale session.
                const existing = await getSessionFromCtx(ctx, {
                  disableCookieCache: true,
                });
                if (existing?.session && existing.user) {
                  const accounts =
                    await ctx.context.internalAdapter.findAccounts(
                      existing.user.id,
                    );
                  if (!accounts) {
                    throw new Error(
                      "The existing session account bindings were unavailable.",
                    );
                  }
                  if (
                    sessionBoundToGateIdentity(
                      accounts,
                      identity.sub,
                      GATE_PROVIDER_ID,
                    )
                  ) {
                    // The token is already bound correctly, but a stale or
                    // chunked session_data cache could still name a prior user.
                    // Remove that cache from this request and expire it in the
                    // response so the endpoint resolves authoritatively.
                    await expireSessionDataCookies(
                      ctx,
                      sessionDataCookie,
                      sessionDataCookieNames,
                    );
                    const headers = new Headers(
                      Object.fromEntries(inbound.entries()),
                    );
                    removeRequestCookieFamily(headers, sessionDataCookie.name);
                    return { context: { headers } };
                  }
                  await ctx.context.internalAdapter.deleteSession(
                    existing.session.token,
                  );
                } else if (existing) {
                  throw new Error(
                    "The existing session response was incomplete.",
                  );
                }
              }

              const result = await handleOAuthUserInfo(ctx, {
                userInfo: {
                  id: identity.sub,
                  email: (
                    identity.email ?? `${identity.sub}@viewer.grok.invalid`
                  ).toLowerCase(),
                  emailVerified: Boolean(identity.email),
                  name: identity.name ?? "Grok user",
                },
                account: {
                  providerId: GATE_PROVIDER_ID,
                  issuer: GATE_ACCOUNT_ISSUER,
                  accountId: identity.sub,
                } as GateAccount,
              });
              if (result.error || !result.data) {
                console.error(`${LOG} handleOAuthUserInfo failed`, {
                  errorType: result.error ? "provider-error" : "none",
                  hasData: Boolean(result.data),
                });
                throw new APIError("INTERNAL_SERVER_ERROR", {
                  message: "The hosting identity session could not be created.",
                });
              }

              // Persist session rows + internal newSession state.
              await setSessionCookie(ctx, result.data);

              // Explicitly sign the token and emit Set-Cookie — do NOT rely on
              // reading it back from ctx.context.responseHeaders (often empty
              // here, which previously caused a silent signed-out render).
              const sessionValue = await emitSessionCookie(
                ctx,
                sessionCookieName,
                result.data.session.token,
              );
              if (!sessionValue) {
                console.error(
                  `${LOG} session created in DB but cookie was not emitted`,
                );
                throw new APIError("INTERNAL_SERVER_ERROR", {
                  message: "The hosting identity session cookie could not be issued.",
                });
              }

              await expireSessionDataCookies(
                ctx,
                sessionDataCookie,
                sessionDataCookieNames,
              );

              // Inject the cookie into this request so the rest of /get-session
              // resolves the newly created session in the same round-trip.
              const headers = new Headers(
                Object.fromEntries(inbound.entries()),
              );
              setRequestCookie(headers, sessionCookieName, sessionValue);
              removeRequestCookieFamily(headers, sessionDataCookie.name);
              return { context: { headers } };
            } catch (err) {
              console.error(
                `${LOG} gate identity session hook threw`,
                err instanceof Error ? err.name : "unknown error",
              );
              if (err instanceof APIError) throw err;
              throw new APIError("INTERNAL_SERVER_ERROR", {
                message:
                  "The prior session could not be safely rotated to the hosting identity.",
              });
            }
          }),
        },
      ],
    },
  } satisfies BetterAuthPlugin;
}
