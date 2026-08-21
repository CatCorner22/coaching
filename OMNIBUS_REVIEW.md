# Knotty omnibus engineering and safety review

Review date: 2026-08-21 (updated after deep-review hardening pass)  
Reviewed base: `81b4084775cc7448dbd6c4cb1aa2462769631b02`  
Integrated concurrent `main`: `a68b5c0550bf93f455a4a012ab7bfc14de66d6c5`  
Hardening branch: `cursor/knotty-deep-review-19f1`

## Decision

The source-owned camera, report, safety, privacy, and server boundaries remain substantially stronger than a typical scaffold. A clean Node 22 checkout now has a committed `package-lock.json`, a passing full test/typecheck/lint/production-build path, and recorded desktop/mobile browser smoke on both dev and production preview. **Real-device camera/video matrix testing and authenticated production smoke in the provider environment remain the primary release gates** — dependency-free tests cannot prove browser/device interoperability or safe real-world use.

## Adversarial storms

Four independent multi-agent rounds, followed by a separate merge-adversary pass, challenged the app across eight fronts:

1. camera lifecycle, permissions, focus/torch drivers, recording finalization, decoder limits, malformed containers, stale operations, and cancellation;
2. consent withdrawal, action-first symptom/coercion triage, context changes, privacy claims, local deletion, and knowledge-base copy;
3. model-output injection, ontology invention, consequence-band downgrades, contradictory report mutations, unsupported image inferences, and emergency routing;
4. authentication, live-preview bearer sessions, origin isolation, quota poisoning, response-size limits, credential logging, replay, and provider cancellation;
5. dependency-free fuzz/mutation cases for signatures, Unicode/euphemism boundaries, report invariants, and rate-limit state;
6. CI truthfulness and clean-checkout release prerequisites.
7. cross-file consent state, cloud-voice opt-in, quota/replay retry semantics, unclear-adult triage, and instructor-only route isolation.
8. concurrent-main conflict resolution, stale capture/response races, consent-version migration, dual-key erasure, dark-media false positives, recognition restart bounds, and render isolation.

## Material modifications

- Camera/media: secure-context errors, permission-denial behavior, device fallback, bounded focus and torch calls, operation generations, 24 MP phone-photo budget, edge/pixel limits, resized decode, serialized late bitmap decode, strict MIME/signature pairing, primary-item HEIF dimension resolution, 3GP consistency, video metadata/duration/resolution limits, bounded recorder stop, and deterministic cleanup.
- Consent/privacy: separate adult, non-explicit, non-secret, non-coerced, bystander, activity, recording, upload, and output attestations; one-use page batches; context-key remount on tie/step/surface/hard-limit changes; action-first triage before camera access; accurate browser/server/xAI disclosure; cross-tab local erase; configurable emergency number without locale guessing.
- Observation contract: schema 1.1 closed IDs, evidence state, confounders, abstention, consequence floors, fixed actions, source ledger, strict cross-field validation, direct-report escalation, C3 instructor routing, C4 stop routing, no clearance, no invented chronology, and no synthesized pixel discriminator. C1 ontology entries are promoted to C2 because the app does not collect every separate readiness fact required for C1.
- Server trust: authenticated middleware on vision/TTS, live-preview bearer propagation, production same-origin checks, request-signal relay, bounded provider responses, typed 403/429 errors, atomic per-user/per-instance quotas, non-evictable global sentinels, bounded request schemas, and redacted session-cookie error logs.
- Integration: cloud TTS is explicit and fail-closed, browser speech bypasses xAI, opt-out stops playback and invalidates late cache writes, captured batches retain their permission ledger and expiry controls, only a rolled-back pre-provider quota denial reopens a batch, unclear-adult triage clears adult confirmation, instructor-only content cannot route into Studio, and capture/model results are synchronously bound to their tie/step/surface/limit context.
- Concurrent-main merge: useful hydration, planner, journal-export, dark-fiber, and timer improvements were retained without importing main's stale-step report reuse, unlocalized paleness weighting, uniform-dark rope assumption, always-on voice/mic defaults, or unversioned consent acceptance. Canonical `knotty-*` storage adopts legacy data once, normalizes journal records, and erases both key families.
- Operations: Node 22 declaration, focused source-owned CI suite, deployment/device matrix, committed `package-lock.json`, and a durable review record.
- Deep-review hardening (2026-08-21): script test loader fixed (`--experimental-strip-types` + `register-ts.mjs`), brand assets completed (`type: x:game`, `public/x-banner.jpg`), dead code removed (`ask.ts`, `multiplayer/p2p`), SSR-safe account isolation gate, and production build fail-fast when `DATABASE_URL` is set without `VITE_AUTH_ENABLED=true`.

