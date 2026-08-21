import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Rank = "yes" | "maybe" | "no";

export type NegItem = { id: string; label: string; rank: Rank };

export const LOCKED_NO = new Set(["neck", "breath", "suspension", "alone"]);

const STARTER: NegItem[] = [
  { id: "photos", label: "Nude photos / video for coaching", rank: "yes" },
  { id: "voice", label: "Being spoken to in protocol", rank: "yes" },
  { id: "cuffs", label: "Wrist and ankle cuffs", rank: "yes" },
  { id: "torso", label: "Chest / karada harnesses", rank: "yes" },
  { id: "gote", label: "Takate-kote (box tie)", rank: "maybe" },
  { id: "crotch", label: "Crotch rope", rank: "maybe" },
  { id: "gag", label: "Gags (with hands-free safeword)", rank: "maybe" },
  { id: "predicament", label: "Predicament / endurance", rank: "maybe" },
  { id: "marks", label: "Marks that last past tomorrow", rank: "maybe" },
  { id: "impact", label: "Impact on tied flesh", rank: "maybe" },
  { id: "cross", label: "Saint Andrew's Cross (arms up)", rank: "yes" },
  { id: "swing", label: "Sex swing as support (not a hang)", rank: "yes" },
  { id: "pole", label: "Cuffed to the pole", rank: "maybe" },
  { id: "bench", label: "Bench / table bondage", rank: "yes" },
  { id: "machine", label: "Hismith while bound", rank: "maybe" },
  { id: "toys", label: "Large toys while bound", rank: "maybe" },
  { id: "face", label: "Face in photos", rank: "maybe" },
  { id: "public", label: "Anyone else seeing the stills", rank: "no" },
  { id: "neck", label: "Anything on the neck", rank: "no" },
  { id: "breath", label: "Breath play", rank: "no" },
  { id: "suspension", label: "Full suspension", rank: "no" },
  { id: "alone", label: "Being left tied and alone", rank: "no" },
];

function clampRank(r: unknown): Rank {
  return r === "yes" || r === "maybe" || r === "no" ? r : "maybe";
}

function lockItems(items: NegItem[]): NegItem[] {
  const mapped = items.slice(0, 40).map((i) => ({
    id: String(i.id).slice(0, 80),
    label: String(i.label).slice(0, 80),
    rank: LOCKED_NO.has(i.id) ? ("no" as Rank) : clampRank(i.rank),
  }));
  const have = new Set(mapped.map((i) => i.id));
  for (const seed of STARTER) {
    if (LOCKED_NO.has(seed.id) && !have.has(seed.id)) mapped.push({ ...seed, rank: "no" });
  }
  return mapped;
}

type State = {
  items: NegItem[];
  notes: string;
  setRank: (id: string, rank: Rank) => void;
  setNotes: (n: string) => void;
  add: (label: string) => void;
};

export const useNegotiate = create<State>()(
  persist(
    (set, get) => ({
      items: STARTER,
      notes: "",
      setRank: (id, rank) =>
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, rank: LOCKED_NO.has(i.id) ? "no" : clampRank(rank) } : i,
          ),
        }),
      setNotes: (notes) => set({ notes: notes.slice(0, 600) }),
      add: (label) => {
        const clean = label.trim().slice(0, 80);
        if (!clean) return;
        set({
          items: [
            ...get().items,
            { id: crypto.randomUUID(), label: clean, rank: "maybe" as Rank },
          ].slice(0, 40),
        });
      },
    }),
    {
      name: "musubi-negotiate",
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<State>;
        const items = Array.isArray(p.items) && p.items.length ? lockItems(p.items as NegItem[]) : current.items;
        return {
          ...current,
          ...p,
          items,
          notes: typeof p.notes === "string" ? p.notes.slice(0, 600) : current.notes,
        };
      },
    },
  ),
);
