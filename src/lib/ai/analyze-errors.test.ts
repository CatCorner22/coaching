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
    analyzeErrorMessage({
      ...base,
      error: "",
      code: "AI_RATE_LIMITED",
      status: 429,
      retryAfterMs: 30_000,
    }),
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

test("capture reset failures are actionable and never reopen the batch", () => {
  const result = analyzeErrorMessage({
    ...base,
    error: "Analysis could not start and the capture could not be reset — take a fresh capture.",
    code: "AI_PROVIDER_UNAVAILABLE",
    status: 503,
    providerAttempted: false,
    retryableBeforeProvider: false,
  });
  assert.match(result, /capture could not be reset/i);
  assert.match(result, /take a fresh capture/i);
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

test("a validator failure is reported as pre-dispatch, and its marker never reaches the reader", async () => {
  const { analyzeThrownBeforeDispatch, analyzeThrownMessage, PRE_DISPATCH_MARKER } =
    await import("./analyze-errors.ts");
  // The validator runs before the handler, so nothing was reserved and the
  // one-use batch can be reopened — but the failure arrives as a thrown error
  // with no server verdict, so the marker is the only way to know that.
  const thrown = new Error(
    `${PRE_DISPATCH_MARKER} Media permissions must be reconfirmed for this batch`,
  );
  assert.equal(analyzeThrownBeforeDispatch(thrown), true);
  assert.equal(
    analyzeThrownMessage(thrown),
    "Media permissions must be reconfirmed for this batch",
  );
  // Anything else stays closed.
  assert.equal(analyzeThrownBeforeDispatch(new Error("the provider timed out")), false);
});

test("an expired sign-in reopens the batch, because middleware rejects before the handler", async () => {
  const { analyzeThrownBeforeDispatch, analyzeThrownMessage } = await import("./analyze-errors.ts");
  // authMiddleware runs ahead of the handler, so no batch was reserved and no
  // media left the browser: signing in again must not cost the capture.
  const unauthorized = Object.assign(new Error("Unauthorized"), { name: "UnauthorizedError" });
  assert.equal(analyzeThrownBeforeDispatch(unauthorized), true);
  const withStatus = Object.assign(new Error("boom"), { status: 401 });
  assert.equal(analyzeThrownBeforeDispatch(withStatus), true);
  const message = analyzeThrownMessage(unauthorized);
  assert.match(message, /nothing was sent/i);
  assert.match(message, /sign in again/i);
  assert.notEqual(message.trim(), "Unauthorized");
});
