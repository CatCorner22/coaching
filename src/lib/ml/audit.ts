import type { Tie } from "@/lib/kb/types";
import type { AuditVerdict, DeterministicReport, LlmDraft, Prediction } from "./types";

const BANNED = [
  /breath\s*play/i,
  /chok(e|ing)/i,
  /strangle/i,
  /full suspension/i,
  /hang(ing)? her/i,
  /rope (on|around) the neck/i,
  /neck rope/i,
  /gag and leave/i,
];

export function localAudit(opts: {
  det: DeterministicReport;
  pred: Prediction;
  llm: LlmDraft | null;
  tie?: Tie;
  stepIndex: number;
}): { draft: LlmDraft; verdict: AuditVerdict } {
  const overrides: string[] = [];
  const droppedClaims: string[] = [];
  const base = opts.llm ?? fallbackDraft(opts);

  let quality = base.quality;
  let coaching = base.coaching;
  let next = base.next;
  let speak = base.speak;
  let circulation = base.circulation || opts.det.recommend !== "continue";

  if (opts.det.recommend === "stop" && quality === "sound") {
    quality = "unsafe";
    overrides.push("Deterministic stop overrode a 'sound' grade.");
  }
  if (opts.det.recommend === "adjust" && quality === "sound") {
    quality = "adjust";
    overrides.push("Local wrap/circulation model asked for an adjustment.");
  }
  if (opts.pred.recommend === "stop" && quality !== "unsafe") {
    quality = "unsafe";
    overrides.push("Predictor vetoed continuation on rising risk.");
  }

  const blob = `${coaching} ${next} ${speak}`;
  for (const re of BANNED) {
    if (re.test(blob)) {
      droppedClaims.push(`Removed disallowed coaching matching ${re.source}`);
      quality = "unsafe";
      next = "Stop. That suggestion is outside what this atelier will coach.";
      coaching =
        "I will not coach neck restraint, breath play, or full suspension. Stay on the floor tie in front of you.";
      speak = "I will not coach that. Stay with the floor tie. Check her throat and hands.";
    }
  }

  if (opts.tie) {
    const max = opts.tie.steps.length - 1;
    if (opts.stepIndex > max) {
      overrides.push("Step index clamped to the tie.");
    }
  }

  if (opts.det.neckRope > 0.1) {
    next = "Photograph or look at the throat. Empty it before any next wrap.";
    if (!/throat|neck/i.test(coaching)) {
      coaching = `Neck-zone rope signal is ${opts.det.neckRope.toFixed(2)}. ${coaching}`;
    }
    speak = "Check the throat before you add rope. Hands next.";
    overrides.push("Neck-zone density forced a throat check.");
  }

  speak = speak.replace(/\s+/g, " ").trim().slice(0, 220);
  coaching = coaching.trim().slice(0, 900);
  next = next.trim().slice(0, 240);

  const passed = droppedClaims.length === 0;
  return {
    draft: {
      ...base,
      quality,
      coaching,
      next,
      speak,
      circulation,
    },
    verdict: {
      passed,
      overrides,
      droppedClaims,
      source: opts.llm ? "fused" : "local-rules",
    },
  };
}

export function fallbackDraft(opts: {
  det: DeterministicReport;
  pred: Prediction;
  tie?: Tie;
  stepIndex: number;
}): LlmDraft {
  const step = opts.tie?.steps[opts.stepIndex];
  const quality =
    opts.det.recommend === "stop"
      ? "unsafe"
      : opts.det.recommend === "adjust"
        ? "adjust"
        : "sound";
  const notes = opts.det.notes.join(" ");
  const coaching = step
    ? `${notes} Expected now: ${step.rigger} Check: ${step.check}`
    : `${notes} Freeform — build only what you can name and undo.`;
  const speak =
    opts.det.recommend === "stop"
      ? "Stop. Check her hands and throat. Cut if you cannot make it right."
      : step
        ? step.speak
        : "Count the wraps. Two fingers of space. Ask her how the hands feel.";
  return {
    tieGuess: opts.tie?.name ?? "freeform",
    stepGuess: step?.title ?? "observation",
    quality,
    seen: opts.det.notes,
    next: step?.rigger ?? opts.pred.nextFailure,
    coaching,
    speak,
    circulation: quality !== "sound",
  };
}

export function applyModelSelfAudit(
  draft: LlmDraft,
  flags: { contradictsDet: boolean; hardLimit: boolean; invented: boolean },
): LlmDraft {
  if (!flags.hardLimit && !flags.contradictsDet && !flags.invented) return draft;
  return {
    ...draft,
    quality: flags.hardLimit || flags.contradictsDet ? "unsafe" : "adjust",
    speak: flags.hardLimit
      ? "I will not coach that. Return to a floor tie and check her."
      : draft.speak,
  };
}
