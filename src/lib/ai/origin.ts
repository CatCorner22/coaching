import { PREVIEW_ALLOWED_HOSTS } from "@/lib/auth/preview";

/** Local `npm run dev` origins a browser may send for the same server. */
export const LOCAL_DEV_ORIGINS = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://[::1]:8080",
] as const;

/**
 * Wildcard host match. The leading dot matters: matching a bare suffix would
 * accept `evilgrok-sandbox.com` for the pattern `*.grok-sandbox.com`.
 */
export function matchesHostPattern(hostname: string, pattern: string): boolean {
  const host = hostname.toLowerCase();
  const target = pattern.toLowerCase();
  if (target.startsWith("*.")) {
    const suffix = target.slice(1);
    return host.endsWith(suffix) && host.length > suffix.length;
  }
  return host === target;
}

/**
 * Whether a browser Origin belongs to this app.
 *
 * The AI guard used to compare Origin against `new URL(request.url).origin`,
 * which is built from the raw Host header with an http: scheme. That check
 * could not do either job it appeared to do:
 *
 *  - It denied legitimate traffic. Over https the scheme alone differs, so
 *    Analyze and coach voice 403'd in the live preview; behind a proxy that
 *    rewrites Host to the platform domain, the host differs too.
 *  - It secured nothing. Host and Origin are both attacker-settable outside a
 *    browser, so a forged pair matched itself and passed.
 *
 * Origins are therefore checked against configuration — the deployer-injected
 * public origin, the preview host patterns, loopback in development — the same
 * allowlist the auth layer already trusts for credentialed POSTs. The
 * browser-enforced `sec-fetch-site` check remains the cross-site control.
 */
export function isTrustedAppOrigin(
  origin: string,
  options: { configuredOrigin?: string | null; allowLoopback?: boolean } = {},
): boolean {
  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;

  const configured = options.configuredOrigin?.trim();
  if (configured) {
    try {
      if (new URL(configured).origin === url.origin) return true;
    } catch {
      // A malformed configured origin cannot authorize anything.
    }
  }

  if (url.protocol === "https:") {
    for (const pattern of PREVIEW_ALLOWED_HOSTS) {
      if (matchesHostPattern(url.hostname, pattern)) return true;
    }
  }

  // Loopback is a development convenience and must never widen a deployed app.
  if (options.allowLoopback && (LOCAL_DEV_ORIGINS as readonly string[]).includes(url.origin)) {
    return true;
  }

  return false;
}
