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

test("pre-v5 legacy consent is adopted but normalized to consent, voice, and mic off", async () => {
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
  const adopted = JSON.parse(String(localStorage.getItem("knotty-settings")));
  assert.equal(adopted.version, 1);
  assert.equal(adopted.state.consentVersion, 0);
  assert.equal(adopted.state.consented, false);
  assert.equal(adopted.state.voice, false);
  assert.equal(adopted.state.listen, false);
  assert.deepEqual(JSON.parse(String(localStorage.getItem("musubi-settings"))), {
    state: legacy,
    version: 0,
  });
  const normalized = normalizePersistedSettings(legacy, useSettings.getState());
  assert.equal(normalized.consentVersion, 0);
  assert.equal(normalized.consented, false);
  assert.equal(normalized.voice, false);
  assert.equal(normalized.listen, false);
});

test("only complete v5 consent can retain explicit voice and microphone opt-ins", async () => {
  const { CURRENT_CONSENT_VERSION, normalizePersistedSettings, useSettings } = await import(
    "./settings.ts"
  );
  assert.equal(CURRENT_CONSENT_VERSION, 5);
  const valid = normalizePersistedSettings(
    {
      consentVersion: 5,
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
    { ...valid, consented: false, voice: true, listen: true },
    useSettings.getState(),
  );
  assert.equal(incomplete.consented, false);
  assert.equal(incomplete.voice, false);
  assert.equal(incomplete.listen, false);
});

test("resetConsent drops the consent-bearing voice and mic opt-ins immediately", async () => {
  const { useSettings } = await import("./settings.ts");
  useSettings.setState({ consented: true, voice: true, listen: true });
  useSettings.getState().resetConsent();
  const s = useSettings.getState();
  assert.equal(s.consented, false);
  assert.equal(s.voice, false);
  assert.equal(s.listen, false);
});

test("a safeword the microphone could never hear falls back to the default", async () => {
  const { normalizePersistedSettings } = await import("./settings.ts");
  const base = normalizePersistedSettings({}, {
    safeword: "red",
    yellowWord: "yellow",
    greenWord: "green",
  } as never);
  for (const word of ["!!!", "...", "42", "12345", "$$$", "🚨", "x", " "]) {
    assert.equal(
      normalizePersistedSettings({ ...base, safeword: word }, base).safeword,
      base.safeword,
      `${JSON.stringify(word)} should not be accepted as a safeword`,
    );
  }
  for (const word of ["pineapple", "don't", "co-signed", "banana split", "ok"]) {
    assert.equal(
      normalizePersistedSettings({ ...base, safeword: word }, base).safeword,
      word,
      `${JSON.stringify(word)} should be accepted`,
    );
  }
});
