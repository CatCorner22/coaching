const MAX_PIXELS = 16_000_000;

function withTimeout<T>(p: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = window.setTimeout(() => reject(new Error(message)), ms);
    p.then(
      (v) => {
        window.clearTimeout(t);
        resolve(v);
      },
      (e) => {
        window.clearTimeout(t);
        reject(e);
      },
    );
  });
}

export async function loadImage(src: string | Blob): Promise<HTMLImageElement> {
  const url = typeof src === "string" ? src : URL.createObjectURL(src);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await withTimeout(img.decode(), 8000, "Image decode timed out");
    if (img.naturalWidth * img.naturalHeight > MAX_PIXELS) {
      throw new Error("Image is too large to score safely.");
    }
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

async function rasterizeBlob(src: Blob, maxEdge: number): Promise<HTMLCanvasElement> {
  if (typeof createImageBitmap === "function") {
    try {
      const bmp = await withTimeout(createImageBitmap(src), 8000, "Image decode timed out");
      try {
        if (bmp.width * bmp.height > MAX_PIXELS) {
          throw new Error("Image is too large to score safely.");
        }
        return drawContain(bmp, maxEdge, bmp.width, bmp.height);
      } finally {
        bmp.close();
      }
    } catch (e) {
      if (e instanceof Error && /too large|timed out/i.test(e.message)) throw e;
    }
  }
  const img = await loadImage(src);
  return drawContain(img, maxEdge, img.naturalWidth, img.naturalHeight);
}

export async function compressToJpeg(
  src: Blob | HTMLImageElement | HTMLVideoElement,
  maxEdge = 768,
  quality = 0.72,
): Promise<string> {
  if (src instanceof HTMLVideoElement) {
    const canvas = drawContain(
      src,
      maxEdge,
      src.videoWidth || 640,
      src.videoHeight || 480,
    );
    return canvas.toDataURL("image/jpeg", quality);
  }
  if (src instanceof HTMLImageElement) {
    if (src.naturalWidth * src.naturalHeight > MAX_PIXELS) {
      throw new Error("Image is too large to score safely.");
    }
    const canvas = drawContain(src, maxEdge, src.naturalWidth, src.naturalHeight);
    return canvas.toDataURL("image/jpeg", quality);
  }
  const canvas = await rasterizeBlob(src, maxEdge);
  return canvas.toDataURL("image/jpeg", quality);
}

export async function toImageData(
  src: Blob | HTMLImageElement | HTMLVideoElement,
  maxEdge = 240,
): Promise<ImageData> {
  let canvas: HTMLCanvasElement;
  if (src instanceof HTMLVideoElement) {
    canvas = drawContain(src, maxEdge, src.videoWidth || 640, src.videoHeight || 480);
  } else if (src instanceof HTMLImageElement) {
    if (src.naturalWidth * src.naturalHeight > MAX_PIXELS) {
      throw new Error("Image is too large to score safely.");
    }
    canvas = drawContain(src, maxEdge, src.naturalWidth, src.naturalHeight);
  } else {
    canvas = await rasterizeBlob(src, maxEdge);
  }
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("No canvas");
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

export async function extractVideoFrames(
  file: Blob,
  count = 4,
): Promise<{ jpeg: string; imageData: ImageData }[]> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = url;
  try {
    await withTimeout(
      new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error("Could not read the video"));
      }),
      8000,
      "Video metadata timed out",
    );
    const duration =
      Number.isFinite(video.duration) && video.duration > 0 ? Math.min(video.duration, 30) : 0;
    const n = Math.max(1, Math.min(count, duration < 1 ? 1 : count));
    const frames: { jpeg: string; imageData: ImageData }[] = [];
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0 : (duration * (i + 0.5)) / n;
      video.currentTime = Math.min(duration || 0, t);
      await withTimeout(
        new Promise<void>((resolve) => {
          video.onseeked = () => resolve();
        }),
        3000,
        "Video seek timed out",
      );
      frames.push({
        jpeg: await compressToJpeg(video, 720, 0.7),
        imageData: await toImageData(video, 240),
      });
    }
    return frames;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function dataUrlSize(url: string) {
  return Math.ceil((url.length * 3) / 4);
}
