import assert from "node:assert/strict";
import test from "node:test";
import { buildSystemPrompt, verifyBatchConsentScope } from "./analyze-consent.ts";
import { mediaUploadScope } from "../media-scope.ts";

const priorScope = process.env.VITE_MEDIA_UPLOAD_SCOPE;

test.after(() => {
  if (priorScope === undefined) delete process.env.VITE_MEDIA_UPLOAD_SCOPE;
  else process.env.VITE_MEDIA_UPLOAD_SCOPE = priorScope;
});

test("buildSystemPrompt includes adult-nudity scope when configured", () => {
  process.env.VITE_MEDIA_UPLOAD_SCOPE = "adult_nudity";
  const prompt = buildSystemPrompt("adult_nudity");
  assert.match(prompt, /may include nudity of consenting adults/i);
  assert.match(prompt, /explicit sexual activity is out of scope/i);
  assert.doesNotMatch(prompt, /non-explicit media supplied/i);
});

test("buildSystemPrompt stays non-explicit when scope is conservative", () => {
  process.env.VITE_MEDIA_UPLOAD_SCOPE = "non_explicit";
  const prompt = buildSystemPrompt("non_explicit");
  assert.match(prompt, /non-explicit media supplied/i);
  assert.doesNotMatch(prompt, /may include nudity/i);
});

test("verifyBatchConsentScope rejects a scope mismatch", () => {
  process.env.VITE_MEDIA_UPLOAD_SCOPE = "adult_nudity";
  assert.equal(mediaUploadScope(), "adult_nudity");
  assert.throws(() => verifyBatchConsentScope("non_explicit"), /does not match/i);
  assert.doesNotThrow(() => verifyBatchConsentScope("adult_nudity"));
});

test("verifyBatchConsentScope rejects widened attestation under conservative deploy", () => {
  process.env.VITE_MEDIA_UPLOAD_SCOPE = "non_explicit";
  assert.throws(() => verifyBatchConsentScope("adult_nudity"), /does not match/i);
  assert.doesNotThrow(() => verifyBatchConsentScope("non_explicit"));
});
