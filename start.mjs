#!/usr/bin/env node
/**
 * One-command launcher for running Knotty at home.
 *
 * Works on macOS, Windows and Linux with the same logic: it installs the app's
 * parts the first time, builds it, then starts the server on your home network
 * so your phones can open it over Wi-Fi. Cloud AI stays off in local built mode.
 *
 * The password is read from (in order) the SITE_PASSWORD environment variable,
 * then a password.txt file next to this script, then generated once and written
 * to password.txt so it stays the same on every run.
 */
import { spawnSync, spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { createHash, randomBytes } from "node:crypto";
import { networkInterfaces } from "node:os";
import { delimiter, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isMainModule } from "./scripts/with-app-env.mjs";

// start.mjs sits in the project folder itself, so its own directory is the root.
const ROOT = dirname(fileURLToPath(import.meta.url));
const PASSWORD_FILE = join(ROOT, "password.txt");
const PORT = Number(process.env.PORT || 8080);

function say(text) {
  console.log(text);
}

function fail(text) {
  console.error(`\n  Problem: ${text}\n`);
  if (process.platform === "win32" && !process.env.KNOTTY_LAUNCHER_PAUSES) {
    spawnSync("cmd.exe", ["/d", "/c", "pause"], { stdio: "inherit" });
  }
  process.exit(1);
}

export function nodeEnvironment(env, executable = process.execPath) {
  const key = Object.keys(env).find((name) => name.toLowerCase() === "path") || "PATH";
  return { ...env, [key]: `${dirname(executable)}${delimiter}${env[key] || ""}` };
}

const ENV = nodeEnvironment(process.env);
const NPM = process.platform === "win32" ? `"${join(dirname(process.execPath), "npm.cmd")}"` : "npm";

/** Run a command inside the project folder, streaming its output. */
function run(command, args, label) {
  say(`\n  ${label}...`);
  const result = spawnSync(command, args, { cwd: ROOT, env: ENV, stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) fail(`${label} stopped with an error (code ${result.status}).`);
}

/** Node 22 is required by package.json engines; anything else is refused early. */
function checkNode() {
  const major = Number(/^v?(\d+)/.exec(process.version)?.[1]);
  if (!Number.isFinite(major)) fail(`Could not read your Node version (${process.version}).`);
  if (major !== 22) {
    fail(
      `This app needs Node 22, and you have ${process.version}.\n` +
        `  Download and install Node 22 from https://nodejs.org , then run this again.`,
    );
  }
}

function ensureInstalled() {
  const installedLock = join(ROOT, "node_modules", ".package-lock.json");
  if (existsSync(join(ROOT, "node_modules", "vite")) && existsSync(installedLock) &&
      statSync(installedLock).mtimeMs >= statSync(join(ROOT, "package-lock.json")).mtimeMs) return;
  run(NPM, ["ci", "--no-audit", "--no-fund"], "Installing the app's dependencies (a few minutes)");
}

export function buildFingerprint(root, env = {}) {
  const hash = createHash("sha256");
  const visit = (relative) => {
    const path = join(root, relative);
    if (!existsSync(path)) return;
    if (statSync(path).isDirectory()) {
      for (const name of readdirSync(path).sort()) visit(join(relative, name));
    } else {
      hash.update(relative).update("\0").update(readFileSync(path)).update("\0");
    }
  };
  for (const path of ["src", "public", "server", "scripts", "migrations", "package.json",
    "package-lock.json", "vite.config.ts", "tsconfig.json", ".grok/app-env.json"]) visit(path);
  for (const key of Object.keys(env).filter((key) => key.startsWith("VITE_")).sort()) {
    hash.update(key).update("\0").update(env[key] || "").update("\0");
  }
  return hash.digest("hex");
}

function ensureBuilt() {
  const manifest = join(ROOT, ".vercel", "output", "nitro.json");
  const stamp = join(ROOT, ".vercel", "output", "laptop-build.sha256");
  const fingerprint = buildFingerprint(ROOT, ENV);
  if (existsSync(manifest) && existsSync(stamp) && readFileSync(stamp, "utf8") === fingerprint) return;
  run(NPM, ["run", "build"], "Building the app (about a minute)");
  writeFileSync(stamp, buildFingerprint(ROOT, ENV));
}

/** The shared password: env var, then password.txt, then a fresh one. */
function resolvePassword() {
  const fromEnv = process.env.SITE_PASSWORD;
  if (typeof fromEnv === "string" && fromEnv.trim() !== "") return fromEnv.trim();
  if (existsSync(PASSWORD_FILE)) {
    const stored = readFileSync(PASSWORD_FILE, "utf8").trim();
    if (stored !== "") return stored;
  }
  const fresh = randomBytes(18).toString("base64url");
  writeFileSync(PASSWORD_FILE, `${fresh}\n`, { mode: 0o600 });
  return fresh;
}

/** Every non-internal IPv4 address, so the phone address can be printed. */
function lanAddresses() {
  const found = [];
  for (const list of Object.values(networkInterfaces())) {
    for (const net of list || []) {
      if (net.family === "IPv4" && !net.internal) found.push(net.address);
    }
  }
  return found;
}

export async function waitForServer(url, authorization, { timeoutMs = 60_000, fetchImpl = fetch } = {}) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetchImpl(url, {
        headers: { authorization }, signal: AbortSignal.timeout(Math.min(2000, timeoutMs)),
      });
      await response.body?.cancel();
      if (response.ok) return;
    } catch { /* The preview server is still starting. */ }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`The server did not become ready at ${url}. Check the server messages above.`);
}

