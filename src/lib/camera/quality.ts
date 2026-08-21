/** Camera skill: score stills so the coach sees rope, not blur. */

import { isRope } from "../ml/color";

export type FrameQuality = {
  sharpness: number;
  exposure: number;
  ropeHint: number;
  score: number;
  notes: string[];
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
    if (isRope(r, g, b)) rope++;
    n++;
  }
  if (n < 4) return 0;

  const meanLuma = lumaSum / n;
  const lumaVariance = Math.max(0, lumaSquaredSum / n - meanLuma * meanLuma);
  const share = rope / n;

  // A flat brown/skin-colored surface is not evidence of rope. Require scene
  // texture and some non-rope context before using color as a ranking hint.
  if (Math.sqrt(lumaVariance) < 6 || share > 0.85) return 0;
  return share;
}

export function scoreFrame(data: ImageData): FrameQuality {
  const sharpness = Math.min(1, Math.log1p(laplacianVar(data)) / Math.log1p(900));
  const exposure = exposureScore(data);
  const rope = Math.min(1, ropeHint(data) / 0.12);
  const notes: string[] = [];
  if (sharpness < 0.45) notes.push("Hold still — this frame is soft.");
  if (exposure < 0.45) notes.push("Add light or torch. Underexposed rope disappears.");
  if (rope < 0.2) notes.push("Get closer to the wraps, not the whole room.");
  const score = sharpness * 0.45 + exposure * 0.25 + rope * 0.3;
  return { sharpness, exposure, ropeHint: rope, score, notes };
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

export function enhanceContrast(data: ImageData): ImageData {
  const out = new ImageData(new Uint8ClampedArray(data.data), data.width, data.height);
  const buf = out.data;
  let min = 255;
  let max = 0;
  for (let i = 0; i < buf.length; i += 4) {
    const y = 0.299 * buf[i]! + 0.587 * buf[i + 1]! + 0.114 * buf[i + 2]!;
    if (y < min) min = y;
    if (y > max) max = y;
  }
  const span = Math.max(1, max - min);
  for (let i = 0; i < buf.length; i += 4) {
    buf[i] = Math.min(255, Math.max(0, ((buf[i]! - min) / span) * 255));
    buf[i + 1] = Math.min(255, Math.max(0, ((buf[i + 1]! - min) / span) * 255));
    buf[i + 2] = Math.min(255, Math.max(0, ((buf[i + 2]! - min) / span) * 255));
  }
  return out;
}
