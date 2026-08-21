import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Rank = "yes" | "maybe" | "no";

export type NegItem = { id: string; label: string; rank: Rank };

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
        set({ items: get().items.map((i) => (i.id === id ? { ...i, rank } : i)) }),
      setNotes: (notes) => set({ notes }),
      add: (label) =>
        set({
          items: [
            ...get().items,
            { id: crypto.randomUUID(), label, rank: "maybe" as Rank },
          ],
        }),
    }),
    { name: "musubi-negotiate" },
  ),
);
