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
    assert.match(route, /playCoachVoice\([^\n]+, cloudVoice, \{ reviewed: true \}\)/, path);
    assert.match(route, /coachVoiceLabel\(cloudVoice\)/, path);
  }

  const settings = read("src/routes/settings.tsx");
  assert.match(settings, /if \(!event\.target\.checked\) clearCoachVoiceCache\(\)/);
  assert.match(settings, /uploadScopeLabel\(uploadScope\)/);
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
  assert.match(camera, /role="status"/);
  assert.match(camera, /aria-live="polite"/);
  assert.match(camera, /aria-atomic="true"/);
  assert.match(camera, /<details/);
  // A UX pass deleted these two caveats together with the assertions that
  // pinned them, so the suite stayed green while the preflight started reading
  // as a device check. The collapsible presentation is fine; the facts are not
  // optional.
  assert.match(camera, /not\s+device certification or safety\s+clearance/i);
  assert.match(camera, /decoding is\s+tested only after you select a file/i);
  assert.match(camera, /recording is\s+tested only when recording starts/i);
  assert.match(
    camera,
    /onClick=\{\(\) => void checkBrowserCapabilities\(\)\}[\s\S]{0,160}disabled=\{disabled\}[\s\S]{0,160}aria-disabled=\{disabled \|\| checkingCapabilities\}/,
  );
  assert.match(camera, /capabilityRequestRef\.current \+= 1/);
  assert.match(camera, /request === capabilityRequestRef\.current/);
  assert.match(camera, /aria-label="Live camera preview;/);
  assert.match(camera, /aria-label="Recording in progress"/);
  assert.match(camera, /aria-pressed=\{torch\}/);
  assert.match(camera, /scoreLivePreview/);
  assert.match(camera, /BURST_FRAME_COUNT/);
  assert.match(camera, /bestFrameIndices/);
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

test("studio burst waits for distinct frames, matches digital zoom, and does not double-fire Space", () => {
  const camera = read("src/components/camera-capture.tsx");
  assert.match(camera, /waitForNextVideoFrame\(v\)/);
  assert.match(camera, /processMediaFrame\(v, 1600, 240, 0\.82, null, digitalZoom, CAPTURE_PREVIEW_ASPECT\)/);
  const timer = between(camera, "async function snapWithOptionalTimer()", "async function changeZoom");
  assert.match(timer, /request !== cameraRequestRef\.current/);
  assert.match(timer, /setBusyState\(true\)/);
  const zoom = between(camera, "async function changeZoom", "snapWithOptionalTimerRef.current");
  assert.match(zoom, /await applyZoom\(stream, next\)/);
  assert.match(zoom, /if \(!ok\)/);
  assert.match(
    camera,
    /window\.addEventListener\("keydown", onKey\);[\s\S]*?\}, \[live, disabled\]\);/,
  );
  // Merged form of the two parallel scoping fixes (#32's Space-only button
  // check, #33's multi-target bail): one bail covers Space AND R, over the
  // union of interactive targets. Pin the union so neither half regresses.
  assert.match(
    camera,
    /closest\(\s*\n?\s*"button, a, input, textarea, select, summary, label, \[role='button'\], \[role='slider'\], \[contenteditable\]",?\s*\n?\s*\)/,
  );
  // Ctrl/Cmd+R must stay a refresh and Shift+Space a scroll, not a capture.
  assert.match(
    camera,
    /event\.ctrlKey \|\| event\.metaKey \|\| event\.altKey \|\| \(event\.shiftKey && event\.code === "Space"\)/,
  );
});

