import assert from "node:assert/strict";
import { test } from "node:test";

const memory = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => memory.set(key, String(value)),
    removeItem: (key: string) => memory.delete(key),
  },
});

test("pre-v4 legacy consent is adopted but normalized to consent, voice, and mic off", async () => {
  const legacy = {
    consented: true,
    adults: true,
    shears: true,
    photosOk: true,
    voice: true,
    listen: true,
  };
  localStorage.setItem("musubi-settings", JSON.stringify({ state: legacy, version: 0 }));

  const { normalizePersistedSettings, useSettings } = await import("./settings.ts");
  assert.equal(localStorage.getItem("knotty-settings"), localStorage.getItem("musubi-settings"));
  const normalized = normalizePersistedSettings(legacy, useSettings.getState());
  assert.equal(normalized.consentVersion, 0);
  assert.equal(normalized.consented, false);
  assert.equal(normalized.voice, false);
  assert.equal(normalized.listen, false);
});

test("only complete v4 consent can retain explicit voice and microphone opt-ins", async () => {
  const { normalizePersistedSettings, useSettings } = await import("./settings.ts");
  const valid = normalizePersistedSettings(
    {
      consentVersion: 4,
      consented: true,
      adults: true,
      shears: true,
      photosOk: true,
      voice: true,
      listen: true,
    },
    useSettings.getState(),
  );
  assert.equal(valid.consented, true);
  assert.equal(valid.voice, true);
  assert.equal(valid.listen, true);

  const incomplete = normalizePersistedSettings(
    { ...valid, photosOk: false, voice: true, listen: true },
    useSettings.getState(),
  );
  assert.equal(incomplete.consented, false);
  assert.equal(incomplete.voice, false);
  assert.equal(incomplete.listen, false);
});
