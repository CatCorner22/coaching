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

export const BEFORE_YOU_START = [
  "Use a chair leg, PVC pipe, or dress-form post — not a person.",
  "Have one length of rope and trauma shears within reach.",
  "Go slow. One step at a time. It is OK to repeat a step.",
] as const;
