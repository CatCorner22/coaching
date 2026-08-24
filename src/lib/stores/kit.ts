import { create } from "zustand";
import { persist } from "zustand/middleware";
import { safeJsonStorage } from "./persist";

type Kit = {
  eights: number;
  fours: number;
  shears: boolean;
  setEights: (n: number) => void;
  setFours: (n: number) => void;
  setShears: (v: boolean) => void;
};

const MAX_ROPE_COUNT = 999;

/** Bound a rope count to a finite, whole, non-negative value within the cap. */
export function clampRopeCount(value: unknown, fallback: number): number {
  // Treat a missing/null field as absent so a partial persisted blob keeps the
  // default rather than silently resetting to 0 (Number(null) === 0).
  if (value == null) return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(MAX_ROPE_COUNT, Math.floor(n)));
}

/**
 * Superseded by `clampRopeCount`, and kept only because this merge brought both
 * forward and its tests still cover it. The store uses `clampRopeCount`, which
 * additionally treats a null or absent field as "keep the default" rather than
 * letting `Number(null) === 0` silently reset a persisted count to zero.
 */
export function clampCount(n: unknown, fallback: number) {
  const value = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(value)) return fallback;
  return Math.max(0, Math.min(40, Math.floor(value)));
}

export const useKit = create<Kit>()(
  persist(
    (set) => ({
      eights: 6,
      fours: 2,
      shears: true,
      setEights: (n) => set({ eights: clampRopeCount(n, 0) }),
      setFours: (n) => set({ fours: clampRopeCount(n, 0) }),
      setShears: (v) => set({ shears: Boolean(v) }),
    }),
    {
      name: "knotty-kit",
      storage: safeJsonStorage<Kit>(),
      version: 1,
      migrate: (persisted) => persisted as Kit,
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Kit>;
        return {
          ...current,
          eights: clampRopeCount(p.eights, current.eights),
          fours: clampRopeCount(p.fours, current.fours),
          shears: typeof p.shears === "boolean" ? p.shears : current.shears,
        };
      },
    },
  ),
);
