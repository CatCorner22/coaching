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

test("a stale tab's blob cannot resurrect withdrawn consent (stamped write-merge)", async () => {
  const { settingsConsentMergingStorage } = await import("./persist.ts");
  const storage = settingsConsentMergingStorage<Record<string, unknown>>("test-consent-merge");
  // Another tab withdrew consent at stamp 3000 (stored). This tab, holding
  // the pre-withdrawal state at stamp 2000, saves a name keystroke: the
  // consent unit must come from the newer stored decision, the name from the
  // incoming write.
  localStorage.setItem(
    "test-consent-merge",
    JSON.stringify({
      state: { consented: false, voice: false, listen: false, consentVersion: 5, consentStamp: 3000, riggerName: "old" },
      version: 1,
    }),
  );
  storage.setItem("test-consent-merge", {
    state: { consented: true, voice: true, listen: true, consentVersion: 5, consentStamp: 2000, riggerName: "new" },
    version: 1,
  } as never);
  const written = JSON.parse(localStorage.getItem("test-consent-merge") ?? "{}") as {
    state: Record<string, unknown>;
  };
  assert.equal(written.state.consented, false, "withdrawal survives the stale save");
  assert.equal(written.state.voice, false);
  assert.equal(written.state.listen, false);
  assert.equal(written.state.consentStamp, 3000);
  assert.equal(written.state.riggerName, "new", "unrelated fields stay last-write-wins");

  // The other direction: a genuine newer re-consent is not undone by an
  // older withdrawal blob.
  localStorage.setItem(
    "test-consent-merge",
    JSON.stringify({
      state: { consented: true, voice: false, listen: false, consentVersion: 5, consentStamp: 5000 },
      version: 1,
    }),
  );
  storage.setItem("test-consent-merge", {
    state: { consented: false, voice: false, listen: false, consentVersion: 5, consentStamp: 4000 },
    version: 1,
  } as never);
  const rewritten = JSON.parse(localStorage.getItem("test-consent-merge") ?? "{}") as {
    state: Record<string, unknown>;
  };
  assert.equal(rewritten.state.consented, true, "newer re-consent survives");
  localStorage.removeItem("test-consent-merge");
});

test("consent actions stamp the decision and set() clamps names live", async () => {
  const { useSettings } = await import("./settings.ts");
  const before = useSettings.getState().consentStamp;
  useSettings.getState().enter();
  const afterEnter = useSettings.getState().consentStamp;
  assert.ok(afterEnter > before, "enter() must bump the consent stamp");
  useSettings.getState().resetConsent();
  assert.ok(useSettings.getState().consentStamp > afterEnter, "resetConsent() must bump it");

  // Live set() applies the same clamps hydration does, so what the user sees
  // is what survives reload.
  useSettings.getState().set({ riggerName: "R".repeat(60), honorific: "H".repeat(40) });
  assert.equal(useSettings.getState().riggerName.length, 40);
  assert.equal(useSettings.getState().honorific.length, 24);
});
