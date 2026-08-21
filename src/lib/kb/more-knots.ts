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
    name: "Prusik: Instructor Route",
    jp: "プルージック",
    summary: "A friction-hitch category used in loaded systems. This app identifies the term but does not teach, size, test, or approve it for a person-bearing system.",
    cinches: false,
    loadBearing: false,
    usedIn: [],
    steps: [
      {
        title: "Learn in person before any load",
        body: "Friction-hitch performance depends on material, diameter, dressing, direction, contamination, movement, and the whole load path. Use qualified hands-on instruction and a separately engineered system; do not load a person from an app description.",
        speak: "Instructor-only for loaded use. This entry is recognition, not a procedure.",
      },
    ],
    watch: ["A name, photo, or apparent grip does not establish capacity, controllability, redundancy, or safe release."],
  },
  {
    slug: "alpine-butterfly",
    name: "Alpine Butterfly: Instructor Route",
    jp: "蝶結び",
    summary: "A mid-line loop category. This app does not teach or approve it as part of a person-bearing rope system.",
    cinches: false,
    loadBearing: false,
    usedIn: [],
    steps: [
      {
        title: "Recognition only",
        body: "Do not use a diagram or model response to construct a loaded system. Learn tying, inspection, failure modes, compatibility, and release through qualified in-person instruction.",
        speak: "Recognition only. Do not load a person from this entry.",
      },
    ],
    watch: ["Visual similarity cannot validate the knot, the rope, or the surrounding system."],
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
    name: "Trucker's Hitch: Object-Only",
    jp: "トラックヒッチ",
    summary: "A mechanical-advantage category for securing inanimate cargo. It is excluded from body restraint and person-bearing systems in this app.",
    cinches: false,
    loadBearing: false,
    usedIn: [],
    steps: [
      {
        title: "Keep mechanical advantage off people",
        body: "Do not use tension-multiplying systems to tighten restraint on a body or to create a person-bearing load path. Use this entry only as a terminology boundary.",
        speak: "Object-only terminology. Never tension a body with mechanical advantage.",
      },
    ],
    watch: ["Mechanical advantage can create high force before the operator recognizes it."],
  },
];
