import type { Knot, KnotStep, Tie, TieStep } from "./types";
import { getKnot } from "./knots";
import { getTie } from "./ties";

export const FOUNDATION_KNOT_SLUGS = [
  "somerville-bowline",
  "larks-head",
  "double-half-hitch",
  "square",
  "half-hitch",
  "figure-eight",
] as const;

export const FOUNDATION_TIE_SLUGS = [
  "single-column",
  "karada",
  "shinju",
  "tasuki",
  "hip-harness",
  "double-column",
] as const;

type KnotEnrichment = {
  goal: string;
  steps: Partial<KnotStep>[];
};

const KNOT_ENRICHMENTS: Record<string, KnotEnrichment> = {
  "somerville-bowline": {
    goal: "Dress a non-cinching single-column knot on an unoccupied column.",
    steps: [
      {
        do: "Wrap a folded bight around a smooth column. Leave slack and both tails visible.",
        check: "The column is unoccupied and you can see every rope path.",
        diagramId: "somerville-bowline-0",
      },
      {
        do: "Pass the working bight up through the collar from bottom to top.",
        check: "The collar stays flat — no twists hiding inside.",
        diagramId: "somerville-bowline-1",
      },
      {
        do: "Take the bight around the standing pair and back down through the same opening.",
        check: "The bight retraces the same hole it came through.",
        diagramId: "somerville-bowline-2",
      },
      {
        do: "Dress the knot. Pull standing lines gently and confirm the loop does not tighten.",
        check: "The practice loop stays open when you tug — it does not cinch shut.",
        diagramId: "somerville-bowline-3",
      },
    ],
  },
  "larks-head": {
    goal: "Tie a lark's head on a bight around an unoccupied object.",
    steps: [
      {
        do: "Find the rope midpoint and fold it into a bight.",
        check: "Both running ends are equal length.",
        diagramId: "larks-head-0",
      },
      {
        do: "Pass the bight around the object, then feed both tails through the bight.",
        check: "The hitch sits flat and both tails exit on the same side.",
        diagramId: "larks-head-1",
      },
    ],
  },
  "double-half-hitch": {
    goal: "Stack two half hitches in the same direction on unoccupied rope.",
    steps: [
      {
        do: "Wrap the working end around the standing part and through its own loop.",
        check: "First hitch lies flat against the bundle.",
        diagramId: "double-half-hitch-0",
      },
      {
        do: "Repeat in the same direction — second hitch nests against the first.",
        check: "Both hitches stack the same way; opposite directions would slip.",
        diagramId: "double-half-hitch-1",
      },
    ],
  },
  square: {
    goal: "Join two rope ends with a square knot (not a granny).",
    steps: [
      {
        do: "Right end over left, tuck under, pull snug.",
        check: "First half of the square is flat.",
        diagramId: "square-0",
      },
      {
        do: "Left over right, tuck under. Each tail exits beside its own standing part.",
        check: "No sliding granny loops — both parts lie flat.",
        diagramId: "square-1",
      },
    ],
  },
  "half-hitch": {
    goal: "Tie one half hitch on unoccupied material.",
    steps: [
      {
        do: "Pass the working end around the standing part and through its own loop.",
        check: "The hitch is dressed flat with no load.",
        diagramId: "half-hitch-0",
      },
    ],
  },
  "figure-eight": {
    goal: "Form a figure-eight stopper knot in the rope tail.",
    steps: [
      {
        do: "Make a loop, pass the tail around and back through to form an 8 shape.",
        check: "The 8 is symmetric and the tail exits predictably.",
        diagramId: "figure-eight-0",
      },
    ],
  },
};

