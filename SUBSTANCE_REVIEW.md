# Substance review

Review date: 2026-08-27
Reviewed `main`: `155c518`

This review asks one question of every claim the app makes: is it backed by
working code and real content, or is it veneer? It was conducted as four
independent deep passes (knowledge-base content, local image pipeline, server
AI/privacy path, client feature claims) plus first-hand verification of every
Critical and Major finding, the full quality gates, external citation checks,
and a browser walkthrough of the running app. It does not restate
`OMNIBUS_REVIEW.md`; where a prior claim has drifted from the code, that drift
is a finding here.

## Verdict

The app is substantially real. The content is genuine craft instruction with
verified citations, the safety boundary is enforced in the data and by tests,
and the privacy path is implemented at or above what the README claims. But the
review found one Critical defect — a second, ungated camera-and-analysis path
on the tie pages that skips everything the Studio path enforces — and a set of
Major gaps where a README sentence is stronger than the code behind it.

## Gates (this checkout, Node 22)

- `npm test`: 590 passing, 0 failing (groups: 304, 41, 214, 31)
- `npm run typecheck`: 0 errors
- `npm run lint`: 0 warnings
- `npm run build`: passes (client, SSR, nitro/Vercel)
- Browser: adult gate, home, learn, negotiate, knowledge, nerves, studio,
  library, tie/knot/article pages all render with real content on desktop and
  mobile; no uncaught errors. The only console noise is 404s from HEAD probes
  for model-demonstration videos that were never generated (see m9).

## Critical

**C1 — The tie pages carry a second camera path that skips the entire consent
architecture.** Every non-instructor tie page mounts `AcademyObservePanel`
(via `AcademyCoachPanel`), which opens the camera without checking the
negotiated `photos` limit, and whose "Cloud observe" submits a still with all
nine per-batch attestations hardcoded to `true` from a settings toggle
(`src/components/learn/academy-observe-panel.tsx:181-193`): no per-batch
attestation UI, no one-hour window, no one-use batch. This falsifies the
README's central claims that "the `photos` limit gates the whole camera path"
and "per batch: legal-adult attestation; separate … attestations." The cloud
call fails today only by accident — it mints `batchId = academy-${Date.now()}`
while the server requires a UUID (`src/lib/ai/analyze.ts:186`) — so the button
is broken *and* the consent fabrication is latent behind that one string. Two
independent review passes found this same defect. Fix both together: either
route the panel through the real attestation flow and the `photos` limit, or
remove its cloud path and camera until it can honor them.

## Major

**M1 — Plain "yellow" is not always heard.** The mic listener is armed with
`[settings.safeword, settings.yellowWord, "red"]`
(`src/routes/studio.tsx:244`). The handler's `t === "yellow"` branch (line 250)
is unreachable once a custom yellow word is set. README: "the plain words
*red* and *yellow* are always heard as well." One-token fix.

**M2 — The two guided restraint ties are gated by no negotiation limit.**
`TIE_LIMIT_IDS` (`src/lib/studio/negotiation.ts`) omits `single-column` and
`double-column`, so both are selectable in Studio with every limit at "no" —
while the guided-shape blurb on their cards promises "may go on a consenting
adult once its negotiated limit is agreed" (`src/lib/kb/tie-factories.ts:420`),
and a directly relevant `cuffs` limit row exists unused. Relatedly, the tie
pages (`src/routes/tie.$slug.tsx`) never read the negotiation store at all, so
"stays blocked until that limit is set to yes" is true only of Studio, and the
README's "Unoccupied prop drills, such as the single column, are open from the
start" is stale — the catalog's `single-column` is an on-a-person guided tie
(its dowel counterpart is the `cuff-pattern` drill). The coverage test asserts
the limit invariant only for instructor routes, so nothing catches this.

