import type { Knot } from "./types";

export const MORE_KNOTS: Knot[] = [
  {
    slug: "overhand-on-bight",
    name: "Overhand on a Bight",
    jp: "止め結び",
    summary: "The simplest loop. Bulky, jams under load, fine as a stopper, not a cuff.",
    cinches: true,
    loadBearing: false,
    usedIn: ["karada", "hishi"],
    steps: [
      {
        title: "Fold, wrap, pull",
        body: "Midpoint bight, wrap the standing pair, pull the bight through. Dress. This will jam. Do not use it where you need a fast untie.",
        speak: "Overhand on a bight. Stopper, not a cuff.",
      },
    ],
    watch: ["Jams. Cut it if it took load. Never as a loaded wrist cuff."],
  },
  {
    slug: "prusik",
    name: "Prusik",
    jp: "プルージック",
    summary: "A friction hitch that grabs a stem when loaded and slides when you help it. Useful on a munter / partial, not as a hang.",
    cinches: false,
    loadBearing: true,
    usedIn: ["partial-suspension"],
    steps: [
      {
        title: "Wrap the stem",
        body: "A smaller cord or a doubled bight wraps the stem three or more times and exits through its own loop. Test that it grabs when you load and slides when you push the wraps.",
        speak: "Three wraps on the stem. It must grab and also slide.",
      },
    ],
    watch: ["Too few wraps and it slips. Too many and it will not move when you need it."],
  },
  {
    slug: "alpine-butterfly",
    name: "Alpine Butterfly",
    jp: "蝶結び",
    summary: "A mid-line loop that can take load in three directions. Climbers love it. On the body it is a tidy handle on a stem.",
    cinches: false,
    loadBearing: true,
    usedIn: ["hip-harness", "partial-suspension"],
    steps: [
      {
        title: "Twist, wrap, pull the loop",
        body: "Two twists in the standing rope, wrap the upper twist, pull the center loop through, dress so the two 'wings' sit even. Load-test on a chair before you trust it on a person.",
        speak: "Butterfly in the stem. Dress both wings even.",
      },
    ],
    watch: ["A sloppy butterfly can collapse into an overhand. Dress it."],
  },
  {
    slug: "daisy-chain",
    name: "Daisy Chain",
    jp: "鎖編み",
    summary: "A chain of bights for storing leftover tail or making a decorative stem. It is not a cuff and it is not a hang.",
    cinches: false,
    loadBearing: false,
    usedIn: ["karada", "hishi", "kikkou"],
    steps: [
      {
        title: "Chain the leftover",
        body: "Pull a bight through the previous bight, repeat. Lock the last loop with a half hitch or tuck the tail so it does not unravel at a tug.",
        speak: "Chain leftover tail. Lock the last loop. Not a cuff.",
      },
    ],
    watch: ["A daisy that takes load will dump all at once when the lock fails."],
  },
  {
    slug: "truckers-hitch",
    name: "Trucker's Hitch",
    jp: "トラックヒッチ",
    summary: "A 3:1 tensioning system. Useful on furniture rails and on wrapping a bench drape. Easy to over-crank a body.",
    cinches: false,
    loadBearing: true,
    usedIn: ["bench-drape", "chair", "starfish"],
    steps: [
      {
        title: "Loop, redirect, half-hitch",
        body: "A midline loop (butterfly or slip), the working end through a rail, back through the loop, pull, lock with two half-hitches. On a person, stop before it feels impressive.",
        speak: "Trucker's hitch onto furniture, not onto a nerve.",
      },
    ],
    watch: ["Mechanical advantage will injure a wrist that a hand-pull would have left alone."],
  },
];
