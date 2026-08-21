import { create } from "zustand";
import { persist } from "zustand/middleware";

type Kit = {
  eights: number;
  fours: number;
  shears: boolean;
  setEights: (n: number) => void;
  setFours: (n: number) => void;
  setShears: (v: boolean) => void;
};

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
      setEights: (n) => set({ eights: clampCount(n, 0) }),
      setFours: (n) => set({ fours: clampCount(n, 0) }),
      setShears: (v) => set({ shears: v }),
    }),
    {
      name: "knotty-kit",
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Kit>;
        return {
          ...current,
          eights: clampCount(p.eights, current.eights),
          fours: clampCount(p.fours, current.fours),
          shears: typeof p.shears === "boolean" ? p.shears : current.shears,
        };
      },
    },
  ),
);
