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

/** Full spoken script for a lesson step — plain language, paced for listening. */
export function buildAcademyVoiceScript(input: VoiceStepInput): string {
  const doLines = bulletsOrFallback(input.doBullets, input.doText);
  const checkLines = bulletsOrFallback(input.checkBullets, input.checkText);
  const parts: string[] = [
    `Step ${input.stepIndex + 1} of ${input.totalSteps}. ${input.title}.`,
  ];
  if (input.stepGoal) parts.push(input.stepGoal);
  parts.push("What to do.");
  doLines.forEach((line, i) => parts.push(`${i + 1}. ${line}`));
  parts.push("Look and check.");
  checkLines.forEach((line, i) => parts.push(`${i + 1}. ${line}`));
  // A scope notice is read as a statement. Prefixing it with "Say out loud"
  // told the listener to recite the sentence explaining that this app will not
  // teach them the thing they are looking at.
  parts.push(isSayableAloud(input.speak) ? `Say out loud: ${input.speak}` : input.speak);
  return parts.join(" ");
}

export function buildAcademyIntroScript(lessonName: string, goal?: string): string {
  return [
    `Knotty Academy. ${lessonName}.`,
    goal ?? "Practice on an empty prop only.",
    "Follow each step. Check the boxes before you continue.",
  ].join(" ");
}
