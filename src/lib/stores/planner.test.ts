import assert from "node:assert/strict";
import { test } from "node:test";
import { adoptPersistKey } from "./persist.ts";

function installMemoryStorage() {
  if (typeof globalThis.localStorage !== "undefined") return;
  const memory = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => memory.set(key, String(value)),
      removeItem: (key: string) => memory.delete(key),
      clear: () => memory.clear(),
      key: (index: number) => [...memory.keys()][index] ?? null,
      get length() {
        return memory.size;
      },
    },
  });
}

installMemoryStorage();

test("adoptPersistKey copies a legacy blob once and never overwrites current data", () => {
  localStorage.removeItem("knotty-x");
  localStorage.setItem("musubi-x", '{"state":1}');
  adoptPersistKey("knotty-x", "musubi-x");
  assert.equal(localStorage.getItem("knotty-x"), '{"state":1}');
  localStorage.setItem("knotty-x", "kept");
  adoptPersistKey("knotty-x", "musubi-x");
  assert.equal(localStorage.getItem("knotty-x"), "kept");
});

test("planner add is idempotent and ignores blanks", async () => {
  const { usePlanner } = await import("./planner.ts");
  usePlanner.setState({ slugs: [] });
  usePlanner.getState().add("karada");
  usePlanner.getState().add("karada");
  usePlanner.getState().add("  ");
  assert.deepEqual(usePlanner.getState().slugs, ["karada"]);
  usePlanner.getState().add("futomomo");
  assert.deepEqual(usePlanner.getState().slugs, ["karada", "futomomo"]);
});

test("normalizePersistedSlugs coerces corrupt or legacy blobs without throwing", async () => {
  const { normalizePersistedSlugs } = await import("./planner.ts");
  const fallback = ["single-column"];
  // A well-formed blob with a non-array slugs field is the crash case: it
  // survives JSON.parse and would reach slugs.map/.filter as a string.
  assert.deepEqual(normalizePersistedSlugs({ slugs: "single-column" }, fallback), fallback);
  assert.deepEqual(normalizePersistedSlugs({ slugs: null }, fallback), fallback);
  assert.deepEqual(normalizePersistedSlugs(null, fallback), fallback);
  assert.deepEqual(normalizePersistedSlugs({}, fallback), fallback);
  // Arrays are filtered to unique, non-empty strings.
  assert.deepEqual(
    normalizePersistedSlugs({ slugs: ["a", "a", "", "  ", 5, null, "b"] }, fallback),
    ["a", "b"],
  );
  // The list is bounded.
  const many = Array.from({ length: 60 }, (_, i) => `s${i}`);
  assert.equal(normalizePersistedSlugs({ slugs: many }, fallback).length, 40);
});

test("clampRopeCount rejects non-finite, negative, and oversized persisted values", async () => {
  const { clampRopeCount } = await import("./kit.ts");
  assert.equal(clampRopeCount("junk", 6), 6);
  // Non-finite falls back to the last good value (Infinity also serializes to
  // null through JSON, which lands here as the same fallback).
  assert.equal(clampRopeCount(Infinity, 6), 6);
  assert.equal(clampRopeCount(-4, 0), 0);
  assert.equal(clampRopeCount(3.9, 0), 3);
  assert.equal(clampRopeCount(5000, 2), 999);
  assert.equal(clampRopeCount(8, 2), 8);
  assert.equal(clampRopeCount(null, 2), 2);
});

test("storageEventTargetsKey rehydrates on a matching key or a full clear only", async () => {
  const { storageEventTargetsKey } = await import("./persist.ts");
  assert.equal(storageEventTargetsKey("knotty-negotiate", "knotty-negotiate"), true);
  assert.equal(storageEventTargetsKey(null, "knotty-negotiate"), true); // storage.clear()
  assert.equal(storageEventTargetsKey("knotty-settings", "knotty-negotiate"), false);
  assert.equal(storageEventTargetsKey("some-other-app-key", "knotty-negotiate"), false);
});

test("syncPersistedAcrossTabs rehydrates when another tab rewrites the same key", async () => {
  const { syncPersistedAcrossTabs } = await import("./persist.ts");
  const listeners: Array<(e: { key: string | null }) => void> = [];
  const originalWindow = (globalThis as { window?: unknown }).window;
  (globalThis as { window?: unknown }).window = {
    addEventListener: (type: string, cb: (e: { key: string | null }) => void) => {
      if (type === "storage") listeners.push(cb);
    },
  };
  try {
    let rehydrated = 0;
    syncPersistedAcrossTabs("knotty-negotiate", () => {
      rehydrated += 1;
    });
    assert.equal(listeners.length, 1);
    listeners[0]!({ key: "knotty-negotiate" });
    listeners[0]!({ key: null });
    listeners[0]!({ key: "unrelated" });
    assert.equal(rehydrated, 2);
  } finally {
    (globalThis as { window?: unknown }).window = originalWindow;
  }
});

