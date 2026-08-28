#!/usr/bin/env node
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { runDbAudit } from "./db-audit.mjs";

test("database audit passes on shipped migrations", async () => {
  const report = await runDbAudit();
  assert.equal(report.status, "ok");
  assert.deepEqual(report.migrationsApplied, ["0001_auth.sql", "0002_media_batch_reservations.sql"]);
  assert.equal(report.mediaBatchReservation.storesImages, false);
  assert.ok(report.notes.some((n) => n.includes("Nyx instructor stills")));
});

test("every registered Nyx still exists on disk", async () => {
  const { NYX_SHIBARI_POSES, nyxPhoto } = await import("../src/lib/learn/nyx-model.ts");
  const publicRoot = join(import.meta.dirname, "..", "public");
  for (const pose of NYX_SHIBARI_POSES) {
    const url = nyxPhoto(pose);
    const path = join(publicRoot, url.replace(/\?.*$/, "").replace(/^\//, ""));
    assert.ok(existsSync(path), `missing Nyx asset for pose ${pose}: ${path}`);
  }
});
