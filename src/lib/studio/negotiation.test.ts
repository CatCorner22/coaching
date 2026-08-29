import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeNegotiationItems, type NegItem, type Rank } from "@/lib/stores/negotiate";
import {
  buildStudioNegotiationPolicy,
  mediaAuthorizationWasRevoked,
  missingTieLimits,
  studioPolicySignature,
} from "./negotiation.ts";

function item(id: string, rank: Rank): NegItem {
  return { id, label: id, rank };
}

test("photo and Studio voice require affirmative yes", () => {
  for (const rank of ["no", "maybe"] as const) {
    const policy = buildStudioNegotiationPolicy([item("photos", rank), item("voice", rank)]);
    assert.equal(policy.mediaBlocked, true, rank);
    assert.equal(policy.voiceBlocked, true, rank);
  }
  const approved = buildStudioNegotiationPolicy([item("photos", "yes"), item("voice", "yes")]);
  assert.equal(approved.mediaBlocked, false);
  assert.equal(approved.voiceBlocked, false);
});

test("media cleanup runs only on a genuine allowed-to-blocked transition", () => {
  const matrix = [
    { previous: false, current: false, revoked: false },
    { previous: false, current: true, revoked: false },
    { previous: true, current: true, revoked: false },
    { previous: true, current: false, revoked: true },
  ];
  for (const row of matrix) {
    assert.equal(
      mediaAuthorizationWasRevoked(row.previous, row.current),
      row.revoked,
      JSON.stringify(row),
    );
  }

  let previous = true;
  let invalidations = 0;
  for (const current of [false, true]) {
    if (mediaAuthorizationWasRevoked(previous, current)) invalidations += 1;
    previous = current;
  }
  assert.equal(invalidations, 1, "reapproval cannot undo an already-observed revocation");
});

test("guided restraint ties wait for the cuffs limit", () => {
  const none = buildStudioNegotiationPolicy(normalizeNegotiationItems([]));
  assert.equal(none.isTieBlocked("single-column"), true);
  assert.equal(none.isTieBlocked("double-column"), true);
  const cuffs = buildStudioNegotiationPolicy([item("cuffs", "yes")]);
  assert.equal(cuffs.isTieBlocked("single-column"), false);
  assert.equal(cuffs.isTieBlocked("double-column"), false);
});

test("maybe blocks mapped ties and equipment until each item becomes yes", () => {
  const unresolved = buildStudioNegotiationPolicy([
    item("gote", "maybe"),
    item("machine", "maybe"),
  ]);
  assert.equal(unresolved.isTieBlocked("takate-kote"), true);
  assert.equal(unresolved.isFurnitureBlocked("hismith"), true);

  const approved = buildStudioNegotiationPolicy([item("gote", "yes"), item("machine", "yes")]);
  assert.equal(approved.isTieBlocked("takate-kote"), false);
  assert.equal(approved.isFurnitureBlocked("hismith"), false);
});

test("every policy change has a collision-resistant capture-bound negotiation key", () => {
  const keys = (["no", "maybe", "yes"] as const).map(
    (rank) => buildStudioNegotiationPolicy([item("photos", rank)]).negotiationKey,
  );
  assert.equal(new Set(keys).size, 3);

  const embeddedDelimiter = buildStudioNegotiationPolicy([
    { id: "!a", rank: "yes", label: "x\u0000!b:no:y" },
  ]);
  const separateRows = buildStudioNegotiationPolicy([
    { id: "!a", rank: "yes", label: "x" },
    { id: "!b", rank: "no", label: "y" },
  ]);
  assert.notEqual(embeddedDelimiter.negotiationKey, separateRows.negotiationKey);
});

test("missing and duplicate canonical approvals fail closed in Studio policy", () => {
  const missing = buildStudioNegotiationPolicy([item("custom", "yes")]);
  assert.equal(missing.mediaBlocked, true);
  assert.equal(missing.voiceBlocked, true);
  assert.equal(missing.isTieBlocked("takate-kote"), true);
  assert.equal(missing.isFurnitureBlocked("hismith"), true);

  const duplicated = buildStudioNegotiationPolicy([
    item("photos", "yes"),
    item("photos", "yes"),
    item("voice", "yes"),
    item("gote", "yes"),
    item("machine", "yes"),
  ]);
  assert.equal(duplicated.mediaBlocked, true);
  assert.equal(duplicated.voiceBlocked, false);
  assert.equal(duplicated.isTieBlocked("takate-kote"), false);
  assert.equal(duplicated.isFurnitureBlocked("hismith"), false);
});

