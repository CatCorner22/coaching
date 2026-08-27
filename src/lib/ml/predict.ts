import type { Tie } from "@/lib/kb/types";
import { clamp01 } from "./signal";
import type {
  DeterministicReport,
  FrameObservation,
  Prediction,
  SafetyFlag,
} from "./types";
import type { RGB } from "./color";

export function inferStep(
  wrapCount: number,
  expected: number[],
  prev: number,
): { step: number; confidence: number } {
  if (!expected.length) return { step: 0, confidence: 0.2 };
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < expected.length; i++) {
    const dist = Math.abs(wrapCount - expected[i]!) + Math.abs(i - prev) * 0.35;
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  const conf = clamp01(1 - bestDist / (Math.max(3, expected.length) + 1));
  return { step: best, confidence: conf };
}

export function buildDeterministic(
  frames: FrameObservation[],
  baseline?: RGB | null,
): DeterministicReport {
  const last = frames[frames.length - 1];
  const wrapBands = last?.wrapBands ?? [];
  // Physiology and body localization are intentionally not inferred from pixels.
  const paleness = 0;
  const palenessDelta = 0;
  const neckRope = Math.max(0, ...frames.map((f) => f.neckRope), last?.neckRope ?? 0);
  const motion = last?.motion ?? 0;
  void baseline;

  const flags: SafetyFlag[] = [];
  if (neckRope > 0.08) {
    flags.push({
      code: "neck",
      severity: "stop",
      note: "Possible neck or throat overlap in this view. Stop and release; an image cannot establish contact or pressure.",
    });
  }
  if (!last || (last.width * last.height) < 64 || Number.isNaN(last.ropeShare)) {
    flags.push({
      code: "unknown",
      severity: "watch",
      note: "The frame is unusable for even broad observation. Treat it as an insufficient view, not an all-clear or an emergency finding.",
    });
  }

  const recommend = flags.some((f) => f.severity === "stop")
    ? "stop"
    : flags.some((f) => f.severity === "watch")
      ? "adjust"
      : "adjust";

  const notes: string[] = [];
  notes.push(`An unvalidated color/edge heuristic marked ${wrapBands.length} possible horizontal rope-like feature${wrapBands.length === 1 ? "" : "s"}.`);
  notes.push("The app does not use skin color to localize a body or hands and does not infer physiology.");
  if ((last?.ropeShare ?? 0) < 0.01) notes.push("Very little rope-colored signal was visible; an image may not be useful.");
  if ((last?.ropeShare ?? 0) > 0.5 && wrapBands.length === 0) {
    notes.push("Rope-colored area fills nearly the whole view, so no band structure could be separated. This says nothing about what the frame contains.");
  }

  return {
    wrapCount: wrapBands.length,
    wrapBands,
    neckRope,
    paleness,
    palenessDelta,
    motion,
    flags,
    recommend,
    notes,
  };
}

export function predict(opts: {
  det: DeterministicReport;
  frames: FrameObservation[];
  tie?: Tie;
  stepIndex: number;
  elapsedSec: number;
  priorNerveHits: number;
}): Prediction {
  // A camera cannot produce medical risk probabilities, validate a tie step, or
  // forecast time-to-injury. Keep this legacy shape neutral until callers migrate.
  const risks = { circulation: 0, nerve: 0, neck: 0, time: 0, breathing: 0 };
  const recommend: Prediction["recommend"] = opts.det.recommend === "stop" ? "stop" : "adjust";

  return {
    stepIndex: Math.max(0, Number.isFinite(opts.stepIndex) ? Math.floor(opts.stepIndex) : 0),
    stepConfidence: 0,
    risks,
    nextFailure: "Images cannot predict nerve, circulation, breathing, load, or future condition.",
    etaMinutes: null,
    recommend,
  };
}

export function rankRecommend(
  ...xs: Array<"continue" | "adjust" | "stop">
): "continue" | "adjust" | "stop" {
  if (xs.includes("stop")) return "stop";
  if (xs.includes("adjust")) return "adjust";
  return "continue";
}
