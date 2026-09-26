import { create } from "zustand";
import { persist } from "zustand/middleware";
import { adoptPersistKey, settingsConsentMergingStorage, syncPersistedAcrossTabs } from "./persist";

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
  /**
   * Monotonic stamp on the last consent decision (enter, resetConsent, or a
   * voice/listen toggle). The write-merge in settingsConsentMergingStorage
   * compares it so a stale tab's unrelated save cannot resurrect withdrawn
   * consent — the same protection negotiation ranks already have.
   */
  consentStamp: number;
};

export const MIN_CHECK_MINUTES = 2;
export const MAX_CHECK_MINUTES = 12;

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
  consentStamp: 0,
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

/**
 * Why a spoken word was refused, for the field that offered it.
 *
 * The clamp silently reverted to the previous word, so a rejected safeword read
 * as the text box "not saving" with nothing said about the rule.
 */
export function safewordRejection(value: string): string | null {
  const s = value.trim().slice(0, 24);
  if (s.length < 2) return "Kept the previous word: a spoken word needs at least two characters.";
  if (RESERVED.has(s.toLowerCase()))
    return `Kept the previous word: “${s}” is a command word this app already listens for.`;
  if (!/\p{L}{2}/u.test(s) || /[^\p{L}\p{M}\s'’-]/u.test(s))
    return "Kept the previous word: use letters, so speech recognition can actually hear it.";
  return null;
}

/** Strictly increasing even against a backward wall-clock correction. */
function nextConsentStamp(s: Settings): number {
  return Math.max(Date.now(), (s.consentStamp || 0) + 1);
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
    consentStamp: Math.max(0, Number(p.consentStamp) || 0),
    circulationMins: Math.min(
      MAX_CHECK_MINUTES,
      Math.max(MIN_CHECK_MINUTES, Number(p.circulationMins) || current.circulationMins),
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
          // The same clamps hydration applies, so the live value never differs
          // from what will survive the next reload — an unclamped name showed
          // in full until reload, then silently changed to its truncation.
          riggerName: p.riggerName !== undefined ? String(p.riggerName).slice(0, 40) : s.riggerName,
          bottomName: p.bottomName !== undefined ? String(p.bottomName).slice(0, 40) : s.bottomName,
          honorific: p.honorific !== undefined ? String(p.honorific).slice(0, 24) : s.honorific,
          safeword: p.safeword !== undefined ? clampWord(p.safeword, s.safeword) : s.safeword,
          yellowWord: p.yellowWord !== undefined ? clampWord(p.yellowWord, s.yellowWord) : s.yellowWord,
          greenWord: p.greenWord !== undefined ? clampWord(p.greenWord, s.greenWord) : s.greenWord,
          circulationMins:
            p.circulationMins !== undefined
              ? Math.min(
                  MAX_CHECK_MINUTES,
                  Math.max(MIN_CHECK_MINUTES, Number(p.circulationMins) || s.circulationMins),
                )
              : s.circulationMins,
          consentStamp:
            p.voice !== undefined || p.listen !== undefined
              ? nextConsentStamp(s)
              : s.consentStamp,
        })),
      enter: () =>
        set((s) => ({
          consentVersion: CURRENT_CONSENT_VERSION,
          consented: true,
          adults: true,
          shears: true,
          photosOk: true,
          consentStamp: nextConsentStamp(s),
        })),
      // Withdrawing consent also drops the consent-bearing cloud-voice and mic
      // opt-ins, so the live state matches the hydration invariant (voice and
      // listen require consented) instead of lingering enabled until reload.
      resetConsent: () =>
        set((s) => ({
          consented: false,
          voice: false,
          listen: false,
          consentStamp: nextConsentStamp(s),
        })),
    }),
    {
      name: "knotty-settings",
      storage: settingsConsentMergingStorage<SettingsState>("knotty-settings"),
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
