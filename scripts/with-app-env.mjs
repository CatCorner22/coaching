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
  return parseAppEnvReport(text).env;
}

/**
 * Parse an app-env document, reporting what was discarded.
 *
 * A stray trailing comma or a nested `{ "env": {...} }` shape used to be
 * swallowed, so the file silently did nothing and the operator got the opposite
 * of the value they wrote. Anything dropped is named.
 */
export function parseAppEnvReport(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    return { env: {}, problems: [`${APP_ENV_REL_PATH} is not valid JSON: ${error.message}`] };
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      env: {},
      problems: [`${APP_ENV_REL_PATH} must be a JSON object of VITE_ keys to string values`],
    };
  }
  const env = {};
  const problems = [];
  for (const [key, value] of Object.entries(parsed)) {
    if (!key.startsWith(VITE_PREFIX)) {
      problems.push(`${APP_ENV_REL_PATH}: ignored "${key}" — only ${VITE_PREFIX}* keys are read`);
      continue;
    }
    if (typeof value !== "string") {
      problems.push(`${APP_ENV_REL_PATH}: ignored "${key}" — the value must be a quoted string`);
      continue;
    }
    env[key] = value;
  }
  return { env, problems };
}

/**
 * The app env recorded under `root`, with a safe standalone auth-off default,
 * plus anything wrong with the file. An absent file is not a problem; a file
 * that is present and unusable is.
 */
export function readAppEnvReport(root) {
  let text;
  try {
    text = readFileSync(join(root, APP_ENV_REL_PATH), "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return { env: { ...DEFAULT_APP_ENV }, fileEnv: {}, problems: [] };
    return {
      env: { ...DEFAULT_APP_ENV },
      fileEnv: {},
      problems: [`${APP_ENV_REL_PATH} could not be read: ${error?.message || error}`],
    };
  }
  const report = parseAppEnvReport(text);
  return {
    env: { ...DEFAULT_APP_ENV, ...report.env },
    // The file's own entries, so callers can tell an operator's choice from a
    // DEFAULT_APP_ENV fallback.
    fileEnv: report.env,
    problems: report.problems,
  };
}

/** The app env recorded under `root`, with a safe standalone auth-off default. */
export function readAppEnv(root) {
  return readAppEnvReport(root).env;
}

/** Refuse to run under a Node that cannot execute the scripts this repo ships. */
export function nodeVersionProblem(version, range = "22") {
  const major = Number(/^v?(\d+)/.exec(version)?.[1]);
  if (!Number.isFinite(major) || String(major) === range) return null;
  return `This project needs Node ${range} (package.json engines: node >=22 <23). You are running ${version}. With nvm: nvm install 22 && nvm use 22.`;
}

/** File values under the process environment: an explicit override wins. */
export function mergeAppEnv(appEnv, processEnv) {
  return { ...appEnv, ...processEnv };
}

/**
 * Marker naming the auth flag as this wrapper's own standalone default rather
 * than something an operator chose. Without it a release step that only forgot
 * DATABASE_URL inherited `VITE_AUTH_ENABLED=false` from DEFAULT_APP_ENV and
 * read as a deliberate no-auth deploy, so `db:migrate` skipped and shipped an
 * unmigrated auth schema.
 */
export const AUTH_FLAG_DEFAULTED = "APP_ENV_AUTH_DEFAULTED";

/** Whether the merged auth flag came only from DEFAULT_APP_ENV. */
export function authFlagIsWrapperDefault(fileEnv, processEnv) {
  return (
    fileEnv?.VITE_AUTH_ENABLED === undefined && processEnv?.VITE_AUTH_ENABLED === undefined
  );
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
  const versionProblem = nodeVersionProblem(process.version);
  if (versionProblem) {
    console.error(`[with-app-env] ${versionProblem}`);
    process.exit(1);
  }
  const appEnv = readAppEnvReport(projectRoot());
  for (const problem of appEnv.problems) console.error(`[with-app-env] ${problem}`);
  const env = mergeAppEnv(appEnv.env, process.env);
  if (authFlagIsWrapperDefault(appEnv.fileEnv, process.env)) env[AUTH_FLAG_DEFAULTED] = "1";
  const isProductionBuild =
    command.endsWith("vite") && args.some((arg) => arg === "build" || arg.startsWith("build"));
  if (isProductionBuild) {
    if (appEnv.problems.length > 0) {
      console.error(`[with-app-env] refusing to build with an unusable ${APP_ENV_REL_PATH}`);
      process.exit(1);
    }
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
