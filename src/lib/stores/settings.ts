import { create } from "zustand";
import { persist } from "zustand/middleware";
import { adoptPersistKey, safeJsonStorage } from "./persist";

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
  voice: false,
  listen: false,
  circulationMins: 4,
};

const RESERVED = new Set(["next", "analyze", "hands", "stop", "pause", "release"]);

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

/** Normalize an untrusted persisted snapshot without carrying unknown fields forward. */
export function normalizePersistedSettings(persisted: unknown, current: Settings): Settings {
  const p = (persisted ?? {}) as Partial<Settings>;
  const adults = p.adults === true;
  const shears = p.shears === true;
  const photosOk = p.photosOk === true;
  const consentVersion = p.consentVersion === 4 ? 4 : 0;
  const consented = p.consented === true && adults && shears && photosOk && consentVersion === 4;
  return {
    consentVersion,
    consented,
    adults,
    shears,
    photosOk,
    riggerName: typeof p.riggerName === "string" ? p.riggerName.slice(0, 40) : current.riggerName,
    bottomName: typeof p.bottomName === "string" ? p.bottomName.slice(0, 40) : current.bottomName,
    honorific: typeof p.honorific === "string" ? p.honorific.slice(0, 24) : current.honorific,
    style: p.style === "peer" || p.style === "ds" ? p.style : current.style,
    safeword: clampWord(p.safeword, current.safeword),
    yellowWord: clampWord(p.yellowWord, current.yellowWord),
    greenWord: clampWord(p.greenWord, current.greenWord),
    voice: consented && p.voice === true,
    listen: consented && p.listen === true,
    circulationMins: Math.min(
      12,
      Math.max(2, Number(p.circulationMins) || current.circulationMins),
    ),
  };
}

adoptPersistKey("knotty-settings", "musubi-settings");

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
      enter: () => set({ consentVersion: 4, consented: true, adults: true, shears: true, photosOk: true }),
    }),
    {
      name: "knotty-settings",
      storage: safeJsonStorage<SettingsState>(),
      version: 1,
      migrate: (persisted) => persisted as SettingsState,
      merge: (persisted, current) => {
        return {
          ...current,
          ...normalizePersistedSettings(persisted, current),
        };
      },
    },
  ),
);