test("negotiation writes resolve per item by stamp, so a stale tab cannot resurrect a revoked rank", async () => {
  const { mergeNegotiationItemsByStamp } = await import("./persist.ts");
  // Tab A is stale: it still holds the old approval with an older stamp.
  const staleIncoming = [{ id: "photos", label: "Photos", rank: "yes", updatedAt: 1000 }];
  const revokedExisting = [{ id: "photos", label: "Photos", rank: "no", updatedAt: 2000 }];
  const merged = mergeNegotiationItemsByStamp(staleIncoming, revokedExisting) as Array<{
    rank: string;
    updatedAt: number;
  }>;
  assert.equal(merged[0]!.rank, "no", "a stale write must not resurrect a revoked rank");
  assert.equal(merged[0]!.updatedAt, 2000);

  // A genuine later re-approval must still win.
  const reapproval = [{ id: "photos", label: "Photos", rank: "yes", updatedAt: 3000 }];
  const after = mergeNegotiationItemsByStamp(reapproval, revokedExisting) as Array<{ rank: string }>;
  assert.equal(after[0]!.rank, "yes");

  // A tie must resolve to the restriction, not to whichever tab wrote last.
  // This previously asserted "yes", which made the outcome of two simultaneous
  // edits decide whether consent stood.
  const tie = mergeNegotiationItemsByStamp(
    [{ id: "photos", rank: "yes", updatedAt: 5 }],
    [{ id: "photos", rank: "no", updatedAt: 5 }],
  ) as Array<{ rank: string }>;
  assert.equal(tie[0]!.rank, "no");

  assert.deepEqual(
    mergeNegotiationItemsByStamp([{ id: "new", rank: "no" }], []),
    [{ id: "new", rank: "no" }],
  );
  assert.equal(mergeNegotiationItemsByStamp(null, []), null);
  assert.equal(mergeNegotiationItemsByStamp([], "junk"), null);
});

test("a cross-tab merge loses neither a custom limit nor a revocation under a backward clock", async () => {
  const { mergeNegotiationItemsByStamp, nextNegotiationStamp } = await import("./persist.ts");

  // A limit added in the other tab is not in this tab's array at all. Mapping
  // over the incoming items alone deleted it on the next unrelated save.
  const stale = [{ id: "photos", rank: "yes", updatedAt: 1000 }];
  const stored = [
    { id: "photos", rank: "no", updatedAt: 2000 },
    { id: "custom", label: "No gags in the bedroom", rank: "no", updatedAt: 2000 },
  ];
  const merged = mergeNegotiationItemsByStamp(stale, stored) as Array<{ id: string; rank: string }>;
  assert.equal(merged.find((i) => i.id === "photos")?.rank, "no");
  assert.ok(
    merged.some((i) => i.id === "custom"),
    "a limit that exists only in storage was deleted",
  );

  // Restrictiveness ordering, at equal stamps: no beats maybe beats yes.
  for (const [mine, theirs, want] of [
    ["yes", "maybe", "maybe"],
    ["maybe", "no", "no"],
    ["no", "yes", "no"],
    ["maybe", "yes", "maybe"],
  ] as const) {
    const out = mergeNegotiationItemsByStamp(
      [{ id: "x", rank: mine, updatedAt: 100 }],
      [{ id: "x", rank: theirs, updatedAt: 100 }],
    ) as Array<{ rank: string }>;
    assert.equal(out[0]!.rank, want, `mine=${mine} stored=${theirs}`);
  }

  // Stamps are monotonic, so a backward wall-clock correction cannot make a
  // fresh revocation look older than the approval it replaces.
  // Capture the base once: reading the clock on both sides of the comparison
  // makes the assertion fail whenever a millisecond elapses between them.
  const ahead = Date.now() + 60_000;
  assert.ok(nextNegotiationStamp([ahead]) > ahead);
  assert.ok(nextNegotiationStamp([]) > 0);
  assert.ok(nextNegotiationStamp(["junk", null, undefined, NaN]) > 0);

  // Preserving survivors must not let the stored array grow without bound.
  let storage: unknown[] = Array.from({ length: 40 }, (_, i) => ({ id: "s" + i, rank: "no", updatedAt: 1 }));
  for (let round = 0; round < 20; round++) {
    const incoming = Array.from({ length: 40 }, (_, i) => ({
      id: `r${round}-${i}`,
      rank: "no",
      updatedAt: round + 2,
    }));
    storage = mergeNegotiationItemsByStamp(incoming, storage) as unknown[];
  }
  assert.ok(storage.length <= 80, `merged array grew to ${storage.length}`);
});

test("a write that cannot be persisted is reported instead of swallowed", async () => {
  const { safeBrowserStorage, onPersistFailure, getPersistFailure, resetPersistFailure } =
    await import("./persist.ts");
  const originalWindow = (globalThis as { window?: unknown }).window;
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  try {
    resetPersistFailure();
    const seen: Array<{ key: string; reason: string }> = [];
    const off = onPersistFailure((failure) => seen.push(failure));

    // A storage that is full, exactly as a browser reports it.
    const quotaError = new Error("exceeded");
    quotaError.name = "QuotaExceededError";
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        getItem: () => null,
        setItem: () => {
          throw quotaError;
        },
        removeItem: () => undefined,
      },
    });

    const storage = safeBrowserStorage();
    // It must not throw — the live store keeps working from memory.
    storage.setItem("knotty-negotiate", "{}");
    assert.deepEqual(seen, [{ key: "knotty-negotiate", reason: "quota" }]);
    assert.deepEqual(getPersistFailure(), { key: "knotty-negotiate", reason: "quota" });

    // A blocked storage is a different cause and is reported as one, because
    // the two need different things from the user.
    const securityError = new Error("blocked");
    securityError.name = "SecurityError";
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        getItem: () => null,
        setItem: () => {
          throw securityError;
        },
        removeItem: () => undefined,
      },
    });
    safeBrowserStorage().setItem("knotty-settings", "{}");
    assert.deepEqual(getPersistFailure(), { key: "knotty-settings", reason: "blocked" });

    off();
    safeBrowserStorage().setItem("knotty-journal", "{}");
    assert.equal(seen.length, 2, "unsubscribing must stop delivery");
    resetPersistFailure();
    assert.equal(getPersistFailure(), null);
  } finally {
    if (originalStorage) Object.defineProperty(globalThis, "localStorage", originalStorage);
    else delete (globalThis as { localStorage?: unknown }).localStorage;
    (globalThis as { window?: unknown }).window = originalWindow;
  }
});
