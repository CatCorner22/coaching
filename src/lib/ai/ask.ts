import { createServerFn } from "@tanstack/react-start";
import { grokChat } from "./grok";
import type { AskInput } from "./schema";

export const askKnowledge = createServerFn({ method: "POST" })
  .validator((input: AskInput) => {
    if (!input?.question || input.question.length > 600) {
      throw new Error("Ask a short question");
    }
    return { ...input, excerpts: (input.excerpts ?? []).slice(0, 4) };
  })
  .handler(async ({ data }) => {
    const grok = await grokChat({
      max_tokens: 500,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are Musubi, a rope and BDSM safety instructor. Answer from the supplied excerpts. If they are insufficient, say so. No neck restraint, breath play, or full suspension how-tos. Cite article titles. Adults only, technical tone.",
        },
        {
          role: "user",
          content: `Question: ${data.question}\n\nExcerpts:\n${data.excerpts
            .map((e) => `### ${e.title} (${e.slug})\n${e.text}`)
            .join("\n\n")}`,
        },
      ],
    });
    if (!grok.ok) return { ok: false as const, error: grok.error };
    return { ok: true as const, text: grok.text };
  });
