import { bulletsOrFallback, isSayableAloud } from "./plain-language";

export type VoiceStepInput = {
  stepIndex: number;
  totalSteps: number;
  title: string;
  stepGoal?: string;
  doText: string;
  checkText: string;
  doBullets?: string[];
  checkBullets?: string[];
  speak: string;
};

/**
 * One user-startable piece of a step's narration.
 *
 * The whole step used to be a single utterance: median ~65 seconds, and the
 * longest step in the catalog ~172. That is not a pacing failure in itself —
 * the listener chooses when it starts and can replay it — but it makes the one
 * thing a struggling listener most often wants impossible. Asking "what was
 * the check again?" meant sitting through ninety seconds of do-bullets to
 * reach it, so in practice the answer is to give up and read.
 *
 * The segmenting principle is about user-paced pieces rather than short ones,
 * so the fix is a boundary the listener can start from, not less content.
 * Sections are the useful grain here: a per-bullet split produces five-second
 * fragments and a new problem.
 */
export type VoiceSegment = {
  /** Stable identifier for controls and tests. */
  id: "intro" | "goal" | "do" | "check" | "say";
  /** Short button label. */
  label: string;
  /** The spoken text for this piece alone. */
  text: string;
};

export function buildAcademyVoiceSegments(input: VoiceStepInput): VoiceSegment[] {
  const doLines = bulletsOrFallback(input.doBullets, input.doText);
  const checkLines = bulletsOrFallback(input.checkBullets, input.checkText);
  const numbered = (lines: string[]) => lines.map((line, i) => `${i + 1}. ${line}`).join(" ");

  const segments: VoiceSegment[] = [
    {
      id: "intro",
      label: "Title",
      text: `Step ${input.stepIndex + 1} of ${input.totalSteps}. ${input.title}.`,
    },
  ];
  if (input.stepGoal) segments.push({ id: "goal", label: "In one line", text: input.stepGoal });
  segments.push({ id: "do", label: "What to do", text: `What to do. ${numbered(doLines)}` });
  segments.push({ id: "check", label: "Look and check", text: `Look and check. ${numbered(checkLines)}` });

  // A scope notice is read as a statement. Prefixing it with "Say out loud"
  // told the listener to recite the sentence explaining that this app will not
  // teach them the thing they are looking at.
  const sayable = isSayableAloud(input.speak);
  segments.push({
    id: "say",
    label: sayable ? "Say out loud" : "What this entry is",
    text: sayable ? `Say out loud: ${input.speak}` : input.speak,
  });
  return segments;
}

/**
 * Full spoken script for a lesson step — plain language, paced for listening.
 *
 * Joined from the segments rather than built separately, so "read the whole
 * step" and "read just the check" can never drift into saying different things.
 */
export function buildAcademyVoiceScript(input: VoiceStepInput): string {
  return buildAcademyVoiceSegments(input)
    .map((segment) => segment.text)
    .join(" ");
}

export function buildAcademyIntroScript(lessonName: string, goal?: string): string {
  return [
    `Knotty Academy. ${lessonName}.`,
    goal ?? "Practice on an empty prop only.",
    "Follow each step. Check the boxes before you continue.",
  ].join(" ");
}
