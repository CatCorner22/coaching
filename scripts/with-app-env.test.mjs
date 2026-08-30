import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";
import {
  APP_ENV_REL_PATH,
  AUTH_FLAG_DEFAULTED,
  authFlagIsWrapperDefault,
  mergeAppEnv,
  nodeVersionProblem,
  parseAppEnv,
  parseAppEnvReport,
  projectRoot,
  readAppEnv,
  readAppEnvReport,
} from "./with-app-env.mjs";

const execFileAsync = promisify(execFile);
const WRAPPER = join(projectRoot(), "scripts/with-app-env.mjs");
const PRINT_FLAG = "process.stdout.write(String(process.env.VITE_AUTH_ENABLED));";

/** What the wrapper injects: file defaults merged with the caller's process.env. */
function expectedWrappedAuthEnabled() {
  return mergeAppEnv(readAppEnv(projectRoot()), process.env).VITE_AUTH_ENABLED;
}

function makeWorkspace(appEnvJson) {
  const root = mkdtempSync(join(tmpdir(), "app-env-"));
  if (appEnvJson !== undefined) {
    mkdirSync(join(root, ".grok"), { recursive: true });
    writeFileSync(join(root, APP_ENV_REL_PATH), appEnvJson);
  }
  return root;
}

test("keeps VITE_-prefixed string entries", () => {
  assert.deepEqual(parseAppEnv('{"VITE_AUTH_ENABLED":"false"}'), {
    VITE_AUTH_ENABLED: "false",
  });
});

test("drops non-VITE keys, non-string values and malformed documents", () => {
  assert.deepEqual(parseAppEnv('{"DATABASE_URL":"postgres://x","VITE_N":1,"VITE_OK":"y"}'), {
    VITE_OK: "y",
  });
  assert.deepEqual(parseAppEnv("not json"), {});
  assert.deepEqual(parseAppEnv('["VITE_AUTH_ENABLED"]'), {});
  assert.deepEqual(parseAppEnv("null"), {});
});

test("a missing app-env.json uses the standalone default", () => {
  // A clone has no .grok/app-env.json, and the README promises that clone runs
  // without accounts, secrets or a database.
  assert.deepEqual(readAppEnv(makeWorkspace()), {
    VITE_AUTH_ENABLED: "false",
    VITE_MEDIA_UPLOAD_SCOPE: "adult_nudity",
  });
});

test("reads the app env from a workspace", () => {
  const root = makeWorkspace('{"VITE_AUTH_ENABLED":"false"}');
  assert.deepEqual(readAppEnv(root), {
    VITE_AUTH_ENABLED: "false",
    VITE_MEDIA_UPLOAD_SCOPE: "adult_nudity",
  });
});

test("an explicit process-env override wins over the file", () => {
  const merged = mergeAppEnv(
    { VITE_AUTH_ENABLED: "false" },
    { VITE_AUTH_ENABLED: "true", PATH: "/usr/bin" },
  );
  assert.equal(merged.VITE_AUTH_ENABLED, "true");
  assert.equal(merged.PATH, "/usr/bin");
});

test("the template ships auth off for a standalone run and records the upload scope", () => {
  assert.deepEqual(readAppEnv(projectRoot()), {
    VITE_AUTH_ENABLED: "false",
    VITE_MEDIA_UPLOAD_SCOPE: "adult_nudity",
  });
});

test("vite loadEnv resolves the wrapped value", () => {
  // What `import.meta.env.VITE_AUTH_ENABLED` becomes: loadEnv prefix-matches
  // process.env, so the wrapper's merge has to land before Vite starts.
  // Do not `import { loadEnv } from "vite"` here — Vite 8 loads rolldown
  // native bindings that SIGSEGV the test worker under qemu-user.
  const root = makeWorkspace('{"VITE_AUTH_ENABLED":"false"}');
  const merged = mergeAppEnv(readAppEnv(root), { PATH: "/usr/bin" });
  assert.equal(merged.VITE_AUTH_ENABLED, "false");
});

test("the wrapped command runs with the app env applied", async () => {
  const { stdout } = await execFileAsync(process.execPath, [
    WRAPPER,
    process.execPath,
    "-e",
    PRINT_FLAG,
  ]);
  assert.equal(stdout, expectedWrappedAuthEnabled());
});

test("the wrapped command sees an explicit override, not the file value", async () => {
  const { stdout } = await execFileAsync(
    process.execPath,
    [WRAPPER, process.execPath, "-e", PRINT_FLAG],
    { env: { ...process.env, VITE_AUTH_ENABLED: "true" } },
  );
  assert.equal(stdout, "true");
});

