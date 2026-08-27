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

  // Guided ties go on a person, and their cards promise "once its negotiated
  // limit is agreed" — so every one of them must map to a limit too. This
  // invariant used to be asserted only for instructor routes, which is how
  // single-column and double-column shipped selectable with every limit at no.
  const ungatedGuided: string[] = [];
  for (const tie of TIES) {
    if (!tie.intent.includes("guided-practice")) continue;
    if (!allNo.isTieBlocked(tie.slug)) ungatedGuided.push(tie.slug);
  }
  assert.deepEqual(
    ungatedGuided,
    [],
    `guided ties open with every limit at no: ${ungatedGuided.join(", ")}`,
  );
  // And approving their limit opens them.
  assert.equal(allYes.isTieBlocked("single-column"), false);
  assert.equal(allYes.isTieBlocked("double-column"), false);
  assert.equal(allYes.isTieBlocked("karada"), false);

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

// ---------------------------------------------------------------------------
// Prop drills teach their own pattern
// ---------------------------------------------------------------------------
//
// These four tests exist because of a defect that every other test in this file
// was blind to. Eleven of the twelve prop drills carried the *same* step —
// byte-for-byte the same 189-character paragraph about "identifying the rope
// path, dressing the pattern, finding both ends". The diamond drill and the
// hexagon drill and the net drill and the ladder drill all rendered it. Each
// page had a distinct title, a distinct summary, a distinct band count, and no
// instruction whatsoever that distinguished it from the other ten.
//
// Nothing caught that, because every assertion here was about *shape* — does the
// tie carry a marker, is its position theory, does its `why` mention a prop —
// and on all of those it passed perfectly. Shape was never the problem. The
// problem was that the pages did not say anything.

const practiceTies = () => TIES.filter((tie) => tie.intent.includes("unoccupied-practice"));

/** The steps a drill authored for itself, minus the two the factory frames it with. */
const authoredSteps = (tie: (typeof TIES)[number]) => tie.steps.slice(1, -1);

test("every prop drill is framed by setup and strip-down, whatever it authored", () => {
  // The two framing steps carry the only sentences on the page that say who is
  // not in the pattern and that it has to come off by being reversed. They are
  // appended by the factory precisely so a drill cannot be published without
  // them, and this asserts the factory is still doing it.
  for (const tie of practiceTies()) {
    const first = tie.steps[0]!;
    const last = tie.steps[tie.steps.length - 1]!;
    assert.match(first.bottom, /Nobody is placed in rope/i, `${tie.slug} lost its setup framing`);
    assert.match(
      JSON.stringify(last),
      /revers|working end/i,
      `${tie.slug} never rehearses taking the pattern off`,
    );
    assert.ok(
      tie.steps.length >= 3,
      `${tie.slug} has ${tie.steps.length} steps, so it authored nothing between the framing`,
    );
  }
});

test("no two prop drills teach with the same words", () => {
  // The regression, stated as the relationship it broke rather than as a count.
  // Two drills sharing an instruction is two drills where at least one of them
  // is not about its own pattern.
  const seen = new Map<string, string>();
  for (const tie of practiceTies()) {
    for (const step of authoredSteps(tie)) {
      for (const [field, text] of [
        ["rigger", step.rigger],
        ["check", step.check],
        ["speak", step.speak],
      ] as const) {
        const key = text.trim();
        const owner = seen.get(key);
        assert.equal(
          owner,
          undefined,
          `${tie.slug} and ${owner} share a ${field}: ${key.slice(0, 90)}…`,
        );
        seen.set(key, tie.slug);
      }
    }
  }
});

test("every prop drill names the pattern it is a drill for", () => {
  // Specificity, checked the only way a test can check it: the drill's own
  // vocabulary has to appear in its own instruction. A page about diamonds that
  // never says "diamond" is a page about nothing, and that is exactly the state
  // all eleven were in.
  const vocabulary: Record<string, RegExp> = {
    hishi: /diamond/i,
    kikkou: /hexagon|six[- ]sided|tortoise/i,
    amime: /net|mesh|lattice|cell/i,
    hashigo: /ladder|rung/i,
    tasuki: /diagonal|cross/i,
    "rope-corset": /lac(?:e|ing)|panel/i,
    "hana-musubi": /petal|flower|ornament/i,
    "sennin-pattern": /repeat|motif|flat/i,
    "rope-dress": /section|working end|join/i,
    "cuff-pattern": /rigid|dowel|bottle|object/i,
    "shime-pattern": /tighten|constrict|clos(?:e|ing)/i,
    "larks-head-cuff": /lark|hitch|cinch/i,
  };

  for (const tie of practiceTies()) {
    const authored = authoredSteps(tie);
    assert.ok(authored.length > 0, `${tie.slug} authored no steps of its own`);

    // Written, not left on the factory's placeholder.
    const placeholder = authored.some((step) => /^Unoccupied handling drill$/.test(step.title));
    assert.equal(placeholder, false, `${tie.slug} is still on the unauthored placeholder step`);

    // And written at a depth someone can actually follow.
    for (const step of authored) {
      assert.ok(step.rigger.length > 250, `${tie.slug}/${step.title}: rigger too thin to follow`);
      assert.ok(step.check.length > 60, `${tie.slug}/${step.title}: check too thin`);
    }

    const pattern = vocabulary[tie.slug];
    if (!pattern) continue;
    assert.match(
      authored.map((step) => `${step.title} ${step.rigger} ${step.check}`).join(" "),
      pattern,
      `${tie.slug} never names what it is teaching`,
    );
  }
});

