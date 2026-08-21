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
  const max = Math.max(...xs, 1e-6);
  const thresh = max * minRatio;
  const peaks: { index: number; value: number }[] = [];
  for (let i = 1; i < xs.length - 1; i++) {
    const v = xs[i]!;
    if (v >= thresh && v >= xs[i - 1]! && v >= xs[i + 1]!) {
      const last = peaks[peaks.length - 1];
      if (last && i - last.index < 4) {
        if (v > last.value) peaks[peaks.length - 1] = { index: i, value: v };
      } else {
        peaks.push({ index: i, value: v });
      }
    }
  }
  return peaks;
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
