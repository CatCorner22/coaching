import type { Tie } from "@/lib/kb/types";
import { clamp01, linearSlope, mean } from "./signal";
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
  const palenessSeries = frames.map((f) => f.paleness);
  const paleness = Math.max(0, ...frames.map((f) => f.paleness), last?.paleness ?? 0);
  const palenessDelta = palenessSeries.length > 1 ? linearSlope(palenessSeries) : 0;
  const neckRope = Math.max(0, ...frames.map((f) => f.neckRope), last?.neckRope ?? 0);
  const motion = last?.motion ?? 0;
  const blueness = Math.max(0, ...frames.map((f) => f.blueness ?? 0));
  void baseline;

  const flags: SafetyFlag[] = [];
  if (neckRope > 0.08) {
    flags.push({
      code: "neck",
      severity: "stop",
      note: "Possible neck or throat overlap in this view. Stop and release; an image cannot establish contact or pressure.",
    });
  }
  if (blueness > 0.45) {
    flags.push({
      code: "circulation",
      severity: "watch",
      note: "Possible blue color shift in this frame. Camera color is unreliable; pause and verify directly, releasing for any concerning change or symptom.",
    });
  }
  if (!last || (last.width * last.height) < 16 || Number.isNaN(last.ropeShare) || !last.body) {
    flags.push({
      code: "unknown",
      severity: last?.body ? "watch" : "stop",
      note: last?.body
        ? "The frame is unusable. Pause and rely on direct checks, not another image, before any change."
        : "No stable relevant region was detected. Stop relying on the image and assess directly.",
    });
  }

  const recommend = flags.some((f) => f.severity === "stop")
    ? "stop"
    : flags.some((f) => f.severity === "watch")
      ? "adjust"
      : "adjust";

  const notes: string[] = [];
  if (!last?.body) notes.push("No clear relevant region was detected in this limited view.");
  else notes.push(`The image heuristic found ${wrapBands.length} possible horizontal rope-like feature${wrapBands.length === 1 ? "" : "s"}.`);
  if ((last?.ropeShare ?? 0) < 0.01) notes.push("Very little rope-colored signal was visible; an image may not be useful.");

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

export function meanPaleness(frames: FrameObservation[]) {
  return mean(frames.map((f) => f.paleness));
}