test("a cancelled photo import cannot commit after its decoder resolves", () => {
  const camera = read("src/components/camera-capture.tsx");
  const photoImport = between(
    camera,
    "const { jpeg, imageData, detailData } = await processMediaFrame(file",
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
  assert.match(analyze, /!mountedRef\.current \|\|[\s\S]*?useSession\.getState\(\)\.stopped/);
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
  // A tie, or a stale write, must resolve toward the restriction rather than
  // toward whichever tab wrote last, and an item that exists only in storage
  // must survive the merge instead of being deleted.
  assert.match(persistModule, /mineIsMorePermissive && !mineIsStrictlyNewer/);
  assert.match(persistModule, /if \(!seen\.has\(id\)\) merged\.push\(item\);/);
  assert.match(persistModule, /export function nextNegotiationStamp/);
  assert.match(store, /nextNegotiationStamp\(get\(\)\.items\.map\(\(i\) => i\.updatedAt\)\)/);
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
  assert.match(studio, /const studioVoice = settings\.voice && !voiceBlocked/);
  assert.match(studio, /if \(!studioVoice\) stopCoachVoice\(\)/);
  assert.match(studio, /voice=\{studioVoice\}/);
  assert.match(studio, /voice=\{studioVoice && !micArmed\}/);
  assert.match(studio, /disabled=\{stopped \|\| !studioVoice\}/);
  assert.match(studio, /disabled=\{cameraGateReason !== "enabled"\}/);
  assert.match(studio, /Export report/);
  assert.match(consentGate, /Step inside/);
  assert.match(consentGate, /We're both adults/);
  assert.match(
    studio,
    /event\.key !== null &&[\s\S]*?event\.key !== "knotty-negotiate" &&[\s\S]*?event\.key !== "knotty-settings"[\s\S]*?analysisRequestRef\.current \+= 1;[\s\S]*?stopCoachVoice\(\);[\s\S]*?window\.location\.reload\(\)/,
  );
  const contextInvalidation = between(studio, "if (contextChanged && capture)", "  }, [capture");
  assert.match(
    contextInvalidation,
    /stopCoachVoice\(\);\s*captureContextAtCommitRef\.current = null/,
  );
  assert.doesNotMatch(studio, /playCoachVoice\([^\n]+, settings\.voice\)/);
});

test("non-none triage invalidates stale visual coaching before rendering or journaling", () => {
  const studio = read("src/routes/studio.tsx");
  const triageEffect = between(
    studio,
    'if (triage === "none") return;',
    "async function runAnalyze()",
  );
  assert.match(
    triageEffect,
    /analysisRequestRef\.current \+= 1[\s\S]*?setPending\(false\)[\s\S]*?setReport\(null\)[\s\S]*?setSavedReportRevision\(null\)[\s\S]*?setObservationReport\(/,
  );
  assert.match(studio, /Export report/);
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
  // All four gates on the ?tie= deep link, in order. Accepts `requestedTie &&`
  // or `requestedTie != null &&`: the guard was extracted into a named const so
  // the ?step= deep link could be gated by the SAME value, and pinning the
  // literal token blocked that improvement rather than protecting the invariant.
  assert.match(
    studio,
    /negotiationReady &&[\s\S]{0,120}?requestedTie(?: != null)? &&[\s\S]*?requestedTie\.minutes\[1\] > 0 &&[\s\S]*?!negotiationPolicy\.isTieBlocked\(search\.tie\)/,
  );
  // A ?step= deep link must be gated by that same computed permission. Without
  // it a blocked or instructor-only tie could still have its step index set
  // from the URL, which is the deep-link hole this whole assertion exists for.
  if (/setStep\(search\.step\)/.test(studio)) {
    assert.match(
      studio,
      /requestedTieAllowed &&[\s\S]{0,240}?setStep\(search\.step\)/,
      "a ?step= deep link must reuse the ?tie= permission",
    );
  }
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

test("starting a new batch only claims a discard when work existed", () => {
  const camera = read("src/components/camera-capture.tsx");
  const startNew = between(camera, "function startNewBatch()", "function confirmedAtForBatch");
  assert.match(startNew, /onDiscard\(\)/);
  assert.match(startNew, /armBatchPermissions\(\)/);
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

test("the backgrounding hint tracks a real in-flight import, not any past one", () => {
  const camera = read("src/components/camera-capture.tsx");
  // The controller ref is never nulled, so testing it for null reported "in
  // flight" forever after the first import and every later app switch claimed
  // work had been lost.
  assert.match(camera, /const mediaOperationActiveRef = useRef\(false\)/);
  assert.match(camera, /const hadMediaOperation = mediaOperationActiveRef\.current;/);
  assert.doesNotMatch(camera, /hadMediaOperation = mediaOperationRef\.current !== null/);
  // Set when an operation starts, cleared when it settles and at every abort.
  assert.match(camera, /mediaOperationRef\.current = controller;\s*\n\s*mediaOperationActiveRef\.current = true;/);
  const aborts = camera.match(/mediaOperationRef\.current\?\.abort\(\);/g) ?? [];
  const clears = camera.match(/mediaOperationActiveRef\.current = false;/g) ?? [];
  assert.ok(
    clears.length >= aborts.length,
    `every abort site must clear the in-flight flag (${aborts.length} aborts, ${clears.length} clears)`,
  );
});

test("the clip-still commit cannot fire while a file import is validating", () => {
  const camera = read("src/components/camera-capture.tsx");
  // Validation now precedes clearing the pending stills, which leaves the
  // panel on screen during the read; the commit must be disabled in that
  // window or a tap commits stale stills and drops the chosen photo.
  assert.match(
    camera,
    /!selectedFrames\.length \|\| busy \|\| recording \|\| disabled \|\| !permissionsReady/,
  );
});

test("destructive confirmation cannot be satisfied by a double-tap", () => {
  const confirm = read("src/components/confirm-button.tsx");
  // A double-click/double-tap otherwise satisfies both presses at once, which
  // is the exact accidental input the guard exists to stop.
  assert.match(confirm, /export const MIN_CONFIRM_DWELL_MS = \d+;/);
  assert.match(confirm, /armedAt\.current = Date\.now\(\);/);
  assert.match(confirm, /Date\.now\(\) - armedAt\.current < MIN_CONFIRM_DWELL_MS/);
});

test("the mobile More sheet is keyboard operable and the sidebar cannot clip its tail", () => {
  const shell = read("src/components/app-shell.tsx");
  // The sheet's markup precedes its trigger, so without this focus walks past
  // it and out of the page; it is the only route to 13 destinations on a phone.
  assert.match(shell, /moreSheetRef\.current\?\.querySelector\("a"\)\?\.focus\(\)/);
  assert.match(shell, /event\.key !== "Escape"/);
  assert.match(shell, /moreButtonRef\.current\?\.focus\(\)/);
  // At 1280x800 the fixed sidebar clipped Rope calc, Emergency and Settings
  // below the viewport, and Settings holds the privacy controls.
  assert.match(shell, /aria-label="Main"[\s\S]{0,120}min-h-0[\s\S]{0,40}overflow-y-auto/);
});

test("an urgent search disposition reaches the screen without a second tap", () => {
  const page = read("src/routes/knowledge.tsx");
  // The action used to render only inside the submitted answer, so typing "she
  // cant breathe" reordered the result links and showed nothing else until the
  // user also pressed Find entries. Routing the query and then hiding the
  // result behind another tap is the failure the routing exists to prevent.
  // The banner must be gated on the disposition alone, never on `answer`.
  const banner = page.match(/\{actionFirst && \([\s\S]*?\n {6}\)\}/);
  assert.ok(banner, "the action banner is not rendered from actionFirst alone");
  assert.match(banner[0], /role="alert"/);
  assert.match(banner[0], /aria-live="assertive"/);
  assert.match(banner[0], /\{disposition\.action\}/);
  assert.match(banner[0], /disposition\.emergencyHref/);
  assert.doesNotMatch(banner[0], /\banswer\b/);
  // knowledgeAnswer prefixes the same action text; the submitted answer must
  // drop it rather than print it twice.
  assert.match(page, /answer\.startsWith\(disposition\.action\)/);
});

test("a cross-tab policy change cannot erase an active stop or a completed report", () => {
  const studio = read("src/routes/studio.tsx");
  // The session store is memory-only, so window.location.reload() clears
  // `stopped` along with the red alert, the report and the triage answer, and
  // Studio comes back looking like a fresh running session. Verified in a
  // browser both ways: without this guard the alert is gone after another tab
  // changes a limit. A stopped session already blocks every action, which is
  // stricter than anything a new policy could impose.
  const invalidate = between(studio, "const invalidateAcrossTabs", "window.addEventListener");
  assert.match(invalidate, /if \(useSession\.getState\(\)\.stopped\) return;/);
  assert.ok(
    invalidate.indexOf("stopped) return;") < invalidate.indexOf("window.location.reload()"),
    "the stop guard must precede the reload",
  );

  // A rehydrate replaces `items` with a new array even when every rank is
  // identical. Everything derived from it changed identity with it, which
  // re-ran the report effect and replaced a completed model report with the
  // local "not requested" one after the batch was already consumed.
  assert.match(studio, /const policyRef = useRef\(derivedPolicy\);/);
  assert.match(
    studio,
    /policyRef\.current\.negotiationKey !== derivedPolicy\.negotiationKey/,
  );
  assert.match(studio, /const negotiationPolicy = policyRef\.current;/);
});

test("check-in answers stay on screen at a narrow layout viewport", () => {
  const checkin = read("src/routes/checkin.tsx");
  // Buttons are whitespace-nowrap by default and these answer rows did not
  // wrap, so the concern answer — always the longer, second one — ran off the
  // edge: 7% clipped at 320px (a WCAG 1.4.10 reflow failure) and 88% hidden at
  // 195px, which is a 390px phone at 200% zoom. The all-clear answer was always
  // the one fully reachable, which is the wrong bias for a safety questionnaire.
  // The action row in the same file already used flex-wrap, so this was an
  // inconsistency rather than a decision.
  assert.equal(
    (checkin.match(/className="mt-2 flex gap-2"/g) ?? []).length,
    0,
    "an answer row is missing flex-wrap",
  );
  assert.ok(
    (checkin.match(/className="mt-2 flex flex-wrap gap-2"/g) ?? []).length >= 2,
    "both answer rows must wrap",
  );
  // Sentence-length labels must be allowed to wrap rather than overflow.
  assert.match(checkin, /className="h-auto whitespace-normal py-2 text-left"/);
});

test("the emergency card stays offered when the account boundary blocks the app", () => {
  const provider = read("src/lib/auth/provider.tsx");
  // /emergency already bypasses this gate, but neither the failure screen nor
  // the waiting screen said so: a transient session or network failure replaced
  // the whole app and left "Retry secure erase" as the only way forward, and a
  // hung check left a status line and nothing else.
  assert.match(provider, /state\.location\.pathname === "\/emergency"/);
  const failure = between(provider, "function AccountBoundaryFailure", "\n}\n");
  assert.match(failure, /href="\/emergency"/);
  const status = between(provider, "function AccountBoundaryStatus", "\n}\n");
  assert.match(status, /href="\/emergency"/);
  // Plain anchors, not router Links: the router is not necessarily usable here.
  assert.doesNotMatch(failure, /<Link/);
  assert.doesNotMatch(status, /<Link/);
});

test("camera preflight waits for Step inside, not the account-boundary main", () => {
  const smoke = read("scripts/camera-preflight-smoke.mjs");
  assert.doesNotMatch(smoke, /page\.locator\("main"\)\.waitFor/);
  assert.match(smoke, /Open live camera/);
  assert.match(smoke, /account-boundary gate also renders a <main>/);
});

test("the elapsed direct-check reminder is announced, not just drawn", () => {
  const studio = read("src/routes/studio.tsx");
  assert.match(studio, /function CirculationBanner[\s\S]*<div role="status" aria-live="polite">/);
  assert.match(studio, /function CirculationBanner[\s\S]*\{!due \? null : \(/);
  assert.doesNotMatch(studio, /function CirculationBanner[\s\S]*aria-live="assertive"/);
});

test("the media upload scope is an operator setting with a conservative default", () => {
  const scopeModule = read("src/lib/media-scope.ts");
  // A deployment that never sets it must get the tightest setting: an operator
  // who has not read the provider's policy has not agreed to anything.
  assert.match(scopeModule, /DEFAULT_MEDIA_UPLOAD_SCOPE: MediaUploadScope = "non_explicit"/);
  // Read from the build flag carrier, not from user-editable app state — this
  // is a question about the provider's policy, not about any one batch.
  assert.match(scopeModule, /import\.meta\.env\?\.VITE_MEDIA_UPLOAD_SCOPE/);
  assert.match(scopeModule, /process\?\.env\?\.VITE_MEDIA_UPLOAD_SCOPE/);

  const search = read("src/lib/kb/search.ts");
  // Only the nudity term list is gated on the scope. Sexual activity, and the
  // age and consent guards, must not consult it at all.
  assert.match(search, /const explicitMedia = sexualActivityMedia \|\| \(nudityMedia && !allowsAdultNudity\(scope\)\)/);
  const ageGuard = between(search, "const ambiguousAgeMedia =", "const explicitScanText");
  assert.doesNotMatch(ageGuard, /scope|allowsAdultNudity/);
  const consentGuard = between(search, "const secretOrCoercedRecording =", "const mediaContext");
  assert.doesNotMatch(consentGuard, /scope|allowsAdultNudity/);

  // The capture panel states the setting in force rather than a fixed rule.
  const camera = read("src/components/camera-capture.tsx");
  assert.match(camera, /const scope = mediaUploadScope\(\);/);
  assert.match(camera, /armBatchPermissions\(\)/);
  assert.match(camera, /withinUploadScope: true/);
  // The batch carries which wording was attested, not a single bit that
  // meant the same thing under both settings.
  assert.match(camera, /scope,/);
  // File-imported photos use the native-scale crop for focus, same as live
  // capture and video stills. Scoring the 240px downscale alone understates blur.
  assert.match(camera, /const \{ jpeg, imageData, detailData \} = await processMediaFrame/);
  assert.match(camera, /scoreFrame\(imageData, detailData\)/);

  // The server knows which attestation was made and builds the prompt from
  // the deployment's actual scope. A stale client or a widened request fails.
  const analyze = read("src/lib/ai/analyze.ts");
  const analyzeConsent = read("src/lib/ai/analyze-consent.ts");
  assert.match(analyze, /scope: z\.enum\(\["non_explicit", "adult_nudity"\]\)/);
  assert.match(analyze, /verifyBatchConsentScope\(parsed\.consent\.scope\)/);
  assert.match(analyze, /withinUploadScope: z\.literal\(true\)/);
  assert.match(analyzeConsent, /function buildSystemPrompt\(scope: MediaUploadScope\)/);
  assert.match(analyze, /content: buildSystemPrompt\(mediaUploadScope\(\)\)/);
  assert.match(
    analyzeConsent,
    /The media may include nudity of consenting adults; explicit sexual activity is out of scope/,
  );

  const nyx = read("src/lib/learn/nyx-model.ts");
  assert.match(nyx, /NYX_SHIBARI/);
  const coach = read("src/components/learn/academy-coach-panel.tsx");
  assert.match(coach, /NyxModelPanel/);
  assert.match(coach, /NyxNudeStrip/);
  assert.match(read("src/lib/learn/nyx-nudes.ts"), /NYX_NUDE_POSES/);
});

test("the tie-page practice cam stays local and waits for the photos limit", () => {
  // A second, ungated camera-and-analyze path on the taught pages used to
  // fabricate every per-batch attestation and mint a non-UUID batch id. A
  // later UX pass swapped the negotiated photos gate for the home consent
  // checkbox and rewrote this test to bless it — the adult gate answers "is
  // an adult present", not "did these people agree to a lens", and the README
  // promises the photos limit gates the whole camera path.
  const observe = read("src/components/learn/academy-observe-panel.tsx");
  assert.doesNotMatch(observe, /analyzeRope/);
  assert.doesNotMatch(observe, /adults:\s*true/);
  assert.match(observe, /photosApproved/);
  assert.match(observe, /item\.id === "photos" && item\.rank === "yes"/);
  // The gate must be the negotiated limit, not the front-door checkbox.
  assert.doesNotMatch(observe, /cameraAllowed = hydrated && (?:studioConsented|s\.consented)/);
  assert.match(observe, /Continue in Studio/);
  assert.match(observe, /startCamera\(facing === "environment" \? "user" : "environment"\)/);

  const studio = read("src/routes/studio.tsx");
  // Plain "yellow" stays armed even when a custom yellow word is set.
  assert.match(studio, /\[settings\.safeword, settings\.yellowWord, "red", "yellow"\]/);
});

test("the client batch-permission window stays inside the server replay reservation", () => {
  // The shared Postgres reservation rejects a duplicate batch for two hours
  // precisely so that it outlives every permission the client still treats as
  // fresh (README: "exceeding the one-hour permission window"). A revision
  // quadrupled the client window to four hours, inverting that: a three-hour
  // batch read as confirmed on the page after its replay protection had
  // lapsed on the server. Pin both numbers and their relationship.
  const capture = read("src/components/camera-capture.tsx");
  const replay = read("src/lib/ai/media-replay-core.ts");

  const windowMatch = capture.match(/BATCH_PERMISSION_MAX_AGE_MS = ([0-9*_ ]+);/);
  assert.ok(windowMatch, "BATCH_PERMISSION_MAX_AGE_MS must be a literal product");
  const permissionWindowMs = Function(`"use strict"; return (${windowMatch[1]});`)();

  const ttlMatches = [...replay.matchAll(/options\.ttlMs \?\? ([0-9*_ ]+),/g)];
  assert.ok(ttlMatches.length >= 2, "both replay helpers must default ttlMs");
  for (const ttl of ttlMatches) {
    const reservationMs = Function(`"use strict"; return (${ttl[1]});`)();
    assert.ok(
      permissionWindowMs < reservationMs,
      `client permission window (${permissionWindowMs}ms) must stay below the server reservation (${reservationMs}ms)`,
    );
  }
  assert.equal(permissionWindowMs, 60 * 60 * 1000, "the documented window is one hour");
});

test("the consent gate names where Analyze sends stills", () => {
  // "Analyze runs only when you tap it" hid the recipient; naming xAI at the
  // gate is the disclosure the tap-to-send promise rests on.
  const gate = read("src/components/consent-gate.tsx");
  assert.match(gate, /sends your selected stills to xAI only when you\s+tap it/);
  assert.match(gate, /never in the background/);
});

test("tie page gates guided steps behind negotiated limits; auto-voice survives re-renders", () => {
  const tiePage = read("src/routes/tie.$slug.tsx");
  // README: a guided tie "stays blocked — in Studio and on the tie page —
  // until that limit is set to yes". tieLimitIds' docstring promised this
  // call site from the start; the page had never wired it in, so the karada
  // taught in full with torso at no.
  assert.match(tiePage, /shape === "guided" \? missingTieLimits\(slug, negotiationItems\) : \[\]/);
  // Blocked state withholds the steps AND the coach panel (practice cam).
  assert.match(tiePage, /\{limitsAgreed && </);
  assert.match(tiePage, /!limitsAgreed \? null :/);
  // The blocked card routes to the fix rather than just refusing.
  assert.match(tiePage, /to="\/negotiate"/);

  // Auto-read narration keys on real transitions (step, voice, toggle) — not
  // on the identity of a step object rebuilt every render, which ran the
  // cleanup on the first re-render and stopped the voice mid-sentence with
  // no restart.
  const voice = read("src/components/learn/use-academy-voice.ts");
  assert.match(voice, /\}, \[enabled, stepIndex, cloudVoice\]\);/);
  assert.doesNotMatch(voice, /\}, \[enabled, input, cloudVoice\]\);/);

  // Stem x follows the same fraction-or-raw convention as the y axes: the
  // stem drill authors x: 0.5 meaning centred, which used to draw at the
  // figure's far-left edge.
  const figure = read("src/components/rope-figure.tsx");
  assert.match(figure, /rawX < 2 \? rawX \* \(floor \? 400 : 200\) : rawX/);
});

test("hard-no lines share one bound end to end; the stop banner names every reason", () => {
  const studio = read("src/routes/studio.tsx");
  const analyze = read("src/lib/ai/analyze.ts");
  // One constant governs the client's construction, the schema's admission,
  // and the server's sanitize pass. The old 80/24 pair rejected the client's
  // own "<uuid>: <label>" lines (stranding one-use batches) and silently
  // dropped entries past 24 of a possible 64.
  assert.match(studio, /`\$\{item\.id\}: \$\{item\.label\}`\.slice\(0, MAX_HARD_NO_LENGTH\)/);
  assert.match(analyze, /z\.array\(z\.string\(\)\.max\(MAX_HARD_NO_LENGTH\)\)\.max\(MAX_HARD_NOS\)/);
  assert.match(analyze, /sanitizeQuestion\(value, MAX_HARD_NO_LENGTH\)/);
  assert.match(analyze, /\.slice\(0, MAX_HARD_NOS\)/);
  assert.doesNotMatch(analyze, /\.slice\(0, 24\)/);

  // A triage, observation, or check-in stop must not read "Stopped manually"
  // at exactly the moment the reason matters.
  for (const reason of ["observation", "medical-emergency", "medical", "checkin-concern", "consent"]) {
    assert.match(studio, new RegExp(`stopReason === "${reason}"`), `banner must map ${reason}`);
  }
});

test("the banned-output scrub guards model text, not reviewed catalog narration", () => {
  // Authored safety copy legitimately names dangers to warn against them
  // ("never let it run away into a noose", the neck-lock notices). The scrub
  // swapped those lines for the generic refusal paragraph, spoken aloud
  // mid-lesson. Reviewed provenance is declared at the call site; the
  // server's exact-string allowlist stays the control for cloud TTS.
  const play = read("src/lib/voice/play.ts");
  assert.match(play, /options\?: \{ reviewed\?: boolean \}/);
  assert.match(play, /const key = !reviewed && textIsBanned\(text\) \? scrubBannedAnswer\(text\) : text\.trim\(\);/);

  // Catalog narration call sites declare provenance; the model-report paths
  // (coach panel, studio report speak) deliberately do not.
  const voiceHook = read("src/components/learn/use-academy-voice.ts");
  assert.equal((voiceHook.match(/\{ reviewed: true \}/g) ?? []).length, 3);
  assert.match(read("src/routes/tie.$slug.tsx"), /playCoachVoice\(s\.speak, cloudVoice, \{ reviewed: true \}\)/);
  assert.match(read("src/routes/knot.$slug.tsx"), /playCoachVoice\(s\.speak, cloudVoice, \{ reviewed: true \}\)/);
  const coachPanel = read("src/components/coach-panel.tsx");
  assert.doesNotMatch(coachPanel, /reviewed: true/);
  const studio = read("src/routes/studio.tsx");
  assert.doesNotMatch(studio, /playCoachVoice\(res\.report\.final\.speak, true, \{ reviewed: true \}\)/);

  // Server side: the allowlist is the sole gate — no scrub ahead of it that
  // could mangle a reviewed line out of the set — and the input slice admits
  // the longest composed narration.
  const voiceFn = read("src/lib/ai/voice.ts");
  assert.doesNotMatch(voiceFn, /scrubBannedAnswer/);
  assert.match(voiceFn, /\.slice\(0, MAX_REVIEWED_SPEECH_LENGTH\)/);
  assert.match(voiceFn, /isReviewedCoachSpeech/);

  // The lesson pages and the allowlist compose narration through the same
  // builders, so they cannot drift apart.
  const reviewed = read("src/lib/voice/reviewed.server.ts");
  for (const builder of ["tieStepVoiceInput", "knotStepVoiceInput", "buildAcademyVoiceScript", "buildAcademyVoiceSegments"]) {
    assert.match(reviewed, new RegExp(builder), `allowlist must use ${builder}`);
  }
  assert.match(read("src/routes/tie.$slug.tsx"), /tieStepVoiceInput\(s, step, tie\.steps\.length\)/);
  assert.match(read("src/routes/knot.$slug.tsx"), /knotStepVoiceInput\(s, step, knot\.steps\.length\)/);
});

test("every persisted store has crash-safe storage and consent survives stale tabs", () => {
  // learn-progress was the one store on zustand's default storage, so a
  // quota-exhausted save threw out of markStepComplete/setLast and crashed
  // the lesson route without ever reaching the persist-failure banner.
  const learn = read("src/lib/stores/learn-progress.ts");
  assert.match(learn, /storage: safeJsonStorage<LearnProgressState>\(\)/);

  // The consent-bearing settings flags move as one stamped unit through a
  // write-merge, like negotiation ranks and journal entries already do.
  const settings = read("src/lib/stores/settings.ts");
  assert.match(settings, /storage: settingsConsentMergingStorage<SettingsState>\("knotty-settings"\)/);
  assert.match(settings, /consentStamp: nextConsentStamp\(s\)/);
  const persist = read("src/lib/stores/persist.ts");
  assert.match(persist, /export function settingsConsentMergingStorage/);
});

test("the capture panel states the upload scope in force on every batch", () => {
  // README §Upload scope: "The capture panel states the setting in force."
  // The scope strings existed and were referenced only by tests; the panel
  // itself never told the user what this deployment's batch may contain.
  const camera = read("src/components/camera-capture.tsx");
  assert.match(camera, /\{uploadScopeCapturePreference\(scope\)\}/);
});
