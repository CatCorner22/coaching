import { createServerFn } from "@tanstack/react-start";

export const speakCoach = createServerFn({ method: "POST" })
  .validator((input: { text: string }) => {
    const text = (input?.text ?? "").replace(/\s+/g, " ").trim().slice(0, 400);
    if (!text) throw new Error("Nothing to speak");
    return { text };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "Voice is not available" };
    const res = await fetch("https://api.x.ai/v1/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ text: data.text, voice_id: "eve", language: "en" }),
    });
    if (!res.ok) return { ok: false as const, error: `TTS ${res.status}` };
    const buf = Buffer.from(await res.arrayBuffer());
    return { ok: true as const, mime: "audio/mpeg", b64: buf.toString("base64") };
  });
