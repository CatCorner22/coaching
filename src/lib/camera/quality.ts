/** Camera skill: score stills so the coach sees rope, not blur. */

import { isDarkFiber, isHandTone, isRope, isSkin } from "../ml/color";

export type FrameQuality = {
  sharpness: number;
  exposure: number;
  ropeHint: number;
  score: number;
  notes: string[];
};

const EMPTY_FRAME_QUALITY: FrameQuality = {
  sharpness: 0,
  exposure: 0,
  ropeHint: 0,
  score: 0,
  notes: ["No readable frame was available."],
};

export function laplacianVar(data: ImageData): number {
  const { width, height, data: buf } = data;
  const gray = new Float32Array(width * height);
  for (let i = 0, p = 0; i < buf.length; i += 4, p++) {
    gray[p] = 0.299 * buf[i]! + 0.587 * buf[i + 1]! + 0.114 * buf[i + 2]!;
  }
  let sum = 0;
  let sumSq = 0;
  let n = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const v =
        4 * gray[i]! -
        gray[i - 1]! -
        gray[i + 1]! -
        gray[i - width]! -
        gray[i + width]!;
      sum += v;
      sumSq += v * v;
      n++;
    }
  }
  if (!n) return 0;
  const mean = sum / n;
  return Math.max(0, sumSq / n - mean * mean);
}

export function exposureScore(data: ImageData): number {
  const buf = data.data;
  let dark = 0;
  let bright = 0;
  let n = 0;
  for (let i = 0; i < buf.length; i += 16) {
    const y = 0.299 * buf[i]! + 0.587 * buf[i + 1]! + 0.114 * buf[i + 2]!;
    if (y < 22) dark++;
    if (y > 240) bright++;
    n++;
  }
  const crush = n ? (dark + bright) / n : 1;
  return Math.max(0, 1 - crush * 1.6);
}

/** Dark brown hemp that misses the brighter rope range. */
function isDarkJute(r: number, g: number, b: number): boolean {
  if (isSkin(r, g, b) || isHandTone(r, g, b)) return false;
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;
  return (
    y >= 18 &&
    y < 70 &&
    r < 95 &&
    r >= g - 2 &&
    g >= b - 8 &&
    r - b > 10 &&
    saturation > 0.12 &&
    saturation < 0.85
  );
}

export function ropeHint(data: ImageData): number {
  const buf = data.data;
  let rope = 0;
  let n = 0;
  let lumaSum = 0;
  let lumaSquaredSum = 0;
  for (let i = 0; i < buf.length; i += 16) {
    const r = buf[i]!;
    const g = buf[i + 1]!;
    const b = buf[i + 2]!;
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    lumaSum += luma;
    lumaSquaredSum += luma * luma;
    // Dark jute and deep skin tones are chromatically inseparable per pixel,
    // and this hint steers which frame gets selected for transmission. Rope
    // is textured at pixel scale while skin expanses are smooth, so a
    // rope-colored pixel only counts beside pixel-local contrast — keeping a
    // body-dominant frame from outranking an equipment-only frame.
    const contrast =
      i < 4 ||
      Math.abs(
        luma - (0.299 * buf[i - 4]! + 0.587 * buf[i - 3]! + 0.114 * buf[i - 2]!),
      ) >= 5;
    if (contrast && (isRope(r, g, b) || isDarkFiber(r, g, b) || isDarkJute(r, g, b))) rope++;
    n++;
  }
  if (n < 4) return 0;

  const meanLuma = lumaSum / n;
  const lumaVariance = Math.max(0, lumaSquaredSum / n - meanLuma * meanLuma);
  const lumaSd = Math.sqrt(lumaVariance);
  const share = rope / n;

  // A flat dark/brown/skin-coloured surface is not evidence of rope, but
  // flatness has to be judged relative to how bright the frame is. Luminance
  // spread scales with exposure, so an absolute threshold fails in both
  // directions at once: it rejected black rope close-ups, whose whole tonal
  // range is compressed near zero, while admitting evenly lit bare skin whose
  // spread is larger in absolute terms and yet featureless.
  //
  // A share of rope-COLOURED pixels cannot stand in for this either. It reads
  // 1.00 for bare deep skin, a brown wall and an unlit room, and 0.99 for a
  // pure rope close-up, so the guard that used it returned zero for exactly the
  // equipment-only framing this app asks people to prefer — while bare skin
  // scored higher. Measured across jute, hemp, dark jute and black rope at two
  // exposures against five skin tones, relative spread separates them with
  // margin on both sides: rope frames sit at 0.089 and above, bare skin and
  // flat surfaces at 0.079 and below.
  //
  // One pair resists this and is left resisting it: hemp on olive skin at full
  // exposure lands at 0.079, indistinguishable from heavily noised bare skin at
  // 0.079, because the two colours differ by almost no luminance. Loosening the
  // threshold to admit it also admits bare skin at a rope share of 0.38, which
  // would steer the app to transmit a body frame as the rope frame — a worse
  // trade than losing a ranking bonus. Band detection in observeFrame is
  // unaffected and still reports that tie; only this frame-ranking hint abstains.
  const relativeSpread = lumaSd / Math.max(1, meanLuma);
  if (lumaSd < 2 || relativeSpread < 0.08) return 0;
  return share;
}

