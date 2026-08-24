import type { Tie } from "./types";

/**
 * The three shapes a catalog tie takes, in one place.
 *
 *  1. `unoccupiedPractice` — a handling drill for a prop or dress form.
 *  2. `guidedPractice` — a foundational structure taught step by step, which
 *     may go on a person once its negotiated limit is agreed.
 *  3. `instructorRoute` — a category named with its risk and nothing more.
 *
 * **Why there is a middle bucket.** For a while there were only two, and the
 * effect was an app that could not teach anybody anything: every route to
 * doing rope ended in "ask an instructor", including for the single column,
 * which is the first thing taught in every introductory class and every book
 * on the subject. That is not caution, it is uselessness wearing caution's
 * coat, and an app nobody can learn from does not make anybody safer.
 *
 * The line between bucket 2 and bucket 3 is not how advanced a tie looks. It
 * is whether written instruction has a track record of producing injury:
 *
 *  - Upper-arm bands — the takate-kote and chest-harness family — are the
 *    documented source of most rope nerve injury, they fail without a visible
 *    warning, and the failure is measured in weeks to months of lost hand
 *    function. Instructor route.
 *  - Anything bearing weight, anything on the neck, anything restricting
 *    breathing, anything compressing a folded body. Instructor route, and
 *    locked in the negotiation policy besides.
 *  - Limb cuffs, decorative patterns, rope handling, tension, and removal.
 *    Teachable in writing, taught in writing everywhere, and taught here.
 *
 * The boilerplate lives here because it is the safety copy. It was previously
 * written out twice, in `ties.ts` and `more-ties.ts`, in wordings that had
 * already drifted apart. One source is the only way that copy stays true.
 */

export type PracticeInput = Pick<
  Tie,
  "slug" | "name" | "jp" | "summary" | "level" | "knots" | "nerves" | "intent"
> & {
  /** What handling skill the drill actually builds. */
  purpose: string;
  bands?: number;
};

/** A craft drill on an unoccupied form. Never a person, never a load. */
export function unoccupiedPractice(input: PracticeInput): Tie {
  return {
    slug: input.slug,
    name: input.name,
    jp: input.jp,
    summary: input.summary,
    level: input.level,
    minutes: [3, 12],
    ropes: [{ lengthM: 8, count: 1 }],
    position: "theory",
    prereqs: [],
    knots: input.knots,
    nerves: input.nerves,
    intent: [...input.intent, "unoccupied-practice"],
    why: `${input.purpose} This drill is for an unoccupied prop or dress form and does not validate body placement, pressure, duration, loading, or release competence.`,
    stop: [
      "Stop before applying this app drill to a person",
      "Never add body loading, attachment, neck contact, or an intimate pass",
    ],
    steps: [
      {
        title: "Unoccupied handling drill",
        rigger:
          "Use a smooth, stable, unoccupied practice form. Rehearse identifying the rope path, dressing the pattern, finding both ends, and removing it promptly without any body or structural loading.",
        bottom:
          "No participant is placed in rope for this app drill. Body application requires separate, current adult consent and qualified hands-on instruction.",
        check:
          "The form is unoccupied, stable, easy to access from every side, and the rope can be removed immediately.",
        speak: "Unoccupied practice only. No person-bearing or body-placement instruction.",
        expected: {
          wrapBands: input.bands ?? 1,
          pose: "stand",
          view: "front",
          handsVisible: true,
          neckClear: true,
        },
        wraps: [],
      },
    ],
    mistakes: [
      {
        title: "Treating appearance as validation",
        body: "A tidy pattern, successful prop drill, photograph, or model response does not establish safe use on a person.",
      },
    ],
    aftercare: "No participant is restrained in this drill. Inspect and store the practice rope after use.",
    variations: [],
  };
}

export type InstructorInput = Pick<
  Tie,
  "slug" | "name" | "jp" | "summary" | "nerves" | "intent"
> & {
  /** Why this category is not something an app can hand over. */
  risks: string;
  /** What to do instead, tonight, without anyone in rope. */
  alternative: string;
};

/** A category the app will name and describe the risk of, and nothing more. */
export function instructorRoute(input: InstructorInput): Tie {
  return {
    slug: input.slug,
    name: `${input.name}: Instructor Route`,
    jp: input.jp,
    summary: input.summary,
    level: "advanced",
    minutes: [0, 0],
    ropes: [],
    position: "theory",
    prereqs: [],
    knots: [],
    nerves: input.nerves,
    intent: [...input.intent, "instructor-only", "risk-awareness"],
    why: `${input.risks} This app cannot establish anatomy, fit, pressure, tolerance, consent, loading, or release competence.`,
    stop: [
      "Do not construct or modify this tie from app instructions",
      "Release for any symptom, distress, communication change, withdrawn consent, or uncertainty",
    ],
    steps: [
      {
        title: "Recognition, negotiation, and qualified instruction",
        rigger:
          "Use this entry to recognize the category and prepare questions. Learn construction, person-specific fit, monitoring, and rapid release hands-on from a qualified, consent-centered adult instructor.",
        bottom:
          "A role, prior scene, normal appearance, movement check, timer, or camera result never replaces current consent or your right to stop.",
        check: input.alternative,
        speak: "Instructor-only. This app does not coach, modify, or clear this restraint.",
        expected: {
          wrapBands: 0,
          pose: "stand",
          view: "front",
          handsVisible: true,
          neckClear: true,
        },
        wraps: [],
      },
    ],
    mistakes: [
      {
        title: "Remote clearance",
        body: "A photo, timer, symptom-free moment, or model response cannot validate construction, physiology, or safety.",
      },
    ],
    aftercare:
      "For an incident, stop and release. Call emergency services for emergency signs; seek prompt medical assessment for persistent or worsening symptoms. Do not re-tie to test recovery.",
    variations: [],
  };
}

