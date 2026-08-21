export function smooth(xs: number[], window = 5): number[] {
  if (xs.length === 0) return [];
  const half = Math.max(1, Math.floor(window / 2));
  return xs.map((_, i) => {
    let sum = 0;
    let n = 0;
    for (let j = i - half; j <= i + half; j++) {
      if (j >= 0 && j < xs.length) {
        sum += xs[j]!;
        n++;
      }
    }
    return n ? sum / n : 0;
  });
}

export function findPeaks(xs: number[], minRatio = 0.38): { index: number; value: number }[] {
  if (xs.length < 3) return [];
  let max = 0;
  for (const value of xs) {
    if (Number.isFinite(value) && value > max) max = value;
  }
  if (max <= 0) return [];

  const ratio = Number.isFinite(minRatio) ? Math.max(0, Math.min(1, minRatio)) : 0.38;
  const threshold = max * ratio;
  const candidates: { index: number; value: number }[] = [];

  // Collapse each flat-topped local maximum into one candidate. The former
  // `>=` scan emitted a new peak every four rows across a single wide band.
  for (let i = 1; i < xs.length - 1; ) {
    const value = xs[i]!;
    if (!Number.isFinite(value) || value < threshold) {
      i++;
      continue;
    }

    const epsilon = Math.max(1e-6, Math.abs(value) * 1e-6);
    let end = i;
    let plateauMax = value;
    while (
      end + 1 < xs.length - 1 &&
      Number.isFinite(xs[end + 1]) &&
      Math.abs(xs[end + 1]! - value) <= epsilon
    ) {
      end++;
      plateauMax = Math.max(plateauMax, xs[end]!);
    }

    const left = xs[i - 1]!;
    const right = xs[end + 1]!;
    if (
      Number.isFinite(left) &&
      Number.isFinite(right) &&
      plateauMax > left + epsilon &&
      plateauMax > right + epsilon
    ) {
      candidates.push({ index: Math.floor((i + end) / 2), value: plateauMax });
    }
    i = end + 1;
  }

  // Non-maximum suppression scales with image height. At the camera's
  // 240-pixel analysis height this keeps distinct bands about six rows apart,
  // while avoiding a fixed pixel constant that changes meaning by resolution.
  const minDistance = Math.max(4, Math.round(xs.length * 0.025));
  const selected: { index: number; value: number }[] = [];
  for (const candidate of [...candidates].sort((a, b) => b.value - a.value)) {
    if (selected.every((peak) => Math.abs(peak.index - candidate.index) >= minDistance)) {
      selected.push(candidate);
    }
  }
  return selected.sort((a, b) => a.index - b.index);
}

export function linearSlope(xs: number[]): number {
  const n = xs.length;
  if (n < 2) return 0;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += xs[i]!;
    sumXY += i * xs[i]!;
    sumXX += i * i;
  }
  const den = n * sumXX - sumX * sumX;
  if (Math.abs(den) < 1e-9) return 0;
  return (n * sumXY - sumX * sumY) / den;
}

export function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function mean(xs: number[]) {
  if (!xs.length) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}
