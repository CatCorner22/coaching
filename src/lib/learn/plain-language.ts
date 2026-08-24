/** Split instructional prose into one short idea per line for easy reading. */
export function toBullets(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const parts = trimmed
    .split(/(?<=[.!?])\s+|\s*;\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [trimmed];
}

export function bulletsOrFallback(explicit: string[] | undefined, fallback: string): string[] {
  if (explicit?.length) return explicit;
  return toBullets(fallback);
}

export const LESSON_FORMAT = [
  {
    num: 1,
    label: "What to do",
    hint: "Do one thing at a time. Tap each line when you finish it.",
  },
  {
    num: 2,
    label: "Look and check",
    hint: "Pause and look at the rope before you move on.",
  },
  {
    num: 3,
    label: "Say out loud",
    hint: "Short words you can speak to a partner—or to yourself.",
  },
] as const;

/**
 * The two lines that are true of every lesson, whatever it teaches.
 */
const BEFORE_YOU_START_ALWAYS = [
  "Have one length of rope and trauma shears within reach.",
  "Go slow. One step at a time. It is OK to repeat a step.",
] as const;

/**
 * For a knot lesson, a prop drill, or an instructor route: nobody is placed in
 * rope, so the first thing to settle is what the rope goes on.
 */
export const BEFORE_YOU_START = [
  "Use a chair leg, PVC pipe, or dress-form post — not a person.",
  ...BEFORE_YOU_START_ALWAYS,
] as const;

/**
 * For a tie taught in full, which may go on a consenting adult once its
 * negotiated limit is agreed. Telling that reader "not a person" here, a few
 * inches above steps that say to watch her face and to check again the next
 * morning, is not caution — it is the page contradicting itself, and it teaches
 * the reader to discount the warnings that do apply.
 */
export const BEFORE_YOU_START_GUIDED = [
  "Agree the limit before any rope: what this is for, how long, and what ends it.",
  "Trauma shears within reach, and both of you have rehearsed the cut — that is step one of this lesson.",
  ...BEFORE_YOU_START_ALWAYS,
] as const;
