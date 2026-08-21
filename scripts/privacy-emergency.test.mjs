import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = Object.fromEntries(
  await Promise.all(
    [
      "src/lib/privacy/local-data.ts",
      "src/components/app-shell.tsx",
      "src/routes/index.tsx",
      "src/routes/settings.tsx",
      "src/routes/emergency.tsx",
    ].map(async (path) => [path, await readFile(path, "utf8")]),
  ),
);

test("emergency call action never assumes a US emergency number", () => {
  const copy = `${files["src/routes/emergency.tsx"]}\n${files["src/routes/settings.tsx"]}`;
  assert.doesNotMatch(copy, /tel:911|call 911/i);
  assert.match(copy, /does not infer your location|will not\s+guess from browser language or location/i);
  assert.match(copy, /emergencyNumberHref\(emergencyNumber\)/);
  assert.match(copy, /Call your local emergency-services number now/i);
});

test("privacy copy distinguishes browser, app-server, provider, and unerased data", () => {
  const copy = `${files["src/components/app-shell.tsx"]}\n${files["src/routes/index.tsx"]}\n${files["src/routes/settings.tsx"]}`;
  assert.doesNotMatch(copy, /private rope studio|private\. local journal/i);
  assert.match(copy, /through the app server to xAI/i);
  assert.match(copy, /does\s+not sign you out or remove authentication cookies/i);
  assert.match(copy, /provider-side copies/i);
  assert.match(copy, /stored unencrypted/i);
});

test("local erase signals other tabs and treats blocked legacy deletion as a warning", () => {
  const source = files["src/lib/privacy/local-data.ts"];
  assert.match(source, /BroadcastChannel/);
  assert.match(source, /addEventListener\("storage"/);
  assert.match(files["src/components/app-shell.tsx"], /subscribeToLocalDataErase\(\(\) => window\.location\.reload\(\)\)/);
  assert.match(source, /LEGACY_PURGE_ATTEMPTS = 2/);
  assert.match(source, /legacyStills: "deleted_or_absent" \| "not_confirmed"/);
  assert.match(source, /EMERGENCY_NUMBER_KEY/);
  for (const key of ["knotty-settings", "knotty-negotiate", "knotty-plan", "knotty-journal"]) {
    assert.match(source, new RegExp(`"${key}"`), `${key} must be included in all-data erase`);
  }
});

test("emergency number normalizer rejects arbitrary dial strings", async () => {
  const { emergencyNumberHref, normalizeEmergencyNumber } = await import("../src/lib/privacy/local-data.ts");
  assert.equal(normalizeEmergencyNumber(" 112 "), "112");
  assert.equal(normalizeEmergencyNumber("+1 (202) 555-0100"), "+12025550100");
  assert.equal(normalizeEmergencyNumber("911,123"), null);
  assert.equal(normalizeEmergencyNumber("call police"), null);
  assert.equal(normalizeEmergencyNumber("+"), null);
  assert.equal(emergencyNumberHref("999"), "tel:999");
  assert.equal(emergencyNumberHref(""), null);
});

test("emergency number storage and cross-tab erase notification are bounded", async () => {
  const {
    EMERGENCY_NUMBER_KEY,
    readEmergencyNumber,
    saveEmergencyNumber,
    subscribeToLocalDataErase,
  } = await import("../src/lib/privacy/local-data.ts");
  const previousWindow = globalThis.window;
  const previousBroadcastChannel = globalThis.BroadcastChannel;
  const storage = new Map();
  const listeners = new Map();
  let channelListener = null;
  let channelClosed = false;
  globalThis.window = {
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key),
    },
    addEventListener: (type, listener) => listeners.set(type, listener),
    removeEventListener: (type, listener) => {
      if (listeners.get(type) === listener) listeners.delete(type);
    },
  };
  globalThis.BroadcastChannel = class {
    addEventListener(_type, listener) {
      channelListener = listener;
    }
    close() {
      channelClosed = true;
    }
  };

  try {
    assert.equal(saveEmergencyNumber("(112)"), "112");
    assert.equal(storage.get(EMERGENCY_NUMBER_KEY), "112");
    assert.equal(readEmergencyNumber(), "112");

    let reloads = 0;
    const unsubscribe = subscribeToLocalDataErase(() => {
      reloads += 1;
    });
    listeners.get("storage")({ key: "knotty-local-data-erase-signal", newValue: "nonce-1" });
    channelListener({ data: "nonce-1" });
    assert.equal(reloads, 1, "duplicate storage/channel delivery must trigger one reload");
    unsubscribe();
    assert.equal(listeners.has("storage"), false);
    assert.equal(channelClosed, true);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    if (previousBroadcastChannel === undefined) delete globalThis.BroadcastChannel;
    else globalThis.BroadcastChannel = previousBroadcastChannel;
  }
});

test("all-data erase can complete after a legacy IndexedDB blocked event", async () => {
  const { eraseAllLocalData, LOCAL_DATA_KEYS } = await import("../src/lib/privacy/local-data.ts");
  const previousWindow = globalThis.window;
  const previousIndexedDB = globalThis.indexedDB;
  const previousBroadcastChannel = globalThis.BroadcastChannel;
  const storage = new Map(LOCAL_DATA_KEYS.map((key) => [key, "persisted"]));
  globalThis.window = {
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key),
    },
    setTimeout,
    clearTimeout,
  };
  globalThis.BroadcastChannel = class {
    postMessage() {}
    close() {}
  };
  globalThis.indexedDB = {
    deleteDatabase() {
      const request = {};
      setTimeout(() => request.onblocked?.(), 0);
      setTimeout(() => request.onsuccess?.(), 5);
      return request;
    },
  };

  try {
    const result = await eraseAllLocalData();
    assert.equal(result.browserStorageCleared, true);
    assert.equal(result.legacyStills, "deleted_or_absent");
    for (const key of LOCAL_DATA_KEYS) assert.equal(storage.has(key), false);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    if (previousIndexedDB === undefined) delete globalThis.indexedDB;
    else globalThis.indexedDB = previousIndexedDB;
    if (previousBroadcastChannel === undefined) delete globalThis.BroadcastChannel;
    else globalThis.BroadcastChannel = previousBroadcastChannel;
  }
});
