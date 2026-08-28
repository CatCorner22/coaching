/**
 * Illustrated adult nude studies of Nyx for Academy lessons.
 *
 * Photoreal nudes live under `/instructor/nyx/nude/` — generate with Settings
 * or `node scripts/generate-nyx-photo-nudes.mjs` when XAI_API_KEY is set.
 * These illustrated poses are the fallback when photo files are missing.
 */

import type { NyxPhotoNudePose } from "./nyx-photo-nudes";
import { NYX_PHOTO_NUDE_POSES } from "./nyx-photo-nudes";

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

const KNOT_NUDES: Record<string, Array<NyxNudePose | NyxPhotoNudePose>> = {
  "somerville-bowline": ["wrist-offer", "stand-front", "torso-close", "column-wrist", "stand-side"],
  "larks-head": ["wrist-offer", "stand-front", "rope-coil", "walk"],
  "half-hitch": ["wrist-offer", "stand-side", "column-wrist", "torso-close"],
  "double-half-hitch": ["wrist-offer", "stand-front", "arms-up", "column-wrist"],
  square: ["wrist-offer", "seated", "stand-front", "rope-coil"],
  "overhand-on-bight": ["wrist-offer", "torso-close", "stand-front", "portrait-nude"],
};

const TIE_NUDES: Record<string, Array<NyxNudePose | NyxPhotoNudePose>> = {
  "single-column": ["wrist-offer", "stand-front", "stand-side", "arms-up", "column-wrist"],
  "double-column": ["wrist-offer", "stand-front", "seated", "torso-close"],
  karada: ["stand-front", "torso-close", "chest-line", "arms-up", "stand-back"],
  tasuki: ["stand-back", "torso-close", "arms-up", "stand-front"],
  shinju: ["torso-close", "stand-front", "chest-line", "stand-side"],
  "hip-harness": ["hip-close", "hip-turn", "stand-front", "stand-side"],
  chair: ["seated", "wrist-offer", "torso-close", "stand-front"],
  futomomo: ["floor", "hip-close", "kneeling", "thigh-stack", "kneel-side"],
  "frog-tie": ["kneeling", "floor", "hip-close", "recline"],
  mermaid: ["mermaid-seat", "floor", "hip-turn", "walk"],
};

const DEFAULT_KNOT: Array<NyxNudePose | NyxPhotoNudePose> = [
  "stand-front",
  "wrist-offer",
  "torso-close",
  "portrait-nude",
  "rope-coil",
];
const DEFAULT_TIE: Array<NyxNudePose | NyxPhotoNudePose> = [
  "stand-front",
  "stand-side",
  "torso-close",
  "hip-close",
  "portrait-nude",
];

function rotate<T extends string>(poses: T[], stepIndex: number, count: number): T[] {
  if (poses.length === 0) return [];
  const start = ((stepIndex % poses.length) + poses.length) % poses.length;
  const out: T[] = [];
  for (let i = 0; i < count; i += 1) {
    out.push(poses[(start + i) % poses.length]!);
  }
  return out;
}

/** Five nude studies per knot step — photo paths when generated, illustrated fallback. */
export function nyxNudesForKnotStep(slug: string, stepIndex: number): Array<NyxNudePose | NyxPhotoNudePose> {
  return rotate(KNOT_NUDES[slug] ?? DEFAULT_KNOT, stepIndex, 5);
}

export function nyxNudesForTieStep(slug: string, stepIndex: number): Array<NyxNudePose | NyxPhotoNudePose> {
  return rotate(TIE_NUDES[slug] ?? DEFAULT_TIE, stepIndex, 5);
}

/** Full photo catalog for the Academy gallery. */
export function nyxPhotoGalleryPoses(): readonly NyxPhotoNudePose[] {
  return NYX_PHOTO_NUDE_POSES;
}

export function nyxNudeCaption(pose: NyxNudePose): string {
  return NYX_NUDE_CAPTIONS[pose];
}
