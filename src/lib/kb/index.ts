export * from "./types";
export * from "./academy";
export * from "./ties";
export * from "./knots";
export * from "./articles";
export * from "./gear";
export * from "./search";
export * from "./nerves";
export * from "./dungeon";
export * from "./provenance";
export * from "./article-minutes";

import { ARTICLES } from "./articles";
import { KNOTS } from "./knots";
import { TIES } from "./ties";

export const KNOWLEDGE_TOPICS = [
  { title: "Consent and safewords", slugs: ["negotiation", "safewords", "consent-frameworks"] },
  { title: "Roles and power exchange", slugs: ["protocol-ds", "power-exchange-scope", "submissive-agency"] },
  { title: "Impact and sensation", slugs: ["impact-risk-families", "sensation", "sensory-deprivation"] },
  { title: "Aftercare and drop", slugs: ["aftercare", "drop", "top-drop", "scene-debrief"] },
  { title: "Health and risk", slugs: ["medical-disclosure", "circulation-vs-nerve", "hard-limits", "suspension-reality"] },
  { title: "Rope and equipment", slugs: ["rope-materials", "rope-basics", "gear-care"] },
] as const;

export const SEQUENCES = [
  {
    slug: "first-night",
    name: "First guided ties",
    minutes: 20,
    steps: ["single-column", "karada"],
    // These two are taught in full now, not drilled on a prop — the blurb
    // used to promise "unoccupied prop drills only" over steps that say to
    // watch her face. Framing must match the tie shapes it links to.
    blurb: "Two ties taught step by step: a single column on a wrist or ankle, then the karada. Each stays blocked until its negotiated limit is a yes.",
  },
  {
    slug: "chest-evening",
    name: "Chest harness: instructor questions",
    minutes: 0,
    steps: ["shinju", "tasuki", "karada"],
    blurb: "Shinju and tasuki are recognition-and-instructor entries this app does not teach; the karada is taught in full and waits for its negotiated yes.",
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
