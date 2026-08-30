import { createServerFn } from "@tanstack/react-start";
import { grokProviderConfigured } from "./grok";
import { assertSameSiteRequest } from "@/lib/auth/isolation.server";
import { authConfigured, getSessionUser, UnauthorizedError } from "@/lib/auth/verify.server";
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
 *
 * The answer describes the deployment, so it is not for anyone who asks: a
 * scripted sibling call is rejected, and where accounts exist the caller has
 * to be signed in. `authMiddleware` cannot do it — with accounts off but a
 * database configured it rejects every caller, which is the shipped default
 * here and would leave the Studio unable to pre-check at all.
 */
export const aiVisionAvailability = createServerFn({ method: "GET" }).handler(
  async (): Promise<AiVisionAvailability> => {
    assertSameSiteRequest();
    if (authConfigured && !(await getSessionUser())) throw new UnauthorizedError();
    // Read through runtime-mode rather than @/lib/db, which would drag the
    // Postgres and PGLite drivers into this module's graph.
    const dbSource = selectDatabaseSource(process.env.DATABASE_URL, viteDevServer);
    if (dbSource === "unconfigured") return { configured: false, reason: "no_database" };
    if (!grokProviderConfigured()) return { configured: false, reason: "no_provider" };
    return { configured: true, reason: "ok" };
  },
);
