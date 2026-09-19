export type Level = "foundation" | "building" | "advanced";
export type Pose = "stand" | "kneel" | "sit" | "prone" | "supine" | "gote";
export type View = "front" | "back" | "side";

export type WrapSpec =
  | { kind: "band"; y: number; w?: number }
  | { kind: "stem"; x?: number; y1: number; y2: number }
  | { kind: "cuff"; at: "lw" | "rw" | "la" | "ra" | "ll" | "rl" | "lk" | "rk" }
  | { kind: "diamond"; cy: number }
  | { kind: "x"; y: number }
  | { kind: "gote" }
  | { kind: "futomomo"; side: "l" | "r" | "both" }
  | { kind: "hip" }
  | { kind: "chest" };

export type LearnMedia =
  | { kind: "diagram"; diagramId: string }
  | { kind: "video"; src: string; poster?: string; mode?: "loop" | "demo" }
  | { kind: "wraps"; wraps: WrapSpec[] };

export type KnotStep = {
  title: string;
  body: string;
  speak: string;
  do?: string;
  check?: string;
  doBullets?: string[];
  checkBullets?: string[];
  diagramId?: string;
  media?: LearnMedia[];
};

export type TieStep = {
  title: string;
  rigger: string;
  bottom: string;
  check: string;
  speak: string;
  goal?: string;
  riggerBullets?: string[];
  checkBullets?: string[];
  bottomBullets?: string[];
  media?: LearnMedia[];
  /**
   * Negotiated rows this one step needs, over and above the tie's own limit.
   * Karada's optional crotch pass is the case that exists: the tie negotiates
   * `torso`, the step puts rope somewhere `torso` never agreed to.
   */
  limitIds?: readonly string[];
  expected: {
    wrapBands: number;
    pose: Pose;
    view: View;
    handsVisible: boolean;
    neckClear: boolean;
  };
  wraps: WrapSpec[];
};

export type Tie = {
  slug: string;
  name: string;
  jp: string;
  summary: string;
  level: Level;
  minutes: [number, number];
  ropes: { lengthM: number; count: number }[];
  position: "floor" | "chair" | "partial" | "theory";
  prereqs: string[];
  knots: string[];
  nerves: string[];
  intent: string[];
  why: string;
  goal?: string;
  stop: string[];
  steps: TieStep[];
  mistakes: { title: string; body: string }[];
  aftercare: string;
  variations: { name: string; body: string }[];
};

export type Knot = {
  slug: string;
  name: string;
  jp?: string;
  summary: string;
  goal?: string;
  cinches: boolean;
  loadBearing: boolean;
  /**
   * Which ties actually cite this knot. Always derived from `Tie.knots` at
   * catalog-build time (see `knots.ts`) rather than authored — a hand-kept
   * mirror of that field went stale on 14 of 17 knots, in both directions:
   * knots pointing at ties that no longer needed them, and ties that had
   * started citing a knot with no link back. `KnotSource` (the type a raw
   * catalog entry actually satisfies) omits this field entirely, so there is
   * nowhere left for a new entry to write a stale copy.
   */
  usedIn: string[];
  steps: KnotStep[];
  /** Real, specific ways this goes wrong, and what actually causes it — the same bar `Tie.mistakes` sets. */
  mistakes: { title: string; body: string }[];
  watch: string[];
  /**
   * How the knot comes off, and when to stop untying and cut. Every knot has
   * one: a knot the reader can tie but not reliably remove is the one that
   * ends up being cut off a numb limb in a hurry.
   */
  release: KnotRelease;
};

/**
 * Which release rule the page shows under the knot's own instructions.
 * `body`: the shears rule applies (a wrap on a person). `object`: rope on a
 * thing, never a person — cutting a tensioned line is the hazard, not the fix.
 * `recognition`: loaded systems this app does not teach releasing.
 */
export type KnotReleaseContext = "body" | "object" | "recognition";

export type KnotRelease = {
  context: KnotReleaseContext;
  /** Ordered, literal untie sequence — one action per line. */
  untie: string[];
  /**
   * What makes this particular knot slow or impossible to untie, and the
   * cut decision that follows. Always ends by pointing at `CUT_RULE`.
   */
  cut: string;
};

/** What a catalog file actually authors: everything on `Knot` except the derived `usedIn`. */
export type KnotSource = Omit<Knot, "usedIn">;

export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "warn"; text: string }
  | { type: "callout"; title: string; text: string };

export type Article = {
  slug: string;
  title: string;
  jp?: string;
  section:
    | "consent"
    | "body"
    | "scene"
    | "aftercare"
    | "protocol"
    | "risk"
    | "craft";
  minutes: number;
  summary: string;
  related: string[];
  blocks: ArticleBlock[];
};

export type GearItem = {
  slug: string;
  name: string;
  kind: "rope" | "tool" | "support" | "care";
  summary: string;
  notes: string[];
};
