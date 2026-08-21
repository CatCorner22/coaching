export type RateLimitBucket = { count: number; resetAt: number };

export type RateLimitOptions = {
  kind: "vision" | "voice";
  subject: string;
  limit: number;
  windowMs: number;
  now: number;
  maxSubjectBuckets?: number;
};

export class RateLimitError extends Error {
  readonly status = 429;
  readonly code = "AI_RATE_LIMITED";
  readonly retryAfterMs: number;

  constructor(retryAfterMs: number) {
    super("Too many AI requests. Wait a few minutes before trying again.");
    this.name = "RateLimitError";
    this.retryAfterMs = Math.max(1, Math.ceil(retryAfterMs));
  }
}

/**
 * Atomically charge the per-subject and per-instance buckets.
 *
 * Both limits are checked before either counter changes, so rejected callers
 * cannot poison the instance counter and a full instance bucket cannot consume
 * a new caller's personal allowance. Reserved instance buckets are never
 * evicted by identity churn.
 */
export function consumeRateLimit(
  buckets: Map<string, RateLimitBucket>,
  options: RateLimitOptions,
): void {
  const { kind, subject, now } = options;
  const limit = positiveInteger(options.limit, "limit");
  const windowMs = positiveInteger(options.windowMs, "windowMs");
  const maxSubjectBuckets = positiveInteger(options.maxSubjectBuckets ?? 1_000, "maxSubjectBuckets");
  const instanceKey = `${kind}:__instance__`;
  const subjectKey = `${kind}:${subject.slice(0, 192)}`;
  const instanceLimit = limit * 50;

  cleanupExpired(buckets, now);
  const instance = activeBucket(buckets.get(instanceKey), now);
  const personal = activeBucket(buckets.get(subjectKey), now);
  const fullBuckets = [
    (instance?.count ?? 0) >= instanceLimit ? instance : undefined,
    (personal?.count ?? 0) >= limit ? personal : undefined,
  ].filter((bucket): bucket is RateLimitBucket => Boolean(bucket));
  if (fullBuckets.length > 0) {
    // Admission requires every saturated bucket to reset. Reporting the first
    // reset would invite a retry while another bucket is still full.
    throw new RateLimitError(Math.max(...fullBuckets.map((bucket) => bucket.resetAt)) - now);
  }

  buckets.set(instanceKey, incremented(instance, now, windowMs));
  buckets.set(subjectKey, incremented(personal, now, windowMs));
  evictOldestSubjects(buckets, maxSubjectBuckets);
}

function activeBucket(bucket: RateLimitBucket | undefined, now: number): RateLimitBucket | undefined {
  return bucket && bucket.resetAt > now ? bucket : undefined;
}

function incremented(bucket: RateLimitBucket | undefined, now: number, windowMs: number): RateLimitBucket {
  return bucket
    ? { count: bucket.count + 1, resetAt: bucket.resetAt }
    : { count: 1, resetAt: now + windowMs };
}

function cleanupExpired(buckets: Map<string, RateLimitBucket>, now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

function evictOldestSubjects(buckets: Map<string, RateLimitBucket>, maxSubjectBuckets: number): void {
  // Avoid sorting on the normal hot path while the shared map remains under
  // its subject bound; reserved vision/voice keys do not count toward it.
  let subjectCount = 0;
  for (const key of buckets.keys()) {
    if (!key.endsWith(":__instance__")) subjectCount += 1;
    if (subjectCount > maxSubjectBuckets) break;
  }
  if (subjectCount <= maxSubjectBuckets) return;
  const subjectEntries = [...buckets.entries()]
    .filter(([key]) => !key.endsWith(":__instance__"))
    .sort((left, right) => left[1].resetAt - right[1].resetAt);
  const overflow = subjectEntries.length - maxSubjectBuckets;
  for (let index = 0; index < overflow; index += 1) {
    const key = subjectEntries[index]?.[0];
    if (key) buckets.delete(key);
  }
}

function positiveInteger(value: number, name: string): number {
  if (!Number.isSafeInteger(value) || value < 1) throw new Error(`${name} must be a positive integer`);
  return value;
}
