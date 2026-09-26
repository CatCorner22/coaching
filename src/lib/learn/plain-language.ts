/** Split instructional prose into one short idea per line for easy reading. */
export function toBullets(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const parts = trimmed
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const merged: string[] = [];
  for (const part of parts) {
    const startsAnAction = /^(?:do|then|next|check|look|confirm|keep|hold|release|cut|say|ask|watch)\b/iu.test(part);
    if (merged.length > 0 && part.split(/\s+/).length < 5 && !startsAnAction) {
      merged[merged.length - 1] = `${merged[merged.length - 1]} ${part}`;
    } else {
      merged.push(part);
    }
  }
  return merged.length > 0 ? merged : [trimmed];
}

export function bulletsOrFallback(explicit: string[] | undefined, fallback: string): string[] {
  if (explicit?.length) return explicit;
  return toBullets(fallback);
}

/**
 * Whether a step's `speak` line is something a person actually says in the
 * room, or a scope notice addressed to the reader about what this app does.
 *
 * The lesson format promises three fixed parts, and part three is "say out
 * loud". On instructor-route entries that slot was carrying "Instructor-only.
 * This app does not coach, modify, or clear this restraint." — so the card
 * printed it under a "Say out loud" heading and the coach voice read the words
 * "Say out loud: Instructor-only. This app does not coach...". Two things go
 * wrong at once. It is incoherent as speech, and framing a boundary as a line
 * to recite to a partner turns it into scene patter, which is the opposite of
 * what it is for.
 *
 * On those entries there is genuinely nothing to say, because you are not
 * doing the tie. The honest shape is an absent third part, not a filled one.
 *
 * Classified from the line rather than threaded down from the catalog because
 * the question is about this sentence, not about the entry: a guided tie may
 * still carry a notice on one step. Both renderers ask here so the card and
 * the voice can never disagree, and `speakLineKinds` pins every line in the
 * catalog so a reworded notice cannot quietly drift back into part three.
 */
export function isSayableAloud(speak: string): boolean {
  // Addresses the reader about the app or the entry, rather than the room.
  return !/\bthis (?:app|entry) (?:does not|cannot|is)\b|\binstructor[- ]only\b|\brecognition only\b|\bdo not load a person from this\b/i.test(
    speak,
  );
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
