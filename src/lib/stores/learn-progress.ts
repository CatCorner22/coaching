import { create } from "zustand";
import { persist } from "zustand/middleware";
import { adoptPersistKey, safeJsonStorage } from "./persist";

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
      return {
        ...current,
        ...p,
        autoReadVoice: p.autoReadVoice ?? current.autoReadVoice,
        completed: p.completed ?? current.completed,
      };
    } },
  ),
);

export function lessonHref(last: LastLesson) {
  return last.kind === "knot" ? `/knot/${last.slug}` : `/tie/${last.slug}`;
}
