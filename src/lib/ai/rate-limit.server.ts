import { getRequest } from "@tanstack/react-start/server";

type Bucket = { count: number; resetAt: number };
type RateLimitGlobal = typeof globalThis & { __knottyAiBuckets?: Map<string, Bucket> };

const root = globalThis as RateLimitGlobal;
const buckets = root.__knottyAiBuckets ?? new Map<string, Bucket>();
root.__knottyAiBuckets = buckets;

/** Best-effort per-instance quota protection; platform-level limits should still be configured. */
export function consumeAiBudget(kind: "vision" | "voice", limit: number, windowMs: number): void {
  const now = Date.now();
  const request = getRequest();
  const forwarded = request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const client =
    request?.headers.get("cf-connecting-ip")?.trim() ||
    request?.headers.get("x-real-ip")?.trim() ||
    forwarded ||
    "unknown";
  const key = `${kind}:${client}`;
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
  } else {
    if (current.count >= limit) {
      throw new Error("Too many AI requests. Wait a few minutes before trying again.");
    }
    current.count += 1;
  }

  if (buckets.size > 1_000) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey);
    }
    while (buckets.size > 1_500) {
      const oldest = buckets.keys().next().value as string | undefined;
      if (!oldest) break;
      buckets.delete(oldest);
    }
  }
}
