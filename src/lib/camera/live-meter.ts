import { scoreFrame, type FrameQuality } from "./quality";

export const LIVE_SAMPLE_MAX_WIDTH = 160;

let sharedCanvas: HTMLCanvasElement | null = null;
let sharedCtx: CanvasRenderingContext2D | null = null;

function meterCanvas(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  if (!sharedCanvas) {
    sharedCanvas = document.createElement("canvas");
    sharedCtx = sharedCanvas.getContext("2d", { willReadFrequently: true });
  }
  return sharedCtx;
}

/** Downsample a live video frame for HUD scoring. Never transmits. */
export function sampleVideoImageData(
  video: HTMLVideoElement,
  maxWidth = LIVE_SAMPLE_MAX_WIDTH,
): ImageData | null {
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth) return null;
  const ctx = meterCanvas();
  if (!ctx || !sharedCanvas) return null;
  const scale = maxWidth / video.videoWidth;
  const width = Math.max(16, Math.round(video.videoWidth * scale));
  const height = Math.max(16, Math.round(video.videoHeight * scale));
  sharedCanvas.width = width;
  sharedCanvas.height = height;
  ctx.drawImage(video, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
}

export function scoreLivePreview(video: HTMLVideoElement): FrameQuality | null {
  const data = sampleVideoImageData(video);
  if (!data) return null;
  return scoreFrame(data);
}

/** Rank extracted clip frames and return up to `keep` indices in clip order. */
export function bestFrameIndices(
  qualities: ReadonlyArray<{ score: number }>,
  keep = 3,
): number[] {
  const limit = Number.isFinite(keep) ? Math.max(0, Math.min(qualities.length, Math.floor(keep))) : 3;
  return qualities
    .map((quality, index) => ({ index, score: quality.score }))
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, limit)
    .map((entry) => entry.index)
    .sort((left, right) => left - right);
}
