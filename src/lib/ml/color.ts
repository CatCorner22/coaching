export type RGB = { r: number; g: number; b: number };

export function isSkin(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const kovac =
    r > 95 &&
    g > 40 &&
    b > 20 &&
    max - min > 15 &&
    Math.abs(r - g) > 15 &&
    r > g &&
    r > b;
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  const ycbcr = cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173 && y > 40;
  const notHemp = g - b < 48;
  return kovac && ycbcr && notHemp;
}

/**
 * Broad skin-tone exclusion across pale-to-deep tones (approximate
 * Fitzpatrick I–VI coverage). Deliberately wider than `isSkin`: the Kovac rule
 * misses flash-washed pale skin (|r−g| ≤ 15) and deep tones (r ≤ 95), both of
 * which otherwise fall into the rope color range. Natural-fiber rope overlaps
 * this chroma box, so ambiguity resolves toward "skin" and band *geometry* in
 * `observeFrame` — not pixel color — is what separates rope from a person.
 */
export function isSkinLike(r: number, g: number, b: number) {
  if (isSkin(r, g, b)) return true;
  const y = luma(r, g, b);
  const s = sat(r, g, b);
  // Pale or brightly lit skin: bright, low saturation, warm channel ordering.
  if (y > 150 && s < 0.28 && r >= g && g >= b - 4 && r - g <= 42) return true;
  // Deep skin tones: warm chroma inside the YCbCr skin box at luminance and
  // red levels below what the Kovac rule admits. Bounded at r ≤ 115 so
  // midtone jute/hemp (typically r ≥ 140) is not swallowed.
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  return (
    r <= 115 &&
    y >= 20 &&
    y <= 110 &&
    cb >= 90 &&
    cb <= 127 &&
    cr >= 134 &&
    cr <= 168 &&
    r > g &&
    g >= b - 6 &&
    s >= 0.18 &&
    s <= 0.78
  );
}

export function isRope(r: number, g: number, b: number) {
  if (isSkinLike(r, g, b)) return false;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const s = max === 0 ? 0 : (max - min) / max;
  return (
    r > 70 &&
    r > g &&
    g >= b - 8 &&
    s > 0.12 &&
    s < 0.82 &&
    max > 55 &&
    max < 230 &&
    r - b > 18 &&
    r - g < 90
  );
}

export function isHandTone(r: number, g: number, b: number) {
  if (isSkin(r, g, b)) return true;
  const y = luma(r, g, b);
  const s = sat(r, g, b);
  const blueBias = b - (r + g) / 2;
  if (y > 175 && s < 0.22 && Math.abs(r - g) < 28) return true;
  if (y > 55 && y < 210 && blueBias > 10 && b > r - 8) return true;
  return false;
}

export function luma(r: number, g: number, b: number) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function sat(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

/** Black/dark hemp that would otherwise be discarded as background. */
export function isDarkFiber(r: number, g: number, b: number) {
  const y = luma(r, g, b);
  return y >= 16 && y < 48 && sat(r, g, b) < 0.38;
}

export function isDark(r: number, g: number, b: number) {
  return luma(r, g, b) < 42;
}

export function rgbToLab(c: RGB): [number, number, number] {
  let r = c.r / 255;
  let g = c.g / 255;
  let b = c.b / 255;
  r = r > 0.04045 ? ((r + 0.055) / 1.055) ** 2.4 : r / 12.92;
  g = g > 0.04045 ? ((g + 0.055) / 1.055) ** 2.4 : g / 12.92;
  b = b > 0.04045 ? ((b + 0.055) / 1.055) ** 2.4 : b / 12.92;
  let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1;
  let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  x = f(x);
  y = f(y);
  z = f(z);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

export function deltaE(a: RGB, b: RGB) {
  const [l1, a1, b1] = rgbToLab(a);
  const [l2, a2, b2] = rgbToLab(b);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}

export function palenessScore(c: RGB) {
  const lum = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  const blueBias = c.b - (c.r + c.g) / 2;
  return Math.max(0, Math.min(1, lum / 255 - 0.15 + Math.max(0, blueBias) / 180));
}

export function meanRgb(pixels: RGB[]): RGB {
  if (!pixels.length) return { r: 0, g: 0, b: 0 };
  const n = pixels.length;
  let r = 0;
  let g = 0;
  let b = 0;
  for (const p of pixels) {
    r += p.r;
    g += p.g;
    b += p.b;
  }
  return { r: r / n, g: g / n, b: b / n };
}
