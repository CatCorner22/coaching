import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import test from "node:test";
import { buildFingerprint, nodeEnvironment, waitForServer } from "../start.mjs";

test("the selected Node directory precedes the inherited path, preserving Windows Path casing", () => {
  const result = nodeEnvironment({ Path: "old", OTHER: "kept" }, join("selected", "node"));
  assert.equal(result.Path, `selected${delimiter}old`);
  assert.equal(result.OTHER, "kept");
  assert.equal(nodeEnvironment({}, join("selected", "node")).PATH, `selected${delimiter}`);
});

test("build fingerprint handles empty sources, edits, deletions, public files and build flags", () => {
  const root = mkdtempSync(join(tmpdir(), "knotty-launcher-"));
  try {
    const empty = buildFingerprint(root);
    assert.equal(buildFingerprint(root), empty);
    mkdirSync(join(root, "src"));
    writeFileSync(join(root, "src", "page.tsx"), "first");
    const first = buildFingerprint(root);
    assert.notEqual(first, empty);
    writeFileSync(join(root, "src", "page.tsx"), "updated");
    assert.notEqual(buildFingerprint(root), first);
    unlinkSync(join(root, "src", "page.tsx"));
    assert.equal(buildFingerprint(root), empty);
    mkdirSync(join(root, "public"));
    writeFileSync(join(root, "public", "image.svg"), "image");
    assert.notEqual(buildFingerprint(root), empty);
    assert.notEqual(buildFingerprint(root, { VITE_AUTH_ENABLED: "true" }), buildFingerprint(root));
    assert.equal(buildFingerprint(root, { SITE_PASSWORD: "secret" }), buildFingerprint(root));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("readiness waits for an authenticated successful response", async () => {
  let attempts = 0;
  await waitForServer("http://localhost:8080", "Basic test", {
    timeoutMs: 2000,
    fetchImpl: async (_url, options) => {
      assert.equal(options.headers.authorization, "Basic test");
      attempts++;
      if (attempts === 1) throw new Error("Not listening yet");
      return new Response(null, { status: attempts === 2 ? 503 : 200 });
    },
  });
  assert.equal(attempts, 3);
});

test("readiness rejects a server that never becomes available", async () => {
  await assert.rejects(waitForServer("http://localhost:8080", "Basic test", {
    timeoutMs: 1,
    fetchImpl: async () => new Response(null, { status: 401 }),
  }), /did not become ready/);
});
