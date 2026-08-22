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
  getArticleEvidence,
  isKnowledgeQueryUsable,
  knowledgeAnswer,
  knowledgeDisposition,
  searchKnowledge,
} from "./index.ts";
import { SAFETY_SOURCE_IDS, SAFETY_SOURCES, SOURCE_LEDGER_REVISION } from "./sources.ts";

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
    assert.match(knowledgeAnswer(query), /^Unsupported media:/u, query);
    assert.match(knowledgeAnswer(query), /does not automatically detect/u, query);
  }
  for (const [query, secondaryAction] of [
    ["nude photo and my fingers are numb", /Do not capture or upload unsupported media/u],
    ["explicit image arm is blue", /Do not capture or upload unsupported media/u],
    ["underage person has severe pain", /Do not capture or upload unsupported media/u],
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
