import assert from "node:assert/strict";
import test from "node:test";
import {
  NYX_NUDE_POSES,
  nyxNudeCaption,
  nyxNudesForKnotStep,
  nyxNudesForTieStep,
} from "./nyx-nudes.ts";

test("Nyx nude catalog covers fourteen adult body studies", () => {
  assert.equal(NYX_NUDE_POSES.length, 14);
  for (const pose of NYX_NUDE_POSES) {
    assert.ok(nyxNudeCaption(pose).length > 20, pose);
  }
});

test("every knot and tie step returns three distinct nude studies", () => {
  const knots = nyxNudesForKnotStep("somerville-bowline", 0);
  assert.equal(knots.length, 3);
  assert.equal(new Set(knots).size, 3);
  assert.ok(knots.includes("wristOffer"));

  const later = nyxNudesForKnotStep("somerville-bowline", 1);
  assert.notDeepEqual(later, knots);

  const karada = nyxNudesForTieStep("karada", 0);
  assert.equal(karada.length, 3);
  assert.ok(karada.includes("standFront") || karada.includes("torsoStudy"));

  const unknown = nyxNudesForKnotStep("unknown-knot", 0);
  assert.equal(unknown.length, 3);
});
