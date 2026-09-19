import assert from "node:assert/strict";
import test from "node:test";
import { analyzeThrownMessage } from "./analyze-errors.ts";
import { providerFailureMessage } from "./provider-failure.ts";

test("a provider outage never reads as a quiet insufficient view", () => {
  const rateLimited = providerFailureMessage("rate_limited", 120_000);
  assert.match(rateLimited, /rate limiting/);
  assert.match(rateLimited, /about 2 minutes/);
  assert.match(providerFailureMessage("rate_limited"), /a few minutes/);
  for (const failure of ["timed_out", "http_error", "contract", "incomplete"] as const) {
    assert.match(providerFailureMessage(failure), /xAI/);
  }
});

test("thrown analyze failures never print raw internals", () => {
  const zod = new Error(
    JSON.stringify([{ code: "invalid_type", path: ["consent", "batchId"], message: "Required" }]),
  );
  assert.doesNotMatch(analyzeThrownMessage(zod), /invalid_type/);
  assert.match(analyzeThrownMessage(zod), /Capture a new batch/);
  assert.match(
    analyzeThrownMessage(new TypeError("Failed to fetch")),
    /could not reach the server/,
  );
  assert.equal(
    analyzeThrownMessage(new Error("Media permissions must be reconfirmed for this batch")),
    "Media permissions must be reconfirmed for this batch",
  );
});
