import assert from "node:assert/strict";
import { test } from "node:test";
import {
  allowsAdultNudity,
  DEFAULT_MEDIA_UPLOAD_SCOPE,
  MEDIA_UPLOAD_SCOPES,
  parseMediaUploadScope,
  uploadScopeAttestation,
  uploadScopeCapturePreference,
  uploadScopeIntroLine,
  uploadScopeQualityFraming,
  uploadScopeSummary,
} from "./media-scope.ts";
import { knowledgeDisposition } from "./kb/search.ts";

test("an unset or unrecognised scope falls back to the conservative default", () => {
  // An operator who has not read the provider's policy has not agreed to
  // anything, and guessing wrong here means intimate images sent somewhere the
  // terms did not permit.
  assert.equal(DEFAULT_MEDIA_UPLOAD_SCOPE, "non_explicit");
  assert.equal(allowsAdultNudity(DEFAULT_MEDIA_UPLOAD_SCOPE), false);
  for (const value of [
    undefined,
    null,
    "",
    "   ",
    "yes",
    "true",
    "everything",
    "explicit",
    "adult_nudity_and_more",
    42,
    {},
    [],
  ]) {
    assert.equal(parseMediaUploadScope(value), "non_explicit", String(value));
  }
  // Real values are accepted, case- and whitespace-insensitively.
  assert.equal(parseMediaUploadScope("adult_nudity"), "adult_nudity");
  assert.equal(parseMediaUploadScope("  ADULT_NUDITY  "), "adult_nudity");
  assert.equal(parseMediaUploadScope("non_explicit"), "non_explicit");
});

test("the copy states which setting is in force rather than a fixed rule", () => {
  for (const scope of MEDIA_UPLOAD_SCOPES) {
    const attestation = uploadScopeAttestation(scope);
    const summary = uploadScopeSummary(scope);
    // Sexual activity is out of scope at every setting, and both strings say so.
    assert.match(attestation, /sexual activity/i, scope);
    assert.match(summary, /sexual activity cannot/i, scope);
    assert.notEqual(attestation, uploadScopeAttestation(scope === "non_explicit" ? "adult_nudity" : "non_explicit"));
  }
  assert.match(uploadScopeSummary("non_explicit"), /full nudity and sexual activity cannot/i);
  assert.match(uploadScopeSummary("adult_nudity"), /nude views of consenting adults can be uploaded/i);
});

test("scope-aware UI helpers differ between settings", () => {
  assert.match(uploadScopeIntroLine("adult_nudity"), /nude views/i);
  assert.match(uploadScopeIntroLine("non_explicit"), /equipment-only/i);
  assert.match(uploadScopeCapturePreference("adult_nudity"), /nude views/i);
  assert.match(uploadScopeCapturePreference("non_explicit"), /equipment-only/i);
  assert.notEqual(
    uploadScopeQualityFraming("adult_nudity"),
    uploadScopeQualityFraming("non_explicit"),
  );
  assert.doesNotMatch(uploadScopeQualityFraming("adult_nudity"), /equipment-only/i);
});

test("only the nudity line moves with the setting", () => {
  for (const query of [
    "nude photo of my wife",
    "naked picture of her for coaching",
    "topless still",
    "full frontal photo",
    "undressed photo for analysis",
  ]) {
    assert.equal(knowledgeDisposition(query, "non_explicit").kind, "unsupported_media", query);
    assert.equal(knowledgeDisposition(query, "adult_nudity").kind, "ordinary", query);
  }
});

test("age, consent, and sexual activity are refused at every setting", () => {
  // These are not the provider's policy and are not configurable. Allowing
  // nudity unmasked real gaps in the consent patterns, which had only been
  // reached because a nudity word happened to sit in the same query.
  const alwaysRefused = [
    // Apparent or ambiguous minor.
    "nude photo of a 16 year old",
    "naked 15 year old picture",
    "underage nude",
    "photo of a minor undressed",
    "nude photo, not sure if she is 18",
    "naked teen photo",
    "ambiguous age nude image",
    // Absent or coerced consent.
    "naked photo taken without her consent",
    "secretly recorded nude video",
    "hidden camera nude",
    "nude photo without permission",
    "she didn't agree to the photo",
    "filmed her naked without her knowledge",
    "covertly photographed her nude",
    "spy cam footage of her undressed",
    "posted her nudes against her wishes",
    "took nude pictures while she was asleep",
    "coerced nude photo",
    "forced her to pose nude for a picture",
    "revenge porn",
    "stolen nude photo",
    // Sexual activity.
    "sexual activity photo",
    "sex act image",
    "porn",
    "hardcore video upload",
    "explicit sexual video",
  ];
  for (const query of alwaysRefused) {
    for (const scope of MEDIA_UPLOAD_SCOPES) {
      assert.notEqual(
        knowledgeDisposition(query, scope).kind,
        "ordinary",
        `${query} was allowed under ${scope}`,
      );
    }
  }
});

test("ordinary rope queries are unaffected by the setting", () => {
  for (const query of [
    "lingerie photo",
    "jute rope close up",
    "single column tie",
    "nude pink rope",
    "how do i clean hemp",
  ]) {
    for (const scope of MEDIA_UPLOAD_SCOPES) {
      assert.equal(knowledgeDisposition(query, scope).kind, "ordinary", `${query} / ${scope}`);
    }
  }
});
