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
      "Right over left, left over right. Joins two ends of similar rope. Caps a decorative stem. Unties when one end is pulled — do not trust it as your only lock under suspension.",
    cinches: false,
    loadBearing: false,
    usedIn: ["karada", "hishi", "kikkou"],
    steps: [
      {
        title: "First throw",
        body: "Right end over left, tuck under. Pull even.",
        speak: "Right over left, under.",
      },
      {
        title: "Second throw",
        body: "Left over right, tuck under. The two loops should lie flat, each end exiting beside its own standing part. If you see two loops that slide, you tied a granny. Untie.",
        speak: "Left over right. Confirm it is not a granny knot.",
      },
    ],
    watch: ["Granny knots capsize. Square knots lie flat.", "Backup with a half hitch if it matters."],
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
    steps: [
      {
        title: "Lay the line",
        body: "Bring the doubled rope to a marked turning point on an unoccupied practice form.",
        speak: "Bring the doubled rope to the turning point.",
      },
      {
        title: "Fold back",
        body: "Reverse 180 degrees so the working pair lies over the standing pair. Tension the standing pair while you dress the fold. Friction, not a knot, holds it.",
        speak: "Fold one hundred eighty degrees. Friction holds the line.",
      },
    ],
    watch: ["If the practice fold slips, reset the unoccupied drill. This entry does not validate a body harness or loaded use."],
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
    watch: ["A lone half hitch will creep. Stack a second."],
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
