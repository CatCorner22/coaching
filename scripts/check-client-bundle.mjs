#!/usr/bin/env node
import { readFileSync, readdirSync } from "node:fs";
import { dirname, extname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SourceTextModule } from "node:vm";
import { gzipSync } from "node:zlib";

export const CLIENT_BUNDLE_LIMITS = Object.freeze({
  entryRawBytes: 400 * 1024,
  entryGzipBytes: 125 * 1024,
  initialGraphRawBytes: 512 * 1024,
  initialGraphGzipBytes: 170 * 1024,
});

/** Parse static ESM imports/re-exports while excluding import() route chunks. */
export function extractStaticImports(source, identifier = "client-chunk.js") {
  if (typeof SourceTextModule !== "function") {
    throw new Error("Client bundle inspection requires Node --experimental-vm-modules.");
  }
  const module = new SourceTextModule(source, { identifier });
  if (Array.isArray(module.moduleRequests)) {
    return module.moduleRequests.map(({ specifier }) => specifier);
  }
  return [...module.dependencySpecifiers];
}

export function inspectClientBundle(assetsDir, limits = CLIENT_BUNDLE_LIMITS) {
  const entries = readdirSync(assetsDir).filter((name) => /^index-[\w-]+\.js$/.test(name));
  if (entries.length !== 1) {
    throw new Error(`Expected one client index chunk in ${assetsDir}; found ${entries.length}.`);
  }

  const entry = entries[0];
  const root = resolve(assetsDir);
  const seen = new Set();
  const visit = (name, parseAsModule = true) => {
    if (seen.has(name)) return;
    const path = resolve(root, name);
    const pathWithinRoot = relative(root, path);
    if (pathWithinRoot.startsWith("..") || isAbsolute(pathWithinRoot)) {
      throw new Error(`Static client import escaped the assets directory: ${name}`);
    }
    const source = readFileSync(path, "utf8");
    seen.add(name);
    if (!parseAsModule) return;
    for (const specifier of extractStaticImports(source, path)) {
      if (!specifier.startsWith("./") && !specifier.startsWith("../")) continue;
      const importedPath = resolve(dirname(path), specifier);
      const importedName = relative(root, importedPath);
      const extension = extname(importedName).toLowerCase();
      visit(importedName, extension === "" || extension === ".js" || extension === ".mjs");
    }
  };
  visit(entry);

  const sizes = [...seen].map((name) => {
    const bytes = readFileSync(join(assetsDir, name));
    return { name, rawBytes: bytes.byteLength, gzipBytes: gzipSync(bytes).byteLength };
  });
  const entrySize = sizes.find(({ name }) => name === entry);
  const graph = sizes.reduce(
    (total, item) => ({
      rawBytes: total.rawBytes + item.rawBytes,
      gzipBytes: total.gzipBytes + item.gzipBytes,
    }),
    { rawBytes: 0, gzipBytes: 0 },
  );
  const violations = [];
  if (entrySize.rawBytes > limits.entryRawBytes) {
    violations.push(`entry raw ${entrySize.rawBytes} > ${limits.entryRawBytes}`);
  }
  if (entrySize.gzipBytes > limits.entryGzipBytes) {
    violations.push(`entry gzip ${entrySize.gzipBytes} > ${limits.entryGzipBytes}`);
  }
  if (graph.rawBytes > limits.initialGraphRawBytes) {
    violations.push(`initial graph raw ${graph.rawBytes} > ${limits.initialGraphRawBytes}`);
  }
  if (graph.gzipBytes > limits.initialGraphGzipBytes) {
    violations.push(`initial graph gzip ${graph.gzipBytes} > ${limits.initialGraphGzipBytes}`);
  }
  return {
    ok: violations.length === 0,
    entry,
    entrySize,
    initialGraph: { ...graph, files: sizes.map(({ name }) => name).sort() },
    limits,
    violations,
  };
}

function run() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const assetsDir = resolve(process.argv[2] ?? join(root, ".vercel/output/static/assets"));
  const report = inspectClientBundle(assetsDir);
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run();
