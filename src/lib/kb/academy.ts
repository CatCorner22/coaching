import type { Knot, KnotStep, Tie, TieStep } from "./types";
import { getKnot } from "./knots";
import { getTie } from "./ties";
import { defaultKnotStepMedia, defaultTieStepMedia } from "./media-registry";
import { tieShape } from "./tie-factories";
import { toBullets } from "@/lib/learn/plain-language";

export const FOUNDATION_KNOT_SLUGS = [
  "somerville-bowline",
  "larks-head",
  "double-half-hitch",
  "square",
  "half-hitch",
  "overhand-on-bight",
] as const;

export const FOUNDATION_TIE_SLUGS = [
  "single-column",
  "karada",
  "shinju",
  "tasuki",
  "hip-harness",
  "chair",
] as const;

// Derived, never hand-listed. These were written when single-column and karada
// were one-step prop drills; the catalog has since rewritten both as ties that
// go on a person, and a hand-maintained copy of that answer cannot notice.
// `tieShape` reads the tie's own markers and is the single source for the
// question everywhere it is asked.
const foundationTiesByShape = (shape: ReturnType<typeof tieShape>): string[] =>
  FOUNDATION_TIE_SLUGS.filter((slug) => {
    const tie = getTie(slug);
    return tie ? tieShape(tie) === shape : false;
  });

export const FOUNDATION_PRACTICE_TIE_SLUGS: readonly string[] = foundationTiesByShape("practice");

export const FOUNDATION_INSTRUCTOR_TIE_SLUGS: readonly string[] = foundationTiesByShape("instructor");

type KnotEnrichment = {
  goal: string;
  steps: Partial<KnotStep>[];
};

