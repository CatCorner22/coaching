import assert from "node:assert/strict";
import test from "node:test";
import {
  COACH_VOICE_NAME,
  coachVoiceCacheKey,
  coachVoiceLabel,
  pickCoachBrowserVoice,
} from "./coach-profile";

test("coach voice label reflects cloud opt-in", () => {
  assert.match(coachVoiceLabel(false), new RegExp(`${COACH_VOICE_NAME} · browser`));
  assert.match(coachVoiceLabel(true), new RegExp(`${COACH_VOICE_NAME} · cloud`));
});

test("coach voice cache key includes cloud voice id", () => {
  assert.match(coachVoiceCacheKey("hello"), /^ara:hello$/);
});

test("pickCoachBrowserVoice prefers Hannah when available", () => {
  const voices = [
    { name: "Alex", lang: "en-US", default: false },
    { name: "Samantha", lang: "en-US", default: true },
    { name: "Hannah", lang: "en-US", default: false },
    { name: "Thomas", lang: "fr-FR", default: false },
  ] as SpeechSynthesisVoice[];
  assert.equal(pickCoachBrowserVoice(voices)?.name, "Hannah");
});

test("pickCoachBrowserVoice falls back to other english female voices", () => {
  const voices = [
    { name: "Alex", lang: "en-US", default: false },
    { name: "Samantha", lang: "en-US", default: true },
    { name: "Thomas", lang: "fr-FR", default: false },
  ] as SpeechSynthesisVoice[];
  assert.equal(pickCoachBrowserVoice(voices)?.name, "Samantha");
});