const TIE_ACADEMY: Record<string, { goal: string; steps: TieStep[] }> = {
  "single-column": {
    goal: "Recognize and dress a non-cinching column wrap on an unoccupied prop.",
    steps: [
      {
        title: "Set up the column",
        goal: "Place rope on a stable, unoccupied form.",
        rigger:
          "Choose a smooth column (chair leg, PVC pipe, dress-form post). Drape the rope so both tails are reachable.",
        bottom: "No person is in rope for this drill.",
        check: "The form is stable, unoccupied, and you can reach every side.",
        speak: "Unoccupied column only. Both tails reachable.",
        expected: { wrapBands: 0, pose: "stand", view: "front", handsVisible: true, neckClear: true },
        wraps: [],
      },
      {
        title: "Wrap the column",
        goal: "Make one flat collar around the prop.",
        rigger: "Wrap the working bight around the column once. Keep the collar flat and parallel — no crossing twists.",
        bottom: "Still unoccupied practice only.",
        check: "One clean band sits flat on the prop; slack remains visible.",
        speak: "One flat wrap. Keep slack visible.",
        expected: { wrapBands: 1, pose: "stand", view: "front", handsVisible: true, neckClear: true },
        wraps: [{ kind: "cuff", at: "lw" }],
      },
      {
        title: "Form the Somerville bowline",
        goal: "Complete the non-cinching lock on the prop.",
        rigger:
          "Pass the bight through the collar, around the standing pair, and back down. Dress the knot while watching for cinching behavior.",
        bottom: "This validates rope handling, not body fit.",
        check: "The loop does not tighten when you pull the standing lines gently.",
        speak: "Dress the knot. Confirm it does not cinch.",
        expected: { wrapBands: 1, pose: "stand", view: "front", handsVisible: true, neckClear: true },
        wraps: [{ kind: "cuff", at: "lw" }, { kind: "band", y: 0.35 }],
      },
      {
        title: "Remove promptly",
        goal: "Undo the structure completely.",
        rigger: "Trace both tails, loosen the knot, and remove all rope from the prop without loading or attaching anything.",
        bottom: "No participant restraint occurs in this drill.",
        check: "The prop is bare and rope is fully off.",
        speak: "Remove all rope. Prop is clear.",
        expected: { wrapBands: 0, pose: "stand", view: "front", handsVisible: true, neckClear: true },
        wraps: [],
      },
    ],
  },
  karada: {
    goal: "Lay a diamond karada pattern on an unoccupied dress form.",
    steps: [
      {
        title: "Center the rope",
        goal: "Find midpoint and mark the vertical axis on the form.",
        rigger: "Place the rope midpoint at the upper center of an unoccupied dress form. Keep tails equal.",
        bottom: "No neck contact, no intimate passes, no restraint.",
        check: "Midpoint sits on center line; form is unoccupied.",
        speak: "Center the rope on an unoccupied form.",
        expected: { wrapBands: 0, pose: "stand", view: "front", handsVisible: true, neckClear: true },
        wraps: [{ kind: "chest" }],
      },
      {
        title: "First diamond band",
        goal: "Create the upper diamond crossing.",
        rigger: "Bring both tails down and cross them at the marked lower point. Dress for even spacing.",
        bottom: "Pattern practice only.",
        check: "Crossing sits flat; diamonds look even left and right.",
        speak: "First diamond crossing. Dress flat.",
        expected: { wrapBands: 1, pose: "stand", view: "front", handsVisible: true, neckClear: true },
        wraps: [{ kind: "chest" }, { kind: "diamond", cy: 0.42 }],
      },
      {
        title: "Complete the pattern",
        goal: "Add remaining diamonds and reverse tensions.",
        rigger: "Continue the pattern down the form using reverse-tension folds between diamonds. Keep every band inspectable.",
        bottom: "Stop before any body application.",
        check: "All bands lie flat; you can undo from either tail.",
        speak: "Complete the pattern. Keep bands inspectable.",
        expected: { wrapBands: 3, pose: "stand", view: "front", handsVisible: true, neckClear: true },
        wraps: [{ kind: "chest" }, { kind: "diamond", cy: 0.42 }, { kind: "diamond", cy: 0.58 }],
      },
    ],
  },
  shinju: {
    goal: "Practice chest-harness vocabulary on an unoccupied form (instructor route for body use).",
    steps: [
      {
        title: "Recognition only",
        goal: "Identify harness risk zones without constructing on a person.",
        rigger:
          "On an unoccupied form, mark where a chest harness would cross the upper arms and sternum. Do not load or restrain.",
        bottom: "Body application requires qualified hands-on instruction.",
        check: "Form stays unoccupied; no neck or axilla compression simulated with load.",
        speak: "Recognition drill only. Seek instruction for body use.",
        expected: { wrapBands: 1, pose: "stand", view: "front", handsVisible: true, neckClear: true },
        wraps: [{ kind: "chest" }],
      },
    ],
  },
  tasuki: {
    goal: "Practice a tasuki shoulder strap pattern on an unoccupied form.",
    steps: [
      {
        title: "Shoulder strap layout",
        goal: "Lay the strap line without loading the form.",
        rigger: "Run a doubled line from upper back over each shoulder to the front anchor point on the unoccupied form.",
        bottom: "No person-bearing use in this app.",
        check: "Strap lines are visible and symmetric; form is unoccupied.",
        speak: "Lay the tasuki line on an unoccupied form.",
        expected: { wrapBands: 1, pose: "stand", view: "back", handsVisible: true, neckClear: true },
        wraps: [{ kind: "stem", y1: 0.2, y2: 0.55 }],
      },
    ],
  },
  "hip-harness": {
    goal: "Recognize hip harness bands on an unoccupied form.",
    steps: [
      {
        title: "Hip band placement drill",
        goal: "Lay a hip band on a dress form without loading.",
        rigger: "Wrap a single band at hip height on an unoccupied form. Keep it flat and parallel to the floor.",
        bottom: "Body fit and loading require in-person instruction.",
        check: "Band is flat; form unoccupied; no groin or nerve loading simulated.",
        speak: "Hip band on unoccupied form only.",
        expected: { wrapBands: 1, pose: "stand", view: "front", handsVisible: true, neckClear: true },
        wraps: [{ kind: "hip" }],
      },
    ],
  },
  "double-column": {
    goal: "Compare two parallel columns and a cinch on paired props.",
    steps: [
      {
        title: "Set paired columns",
        goal: "Place two unoccupied columns side by side.",
        rigger: "Use two identical props. Wrap each once with a flat single column.",
        bottom: "No limb binding in this drill.",
        check: "Both props are wrapped once, flat, and unoccupied.",
        speak: "Two flat columns on unoccupied props.",
        expected: { wrapBands: 2, pose: "stand", view: "front", handsVisible: true, neckClear: true },
        wraps: [{ kind: "cuff", at: "lw" }, { kind: "cuff", at: "rw" }],
      },
      {
        title: "Add the cinch",
        goal: "Recognize how a cinch joins the columns.",
        rigger: "Route a working line between the two columns to form a recognizable cinch on the unoccupied props.",
        bottom: "Cinches concentrate force — this drill is recognition only.",
        check: "Cinch is visible and can be released without cutting.",
        speak: "Recognize the cinch between columns.",
        expected: { wrapBands: 2, pose: "stand", view: "front", handsVisible: true, neckClear: true },
        wraps: [{ kind: "cuff", at: "lw" }, { kind: "cuff", at: "rw" }, { kind: "band", y: 0.5, w: 1.2 }],
      },
    ],
  },
};

