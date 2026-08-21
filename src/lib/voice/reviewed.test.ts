import assert from "node:assert/strict";
import test from "node:test";
import { KNOTS, TIES } from "@/lib/kb";
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
