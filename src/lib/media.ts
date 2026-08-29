export const MAX_PHOTO_BYTES = 25 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
// Encoded-still budget for analysis. Must stay under the client data-URL
// validator (900,000 chars in sanitize.ts) and the server schema cap after
// base64 expansion: 640,000 bytes ≈ 853,000 base64 chars.
export const MAX_ANALYZE_IMAGE_BYTES = 640_000;
export const MAX_VIDEO_DURATION_SECONDS = 60;
// Current phones produce up to 48-50 MP stills (e.g. 8064x6048). Accept those
// uploads - header-read dimensions let the decoder resize during decode - then
// downsample before analysis, while retaining an absolute decode budget.
export const MAX_IMAGE_PIXELS = 50_000_000;
export const MAX_IMAGE_EDGE = 8_192;
export const MAX_VIDEO_FRAME_PIXELS = 16_000_000;
export const MAX_VIDEO_FRAME_EDGE = 5_120;

const MEDIA_EVENT_TIMEOUT_MS = 12_000;
const IMAGE_DECODE_TIMEOUT_MS = 8_000;
// Native bitmap decoding cannot be cancelled. Keep one orphan at a time, but
// release the lease after a long cooldown so a decoder promise that never
// settles cannot permanently disable every later photo import.
const BITMAP_DECODE_STALL_RESET_MS = 30_000;
let bitmapDecodeLease: symbol | null = null;

const PHOTO_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);
const VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
  "video/3gpp",
]);
const GENERIC_MIME_TYPES = new Set(["", "application/octet-stream", "binary/octet-stream"]);

type UploadKind = "photo" | "video";

export type ProcessedMediaFrame = {
  jpeg: string;
  imageData: ImageData;
  /**
   * A centre crop of the preview at its own scale, for judging focus.
   *
   * `imageData` is a heavy downscale of the frame that is actually transmitted,
   * which is the right input for colour and band work but the wrong one for
   * sharpness: shrinking 1600px to 240px is itself a low-pass filter, so it
   * discards exactly the fine detail camera shake destroys. Measured on
   * realistic wrap structure, a frame scoring 0.14 at full size scored 1.00
   * after the downscale — reported as perfectly sharp while badly shaken.
   */
  detailData: ImageData;
};

export function validateMediaFile(file: File, kind: UploadKind): void {
  if (!file.size) throw new Error(`The ${kind} is empty.`);
  const max = kind === "photo" ? MAX_PHOTO_BYTES : MAX_VIDEO_BYTES;
  if (file.size > max) {
    throw new Error(
      `${kind === "photo" ? "Photo" : "Video"} is too large. Choose one under ${Math.round(max / 1024 / 1024)} MB.`,
    );
  }

  const mime = file.type.toLowerCase();
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const allowedExtensions =
    kind === "photo"
      ? new Set(["jpg", "jpeg", "png", "webp", "heic", "heif"])
      : new Set(["mp4", "m4v", "mov", "webm", "3gp"]);
  const allowedMimeTypes = kind === "photo" ? PHOTO_MIME_TYPES : VIDEO_MIME_TYPES;
  const jpegAlias = kind === "photo" && mime === "image/jpg";
  if (!GENERIC_MIME_TYPES.has(mime) && !allowedMimeTypes.has(mime) && !jpegAlias) {
    throw new Error(`Choose a supported ${kind} file.`);
  }
  if ((GENERIC_MIME_TYPES.has(mime) || jpegAlias) && !allowedExtensions.has(extension)) {
    throw new Error(`That ${kind} format is not supported.`);
  }
}

export async function validateMediaSignature(
  file: Blob,
  kind: UploadKind,
): Promise<{ width: number; height: number } | null> {
  const headerLimit = kind === "photo" ? 1024 * 1024 : 64 * 1024;
  const bytes = new Uint8Array(await file.slice(0, headerLimit).arrayBuffer());
  const valid = kind === "photo" ? looksLikePhoto(bytes) : looksLikeVideo(bytes);
  if (!valid) throw new Error(`The selected ${kind} does not contain a supported media file.`);
  if (kind === "photo") {
    const dimensions = readImageDimensions(bytes);
    if (!dimensions) throw new Error("Could not verify the image dimensions before decoding.");
    assertPixelBudget(dimensions.width, dimensions.height);
    return dimensions;
  }
  return null;
}

function readImageDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  if (
    bytes.length >= 24 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    asciiAt(bytes, 12, "IHDR")
  ) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return { width: view.getUint32(16), height: view.getUint32(20) };
  }
  if (bytes.length >= 30 && asciiAt(bytes, 0, "RIFF") && asciiAt(bytes, 8, "WEBP")) {
    if (asciiAt(bytes, 12, "VP8X")) {
      const width = 1 + bytes[24]! + (bytes[25]! << 8) + (bytes[26]! << 16);
      const height = 1 + bytes[27]! + (bytes[28]! << 8) + (bytes[29]! << 16);
      return { width, height };
    }
    if (asciiAt(bytes, 12, "VP8L") && bytes[20] === 0x2f && bytes.length >= 25) {
      const bits = new DataView(bytes.buffer, bytes.byteOffset + 21, 4).getUint32(0, true);
      return {
        width: 1 + (bits & 0x3fff),
        height: 1 + ((bits >>> 14) & 0x3fff),
      };
    }
    if (
      asciiAt(bytes, 12, "VP8 ") &&
      bytes.length >= 30 &&
      bytes[23] === 0x9d && bytes[24] === 0x01 && bytes[25] === 0x2a
    ) {
      return {
        width: (bytes[26]! | (bytes[27]! << 8)) & 0x3fff,
        height: (bytes[28]! | (bytes[29]! << 8)) & 0x3fff,
      };
    }
  }
  if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2;
    while (offset + 8 < bytes.length) {
      if (bytes[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = bytes[offset + 1]!;
      offset += 2;
      if (marker === 0xd8 || marker === 0xd9 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (offset + 2 > bytes.length) break;
      const length = (bytes[offset]! << 8) | bytes[offset + 1]!;
      if (length < 2 || offset + length > bytes.length) break;
      if ((marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7) || (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf)) {
        if (length < 7) return null;
        return {
          height: (bytes[offset + 3]! << 8) | bytes[offset + 4]!,
          width: (bytes[offset + 5]! << 8) | bytes[offset + 6]!,
        };
      }
      offset += length;
    }
  }
  if (hasIsoBrand(bytes, ["heic", "heix", "hevc", "hevx", "heim", "heis", "mif1", "msf1"])) {
    return readPrimaryHeifDimensions(bytes);
  }
  return null;
}

type IsoBox = { start: number; end: number; header: number; type: string };

/**
 * Resolve HEIF dimensions only from an `ispe` property associated with the
 * primary item (`pitm` -> `ipma` -> `ipco`). A byte-pattern scan would let an
 * unrelated or attacker-inserted `ispe` box bypass the pre-decode budget.
 */
function readPrimaryHeifDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  const meta = readIsoBoxes(bytes, 0, bytes.length).find((box) => box.type === "meta");
  if (!meta || meta.start + meta.header + 4 > meta.end) return null;
  const metaChildren = readIsoBoxes(bytes, meta.start + meta.header + 4, meta.end);
  const primary = metaChildren.find((box) => box.type === "pitm");
  const iprp = metaChildren.find((box) => box.type === "iprp");
  if (!primary || !iprp) return null;
  const primaryId = readPrimaryItemId(bytes, primary);
  if (primaryId === null) return null;

  const propertyChildren = readIsoBoxes(bytes, iprp.start + iprp.header, iprp.end);
  const ipco = propertyChildren.find((box) => box.type === "ipco");
  const associations = propertyChildren.filter((box) => box.type === "ipma");
  if (!ipco || !associations.length) return null;

  const properties = readIsoBoxes(bytes, ipco.start + ipco.header, ipco.end);
  const propertyIndexes = new Set<number>();
  for (const association of associations) {
    for (const index of readAssociatedPropertyIndexes(bytes, association, primaryId)) {
      propertyIndexes.add(index);
    }
  }

  let largest: { width: number; height: number } | null = null;
  for (const index of propertyIndexes) {
    const property = properties[index - 1];
    if (!property || property.type !== "ispe") continue;
    const offset = property.start + property.header;
    if (offset + 12 > property.end) continue;
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const width = view.getUint32(offset + 4);
    const height = view.getUint32(offset + 8);
    if (!width || !height) continue;
    if (!largest || width * height > largest.width * largest.height) largest = { width, height };
  }
  return largest;
}

