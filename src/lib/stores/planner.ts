import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SEQUENCES } from "@/lib/kb";
import { adoptPersistKey } from "./persist";

type PlannerState = {
  slugs: string[];
  setSlugs: (s: string[]) => void;
  add: (slug: string) => void;
  remove: (i: number) => void;
  loadSequence: (slug: string) => void;
  clear: () => void;
};

adoptPersistKey("knotty-plan", "musubi-plan");

export function normalizePlannerSlugs(persisted: unknown, fallback: string[]): string[] {
  if (!Array.isArray(persisted)) return fallback;
  return persisted
    .filter((slug): slug is string => typeof slug === "string" && slug.trim().length > 0)
    .slice(0, 40);
}

export const usePlanner = create<PlannerState>()(
  persist(
    (set, get) => ({
      slugs: [...SEQUENCES[0].steps],
      setSlugs: (slugs) => set({ slugs: normalizePlannerSlugs(slugs, []) }),
      add: (slug) => {
        const next = slug.trim();
        if (!next) return;
        const slugs = Array.isArray(get().slugs) ? get().slugs : [];
        if (slugs.includes(next)) return;
        set({ slugs: [...slugs, next] });
      },
      remove: (i) => set({ slugs: get().slugs.filter((_, idx) => idx !== i) }),
      loadSequence: (slug) => {
        const seq = SEQUENCES.find((s) => s.slug === slug);
        if (seq) set({ slugs: [...seq.steps] });
      },
      clear: () => set({ slugs: [] }),
    }),
    {
      name: "knotty-plan",
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<PlannerState>;
        return { ...current, slugs: normalizePlannerSlugs(p.slugs, current.slugs) };
      },
    },
  ),
);
