#!/usr/bin/env node
/**
 * Run a command with `.grok/app-env.json` merged into its environment.
 *
 * `dev`, `build` and `preview` all route through this wrapper, so the dev
 * server, the built bundle and the preview server can never disagree about
 * `VITE_AUTH_ENABLED` — a divergence that only shows up as a built-output
 * mismatch long after the fact. Anything that starts Vite directly bypasses it.
 *
 * Only `VITE_`-prefixed keys are honored: the file is a build flag carrier, not
 * a secret store, and only `VITE_` vars reach the browser anyway. A real
 * `process.env` entry always wins, so an explicit override still works.
 *
 * That precedence also means the file governs this workspace only. A deployed
 * build runs with the provider's project env, where the deployer sets
 * `VITE_AUTH_ENABLED` itself (today unconditionally `"true"`), so the deployed
 * flag is the platform's, not this file's.
 *
 * Vite picks the values up because `loadEnv` prefix-matches entries already in
 * `process.env`, which is why the merge has to happen before Vite starts.
 */
import { spawn } from "node:child_process";
import { readFileSync, realpathSync } from "node:fs";
import { constants as osConstants } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkDeployAuthConfig } from "./check-auth-invariant.mjs";

export const APP_ENV_REL_PATH = ".grok/app-env.json";

const VITE_PREFIX = "VITE_";
const DEFAULT_APP_ENV = Object.freeze({
  // Auth off is the standalone default, which is what the README promises for a
  // clone and a Replit import: no accounts, the embedded dev database, and the
  // AI endpoints accepting the development identity. Shipping "true" here meant
  // a fresh checkout ran an auth stack it had no database or secrets for, so
  // `npm run preview` answered 500 on every route. A deployment sets
  // VITE_AUTH_ENABLED itself and a real process.env entry always wins, so
  // production is unaffected; `checkDeployAuthConfig` still refuses a build
  // that pairs a DATABASE_URL with auth off.
  VITE_AUTH_ENABLED: "false",
  // This deployment's owner set the upload scope, having accepted that the
  // provider's Acceptable Use Policy is the governing document and that this
  // repository cannot verify it. See "Upload scope" in the README to change it.
  // A real process.env entry still wins, so a deployment can override; and an
  // unrecognised value still falls back to non_explicit rather than widening,
  // so a typo here cannot silently open the boundary.
  VITE_MEDIA_UPLOAD_SCOPE: "adult_nudity",
});

/**
 * Parse an app-env document, keeping only `VITE_`-prefixed string entries.
 */
export function parseAppEnv(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return {};
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return {};
  const env = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (!key.startsWith(VITE_PREFIX)) continue;
    if (typeof value !== "string") continue;
    env[key] = value;
  }
  return env;
}

/** The app env recorded under `root`, with a safe standalone auth-off default. */
export function readAppEnv(root) {
  try {
    return { ...DEFAULT_APP_ENV, ...parseAppEnv(readFileSync(join(root, APP_ENV_REL_PATH), "utf8")) };
  } catch {
    return { ...DEFAULT_APP_ENV };
  }
}

/** File values under the process environment: an explicit override wins. */
export function mergeAppEnv(appEnv, processEnv) {
  return { ...appEnv, ...processEnv };
}

/**
 * Translate a child's `exit` `(code, signal)` into this process's exit status.
 *
 * Do not re-raise the signal with `process.kill(process.pid, signal)`: under
 * qemu-user (amd64 image builds on an arm host) a self-directed signal is
 * routinely delivered as SIGSEGV to the wrong process, which takes down the
 * test worker and fails the image build. `128 + signo` is what a shell reports
 * for a signal-killed command, so a cancelled `vite build` is still a failure.
 */
export function exitStatusFromChild(code, signal) {
  if (signal) {
    const signo = osConstants.signals[signal];
    return 128 + (typeof signo === "number" ? signo : 1);
  }
  return code ?? 1;
}

/** The workspace root (this file lives in `<root>/scripts/`). */
export function projectRoot() {
  return dirname(dirname(fileURLToPath(import.meta.url)));
}

/**
 * Whether `moduleUrl` is the script node was asked to run.
 *
 * Both sides are resolved through symlinks: node realpaths `import.meta.url`
 * but leaves `process.argv[1]` as typed, so comparing them raw makes a CLI
 * launched through a symlinked path (`/tmp` on macOS) a silent no-op.
 */
export function isMainModule(moduleUrl) {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return realpathSync(entry) === fileURLToPath(moduleUrl);
  } catch {
    return false;
  }
}

function main(argv) {
  const [command, ...args] = argv;
  if (!command) {
    console.error("usage: node scripts/with-app-env.mjs <command> [args…]");
    process.exit(2);
  }
  const env = mergeAppEnv(readAppEnv(projectRoot()), process.env);
  const isProductionBuild =
    command.endsWith("vite") && args.some((arg) => arg === "build" || arg.startsWith("build"));
  if (isProductionBuild) {
    const deployCheck = checkDeployAuthConfig(env);
    if (deployCheck.status === "misconfigured") {
      console.error(deployCheck.message);
      process.exit(1);
    }
  }
  const child = spawn(command, args, { stdio: "inherit", env });
  // The dev server is long-running and is stopped by signalling this wrapper.
  for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
    process.on(signal, () => child.kill(signal));
  }
  child.on("error", (err) => {
    console.error(`[with-app-env] failed to run ${command}:`, err?.message || err);
    process.exit(127);
  });
  child.on("exit", (code, signal) => {
    process.exit(exitStatusFromChild(code, signal));
  });
}

if (isMainModule(import.meta.url)) {
  main(process.argv.slice(2));
}
