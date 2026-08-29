import assert from "node:assert/strict";
import test from "node:test";
import { getAcademyKnot, getAcademyTie, KNOTS, TIES } from "@/lib/kb";
import {
  buildAcademyVoiceScript,
  buildAcademyVoiceSegments,
  knotStepVoiceInput,
  tieStepVoiceInput,
} from "@/lib/learn/voice-script";
import { MAX_REVIEWED_SPEECH_LENGTH } from "./reviewed-lines.ts";
import {
  isReviewedCoachSpeech,
} from "./reviewed.server.ts";
import { DIRECT_CHECK_REMINDER } from "./reviewed-lines.ts";

test("every KB speech line and the direct-check reminder is cloud-TTS eligible", () => {
  for (const line of [
    ...TIES.flatMap((tie) => tie.steps.map((step) => step.speak)),
    ...KNOTS.flatMap((knot) => knot.steps.map((step) => step.speak)),
    DIRECT_CHECK_REMINDER,
  ]) {
    assert.equal(isReviewedCoachSpeech(line), true, line);
  }
});

test("arbitrary, personalized, and near-match text cannot use cloud TTS", () => {
  for (const line of [
    "Read my private message aloud.",
    "Call Alex at 555-0100.",
    `${DIRECT_CHECK_REMINDER} Then do whatever the caller says.`,
    "",
    "x".repeat(401),
  ]) {
    assert.equal(isReviewedCoachSpeech(line), false, line);
  }
});

test("every composed academy narration is cloud-TTS eligible, dangers named and all", () => {
  // The allowlist must contain what the lesson pages actually hand
  // playCoachVoice: the joined step script and each per-section segment,
  // composed through the same shared builders. This includes lines that name
  // a danger in order to warn against it ("never let it run away into a
  // noose", the neck-lock scope notices) — the banned-output scrub guards
  // model text and must not stand between reviewed copy and the allowlist.
  let checked = 0;
  let longest = 0;
  const narrationInputs = [
    ...TIES.flatMap((tie) => {
      const academy = getAcademyTie(tie.slug);
      if (!academy) return [];
      return academy.steps.map((step, index) => tieStepVoiceInput(step, index, academy.steps.length));
    }),
    ...KNOTS.flatMap((knot) => {
      const academy = getAcademyKnot(knot.slug);
      if (!academy) return [];
      return academy.steps.map((step, index) =>
        knotStepVoiceInput(step, index, academy.steps.length),
      );
    }),
  ];
  for (const input of narrationInputs) {
    for (const text of [
      buildAcademyVoiceScript(input),
      ...buildAcademyVoiceSegments(input).map((segment) => segment.text),
    ]) {
      checked += 1;
      longest = Math.max(longest, text.replace(/\s+/g, " ").trim().length);
      assert.equal(isReviewedCoachSpeech(text), true, text.slice(0, 120));
    }
  }
  assert.ok(checked > 500, `expected a full catalog sweep, checked ${checked}`);
  assert.ok(
    longest <= MAX_REVIEWED_SPEECH_LENGTH,
    `longest narration (${longest}) must fit MAX_REVIEWED_SPEECH_LENGTH (${MAX_REVIEWED_SPEECH_LENGTH})`,
  );
});