function readPrimaryItemId(bytes: Uint8Array, box: IsoBox): number | null {
  const offset = box.start + box.header;
  if (offset + 6 > box.end) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const version = bytes[offset] ?? 0;
  if (version === 0) return view.getUint16(offset + 4);
  if (offset + 8 > box.end) return null;
  return view.getUint32(offset + 4);
}

function readAssociatedPropertyIndexes(bytes: Uint8Array, box: IsoBox, primaryId: number): number[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const fullBox = box.start + box.header;
  if (fullBox + 8 > box.end) return [];
  const version = bytes[fullBox] ?? 0;
  const flags = ((bytes[fullBox + 1] ?? 0) << 16) | ((bytes[fullBox + 2] ?? 0) << 8) | (bytes[fullBox + 3] ?? 0);
  const wideAssociation = (flags & 1) !== 0;
  let offset = fullBox + 4;
  const entryCount = view.getUint32(offset);
  offset += 4;
  if (entryCount > 100_000) return [];
  for (let entry = 0; entry < entryCount; entry += 1) {
    const idBytes = version < 1 ? 2 : 4;
    if (offset + idBytes + 1 > box.end) return [];
    const itemId = idBytes === 2 ? view.getUint16(offset) : view.getUint32(offset);
    offset += idBytes;
    const count = bytes[offset] ?? 0;
    offset += 1;
    const indexes: number[] = [];
    for (let association = 0; association < count; association += 1) {
      const associationBytes = wideAssociation ? 2 : 1;
      if (offset + associationBytes > box.end) return [];
      const encoded = wideAssociation ? view.getUint16(offset) : bytes[offset]!;
      offset += associationBytes;
      const index = encoded & (wideAssociation ? 0x7fff : 0x7f);
      if (index) indexes.push(index);
    }
    if (itemId === primaryId) return indexes;
  }
  return [];
}

function readIsoBoxes(bytes: Uint8Array, start: number, end: number): IsoBox[] {
  const output: IsoBox[] = [];
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = Math.max(0, start);
  const boundedEnd = Math.min(bytes.length, end);
  while (offset + 8 <= boundedEnd && output.length < 10_000) {
    const size32 = view.getUint32(offset);
    const type = String.fromCharCode(bytes[offset + 4]!, bytes[offset + 5]!, bytes[offset + 6]!, bytes[offset + 7]!);
    let header = 8;
    let size = size32;
    if (size32 === 1) {
      if (offset + 16 > boundedEnd) break;
      const extended = view.getBigUint64(offset + 8);
      if (extended > BigInt(Number.MAX_SAFE_INTEGER)) break;
      size = Number(extended);
      header = 16;
    } else if (size32 === 0) {
      size = boundedEnd - offset;
    }
    if (size < header || offset + size > boundedEnd) break;
    output.push({ start: offset, end: offset + size, header, type });
    offset += size;
  }
  return output;
}

function asciiAt(bytes: Uint8Array, offset: number, value: string): boolean {
  if (offset < 0 || offset + value.length > bytes.length) return false;
  for (let index = 0; index < value.length; index += 1) {
    if (bytes[offset + index] !== value.charCodeAt(index)) return false;
  }
  return true;
}

function looksLikePhoto(bytes: Uint8Array): boolean {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return true;
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) return true;
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) return true;
  return hasIsoBrand(bytes, ["heic", "heix", "hevc", "hevx", "heim", "heis", "mif1", "msf1"]);
}

// Exact four-character codes from the MP4 Registration Authority. Keep this
// finite: accepting an arbitrary `3gp*` prefix would turn an unregistered brand
// into a signature bypass.
const VIDEO_ISO_BRANDS = [
  "isom", "iso2", "iso3", "iso4", "iso5", "iso6",
  "mp41", "mp42", "mp4v", "avc1", "qt  ", "m4v ", "M4V ", "MSNV",
  "3gp4", "3gp5", "3gp6", "3gp7", "3gp8", "3gp9",
] as const;

