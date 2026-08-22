import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { scrubBannedAnswer, textIsBanned } from "@/lib/ml/audit";
import { authorizeAiRequest } from "./guard.server";
import { requestGrokVoice } from "./voice-provider";

export const speakCoach = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { text: unknown }) => {
    let text = String(input?.text ?? "").replace(/\s+/g, " ").trim().slice(0, 400);
    if (!text) throw new Error("Nothing to speak");
    if (textIsBanned(text)) text = scrubBannedAnswer(text);
    return { text };
  })
  .handler(async ({ data, context }) => {
    const { isReviewedCoachSpeech } = await import("@/lib/voice/reviewed.server");
    if (!isReviewedCoachSpeech(data.text)) {
      throw new Error("Cloud voice accepts only reviewed app guidance");
    }
    const authorization = await authorizeAiRequest(context.userId);
    const { consumeAiBudget } = await import("./rate-limit.server");
    consumeAiBudget("voice", 20, 10 * 60_000, authorization.userId);
    return requestGrokVoice({
      apiKey: process.env.XAI_API_KEY,
      text: data.text,
      signal: authorization.signal,
    });
  });
