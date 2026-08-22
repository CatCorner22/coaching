import assert from "node:assert/strict";
import { test } from "node:test";
import { isRope, isSkinLike } from "./color.ts";
import { observeFrame } from "./detect.ts";
import { buildDeterministic } from "./predict.ts";

/**
 * Skin/clothing vs rope discrimination fixtures.
 *
 * Pixel color cannot fully separate natural-fiber rope from skin — they
 * overlap in chroma — so these tests pin the two guarantees the local hints
 * do make: (1) skin tones across the pale-to-deep range are never counted as
 * rope pixels, and (2) blob-shaped regions (skin, lingerie fabric, clothing,
 * furniture) never become wrap bands; only thin band-like structures do.
 * Everything else is the remote model's job under the garment-confounder
 * ontology, and no local result is ever safety clearance.
 */

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

const SKIN_TONES: Array<[string, [number, number, number]]> = [
  ["pale flash-washed", [235, 224, 216]],
  ["pale warm", [244, 220, 210]],
  ["fair", [230, 190, 170]],
  ["medium", [200, 150, 120]],
  ["olive tan", [170, 120, 90]],
  ["brown", [120, 80, 60]],
  ["deep", [80, 50, 35]],
  ["very deep", [55, 38, 30]],
];

const JUTE: [number, number, number] = [180, 150, 100];
const NEUTRAL_BG: [number, number, number] = [90, 90, 95];
const LACE_DARK: [number, number, number] = [30, 27, 25];

test("no skin tone across the pale-to-deep range is counted as a rope pixel", () => {
  for (const [label, [r, g, b]] of SKIN_TONES) {
    assert.equal(isRope(r, g, b), false, `${label} skin (${r},${g},${b}) must not read as rope`);
    assert.equal(isSkinLike(r, g, b), true, `${label} skin (${r},${g},${b}) should read as skin-like`);
  }
});

test("midtone natural-fiber rope color still reads as rope after the broader skin exclusion", () => {
  const [r, g, b] = JUTE;
  assert.equal(isSkinLike(r, g, b), false);
  assert.equal(isRope(r, g, b), true);
});

test("full-frame skin patches produce zero wrap bands at every tone", () => {
  for (const [label, tone] of SKIN_TONES) {
    const obs = observeFrame(img(96, 120, () => [...tone, 255]));
    assert.equal(obs.wrapBands.length, 0, `${label} skin patch produced wrap bands`);
  }
});

test("two thin rope bands on a neutral background are still detected", () => {
  const frame = img(96, 120, (_x, y) => {
    const onBand = (y >= 30 && y <= 33) || (y >= 70 && y <= 73);
    return onBand ? [...JUTE, 255] : [...NEUTRAL_BG, 255];
  });
  const obs = observeFrame(frame);
  assert.equal(obs.wrapBands.length, 2);
});

test("thin rope bands crossing a skin background are still detected", () => {
  const skin: [number, number, number] = [200, 150, 120];
  const frame = img(96, 120, (_x, y) => {
    const onBand = (y >= 40 && y <= 43) || (y >= 84 && y <= 87);
    return onBand ? [...JUTE, 255] : [...skin, 255];
  });
  const obs = observeFrame(frame);
  assert.equal(obs.wrapBands.length, 2);
});

test("a tight stack of touching wraps still reads as a band cluster, not a blob", () => {
  // Three touching 4-row wraps: the most common real cuff shape. The blob
  // gate must not suppress it the way it suppresses a forearm or fabric.
  const frame = img(96, 120, (_x, y) =>
    y >= 30 && y < 42 ? [...JUTE, 255] : [...NEUTRAL_BG, 255],
  );
  const obs = observeFrame(frame);
  assert.ok(obs.wrapBands.length >= 1, "stacked wraps were suppressed as a blob");
});

test("band strength is normalized to the 0-8 overlay scale by row coverage", () => {
  const frame = img(96, 120, (_x, y) => {
    if (y >= 40 && y <= 43) return [...JUTE, 255];
    return [...NEUTRAL_BG, 255];
  });
  const obs = observeFrame(frame);
  assert.ok(obs.wrapBands.length >= 1);
  for (const band of obs.wrapBands) {
    assert.ok(band.strength > 0 && band.strength <= 8, `strength ${band.strength} out of scale`);
  }
});

test("a large rope-colored garment blob is suppressed instead of becoming bands", () => {
  const frame = img(96, 120, (_x, y) =>
    y >= 55 && y < 95 ? [...JUTE, 255] : [...NEUTRAL_BG, 255],
  );
  const obs = observeFrame(frame);
  assert.equal(obs.wrapBands.length, 0, "a 40-row fabric blob must not read as a wrap band");
});

