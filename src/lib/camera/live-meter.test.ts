import assert from "node:assert/strict";
import test from "node:test";
import { bestFrameIndices, LIVE_SAMPLE_MAX_WIDTH } from "./live-meter.ts";

test("bestFrameIndices keeps the highest scores in original clip order", () => {
  const picks = bestFrameIndices([{ score: 0.2 }, { score: 0.9 }, { score: 0.4 }, { score: 0.8 }], 3);
  assert.deepEqual(picks, [1, 2, 3]);
});

test("bestFrameIndices clamps keep and empty input", () => {
  assert.deepEqual(bestFrameIndices([], 3), []);
  assert.deepEqual(bestFrameIndices([{ score: 0.5 }], 8), [0]);
});

test("live sample width stays small enough for HUD use", () => {
  assert.ok(LIVE_SAMPLE_MAX_WIDTH <= 200);
});
