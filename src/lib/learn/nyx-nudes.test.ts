import assert from "node:assert/strict";
import test from "node:test";
import {
  NYX_NUDE_POSES,
  nyxNudeCaption,
  nyxNudesForKnotStep,
  nyxNudesForTieStep,
  nyxPhotoGalleryPoses,
} from "./nyx-nudes.ts";
import {
  NYX_PHOTO_NUDE_POSES,
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

test("every knot and tie step returns five nude studies", () => {
  const knots = nyxNudesForKnotStep("somerville-bowline", 0);
  assert.equal(knots.length, 5);
  assert.equal(new Set(knots).size, 5);
  assert.ok(knots.includes("wrist-offer"));

  const later = nyxNudesForKnotStep("somerville-bowline", 1);
  assert.notDeepEqual(later, knots);

  const karada = nyxNudesForTieStep("karada", 0);
  assert.equal(karada.length, 5);
  assert.ok(karada.includes("stand-front") || karada.includes("torso-close"));

  const unknown = nyxNudesForKnotStep("unknown-knot", 0);
  assert.equal(unknown.length, 5);
});
