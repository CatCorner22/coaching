import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { scrubBannedAnswer, textIsBanned } from "@/lib/ml/audit";
import { COACH_CLOUD_VOICE_ID } from "@/lib/voice/coach-profile";
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
    // Cheap local availability checks come before the quota charge: a
    // deployment without a key or the explicit ZDR flag used to burn the
    // whole voice budget on attempts that could never succeed. Charging
    // before the network preflight itself stays deliberate — probes spend
    // provider quota and must remain bounded.
    const { zeroDataRetentionRequired } = await import("./grok");
    if (!process.env.XAI_API_KEY?.trim() || !zeroDataRetentionRequired()) {
      return { ok: false, error: "Voice is not available" };
    }
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
      voiceId: COACH_CLOUD_VOICE_ID,
      signal: authorization.signal,
    });
  });
