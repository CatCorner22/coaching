import assert from "node:assert/strict";
import { test } from "node:test";
import { ARTICLES, TIES, getTie, searchKnowledge } from "./index.ts";
import { getArticleEvidence } from "./provenance.ts";
import { BDSM_ARTICLES } from "./bdsm-articles.ts";
import { SHIBARI_TIES } from "./shibari-ties.ts";
import { buildStudioNegotiationPolicy } from "../studio/negotiation.ts";
import {
  LOCKED_NO,
  MAX_NEGOTIATION_ITEMS,
  normalizeNegotiationItems,
  type NegItem,
} from "../stores/negotiate.ts";

const everythingApproved = (): NegItem[] =>
  normalizeNegotiationItems([]).map((item) => ({ ...item, rank: "yes" as const, label: item.label }));

test("every tie carries exactly one of the three shape markers", () => {
  // Prop drill, guided practice, or instructor route. A tie carrying none of
  // them is an unlabelled body-placement recipe, which is the one thing this
  // catalog must never publish; a tie carrying two is ambiguous about whether
  // it may go on a person.
  for (const tie of TIES) {
    const markers = ["unoccupied-practice", "guided-practice", "instructor-only"].filter((tag) =>
      tie.intent.includes(tag),
    );
    assert.equal(markers.length, 1, `${tie.slug} has markers: ${markers.join(", ") || "none"}`);
    const [shape] = markers;
    if (shape === "unoccupied-practice") {
      assert.equal(tie.position, "theory", tie.slug);
      assert.match(tie.why, /unoccupied prop or dress form/, tie.slug);
    } else if (shape === "instructor-only") {
      assert.equal(tie.minutes[1], 0, `${tie.slug} offers a duration for a restraint category`);
      assert.equal(tie.ropes.length, 0, `${tie.slug} specifies rope for a restraint category`);
      assert.match(tie.stop.join(" "), /Do not construct or modify this tie/, tie.slug);
    }
  }
});

test("a guided tie is taught properly or not at all", () => {
  // Half-taught is the worst outcome available here: enough to start, not
  // enough to finish or to know when to stop.
  const guided = TIES.filter((tie) => tie.intent.includes("guided-practice"));
  assert.ok(guided.length >= 3, "nothing is actually taught");
  for (const tie of guided) {
    // A real sequence, not a single hedged paragraph wearing a step's clothes.
    assert.ok(tie.steps.length >= 6, `${tie.slug} has only ${tie.steps.length} steps`);
    assert.ok(tie.minutes[1] > 0, `${tie.slug} is teachable but offers no duration`);
    assert.ok(tie.ropes.length > 0, `${tie.slug} does not say what rope it needs`);
    assert.ok(tie.mistakes.length >= 4, `${tie.slug} names too few ways to get it wrong`);

    // Every step actually instructs, on both sides, and says what to look at.
    for (const step of tie.steps) {
      assert.ok(step.rigger.length > 120, `${tie.slug}/${step.title}: rigger step too thin`);
      assert.ok(step.bottom.length > 80, `${tie.slug}/${step.title}: bottom step too thin`);
      assert.ok(step.check.length > 40, `${tie.slug}/${step.title}: check too thin`);
    }

    // Removal is rehearsed before the first wrap and performed at the end.
    assert.match(tie.steps[0].title, /rehearse getting it off/i, tie.slug);
    assert.match(JSON.stringify(tie.steps[0]), /shears/i, tie.slug);
    assert.match(
      JSON.stringify(tie.steps[tie.steps.length - 1]),
      /off|remov|untie|cut/i,
      `${tie.slug} never says how it comes off`,
    );

    // The universal stop conditions lead, in the same words, every time.
    assert.match(tie.stop[0], /Numbness, tingling/, tie.slug);
    assert.match(tie.stop[0], /take the rope off now, before discussing it/, tie.slug);
    assert.match(tie.stop[1], /neck|armpit/, tie.slug);

    // And late symptoms are chased, because that is when they show up.
    assert.match(tie.aftercare, /next (?:day|morning)/i, `${tie.slug} does not chase late symptoms`);
  }
});

