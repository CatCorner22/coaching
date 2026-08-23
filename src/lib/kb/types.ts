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
  | { kind: "video"; src: string; poster?: string }
  | { kind: "wraps"; wraps: WrapSpec[] };

export type KnotStep = {
  title: string;
  body: string;
  speak: string;
  do?: string;
  check?: string;
  diagramId?: string;
};

export type TieStep = {
  title: string;
  rigger: string;
  bottom: string;
  check: string;
  speak: string;
  goal?: string;
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
  usedIn: string[];
  steps: KnotStep[];
  watch: string[];
};

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
