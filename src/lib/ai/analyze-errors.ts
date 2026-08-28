import type { AnalyzeResult } from "./schema";

/** Turn server analyze failures into short, actionable Studio copy. */
export function analyzeErrorMessage(result: Extract<AnalyzeResult, { ok: false }>): string {
  switch (result.code) {
    case "AI_PROVIDER_UNAVAILABLE":
      return "Cloud vision is not configured on this deployment. Local band hints still work — try again after the host adds an xAI key.";
    case "AI_PRIVACY_UNAVAILABLE":
      return "Cloud vision needs zero-data-retention enabled on the server. Local hints still work.";
    case "AI_PRIVACY_RESPONSE_UNVERIFIED":
      return "The vision response did not confirm zero-data-retention. Nothing was saved — tap Analyze again or use local hints only.";
    case "AI_RATE_LIMITED": {
      const sec = result.retryAfterMs ? Math.ceil(result.retryAfterMs / 1000) : null;
      return sec
        ? `Vision quota reached — wait about ${sec}s, then analyze a fresh capture.`
        : "Vision quota reached — wait a few minutes, then analyze a fresh capture.";
    }
    case "MEDIA_BATCH_REPLAYED":
      return "This batch was already analyzed. Capture again for a new cloud read.";
    case "MEDIA_BATCH_RESERVATION_UNCERTAIN":
      return "Could not reserve this batch safely. Discard and capture again before Analyze.";
    default:
      return result.error || "The analysis could not be completed.";
  }
}
