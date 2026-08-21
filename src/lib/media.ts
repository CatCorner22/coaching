export async function loadImage(src: string | Blob): Promise<HTMLImageElement> {
  const url = typeof src === "string" ? src : URL.createObjectURL(src);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
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
  const scale = Math.min(1, maxEdge / Math.max(iw, ih));
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
    const canvas = drawContain(src, maxEdge, src.naturalWidth, src.naturalHeight);
    return canvas.toDataURL("image/jpeg", quality);
  }
  const img = await loadImage(src);
  const canvas = drawContain(img, maxEdge, img.naturalWidth, img.naturalHeight);
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
    canvas = drawContain(src, maxEdge, src.naturalWidth, src.naturalHeight);
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
): Promise<{ jpeg: string; imageData: ImageData }[]> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = url;
  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error("Could not read the video"));
  });
  const duration = Number.isFinite(video.duration) ? video.duration : 0;
  const n = Math.max(1, Math.min(count, duration < 1 ? 1 : count));
  const frames: { jpeg: string; imageData: ImageData }[] = [];
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : (duration * (i + 0.5)) / n;
    video.currentTime = Math.min(duration || 0, t);
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
    });
    frames.push({
      jpeg: await compressToJpeg(video, 720, 0.7),
      imageData: await toImageData(video, 240),
    });
  }
  URL.revokeObjectURL(url);
  return frames;
}

export function dataUrlSize(url: string) {
  return Math.ceil((url.length * 3) / 4);
}
