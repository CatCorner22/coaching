import type { Tie } from "@/lib/kb/types";
import { clamp01, linearSlope, mean } from "./signal";
import type {
  DeterministicReport,
  FrameObservation,
  Prediction,
  SafetyFlag,
} from "./types";
import { deltaE, type RGB } from "./color";

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
  const paleness = last?.paleness ?? 0;
  const palenessDelta = palenessSeries.length > 1 ? linearSlope(palenessSeries) : 0;
  const neckRope = last?.neckRope ?? 0;
  const motion = last?.motion ?? 0;
  const palenessVsBase =
    baseline && last
      ? Math.min(1, deltaE(baseline, { r: 220 - paleness * 80, g: 180, b: 160 + paleness * 40 }) / 40)
      : paleness;

  const flags: SafetyFlag[] = [];
  if (neckRope > 0.08) {
    flags.push({
      code: "neck",
      severity: neckRope > 0.16 ? "stop" : "watch",
      note: "Rope density in the neck zone. Confirm the throat is empty before you continue.",
    });
  }
  if (paleness > 0.62 || palenessDelta > 0.12) {
    flags.push({
      code: "circulation",
      severity: paleness > 0.78 ? "stop" : "watch",
      note: "Extremities look paler or cooler than they should. Check nail-bed refill and temperature.",
    });
  }
  if ((last?.blueness ?? 0) > 0.45) {
    flags.push({
      code: "circulation",
      severity: "stop",
      note: "Blue shift on the hands. Strip distal rope.",
    });
  }

  const recommend = flags.some((f) => f.severity === "stop")
    ? "stop"
    : flags.some((f) => f.severity === "watch")
      ? "adjust"
      : "continue";

  const notes: string[] = [];
  if (!last?.body) notes.push("I cannot see a clear body region. Step back or add light.");
  else notes.push(`I count about ${wrapBands.length} wrap band${wrapBands.length === 1 ? "" : "s"}.`);
  if ((last?.ropeShare ?? 0) < 0.01) notes.push("Very little rope-colored signal. Photograph the wraps, not the room.");

  return {
    wrapCount: wrapBands.length,
    wrapBands,
    neckRope,
    paleness: Math.max(paleness, palenessVsBase * 0.5),
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
  const expected = opts.tie?.steps.map((s) => s.expected.wrapBands) ?? [];
  const inferred = inferStep(opts.det.wrapCount, expected, opts.stepIndex);
  const typicalMax = (opts.tie?.minutes[1] ?? 20) * 60;
  const time = clamp01(opts.elapsedSec / Math.max(90, typicalMax));
  const circulation = clamp01(
    opts.det.paleness * 0.7 + Math.max(0, opts.det.palenessDelta) * 2.2,
  );
  const neck = clamp01(opts.det.neckRope * 6);
  const nerve = clamp01(
    (opts.tie?.nerves.includes("radial") ? 0.22 : 0.08) +
      opts.priorNerveHits * 0.2 +
      (opts.det.wrapCount > 4 ? 0.1 : 0),
  );
  const breathing = clamp01(
    (opts.tie?.slug === "takate-kote" || opts.tie?.slug === "ebi" ? 0.25 : 0.05) +
      time * 0.2,
  );

  const risks = { circulation, nerve, neck, time, breathing };
  const top = (Object.entries(risks) as [keyof typeof risks, number][]).sort(
    (a, b) => b[1] - a[1],
  )[0]!;

  let nextFailure = "Even tension and a circulation check.";
  if (top[0] === "neck" && top[1] > 0.35) nextFailure = "Throat migration if the next stem climbs.";
  else if (top[0] === "circulation" && top[1] > 0.4) nextFailure = "Hands going quiet in the next few minutes.";
  else if (top[0] === "nerve" && top[1] > 0.4) nextFailure = "Radial or peroneal complaint if a cinch lands on a groove.";
  else if (top[0] === "time" && top[1] > 0.7) nextFailure = "Overtime on this tie — the body is done before you are.";
  else if (top[0] === "breathing" && top[1] > 0.45) nextFailure = "Shallower breath as chest bands settle.";

  const recommend: Prediction["recommend"] =
    neck > 0.55 || circulation > 0.72
      ? "stop"
      : neck > 0.3 || circulation > 0.45 || time > 0.85
        ? "adjust"
        : "continue";

  const etaMinutes =
    circulation > 0.3 && opts.det.palenessDelta > 0
      ? Math.max(1, Math.round((0.72 - circulation) / Math.max(0.04, opts.det.palenessDelta * 6)))
      : null;

  return {
    stepIndex: inferred.step,
    stepConfidence: inferred.confidence,
    risks,
    nextFailure,
    etaMinutes,
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
