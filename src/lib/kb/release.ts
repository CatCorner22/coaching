/**
 * The one release rule every knot and tie page repeats. Kept in a single
 * place so the wording the reader rehearses is the wording they see under
 * pressure, and so a test can insist every knot points at it.
 */
export const CUT_RULE = {
  title: "When to stop untying and cut",
  /** The triggers, in the order they should be checked. Any one is enough. */
  when: [
    "She says the safeword, says \"out\", or asks for the rope off — for any reason, no discussion.",
    "She reports numbness, tingling, pins and needles, weakness, a cold or heavy limb, or shooting pain.",
    "She is faint, panicking, struggling to breathe, or not answering you.",
    "Something urgent needs both your hands elsewhere (a fall, a fire alarm, another person).",
    "You have been working at the knot for about a minute and it is not coming undone. One minute, not five: rope is cheap, and nerve compression that has already produced symptoms gets worse by the minute.",
  ],
  /** How to cut, one action per line. */
  how: [
    "Use blunt-nosed safety shears — the kind paramedics carry, sold as trauma, EMT, or bandage shears. Not kitchen scissors, not a knife, not nail scissors.",
    "Say \"I am cutting the rope\" so she knows what the cold metal is.",
    "Cut a wrap, not the knot. A knot is a bunch of strands packed close to skin; a wrap is one flat band you can get under.",
    "Slide the blunt lower blade flat between rope and skin, blade pointing along the limb rather than into it, and close the shears in one motion.",
    "One cut through a wrap loosens the whole structure on that limb. Unwind the rest by hand; do not keep cutting.",
    "Then treat it like any release: move the limb, ask what she feels, and check again in an hour and the next morning.",
  ],
  /** The two habits that make the rule work. */
  before: [
    "Shears live where your dominant hand reaches them without looking and without standing up, every session, before the first wrap.",
    "Both of you have cut a scrap of rope with them at least once, so you know how much force it takes.",
  ],
} as const;

/** The stop-list line every body-applied tie carries. */
export const CUT_STOP =
  "She reports numbness, tingling, weakness or pain, says the safeword, or a knot has not opened within about a minute of you working at it — stop untying and cut one wrap with the safety shears, blade flat between rope and skin, away from the knot";

/** Compact one-line reminder for step text and speech. */
export const CUT_RULE_SHORT =
  "If she reports numbness, tingling, weakness or pain, asks to be out, or the knot has not given within about a minute: stop untying and cut a wrap with the safety shears.";
