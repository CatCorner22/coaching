import { isDark, isRope, isSkin, meanRgb, palenessScore, type RGB } from "./color";
import { findPeaks, smooth } from "./signal";
import type { FrameObservation, WrapBand } from "./types";

export function observeFrame(
  data: ImageData,
  previous?: Uint8ClampedArray,
): FrameObservation {
  const { width, height, data: buf } = data;
  const rowRope = new Float32Array(height);
  const skinPixels: { x: number; y: number; rgb: RGB }[] = [];
  let ropeN = 0;
  let skinN = 0;
  let motionAcc = 0;
  let motionN = 0;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  const step = width > 200 ? 2 : 1;
  for (let y = 0; y < height; y += step) {
    let ropeOnRow = 0;
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      const r = buf[i]!;
      const g = buf[i + 1]!;
      const b = buf[i + 2]!;
      if (isDark(r, g, b)) continue;
      if (isRope(r, g, b)) {
        ropeN++;
        ropeOnRow++;
      } else if (isSkin(r, g, b)) {
        skinN++;
        skinPixels.push({ x, y, rgb: { r, g, b } });
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
      if (previous) {
        const dr = r - previous[i]!;
        const dg = g - previous[i + 1]!;
        const db = b - previous[i + 2]!;
        motionAcc += Math.abs(dr) + Math.abs(dg) + Math.abs(db);
        motionN++;
      }
    }
    rowRope[y] = ropeOnRow;
    if (step === 2 && y + 1 < height) rowRope[y + 1] = ropeOnRow;
  }

  const sampled = Math.ceil(width / step) * Math.ceil(height / step);
  const body =
    skinN > 30 && maxX > minX
      ? { x: minX, y: minY, w: maxX - minX, h: maxY - minY }
      : null;

  const series = smooth(Array.from(rowRope), 7);
  const peaks = findPeaks(series, 0.4);
  const wrapBands: WrapBand[] = peaks
    .filter((p) => {
      if (!body) return p.value > 2;
      const yNorm = p.index / height;
      const top = body.y / height;
      const bot = (body.y + body.h) / height;
      return yNorm > top + 0.08 && yNorm < bot - 0.05;
    })
    .map((p) => ({
      yNorm: p.index / height,
      strength: p.value,
    }));

  let neckRope = 0;
  if (body) {
    const neckTop = body.y;
    const neckBot = body.y + body.h * 0.16;
    let neckCells = 0;
    let neckRopeN = 0;
    for (let y = Math.max(0, neckTop | 0); y < Math.min(height, neckBot); y += step) {
      for (let x = body.x; x < body.x + body.w; x += step) {
        const i = (y * width + x) * 4;
        neckCells++;
        if (isRope(buf[i]!, buf[i + 1]!, buf[i + 2]!)) neckRopeN++;
      }
    }
    neckRope = neckCells ? neckRopeN / neckCells : 0;
  }

  const handPixels = skinPixels.filter((p) => {
    if (!body) return p.y > height * 0.55;
    return p.y > body.y + body.h * 0.62;
  });
  const handMean = meanRgb(handPixels.map((p) => p.rgb));
  const paleness = handPixels.length > 8 ? palenessScore(handMean) : 0;
  const blueness =
    handPixels.length > 8
      ? Math.max(0, (handMean.b - (handMean.r + handMean.g) / 2) / 80)
      : 0;

  return {
    width,
    height,
    ropeShare: ropeN / sampled,
    skinShare: skinN / sampled,
    wrapBands,
    neckRope,
    paleness,
    blueness,
    motion: motionN ? motionAcc / (motionN * 255 * 3) : 0,
    body,
  };
}

export function sampleHands(data: ImageData): RGB | null {
  const obs = observeFrame(data);
  if (!obs.body) return null;
  const { width, height, data: buf } = data;
  const pixels: RGB[] = [];
  const y0 = Math.floor(obs.body.y + obs.body.h * 0.65);
  for (let y = y0; y < Math.min(height, obs.body.y + obs.body.h); y += 2) {
    for (let x = obs.body.x; x < obs.body.x + obs.body.w; x += 2) {
      const i = (y * width + x) * 4;
      const r = buf[i]!;
      const g = buf[i + 1]!;
      const b = buf[i + 2]!;
      if (isSkin(r, g, b)) pixels.push({ r, g, b });
    }
  }
  if (pixels.length < 12) return null;
  return meanRgb(pixels);
}
