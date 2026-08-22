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
  assert.match(accept, /stopCoachVoice\(\)/);
  const discard = between(studio, "const discardCapture", "const spoke");
  assert.match(discard, /analysisRequestRef\.current \+= 1;\s*stopCoachVoice\(\)/);

  const camera = read("src/components/camera-capture.tsx");
  assert.match(camera, /setBatchCommitted\(true\)/);
  assert.match(camera, /permissionExpiryTimerRef\.current = window\.setTimeout/);
  assert.match(studio, /disabled=\{cameraGateReason !== "enabled"\}/);
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
  assert.equal((studio.match(/disabled=\{stopped \|\| pending\}/g) ?? []).length, 2);
});

test("late analysis responses cannot survive unmount or withdrawn voice approval", () => {
  const studio = read("src/routes/studio.tsx");
  const analyze = between(studio, "async function runAnalyze()", "const acceptCapture");
  assert.match(studio, /const micArmedRef = useRef\(false\)/);
  assert.match(studio, /const mountedRef = useRef\(true\)/);
  assert.match(studio, /micArmedRef\.current = true;\s*setMicArmed\(true\)/);
  assert.match(
    studio,
    /mountedRef\.current = false;[\s\S]*?analysisRequestRef\.current \+= 1;[\s\S]*?captureContextAtCommitRef\.current = null;[\s\S]*?stopCoachVoice\(\)/,
  );
  assert.match(analyze, /!mountedRef\.current \|\|[\s\S]*?liveNegotiationPolicy\.mediaBlocked/);
  assert.match(
    analyze,
    /useSettings\.getState\(\)\.voice &&[\s\S]*?!liveNegotiationPolicy\.voiceBlocked &&[\s\S]*?!micArmedRef\.current/,
  );
  assert.doesNotMatch(analyze, /studioVoice && !micArmed\)/);
  assert.match(analyze, /mountedRef\.current && request === analysisRequestRef\.current/);
});

