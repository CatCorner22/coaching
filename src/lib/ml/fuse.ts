import type { Tie } from "@/lib/kb/types";
import { localAudit } from "./audit";
import { rankRecommend } from "./predict";
import type {
  CoachReport,
  DeterministicReport,
  FrameObservation,
  LlmDraft,
  Prediction,
} from "./types";
import { predict } from "./predict";

export function fuseCoach(opts: {
  det: DeterministicReport;
  frames: FrameObservation[];
  llm: LlmDraft | null;
  tie?: Tie;
  stepIndex: number;
  elapsedSec: number;
  priorNerveHits: number;
}): CoachReport {
  const prediction = predict({
    det: opts.det,
    frames: opts.frames,
    tie: opts.tie,
    stepIndex: opts.stepIndex,
    elapsedSec: opts.elapsedSec,
    priorNerveHits: opts.priorNerveHits,
  });
  const { draft, verdict } = localAudit({
    det: opts.det,
    pred: prediction,
    llm: opts.llm,
    tie: opts.tie,
    stepIndex: opts.stepIndex,
  });
  const recommend = rankRecommend(
    opts.det.recommend,
    prediction.recommend,
    draft.quality === "unsafe" ? "stop" : draft.quality === "adjust" ? "adjust" : "continue",
  );
  const flags = [
    ...opts.det.flags,
    ...(recommend !== "continue" && !opts.det.flags.length
      ? [
          {
            code: "unknown" as const,
            severity: recommend === "stop" ? ("stop" as const) : ("watch" as const),
            note: prediction.nextFailure,
          },
        ]
      : []),
  ];
  return {
    deterministic: opts.det,
    prediction,
    llm: opts.llm,
    audit: verdict,
    final: {
      recommend,
      coaching: draft.coaching,
      speak: draft.speak,
      next: draft.next,
      flags,
    },
  };
}
