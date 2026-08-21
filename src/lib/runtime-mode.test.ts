import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizedDatabaseUrl,
  selectDatabaseSource,
  viteDevServer,
} from "./runtime-mode.ts";

test("plain Node defaults to the non-development boundary", () => {
  assert.equal(viteDevServer, false);
});

test("database URLs are normalized before backend selection", () => {
  assert.equal(normalizedDatabaseUrl(undefined), undefined);
  assert.equal(normalizedDatabaseUrl(""), undefined);
  assert.equal(normalizedDatabaseUrl(" \n\t "), undefined);
  assert.equal(
    normalizedDatabaseUrl("  postgres://example.invalid/app  "),
    "postgres://example.invalid/app",
  );
});

test("a configured database always selects Postgres", () => {
  for (const developmentServer of [false, true]) {
    assert.equal(
      selectDatabaseSource("postgres://example.invalid/app", developmentServer),
      "neon",
    );
  }
});

test("only the explicit Vite dev-server boundary may select PGLite", () => {
  assert.equal(selectDatabaseSource(undefined, true), "pglite");
  assert.equal(selectDatabaseSource("  ", true), "pglite");
  assert.equal(selectDatabaseSource(undefined, false), "unconfigured");
  assert.equal(selectDatabaseSource("  ", false), "unconfigured");
});
