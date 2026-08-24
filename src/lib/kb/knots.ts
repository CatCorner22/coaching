import type { Knot } from "./types";
import { MORE_KNOTS } from "./more-knots";

const CORE_KNOTS: Knot[] = [
  {
    slug: "somerville-bowline",
    name: "Somerville Bowline",
    jp: "非締め付けシングルコラム",
    summary:
      "A non-cinching single-column knot taught here only as an unoccupied handling drill. Body use still requires consent, direct monitoring, rapid release, and hands-on instruction.",
    cinches: false,
    loadBearing: false,
    usedIn: ["single-column", "takate-kote", "futomomo", "chair"],
    steps: [
      {
        title: "Bight around a practice column",
        body: "Fold a working bight and wrap it around a smooth, unoccupied practice column so the folded end and standing pair sit side by side. Leave visible slack and enough tail to complete the drill.",
        speak: "Practice on an unoccupied column with visible slack.",
      },
      {
        title: "Working bight through",
        body: "Pass the working bight up through the collar of rope. Keep the collar flat and easy to inspect.",
        speak: "Pass the working bight up through the collar.",
      },
      {
        title: "Around the standing pair",
        body: "Take that bight around the standing pair (or around the whole collar, depending on the variation you learned) and back down through the same opening it came from.",
        speak: "Around the standing pair, then back down through.",
      },
      {
        title: "Dress and set",
        body: "Dress the knot on the unoccupied practice column. Pull the standing pair gently and confirm that the practice loop does not constrict; this drill does not validate fit, placement, or use on a person.",
        speak: "Dress the practice knot and confirm its structure without body loading.",
      },
    ],
    watch: [
      "If the practice loop cinches, untie and restart; do not troubleshoot a body cuff while it is under tension.",
      "A prop drill cannot establish safe body placement, pressure, duration, or release competence.",
    ],
  },
  {
    slug: "larks-head",
    name: "Lark's Head",
    jp: "ラークスヘッド",
    summary:
      "A cow-hitch category on a bight. Because it cinches, this app teaches it on an unoccupied object only—not as a cuff, harness start, or person-bearing component.",
    cinches: true,
    loadBearing: false,
    usedIn: ["karada", "shinju", "hishi", "matanawa"],
    steps: [
      {
        title: "Find the middle",
        body: "Double the rope at its midpoint. You now have a bight and two running ends.",
        speak: "Find the midpoint and double the rope.",
      },
      {
        title: "Collar",
        body: "Pass the bight around an unoccupied practice object. Feed the running ends through the bight and dress the hitch for inspection.",
        speak: "Bight around, ends through, snug.",
      },
    ],
    watch: [
      "This hitch cinches and is not taught here as a body cuff or harness start.",
      "Use only an unoccupied practice object in this app; seek hands-on instruction for body application.",
    ],
  },
  {
    slug: "double-half-hitch",
    name: "Double Half Hitch",
    jp: "ダブルハーフヒッチ",
    summary:
      "Two half hitches stacked, demonstrated here on unoccupied material only. This entry does not approve a loaded or person-bearing use.",
    cinches: false,
    loadBearing: false,
    usedIn: ["takate-kote", "shinju", "futomomo", "hip-harness"],
    steps: [
      {
        title: "First hitch",
        body: "On an unoccupied practice bundle, pass the working end around the standing part and through its own loop. Dress it without loading.",
        speak: "First half hitch against the wrap.",
      },
      {
        title: "Second hitch",
        body: "Repeat in the same direction so the two hitches nest. Dress them flat. This is not a cinch — it is a lock.",
        speak: "Second hitch in the same direction. Dress them flat.",
      },
    ],
    watch: [
      "Opposite-direction hitches slip. Same direction, stacked.",
      "Do not use this app entry to select or validate a lock for a loaded system.",
    ],
  },
  {
    slug: "wrap-cinch",
    name: "Wrap and Cinch",
    jp: "巻きと締め",
    summary:
      "A wrap-and-cinch structure shown as unoccupied craft. Cinches can concentrate pressure; this app does not teach body placement or loaded use.",
    cinches: true,
    loadBearing: false,
    usedIn: ["futomomo", "takate-kote", "double-column", "tengu"],
    steps: [
      {
        title: "Wraps",
        body: "Lay parallel wraps on a smooth, unoccupied practice form. Keep them flat and visible for inspection.",
        speak: "Lay parallel wraps. Keep them flat.",
      },
      {
        title: "Cinch",
        body: "On the unoccupied form, route the working rope around the practice band so the structure can be recognized and released without body loading.",
        speak: "Recognize the cinch on an unoccupied practice band.",
      },
    ],
    watch: [
      "Do not derive a body-placement rule from this diagram or from anatomical landmarks.",
      "Learn body application, monitoring, and rapid release from a qualified in-person instructor.",
    ],
  },
  {
    slug: "square",
    name: "Square Knot",
    jp: "本結び",
    summary:
      "A decorative end-joining category shown only on loose, unoccupied material. It is not a lock, backup, or component for body restraint or a person-bearing system.",
    cinches: false,
    loadBearing: false,
    usedIn: ["karada", "hishi", "kikkou"],
    steps: [
      {
        title: "First throw",
        body: "On loose, unoccupied practice material, cross the right end over the left and tuck it under without applying load.",
        speak: "Practice the first throw only on loose, unoccupied material.",
      },
      {
        title: "Second throw",
        body: "Cross the left end over the right and tuck it under. Dress the loose sample only for visual recognition, then untie it; appearance does not validate strength, security, or body use.",
        speak: "Dress the loose sample for recognition, then untie it.",
      },
    ],
    watch: [
      "Visual flatness does not establish security, compatibility, or load capacity.",
      "Do not use this entry to choose, back up, or validate any loaded or person-bearing connection.",
    ],
  },
  {
    slug: "reverse-tension",
    name: "Reverse Tension",
    jp: "返し",
    summary:
      "The Japanese way to change direction without a bulky knot: wrap, then fold the working pair back over itself so friction holds the line. The backbone of harnesses.",
    cinches: false,
    loadBearing: false,
    usedIn: ["karada", "shinju", "hishi", "tasuki", "kikkou"],
    // Written out properly because five catalog entries send the reader here —
    // karada, shinju, hishi, tasuki and kikkou all say "turn it with a reverse
    // tension" and then stop. Before this, the page they arrived at described
    // the whole technique in one sentence ("reverse 180 degrees so the working
    // pair lies over the standing pair") with no account of which way the fold
    // goes, what dressing it means, or how to tell a good one from one that
    // will creep. A pattern drill that cites a knot entry is only as followable
    // as the entry it cites.
    steps: [
      {
        title: "1 · Understand what you are about to make",
        body: "A reverse tension is a direction change, not a knot. You bring the doubled rope up to the point where you want the line to turn, fold it back on itself, and let the friction of rope lying against rope hold the turn while the standing part stays under tension. Nothing is tied. That is the entire point: a knot at every turn would leave a hard lump at every turn, and a harness is mostly turns.",
        do: "Look at where your rope is going and decide where it should turn. Say the direction out loud before you fold anything — this is the step people skip, and a fold made in the wrong direction has to be undone rather than adjusted.",
        doBullets: [
          "Find the point where you want the line to change direction.",
          "Say out loud which way it is going to turn.",
          "Keep the standing pair — the rope behind you — under steady tension.",
        ],
        check: "You can point at the turning point and say which direction the rope leaves it. Nothing is tied yet.",
        checkBullets: [
          "You know where the turn happens.",
          "You know which way the rope leaves it.",
          "No knot has been made.",
        ],
        speak: "This is a direction change, not a knot. Decide which way it turns.",
      },
      {
        title: "2 · Take the working pair under the wraps",
        body: "Pass the working pair — the two strands you are travelling with — underneath the wrap already lying at the turning point, and bring it out the other side. Go under the wrap, not over it: the wrap is what the fold will press against, and a fold sitting on top of a wrap has nothing holding it down. On a prop you can lift the wrap with a finger to make room. If the rope will not pass without force, the wrap is too tight to work with rather than the pass being wrong.",
        do: "Slide the working pair under the existing wrap and out the far side, keeping the two strands flat and side by side as they go.",
        doBullets: [
          "Pass the working pair under the wrap, not over it.",
          "Keep the two strands flat and parallel — do not let them twist.",
          "If it will not pass without forcing, loosen the wrap instead of pulling harder.",
        ],
        check: "The working pair comes out the far side of the wrap, both strands flat and lying beside each other rather than crossed.",
        checkBullets: [
          "It went under the wrap.",
          "Both strands are flat, not twisted around each other.",
          "You did not have to force it.",
        ],
        speak: "Under the wrap, not over it. Both strands flat.",
      },
      {
        title: "3 · Fold it back on itself, one hundred and eighty degrees",
        body: "Now turn the working pair back the way it came, folding it hard over the wrap so it lies against its own standing part. That fold is the whole mechanism: rope pressed against rope, held there by the tension you keep on the standing pair. Fold it fully — a lazy fold of ninety or a hundred and twenty degrees has far less rope in contact and will creep as soon as the pull changes direction. Keep tension on the standing pair the entire time you are folding; the moment it goes slack the fold opens.",
        do: "Fold the working pair back over the wrap until it lies alongside the rope it came from, holding steady tension on the standing pair throughout.",
        doBullets: [
          "Fold it all the way back, not part-way.",
          "Keep the standing pair under tension while you fold.",
          "Let the fold sit on the wrap, so the wrap is pressed between rope and form.",
        ],
        check: "The working pair now runs back alongside its own standing part, and the fold sits on the wrap rather than beside it.",
        checkBullets: [
          "The fold is a full turn back, not a gentle bend.",
          "The fold is sitting on the wrap.",
          "The standing pair never went slack.",
        ],
        speak: "Fold it all the way back. Keep the standing pair tight.",
      },
      {
        title: "4 · Dress it, then test it by pulling the wrong way",
        body: "Dressing means laying the strands so they sit flat and parallel where they cross, with no strand riding on top of another. An undressed fold has less rope in contact and concentrates the load onto whichever strand ended up on top. Once it is dressed, pull the working pair in the direction the line is about to travel and watch the fold: a good one stays where it is, and a poor one slides along the wrap or opens out. This is the useful part of the drill — the failure is visible on a prop, quietly, with nobody waiting on you.",
        do: "Lay the strands flat where they cross, then pull the working pair along its new direction and watch whether the fold moves.",
        doBullets: [
          "Lay the crossing strands flat and parallel — no strand riding on another.",
          "Pull the working pair the way the line is about to go.",
          "Watch the fold, not your hands.",
        ],
        check: "The strands lie flat where they cross, and you have seen for yourself whether the fold stays put or creeps when pulled. A fold that moves is one to lay again, not one to tighten.",
        checkBullets: [
          "Strands flat where they cross.",
          "You pulled it and watched what happened.",
          "If it crept, you laid it again rather than pulling harder.",
        ],
        speak: "Dress it flat, then pull and watch whether it moves.",
      },
    ],
    watch: [
      "If the practice fold slips, reset the unoccupied drill. This entry does not validate a body harness or loaded use.",
      "A reverse tension holds by friction alone, so it can creep when the direction of pull changes. Seeing one hold in a drill says nothing about how it behaves under a pull it has not met.",
    ],
  },
  {
    slug: "sheet-bend",
    name: "Sheet Bend",
    jp: "シートベンド",
    summary: "Joins two ropes for non-loaded floor craft. This entry does not validate the knot for human load or suspension.",
    cinches: false,
    loadBearing: false,
    usedIn: ["takate-kote", "karada"],
    steps: [
      {
        title: "Bight in the old rope",
        body: "Form a bight in the rope you are extending.",
        speak: "Bight in the rope you are extending.",
      },
      {
        title: "New rope through",
        body: "New working end up through the bight, around the collar, back under itself. Dress the non-loaded floor-work join so it can be inspected and released.",
        speak: "New rope up, around, under itself. Dress tight.",
      },
    ],
    watch: ["Do not use this app entry to select or validate a load-bearing join."],
  },
  {
    slug: "munter",
    name: "Munter Hitch",
    jp: "マンター",
    summary:
      "A load-management hitch named here only for instructor discussion. This app does not teach or validate its use with a person.",
    cinches: false,
    loadBearing: false,
    usedIn: ["partial-suspension"],
    steps: [
      {
        title: "Instructor-only",
        body: "Learn load management, backups, failure response, and emergency release hands-on from a qualified in-person instructor. Do not load a person from this entry.",
        speak: "Instructor-only. Do not load a person from this app.",
      },
    ],
    watch: ["A remote description or image cannot validate a lowering system."],
  },
  {
    slug: "surgeon",
    name: "Surgeon's Knot",
    jp: "外科結び",
    summary: "A square-knot variation for unoccupied craft practice. It is not a person-bearing or suspension lock.",
    cinches: false,
    loadBearing: false,
    usedIn: ["karada", "hip-harness"],
    steps: [
      {
        title: "Double first throw",
        body: "Right over left twice before tucking. This extra friction holds the band.",
        speak: "Double the first throw to hold tension.",
      },
      {
        title: "Finish square",
        body: "Left over right once to cap. Dress flat.",
        speak: "Finish with a single opposite throw.",
      },
    ],
    watch: ["Still not a suspension lock."],
  },
  {
    slug: "half-hitch",
    name: "Half Hitch",
    jp: "ハーフヒッチ",
    summary: "A basic hitch shown for unoccupied craft practice. This entry does not select or validate a loaded lock.",
    cinches: false,
    loadBearing: false,
    usedIn: ["takate-kote", "shinju", "chair"],
    steps: [
      {
        title: "Around and through",
        body: "On an unoccupied object, take the working end around the standing part and through its loop, then dress for inspection.",
        speak: "Around, through, snug.",
      },
    ],
    watch: [
      "A hitch that looks familiar can still move or release unpredictably.",
      "Do not use this recognition entry to select or build a loaded lock or body-restraint component.",
    ],
  },
  {
    slug: "portuguese-bowline",
    name: "Portuguese Bowline",
    jp: "ポルトガルボウライン",
    summary:
      "A two-loop bowline category shown only for recognition on an unoccupied practice object. This entry does not teach body restraint or loaded use.",
    cinches: false,
    loadBearing: false,
    usedIn: ["double-column"],
    steps: [
      {
        title: "Two loops",
        body: "Recognize two sibling loops on an unoccupied practice object. Learn construction, inspection, body application, and release hands-on before any restraint use.",
        speak: "Recognition only on an unoccupied object.",
      },
    ],
    watch: ["A visually similar loop does not establish correct construction, fit, or safe body use."],
  },
  {
    slug: "figure-eight",
    name: "Figure Eight on a Bight: Instructor Route",
    jp: "フィギュアエイト",
    summary: "A loop category used in engineered systems. This app names it for recognition but does not teach or approve person-bearing use.",
    cinches: false,
    loadBearing: false,
    usedIn: [],
    steps: [
      {
        title: "Recognition only",
        body: "Learn construction, inspection, compatibility, loading, backups, and release through qualified in-person instruction and the relevant manufacturer or standards guidance. Do not load a person from this entry.",
        speak: "Recognition only. Do not load a person from this app.",
      },
    ],
    watch: ["Visual similarity cannot validate the knot, rope, connector, anchor, or complete system."],
  },
];

export const KNOTS: Knot[] = [...CORE_KNOTS, ...MORE_KNOTS];

export function getKnot(slug: string) {
  return KNOTS.find((k) => k.slug === slug);
}
