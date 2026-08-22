import {
  importJWK,
  jwtVerify,
  type JWK,
  type JWTVerifyGetKey,
} from "jose";
import { normalizeHttpsOrigin } from "./config.ts";

export const GATE_IDENTITY_HEADER = "x-grok-identity";
export const GATE_JWKS_PATH = "/__gate/identity-key";

const JWKS_CACHE_TTL_MS = 300_000;
export const GATE_JWKS_FETCH_TIMEOUT_MS = 3_000;
export const GATE_JWKS_MAX_BYTES = 64 * 1024;
export const GATE_JWKS_MAX_KEYS = 16;
const GATE_JWKS_CACHE_MAX_ENTRIES = 8;

export type GateIdentity = {
  sub: string;
  email: string | null;
  name: string | null;
  teamId: string | null;
};

export type GateJwks = { keys: JWK[] };

export type JwksFetch = (url: string) => Promise<GateJwks | null>;

export type GateKeyResolverOptions = {
  /** Tests and stricter callers may shorten, but never extend, the budget. */
  fetchTimeoutMs?: number;
};

function env(key: string): string | undefined {
  const v = process.env[key]?.trim();
  return v || undefined;
}

export function gateIdentityEnabled(): boolean {
  return env("VITE_AUTH_ENABLED") !== "false" && Boolean(env("GROK_PROJECT_ID"));
}

function normalizeGateJwks(value: unknown): GateJwks | null {
  if (!value || typeof value !== "object" || !("keys" in value)) return null;
  const keys = (value as { keys?: unknown }).keys;
  if (
    !Array.isArray(keys) ||
    keys.length === 0 ||
    keys.length > GATE_JWKS_MAX_KEYS ||
    !keys.every((key) => key !== null && typeof key === "object")
  ) {
    return null;
  }
  return { keys: keys as JWK[] };
}

/** Parse a JWKS response without ever buffering more than the byte budget. */
export async function parseGateJwksResponse(
  response: Response,
): Promise<GateJwks | null> {
  const declaredLength = response.headers.get("content-length");
  if (declaredLength) {
    if (!/^\d+$/.test(declaredLength)) return null;
    if (Number(declaredLength) > GATE_JWKS_MAX_BYTES) {
      await response.body?.cancel().catch(() => undefined);
      return null;
    }
  }
  if (!response.body) return null;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let bytesRead = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytesRead += value.byteLength;
      if (bytesRead > GATE_JWKS_MAX_BYTES) {
        await reader.cancel().catch(() => undefined);
        return null;
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }

  try {
    return normalizeGateJwks(JSON.parse(text));
  } catch {
    return null;
  }
}