export function enrichKnotStep(
  step: KnotStep,
  index: number,
  slug: string,
  fallbackCheck?: string,
): KnotStep {
  const patch = KNOT_ENRICHMENTS[slug]?.steps[index];
  return {
    ...step,
    do: patch?.do ?? step.body,
    check: patch?.check ?? fallbackCheck ?? "Structure matches the diagram.",
    diagramId: patch?.diagramId ?? `${slug}-${index}`,
  };
}

export function getAcademyKnot(slug: string): (Knot & { steps: KnotStep[] }) | undefined {
  const knot = getKnot(slug);
  if (!knot) return undefined;
  const enrichment = KNOT_ENRICHMENTS[slug];
  return {
    ...knot,
    goal: enrichment?.goal ?? knot.summary.split(".")[0] + ".",
    steps: knot.steps.map((s, i) => enrichKnotStep(s, i, slug, knot.watch[i] ?? knot.watch[0])),
  };
}

export function getAcademyTie(slug: string): Tie | undefined {
  const base = getTie(slug);
  if (!base) return undefined;
  const academy = TIE_ACADEMY[slug];
  if (!academy) return { ...base, goal: base.why.split(".")[0] + "." };
  return {
    ...base,
    goal: academy.goal,
    steps: academy.steps,
  };
}

export function isFoundationKnot(slug: string) {
  return (FOUNDATION_KNOT_SLUGS as readonly string[]).includes(slug);
}

export function isFoundationTie(slug: string) {
  return (FOUNDATION_TIE_SLUGS as readonly string[]).includes(slug);
}

export function isInstructorRoute(tie: Tie) {
  return tie.minutes[1] === 0;
}
