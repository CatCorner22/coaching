import type { Tie, TieStep } from "./types";

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
  /**
   * The one-sentence goal shown above the steps: what the finished pattern is
   * and what handling it teaches. Authored beside the steps so it cannot drift
   * from them.
   */
  goal?: string;
  /**
   * The drill itself, worked step by step, framed by the factory's setup and
   * strip-down steps.
   *
   * This exists because for a long time it did not, and the result was eleven
   * pages that claimed to teach eleven different patterns while carrying one
   * identical paragraph between them. A reader who opened the diamond drill and
   * the hexagon drill side by side saw the same 189 characters twice — "rehearse
   * identifying the rope path, dressing the pattern, finding both ends" — which
   * names no diamond, no hexagon, and no way to tell whether the thing in front
   * of you is either. Saying nothing specific is not a safe default: it teaches
   * the reader that this app has nothing to say, and the place they go next is
   * a video with no stop conditions in it at all.
   */
  steps?: TieStep[];
  mistakes?: { title: string; body: string }[];
  variations?: { name: string; body: string }[];
  ropes?: { lengthM: number; count: number }[];
  minutes?: [number, number];
};

/**
 * Opens every prop drill.
 *
 * The point of the setup step is not the rope, it is the sentence about who is
 * not in the room. A drill that starts by putting rope on something has already
 * skipped the decision that makes it a drill.
 */
const PROP_SETUP: TieStep = {
  title: "Set up the form, and check that this is a drill",
  goal: "Get a stable, unoccupied form and a rope you can work with before any pattern starts.",
  rigger:
    "Stand up something that will hold still: a dress form, a bolster, a chair back, a rolled duvet, a length of pipe. It wants to be stable enough that you can pull against it without it walking across the floor, and open enough that you can reach all the way round without moving it. Shake your rope out and check it end to end for stiff spots, frayed patches and hard-set kinks — a rope you have to fight halfway through a pattern is a rope that teaches you to yank. Then say out loud what this is: a pattern drill on an object, with nobody in it. That sentence is the whole difference between practising a craft and rehearsing something on a person who is not there yet.",
  bottom:
    "Nobody is placed in rope for this drill. If your partner is in the room, she is watching or handing you rope, not standing in for the form — the moment a person is inside the pattern this stops being the exercise on this page and becomes something this app does not teach.",
  check:
    "The form is unoccupied, stays put when you pull on it, and can be reached from every side. The rope runs freely through your hands with no snags you would have to yank through.",
  speak: "Unoccupied form, rope checked, nobody in the pattern.",
  expected: { wrapBands: 0, pose: "stand", view: "front", handsVisible: true, neckClear: true },
  wraps: [],
};

/**
 * Closes every prop drill.
 *
 * Taking it off is the half of rope handling that never gets practised, because
 * on a prop there is no reason to hurry — which is exactly why rehearsing it
 * here is worth anything at all. The skill being drilled is finding the end
 * that unmakes the pattern, and it is the same skill in the dark, on a person,
 * when it matters.
 */
const PROP_STRIPDOWN: TieStep = {
  title: "Take it off, and time yourself doing it",
  goal: "Reverse the pattern from its working end and find out how long that actually takes you.",
  rigger:
    "Do not cut it and do not pull it off over the top. Find the working end, follow it back to the last thing you did, and undo the pattern in the order you built it. Notice which parts fight you: a pass you have to hunt for, a crossing you cannot tell the direction of, a knot that has set. Those are the parts of the pattern you do not yet understand, and they are worth more attention than the parts that came out cleanly. Time the whole strip-down. On a prop that number is a curiosity; the reason to know it is that a pattern which takes you four minutes to reverse on an object you can walk round freely is not a pattern you know how to reverse at all.",
  bottom:
    "Nothing here was on a person, so nothing here needed removing in a hurry. That is the point of doing it on the form: the first time you find out a pattern is hard to undo should never be while someone is waiting inside it.",
  check:
    "The pattern came off by reversing it rather than by cutting or forcing it, the rope is back in one piece with both ends findable, and you can say which parts of the path you had to hunt for.",
  speak: "Reverse it from the working end. Notice what fights you.",
  expected: { wrapBands: 0, pose: "stand", view: "front", handsVisible: true, neckClear: true },
  wraps: [],
};

/**
 * The step a drill gets when nobody has authored one for it.
 *
 * Deliberately kept, and deliberately generic: a new pattern added in a hurry
 * still renders something honest rather than an empty page. It is not a target
 * to leave things at — a drill sitting on this alone is a drill nobody has
 * written yet, and the catalog test says so by name.
 */
const UNAUTHORED_DRILL: TieStep = {
  title: "Unoccupied handling drill",
  rigger:
    "Use a smooth, stable, unoccupied practice form. Rehearse identifying the rope path, dressing the pattern, finding both ends, and removing it promptly without any body or structural loading.",
  bottom:
    "No participant is placed in rope for this app drill. Body application requires separate, current adult consent and qualified hands-on instruction.",
  check:
    "The form is unoccupied, stable, easy to access from every side, and the rope can be removed immediately.",
  speak: "Unoccupied practice only. No person-bearing or body-placement instruction.",
  expected: { wrapBands: 1, pose: "stand", view: "front", handsVisible: true, neckClear: true },
  wraps: [],
};

/** A craft drill on an unoccupied form. Never a person, never a load. */
export function unoccupiedPractice(input: PracticeInput): Tie {
  const authored = input.steps ?? [
    { ...UNAUTHORED_DRILL, expected: { ...UNAUTHORED_DRILL.expected, wrapBands: input.bands ?? 1 } },
  ];
  return {
    slug: input.slug,
    name: input.name,
    jp: input.jp,
    summary: input.summary,
    level: input.level,
    minutes: input.minutes ?? [3, 12],
    ropes: input.ropes ?? [{ lengthM: 8, count: 1 }],
    position: "theory",
    prereqs: [],
    knots: input.knots,
    nerves: input.nerves,
    intent: [...input.intent, "unoccupied-practice"],
    goal: input.goal,
    why: `${input.purpose} This drill is for an unoccupied prop or dress form and does not validate body placement, pressure, duration, loading, or release competence.`,
    stop: [
      "Stop before applying this app drill to a person",
      "Never add body loading, attachment, neck contact, or an intimate pass",
    ],
    // Setup and strip-down are appended here rather than authored per drill so
    // that no pattern can ever be published without the sentence about who is
    // not in it, or without rehearsing how it comes apart.
    steps: [PROP_SETUP, ...authored, PROP_STRIPDOWN],
    mistakes: [
      ...(input.mistakes ?? []),
      {
        title: "Treating appearance as validation",
        body: "A tidy pattern, successful prop drill, photograph, or model response does not establish safe use on a person.",
      },
      {
        // Appended by the factory because it is the specific misreading these
        // pages invite: a dress form has no nerves, does not go numb, and never
        // says anything, so every signal that would stop you on a person is
        // simply absent here. Getting good at the pattern is getting good at the
        // pattern, and nothing else.
        title: "Mistaking a form for a rehearsal",
        body: "A dress form has no nerves to compress, no circulation to change, and nothing to say when something is wrong. Every warning that would stop you on a person is missing here, which means a pattern you can lay perfectly on a form has been tested against none of the things that actually go wrong. What transfers from this page is rope handling — tension, spacing, rope management, taking it off. Placement, pressure, duration and fit do not transfer, and no amount of repetition here turns into permission there.",
      },
    ],
    aftercare: "No participant is restrained in this drill. Inspect and store the practice rope after use.",
    variations: input.variations ?? [],
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
