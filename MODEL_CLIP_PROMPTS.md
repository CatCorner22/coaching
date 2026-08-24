# Demonstration clip generation — prompts and drop-in paths

**I could not generate these.** This session has no image or video generation
capability. What follows is the prompt pack to paste into a generator you have
access to, and the exact paths where the output drops into the app.

## What the research says to commission

Worth reading before you spend money on this, because it should change the shot
list. The finding that justifies model footage at all is about **hands
manipulating rope** — hand-manipulation tasks are the documented exception to
the rule that moving displays teach worse than stills, and knot tying is one of
the tasks it was tested on. The instructional payload is in the hands, the
rope, and the movement.

The body is not carrying the teaching load. So if the budget is finite, spend
it on close hand work across all six knots rather than on full-body renders of
one. A wide topless shot of a model holding rope teaches nothing a diagram does
not; a tight, well-lit shot of two hands feeding a bight through a collar
teaches the step.

Second hard requirement: **short, one step per clip, no autoplay.** A single
continuous run-through recreates the exact format the pacing article tells the
reader was the problem. The player has been built to enforce this — demo clips
render with controls and without autoplay or looping.

## Drop-in paths

The pipeline is live. `LearnVideo` HEAD-checks each path and stays invisible
until a file exists, so you can add clips one at a time with no code change.

| Clip | Path |
| --- | --- |
| Knot step demo | `public/learn/knots/<slug>/demo-<stepIndex>.webm` |
| Tie step demo | `public/learn/ties/<slug>/demo-<stepIndex>.webm` |
| Ambient prop loop | `public/learn/knots/<slug>/step-<stepIndex>.webm` |
| Poster still | `public/learn/knots/<slug>/poster.svg` |

Step indices are zero-based. The six foundation knots and their step counts:

| Slug | Steps | Demo files needed |
| --- | --- | --- |
| `somerville-bowline` | 4 | `demo-0` … `demo-3` |
| `larks-head` | 2 | `demo-0`, `demo-1` |
| `double-half-hitch` | 2 | `demo-0`, `demo-1` |
| `square` | 2 | `demo-0`, `demo-1` |
| `half-hitch` | 1 | `demo-0` |
| `overhand-on-bight` | 1 | `demo-0` |

Twelve clips covers every foundation knot step. Format: WebM (VP9), 5–15
seconds, no audio, ≤2 MB each.

## Base prompt

Paste into Midjourney / DALL·E / Stable Diffusion / a video model, then append
one shot line from the next section.

> Photorealistic instructional photography. A woman in her early twenties,
> unambiguously adult, goth aesthetic — long dark hair, pale-to-medium skin,
> simple dark clothing. Calm, neutral, professional expression. Plain neutral
> mid-grey seamless background. Even, soft, shadow-free studio lighting from
> the front. Natural-fibre rope in a warm ochre tone, clearly contrasting
> against both skin and background. Sharp focus on the hands and the rope.
> Photographic realism, no illustration or stylisation, no text or watermark.

Notes on why each constraint is there, so you can adapt without losing the
teaching value:

- **Rope colour contrasting with skin** — a learner has to distinguish rope
  from hand at a glance. Matching tones destroys the shot's whole purpose.
- **Shadow-free frontal lighting** — a cast shadow across a crossing reads as
  an extra strand.
- **Plain background** — anything with structure competes with the rope path.
- **Sharp focus on hands** — the demonstration is the hands. A shallow
  depth-of-field portrait look defeats it.
- **Unambiguously adult** — non-negotiable. Reject any output where this is
  even slightly uncertain, regardless of how good the rope work looks.

## Shot list — Somerville Bowline

Each line matches one lesson step, so the clip and the written instruction stay
in step. Append to the base prompt.

- `demo-0` — Both hands holding a folded bight of rope against a smooth
  vertical wooden post, generous slack visible, both rope ends in frame.
- `demo-1` — Close on both hands pushing the working bight upward through the
  rope collar around the post, bottom to top, collar lying flat.
- `demo-2` — Close on hands taking the working bight around the two standing
  parts and feeding it back down through the same opening.
- `demo-3` — Hands neatening the finished knot flat against the post, then
  drawing the standing parts gently while the loop stays visibly open.

## Shot list — remaining five

- `larks-head/demo-0` — Hands finding the rope's midpoint and folding it into
  an even bight, both ends hanging level.
- `larks-head/demo-1` — Bight passed around the post and both ends fed through
  it, drawn snug and flat, ends leaving on the same side.
- `double-half-hitch/demo-0` — Working end taken around the standing part and
  through its own loop, snugged flat.
- `double-half-hitch/demo-1` — The identical wrap repeated in the same
  direction, both hitches dressed flat and parallel.
- `square/demo-0` — On loose cord on a plain surface, right end crossed over
  left and tucked under, left deliberately slack.
- `square/demo-1` — Left crossed over right and tucked under, the flat
  symmetrical form shown, then untied.
- `half-hitch/demo-0` — On an unoccupied post, working end around the standing
  part and through its own loop, dressed flat.
- `overhand-on-bight/demo-0` — On loose cord, a bight folded, passed through
  the sample loop, dressed flat, then untied.

## Rejecting output

Discard and regenerate on any of these, regardless of image quality:

- The subject's adulthood is anything less than obvious.
- Rope path is anatomically impossible, or a strand vanishes and reappears —
  generators get knot topology wrong constantly, and a plausible-looking
  wrong knot is worse than no clip at all. **Check every frame against the
  diagram before shipping it.**
- Rope tone too close to skin tone to distinguish at a glance.
- Anything on or near the neck, or any suggestion of load bearing.
- Hands cropped out of frame at the moment the step happens.

That second one is the real risk. Image models produce confident, attractive,
topologically incorrect knots, and a learner copying one would build a knot
that fails. Every clip needs a human check against the written step before it
goes in `public/`.
