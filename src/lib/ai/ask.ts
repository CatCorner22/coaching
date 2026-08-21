import { createServerFn } from "@tanstack/react-start";
import { searchKnowledge } from "@/lib/kb";
import { sanitizeQuestion } from "@/lib/ml/sanitize";

export const askKnowledge = createServerFn({ method: "POST" })
  .validator((input: { question: unknown; slugs?: unknown }) => {
    const question = sanitizeQuestion(input?.question, 600);
    if (question.length < 2) {
      throw new Error("Ask a short question");
    }
    const slugs = Array.isArray(input?.slugs)
      ? input.slugs.map((s) => sanitizeQuestion(s, 80)).filter(Boolean).slice(0, 6)
      : [];
    return { question, slugs };
  })
  .handler(({ data }) => {
    const hits = searchKnowledge(data.question, 6);
    if (!hits.length) {
      return {
        ok: true as const,
        text: "No reviewed entry matched that wording. Try a broad topic such as consent, privacy, aftercare, nerves, equipment, or emergency release. This search does not generate individualized rope instructions.",
      };
    }
    const reading = hits.map((hit) => `• ${hit.title} (${hit.kind})`).join("\n");
    return {
      ok: true as const,
      text: `Relevant reviewed entries:\n${reading}\n\nOpen the matching entries below. This search is educational only and does not validate a setup, infer consent or physiology, or provide individualized high-consequence instructions.`,
    };
  });
