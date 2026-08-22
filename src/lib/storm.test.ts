import assert from "node:assert/strict";
import { test } from "node:test";
import { observeFrame } from "./ml/detect.ts";
import { buildDeterministic } from "./ml/predict.ts";
import { sanitizeDet } from "./ml/sanitize.ts";
import { knowledgeDisposition, searchKnowledge } from "./kb/search.ts";
import { buildStudioNegotiationPolicy } from "./studio/negotiation.ts";
import type { NegItem } from "./stores/negotiate.ts";

/**
 * Seeded storm suite: deterministic pseudo-random fuzzing of the local
 * pipelines that must stay stable and consistent no matter what they are fed.
 * Every run uses fixed seeds, so a failure is reproducible by its case index.
 * Scale the iteration counts with STORM_SCALE=<n> for a deeper local storm.
 */

const SCALE = Math.max(1, Math.min(100, Number(process.env.STORM_SCALE) || 1));

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function img(
  w: number,
  h: number,
  fill: (x: number, y: number) => [number, number, number, number],
) {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const [r, g, b, a] = fill(x, y);
      const i = (y * w + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = a;
    }
  }
  return { width: w, height: h, data, colorSpace: "srgb" } as ImageData;
}

test("noise storm: random frames never throw, never invent a stop, and stay deterministic", () => {
  const rnd = mulberry32(0xc0ffee);
  const n = 400 * SCALE;
  for (let i = 0; i < n; i++) {
    const w = 8 + Math.floor(rnd() * 56);
    const h = 8 + Math.floor(rnd() * 88);
    const seed = Math.floor(rnd() * 2 ** 31);
    const make = () => {
      const px = mulberry32(seed);
      return img(w, h, () => [
        Math.floor(px() * 256),
        Math.floor(px() * 256),
        Math.floor(px() * 256),
        255,
      ]);
    };
    const obs = observeFrame(make());
    assert.ok(Number.isFinite(obs.ropeShare) && obs.ropeShare >= 0 && obs.ropeShare <= 1, `case ${i}`);
    assert.equal(obs.neckRope, 0, `case ${i}`);
    assert.ok(obs.wrapBands.length <= 32, `case ${i}`);
    for (const band of obs.wrapBands) {
      assert.ok(Number.isFinite(band.yNorm) && band.yNorm >= 0 && band.yNorm <= 1, `case ${i}`);
      assert.ok(Number.isFinite(band.strength) && band.strength > 0, `case ${i}`);
    }
    const det = buildDeterministic([obs]);
    assert.equal(
      det.flags.some((flag) => flag.severity === "stop"),
      false,
      `pixel noise produced a stop flag in case ${i}`,
    );
    const again = observeFrame(make());
    assert.deepEqual(again, obs, `nondeterministic observation in case ${i}`);
  }
});

test("skin storm: interpolated pale-to-deep skin patches never produce wrap bands", () => {
  const rnd = mulberry32(0x5eed);
  const anchors: Array<[number, number, number]> = [
    [235, 224, 216],
    [244, 220, 210],
    [230, 190, 170],
    [200, 150, 120],
    [170, 120, 90],
    [120, 80, 60],
    [80, 50, 35],
    [55, 38, 30],
  ];
  const n = 250 * SCALE;
  for (let i = 0; i < n; i++) {
    const a = anchors[Math.floor(rnd() * anchors.length)]!;
    const b = anchors[Math.floor(rnd() * anchors.length)]!;
    const t = rnd();
    const tone = [0, 1, 2].map((c) => Math.round(a[c]! + (b[c]! - a[c]!) * t)) as [
      number,
      number,
      number,
    ];
    const jitter = () => Math.floor(rnd() * 9) - 4;
    const frame = img(64, 96, () => [
      Math.max(0, Math.min(255, tone[0] + jitter())),
      Math.max(0, Math.min(255, tone[1] + jitter())),
      Math.max(0, Math.min(255, tone[2] + jitter())),
      255,
    ]);
    const obs = observeFrame(frame);
    assert.equal(
      obs.wrapBands.length,
      0,
      `skin patch case ${i} tone ${tone.join(",")} produced wrap bands`,
    );
  }
});

test("band storm: thin separated rope bands are recovered at a consistent count", () => {
  const rand = mulberry32(0xba5e);
  const n = 120 * SCALE;
  for (let i = 0; i < n; i++) {
    const h = 100 + Math.floor(rand() * 60);
    const w = 60 + Math.floor(rand() * 90);
    const bandCount = 1 + Math.floor(rand() * 3);
    const rows = new Set<number>();
    const centers: number[] = [];
    let cursor = 18 + Math.floor(rand() * 10);
    for (let bIdx = 0; bIdx < bandCount && cursor < h - 18; bIdx++) {
      const thickness = 3 + Math.floor(rand() * 3);
      centers.push(cursor);
      for (let dy = 0; dy < thickness; dy++) rows.add(cursor + dy);
      cursor += thickness + 24 + Math.floor(rand() * 12);
    }
    const g = 140 + Math.floor(rand() * 21);
    const rC = g + 28 + Math.floor(rand() * 13);
    const bC = Math.max(80, g - 48 - Math.floor(rand() * 8));
    const frame = img(w, h, (_x, y) =>
      rows.has(y) ? [rC, g, bC, 255] : [90, 90, 95, 255],
    );
    const obs = observeFrame(frame);
    assert.equal(
      obs.wrapBands.length,
      centers.length,
      `band case ${i} (${centers.length} bands at ${centers.join(",")} in ${w}x${h}, color ${rC},${g},${bC}) detected ${obs.wrapBands.length}`,
    );
  }
});

