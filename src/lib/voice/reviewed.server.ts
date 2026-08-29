import { getAcademyKnot, getAcademyTie, KNOTS, TIES } from "@/lib/kb";
import {
  buildAcademyVoiceScript,
  buildAcademyVoiceSegments,
  knotStepVoiceInput,
  tieStepVoiceInput,
  type VoiceStepInput,
} from "@/lib/learn/voice-script";
import { OBSERVATION_SPEAK, STOP_SPEAK } from "@/lib/ml/audit";
import { DIRECT_CHECK_REMINDER, MAX_REVIEWED_SPEECH_LENGTH } from "./reviewed-lines";

const normalize = (value: string): string => value.replace(/\s+/g, " ").trim();

/**
 * Everything a lesson page can hand playCoachVoice for one step: the joined
 * step script (auto-read and "read the step") and each segment on its own
 * (the per-section buttons). Composed with the same builders the pages use,
 * so the set and the page cannot drift apart.
 */
function stepNarration(input: VoiceStepInput): string[] {
  return [buildAcademyVoiceScript(input), ...buildAcademyVoiceSegments(input).map((s) => s.text)];
}

const REVIEWED_SPEECH = new Set(
  [
    STOP_SPEAK,
    OBSERVATION_SPEAK,
    DIRECT_CHECK_REMINDER,
    ...TIES.flatMap((tie) => tie.steps.map((step) => step.speak)),
    ...KNOTS.flatMap((knot) => knot.steps.map((step) => step.speak)),
    ...TIES.flatMap((tie) => {
      const academy = getAcademyTie(tie.slug);
      if (!academy) return [];
      return academy.steps.flatMap((step, index) =>
        stepNarration(tieStepVoiceInput(step, index, academy.steps.length)),
      );
    }),
    ...KNOTS.flatMap((knot) => {
      const academy = getAcademyKnot(knot.slug);
      if (!academy) return [];
      return academy.steps.flatMap((step, index) =>
        stepNarration(knotStepVoiceInput(step, index, academy.steps.length)),
      );
    }),
  ].map(normalize),
);

/** Cloud TTS accepts only source-reviewed app lines, never arbitrary client prose. */
export function isReviewedCoachSpeech(value: string): boolean {
  const normalized = normalize(value);
  return (
    normalized.length > 0 &&
    normalized.length <= MAX_REVIEWED_SPEECH_LENGTH &&
    REVIEWED_SPEECH.has(normalized)
  );
}
