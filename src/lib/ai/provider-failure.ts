import type { ProviderFailure } from "./schema";

/**
 * Plain-language reason a report is the local conservative one. A provider
 * outage and "the model looked and saw nothing notable" produce the same
 * `insufficient_view` disposition, so the difference has to be said out loud.
 */
export function providerFailureMessage(
  failure: ProviderFailure,
  retryAfterMs?: number,
): string {
  const wait =
    typeof retryAfterMs === "number" && retryAfterMs > 0
      ? retryAfterMs >= 90_000
        ? `about ${Math.ceil(retryAfterMs / 60_000)} minutes`
        : `about ${Math.max(5, Math.ceil(retryAfterMs / 1000))} seconds`
      : null;
  switch (failure) {
    case "rate_limited":
      return `xAI is rate limiting requests, so it never read these stills. Wait ${wait ?? "a few minutes"}, then capture a new batch. Everything below is the local report.`;
    case "timed_out":
      return "xAI did not answer in time, so it never returned a read of these stills. Try a new batch in a moment. Everything below is the local report.";
    case "http_error":
      return "xAI returned an error instead of a read, so these stills were not classified. Try a new batch in a moment. Everything below is the local report.";
    case "incomplete":
      return "xAI's answer was cut off mid-response and was discarded. Nothing below comes from the cloud read.";
    case "contract":
      return "xAI's answer did not match the required format and was discarded. Nothing below comes from the cloud read.";
    case "unavailable":
      return "Cloud vision is not switched on for this app, so nothing was sent. Everything below is the local report.";
    case "refused":
      return "xAI declined to read these stills. Everything below is the local report.";
  }
}
