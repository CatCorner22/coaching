import { isDark, isDarkFiber, isRope, type RGB } from "./color";
import { findPeaks, smooth } from "./signal";
import type { FrameObservation, WrapBand } from "./types";

/**
 * Produce low-stakes image hints for framing only.
 *
 * This deliberately does not localize a body or hands from skin color and does
 * not estimate pallor, blueness, circulation, sensation, anatomy, or a neck.
 * The remaining rope-color/edge hints are unvalidated and must never be used as
 * safety clearance or as proof that a category is present or absent.
 */
export function observeFrame(
  data: ImageData,
  previous?: Uint8ClampedArray,
): FrameObservation {
  const { width, height, data: buf } = data;
  const rowRope = new Float32Array(height);
  let ropeN = 0;
  let motionAcc = 0;
  let motionN = 0;

  const step = width > 200 ? 2 : 1;
  for (let y = 0; y < height; y += step) {
    let ropeOnRow = 0;
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      const r = buf[i]!;
      const g = buf[i + 1]!;
      const b = buf[i + 2]!;
      if (previous?.length === buf.length) {
        const dr = r - previous[i]!;
        const dg = g - previous[i + 1]!;
        const db = b - previous[i + 2]!;
        motionAcc += Math.abs(dr) + Math.abs(dg) + Math.abs(db);
        motionN++;
      }
      if (isDark(r, g, b) && !isDarkFiber(r, g, b)) continue;
      if (isRope(r, g, b) || isDarkFiber(r, g, b)) {
        ropeN++;
        ropeOnRow++;
      }
    }
    rowRope[y] = ropeOnRow;
    if (step === 2 && y + 1 < height) rowRope[y + 1] = ropeOnRow;
  }

  const sampled = Math.max(1, Math.ceil(width / step) * Math.ceil(height / step));
  const series = smooth(Array.from(rowRope), 7);

  // Structure gate: rope reads as a few thin horizontal bands. Skin, clothing
  // and lingerie fabric, furniture, and walls read as tall blobs. Natural-fiber
  // rope overlaps skin in color space, so geometry — not pixel color — is the
  // only local separator, and both gates fail toward "no band" on ambiguity.
  const coverage = ropeN / sampled;
  const saturated = coverage > 0.5;
  const maxBandRows = Math.max(6, Math.round(height * 0.09));
  const bandIsThin = (peak: { index: number; value: number }) => {
    const floor = peak.value * 0.6;
    let rows = 1;
    for (let j = peak.index - 1; j >= 0 && series[j]! >= floor; j--) rows++;
    for (let j = peak.index + 1; j < series.length && series[j]! >= floor; j++) rows++;
    return rows <= maxBandRows;
  };

  const wrapBands: WrapBand[] = saturated
    ? []
    : findPeaks(series, 0.4)
        .filter((peak) => peak.value > 2 && bandIsThin(peak))
        .map((peak) => ({
          yNorm: peak.index / Math.max(1, height),
          strength: peak.value,
        }));

  return {
    width,
    height,
    ropeShare: ropeN / sampled,
    skinShare: 0,
    wrapBands,
    neckRope: 0,
    paleness: 0,
    blueness: 0,
    motion: motionN ? motionAcc / (motionN * 255 * 3) : 0,
    body: null,
  };
}

/** @deprecated Image-only hand/physiology sampling is intentionally disabled. */
export function sampleHands(_data: ImageData): RGB | null {
  return null;
}
