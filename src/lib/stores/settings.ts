import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Settings = {
  consentVersion: number;
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
  consentVersion: 0,
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

const RESERVED = new Set(["next", "analyze", "hands", "stop"]);

function clampWord(v: unknown, fallback: string) {
  const s = typeof v === "string" ? v.trim().slice(0, 24) : "";
  if (s.length < 2) return fallback;
  if (RESERVED.has(s.toLowerCase())) return fallback;
  return s;
}

type SettingsState = Settings & {
  set: (p: Partial<Settings>) => void;
  enter: () => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,
      set: (p) =>
        set((s) => ({
          ...p,
          safeword: p.safeword !== undefined ? clampWord(p.safeword, s.safeword) : s.safeword,
          yellowWord: p.yellowWord !== undefined ? clampWord(p.yellowWord, s.yellowWord) : s.yellowWord,
          greenWord: p.greenWord !== undefined ? clampWord(p.greenWord, s.greenWord) : s.greenWord,
          circulationMins:
            p.circulationMins !== undefined
              ? Math.min(12, Math.max(2, Number(p.circulationMins) || s.circulationMins))
              : s.circulationMins,
        })),
      enter: () => set({ consentVersion: 2, consented: true, adults: true, shears: true, photosOk: true }),
    }),
    {
      name: "musubi-settings",
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Settings>;
        const adults = p.adults === true;
        const shears = p.shears === true;
        const photosOk = p.photosOk === true;
        const consentVersion = p.consentVersion === 2 ? 2 : 0;
        const consented = p.consented === true && adults && shears && photosOk && consentVersion === 2;
        return {
          ...current,
          ...p,
          adults,
          shears,
          photosOk,
          consented,
          consentVersion,
          safeword: clampWord(p.safeword, current.safeword),
          yellowWord: clampWord(p.yellowWord, current.yellowWord),
          greenWord: clampWord(p.greenWord, current.greenWord),
          circulationMins: Math.min(12, Math.max(2, Number(p.circulationMins) || current.circulationMins)),
          riggerName: String(p.riggerName ?? current.riggerName).slice(0, 40),
          bottomName: String(p.bottomName ?? current.bottomName).slice(0, 40),
          honorific: String(p.honorific ?? current.honorific).slice(0, 24),
          style: p.style === "peer" || p.style === "ds" ? p.style : current.style,
          voice: p.voice !== false,
          listen: p.listen !== false,
        };
      },
    },
  ),
);
