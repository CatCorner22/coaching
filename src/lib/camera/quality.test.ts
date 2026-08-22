import assert from "node:assert/strict";
import { test } from "node:test";
import {
  pickBest,
  privacySafeQualityHint,
  ropeHint,
  scoreFrame,
  worstFrameQuality,
} from "./quality.ts";

function image(
  width: number,
  height: number,
  fill: (x: number, y: number) => [number, number, number, number],
): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const [r, g, b, a] = fill(x, y);
      const index = (y * width + x) * 4;
      data[index] = r;
      data[index + 1] = g;
      data[index + 2] = b;
      data[index + 3] = a;
    }
  }
  return { width, height, data, colorSpace: "srgb" } as ImageData;
}

test("textured dark fiber and dark jute count without treating a flat dark field as rope", () => {
  const empty = image(48, 48, () => [12, 11, 10, 255]);
  const uniformFiber = image(48, 48, () => [32, 30, 28, 255]);
  const fiber = image(48, 48, (x) => (x % 8 < 4 ? [32, 30, 28, 255] : [12, 11, 10, 255]));
  const jute = image(48, 48, (x) => (x % 8 < 4 ? [58, 42, 26, 255] : [12, 11, 10, 255]));

  assert.ok(ropeHint(empty) < 0.05, `empty=${ropeHint(empty)}`);
  assert.ok(ropeHint(uniformFiber) < 0.05, `uniform=${ropeHint(uniformFiber)}`);
  assert.ok(ropeHint(fiber) > 0.35, `fiber=${ropeHint(fiber)}`);
  assert.ok(ropeHint(jute) > 0.35, `jute=${ropeHint(jute)}`);
  assert.equal(scoreFrame(fiber).notes.some((note) => /get closer/i.test(note)), false);
});

test("skin tone is not scored as rope", () => {
  const skin = image(48, 48, (x) =>
    x % 8 < 4 ? [198, 142, 118, 255] : [170, 118, 96, 255],
  );
  assert.ok(ropeHint(skin) < 0.08, `skin=${ropeHint(skin)}`);
});

test("pickBest does not promote an unlocalized pale field over a useful frame", () => {
  const useful = image(40, 40, (x, y) =>
    (x + y) % 4 < 2 ? [145, 104, 52, 255] : [35, 28, 22, 255],
  );
  const pale = image(40, 40, () => [210, 210, 210, 255]);
  const best = pickBest(
    [
      { data: useful, item: "useful", neck: 0, paleness: 0.1 },
      { data: pale, item: "pale", neck: 0, paleness: 0.9 },
    ],
    1,
  );
  assert.deepEqual(best, ["useful"]);
});

test("batch quality keeps the worst independent axis instead of masking a weak frame", () => {
  const quality = worstFrameQuality([
    { sharpness: 0.9, exposure: 0.2, ropeHint: 0.8, score: 0.65, notes: ["dark"] },
    { sharpness: 0.3, exposure: 0.9, ropeHint: 0.4, score: 0.7, notes: ["soft"] },
  ]);
  assert.deepEqual(quality, {
    sharpness: 0.3,
    exposure: 0.2,
    ropeHint: 0.4,
    score: 0.65,
    notes: ["dark", "soft"],
  });
  assert.equal(worstFrameQuality([]).score, 0);
});

test("quality hints never request a more intimate or identifying view", () => {
  const hint = privacySafeQualityHint({
    sharpness: 0.2,
    exposure: 0.9,
    ropeHint: 0.9,
    score: 0.6,
    notes: [],
  });
  assert.match(hint, /equipment-only|clothed/i);
  assert.match(hint, /non-identifying/i);
  assert.doesNotMatch(hint, /nudity|intimate view|whole room/i);
});

