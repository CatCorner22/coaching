/** Conversation guide content: plain prompts for before, during and after. */
export type GuideSection = { id: string; title: string; when: string; prompts: string[]; tip?: string };

export const CONVERSATION_GUIDE: GuideSection[] = [
  {
    id: "start",
    title: "Opening the talk",
    when: "Earlier in the day, clothed, not in the bedroom",
    prompts: [
      "What are you hoping tonight feels like, in three words?",
      "What's one thing you're excited about and one thing you're nervous about?",
      "Who leads tonight, and how much control does that person have?",
      "How long do we want to play, and when do we stop no matter what?",
    ],
    tip: "Ask, then listen. Don't argue a no — thank them for it.",
  },
  {
    id: "limits",
    title: "Going through limits",
    when: "With the Boundaries checklist open",
    prompts: [
      "For each 'maybe': what would make this a yes? What would make it a no?",
      "Is this a no for tonight or a no forever?",
      "Are there words, names or roles that are off-limits, or ones you love?",
      "Is any part of your body off-limits tonight (injuries, sore spots, marks that would show)?",
      "Photos: what's okay to capture, where are they kept, and when do we delete them?",
    ],
    tip: "Different answers mean the cautious one wins tonight. Revisit another day.",
  },
  {
    id: "persona",
    title: "Roles and personas",
    when: "Before you step into character",
    prompts: [
      "What name should I use for you while we play, and what name means we've stepped out?",
      "What tone do you want: playful, strict, teasing, cold? Pick an intensity from 1 to 5.",
      "Which themes feel exciting, and which would actually hurt rather than thrill?",
      "How do I check on you without breaking the mood? (a hand squeeze, a color question)",
    ],
    tip: "Words that land as play in a scene can sting later. Agree what stays in the scene.",
  },
  {
    id: "safety",
    title: "Safety signals",
    when: "Last thing before starting",
    prompts: [
      "Say our safewords out loud now: red stops everything, yellow slows down.",
      "If you can't speak, what's the signal? (drop an object, three taps)",
      "Where are the safety shears? Show each other.",
      "Any meds, alcohol, tiredness or stress today we should know about?",
    ],
  },
  {
    id: "during",
    title: "Check-ins during",
    when: "Every few minutes, and whenever something changes",
    prompts: [
      "Color? (green = keep going, yellow = slow down, red = stop)",
      "Squeeze my hand twice if you're good.",
      "Any tingling, numbness, or cold hands or feet? (stop and untie if yes)",
      "More, less, or the same?",
    ],
    tip: "Numbness or tingling in rope means untie now, not later.",
  },
  {
    id: "after",
    title: "Aftercare",
    when: "Right after you stop",
    prompts: [
      "What do you need right now: water, a blanket, cuddles, quiet, a snack?",
      "Do you want me close or a little space?",
      "Is there anything I said tonight you want me to take back or reassure?",
    ],
  },
  {
    id: "debrief",
    title: "Next-day debrief",
    when: "The next day, over coffee",
    prompts: [
      "What was your favorite moment?",
      "Was there anything that felt off, too much, or not enough?",
      "Any marks, soreness, numbness or mood dip today? (some people feel low a day or two later)",
      "What do we change, keep, or try next time?",
    ],
    tip: "Write the answers in the Journal so next time starts from what you learned.",
  },
];