test("no check in a guided tie is ever written as a clearance", () => {
  // The failure this whole catalog is arranged against: a reader concluding
  // that having done a check means it is now safe to continue. A nerve
  // compresses without changing circulation, so the classic tests — colour,
  // warmth, two fingers, wiggle your thumb — stay normal while the injury
  // happens. Checks catch problems. They never grant permission.
  const guided = TIES.filter((tie) => tie.intent.includes("guided-practice"));
  const clearanceWords =
    /(?:safe to (?:continue|proceed|carry on)|good to go|then it is fine|cleared|means it is safe|you can continue)/i;
  for (const tie of guided) {
    for (const step of tie.steps) {
      assert.doesNotMatch(step.check, clearanceWords, `${tie.slug}/${step.title}`);
      assert.doesNotMatch(step.rigger, clearanceWords, `${tie.slug}/${step.title}`);
    }
    // And each one says out loud that a check is not permission.
    assert.match(
      JSON.stringify(tie),
      /(?:not a test that it is safe|says nothing about minute|never to grant permission|information about this moment)/i,
      `${tie.slug} never disclaims its own checks`,
    );
  }
});

test("every restraint category says what it actually risks", () => {
  // Naming a nerve on a prop drill is fine and often useful — the single-column
  // drill names the ones a wrist structure concerns, which is why someone would
  // learn it. What matters is the other direction: a restraint category that
  // names no nerve and no risk family has not said what it is.
  for (const tie of SHIBARI_TIES) {
    if (!tie.intent.includes("instructor-only")) continue;
    // A restraint category with no nerve and no locked/context marker has not
    // said what it actually risks.
    const contextual = ["historical", "context", "gag", "airway", "session"].some((tag) =>
      tie.intent.includes(tag),
    );
    assert.ok(tie.nerves.length > 0 || contextual, `${tie.slug} names no risk`);
  }
});

test("every gated restraint category maps to a negotiated limit", () => {
  // An unmapped tie is open by default. That is right for a prop drill and
  // wrong for everything else, and the failure is silent — the tie simply
  // never blocks.
  const allNo = buildStudioNegotiationPolicy(normalizeNegotiationItems([]));
  const allYes = buildStudioNegotiationPolicy(everythingApproved());

  const ungated: string[] = [];
  for (const tie of TIES) {
    if (!tie.intent.includes("instructor-only")) continue;
    // Context-only entries carry no body configuration to gate.
    if (tie.intent.includes("historical") || tie.intent.includes("context")) continue;
    if (!allNo.isTieBlocked(tie.slug)) ungated.push(tie.slug);
  }
  assert.deepEqual(ungated, [], `restraint categories open with every limit at no: ${ungated.join(", ")}`);

  // And the gate is a gate, not a wall: approving everything opens the ones
  // that are approvable.
  assert.equal(allYes.isTieBlocked("teppou"), false);
  // Except the locked four, which no amount of approving opens.
  assert.equal(allYes.isTieBlocked("kubi-nawa"), true, "neck must stay blocked");
  assert.equal(allYes.isTieBlocked("yoko-zuri"), true, "suspension must stay blocked");
  assert.equal(allYes.isTieBlocked("sakasa-zuri"), true, "inversion must stay blocked");
  assert.equal(allYes.isTieBlocked("hogtie-suspended"), true, "suspended hogtie must stay blocked");
});

test("the locked four cannot be approved however the list is edited", () => {
  const forced = normalizeNegotiationItems(
    normalizeNegotiationItems([]).map((item) => ({ ...item, rank: "yes" })),
  );
  for (const id of LOCKED_NO) {
    assert.equal(forced.find((item) => item.id === id)?.rank, "no", id);
  }
});

test("the negotiation list has room for the whole starter set plus custom rows", () => {
  // The ceiling was a bare 40 sized for a 22-row list. Growing the list past it
  // would first squeeze out custom rows and then truncate persisted state on
  // read — losing a recorded no, silently.
  const seeded = normalizeNegotiationItems([]);
  assert.ok(seeded.length < MAX_NEGOTIATION_ITEMS, "no headroom left for custom rows");
  assert.ok(MAX_NEGOTIATION_ITEMS - seeded.length >= 20, "too little headroom for custom rows");

  const custom = Array.from({ length: 10 }, (_, i) => ({
    id: `custom-${i}`,
    label: `Custom ${i}`,
    rank: "yes" as const,
  }));
  const merged = normalizeNegotiationItems([...seeded, ...custom]);
  assert.equal(merged.length, seeded.length + 10);
  for (const row of custom) {
    assert.equal(merged.find((item) => item.id === row.id)?.rank, "yes", row.id);
  }
});

