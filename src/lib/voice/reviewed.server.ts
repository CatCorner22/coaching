import { KNOTS, TIES } from "@/lib/kb";
import { OBSERVATION_SPEAK, STOP_SPEAK } from "@/lib/ml/audit";
import { DIRECT_CHECK_REMINDER } from "./reviewed-lines";

const normalize = (value: string): string => value.replace(/\s+/g, " ").trim();

const REVIEWED_SPEECH = new Set(
  [
    STOP_SPEAK,
    OBSERVATION_SPEAK,
    DIRECT_CHECK_REMINDER,
    ...TIES.flatMap((tie) => tie.steps.map((step) => step.speak)),
    ...KNOTS.flatMap((knot) => knot.steps.map((step) => step.speak)),
  ].map(normalize),
);

/** Cloud TTS accepts only source-reviewed app lines, never arbitrary client prose. */
export function isReviewedCoachSpeech(value: string): boolean {
  const normalized = normalize(value);
  return normalized.length > 0 && normalized.length <= 400 && REVIEWED_SPEECH.has(normalized);
}
