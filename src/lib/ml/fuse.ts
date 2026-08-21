import type { Tie } from "@/lib/kb/types";
import { localAudit } from "./audit";
import { rankRecommend } from "./predict";
import type {
  CoachReport,
  DeterministicReport,
  FrameObservation,
  LlmDraft,
} from "./types";
import { predict } from "./predict";
import { sanitizeDet } from "./sanitize";

export function fuseCoach(opts: {
  det: DeterministicReport;
  frames: FrameObservation[];
  llm: LlmDraft | null;
  tie?: Tie;
  stepIndex: number;
  elapsedSec: number;
  priorNerveHits: number;
  hardNos?: string[];
}): CoachReport {
  const det = sanitizeDet(opts.det);
  const prediction = predict({
    det,
    frames: opts.frames,
    tie: opts.tie,
    stepIndex: opts.stepIndex,
    elapsedSec: opts.elapsedSec,
    priorNerveHits: opts.priorNerveHits,
  });
  const { draft, verdict } = localAudit({
    det,
    pred: prediction,
    llm: opts.llm,
    tie: opts.tie,
    stepIndex: opts.stepIndex,
    hardNos: opts.hardNos,
  });
  const recommend = rankRecommend(
    det.recommend,
    prediction.recommend,
    draft.quality === "unsafe" ? "stop" : draft.quality === "adjust" ? "adjust" : "continue",
  );
  const flags = [
    ...det.flags,
    ...(recommend !== "continue" && !det.flags.length
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
    deterministic: det,
    prediction,
    llm: draft,
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