function openBrowser(url) {
  const [command, args] = process.platform === "win32"
    ? ["explorer.exe", [url]]
    : process.platform === "darwin" ? ["open", [url]] : ["xdg-open", [url]];
  const opener = spawn(command, args, { stdio: "ignore", detached: true });
  opener.on("error", () => say(`  Could not open a browser automatically. Open ${url}`));
  opener.unref();
}

async function main() {
  checkNode();
  if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) fail("PORT must be a number between 1 and 65535.");
  ensureInstalled();
  ensureBuilt();
  const password = resolvePassword();
  const user = (process.env.SITE_USER || "us").trim() || "us";

  const env = { ...ENV, SITE_PASSWORD: password, SITE_USER: user };
  const child = spawn(NPM, ["run", "preview", "--", "--host", "0.0.0.0", "--port", String(PORT)], {
    cwd: ROOT,
    stdio: "inherit",
    env,
    shell: process.platform === "win32",
  });
  for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
    process.on(signal, () => child.kill(signal));
  }
  child.on("error", (error) => fail(error.message));
  child.on("exit", (code, signal) => {
    if (signal) process.exit(128);
    if (code) fail(`The server stopped with an error (code ${code}).`);
    process.exit(code ?? 1);
  });

  const url = `http://localhost:${PORT}`;
  try {
    await waitForServer(url, `Basic ${Buffer.from(`${user}:${password}`).toString("base64")}`);
  } catch (error) {
    child.kill();
    fail(error.message);
  }
  openBrowser(url);

  const addresses = lanAddresses();
  say("\n  ------------------------------------------------------");
  say("  Knotty is running. Keep this window open while you use it.");
  say("\n  On this computer:   http://localhost:" + PORT);
  if (addresses.length === 0) {
    say("  Phones:           no home-network address found — check your Wi-Fi.");
  }
  for (const address of addresses) say(`  On your phones:     http://${address}:${PORT}`);
  say(`\n  Username:  ${user}`);
  say(`  Password:  ${password}`);
  say("  (unless SITE_PASSWORD is set, the password is saved in password.txt)");
  say("  Phone cameras require HTTPS; see RUN_AT_HOME.md for Tailscale setup.");
  say("  ------------------------------------------------------\n");
}

if (isMainModule(import.meta.url)) main().catch((error) => fail(error.message));
