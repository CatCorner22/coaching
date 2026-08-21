import type { GearItem } from "./types";

export const GEAR: GearItem[] = [
  {
    slug: "jute-8m",
    name: "Jute 6mm × 8m",
    kind: "rope",
    summary: "The standard working length. Most floor harnesses want one or two of these.",
    notes: [
      "Six to eight pieces is a real kit, not two",
      "Natural fiber will shed; that is normal",
      "Treat lightly with camellia or jojoba, then work it in",
    ],
  },
  {
    slug: "jute-4m",
    name: "Jute 6mm × 4m",
    kind: "rope",
    summary: "A shorter practice length for decorative, ground-level, non-loaded work and general handling drills.",
    notes: ["Length alone does not determine suitability. This app does not specify person-bearing uses."],
  },
  {
    slug: "hemp",
    name: "Hemp 6mm",
    kind: "rope",
    summary: "A natural-fiber rope with different handling and maintenance characteristics from jute.",
    notes: ["Material labels and appearance do not establish condition, strength, or suitability for loading a person."],
  },
  {
    slug: "cotton",
    name: "Cotton",
    kind: "rope",
    summary: "Soft and treacherous. Stretches, then tightens. Fine for decorative practice on furniture, not for cuffs you trust.",
    notes: ["If it is what you have tonight, double-check every cuff after she leans."],
  },
  {
    slug: "shears",
    name: "Trauma shears",
    kind: "tool",
    summary: "The only piece of kit that is not optional. Blunt beak, serrated, on a lanyard.",
    notes: [
      "Practice on scrap rope",
      "A knife is not a substitute",
      "If you cannot put a hand on them without looking, they are too far away",
    ],
  },
  {
    slug: "carabiner",
    name: "Locking carabiner: Instructor Route",
    kind: "tool",
    summary: "Connector category found in engineered systems. This app does not select, orient, rate, inspect, or approve connectors for person-bearing use.",
    notes: ["Use qualified in-person instruction and manufacturer documentation for the complete system. A photo cannot establish capacity or correct loading."],
  },
  {
    slug: "pad",
    name: "Crash pad",
    kind: "support",
    summary: "Padding may reduce minor contact injury but cannot make lifting, suspension, or a fall safe.",
    notes: ["Keep work ground-level in this app. Padding is not a substitute for training, spotting, or an engineered system."],
  },
  {
    slug: "ring",
    name: "Ring or bamboo: Instructor Route",
    kind: "support",
    summary: "Equipment categories sometimes used in person-bearing systems. This app provides recognition only, not selection, construction, loading, or approval.",
    notes: ["Unknown or improvised hardware must never be treated as a human-rated system. Seek qualified hands-on instruction."],
  },
  {
    slug: "oil",
    name: "Camellia / jojoba",
    kind: "care",
    summary: "A few drops in jute, then friction and time. You are feeding fiber, not frying it.",
    notes: ["Wax makes pretty rope that slips and then dirties skin."],
  },
  {
    slug: "blanket",
    name: "Aftercare blanket",
    kind: "care",
    summary: "Warmth is medical, not cute. Drop and shock look like cold.",
    notes: ["Keep water and a snack next to it so you do not leave her to go hunting."],
  },
];
