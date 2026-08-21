const MAX_GROK_RESPONSE_BYTES = 256 * 1024;

export async function grokChat(opts: {
  messages: unknown[];
  max_tokens?: number;
  temperature?: number;
  signal?: AbortSignal;
}): Promise<{ ok: true; text: string } | { ok: false; error: string; status?: number }> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return { ok: false, error: "AI is not available in this environment" };
  const controller = new AbortController();
  const stopRelaying = relayAbort(opts.signal, controller);
  const timeout = setTimeout(() => controller.abort(), 45_000);
  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: opts.temperature ?? 0.25,
        max_tokens: opts.max_tokens ?? 900,
        messages: opts.messages,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      await res.body?.cancel().catch(() => undefined);
      return { ok: false, error: `xAI API error ${res.status}`, status: res.status };
    }
    const contentType = res.headers.get("content-type")?.toLowerCase() ?? "";
    if (!contentType.includes("application/json")) {
      await res.body?.cancel().catch(() => undefined);
      return { ok: false, error: "xAI returned an unexpected content type" };
    }
    const declared = Number(res.headers.get("content-length"));
    if (Number.isFinite(declared) && declared > MAX_GROK_RESPONSE_BYTES) {
      await res.body?.cancel().catch(() => undefined);
      return { ok: false, error: "xAI response was too large" };
    }
    const raw = await readTextBounded(res, MAX_GROK_RESPONSE_BYTES);
    let body: {
      choices?: { message?: { content?: string | null }; finish_reason?: string }[];
    };
    try {
      body = JSON.parse(raw) as typeof body;
    } catch {
      return { ok: false, error: "xAI returned invalid JSON" };
    }
    const text = body.choices?.[0]?.message?.content ?? "";
    if (!text.trim()) return { ok: false, error: "empty" };
    return { ok: true, text };
  } catch (cause) {
    return {
      ok: false,
      error:
        opts.signal?.aborted
          ? "xAI request cancelled"
          : typeof DOMException !== "undefined" && cause instanceof DOMException && cause.name === "AbortError"
            ? "xAI request timed out"
          : "xAI request failed",
    };
  } finally {
    stopRelaying();
    clearTimeout(timeout);
  }
}

function relayAbort(source: AbortSignal | undefined, target: AbortController): () => void {
  if (!source) return () => undefined;
  const relay = () => target.abort(source.reason);
  if (source.aborted) relay();
  else source.addEventListener("abort", relay, { once: true });
  return () => source.removeEventListener("abort", relay);
}

export function parseJson<T>(raw: string): T | null {
  if (typeof raw !== "string" || raw.length > MAX_GROK_RESPONSE_BYTES) return null;
  const trimmed = raw.trim();
  const fence = trimmed.match(/```json\s*([\s\S]*?)```/i);
  const candidate = fence?.[1] ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

export async function readTextBounded(response: Response, maxBytes: number): Promise<string> {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let output = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) throw new Error("xAI response was too large");
      output += decoder.decode(value, { stream: true });
    }
    output += decoder.decode();
    return output;
  } catch (error) {
    await reader.cancel().catch(() => undefined);
    throw error;
  } finally {
    reader.releaseLock();
  }
}