export type GuidedInput = Pick<
  Tie,
  | "slug"
  | "name"
  | "jp"
  | "summary"
  | "level"
  | "knots"
  | "nerves"
  | "intent"
  | "steps"
  | "mistakes"
  | "variations"
> & {
  /** What this structure is for, and what makes it the one to learn first. */
  why: string;
  /**
   * The one-sentence goal shown above the steps. Authored here, next to the
   * steps it captions, so it cannot drift from them — the Academy's own goal
   * table was written for prop drills and kept describing them long after these
   * ties were rewritten to go on a person.
   */
  goal: string;
  minutes: [number, number];
  ropes: { lengthM: number; count: number }[];
  prereqs?: string[];
  /** Tie-specific stop conditions, appended to the universal ones. */
  stop?: string[];
  aftercare?: string;
};

/**
 * A foundational structure, taught in full, that may go on a person.
 *
 * Every one of these carries the same three universal stop conditions, appended
 * after whatever the tie adds. They are not negotiable per-tie, and they are
 * first because they are the ones that matter: a reported symptom, a rope that
 * has moved somewhere it was not put, and a person who cannot be reached.
 */
export function guidedPractice(input: GuidedInput): Tie {
  return {
    slug: input.slug,
    name: input.name,
    jp: input.jp,
    summary: input.summary,
    level: input.level,
    minutes: input.minutes,
    ropes: input.ropes,
    position: "floor",
    prereqs: input.prereqs ?? [],
    knots: input.knots,
    nerves: input.nerves,
    intent: [...input.intent, "guided-practice"],
    goal: input.goal,
    why: input.why,
    stop: [
      // Universal, first, and identical everywhere. A symptom is not a thing to
      // finish the wrap and then look at.
      "Numbness, tingling, pins and needles, weakness, a hand or foot that will not grip or move, sharp or shooting pain, or any change in sensation — take the rope off now, before discussing it",
      "Rope that has moved onto the neck, into an armpit, or anywhere it was not deliberately placed",
      "Any distress, confusion, faintness, breathing change, or loss of clear communication — and any uncertainty of your own about what you are looking at",
      ...(input.stop ?? []),
    ],
    steps: input.steps,
    mistakes: [
      ...input.mistakes,
      {
        // Appended by the factory rather than written per tie, because it is
        // the failure this whole catalog is arranged against and it was already
        // missing from two of the three ties that needed it.
        title: "Treating a check as permission",
        body: "Every check in these steps tells you when to stop. None of them tells you it is safe to carry on, because no check can. Nerve compression develops without changing circulation, so colour, warmth and capillary refill all stay normal while the damage happens — and the classic tests built on them (two fingers under the rope, pink fingertips, can she wiggle her thumb) do not detect the injury they are believed to detect. A good check at minute one says nothing about minute fifteen. Keep asking, and treat every answer as information about this moment only.",
      },
    ],
    aftercare:
      input.aftercare ??
      "Take the rope off before either of you gets comfortable — it is easy to leave it on far longer than intended. Ask her to move every joint that was wrapped and to say out loud how each one feels; do that again in an hour, and again the next morning, because compression symptoms often appear late. Anything still numb, weak, painful, or altered the next day is a doctor's question, not something to wait out. Coil and inspect the rope; put it away.",
    variations: input.variations,
  };
}

export type TieShape = "guided" | "practice" | "instructor";

/**
 * Which of the three shapes a tie is, derived from its own markers.
 *
 * One source, because the answer drives both what a reader is told they can do
 * and how the entry is labelled everywhere it appears — and a label that
 * disagreed with the content would be the most dangerous kind of mistake this
 * catalog can make.
 */
export function tieShape(tie: Pick<Tie, "intent">): TieShape {
  if (tie.intent.includes("guided-practice")) return "guided";
  if (tie.intent.includes("instructor-only")) return "instructor";
  return "practice";
}

/** Short label for a tie card or heading. */
export function tieShapeLabel(shape: TieShape): string {
  switch (shape) {
    case "guided":
      return "Taught step by step";
    case "practice":
      return "Prop drill";
    case "instructor":
      return "Instructor route";
  }
}

/** One sentence on what the reader can actually do with this entry. */
export function tieShapeBlurb(shape: TieShape): string {
  switch (shape) {
    case "guided":
      return "Taught here in full, step by step, and may be applied to a consenting adult once its negotiated limit is agreed. The steps tell you when to stop; none of them tells you it is safe to continue.";
    case "practice":
      return "A handling drill for an unoccupied prop or dress form. Nobody is placed in rope for this, and completing it does not establish anything about use on a person.";
    case "instructor":
      return "Named here with its risk family so you can recognise it and ask about it. This app does not teach its construction, and no photo, timer or result clears it.";
  }
}
