/**
 * Real photo nudes of Nyx — drop-in paths under `/instructor/nyx/nude/`.
 *
 * Generation prompts live in `scripts/nyx-photo-nude-manifest.mjs` only.
 * Run `npm run generate:nyx-nudes` when your xAI developer key is in the shell.
 */

import nudeManifest from "../../../public/instructor/nyx/nude/manifest.json" with { type: "json" };

const V = 2;
const BASE = `/instructor/nyx/nude`;

const manifestPhotos = new Set(
  (nudeManifest as { photos?: string[] }).photos?.filter((p) => typeof p === "string") ?? [],
);

export const NYX_PHOTO_NUDE_POSES = [
  "stand-front",
  "stand-side",
  "stand-back",
  "seated",
  "kneeling",
  "floor",
  "arms-up",
  "wrist-offer",
  "hip-turn",
  "walk",
  "torso-close",
  "hip-close",
  "recline",
  "kneel-side",
  "portrait-nude",
  "rope-coil",
  "column-wrist",
  "chest-line",
  "thigh-stack",
  "mermaid-seat",
  "squat-prep",
  "bend-forward",
  "ankle-offer",
  "prone-back",
  "side-recline",
  "contrapposto",
  "hands-on-hips",
  "back-kneel",
  "leg-lift",
  "spine-arch",
  "crouch-floor",
  "shoulder-line",
  "z-sit",
  "rope-at-chest",
  "double-column-wrist",
  "waist-wrap",
  "full-length-front",
  "full-length-side",
  "full-length-back",
  "seated-profile",
] as const;

export type NyxPhotoNudePose = (typeof NYX_PHOTO_NUDE_POSES)[number];

const PHOTO_POSE_SET = new Set<string>(NYX_PHOTO_NUDE_POSES);

export function isNyxPhotoNudePose(pose: string): pose is NyxPhotoNudePose {
  return PHOTO_POSE_SET.has(pose);
}

export const NYX_PHOTO_NUDE_CAPTIONS: Record<NyxPhotoNudePose, string> = {
  "stand-front": "Photo — front nude. Read breast line, waist, and hip before any torso wrap.",
  "stand-side": "Photo — side nude. Shoulder slope and belly space; nothing on the neck.",
  "stand-back": "Photo — back nude. Scapula and lumbar line for rear-body awareness.",
  seated: "Photo — seated nude. Hips grounded, wrists free for a column.",
  kneeling: "Photo — kneeling nude. Stable floor base, no loading.",
  floor: "Photo — floor nude. Full body visible so a wrap cannot hide a pinch.",
  "arms-up": "Photo — arms raised. Underarm and rib spacing before a chest harness.",
  "wrist-offer": "Photo — wrist offered. Column placement on bare skin, finger gap visible.",
  "hip-turn": "Photo — hip turn. Waist-to-thigh line before a hip harness.",
  walk: "Photo — walking nude. Tension travels; read the whole line.",
  "torso-close": "Photo — torso close. Breasts, sternum, lower ribs.",
  "hip-close": "Photo — hip close. Iliac crest and upper thigh for futomomo.",
  recline: "Photo — reclined nude. Low rehearsal, no suspension.",
  "kneel-side": "Photo — kneel side. Shin and thigh stack for mermaid or frog.",
  "portrait-nude": "Photo — portrait nude. Face and chest line for consent checks.",
  "rope-coil": "Photo — rope in lap. Midpoint and even ends before the first bight.",
  "column-wrist": "Photo — column on wrist. Two flat wraps, circulation gap visible.",
  "chest-line": "Photo — chest line. Loose rope drape, never on the neck.",
  "thigh-stack": "Photo — thigh stack. Folded leg line before futomomo.",
  "mermaid-seat": "Photo — mermaid seat. Both legs to one side, grounded hips.",
  "squat-prep": "Photo — squat prep. Hips low, heels down, spine long.",
  "bend-forward": "Photo — forward bend. Lumbar and hamstring line visible.",
  "ankle-offer": "Photo — ankle offered. Joint line clear for futomomo start.",
  "prone-back": "Photo — prone back. Scapula spread on the mat.",
  "side-recline": "Photo — side recline. Rib flare and hip stack.",
  contrapposto: "Photo — contrapposto. Weight shift shows true hip line.",
  "hands-on-hips": "Photo — hands on hips. Waist readable, elbows clear.",
  "back-kneel": "Photo — kneel from behind. Shoulder blades and sacrum.",
  "leg-lift": "Photo — leg lift. Thigh line and hip flexion.",
  "spine-arch": "Photo — gentle arch. Sternum lift for chest harness spacing.",
  "crouch-floor": "Photo — crouch on floor. Compact base, both feet flat.",
  "shoulder-line": "Photo — shoulder line. Collarbone to deltoid, throat clear.",
  "z-sit": "Photo — z-sit. Grounded hips, one shin forward.",
  "rope-at-chest": "Photo — rope at chest. Coil held high, never on neck.",
  "double-column-wrist": "Photo — double column on wrists. Two columns, finger gaps.",
  "waist-wrap": "Photo — waist wrap awareness. Hip line before a harness.",
  "full-length-front": "Photo — full length front. Entire front line in frame.",
  "full-length-side": "Photo — full length side. Profile from head to foot.",
  "full-length-back": "Photo — full length back. Rear line from hair to heel.",
  "seated-profile": "Photo — seated profile. Side view, grounded hips.",
};

