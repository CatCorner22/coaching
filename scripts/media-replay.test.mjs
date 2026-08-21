import assert from "node:assert/strict";
import test from "node:test";
import {
  consumeDurableMediaBatchOnce,
  consumeMediaBatchOnce,
  MediaBatchReservationError,
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

const durableOptions = (overrides = {}) => ({
  subjectHash: "a".repeat(64),
  batchId: "a2f7492f-44d6-4ff9-a9d1-d6039fbf2d2c",
  reservationId: "07cd9ff5-905c-45f4-8348-67e9a54fd2e8",
  ttlMs: 1_000,
  ...overrides,
});

function fakeSql(handlers) {
  const calls = [];
  return {
    calls,
    async query(text, params = []) {
      calls.push({ text, params });
      if (/^\s*insert into media_batch_reservation/i.test(text)) {
        return handlers.reserve?.(text, params) ?? [];
      }
      if (/^\s*delete from media_batch_reservation\s+where subject_hash/i.test(text)) {
        return handlers.release?.(text, params) ?? [];
      }
      if (/^\s*delete from media_batch_reservation\s+where expires_at/i.test(text)) {
        return handlers.cleanup?.(text, params) ?? [];
      }
      throw new Error(`Unexpected SQL: ${text}`);
    },
  };
}

test("durable reservation charges exactly once and cleanup is a separate best-effort statement", async () => {
  const opts = durableOptions();
  const sql = fakeSql({ reserve: () => [{ reservation_id: opts.reservationId }] });
  let charges = 0;
  await consumeDurableMediaBatchOnce(sql, opts, () => {
    charges += 1;
  });
  assert.equal(charges, 1);
  assert.equal(sql.calls.length, 2);
  assert.match(sql.calls[0].text, /^\s*insert into media_batch_reservation/i);
  assert.doesNotMatch(sql.calls[0].text, /with\s+expired/i);
  assert.match(sql.calls[1].text, /^\s*delete from media_batch_reservation\s+where expires_at/i);
});

test("a durable duplicate is rejected before quota is charged", async () => {
  const sql = fakeSql({ reserve: () => [] });
  let charges = 0;
  await assert.rejects(
    consumeDurableMediaBatchOnce(sql, durableOptions(), () => {
      charges += 1;
    }),
    MediaBatchReplayError,
  );
  assert.equal(charges, 0);
  assert.equal(sql.calls.length, 1);
});

test("a shared-storage reservation failure is a bounded fail-closed result", async () => {
  const sql = fakeSql({
    reserve: () => {
      throw new Error("database unavailable");
    },
  });
  let charges = 0;
  await assert.rejects(
    consumeDurableMediaBatchOnce(sql, durableOptions(), () => {
      charges += 1;
    }),
    (error) =>
      error instanceof MediaBatchReservationError &&
      error.code === "MEDIA_BATCH_RESERVATION_UNCERTAIN" &&
      error.status === 503,
  );
  assert.equal(charges, 0);
});

test("a durable quota rejection conditionally releases only its own reservation", async () => {
  const opts = durableOptions();
  const denial = new Error("quota full");
  const sql = fakeSql({ reserve: () => [{ reservation_id: opts.reservationId }] });
  await assert.rejects(
    consumeDurableMediaBatchOnce(sql, opts, () => {
      throw denial;
    }),
    (error) => error === denial,
  );
  assert.equal(sql.calls.length, 2);
  assert.match(sql.calls[1].text, /reservation_id = \$3::uuid/);
  assert.deepEqual(sql.calls[1].params, [opts.subjectHash, opts.batchId, opts.reservationId]);
});

test("an uncertain durable release fails closed instead of inviting a duplicate retry", async () => {
  const opts = durableOptions();
  const sql = fakeSql({
    reserve: () => [{ reservation_id: opts.reservationId }],
    release: () => {
      throw new Error("connection lost");
    },
  });
  await assert.rejects(
    consumeDurableMediaBatchOnce(sql, opts, () => {
      throw new Error("quota full");
    }),
    (error) =>
      error instanceof MediaBatchReservationError &&
      error.code === "MEDIA_BATCH_RESERVATION_UNCERTAIN" &&
      error.status === 503,
  );
});
