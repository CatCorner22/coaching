import { createServerFn } from "@tanstack/react-start";
import { articleExcerpts, searchKnowledge } from "@/lib/kb";
import { grokChat } from "./grok";

export const askKnowledge = createServerFn({ method: "POST" })
  .validator((input: { question: string; slugs?: string[] }) => {
    if (!input?.question || input.question.length > 600) {
      throw new Error("Ask a short question");
    }
    return { question: input.question, slugs: (input.slugs ?? []).slice(0, 6) };
  })
  .handler(async ({ data }) => {
    const slugs =
      data.slugs.length > 0
        ? data.slugs
        : searchKnowledge(data.question, 4).map((h) => h.slug);
    const excerpts = articleExcerpts(slugs);
    const grok = await grokChat({
      max_tokens: 500,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are Musubi, a rope and BDSM safety instructor. Answer from the supplied excerpts. If they are insufficient, say so. No neck restraint, breath play, or full suspension how-tos. Cite article titles. Adults only, technical tone. Furniture is not a hang point. A sex machine does not hear yellow.",
        },
        {
          role: "user",
          content: `Question: ${data.question}\n\nExcerpts:\n${excerpts
            .map((e) => `### ${e.title} (${e.slug})\n${e.text}`)
            .join("\n\n")}`,
        },
      ],
    });
    if (!grok.ok) return { ok: false as const, error: grok.error };
    return { ok: true as const, text: grok.text };
  });
