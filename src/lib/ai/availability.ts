import { createServerFn } from "@tanstack/react-start";
import { grokProviderConfigured } from "./grok";

/**
 * Whether this deployment can send a batch to xAI at all. The Studio asks
 * before the camera opens: without it, the only way to learn that cloud vision
 * is switched off is to shoot a batch, confirm the permission ledger and burn
 * the one-use submission on a 503.
 */
export const aiVisionAvailability = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ configured: boolean }> => ({ configured: grokProviderConfigured() }),
);
