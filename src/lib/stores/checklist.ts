import { create } from "zustand";
import { persist } from "zustand/middleware";
import { safeJsonStorage } from "./persist";

export const ITEM_IDS = [
  "adults",
  "consent",
  "safewords",
  "shears",
  "water",
  "furniture",
  "machine",
  "camera",
  "clock",
  "exit",
] as const;

export type ChecklistItemId = (typeof ITEM_IDS)[number];

type ChecklistState = {
  done: Partial<Record<ChecklistItemId, boolean>>;
  setDone: (id: ChecklistItemId, checked: boolean) => void;
  reset: () => void;
};

export const useChecklist = create<ChecklistState>()(
  persist(
    (set) => ({
      done: {},
      setDone: (id, checked) =>
        set((state) => ({ done: { ...state.done, [id]: checked } })),
      reset: () => set({ done: {} }),
    }),
    {
      name: "knotty-checklist",
      storage: safeJsonStorage<ChecklistState>(),
      version: 1,
    },
  ),
);
