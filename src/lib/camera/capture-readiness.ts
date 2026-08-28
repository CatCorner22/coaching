import type { FrameQuality } from "./quality";

export type CaptureReadiness = {
  label: "ready" | "soft" | "dark" | "low-rope";
  headline: string;
  detail: string;
  suggestRetake: boolean;
};

/** Plain-language readiness for Analyze — not safety clearance. */
export function captureReadinessForAnalyze(quality: FrameQuality): CaptureReadiness {
  if (quality.sharpness < 0.35 || quality.exposure < 0.35) {
    return {
      label: "soft",
      headline: "Stills are hard to read",
      detail: "Hold steady and add light, then capture again for a clearer cloud read.",
      suggestRetake: true,
    };
  }
  if (quality.sharpness < 0.55) {
    return {
      label: "soft",
      headline: "A little soft",
      detail: "Analyze will still run, but a steadier retake may help the vision model.",
      suggestRetake: false,
    };
  }
  if (quality.exposure < 0.55) {
    return {
      label: "dark",
      headline: "Lighting is dim",
      detail: "Analyze will still run — brighten the scene if bands look muddy.",
      suggestRetake: false,
    };
  }
  if (quality.ropeHint < 0.2) {
    return {
      label: "low-rope",
      headline: "Rope is small in frame",
      detail: "Move closer or frame the wraps — local and cloud reads both work best on clear bands.",
      suggestRetake: false,
    };
  }
  return {
    label: "ready",
    headline: "Good to analyze",
    detail: `${quality.score.toFixed(2)} composite · tap Analyze once when you are ready.`,
    suggestRetake: false,
  };
}
