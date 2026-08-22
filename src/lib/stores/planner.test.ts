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
