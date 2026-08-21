import { speakCoach } from "@/lib/ai/voice";
import { scrubBannedAnswer, textIsBanned } from "@/lib/ml/audit";

type CachedVoice = { url: string; bytes: number };
const cache = new Map<string, CachedVoice>();
const inflight = new Map<string, Promise<CachedVoice | null>>();
const MAX_CACHED_VOICES = 8;
const MAX_CACHED_VOICE_BYTES = 4 * 1024 * 1024;
const MAX_INFLIGHT_VOICES = 2;
let cachedVoiceBytes = 0;
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

export function clearCoachVoiceCache() {
  stopCoachVoice();
  for (const entry of cache.values()) URL.revokeObjectURL(entry.url);
  cache.clear();
  cachedVoiceBytes = 0;
}

/**
 * Speak reviewed text. Cloud TTS is fail-closed and must be opted into by the
 * caller for this invocation; otherwise only the browser speech API is
 * considered.
 */
export async function playCoachVoice(text: string, cloudEnabled = false) {
  const key = textIsBanned(text) ? scrubBannedAnswer(text) : text.trim();
  if (!key) return;
  stopCoachVoice();
  const generation = playbackGeneration;
  if (cloudEnabled) {
    try {
      const cached = cache.get(key) ?? (await loadVoice(key, generation));
      if (cached && generation === playbackGeneration) {
        // Refresh LRU order without duplicating the object URL.
        cache.delete(key);
        cache.set(key, cached);
        const audio = new Audio(cached.url);
        currentAudio = audio;
        audio.addEventListener("ended", () => {
          if (currentAudio === audio) currentAudio = null;
        }, { once: true });
        await audio.play();
        return;
      }
    } catch {
      /* fall through to browser-local speech */
    }
  }
  if (generation === playbackGeneration && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(key);
    u.rate = 0.95;
    u.pitch = 0.95;
    window.speechSynthesis.speak(u);
  }
}

async function loadVoice(key: string, generation: number): Promise<CachedVoice | null> {
  const existing = inflight.get(key);
  if (existing) return existing;
  if (inflight.size >= MAX_INFLIGHT_VOICES) return null;
  const pending = (async () => {
    const response = await speakCoach({ data: { text: key } });
    if (!response.ok) return null;
    const bytes = base64Bytes(response.b64);
    if (!bytes.length || bytes.length > 1024 * 1024) return null;
    // Stop, discard, cache erase, and a newer spoken line all advance this
    // generation. Never let a late server response recreate cleared data.
    if (generation !== playbackGeneration) return null;
    const audioBuffer = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(audioBuffer).set(bytes);
    const entry = {
      url: URL.createObjectURL(new Blob([audioBuffer], { type: response.mime })),
      bytes: bytes.byteLength,
    };
    cache.set(key, entry);
    cachedVoiceBytes += entry.bytes;
    evictVoiceCache();
    return entry;
  })();
  inflight.set(key, pending);
  try {
    return await pending;
  } finally {
    inflight.delete(key);
  }
}

function evictVoiceCache() {
  while (cache.size > MAX_CACHED_VOICES || cachedVoiceBytes > MAX_CACHED_VOICE_BYTES) {
    const oldestKey = cache.keys().next().value as string | undefined;
    if (!oldestKey) break;
    const oldest = cache.get(oldestKey);
    cache.delete(oldestKey);
    if (oldest) {
      cachedVoiceBytes -= oldest.bytes;
      URL.revokeObjectURL(oldest.url);
    }
  }
}

function base64Bytes(value: string): Uint8Array {
  try {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  } catch {
    return new Uint8Array();
  }
}

export function listenForWords(
  words: string[],
  onHit: (word: string) => void,
  onStatus?: (status: "starting" | "active" | "idle" | "error" | "unsupported") => void,
): () => void {
  const SR =
    (window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec })
      .SpeechRecognition ??
    (window as unknown as { webkitSpeechRecognition?: new () => Rec }).webkitSpeechRecognition;
  if (!SR) {
    onStatus?.("unsupported");
    return () => undefined;
  }
  const rec = new SR();
  let disposed = false;
  const report = (status: "starting" | "active" | "idle" | "error" | "unsupported") => {
    if (!disposed) onStatus?.(status);
  };
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
  rec.onstart = () => report("active");
  rec.onerror = () => report("error");
  rec.onend = () => report("idle");
  report("starting");
  try {
    rec.start();
  } catch {
    report("error");
  }
  return () => {
    disposed = true;
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
  onstart: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
