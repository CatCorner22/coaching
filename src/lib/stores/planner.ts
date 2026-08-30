import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SEQUENCES } from "@/lib/kb";
import { adoptPersistKey, safeJsonStorage, syncPersistedAcrossTabs } from "./persist";

type PlannerState = {
  slugs: string[];
  setSlugs: (s: string[]) => void;
  add: (slug: string) => void;
  remove: (i: number) => void;
  loadSequence: (slug: string) => void;
  clear: () => void;
};

adoptPersistKey("knotty-plan", "musubi-plan");

/** Coerce a possibly corrupt or legacy slug array into a bounded, unique slug list. */
export function normalizePlannerSlugs(persisted: unknown, fallback: string[]): string[] {
  if (!Array.isArray(persisted)) return [...fallback];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of persisted) {
    if (typeof value !== "string") continue;
    const slug = value.trim();
    if (!slug || seen.has(slug) || out.length >= 40) continue;
    seen.add(slug);
    out.push(slug);
  }
  return out;
}

/** Coerce a persisted (possibly corrupt or legacy) blob into a valid slug list. */
export function normalizePersistedSlugs(persisted: unknown, fallback: string[]): string[] {
  return normalizePlannerSlugs((persisted as { slugs?: unknown } | null)?.slugs, fallback);
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
      storage: safeJsonStorage<PlannerState>(),
      version: 1,
      migrate: (persisted) => persisted as PlannerState,
      merge: (persisted, current) => ({
        ...current,
        slugs: normalizePersistedSlugs(persisted, current.slugs),
      }),
    },
  ),
);

syncPersistedAcrossTabs("knotty-plan", () => {
  void usePlanner.persist.rehydrate();
});
