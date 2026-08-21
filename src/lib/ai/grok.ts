export async function grokChat(opts: {
  messages: unknown[];
  max_tokens?: number;
  temperature?: number;
}): Promise<{ ok: true; text: string } | { ok: false; error: string; status?: number }> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return { ok: false, error: "AI is not available in this environment" };
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
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    return { ok: false, error: `xAI API error ${res.status}`, status: res.status };
  }
  const body = (await res.json()) as {
    choices?: { message?: { content?: string | null }; finish_reason?: string }[];
  };
  const text = body.choices?.[0]?.message?.content ?? "";
  if (!text.trim()) return { ok: false, error: "empty" };
  return { ok: true, text };
}

export function parseJson<T>(raw: string): T | null {
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