const KNOT_ENRICHMENTS: Record<string, KnotEnrichment> = {
  "somerville-bowline": {
    goal: "Make a knot on a post that does not squeeze shut when you pull the rope.",
    steps: [
      {
        do: "Wrap a folded loop around a smooth post. Leave slack. Keep both rope ends visible.",
        doBullets: [
          "Fold the rope to make a loop (called a bight).",
          "Wrap that loop around a smooth post or chair leg.",
          "Leave extra slack.",
          "Keep both rope ends where you can see them.",
        ],
        check: "No person is touching the rope. You can see every part of the rope.",
        checkBullets: [
          "The post is empty — no person is involved.",
          "You can see the whole loop and both rope ends.",
        ],
        diagramId: "somerville-bowline-0",
      },
      {
        do: "Push the working loop up through the collar from bottom to top.",
        doBullets: [
          "Find the loop end you are working with.",
          "Push it up through the rope collar.",
          "Go from bottom to top.",
        ],
        check: "The collar lies flat. No twists are hidden inside.",
        checkBullets: [
          "The rope ring around the post is flat.",
          "You do not see a hidden twist inside the collar.",
        ],
        diagramId: "somerville-bowline-1",
      },
      {
        do: "Take the loop around the standing ropes. Bring it back down through the same hole.",
        doBullets: [
          "Wrap the working loop around the two standing rope parts.",
          "Bring the loop back down through the same opening it came from.",
        ],
        check: "The loop went out and came back through the same hole.",
        checkBullets: [
          "You used the same opening both times.",
          "The rope path matches the diagram.",
        ],
        diagramId: "somerville-bowline-2",
      },
      {
        do: "Neaten the knot. Pull gently. The loop must not tighten.",
        doBullets: [
          "Tidy the knot so the ropes lie flat.",
          "Pull the standing ropes gently.",
          "Watch the loop — it should stay open.",
        ],
        check: "When you tug, the loop stays open. It does not cinch shut.",
        checkBullets: [
          "The loop did not get smaller when you pulled.",
          "You could fit a finger through the loop easily.",
        ],
        diagramId: "somerville-bowline-3",
      },
    ],
  },
  "larks-head": {
    goal: "Tie a lark's head on a post using the middle of the rope.",
    steps: [
      {
        do: "Find the middle of the rope. Fold it to make a loop.",
        doBullets: ["Find the exact middle of the rope.", "Fold the rope so you have one loop and two equal ends."],
        check: "Both rope ends are the same length.",
        checkBullets: ["Hold one end in each hand.", "They reach about the same distance."],
        diagramId: "larks-head-0",
      },
      {
        do: "Wrap the loop around the post. Feed both ends through the loop.",
        doBullets: [
          "Put the loop around the post.",
          "Pass both rope ends through the loop.",
          "Pull snug but keep it flat.",
        ],
        check: "The hitch is flat. Both ends come out on the same side.",
        checkBullets: [
          "The rope lies flat against the post.",
          "Both ends exit on the same side of the hitch.",
        ],
        diagramId: "larks-head-1",
      },
    ],
  },
  "double-half-hitch": {
    goal: "Tie two half hitches the same way on practice rope.",
    steps: [
      {
        do: "Wrap the working end around the standing rope. Pass it through its own loop.",
        doBullets: [
          "Take the working end around the standing part.",
          "Pass the end through the loop you just made.",
          "Snug it flat.",
        ],
        check: "The first hitch lies flat.",
        checkBullets: ["No crossing twists.", "The hitch sits neatly on the bundle."],
        diagramId: "double-half-hitch-0",
      },
      {
        do: "Repeat the same wrap in the same direction.",
        doBullets: [
          "Make a second half hitch the same way as the first.",
          "Stack it against the first hitch.",
        ],
        check: "Both hitches go the same way. Opposite directions would slip.",
        checkBullets: [
          "Both hitches look like mirror copies.",
          "They stack in the same direction.",
        ],
        diagramId: "double-half-hitch-1",
      },
    ],
  },
  // Easy-read wording only. The catalog entry says in as many words that
  // visual flatness establishes nothing about security or load capacity, and
  // the stop strip on this very page repeats it — so no `check` here may treat
  // a neat-looking knot as proof the knot is right. That claim, and the
  // granny-versus-square framing built on it, is what the catalog removed.
  square: {
    goal: "Recognise a square knot on loose practice cord. Not for use on a person.",
    steps: [
      {
        do: "On loose, unoccupied practice cord, cross the right end over the left and tuck it under. Do not pull it tight.",
        doBullets: [
          "Use loose cord that is not on anyone.",
          "Cross the right end over the left and tuck it under.",
          "Leave it loose — do not load it.",
        ],
        check: "The cord is loose and unoccupied. Nothing is under load.",
        checkBullets: [
          "No person and no weight is on the cord.",
          "You have not tightened it down.",
        ],
        diagramId: "square-0",
      },
      {
        do: "Cross the left end over the right and tuck it under. Dress the sample only so you can recognise the shape, then untie it — appearance does not validate strength, security, or body use.",
        doBullets: [
          "Cross the left end over the right and tuck it under.",
          "Dress it only enough to recognise the shape.",
          "Untie it before you finish.",
        ],
        check: "You can name the shape, and you untied it. Looking right proves nothing about security.",
        checkBullets: [
          "You untied the sample.",
          "You are not treating a neat appearance as proof the knot is safe.",
        ],
        diagramId: "square-1",
      },
    ],
  },
  "half-hitch": {
    goal: "Recognise one half hitch on an unoccupied object.",
    steps: [
      {
        do: "On an unoccupied object, take the working end around the standing part and through its own loop, then dress it for inspection only.",
        doBullets: [
          "Use an unoccupied object — no person.",
          "Take the working end around the standing part and through its loop.",
          "Dress it for inspection; do not load it.",
        ],
        check: "It is on an unoccupied object and carries no load. A familiar-looking hitch can still move or release.",
        checkBullets: [
          "Nothing is pulling on the cord.",
          "You are not using this to select or build a loaded lock or a body-restraint component.",
        ],
        diagramId: "half-hitch-0",
      },
    ],
  },
  "figure-eight": {
    goal: "Make a figure-eight stopper in the rope tail.",
    steps: [
      {
        do: "Shape an 8 in the rope. Pass the tail back through the loop.",
        doBullets: [
          "Make a loop in the rope.",
          "Wrap the tail around to form an 8 shape.",
          "Pass the tail back through the loop.",
        ],
        check: "The 8 looks even. The tail exits where you expect.",
        checkBullets: [
          "Both loops of the 8 are about the same size.",
          "The tail points in a clear direction.",
        ],
        diagramId: "figure-eight-0",
      },
    ],
  },
  "overhand-on-bight": {
    goal: "Recognise an overhand on a bight on loose practice material. Not a cuff, not a loaded connection.",
    steps: [
      {
        do: "On loose, unoccupied practice material, fold a bight, pass it through the sample loop, and dress it only for recognition. Untie it before any loading.",
        doBullets: [
          "Fold a bight in loose, unoccupied cord.",
          "Pass it through the sample loop.",
          "Dress it only for recognition.",
          "Untie it before anything is loaded.",
        ],
        check: "You untied it. It can jam, and it is not a rapid-release method.",
        checkBullets: [
          "The sample is untied.",
          "You are not loading it or putting it on a body.",
        ],
        diagramId: "overhand-on-bight-0",
      },
    ],
  },
};

