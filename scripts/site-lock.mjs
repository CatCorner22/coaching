/** Pure site-lock check, shared by the server middleware and its tests. */
/** @param {string} a @param {string} b */
function safeEqual(a, b) {
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

/**
 * @param {string | null | undefined} authorization
 * @param {string | undefined} user
 * @param {string | undefined} password
 * @returns {"open" | "locked"}
 */
export function checkSiteLock(authorization, user, password) {
  if (!password) return "open";
  const expectedUser = user || "us";
  if (!authorization || !authorization.startsWith("Basic ")) return "locked";
  let decoded;
  try {
    decoded = atob(authorization.slice(6).trim());
  } catch {
    return "locked";
  }
  const sep = decoded.indexOf(":");
  if (sep < 0) return "locked";
  const ok =
    [safeEqual(decoded.slice(0, sep), expectedUser), safeEqual(decoded.slice(sep + 1), password)].every(Boolean);
  return ok ? "open" : "locked";
}
