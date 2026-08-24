/** Display name for the Academy verbal coach persona. */
export const COACH_VOICE_NAME = "Hannah";

/** Warm, lower-register female coach delivery for Academy verbal instructions. */
export const COACH_CLOUD_VOICE_ID = "ara";

export const COACH_BROWSER_VOICE = {
  rate: 0.86,
  pitch: 0.82,
  lang: "en-US",
} as const;

const FEMALE_VOICE_HINTS = [
  "female",
  "woman",
  "hannah",
  "samantha",
  "victoria",
  "karen",
  "moira",
  "fiona",
  "tessa",
  "zira",
  "susan",
  "aria",
  "jenny",
  "natasha",
  "serena",
  "google uk english female",
  "english (united states) — female",
  "english (united kingdom) — female",
];

const PREFERRED_FEMALE_NAMES = [
  "Hannah",
  "Samantha",
  "Victoria",
  "Karen",
  "Moira",
  "Fiona",
  "Google UK English Female",
  "Microsoft Aria Online",
  "Microsoft Jenny Online",
  "Jenny",
];

function isFemaleVoice(voice: SpeechSynthesisVoice) {
  const name = voice.name.toLowerCase();
  if (FEMALE_VOICE_HINTS.some((hint) => name.includes(hint))) return true;
  const gender = (voice as SpeechSynthesisVoice & { gender?: string }).gender;
  return gender?.toLowerCase() === "female";
}

export function pickCoachBrowserVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  const english = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  const female = english.filter(isFemaleVoice);
  for (const preferred of PREFERRED_FEMALE_NAMES) {
    const match = female.find((v) => v.name.includes(preferred));
    if (match) return match;
  }
  return female[0] ?? english[0] ?? null;
}

export async function loadCoachBrowserVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const synth = window.speechSynthesis;
  const existing = synth.getVoices();
  if (existing.length) return existing;
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      synth.removeEventListener("voiceschanged", finish);
      resolve(synth.getVoices());
    };
    synth.addEventListener("voiceschanged", finish);
    window.setTimeout(finish, 250);
  });
}

export function applyCoachBrowserVoice(
  utterance: SpeechSynthesisUtterance,
  voices: SpeechSynthesisVoice[],
) {
  utterance.rate = COACH_BROWSER_VOICE.rate;
  utterance.pitch = COACH_BROWSER_VOICE.pitch;
  utterance.lang = COACH_BROWSER_VOICE.lang;
  const voice = pickCoachBrowserVoice(voices);
  if (voice) utterance.voice = voice;
}

export function coachVoiceCacheKey(text: string) {
  return `${COACH_CLOUD_VOICE_ID}:${text}`;
}

export function coachVoiceLabel(cloudEnabled: boolean) {
  return cloudEnabled ? `${COACH_VOICE_NAME} · cloud` : `${COACH_VOICE_NAME} · browser`;
}
