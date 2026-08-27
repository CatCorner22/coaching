import assert from "node:assert/strict";
import { test } from "node:test";
import { buildAcademyFeedback } from "./academy-feedback.ts";
import type { DeterministicReport, FrameObservation } from "../ml/types.ts";

function det(over: Partial<DeterministicReport> = {}): DeterministicReport {
  return {
    wrapCount: 0,
    wrapBands: [],
    neckRope: 0,
    paleness: 0,
    palenessDelta: 0,
    motion: 0,
    flags: [],
    recommend: "adjust",
    notes: [],
    ...over,
  };
}

function frame(over: Partial<FrameObservation> = {}): FrameObservation {
  return {
    width: 240,
    height: 180,
    ropeShare: 0.05,
    skinShare: 0,
    wrapBands: [],
    neckRope: 0,
    paleness: 0,
    blueness: 0,
    motion: 0,
    body: null,
    ...over,
  };
}

test("a stop flag uses the flag's own note, not a hardcoded neck headline", () => {
  const fb = buildAcademyFeedback({
    det: det({
      flags: [
        {
          code: "unknown",
          severity: "stop",
          note: "An untrusted client hint requested a conservative stop.",
        },
      ],
      recommend: "stop",
    }),
    frames: [frame()],
    stepIndex: 0,
  });
  assert.equal(fb.recommend, "stop");
  assert.match(fb.headline, /release and check directly/i);
  assert.doesNotMatch(fb.headline, /neck overlap/i);
  assert.match(fb.detail, /conservative stop/);
});

test("band-count confidence is a qualitative label, not a percentage", () => {
  const fb = buildAcademyFeedback({
    det: det({ wrapCount: 2, wrapBands: [{ yNorm: 0.4, strength: 0.5 }] }),
    frames: [frame({ ropeShare: 0.08 })],
    stepIndex: 0,
    expectedBands: 2,
  });
  assert.match(fb.matchLabel, /band-count match/);
  assert.doesNotMatch(fb.detail, /\d+%/);
  assert.doesNotMatch(fb.matchLabel, /\d+%/);
});
