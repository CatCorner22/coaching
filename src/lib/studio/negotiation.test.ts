import assert from "node:assert/strict";
import { test } from "node:test";
import type { NegItem, Rank } from "@/lib/stores/negotiate";
import { buildStudioNegotiationPolicy } from "./negotiation.ts";

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

test("every rank transition changes the capture-bound negotiation key", () => {
  const keys = (["no", "maybe", "yes"] as const).map(
    (rank) => buildStudioNegotiationPolicy([item("photos", rank)]).negotiationKey,
  );
  assert.equal(new Set(keys).size, 3);
});
