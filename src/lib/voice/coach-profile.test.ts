import assert from "node:assert/strict";
import test from "node:test";
import { coachVoiceCacheKey, coachVoiceLabel, pickCoachBrowserVoice } from "./coach-profile";

test("coach voice label reflects cloud opt-in", () => {
  assert.match(coachVoiceLabel(false), /Sultry female voice · browser/);
  assert.match(coachVoiceLabel(true), /Sultry female voice · cloud/);
});

test("coach voice cache key includes cloud voice id", () => {
  assert.match(coachVoiceCacheKey("hello"), /^ara:hello$/);
});

test("pickCoachBrowserVoice prefers english female voices", () => {
  const voices = [
    { name: "Alex", lang: "en-US", default: false },
    { name: "Samantha", lang: "en-US", default: true },
    { name: "Thomas", lang: "fr-FR", default: false },
  ] as SpeechSynthesisVoice[];
  assert.equal(pickCoachBrowserVoice(voices)?.name, "Samantha");
});
