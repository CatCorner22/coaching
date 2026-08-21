import assert from "node:assert/strict";
import { test } from "node:test";

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

test("pre-v4 legacy consent is adopted but forced through consent again with voice and mic off", async () => {
  localStorage.clear();
  localStorage.setItem(
    "musubi-settings",
    JSON.stringify({
      state: {
        consented: true,
        adults: true,
        shears: true,
        photosOk: true,
        voice: true,
        listen: true,
      },
      version: 0,
    }),
  );

  const { useSettings } = await import("./settings.ts");
  await useSettings.persist.rehydrate();
  const state = useSettings.getState();
  assert.equal(state.consentVersion, 0);
  assert.equal(state.consented, false);
  assert.equal(state.voice, false);
  assert.equal(state.listen, false);
  assert.ok(localStorage.getItem("knotty-settings"), "legacy state should be adopted to the canonical key");
});

test("an existing canonical settings snapshot wins over the legacy key", async () => {
  localStorage.setItem(
    "musubi-settings",
    JSON.stringify({ state: { consentVersion: 4, consented: true, adults: true, shears: true, photosOk: true }, version: 0 }),
  );
  localStorage.setItem(
    "knotty-settings",
    JSON.stringify({ state: { consentVersion: 0, consented: false, adults: false, shears: false, photosOk: false }, version: 0 }),
  );

  const { useSettings } = await import("./settings.ts");
  await useSettings.persist.rehydrate();
  assert.equal(useSettings.getState().consented, false);
  assert.equal(useSettings.getState().consentVersion, 0);
});