function looksLikeVideo(bytes: Uint8Array): boolean {
  if (bytes.length >= 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
    return true;
  }
  return hasIsoBrand(bytes, VIDEO_ISO_BRANDS);
}

function hasIsoBrand(bytes: Uint8Array, brands: readonly string[]): boolean {
  if (bytes.length < 12 || String.fromCharCode(...bytes.slice(4, 8)) !== "ftyp") return false;
  const declaredBoxSize = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0);
  const end = Math.min(bytes.length, declaredBoxSize >= 12 ? declaredBoxSize : bytes.length);
  // Major brand is at byte 8; compatible brands begin at byte 16. Compare
  // aligned four-byte codes without spreading an attacker-sized buffer into a
  // function call.
  if (brandMatchesAt(bytes, 8, end, brands)) return true;
  for (let offset = 16; offset + 4 <= end; offset += 4) {
    if (brandMatchesAt(bytes, offset, end, brands)) return true;
  }
  return false;
}

function brandMatchesAt(bytes: Uint8Array, offset: number, end: number, brands: readonly string[]): boolean {
  if (offset + 4 > end) return false;
  return brands.some(
    (brand) =>
      bytes[offset] === brand.charCodeAt(0) &&
      bytes[offset + 1] === brand.charCodeAt(1) &&
      bytes[offset + 2] === brand.charCodeAt(2) &&
      bytes[offset + 3] === brand.charCodeAt(3),
  );
}

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string,
  disposeLateValue?: (value: T) => void,
): Promise<T> {
  return new Promise((resolve, reject) => {
    let finished = false;
    const timer = window.setTimeout(() => {
      if (finished) return;
      finished = true;
      reject(new Error(message));
    }, ms);
    promise.then(
      (value) => {
        if (finished) {
          try {
            disposeLateValue?.(value);
          } catch {
            // The timed-out caller has already received its error. Disposal is best effort.
          }
          return;
        }
        finished = true;
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        if (finished) return;
        finished = true;
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function assertPixelBudget(width: number, height: number): void {
  if (!width || !height) throw new Error("The image has no readable pixels.");
  if (width > MAX_IMAGE_EDGE || height > MAX_IMAGE_EDGE || width * height > MAX_IMAGE_PIXELS) {
    throw new Error(
      "Image is too large to score safely. Export or retake it at a smaller size (50 megapixels / 8192 px per side or less).",
    );
  }
}

export async function loadImage(src: string | Blob): Promise<HTMLImageElement> {
  const url = typeof src === "string" ? src : URL.createObjectURL(src);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await withTimeout(img.decode(), IMAGE_DECODE_TIMEOUT_MS, "Image decode timed out");
    assertPixelBudget(img.naturalWidth, img.naturalHeight);
    return img;
  } finally {
    if (typeof src !== "string") URL.revokeObjectURL(url);
  }
}

/**
 * Centered source rectangle for a software (CSS-preview) zoom. The preview
 * scales the <video> element, so what the user sees at zoom z is the middle
 * 1/z of each axis; a capture that draws the full frame silently includes
 * everything the user believed they had framed out — surroundings, faces,
 * identifying detail. Pure math so the invariant is unit-testable.
 */
export function softwareCropRect(
  iw: number,
  ih: number,
  zoom: number,
): { sx: number; sy: number; sw: number; sh: number } {
  const z = Number.isFinite(zoom) && zoom > 1 ? zoom : 1;
  const sw = Math.max(1, Math.round(iw / z));
  const sh = Math.max(1, Math.round(ih / z));
  return { sx: Math.floor((iw - sw) / 2), sy: Math.floor((ih - sh) / 2), sw, sh };
}

export function drawContainRegion(
  img: CanvasImageSource,
  maxEdge: number,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
): HTMLCanvasElement {
  assertPixelBudget(sw, sh);
  const scale = Math.min(1, maxEdge / Math.max(sw, sh, 1));
  const w = Math.max(1, Math.round(sw * scale));
  const h = Math.max(1, Math.round(sh * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("No canvas");
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
  return canvas;
}

export function drawContain(
  img: CanvasImageSource,
  maxEdge: number,
  iw: number,
  ih: number,
): HTMLCanvasElement {
  assertPixelBudget(iw, ih);
  const scale = Math.min(1, maxEdge / Math.max(iw, ih, 1));
  const w = Math.max(1, Math.round(iw * scale));
  const h = Math.max(1, Math.round(ih * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("No canvas");
  ctx.drawImage(img, 0, 0, w, h);
  return canvas;
}

export async function compressToJpeg(
  src: Blob | HTMLImageElement | HTMLVideoElement,
  maxEdge = 768,
  quality = 0.72,
  maxBytes = MAX_ANALYZE_IMAGE_BYTES,
): Promise<string> {
  const canvas = await canvasFromSource(src, maxEdge);
  return encodeJpegWithin(canvas, quality, maxBytes);
}

async function canvasFromSource(
  src: Blob | HTMLImageElement | HTMLVideoElement,
  maxEdge: number,
  knownDimensions?: { width: number; height: number } | null,
  centerCropZoom?: number,
): Promise<HTMLCanvasElement> {
  if (typeof HTMLVideoElement !== "undefined" && src instanceof HTMLVideoElement) {
    const iw = src.videoWidth || 640;
    const ih = src.videoHeight || 480;
    if (centerCropZoom && centerCropZoom > 1) {
      const { sx, sy, sw, sh } = softwareCropRect(iw, ih, centerCropZoom);
      return drawContainRegion(src, maxEdge, sx, sy, sw, sh);
    }
    return drawContain(src, maxEdge, iw, ih);
  } else if (typeof HTMLImageElement !== "undefined" && src instanceof HTMLImageElement) {
    return drawContain(src, maxEdge, src.naturalWidth, src.naturalHeight);
  } else if (typeof createImageBitmap === "function") {
    if (bitmapDecodeLease !== null) {
      throw new Error("A previous image decode is still finishing. Wait before choosing another photo.");
    }
    const bitmapOptions = knownDimensions
      ? resizedBitmapOptions(knownDimensions.width, knownDimensions.height, maxEdge)
      : undefined;
    const lease = Symbol("bitmap-decode");
    bitmapDecodeLease = lease;
    const releaseLease = () => {
      if (bitmapDecodeLease !== lease) return;
      bitmapDecodeLease = null;
      window.clearTimeout(stallTimer);
    };
    const stallTimer = window.setTimeout(releaseLease, BITMAP_DECODE_STALL_RESET_MS);
    let bitmapPromise: Promise<ImageBitmap>;
    try {
      bitmapPromise = bitmapOptions ? createImageBitmap(src, bitmapOptions) : createImageBitmap(src);
    } catch (error) {
      releaseLease();
      throw error;
    }
    void bitmapPromise.then(
      releaseLease,
      releaseLease,
    );
    const bitmap = await withTimeout(
      bitmapPromise,
      IMAGE_DECODE_TIMEOUT_MS,
      "Image decode timed out",
      (lateBitmap) => lateBitmap.close(),
    );
    try {
      return drawContain(bitmap, maxEdge, bitmap.width, bitmap.height);
    } finally {
      bitmap.close();
    }
  } else {
    if (typeof Blob === "undefined" || !(src instanceof Blob)) {
      throw new Error("This browser cannot decode the selected image source.");
    }
    const img = await loadImage(src);
    return drawContain(img, maxEdge, img.naturalWidth, img.naturalHeight);
  }
}

function encodeJpegWithin(canvas: HTMLCanvasElement, initialQuality: number, maxBytes: number): string {
  let current = canvas;
  let quality = Math.min(0.92, Math.max(0.35, initialQuality));
  let encoded = current.toDataURL("image/jpeg", quality);

  for (let attempt = 0; attempt < 12 && dataUrlSize(encoded) > maxBytes; attempt++) {
    if (quality > 0.46) {
      quality = Math.max(0.42, quality - 0.1);
    } else {
      const next = document.createElement("canvas");
      next.width = Math.max(1, Math.round(current.width * 0.82));
      next.height = Math.max(1, Math.round(current.height * 0.82));
      const ctx = next.getContext("2d");
      if (!ctx) throw new Error("No canvas");
      ctx.drawImage(current, 0, 0, next.width, next.height);
      current = next;
      quality = 0.62;
    }
    encoded = current.toDataURL("image/jpeg", quality);
  }

  if (dataUrlSize(encoded) > maxBytes) {
    throw new Error("Could not make this image small enough to analyze.");
  }
  return encoded;
}

export async function toImageData(
  src: Blob | HTMLImageElement | HTMLVideoElement,
  maxEdge = 240,
): Promise<ImageData> {
  const canvas = await canvasFromSource(src, maxEdge);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("No canvas");
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/** Maximum edge of the native-scale crop used to judge focus. */
const DETAIL_CROP_EDGE = 320;

/** Centre crop at 1:1, so fine detail survives to be measured. */
function centreCrop(source: HTMLCanvasElement, edge: number): ImageData {
  const w = Math.max(1, Math.min(edge, source.width));
  const h = Math.max(1, Math.min(edge, source.height));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("No canvas");
  ctx.drawImage(
    source,
    Math.max(0, Math.floor((source.width - w) / 2)),
    Math.max(0, Math.floor((source.height - h) / 2)),
    w,
    h,
    0,
    0,
    w,
    h,
  );
  return ctx.getImageData(0, 0, w, h);
}

export async function processMediaFrame(
  src: Blob | HTMLImageElement | HTMLVideoElement,
  previewEdge = 768,
  analysisEdge = 240,
  quality = 0.72,
  knownDimensions?: { width: number; height: number } | null,
  centerCropZoom?: number,
): Promise<ProcessedMediaFrame> {
  const preview = await canvasFromSource(src, previewEdge, knownDimensions, centerCropZoom);
  const analysis = drawContain(preview, analysisEdge, preview.width, preview.height);
  const ctx = analysis.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("No canvas");
  return {
    jpeg: encodeJpegWithin(preview, quality, MAX_ANALYZE_IMAGE_BYTES),
    imageData: ctx.getImageData(0, 0, analysis.width, analysis.height),
    detailData: centreCrop(preview, DETAIL_CROP_EDGE),
  };
}

function resizedBitmapOptions(
  width: number,
  height: number,
  maxEdge: number,
): ImageBitmapOptions {
  const scale = Math.min(1, maxEdge / Math.max(width, height, 1));
  if (scale >= 1) return {};
  // Setting both dimensions from raw JPEG metadata can distort EXIF-rotated
  // images because createImageBitmap applies orientation during decode. Set a
  // single dimension and let the decoder preserve its oriented aspect ratio;
  // drawContain enforces the final max edge afterward.
  return width >= height
    ? { resizeWidth: Math.max(1, Math.round(width * scale)), resizeQuality: "high" }
    : { resizeHeight: Math.max(1, Math.round(height * scale)), resizeQuality: "high" };
}

export async function extractVideoFrames(
  file: Blob,
  count = 4,
  signal?: AbortSignal,
  durationHintSeconds?: number,
): Promise<ProcessedMediaFrame[]> {
  signal?.throwIfAborted();
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  try {
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    const metadata = waitForMediaEvent(
      video,
      "loadedmetadata",
      1,
      "Could not read the video",
      signal,
    );
    video.src = url;
    video.load?.();
    await metadata;
    signal?.throwIfAborted();
    if (!video.videoWidth || !video.videoHeight) {
      throw new Error("The video has no readable dimensions");
    }
    // Reject decoder-surface bombs as soon as metadata is available, before
    // asking the browser to materialize a video frame.
    assertVideoFrameBudget(video.videoWidth, video.videoHeight);
    await waitForMediaEvent(
      video,
      "loadeddata",
      2,
      "The video has no readable frames",
      signal,
    );
    signal?.throwIfAborted();

    let duration = video.duration;
    if (!Number.isFinite(duration)) {
      const seekableEnd = video.seekable?.length ? video.seekable.end(video.seekable.length - 1) : NaN;
      const hint = Number(durationHintSeconds);
      if (Number.isFinite(seekableEnd) && seekableEnd > 0) {
        duration = seekableEnd;
      } else if (Number.isFinite(hint) && hint > 0 && hint <= MAX_VIDEO_DURATION_SECONDS) {
        // Some Chromium MediaRecorder WebM blobs report Infinity and expose no
        // seekable range even though timestamp seeking works. The caller knows
        // the elapsed duration for clips recorded in this page.
        duration = hint;
      } else {
        throw new Error("Could not determine the video duration.");
      }
    }
    duration = duration > 0 ? duration : 0;
    if (duration > MAX_VIDEO_DURATION_SECONDS) {
      throw new Error(`Video is too long. Choose one under ${MAX_VIDEO_DURATION_SECONDS} seconds.`);
    }
    const requested = Number.isFinite(count) ? Math.trunc(count) : 1;
    const n = Math.max(1, Math.min(12, duration < 1 ? 1 : requested));
    const frames: ProcessedMediaFrame[] = [];
    for (let i = 0; i < n; i++) {
      signal?.throwIfAborted();
      if (duration > 0) {
        const end = Math.max(0, duration - Math.min(0.05, duration / 10));
        const t = n === 1 ? end / 2 : Math.min(end, (duration * (i + 0.5)) / n);
        await seekVideo(video, t, signal);
      }
      // drawContain never upscales, so the still keeps the clip's native
      // resolution up to this edge - fine texture survives to the model.
      frames.push(await processMediaFrame(video, 1600, 240, 0.8));
      signal?.throwIfAborted();
    }
    return frames;
  } finally {
    video.pause?.();
    video.removeAttribute?.("src");
    video.load?.();
    URL.revokeObjectURL(url);
  }
}

function assertVideoFrameBudget(width: number, height: number): void {
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0 ||
    width > MAX_VIDEO_FRAME_EDGE ||
    height > MAX_VIDEO_FRAME_EDGE ||
    width * height > MAX_VIDEO_FRAME_PIXELS
  ) {
    throw new Error("Video resolution is too large to extract safely.");
  }
}

async function seekVideo(
  video: HTMLVideoElement,
  time: number,
  signal?: AbortSignal,
): Promise<void> {
  signal?.throwIfAborted();
  if (Math.abs(video.currentTime - time) < 0.005) return;
  await new Promise<void>((resolve, reject) => {
    let finished = false;
    const timeout = window.setTimeout(
      () => finish(() => reject(new Error("Could not seek through the video (timed out)"))),
      MEDIA_EVENT_TIMEOUT_MS,
    );
    const onSeeked = () => finish(resolve);
    const onError = () => finish(() => reject(new Error("Could not seek through the video")));
    const onAbort = () => finish(() => reject(abortReason(signal)));
    const finish = (done: () => void) => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timeout);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      signal?.removeEventListener("abort", onAbort);
      done();
    };
    video.addEventListener("seeked", onSeeked, { once: true });
    video.addEventListener("error", onError, { once: true });
    signal?.addEventListener("abort", onAbort, { once: true });
    try {
      video.currentTime = time;
    } catch {
      finish(() => reject(new Error("Could not seek through the video")));
    }
  });
}

function waitForMediaEvent(
  video: HTMLVideoElement,
  event: "loadedmetadata" | "loadeddata" | "seeked",
  readyState: number,
  errorMessage: string,
  signal?: AbortSignal,
): Promise<void> {
  signal?.throwIfAborted();
  if (video.readyState >= readyState) return Promise.resolve();
  return new Promise((resolve, reject) => {
    let finished = false;
    const timeout = window.setTimeout(() => finish(() => reject(new Error(`${errorMessage} (timed out)`))), MEDIA_EVENT_TIMEOUT_MS);
    const onReady = () => finish(resolve);
    const onError = () => finish(() => reject(new Error(errorMessage)));
    const onAbort = () => finish(() => reject(abortReason(signal)));
    const finish = (done: () => void) => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timeout);
      video.removeEventListener(event, onReady);
      video.removeEventListener("error", onError);
      signal?.removeEventListener("abort", onAbort);
      done();
    };
    video.addEventListener(event, onReady, { once: true });
    video.addEventListener("error", onError, { once: true });
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function abortReason(signal?: AbortSignal): Error {
  return signal?.reason instanceof Error
    ? signal.reason
    : new DOMException("The media operation was cancelled.", "AbortError");
}

export function dataUrlSize(url: string) {
  const payload = url.slice(Math.max(0, url.indexOf(",") + 1));
  const padding = payload.endsWith("==") ? 2 : payload.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((payload.length * 3) / 4) - padding);
}