test("persisted negotiation normalization restores and locks the canonical policy", () => {
  const normalized = normalizeNegotiationItems([
    item("photos", "yes"),
    { id: "photos", label: null, rank: "no" },
    item("voice", "yes"),
    item("neck", "yes"),
    { id: "cuffs", label: 42, rank: "yes" },
    { id: " custom ", label: " Custom limit ", rank: "yes" },
    { id: "custom", label: "Duplicate custom", rank: "maybe" },
    { id: "", label: "invalid", rank: "yes" },
  ]);

  // The whole canonical list survives, plus exactly one row for the deduplicated
  // custom entry. Asserted against the list itself rather than a literal, which
  // was a stand-in for this and broke the moment the list grew.
  assert.equal(normalized.length, normalizeNegotiationItems([]).length + 1);
  assert.equal(normalized.filter((entry) => entry.id === "custom").length, 1);
  assert.deepEqual(normalized.find((entry) => entry.id === "photos")?.rank, "no");
  assert.deepEqual(normalized.find((entry) => entry.id === "voice")?.rank, "yes");
  assert.deepEqual(normalized.find((entry) => entry.id === "neck")?.rank, "no");
  assert.deepEqual(normalized.find((entry) => entry.id === "cuffs")?.rank, "no");
  assert.deepEqual(normalized.find((entry) => entry.id === "gote")?.rank, "no");
  assert.deepEqual(
    normalized.find((entry) => entry.id === "custom"),
    {
      id: "custom",
      label: "Custom limit",
      rank: "no",
    },
  );
});

test("studioPolicySignature changes only for gating policy, not unrelated writes", () => {
  const base: NegItem[] = normalizeNegotiationItems([
    { id: "photos", label: "Photos / video for coaching", rank: "yes" },
  ]);
  const consent = { consented: true, voice: false, listen: false };

  // Same policy, same signature — an unrelated note/name keystroke in another
  // tab must not look like a policy change.
  assert.equal(studioPolicySignature(base, consent), studioPolicySignature([...base], consent));

  // A revoked media approval changes the signature.
  const revoked = base.map((item) => (item.id === "photos" ? { ...item, rank: "no" as Rank } : item));
  assert.notEqual(studioPolicySignature(base, consent), studioPolicySignature(revoked, consent));

  // Consent-bearing settings changes are part of the signature.
  assert.notEqual(
    studioPolicySignature(base, consent),
    studioPolicySignature(base, { ...consent, consented: false }),
  );
  assert.notEqual(
    studioPolicySignature(base, consent),
    studioPolicySignature(base, { ...consent, voice: true }),
  );
  // Missing/unknown flags are treated as off rather than throwing.
  assert.equal(typeof studioPolicySignature(base, {}), "string");
});

test("missingTieLimits names the unagreed rows a guided tie waits for, fail-closed", () => {
  // The tie page's half of the README promise "blocked in Studio and on the
  // tie page". An empty store — unhydrated, or a fresh browser — blocks like
  // an unagreed limit does, and normalization supplies the canonical row and
  // its canonical label, so the blocked card names the real negotiation row.
  assert.deepEqual(missingTieLimits("karada", []), [
    { id: "torso", label: "Chest / karada harnesses" },
  ]);

  // A maybe is not a yes.
  assert.equal(missingTieLimits("karada", [item("torso", "maybe")]).length, 1);

  // A yes opens the tie.
  assert.deepEqual(missingTieLimits("karada", [item("torso", "yes")]), []);

  // Entries that map to no rows — prop drills — never block.
  assert.deepEqual(missingTieLimits("hex-net", []), []);
  assert.deepEqual(missingTieLimits(undefined, []), []);

  // The locked-no rows can never open what they gate, however the list is
  // edited: a forged yes on the neck row is normalized back to no.
  assert.equal(missingTieLimits("kubi-nawa", [item("neck", "yes")]).length, 1);

  // Multi-limit ties report every missing row, not just the first.
  assert.deepEqual(
    missingTieLimits("waki-shibari", [item("arms", "yes")]).map((row) => row.id),
    ["torso"],
  );
  assert.equal(missingTieLimits("waki-shibari", []).length, 2);
});
