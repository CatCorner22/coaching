const MAX_GROK_RESPONSE_BYTES = 256 * 1024;
const ZDR_HEADER = "x-zero-data-retention";
const PRIVACY_PREFLIGHT_TIMEOUT_MS = 10_000;

export const GROK_ZDR_ERROR = "xAI did not confirm zero data retention";
export const GROK_ZDR_RESPONSE_ERROR =
  "xAI media response did not provide verifiable zero data retention confirmation";

export type GrokJsonSchemaFormat = {
  type: "json_schema";
  json_schema: {
    name: string;
    strict: true;
    schema: Record<string, unknown>;
  };
};

export function grokProviderConfigured(): boolean {
  return Boolean(process.env.XAI_API_KEY?.trim()) && zeroDataRetentionRequired();
}

export function zeroDataRetentionRequired(): boolean {
  return process.env.XAI_REQUIRE_ZERO_DATA_RETENTION?.trim().toLowerCase() === "true";
}

export async function grokChat(opts: {
  messages: unknown[];
  max_tokens?: number;
  temperature?: number;
  responseFormat?: GrokJsonSchemaFormat;
  signal?: AbortSignal;
}): Promise<
  | { ok: true; text: string; providerAttempted: true }
  | {
      ok: false;
      error: string;
      status?: number;
      refused?: boolean;
      providerAttempted: boolean;
      privacyFailure?: "preflight" | "response";
    }
> {
  // One immutable credential snapshot is used for the fixed text-only probe
  // and the image request. A key rotation can therefore never move media to a
  // credential that this batch did not probe first.
  const apiKey = process.env.XAI_API_KEY?.trim();
  if (!apiKey || !zeroDataRetentionRequired()) {
    return {
      ok: false,
      error: "AI is not available in this environment",
      providerAttempted: false,
    };
  }
  if (!(await verifyGrokZeroDataRetentionForRequest(apiKey, opts.signal))) {
    return {
      ok: false,
      error: GROK_ZDR_ERROR,
      status: 503,
      providerAttempted: false,
      privacyFailure: "preflight",
    };
  }
  if (!zeroDataRetentionRequired() || opts.signal?.aborted) {
    return {
      ok: false,
      error: GROK_ZDR_ERROR,
      status: 503,
      providerAttempted: false,
      privacyFailure: "preflight",
    };
  }
  let requestBody: string;
  try {
    requestBody = JSON.stringify({
      model: "grok-4.5",
      temperature: opts.temperature ?? 0.25,
      max_tokens: opts.max_tokens ?? 900,
      messages: opts.messages,
      ...(opts.responseFormat ? { response_format: opts.responseFormat } : {}),
    });
  } catch {
    return {
      ok: false,
      error: "xAI request could not be prepared",
      providerAttempted: false,
    };
  }
  const controller = new AbortController();
  const stopRelaying = relayAbort(opts.signal, controller);
  const timeout = setTimeout(() => controller.abort(), 45_000);
  let mediaDispatched = false;
  let zeroDataRetentionConfirmed = false;
  try {
    mediaDispatched = true;
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      cache: "no-store",
      redirect: "error",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: requestBody,
      signal: controller.signal,
    });
    if (!responseConfirmsZeroDataRetention(res)) {
      await res.body?.cancel().catch(() => undefined);
      return {
        ok: false,
        error: GROK_ZDR_RESPONSE_ERROR,
        status: 502,
        providerAttempted: true,
        privacyFailure: "response",
      };
    }
    zeroDataRetentionConfirmed = true;
    if (!res.ok) {
      let refused = false;
      try {
        const rawError = await readTextBounded(res, MAX_GROK_RESPONSE_BYTES);
        refused = isExplicitProviderRefusal(rawError);
      } catch {
        await res.body?.cancel().catch(() => undefined);
      }
      return {
        ok: false,
        error: refused ? "xAI declined this media" : `xAI API error ${res.status}`,
        status: res.status,
        refused,
        providerAttempted: true,
      };
    }
    const contentType = res.headers.get("content-type")?.toLowerCase() ?? "";
    if (!contentType.includes("application/json")) {
      await res.body?.cancel().catch(() => undefined);
      return {
        ok: false,
        error: "xAI returned an unexpected content type",
        providerAttempted: true,
      };
    }
    const declared = Number(res.headers.get("content-length"));
    if (Number.isFinite(declared) && declared > MAX_GROK_RESPONSE_BYTES) {
      await res.body?.cancel().catch(() => undefined);
      return { ok: false, error: "xAI response was too large", providerAttempted: true };
    }
    const raw = await readTextBounded(res, MAX_GROK_RESPONSE_BYTES);
    let body: {
      choices?: {
        message?: { content?: string | null; refusal?: string | null };
        finish_reason?: string | null;
      }[];
    };
    try {
      body = JSON.parse(raw) as typeof body;
    } catch {
      return { ok: false, error: "xAI returned invalid JSON", providerAttempted: true };
    }
    const choice = body.choices?.[0];
    const refusal = choice?.message?.refusal;
    if (
      (typeof refusal === "string" && refusal.trim().length > 0) ||
      choice?.finish_reason === "content_filter" ||
      choice?.finish_reason === "refusal"
    ) {
      return {
        ok: false,
        error: "xAI declined this media",
        refused: true,
        providerAttempted: true,
      };
    }
    // A closed JSON shape is not proof that generation completed. Partial
    // output can omit a high-consequence match while remaining valid JSON, so
    // only the provider's documented normal terminal state is admissible.
    if (choice?.finish_reason !== "stop") {
      return {
        ok: false,
        error: "xAI returned an incomplete response",
        refused: false,
        providerAttempted: true,
      };
    }
    const text = choice.message?.content ?? "";
    if (!text.trim()) return { ok: false, error: "empty", providerAttempted: true };
    return { ok: true, text, providerAttempted: true };
  } catch {
    if (mediaDispatched && !zeroDataRetentionConfirmed) {
      return {
        ok: false,
        error: GROK_ZDR_RESPONSE_ERROR,
        status: 502,
        providerAttempted: true,
        privacyFailure: "response",
      };
    }
    return {
      ok: false,
      error:
        opts.signal?.aborted
          ? "xAI request cancelled"
          : controller.signal.aborted
            ? "xAI request timed out"
            : "xAI response failed",
      providerAttempted: mediaDispatched,
    };
  } finally {
    stopRelaying();
    clearTimeout(timeout);
  }
}

