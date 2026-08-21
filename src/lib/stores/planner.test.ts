import assert from "node:assert/strict";
import { test } from "node:test";
import { adoptPersistKey } from "./persist.ts";

function installMemoryStorage() {
  if (typeof globalThis.localStorage !== "undefined") return;
  const mem = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => {
        mem.set(k, String(v));
      },
      removeItem: (k: string) => {
        mem.delete(k);
      },
      clear: () => mem.clear(),
      key: (i: number) => [...mem.keys()][i] ?? null,
      get length() {
        return mem.size;
      },
    },
  });
}

installMemoryStorage();

test("adoptPersistKey copies leftover musubi blob once", () => {
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
