import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { COACH_CLOUD_VOICE_ID } from "@/lib/voice/coach-profile";
import { MAX_REVIEWED_SPEECH_LENGTH } from "@/lib/voice/reviewed-lines";
import { authorizeAiRequest } from "./guard.server";
import { RateLimitError } from "./rate-limit-core";
import { requestGrokVoice, type VoiceProviderResult } from "./voice-provider";

export const speakCoach = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { text: unknown }) => {
    // The slice bound must admit the longest composed step narration — a 400
    // cap truncated every reviewed script before the allowlist could match it.
    // No scrub here: the handler's exact-string allowlist is the control on
    // this endpoint, and it is strictly stronger — scrubbing first only ever
    // mangled reviewed lines that legitimately name a danger to warn against
    // it (they then missed the set), while arbitrary prose never passes the
    // set scrubbed or not.
    const text = String(input?.text ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAX_REVIEWED_SPEECH_LENGTH);
    if (!text) throw new Error("Nothing to speak");
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
        return { ok: false, error: "Cloud voice unavailable right now — using browser voice." };
      }
      throw cause;
    }
    const result = await requestGrokVoice({
      apiKey: process.env.XAI_API_KEY,
      text: data.text,
      voiceId: COACH_CLOUD_VOICE_ID,
      signal: authorization.signal,
    });
    return result.ok
      ? result
      : { ...result, error: "Cloud voice unavailable right now — using browser voice." };
  });
