import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SEQUENCES } from "@/lib/kb";

type PlannerState = {
  slugs: string[];
  setSlugs: (s: string[]) => void;
  add: (slug: string) => void;
  remove: (i: number) => void;
  loadSequence: (slug: string) => void;
  clear: () => void;
};

export const usePlanner = create<PlannerState>()(
  persist(
    (set, get) => ({
      slugs: [...SEQUENCES[0].steps],
      setSlugs: (slugs) => set({ slugs }),
      add: (slug) => set({ slugs: [...get().slugs, slug] }),
      remove: (i) => set({ slugs: get().slugs.filter((_, idx) => idx !== i) }),
      loadSequence: (slug) => {
        const seq = SEQUENCES.find((s) => s.slug === slug);
        if (seq) set({ slugs: [...seq.steps] });
      },
      clear: () => set({ slugs: [] }),
    }),
    { name: "musubi-plan" },
  ),
);
