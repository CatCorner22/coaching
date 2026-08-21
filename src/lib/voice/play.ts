import { speakCoach } from "@/lib/ai/voice";
import { scrubBannedAnswer, textIsBanned } from "@/lib/ml/audit";

const cache = new Map<string, string>();
const MAX_CACHED_VOICES = 20;
let currentAudio: HTMLAudioElement | null = null;
let playbackGeneration = 0;

export function stopCoachVoice() {
  playbackGeneration += 1;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.removeAttribute("src");
    currentAudio.load();
    currentAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export async function playCoachVoice(text: string) {
  const key = textIsBanned(text) ? scrubBannedAnswer(text) : text.trim();
  if (!key) return;
  stopCoachVoice();
  const generation = playbackGeneration;
  try {
    let url = cache.get(key);
    if (!url) {
      const res = await speakCoach({ data: { text: key } });
      if (generation !== playbackGeneration) return;
      if (res.ok) {
        url = `data:${res.mime};base64,${res.b64}`;
        cache.set(key, url);
        if (cache.size > MAX_CACHED_VOICES) {
          const oldest = cache.keys().next().value as string | undefined;
          if (oldest) cache.delete(oldest);
        }
      }
    }
    if (url && generation === playbackGeneration) {
      const audio = new Audio(url);
      currentAudio = audio;
      audio.addEventListener("ended", () => {
        if (currentAudio === audio) currentAudio = null;
      }, { once: true });
      await audio.play();
      return;
    }
  } catch {
    /* fall through */
  }
  if (generation === playbackGeneration && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(key);
    u.rate = 0.95;
    u.pitch = 0.95;
    window.speechSynthesis.speak(u);
  }
}

export function listenForWords(
  words: string[],
  onHit: (word: string) => void,
): () => void {
  const SR =
    (window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec })
      .SpeechRecognition ??
    (window as unknown as { webkitSpeechRecognition?: new () => Rec }).webkitSpeechRecognition;
  if (!SR) return () => undefined;
  const rec = new SR();
  rec.continuous = true;
  rec.interimResults = false;
  rec.lang = "en-US";
  const last = new Map<string, number>();
  rec.onresult = (ev: unknown) => {
    const e = ev as {
      resultIndex: number;
      results: ArrayLike<{ 0: { transcript: string }; isFinal?: boolean }>;
    };
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = ` ${e.results[i]![0]!.transcript.toLowerCase()} `;
      const now = Date.now();
      for (const w of words) {
        const needle = w.toLowerCase().trim();
        if (!needle) continue;
        const re = new RegExp(`(?:^|[^a-z0-9])${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:[^a-z0-9]|$)`);
        if (!re.test(t)) continue;
        if ((last.get(w) ?? 0) + 2500 > now) continue;
        last.set(w, now);
        onHit(w);
      }
    }
  };
  rec.onerror = () => undefined;
  try {
    rec.start();
  } catch {
    /* already started */
  }
  return () => {
    try {
      rec.stop();
    } catch {
      /* ignore */
    }
  };
}

type Rec = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((ev: unknown) => void) | null;
  onerror: ((ev: unknown) => void) | null;
  start: () => void;
  stop: () => void;
};
