import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import test from "node:test";
import { buildFingerprint, nodeEnvironment, previewEnvironment, waitForServer } from "../start.mjs";

test("launcher preview allows Tailscale hosts without removing the site lock or existing hosts", async () => {
  const inherited = { SITE_PASSWORD: "private", SITE_USER: "us", __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS: "existing.test" };
  const env = previewEnvironment(inherited);
  assert.equal(env.SITE_PASSWORD, "private");
  assert.equal(env.SITE_USER, "us");
  assert.equal(env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS, "existing.test,.ts.net");
  assert.equal(inherited.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS, "existing.test");
  assert.equal(previewEnvironment({}).__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS, ".ts.net");
  const original = process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS;
  try {
    process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS = env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS;
    const { resolveConfig } = await import("vite");
    const config = await resolveConfig({ configFile: false, server: { allowedHosts: [".replit.dev", ".repl.co"] } }, "serve", "production", "production", true);
    assert.deepEqual(config.preview.allowedHosts, [".replit.dev", ".repl.co", "existing.test", ".ts.net"]);
  } finally {
    if (original === undefined) delete process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS;
    else process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS = original;
  }
});

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
