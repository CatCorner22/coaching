import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { scrubBannedAnswer, textIsBanned } from "@/lib/ml/audit";
import { authorizeAiRequest } from "./guard.server";
import { RateLimitError } from "./rate-limit-core";
import { requestGrokVoice, type VoiceProviderResult } from "./voice-provider";

export const speakCoach = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { text: unknown }) => {
    let text = String(input?.text ?? "").replace(/\s+/g, " ").trim().slice(0, 400);
    if (!text) throw new Error("Nothing to speak");
    if (textIsBanned(text)) text = scrubBannedAnswer(text);
    return { text };
  })
  .handler(async ({ data, context }): Promise<VoiceProviderResult> => {
    const { isReviewedCoachSpeech } = await import("@/lib/voice/reviewed.server");
    if (!isReviewedCoachSpeech(data.text)) {
      return { ok: false, error: "Cloud voice accepts only reviewed app guidance" };
    }
    const authorization = await authorizeAiRequest(context.userId);
    const { consumeAiBudget } = await import("./rate-limit.server");
    try {
      consumeAiBudget("voice", 20, 10 * 60_000, authorization.userId);
    } catch (cause) {
      // Quota denial is an expected outcome, not a crash. Throwing here meant
      // the documented typed result never reached the client, which then had
      // an unhandled rejection instead of a clean fall back to browser speech.
      if (cause instanceof RateLimitError) {
        return { ok: false, error: "Cloud voice quota reached; using browser speech." };
      }
      throw cause;
    }
    return requestGrokVoice({
      apiKey: process.env.XAI_API_KEY,
      text: data.text,
      signal: authorization.signal,
    });
  });
