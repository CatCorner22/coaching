import { createServerFn } from "@tanstack/react-start";
import { knowledgeAnswer } from "@/lib/kb";
import { sanitizeQuestion } from "@/lib/ml/sanitize";

export const askKnowledge = createServerFn({ method: "POST" })
  .validator((input: { question: unknown }) => {
    const question = sanitizeQuestion(input?.question, 600);
    if (!question) {
      throw new Error("Ask a question");
    }
    return { question };
  })
  .handler(({ data }) => ({ ok: true as const, text: knowledgeAnswer(data.question) }));
