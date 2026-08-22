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
    /await consumeMediaBatch\(authorization\.userId, data\.consent\.batchId, \(\) => \{\s*consumeAiBudget\(/,
  );
  assert.doesNotMatch(source, /consumeAiBudget\([^;]+;\s*consumeMediaBatch\(/);
});

test("auth routes, production validation, and provider capability discovery are wired", () => {
  const route = read("src/routes/api/auth/$.ts");
  const server = read("src/lib/auth/server.ts");
  const capability = read("src/lib/auth/capabilities.ts");
  const login = read("src/routes/login.tsx");
  assert.match(route, /GET:[\s\S]*?auth\.handler\(request\)/);
  assert.match(route, /POST:[\s\S]*?auth\.handler\(request\)/);
  assert.match(server, /assertProductionAuthEnvironment\(\s*process\.env/);
  assert.match(capability, /gateIdentityEnabled\(\)/);
  assert.match(capability, /oauthProviders: authConfigured/);
  assert.match(login, /capabilities\.oauthProviders/);
});

test("the compile-time dev-server boundary owns PGLite and server-injected preview credentials", () => {
  const db = read("src/lib/db.ts");
  const auth = read("src/lib/auth/server.ts");
  const aiGuard = read("src/lib/ai/guard.server.ts");
  const connector = read("src/lib/app-data/client.server.ts");
  const config = read("src/lib/auth/config.ts");
  const vite = read("vite.config.ts");
  const workflow = read(".github/workflows/ci.yml");

  assert.match(vite, /__KNOTTY_DEV_SERVER__:[\s\S]*?command === "serve" && isPreview !== true/);
  assert.match(db, /selectDatabaseSource\([\s\S]*?viteDevServer/);
  assert.match(db, /DATABASE_URL is required for server-side database use in production/);
  assert.match(db, /if \(viteDevServer\) return createPgliteSql\(\)/);
  assert.doesNotMatch(db, /__pgBootstrapPromise__/);
  assert.doesNotMatch(auth, /void ensureDbReady\(\)/);
  assert.match(auth, /const production = !viteDevServer/);
  assert.match(auth, /env\("GROK_PREVIEW_CLIENT_SECRET"\)/);
  assert.doesNotMatch(
    read("src/lib/auth/preview.ts"),
    /export const PREVIEW_CLIENT_SECRET|[a-f0-9]{64}/i,
  );
  assert.match(auth, /: viteDevServer[\s\S]*?pgliteDialect/);
  assert.match(auth, /rateLimit: \{ enabled: true, window: 60, max: 100 \}/);
  assert.match(aiGuard, /userId === DEV_USER_ID && !viteDevServer/);
  assert.match(connector, /const envToken = viteDevServer/);
  for (const source of [db, auth, aiGuard, connector]) {
    assert.doesNotMatch(source, /NODE_ENV/);
  }
  assert.match(vite, /await mod\.ensureDbReady\(\)/);
  assert.match(config, /problems\.push\("DATABASE_URL is required"\)/);
  assert.match(workflow, /pglite\\\.\(data\|wasm\)\|initdb\\\.wasm/);
  assert.match(workflow, /grep --recursive --line-number --binary-files=without-match/);
  assert.match(workflow, /\[\[ ! -d "\$functions_dir" \]\]/);
  assert.match(workflow, /"\$\{#modules\[@\]\}" -eq 0/);
  assert.match(workflow, /scan_status=\$\?/);
  assert.match(workflow, /"\$scan_status" -ne 1/);
  assert.match(
    workflow,
    /env:\s+VITE_AUTH_ENABLED: "false"\s+DATABASE_URL: ""\s+XAI_API_KEY: ""\s+XAI_REQUIRE_ZERO_DATA_RETENTION: ""/,
  );
  assert.match(
    workflow,
    /XAI_API_KEY=\s+XAI_REQUIRE_ZERO_DATA_RETENTION=\s+DATABASE_URL=\s+VITE_AUTH_ENABLED=false\s+NODE_ENV=development npm run preview/,
  );
  assert.match(read("src/lib/ai/grok.ts"), /cache: "no-store",\s+redirect: "error"/);
  assert.match(read("src/lib/ai/voice-provider.ts"), /cache: "no-store",\s+redirect: "error"/);
  assert.match(workflow, /api\/auth\/get-session/);
});

test("hosting-gate session rotation rejects invalid identity and adapter failures", () => {
  const source = read("src/lib/auth/gate-session.server.ts");
  const auth = read("src/lib/auth/server.ts");
  assert.match(source, /APIError,[\s\S]*?from "better-auth\/api"/);
  assert.match(source, /if \(!inbound\.has\(GATE_IDENTITY_HEADER\)\) return/);

  const verify = source.indexOf("const identity = await gateIdentityFromHeaders(inbound)");
  const invalid = source.indexOf('throw new APIError("UNAUTHORIZED"', verify);
  assert.ok(verify >= 0 && verify < invalid);
  assert.doesNotMatch(source, /if \(inbound\.get\("authorization"\)\) return/);
  assert.ok(
    auth.indexOf("bearer(),") < auth.indexOf("gateIdentitySessions(),"),
    "bearer translation must run before authoritative gate binding",
  );

  const inspect = source.indexOf("const existing = await getSessionFromCtx(ctx, {");
  const accounts = source.indexOf("await ctx.context.internalAdapter.findAccounts", inspect);
  const remove = source.indexOf("await ctx.context.internalAdapter.deleteSession", accounts);
  const mint = source.indexOf("const result = await handleOAuthUserInfo", remove);
  assert.ok(inspect >= 0 && inspect < accounts && accounts < remove && remove < mint);
  assert.doesNotMatch(
    source.slice(inspect, mint),
    /\.catch\(/,
    "session inspection/deletion failures must reach the rejecting outer path",
  );
  assert.match(source, /if \(err instanceof APIError\) throw err/);
  assert.match(source, /throw new APIError\("INTERNAL_SERVER_ERROR"/);
  assert.match(
    source,
    /sessionBoundToGateIdentity\([\s\S]*?await expireSessionDataCookies\([\s\S]*?removeRequestCookieFamily\([\s\S]*?return \{ context: \{ headers \} \};/,
  );
  assert.match(source, /disableCookieCache: true/);
  assert.match(source, /removeRequestCookieFamily/);
  assert.match(source, /from "\.\/gate-cookie-core"/);
  assert.match(source, /ctx\.headers \?\? ctx\.request\?\.headers/);
});

test("session cookie delivery and chunk cleanup fail closed", () => {
  const source = read("src/lib/auth/gate-session.server.ts");
  assert.match(source, /let delivered = false/);
  assert.match(source, /return delivered \? sessionValue : null/);
  assert.match(source, /expireSessionDataCookies/);
  assert.match(source, /sessionDataCookieNames/);
  assert.doesNotMatch(source, /\{ userId: result\.data\.user\.id \}/);

  const pkg = JSON.parse(read("package.json"));
  assert.match(pkg.scripts["test:typed-core"], /gate-cookie-core\.test\.ts/);
});

test("ordinary builds are side-effect-free and migrations are explicit", () => {
  const pkg = JSON.parse(read("package.json"));
  const migrate = read("scripts/migrate.mjs");
  assert.doesNotMatch(pkg.scripts.build, /migrate/);
  assert.match(pkg.scripts["db:migrate"], /scripts\/migrate\.mjs/);
  assert.match(migrate, /only when explicitly invoked/i);
});

test("preview popup completion is bound to its opener and a one-time nonce", () => {
  const client = read("src/lib/auth/client.ts");
  const popup = read("src/lib/auth/popup.server.ts");
  assert.match(client, /event\.source !== popup/);
  assert.match(client, /data\.nonce !== nonce/);
  assert.match(client, /crypto\.randomUUID\(\)/);
  assert.match(popup, /VALID_NONCE/);
  assert.match(popup, /VALID_PROVIDER_IDS/);
  assert.match(popup, /nonce: string/);
});

test("preview OAuth stays inert until confirmed session and local-data preparation", () => {
  const client = read("src/lib/auth/client.ts");
  const popup = read("src/lib/auth/popup.server.ts");
  assert.match(client, /pending=1/);
  assert.match(client, /window\.open\(pendingUrl/);
  assert.match(
    popup,
    /Static holding page: no OAuth, cookies, script, opener message, or redirect/,
  );
  assert.match(client, /requestSignOut: requestConfirmedSignOut/);
  assert.match(client, /popupAttempt\?\.popup\.close\(\)/);
  const prepare = client.indexOf("await runPreSignInSignOut(");
  const erase = client.indexOf("await clearPriorAccountLocalData();", prepare);
  const activate = client.indexOf("activateSignInPopup(popupAttempt);", erase);
  assert.ok(prepare >= 0 && prepare < erase && erase < activate);
  const failureCatch = client.indexOf("} catch (cause) {", activate);
  const finalErase = client.indexOf("await clearPriorAccountLocalData();", failureCatch);
  const invalidate = client.indexOf(
    'writeAccountMarker(JSON.stringify([1, "erase-unconfirmed"]))',
    finalErase,
  );
  const reload = client.indexOf("window.location.reload();", invalidate);
  assert.ok(
    failureCatch >= 0 &&
      failureCatch < finalErase &&
      finalErase < invalidate &&
      invalidate < reload,
    "cancelled/failed OAuth must re-erase, invalidate on uncertainty, then reload",
  );
});

test("account chrome never loads a remote profile image", () => {
  const gates = read("src/lib/auth/gates.tsx");
  const user = read("src/lib/auth/use-current-user.ts");
  assert.doesNotMatch(gates, /<img|profileImageUrl/);
  assert.doesNotMatch(user, /profileImageUrl|user\.image/);
});

test("account changes fail closed unless browser data and legacy stills are confirmed erased", () => {
  const client = read("src/lib/auth/client.ts");
  const provider = read("src/lib/auth/provider.tsx");
  assert.match(client, /!result\.browserStorageCleared/);
  assert.match(client, /!result\.voiceCacheCleared/);
  assert.match(client, /result\.legacyStills !== "deleted_or_absent"/);
  assert.match(client, /await clearPriorAccountLocalData\(\)/);
  assert.match(provider, /readAccountMarker\(\)/);
  assert.match(provider, /writeAccountMarker\(expectedMarker\)/);
  assert.match(provider, /window\.location\.reload\(\)/);
  assert.ok(
    provider.indexOf("writeAccountMarker(expectedMarker)") <
      provider.indexOf("window.location.reload()"),
  );
  assert.match(provider, /if \(!markerMatches\)/);
  assert.match(provider, /if \(sessionError\)/);
  assert.match(provider, /no erase was attempted/);
  assert.match(provider, /Local data is blocked/);
});

test("failed or cancelled sign-in reloads after local erase begins", () => {
  const client = read("src/lib/auth/client.ts");
  assert.match(client, /function sameOriginCallbackPath/);
  assert.match(client, /url\.origin !== window\.location\.origin/);
  const started = client.indexOf("localEraseStarted = true");
  const erased = client.indexOf("await clearPriorAccountLocalData();", started);
  const caught = client.indexOf("} catch (cause) {", erased);
  const reloaded = client.indexOf("window.location.reload();", caught);
  assert.ok(started >= 0 && started < erased && erased < caught && caught < reloaded);
  assert.match(client.slice(caught, reloaded), /if \(localEraseStarted/);
  assert.match(client, /Persistent records may already be gone while Zustand stores still hold/);
  assert.match(client, /Always navigate—even to the current route/);
  assert.match(client, /if \(!data\?\.url\) throw new Error/);
});

test("login capability failures are retryable rather than an endless pending state", () => {
  const login = read("src/routes/login.tsx");
  const capabilities = read("src/lib/auth/capabilities.ts");
  assert.match(login, /capabilityError/);
  assert.match(login, /getAuthCapabilitiesBounded\(\)/);
  assert.match(capabilities, /AUTH_CAPABILITIES_TIMEOUT_MS = 5_000/);
  assert.match(capabilities, /Promise\.race/);
  assert.match(login, /setCapabilityAttempt\(\(attempt\) => attempt \+ 1\)/);
  assert.match(login, /Retry sign-in check/);
  assert.match(login, /Cloud analysis remains unavailable until this check succeeds/);
});

test("the emergency cut-down card bypasses account-isolation availability failures", () => {
  const provider = read("src/lib/auth/provider.tsx");
  assert.match(provider, /state\.location\.pathname === "\/emergency"/);
  assert.match(provider, /authEnabled && !emergencyBypass/);
  const providerBody = provider.slice(
    provider.indexOf("export function AuthProvider"),
    provider.indexOf("function AccountIsolationGate"),
  );
  assert.doesNotMatch(providerBody, /authClient\.useSession|readAccountMarker/);
});

test("sign-out failures remain visible and retryable", () => {
  const gates = read("src/lib/auth/gates.tsx");
  assert.match(gates, /setSignOutError/);
  assert.match(gates, /role="alert"/);
  assert.match(gates, /You may still be signed in/);
});

test("hosting-gate account chrome never promises a persistent app sign-out", () => {
  const gates = read("src/lib/auth/gates.tsx");
  const client = read("src/lib/auth/client.ts");
  assert.match(gates, /capabilities\?\.gateIdentity === true/);
  assert.match(gates, /localClearOnly[\s\S]*?clearLocalAccountData\(\)/);
  assert.match(gates, /capabilityFailed \|\| capabilitiesPending/);
  assert.doesNotMatch(gates, /disabled=\{signingOut \|\| capabilitiesPending\}/);
  assert.match(gates, /hosting gate controls account access/i);
  assert.match(gates, /Exit or sign out through the host to end access/i);
  assert.match(gates, /Clear local data/);
  assert.match(client, /export async function clearLocalAccountData/);
  const clearStart = client.indexOf("export async function clearLocalAccountData");
  const clearEnd = client.indexOf("async function requestConfirmedSignOut", clearStart);
  assert.doesNotMatch(client.slice(clearStart, clearEnd), /authClient\.signOut/);
});

test("cloud voice accepts only reviewed application lines", () => {
  const source = read("src/lib/ai/voice.ts");
  assert.match(source, /isReviewedCoachSpeech\(data\.text\)/);
  assert.match(source, /Cloud voice accepts only reviewed app guidance/);
});

test("session cookie parse failures never log credential previews", () => {
  const source = read("src/lib/auth/gate-session.server.ts");
  assert.doesNotMatch(source, /cookiePreview|signedCookie\.slice/);
  assert.match(source, /byteLength: Buffer\.byteLength\(signedCookie/);
});

test("provider requests receive the originating request cancellation signal", () => {
  const analyze = read("src/lib/ai/analyze.ts");
  const voice = read("src/lib/ai/voice.ts");
  const voiceProvider = read("src/lib/ai/voice-provider.ts");
  assert.match(analyze, /signal: authorization\.signal/);
  assert.match(voice, /signal: authorization\.signal/);
  assert.match(voiceProvider, /options\.signal\?\.addEventListener\("abort"/);
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
  assert.ok(
    source.indexOf("generation !== playbackGeneration") < source.indexOf("cache.set(key, entry)"),
  );
});