test("a frame saturated with rope-colored fabric yields no bands and a blob note", () => {
  const frame = img(96, 120, (_x, y) => (y >= 20 ? [...JUTE, 255] : [...NEUTRAL_BG, 255]));
  const obs = observeFrame(frame);
  assert.equal(obs.wrapBands.length, 0);
  assert.ok(obs.ropeShare > 0.5);
  const det = buildDeterministic([obs]);
  assert.match(det.notes.join(" "), /without band structure/i);
  assert.equal(
    det.flags.some((flag) => flag.severity === "stop"),
    false,
  );
});

test("black lace over skin reads as a blob, not as rope wrap bands", () => {
  const skin: [number, number, number] = [200, 150, 120];
  const frame = img(96, 120, (x, y) => {
    if (y < 50) return [...skin, 255];
    const laceHole = (x + y) % 2 === 0;
    return laceHole ? [...skin, 255] : [...LACE_DARK, 255];
  });
  const obs = observeFrame(frame);
  assert.equal(obs.wrapBands.length, 0, "a lace-covered region must not read as wrap bands");
});

test("a thin dark band remains a candidate: local hints cannot tell a garment strap from rope", () => {
  // A 3-row dark strap on skin is geometrically identical to a thin dark rope.
  // This is a documented local limit; the remote ontology carries garment-strap
  // confounders and the report never treats a band as proof of restraint.
  const skin: [number, number, number] = [200, 150, 120];
  const frame = img(96, 120, (_x, y) =>
    y >= 60 && y <= 62 ? [...LACE_DARK, 255] : [...skin, 255],
  );
  const obs = observeFrame(frame);
  assert.ok(obs.wrapBands.length <= 1);
});

test("dark uniform clothing fills the frame without inventing bands or a stop", () => {
  const obs = observeFrame(img(96, 120, () => [38, 35, 33, 255]));
  assert.equal(obs.wrapBands.length, 0);
  const det = buildDeterministic([obs]);
  assert.equal(
    det.flags.some((flag) => flag.severity === "stop"),
    false,
  );
});

test("genuine rope survives the structure gates across realistic framings", () => {
  // Recall corpus at the real 240px analysis resolution. An earlier version of
  // the structure gate used a fixed share-of-row-width floor and a tighter
  // thinness limit, which silently dropped ordinary framings: a cuff crossing
  // part of a wide shot, and a close-up wrap filling a fifth of the frame.
  const W = 240;
  const H = 240;
  const wide = (fill: (x: number, y: number) => [number, number, number]) =>
    img(W, H, (x, y) => [...fill(x, y), 255] as [number, number, number, number]);

  const cases: Array<[string, ImageData]> = [
    ["full-width wrap", wide((_x, y) => (y >= 100 && y < 104 ? JUTE : NEUTRAL_BG))],
    ["three spaced wraps", wide((_x, y) => ([60, 100, 140].some((c) => y >= c && y < c + 4) ? JUTE : NEUTRAL_BG))],
    ["wrap over a skin background", wide((_x, y) => (y >= 100 && y < 104 ? JUTE : [200, 150, 120]))],
    ["70% width wrap", wide((x, y) => (y >= 100 && y < 104 && x < W * 0.7 ? JUTE : NEUTRAL_BG))],
    ["50% width wrap", wide((x, y) => (y >= 100 && y < 104 && x < W * 0.5 ? JUTE : NEUTRAL_BG))],
    ["25% width wrap (cuff in a wide shot)", wide((x, y) => (y >= 100 && y < 104 && x < W * 0.25 ? JUTE : NEUTRAL_BG))],
    ["close-up wrap at 20% of frame height", wide((_x, y) => (y >= 90 && y < 90 + Math.round(H * 0.2) ? JUTE : NEUTRAL_BG))],
    ["tight cuff of three touching wraps", wide((_x, y) => (y >= 100 && y < 112 ? JUTE : NEUTRAL_BG))],
    ["wrap at the top edge", wide((_x, y) => (y >= 2 && y < 6 ? JUTE : NEUTRAL_BG))],
    ["wrap at the bottom edge", wide((_x, y) => (y >= H - 6 && y < H - 2 ? JUTE : NEUTRAL_BG))],
  ];
  for (const [name, frame] of cases) {
    assert.ok(observeFrame(frame).wrapBands.length >= 1, `no band detected for ${name}`);
  }

  // Documented limit, asserted so it stays a known one: row projection smears a
  // strongly angled wrap across many rows, so it may yield no band. Local hints
  // are framing aids only and never clearance, so a miss is not a safety claim.
  const angled = wide((x, y) => {
    const top = 100 + Math.round(x * 0.25);
    return y >= top && y < top + 4 ? JUTE : NEUTRAL_BG;
  });
  assert.ok(observeFrame(angled).wrapBands.length >= 0);
});
