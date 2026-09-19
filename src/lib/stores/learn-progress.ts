import { create } from "zustand";
import { persist } from "zustand/middleware";
import { adoptPersistKey, safeJsonStorage, syncPersistedAcrossTabs } from "./persist";

export type LessonKind = "knot" | "tie";

type LastLesson = {
  kind: LessonKind;
  slug: string;
  step: number;
};

type LearnProgressState = {
  /** `${kind}:${slug}` → completed step indices */
  completed: Record<string, number[]>;
  last?: LastLesson;
  autoReadVoice: boolean;
  markStepComplete: (kind: LessonKind, slug: string, step: number) => void;
  isStepComplete: (kind: LessonKind, slug: string, step: number) => boolean;
  setLast: (last: LastLesson) => void;
  setAutoReadVoice: (on: boolean) => void;
  progressFor: (kind: LessonKind, slug: string, totalSteps: number) => number;
};

adoptPersistKey("knotty-learn", "musubi-learn");

function key(kind: LessonKind, slug: string) {
  return `${kind}:${slug}`;
}

/**
 * Keep only lesson keys whose value is a list of step indices.
 *
 * Every reader treats these as arrays (`.includes`, spread), so a blob of
 * another shape — an older build, a hand-edited or partially restored profile —
 * parsed as valid JSON and then threw out of a render, blanking the lesson.
 */
export function normalizeCompleted(value: unknown): Record<string, number[]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, number[]> = {};
  for (const [lesson, steps] of Object.entries(value as Record<string, unknown>)) {
    if (!Array.isArray(steps)) continue;
    const clean = steps
      .map((step) => Number(step))
      .filter((step) => Number.isInteger(step) && step >= 0 && step < 500)
      .sort((a, b) => a - b);
    out[lesson.slice(0, 120)] = [...new Set(clean)];
  }
  return out;
}

/** Union two tabs' completed maps: finishing a step is never undone by the other tab. */
function mergeCompleted(
  persisted: Record<string, number[]>,
  current: Record<string, number[]>,
): Record<string, number[]> {
  const out: Record<string, number[]> = { ...current };
  for (const [lesson, steps] of Object.entries(persisted)) {
    out[lesson] = [...new Set([...(out[lesson] ?? []), ...steps])].sort((a, b) => a - b);
  }
  return out;
}

export const useLearnProgress = create<LearnProgressState>()(
  persist(
    (set, get) => ({
      completed: {},
      autoReadVoice: true,
      markStepComplete: (kind, slug, step) => {
        const k = key(kind, slug);
        const prev = get().completed[k] ?? [];
        if (prev.includes(step)) return;
        set({
          completed: { ...get().completed, [k]: [...prev, step].sort((a, b) => a - b) },
          last: { kind, slug, step },
        });
      },
      isStepComplete: (kind, slug, step) => (get().completed[key(kind, slug)] ?? []).includes(step),
      setLast: (last) => set({ last }),
      setAutoReadVoice: (on) => set({ autoReadVoice: on }),
      progressFor: (kind, slug, totalSteps) => {
        if (totalSteps <= 0) return 0;
        const done = (get().completed[key(kind, slug)] ?? []).length;
        return Math.round((done / totalSteps) * 100);
      },
    }),
    {
      name: "knotty-learn",
      // Like every other persisted store: zustand's default storage lets a
      // quota-exhausted setItem throw straight out of store actions, so
      // marking a step complete or the setLast effect crashed the lesson
      // route — and the failure never reached the persist-failure banner.
      storage: safeJsonStorage<LearnProgressState>(),
      merge: (persisted, current) => {
      const p = (persisted ?? {}) as Partial<LearnProgressState>;
      const last = p.last;
      return {
        ...current,
        last:
          last && typeof last === "object" && typeof last.slug === "string"
            ? { kind: last.kind === "knot" ? "knot" : "tie", slug: last.slug.slice(0, 120), step: Number.isInteger(last.step) ? last.step : 0 }
            : current.last,
        autoReadVoice: typeof p.autoReadVoice === "boolean" ? p.autoReadVoice : current.autoReadVoice,
        completed: mergeCompleted(normalizeCompleted(p.completed), current.completed),
      };
    } },
  ),
);

// Without this a second tab's finished steps were invisible here, and this
// tab's next write erased them.
syncPersistedAcrossTabs("knotty-learn", () => {
  void useLearnProgress.persist.rehydrate();
});

export function lessonHref(last: LastLesson) {
  return last.kind === "knot" ? `/knot/${last.slug}` : `/tie/${last.slug}`;
}
