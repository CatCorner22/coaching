import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

function between(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.ok(from >= 0 && to > from, `could not isolate ${start}`);
  return source.slice(from, to);
}

test("cloud voice is fail-closed and route controls pass the saved opt-in", () => {
  const player = read("src/lib/voice/play.ts");
  const play = between(player, "export async function playCoachVoice", "async function loadVoice");
  assert.match(play, /cloudEnabled = false/);
  assert.match(play, /if \(cloudEnabled\) \{[\s\S]*?await loadVoice\(/);

  for (const path of ["src/routes/tie.$slug.tsx", "src/routes/knot.$slug.tsx"]) {
    const route = read(path);
    assert.match(route, /useSettings\(\(settings\) => settings\.voice\)/, path);
    assert.match(route, /playCoachVoice\([^\n]+, cloudVoice\)/, path);
    assert.match(route, /Browser voice · no xAI/, path);
  }

  const settings = read("src/routes/settings.tsx");
  assert.match(settings, /if \(!event\.target\.checked\) clearCoachVoiceCache\(\)/);
});

test("accepting a capture preserves the committed permission ledger", () => {
  const studio = read("src/routes/studio.tsx");
  const accept = between(studio, "const acceptCapture", "const discardCapture");
  assert.doesNotMatch(accept, /setTriage\("unanswered"\)/);
  assert.match(accept, /setCapture\(next\)/);

  const camera = read("src/components/camera-capture.tsx");
  assert.match(camera, /setBatchCommitted\(true\)/);
  assert.match(camera, /permissionExpiryTimerRef\.current = window\.setTimeout/);
  assert.match(studio, /disabled=\{stopped \|\| mediaBlocked \|\| triage !== "none"\}/);
});

test("a cancelled photo import cannot commit after its decoder resolves", () => {
  const camera = read("src/components/camera-capture.tsx");
  const photoImport = between(
    camera,
    "const { jpeg, imageData } = await processMediaFrame(file",
    '} catch (e) {',
  );
  assert.match(
    photoImport,
    /signal\.throwIfAborted\(\);[\s\S]*?!ownsMediaOperation\(operation\.id\)[\s\S]*?signal\.throwIfAborted\(\);[\s\S]*?!ownsMediaOperation\(operation\.id\)[\s\S]*?await emitFromMedia\("photo"/,
  );
});

test("capture analysis is synchronously bound to the current Studio context", () => {
  const studio = read("src/routes/studio.tsx");
  assert.match(studio, /captureContextAtCommitRef\.current = currentContextRef\.current/);
  assert.match(studio, /captureContextAtCommitRef\.current !== currentContextRef\.current/);
  assert.match(studio, /requestContext !== currentContextRef\.current/);
  assert.match(studio, /captureContextAtCommitRef\.current !== requestContext/);
  assert.match(studio, /disabled=\{stopped \|\| pending \|\| stepIndex === 0\}/);
});

test("a late analysis response rechecks the current mic state before speaking", () => {
  const studio = read("src/routes/studio.tsx");
  const analyze = between(studio, "async function runAnalyze()", "const acceptCapture");
  assert.match(studio, /const micArmedRef = useRef\(false\)/);
  assert.match(
    studio,
    /micArmedRef\.current = true;\s*setMicArmed\(true\)/,
  );
  assert.match(analyze, /settings\.voice && !micArmedRef\.current/);
  assert.doesNotMatch(analyze, /settings\.voice && !micArmed\)/);
});

test("direct triage invalidates stale visual coaching before rendering or journaling", () => {
  const studio = read("src/routes/studio.tsx");
  const triageEffect = between(
    studio,
    'if (triage === "unanswered" || triage === "none") return;',
    "async function runAnalyze()",
  );
  assert.match(
    triageEffect,
    /analysisRequestRef\.current \+= 1[\s\S]*?setPending\(false\)[\s\S]*?setReport\(null\)[\s\S]*?setSavedReportRevision\(null\)[\s\S]*?setObservationReport\(/,
  );
  assert.match(
    studio,
    /disabled=\{!contextBoundReport \|\| !contextBoundObservationReport \|\| !reportRevision \|\| currentReportSaved\}/,
  );
});

test("only a verified pre-provider quota denial reopens a batch", () => {
  const analyze = read("src/lib/ai/analyze.ts");
  const preflight = analyze.indexOf("if (!grokProviderConfigured())");
  const reservation = analyze.indexOf("await consumeMediaBatch(");
  assert.ok(preflight >= 0 && preflight < reservation);
  assert.match(
    analyze.slice(preflight, reservation),
    /providerAttempted: false[\s\S]*?code: "AI_PROVIDER_UNAVAILABLE"[\s\S]*?retryableBeforeProvider: true/,
  );
  const rateLimit = between(analyze, "if (error instanceof RateLimitError)", "if (error instanceof MediaBatchReplayError)");
  assert.match(rateLimit, /providerAttempted: false/);
  assert.match(rateLimit, /retryableBeforeProvider: true/);

  const replay = between(analyze, "if (error instanceof MediaBatchReplayError)", "throw error");
  assert.match(replay, /providerAttempted: false/);
  assert.match(replay, /retryableBeforeProvider: false/);

  const studio = read("src/routes/studio.tsx");
  assert.match(
    studio,
    /if \(res\.retryableBeforeProvider && res\.providerAttempted === false\) \{\s*setAnalysisConsumed\(false\)/,
  );
  const caught = between(studio, "} catch (cause) {", "} finally {");
  assert.doesNotMatch(caught, /setAnalysisConsumed\(false\)/);
});

test("instructor-only entries cannot route into Studio", () => {
  const tie = read("src/routes/tie.$slug.tsx");
  assert.match(tie, /tie\.minutes\[1\] === 0[\s\S]*?Studio unavailable/);
  assert.doesNotMatch(tie, /Coach this in the studio/);

  const plan = read("src/routes/plan.tsx");
  assert.match(plan, /firstTie\.minutes\[1\] > 0/);
  assert.match(plan, /Instructor route · Studio unavailable/);

  const studio = read("src/routes/studio.tsx");
  assert.match(studio, /disabled=\{t\.minutes\[1\] === 0 \|\| blockedByIds/);
  assert.match(studio, /requestedTie && requestedTie\.minutes\[1\] > 0/);
});
