# Knotty omnibus engineering, product, knowledge, and safety review

Review date: 2026-08-21  
Reviewed `main`: `20b76441a5d6b77d5e27f86a8356152af6f4ed23`  
Knowledge-ledger revision: `2026-08-21.2`

## Outcome

This branch integrates a fresh full-repository review, independent adversarial
agent storms, source research, and regression-backed corrections across camera
capture, photo/video import, observation reports, knowledge routing, provider
contracts, authentication, build behavior, and release automation.

No remaining reproducible source-level release blocker was found after the final
camera-to-report-to-knowledge re-probe. Local validation passed all 408
source-owned tests, TypeScript, zero-warning ESLint, the production build,
generated server-module syntax checks, and secret/PGLite artifact scans. The
exact Node 22.23.2 GitHub pipeline and its production Chromium smoke remain the
authoritative merge gate.

These results establish behavior under deterministic fixtures. They do not
certify a physical setup, a participant's health or consent, model accuracy, a
real phone camera/codec, or a production identity/database/provider deployment.

## Media and safety scope

Knotty is adult-only and consent-centered. Its supported review scope is
unoccupied equipment or clothed, non-explicit adult-consensual material. Nude or
explicit images are prohibited and unsupported.

The app cannot automatically determine age, consent, coercion, secrecy, nudity,
identity, health, or safety. The UI now says this directly instead of implying
that attestations are technical detection. Every transmitted batch requires the
operator to attest to adult participation, current and revocable consent,
recording and upload permission, non-secret/non-coerced capture, and supported
non-explicit scope.

Photo and video support is a bounded media capability, not universal device or
codec certification. Video stays local; the operator chooses one to three
labeled stills, which the client re-encodes as JPEG before submission. The
camera does not request audio. The model may describe visible equipment and
uncertainty, but cannot clear a setup, diagnose a participant, infer exact rope
paths, or replace an in-person qualified instructor or emergency services.

## Adversarial review coverage

Independent agents attacked the implementation from overlapping but conflicting
roles, then re-probed the integrated result:

1. Camera lifecycle: permission denial/revocation, acquisition timeout,
   front/back fallback, focus and torch hangs, interruption/backgrounding,
   cancellation, stale ownership, late decoder completion, recorder errors,
   object-URL cleanup, and orphaned bitmap work.
2. Media boundaries: MIME spoofing, malformed containers, base64 ambiguity,
   trailing data, image-dimension bombs, pixel/duration budgets, EXIF-oriented
   resizing, unsupported formats, multi-frame ordering, and photo/video races.
3. Safety state: consent withdrawal, unclear-adult state, secret/coerced media,
   reported symptoms, emergency release, changed context, stale model output,
   journal duplication, and failure to discard invalidated reports.
4. Model boundary: prompt injection, invented ontology IDs, unsupported
   nonvisual inference, exact-tie claims, contradictory severity, structured
   refusal variants, nonterminal completions, prefixed/fenced JSON, and provider
   contract violations.
5. Knowledge routing: emergency, immediate-release, consent-withdrawal, and
   neurovascular phrases in English, Japanese, Simplified Chinese, and Korean;
   neighboring negative controls; procedural-result suppression; and action-first
   presentation.
6. Authentication and operations: bearer/cookie gate bypass, stale cached
   sessions, split cookies, cross-identity rotation, cookie delivery failure,
   origin/issuer validation, quota reservation order, missing-provider config,
   credential exposure, build-time migrations, server artifacts, and exact-node
   CI behavior.
7. Passive preflight and performance: insecure/unknown contexts, policy allow /
   block / absence, permission grant / prompt / denial / rejection / timeout,
   accidental device enumeration or acquisition, stale async ownership,
   accessibility state, globally eager knowledge/schema graphs, cosmetic chunk
   splitting, and largest-file-only budget false positives.

The final focused camera/knowledge pass completed 107/107 cases and reported no
remaining high-severity defect. A broader integrated focused pass completed
155/155 cases. The deterministic observation-report state storm continues to
cover 32,832 state combinations without an invalid report or throw.

## Material corrections

### Camera, photo, and video

- Studio now offers a passive browser capability preflight after action-first
  triage and before batch attestations. It inspects only secure-context,
  effective document-policy, API-presence, and permission-state layers; it is
  bounded, never opens or enumerates a camera, and explicitly disclaims device,
  codec, consent, privacy, and safety certification.
- Preflight results have latest-request and unmount ownership. Live preview has
  an accessible name, recording is announced textually, and torch state exposes
  `aria-pressed`.
- Camera acquisition and `video.play()` are bounded and cancellation-aware.
  Late streams are stopped, the fallback path does not reopen after abort, and
  the capture surface provides a visible Cancel action.
- File decode and operation ownership are rechecked after every asynchronous
  boundary, preventing a canceled import from publishing a late frame.
