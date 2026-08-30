import { create } from "zustand";
import { persist } from "zustand/middleware";
import { safeJsonStorage, syncPersistedAcrossTabs } from "./persist";

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

const ITEM_ID_SET = new Set<string>(ITEM_IDS);

/** Keep only known item ids with boolean values. */
export function normalizeChecklistDone(value: unknown): Partial<Record<ChecklistItemId, boolean>> {
  if (!value || typeof value !== "object") return {};
  const out: Partial<Record<ChecklistItemId, boolean>> = {};
  for (const [id, checked] of Object.entries(value as Record<string, unknown>)) {
    if (ITEM_ID_SET.has(id) && typeof checked === "boolean") out[id as ChecklistItemId] = checked;
  }
  return out;
}

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
      // Explicit falses, not an empty map: the cross-tab merge unions ticks, so
      // a cleared checklist has to say each item is unticked to travel.
      reset: () => set({ done: Object.fromEntries(ITEM_IDS.map((id) => [id, false])) }),
    }),
    {
      name: "knotty-checklist",
      storage: safeJsonStorage<ChecklistState>(),
      version: 1,
      // Ticks are unioned rather than replaced: a stale tab used to erase the
      // other tab's pre-scene ticks, and the loss only showed up on reload.
      merge: (persisted, current) => ({
        ...current,
        done: {
          ...current.done,
          ...normalizeChecklistDone((persisted as { done?: unknown } | null)?.done),
        },
      }),
    },
  ),
);

syncPersistedAcrossTabs("knotty-checklist", () => {
  void useChecklist.persist.rehydrate();
});
