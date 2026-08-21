# Knotty omnibus engineering and safety review

Review date: 2026-08-21  
Reviewed base: `81b4084775cc7448dbd6c4cb1aa2462769631b02`  
Integrated concurrent `main`: `a68b5c0550bf93f455a4a012ab7bfc14de66d6c5`

## Decision

Keep the stabilization pull request in draft until a clean Node 22 checkout has a lockfile, its platform environment, a passing full test/typecheck/lint/production-build path, and recorded real-device camera/video results. The source-owned camera, report, safety, privacy, and server boundaries are substantially stronger, but dependency-free tests cannot prove browser/device interoperability or safe real-world use.

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
- Operations: Node 22 declaration, focused source-owned CI suite, deployment/device matrix, explicit lockfile/platform-environment blockers, and a durable review record.

## Verification

- `npm run test:core`: **161/161 passed** (110 dependency-free script tests plus 51 TypeScript camera/ML/knowledge tests).
- The independent `bdsm-shibari-camera` observation-report validator: **6/6 representative C2/C3/C4/emergency/coercion reports passed**.
- Full dependency-free script corpus: **228/235 passed**. All seven failures are isolated to the untouched platform PWA fixture: six generic-title expectations inherit this app's `Knotty` `site.json`, and the reconstructed local snapshot omits `public/__grok/icon-180.png`. The icon was verified on GitHub `main` and remains in the base tree.
- Conflict-marker scan: clean before the concurrent-main merge; the final merge scan and Node 22 CI are required again after integration.
- The pre-merge branch passed Node 22 typecheck in CI. Final merged typecheck, lint, store-migration tests, production build, browser smoke, and real-device checks remain pending; this reconstruction has no installed dependencies or lockfile and is running Node 24 rather than the declared Node 22 target.

## Release blockers and residual risk

- Generate and commit `package-lock.json`, switch CI to `npm ci`, restore the platform environment in a clean workspace, reconcile the generic PWA fixture with the app-specific site identity through the platform-supported path, and make the full test/build path mandatory.
- Run typecheck, lint, build, authenticated preview, and production-like smoke tests after dependencies are available.
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