async function defaultJwksFetch(url: string): Promise<GateJwks | null> {
  try {
    const res = await fetch(url, {
      headers: { accept: "application/json" },
      redirect: "manual",
      signal: AbortSignal.timeout(GATE_JWKS_FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return parseGateJwksResponse(res);
  } catch {
    return null;
  }
}

const jwksCache = new Map<string, { jwks: GateJwks; fetchedAt: number }>();
const jwksInflight = new Map<string, Promise<GateJwks | null>>();

function rememberJwks(url: string, jwks: GateJwks): void {
  if (!jwksCache.has(url) && jwksCache.size >= GATE_JWKS_CACHE_MAX_ENTRIES) {
    const oldest = jwksCache.keys().next().value;
    if (oldest) jwksCache.delete(oldest);
  }
  // Delete first so updating an entry also refreshes its insertion order.
  jwksCache.delete(url);
  jwksCache.set(url, { jwks, fetchedAt: Date.now() });
}

async function fetchJwksWithinBudget(
  url: string,
  jwksFetch: JwksFetch,
  requestedTimeoutMs?: number,
): Promise<GateJwks | null> {
  const timeoutMs = boundedJwksTimeout(requestedTimeoutMs);

  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      jwksFetch(url),
      new Promise<null>((resolve) => {
        timeout = setTimeout(() => resolve(null), timeoutMs);
      }),
    ]);
    return normalizeGateJwks(result);
  } catch {
    return null;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function boundedJwksTimeout(requestedTimeoutMs?: number): number {
  return (
    typeof requestedTimeoutMs === "number" &&
    Number.isFinite(requestedTimeoutMs) &&
    requestedTimeoutMs > 0
      ? Math.min(requestedTimeoutMs, GATE_JWKS_FETCH_TIMEOUT_MS)
      : GATE_JWKS_FETCH_TIMEOUT_MS
  );
}

/** Coalesce concurrent cold-start/key-rotation fetches for the same issuer. */
async function fetchJwksSingleFlight(
  url: string,
  jwksFetch: JwksFetch,
  requestedTimeoutMs?: number,
): Promise<GateJwks | null> {
  const inflightKey = `${url}\u0000${boundedJwksTimeout(requestedTimeoutMs)}`;
  const existing = jwksInflight.get(inflightKey);
  if (existing) return existing;
  // The URL is deployment-derived, but keep global process state bounded even
  // if this exported resolver is accidentally called with many unique URLs.
  if (jwksInflight.size >= GATE_JWKS_CACHE_MAX_ENTRIES) return null;

  const request = fetchJwksWithinBudget(url, jwksFetch, requestedTimeoutMs);
  jwksInflight.set(inflightKey, request);
  try {
    return await request;
  } finally {
    if (jwksInflight.get(inflightKey) === request) {
      jwksInflight.delete(inflightKey);
    }
  }
}

export function gateKeyResolver(
  url: string,
  jwksFetch: JwksFetch = defaultJwksFetch,
  options: GateKeyResolverOptions = {},
): JWTVerifyGetKey {
  return async (protectedHeader) => {
    const kid =
      typeof protectedHeader.kid === "string" ? protectedHeader.kid : undefined;
    const findKey = (jwks: GateJwks): JWK | undefined =>
      jwks.keys.find(
        (k) =>
          k.kty === "OKP" && k.crv === "Ed25519" && (!kid || k.kid === kid),
      );

    let entry = jwksCache.get(url);
    let refreshed = false;
    if (!entry || Date.now() - entry.fetchedAt > JWKS_CACHE_TTL_MS) {
      const jwks = await fetchJwksSingleFlight(
        url,
        jwksFetch,
        options.fetchTimeoutMs,
      );
      refreshed = true;
      if (jwks) {
        rememberJwks(url, jwks);
        entry = jwksCache.get(url);
      } else {
        // Do not keep trusting an entry beyond its refresh TTL when the issuer
        // can no longer confirm that key set.
        jwksCache.delete(url);
        entry = undefined;
      }
    }

    let key = entry ? findKey(entry.jwks) : undefined;
    if (!key && !refreshed) {
      const jwks = await fetchJwksSingleFlight(
        url,
        jwksFetch,
        options.fetchTimeoutMs,
      );
      if (jwks) {
        rememberJwks(url, jwks);
        key = findKey(jwks);
      }
    }
    if (!key) {
      throw new Error("no gate identity key matches the token kid");
    }
    return importJWK(key, "EdDSA");
  };
}

export type VerifyGateIdentityTokenOptions = {
  issuer: string;
  audience: string;
  getKey: JWTVerifyGetKey;
};

export async function verifyGateIdentityToken(
  token: string,
  options: VerifyGateIdentityTokenOptions,
): Promise<GateIdentity | null> {
  try {
    const { payload } = await jwtVerify(token, options.getKey, {
      algorithms: ["EdDSA"],
      issuer: options.issuer,
      audience: options.audience,
      requiredClaims: ["sub", "iat", "exp"],
      maxTokenAge: "10 minutes",
    });
    const sub = typeof payload.sub === "string" ? payload.sub.trim() : "";
    if (!sub) return null;
    return {
      sub,
      email: typeof payload.email === "string" ? payload.email : null,
      name: typeof payload.name === "string" ? payload.name : null,
      teamId: typeof payload.team_id === "string" ? payload.team_id : null,
    };
  } catch {
    return null;
  }
}

type GateEndpoints = { issuer: string; jwksUrl: string };

export function resolveGateEndpoints(headers: Headers): GateEndpoints | null {
  const explicit = env("GROK_GATE_ORIGIN");
  if (explicit) {
    const origin = normalizeHttpsOrigin(explicit);
    if (!origin) return null;
    return { issuer: origin, jwksUrl: `${origin}${GATE_JWKS_PATH}` };
  }

  const xf = headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = (xf || headers.get("host") || "")
    .split(":")[0]
    ?.trim()
    .toLowerCase();
  if (!host) return null;

  let issuer: string | null = null;
  if (
    host === "app-builder-testing.com" ||
    host.endsWith(".app-builder-testing.com")
  ) {
    issuer = "https://gate.app-builder-testing.com";
  } else if (host === "grok.me" || host.endsWith(".grok.me")) {
    issuer = "https://gate.grok.me";
  }
  if (!issuer) return null;

  return { issuer, jwksUrl: `${issuer}${GATE_JWKS_PATH}` };
}

export type GateLinkedAccount = { providerId: string; accountId: string };

export function sessionBoundToGateIdentity(
  accounts: readonly GateLinkedAccount[],
  identitySub: string,
  gateProviderId: string,
): boolean {
  return accounts.some(
    (account) =>
      account.providerId === gateProviderId &&
      account.accountId === identitySub,
  );
}

export async function gateIdentityFromHeaders(
  headers: Headers,
  jwksFetch?: JwksFetch,
): Promise<GateIdentity | null> {
  if (!gateIdentityEnabled()) return null;
  const token = headers.get(GATE_IDENTITY_HEADER)?.trim();
  if (!token) return null;
  const projectId = env("GROK_PROJECT_ID");
  if (!projectId) return null;
  const endpoints = resolveGateEndpoints(headers);
  if (!endpoints) return null;
  return verifyGateIdentityToken(token, {
    issuer: endpoints.issuer,
    audience: `app:${projectId}`,
    getKey: gateKeyResolver(endpoints.jwksUrl, jwksFetch),
  });
}
