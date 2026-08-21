# Knotty omnibus engineering, product, and safety review

Review date: 2026-08-21  
Reviewed `main`: `cf5317206a47f037983b4c65e18b825705edc777`  
Core implementation: merged pull request #2, `058bb386720d9617afe75cfde6d84e9cd585d300`  
Concurrent deep-review hardening: merged pull request #4, `9b02ad96e3fad02e90f51d564a467a2961f8b413`  
Final hardening: pull request #3, `codex/final-camera-kb-reliability`

## Outcome

The merged core, pull request #4's deep-review corrections, and the four-file
final hardening follow-up contain the integrated stabilization work from repeated
independent and adversarial reviews. The exact Node 22.23.2 release pipeline now
builds one valid Vercel server bundle, verifies generated artifacts, typechecks,
lints with zero warnings, runs the complete source-owned test corpus and PWA
fixture, and smoke-tests the production preview in desktop and mobile Chromium.

Merge the follow-up only after its exact combined-head CI run completes. Keep
the release uncertified until the external matrix is recorded.
Browser automation cannot prove real camera permission behavior, phone codecs,
live identity/provider integration, database pooling, accessibility, or safe
real-world use.

## Media scope

This is an adult-only, consent-centered application for equipment-only or
clothed, non-explicit media. The camera path does not detect or certify age,
consent, clothing, nudity, anonymity, health, or safety. Every submitted batch
requires explicit adult, non-explicit, non-secret, non-coerced, all-participant,
activity, recording, upload, and output attestations. Nude or explicit-image
acceptance is not enabled.

Photo and video support is therefore a structural media capability, not a claim
that every browser/device/codec works or that every accepted file is appropriate
to send. Video remains local and only one to three user-selected, labeled stills
are transmitted; camera capture never requests audio.

## Multi-agent adversarial storms

Independent agents challenged the same implementation from conflicting roles,
then cross-reviewed the merged result:

1. camera lifecycle, permission denial/revocation, focus and torch hangs,
   backgrounding, stale operations, recorder errors, decoder limits, malformed
   containers, MIME spoofing, image-dimension bombs, phone formats, and cleanup;
2. consent withdrawal, unclear-adult state, coercion/secret recording, reported
   symptoms, context changes, account transitions, local erase, provider privacy,
   and emergency routing;
3. model injection, Unicode/homoglyph evasion, invented ontology IDs, exact-tie
   claims, nonvisual inference, consequence downgrades, contradictory mutations,
   and false clearance;
4. authentication, hosting-gate identity, preview sessions, same-origin checks,
   cancellation, quotas, response bounds, credential logging, account isolation,
   and sign-in/sign-out failure paths;
5. replay races, migration concurrency, transaction-pool behavior, per-replica
   state, dependency/build drift, emitted JavaScript validity, PWA integration,
   and production startup behavior;
6. concurrent-main conflict resolution and a final no-edit release-adversary pass.

The deterministic observation-report state storm evaluated 32,832 combinations
without a throw or invalid report. A final focused adversarial pass reported no
remaining reproducible source-level release blocker before CI.

## Material corrections

- Camera/media: bounded acquisition and constraint calls; secure-context and
  permission errors; front/back fallback; stop-on-failure/background/pagehide;
  idempotent bounded recording finalization; cancellation-aware metadata, seek,
  and bitmap decode; strict MIME/signature/extension checks; JPEG, PNG, WebP,
  HEIC/HEIF, MP4/MOV, 3GP, and WebM structural validation; dimension, pixel,
  duration, and decoder-surface budgets; user-selected video stills; no audio.
- Observation contract: closed schema 1.1 IDs, per-frame evidence and abstention,
  confounders, immutable consequence floors, source ledger, strict cross-field
  validation, C3 instructor routing, C4 stop routing, action-first symptom and
  coercion handling, and no chronology, physiology, exact-tie, or safety claims.
- Knowledge base: deterministic offline answers, stable source IDs and HTTPS
  links, unique routeable slugs, bounded/deduplicated results, Unicode-aware
  tokenization, bounded CJK segmentation, urgent English/Japanese/Chinese intent
  routing, safe-start routing, and explicit instructor/emergency boundaries.
- Server/auth: verified middleware context for cost-bearing endpoints,
  production same-origin enforcement, hosting-gate verification with bounded
  JWKS single-flight, explicit auth-endpoint rate limiting, bounded provider
  calls, reviewed-line-only cloud voice, account-local data isolation, durable
  Postgres media reservations, small timeout-bounded pools, and
  transaction-scoped migration locking.
- Privacy/resilience: per-batch permissions, no secret recording, cross-tab erase,
  legacy-key cleanup, late-response invalidation, no remote profile images,
  accurate provider-retention caveats, and an auth-independent emergency route.
- Concurrent deep review: fixed the TypeScript script-test loader; added the
  required custom-card banner metadata and asset; removed unused AI and P2P code;
  moved account-isolation storage reads behind an SSR-safe effect; and made a
  production database configuration without enabled authentication fail closed.
