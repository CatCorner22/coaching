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
  // Studio sends `"<id>: <label>"`. A custom row's id is a 36-char UUID and
  // labels clamp to 80, so the longest legitimate line is 118 — the old
  // per-element cap of 80 was shorter than the client's own construction, so
  // one long custom label made every analyze request fail validation and
  // stranded the one-use batch as "already submitted".
  const uuid = "0123456789abcdef0123456789abcdef0123".slice(0, 36);
  const label = "x".repeat(80);
  const line = `${uuid}: ${label}`;
  assert.ok(
    line.length <= MAX_HARD_NO_LENGTH,
    `longest constructible line (${line.length}) must fit MAX_HARD_NO_LENGTH (${MAX_HARD_NO_LENGTH})`,
  );
});
