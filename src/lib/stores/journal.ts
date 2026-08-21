import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Disposition, SourceId } from "@/lib/observation/report";

export type JournalEntry = {
  id: string;
  at: number;
  tieSlug?: string;
  minutes: number;
  notes: string;
  flags: string[];
  disposition: Disposition;
  limitations: string[];
  sourceIds: SourceId[];
};

type JournalState = {
  entries: JournalEntry[];
  nerveHits: number;
  add: (e: Omit<JournalEntry, "id" | "at">) => string;
  remove: (id: string) => void;
  clear: () => void;
};

export const useJournal = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: [],
      nerveHits: 0,
      add: (e) => {
        const id = crypto.randomUUID();
        const nerve = e.flags.some((f) => /nerve|radial|numb/i.test(f)) ? 1 : 0;
        set({
          entries: [{ id, at: Date.now(), ...e, notes: String(e.notes ?? "").slice(0, 400) }, ...get().entries].slice(0, 80),
          nerveHits: get().nerveHits + nerve,
        });
        return id;
      },
      remove: (id) => {
        set({ entries: get().entries.filter((x) => x.id !== id) });
      },
      clear: () => set({ entries: [], nerveHits: 0 }),
    }),
    { name: "musubi-journal" },
  ),
);

const PHOTO_DB = "musubi-photos";

export function purgeLegacyStills(): Promise<void> {
  if (typeof indexedDB === "undefined") return Promise.resolve();
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(PHOTO_DB);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("Could not delete legacy stills"));
    request.onblocked = () => reject(new Error("Close other Knotty tabs, then try again."));
  });
}
