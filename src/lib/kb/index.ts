export * from "./types";
export * from "./academy";
export * from "./ties";
export * from "./knots";
export * from "./articles";
export * from "./gear";
export * from "./search";
export * from "./nerves";
export * from "./dungeon";

import { ARTICLES } from "./articles";
import { KNOTS } from "./knots";
import { TIES } from "./ties";

export const SEQUENCES = [
  {
    slug: "first-night",
    name: "First handling practice",
    minutes: 20,
    steps: ["single-column", "karada"],
    blurb: "Unoccupied prop drills only: recognize a non-cinching structure and a decorative pattern, then rehearse prompt removal.",
  },
  {
    slug: "chest-evening",
    name: "Chest harness: instructor questions",
    minutes: 0,
    steps: ["shinju", "tasuki", "karada"],
    blurb: "Recognition and unoccupied pattern practice only; body application and monitoring require qualified hands-on instruction.",
  },
  {
    slug: "box-session",
    name: "Box tie: instructor route",
    minutes: 0,
    steps: ["single-column", "takate-kote", "futomomo"],
    blurb: "Do not construct a box tie from this app. Use these entries to prepare risk and release questions for an instructor.",
  },
  {
    slug: "cross-short",
    name: "Cross: instructor route",
    minutes: 0,
    steps: ["single-column", "shinju"],
    blurb: "Arms-up restraint and impact combinations require qualified hands-on instruction; a timer or image never clears them.",
  },
  {
    slug: "bench-machine",
    name: "Bench and machine: instructor route",
    minutes: 0,
    steps: ["single-column", "futomomo"],
    blurb: "Keep powered equipment and restraint separate in app-guided practice.",
  },
  {
    slug: "pole-dress",
    name: "Pole and rope: instructor route",
    minutes: 0,
    steps: ["pole-cuffs", "shinju"],
    blurb: "Keep pole and rope practice separate until a qualified instructor evaluates the combination.",
  },
  {
    slug: "swing-support",
    name: "Swing and rope: instructor route",
    minutes: 0,
    steps: ["single-column", "hip-harness"],
    blurb: "Do not add rope attachment or loading to swing hardware from this app.",
  },
  {
    slug: "table-fold",
    name: "Table / bench: instructor route",
    minutes: 0,
    steps: ["bench-drape", "frog-tie"],
    blurb: "Recognition and negotiation only. Do not construct a furniture-restraint combination from this app.",
  },
  {
    slug: "mermaid-evening",
    name: "Mermaid: instructor route",
    minutes: 0,
    steps: ["mermaid"],
    blurb: "Use the entry for risk recognition and instructor questions, not body construction or camera clearance.",
  },
] as const;

export function kbStats() {
  return {
    ties: TIES.length,
    knots: KNOTS.length,
    articles: ARTICLES.length,
  };
}