export function nyxPhotoNudeFile(pose: NyxPhotoNudePose): string {
  return `nyx-nude-${pose}.webp`;
}

export function nyxPhotoNudeUrl(pose: NyxPhotoNudePose): string {
  return `${BASE}/${nyxPhotoNudeFile(pose)}?v=${V}`;
}

/** True when manifest lists this pose (avoids img 404 storms before files exist). */
export function nyxPhotoNudeAvailable(pose: NyxPhotoNudePose): boolean {
  return manifestPhotos.has(pose);
}

export function nyxPhotoNudeCaption(pose: NyxPhotoNudePose): string {
  return NYX_PHOTO_NUDE_CAPTIONS[pose];
}

/** Map illustrated pose keys to matching photo pose when available. */
export const ILLUSTRATED_TO_PHOTO: Partial<Record<string, NyxPhotoNudePose>> = {
  standFront: "stand-front",
  standSide: "stand-side",
  standBack: "stand-back",
  seated: "seated",
  kneeling: "kneeling",
  floor: "floor",
  armsUp: "arms-up",
  wristOffer: "wrist-offer",
  hipTurn: "hip-turn",
  walk: "walk",
  torsoStudy: "torso-close",
  hipStudy: "hip-close",
  recline: "recline",
  kneelSide: "kneel-side",
  squatPrep: "squat-prep",
  bendForward: "bend-forward",
  ankleOffer: "ankle-offer",
  proneBack: "prone-back",
  sideRecline: "side-recline",
  contrapposto: "contrapposto",
  handsOnHips: "hands-on-hips",
  backKneel: "back-kneel",
  legLift: "leg-lift",
  spineArch: "spine-arch",
  crouchFloor: "crouch-floor",
  shoulderLine: "shoulder-line",
  zSit: "z-sit",
  ropeAtChest: "rope-at-chest",
};

export function photoPoseForIllustrated(illustrated: string): NyxPhotoNudePose | null {
  return ILLUSTRATED_TO_PHOTO[illustrated] ?? null;
}

const PHOTO_TO_ILLUSTRATED = Object.fromEntries(
  Object.entries(ILLUSTRATED_TO_PHOTO).map(([k, v]) => [v, k]),
) as Partial<Record<NyxPhotoNudePose, keyof typeof ILLUSTRATED_TO_PHOTO>>;

/** Photo-only poses map to the nearest illustrated study when the WebP is missing. */
const PHOTO_ONLY_ILLUSTRATED: Partial<Record<NyxPhotoNudePose, keyof typeof ILLUSTRATED_TO_PHOTO>> = {
  "portrait-nude": "standFront",
  "rope-coil": "seated",
  "column-wrist": "wristOffer",
  "chest-line": "torsoStudy",
  "thigh-stack": "hipStudy",
  "mermaid-seat": "seated",
  "double-column-wrist": "wristOffer",
  "waist-wrap": "hipTurn",
  "full-length-front": "standFront",
  "full-length-side": "standSide",
  "full-length-back": "standBack",
  "seated-profile": "standSide",
};

export function illustratedPoseForPhoto(photo: NyxPhotoNudePose): string | null {
  return PHOTO_TO_ILLUSTRATED[photo] ?? PHOTO_ONLY_ILLUSTRATED[photo] ?? null;
}

/** Every photo slot must resolve to an illustrated fallback for offline rendering. */
export function assertPhotoCatalogComplete(): void {
  for (const pose of NYX_PHOTO_NUDE_POSES) {
    if (!illustratedPoseForPhoto(pose)) {
      throw new Error(`Photo pose "${pose}" has no illustrated fallback`);
    }
  }
}