## Verification

- `npm test`: **355/355 passed** on Node 22 (235 script tests, 111 typed-core tests, 9 store tests).
- `npm run typecheck`: **pass** (0 errors).
- `npm run lint`: **pass** (zero warnings).
- `npm run build`: **pass** — production bundle excludes PGLite WASM/data loaders.
- Dev browser smoke (desktop 1280×800 + mobile 390×844): **pass** — visible consent gate content, clean console, no brand warnings.
- Consented deep walkthrough of 26 routes (library, ties, knots, studio, tools, emergency, unknown slugs): **pass** — no console or page errors; home mobile scroll width no longer overflows after featured-card and decorative-SVG clipping.
- Production preview smoke (`127.0.0.1:8081`, baseline compared to dev): **pass** — no divergence, clean console.
- Isolated platform PWA fixture (`scripts/grok-pwa-plugin.test.mjs` in temp cwd): **47/47 passed**.
- Brand assets: `public/og.jpg`, `public/x-banner.jpg`, `public/__grok/icon-180.png`, and `src/lib/og/site.json` with `"card": "custom"` and `"type": "x:game"` — all present.
- The independent `bdsm-shibari-camera` observation-report validator: **6/6 representative C2/C3/C4/emergency/coercion reports passed** (from prior review pass).
- Store and migration suite: **9/9 passed** on Node 22, including same-second timer behavior, planner idempotency, legacy-key adoption, versioned consent, and voice/microphone fail-closed migration.
- Authenticated production smoke in the provider environment and real-device camera matrix remain pending.

## Release blockers and residual risk

- Run authenticated preview smoke and the full platform fixture suite in the provider environment with real auth credentials and `XAI_API_KEY`.
- Test current iOS Safari, Android Chrome, desktop Chromium, Firefox, and Safari with permission grant/deny/revoke, camera switching, interruption/backgrounding, photo import, native recording round-trip, MP4/MOV/WebM/HEIC support where applicable, still selection, and no-audio capture. Do not retain participants' sensitive test media.
- The batch replay cache is per process. A durable “exactly once” promise needs a server-minted capability bound to user, consent expiry, context, and media digests, consumed atomically in shared storage.
- Stop/discard suppresses stale UI output and server requests observe connection cancellation, but the current server-function client API has no demonstrated application-level abort handle. Provider work already in flight may continue.
- Browser speech recognition may use a browser-vendor cloud service and is never a safety or safeword control.

## Researched product backlog

1. **Camera capability preflight.** Before consent, show secure-context, iframe policy, camera availability, supported recording MIME, and decoder capability—without opening a device. The Permissions and Media Capture specifications caution that a granted permission still does not guarantee acquisition success, while Media Capabilities can report support/smoothness/power efficiency.
2. **Durable upload capability.** Server-mint a short-lived, signed, single-use token after the consent/context form; bind it to local media hashes and consume it transactionally before provider invocation.
3. **On-device privacy preview.** Add optional local face/text/tattoo-region warnings and manual crop/redaction. Never auto-certify that an image is anonymous; require the operator to review the final transmitted stills.
4. **Equipment-only mode.** Make an unoccupied equipment/context workflow the default, with a separate deliberate path for clothed adult media. This reduces identification and consent surface without weakening the report's uncertainty language.
5. **Offline readiness and scenario drills.** Add no-media consent, emergency-contact, release-plan, and instructor-handoff exercises that work offline and never grade a person or a live setup.
6. **Provider-retention status.** Show the deployment's verified retention mode (standard or ZDR) next to the Analyze confirmation, sourced from server configuration rather than a user-editable claim. xAI's enterprise terms describe standard deletion timing and separate ZDR conditions; deployment must verify what actually applies.
7. **Redacted instructor handoff.** Export text-only schema 1.1 reports with limitations and source IDs, defaulting to no names, media, room details, or device metadata.
8. **Release evidence dashboard.** Track the browser/device matrix, accessibility checks, production build hash, schema-validator corpus, provider error rates, and privacy deletion probes. Never use live sensitive media as telemetry.

## Research references

- [W3C Media Capture and Streams](https://www.w3.org/TR/mediacapture-streams/)
- [W3C MediaStream Recording](https://www.w3.org/TR/mediastream-recording/)
- [W3C Permissions Policy](https://www.w3.org/TR/permissions-policy/)
- [MDN Media Capabilities API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Capabilities_API)
- [MDN getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [Apple camera capture updates](https://developer.apple.com/jp/videos/play/wwdc2026/304/)
- [xAI Enterprise Terms](https://x.ai/legal/terms-of-service-enterprise)
