import assert from "node:assert/strict";
import test from "node:test";
import { captureReadinessForAnalyze } from "./capture-readiness.ts";

test("captureReadinessForAnalyze flags unusable frames", () => {
  const bad = captureReadinessForAnalyze({
    sharpness: 0.2,
    exposure: 0.8,
    ropeHint: 0.5,
    score: 0.2,
    notes: [],
  });
  assert.equal(bad.suggestRetake, true);
  assert.equal(bad.label, "soft");
});

test("captureReadinessForAnalyze passes strong frames", () => {
  const good = captureReadinessForAnalyze({
    sharpness: 0.8,
    exposure: 0.7,
    ropeHint: 0.4,
    score: 0.75,
    notes: [],
  });
  assert.equal(good.label, "ready");
  assert.equal(good.suggestRetake, false);
});
