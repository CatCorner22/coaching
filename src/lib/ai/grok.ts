const MAX_GROK_RESPONSE_BYTES = 256 * 1024;
const ZDR_HEADER = "x-zero-data-retention";
const PRIVACY_PREFLIGHT_TIMEOUT_MS = 10_000;

export const GROK_ZDR_ERROR = "xAI did not confirm zero data retention";
export const GROK_ZDR_RESPONSE_ERROR =
  "xAI media response did not provide verifiable zero data retention confirmation";
export type GrokZdrPreflight =
  | { ok: true }
  | {
      ok: false;
      reason: "zdr_missing" | "http_error" | "rate_limited" | "timeout" | "network";
      status?: number;
      retryAfterMs?: number;
    };

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

/**
 * Retry-After as milliseconds, in both documented forms (delta-seconds and an
 * HTTP date). The provider's own wait is better guidance than a guess.
 */
function retryAfterFrom(res: Response): { retryAfterMs?: number } {
  if (res.status !== 429) return {};
  const header = res.headers.get("retry-after")?.trim();
  if (!header) return {};
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return { retryAfterMs: Math.min(60 * 60_000, Math.round(seconds * 1000)) };
  }
  const at = Date.parse(header);
  if (!Number.isFinite(at)) return {};
  return { retryAfterMs: Math.max(0, Math.min(60 * 60_000, at - Date.now())) };
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
      /**
       * Set when the request never produced a response: the caller aborted,
       * the 45s deadline elapsed, or the connection failed. Distinct from
       * `privacyFailure: "response"`, which means a response did arrive
       * without the zero-data-retention header.
       */
      transportFailure?: "aborted" | "timeout" | "network";
      /** Provider-declared wait, parsed from Retry-After on a 429. */
      retryAfterMs?: number;
      retryableBeforeProvider?: boolean;
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
  const preflight = await verifyGrokZeroDataRetentionForRequest(apiKey, opts.signal);
  if (!preflight.ok) {
    console.error("[grok] ZDR preflight failed", preflight.reason);
    const privacy = preflight.reason === "zdr_missing";
    return {
      ok: false,
      error: privacy
        ? "No media was sent to xAI. Zero data retention could not be confirmed."
        : preflight.reason === "rate_limited"
          ? "No media was sent to xAI. xAI request capacity is full; try again later."
          : "No media was sent to xAI. The provider is temporarily unavailable; try again later.",
      status: preflight.status ?? (privacy ? 503 : 502),
      providerAttempted: false,
      ...(privacy ? { privacyFailure: "preflight" as const } : {}),
      ...(preflight.retryAfterMs === undefined ? {} : { retryAfterMs: preflight.retryAfterMs }),
      retryableBeforeProvider: true,
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
  try {
    let res: Response;
    try {
      res = await fetch("https://api.x.ai/v1/chat/completions", {
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
    } catch {
      const transportFailure = opts.signal?.aborted
        ? ("aborted" as const)
        : controller.signal.aborted
          ? ("timeout" as const)
          : ("network" as const);
      if (transportFailure === "network") {
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
          transportFailure === "aborted"
            ? "xAI request cancelled"
            : transportFailure === "timeout"
              ? "xAI request timed out"
              : "xAI response failed",
        providerAttempted: true,
        transportFailure,
      };
    }
    if (!responseConfirmsZeroDataRetention(res)) {
      await res.body?.cancel().catch(() => undefined);
      console.error("[grok] response did not confirm zero data retention — result discarded");
      return {
        ok: false,
        error: GROK_ZDR_RESPONSE_ERROR,
        status: 502,
        providerAttempted: true,
        privacyFailure: "response",
      };
    }
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
        ...retryAfterFrom(res),
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
    let raw: string;
    try {
      raw = await readTextBounded(res, MAX_GROK_RESPONSE_BYTES);
    } catch {
      return { ok: false, error: "xAI response failed", providerAttempted: true };
    }
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
    if (!body || typeof body !== "object") {
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
  } finally {
    stopRelaying();
    clearTimeout(timeout);
  }
}

/** Fixed, non-sensitive, uncached per-request ZDR probe for one credential snapshot. */
export async function verifyGrokZeroDataRetentionForRequest(
  apiKey: string,
  sourceSignal?: AbortSignal,
): Promise<GrokZdrPreflight> {
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
    if (response.status === 429) {
      await response.body?.cancel().catch(() => undefined);
      return { ok: false, reason: "rate_limited", status: 429, ...retryAfterFrom(response) };
    }
    if (!response.ok) {
      await response.body?.cancel().catch(() => undefined);
      return { ok: false, reason: "http_error", status: response.status };
    }
    if (!responseConfirmsZeroDataRetention(response)) {
      await response.body?.cancel().catch(() => undefined);
      return { ok: false, reason: "zdr_missing", status: response.status };
    }
    await response.body?.cancel().catch(() => undefined);
    return { ok: true };
  } catch {
    return {
      ok: false,
      reason: sourceSignal?.aborted ? "network" : controller.signal.aborted ? "timeout" : "network",
    };
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
