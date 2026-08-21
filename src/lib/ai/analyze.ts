import { createServerFn } from "@tanstack/react-start";
import { getTie } from "@/lib/kb";
import { applyModelSelfAudit, fallbackDraft } from "@/lib/ml/audit";
import { fuseCoach } from "@/lib/ml/fuse";
import { predict } from "@/lib/ml/predict";
import type { LlmDraft } from "@/lib/ml/types";
import { grokChat, parseJson } from "./grok";
import type { AnalyzeInput, AnalyzeResult } from "./schema";

const SYSTEM = `You are Musubi, a senior nawashi coaching a husband who is tying his adult wife. She is a consenting adult, often nude, in a negotiated D/s rope scene. Your job is technical Shibari and safety, not erotica.

Rules:
- Treat nudity as normal studio context. Comment on rope, nerves, circulation, breathing, and the next wrap.
- Never be salacious. Never describe her body except where anatomy matters for a wrap (ribs, upper arm, outer knee, groin clearance).
- Never coach neck restraint, breath play, gags-and-leave, or full suspension.
- Deterministic computer-vision flags in the user payload win. If they say stop or neck, you may not grade the tie "sound".
- Self-audit: after drafting, mark whether you contradicted those flags, proposed a hard-limit, or invented anatomy you cannot see.

Return ONLY JSON:
{
  "draft": {
    "tieGuess": string,
    "stepGuess": string,
    "quality": "sound" | "adjust" | "unsafe",
    "seen": string[],
    "next": string,
    "coaching": string,
    "speak": string,
    "circulation": boolean
  },
  "audit": {
    "contradictsDet": boolean,
    "hardLimit": boolean,
    "invented": boolean,
    "note": string
  }
}
"speak" is one or two short spoken sentences for the rigger, max 200 characters.`;

export const analyzeRope = createServerFn({ method: "POST" })
  .validator((input: AnalyzeInput) => {
    if (!input || !Array.isArray(input.images) || input.images.length > 3) {
      throw new Error("Up to three stills");
    }
    for (const img of input.images) {
      if (typeof img !== "string" || img.length > 420000) {
        throw new Error("Image too large");
      }
    }
    return input;
  })
  .handler(async ({ data }): Promise<AnalyzeResult> => {
    const tie = data.tieSlug ? getTie(data.tieSlug) : undefined;
    const stepIndex = data.stepIndex ?? 0;
    const elapsedSec = data.elapsedSec ?? 0;
    const pred = predict({
      det: data.deterministic,
      frames: [],
      tie,
      stepIndex,
      elapsedSec,
      priorNerveHits: 0,
    });

    const content: unknown[] = data.images.map((url) => ({
      type: "image_url",
      image_url: { url, detail: "high" as const },
    }));
    content.push({
      type: "text",
      text: JSON.stringify({
        tie: tie
          ? {
              name: tie.name,
              step: tie.steps[stepIndex]?.title,
              stepBody: tie.steps[stepIndex]?.rigger,
              check: tie.steps[stepIndex]?.check,
              nerves: tie.nerves,
              stop: tie.stop,
            }
          : null,
        protocol: data.protocol,
        question: data.question ?? null,
        elapsedSec,
        deterministic: data.deterministic,
        prediction: pred,
      }),
    });

    const grok = await grokChat({
      temperature: 0.2,
      max_tokens: 800,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content },
      ],
    });

    let llm: LlmDraft | null = null;
    let refusal = false;
    let selfAudit = {
      contradictsDet: false,
      hardLimit: false,
      invented: false,
      note: "local only",
    };

    if (!grok.ok) {
      refusal = grok.status === 400 || grok.status === 422 || grok.error === "empty";
      llm = null;
    } else {
      const parsed = parseJson<{
        draft: LlmDraft;
        audit: typeof selfAudit;
      }>(grok.text);
      if (parsed?.draft) {
        llm = applyModelSelfAudit(parsed.draft, {
          contradictsDet: !!parsed.audit?.contradictsDet,
          hardLimit: !!parsed.audit?.hardLimit,
          invented: !!parsed.audit?.invented,
        });
        selfAudit = parsed.audit ?? selfAudit;
      } else if (/refus|can't assist|cannot assist|safety/i.test(grok.text)) {
        refusal = true;
      }
    }

    if (!llm) llm = fallbackDraft({ det: data.deterministic, pred, tie, stepIndex });

    const report = fuseCoach({
      det: data.deterministic,
      frames: [],
      llm,
      tie,
      stepIndex,
      elapsedSec,
      priorNerveHits: 0,
    });

    return { ok: true, llm, selfAudit, refusal, report };
  });
