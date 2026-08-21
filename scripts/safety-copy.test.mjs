import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const CAMERA_COPY_FILES = [
  "README.md",
  "src/routes/index.tsx",
  "src/routes/studio.tsx",
  "src/components/camera-capture.tsx",
  "src/lib/kb/dungeon.ts",
  "src/lib/kb/more-articles.ts",
  "src/lib/kb/ties.ts",
];

test("camera copy contains no physiology, face/throat framing, or next-pass promises", async () => {
  const copy = (await Promise.all(CAMERA_COPY_FILES.map((file) => readFile(file, "utf8")))).join("\n");
  for (const prohibited of [
    /photograph (?:the )?(?:throat|hands|face|back)/i,
    /frame (?:her|him|their|the) face/i,
    /camera (?:checks|grades|monitors|watches) (?:circulation|breathing|hands|nerves)/i,
    /grok coaches the next pass/i,
    /camera.{0,30}tension gauge/i,
    /deterministic safety can veto/i,
  ]) {
    assert.doesNotMatch(copy, prohibited);
  }
});

test("reviewed emergency copy contains no universal cutting order or wait-until-morning rule", async () => {
  const copy = (
    await Promise.all([
      readFile("src/lib/kb/articles.ts", "utf8"),
      readFile("src/lib/kb/more-articles.ts", "utf8"),
      readFile("src/routes/aftercare.tsx", "utf8"),
    ])
  ).join("\n");
  assert.doesNotMatch(copy, /tensioned stems first/i);
  assert.doesNotMatch(copy, /if (?:she|he|they) faints.{0,120}if (?:she|he|they) (?:does not|don't) come back/i);
  assert.doesNotMatch(copy, /weakness remains in the morning/i);
  assert.match(copy, /persistent or worsening/i);
  assert.match(copy, /call emergency services immediately|call emergency services now/i);
});

test("all user-facing KB source rejects anatomical placement recipes and physiology clearance", async () => {
  const names = (await readdir("src/lib/kb"))
    .filter((name) => name.endsWith(".ts") && !name.endsWith(".test.ts") && name !== "types.ts")
    .sort();
  const rows = await Promise.all(
    names.map(async (name) => ({ name, copy: await readFile(`src/lib/kb/${name}`, "utf8") })),
  );

  const prohibited = [
    [/loadBearing:\s*true/i, "catalog marks an app-taught knot as load-bearing"],
    [/few fingers below (?:the )?deltoid/i, "finger-width nerve landmark"],
    [/(?:a few|several) inches (?:down|below).{0,30}(?:arm|knee|joint)/i, "distance-based anatomy placement"],
    [/radial groove (?:empty|wraps?|cinches?|placement)/i, "radial-groove placement recipe"],
    [/(?:fibular head|popliteal fossa).{0,50}(?:wrap|rope|cinch|band)/i, "named-landmark placement recipe"],
    [/(?:wrap|rope|cinch|band).{0,50}(?:fibular head|popliteal fossa)/i, "named-landmark placement recipe"],
    [/(?:check|confirm).{0,45}(?:two[- ]finger|fingers? of space)/i, "finger-width clearance"],
    [/(?:check|confirm).{0,45}(?:hands?|feet|toes|fingers) (?:are |stay |stays )?(?:pink|warm)/i, "color/temperature clearance"],
    [/(?:check|confirm).{0,45}(?:a )?full (?:breath|sentence)/i, "breath/speech clearance"],
    [/(?:nail-bed|capillary).{0,35}(?:seconds?|cutoff|clear|pass)/i, "capillary timing clearance"],
    [/(?:wiggle|flex|extend).{0,30}(?:finger|toe|thumb|foot).{0,35}(?:clear|pass|continue|safe)/i, "movement-test clearance"],
    [/cuff (?:her|him|them) to (?:it|the)/i, "person-to-object cuff instruction"],
    [/(?:wrist|ankle) cuffs? to (?:the )?(?:pole|rail|ring|leg|stirrup)/i, "object-attachment recipe"],
    [/(?:hitch|attach) to (?:the )?(?:pole|bed|table|bench|cross)/i, "object-attachment recipe"],
    [/single-column (?:a |each |the )?(?:wrist|ankle|limb)/i, "body single-column recipe"],
    [/(?:insert|penetrate).{0,40}(?:before|while).{0,40}(?:rope|restraint|tie)/i, "intimate-restraint procedure"],
    [/(?:flog|strike|impact) (?:a |the )?(?:back|thigh|butt|body)/i, "impact-placement recipe"],
  ];

  for (const { name, copy } of rows) {
    for (const [pattern, reason] of prohibited) {
      assert.doesNotMatch(copy, pattern, `${name}: ${reason}`);
    }
  }
});

test("KB safety boundary preserves consent, symptom escalation, and instructor routing", async () => {
  const names = (await readdir("src/lib/kb"))
    .filter((name) => name.endsWith(".ts") && !name.endsWith(".test.ts"))
    .sort();
  const copy = (await Promise.all(names.map((name) => readFile(`src/lib/kb/${name}`, "utf8")))).join("\n");

  assert.match(copy, /current consent|consent.*reversible|withdrawn consent/i);
  assert.match(copy, /qualified(?:, consent-centered)? (?:hands-on|in-person|adult) instructor/i);
  assert.match(copy, /persistent or worsening symptoms?.{0,80}(?:medical assessment|medical care)/i);
  assert.match(copy, /camera (?:cannot|result never)|image cannot|photograph cannot/i);
  assert.match(copy, /unoccupied.{0,80}(?:practice|equipment|form|prop)/i);
});

test("nerve catalog renders a neutral legend instead of an anatomical placement map", async () => {
  const copy = await readFile("src/lib/kb/nerves.ts", "utf8");
  assert.doesNotMatch(
    copy,
    /zone:\s*["`](?:outer|inner|back of|front of|at the|below|above).{0,80}(?:arm|elbow|wrist|hand|thigh|knee|ankle|groin)/i,
  );
  const xCoordinates = [...copy.matchAll(/\bx:\s*([0-9.]+)/g)].map((match) => Number(match[1]));
  assert.ok(xCoordinates.length >= 6);
  assert.ok(xCoordinates.every((value) => value === xCoordinates[0]), "nerve labels must stay in one neutral legend column");
});

test("routes present blocked categories as instructor routes rather than timed procedures", async () => {
  const library = await readFile("src/routes/library.tsx", "utf8");
  const tie = await readFile("src/routes/tie.$slug.tsx", "utf8");
  const dungeon = await readFile("src/routes/dungeon.tsx", "utf8");
  const planner = await readFile("src/routes/plan.tsx", "utf8");
  const copy = `${library}\n${tie}\n${dungeon}\n${planner}`;

  assert.match(library, /t\.minutes\[1\] === 0 \? "Instructor route"/);
  assert.match(tie, /tie\.minutes\[1\] === 0 \? "Instructor route"/);
  assert.match(dungeon, /s\.minutes === 0 \? "Instructor route"/);
  assert.doesNotMatch(copy, /suspension is a primer|rope dresses her|furniture\s+holds her|next wrap/i);
  assert.doesNotMatch(dungeon, /Load in planner|Open studio/);
});
