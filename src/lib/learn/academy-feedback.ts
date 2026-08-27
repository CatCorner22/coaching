import type { Tie } from "@/lib/kb/types";
import { inferStep } from "@/lib/ml/predict";
import type { DeterministicReport, FrameObservation } from "@/lib/ml/types";
import { fuseCoach } from "@/lib/ml/fuse";

export type AcademyFeedback = {
  headline: string;
  detail: string;
  speak: string;
  confidence: number;
  /**
   * Qualitative rendering of `confidence`. The step-inference distance
   * transform is not calibrated, so presenting it as a percentage implied a
   * precision that does not exist; buckets say what it actually is — a rough
   * comparison of band counts.
   */
  matchLabel: string;
  wrapCount: number;
  expectedBands: number | null;
  inferredStep: number | null;
  recommend: "continue" | "adjust" | "stop";
};

function describeMatch(confidence: number): string {
  if (confidence >= 0.65) return "close band-count match";
  if (confidence >= 0.4) return "rough band-count match";
  return "weak band-count match";
}

export function buildAcademyFeedback(opts: {
  det: DeterministicReport;
  frames: FrameObservation[];
  tie?: Tie;
  stepIndex: number;
  expectedBands?: number;
}): AcademyFeedback {
  const { det, frames, tie, stepIndex, expectedBands } = opts;
  const report = fuseCoach({
    det,
    frames,
    llm: null,
    tie,
    stepIndex,
    elapsedSec: 0,
    priorNerveHits: 0,
  });

  let confidence = 0.35;
  let inferredStep: number | null = null;
  let bandMatch = false;

  if (tie && expectedBands != null) {
    const expected = tie.steps.map((s) => s.expected.wrapBands);
    const inferred = inferStep(det.wrapCount, expected, stepIndex);
    inferredStep = inferred.step;
    confidence = inferred.confidence;
    bandMatch = det.wrapCount === expectedBands;
  } else if (expectedBands != null) {
    bandMatch = det.wrapCount === expectedBands;
    confidence = bandMatch ? 0.7 : 0.4;
  } else {
    confidence = (frames[frames.length - 1]?.ropeShare ?? 0) > 0.02 ? 0.55 : 0.25;
  }

  const stop = report.final.recommend === "stop" || det.flags.some((f) => f.severity === "stop");
  const recommend = stop ? "stop" : report.final.recommend;

  let headline = "Probabilistic observation — not clearance";
  let detail = report.final.coaching;
  let speak = report.final.speak;

  if (stop) {
    // Keyed on the flag's own note rather than naming a specific hazard: the
    // only stop-severity local flag is defensive and its note already says
    // what was seen, so a hardcoded "neck overlap" headline here claimed a
    // detection the local pipeline does not perform.
    headline = "Pause — release and check directly";
    detail = det.flags.find((f) => f.severity === "stop")?.note ?? detail;
    speak = "Stop and release. This view is not an all-clear.";
  } else if (tie && expectedBands != null) {
    if (bandMatch) {
      headline = `Heuristic sees about ${det.wrapCount} band${det.wrapCount === 1 ? "" : "s"} — matches this step`;
      detail = `The band count is a ${describeMatch(confidence)} for step ${stepIndex + 1}. It is an uncalibrated heuristic, not proof of correct tying. Compare your prop to the diagram and check list.`;
      speak = `About ${det.wrapCount} bands visible. Compare to the diagram. This is not clearance.`;
    } else {
      headline = `Heuristic sees ${det.wrapCount} band${det.wrapCount === 1 ? "" : "s"}; this step expects ${expectedBands}`;
      detail = `The camera cannot validate your knot. Use the check list. If unsure, undo and retry on the empty prop.`;
      speak = `I see ${det.wrapCount} bands, not ${expectedBands}. Check the diagram. Not clearance.`;
    }
  } else {
    const ropeVisible = (frames[frames.length - 1]?.ropeShare ?? 0) > 0.015;
    headline = ropeVisible ? "Rope signal visible in frame" : "Little rope visible — move closer or improve light";
    detail = ropeVisible
      ? "A color heuristic detected rope-like pixels. It cannot confirm knot type, safety, or fit."
      : "Try framing the prop and rope filling more of the screen. Equipment-only, non-identifying media preferred.";
    speak = ropeVisible
      ? "Rope is visible. Compare to the diagram. Not clearance."
      : "Move the camera closer to the rope on your prop.";
  }

  return {
    headline,
    detail,
    speak,
    confidence,
    matchLabel: describeMatch(confidence),
    wrapCount: det.wrapCount,
    expectedBands: expectedBands ?? null,
    inferredStep,
    recommend,
  };
}
