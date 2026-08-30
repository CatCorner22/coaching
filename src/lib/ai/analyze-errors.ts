import type { AnalyzeResult } from "./schema";

/**
 * Prefix on every message the analyze validator throws.
 *
 * The validator runs before the handler, so its failures cannot become an
 * `AnalyzeResult` with `retryableBeforeProvider` — they arrive at the client as
 * thrown errors, indistinguishable from a failure after the batch was already
 * reserved. Since the validator provably runs before any reservation or
 * dispatch, marking its messages is what lets the client reopen the batch for
 * exactly that case.
 */
export const PRE_DISPATCH_MARKER = "[pre-dispatch]";

/**
 * True when the failure provably happened before anything was reserved or sent.
 *
 * Two cases qualify. The validator marks its own messages. An expired sign-in
 * is the other: `authMiddleware` rejects ahead of the handler, so no batch was
 * reserved and no media left the browser — closing the batch there would cost
 * a capture for signing in again.
 */
export function analyzeThrownBeforeDispatch(cause: unknown): boolean {
  if (!(cause instanceof Error)) return false;
  if (cause.message.includes(PRE_DISPATCH_MARKER)) return true;
  return authenticationRejected(cause);
}

/** An auth rejection, which happens in middleware before the handler runs. */
function authenticationRejected(error: Error): boolean {
  if ((error as { status?: unknown }).status === 401) return true;
  return error.name === "UnauthorizedError" || /^unauthorized\b/i.test(error.message.trim());
}

/**
 * A thrown analyze failure never carries the server's structured result, so
 * everything it could once print — a serialized Zod issue array, an HTML error
 * page, a framework stack — was raw internals in the reader's error banner.
 */
export function analyzeThrownMessage(cause: unknown): string {
  const raw =
    cause instanceof Error ? cause.message.replaceAll(PRE_DISPATCH_MARKER, "").trim() : "";
  if (requestNeverReachedProvider(cause)) {
    return "The app could not reach the server, so nothing was sent. Check the connection and press Analyze again.";
  }
  if (cause instanceof Error && authenticationRejected(cause)) {
    return "Nothing was sent: this deployment did not accept the request (sign-in). Sign in again and press Analyze — this capture is still usable.";
  }
  // Server sentences are written for this banner and start with the outcome.
  // Anything else — JSON, HTML, a stack — is internals, not an explanation.
  if (raw && raw.length <= 240 && !/[{}<>[\]]|\n/.test(raw)) return raw;
  return "The analysis could not be completed. Capture a new batch and try again — nothing below came from a cloud read.";
}

/** True when the request demonstrably never left the browser. */
export function requestNeverReachedProvider(cause: unknown): boolean {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return true;
  if (cause instanceof TypeError) return true;
  return cause instanceof Error && /failed to fetch|networkerror|load failed/i.test(cause.message);
}

/**
 * Turn server analyze failures into short, actionable Studio copy.
 *
 * The server's own sentences lead with the outcome that matters most — "No
 * media was sent to xAI" — and for the privacy codes they distinguish a failed
 * preflight (nothing sent) from an unverified response (media already sent,
 * response discarded). A rewrite that drops or flattens that distinction is
 * friendlier and wrong, so where the server supplied its sentence we keep it
 * and only append what the reader can do next. The fallback wording below is
 * for a malformed result with no server sentence at all.
 */
export function analyzeErrorMessage(result: Extract<AnalyzeResult, { ok: false }>): string {
  const serverSaid = typeof result.error === "string" && result.error.trim().length > 0
    ? result.error.trim()
    : null;
  switch (result.code) {
    case "AI_PROVIDER_UNAVAILABLE":
      return `${serverSaid ?? "No media was sent to xAI. Cloud vision is not configured on this deployment."} Local band hints still work.`;
    case "AI_PRIVACY_UNAVAILABLE":
      return `${serverSaid ?? "No media was sent to xAI. Cloud vision needs zero-data-retention enabled on the server."} Local band hints still work.`;
    case "AI_PRIVACY_RESPONSE_UNVERIFIED":
      // Media was already dispatched here; only the response was discarded and
      // the one-use batch stays closed. Never claim nothing was sent, and never
      // suggest re-tapping Analyze on a batch that cannot submit again.
      return `${serverSaid ?? "The vision response did not confirm zero-data-retention, so it was discarded and this one-use batch stays closed."} Capture a new batch, or use local hints only.`;
    case "AI_RATE_LIMITED": {
      if (serverSaid) return serverSaid;
      const sec = result.retryAfterMs ? Math.ceil(result.retryAfterMs / 1000) : null;
      return sec
        ? `Vision quota reached — wait about ${sec}s, then analyze a fresh capture.`
        : "Vision quota reached — wait a few minutes, then analyze a fresh capture.";
    }
    case "MEDIA_BATCH_REPLAYED":
      return serverSaid ?? "This batch was already analyzed. Capture again for a new cloud read.";
    case "MEDIA_BATCH_RESERVATION_UNCERTAIN":
      return serverSaid ?? "Could not reserve this batch safely. Discard and capture again before Analyze.";
    default:
      return serverSaid ?? "The analysis could not be completed.";
  }
}
