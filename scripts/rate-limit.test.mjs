import assert from "node:assert/strict";
import test from "node:test";
import { consumeRateLimit, RateLimitError } from "../src/lib/ai/rate-limit-core.ts";

function consume(buckets, subject, options = {}) {
  consumeRateLimit(buckets, {
    kind: "vision",
    subject,
    limit: options.limit ?? 2,
    windowMs: options.windowMs ?? 1_000,
    now: options.now ?? 100,
    maxSubjectBuckets: options.maxSubjectBuckets,
  });
}

test("a rejected subject cannot poison the per-instance counter", () => {
  const buckets = new Map();
  consume(buckets, "user:a");
  consume(buckets, "user:a");
  const globalBefore = buckets.get("vision:__instance__").count;
  assert.throws(() => consume(buckets, "user:a"), /Too many AI requests/);
  assert.equal(buckets.get("vision:__instance__").count, globalBefore);
  consume(buckets, "user:b");
});

test("quota denials carry a stable 429 contract and retry interval", () => {
  const buckets = new Map();
  consume(buckets, "user:a", { limit: 1, now: 100 });
  assert.throws(
    () => consume(buckets, "user:a", { limit: 1, now: 250 }),
    (error) =>
      error instanceof RateLimitError &&
      error.status === 429 &&
      error.code === "AI_RATE_LIMITED" &&
      error.retryAfterMs === 850,
  );
});

test("retry interval covers every simultaneously saturated bucket", () => {
  const buckets = new Map([
    ["vision:__instance__", { count: 50, resetAt: 1_000 }],
    ["vision:user:a", { count: 1, resetAt: 1_100 }],
  ]);
  assert.throws(
    () => consume(buckets, "user:a", { limit: 1, now: 900 }),
    (error) => error instanceof RateLimitError && error.retryAfterMs === 200,
  );
});

test("a full instance bucket does not consume a new subject allowance", () => {
  const buckets = new Map([["vision:__instance__", { count: 50, resetAt: 1_100 }]]);
  assert.throws(() => consume(buckets, "user:new", { limit: 1 }), /Too many AI requests/);
  assert.equal(buckets.has("vision:user:new"), false);
  assert.equal(buckets.get("vision:__instance__").count, 50);
});

test("identity churn never evicts the reserved instance bucket", () => {
  const buckets = new Map();
  consume(buckets, "user:a", { maxSubjectBuckets: 2 });
  consume(buckets, "user:b", { maxSubjectBuckets: 2 });
  consume(buckets, "user:c", { maxSubjectBuckets: 2 });
  assert.equal(buckets.has("vision:__instance__"), true);
  assert.equal([...buckets.keys()].filter((key) => !key.endsWith(":__instance__")).length, 2);
});

test("expired buckets reset cleanly and invalid policies fail closed", () => {
  const buckets = new Map([["vision:user:a", { count: 2, resetAt: 99 }]]);
  consume(buckets, "user:a", { now: 100 });
  assert.equal(buckets.get("vision:user:a").count, 1);
  assert.throws(
    () => consumeRateLimit(buckets, { kind: "vision", subject: "a", limit: 0, windowMs: 1, now: 100 }),
    /limit must be a positive integer/,
  );
});
