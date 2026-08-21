import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Color = "pink" | "pale" | "dusky";
export type Breath = "easy" | "work" | "hard";

export type CheckIn = {
  id: string;
  at: number;
  color: Color;
  tingle: boolean;
  breath: Breath;
  whichFinger: string;
  note: string;
};

type State = {
  logs: CheckIn[];
  add: (c: Omit<CheckIn, "id" | "at">) => void;
  clear: () => void;
};

export const useCheckIn = create<State>()(
  persist(
    (set, get) => ({
      logs: [],
      add: (c) =>
        set({
          logs: [{ id: crypto.randomUUID(), at: Date.now(), ...c }, ...get().logs].slice(0, 40),
        }),
      clear: () => set({ logs: [] }),
    }),
    { name: "knotty-checkin" },
  ),
);
