import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Rank } from "./negotiate";

export type Side = "a" | "b";
type State = {
  names: Record<Side, string>;
  answers: Record<Side, Record<string, Rank>>;
  notes: Record<Side, { health: string; aftercare: string }>;
  setNote: (side: Side, key: "health" | "aftercare", text: string) => void;
  setName: (side: Side, name: string) => void;
  setAnswer: (side: Side, id: string, rank: Rank) => void;
  clearSide: (side: Side) => void;
};

/** Each partner's private boundaries answers, kept only on this device. */
export const useBoundaries = create<State>()(
  persist(
    (set, get) => ({
      names: { a: "Partner A", b: "Partner B" },
      answers: { a: {}, b: {} },
      notes: { a: { health: "", aftercare: "" }, b: { health: "", aftercare: "" } },
      setNote: (side, key, text) =>
        set({ notes: { ...get().notes, [side]: { ...get().notes[side], [key]: text.slice(0, 600) } } }),
      setName: (side, name) =>
        set({ names: { ...get().names, [side]: name.slice(0, 40) } }),
      setAnswer: (side, id, rank) =>
        set({
          answers: { ...get().answers, [side]: { ...get().answers[side], [id]: rank } },
        }),
      clearSide: (side) => set({ answers: { ...get().answers, [side]: {} } }),
    }),
    { name: "knotty-boundaries" },
  ),
);
