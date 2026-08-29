import { digitalZoomCrop } from "@/lib/media";
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
  digitalZoom = 1,
  previewAspect?: number,
): ImageData | null {
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth) return null;
  const ctx = meterCanvas();
  if (!ctx || !sharedCanvas) return null;
  // Same crop model as the capture path (digitalZoomCrop), letterboxing
  // included — the HUD must score the pixels a capture would keep, or it
  // rates light and sharpness the user cannot actually submit. The sample
  // canvas takes the crop's own aspect, like drawContain does on capture: a
  // letterboxed crop is not frame-shaped, and stretching it back to the
  // frame's aspect would skew the sharpness signal on one axis.
  const crop = digitalZoomCrop(video.videoWidth, video.videoHeight, digitalZoom, previewAspect);
  const srcW = crop?.sw ?? video.videoWidth;
  const srcH = crop?.sh ?? video.videoHeight;
  const scale = maxWidth / srcW;
  const width = Math.max(16, Math.round(srcW * scale));
  const height = Math.max(16, Math.round(srcH * scale));
  sharedCanvas.width = width;
  sharedCanvas.height = height;
  if (crop) {
    ctx.drawImage(video, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, width, height);
  } else {
    ctx.drawImage(video, 0, 0, width, height);
  }
  return ctx.getImageData(0, 0, width, height);
}

export function scoreLivePreview(
  video: HTMLVideoElement,
  digitalZoom = 1,
  previewAspect?: number,
): FrameQuality | null {
  const data = sampleVideoImageData(video, LIVE_SAMPLE_MAX_WIDTH, digitalZoom, previewAspect);
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
