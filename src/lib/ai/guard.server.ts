import { getRequest } from "@tanstack/react-start/server";
import { isPrivateNetworkHostname, isTrustedAppOrigin } from "./origin";
import { DEV_USER_ID, UnauthorizedError, requireUserId } from "@/lib/auth/verify.server";
import { viteDevServer } from "@/lib/runtime-mode";

export class AiRequestDeniedError extends Error {
  readonly status = 403;
  readonly code = "AI_REQUEST_FORBIDDEN";

  constructor(message: string) {
    super(message);
    this.name = "AiRequestDeniedError";
  }
}

function trustedDevelopmentHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  // The LAN address counts: `npm run dev` binds 0.0.0.0:8080 precisely so the
  // phone in the room can load it, and refusing that origin denied every
  // analysis on the device the couple actually uses.
  return isPrivateNetworkHostname(host) || host.endsWith(".grok-sandbox.com");
}

/** Authenticate cost-bearing endpoints and reject cross-site browser calls. */
export async function authorizeAiRequest(verifiedUserId?: string): Promise<{ userId: string; signal: AbortSignal }> {
  // The standard auth middleware supplies this value after resolving either
  // the same-origin session cookie or the live-preview bearer token. Retain the
  // direct resolver only for server-only callers that do not use middleware.
  const userId = verifiedUserId?.trim() || await requireUserId();
  if (userId === DEV_USER_ID && !viteDevServer) {
    throw new UnauthorizedError();
  }
  const request = getRequest();
  if (!request) throw new Error("Request context is unavailable");

  const fetchSite = request.headers.get("sec-fetch-site")?.toLowerCase();
  if (fetchSite === "cross-site") throw new AiRequestDeniedError("Cross-site AI requests are not allowed");

  const origin = request.headers.get("origin");
  if (!origin) {
    throw new AiRequestDeniedError("AI requests require a same-origin browser request");
  }
  if (
    !isTrustedAppOrigin(origin, {
      configuredOrigin: process.env.BETTER_AUTH_URL,
      allowLoopback: viteDevServer,
      // The shared preview domain is a trusted origin only where the live
      // preview is actually wired up: the dev server, or a deployment holding
      // the preview OAuth client secret. A production app on its own domain
      // gets its origin from BETTER_AUTH_URL and never trusts the shared
      // sandbox domain.
      allowPreviewHosts:
        viteDevServer || Boolean(process.env.GROK_PREVIEW_CLIENT_SECRET?.trim()),
    })
  ) {
    throw new AiRequestDeniedError("Request origin is not allowed");
  }

  if (userId === DEV_USER_ID) {
    if (process.env.ALLOW_DEV_AI?.trim().toLowerCase() !== "true") {
      throw new AiRequestDeniedError(
        "Development AI is disabled. Set ALLOW_DEV_AI=true alongside XAI_API_KEY to allow cloud analysis from the local dev server.",
      );
    }
    // Judged on the Origin the browser sent, which the checks above have already
    // matched against configuration, rather than on the request's own Host.
    if (!trustedDevelopmentHost(new URL(origin).hostname)) {
      throw new AiRequestDeniedError("Development AI is limited to loopback and trusted preview hosts");
    }
  }
  return { userId, signal: request.signal };
}