/**
 * @param data   Downscaled frame, for exposure and the rope colour hint.
 * @param detail Native-scale crop of the transmitted image, for focus. Falls
 *   back to `data` when absent, which understates blur — a downscale is a
 *   low-pass filter, so it removes the very frequencies shake destroys.
 */
export function scoreFrame(data: ImageData, detail?: ImageData): FrameQuality {
  const sharpness = Math.min(1, Math.log1p(laplacianVar(detail ?? data)) / Math.log1p(900));
  const exposure = exposureScore(data);
  const rope = Math.min(1, ropeHint(data) / 0.12);
  const notes: string[] = [];
  if (sharpness < 0.45) {
    notes.push("Hold the camera steady and retake an equipment-only or non-identifying view.");
  }
  if (exposure < 0.45) {
    notes.push("Add neutral light without revealing faces, identifiers, or more of the room.");
  }
  if (rope < 0.2) {
    notes.push("Keep the relevant equipment visible in an equipment-only or non-identifying view.");
  }
  const score = sharpness * 0.45 + exposure * 0.25 + rope * 0.3;
  return { sharpness, exposure, ropeHint: rope, score, notes };
}

/**
 * Summarize a selected batch conservatively. Each independent quality axis is
 * the lowest value in the batch so one usable still cannot mask another still
 * whose blur or lighting makes a batch-level conclusion unreliable.
 */
export function worstFrameQuality(qualities: readonly FrameQuality[]): FrameQuality {
  if (!qualities.length) return { ...EMPTY_FRAME_QUALITY, notes: [...EMPTY_FRAME_QUALITY.notes] };
  return {
    sharpness: Math.min(...qualities.map((quality) => finite01(quality.sharpness))),
    exposure: Math.min(...qualities.map((quality) => finite01(quality.exposure))),
    ropeHint: Math.min(...qualities.map((quality) => finite01(quality.ropeHint))),
    score: Math.min(...qualities.map((quality) => finite01(quality.score))),
    notes: [...new Set(qualities.flatMap((quality) => quality.notes.filter(Boolean)))],
  };
}

/** A privacy-minimizing UI hint; quality never justifies a more intimate view. */
export function privacySafeQualityHint(quality: FrameQuality): string {
  if (quality.sharpness < 0.55) {
    return "One or more selected frames are soft. Retake an equipment-only or non-identifying view while holding the camera steady.";
  }
  if (quality.exposure < 0.55) {
    return "One or more selected frames need neutral light. Avoid faces, identifiers, intimate areas, and extra room detail.";
  }
  if (quality.ropeHint < 0.2) {
    return "Use an equipment-only or non-identifying view with only the relevant equipment in frame.";
  }
  return "The selected stills passed a limited image-quality check; this is not safety clearance.";
}

function finite01(value: unknown): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, Math.min(1, numeric)) : 0;
}

export function pickBest<T>(
  items: { data: ImageData; item: T; neck?: number; paleness?: number }[],
  keep = 3,
): T[] {
  // `paleness` is intentionally not used. The current color heuristic has no
  // validated hand/body localization, so elevating it can select a pale wall
  // over a usable subject frame. Keep the field temporarily for call-site
  // compatibility while the observation contract is migrated.
  const neckScore = (entry: { neck?: number }) =>
    typeof entry.neck === "number" && Number.isFinite(entry.neck)
      ? Math.max(0, Math.min(1, entry.neck))
      : 0;
  const danger = items.filter((entry) => neckScore(entry) > 0.08);
  const pool = danger.length ? danger : items;
  return pool
    .map((entry) => ({
      entry,
      score: scoreFrame(entry.data).score + neckScore(entry) * 0.8,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, Number.isFinite(keep) ? Math.max(0, Math.floor(keep)) : 3)
    .map(({ entry }) => entry.item);
}

