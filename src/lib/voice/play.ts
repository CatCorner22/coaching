import { speakCoach } from "@/lib/ai/voice";
import { scrubBannedAnswer, textIsBanned } from "@/lib/ml/audit";

const cache = new Map<string, string>();
let current: HTMLAudioElement | null = null;

function cacheSet(key: string, url: string) {
  cache.set(key, url);
  if (cache.size > 16) {
    const first = cache.keys().next().value;
    if (first !== undefined) cache.delete(first);
  }
}

function stopPlayback() {
  if (current) {
    current.pause();
    current.removeAttribute("src");
    current = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export async function playCoachVoice(text: string) {
  const key = textIsBanned(text) ? scrubBannedAnswer(text) : text.trim();
  if (!key) return;
  stopPlayback();
  try {
    let url = cache.get(key);
    if (!url) {
      const res = await speakCoach({ data: { text: key } });
      if (res.ok) {
        url = `data:${res.mime};base64,${res.b64}`;
        cacheSet(key, url);
      }
    }
    if (url) {
      const audio = new Audio(url);
      current = audio;
      await audio.play();
      return;
    }
  } catch {
    /* fall through */
  }
  if ("speechSynthesis" in window) {
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
  let dead = false;
  let fails = 0;
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
  rec.onerror = (ev: unknown) => {
    const err = (ev as { error?: string }).error;
    if (err === "not-allowed" || err === "service-not-allowed") dead = true;
  };
  rec.onend = () => {
    if (dead) return;
    if (fails > 6) return;
    try {
      rec.start();
    } catch {
      fails++;
    }
  };
  try {
    rec.start();
  } catch {
    /* already started */
  }
  return () => {
    dead = true;
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
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
