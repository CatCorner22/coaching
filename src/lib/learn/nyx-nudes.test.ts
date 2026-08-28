import assert from "node:assert/strict";
import test from "node:test";
import { NYX_PHOTO_NUDE_POSES as SCRIPT_POSES } from "../../../scripts/nyx-photo-nude-manifest.mjs";
import { FOUNDATION_KNOT_SLUGS, FOUNDATION_TIE_SLUGS } from "../kb/academy.ts";
import {
  NYX_NUDE_POSES,
  nyxNudeCaption,
  nyxNudesForKnotStep,
  nyxNudesForTieStep,
  nyxPhotoGalleryPoses,
  NYX_NUDES_PER_STEP,
} from "./nyx-nudes.ts";
import {
  illustratedPoseForPhoto,
  isNyxPhotoNudePose,
  NYX_PHOTO_NUDE_POSES,
  nyxPhotoNudeAvailable,
  nyxPhotoNudeCaption,
  nyxPhotoNudeUrl,
} from "./nyx-photo-nudes.ts";

test("Nyx nude catalog covers fourteen illustrated and twenty photo slots", () => {
  assert.equal(NYX_NUDE_POSES.length, 14);
  assert.equal(NYX_PHOTO_NUDE_POSES.length, 20);
  assert.equal(nyxPhotoGalleryPoses().length, 20);
  for (const pose of NYX_NUDE_POSES) {
    assert.ok(nyxNudeCaption(pose).length > 20, pose);
  }
  for (const pose of NYX_PHOTO_NUDE_POSES) {
    assert.match(nyxPhotoNudeUrl(pose), /^\/instructor\/nyx\/nude\//);
    assert.ok(nyxPhotoNudeCaption(pose).length > 12, pose);
  }
});

test("script manifest poses match client catalog", () => {
  assert.deepEqual([...SCRIPT_POSES].sort(), [...NYX_PHOTO_NUDE_POSES].sort());
});

test("every knot and tie step returns five unique nude studies", () => {
  const knots = nyxNudesForKnotStep("somerville-bowline", 0);
  assert.equal(knots.length, NYX_NUDES_PER_STEP);
  assert.equal(new Set(knots).size, NYX_NUDES_PER_STEP);
  assert.ok(knots.includes("wrist-offer"));

  const later = nyxNudesForKnotStep("somerville-bowline", 1);
  assert.notDeepEqual(later, knots);

  const karada = nyxNudesForTieStep("karada", 0);
  assert.equal(karada.length, NYX_NUDES_PER_STEP);
  assert.ok(karada.includes("stand-front") || karada.includes("torso-close"));

  const unknown = nyxNudesForKnotStep("unknown-knot", 0);
  assert.equal(unknown.length, NYX_NUDES_PER_STEP);
});

test("every foundation lesson step returns five unique nude studies", () => {
  for (const slug of FOUNDATION_KNOT_SLUGS) {
    for (let step = 0; step < 3; step++) {
      const poses = nyxNudesForKnotStep(slug, step);
      assert.equal(poses.length, NYX_NUDES_PER_STEP, `${slug} step ${step}`);
      assert.equal(new Set(poses).size, NYX_NUDES_PER_STEP, `${slug} step ${step} unique`);
    }
  }
  for (const slug of FOUNDATION_TIE_SLUGS) {
    for (let step = 0; step < 3; step++) {
      const poses = nyxNudesForTieStep(slug, step);
      assert.equal(poses.length, NYX_NUDES_PER_STEP, `${slug} step ${step}`);
      assert.equal(new Set(poses).size, NYX_NUDES_PER_STEP, `${slug} step ${step} unique`);
    }
  }
});

test("photo-only poses map to illustrated fallbacks", () => {
  assert.equal(illustratedPoseForPhoto("portrait-nude"), "standFront");
  assert.equal(illustratedPoseForPhoto("rope-coil"), "seated");
  assert.equal(illustratedPoseForPhoto("column-wrist"), "wristOffer");
  assert.equal(illustratedPoseForPhoto("chest-line"), "torsoStudy");
  assert.equal(illustratedPoseForPhoto("thigh-stack"), "hipStudy");
  assert.equal(illustratedPoseForPhoto("mermaid-seat"), "seated");
});

test("unhyphenated photo catalog keys are detected as photo poses", () => {
  for (const pose of ["seated", "kneeling", "floor", "recline", "walk"] as const) {
    assert.ok(isNyxPhotoNudePose(pose), pose);
  }
  assert.ok(!isNyxPhotoNudePose("standFront"));
});

test("photo availability follows manifest until files are generated", () => {
  assert.equal(nyxPhotoNudeAvailable("stand-front"), false);
});
