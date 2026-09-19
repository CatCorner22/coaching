/**
 * Nyx — fictional adult demonstration model for Knotty Academy shibari lessons.
 *
 * Character bible: athletic alt woman, warm olive skin, dark hair, smoky eyes,
 * neo-traditional tattoos on right sleeve and ribs. Stills live under
 * `/instructor/nyx/` — full frames plus close crops for step-specific lessons.
 */

const V = 2;

export const NYX_SHIBARI_POSES = [
  "portrait",
  "ropeHands",
  "dressForm",
  "singleColumn",
  "karadaProp",
  "floorWork",
  "walkthrough",
  "seated",
  "seatedClose",
  "wristClose",
  "torsoClose",
  "floorClose",
  "walkClose",
  "columnClose",
  "hipsLine",
  "ropeLap",
] as const;

export type NyxShibariPose = (typeof NYX_SHIBARI_POSES)[number];

const BASE = `/instructor/nyx`;

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
  portrait: `${BASE}/nyx-portrait.webp?v=${V}`,
  photos: {
    portrait: `${BASE}/nyx-portrait.webp?v=${V}`,
    ropeHands: `${BASE}/nyx-hands.webp?v=${V}`,
    dressForm: `${BASE}/nyx-dress-form.webp?v=${V}`,
    singleColumn: `${BASE}/nyx-single-column.webp?v=${V}`,
    karadaProp: `${BASE}/nyx-karada-prop.webp?v=${V}`,
    floorWork: `${BASE}/nyx-floor.webp?v=${V}`,
    walkthrough: `${BASE}/nyx-walk.webp?v=${V}`,
    seated: `${BASE}/nyx-seated.webp?v=${V}`,
    seatedClose: `${BASE}/nyx-seated-close.webp?v=${V}`,
    wristClose: `${BASE}/nyx-wrist-close.webp?v=${V}`,
    torsoClose: `${BASE}/nyx-torso-close.webp?v=${V}`,
    floorClose: `${BASE}/nyx-floor-close.webp?v=${V}`,
    walkClose: `${BASE}/nyx-walk-close.webp?v=${V}`,
    columnClose: `${BASE}/nyx-column-close.webp?v=${V}`,
    hipsLine: `${BASE}/nyx-hips-line.webp?v=${V}`,
    ropeLap: `${BASE}/nyx-rope-lap.webp?v=${V}`,
  },
  captions: {
    portrait: "Nyx — demonstration model for Academy lessons. Fictional adult; not a real instructor certificate.",
    ropeHands: "Handling jute before any body contact — rope prep and finger spacing.",
    dressForm: "Pattern work on an empty dress form. Nobody is in the rope.",
    singleColumn: "Single-column wrist placement on a consenting adult model — check circulation directly, not from a photo.",
    karadaProp: "Karada spacing on a dress form. Torso harness families stay instructor-only on a person.",
    floorWork: "Low, grounded rehearsal — no loading, no suspension.",
    walkthrough: "Step back and read the whole line before the next wrap.",
    seated: "Seated rope prep — hips grounded, spine long, both hands free for the first bight.",
    seatedClose: "Close framing on seated hand work — where the rope leaves the coil matters.",
    wristClose: "Wrist and finger spacing — the teaching load is in the hands, not the wide shot.",
    torsoClose: "Torso line and breath — read shoulder slope before any chest wrap.",
    floorClose: "Grounded leg lines — futomomo and floor ties start from a stable base.",
    walkClose: "Full-line read while moving — tension travels; watch the whole path.",
    columnClose: "Column tie detail — two wraps, flat, with a finger gap for circulation.",
    hipsLine: "Hip and waist line awareness before any lower-body harness.",
    ropeLap: "Rope in the lap — midpoint found, ends even, ready for the next step.",
  },
} as const;

const KNOT_POSE_ROTATION: Record<string, NyxShibariPose[]> = {
  "somerville-bowline": ["ropeHands", "wristClose", "torsoClose", "portrait", "columnClose", "ropeHands"],
  "larks-head": ["ropeHands", "ropeLap", "walkClose"],
  "half-hitch": ["wristClose", "columnClose"],
  "double-half-hitch": ["ropeHands", "wristClose", "columnClose"],
  square: ["ropeHands", "ropeLap", "torsoClose"],
  "overhand-on-bight": ["ropeHands", "wristClose", "portrait"],
};

/** Default pose when a lesson has no step-specific mapping. */
export function nyxDefaultPoseForTie(slug: string): NyxShibariPose {
  if (slug === "single-column" || slug === "double-column") return "singleColumn";
  if (slug === "karada" || slug === "tasuki" || slug === "shinju") return "karadaProp";
  if (slug === "hip-harness" || slug === "chair") return "dressForm";
  if (slug === "futomomo" || slug === "frog-tie" || slug === "mermaid") return "floorWork";
  return "ropeHands";
}

/** Step-aware pose for guided Academy ties. Returns null for instructor-only routes. */
export function nyxPoseForTieStep(slug: string, stepIndex: number): NyxShibariPose | null {
  switch (slug) {
    case "single-column":
      if (stepIndex <= 1) return "ropeHands";
      if (stepIndex === 2) return "wristClose";
      if (stepIndex <= 4) return "singleColumn";
      return stepIndex === 5 ? "columnClose" : "walkthrough";
    case "double-column":
      if (stepIndex <= 1) return "ropeHands";
      if (stepIndex === 2) return "wristClose";
      return stepIndex <= 4 ? "singleColumn" : "columnClose";
    case "karada":
      if (stepIndex <= 1) return "dressForm";
      if (stepIndex <= 3) return "karadaProp";
      return stepIndex <= 5 ? "torsoClose" : "walkthrough";
    case "tasuki":
      if (stepIndex === 0) return "dressForm";
      return stepIndex <= 2 ? "torsoClose" : "karadaProp";
    case "shinju":
      return stepIndex === 0 ? "dressForm" : "torsoClose";
    case "hip-harness":
      return stepIndex <= 1 ? "dressForm" : "hipsLine";
    case "chair":
      return stepIndex <= 1 ? "dressForm" : "seated";
    case "futomomo":
    case "frog-tie":
      if (stepIndex <= 1) return "floorWork";
      return stepIndex <= 3 ? "floorClose" : "seatedClose";
    case "mermaid":
      if (stepIndex <= 1) return "seated";
      return stepIndex <= 3 ? "floorClose" : "walkClose";
    default:
      return nyxDefaultPoseForTie(slug);
  }
}

export function nyxPoseForKnotStep(slug: string, stepIndex: number): NyxShibariPose {
  const rotation = KNOT_POSE_ROTATION[slug];
  if (rotation?.length) return rotation[stepIndex % rotation.length] ?? "ropeHands";
  if (stepIndex <= 1) return "ropeHands";
  if (stepIndex === 2) return "wristClose";
  return "portrait";
}

export function nyxPhoto(pose: NyxShibariPose): string {
  return NYX_SHIBARI.photos[pose];
}

export function nyxCaption(pose: NyxShibariPose): string {
  return NYX_SHIBARI.captions[pose];
}

export function nyxPoseCount(): number {
  return NYX_SHIBARI_POSES.length;
}
