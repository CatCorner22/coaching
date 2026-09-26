import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ARTICLES,
  articleMinutes,
  DUNGEON,
  DUNGEON_SCENES,
  GEAR,
  KNOTS,
  NERVES,
  SEQUENCES,
  TIES,
  articleExcerpts,
  getAcademyKnot,
  getAcademyTie,
  getKnot,
  getTie,
  getArticleEvidence,
  isKnowledgeQueryUsable,
  knowledgeAnswer,
  knowledgeDisposition,
  searchKnowledge,
} from "./index.ts";
import { SAFETY_SOURCE_IDS, SAFETY_SOURCES, SOURCE_LEDGER_REVISION } from "./sources.ts";
import { isSayableAloud, toBullets } from "../learn/plain-language.ts";
import { buildAcademyVoiceScript, buildAcademyVoiceSegments } from "../learn/voice-script.ts";
import { defaultKnotStepMedia, defaultTieStepMedia, FOUNDATION_DIAGRAM_IDS } from "./media-registry.ts";

test("every knot carries a usable release plan", () => {
  for (const knot of KNOTS) {
    assert.ok(knot.release.untie.length >= 2, `${knot.slug} needs at least two untie actions`);
    assert.ok(knot.release.cut.trim().length > 0, `${knot.slug} needs a cut rule`);
    if (knot.release.context === "body") {
      assert.match(knot.release.cut, /shears/i, `${knot.slug} cut rule must name shears`);
    }
  }
});

test("non-body knot release rules avoid the body cut guidance", () => {
  for (const knot of KNOTS) {
    if (knot.release.context === "body") continue;
    assert.doesNotMatch(knot.release.cut, /cut a wrap/i, `${knot.slug} must not use the body cut rule`);
    if (knot.release.context === "object") {
      assert.match(knot.release.cut, /tension|strain|load/i, `${knot.slug} must name the object hazard`);
    }
  }
});

test("body-applied ties carry the shears stop condition", () => {
  for (const tie of TIES) {
    if (tie.position === "theory") continue;
    assert.ok(tie.stop.some((item) => /shears/i.test(item)), `${tie.slug} needs a shears stop entry`);
  }
});

test("Somerville Bowline keeps its six authored steps and diagrams", () => {
  const somerville = KNOTS.find((knot) => knot.slug === "somerville-bowline");
  assert.ok(somerville);
  assert.equal(somerville.steps.length, 6);
  for (const step of somerville.steps) {
    assert.ok(step.doBullets?.length, "every Somerville step needs do bullets");
    assert.ok(step.checkBullets?.length, "every Somerville step needs check bullets");
  }
  assert.match(somerville.steps[5]?.body ?? "", /slipped/i);
  const academy = getAcademyKnot("somerville-bowline");
  assert.ok(academy);
  for (const [index, step] of somerville.steps.entries()) {
    assert.deepEqual(academy.steps[index]?.doBullets, step.doBullets);
    assert.deepEqual(academy.steps[index]?.checkBullets, step.checkBullets);
  }
  const diagramIds = new Set<string>(FOUNDATION_DIAGRAM_IDS);
  for (let index = 0; index <= 5; index += 1) {
    assert.ok(diagramIds.has(`somerville-bowline-${index}`));
  }
});

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
  assert.deepEqual(SAFETY_SOURCE_IDS, ids);
  assert.equal(SAFETY_SOURCES.find((source) => source.id === "PRIVACY-1")?.title.startsWith("OpenAI"), true);
  assert.equal(SAFETY_SOURCES.find((source) => source.id === "XAI-PRIVACY-1")?.title.startsWith("xAI"), true);
});

test("every article exposes honest evidence status and only canonical source anchors", () => {
  const canonical = new Set(SAFETY_SOURCE_IDS);
  for (const article of ARTICLES) {
    const evidence = getArticleEvidence(article.slug);
    assert.equal(evidence.ledgerRevision, SOURCE_LEDGER_REVISION, article.slug);
    assert.match(evidence.auditedAt, /^\d{4}-\d{2}-\d{2}$/u, article.slug);
    assert.ok(evidence.note.length > 80, article.slug);
    assert.equal(evidence.status === "source_anchored", evidence.sourceIds.length > 0, article.slug);
    for (const sourceId of evidence.sourceIds) {
      assert.ok(canonical.has(sourceId), `${article.slug} has unknown source ${sourceId}`);
    }
  }
  assert.ok(getArticleEvidence("photography-ethics").sourceIds.includes("XAI-PRIVACY-1"));
  assert.ok(getArticleEvidence("emergency-stop").sourceIds.includes("FIRSTAID-1"));
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
    "stopped breathing",
    "isn't breathing",
    "gasping for air",
    "can't catch their breath",
    "struggling to breathe",
    "barely breathing",
    "labored breathing",
    "shallow breathing",
    "short of breath",
    "breathless",
    "struggling for breath",
    "cannot get air",
    "suffocating",
    "gasping",
    "wheezing and cannot speak",
    "cyanotic",
    "her lips are turning blue",
    "turning blue",
    "no pulse",
    "cardiac arrest",
    "heart attack",
    "his heart stopped",
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
    "severe bleeding",
    "major weakness",
    "loss of consciousness",
    "collapsed and won't wake up",
    "can't wake them",
    "cannot awaken them",
    "she does not wake up",
    "not waking up",
    "not conscious",
    "out cold",
    "cannot stay awake",
    "bleeding profusely",
    "bleeding heavily",
    "bleeding won't stop",
    "blood is spurting",
    "hemorrhaging",
    "massive blood loss",
    "he is convulsing",
    "his speech is slurred",
    "drooping face",
    "head injury",
    "she fell and banged her head",
    "fell from suspension",
    "fell from the ceiling",
    "dropped from the rig",
    "they are suddenly confused",
    "very confused",
    "altered mental status",
    "rope around neck and voice changed",
    "rope across throat and raspy voice",
    "ligature around neck and dizzy",
    "neck pressure and cannot speak",
    "serious fall",
    "severe confusion",
    "neck pressure followed by concerning symptoms",
    "she is choking",
    "cut the ropes now",
    "cut them free now",
    "emergency release immediately",
    "息が苦しい",
    "意識不明です",
    "血が止まらない",
    "今すぐ縄を切って",
    "喘不上气",
    "怎么叫也叫不醒",
    "血流不止",
    "马上把绳子剪断",
    "숨을 쉴 수 없어요",
    "깨워도 안 일어나요",
    "피가 멈추지 않아요",
    "지금 당장 밧줄을 잘라",
    "出血がひどい",
    "中风",
    "喉が締まっている",
    "호흡곤란",
    "blue face",
    "knocked out",
    "blood won't stop",
    "slurring words",
    "one side weak",
    "no heartbeat",
    "gray lips",
    "skin is turning grey",
    "ashen lips",
    "spurting blood",
    "blood is gushing",
    "bleeding out",
    "left arm suddenly weak",
    "weak on the left side",
    "words are slurred",
    "can't stay conscious",
    "not awake",
    "stopped responding",
    "no breathing",
    "no heart beat",
  ]) {
    const hits = searchKnowledge(query, 4);
    assert.equal(hits[0]?.slug, "emergency-stop", query);
    assert.ok(hits.slice(0, 3).some((hit) => hit.slug === "shears"), query);
    assert.equal(knowledgeDisposition(query).kind, "emergency", query);
    assert.match(knowledgeAnswer(query), /^Emergency: stop the activity\./u, query);
    assert.match(knowledgeAnswer(query), /Call local emergency services now/u, query);
  }
});

