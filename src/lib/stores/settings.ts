import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Settings = {
  consented: boolean;
  adults: boolean;
  shears: boolean;
  photosOk: boolean;
  riggerName: string;
  bottomName: string;
  honorific: string;
  style: "peer" | "ds";
  safeword: string;
  yellowWord: string;
  greenWord: string;
  voice: boolean;
  listen: boolean;
  circulationMins: number;
};

const defaults: Settings = {
  consented: false,
  adults: false,
  shears: false,
  photosOk: false,
  riggerName: "",
  bottomName: "",
  honorific: "",
  style: "ds",
  safeword: "red",
  yellowWord: "yellow",
  greenWord: "green",
  voice: true,
  listen: true,
  circulationMins: 4,
};

type SettingsState = Settings & {
  set: (p: Partial<Settings>) => void;
  enter: () => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,
      set: (p) => set(p),
      enter: () => set({ consented: true }),
    }),
    { name: "musubi-settings" },
  ),
);