test("Studio requires yes for negotiated actions and blocks every voice path", () => {
  const studio = read("src/routes/studio.tsx");
  const policy = read("src/lib/studio/negotiation.ts");
  const store = read("src/lib/stores/negotiate.ts");
  const consentGate = read("src/components/consent-gate.tsx");
  assert.match(policy, /normalizeNegotiationItems\(items\)/);
  assert.match(policy, /normalizedItems\.filter\(\(item\) => item\.rank !== "yes"\)/);
  assert.match(policy, /mediaBlocked: !approvedIds\.has\("photos"\)/);
  assert.match(policy, /voiceBlocked: !approvedIds\.has\("voice"\)/);
  assert.match(policy, /negotiationKey: JSON\.stringify\(negotiationEntries\)/);
  assert.match(store, /export function normalizeNegotiationItems\(value: unknown\)/);
  assert.match(
    store,
    /matches\.length === 1 && matches\[0\]\.label && !LOCKED_NO\.has\(seed\.id\)/,
  );
  const merge = between(store, "merge: (persisted, current) =>", "      },\n    },");
  assert.match(merge, /\.\.\.current/);
  assert.doesNotMatch(merge, /\.\.\.p[,}]/);
  // The negotiation store uses the stamp-merging storage, which wraps
  // safeJsonStorage: it must still never throw on a corrupt blob, and it must
  // additionally resolve per item on write so a stale tab cannot resurrect a
  // revoked rank.
  assert.match(store, /storage: negotiationMergingStorage<State>\("knotty-negotiate"\)/);
  const persistModule = read("src/lib/stores/persist.ts");
  assert.match(persistModule, /export function negotiationMergingStorage/);
  assert.match(persistModule, /const base = safeJsonStorage<State>\(\);/);
  assert.match(persistModule, /stamp\(other\) > stamp\(item\)/);
  assert.match(store, /migrate: \(persisted\) => persisted as State/);
  assert.match(studio, /buildStudioNegotiationPolicy\(items\)/);
  assert.match(studio, /const \[negotiationReady, setNegotiationReady\] = useState\(false\)/);
  assert.doesNotMatch(studio, /useState\(\(\) =>\s*useNegotiate\.persist\.hasHydrated\(\)\s*\)/);
  assert.match(studio, /useNegotiate\.persist[\s\S]*?onFinishHydration\(finish\)/);
  const hydration = between(studio, "const api = useNegotiate.persist", "useEffect(() => {");
  assert.match(hydration, /api\.hasHydrated\(\)/);
  assert.doesNotMatch(hydration, /setTimeout/);
  const consentHydration = between(consentGate, "const api = useSettings.persist", "  }, []);");
  assert.match(consentHydration, /api\.onFinishHydration\(finish\)/);
  assert.match(consentHydration, /api\.hasHydrated\(\)/);
  assert.doesNotMatch(consentHydration, /setTimeout/);
  assert.match(
    studio,
    /mediaBlocked: negotiatedMediaBlocked,[\s\S]*?const mediaBlocked = !negotiationReady \|\| negotiatedMediaBlocked/,
  );
  assert.match(studio, /const mediaAllowed = negotiationReady && !negotiatedMediaBlocked/);
  assert.match(studio, /const previousMediaAllowedRef = useRef\(mediaAllowed\)/);
  assert.match(studio, /mediaAuthorizationWasRevoked\(previouslyAllowed, mediaAllowed\)/);
  assert.doesNotMatch(studio, /if \(negotiationReady && negotiatedMediaBlocked\)/);
  assert.match(studio, /disabled=\{!negotiationReady\}/);
  assert.match(studio, /const studioVoice = settings\.voice && !voiceBlocked/);
  assert.match(studio, /if \(!studioVoice\) stopCoachVoice\(\)/);
  assert.match(studio, /voice=\{studioVoice\}/);
  assert.match(studio, /voice=\{studioVoice && !micArmed\}/);
  assert.match(studio, /disabled=\{stopped \|\| !studioVoice\}/);
  assert.match(studio, /data-negotiation-ready=\{negotiationReady \? "true" : "false"\}/);
  assert.match(studio, /data-media-blocked=\{negotiatedMediaBlocked \? "true" : "false"\}/);
  assert.match(studio, /data-camera-ready=/);
  assert.match(studio, /data-camera-gate-reason=\{cameraGateReason\}/);
  assert.match(
    studio,
    /event\.key !== null &&[\s\S]*?event\.key !== "knotty-negotiate" &&[\s\S]*?event\.key !== "knotty-settings"[\s\S]*?analysisRequestRef\.current \+= 1;[\s\S]*?stopCoachVoice\(\);[\s\S]*?window\.location\.reload\(\)/,
  );
  const negotiatedRevocation = between(
    studio,
    "if (!mediaAuthorizationWasRevoked(previouslyAllowed, mediaAllowed)) return;",
    "  }, [mediaAllowed]",
  );
  assert.match(negotiatedRevocation, /analysisRequestRef\.current \+= 1;\s*stopCoachVoice\(\)/);
  const contextInvalidation = between(studio, "if (contextChanged && capture)", "  }, [capture");
  assert.match(
    contextInvalidation,
    /stopCoachVoice\(\);\s*captureContextAtCommitRef\.current = null/,
  );
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
  const chooseTriage = between(studio, "function chooseTriage", "async function runAnalyze()");
  assert.match(
    chooseTriage,
    /analysisRequestRef\.current \+= 1;[\s\S]*?stopCoachVoice\(\);[\s\S]*?setPending\(false\);/,
  );
  assert.match(chooseTriage, /if \(next !== "none"\) \{[\s\S]*?stopSession\(/);
  assert.equal((studio.match(/onChange=\{\(\) => chooseTriage\(/g) ?? []).length, 4);
  assert.match(
    studio,
    /disabled=\{\s*!contextBoundReport\s*\|\|\s*!contextBoundObservationReport\s*\|\|\s*!reportRevision\s*\|\|\s*currentReportSaved\s*\}/,
  );
});

test("only verified pre-reservation admission denials reopen a batch", () => {
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
      reservation < provider &&
      quota < provider &&
      authorization < provider,
  );
  assert.match(
    analyze.slice(preflight, reservation),
    /providerAttempted: false[\s\S]*?code: "AI_PROVIDER_UNAVAILABLE"[\s\S]*?retryableBeforeProvider: true/,
  );
  const privacy = analyze.slice(provider, analyze.indexOf("if (!grok.ok) {", provider));
  assert.match(
    privacy,
    /privacyFailure === "preflight"[\s\S]*?providerAttempted: false[\s\S]*?retryableBeforeProvider: false/,
  );
  assert.match(
    privacy,
    /privacyFailure === "response"[\s\S]*?providerAttempted: true[\s\S]*?AI_PRIVACY_RESPONSE_UNVERIFIED[\s\S]*?retryableBeforeProvider: false/,
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
  assert.match(
    studio,
    /requestedTie &&[\s\S]*?requestedTie\.minutes\[1\] > 0 &&[\s\S]*?!negotiationPolicy\.isTieBlocked\(search\.tie\)/,
  );
});

test("a rejected file import cannot destroy the pending clip-still selection", () => {
  const camera = read("src/components/camera-capture.tsx");
  const onFile = between(camera, "async function onFile(file: File", "async function toggleTorch");
  // Validation must complete before the pending selection is cleared, else an
  // unsupported or oversized pick discards stills only a re-recording restores.
  assert.match(
    onFile,
    /validateMediaFile\(file, actualKind\);[\s\S]*?await validateMediaSignature\([\s\S]*?setVideoFrames\(\[\]\)/,
  );
  assert.doesNotMatch(
    between(onFile, "async function onFile", "validateMediaFile("),
    /setVideoFrames\(\[\]\)/,
  );
});

test("file-kind recovery works in both directions", () => {
  const camera = read("src/components/camera-capture.tsx");
  assert.match(
    camera,
    /file\.type\.startsWith\("video\/"\)[\s\S]{0,120}file\.type\.startsWith\("image\/"\)/,
  );
});

test("torch toggling is single-flight because setTorch tears down the stream itself", () => {
  const camera = read("src/components/camera-capture.tsx");
  const toggle = between(camera, "async function toggleTorch()", "return (");
  assert.match(toggle, /if \(torchBusyRef\.current\) return;/);
  assert.match(toggle, /torchBusyRef\.current = true;/);
  assert.match(toggle, /finally \{[\s\S]*?torchBusyRef\.current = false;/);
});

test("the recorder budget and the import cap share one constant", () => {
  const stream = read("src/lib/camera/stream.ts");
  const camera = read("src/components/camera-capture.tsx");
  assert.match(stream, /const maxBytes = MAX_VIDEO_BYTES;/);
  assert.doesNotMatch(stream, /100 \* 1024 \* 1024/);
  assert.doesNotMatch(camera, /100 \* 1024 \* 1024/);
  assert.match(camera, /file\.size > MAX_VIDEO_BYTES/);
});

test("withdrawing an attestation only claims a discard when work existed", () => {
  const camera = read("src/components/camera-capture.tsx");
  const withdraw = between(camera, "if (!checked) {", "function startNewBatch");
  assert.match(withdraw, /const hadPendingWork =/);
  assert.match(withdraw, /if \(hadPendingWork\) \{[\s\S]*?onDiscard\(\);/);
});

test("every test file on disk is registered in an npm test script", async () => {
  const { readdirSync, statSync } = await import("node:fs");
  const pkg = JSON.parse(read("package.json"));
  // Platform-owned chrome that this app must not modify. Its injector resolves
  // src/lib/og/site.json from process.cwd(), so 8 of its 47 cases assert
  // template defaults and fail from the repo root. Excluded deliberately, not
  // by omission; every app-owned test file must still be registered.
  const PLATFORM_OWNED = ["scripts/grok-pwa-plugin.test.mjs"];
  const registered = [
    pkg.scripts["test:scripts"],
    pkg.scripts["test:typed-core"],
    pkg.scripts["test:stores"],
  ].join(" ");

  const found = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      if (entry === "node_modules" || entry.startsWith(".")) continue;
      const full = `${dir}/${entry}`;
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.test\.(mjs|ts)$/.test(entry)) found.push(full.replace(/^\.\//, ""));
    }
  };
  walk("scripts");
  walk("src");

  const missing = found
    .filter((file) => !PLATFORM_OWNED.includes(file))
    .filter((file) => !registered.includes(file));
  assert.deepEqual(
    missing,
    [],
    `these test files exist but no npm script runs them: ${missing.join(", ")}`,
  );
});
