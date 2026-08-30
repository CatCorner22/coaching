/**
 * Plain-language copy for a camera failure.
 *
 * Shared because both lenses need it: the practice cam used to print
 * `DOMException.message` verbatim, so a reader could be told "The play()
 * request was interrupted by a new load request." by a rope coaching app.
 */
export function cameraErrorMessage(cause: unknown): string {
  if (typeof DOMException !== "undefined" && cause instanceof DOMException) {
    if (cause.name === "NotAllowedError" || cause.name === "SecurityError") {
      return "Camera access was blocked. Allow camera permission or choose a photo or video.";
    }
    if (cause.name === "NotFoundError" || cause.name === "OverconstrainedError") {
      return "No compatible camera was found. Choose a photo or video instead.";
    }
    if (cause.name === "NotReadableError" || cause.name === "AbortError") {
      return "The camera is busy in another app. Close it there and try again.";
    }
  }
  if (cause instanceof Error && (cause.name === "TimeoutError" || cause.name === "AbortError")) {
    return cause.message;
  }
  return cause instanceof Error ? cause.message : "Could not open the camera.";
}