**M3 — Upload scope does not exist server-side, and the prompt contradicts the
configuration.** `mediaUploadScope` is read only by client code. The server
validates a single fixed `nonExplicit: z.literal(true)` bit that the client
sends identically under both scope settings — under `adult_nudity` only the
checkbox wording changes — so the server cannot distinguish which attestation
was made and enforces nothing about scope. Meanwhile the system prompt tells
the model it is a classifier for "non-explicit media" (`analyze.ts:23`) even
though this repo is configured `adult_nudity`. README line "What may be
uploaded is an operator setting" is, mechanically, a change of checkbox text.
Either wire the scope into the request and prompt, or state the boundary with
the same honesty the README already uses for the non-explicit attestation.

**M4 — `knot-foundations` contradicts the knot catalog, once dangerously.**
The article (`src/lib/kb/learning-pedagogy.ts`) says the square knot is
"completely predictable and not slip … used when you are joining two separate
ropes" — the classic square-knot-as-bend myth that the catalog's own square
knot entry correctly debunks ("the interlocked bights slide, capsize … the
ends work loose", `src/lib/kb/knots.ts:253`). It also blesses the lark's head
as the start of "every single shibari tie" (the catalog restricts it to
unoccupied objects because it cinches) and the overhand-on-a-bight for
"attachment points" (the catalog: "can jam … do not load it"), and promises
"you never have to guess whether a loop is safe," against the app's own
no-clearance doctrine. The catalog is right; the article needs correcting.

**M5 — File-imported photos skip the detail-crop blur check.**
`camera-capture.tsx:770` calls `scoreFrame(imageData)` without the
`detailData` the pipeline provides; live capture and video stills pass it
correctly. The codebase itself documents that scoring focus on the 240px
downscale understates blur (`src/lib/camera/quality.ts:147-149`, pinned by a
test). Consequence: a blurred imported photo can grade `focus: "adequate"`,
flipping `usable_for_requested_conclusion` and moving the report from
"abstain" to "low" confidence — the one place local quality gating errs
anti-conservative.

**M6 — README counts and framings have drifted.** 92 articles, not 85 (the
app's own home page says 92); the "single column is open from the start" prop
sentence (see M2); and "apparent or ambiguous minor age, and secretly or
coercively obtained media … are refused outright" describes required
attestations, a coercion triage stop, and passthrough of provider refusals —
not detection, which the prompt itself forbids ("Never infer age"). The
honest framing used for the nudity boundary ("an operator attestation, not
automatic content moderation") should extend to these two.

## Minor

- **m1** Recording a 3-second practice clip kills the live camera: the cleanup
  effect in `academy-observe-panel.tsx:58-61` depends on `clipUrl`, so each
  finished clip tears down the preview; `busy` is also released while the
  recording is still running.
- **m2** Karada's declared `knots: ["larks-head", "square", "reverse-tension"]`
  (`guided-ties.ts:337`) does not match its steps, which use overhand knots
  and diamond threading, with no lark's head anywhere.
- **m3** The Somerville bowline's summary still says "taught here only as an
  unoccupied handling drill" (`knots.ts:11`) while guided `single-column`
  step 5 applies it on a person and defers to that entry for hand movements.
- **m4** Unreachable neck-overlap UI: `WrapOverlay`'s "Possible neck overlap"
  badge and the academy "Pause — possible neck overlap" headline key on
  `neckRope > 0.08`, but `observeFrame` hardcodes `neckRope: 0` — shown but
  never computable. The academy panel also renders a made-up-precision
  "guessed N% confidence" from an uncalibrated distance transform.
- **m5** Cloud voice charges its quota before the ZDR preflight
  (`src/lib/ai/voice.ts:25`), so a privacy-misconfigured deployment burns the
  20-per-10-minute budget on every attempt.
- **m6** Batch replay is keyed on a client-minted UUID, not a media digest —
  exactly what the README words, but worth knowing: a modified client can
  resubmit identical images under fresh UUIDs, capped only by the vision
  quota. The one-hour consent window likewise trusts a client timestamp.
- **m7** "Weakness is a late sign of nerve compression, arriving after
  sensation" (`technique-articles.ts:290`) oversimplifies: acute radial
  compression often presents motor-first (wrist drop) — the direction of the
  advice is safe, the physiology claim is off.
- **m8** A few core articles are skeletal (36–44 words: `warmup-stretch`,
  `time-and-clocks`, `gear-care`, `furniture`); `furniture` overlaps the
  better `furniture-not-hardpoints`.
- **m9** Every taught tie/knot page HEAD-probes step/demo videos that were
  never generated (no `public/learn/` exists); the component hides itself
  gracefully, but each page logs 404 console errors and wastes requests.
  `VISUAL_MODEL_IMPLEMENTATION.md` remains a spec with no assets.
- **m10** Dead exports in the image pipeline (`meanPaleness`, `palenessScore`,
  `deltaE`, `linearSlope`, `enhanceContrast`, `sampleHands`,
  `applyModelSelfAudit`) and legacy zeroed physiology fields threaded through
  the types — inert, but a resurrection risk.
- **m11** `https://*.grok-sandbox.com` origins are accepted unconditionally,
  including in production (`src/lib/ai/origin.ts:63-67`); practical exposure
  is low behind the same-site check, but a deployed app nominally trusts
  preview origins. With `BETTER_AUTH_URL` unset, every AI request 403s —
  fail-closed, but a misconfiguration mode worth documenting.

## What stood up

- **The safety boundary is honored in the data.** All 63 ties enumerate as
  3 guided + 12 prop drills + 48 instructor routes; every TK/chest-harness,
  suspension, neck, and gag category is recognition-only via
  `instructorRoute()` with a test enforcing it. No taught step sequence
  constructs a high-risk category. The locked-four limits are pinned to "no"
  at every layer (store write, hydration merge, UI) with tests.
- **The content is real craft, not filler.** The taught sequences are
  mechanically correct and specific (gauge-from-header to stop cumulative
  drift, half-knot handedness, slack migration); a shingle scan across all 92
  articles found no near-duplicates; every spot-checked citation is real and
  correctly characterized, including the Khodulev rope-bondage radial
  neuropathy paper (PMID 37384078) and Schori's BDSM fatality review
  (PMID 34383118), and the ledger's notes honestly state what each source
  cannot establish.
- **The ZDR path exceeds its README description**: fixed uncached probe with
  the snapshotted key, redirects as hard errors, the retention header
  re-required before any body read, byte-bounded response reads, and
  post-dispatch ambiguity classified as a privacy failure with the batch kept
  closed. No user text reaches the model at all; output passes provider-side
  strict schema, strict local Zod, and a ~350-line cross-field validator that
  hard-bans clearance dispositions; model prose is never shown.
- **The local image pipeline is honest.** It is classical signal processing
  (band detection, blur/exposure scoring), physiology outputs are hardcoded to
  zero and re-zeroed server-side, no local signal can raise a consequence
  tier, and the fairness test exercises real cross-skin-tone failure
  directions rather than a token case.
- **The journal vault exceeds its claims** (header bound as AAD so an
  iteration-downgrade fails the GCM tag; bounded import cost; tombstones that
  survive backup/restore), and the negotiation persistence layer —
  restrictive-wins merge, monotonic stamps against clock skew, cross-tab
  revocation — is the best code in the repo, with the stale-tab-resurrection
  case directly tested.

## Fix order

1. C1 — close or legitimize the tie-page camera/analyze path.
2. M1 — arm `"yellow"`.
3. M2 — map `single-column`/`double-column` to a limit (the unused `cuffs`
   row) and extend the coverage test beyond instructor routes.
4. M4 — correct `knot-foundations` against the knot catalog.
5. M5 — pass `detailData` on the file-import path.
6. M3 + M6 — align the scope/prompt/server story and refresh the README.