test("action-first routing covers release, delayed neck symptoms, consent, and media scope", () => {
  for (const query of [
    "numb fingers",
    "faintness",
    "cannot feel my fingers",
    "fingers will not move",
    "arm is purple",
    "pain is getting worse",
    "rope cut off circulation",
    "指の感覚がない",
    "手没有知觉",
    "손에 감각이 없어요",
    "pins and needles",
    "loss of sensation in hand",
    "no sensation in hand",
    "hand asleep",
    "can't grip",
    "limb is cool",
    "hand is white",
    "toes black",
    "excruciating pain",
    "pain increased",
    "edema",
    "puffy hand",
    "reduced movement",
    "can't wiggle toes",
    "purple fingertip",
    "tingly fingers",
    "can't move my fingers",
    "cannot move their hand",
    "loss of grip",
    "weak grip",
    "hand went cold",
    "hand feels cold",
    "hand became pale",
    "fingers look purple",
    "discolored hand",
    "discoloured hand",
    "sharp worsening pain",
    "increasing pain",
    "dropping things",
    "foot drop",
    "hand feels dead",
  ]) {
    assert.equal(knowledgeDisposition(query).kind, "release_now", query);
    assert.match(knowledgeAnswer(query), /^Stop and release now/u, query);
  }
  for (const query of [
    "strangled yesterday",
    "was throttled",
    "neck was squeezed",
    "hand around throat",
    "pressure on throat",
    "rope around my throat",
    "breath play last night",
    "manual strangulation",
    "garroted yesterday",
    "strangulation no visible marks",
    "chokehold yesterday",
    "squeezed my neck",
    "grabbed my throat",
    "compressed my neck",
    "neck constriction",
    "pressure to my neck",
    "noose around neck",
    "rope touching throat",
    "line over my neck",
    "breathplay last night",
    "erotic asphyxiation yesterday",
    "asphyxiated yesterday",
    "strangulated yesterday",
  ]) {
    assert.equal(knowledgeDisposition(query).kind, "prompt_medical", query);
    assert.match(knowledgeAnswer(query), /^Possible neck-pressure exposure/u, query);
  }
  assert.equal(
    knowledgeDisposition("trouble swallowing after breath play").kind,
    "emergency",
  );
  for (const query of [
    "withdraw consent",
    "I don't consent",
    "I do not consent",
    "there is no consent",
    "stop recording me",
    "recorded without permission",
    "uploaded without permission",
    "the recording was secret",
    "the camera is hidden",
    "delete my photo",
    "I was forced to pose for a photo",
    "stop, I changed my mind",
    "they told me to stop",
    "やめてと言われた",
    "对方说停下",
    "상대가 그만하라고 했어요",
    "隠し撮り",
    "盗撮",
    "未经同意拍摄",
    "몰래 촬영",
    "surreptitious video",
    "nonconsensual photo",
    "unconsented recording",
    "took a picture while asleep",
    "didn't ask before filming",
    "no permission to upload",
    "they said no to the camera",
    "filmed without consent",
    "shared without consent",
    "uploaded without consent",
    "didn't agree to recording",
    "said stop filming",
    "stop taking pictures of me",
    "spycam video",
    "shared against their wishes",
    "revoke upload permission",
    "permission to upload was withdrawn",
    "recorded while sleeping",
    "revenge porn upload",
    "stolen intimate photo",
  ]) {
    assert.equal(knowledgeDisposition(query).kind, "consent_withdrawn", query);
    assert.match(knowledgeAnswer(query), /^Consent is absent or withdrawn/u, query);
  }
  for (const query of [
    "minor",
    "underage",
    "under 18",
    "ambiguous age",
    "nude",
    "explicit image",
    "topless photo",
    "NSFW video",
    "genitals visible in photo",
    "bare breasts image",
    "sex act video",
    "intimate image",
    "undressed model",
    "age unknown photo",
    "young-looking person photo",
    "not sure if adult",
    "17 year old photo",
    "sixteen year old image",
    "high school student photo",
    "15yo photo",
    "15 y/o image",
    "not eighteen photo",
    "below legal age image",
    "kid in photo",
    "schoolgirl photo",
    "juvenile video",
    "17 yrs old photo",
    "17yo image",
    "aged seventeen photo",
    "age is unclear photo",
    "can't confirm adult",
    "middle school student photo",
    "unknown-aged model",
    "childlike model image",
    "bare chest photo",
    "genital photo",
    "vulva image",
    "penis image",
    "sexual intercourse video",
    "sex scene recording",
    "hardcore clip",
    "adult content photo",
    "lewd photo",
    "17 y.o. image",
    "17 y o video",
    "age: 17 photo",
    "below 18 image",
    "under legal age photo",
    "preteen photo",
    "adolescent image",
    "schoolchild photo",
    "not of age video",
    "looks young in the picture",
    "age not verified photo",
    "age unconfirmed photo",
    "cannot verify adult in photo",
    "don't know their age in the image",
    "ID not checked for photo",
    "no clothes photo",
    "unclothed photo",
    "full frontal picture",
    "breasts visible in photo",
    "nipples visible in image",
    "private parts visible in picture",
    "graphic sex photo",
    "XXX clip",
    "nudes upload",
    "nakedness in recording",
    "未成年の写真",
    "17歳の写真",
    "露出写真",
    "裸の写真",
    "ヌード写真",
    "未成年照片",
    "17岁照片",
    "裸体照片",
    "成人视频",
    "미성년자 사진",
    "17살 사진",
    "나체 사진",
    "성인물 영상",
  ]) {
    assert.equal(knowledgeDisposition(query).kind, "unsupported_media", query);
    assert.equal(searchKnowledge(query, 1)[0]?.slug, "photography-ethics", query);
    assert.match(knowledgeAnswer(query), /^Outside upload scope:/u, query);
    assert.match(knowledgeAnswer(query), /the app cannot detect any of this for you/u, query);
  }
  for (const [query, secondaryAction] of [
    ["nude photo and my fingers are numb", /Do not send this batch to analysis/u],
    ["explicit image arm is blue", /Do not send this batch to analysis/u],
    ["underage person has severe pain", /Do not send this batch to analysis/u],
    ["stop recording me, my hand is cold and pale", /Consent is absent or withdrawn/u],
  ] as const) {
    assert.equal(knowledgeDisposition(query).kind, "release_now", query);
    assert.match(knowledgeAnswer(query), /^Stop and release now/u, query);
    assert.match(knowledgeAnswer(query), secondaryAction, query);
  }
});

test("action-first queries suppress procedural catalog navigation", () => {
  for (const query of [
    "seizure hogtie",
    "choking single column",
    "withdraw consent takate kote",
    "nude somerville bowline",
  ]) {
    const hits = searchKnowledge(query, 12);
    assert.ok(hits.length > 0, query);
    assert.ok(hits.every((hit) => hit.kind === "article" || hit.kind === "gear"), query);
    assert.doesNotMatch(knowledgeAnswer(query), /Takate|Hogtie|Single Column|Somerville/iu, query);
  }
});

