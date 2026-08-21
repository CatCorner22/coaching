export * from "./types";
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
    name: "First night",
    minutes: 25,
    steps: ["single-column", "futomomo", "karada"],
    blurb: "Cuff, one leg, a wearable harness. Land before you get ambitious.",
  },
  {
    slug: "chest-evening",
    name: "Chest evening",
    minutes: 40,
    steps: ["shinju", "tasuki", "karada"],
    blurb: "Torso work with breathing checks. Keep the neck empty.",
  },
  {
    slug: "box-session",
    name: "Box session",
    minutes: 50,
    steps: ["single-column", "takate-kote", "futomomo"],
    blurb: "Warm the shoulders, build a TK with a clock, then a leg so the scene has a second beat.",
  },
  {
    slug: "cross-short",
    name: "Cross, short clock",
    minutes: 15,
    steps: ["single-column", "shinju"],
    blurb: "Wrists and ankles on the Saint Andrew's. Flogger optional. Off before the hands fade.",
  },
  {
    slug: "bench-machine",
    name: "Bench and machine",
    minutes: 30,
    steps: ["single-column", "futomomo"],
    blurb: "Draped on the bench. Machine in front of you, not instead of you.",
  },
] as const;

export function kbStats() {
  return {
    ties: TIES.length,
    knots: KNOTS.length,
    articles: ARTICLES.length,
  };
}