const TIE_ACADEMY: Record<string, { goal: string; steps: TieStep[] }> = {
  "single-column": {
    goal: "Practice a wrap on a post that does not squeeze shut.",
    steps: [
      {
        title: "Set up the post",
        goal: "Put rope on a stable post — no person involved.",
        rigger:
          "Pick a smooth post (chair leg, PVC pipe, or dress-form post). Lay the rope so you can reach both ends.",
        riggerBullets: [
          "Choose one smooth post or chair leg.",
          "Lay the rope on the post.",
          "Make sure you can reach both rope ends.",
        ],
        bottom: "No person is in rope for this drill.",
        bottomBullets: ["This is practice on a thing, not a person."],
        check: "The post is stable and empty. You can reach every side.",
        checkBullets: [
          "The post does not wobble.",
          "No person is touching the rope.",
          "You can walk around the post.",
        ],
        speak: "Unoccupied post only. Both rope ends reachable.",
        expected: { wrapBands: 0, pose: "stand", view: "front", handsVisible: true, neckClear: true },
        wraps: [],
      },
      {
        title: "Wrap once",
        goal: "Make one flat ring around the post.",
        rigger: "Wrap the working loop around the post one time. Keep the ring flat — no twisted crossings.",
        riggerBullets: [
          "Wrap the rope around the post once.",
          "Keep the ring flat like a collar.",
          "Do not let the rope cross over itself in a twist.",
        ],
        bottom: "Still practice on the post only.",
        bottomBullets: ["No person is involved."],
        check: "One flat ring sits on the post. You still see slack.",
        checkBullets: [
          "You see exactly one ring around the post.",
          "Extra slack is still visible.",
        ],
        speak: "One flat wrap. Keep slack visible.",
        expected: { wrapBands: 1, pose: "stand", view: "front", handsVisible: true, neckClear: true },
        wraps: [{ kind: "cuff", at: "lw" }],
      },
      {
        title: "Lock with Somerville bowline",
        goal: "Finish the knot that stays open when you pull.",
        rigger:
          "Pass the loop through the collar, around the standing ropes, and back down. Watch that the loop does not tighten.",
        riggerBullets: [
          "Pass the working loop up through the collar.",
          "Wrap it around the standing ropes.",
          "Bring it back down through the same opening.",
          "Neaten the knot.",
        ],
        bottom: "This checks rope handling — not fit on a body.",
        bottomBullets: ["We are not testing this on a person."],
        check: "When you pull gently, the loop stays open.",
        checkBullets: [
          "Pull the standing ropes lightly.",
          "The loop did not squeeze shut.",
        ],
        speak: "Dress the knot. Confirm it does not cinch.",
        expected: { wrapBands: 1, pose: "stand", view: "front", handsVisible: true, neckClear: true },
        wraps: [{ kind: "cuff", at: "lw" }, { kind: "band", y: 0.35 }],
      },
      {
        title: "Take it off",
        goal: "Remove all rope from the post.",
        rigger: "Follow both rope ends. Loosen the knot. Take all rope off the post.",
        riggerBullets: [
          "Find both rope ends.",
          "Loosen the knot slowly.",
          "Slide all rope off the post.",
        ],
        bottom: "No person was restrained in this drill.",
        bottomBullets: ["The post should look exactly like before you started."],
        check: "The post is bare. All rope is off.",
        checkBullets: [
          "No rope is left on the post.",
          "The knot is fully undone.",
        ],
        speak: "Remove all rope. Post is clear.",
        expected: { wrapBands: 0, pose: "stand", view: "front", handsVisible: true, neckClear: true },
        wraps: [],
      },
    ],
  },
  karada: {
    goal: "Lay a diamond karada pattern on an empty dress form.",
    steps: [
      {
        title: "Center the rope",
        goal: "Find the middle and place it on the center line.",
        rigger: "Put the rope midpoint at the top center of an empty dress form. Keep both ends equal.",
        riggerBullets: [
          "Find the middle of the rope.",
          "Place it at the top center of the form.",
          "Make both ends the same length.",
        ],
        bottom: "No neck contact. No intimate passes. No restraint.",
        bottomBullets: ["The dress form is empty.", "This is pattern practice only."],
        check: "The middle sits on the center line. The form is empty.",
        checkBullets: [
          "The rope midpoint is centered.",
          "No person is at the form.",
        ],
        speak: "Center the rope on an empty form.",
        expected: { wrapBands: 0, pose: "stand", view: "front", handsVisible: true, neckClear: true },
        wraps: [{ kind: "chest" }],
      },
      {
        title: "First diamond",
        goal: "Make the first diamond crossing.",
        rigger: "Bring both tails down. Cross them at the lower mark. Keep spacing even.",
        riggerBullets: [
          "Run both rope ends downward.",
          "Cross them at the lower point.",
          "Keep the crossing flat.",
        ],
        bottom: "Pattern practice only.",
        bottomBullets: ["Stop if anything feels unclear."],
        check: "The crossing is flat. Left and right look even.",
        checkBullets: [
          "The X lies flat on the form.",
          "Both sides look balanced.",
        ],
        speak: "First diamond crossing. Dress flat.",
        expected: { wrapBands: 1, pose: "stand", view: "front", handsVisible: true, neckClear: true },
        wraps: [{ kind: "chest" }, { kind: "diamond", cy: 0.42 }],
      },
      {
        title: "Finish the pattern",
        goal: "Add the rest of the diamonds.",
        rigger: "Continue the pattern down the form. Keep every band flat and easy to inspect.",
        riggerBullets: [
          "Add each diamond the same way.",
          "Reverse tension between diamonds as you go down.",
          "Keep bands flat and visible.",
        ],
        bottom: "Stop before using this on a body.",
        bottomBullets: ["In-person instruction is required for body use."],
        check: "All bands lie flat. You can undo from either end.",
        checkBullets: [
          "No twisted or hidden bands.",
          "Either rope end can start an undo.",
        ],
        speak: "Complete the pattern. Keep bands inspectable.",
        expected: { wrapBands: 3, pose: "stand", view: "front", handsVisible: true, neckClear: true },
        wraps: [{ kind: "chest" }, { kind: "diamond", cy: 0.42 }, { kind: "diamond", cy: 0.58 }],
      },
    ],
  },
  shinju: {
    goal: "Learn chest-harness words on an empty form — not on a person.",
    steps: [
      {
        title: "Look and name only",
        goal: "Point to where a chest harness would go — do not load the form.",
        rigger:
          "On an empty form, mark where a chest harness would cross the upper arms and chest bone. Do not pull or load.",
        riggerBullets: [
          "Use an empty dress form.",
          "Point to where bands would cross the upper arms.",
          "Point to where a band would cross the chest.",
          "Do not tighten or load the rope.",
        ],
        bottom: "Using this on a body needs a qualified instructor in the room.",
        bottomBullets: ["This app does not teach body harness construction."],
        check: "The form stayed empty. No loading or neck pressure.",
        checkBullets: [
          "No person was involved.",
          "You only pointed and named — no force applied.",
        ],
        speak: "Recognition drill only. Seek instruction for body use.",
        expected: { wrapBands: 1, pose: "stand", view: "front", handsVisible: true, neckClear: true },
        wraps: [{ kind: "chest" }],
      },
    ],
  },
  tasuki: {
    goal: "Lay a tasuki shoulder line on an empty form.",
    steps: [
      {
        title: "Shoulder strap line",
        goal: "Show the strap path without loading the form.",
        rigger: "Run a doubled line from the upper back over each shoulder to the front on an empty form.",
        riggerBullets: [
          "Start at the upper back of the form.",
          "Run the line over one shoulder to the front.",
          "Mirror the line on the other shoulder.",
        ],
        bottom: "No person-bearing use in this app.",
        bottomBullets: ["Practice on the form only."],
        check: "Both strap lines are visible and even. The form is empty.",
        checkBullets: [
          "Left and right look symmetric.",
          "No person is at the form.",
        ],
        speak: "Lay the tasuki line on an empty form.",
        expected: { wrapBands: 1, pose: "stand", view: "back", handsVisible: true, neckClear: true },
        wraps: [{ kind: "stem", y1: 0.2, y2: 0.55 }],
      },
    ],
  },
  "hip-harness": {
    goal: "Recognize a hip band on an empty dress form.",
    steps: [
      {
        title: "Hip band drill",
        goal: "Place one flat band at hip height on the form.",
        rigger: "Wrap one flat band at hip height on an empty form. Keep it level like a belt.",
        riggerBullets: [
          "Wrap once at hip height on the form.",
          "Keep the band parallel to the floor.",
          "Do not pull or load.",
        ],
        bottom: "Body fit needs in-person instruction.",
        bottomBullets: ["This is naming and recognition only."],
        check: "The band is flat. The form is empty.",
        checkBullets: [
          "The band does not twist.",
          "No person is involved.",
        ],
        speak: "Hip band on empty form only.",
        expected: { wrapBands: 1, pose: "stand", view: "front", handsVisible: true, neckClear: true },
        wraps: [{ kind: "hip" }],
      },
    ],
  },
  "double-column": {
    goal: "Wrap two posts side by side and see how a cinch joins them.",
    steps: [
      {
        title: "Two posts",
        goal: "Wrap two empty posts once each.",
        rigger: "Use two matching posts. Wrap each once with a flat single column.",
        riggerBullets: [
          "Set two posts side by side.",
          "Wrap the first post once, flat.",
          "Wrap the second post once, flat.",
        ],
        bottom: "No limb binding in this drill.",
        bottomBullets: ["Posts only — not a person."],
        check: "Both posts have one flat wrap. Both are empty.",
        checkBullets: [
          "Each post has exactly one ring.",
          "No person is touching either post.",
        ],
        speak: "Two flat columns on empty posts.",
        expected: { wrapBands: 2, pose: "stand", view: "front", handsVisible: true, neckClear: true },
        wraps: [{ kind: "cuff", at: "lw" }, { kind: "cuff", at: "rw" }],
      },
      {
        title: "Add the cinch",
        goal: "See how a cinch connects the two posts.",
        rigger: "Run a line between the posts to form a cinch you can recognize and undo.",
        riggerBullets: [
          "Route a working line between the two posts.",
          "Form a clear cinch between them.",
          "Keep it loose enough to undo without cutting.",
        ],
        bottom: "Cinches concentrate force — recognition only here.",
        bottomBullets: ["Do not load the cinch in this drill."],
        check: "You can see the cinch. You can release it without cutting.",
        checkBullets: [
          "The cinch is visible between the posts.",
          "You know which rope to pull to undo it.",
        ],
        speak: "Recognize the cinch between columns.",
        expected: { wrapBands: 2, pose: "stand", view: "front", handsVisible: true, neckClear: true },
        wraps: [{ kind: "cuff", at: "lw" }, { kind: "cuff", at: "rw" }, { kind: "band", y: 0.5, w: 1.2 }],
      },
    ],
  },
  chair: {
    goal: "Inspect an empty chair for rope risks — do not attach rope to a person.",
    steps: [
      {
        title: "Empty chair walk-around",
        goal: "Identify pinch points and exits on an unoccupied chair.",
        rigger:
          "Place an empty chair in your practice space. Walk around it and point to legs, seat edge, back rest, and floor contact points.",
        riggerBullets: [
          "Use a stable chair with no person in it.",
          "Point to each leg and the seat edge.",
          "Find where rope could pinch or snag.",
          "Locate where trauma shears could reach every rope path.",
        ],
        bottom: "Household chairs are not verified restraint systems.",
        bottomBullets: [
          "Do not sit anyone in rope from this app.",
          "This is a risk map, not a tie lesson.",
        ],
        check: "You named exits, pinch points, and shear access without loading the chair.",
        checkBullets: [
          "The chair stayed empty the whole time.",
          "You can name at least two pinch or snag zones.",
          "Shears are within reach of the chair.",
        ],
        speak: "Empty chair inspection only. No attachment.",
        expected: { wrapBands: 0, pose: "sit", view: "front", handsVisible: true, neckClear: true },
        wraps: [],
      },
      {
        title: "Questions for your instructor",
        goal: "Prepare questions before any in-person furniture work.",
        rigger:
          "Write down: How do we monitor circulation? What is the release order? What if the person slides off the seat?",
        riggerBullets: [
          "List three questions about monitoring.",
          "List two questions about rapid release.",
          "List one question about chair stability.",
        ],
        bottom: "Furniture restraint requires qualified hands-on instruction.",
        bottomBullets: ["Do not combine chair and rope on a person from this app."],
        check: "You have written questions — not a construction plan.",
        checkBullets: [
          "Your notes are questions, not step-by-step body steps.",
          "You understand Studio is unavailable for this route.",
        ],
        speak: "Prep questions only. Seek in-person instruction.",
        expected: { wrapBands: 0, pose: "sit", view: "front", handsVisible: true, neckClear: true },
        wraps: [],
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
  const diagramId = patch?.diagramId ?? `${slug}-${index}`;
  return {
    ...step,
    do: patch?.do ?? step.body,
    check: patch?.check ?? fallbackCheck ?? "It looks like the diagram.",
    doBullets: patch?.doBullets,
    checkBullets: patch?.checkBullets,
    diagramId,
    media: patch?.media ?? defaultKnotStepMedia(slug, index, diagramId),
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

  // TIE_ACADEMY enriches; it does not replace. It was written when every tie in
  // the catalog carried exactly one step, so replacing `base.steps` with it was
  // free. The catalog now teaches several ties in full — single-column in ten
  // steps, karada in nine, double-column in seven — and a wholesale replace
  // silently threw all of that away, rendering four steps, three, and two. The
  // page looked fine, which is what made it dangerous: the missing steps
  // included rehearsing the release and the next-morning symptom check.
  //
  // So the richer source wins, and the academy table supplies the parts it is
  // actually for: the goal line, and per-step media where a step has none.
  const catalogWins = base.steps.length > academy.steps.length;
  const source = catalogWins ? base.steps : academy.steps;
  const steps = source.map((step, i) => {
    const cumulative = source.slice(0, i + 1).flatMap((x) => x.wraps);
    return {
      ...step,
      // Catalog steps carry authored prose but none of the Academy's easy-read
      // fields, so derive them rather than invent them: `speak` is already the
      // one-line summary of the step, and the rest split on sentence
      // boundaries. `??` means an academy-authored step keeps its own wording.
      goal: step.goal ?? step.speak,
      riggerBullets: step.riggerBullets ?? toBullets(step.rigger),
      bottomBullets: step.bottomBullets ?? toBullets(step.bottom),
      checkBullets: step.checkBullets ?? toBullets(step.check),
      media: step.media ?? defaultTieStepMedia(cumulative, slug, i),
    };
  });
  return {
    ...base,
    // The goal line is a caption for the steps directly beneath it, so it has to
    // come from whichever source won above. `academy.goal` describes the
    // Academy's own steps — for single-column, karada and double-column it says
    // "on a post" / "on an empty dress form" while the catalog steps now on the
    // page choose a spot on the forearm, say to watch her face, and end on a
    // next-morning symptom check. That is the same stale-shadow bug the step
    // reconciliation above was written to end, two lines further down.
    goal: catalogWins ? (base.goal ?? base.why.split(".")[0] + ".") : academy.goal,
    steps,
  };
}

export function isFoundationKnot(slug: string) {
  return (FOUNDATION_KNOT_SLUGS as readonly string[]).includes(slug);
}

export function isFoundationTie(slug: string) {
  return (FOUNDATION_TIE_SLUGS as readonly string[]).includes(slug);
}

export function isInstructorRoute(tie: Tie) {
  return tieShape(tie) === "instructor";
}

/**
 * Whether a lesson's Do/Check acknowledgement is mandatory before advancing.
 *
 * Keyed on the tie's own shape rather than on FOUNDATION_TIE_SLUGS. That list
 * was frozen while double-column was a one-step prop drill; the catalog then
 * rewrote it as a seven-step lesson that goes on a person, and the list did not
 * learn — so the one guided tie missing from it rendered "rehearse getting it
 * off", the cinch step, and the twenty-four hour check with no acknowledgement
 * at all, while its two identically-worded siblings required one.
 */
export function requiresStepConfirmation(tie: Tie): boolean {
  return tieShape(tie) === "guided" || isFoundationTie(tie.slug);
}
