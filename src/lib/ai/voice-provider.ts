import { verifyGrokZeroDataRetentionForRequest, zeroDataRetentionRequired } from "./grok";

const TTS_TIMEOUT_MS = 15_000;
const MAX_TTS_BYTES = 1024 * 1024;

export type VoiceProviderResult =
  | { ok: true; mime: string; b64: string }
  | {
      ok: false;
      error: string;
      reason?: "zdr_missing" | "http_error" | "rate_limited" | "timeout" | "network";
      retryAfterMs?: number;
    };

/** Send one reviewed line only after a same-key, per-call ZDR preflight. */
export async function requestGrokVoice(options: {
  apiKey: string | undefined;
  text: string;
  voiceId?: string;
  signal?: AbortSignal;
}): Promise<VoiceProviderResult> {
  const apiKey = options.apiKey?.trim();
  if (!apiKey || !zeroDataRetentionRequired()) {
    return { ok: false, error: "Voice is not available" };
  }
  const preflight = await verifyGrokZeroDataRetentionForRequest(apiKey, options.signal);
  if (!preflight.ok) {
    return {
      ok: false,
      error:
        preflight.reason === "zdr_missing"
          ? "No voice was sent to xAI. Zero data retention could not be confirmed."
          : "Cloud voice is temporarily unavailable.",
      reason: preflight.reason,
      ...(preflight.retryAfterMs === undefined ? {} : { retryAfterMs: preflight.retryAfterMs }),
    };
  }
  if (!zeroDataRetentionRequired() || options.signal?.aborted) {
    return { ok: false, error: "Voice privacy preflight failed" };
  }

  const controller = new AbortController();
  const relayAbort = () => controller.abort(options.signal?.reason);
  if (options.signal?.aborted) relayAbort();
  else options.signal?.addEventListener("abort", relayAbort, { once: true });
  const timeout = setTimeout(
    () => controller.abort(new Error("Voice request timed out")),
    TTS_TIMEOUT_MS,
  );
  let zeroDataRetentionConfirmed = false;
  try {
    const response = await fetch("https://api.x.ai/v1/tts", {
      method: "POST",
      cache: "no-store",
      redirect: "error",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text: options.text,
        voice_id: options.voiceId ?? "eve",
        language: "en",
      }),
      signal: controller.signal,
    });
    if (response.headers.get("x-zero-data-retention") !== "true") {
      await response.body?.cancel().catch(() => undefined);
      return { ok: false, error: "Voice privacy confirmation unavailable" };
    }
    zeroDataRetentionConfirmed = true;
    if (!response.ok) {
      await response.body?.cancel().catch(() => undefined);
      return { ok: false, error: `TTS ${response.status}` };
    }
    const mime = response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ?? "";
    if (!mime.startsWith("audio/")) {
      await response.body?.cancel().catch(() => undefined);
      return { ok: false, error: "Voice service returned an unexpected content type" };
    }
    const declared = Number(response.headers.get("content-length"));
    if (Number.isFinite(declared) && declared > MAX_TTS_BYTES) {
      await response.body?.cancel().catch(() => undefined);
      return { ok: false, error: "Voice response was too large" };
    }
    const buffer = await readVoiceBounded(response, MAX_TTS_BYTES);
    return { ok: true, mime, b64: buffer.toString("base64") };
  } catch {
    return {
      ok: false,
      error: zeroDataRetentionConfirmed
        ? options.signal?.aborted
          ? "Voice request cancelled"
          : controller.signal.aborted
            ? "Voice request timed out"
            : "Voice response failed"
        : "Voice privacy confirmation unavailable",
    };
  } finally {
    options.signal?.removeEventListener("abort", relayAbort);
    clearTimeout(timeout);
  }
}

export async function readVoiceBounded(response: Response, maxBytes: number): Promise<Buffer> {
  if (!response.body) return Buffer.alloc(0);
  const reader = response.body.getReader();
  const chunks: Buffer[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) throw new Error("Voice response was too large");
      chunks.push(Buffer.from(value));
    }
    return Buffer.concat(chunks, total);
  } catch (error) {
    await reader.cancel().catch(() => undefined);
    throw error;
  } finally {
    reader.releaseLock();
  }
}
