import { existsSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert/strict";
import test from "node:test";
import {
  NYX_SHIBARI,
  NYX_SHIBARI_POSES,
  nyxCaption,
  nyxPhoto,
  nyxPoseCount,
  nyxPoseForKnotStep,
  nyxPoseForTieStep,
} from "./nyx-model.ts";

const PUBLIC = join(import.meta.dirname, "..", "..", "..", "public");

test("Nyx shibari registry exposes every pose photo and caption", () => {
  assert.equal(nyxPoseCount(), NYX_SHIBARI_POSES.length);
  for (const pose of NYX_SHIBARI_POSES) {
    assert.match(nyxPhoto(pose), /^\/instructor\/nyx\//);
    assert.ok(nyxCaption(pose).length > 12, pose);
    const disk = join(PUBLIC, nyxPhoto(pose).replace(/\?.*$/, "").slice(1));
    assert.ok(existsSync(disk), `missing file for ${pose}: ${disk}`);
  }
  assert.equal(NYX_SHIBARI.role.toLowerCase(), "academy demonstration model");
});

test("guided tie steps map to shibari-appropriate poses", () => {
  assert.equal(nyxPoseForTieStep("single-column", 0), "ropeHands");
  assert.equal(nyxPoseForTieStep("single-column", 2), "wristClose");
  assert.equal(nyxPoseForTieStep("single-column", 3), "singleColumn");
  assert.equal(nyxPoseForTieStep("karada", 0), "dressForm");
  assert.equal(nyxPoseForTieStep("karada", 5), "torsoClose");
  assert.equal(nyxPoseForTieStep("futomomo", 2), "floorClose");
  assert.equal(nyxPoseForTieStep("hip-harness", 2), "hipsLine");
});

test("knot lessons rotate slug-specific Nyx stills", () => {
  assert.equal(nyxPoseForKnotStep("somerville-bowline", 0), "ropeHands");
  assert.equal(nyxPoseForKnotStep("somerville-bowline", 1), "wristClose");
  assert.equal(nyxPoseForKnotStep("somerville-bowline", 3), "portrait");
  assert.equal(nyxPoseForKnotStep("somerville-bowline", 4), "columnClose");
  assert.equal(nyxPoseForKnotStep("somerville-bowline", 5), "ropeHands");
  assert.equal(nyxPoseForKnotStep("larks-head", 1), "ropeLap");
  assert.equal(nyxPoseForKnotStep("unknown-knot", 2), "wristClose");
});
