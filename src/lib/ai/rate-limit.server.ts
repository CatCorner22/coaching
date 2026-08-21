import { getRequest } from "@tanstack/react-start/server";
import { consumeRateLimit, type RateLimitBucket } from "./rate-limit-core";

type RateLimitGlobal = typeof globalThis & { __knottyAiBuckets?: Map<string, RateLimitBucket> };

const root = globalThis as RateLimitGlobal;
const buckets = root.__knottyAiBuckets ?? new Map<string, RateLimitBucket>();
root.__knottyAiBuckets = buckets;

/** Best-effort per-instance quota protection; provider/platform limits remain mandatory. */
export function consumeAiBudget(
  kind: "vision" | "voice",
  limit: number,
  windowMs: number,
  verifiedSubject?: string,
): void {
  const now = Date.now();
  const client = verifiedSubject?.trim()
    ? `user:${verifiedSubject.trim().slice(0, 160)}`
    : `network:${bestEffortNetworkIdentity()}`;
  // A per-instance global ceiling limits spoofed/rotating identities. The
  // provider account must also enforce a hard spend cap across instances.
  consumeRateLimit(buckets, { kind, subject: client, limit, windowMs, now });
}

function bestEffortNetworkIdentity(): string {
  const request = getRequest();
  const forwarded = request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    request?.headers.get("cf-connecting-ip")?.trim() ||
    request?.headers.get("x-real-ip")?.trim() ||
    forwarded ||
    "unknown"
  ).slice(0, 96);
}
