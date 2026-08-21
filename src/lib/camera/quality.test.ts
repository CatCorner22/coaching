import assert from "node:assert/strict";
import { test } from "node:test";
import { pickBest, ropeHint, scoreFrame } from "./quality.ts";

function img(w: number, h: number, fill: (x: number, y: number) => [number, number, number, number]) {
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

test("dark fiber and dark jute count as rope, empty room does not", () => {
  const empty = img(48, 48, () => [12, 11, 10, 255]);
  const fiber = img(48, 48, () => [32, 30, 28, 255]);
  const jute = img(48, 48, () => [58, 42, 26, 255]);
  const warm = img(48, 48, () => [140, 105, 55, 255]);
  assert.ok(ropeHint(empty) < 0.05, `empty=${ropeHint(empty)}`);
  assert.ok(ropeHint(fiber) > 0.5, `fiber=${ropeHint(fiber)}`);
  assert.ok(ropeHint(jute) > 0.5, `jute=${ropeHint(jute)}`);
  assert.ok(ropeHint(warm) > 0.5, `warm=${ropeHint(warm)}`);
  assert.equal(
    scoreFrame(fiber).notes.some((n) => /get closer/i.test(n)),
    false,
  );
  assert.equal(
    scoreFrame(empty).notes.some((n) => /get closer/i.test(n)),
    true,
  );
});

test("skin is not scored as rope", () => {
  const skin = img(48, 48, () => [198, 142, 118, 255]);
  assert.ok(ropeHint(skin) < 0.08, `skin=${ropeHint(skin)}`);
});

test("pickBest still prefers a pale frame over a sharper safe one", () => {
  const sharp = img(40, 40, () => [80, 70, 40, 255]);
  const pale = img(40, 40, () => [40, 40, 40, 255]);
  const best = pickBest(
    [
      { data: sharp, item: "sharp", neck: 0, paleness: 0.1 },
      { data: pale, item: "pale", neck: 0, paleness: 0.8 },
    ],
    1,
  );
  assert.deepEqual(best, ["pale"]);
});
