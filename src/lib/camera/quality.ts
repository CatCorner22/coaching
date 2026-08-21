/** Camera skill: score stills so the coach sees rope, not blur. */

import { isDarkFiber, isHandTone, isRope, isSkin } from "@/lib/ml/color";

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

/** Dark brown hemp that misses isRope (r ≤ 70) and isDarkFiber (too saturated). */
function isDarkJute(r: number, g: number, b: number) {
  if (isSkin(r, g, b) || isHandTone(r, g, b)) return false;
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const s = max === 0 ? 0 : (max - min) / max;
  return (
    y >= 18 &&
    y < 70 &&
    r < 95 &&
    r >= g - 2 &&
    g >= b - 8 &&
    r - b > 10 &&
    s > 0.12 &&
    s < 0.85
  );
}

export function ropeHint(data: ImageData): number {
  const buf = data.data;
  let rope = 0;
  let n = 0;
  for (let i = 0; i < buf.length; i += 16) {
    const r = buf[i]!;
    const g = buf[i + 1]!;
    const b = buf[i + 2]!;
    if (isRope(r, g, b) || isDarkFiber(r, g, b) || isDarkJute(r, g, b)) rope++;
    n++;
  }
  return n ? rope / n : 0;
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
  const danger = items.filter((x) => (x.neck ?? 0) > 0.08 || (x.paleness ?? 0) > 0.45);
  const pool = danger.length ? danger : items;
  return pool
    .map((x) => {
      const q = scoreFrame(x.data);
      return { x, s: q.score + (x.neck ?? 0) * 0.8 + (x.paleness ?? 0) * 0.4 };
    })
    .sort((a, b) => b.s - a.s)
    .slice(0, keep)
    .map((row) => row.x.item);
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