test("an equipment-only rope close-up outranks a bare-skin frame", () => {
  // The flatness guard used to reject a frame whose pixels were overwhelmingly
  // rope-coloured — which is exactly what the equipment-only framing this app
  // asks people to prefer produces. A pure rope close-up scored 0 on the rope
  // axis while bare skin scored higher, inverting the ranking the hint exists
  // to drive.
  let seed = 4242;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const jitter = (c: readonly [number, number, number], amount: number) =>
    c.map((v) => Math.max(0, Math.min(255, Math.round(v + (rnd() - 0.5) * amount))));
  const frame = (
    w: number,
    h: number,
    px: (x: number, y: number) => readonly [number, number, number],
  ) => {
    const buf = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const [r, g, b] = jitter(px(x, y), 12);
        buf[i] = r!;
        buf[i + 1] = g!;
        buf[i + 2] = b!;
        buf[i + 3] = 255;
      }
    }
    return { data: buf, width: w, height: h } as unknown as ImageData;
  };
  const shade = (c: readonly [number, number, number], k: number) =>
    [c[0] * k, c[1] * k, c[2] * k] as const;

  // Rope must register at every exposure, dark fibre included: the guard was an
  // absolute luminance spread, and dark material's whole tonal range is
  // compressed near zero.
  for (const rope of [
    [186, 152, 96],
    [172, 146, 104],
    [122, 96, 58],
    [30, 30, 32],
  ] as const) {
    for (const dim of [1, 0.55]) {
      const closeUp = frame(240, 240, (_x, y) =>
        shade(rope, (0.62 + 0.5 * Math.sin(Math.PI * ((y % 12) / 12))) * dim),
      );
      assert.ok(
        ropeHint(closeUp) > 0.05,
        `equipment-only close-up of ${rope.join(",")} at exposure ${dim} scored ${ropeHint(closeUp)}`,
      );
    }
  }

  // Bare skin across the tone range, and a rope-coloured wall, must stay at
  // zero — otherwise the hint steers the app to transmit a body frame.
  for (const subject of [
    [231, 195, 168],
    [209, 167, 133],
    [180, 138, 100],
    [141, 95, 63],
    [88, 56, 36],
    [150, 118, 82],
  ] as const) {
    const bare = frame(240, 240, (x) =>
      shade(subject, 0.86 + 0.14 * Math.sin((x / 240) * Math.PI)),
    );
    assert.equal(ropeHint(bare), 0, `bare ${subject.join(",")} produced a rope hint`);
  }

  // Black fabric is the acknowledged exception and is asserted as such rather
  // than wished away: isDarkFiber exists so black rope is not discarded as
  // background, and black lace occupies the same near-zero, low-saturation
  // corner. No per-pixel colour test separates them. The cost is bounded — this
  // only nudges which frame is ranked highest, and the observation report draws
  // no conclusion from it.
  const blackLace = frame(240, 240, (x) =>
    shade([26, 24, 26], 0.86 + 0.14 * Math.sin((x / 240) * Math.PI)),
  );
  assert.ok(ropeHint(blackLace) > 0, "black fabric no longer reads as dark fibre");
});

test("focus is judged on the transmitted detail, not on a downscale of it", () => {
  // The frame sent to the model is ~1600px, but sharpness used to be measured
  // on the 240px analysis copy. Shrinking by that much is itself a low-pass
  // filter, so it removes exactly the frequencies camera shake destroys: on
  // realistic wrap structure a frame that scores 0.14 at full size scored 1.00
  // after the downscale, and was reported as perfectly sharp while badly shaken.
  const W = 640;
  const gray = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const build = (px: (x: number, y: number) => number) => {
    const buf = new Uint8ClampedArray(W * W * 4);
    for (let y = 0; y < W; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        const v = gray(px(x, y));
        buf[i] = v;
        buf[i + 1] = v;
        buf[i + 2] = v;
        buf[i + 3] = 255;
      }
    }
    return { data: buf, width: W, height: W } as unknown as ImageData;
  };
  // Coarse strand structure plus fine fibre — the fibre is what shake removes.
  const sharp = build(
    (x, y) =>
      120 +
      55 * Math.sin((y / 45) * Math.PI * 2) +
      18 * Math.sin((x / 30) * Math.PI * 2) +
      10 * Math.sin((y / 7) * Math.PI * 2),
  );
  // The same frame with the fine fibre gone: coarse structure survives intact.
  const shaken = build(
    (x, y) => 120 + 55 * Math.sin((y / 45) * Math.PI * 2) + 18 * Math.sin((x / 30) * Math.PI * 2),
  );

  const coarseOnly = scoreFrame(sharp, shaken).sharpness;
  const withDetail = scoreFrame(sharp, sharp).sharpness;
  assert.ok(
    withDetail > coarseOnly,
    `losing fine detail must lower sharpness (${withDetail} vs ${coarseOnly})`,
  );
  // Without a detail source the reading falls back to the coarse frame, which
  // is why the argument has to be threaded through from processMediaFrame.
  assert.equal(scoreFrame(shaken).sharpness, scoreFrame(shaken, shaken).sharpness);
});
