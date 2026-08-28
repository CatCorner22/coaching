import assert from "node:assert/strict";
import test from "node:test";
import { analyzeErrorMessage } from "./analyze-errors.ts";

test("analyzeErrorMessage maps provider codes to actionable copy", () => {
  assert.match(
    analyzeErrorMessage({
      ok: false,
      error: "raw",
      code: "AI_RATE_LIMITED",
      status: 429,
      providerAttempted: true,
      retryableBeforeProvider: false,
      retryAfterMs: 30_000,
    }),
    /wait about 30s/,
  );
  assert.match(
    analyzeErrorMessage({
      ok: false,
      error: "raw",
      code: "MEDIA_BATCH_REPLAYED",
      status: 409,
      providerAttempted: true,
      retryableBeforeProvider: false,
    }),
    /already analyzed/i,
  );
});
