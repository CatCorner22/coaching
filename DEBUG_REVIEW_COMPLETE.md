# Review record — learning content and Replit hardening

**Branch**: `claude/repo-analysis-testing-h2n59w` · **PR**: #21

This file records what was checked, what was built, what was wrong on the first
pass, and what is still outstanding. It is deliberately not a status banner.

---

## 1. System health

| Check | Result |
| --- | --- |
| `npm run typecheck` | 0 errors |
| `npm run lint` | 0 warnings |
| `npm test` | 586 passing, 0 failing |
| `npm run build:dev` | client, SSR and nitro builds succeed |
| Route registration | `/learn-foundations` registered in `nav.ts`; nav test passes |

No regressions found in existing features. The adult gate, negotiated-limit
gating, safeword handling, journal encryption and the offline emergency card
were not modified by this work.

## 2. Replit

Unchanged from the previous PR and re-verified here:

- `.replit` pins Node 22 to match `engines`, installs when `node_modules/.bin/vite`
  is missing, forwards 8080 → 80, and starts the dev server on Run.
- `[deployment]` points at `scripts/replit-deploy-guard.mjs`, which exits 1 with
  an explanation, so a Deployment cannot silently publish the dev server.
- `scripts/replit-deploy-guard.test.mjs` covers the exit code, the refusal text,
  the run command and the Node version match.

## 3. What was built

Seven articles under `/learn-foundations`, reachable from `/learn` and from the
More menu:

| Slug | Evidence status |
| --- | --- |
| `learning-pacing` | source_anchored — LEARN-4, LEARN-5 |
| `learning-modalities` | source_anchored — LEARN-1, LEARN-3, LEARN-4 |
| `rope-basics` | editorial_only (craft) |
| `evidence-based-teaching` | source_anchored — LEARN-1..4 |
| `spaced-learning` | source_anchored — LEARN-2 |
| `learning-disabilities-rope` | source_anchored — LEARN-1, LEARN-2 |
| `knot-foundations` | editorial_only (craft) |

Five learning-science sources added to the ledger in `src/lib/kb/sources.ts`
(`LEARN-1` … `LEARN-5`), each carrying the same evidence-limit note discipline
as the existing safety sources — including that none of them is a safety source
and none clears a tie.

## 4. What was wrong on the first pass

The first version of this content was reviewed and found to have three
substantive errors. All are fixed; they are recorded here because the same
mistakes are easy to reintroduce.

1. **It taught the learning-styles myth.** The original `learning-modalities`
   article told readers to identify their modality and use the one that suits
   them. That is the meshing hypothesis, and studies with an appropriate design
   contradict it (`LEARN-1`). It is now named and rejected in two entries, and
   pinned by a test.
2. **Three citations were wrong.** Elaboration was attributed to Bjork & Bjork
   1992 (that paper is the New Theory of Disuse, and supports spacing);
   "immediate feedback beats delayed" was asserted as settled when it is
   contested; and nine techniques were presented as equally established. The
   entry is now graded by strength of evidence rather than uniformly cited.
3. **The evidence panel contradicted the prose.** The articles appealed to
   research while registering no source anchors, so the panel read "no
   claim-level source anchors are published for this entry" directly beneath a
   paragraph describing a review's findings. Now registered in `provenance.ts`.

Two integration defects were also found and fixed: `evidence-based-teaching`
was written but left off the `/learn-foundations` list, so it was reachable
only via search; and `remedial-techniques.ts` (439 lines) was imported by
nothing and has been deleted.

### The correction that changed the design advice

The first draft assumed video is a bad format and static diagrams are the
accessible alternative. For knot tying specifically that is backwards.
Hand-manipulation tasks are the documented exception to the transient
information effect, and knot tying is one of the tasks it was tested on:
watching a demonstrator's hands beat static graphics (`LEARN-3`). The problem
with the tutorials is pacing and control, not motion — which is the segmenting
principle (`LEARN-4`), whose stated boundary conditions are complex material,
fast presentation, and an inexperienced learner.

This strengthens rather than weakens the case for the model-demonstration
videos, provided they are built as short user-paced segments and not as one
continuous clip.

## 5. Tests added

Four invariants in `src/lib/kb/kb.test.ts`, each mutation-tested by breaking
what it checks and confirming the failure:

- an article that appeals to research carries source anchors — plus a
  guards-the-guard assertion, because the first version of this test looked for
  surname-and-year citations, matched zero articles, and asserted nothing;
- the learning entries do not reintroduce "auditory/visual/kinesthetic learner"
  framing;
- the two entries that name the myth do so only alongside its rejection;
- the anchored/editorial split is pinned per slug in both directions.

## 6. Outstanding

- **No model imagery exists.** `VISUAL_MODEL_IMPLEMENTATION.md` is a
  specification and a research case. Nothing has been generated; that cannot be
  done from this environment.
- **The verbal `speak` scripts were not individually reviewed.** The request
  covered all instructions "including without limitation verbal scripts". The
  new learning content was written and corrected, but the per-step spoken lines
  across the existing tie and knot catalog have not been audited line by line.
- **No user testing.** Every accessibility claim here is a design argument from
  published research, not a measured result with this app.
