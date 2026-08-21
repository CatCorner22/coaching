import assert from "node:assert/strict";
import { test } from "node:test";
import { findPeaks } from "./signal.ts";
import { inferStep } from "./predict.ts";
import { localAudit } from "./audit.ts";
import type { DeterministicReport, Prediction } from "./types";

test("findPeaks locates wrap bands", () => {
  const series = [0, 0, 1, 8, 1, 0, 0, 2, 9, 2, 0, 0, 7, 1];
  const peaks = findPeaks(series, 0.4);
  assert.equal(peaks.length, 3);
  assert.equal(peaks[0]?.index, 3);
});

test("inferStep stays near previous when wrap count is noisy", () => {
  const r = inferStep(3, [0, 1, 3, 4, 5], 2);
  assert.equal(r.step, 2);
  assert.ok(r.confidence > 0.4);
});

test("local audit vetoes a sound grade on deterministic stop", () => {
  const det: DeterministicReport = {
    wrapCount: 2,
    wrapBands: [],
    neckRope: 0.2,
    paleness: 0.8,
    palenessDelta: 0.2,
    motion: 0,
    flags: [{ code: "neck", severity: "stop", note: "neck" }],
    recommend: "stop",
    notes: ["neck"],
  };
  const pred: Prediction = {
    stepIndex: 0,
    stepConfidence: 0.5,
    risks: { circulation: 0.8, nerve: 0.2, neck: 0.7, time: 0.1, breathing: 0.1 },
    nextFailure: "throat",
    etaMinutes: 1,
    recommend: "stop",
  };
  const { draft, verdict } = localAudit({
    det,
    pred,
    llm: {
      tieGuess: "TK",
      stepGuess: "fine",
      quality: "sound",
      seen: ["looks good"],
      next: "add a neck rope for style",
      coaching: "Looks great, add neck rope.",
      speak: "Looks great.",
      circulation: false,
    },
    stepIndex: 0,
  });
  assert.equal(draft.quality, "unsafe");
  assert.ok(verdict.overrides.length + verdict.droppedClaims.length > 0);
  assert.doesNotMatch(draft.speak, /neck rope for style/i);
});

