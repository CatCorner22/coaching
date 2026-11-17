import test from "node:test";
import assert from "node:assert/strict";
import { combineRanks, needsTalk } from "./combine.ts";

test("both yes is yes", () => assert.equal(combineRanks("yes", "yes"), "yes"));
test("yes and maybe is maybe", () => assert.equal(combineRanks("yes", "maybe"), "maybe"));
test("any no is no", () => {
  assert.equal(combineRanks("yes", "no"), "no");
  assert.equal(combineRanks("no", "maybe"), "no");
});
test("unanswered counts as no", () => assert.equal(combineRanks("yes", undefined), "no"));
test("different answers need a talk", () => {
  assert.equal(needsTalk("yes", "maybe"), true);
  assert.equal(needsTalk("yes", "yes"), false);
});
