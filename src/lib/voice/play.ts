import { speakCoach } from "@/lib/ai/voice";
import { scrubBannedAnswer, textIsBanned } from "@/lib/ml/audit";
import {
  applyCoachBrowserVoice,
  coachVoiceCacheKey,
  loadCoachBrowserVoices,
} from "@/lib/voice/coach-profile";

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
  const cacheKey = coachVoiceCacheKey(key);
  if (cloudEnabled) {
    try {
      const cached = cache.get(cacheKey) ?? (await loadVoice(key, cacheKey, generation));
      if (cached && generation === playbackGeneration) {
        // Refresh LRU order without duplicating the object URL.
        cache.delete(cacheKey);
        cache.set(cacheKey, cached);
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
    const voices = await loadCoachBrowserVoices();
    applyCoachBrowserVoice(u, voices);
    window.speechSynthesis.speak(u);
  }
}

async function loadVoice(key: string, cacheKey: string, generation: number): Promise<CachedVoice | null> {
  const existing = inflight.get(cacheKey);
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
    cache.set(cacheKey, entry);
    cachedVoiceBytes += entry.bytes;
    evictVoiceCache();
    return entry;
  })();
  inflight.set(cacheKey, pending);
  try {
    return await pending;
  } finally {
    inflight.delete(cacheKey);
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
