import { digitalZoomCrop } from "@/lib/media";
import { scoreFrame, type FrameQuality } from "./quality";

export const LIVE_SAMPLE_MAX_WIDTH = 160;
/** Matches the capture path's detail crop edge, so both measure the same scale. */
export const LIVE_DETAIL_EDGE = 320;

let sharedCanvas: HTMLCanvasElement | null = null;
let sharedCtx: CanvasRenderingContext2D | null = null;
let detailCanvas: HTMLCanvasElement | null = null;
let detailCtx: CanvasRenderingContext2D | null = null;

function meterCanvas(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  if (!sharedCanvas) {
    sharedCanvas = document.createElement("canvas");
    sharedCtx = sharedCanvas.getContext("2d", { willReadFrequently: true });
  }
  return sharedCtx;
}

function detailMeterCanvas(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  if (!detailCanvas) {
    detailCanvas = document.createElement("canvas");
    detailCtx = detailCanvas.getContext("2d", { willReadFrequently: true });
  }
  return detailCtx;
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

/**
 * Native-scale centre crop of the live frame, the HUD's counterpart to the
 * capture path's `detailData`.
 *
 * Sharpness read off the 160px HUD sample is a sharpness reading of a
 * downscale: the resampling filter reconstructs edges the lens never resolved,
 * so a visibly soft preview metered "Sharp" and the same scene, captured,
 * came back "soft, retake". Measuring unscaled pixels makes the two agree.
 */
export function sampleVideoDetailData(
  video: HTMLVideoElement,
  edge = LIVE_DETAIL_EDGE,
  digitalZoom = 1,
  previewAspect?: number,
): ImageData | null {
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth) return null;
  const ctx = detailMeterCanvas();
  if (!ctx || !detailCanvas) return null;
  const crop = digitalZoomCrop(video.videoWidth, video.videoHeight, digitalZoom, previewAspect);
  const sx = crop?.sx ?? 0;
  const sy = crop?.sy ?? 0;
  const sw = crop?.sw ?? video.videoWidth;
  const sh = crop?.sh ?? video.videoHeight;
  const side = Math.max(1, Math.min(edge, Math.floor(sw), Math.floor(sh)));
  detailCanvas.width = side;
  detailCanvas.height = side;
  ctx.drawImage(
    video,
    Math.max(0, Math.floor(sx + (sw - side) / 2)),
    Math.max(0, Math.floor(sy + (sh - side) / 2)),
    side,
    side,
    0,
    0,
    side,
    side,
  );
  return ctx.getImageData(0, 0, side, side);
}

export function scoreLivePreview(
  video: HTMLVideoElement,
  digitalZoom = 1,
  previewAspect?: number,
): FrameQuality | null {
  const data = sampleVideoImageData(video, LIVE_SAMPLE_MAX_WIDTH, digitalZoom, previewAspect);
  if (!data) return null;
  const detail = sampleVideoDetailData(video, LIVE_DETAIL_EDGE, digitalZoom, previewAspect) ?? undefined;
  return scoreFrame(data, detail);
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
