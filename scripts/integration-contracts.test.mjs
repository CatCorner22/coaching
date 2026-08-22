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

test("camera capability preflight stays passive and cannot certify a device or scene", () => {
  const camera = read("src/components/camera-capture.tsx");
  const preflight = between(
    camera,
    "async function checkBrowserCapabilities()",
    "function clearRecordTimer()",
  );
  assert.match(preflight, /inspectCameraCapabilities\(/);
  assert.doesNotMatch(preflight, /getUserMedia|enumerateDevices|openRopeCamera|startLive/);
  assert.match(camera, /Check browser capabilities — camera stays off/);
  assert.match(camera, /not\s+device certification or safety\s+clearance/i);
  assert.match(camera, /file decoding is tested only after you select a file/i);
  assert.match(camera, /recording\s+is\s+tested only when recording starts/i);
  assert.match(camera, /role="status"/);
  assert.match(camera, /aria-live="polite"/);
  assert.match(camera, /aria-atomic="true"/);
  assert.match(
    camera,
    /onClick=\{\(\) => void checkBrowserCapabilities\(\)\}[\s\S]{0,160}disabled=\{disabled\}[\s\S]{0,160}aria-disabled=\{disabled \|\| checkingCapabilities\}/,
  );
  assert.match(camera, /capabilityRequestRef\.current \+= 1/);
  assert.match(camera, /request === capabilityRequestRef\.current/);
  assert.match(camera, /aria-label="Live camera preview;/);
  assert.match(camera, /aria-label="Recording in progress"/);
  assert.match(camera, /aria-pressed=\{torch\}/);
});

test("route registration and the preview bridge keep heavy knowledge and schema graphs lazy", () => {
  const nerves = read("src/routes/nerves.tsx");
  assert.doesNotMatch(nerves, /from "@\/lib\/kb"/);
  assert.match(nerves, /from "@\/lib\/kb\/nerves"/);
  assert.match(nerves, /from "@\/lib\/kb\/ties"/);

  const bridge = read("src/lib/preview-host-bridge.ts");
  assert.doesNotMatch(bridge, /from "zod"/);
  assert.match(bridge, /parsePreviewHostMessage\(event\.data\)/);
});

test("a cancelled photo import cannot commit after its decoder resolves", () => {
  const camera = read("src/components/camera-capture.tsx");
  const photoImport = between(
    camera,
    "const { jpeg, imageData } = await processMediaFrame(file",
    "} catch (e) {",
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
  assert.match(studio, /micArmedRef\.current = true;\s*setMicArmed\(true\)/);
  assert.match(analyze, /studioVoice && !micArmedRef\.current/);
  assert.doesNotMatch(analyze, /studioVoice && !micArmed\)/);
});

test("Studio requires yes for negotiated actions and blocks every voice path", () => {
  const studio = read("src/routes/studio.tsx");
  const policy = read("src/lib/studio/negotiation.ts");
  assert.match(policy, /items\.filter\(\(item\) => item\.rank !== "yes"\)/);
  assert.match(policy, /mediaBlocked: operationalLimitIds\.has\("photos"\)/);
  assert.match(policy, /voiceBlocked: operationalLimitIds\.has\("voice"\)/);
  assert.match(studio, /buildStudioNegotiationPolicy\(items\)/);
  assert.match(studio, /useNegotiate\.persist\.hasHydrated\(\)/);
  assert.match(studio, /useNegotiate\.persist[\s\S]*?onFinishHydration\(finish\)/);
  assert.match(
    studio,
    /const mediaBlocked = !negotiationReady \|\| negotiationPolicy\.mediaBlocked/,
  );
  assert.match(studio, /disabled=\{!negotiationReady\}/);
  assert.match(studio, /const studioVoice = settings\.voice && !voiceBlocked/);
  assert.match(studio, /if \(!studioVoice\) stopCoachVoice\(\)/);
  assert.match(studio, /voice=\{studioVoice\}/);
  assert.match(studio, /voice=\{studioVoice && !micArmed\}/);
  assert.match(studio, /disabled=\{stopped \|\| !studioVoice\}/);
  assert.doesNotMatch(studio, /playCoachVoice\([^\n]+, settings\.voice\)/);
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
    /disabled=\{\s*!contextBoundReport\s*\|\|\s*!contextBoundObservationReport\s*\|\|\s*!reportRevision\s*\|\|\s*currentReportSaved\s*\}/,
  );
});

test("only verified pre-provider admission denials reopen a batch", () => {
  const analyze = read("src/lib/ai/analyze.ts");
  const preflight = analyze.indexOf('if (data.triage === "none" && !grokProviderConfigured())');
  const authorization = analyze.indexOf("await authorizeAiRequest(context.userId)");
  const reservation = analyze.indexOf("await consumeMediaBatch(");
  const quota = analyze.indexOf('consumeAiBudget("vision"');
  const provider = analyze.indexOf("const grok = await grokChat(");
  assert.ok(
    preflight >= 0 &&
      preflight < authorization &&
      authorization < reservation &&
      authorization < quota &&
      authorization < provider,
  );
  assert.match(
    analyze.slice(preflight, reservation),
    /providerAttempted: false[\s\S]*?code: "AI_PROVIDER_UNAVAILABLE"[\s\S]*?retryableBeforeProvider: true/,
  );
  const rateLimit = between(
    analyze,
    "if (error instanceof RateLimitError)",
    "if (error instanceof MediaBatchReplayError)",
  );
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
  assert.match(studio, /disabled=\{t\.minutes\[1\] === 0 \|\| negotiationPolicy\.isTieBlocked/);
  assert.match(studio, /requestedTie && requestedTie\.minutes\[1\] > 0/);
});
