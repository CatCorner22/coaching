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

export const useKit = create<Kit>()(
  persist(
    (set) => ({
      eights: 6,
      fours: 2,
      shears: true,
      setEights: (n) => set({ eights: Math.max(0, n) }),
      setFours: (n) => set({ fours: Math.max(0, n) }),
      setShears: (v) => set({ shears: v }),
    }),
    { name: "knotty-kit" },
  ),
);