test("a prop drill never puts a person in the pattern, and never clears anything", () => {
  // Two failure modes, one test, because they are the two ways this content can
  // become dangerous rather than merely useless. The first is a drill drifting
  // into body placement — the whole reason these are prop drills. The second is
  // a check written as permission, which is the failure the guided ties are
  // already tested against and which applies identically here.
  const bodyPlacement = [
    /\b(?:on|around|about) (?:her|his|their|the) (?:wrist|ankle|arm|forearm|leg|calf|thigh|chest|torso|waist|neck|shoulder)\b/i,
    /\bwhen you (?:do|try|tie) this on a (?:person|partner|body)\b/i,
    /\bplace (?:the )?rope on (?:her|him|them)\b/i,
    /\bhave (?:her|him|them) (?:stand|sit|kneel|hold still)\b/i,
  ];
  const clearance =
    /(?:safe to (?:continue|proceed|carry on)|good to go|then it is fine|cleared|means it is safe|you can continue)/i;

  for (const tie of practiceTies()) {
    const prose = tie.steps
      .flatMap((step) => [step.title, step.goal ?? "", step.rigger, step.bottom, step.check, step.speak])
      .concat(tie.mistakes.flatMap((m) => [m.title, m.body]))
      .concat(tie.variations.flatMap((v) => [v.name, v.body]))
      .concat([tie.goal ?? "", tie.why, tie.summary])
      .join("\n");

    for (const pattern of bodyPlacement) {
      assert.doesNotMatch(prose, pattern, `${tie.slug} puts the drill on a person`);
    }
    for (const step of tie.steps) {
      assert.doesNotMatch(step.check, clearance, `${tie.slug}/${step.title} reads as a clearance`);
      assert.doesNotMatch(step.rigger, clearance, `${tie.slug}/${step.title} reads as a clearance`);
    }
  }
});

test("no prop drill ever draws the restraint silhouette", async () => {
  // The figure component derives its body drawing from the step, and one of the
  // inputs is not obviously a body decision: `view: "back"` sets the same `gote`
  // flag as `pose: "gote"` or a `gote` wrap, and that flag swaps the upright
  // figure's arms for a torso with them folded behind it — the box-tie shape.
  //
  // The tasuki drill shipped exactly that. Its page said "Unoccupied Practice",
  // "No person-bearing use in this app" and "Practice on the form only", and
  // drew a bound-arms silhouette beside those words. Nothing failed, because no
  // test connected a rendering flag to the safety claim printed next to it.
  //
  // Checked on the enriched tie, not the catalog one, because the step that was
  // actually rendering came from the Academy table rather than the catalog.
  const { getAcademyTie } = await import("./index.ts");
  const { TIE_ACADEMY } = await import("./academy.ts");

  // Both layers, because only one of them renders at a time and which one wins
  // is decided by step counts. A back-view step parked in the Academy table is
  // invisible while the catalog is longer, and draws the moment it is not.
  for (const tie of practiceTies()) {
    const rendered = getAcademyTie(tie.slug) ?? tie;
    const layers = [...rendered.steps, ...(TIE_ACADEMY[tie.slug]?.steps ?? [])];
    for (const step of layers) {
      assert.notEqual(
        step.expected.view,
        "back",
        `${tie.slug}/${step.title}: back view draws the arms-behind-back figure`,
      );
      assert.notEqual(step.expected.pose, "gote", `${tie.slug}/${step.title}`);
      assert.ok(
        !step.wraps.some((wrap) => wrap.kind === "gote"),
        `${tie.slug}/${step.title}: a prop drill carries a gote wrap`,
      );
    }
  }
});

