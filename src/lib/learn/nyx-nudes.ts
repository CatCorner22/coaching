/**
 * Illustrated adult nude studies of Nyx for Academy lessons.
 *
 * Photoreal nudes live under `/instructor/nyx/nude/` — generate with
 * `npm run generate:nyx-nudes` when your xAI developer key is in the shell.
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
  "squatPrep",
  "bendForward",
  "ankleOffer",
  "proneBack",
  "sideRecline",
  "contrapposto",
  "handsOnHips",
  "backKneel",
  "legLift",
  "spineArch",
  "crouchFloor",
  "shoulderLine",
  "zSit",
  "ropeAtChest",
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
  squatPrep: "Squat prep — hips low, heels down, spine long before floor transitions.",
  bendForward: "Forward bend — lumbar and hamstring line; no rope on the neck.",
  ankleOffer: "Ankle offered — futomomo starts at the joint, not mid-calf.",
  proneBack: "Prone back — scapula spread and lumbar curve visible on the mat.",
  sideRecline: "Side recline — rib flare and hip stack for low rehearsal.",
  contrapposto: "Contrapposto — weight shift shows true hip line before a harness.",
  handsOnHips: "Hands on hips — waist readable; elbows clear for arm work.",
  backKneel: "Kneel from behind — shoulder blades and sacrum for rear-body awareness.",
  legLift: "Leg lift — thigh line and hip flexion before a futomomo fold.",
  spineArch: "Gentle arch — sternum lift and rib spacing for chest harness prep.",
  crouchFloor: "Crouch on floor — compact base, both feet flat, no loading.",
  shoulderLine: "Shoulder line — collarbone to deltoid; nothing crosses the throat.",
  zSit: "Z-sit — grounded hips, one shin forward, wrists free.",
  ropeAtChest: "Rope at chest — coil held high; drape never touches the neck.",
};

/** Every foundation lesson step shows this many unique nude studies. */
export const NYX_NUDES_PER_STEP = 8;

const KNOT_NUDES: Record<string, Array<NyxNudePose | NyxPhotoNudePose>> = {
  "somerville-bowline": [
    "wrist-offer",
    "stand-front",
    "torso-close",
    "column-wrist",
    "stand-side",
    "squat-prep",
    "bend-forward",
    "ankle-offer",
  ],
  "larks-head": [
    "wrist-offer",
    "stand-front",
    "rope-coil",
    "walk",
    "portrait-nude",
    "hands-on-hips",
    "contrapposto",
    "shoulder-line",
  ],
  "half-hitch": [
    "wrist-offer",
    "stand-side",
    "column-wrist",
    "torso-close",
    "portrait-nude",
    "leg-lift",
    "spine-arch",
    "z-sit",
  ],
  "double-half-hitch": [
    "wrist-offer",
    "stand-front",
    "arms-up",
    "column-wrist",
    "torso-close",
    "double-column-wrist",
    "waist-wrap",
    "crouch-floor",
  ],
  square: [
    "wrist-offer",
    "seated",
    "stand-front",
    "rope-coil",
    "walk",
    "rope-at-chest",
    "seated-profile",
    "full-length-front",
  ],
  "overhand-on-bight": [
    "wrist-offer",
    "torso-close",
    "stand-front",
    "portrait-nude",
    "arms-up",
    "bend-forward",
    "full-length-side",
    "prone-back",
  ],
};

const TIE_NUDES: Record<string, Array<NyxNudePose | NyxPhotoNudePose>> = {
  "single-column": [
    "wrist-offer",
    "stand-front",
    "stand-side",
    "arms-up",
    "column-wrist",
    "double-column-wrist",
    "shoulder-line",
    "portrait-nude",
  ],
  "double-column": [
    "wrist-offer",
    "stand-front",
    "seated",
    "torso-close",
    "stand-side",
    "double-column-wrist",
    "waist-wrap",
    "full-length-front",
  ],
  karada: [
    "stand-front",
    "torso-close",
    "chest-line",
    "arms-up",
    "stand-back",
    "spine-arch",
    "rope-at-chest",
    "full-length-back",
  ],
  tasuki: [
    "stand-back",
    "torso-close",
    "arms-up",
    "stand-front",
    "chest-line",
    "shoulder-line",
    "contrapposto",
    "bend-forward",
  ],
  shinju: [
    "torso-close",
    "stand-front",
    "chest-line",
    "stand-side",
    "portrait-nude",
    "rope-at-chest",
    "seated-profile",
    "full-length-front",
  ],
  "hip-harness": [
    "hip-close",
    "hip-turn",
    "stand-front",
    "stand-side",
    "portrait-nude",
    "leg-lift",
    "waist-wrap",
    "full-length-side",
  ],
  chair: [
    "seated",
    "wrist-offer",
    "torso-close",
    "stand-front",
    "arms-up",
    "z-sit",
    "seated-profile",
    "crouch-floor",
  ],
  futomomo: [
    "floor",
    "hip-close",
    "kneeling",
    "thigh-stack",
    "kneel-side",
    "ankle-offer",
    "leg-lift",
    "prone-back",
  ],
  "frog-tie": [
    "kneeling",
    "floor",
    "hip-close",
    "recline",
    "thigh-stack",
    "crouch-floor",
    "side-recline",
    "back-kneel",
  ],
  mermaid: [
    "mermaid-seat",
    "floor",
    "hip-turn",
    "walk",
    "seated",
    "z-sit",
    "side-recline",
    "full-length-side",
  ],
};

const DEFAULT_KNOT: Array<NyxNudePose | NyxPhotoNudePose> = [
  "stand-front",
  "wrist-offer",
  "torso-close",
  "portrait-nude",
  "rope-coil",
  "squat-prep",
  "bend-forward",
  "hands-on-hips",
];
const DEFAULT_TIE: Array<NyxNudePose | NyxPhotoNudePose> = [
  "stand-front",
  "stand-side",
  "torso-close",
  "hip-close",
  "portrait-nude",
  "arms-up",
  "leg-lift",
  "full-length-back",
];

/** Rotate a pool of unique poses; pool must hold at least `count` distinct entries. */
function rotateUnique<T extends string>(pool: T[], stepIndex: number, count: number): T[] {
  const unique = [...new Set(pool)];
  if (unique.length < count) {
    throw new Error(`Nyx nude pool needs at least ${count} unique poses (got ${unique.length})`);
  }
  const start = ((stepIndex % unique.length) + unique.length) % unique.length;
  return Array.from({ length: count }, (_, i) => unique[(start + i) % unique.length]!);
}

export function nyxNudesForKnotStep(slug: string, stepIndex: number): Array<NyxNudePose | NyxPhotoNudePose> {
  return rotateUnique(KNOT_NUDES[slug] ?? DEFAULT_KNOT, stepIndex, NYX_NUDES_PER_STEP);
}

export function nyxNudesForTieStep(slug: string, stepIndex: number): Array<NyxNudePose | NyxPhotoNudePose> {
  return rotateUnique(TIE_NUDES[slug] ?? DEFAULT_TIE, stepIndex, NYX_NUDES_PER_STEP);
}

export function nyxPhotoGalleryPoses(): readonly NyxPhotoNudePose[] {
  return NYX_PHOTO_NUDE_POSES;
}

export function nyxNudeCaption(pose: NyxNudePose): string {
  return NYX_NUDE_CAPTIONS[pose];
}
