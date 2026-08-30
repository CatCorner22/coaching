import { createServerFn } from "@tanstack/react-start";
import { grokProviderConfigured } from "./grok";
import { selectDatabaseSource, viteDevServer } from "@/lib/runtime-mode";

export type AiVisionAvailability = {
  configured: boolean;
  /** Why cloud analysis is off, in words the couple can act on. */
  reason: "ok" | "no_provider" | "no_database";
};

/**
 * Whether this deployment can send a batch to xAI at all. The Studio asks
 * before the camera opens: without it, the only way to learn that cloud vision
 * is switched off is to shoot a batch, confirm the permission ledger and burn
 * the one-use submission on a 503.
 *
 * A deployment with no database is equally unable to analyze — the one-use
 * batch reservation is the first thing every request does — and every page
 * otherwise looks perfectly healthy, so it is reported here too.
 */
export const aiVisionAvailability = createServerFn({ method: "GET" }).handler(
  async (): Promise<AiVisionAvailability> => {
    // Read through runtime-mode rather than @/lib/db, which would drag the
    // Postgres and PGLite drivers into this module's graph.
    const dbSource = selectDatabaseSource(process.env.DATABASE_URL, viteDevServer);
    if (dbSource === "unconfigured") return { configured: false, reason: "no_database" };
    if (!grokProviderConfigured()) return { configured: false, reason: "no_provider" };
    return { configured: true, reason: "ok" };
  },
);
