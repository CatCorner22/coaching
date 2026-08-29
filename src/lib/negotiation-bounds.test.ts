import assert from "node:assert/strict";
import { test } from "node:test";
import { MAX_HARD_NO_LENGTH, MAX_HARD_NOS, MAX_NEGOTIATION_ITEMS } from "./negotiation-bounds.ts";
import { normalizeNegotiationItems } from "./stores/negotiate.ts";
import { buildStudioNegotiationPolicy } from "./studio/negotiation.ts";

test("the analyze schema accepts every limit being at no", () => {
  // The regression this file exists for. Every row that is not a yes is sent as
  // a hard no, so a fresh install — everything at its default of no — produces
  // the largest payload the app can ever generate. The cap was a bare 24, sized
  // when the list held 22 rows; growing the list to 40 made the whole analyze
  // request fail schema validation before it left the browser, and no unit test
  // noticed because none of them built a real request.
  const fresh = normalizeNegotiationItems([]);
  const { operationalLimits } = buildStudioNegotiationPolicy(fresh);

  assert.equal(
    operationalLimits.length,
    fresh.length,
    "a fresh install should have every row at no",
  );
  assert.ok(
    operationalLimits.length <= MAX_HARD_NOS,
    `a fresh install sends ${operationalLimits.length} hard nos against a cap of ${MAX_HARD_NOS}`,
  );
});

test("the cap accommodates a full list plus every custom row someone can add", () => {
  // Not just today's list: the worst case the store will ever hand over.
  const custom = Array.from({ length: MAX_NEGOTIATION_ITEMS }, (_, i) => ({
    id: `custom-${i}`,
    label: `Custom limit ${i}`,
    rank: "no" as const,
  }));
  const saturated = normalizeNegotiationItems([...normalizeNegotiationItems([]), ...custom]);
  assert.equal(saturated.length, MAX_NEGOTIATION_ITEMS, "the store should saturate at its ceiling");

  const { operationalLimits } = buildStudioNegotiationPolicy(saturated);
  assert.ok(
    operationalLimits.length <= MAX_HARD_NOS,
    `a saturated list sends ${operationalLimits.length} hard nos against a cap of ${MAX_HARD_NOS}`,
  );
});

test("the two ceilings cannot drift apart", () => {
  // They are the same number for a reason: hardNos carries one entry per
  // non-yes row, so a hardNos cap below the row ceiling is a payload the app
  // can build and the server will reject.
  assert.ok(
    MAX_HARD_NOS >= MAX_NEGOTIATION_ITEMS,
    "hardNos must accept the whole list being at no",
  );
});

test("the hard-no list is never silently shortened", () => {
  // Truncating would be worse than rejecting: the model would be told about
  // fewer limits than were set, with nothing anywhere to say so. Whatever the
  // policy reports as unapproved is exactly what gets sent.
  const items = normalizeNegotiationItems([]).map((item, i) =>
    i % 3 === 0 ? { ...item, rank: "yes" as const } : item,
  );
  const normalized = normalizeNegotiationItems(items);
  const { operationalLimits } = buildStudioNegotiationPolicy(normalized);
  const expected = normalized.filter((item) => item.rank !== "yes");
  assert.deepEqual(
    operationalLimits.map((item) => item.id),
    expected.map((item) => item.id),
    "the unapproved set must be reported in full",
  );
});

test("every constructible hard-no line fits the shared per-element bound", () => {
  // Studio sends `"<id>: <label>"`, and normalization clamps both ids and
  // labels to 80 — a persisted or imported custom row can carry an 80-char
  // id, not just a 36-char UUID. The bound must fit the WORST normalized
  // construction: anything shorter silently drops the tail of a long custom
  // hard-no (the first bound, 80, instead rejected the client's own lines
  // and stranded one-use batches).
  const items = normalizeNegotiationItems([
    { id: "i".repeat(200), label: "x".repeat(200), rank: "no" },
  ]);
  const worst = items.find((item) => item.id.startsWith("iii"));
  assert.ok(worst, "the custom row must survive normalization");
  const line = `${worst.id}: ${worst.label}`;
  assert.equal(line.length, 162, "the normalized worst case is 80 + 2 + 80");
  assert.ok(
    line.length <= MAX_HARD_NO_LENGTH,
    `longest constructible line (${line.length}) must fit MAX_HARD_NO_LENGTH (${MAX_HARD_NO_LENGTH})`,
  );
});