test("every new activity family is negotiable as its own row", () => {
  // "Impact" or "sensation" as a single row is close to useless: the categories
  // inside them have almost nothing in common, so one yes would cover a hand
  // and a cane alike.
  const ids = new Set(normalizeNegotiationItems([]).map((item) => item.id));
  for (const id of [
    "spanking",
    "implements",
    "wax",
    "clamps",
    "blindfold",
    "hood",
    "electrical",
    "denial",
    "chastity",
    "degradation",
    "roleplay",
    "objectify",
    "anal",
    "cnc",
    "discipline",
    "substances",
  ]) {
    assert.ok(ids.has(id), `no negotiable row for ${id}`);
  }
});

test("the new articles carry honest evidence status", () => {
  for (const article of BDSM_ARTICLES) {
    const evidence = getArticleEvidence(article.slug);
    // Anchored or not, an entry must not silently claim more than it has.
    assert.equal(
      evidence.status === "source_anchored",
      evidence.sourceIds.length > 0,
      article.slug,
    );
    assert.ok(article.blocks.length >= 2, `${article.slug} is too thin to be useful`);
    assert.ok(article.summary.length > 30, article.slug);
  }
  // The technique-adjacent families must not imply a citation endorses a method.
  for (const slug of ["impact-risk-families", "temperature-play", "electrical-play"]) {
    const article = ARTICLES.find((a) => a.slug === slug);
    assert.ok(article, slug);
    const text = JSON.stringify(article);
    assert.match(text, /(?:does not teach|not a technique|in-person|qualified)/i, slug);
  }
});

test("the activity entries route to instruction rather than teaching a method", () => {
  // Every high-consequence family says where the reader actually goes.
  const families = {
    "electrical-play": /hands-on from someone qualified|not at all/i,
    "edge-play-line": /instructor, a community, and years/i,
    "impact-risk-families": /qualified in-person instructor/i,
    "consensual-non-consent": /how this scene ends early/i,
  };
  for (const [slug, pattern] of Object.entries(families)) {
    const article = ARTICLES.find((a) => a.slug === slug);
    assert.ok(article, slug);
    assert.match(JSON.stringify(article), pattern, slug);
  }
});

test("the neck stays refused in the catalog as well as in the policy", () => {
  const neck = getTie("kubi-nawa");
  assert.ok(neck);
  assert.match(neck.name, /Instructor Route/);
  const text = JSON.stringify(neck);
  assert.match(text, /locks the neck limit to no and will not open it/i);
  // And it must not read as a technique that could be done carefully.
  assert.doesNotMatch(text, /how to|place the rope|wrap the neck/i);
});

test("D/s vocabulary reaches the entry that answers it", () => {
  const routes: Record<string, string> = {
    "top drop": "top-drop",
    "punishment": "discipline-and-punishment",
    "collar": "collars-and-symbols",
    "wax play": "temperature-play",
    "blindfold": "sensory-deprivation",
    "chastity": "chastity-devices",
    "degradation": "humiliation-and-degradation",
    "edging": "orgasm-control",
    "consensual non-consent": "consensual-non-consent",
    "nipple clamps": "clamps-and-constriction",
    "teppou": "teppou",
    "strappado": "strappado",
    "armbinder": "armbinder",
  };
  for (const [query, slug] of Object.entries(routes)) {
    const hits = searchKnowledge(query, 8);
    assert.ok(
      hits.some((hit) => hit.slug === slug),
      `"${query}" did not reach ${slug}; got ${hits.map((h) => h.slug).join(", ") || "nothing"}`,
    );
  }
});

test("a generic vocabulary search still surfaces something the reader can do", () => {
  // As the catalog grew, equal-scoring hits were ordered alphabetically, so a
  // broad query filled its first page with recognition-only categories.
  for (const query of ["縛り", "rope pattern", "practice"]) {
    const hits = searchKnowledge(query, 8);
    if (!hits.some((hit) => hit.kind === "tie")) continue;
    const ties = hits.filter((hit) => hit.kind === "tie");
    const actionable = ties.filter((hit) => !getTie(hit.slug)?.intent.includes("instructor-only"));
    assert.ok(actionable.length > 0, `"${query}" returned only instructor routes`);
  }
});