test("the wrapper propagates the command's exit code", async () => {
  await assert.rejects(
    execFileAsync(process.execPath, [WRAPPER, process.execPath, "-e", "process.exit(3)"]),
    (err) => err.code === 3,
  );
});

test("a signal-killed command is never reported as success", async () => {
  // The wrapper's own SIGTERM handler must not swallow the re-raised signal:
  // a cancelled build reporting exit 0 is a silently passing gate.
  await assert.rejects(
    execFileAsync(process.execPath, [
      WRAPPER,
      process.execPath,
      "-e",
      "process.kill(process.pid, 'SIGTERM');setTimeout(() => {}, 1000);",
    ]),
    (err) => err.signal === "SIGTERM" || err.code !== 0,
  );
});

test("the CLI still runs when invoked through a symlinked path", async () => {
  // node realpaths import.meta.url but not process.argv[1], so a raw comparison
  // turns the wrapper into a no-op that exits 0 without starting anything.
  const link = join(mkdtempSync(join(tmpdir(), "app-env-link-")), "scripts");
  symlinkSync(join(projectRoot(), "scripts"), link);
  const { stdout } = await execFileAsync(process.execPath, [
    join(link, "with-app-env.mjs"),
    process.execPath,
    "-e",
    PRINT_FLAG,
  ]);
  assert.equal(stdout, expectedWrappedAuthEnabled());
});

test("a present but unusable app-env file says so instead of reverting silently", () => {
  // A stray trailing comma or a nested { env: {...} } shape used to be
  // swallowed, so the operator got the built-in default — the opposite of what
  // they wrote — with nothing printed anywhere.
  assert.match(parseAppEnvReport('{"VITE_AUTH_ENABLED":"true",}').problems[0], /not valid JSON/);
  assert.match(
    parseAppEnvReport('{"env":{"VITE_AUTH_ENABLED":"true"}}').problems[0],
    /only VITE_\* keys are read/,
  );
  assert.match(parseAppEnvReport('{"VITE_AUTH_ENABLED":false}').problems[0], /quoted string/);
  assert.match(parseAppEnvReport("[]").problems[0], /must be a JSON object/);
  assert.deepEqual(parseAppEnvReport('{"VITE_AUTH_ENABLED":"true"}').problems, []);

  // An absent file is not a problem; a broken one is, and a build refuses it.
  assert.deepEqual(readAppEnvReport(makeWorkspace()).problems, []);
  const broken = makeWorkspace('{"VITE_AUTH_ENABLED":"true",}');
  assert.equal(readAppEnvReport(broken).problems.length, 1);
  // …and a build refuses to run on a file it could not honour.
  assert.match(
    readFileSync(join(projectRoot(), "scripts/with-app-env.mjs"), "utf8"),
    /refusing to build with an unusable/,
  );
});

test("an unsupported Node version is named before anything else runs", () => {
  // The build died with `node: bad option: --experimental-strip-types`, which
  // mentions neither Node 22 nor the engines field.
  assert.match(nodeVersionProblem("v20.18.1"), /needs Node 22/);
  assert.match(nodeVersionProblem("v20.18.1"), /v20\.18\.1/);
  assert.equal(nodeVersionProblem("v22.12.0"), null);
  assert.equal(nodeVersionProblem("nonsense"), null);
});

test("the wrapper's own auth default is marked as a default, not an operator choice", () => {
  // db:migrate runs through this wrapper. Treating the standalone auth-off
  // default as an explicit no-auth deployment let a release that only forgot
  // DATABASE_URL skip migrations and ship an unmigrated auth schema.
  assert.equal(AUTH_FLAG_DEFAULTED, "APP_ENV_AUTH_DEFAULTED");
  assert.equal(authFlagIsWrapperDefault({}, {}), true);
  assert.equal(authFlagIsWrapperDefault({ VITE_AUTH_ENABLED: "false" }, {}), false);
  assert.equal(authFlagIsWrapperDefault({}, { VITE_AUTH_ENABLED: "true" }), false);
  // The file's own entries are reported apart from the defaults it fills in.
  assert.deepEqual(readAppEnvReport(makeWorkspace()).fileEnv, {});
  assert.deepEqual(readAppEnvReport(makeWorkspace('{"VITE_AUTH_ENABLED":"true"}')).fileEnv, {
    VITE_AUTH_ENABLED: "true",
  });
});
