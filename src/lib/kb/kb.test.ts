import assert from "node:assert/strict";
import { test } from "node:test";
import { ARTICLES, DUNGEON, DUNGEON_SCENES, KNOTS, SEQUENCES, TIES, articleExcerpts, getKnot, getTie } from "./index.ts";

test("tie slugs are unique and getTie round-trips", () => {
  const slugs = TIES.map((t) => t.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const t of TIES) {
    assert.equal(getTie(t.slug)?.name, t.name);
    assert.ok(t.steps.length > 0);
    assert.ok(t.stop.length > 0);
  }
});

test("knot slugs are unique", () => {
  const slugs = KNOTS.map((k) => k.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const k of KNOTS) assert.equal(getKnot(k.slug)?.name, k.name);
});

test("article slugs are unique", () => {
  const slugs = ARTICLES.map((a) => a.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test("every sequence step is a real tie", () => {
  for (const s of SEQUENCES) {
    for (const step of s.steps) {
      assert.ok(getTie(step), `sequence ${s.slug} missing tie ${step}`);
    }
  }
});

test("dungeon scenes share planner sequence slugs and steps", () => {
  for (const s of DUNGEON_SCENES) {
    const seq = SEQUENCES.find((x) => x.slug === s.slug);
    assert.ok(seq, `dungeon scene ${s.slug} is not a planner sequence`);
    assert.deepEqual([...s.steps], [...seq!.steps]);
  }
});

test("dungeon pieces reference real ties and unique slugs", () => {
  const slugs = DUNGEON.map((d) => d.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const d of DUNGEON) {
    assert.ok(d.never.length > 0, d.slug);
    for (const slug of d.ties) {
      assert.ok(getTie(slug), `dungeon ${d.slug} missing tie ${slug}`);
    }
  }
});

test("excerpts resolve ties and furniture, not only essays", () => {
  const rows = articleExcerpts(["karada", "hismith", "consent-frameworks"]);
  assert.equal(rows.length, 3);
  assert.ok(rows.some((r) => /hismith/i.test(r.title + r.text)));
});