test("a prop drill declares the knots and the rope its own steps call for", () => {
  // Both halves of this were wrong the moment the drills were written, and
  // neither was visible on the page as an error — only as a page quietly
  // pointing somewhere useless.
  //
  // `knots` drives the "Knots to learn first" links. Every drill still carried
  // whatever it had been given when its only step was the shared placeholder,
  // so the hexagon drill linked a reverse tension and said nothing about the
  // lark's head, the overhand knots on a bight, or the half hitches its
  // sequence is actually built from.
  //
  // `ropes` feeds the planner's length and count arithmetic. Four drills bring
  // in a second or third rope mid-sequence while declaring the single default
  // length, so any plan containing them under-counted the rope needed.
  const NAMED_KNOT = [
    [/lark'?s head/i, "larks-head"],
    [/overhand (?:knot )?on (?:a |the )?bight|overhand loop|overhand stopper|plain overhand/i, "overhand-on-bight"],
    [/two half hitches|double half hitch/i, "double-half-hitch"],
    [/half hitch|half-hitch/i, "half-hitch"],
    [/square knot/i, "square"],
    [/reverse tension/i, "reverse-tension"],
    [/somerville|bowline/i, "somerville-bowline"],
    [/figure of eight|figure-eight/i, "figure-eight"],
  ] as const;

  let checkedKnot = 0;
  let checkedRope = 0;
  for (const tie of practiceTies()) {
    const prose = authoredSteps(tie)
      .map((step) => [step.title, step.goal ?? "", step.rigger, step.check].join(" "))
      .join(" ");

    for (const [pattern, slug] of NAMED_KNOT) {
      if (!pattern.test(prose)) continue;
      checkedKnot++;
      assert.ok(
        tie.knots.includes(slug),
        `${tie.slug} builds with ${slug} but does not list it under knots to learn first`,
      );
    }

    // The reverse does not hold: a drill can use a technique without writing its
    // name — tasuki folds the rope back over itself at every corner, which is a
    // reverse tension whether or not the words appear. So an unnamed declaration
    // is not an error, and this test never asserts one away.

    if (/second rope|fresh rope|another rope/i.test(prose)) {
      checkedRope++;
      const count = tie.ropes.reduce((n, r) => n + r.count, 0);
      assert.ok(
        count >= 2,
        `${tie.slug} brings in another rope mid-sequence but declares ${count}`,
      );
    }
  }

  // Guards the guard. If the detectors stop matching, the loops above pass
  // while proving nothing — which is how the stale metadata survived writing
  // twelve drills in the first place.
  assert.ok(checkedKnot > 0, "no drill named a knot, so the knot half proved nothing");
  assert.ok(checkedRope > 0, "no drill named a second rope, so the rope half proved nothing");
});

test("the strip-down step clears the figure instead of showing the finished pattern", () => {
  // The route draws each step's figure from the cumulative wraps of every step
  // up to it, so a step contributing an empty `wraps` array does not reset the
  // drawing — it adds nothing to it. The step that tells the reader the pattern
  // is off was rendering the completed pattern with a "0 bands" caption under
  // it. Explicit media overrides the cumulative figure with an empty form.
  for (const tie of practiceTies()) {
    const last = tie.steps[tie.steps.length - 1]!;
    const wrapsMedia = last.media?.find((m) => m.kind === "wraps");
    assert.ok(wrapsMedia, `${tie.slug}: strip-down step has no explicit media to clear the figure`);
    assert.equal(
      wrapsMedia.kind === "wraps" ? wrapsMedia.wraps.length : -1,
      0,
      `${tie.slug}: strip-down media still draws rope`,
    );
    assert.equal(last.expected.wrapBands, 0, `${tie.slug}: strip-down still claims bands`);
  }
});

test("knot-foundations agrees with the knot catalog", () => {
  // This article used to teach the square knot as a predictable non-slipping
  // bend, bless the lark's head as the start of every shibari tie, and promise
  // that a correctly tied bowline meant you never had to guess whether a loop
  // was safe. The catalog entries it is introducing all contradict those.
  const article = ARTICLES.find((a) => a.slug === "knot-foundations");
  assert.ok(article);
  const copy = JSON.stringify(article);
  assert.doesNotMatch(copy, /completely predictable and not slip/i);
  assert.doesNotMatch(copy, /every single shibari tie/i);
  assert.doesNotMatch(copy, /never have to guess whether a loop is safe/i);
  assert.match(copy, /binding and decorative knot/i);
  assert.match(copy, /cinches/i);
  assert.match(copy, /not a rapid-release method/i);
});

test("karada lists the knot its steps actually use", () => {
  const karada = getTie("karada");
  assert.ok(karada);
  assert.deepEqual(karada.knots, ["overhand-on-bight"]);
});

test("the formerly skeletal core articles now teach something", () => {
  for (const slug of ["warmup-stretch", "gear-care", "furniture", "time-and-clocks"]) {
    const article = ARTICLES.find((a) => a.slug === slug);
    assert.ok(article, slug);
    const words = JSON.stringify(article.blocks).split(/\s+/).length;
    assert.ok(words > 120, `${slug} is still a single hedged paragraph (${words} words)`);
  }
});
