import type { Knot } from "./types";
import { MORE_KNOTS } from "./more-knots";

const CORE_KNOTS: Knot[] = [
  {
    slug: "somerville-bowline",
    name: "Somerville Bowline",
    jp: "非締め付けシングルコラム",
    summary:
      "The gold-standard single-column tie: a bowline variant that does not cinch when loaded. Use this on wrists, ankles, and any limb you intend to keep circulating.",
    cinches: false,
    loadBearing: true,
    usedIn: ["single-column", "takate-kote", "futomomo", "chair"],
    steps: [
      {
        title: "Bight around the limb",
        body: "Fold a working bight and wrap it around the wrist so the folded end and the standing pair sit side by side. Leave two fingers of space. The tail should be long enough to finish the knot plus a safety margin.",
        speak: "Fold a bight around the wrist. Two fingers of space.",
      },
      {
        title: "Working bight through",
        body: "Pass the working bight up through the collar of rope, toward the fingers. Keep the collar flat — no twists against the skin.",
        speak: "Pass the working bight up through the collar.",
      },
      {
        title: "Around the standing pair",
        body: "Take that bight around the standing pair (or around the whole collar, depending on the variation you learned) and back down through the same opening it came from.",
        speak: "Around the standing pair, then back down through.",
      },
      {
        title: "Dress and set",
        body: "Dress the knot so it sits on the side of the wrist, not on the inner pulse or the ulnar nerve at the pinky edge. Pull until snug, then check two-finger space again. Tug the standing pair — the cuff should not tighten.",
        speak: "Dress the knot off the inner wrist. Confirm it does not cinch.",
      },
    ],
    watch: [
      "If it cinches, you inverted a pass. Untie and restart — do not 'fix' a cinching cuff under load.",
      "Never place the knot in the notch of the inner elbow or the back of the knee.",
    ],
  },
  {
    slug: "larks-head",
    name: "Lark's Head",
    jp: "ラークスヘッド",
    summary:
      "The fastest cuff and the start of many harnesses. A cow hitch on a bight. It can cinch; treat it as a starting hitch, not a load-bearing wrist cuff.",
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
        body: "Pass the bight around the object (torso, a ring, a folded limb). Feed the running ends through the bight and snug. That is the lark's head.",
        speak: "Bight around, ends through, snug.",
      },
    ],
    watch: [
      "A lark's head on the neck is not a harness start we teach. Start karada at the sternum.",
      "On wrists it will cinch. Use a Somerville bowline instead.",
    ],
  },
  {
    slug: "double-half-hitch",
    name: "Double Half Hitch",
    jp: "ダブルハーフヒッチ",
    summary:
      "Two half hitches stacked. Locks a wrap band, finishes a stem, or parks a working end. Fast, reliable, easy to overtighten.",
    cinches: false,
    loadBearing: true,
    usedIn: ["takate-kote", "shinju", "futomomo", "hip-harness"],
    steps: [
      {
        title: "First hitch",
        body: "Pass the working end around the standing part and through its own loop. Snug against the wrap you are locking.",
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
      "Do not use a single half hitch as your only lock on a loaded stem.",
    ],
  },
  {
    slug: "wrap-cinch",
    name: "Wrap and Cinch",
    jp: "巻きと締め",
    summary:
      "The grammar of most Japanese ties: wrap a band of two or more strands, then cinch that band to keep it from spreading. The cinch is where people injure nerves.",
    cinches: true,
    loadBearing: true,
    usedIn: ["futomomo", "takate-kote", "double-column", "tengu"],
    steps: [
      {
        title: "Wraps",
        body: "Lay parallel wraps. Keep them flat, no crosses on the skin. Count them. Two to four is typical for a column; TK upper wraps are often two pairs.",
        speak: "Lay parallel wraps. Keep them flat.",
      },
      {
        title: "Cinch",
        body: "Bring the working rope between the limb and the wraps, around the band, and back. The cinch should gather the wraps into a unit without burying into flesh.",
        speak: "Cinch the band as a unit, not into the flesh.",
      },
    ],
    watch: [
      "A cinch on the outer upper arm is how you hit the radial nerve. Place cinches on the inner arm or on the stem, never in the radial groove.",
      "Cinches on the outside of the knee threaten the peroneal nerve.",
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
    loadBearing: true,
    usedIn: ["karada", "shinju", "hishi", "tasuki", "kikkou"],
    steps: [
      {
        title: "Lay the line",
        body: "Bring the doubled rope to the turning point (under a breast, at a hip, at the sternum). Never at the nape.",
        speak: "Bring the doubled rope to the turning point.",
      },
      {
        title: "Fold back",
        body: "Reverse 180 degrees so the working pair lies over the standing pair. Tension the standing pair while you dress the fold. Friction, not a knot, holds it.",
        speak: "Fold one hundred eighty degrees. Friction holds the line.",
      },
    ],
    watch: ["If it slips, you did not keep tension while dressing. Do not add a random overhand on the skin."],
  },
  {
    slug: "sheet-bend",
    name: "Sheet Bend",
    jp: "シートベンド",
    summary: "Joins two ropes, including unequal diameters. How you add a second rope mid-tie without a lump against the body.",
    cinches: false,
    loadBearing: true,
    usedIn: ["takate-kote", "karada", "partial-suspension"],
    steps: [
      {
        title: "Bight in the old rope",
        body: "Form a bight in the rope you are extending.",
        speak: "Bight in the rope you are extending.",
      },
      {
        title: "New rope through",
        body: "New working end up through the bight, around the collar, back under itself. Dress tight. For critical joins, make a double sheet bend.",
        speak: "New rope up, around, under itself. Dress tight.",
      },
    ],
    watch: ["A square knot is the wrong join for two ropes of different thickness."],
  },
  {
    slug: "munter",
    name: "Munter Hitch",
    jp: "マンター",
    summary:
      "A friction hitch around a carabiner or ring. Lets you lower someone slowly. Learn this before any partial suspension.",
    cinches: false,
    loadBearing: true,
    usedIn: ["partial-suspension"],
    steps: [
      {
        title: "Twist",
        body: "A crossing twist in the rope, clipped into the carabiner so the working end can pay out with friction.",
        speak: "Twist, clip, confirm the working end pays out with friction.",
      },
      {
        title: "Hand on the brake",
        body: "The brake hand never leaves the working end. To lower, ease. To stop, hold. This is a lowering tool, not a parking brake — backup when you leave it.",
        speak: "Brake hand stays on the working end.",
      },
    ],
    watch: ["Never take your brake hand off to 'adjust something'. Park first."],
  },
  {
    slug: "surgeon",
    name: "Surgeon's Knot",
    jp: "外科結び",
    summary: "A square knot with an extra wrap on the first throw. Holds tension while you finish the second throw. Useful on slippery rope.",
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
    summary: "The atom of rope locks. One pass around the standing part. Always stacked or backed up.",
    cinches: false,
    loadBearing: false,
    usedIn: ["takate-kote", "shinju", "chair"],
    steps: [
      {
        title: "Around and through",
        body: "Working end around the standing part, through its loop, snug to the object.",
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
      "A two-loop bowline. Can make a double-column in one knot. Easy to mis-tie; practice on a chair leg until it is boring.",
    cinches: false,
    loadBearing: true,
    usedIn: ["double-column"],
    steps: [
      {
        title: "Two loops",
        body: "Build two sibling loops around the two limbs, then lock with a bowline finish so neither cinches.",
        speak: "Two sibling loops, bowline finish, no cinch.",
      },
    ],
    watch: ["If either loop cinches, you lost the bowline lock. Restart."],
  },
  {
    slug: "figure-eight",
    name: "Figure Eight on a Bight",
    jp: "フィギュアエイト",
    summary: "Climbing's workhorse. A bulky, trustworthy loop. Useful on uplines and ring attachments, overkill on the body.",
    cinches: false,
    loadBearing: true,
    usedIn: ["partial-suspension"],
    steps: [
      {
        title: "Bight, eight, dress",
        body: "Doubled rope traces an 8, feeds back through, and is dressed so every strand is parallel. Leave a hand-width tail.",
        speak: "Trace an eight on a bight and dress every strand parallel.",
      },
    ],
    watch: ["A sloppy eight can capsize. Dress it like a climber."],
  },
];

export const KNOTS: Knot[] = [...CORE_KNOTS, ...MORE_KNOTS];

export function getKnot(slug: string) {
  return KNOTS.find((k) => k.slug === slug);
}
