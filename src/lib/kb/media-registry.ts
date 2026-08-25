import type { LearnMedia, WrapSpec } from "./types";

/** Registered procedural diagram ids (KnotFigure). */
export const FOUNDATION_DIAGRAM_IDS = [
  "somerville-bowline-0",
  "somerville-bowline-1",
  "somerville-bowline-2",
  "somerville-bowline-3",
  "larks-head-0",
  "larks-head-1",
  "double-half-hitch-0",
  "double-half-hitch-1",
  "square-0",
  "square-1",
  "half-hitch-0",
  "overhand-on-bight-0",
  "figure-eight-0",
] as const;

export const REGISTERED_DIAGRAM_IDS = new Set<string>(FOUNDATION_DIAGRAM_IDS);

/** Optional silent prop loops — procedural SVG is the default when missing. */
export const LEARN_VIDEO_POSTERS: Record<string, string> = {
  "somerville-bowline": "/learn/knots/somerville-bowline/poster.svg",
  "single-column": "/learn/ties/single-column/poster.svg",
};

export function registerDiagramId(id: string) {
  REGISTERED_DIAGRAM_IDS.add(id);
}

export function isRegisteredDiagram(diagramId: string) {
  return REGISTERED_DIAGRAM_IDS.has(diagramId);
}

export function knotVideoSrc(slug: string, stepIndex: number) {
  return `/learn/knots/${slug}/step-${stepIndex}.webm`;
}

export function tieVideoSrc(slug: string, kind: "overview" | `step-${number}` = "overview") {
  return `/learn/ties/${slug}/${kind}.webm`;
}

/**
 * Demonstration of a person's hands working the step, kept on its own path so
 * it cannot collide with the ambient prop loop above. Nothing exists at these
 * paths yet; `LearnVideo` HEAD-checks and stays hidden until a file lands, so
 * the slot is declared on every step and costs nothing until it is filled.
 */
export function knotDemoSrc(slug: string, stepIndex: number) {
  return `/learn/knots/${slug}/demo-${stepIndex}.webm`;
}

export function tieDemoSrc(slug: string, stepIndex: number) {
  return `/learn/ties/${slug}/demo-${stepIndex}.webm`;
}

export function knotPoster(slug: string) {
  return LEARN_VIDEO_POSTERS[slug] ?? `/learn/knots/${slug}/poster.svg`;
}

export function tiePoster(slug: string) {
  return LEARN_VIDEO_POSTERS[slug] ?? `/learn/ties/${slug}/poster.svg`;
}

/** Default media stack for a knot step: diagram + optional silent loop. */
export function defaultKnotStepMedia(slug: string, stepIndex: number, diagramId: string): LearnMedia[] {
  registerDiagramId(diagramId);
  return [
    { kind: "diagram", diagramId },
    { kind: "video", src: knotVideoSrc(slug, stepIndex), poster: knotPoster(slug) },
    { kind: "video", src: knotDemoSrc(slug, stepIndex), poster: knotPoster(slug), mode: "demo" },
  ];
}

/** Default media for a tie step: cumulative wraps diagram + optional loop. */
export function defaultTieStepMedia(wraps: WrapSpec[], slug: string, stepIndex: number): LearnMedia[] {
  return [
    { kind: "wraps", wraps },
    { kind: "video", src: tieVideoSrc(slug, `step-${stepIndex}`), poster: tiePoster(slug) },
    { kind: "video", src: tieDemoSrc(slug, stepIndex), poster: tiePoster(slug), mode: "demo" },
  ];
}

export function resolveStepMedia(media: LearnMedia[] | undefined, fallback: LearnMedia[]): LearnMedia[] {
  return media?.length ? media : fallback;
}