- Native bitmap work has a bounded orphan lease so one hung decoder cannot
  disable future attempts forever. One-dimension resize preserves the
  EXIF-oriented aspect ratio.
- The analysis endpoint accepts only a canonical JPEG data URL with strict
  base64, JPEG start, and JPEG end validation. WebP disguised as JPEG and
  trailing junk fail closed.
- Capture, discard, context change, urgent triage, and consent withdrawal now
  invalidate stale refusal, request, report, saved-revision, and error state.
- Studio action gates now require an affirmative yes. An unresolved maybe blocks
  media, mapped ties/equipment, and every Studio speech path; every rank change
  also invalidates the capture-bound context.
- Reviewed local observation text is no longer scanned as if it were an
  untrusted activity proposal. This removes false Stops caused by generic words
  such as “rope” and “use,” while incoming action prose still passes the
  negotiated-limit and prohibited-content guards.
- Selected still labels are preserved, but the report never claims chronology,
  motion understanding, or full-video review.

### Observation and provider contracts

- Provider availability is checked before durable batch reservation and quota
  use. A missing or blank `XAI_API_KEY` returns a typed, retryable
  `AI_PROVIDER_UNAVAILABLE` response without consuming the batch.
- Only a terminal `finish_reason: "stop"` can be admitted. Missing, null,
  truncated, or otherwise nonterminal completions fail closed.
- HTTP 200 `message.refusal` is recognized without displaying provider prose.
  Generic 400/422 responses are no longer mislabeled as safety refusals.
- Provider JSON must be exactly one strict object—no fences, prefixes, or
  suffixes—and still passes local Zod validation and cross-field invariants.
- Prohibited-inference and hard-limit violations remain failures, while
  conservative high-consequence visible matches are preserved for human review.
- Nonvisual checks render as an action checklist before lower-priority visible
  category detail. Reports consistently disclose selected-still and visual-only
  limitations.

### Knowledge source base and routing

- The immutable source ledger is revisioned and separates provider-specific xAI
  sources from retained OpenAI IDs. Provider claims now use first-party xAI
  image-input, model, structured-output, video-boundary, privacy, and terms
  references.
- Every article exposes an evidence panel with stable Safety-page anchors,
  ledger revision, audit date, source IDs, external links, and either
  `source_anchored` or `editorial_only` status. Source anchoring explicitly does
  not validate every sentence or an individual setup.
- Unsourced rope-baking/oiling specifics and procedural suspension/knot language
  were removed or narrowed to unloaded, unoccupied recognition. “Reviewed” was
  replaced by the more accurate “curated.”
- Emergency, immediate-release, consent-withdrawal, and concerning symptom
  queries receive action-first guidance. Their results are restricted to a
  closed safety allowlist so a query such as “seizure hogtie” cannot surface
  procedural tying material beside emergency direction.
- Expanded multilingual phrase families cover natural paraphrases and word
  order, while negative controls keep adjacent terms such as “blue rope care”
  and “recording permission settings” in ordinary search.
- Reports without uploaded media do not cite xAI input/provider sources.

### Authentication, privacy, and operations

- Bearer transformation runs before hosting-gate evaluation. An arbitrary
  `Authorization` header no longer bypasses the gate, transformed headers are
  preferred, and authoritative session lookup disables cookie-cache reuse.
- Bearer/cookie identity must match the hosting-gate identity; mismatches rotate
  the session. All chunked session-cache cookies are removed without an
  attacker-controlled artificial cap.
- Session delivery fails closed if both cookie delivery paths fail. Issuer and
  gate URLs require HTTPS origins outside the documented local-development
  boundary.
- Logs no longer emit raw stable subject/user identifiers.
- The previously source-embedded preview OAuth secret was removed. Development
  preview OAuth now reads a server-only `GROK_PREVIEW_CLIENT_SECRET`; the old
  credential still requires external rotation because repository history and
  prior artifacts cannot be repaired by this source change.
- Production builds have no migration side effect. Schema migration is an
  explicit `npm run db:migrate` deployment operation.
- CI pins Node 22.23.2, installs without lifecycle scripts, builds before
  typecheck, and fixes its standalone auth-off/no-database/no-provider contract
  at both build and preview time. It scans emitted JavaScript and
  credentials/database artifacts, runs the full test/lint corpus, enforces
  client entry and complete eager-import budgets, probes direct route loads,
  and captures root plus Studio desktop/mobile evidence. The Studio browser
  storm keeps preflight passive, then uses a
  no-audio synthetic equipment feed to exercise live open, photo commit, batch
  reset, recording, labeled-still selection, video commit, track shutdown, and
  the retryable pre-provider failure path without sending media to xAI or
  spending provider quota.
- A route validator no longer imports the knowledge-base barrel into the global
  registration graph. The root preview bridge now uses a small, tested closed
  message parser instead of eagerly loading Zod. This defers route-specific KB
  data and schema code rather than merely hiding the original chunk warning.