- Build/release: committed lockfile and route tree; exact Node version and
  `npm ci`; generated-artifact drift check; zero-warning lint; emitted server
  syntax check; Nitro single-bundle workaround for the upstream split-export
  failure; app-specific PWA fixture; desktop/mobile production smoke evidence;
  and development-only PGLite with no production-import side effects.

## Verification evidence

- GitHub Actions run 15 on exact Node 22.23.2: clean install, production build,
  emitted server syntax, generated-artifact drift, typecheck, zero-warning lint,
  354/354 source-owned tests, and the 47/47 isolated PWA fixture all passed.
- The same run proved that the production function contains no PGLite WASM/data
  loader, started the built preview under hostile `NODE_ENV=development`, probed
  the auth-off session route, and completed settled desktop/mobile Chromium
  smoke with identical 929-character page bodies, no console/page errors, and
  no horizontal overflow.
- GitHub Actions run 19 revalidated the final hardening branch: 354/354
  source-owned tests, 47/47 PWA fixture tests, release-artifact checks, and
  desktop/mobile production smoke all passed.
- GitHub Actions run 20 independently validated pull request #4: 355/355 tests,
  typecheck, zero-warning lint, production build, PWA fixture, brand assets, and
  browser smoke all passed.
- Focused camera/report/safety corpus: 69/69 passed.
- Focused typed camera/knowledge/ML/voice corpus: 72/72 passed, including 19/19
  knowledge-base tests.
- Deterministic report state storm: 32,832 combinations, zero throws.
- Pull request #4 created one documentation overlap after the prior validation.
  The two-parent resolution preserves its current code and documentation evidence
  together with the final hardening review; the conflict-marker scan is clean.

Tests establish reproducible software behavior under their fixtures. They do not
certify a physical setup, a participant's condition, or future device behavior.

## External release validation still required

- Real devices: current iOS Safari, Android Chrome, desktop Chromium, Firefox,
  and Safari. Record grant/deny/revoke, camera switching, interruption and
  backgrounding, live photo, local photo/video import, native recording,
  supported codecs, still selection, oversized-file rejection, and no-audio
  behavior. Use non-sensitive fixtures and retain no participant media.
- Live services: production identity/JWKS, OAuth callbacks, xAI refusal/error/
  timeout paths, Postgres migrations, Neon pooled connections, PgBouncer
  transaction mode, replica replay races, provider retention, and account erase.
- Product quality: keyboard/screen-reader review, reduced motion, color contrast,
  low-memory phones, slow networks, offline behavior, and localization review by
  fluent speakers.

## Researched product backlog

1. **Capability preflight (next).** Before consent, report secure-context and
   iframe-policy status plus supported recording/decoder formats without opening
   a camera. Treat device availability as indeterminate until acquisition.
2. **Equipment-only default (next).** Start every camera workflow in an
   unoccupied-equipment mode. Make the separate clothed-adult path deliberate so
   it carries its larger consent and identification surface visibly.
3. **Local privacy workbench (next).** Add manual crop/blur/redaction and optional
   on-device face/text/tattoo-region warnings. Never claim that automation has
   anonymized an image; the operator must review the exact transmitted stills.
4. **Knowledge review manifest (next).** Give every reviewed entry a source ID,
   revision, reviewer date, safety tier, checksum, and stale-review flag. Fail
   CI when a routed entry lacks provenance or its source/route no longer resolves.
5. **Offline readiness drills (later).** Add no-media consent, release-plan,
   emergency-contact, and instructor-handoff exercises. Do not score a person or
   evaluate a live setup.
6. **Deployment retention status (later).** Show a server-derived provider and
   retention mode beside confirmation; never let editable client text assert ZDR.
7. **Redacted instructor handoff (later).** Export a text-only schema 1.1 report
   with limitations and source IDs, defaulting to no names, media, room details,
   timestamps, or device metadata.
8. **Release evidence dashboard (later).** Track build SHA, schema version,
   browser/device matrix, accessibility results, provider error rates, migration
   probes, and deletion checks without storing live or sensitive media.

## Research references

- [W3C Media Capture and Streams](https://www.w3.org/TR/mediacapture-streams/)
- [W3C MediaStream Recording](https://www.w3.org/TR/mediastream-recording/)
- [W3C Permissions Policy](https://www.w3.org/TR/permissions-policy/)
- [MP4 Registration Authority brand registry](https://mp4ra.org/registered-types/brands)
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [PGlite filesystems](https://pglite.dev/docs/filesystems)
- [Vite conditional configuration](https://vite.dev/config/)
- [Vite global constant replacement](https://vite.dev/config/shared-options.html#define)
- [PostgreSQL advisory-lock functions](https://www.postgresql.org/docs/current/functions-admin.html#FUNCTIONS-ADVISORY-LOCKS)
- [PostgreSQL client connection defaults and timeouts](https://www.postgresql.org/docs/current/runtime-config-client.html)
- [Better Auth rate-limit options](https://better-auth.com/docs/reference/options#rateLimit)