test("sanitize storm: arbitrary junk reports normalize without throwing", () => {
  const rnd = mulberry32(0xdead);
  const junkValue = (depth: number): unknown => {
    const pick = rnd();
    if (depth > 2) return pick < 0.5 ? null : Math.floor(rnd() * 1000);
    if (pick < 0.12) return Number.NaN;
    if (pick < 0.24) return rnd() < 0.5 ? Infinity : -Infinity;
    if (pick < 0.36) return "x".repeat(Math.floor(rnd() * 300));
    if (pick < 0.48) return { a: junkValue(depth + 1), recommend: "stop", flags: junkValue(depth + 1) };
    if (pick < 0.6) return Array.from({ length: Math.floor(rnd() * 20) }, () => junkValue(depth + 1));
    if (pick < 0.72) return rnd() < 0.5;
    if (pick < 0.84) return undefined;
    return { wrapCount: rnd() * 1e9, wrapBands: junkValue(depth + 1), notes: junkValue(depth + 1) };
  };
  const n = 800 * SCALE;
  for (let i = 0; i < n; i++) {
    const det = sanitizeDet(junkValue(0));
    assert.ok(Number.isFinite(det.wrapCount) && det.wrapCount >= 0, `case ${i}`);
    assert.ok(["continue", "adjust", "stop"].includes(det.recommend), `case ${i}`);
    assert.ok(Array.isArray(det.flags), `case ${i}`);
    assert.ok(Array.isArray(det.notes), `case ${i}`);
  }
});

test("search storm: garbage queries never throw and emergency intent always acts first", () => {
  const rnd = mulberry32(0xfade);
  const emergencyPhrases = [
    "not breathing",
    "passed out",
    "no pulse",
    "severe bleeding",
    "fell and hit head",
    "cut rope now",
    "意識がない",
    "无法呼吸",
    "숨을 쉴 수 없어요",
  ];
  const fillerWords = ["rope", "help", "please", "now", "wrap", "arm", "scene", "tie", "quick"];
  const junkChar = () => String.fromCharCode(32 + Math.floor(rnd() * 60000));
  const n = 300 * SCALE;
  for (let i = 0; i < n; i++) {
    const mode = rnd();
    if (mode < 0.34) {
      const junk = Array.from({ length: Math.floor(rnd() * 200) }, junkChar).join("");
      assert.doesNotThrow(() => searchKnowledge(junk, 8), `junk case ${i}`);
      assert.doesNotThrow(() => knowledgeDisposition(junk), `junk case ${i}`);
      continue;
    }
    const phrase = emergencyPhrases[Math.floor(rnd() * emergencyPhrases.length)]!;
    const before = Array.from(
      { length: Math.floor(rnd() * 4) },
      () => fillerWords[Math.floor(rnd() * fillerWords.length)]!,
    ).join(" ");
    const query = `${before} ${phrase}`.trim();
    assert.equal(knowledgeDisposition(query).kind, "emergency", `query "${query}"`);
    const hits = searchKnowledge(query, 6);
    assert.equal(hits[0]?.slug, "emergency-stop", `query "${query}"`);
    const allowed = new Set([
      "emergency-stop",
      "hard-limits",
      "positional-asphyxia",
      "fainting-response",
      "shears",
    ]);
    for (const hit of hits) {
      assert.ok(allowed.has(hit.slug), `query "${query}" surfaced ${hit.slug}`);
    }
  }
});

test("negotiation storm: no malformed input approves media, voice, or a locked hard-no", () => {
  const rnd = mulberry32(0xfeed);
  const ranks = ["yes", "no", "maybe", "YES", "", 1, null, undefined, {}, "yes "];
  const ids = [
    "photos",
    "voice",
    "suspension",
    "neck",
    "breath",
    "alone",
    "gote",
    "torso",
    "__proto__",
    "constructor",
    "",
    "unknown-id",
  ];
  const n = 500 * SCALE;
  for (let i = 0; i < n; i++) {
    const len = Math.floor(rnd() * 12);
    const items = Array.from({ length: len }, () => {
      const bad = rnd();
      if (bad < 0.15) return null as unknown as NegItem;
      if (bad < 0.25) return "junk" as unknown as NegItem;
      return {
        id: ids[Math.floor(rnd() * ids.length)],
        label: rnd() < 0.85 ? "label" : (123 as unknown as string),
        rank: ranks[Math.floor(rnd() * ranks.length)],
      } as unknown as NegItem;
    });
    let policy!: ReturnType<typeof buildStudioNegotiationPolicy>;
    assert.doesNotThrow(() => {
      policy = buildStudioNegotiationPolicy(items);
    }, `case ${i}`);
    const explicitYes = (id: string) =>
      items.some(
        (item) =>
          item !== null &&
          typeof item === "object" &&
          (item as NegItem).id === id &&
          (item as NegItem).rank === "yes",
      );
    if (!explicitYes("photos")) {
      assert.equal(policy.mediaBlocked, true, `case ${i} unblocked media without explicit yes`);
    }
    if (!explicitYes("voice")) {
      assert.equal(policy.voiceBlocked, true, `case ${i} unblocked voice without explicit yes`);
    }
    assert.equal(
      policy.isTieBlocked("partial-suspension"),
      true,
      `case ${i} unlocked suspension`,
    );
    const again = buildStudioNegotiationPolicy(items);
    assert.equal(again.negotiationKey, policy.negotiationKey, `case ${i} nondeterministic key`);
  }
});
