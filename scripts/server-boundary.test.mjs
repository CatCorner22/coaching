import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("cost-bearing server functions use verified auth middleware context", () => {
  for (const path of ["src/lib/ai/analyze.ts", "src/lib/ai/voice.ts"]) {
    const source = read(path);
    assert.match(source, /\.middleware\(\[authMiddleware\]\)/, path);
    assert.match(source, /authorizeAiRequest\(context\.userId\)/, path);
  }
});

test("rate-limit adapter uses the shared typed core", () => {
  const source = read("src/lib/ai/rate-limit.server.ts");
  assert.match(source, /new Map<string, RateLimitBucket>\(\)/);
  assert.match(source, /consumeRateLimit\(buckets,/);
  assert.doesNotMatch(source, /new Map<string, Bucket>/);
});

test("vision replay reservation encloses the quota charge", () => {
  const source = read("src/lib/ai/analyze.ts");
  assert.match(
    source,
    /consumeMediaBatch\(authorization\.userId, data\.consent\.batchId, \(\) => \{\s*consumeAiBudget\(/,
  );
  assert.doesNotMatch(source, /consumeAiBudget\([^;]+;\s*consumeMediaBatch\(/);
});

test("session cookie parse failures never log credential previews", () => {
  const source = read("src/lib/auth/gate-session.server.ts");
  assert.doesNotMatch(source, /cookiePreview|signedCookie\.slice/);
  assert.match(source, /byteLength: Buffer\.byteLength\(signedCookie/);
});

test("provider requests receive the originating request cancellation signal", () => {
  const analyze = read("src/lib/ai/analyze.ts");
  const voice = read("src/lib/ai/voice.ts");
  assert.match(analyze, /signal: authorization\.signal/);
  assert.match(voice, /authorization\.signal\.addEventListener\("abort"/);
});

test("vision input bounds frame labels and the deterministic hint structure", () => {
  const source = read("src/lib/ai/analyze.ts");
  assert.match(source, /regex\(\/\^\[FSV\]\[0-9\]\{2\}\$\//);
  assert.match(source, /wrapBands:[\s\S]*?\.max\(16\)/);
  assert.match(source, /flags:[\s\S]*?\.max\(12\)/);
  assert.match(source, /notes: z\.array\(z\.string\(\)\.max\(200\)\)\.max\(8\)/);
  assert.doesNotMatch(source, /deterministic: z\.unknown\(\)/);
});

test("late or excessive voice requests cannot repopulate the cleared cache", () => {
  const source = read("src/lib/voice/play.ts");
  assert.match(source, /MAX_INFLIGHT_VOICES = 2/);
  assert.match(source, /inflight\.size >= MAX_INFLIGHT_VOICES/);
  assert.match(source, /generation !== playbackGeneration/);
  assert.ok(source.indexOf("generation !== playbackGeneration") < source.indexOf("cache.set(key, entry)"));
});
