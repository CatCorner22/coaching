import { create } from "zustand";
import { persist } from "zustand/middleware";
import { adoptPersistKey, safeJsonStorage, syncPersistedAcrossTabs } from "./persist";

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
  // A safeword the microphone can never hear is worse than a default one,
  // because nothing says it is not working. Speech recognition emits words, so
  // "!!!", "42", "$$" and an emoji were all accepted and all undetectable.
  // Digits are the subtle case: a recognizer transcribes "42" as "forty two",
  // never as the digits, so it fails silently too.
  if (!/\p{L}{2}/u.test(s)) return fallback;
  if (/[^\p{L}\p{M}\s'’-]/u.test(s)) return fallback;
  return s;
}

type SettingsState = Settings & {
  set: (p: Partial<Settings>) => void;
  enter: () => void;
  resetConsent: () => void;
};

export const CURRENT_CONSENT_VERSION = 5;

/** Normalize an untrusted persisted snapshot without carrying unknown fields forward. */
export function normalizePersistedSettings(persisted: unknown, current: Settings): Settings {
  const p = (persisted ?? {}) as Partial<Settings>;
  const consentVersion = p.consentVersion === CURRENT_CONSENT_VERSION ? CURRENT_CONSENT_VERSION : 0;
  const consented = p.consented === true && consentVersion === CURRENT_CONSENT_VERSION;
  const adults = consented || p.adults === true;
  const shears = consented || p.shears === true;
  const photosOk = consented || p.photosOk === true;
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
      enter: () =>
        set({
          consentVersion: CURRENT_CONSENT_VERSION,
          consented: true,
          adults: true,
          shears: true,
          photosOk: true,
        }),
      // Withdrawing consent also drops the consent-bearing cloud-voice and mic
      // opt-ins, so the live state matches the hydration invariant (voice and
      // listen require consented) instead of lingering enabled until reload.
      resetConsent: () => set({ consented: false, voice: false, listen: false }),
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

// Propagate a consent reset (which also clears voice/mic) from another tab.
syncPersistedAcrossTabs("knotty-settings", () => {
  void useSettings.persist.rehydrate();
});
