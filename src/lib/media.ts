export const MAX_PHOTO_BYTES = 25 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
export const MAX_ANALYZE_IMAGE_BYTES = 300_000;
export const MAX_VIDEO_DURATION_SECONDS = 60;
export const MAX_IMAGE_PIXELS = 16_000_000;

const MEDIA_EVENT_TIMEOUT_MS = 12_000;
const IMAGE_DECODE_TIMEOUT_MS = 8_000;

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
]);

type UploadKind = "photo" | "video";

export type ProcessedMediaFrame = {
  jpeg: string;
  imageData: ImageData;
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
      : new Set(["mp4", "m4v", "mov", "webm"]);
  const allowedMimeTypes = kind === "photo" ? PHOTO_MIME_TYPES : VIDEO_MIME_TYPES;
  if (mime && !allowedMimeTypes.has(mime)) {
    throw new Error(`Choose a supported ${kind} file.`);
  }
  if (!mime && !allowedExtensions.has(extension)) {
    throw new Error(`That ${kind} format is not supported.`);
  }
}

export async function validateMediaSignature(file: Blob, kind: UploadKind): Promise<void> {
  const headerLimit = kind === "photo" ? 1024 * 1024 : 64 * 1024;
  const bytes = new Uint8Array(await file.slice(0, headerLimit).arrayBuffer());
  const valid = kind === "photo" ? looksLikePhoto(bytes) : looksLikeVideo(bytes);
  if (!valid) throw new Error(`The selected ${kind} does not contain a supported media file.`);
  if (kind === "photo") {
    const dimensions = readImageDimensions(bytes);
    if (!dimensions) throw new Error("Could not verify the image dimensions before decoding.");
    assertPixelBudget(dimensions.width, dimensions.height);
  }
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
    let largest: { width: number; height: number } | null = null;
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    for (let offset = 4; offset + 16 <= bytes.length; offset += 1) {
      if (!asciiAt(bytes, offset, "ispe")) continue;
      const boxStart = offset - 4;
      const boxSize = view.getUint32(boxStart);
      if (boxSize < 20 || boxStart + boxSize > bytes.length) continue;
      const width = view.getUint32(offset + 8);
      const height = view.getUint32(offset + 12);
      if (!width || !height) continue;
      if (!largest || width * height > largest.width * largest.height) largest = { width, height };
    }
    return largest;
  }
  return null;
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

function looksLikeVideo(bytes: Uint8Array): boolean {
  if (bytes.length >= 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
    return true;
  }
  return hasIsoBrand(bytes, ["isom", "iso2", "mp41", "mp42", "avc1", "qt  ", "m4v ", "3gp4"]);
}

function hasIsoBrand(bytes: Uint8Array, brands: string[]): boolean {
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

function brandMatchesAt(bytes: Uint8Array, offset: number, end: number, brands: string[]): boolean {
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
  if (width * height > MAX_IMAGE_PIXELS) {
    throw new Error("Image is too large to score safely.");
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
): Promise<HTMLCanvasElement> {
  if (typeof HTMLVideoElement !== "undefined" && src instanceof HTMLVideoElement) {
    return drawContain(
      src,
      maxEdge,
      src.videoWidth || 640,
      src.videoHeight || 480,
    );
  } else if (typeof HTMLImageElement !== "undefined" && src instanceof HTMLImageElement) {
    return drawContain(src, maxEdge, src.naturalWidth, src.naturalHeight);
  } else if (typeof createImageBitmap === "function") {
    const bitmap = await withTimeout(
      createImageBitmap(src),
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

export async function processMediaFrame(
  src: Blob | HTMLImageElement | HTMLVideoElement,
  previewEdge = 768,
  analysisEdge = 240,
  quality = 0.72,
): Promise<ProcessedMediaFrame> {
  const preview = await canvasFromSource(src, previewEdge);
  const analysis = drawContain(preview, analysisEdge, preview.width, preview.height);
  const ctx = analysis.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("No canvas");
  return {
    jpeg: encodeJpegWithin(preview, quality, MAX_ANALYZE_IMAGE_BYTES),
    imageData: ctx.getImageData(0, 0, analysis.width, analysis.height),
  };
}

export async function extractVideoFrames(
  file: Blob,
  count = 4,
  signal?: AbortSignal,
  durationHintSeconds?: number,
): Promise<{ jpeg: string; imageData: ImageData }[]> {
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
    await waitForMediaEvent(
      video,
      "loadeddata",
      2,
      "The video has no readable frames",
      signal,
    );
    signal?.throwIfAborted();

    if (!video.videoWidth || !video.videoHeight) {
      throw new Error("The video has no readable frames");
    }

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
    const frames: { jpeg: string; imageData: ImageData }[] = [];
    for (let i = 0; i < n; i++) {
      signal?.throwIfAborted();
      if (duration > 0) {
        const end = Math.max(0, duration - Math.min(0.05, duration / 10));
        const t = n === 1 ? end / 2 : Math.min(end, (duration * (i + 0.5)) / n);
        await seekVideo(video, t, signal);
      }
      frames.push(await processMediaFrame(video, 720, 240, 0.7));
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
