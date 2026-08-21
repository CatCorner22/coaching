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

test("negotiate merge drops null items instead of throwing", async () => {
  const { lockItems } = await import("./negotiate.ts");
  const items = lockItems([
    { id: "cuffs", label: "Wrist and ankle cuffs", rank: "yes" },
    null as unknown as { id: string; label: string; rank: "yes" },
    { id: "neck", label: "Anything on the neck", rank: "yes" },
  ]);
  assert.equal(items.some((item) => item.id === "cuffs" && item.rank === "yes"), true);
  assert.equal(items.some((item) => item.id === "neck" && item.rank === "no"), true);
});

test("kit counts reject NaN instead of poisoning totals", async () => {
  const { clampCount } = await import("./kit.ts");
  assert.equal(clampCount(Number.NaN, 6), 6);
  assert.equal(clampCount(-3, 6), 0);
  assert.equal(clampCount("2.9", 6), 2);
  assert.equal(clampCount(99, 6), 40);
});

test("adoptPersistKey copies a legacy blob once and never overwrites current data", () => {
  localStorage.removeItem("knotty-x");
  localStorage.setItem("musubi-x", '{"state":1}');
  adoptPersistKey("knotty-x", "musubi-x");
  assert.equal(localStorage.getItem("knotty-x"), '{"state":1}');
  localStorage.setItem("knotty-x", "kept");
  adoptPersistKey("knotty-x", "musubi-x");
  assert.equal(localStorage.getItem("knotty-x"), "kept");
});

test("planner merge ignores a non-array slugs blob instead of throwing", async () => {
  const { normalizePlannerSlugs, usePlanner } = await import("./planner.ts");
  assert.deepEqual(normalizePlannerSlugs({ not: "array" }, ["karada"]), ["karada"]);
  assert.deepEqual(normalizePlannerSlugs(["futomomo", 12, "", "karada"], []), ["futomomo", "karada"]);
  usePlanner.setState({ slugs: [] });
  usePlanner.getState().add("karada");
  assert.deepEqual(usePlanner.getState().slugs, ["karada"]);
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