## Verification evidence

- `npm test`: 408/408 passed, zero failures (groups: 262, 49, 85, and 12).
- Integrated focused corpus: 155/155 passed.
- Final independent camera/knowledge re-probe: 107/107 passed.
- `tsc --noEmit`: passed.
- `eslint . --max-warnings=0`: passed.
- Production Vite/Nitro/Vercel build: passed; 1,985 client modules, 412 SSR
  modules, and 2,475 Nitro modules transformed.
- Client entry: 370,980 bytes raw / 115,779 bytes gzip, down from 536,396 /
  165,560. The complete static entry graph is 477,749 bytes raw / 154,198
  bytes gzip and passes committed regression budgets.
- Every emitted server `.js`/`.mjs` module passed `node --check`.
- Production artifact scans found neither a credential-shaped preview OAuth
  secret nor a PGLite WASM/data loader.
- The built production preview returned HTTP 200 for `/`, `/knowledge`,
  `/studio`, `/nerves`, `/article/consent-frameworks`, and `/emergency`; the
  emergency response preloaded neither the KB nor ties chunks.
- Migration command without `DATABASE_URL`: clean no-op, as designed.

Local browser capture was not treated as passing: this managed environment had
no Chromium executable, and the browser CDN failed certificate validation and
returned empty archives. GitHub's clean Ubuntu job installs Chromium and is the
required visual/runtime merge gate for the keyboard, focus, no-camera-call,
synthetic photo/video lifecycle, verified provider-unavailable recovery,
track-shutdown, and mobile-overflow checks.

The prior 536.39 kB client warning is resolved through real route-boundary
deferral. CI now fails if either the entry alone or its complete static import
graph regresses beyond its measured budget, preventing manual-chunk-only false
greens.

## External release validation still required

- Real devices: current iOS Safari, Android Chrome, desktop Chromium, Firefox,
  and Safari. Record grant/deny/revoke, camera switch, interruption/background,
  live photo, local import, native recording, supported codecs, still selection,
  oversize rejection, cancellation races, and no-audio behavior using
  non-sensitive fixtures.
- Live services: production identity/JWKS, OAuth callbacks, preview credential
  rotation, xAI success/refusal/error/timeout, provider retention/ZDR response
  headers, Postgres migrations, pooled connections, transaction mode, replica
  races, account erase, and shared multi-replica rate limits.
- Product quality: keyboard/screen-reader testing, reduced motion, contrast,
  low-memory phones, slow networks, offline recovery, and fluent-speaker review
  of Japanese, Simplified Chinese, and Korean emergency wording.
- Safety/editorial governance: named qualified reviewers, claim-level review
  dates, source-change monitoring, and expiry rules for high-consequence entries.

## Researched product backlog

1. **Equipment-only default.** Start with unoccupied equipment; make the separate
   clothed-adult path deliberate and visibly higher-friction.
2. **Local privacy workbench.** Add manual crop/blur/redaction and optional
   on-device face/text/tattoo-region warnings. Never claim automated anonymity.
3. **Responses API migration.** Chat Completions is now documented as legacy.
   Migrate only after strict schema, refusal, selected-image, timeout, and error
   behavior reach contract parity.
4. **Knowledge review manifest.** Add reviewer role, source revision, claim tier,
   checksum, next-review date, and stale flag; fail CI for broken provenance.
5. **Verified retention status.** Surface a server-derived provider/retention
   mode and verify `x-zero-data-retention` when claiming ZDR.
6. **Shared abuse controls.** Move rate and concurrency budgets from per-process
   memory to a bounded shared store before multi-replica scaling.
7. **Release evidence dashboard.** Track build SHA, schema/ledger revision,
   browser-device matrix, accessibility results, provider errors, migration
   probes, and deletion checks without storing participant media.

## Research references

- [xAI Image Understanding](https://docs.x.ai/developers/model-capabilities/images/understanding)
- [xAI Chat Completions (legacy)](https://docs.x.ai/developers/model-capabilities/legacy/chat-completions)
- [xAI Grok 4.5](https://docs.x.ai/developers/models/grok-4.5)
- [xAI Structured Outputs](https://docs.x.ai/developers/model-capabilities/text/structured-outputs)
- [xAI X Search video understanding](https://docs.x.ai/developers/tools/x-search)
- [xAI API Security and Zero Data Retention](https://docs.x.ai/developers/faq/security)
- [xAI Enterprise Terms](https://x.ai/legal/terms-of-service-enterprise)
- [W3C Media Capture and Streams](https://www.w3.org/TR/mediacapture-streams/)
- [W3C MediaStream Recording](https://www.w3.org/TR/mediastream-recording/)
- [W3C Permissions Policy](https://www.w3.org/TR/permissions-policy-1/)
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [PostgreSQL advisory-lock functions](https://www.postgresql.org/docs/current/functions-admin.html#FUNCTIONS-ADVISORY-LOCKS)
