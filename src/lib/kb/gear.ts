import type { GearItem } from "./types";

export const GEAR: GearItem[] = [
  {
    slug: "jute-8m",
    name: "Jute 6mm × 8m",
    kind: "rope",
    summary: "A common practice length for unoccupied, ground-level, non-loaded rope-handling drills.",
    notes: [
      "Start with the least material needed for an unoccupied handling drill",
      "Natural fiber can shed; inspect for damage rather than assuming shedding is harmless",
      "Follow the maker's care instructions and retire damaged or uncertain rope from body use",
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
    summary: "Cotton can stretch and change under tension. A soft feel does not establish suitability for body restraint.",
    notes: ["Use it for unoccupied, non-loaded handling drills in this app; seek hands-on guidance for body application."],
  },
  {
    slug: "shears",
    name: "Trauma shears",
    kind: "tool",
    summary: "A suitable rapid-release tool should be immediately accessible, with a rehearsed backup release plan.",
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
    name: "Manufacturer-approved rope care",
    kind: "care",
    summary:
      "Material-specific care product, method, quantity, and fire precautions must come from the rope maker; this app does not prescribe oil, wax, heat, or washing.",
    notes: [
      "Care cannot restore a damaged or uncertain rope to a known strength or establish suitability for body or person-bearing use.",
    ],
  },
  {
    slug: "blanket",
    name: "Aftercare blanket",
    kind: "care",
    summary: "Offer warmth only if wanted; a blanket is comfort equipment, not treatment or a way to rule out a medical problem.",
    notes: ["Keep agreed aftercare items nearby so nobody restrained is left alone. Seek urgent help for emergency signs."],
  },
  {
    slug: "cuffs",
    name: "Padded restraint cuffs",
    kind: "support",
    summary:
      "Wide, padded cuffs spread pressure better than a narrow edge, but they carry the same nerve and circulation risks as rope and need the same monitoring.",
    notes: [
      "Fit snug without compression; a commonly taught starting reference is two flat fingers under the cuff, which is a fit check, not a safety guarantee",
      "Place on the meatier forearm above the wrist bones, never in the groove at the base of the hand",
      "Prefer fast, practiced release; if it locks, the key stays in arm's reach for the whole scene",
    ],
  },
  {
    slug: "blindfold",
    name: "Blindfold",
    kind: "support",
    summary:
      "Covering the eyes intensifies other senses and removes visual check-ins; communication has to carry more of the load.",
    notes: [
      "Agree on more frequent verbal check-ins before covering the eyes",
      "Never combine with anything that also limits speech or hearing without a rehearsed nonverbal stop signal",
      "Remove first at any sign of disorientation, panic, or faintness",
    ],
  },
  {
    slug: "collar",
    name: "Collar: symbolic only",
    kind: "support",
    summary:
      "A collar in this app's scope is symbolic equipment. Nothing worn around a neck has a safe loaded configuration.",
    notes: [
      "Never attach a load, a downward line, or a pulling force to anything around a neck",
      "Never leave a collared person attached to a fixed point unattended",
      "Serious harm from neck pressure can occur without visible injury and can be delayed; seek urgent assessment for any neck-pressure event",
    ],
  },
];