/** Fixed, non-sensitive, uncached per-request ZDR probe for one credential snapshot. */
export async function verifyGrokZeroDataRetentionForRequest(
  apiKey: string,
  sourceSignal?: AbortSignal,
): Promise<boolean> {
  const controller = new AbortController();
  const stopRelaying = relayAbort(sourceSignal, controller);
  const timeout = setTimeout(() => controller.abort(), PRIVACY_PREFLIGHT_TIMEOUT_MS);
  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      cache: "no-store",
      redirect: "error",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: 0,
        max_tokens: 1,
        messages: [{ role: "user", content: "Return OK." }],
      }),
      signal: controller.signal,
    });
    const verified = response.ok && responseConfirmsZeroDataRetention(response);
    await response.body?.cancel().catch(() => undefined);
    return verified;
  } catch {
    return false;
  } finally {
    stopRelaying();
    clearTimeout(timeout);
  }
}

function responseConfirmsZeroDataRetention(response: Response): boolean {
  return response.headers.get(ZDR_HEADER) === "true";
}

function isExplicitProviderRefusal(raw: string): boolean {
  try {
    const body = JSON.parse(raw) as { error?: { code?: unknown; type?: unknown } };
    const marker = `${String(body.error?.code ?? "")} ${String(body.error?.type ?? "")}`.toLowerCase();
    return /(?:content[_ -]?policy|moderation|safety[_ -]?(?:block|refusal)|refusal)/u.test(marker);
  } catch {
    return false;
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

/** Parse a structured-output response without tolerating prose or fences. */
export function parseStrictJson<T>(raw: string): T | null {
  if (typeof raw !== "string" || raw.length > MAX_GROK_RESPONSE_BYTES) return null;
  try {
    return JSON.parse(raw.trim()) as T;
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
