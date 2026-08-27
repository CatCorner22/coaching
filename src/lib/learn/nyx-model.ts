/**
 * Nyx — fictional adult demonstration model for Knotty Academy shibari lessons.
 *
 * Character bible: Cursor_Skills `skills/projects/nyx/SKILL.md` (appearance,
 * tattoos, voice). Base stills are shared with the Garanimal / Fitness pole
 * instructor set where poses overlap; shibari-specific stills live under
 * `/instructor/nyx/`.
 */

const V = 1;

export const NYX_SHIBARI_POSES = [
  "portrait",
  "ropeHands",
  "dressForm",
  "singleColumn",
  "karadaProp",
  "floorWork",
  "walkthrough",
] as const;

export type NyxShibariPose = (typeof NYX_SHIBARI_POSES)[number];

export const NYX_SHIBARI = {
  id: "nyx",
  name: "Nyx",
  fullName: "Nyx Vale",
  ageLabel: "adult, late 20s",
  role: "Academy demonstration model",
  look:
    "Athletic alt woman: warm olive skin, dark hair, smoky eyes, neo-traditional tattoos on right sleeve and ribs. Fictional adult model for educational rope demonstrations only — not a real person, not consent verification, not clearance.",
  voice: {
    rate: 0.82,
    pitch: 0.86,
    edgeVoice: "en-US-AriaNeural",
    edgeRate: "-12%",
    edgePitch: "-6Hz",
  },
  portrait: `/instructor/nyx/nyx-portrait.webp?v=${V}`,
  photos: {
    portrait: `/instructor/nyx/nyx-portrait.webp?v=${V}`,
    ropeHands: `/instructor/nyx/nyx-hands.webp?v=${V}`,
    dressForm: `/instructor/nyx/nyx-dress-form.webp?v=${V}`,
    singleColumn: `/instructor/nyx/nyx-single-column.webp?v=${V}`,
    karadaProp: `/instructor/nyx/nyx-karada-prop.webp?v=${V}`,
    floorWork: `/instructor/nyx/nyx-floor.webp?v=${V}`,
    walkthrough: `/instructor/nyx/nyx-walk.webp?v=${V}`,
  },
  captions: {
    portrait: "Nyx — demonstration model for Academy lessons. Fictional adult; not a real instructor certificate.",
    ropeHands: "Handling jute before any body contact — rope prep and finger spacing.",
    dressForm: "Pattern work on an empty dress form. Nobody is in the rope.",
    singleColumn: "Single-column wrist placement on a consenting adult model — check circulation directly, not from a photo.",
    karadaProp: "Karada spacing on a dress form. Torso harness families stay instructor-only on a person.",
    floorWork: "Low, grounded rehearsal — no loading, no suspension.",
    walkthrough: "Step back and read the whole line before the next wrap.",
  },
} as const;

/** Default pose when a lesson has no step-specific mapping. */
export function nyxDefaultPoseForTie(slug: string): NyxShibariPose {
  if (slug === "single-column" || slug === "double-column") return "singleColumn";
  if (slug === "karada" || slug === "tasuki" || slug === "shinju") return "karadaProp";
  if (slug === "hip-harness" || slug === "chair") return "dressForm";
  return "ropeHands";
}

/** Step-aware pose for guided Academy ties. Returns null for instructor-only routes. */
export function nyxPoseForTieStep(slug: string, stepIndex: number): NyxShibariPose | null {
  switch (slug) {
    case "single-column":
      if (stepIndex <= 1) return "ropeHands";
      if (stepIndex <= 4) return "singleColumn";
      return "walkthrough";
    case "double-column":
      if (stepIndex <= 1) return "ropeHands";
      return "singleColumn";
    case "karada":
      if (stepIndex <= 2) return "dressForm";
      return "karadaProp";
    case "tasuki":
    case "shinju":
      return stepIndex === 0 ? "dressForm" : "karadaProp";
    case "hip-harness":
    case "chair":
      return "dressForm";
    case "futomomo":
    case "frog-tie":
    case "mermaid":
      return stepIndex <= 1 ? "floorWork" : "ropeHands";
    default:
      return nyxDefaultPoseForTie(slug);
  }
}

export function nyxPoseForKnotStep(_slug: string, stepIndex: number): NyxShibariPose {
  return stepIndex <= 1 ? "ropeHands" : "portrait";
}

export function nyxPhoto(pose: NyxShibariPose): string {
  return NYX_SHIBARI.photos[pose];
}

export function nyxCaption(pose: NyxShibariPose): string {
  return NYX_SHIBARI.captions[pose];
}
