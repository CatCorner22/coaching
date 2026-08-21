import assert from "node:assert/strict";
import test from "node:test";
import {
  consumeMediaBatchOnce,
  MediaBatchReplayError,
} from "../src/lib/ai/media-replay-core.ts";

const options = (overrides = {}) => ({
  userId: "user-a",
  batchId: "batch-a",
  now: 100,
  ttlMs: 1_000,
  maxBatches: 8,
  ...overrides,
});

test("a duplicate is rejected before it can charge quota", () => {
  const batches = new Map();
  let charges = 0;
  consumeMediaBatchOnce(batches, options(), () => {
    charges += 1;
  });
  assert.throws(
    () => consumeMediaBatchOnce(batches, options({ now: 200 }), () => {
      charges += 1;
    }),
    MediaBatchReplayError,
  );
  assert.equal(charges, 1);
});

test("a rejected quota charge rolls back only its replay reservation", () => {
  const batches = new Map();
  const denial = new Error("quota full");
  assert.throws(
    () => consumeMediaBatchOnce(batches, options(), () => {
      throw denial;
    }),
    (error) => error === denial,
  );
  assert.equal(batches.size, 0);
  let charged = false;
  consumeMediaBatchOnce(batches, options({ now: 200 }), () => {
    charged = true;
  });
  assert.equal(charged, true);
});

test("the reservation closes a synchronous re-entrant replay race", () => {
  const batches = new Map();
  let nestedCharges = 0;
  consumeMediaBatchOnce(batches, options(), () => {
    assert.throws(
      () => consumeMediaBatchOnce(batches, options(), () => {
        nestedCharges += 1;
      }),
      MediaBatchReplayError,
    );
  });
  assert.equal(nestedCharges, 0);
  assert.equal(batches.size, 1);
});

test("expired leases refresh insertion order and the cache stays bounded", () => {
  const batches = new Map([
    ["user-a:batch-a", 99],
    ["user-b:batch-b", 1_000],
    ["user-c:batch-c", 1_000],
  ]);
  consumeMediaBatchOnce(batches, options({ maxBatches: 2 }), () => undefined);
  assert.equal(batches.size, 2);
  assert.equal(batches.has("user-a:batch-a"), true);
  assert.equal(batches.has("user-b:batch-b"), false);
});
