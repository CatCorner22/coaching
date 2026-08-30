import assert from "node:assert/strict";
import test from "node:test";
import { normalizeChecklistDone } from "./checklist.ts";
import { normalizeCompleted } from "./learn-progress.ts";
import { mergeJournalEntriesById, unionRemovedIds } from "./persist.ts";
import { normalizeNegotiationItems } from "./negotiate.ts";

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

test("a removed custom limit stays removed when the other tab writes", () => {
  // Item resolution keeps anything present on only one side, so without the
  // tombstones a line deleted here reappeared on the next write from the tab
  // that still had it.
  const removed = unionRemovedIds(["custom-1"], ["custom-2", "custom-1", 7]);
  assert.deepEqual(removed.sort(), ["custom-1", "custom-2"]);
  assert.deepEqual(
    normalizeNegotiationItems(
      [{ id: "custom-1", label: "Rope in the shower", rank: "yes" }],
      removed,
    ).filter((item) => item.id === "custom-1"),
    [],
  );
  assert.equal(
    normalizeNegotiationItems([{ id: "custom-3", label: "Kept line", rank: "no" }], removed).some(
      (item) => item.id === "custom-3",
    ),
    true,
  );
});

test("the tombstone cap keeps the newest removals", async () => {
  const { unionRemovedIds } = await import("./persist.ts");
  // The cap used to drop the tail, i.e. the most recent deletions, so a stale
  // tab could resurrect a limit the couple had just removed.
  const many = Array.from({ length: 400 }, (_, index) => `custom-${index}`);
  const capped = unionRemovedIds(many, ["custom-just-removed"]);
  assert.ok(capped.includes("custom-just-removed"));
  assert.equal(capped.at(-1), "custom-just-removed");
  // A repeat of an older id moves it to the newest position rather than
  // leaving it in line to be evicted.
  const refreshed = unionRemovedIds(["custom-0", "custom-1"], ["custom-0"]);
  assert.deepEqual(refreshed, ["custom-1", "custom-0"]);
});

test("one key saving does not clear another key's storage warning", async () => {
  const { safeBrowserStorage, getPersistFailure, persistFailureFor, resetPersistFailure } =
    await import("./persist.ts");
  resetPersistFailure();
  const blocked = new Set(["knotty-negotiate"]);
  const backing = new Map<string, string>();
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (name: string) => backing.get(name) ?? null,
      setItem: (name: string, value: string) => {
        if (blocked.has(name)) throw new DOMException("quota", "QuotaExceededError");
        backing.set(name, value);
      },
      removeItem: (name: string) => void backing.delete(name),
    },
  });
  try {
    const storage = safeBrowserStorage();
    storage.setItem("knotty-negotiate", "{}");
    assert.ok(persistFailureFor("knotty-negotiate"));
    // Recovery is per key: a settings write landing says nothing about
    // whether the negotiated limits were ever saved, and clearing the banner
    // on it hid a limit that only existed in memory.
    storage.setItem("knotty-settings", "{}");
    assert.equal(persistFailureFor("knotty-settings"), null);
    assert.ok(persistFailureFor("knotty-negotiate"));
    assert.ok(getPersistFailure());
    // Once the blocked key itself lands, the warning clears.
    blocked.clear();
    storage.setItem("knotty-negotiate", "{}");
    assert.equal(persistFailureFor("knotty-negotiate"), null);
    assert.equal(getPersistFailure(), null);
  } finally {
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else Reflect.deleteProperty(globalThis, "localStorage");
    resetPersistFailure();
  }
});
