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
