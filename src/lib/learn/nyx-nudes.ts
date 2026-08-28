/**
 * Illustrated adult nude studies of Nyx for Academy lessons.
 *
 * Photoreal nudes cannot be generated in this environment (safety filters).
 * These poses are procedural life-drawings of an unambiguously adult woman —
 * the teaching surface for where rope sits on a body.
 */

export const NYX_NUDE_POSES = [
  "standFront",
  "standSide",
  "standBack",
  "seated",
  "kneeling",
  "floor",
  "armsUp",
  "wristOffer",
  "hipTurn",
  "walk",
  "torsoStudy",
  "hipStudy",
  "recline",
  "kneelSide",
] as const;

export type NyxNudePose = (typeof NYX_NUDE_POSES)[number];

export const NYX_NUDE_CAPTIONS: Record<NyxNudePose, string> = {
  standFront: "Front nude — read breast line, waist, and hip before any torso wrap.",
  standSide: "Side nude — shoulder slope and belly space; nothing goes on the neck.",
  standBack: "Back nude — scapula and lumbar line. Gote families stay instructor-only.",
  seated: "Seated nude — hips grounded, thighs free, wrists available for a column.",
  kneeling: "Kneeling nude — stable base for floor rehearsal. No loading.",
  floor: "Floor nude — full body visible so a wrap cannot hide a pinched nerve.",
  armsUp: "Arms raised — underarm and rib spacing before a chest harness.",
  wristOffer: "Wrist offered — single-column placement on bare skin, finger gap visible.",
  hipTurn: "Three-quarter hip — waist-to-thigh line before any hip harness.",
  walk: "Standing walk — tension travels; watch the whole nude line, not one wrap.",
  torsoStudy: "Torso study — breasts, sternum, and lower ribs. Check circulation on her, not the drawing.",
  hipStudy: "Hip study — iliac crest and upper thigh. Futomomo starts from here.",
  recline: "Reclined nude — low rehearsal, no suspension, both hands free.",
  kneelSide: "Kneel from the side — shin and thigh stack before a mermaid or frog tie.",
};

const KNOT_NUDES: Record<string, NyxNudePose[]> = {
  "somerville-bowline": ["wristOffer", "standFront", "torsoStudy", "standSide"],
  "larks-head": ["wristOffer", "standFront", "walk"],
  "half-hitch": ["wristOffer", "standSide", "torsoStudy"],
  "double-half-hitch": ["wristOffer", "standFront", "armsUp"],
  square: ["wristOffer", "seated", "standFront"],
  "overhand-on-bight": ["wristOffer", "torsoStudy", "standFront"],
};

const TIE_NUDES: Record<string, NyxNudePose[]> = {
  "single-column": ["wristOffer", "standFront", "standSide", "armsUp"],
  "double-column": ["wristOffer", "standFront", "seated", "torsoStudy"],
  karada: ["standFront", "torsoStudy", "armsUp", "standSide", "standBack"],
  tasuki: ["standBack", "torsoStudy", "armsUp", "standFront"],
  shinju: ["torsoStudy", "standFront", "armsUp", "standSide"],
  "hip-harness": ["hipStudy", "hipTurn", "standFront", "standSide"],
  chair: ["seated", "wristOffer", "torsoStudy", "standFront"],
  futomomo: ["floor", "hipStudy", "kneeling", "kneelSide"],
  "frog-tie": ["kneeling", "floor", "hipStudy", "recline"],
  mermaid: ["seated", "floor", "hipTurn", "walk"],
};

function rotate(poses: NyxNudePose[], stepIndex: number, count: number): NyxNudePose[] {
  if (poses.length === 0) return [];
  const start = ((stepIndex % poses.length) + poses.length) % poses.length;
  const out: NyxNudePose[] = [];
  for (let i = 0; i < count; i += 1) {
    out.push(poses[(start + i) % poses.length]!);
  }
  return out;
}

/** Three nude studies per knot step — enough to read the body, not one token photo. */
export function nyxNudesForKnotStep(slug: string, stepIndex: number): NyxNudePose[] {
  return rotate(KNOT_NUDES[slug] ?? ["standFront", "wristOffer", "torsoStudy"], stepIndex, 3);
}

export function nyxNudesForTieStep(slug: string, stepIndex: number): NyxNudePose[] {
  return rotate(TIE_NUDES[slug] ?? ["standFront", "standSide", "torsoStudy"], stepIndex, 3);
}

export function nyxNudeCaption(pose: NyxNudePose): string {
  return NYX_NUDE_CAPTIONS[pose];
}
