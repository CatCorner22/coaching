/**
 * Private site lock for a two-person deployment.
 *
 * When SITE_PASSWORD is set (server-only env var), every request handled by the
 * server must carry HTTP Basic credentials matching SITE_USER (default "us")
 * and SITE_PASSWORD. Unset = no lock (local dev and CI keep working).
 * Static files served directly by the host's CDN (public/ and built assets)
 * are not covered; the HTML shell, server functions and API routes are.
 */
import { checkSiteLock } from "../../scripts/site-lock.mjs";

interface LockEvent {
  req: { headers: Headers };
}

export default function siteLockMiddleware(
  event: LockEvent,
  next: () => unknown | Promise<unknown>,
): unknown {
  const verdict = checkSiteLock(
    event.req.headers.get("authorization"),
    process.env.SITE_USER,
    process.env.SITE_PASSWORD,
  );
  if (verdict === "open") return next();
  return new Response("Private. Sign in to continue.", {
    status: 401,
    headers: {
      "www-authenticate": 'Basic realm="Private", charset="UTF-8"',
      "cache-control": "no-store",
      "content-type": "text/plain; charset=utf-8",
    },
  });
}
