import type { Tie } from "./types";

/**
 * The two shapes every catalog tie takes, in one place.
 *
 * Each entry is either a drill on an unoccupied prop or a recognition-only
 * pointer at a qualified instructor. There is deliberately no third shape:
 * this app has no bucket for "here is how to put this on a person."
 *
 * The boilerplate lives here because it is the safety copy. It was previously
 * written out twice, in `ties.ts` and `more-ties.ts`, in wordings that had
 * already drifted apart — and a third copy was about to be added for the
 * expanded catalog. One source is the only way that copy stays true.
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