test("action routing avoids adjacent non-emergency wording", () => {
  for (const query of [
    "breathing exercise",
    "blue rope care",
    "purple rope comparison",
    "the rope is turning blue",
    "speech practice",
    "fall prevention",
    "recording permission settings",
    "stop recording timer",
    "consent frameworks",
    "clothed non-explicit adult photo",
    "18 year old adult photo",
    "adult age confirmed photo",
    "camera permission settings",
    "17mm rope",
    "how to prevent secret recording",
    "chokehold terminology",
    "loss of grip on rope tool",
    "nude-pink cord",
    "nude tone rope",
    "成人の写真",
    "服を着た写真",
    "カメラの許可設定",
    "成年人的穿衣照片",
    "摄像头权限设置",
    "성인의 옷 입은 사진",
    "카메라 권한 설정",
  ]) {
    assert.equal(knowledgeDisposition(query).kind, "ordinary", query);
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

test("curated answers are deterministic and available without a server or AI", () => {
  const answer = knowledgeAnswer("coercion");
  assert.match(answer, /Consent Frameworks/);
  assert.match(answer, /does not validate a setup/);
  assert.equal(answer, knowledgeAnswer("coercion"));
  assert.match(knowledgeAnswer("zzzzqvvvv"), /No curated local entry matched/);
});

test("expansion safety articles are discoverable through natural wording", () => {
  assert.ok(
    searchKnowledge("positional asphyxia", 8).some((hit) => hit.slug === "positional-asphyxia"),
  );
  assert.ok(
    searchKnowledge("prone position restricted breathing", 8).some(
      (hit) => hit.slug === "positional-asphyxia",
    ),
  );
  assert.ok(
    searchKnowledge("ball gag stuffy nose", 8).some((hit) => hit.slug === "gag-signal-safety"),
  );
  assert.ok(
    searchKnowledge("self bondage alone", 8).some((hit) => hit.slug === "solo-self-tying"),
  );
  assert.ok(
    searchKnowledge("blood thinner disclosure", 8).some((hit) => hit.slug === "medical-disclosure"),
  );
  assert.ok(
    searchKnowledge("frayed rope retire", 8).some(
      (hit) => hit.slug === "rope-inspection-retirement",
    ),
  );
  assert.ok(
    searchKnowledge("debrief what happened injury", 8).some(
      (hit) => hit.slug === "incident-response",
    ),
  );
  assert.ok(searchKnowledge("padded cuffs", 8).some((hit) => hit.slug === "cuffs"));
  assert.ok(searchKnowledge("collar leash", 8).some((hit) => hit.slug === "collar"));
});

test("expansion safety articles carry source anchors and honest notes", () => {
  for (const slug of [
    "positional-asphyxia",
    "gag-signal-safety",
    "nerve-self-checks",
    "circulation-vs-nerve",
    "fainting-response",
    "cuff-and-collar-fit",
    "solo-self-tying",
    "medical-disclosure",
    "rope-inspection-retirement",
    "incident-response",
  ]) {
    const evidence = getArticleEvidence(slug);
    assert.equal(evidence.status, "source_anchored", slug);
    assert.ok(evidence.sourceIds.length > 0, slug);
  }
  assert.ok(getArticleEvidence("positional-asphyxia").sourceIds.includes("ASPHYX-1"));
  assert.ok(getArticleEvidence("fainting-response").sourceIds.includes("SYNCOPE-1"));
  assert.ok(getArticleEvidence("medical-disclosure").sourceIds.includes("CONSENT-3"));
});

test("emergency routing still leads with action-first guidance beside expansion entries", () => {
  const hits = searchKnowledge("not breathing", 6);
  assert.equal(hits[0]?.slug, "emergency-stop");
  assert.ok(hits.slice(0, 3).some((hit) => hit.slug === "shears"));
  for (const hit of hits) {
    assert.ok(
      [
        "emergency-stop",
        "hard-limits",
        "positional-asphyxia",
        "fainting-response",
        "shears",
      ].includes(hit.slug),
      `unexpected emergency result ${hit.slug}`,
    );
  }
  const release = searchKnowledge("fingers are numb", 8);
  for (const hit of release) {
    assert.ok(
      [
        "circulation",
        "nerve-atlas",
        "nerve-self-checks",
        "circulation-vs-nerve",
        "incident-response",
        "emergency-stop",
        "shears",
      ].includes(hit.slug),
      `unexpected release result ${hit.slug}`,
    );
  }
});

test("hanging, cyanosis, and pre-syncope phrasings route action-first, not to tie material", () => {
  for (const query of [
    "found them hanging by the neck",
    "he hanged himself",
    "self-hanging",
    "hung herself from the rig",
  ]) {
    const kind = knowledgeDisposition(query).kind;
    assert.notEqual(kind, "ordinary", query);
    const hits = searchKnowledge(query, 4);
    assert.equal(hits[0]?.slug, "emergency-stop", query);
    assert.ok(
      !hits.some((hit) => ["single-column", "takate-kote", "karada"].includes(hit.slug)),
      `${query} surfaced tie material`,
    );
  }

  for (const query of ["lips are turning purple", "her lips look dusky", "his face is purple"]) {
    assert.equal(knowledgeDisposition(query).kind, "emergency", query);
    assert.equal(searchKnowledge(query, 3)[0]?.slug, "emergency-stop", query);
  }

  for (const query of ["I feel faint", "feeling faint", "feels woozy", "feel lightheaded"]) {
    assert.equal(knowledgeDisposition(query).kind, "release_now", query);
  }
});

test("craft phrasings with 'hang' are not misrouted as emergencies", () => {
  for (const query of ["hang the rope to dry", "hang out after the scene", "how to hang rope for storage"]) {
    assert.equal(knowledgeDisposition(query).kind, "ordinary", query);
  }
});

test("equipment age is not misclassified as ambiguous-age media, but a person's age still blocks", () => {
  for (const query of [
    "my rope is 5 years old should I retire it",
    "this hemp is 3 years old",
    "16 year old jute",
    "a 10 year old harness",
    "my kit is 7 years old",
  ]) {
    assert.equal(knowledgeDisposition(query).kind, "ordinary", query);
  }
  for (const query of [
    "photo of a 15 year old",
    "she is 15 years old",
    "15 years old",
    "a 12 year old model",
    "underage",
    "the person looks young in the photo",
  ]) {
    assert.equal(knowledgeDisposition(query).kind, "unsupported_media", query);
  }
});

test("wrist drop, aspiration-behind-gag, and next-day symptoms route with the right family", () => {
  for (const query of ["wrist drop", "her hand won't lift at the wrist", "can't extend my wrist"]) {
    assert.equal(knowledgeDisposition(query).kind, "release_now", query);
  }
  for (const query of [
    "she's gagged and vomiting",
    "vomiting behind the gag",
    "he's choking on vomit",
    "aspirating",
    "gagged and throwing up",
  ]) {
    assert.equal(knowledgeDisposition(query).kind, "emergency", query);
    assert.equal(searchKnowledge(query, 3)[0]?.slug, "emergency-stop", query);
  }
  // Craft/after-the-fact phrasings must not trip the emergency families.
  for (const query of ["gag types overview", "cleaning up after vomiting the next day", "wrist wrap tutorial"]) {
    assert.equal(knowledgeDisposition(query).kind, "ordinary", query);
  }
  // The incident-response article is admitted beside release guidance.
  assert.ok(
    searchKnowledge("still numb next day weak hand", 6).some((hit) => hit.slug === "incident-response"),
  );
});

test("the equipment-age exemption cannot smuggle a person's age past the block", () => {
  // Regression corpus. An earlier, looser guard treated any query with a rope
  // word near an age as an equipment question, which let real child-safety
  // reports route as ordinary. The exemption now requires that the equipment
  // noun governs the age AND that no person is referenced at all.
  for (const query of [
    "photo of a 15 year old",
    "she is 16 years old",
    "he is 17 years old",
    "15 years old",
    "a 12 year old model",
    "underage",
    "the person looks young in the photo",
    "she is 16 years old and we used rope",
    "my rope partner is 16 years old",
    "16 year old girlfriend rope photo",
    "rope for my 14 year old",
    "my kit and a 15 year old",
    "the model is 16 years old rope harness",
    "tying a 15 year old",
    "my 16 year old cousin",
    "can I tie a 17 year old with jute",
    "17 year old sub",
    "rope harness on a 16 year old girl",
    "my daughter is 15 years old",
    "bought rope for a 15 year old",
    "her age is 16 and we have rope",
    "the bottom is 17 years old",
  ]) {
    assert.equal(knowledgeDisposition(query).kind, "unsupported_media", query);
  }

  for (const query of [
    "my rope is 5 years old should I retire it",
    "this hemp is 3 years old",
    "16 year old jute",
    "a 10 year old harness",
    "my kit is 7 years old",
    "these ropes are 12 years old",
    "my jute is about 4 years old",
    "the webbing is 9 years old",
    "carabiner is 6 years old",
    "5 year old cotton rope",
    "my shears are 8 years old",
  ]) {
    assert.equal(knowledgeDisposition(query).kind, "ordinary", query);
  }
});


test("adversarial routing corpus: inflections, progressives, CJK, and craft controls", () => {
  // Corpus from an adversarial swarm pass over this session's routing changes.
  // Each string below was a real misroute before the fix.
  const urgent = new Set(["emergency", "prompt_medical", "release_now"]);
  for (const query of [
    // 1 hung
    "she is hung by the neck","found her hung by the neck","he was hung from the rig by his neck",
    "found them hanging by the neck","he hanged himself","self-hanging",
    // CJK hanging
    "首を吊っています","彼が首を吊った","首吊り","他上吊了","吊死","목을 맸어요",
    // 3 cyanosis progressive
    "his face is going blue","her lips are going blue","his lips are going purple",
    "face is going dusky","lips are looking blue","face is looking dusky","lips were going blue",
    "lips are turning purple","her lips look dusky",
    "唇が紫色","嘴唇发紫","입술이 보라색",
    // 4/7 vomiting incident
    "she is gagged and vomiting","she throws up with the gag in","she vomits with the gag on",
    "he is retching with the gag in","she is heaving behind the gag","gagged and throwing up",
    "aspirating","he's choking on vomit",
    "猿ぐつわをしたまま嘔吐している","戴着口塞呕吐","재갈 물린 채 구토",
    // 5 wrist
    "i can't straighten my wrist","i cant straighten my wrist","my wrist wont lift",
    "her wrist cant extend","wrist drop","her hand won't lift at the wrist",
    "手首が上がらない",
    // 8 pre-syncope
    "she felt faint","i felt dizzy after the suspension","she got dizzy","i am dizzy",
    "she is very dizzy","i feel like i'm going to faint","i feel faint","feeling faint",
    "めまい","头晕","어지러워요",
  ]) {
    assert.ok(urgent.has(knowledgeDisposition(query).kind), `should be urgent: ${query}`);
  }
  for (const query of [
    // 2 suspension craft must NOT be emergency
    "how long can someone stay hanging from the rope in a suspension",
    "hanging from the rope upside down inversion tips",
    "she is hanging from the rig comfortably",
    "how much weight when hanging from the rope",
    "hang the rope to dry","hang out after the scene","how to hang rope for storage",
    // 4 gag education must NOT be emergency
    "does a ball gag increase the risk of vomiting","how to clean a gag after vomit",
    "gag safety and vomiting risk",
    // 9 equipment age with possessive
    "her rope is 5 years old","my rope is 5 years old should I retire it",
    "16 year old jute","my kit is 7 years old",
    // controls
    "rope care","aftercare","wrist wrap tutorial",
  ]) {
    assert.equal(knowledgeDisposition(query).kind, "ordinary", query);
  }
});

test("panic phrasings route away from an ordinary reading list", () => {
  const urgent = new Set(["emergency", "prompt_medical", "release_now", "consent_withdrawn"]);
  for (const query of [
    // Contractions split by a phone keyboard.
    "she can t breathe",
    "she isn t breathing",
    // The verb misspelt as the noun, which is the commonest way it is typed.
    "cant breath",
    "she cant breath",
    // Apostrophe-less "wont", and the collapse reported as going limp.
    "she wont wake up",
    "she went limp",
    "limp and unresponsive",
    // Colour reported of the person rather than a named body part.
    "shes turning purple",
    "she is dusky",
    "he is going grey",
    // Chest symptoms as anyone actually types them.
    "she says her chest hurts",
    "pain in her chest",
    "her chest feels tight",
    // A rope reaching the neck through motion, and a noose that changed state.
    "the rope slipped onto her throat",
    "rope pulled against her neck",
    "noose tightened",
    "the noose slipped and wont loosen",
    // Dense numbness reported as a dead limb.
    "her arm is dead",
    "my hand went dead",
    "dead arm after the tie",
    // Safeword use. The knowledge base teaches red, so a report of it must act.
    "she said red",
    "she safeworded",
    "she used her safeword",
    "she said stop stop stop",
    "she is crying and wants out",
    "she asked me to untie her",
    "she withdrew consent",
    "she took back consent",
    // A bare cry for help.
    "help",
    "help???",
    "HELP!!!",
    "sos",
  ]) {
    assert.ok(urgent.has(knowledgeDisposition(query).kind), `should be urgent: ${query}`);
  }
});

test("study phrasings and glossary lookups do not raise a false alarm", () => {
  for (const query of [
    // A lookup names nobody and reports nothing.
    "reading about positional asphyxia",
    "article about fainting",
    "what is non fatal strangulation",
    "definition of cyanosis",
    "tell me about breath play",
    // The safeword glossary entry, as opposed to a report that one was used.
    "what is a safeword",
    "safeword ideas",
    "how do safewords work",
    // Named colours that belong to equipment, not a person.
    "red rope",
    "she said red rope looks better",
    "the rope is turning grey with age",
    // Tying a noose is craft vocabulary until its state changes.
    "how to tie a noose knot",
    // Chest harnesses are ordinary rope vocabulary.
    "chest harness pressure points",
    "chest rope tutorial",
  ]) {
    assert.equal(knowledgeDisposition(query).kind, "ordinary", query);
  }
});

test("a live report still routes even when phrased as a question", () => {
  // The study guard must never swallow a report that happens to open with a
  // question word.
  for (const query of [
    "what is happening she cant breathe",
    "what is wrong she passed out",
    "what do i do my wife is unresponsive",
    "explain why she went limp",
  ]) {
    assert.notEqual(knowledgeDisposition(query).kind, "ordinary", query);
  }
});

test("the knowledge base covers the top being incapacitated mid-scene", () => {
  // Every emergency instruction in this app is addressed to the person who can
  // act, and solo-self-tying names that assumption out loud — "someone present
  // and able". Nothing covered the partnered case where that person IS the
  // emergency, which for a two-person household practising alone is the one
  // scenario with no in-the-moment answer.
  const article = ARTICLES.find((entry) => entry.slug === "top-incapacitated");
  assert.ok(article, "no article covers the top going down mid-scene");
  const text = JSON.stringify(article);
  // The mitigation is a scoping decision made before the tie, not a technique.
  assert.match(text, /rehears/i);
  assert.match(text, /emergency services/i);
  // It must not promise the scenario can be made safe after the fact.
  assert.match(text, /cannot make the scenario survivable/i);

  // A live report of it is an emergency; planning for it is ordinary reading.
  for (const query of [
    "top passed out while i am tied",
    "rigger collapsed",
    "my partner is unresponsive and im still tied",
  ]) {
    assert.equal(knowledgeDisposition(query).kind, "emergency", query);
  }
  for (const query of ["what if the top faints", "stuck tied nobody to release me"]) {
    assert.equal(knowledgeDisposition(query).kind, "ordinary", query);
    assert.equal(
      searchKnowledge(query, 3)[0]?.slug,
      "top-incapacitated",
      `${query} did not surface the article`,
    );
  }
});

test("academy foundation bundles resolve enriched content", async () => {
  const {
    FOUNDATION_KNOT_SLUGS,
    FOUNDATION_TIE_SLUGS,
    getAcademyKnot,
    getAcademyTie,
    isFoundationKnot,
    isFoundationTie,
  } = await import("./academy.ts");
  const { tieShape } = await import("./tie-factories.ts");

  for (const slug of FOUNDATION_KNOT_SLUGS) {
    assert.ok(isFoundationKnot(slug), slug);
    const knot = getAcademyKnot(slug);
    assert.ok(knot?.goal, `${slug} missing goal`);
    assert.ok(knot.steps.every((s) => s.do && s.check && s.diagramId), `${slug} missing step enrichment`);
    assert.ok(
      knot.steps.every((s) => (s.doBullets?.length ?? 0) >= 1),
      `${slug} missing easy-read bullet steps`,
    );
  }

  for (const slug of FOUNDATION_TIE_SLUGS) {
    assert.ok(isFoundationTie(slug), slug);
    const tie = getAcademyTie(slug);
    assert.ok(tie?.goal, `${slug} missing goal`);
    assert.ok(tie.steps.length >= 1, `${slug} missing steps`);
    if (tieShape(tie) !== "instructor") {
      assert.ok(tie.steps.every((s) => s.goal && s.check), `${slug} missing academy step fields`);
      assert.ok(
        tie.steps.every((s) => (s.riggerBullets?.length ?? 0) >= 1),
        `${slug} missing easy-read bullet steps`,
      );
    }
  }

  // Enrichment must never DISCARD catalog content. This asserted a literal 4,
  // which was the count TIE_ACADEMY supplied back when single-column had one
  // catalog step. The catalog now teaches it in ten, and a wholesale replace
  // silently rendered four — dropping, among others, rehearsing the release and
  // the next-morning symptom check. The invariant is the relationship, not the
  // number.
  const { getTie } = await import("./ties.ts");
  for (const slug of FOUNDATION_TIE_SLUGS) {
    const base = getTie(slug);
    const enriched = getAcademyTie(slug);
    assert.ok(base && enriched, slug);
    assert.ok(
      enriched.steps.length >= base.steps.length,
      `${slug}: enrichment dropped ${base.steps.length - enriched.steps.length} catalog step(s)`,
    );
  }
  const single = getAcademyTie("single-column");
  assert.equal(single?.steps.length, getTie("single-column")?.steps.length);
  assert.ok((single?.steps.length ?? 0) >= 4, "single-column lost its academy floor");

  const instructor = getAcademyTie("takate-kote");
  assert.ok(instructor && instructor.minutes[1] === 0);
});

test("academy enrichment never contradicts the catalog it enriches", async () => {
  const { FOUNDATION_KNOT_SLUGS, FOUNDATION_TIE_SLUGS, getAcademyKnot, getAcademyTie } =
    await import("./academy.ts");
  const { tieShape } = await import("./tie-factories.ts");

  // The knot catalog was hardened to stop presenting appearance as validation:
  // the square knot's own watch line now says "visual flatness does not
  // establish security, compatibility, or load capacity". The Academy's
  // easy-read patch supplies `do` and `check` for every foundation step, so it
  // can restore that claim on the very page that disclaims it — which is what
  // it did ("It is a square knot, not a granny. Both sides lie flat.") while
  // the stop strip underneath said the opposite. Enrichment may simplify the
  // wording; it may not re-assert what the entry denies.
  const APPEARANCE_AS_PROOF = /not a granny|granny knot|\blie flat\b|looks flat and|flat and (?:even|neat)/i;
  for (const slug of FOUNDATION_KNOT_SLUGS) {
    const base = getKnot(slug);
    const enriched = getAcademyKnot(slug);
    assert.ok(base && enriched, slug);
    assert.equal(
      enriched.steps.length,
      base.steps.length,
      `${slug}: enrichment changed the catalog step count`,
    );
    const scanned = [
      enriched.goal ?? "",
      ...enriched.steps.flatMap((s) => [s.check ?? "", ...(s.checkBullets ?? [])]),
    ].join(" ");
    assert.doesNotMatch(
      scanned,
      APPEARANCE_AS_PROOF,
      `${slug}: an enriched check treats appearance as proof the knot is right, which ${slug}'s own watch denies`,
    );
  }

  // The goal line captions the steps directly beneath it, so it has to come
  // from whatever authored those steps. TIE_ACADEMY's goals were written for
  // one-step prop drills and kept overriding the page long after the catalog
  // rewrote these ties to go on a person — "Practice a wrap on a post" sat
  // above ten steps that pick a spot on the forearm and check again the next
  // morning. For a tie taught in full, the catalog owns the goal.
  for (const slug of FOUNDATION_TIE_SLUGS) {
    const base = getTie(slug);
    const enriched = getAcademyTie(slug);
    assert.ok(base && enriched, slug);
    if (tieShape(base) !== "guided") continue;
    assert.ok(base.goal, `${slug}: a guided tie must author its own goal beside its steps`);
    assert.equal(
      enriched.goal,
      base.goal,
      `${slug}: the academy goal is overriding the goal authored with these steps`,
    );
  }

  // Same rule, applied to every guided tie in the catalog rather than only the
  // ones the Academy happens to list — double-column is guided and is not on
  // that list.
  for (const tie of TIES.filter((t) => tieShape(t) === "guided")) {
    assert.ok(tie.goal, `${tie.slug}: guided tie has no goal`);
    assert.doesNotMatch(
      tie.goal,
      /dress form|on a post|empty form/i,
      `${tie.slug}: its goal describes a prop drill, but its steps go on a person`,
    );
  }
});

test("instructor academy routes preserve catalog steps", async () => {
  const { getAcademyTie } = await import("./academy.ts");
  const { tieShape } = await import("./tie-factories.ts");
  for (const tie of TIES.filter((item) => tieShape(item) === "instructor")) {
    const academy = getAcademyTie(tie.slug);
    assert.ok(academy, tie.slug);
    assert.deepEqual(academy.steps, tie.steps, `${tie.slug} academy steps replaced catalog steps`);
    assert.ok(
      academy.steps.every((step) => step.wraps.length === 0),
      `${tie.slug} instructor route contains drawable wraps`,
    );
  }
});

test("article reading time is derived from rendered blocks", () => {
  const article = (words: number) => ({
    blocks: [{ type: "p" as const, text: Array.from({ length: words }, () => "word").join(" ") }],
  });
  assert.equal(articleMinutes(article(49)), 1);
  assert.equal(articleMinutes(article(650)), 4);
});

test("search aliases and beginner intent surface the shared routes", () => {
  assert.equal(searchKnowledge("hog tie", 1)[0]?.slug, "hogtie-floor");
  assert.ok(searchKnowledge("crotch rope", 8).some((hit) => hit.slug === "matanawa"));
  assert.ok(searchKnowledge("medical scissors", 8).some((hit) => hit.slug === "shears"));
  assert.equal(searchKnowledge("rope calculator", 1)[0]?.kind, "tool");
  const beginnerHits = searchKnowledge("where do I start", 3).map((hit) => hit.slug);
  assert.ok(beginnerHits.includes("somerville-bowline"));
  assert.ok(beginnerHits.includes("first-ten-sessions"));
  assert.ok(beginnerHits.includes("learn"));
});

test("plain-language bullets preserve semicolons and merge short fragments", () => {
  assert.deepEqual(toBullets("First action; keep the rope clear. Then check. Now."), [
    "First action; keep the rope clear.",
    "Then check. Now.",
  ]);
});

test("the step acknowledgement is required by every tie taught in full", async () => {
  const {
    FOUNDATION_TIE_SLUGS,
    FOUNDATION_INSTRUCTOR_TIE_SLUGS,
    FOUNDATION_PRACTICE_TIE_SLUGS,
    requiresStepConfirmation,
  } = await import("./academy.ts");
  const { tieShape } = await import("./tie-factories.ts");

  // /tie/$slug reads this to decide whether Do and Check must be ticked before
  // Next unlocks. Keying that on FOUNDATION_TIE_SLUGS meant double-column —
  // promoted from a one-step prop drill to a seven-step lesson that goes on a
  // person, and never added to the list — rendered "rehearse getting it off",
  // the cinch step, and the twenty-four hour check with no acknowledgement at
  // all, while single-column and karada required one for the same words.
  for (const tie of TIES.filter((t) => tieShape(t) === "guided")) {
    assert.ok(
      requiresStepConfirmation(tie),
      `${tie.slug}: a tie taught in full must gate its steps behind the acknowledgement`,
    );
  }
  for (const slug of FOUNDATION_TIE_SLUGS) {
    const tie = getTie(slug);
    assert.ok(tie && requiresStepConfirmation(tie), `${slug}: Academy lessons keep their gate`);
  }

  // The shape lists are derived from the catalog, so they cannot drift from it:
  // every foundation tie is in exactly one bucket.
  const guided = FOUNDATION_TIE_SLUGS.filter((slug) => tieShape(getTie(slug)!) === "guided");
  assert.deepEqual(
    [...guided, ...FOUNDATION_PRACTICE_TIE_SLUGS, ...FOUNDATION_INSTRUCTOR_TIE_SLUGS].sort(),
    [...FOUNDATION_TIE_SLUGS].sort(),
    "a foundation tie is missing from the shape buckets or counted twice",
  );
});

test("knot enrichment fills gaps and never overrides what a step authored", async () => {
  // `KnotStep` lets a catalog author write `do`, `check`, `doBullets` and
  // `checkBullets`. `enrichKnotStep` used to read none of them: for any knot
  // without an enrichment patch it substituted `step.body` for `do`, the knot's
  // generic `watch` line for `check`, and nothing at all for either bullet list.
  //
  // So authored content could be committed, pass every test, and never reach the
  // page. The reverse tension — cited by nine ties — was rewritten with four
  // distinct checks and twelve bullets, and rendered the same generic warning on
  // every step with no bullets. The commit claimed the work; the app showed the
  // old text.
  //
  // Asserted as the precedence relationship rather than against one knot, so it
  // holds for every knot that ever authors these fields.
  const { KNOTS, getAcademyKnot } = await import("./index.ts");

  let authoredSomewhere = 0;
  for (const knot of KNOTS) {
    const enriched = getAcademyKnot(knot.slug);
    assert.ok(enriched, `${knot.slug} did not enrich`);
    assert.equal(
      enriched.steps.length,
      knot.steps.length,
      `${knot.slug}: enrichment changed the step count`,
    );

    knot.steps.forEach((base, i) => {
      const out = enriched.steps[i]!;
      if (base.check) {
        authoredSomewhere++;
        assert.equal(out.check, base.check, `${knot.slug}/${i}: authored check was replaced`);
      }
      if (base.do) {
        assert.equal(out.do, base.do, `${knot.slug}/${i}: authored do was replaced`);
      }
      if (base.doBullets?.length) {
        assert.deepEqual(out.doBullets, base.doBullets, `${knot.slug}/${i}: authored doBullets dropped`);
      }
      if (base.checkBullets?.length) {
        assert.deepEqual(
          out.checkBullets,
          base.checkBullets,
          `${knot.slug}/${i}: authored checkBullets dropped`,
        );
      }
      // Whatever the source, a step always ends up with something to check
      // against — that is what the fallback chain is for.
      assert.ok(out.check && out.check.length > 0, `${knot.slug}/${i}: no check at all`);
    });
  }

  // Guards the guard: if no knot authors these fields the loop above passes
  // vacuously, which is exactly how the original defect stayed invisible.
  assert.ok(authoredSomewhere > 0, "no knot authors its own checks, so this test proved nothing");
});

// ---------------------------------------------------------------------------
// Knot troubleshooting, usedIn derivation, and diagram coverage
// ---------------------------------------------------------------------------
//
// Knots had none of this: no `mistakes` field existed on the type at all, so
// a knot page had nowhere to say what actually goes wrong — the one thing
// the tie pages already did well. `usedIn` was hand-copied onto each knot
// and had gone stale on 14 of 17: knots pointing at ties that no longer used
// them, and ties that had started citing a knot with no link back. And ten
// of seventeen knots fell through to a bare "Diagram" placeholder — some
// (reverse-tension) with no diagram despite having the richest steps in the
// catalog.

// Knots this app names for recognition only — friction hitches and loop
// knots used in loaded, suspension-adjacent rigging. Unlike ties, knots
// carry no `intent` marker for this, so the set is maintained here by hand;
// keep it in sync with `isInstructorOnlyDiagram` in knot-figure.tsx and with
// the construction-language rule below.
const INSTRUCTOR_ONLY_KNOTS = new Set(["munter", "portuguese-bowline", "figure-eight", "prusik", "alpine-butterfly"]);

test("every knot names real, specific ways it goes wrong", () => {
  for (const knot of KNOTS) {
    assert.ok(knot.mistakes.length >= 3, `${knot.slug} has only ${knot.mistakes.length} mistake(s)`);
    for (const m of knot.mistakes) {
      assert.ok(m.body.length > 100, `${knot.slug}/"${m.title}": mistake too thin to be specific`);
    }
  }
});

test("an instructor-only knot's mistakes are judgment errors, never construction", () => {
  // The same rule the app already applies to instructor-route ties: this
  // category gets recognition and risk, never a way to tie, dress, load, or
  // release the thing. A "mistake" here has to stay on the reader's side of
  // that line — assuming a photo proves something, not describing a step.
  // Deliberately narrow: bare trigger words like "load" or "tied" are
  // unavoidable in legitimate judgment-error prose here ("the load path",
  // "how it was tied", "a person-bearing load") — a first version of this
  // regex flagged exactly that kind of sentence in munter's real, safe
  // content. What actually distinguishes a construction step is a hands-on
  // verb bound tightly to its object, the way an instruction reads and a
  // description of one never does.
  const constructionWords = /\b(?:wrap|thread|snug|dress|fold|cinch|tuck)\s+(?:it|the\s+\w+)\b/i;
  for (const knot of KNOTS) {
    if (!INSTRUCTOR_ONLY_KNOTS.has(knot.slug)) continue;
    for (const m of knot.mistakes) {
      assert.doesNotMatch(
        m.body,
        constructionWords,
        `${knot.slug}/"${m.title}" reads like a construction step, not a judgment error`,
      );
    }
  }
});

test("a craft knot with more than one step is never thin on any of them", () => {
  for (const knot of KNOTS) {
    if (INSTRUCTOR_ONLY_KNOTS.has(knot.slug)) continue;
    const enriched = getAcademyKnot(knot.slug)!;
    if (enriched.steps.length <= 1) continue;
    for (const [i, step] of enriched.steps.entries()) {
      assert.ok((step.doBullets?.length ?? 0) > 0, `${knot.slug}/${i}: no doBullets`);
      assert.ok((step.checkBullets?.length ?? 0) > 0, `${knot.slug}/${i}: no checkBullets`);
    }
  }
});

test("usedIn is always the ties that actually cite this knot, never a stale hand-kept copy", () => {
  // The regression itself, stated as the relationship it broke: usedIn is
  // derived in knots.ts from Tie.knots, so it cannot drift from that graph
  // without the graph itself changing. Recomputed here independently rather
  // than trusting the derivation to have run.
  const actual = new Map<string, string[]>();
  for (const tie of TIES) {
    for (const slug of tie.knots) {
      if (!actual.has(slug)) actual.set(slug, []);
      actual.get(slug)!.push(tie.slug);
    }
  }
  let checked = 0;
  for (const knot of KNOTS) {
    const expected = (actual.get(knot.slug) ?? []).slice().sort();
    const got = knot.usedIn.slice().sort();
    checked += expected.length;
    assert.deepEqual(got, expected, `${knot.slug}: usedIn does not match the tie graph`);
  }
  assert.ok(checked > 0, "no tie cites any knot, so this test proved nothing");
});

// Mirrors `isKnownDiagram` in knot-figure.tsx. Not imported directly: that
// file is JSX, and this test suite's plain-TypeScript loader (register-ts.mjs
// strips types only, via node's own --experimental-strip-types) cannot load
// a .tsx module at all — the runtime fails at "unknown file extension"
// before it ever gets to the JSX inside. Keep this prefix list in sync with
// the component by hand; a mismatch here means one of the two silently
// stopped covering a slug the other still does.
const DRAWABLE_DIAGRAM_PREFIXES = [
  "somerville-bowline",
  "larks-head",
  "double-half-hitch",
  "square",
  "half-hitch",
  "overhand-on-bight",
  "figure-eight",
  "wrap-cinch",
  "reverse-tension",
  "sheet-bend",
  "surgeon",
  "daisy-chain",
  "truckers-hitch",
  "munter",
  "portuguese-bowline",
  "prusik",
  "alpine-butterfly",
];

test("no knot's diagram falls through to the bare placeholder", () => {
  let checked = 0;
  for (const knot of KNOTS) {
    const enriched = getAcademyKnot(knot.slug)!;
    for (const [i, step] of enriched.steps.entries()) {
      const diagramId = step.diagramId ?? `${knot.slug}-${i}`;
      checked++;
      assert.ok(
        DRAWABLE_DIAGRAM_PREFIXES.some((p) => diagramId.startsWith(p)),
        `${knot.slug}/${i}: "${diagramId}" has no diagram — shows the bare placeholder`,
      );
    }
  }
  assert.ok(checked > 0, "no knot step produced a diagramId, so this test proved nothing");
});

// ---------------------------------------------------------------------------
// Instructor-route tie troubleshooting
// ---------------------------------------------------------------------------
//
// The five instructor-route *knots* each carry four or five real mistakes
// about how the reader's judgment goes wrong. The forty-eight instructor-route
// *ties* — three quarters of the tie catalog — carried one shared
// 118-character line between them, so a reader who opened a takate-kote page
// and a hogtie page got the same sentence twice and nothing else. The knots
// had already proved the recognition-only boundary survives real content, so
// the ties now compose theirs from the same per-tie inputs the rest of the
// entry is built from (see `instructorMistakes` in tie-factories.ts).

test("an instructor-route tie carries real troubleshooting, not one shared line", async () => {
  const { tieShape } = await import("./tie-factories.ts");
  const routes = TIES.filter((tie) => tieShape(tie) === "instructor");
  assert.ok(routes.length > 0, "no instructor routes found, so this test proved nothing");
  for (const tie of routes) {
    assert.ok(
      tie.mistakes.length >= 3,
      `${tie.slug} has only ${tie.mistakes.length} mistake(s) — the bar the knots already meet`,
    );
    for (const m of tie.mistakes) {
      assert.ok(
        m.body.length > 100,
        `${tie.slug}/"${m.title}": too thin to say anything specific`,
      );
    }
  }
});

test("instructor-route tie mistakes are judgment errors, never construction", async () => {
  // Same rule and same deliberately-narrow regex as the instructor-only knots
  // above: this category gets recognition and risk, never a way to tie, dress,
  // load, or release the thing. Adding troubleshooting must not become a back
  // door for handing over exactly what the entry withholds.
  const { tieShape } = await import("./tie-factories.ts");
  const constructionWords = /\b(?:wrap|thread|snug|dress|fold|cinch|tuck)\s+(?:it|the\s+\w+)\b/i;
  for (const tie of TIES.filter((t) => tieShape(t) === "instructor")) {
    for (const m of tie.mistakes) {
      assert.doesNotMatch(
        m.body,
        constructionWords,
        `${tie.slug}/"${m.title}" reads like a construction step, not a judgment error`,
      );
    }
  }
});

test("instructor-route troubleshooting is about this tie, not the same text 48 times", async () => {
  // The failure mode the tie factory's own header warns about: pages that
  // claim to cover different categories while carrying one identical
  // paragraph. Composed text is only an improvement over the shared line if it
  // actually differs — so require that the great majority of bodies are
  // distinct, and that no single body is repeated across most of the catalog.
  const { tieShape } = await import("./tie-factories.ts");
  const routes = TIES.filter((tie) => tieShape(tie) === "instructor");
  const bodies = routes.flatMap((tie) => tie.mistakes.map((m) => m.body));
  const distinct = new Set(bodies).size;
  assert.ok(
    distinct / bodies.length > 0.8,
    `only ${distinct}/${bodies.length} instructor-route mistake bodies are distinct`,
  );

  const counts = new Map<string, number>();
  for (const body of bodies) counts.set(body, (counts.get(body) ?? 0) + 1);
  const worst = Math.max(...counts.values());
  assert.ok(
    worst < routes.length / 2,
    `one mistake body is repeated on ${worst} of ${routes.length} instructor routes`,
  );
});

test("an instructor route names its own nerves rather than a generic warning", async () => {
  // The nerve-specific mistake is the one that carries the consequence — how
  // long a real injury takes to recover from — so it has to be about the
  // nerves this category actually loads. A tie with nerves listed and no
  // mention of them has silently fallen back to the no-nerve wording.
  const { tieShape } = await import("./tie-factories.ts");
  let checked = 0;
  for (const tie of TIES.filter((t) => tieShape(t) === "instructor")) {
    if (tie.nerves.length === 0) continue;
    const joined = tie.mistakes.map((m) => m.body).join(" ");
    for (const nerve of tie.nerves) {
      checked++;
      assert.ok(
        joined.includes(nerve.replace(/-/g, " ")),
        `${tie.slug}: troubleshooting never names its "${nerve}" nerve`,
      );
    }
  }
  assert.ok(checked > 0, "no instructor route listed a nerve, so this test proved nothing");
});

// An earlier version of the learning-science entries appealed to research
// throughout their prose while registering no anchors at all, so the evidence
// panel rendered "no claim-level source anchors are published for this entry"
// directly beneath a paragraph describing a review's findings. The status field
// was internally consistent — no anchors, so editorial_only — which is exactly
// why the existing evidence test passed and this went unnoticed.
//
// The first version of this test looked for surname-and-year citations, which
// these entries deliberately do not use: they describe findings in plain prose
// instead. It therefore matched nothing and asserted nothing. Match the appeal,
// not the citation format.
const EVIDENTIAL_APPEAL =
  /\b(?:reviewers? (?:graded|rated)|commissioned review|a review of the evidence|the evidence (?:actually )?supports?|studies with|was (?:actually )?tested on|did not survive (?:proper )?testing|failed testing|rated moderate|best-supported|well[- ]supported|instructional research|standard instructional)/iu;

function articleProse(article: (typeof ARTICLES)[number]): string {
  return article.blocks
    .flatMap((block) => {
      if (block.type === "ul") return block.items;
      if (block.type === "callout") return [block.title, block.text];
      return [block.text];
    })
    .concat(article.summary, article.title)
    .join(" ");
}

test("an article that appeals to research carries source anchors", () => {
  const offenders = ARTICLES.filter(
    (article) =>
      EVIDENTIAL_APPEAL.test(articleProse(article)) &&
      getArticleEvidence(article.slug).sourceIds.length === 0,
  ).map((article) => article.slug);

  assert.deepEqual(
    offenders,
    [],
    `these entries appeal to research but publish no source anchors: ${offenders.join(", ")}`,
  );

  // Guards the guard: if a rewrite stops matching the detector entirely, the
  // assertion above passes for the wrong reason. The learning set is where
  // these claims live, so at least those must still be seen.
  const seen = ARTICLES.filter((article) => EVIDENTIAL_APPEAL.test(articleProse(article)));
  assert.ok(seen.length >= 5, `detector matched only ${seen.length} entries; it has gone stale`);
});

// The learning entries make a specific claim — that matching teaching to a
// preferred modality does not hold up — and the whole set is written against
// it. A future edit reintroducing "auditory learner" framing would contradict
// the entry sitting next to it, so the phrasing is pinned. rope-basics and
// knot-foundations are craft and carry no anchors on purpose; pinning that
// split here means adding an evidence claim to one of them fails the test
// above rather than passing unnoticed.
test("the learning entries do not reintroduce the learning-styles myth", () => {
  const STYLE_CLAIM = /\b(?:auditory|visual|kinesthetic|kinaesthetic)\s+learners?/iu;
  const ANCHORED = ["learning-modalities", "learning-pacing", "spaced-learning", "evidence-based-teaching", "learning-disabilities-rope"];
  const CRAFT = ["rope-basics", "knot-foundations"];

  for (const slug of [...ANCHORED, ...CRAFT]) {
    const article = ARTICLES.find((entry) => entry.slug === slug);
    assert.ok(article, `missing learning entry ${slug}`);
    const expected = ANCHORED.includes(slug);
    assert.equal(
      getArticleEvidence(slug).sourceIds.length > 0,
      expected,
      `${slug} should be ${expected ? "source_anchored" : "editorial_only"}`,
    );

    const prose = articleProse(article);
    if (slug === "learning-modalities" || slug === "evidence-based-teaching") {
      // These two name the myth in order to reject it, so the phrase is
      // expected — but only alongside the rejection.
      assert.match(
        prose,
        /did not (?:hold up|survive)|contradict|failed testing/iu,
        `${slug} should name the meshing hypothesis only to reject it`,
      );
      continue;
    }
    assert.doesNotMatch(prose, STYLE_CLAIM, `${slug} reintroduces learning-styles framing`);
  }
});

// The lesson format promises three fixed parts, and part three is "say out
// loud". 52 of 198 steps were filling that slot with a scope notice — 48 ties
// and 4 knots reading "Instructor-only. This app does not coach, modify, or
// clear this restraint." The card printed it under a "Say out loud" heading and
// the coach voice read "Say out loud: Instructor-only. This app does not
// coach...", which is incoherent as speech and turns a boundary into something
// to recite to a partner.
//
// `isSayableAloud` decides this from the line itself, so the classification is
// pinned here over the whole catalog: a reworded notice that stops matching
// would silently return to being announced as a line to say.
test("every step's say-aloud line is speech, or is classified as a scope notice", () => {
  const steps = [
    ...KNOTS.flatMap((knot) => knot.steps.map((step, i) => ({ ref: `knot/${knot.slug}#${i}`, speak: step.speak }))),
    ...TIES.flatMap((tie) => tie.steps.map((step, i) => ({ ref: `tie/${tie.slug}#${i}`, speak: step.speak }))),
  ];

  const notices = steps.filter((step) => !isSayableAloud(step.speak));
  const sayable = steps.filter((step) => isSayableAloud(step.speak));

  // Both branches must stay populated. If every line classified one way the
  // renderers would have a dead branch and this test would assert nothing.
  assert.ok(notices.length > 0, "no scope notices found — the classifier has gone stale");
  assert.ok(sayable.length > 0, "no sayable lines found — the classifier is over-matching");

  // A notice addresses the reader about the app. A sayable line must not: an
  // entry that says "this app does not clear this" is not something a person
  // announces mid-scene, whichever wording it arrives in.
  for (const step of sayable) {
    assert.doesNotMatch(
      step.speak,
      /\bthis app\b|\binstructor[- ]only\b|\brecognition only\b/i,
      `${step.ref} is announced as a line to say but reads as a scope notice: ${step.speak}`,
    );
  }

  // And every notice must actually be one, rather than a real instruction the
  // classifier swallowed — which would hide a step's spoken line behind a
  // warning panel.
  for (const step of notices) {
    assert.match(
      step.speak,
      /\bthis (?:app|entry)\b|\binstructor[- ]only\b|\brecognition only\b|\bdo not load a person\b/i,
      `${step.ref} was classified as a scope notice but reads as speech: ${step.speak}`,
    );
  }
});

// The voice and the card must agree about which frame a line gets. They read
// the same classifier, and this proves the wiring rather than the intent.
test("the coach voice does not tell the listener to recite a scope notice", () => {
  const spoken = (speak: string) =>
    buildAcademyVoiceScript({
      stepIndex: 0,
      totalSteps: 1,
      title: "Step",
      doText: "Do the thing.",
      checkText: "Check the thing.",
      speak,
    });

  const notice = "Instructor-only. This app does not coach, modify, or clear this restraint.";
  assert.ok(spoken(notice).includes(notice), "the notice must still be read");
  assert.doesNotMatch(spoken(notice), /Say out loud: Instructor-only/u);

  const line = "Around, through, snug.";
  assert.match(spoken(line), /Say out loud: Around, through, snug\./u);
});

// Median step audio is ~65s and the longest in the catalog ~172s. That is
// user-started and replayable, so it does not breach the segmenting principle
// on its own — but it made the commonest request a struggling listener has
// ("what was the check again?") cost ninety seconds of do-bullets to reach.
// Sections are separately playable now, and the whole-step script is joined
// from the same segments so the two can never say different things.
test("voice segments cover the step exactly and stay separately playable", () => {
  const input = {
    stepIndex: 2,
    totalSteps: 5,
    title: "Around the standing pair",
    stepGoal: "One line about this step.",
    doText: "Do one. Do two.",
    checkText: "Check one.",
    speak: "Around, through, snug.",
  };
  const segments = buildAcademyVoiceSegments(input);

  // Joined segments are the full script, character for character. A separate
  // builder for each would let "read the whole step" drift from "read the
  // check" without anything noticing.
  assert.equal(segments.map((s) => s.text).join(" "), buildAcademyVoiceScript(input));

  assert.deepEqual(
    segments.map((s) => s.id),
    ["intro", "goal", "do", "check", "say"],
  );
  // Each is independently useful: a segment that needs a neighbour to make
  // sense is not a segment the listener can start from.
  assert.match(segments.find((s) => s.id === "do")!.text, /^What to do\. 1\. Do one\. 2\. Do two\.$/u);
  assert.match(segments.find((s) => s.id === "check")!.text, /^Look and check\. 1\. Check one\.$/u);
  for (const segment of segments) {
    assert.ok(segment.text.trim().length > 0, `${segment.id} is empty`);
    assert.ok(segment.label.trim().length > 0, `${segment.id} has no button label`);
  }

  // The optional goal is genuinely optional, and its absence must not shift
  // any other section's identity.
  const noGoal = buildAcademyVoiceSegments({ ...input, stepGoal: undefined });
  assert.deepEqual(noGoal.map((s) => s.id), ["intro", "do", "check", "say"]);

  // A scope notice keeps its reframing at segment level too, so playing that
  // section alone does not reintroduce the recite-the-disclaimer bug.
  const notice = buildAcademyVoiceSegments({
    ...input,
    speak: "Instructor-only. This app does not coach, modify, or clear this restraint.",
  }).find((s) => s.id === "say")!;
  assert.doesNotMatch(notice.text, /^Say out loud:/u);
  assert.equal(notice.label, "What this entry is");
});

// Watching hands is the best-supported format for a knot, but that result
// belongs to user-paced playback. An autoplaying loop is the uncontrolled
// presentation the pacing article blames for the tutorials the reader gave up
// on, so a demonstration clip must arrive with controls and without autoplay.
test("every step declares a controllable demonstration slot, not an autoplay loop", () => {
  const knotMedia = defaultKnotStepMedia("somerville-bowline", 0, "somerville-bowline-0");
  const tieMedia = defaultTieStepMedia([], "single-column", 0);

  for (const [label, media] of [["knot", knotMedia], ["tie", tieMedia]] as const) {
    const videos = media.filter((m) => m.kind === "video");
    const demos = videos.filter((m) => m.mode === "demo");
    const loops = videos.filter((m) => m.mode !== "demo");
    assert.equal(demos.length, 1, `${label} step should declare exactly one demonstration slot`);
    assert.equal(loops.length, 1, `${label} step should still declare its ambient loop`);
    // Distinct paths, or one clip would silently serve both modes.
    assert.notEqual(demos[0]!.src, loops[0]!.src, `${label} demo and loop must not share a path`);
    assert.match(demos[0]!.src, /\/demo-\d+\.webm$/u, `${label} demo path is not on the demo namespace`);
  }
});

test("authored wrap coordinates are body-space fractions clear of the head", () => {
  // The figure renderer treats a coordinate < 2 as a fraction of the figure
  // and anything >= 2 as raw viewBox units. Percentages authored as 30/45/60
  // therefore rendered as raw units — the karada's "breastbone" knot drew on
  // the figure's face (the head spans 18-66 of 420). Every authored
  // coordinate must be a fraction, and band/diamond/x centres must sit below
  // the shoulder arc: this catalog never draws rope at the head or neck,
  // matching the locked-no neck row. Stems are exempt from the shoulder bound
  // only because a stem legitimately hangs from the shoulders.
  const SHOULDER = 0.24; // 0.24 * 420 ≈ 101, just under the 86-96 shoulder arc
  for (const t of TIES) {
    const academy = getAcademyTie(t.slug);
    if (!academy) continue;
    for (const [i, step] of academy.steps.entries()) {
      for (const wrap of step.wraps) {
        const spec = wrap as Record<string, unknown>;
        for (const key of ["y", "cy", "y1", "y2", "x"] as const) {
          const value = spec[key];
          if (typeof value !== "number") continue;
          assert.ok(
            value > 0 && value < 2,
            `${t.slug} step ${i}: ${wrap.kind}.${key}=${value} must be an authored fraction, not raw units`,
          );
          if (key !== "x" && wrap.kind !== "stem") {
            assert.ok(
              value >= SHOULDER,
              `${t.slug} step ${i}: ${wrap.kind}.${key}=${value} sits on the head or neck`,
            );
          }
        }
      }
    }
  }
});

test("getAcademyTie keeps every authored goal", () => {
  // The no-TIE_ACADEMY early return derived a goal from `why`
  // unconditionally, silently replacing the per-drill goal all twelve prop
  // drills author beside their steps — unlike the reconciled branch, which
  // always respected `base.goal ??`.
  for (const t of TIES) {
    if (!t.goal) continue;
    const academy = getAcademyTie(t.slug);
    assert.ok(academy, t.slug);
    assert.equal(academy.goal, t.goal, `${t.slug}: authored goal was replaced`);
  }
});

test("sequence copy never calls a guided tie an unoccupied drill", async () => {
  const { tieShape } = await import("./tie-factories.ts");
  for (const sequence of SEQUENCES) {
    const guided = sequence.steps.some((slug) => {
      const tie = getTie(slug);
      return tie !== undefined && tieShape(tie) === "guided";
    });
    if (!guided) continue;
    assert.doesNotMatch(
      `${sequence.name} ${sequence.blurb}`,
      /unoccupied|prop drills? only/i,
      `${sequence.slug}: describes a guided tie as an unoccupied drill`,
    );
  }
});
