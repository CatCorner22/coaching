/**
 * Real photo nudes of Nyx — drop-in paths under `/instructor/nyx/nude/`.
 *
 * Files are generated via xAI Grok Imagine (Settings → Generate, or
 * `node scripts/generate-nyx-photo-nudes.mjs`) and served as static assets.
 * When a photo file is missing, lessons fall back to illustrated studies.
 */

const V = 1;
const BASE = `/instructor/nyx/nude`;

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
] as const;

export type NyxPhotoNudePose = (typeof NYX_PHOTO_NUDE_POSES)[number];

export const NYX_PHOTO_NUDE_PROMPTS: Record<NyxPhotoNudePose, string> = {
  "stand-front":
    "Photorealistic fine-art figure study. Fictional adult woman late 20s, unambiguously adult, long straight black hair with blunt bangs, warm olive skin, athletic toned build, small moth tattoo on upper chest, neo-traditional tattoo sleeve on right arm. Standing nude full front view, calm instructional expression, holding a coil of warm ochre jute rope. Neutral mid-grey seamless studio backdrop, even soft lighting, educational anatomy reference, not sexual, no text.",
  "stand-side":
    "Photorealistic fine-art figure study. Fictional adult woman late 20s, long black hair bangs, warm olive skin, athletic build, moth chest tattoo. Standing nude side profile, calm face, ochre jute rope draped over forearm. Grey studio backdrop, even lighting, educational, not sexual.",
  "stand-back":
    "Photorealistic fine-art figure study. Fictional adult woman late 20s, standing nude back view, long black hair, warm olive skin, tattoo sleeve visible on right arm, scapula and lumbar line clear. Grey studio, even lighting, educational anatomy, not sexual.",
  "seated":
    "Photorealistic fine-art figure study. Fictional adult woman late 20s nude seated on wooden bench, long black hair bangs, warm olive skin, moth tattoo, ochre jute rope in lap, calm instructional gaze. Grey studio, even lighting, educational.",
  "kneeling":
    "Photorealistic fine-art figure study. Fictional adult woman late 20s nude kneeling on yoga mat, long black hair, warm olive skin, holding ochre jute rope, calm expression. Grey studio, educational shibari demonstration reference.",
  floor:
    "Photorealistic fine-art figure study. Fictional adult woman late 20s nude reclining on dark mat, side angle, long black hair, warm olive skin, rope nearby, calm face. Grey studio, educational floor-work reference.",
  "arms-up":
    "Photorealistic fine-art figure study. Fictional adult woman late 20s nude standing, arms raised overhead, long black hair, warm olive skin, moth tattoo, underarm and rib line visible. Grey studio, educational chest-harness prep reference.",
  "wrist-offer":
    "Photorealistic fine-art figure study. Fictional adult woman late 20s nude three-quarter view, offering wrists forward, single column of ochre jute rope around one wrist with finger gap, long black hair bangs, warm olive skin. Grey studio, educational.",
  "hip-turn":
    "Photorealistic fine-art figure study. Fictional adult woman late 20s nude three-quarter hip turn, waist and hip line visible, long black hair, warm olive skin. Grey studio, educational hip harness awareness reference.",
  walk:
    "Photorealistic fine-art figure study. Fictional adult woman late 20s nude walking toward camera, long black hair, warm olive skin, ochre rope in hand, calm expression. Grey studio, full body line visible.",
  "torso-close":
    "Photorealistic fine-art figure study close crop. Fictional adult woman late 20s nude torso front, breasts and sternum, moth tattoo, warm olive skin, long black hair at frame edge. Grey studio, educational torso reference.",
  "hip-close":
    "Photorealistic fine-art figure study close crop. Fictional adult woman late 20s nude hips and upper thighs front, warm olive skin, iliac crest visible. Grey studio, educational futomomo prep reference.",
  recline:
    "Photorealistic fine-art figure study. Fictional adult woman late 20s nude reclined on side, long black hair, warm olive skin, rope coil near hip, calm face. Grey studio, low rehearsal reference.",
  "kneel-side":
    "Photorealistic fine-art figure study. Fictional adult woman late 20s nude kneeling side view, shin and thigh stack visible, long black hair profile, warm olive skin. Grey studio, educational.",
  "portrait-nude":
    "Photorealistic fine-art portrait. Fictional adult woman late 20s nude from waist up, long black hair blunt bangs, smoky eyes, matte dark lipstick, moth tattoo on chest, warm olive skin, calm instructional expression. Grey studio backdrop.",
  "rope-coil":
    "Photorealistic fine-art figure study. Fictional adult woman late 20s nude seated, close on hands and lap holding ochre jute rope coil, breasts partially in frame, warm olive skin, long black hair. Grey studio, rope prep reference.",
  "column-wrist":
    "Photorealistic fine-art close study. Fictional adult woman late 20s nude, close on two wrists with ochre jute single-column tie, finger gap visible, warm olive skin. Grey studio, educational.",
  "chest-line":
    "Photorealistic fine-art figure study. Fictional adult woman late 20s nude standing, chest and rib line with loose ochre rope draped not tied on neck, warm olive skin, long black hair. Grey studio, educational harness spacing reference.",
  "thigh-stack":
    "Photorealistic fine-art figure study. Fictional adult woman late 20s nude seated, one leg folded (futomomo prep position), thigh and knee line clear, warm olive skin. Grey studio, educational.",
  "mermaid-seat":
    "Photorealistic fine-art figure study. Fictional adult woman late 20s nude seated with both legs to one side mermaid pose, long black hair, warm olive skin, calm face. Grey studio, educational.",
};

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
};

export function nyxPhotoNudeFile(pose: NyxPhotoNudePose): string {
  return `nyx-nude-${pose}.webp`;
}

export function nyxPhotoNudeUrl(pose: NyxPhotoNudePose): string {
  return `${BASE}/${nyxPhotoNudeFile(pose)}?v=${V}`;
}

export function nyxPhotoNudePrompt(pose: NyxPhotoNudePose): string {
  return NYX_PHOTO_NUDE_PROMPTS[pose];
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
};

export function photoPoseForIllustrated(illustrated: string): NyxPhotoNudePose | null {
  return ILLUSTRATED_TO_PHOTO[illustrated] ?? null;
}

const PHOTO_TO_ILLUSTRATED = Object.fromEntries(
  Object.entries(ILLUSTRATED_TO_PHOTO).map(([k, v]) => [v, k]),
) as Partial<Record<NyxPhotoNudePose, keyof typeof ILLUSTRATED_TO_PHOTO>>;

export function illustratedPoseForPhoto(photo: NyxPhotoNudePose): string | null {
  return PHOTO_TO_ILLUSTRATED[photo] ?? null;
}
