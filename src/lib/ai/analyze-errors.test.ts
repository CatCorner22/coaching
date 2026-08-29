import assert from "node:assert/strict";
import test from "node:test";
import { analyzeErrorMessage } from "./analyze-errors.ts";

const base = { ok: false as const, providerAttempted: true, retryableBeforeProvider: false };

test("the server's own sentence is kept, with only the next step appended", () => {
  // The server leads with the outcome that matters — "No media was sent to
  // xAI" — and the smoke asserts that sentence reaches the alert verbatim. A
  // friendlier paraphrase that drops it is a disclosure regression, which is
  // exactly what an earlier revision of this mapper did.
  const provider = analyzeErrorMessage({
    ...base,
    error:
      "No media was sent to xAI. The service is not available in this environment; retry after the deployment is configured.",
    code: "AI_PROVIDER_UNAVAILABLE",
    status: 503,
  });
  assert.match(provider, /^No media was sent to xAI\. The service is not available/);
  assert.match(provider, /Local band hints still work\./);

  const limited = analyzeErrorMessage({
    ...base,
    error:
      "No media was sent to xAI. AI request capacity is full; retry this batch in about 2 minute(s).",
    code: "AI_RATE_LIMITED",
    status: 429,
    retryAfterMs: 90_000,
  });
  assert.match(limited, /^No media was sent to xAI\. AI request capacity is full/);
});

test("fallback copy exists when the server sent no sentence", () => {
  assert.match(
    analyzeErrorMessage({ ...base, error: "", code: "AI_RATE_LIMITED", status: 429, retryAfterMs: 30_000 }),
    /wait about 30s/,
  );
  assert.match(
    analyzeErrorMessage({ ...base, error: "", code: "MEDIA_BATCH_REPLAYED", status: 409 }),
    /already analyzed/i,
  );
  assert.match(
    analyzeErrorMessage({
      ok: false,
      error:
        "No media was sent to xAI. The service is not available in this environment; retry after the deployment is configured.",
      code: "AI_PROVIDER_UNAVAILABLE",
      status: 503,
      providerAttempted: false,
      retryableBeforeProvider: true,
    }),
    /No media was sent to xAI/,
  );
});

test("an unverified ZDR response never claims nothing was sent or invites a re-tap", () => {
  // Media was dispatched; only the response was discarded, and the one-use
  // batch stays closed. "Nothing was saved — tap Analyze again" got both
  // halves wrong.
  const unverified = analyzeErrorMessage({
    ...base,
    error: "",
    code: "AI_PRIVACY_RESPONSE_UNVERIFIED",
    status: 502,
  });
  assert.doesNotMatch(unverified, /no media was sent|nothing was sent/i);
  assert.doesNotMatch(unverified, /tap analyze again|analyze again/i);
  assert.match(unverified, /one-use batch stays closed/i);
  assert.match(unverified, /capture a new batch/i);
});
