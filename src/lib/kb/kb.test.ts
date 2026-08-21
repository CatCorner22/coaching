import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ARTICLES,
  DUNGEON,
  DUNGEON_SCENES,
  GEAR,
  KNOTS,
  NERVES,
  SEQUENCES,
  TIES,
  articleExcerpts,
  getKnot,
  getTie,
  isKnowledgeQueryUsable,
  knowledgeAnswer,
  searchKnowledge,
} from "./index.ts";
import { SAFETY_SOURCES } from "./sources.ts";

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

test("all routed catalog slugs are globally unique", () => {
  const rows = [
    ...TIES.map((item) => ["tie", item.slug] as const),
    ...KNOTS.map((item) => ["knot", item.slug] as const),
    ...ARTICLES.map((item) => ["article", item.slug] as const),
    ...GEAR.map((item) => ["gear", item.slug] as const),
    ...DUNGEON.map((item) => ["dungeon", item.slug] as const),
    ...NERVES.map((item) => ["nerve", item.slug] as const),
    ...SEQUENCES.map((item) => ["sequence", item.slug] as const),
  ];
  const owners = new Map<string, string>();
  for (const [kind, slug] of rows) {
    assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${kind} has a non-canonical slug: ${slug}`);
    assert.equal(owners.get(slug), undefined, `${kind}:${slug} collides with ${owners.get(slug)}`);
    owners.set(slug, kind);
  }
});

test("all cross-catalog references resolve to a routeable item", () => {
  const related = new Set([...ARTICLES, ...TIES, ...KNOTS].map((item) => item.slug));
  const nerveSlugs = new Set<string>(NERVES.map((nerve) => nerve.slug));
  const dungeonSlugs = new Set<string>(DUNGEON.map((piece) => piece.slug));
  for (const article of ARTICLES) {
    for (const slug of article.related) {
      assert.ok(related.has(slug), `article ${article.slug} has unresolved related slug ${slug}`);
    }
  }
  for (const tie of TIES) {
    for (const slug of tie.knots) assert.ok(getKnot(slug), `tie ${tie.slug} has unresolved knot ${slug}`);
    for (const slug of tie.nerves) {
      assert.ok(nerveSlugs.has(slug), `tie ${tie.slug} has unresolved nerve ${slug}`);
    }
  }
  for (const knot of KNOTS) {
    for (const slug of knot.usedIn) assert.ok(getTie(slug), `knot ${knot.slug} has unresolved tie ${slug}`);
  }
  for (const scene of DUNGEON_SCENES) {
    assert.ok(dungeonSlugs.has(scene.piece), `scene ${scene.slug} has unresolved equipment ${scene.piece}`);
  }
});

test("safety source identifiers and links are unique, stable, and HTTPS", () => {
  const ids = SAFETY_SOURCES.map((source) => source.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const source of SAFETY_SOURCES) {
    assert.match(source.id, /^[A-Z]+(?:-[A-Z]+)*-[0-9]+$/);
    const url = new URL(source.href);
    assert.equal(url.protocol, "https:", source.id);
    assert.ok(url.hostname.includes("."), source.id);
    assert.ok(source.note.length > 40, `${source.id} is missing an evidence-limit note`);
  }
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

test("excerpts deduplicate slugs and enforce count and character bounds", () => {
  const duplicates = articleExcerpts(["consent-frameworks", "consent-frameworks", "karada"]);
  assert.deepEqual(duplicates.map((row) => row.slug), ["consent-frameworks", "karada"]);
  assert.equal(articleExcerpts(["consent-frameworks"], -1)[0]?.text, "");
  const oversized = articleExcerpts(Array.from({ length: 40 }, () => "consent-frameworks"), Infinity);
  assert.equal(oversized.length, 1);
  assert.ok(oversized[0]!.text.length <= 900);
});

test("search bounds oversized and duplicate input without changing its result", () => {
  const baseline = searchKnowledge("consent", 8);
  const oversized = searchKnowledge("consent ".repeat(200_000), 8);
  assert.deepEqual(oversized, baseline);
  assert.deepEqual(searchKnowledge("consent consent consent", 8), baseline);
  assert.deepEqual(searchKnowledge("consent", -1), []);
  assert.equal(searchKnowledge("consent", Number.NaN).length, 12);
  assert.equal(searchKnowledge("consent", Number.POSITIVE_INFINITY).length, 12);
});

test("search is Unicode-aware, token-boundary aware, and deterministic", () => {
  assert.ok(searchKnowledge("縛り", 8).some((hit) => hit.slug === "single-column"));
  assert.equal(searchKnowledge("神経", 1)[0]?.slug, "nerve-atlas");
  assert.equal(searchKnowledge("takatekote", 1)[0]?.slug, "takate-kote");
  assert.ok(searchKnowledge("red", 8).some((hit) => hit.slug === "safewords"));
  assert.ok(!searchKnowledge("red", 8).some((hit) => hit.slug === "hismith"));
  assert.ok(!searchKnowledge("red", 8).some((hit) => hit.slug === "median"));
  assert.deepEqual(searchKnowledge("radial nerve", 12), searchKnowledge("radial nerve", 12));
  assert.equal(isKnowledgeQueryUsable("the and how"), false);
  assert.equal(isKnowledgeQueryUsable("縄"), true);
});

test("safety-oriented aliases route common wording to reviewed entries", () => {
  assert.ok(searchKnowledge("coercion", 6).some((hit) => hit.slug === "consent-frameworks"));
  assert.ok(searchKnowledge("strangulation", 6).some((hit) => hit.slug === "hard-limits"));
  assert.equal(searchKnowledge("raynauds", 1)[0]?.slug, "negotiation");
  assert.equal(searchKnowledge("blue limb", 1)[0]?.slug, "circulation");
});

test("urgent natural-language intent prioritizes emergency release guidance and shears", () => {
  for (const query of [
    "not breathing",
    "can't breathe",
    "cut rope now",
    "passed out",
    "not responding",
    "fainted",
    "fell and hit head",
    "緊急時にロープを切る",
    "他昏倒了",
    "癫痫发作",
    "胸痛",
  ]) {
    const hits = searchKnowledge(query, 4);
    assert.equal(hits[0]?.slug, "emergency-stop", query);
    assert.ok(hits.slice(0, 3).some((hit) => hit.slug === "shears"), query);
  }
});

test("safe-start phrasing routes to planning rather than an incidental knot or tie", () => {
  for (const query of [
    "start safely",
    "縛りを安全に始めるにはどうすればいいですか",
    "如何安全开始绑缚",
  ]) {
    const hits = searchKnowledge(query, 3);
    assert.equal(hits[0]?.slug, "negotiation", query);
    assert.ok(hits.some((hit) => hit.slug === "consent-frameworks"), query);
    assert.ok(hits.every((hit) => hit.kind === "article"), query);
  }
});

test("bounded CJK segmentation recognizes natural consent and nerve questions", () => {
  assert.equal(searchKnowledge("神経について教えてください", 1)[0]?.slug, "nerve-atlas");
  assert.equal(searchKnowledge("同意を撤回したい", 1)[0]?.slug, "consent-frameworks");
  assert.deepEqual(
    searchKnowledge("安全".repeat(100_000), 8),
    searchKnowledge("安全".repeat(300), 8),
  );
});

test("generic catalog search hits deep-link to the selected item", () => {
  assert.equal(searchKnowledge("trauma shears", 8).find((hit) => hit.slug === "shears")?.href, "/gear#shears");
  assert.equal(searchKnowledge("hismith", 8).find((hit) => hit.slug === "hismith")?.href, "/dungeon#hismith");
  assert.equal(searchKnowledge("pudendal", 8).find((hit) => hit.slug === "pudendal")?.href, "/nerves?nerve=pudendal");
});

test("reviewed answers are deterministic and available without a server or AI", () => {
  const answer = knowledgeAnswer("coercion");
  assert.match(answer, /Consent Frameworks/);
  assert.match(answer, /does not validate a setup/);
  assert.equal(answer, knowledgeAnswer("coercion"));
  assert.match(knowledgeAnswer("zzzzqvvvv"), /No reviewed entry matched/);
});
