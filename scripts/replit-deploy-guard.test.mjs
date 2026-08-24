import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";
import { REPLIT_DEPLOY_REFUSAL } from "./replit-deploy-guard.mjs";
import { projectRoot } from "./with-app-env.mjs";

const run = promisify(execFile);

function replitConfig() {
  return readFileSync(join(projectRoot(), ".replit"), "utf8");
}

test("the deploy guard exits non-zero so a Deployment cannot proceed", async () => {
  // A guard that explains itself and then exits 0 is not a guard: Replit reads
  // the exit status, not the prose.
  await assert.rejects(
    () => run(process.execPath, [join(projectRoot(), "scripts/replit-deploy-guard.mjs")]),
    (err) => {
      assert.equal(err.code, 1, "guard must exit 1");
      assert.match(err.stderr, /not a supported target/i);
      return true;
    },
  );
});

test("the refusal says what is still supported, not only what is refused", () => {
  // A bare "no" would read as the app being broken on Replit, which is the
  // opposite of true — the Run button is the whole point of the .replit file.
  assert.match(REPLIT_DEPLOY_REFUSAL, /Run button is fully supported/);
  assert.match(REPLIT_DEPLOY_REFUSAL, /npm run build/);
});

test("the refusal names the specific dev-server behaviour it is protecting against", () => {
  // The reason has to survive someone skimming it, or they will just override
  // the guard and publish the dev server anyway.
  assert.match(REPLIT_DEPLOY_REFUSAL, /shared\s+development identity/i);
  assert.match(REPLIT_DEPLOY_REFUSAL, /in-memory database/i);
});

test(".replit routes deployment at the guard rather than leaving it to fall back", () => {
  // This is the invariant that actually matters. Without a [deployment]
  // section Replit falls back to the workspace `run` command, which is the dev
  // server — the exact outcome the guard exists to prevent. A guard script
  // nothing points at protects nothing.
  const config = replitConfig();
  assert.match(config, /\[deployment\]/, ".replit must declare a [deployment] section");

  // Assert on the `run` key specifically. Checking the whole section for the
  // guard's filename passes while `run` starts the dev server and only `build`
  // mentions the guard — which is precisely the state that publishes it.
  const deployment = config.slice(config.indexOf("[deployment]"));
  const runLine = deployment.split("\n").find((line) => line.trimStart().startsWith("run"));
  assert.ok(runLine, "[deployment] must set a run command");
  assert.match(runLine, /replit-deploy-guard\.mjs/, "[deployment].run must invoke the guard");
});

test(".replit does not hand the dev server to a deployment", () => {
  const config = replitConfig();
  // Everything after the header, minus comment lines: a comment explaining
  // what the guard prevents legitimately names the dev server.
  const deployment = config
    .slice(config.indexOf("[deployment]"))
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("#"))
    .join("\n");
  // Match the bare token, not the phrase. TOML exec form splits the command
  // into elements (["npm", "run", "dev"]), so a `/npm run dev/` regex reads as
  // a passing test while the deployment starts the dev server.
  assert.doesNotMatch(
    deployment,
    /\bdev\b/,
    "the deployment section must never start the dev server",
  );
});

test(".replit still runs the dev server for the Run button", () => {
  // The other half of the contract: hardening the deploy path must not break
  // the workspace path it is protecting.
  const config = replitConfig();
  const beforeDeployment = config.slice(0, config.indexOf("[deployment]"));
  assert.match(beforeDeployment, /^run\s*=.*npm run dev/m);
});

test("the Run command installs dependencies before starting the dev server", () => {
  // A fresh GitHub import has no node_modules, and `npm run dev` there fails
  // with "vite: not found" — which reads as a broken repo rather than a
  // missing install step.
  const config = replitConfig();
  const runLine = config.split("\n").find((line) => line.startsWith("run ="));
  assert.ok(runLine, ".replit must have a run command");
  assert.match(runLine, /npm (ci|install)/, "run must install dependencies first");
});

test("the pinned Replit Node module satisfies the package.json engines range", () => {
  // `modules = ["nodejs-22"]` and `"node": ">=22 <23"` drifting apart would
  // only show up as a runtime failure inside a Repl, where it is hardest to
  // diagnose.
  const config = replitConfig();
  const moduleMatch = config.match(/modules\s*=\s*\[([^\]]*)\]/);
  assert.ok(moduleMatch, ".replit must pin a language module");
  const major = moduleMatch[1].match(/nodejs-(\d+)/);
  assert.ok(major, ".replit must pin a nodejs-N module");

  const pkg = JSON.parse(readFileSync(join(projectRoot(), "package.json"), "utf8"));
  const engines = pkg.engines?.node ?? "";
  const min = engines.match(/>=\s*(\d+)/);
  const belowMax = engines.match(/<\s*(\d+)/);
  assert.ok(min && belowMax, "package.json engines.node must be a >=N <M range");
  const pinned = Number(major[1]);
  assert.ok(
    pinned >= Number(min[1]) && pinned < Number(belowMax[1]),
    `.replit pins nodejs-${pinned}, outside package.json engines "${engines}"`,
  );
});
