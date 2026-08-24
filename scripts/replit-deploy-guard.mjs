#!/usr/bin/env node
/**
 * Refuse a Replit Deployment, loudly and with the reason.
 *
 * `.replit` runs the dev server, which is correct for the Run button: a Repl
 * is a workspace, and `npm run dev` there is the same thing as `npm run dev`
 * locally. Replit Deployments are a different surface — always-on, publicly
 * addressable — and they take their command from `[deployment]`. With no such
 * section, a Deployment falls back to the workspace `run` command, and the
 * dev server is exactly the wrong thing to publish:
 *
 *  - `viteDevServer` is compiled `true`, so `src/lib/ai/guard.server.ts`
 *    accepts the shared development identity on cost-bearing AI endpoints and
 *    relaxes the origin check to allow loopback.
 *  - `src/lib/auth/server.ts` runs Better Auth in development mode rather than
 *    production, which is a different cookie and trust posture.
 *  - `src/lib/db.ts` uses the embedded in-memory PGLite instance, so every
 *    negotiated limit and journal entry is lost on restart and shared by
 *    nobody — a consent record that silently does not persist is worse than
 *    an obvious absence of one.
 *
 * None of that is a bug in the dev server; it is what a dev server is for.
 * The bug would be shipping it. So `[deployment]` points here instead, and
 * this exits non-zero rather than letting the fallback happen quietly.
 *
 * This is not a claim that the app cannot be deployed — `npm run build`
 * produces a Vercel deployment (`preset: "vercel"` in `vite.config.ts`, output
 * under `.vercel/output/`), which is the supported production target and is
 * documented under "Deployment requirements" in the README. It is a claim that
 * a Replit Deployment is not that target and must not silently pretend to be.
 */
import { isMainModule } from "./with-app-env.mjs";

export const REPLIT_DEPLOY_REFUSAL = [
  "",
  "  Replit Deployments are not a supported target for this app.",
  "",
  "  The Run button is fully supported: it starts the dev server, and the",
  "  Repl's HTTPS preview URL is a working, camera-capable instance for as",
  "  long as the workspace is running. Nothing here changes that.",
  "",
  "  A Deployment is refused because, with no build of its own to run, it",
  "  would publish the dev server. That server deliberately accepts a shared",
  "  development identity on the AI endpoints, runs auth in development mode,",
  "  and keeps all data in an in-memory database that is discarded on every",
  "  restart. Publishing it would expose those as if they were production",
  "  behaviour.",
  "",
  "  To run a real deployment, build for the supported target:",
  "",
  "    npm run build      # produces .vercel/output/ for a Vercel deployment",
  "",
  "  and satisfy the prerequisites in the README under",
  "  \"Deployment requirements\" first — HTTPS, a real DATABASE_URL, an xAI key",
  "  with team-wide Zero Data Retention verified, and real authentication.",
  "",
].join("\n");

function main() {
  console.error(REPLIT_DEPLOY_REFUSAL);
  process.exit(1);
}

if (isMainModule(import.meta.url)) {
  main();
}
