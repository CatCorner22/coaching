import assert from "node:assert/strict";
import { test } from "node:test";
import { TIES } from "@/lib/kb";
import { kitCoverage, metersFor, STAFF_METERS, WASTE_FACTOR } from "./rope.ts";

const firstSlug = TIES[0]!.slug;

test("the recommended staff count covers the number the page packs from", () => {
  // The staff count came from the bare total while the sufficiency check used
  // the waste-inclusive one, so the page could recommend staffs it then called
  // "Short".
  for (const slugs of [[firstSlug], [firstSlug, firstSlug], TIES.map((t) => t.slug)]) {
    const estimate = metersFor(slugs);
    assert.ok(
      estimate.eights * STAFF_METERS >= estimate.totalWithWaste,
      `${estimate.eights} staffs must cover ${estimate.totalWithWaste}m`,
    );
    assert.ok(
      kitCoverage(estimate, estimate.eights, 0).enough,
      "buying exactly the recommended staffs must read as enough",
    );
  }
});

test("waste is applied to the listed lengths", () => {
  const estimate = metersFor([firstSlug]);
  assert.equal(estimate.totalWithWaste, Math.round(estimate.total * WASTE_FACTOR * 10) / 10);
  assert.ok(estimate.total > 0);
});

test("metres alone do not cover a plan that needs 8m staffs", () => {
  const estimate = metersFor([firstSlug]);
  const manyShortStaffs = kitCoverage(estimate, 0, Math.ceil(estimate.totalWithWaste / 4) + 4);
  assert.equal(manyShortStaffs.metersShort, 0, "the metres are there");
  assert.ok(manyShortStaffs.eightsShort > 0, "the 8m staffs are not");
  assert.equal(manyShortStaffs.enough, false);
});

test("an unlisted tie is counted but flagged rather than folded in silently", () => {
  const estimate = metersFor(["not-a-real-tie"]);
  assert.deepEqual(estimate.unknownSlugs, ["not-a-real-tie"]);
  assert.equal(estimate.rows[0]!.known, false);
  assert.equal(estimate.rows[0]!.meters, 8);
});

test("an empty plan needs nothing", () => {
  const estimate = metersFor([]);
  assert.deepEqual(
    { total: estimate.total, totalWithWaste: estimate.totalWithWaste, eights: estimate.eights },
    { total: 0, totalWithWaste: 0, eights: 0 },
  );
  assert.equal(kitCoverage(estimate, 0, 0).enough, true);
});
