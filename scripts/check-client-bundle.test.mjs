import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { extractStaticImports, inspectClientBundle } from "./check-client-bundle.mjs";

test("ESM parser follows static imports and re-exports but excludes lazy route imports", () => {
  const source = [
    'import{a}from"./a.js";',
    'import "./side.js";',
    'export { value } from "./reexport.js";',
    'const lazy=()=>import("./lazy.js");',
    'import finalValue from "./extensionless"',
  ].join("\n");
  assert.deepEqual(extractStaticImports(source), [
    "./a.js",
    "./side.js",
    "./reexport.js",
    "./extensionless",
  ]);
});

test("bundle budget follows and deduplicates the complete static entry graph", (t) => {
  const root = mkdtempSync(join(tmpdir(), "knotty-bundle-"));
  const assets = join(root, "assets");
  mkdirSync(assets);
  t.after(() => rmSync(root, { recursive: true, force: true }));
  writeFileSync(join(assets, "index-test.js"), 'import"./shared.js";import("./lazy.js");');
  writeFileSync(
    join(assets, "shared.js"),
    'export { leaf } from "./leaf.js";import "./bare";import "./style.css";',
  );
  writeFileSync(join(assets, "leaf.js"), 'import"./shared.js";export const leaf="leaf";');
  writeFileSync(join(assets, "bare"), 'export const value="extensionless"');
  writeFileSync(join(assets, "style.css"), ".root{display:block}");
  writeFileSync(join(assets, "lazy.js"), "x".repeat(2_000));

  const report = inspectClientBundle(assets, {
    entryRawBytes: 1_000,
    entryGzipBytes: 1_000,
    initialGraphRawBytes: 1_000,
    initialGraphGzipBytes: 1_000,
  });
  assert.equal(report.ok, true);
  assert.deepEqual(report.initialGraph.files, [
    "bare",
    "index-test.js",
    "leaf.js",
    "shared.js",
    "style.css",
  ]);
});

test("budget fails when the entry passes but its eager dependency graph is oversized", (t) => {
  const root = mkdtempSync(join(tmpdir(), "knotty-bundle-"));
  const assets = join(root, "assets");
  mkdirSync(assets);
  t.after(() => rmSync(root, { recursive: true, force: true }));
  writeFileSync(join(assets, "index-test.js"), 'import"./eager.js";');
  writeFileSync(join(assets, "eager.js"), "abcdefghijklmnopqrstuvwxyz".repeat(80));

  const report = inspectClientBundle(assets, {
    entryRawBytes: 100,
    entryGzipBytes: 100,
    initialGraphRawBytes: 500,
    initialGraphGzipBytes: 500,
  });
  assert.equal(report.entrySize.rawBytes < 100, true);
  assert.equal(report.ok, false);
  assert.match(report.violations.join("; "), /initial graph raw/);
});
