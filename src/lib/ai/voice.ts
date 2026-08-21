import { createServerFn } from "@tanstack/react-start";
import { scrubBannedAnswer, textIsBanned } from "@/lib/ml/audit";

const TTS_TIMEOUT_MS = 15_000;
const MAX_TTS_BYTES = 5 * 1024 * 1024;

export const speakCoach = createServerFn({ method: "POST" })
  .validator((input: { text: unknown }) => {
    let text = String(input?.text ?? "").replace(/\s+/g, " ").trim().slice(0, 400);
    if (!text) throw new Error("Nothing to speak");
    if (textIsBanned(text)) text = scrubBannedAnswer(text);
    return { text };
  })
  .handler(async ({ data }) => {
    const { consumeAiBudget } = await import("./rate-limit.server");
    consumeAiBudget("voice", 30, 10 * 60_000);
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "Voice is not available" };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(new Error("Voice request timed out")), TTS_TIMEOUT_MS);
    try {
      const res = await fetch("https://api.x.ai/v1/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ text: data.text, voice_id: "eve", language: "en" }),
        signal: controller.signal,
      });
      if (!res.ok) return { ok: false as const, error: `TTS ${res.status}` };
      const declared = Number(res.headers.get("content-length"));
      if (Number.isFinite(declared) && declared > MAX_TTS_BYTES) {
        return { ok: false as const, error: "Voice response was too large" };
      }
      const buf = await readBounded(res, MAX_TTS_BYTES);
      return { ok: true as const, mime: "audio/mpeg", b64: buf.toString("base64") };
    } catch (error) {
      return {
        ok: false as const,
        error: controller.signal.aborted
          ? "Voice request timed out"
          : error instanceof Error
            ? error.message
            : "Voice is unavailable",
      };
    } finally {
      clearTimeout(timeout);
    }
  });

async function readBounded(response: Response, maxBytes: number): Promise<Buffer> {
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
