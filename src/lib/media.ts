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

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
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
  let canvas: HTMLCanvasElement;
  if (typeof HTMLVideoElement !== "undefined" && src instanceof HTMLVideoElement) {
    canvas = drawContain(
      src,
      maxEdge,
      src.videoWidth || 640,
      src.videoHeight || 480,
    );
  } else if (typeof HTMLImageElement !== "undefined" && src instanceof HTMLImageElement) {
    canvas = drawContain(src, maxEdge, src.naturalWidth, src.naturalHeight);
  } else if (typeof createImageBitmap === "function") {
    const bitmap = await withTimeout(
      createImageBitmap(src),
      IMAGE_DECODE_TIMEOUT_MS,
      "Image decode timed out",
    );
    try {
      canvas = drawContain(bitmap, maxEdge, bitmap.width, bitmap.height);
    } finally {
      bitmap.close();
    }
  } else {
    const img = await loadImage(src);
    canvas = drawContain(img, maxEdge, img.naturalWidth, img.naturalHeight);
  }
  return encodeJpegWithin(canvas, quality, maxBytes);
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
  let canvas: HTMLCanvasElement;
  if (typeof HTMLVideoElement !== "undefined" && src instanceof HTMLVideoElement) {
    canvas = drawContain(src, maxEdge, src.videoWidth || 640, src.videoHeight || 480);
  } else if (typeof HTMLImageElement !== "undefined" && src instanceof HTMLImageElement) {
    canvas = drawContain(src, maxEdge, src.naturalWidth, src.naturalHeight);
  } else if (typeof createImageBitmap === "function") {
    const bitmap = await withTimeout(
      createImageBitmap(src),
      IMAGE_DECODE_TIMEOUT_MS,
      "Image decode timed out",
    );
    try {
      canvas = drawContain(bitmap, maxEdge, bitmap.width, bitmap.height);
    } finally {
      bitmap.close();
    }
  } else {
    const img = await loadImage(src);
    canvas = drawContain(img, maxEdge, img.naturalWidth, img.naturalHeight);
  }
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("No canvas");
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

export async function extractVideoFrames(
  file: Blob,
  count = 4,
  signal?: AbortSignal,
): Promise<{ jpeg: string; imageData: ImageData }[]> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  try {
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    const metadata = waitForMediaEvent(video, "loadedmetadata", 1, "Could not read the video");
    video.src = url;
    video.load?.();
    await metadata;
    signal?.throwIfAborted();
    await waitForMediaEvent(video, "loadeddata", 2, "The video has no readable frames");
    signal?.throwIfAborted();

    if (!video.videoWidth || !video.videoHeight) {
      throw new Error("The video has no readable frames");
    }

    let duration = video.duration;
    if (!Number.isFinite(duration)) {
      const seekableEnd = video.seekable?.length ? video.seekable.end(video.seekable.length - 1) : NaN;
      if (!Number.isFinite(seekableEnd) || seekableEnd <= 0) {
        throw new Error("Could not determine the video duration.");
      }
      duration = seekableEnd;
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
        await seekVideo(video, t);
      }
      frames.push({
        jpeg: await compressToJpeg(video, 720, 0.7),
        imageData: await toImageData(video, 240),
      });
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

async function seekVideo(video: HTMLVideoElement, time: number): Promise<void> {
  if (Math.abs(video.currentTime - time) < 0.005) return;
  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(
      () => finish(() => reject(new Error("Could not seek through the video (timed out)"))),
      MEDIA_EVENT_TIMEOUT_MS,
    );
    const onSeeked = () => finish(resolve);
    const onError = () => finish(() => reject(new Error("Could not seek through the video")));
    const finish = (done: () => void) => {
      window.clearTimeout(timeout);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      done();
    };
    video.addEventListener("seeked", onSeeked, { once: true });
    video.addEventListener("error", onError, { once: true });
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
): Promise<void> {
  if (video.readyState >= readyState) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => finish(() => reject(new Error(`${errorMessage} (timed out)`))), MEDIA_EVENT_TIMEOUT_MS);
    const onReady = () => finish(resolve);
    const onError = () => finish(() => reject(new Error(errorMessage)));
    const finish = (done: () => void) => {
      window.clearTimeout(timeout);
      video.removeEventListener(event, onReady);
      video.removeEventListener("error", onError);
      done();
    };
    video.addEventListener(event, onReady, { once: true });
    video.addEventListener("error", onError, { once: true });
  });
}

export function dataUrlSize(url: string) {
  const payload = url.slice(Math.max(0, url.indexOf(",") + 1));
  const padding = payload.endsWith("==") ? 2 : payload.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((payload.length * 3) / 4) - padding);
}
