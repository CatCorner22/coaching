import assert from "node:assert/strict";
import test from "node:test";
import {
  NYX_SHIBARI,
  nyxCaption,
  nyxPhoto,
  nyxPoseForKnotStep,
  nyxPoseForTieStep,
} from "./nyx-model.ts";

test("Nyx shibari registry exposes every pose photo and caption", () => {
  for (const pose of ["portrait", "ropeHands", "dressForm", "singleColumn", "karadaProp", "floorWork", "walkthrough"] as const) {
    assert.match(nyxPhoto(pose), /^\/instructor\/nyx\//);
    assert.ok(nyxCaption(pose).length > 12, pose);
  }
  assert.equal(NYX_SHIBARI.role.toLowerCase(), "academy demonstration model");
});

test("guided tie steps map to shibari-appropriate poses", () => {
  assert.equal(nyxPoseForTieStep("single-column", 0), "ropeHands");
  assert.equal(nyxPoseForTieStep("single-column", 3), "singleColumn");
  assert.equal(nyxPoseForTieStep("karada", 0), "dressForm");
  assert.equal(nyxPoseForTieStep("karada", 5), "karadaProp");
});

test("knot lessons prefer rope-handling stills early", () => {
  assert.equal(nyxPoseForKnotStep("somerville-bowline", 0), "ropeHands");
  assert.equal(nyxPoseForKnotStep("somerville-bowline", 3), "portrait");
});
