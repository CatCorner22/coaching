import assert from "node:assert/strict";
import { test } from "node:test";
import { applyAppSyncBundle, buildAppSyncBundle, parseAppSyncBundle } from "./app-sync.ts";
import { useNegotiate } from "./stores/negotiate.ts";
import { useChecklist } from "./stores/checklist.ts";
import { useSettings } from "./stores/settings.ts";

function bundleWith(overrides: Record<string, unknown>) {
  const base = {
    version: 1,
    exportedAt: 1700000000000,
    settings: {
      riggerName: "R",
      bottomName: "B",
      honorific: "",
      style: "peer",
      safeword: "red",
      yellowWord: "yellow",
      greenWord: "green",
      circulationMins: 5,
    },
    negotiate: [],
    checklist: {},
    ...overrides,
  };
  const parsed = parseAppSyncBundle(JSON.stringify(base));
  assert.ok(parsed, "fixture bundle must parse");
  return parsed;
}

test("a sync file cannot set the consent-bearing settings flags", () => {
  // `settings.set` merges every key it is handed, so an import that passed
  // the file's settings object through as parsed let an edited file set
  // consented/adults/voice/listen/consentVersion — the whole consent gate —
  // as a side effect of "import sync file". Sync carries preferences only;
  // consent is asked for on each device.
  useSettings.setState({ consented: false, adults: false, voice: false, listen: false, consentVersion: 0 });
  const bundle = bundleWith({
    settings: {
      riggerName: "R",
      bottomName: "B",
      honorific: "",
      style: "peer",
      safeword: "red",
      yellowWord: "yellow",
      greenWord: "green",
      circulationMins: 5,
      consented: true,
      adults: true,
      voice: true,
      listen: true,
      consentVersion: 99,
    },
  });
  applyAppSyncBundle(bundle);
  const settings = useSettings.getState();
  assert.equal(settings.consented, false);
  assert.equal(settings.adults, false);
  assert.equal(settings.voice, false);
  assert.equal(settings.listen, false);
  assert.equal(settings.consentVersion, 0);
  // The preference fields it does carry still land.
  assert.equal(settings.riggerName, "R");
  assert.equal(settings.safeword, "red");
});

test("imported negotiation rows are normalized: locked-no stays no, junk is dropped", () => {
  const bundle = bundleWith({
    negotiate: [
      { id: "neck", label: "Neck / breath rope", rank: "yes" },
      { id: "torso", label: "Chest / karada harnesses", rank: "yes" },
      { id: "junk", rank: 42 },
      null,
    ],
  });
  applyAppSyncBundle(bundle);
  const items = useNegotiate.getState().items;
  const neck = items.find((item) => item.id === "neck");
  assert.ok(neck, "canonical neck row present");
  assert.equal(neck.rank, "no", "a file cannot show a locked-no row as yes");
  assert.equal(items.find((item) => item.id === "torso")?.rank, "yes");
  assert.ok(items.every((item) => item.rank === "yes" || item.rank === "maybe" || item.rank === "no"));
});

test("imported checklist keeps only boolean entries and the round-trip is lossless", () => {
  const bundle = bundleWith({
    checklist: { shears: true, water: false, sneaky: "yes-string", nested: { a: 1 } },
  });
  applyAppSyncBundle(bundle);
  const done = useChecklist.getState().done;
  assert.equal(done.shears, true);
  assert.equal(done.water, false);
  assert.ok(!("sneaky" in done));
  assert.ok(!("nested" in done));

  // A bundle built from live state re-applies without loss.
  useSettings.getState().set({ riggerName: "Ryn", safeword: "carmine" });
  const exported = buildAppSyncBundle();
  useSettings.getState().set({ riggerName: "other", safeword: "blue" });
  applyAppSyncBundle(exported);
  assert.equal(useSettings.getState().riggerName, "Ryn");
  assert.equal(useSettings.getState().safeword, "carmine");
});
