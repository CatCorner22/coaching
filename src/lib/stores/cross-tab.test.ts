import assert from "node:assert/strict";
import test from "node:test";
import { normalizeChecklistDone } from "./checklist.ts";
import { normalizeCompleted } from "./learn-progress.ts";
import { mergeJournalEntriesById } from "./persist.ts";

test("learn progress survives a persisted map of the wrong shape", () => {
  assert.deepEqual(normalizeCompleted({ "tie:karada": 3 }), {});
  assert.deepEqual(normalizeCompleted({ "tie:karada": [2, 0, 0, "1", null] }), {
    "tie:karada": [0, 1, 2],
  });
  assert.deepEqual(normalizeCompleted("nope"), {});
});

test("checklist only adopts known ids with boolean values", () => {
  assert.deepEqual(normalizeChecklistDone({ shears: true, exit: false, bogus: true, water: "yes" }), {
    shears: true,
    exit: false,
  });
});

test("rehydrate unions storage with entries that only exist in this tab", () => {
  const merged = mergeJournalEntriesById(
    [{ id: "stored", at: 2 }],
    [{ id: "unsaved", at: 3 }],
    [],
    [],
  );
  assert.deepEqual(
    merged?.entries.map((entry) => (entry as { id: string }).id),
    ["unsaved", "stored"],
  );
});

test("a fresh tombstone is not the first thing the cap evicts", () => {
  const existingRemoved = Array.from({ length: 200 }, (_, i) => `old-${i}`);
  const merged = mergeJournalEntriesById([], [{ id: "keepme", at: 1 }], ["keepme"], existingRemoved);
  assert.equal(merged?.entries.length, 0);
  assert.ok(merged?.removedIds.includes("keepme"));
});
