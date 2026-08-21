import { speakCoach } from "@/lib/ai/voice";

const cache = new Map<string, string>();

export async function playCoachVoice(text: string) {
  const key = text.trim();
  if (!key) return;
  try {
    let url = cache.get(key);
    if (!url) {
      const res = await speakCoach({ data: { text: key } });
      if (res.ok) {
        url = `data:${res.mime};base64,${res.b64}`;
        cache.set(key, url);
      }
    }
    if (url) {
      const audio = new Audio(url);
      await audio.play();
      return;
    }
  } catch {
    /* fall through */
  }
  if ("speechSynthesis" in window) {
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
  rec.interimResults = true;
  rec.lang = "en-US";
  rec.onresult = (ev: unknown) => {
    const e = ev as {
      resultIndex: number;
      results: ArrayLike<{ 0: { transcript: string } }>;
    };
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i]![0]!.transcript.toLowerCase();
      for (const w of words) {
        if (t.includes(w.toLowerCase())) onHit(w);
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
