export function isCookieFamilyMember(candidate: string, baseName: string): boolean {
  if (candidate === baseName) return true;
  if (!candidate.startsWith(`${baseName}.`)) return false;
  return /^\d+$/u.test(candidate.slice(baseName.length + 1));
}

/**
 * List the base cookie plus every numeric Better Auth chunk present in the
 * request. Do not cap the family: leaving a high-numbered stale chunk in the
 * browser can let a later request reconstruct prior-account cache material.
 */
export function requestCookieFamilyNames(headers: Headers, baseName: string): string[] {
  const names = new Set<string>([baseName]);
  for (const pair of (headers.get("cookie") ?? "").split(";")) {
    const candidate = pair.trim().split("=", 1)[0] ?? "";
    if (isCookieFamilyMember(candidate, baseName)) names.add(candidate);
  }
  return [...names];
}

/** Drop a base cookie and every numeric Better Auth chunk from a request. */
export function removeRequestCookieFamily(headers: Headers, baseName: string): void {
  const cookieHeader = headers.get("cookie");
  if (!cookieHeader) return;
  const kept = cookieHeader
    .split(";")
    .map((pair) => pair.trim())
    .filter((pair) => {
      if (!pair) return false;
      const candidate = pair.split("=", 1)[0] ?? "";
      return !isCookieFamilyMember(candidate, baseName);
    });
  if (kept.length > 0) {
    headers.set("cookie", kept.join("; "));
  } else {
    headers.delete("cookie");
  }
}
