/**
 * Generate the self-contained offline emergency card.
 *
 * The service worker serves this file when `/emergency` cannot be fetched, so
 * it deliberately depends on nothing: no bundle, no stylesheet, no font file,
 * no script. If every other asset in the app is unreachable or broken, this
 * page still renders — which is the entire point of an emergency card.
 *
 * It is a committed artifact rather than a build side effect, because
 * `npm run build` is deliberately side-effect-free. `scripts/offline-emergency.test.mjs`
 * fails if the committed file falls behind `src/lib/emergency-card.ts`, so the
 * two cannot silently drift.
 *
 *   node --experimental-strip-types --import ./scripts/register-ts.mjs \
 *     scripts/build-offline-emergency.mjs [--check]
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isMainModule } from "./with-app-env.mjs";
import {
  EMERGENCY_CALL_BODY,
  EMERGENCY_CALL_HEADLINE,
  EMERGENCY_KICKER,
  EMERGENCY_OFFLINE_NOTE,
  EMERGENCY_STEPS,
  EMERGENCY_TITLE,
} from "../src/lib/emergency-card.ts";

export const OUTPUT_REL_PATH = "public/emergency-offline.html";

export function projectRoot() {
  return join(dirname(fileURLToPath(import.meta.url)), "..");
}

/** Escape for HTML text and double-quoted attribute contexts alike. */
function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderOfflineEmergencyHtml() {
  const steps = EMERGENCY_STEPS.map(
    (step) => `      <li>
        <span class="label">${esc(step.label)}</span>
        <p>${esc(step.body)}</p>
      </li>`,
  ).join("\n");

  // Colours are the app's own tokens, inlined: a stylesheet request is a
  // network request, and this page exists for when those fail.
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#0b0a09">
<title>Emergency · Knotty</title>
<style>
  :root {
    color-scheme: dark;
    --bg: #0b0a09;
    --fg: #f1ebe3;
    --muted: #9a9188;
    --subtle: #8f877e;
    --danger: #b4453a;
    --danger-text: #d97064;
    --warn: #c4a56a;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--fg);
    font: 16px/1.6 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    -webkit-text-size-adjust: 100%;
  }
  main { margin: 0 auto; max-width: 36rem; padding: 2.5rem 1.25rem; }
  .kicker {
    margin: 0; font-size: .75rem; text-transform: uppercase;
    letter-spacing: .22em; color: var(--danger-text);
  }
  h1 {
    margin: .5rem 0 0; font-size: 3rem; line-height: 1.05; font-weight: 400;
    color: var(--danger-text);
    font-family: "Iowan Old Style", Baskerville, "Times New Roman", serif;
  }
  ol { margin: 2rem 0 0; padding: 0; list-style: none; }
  li + li { margin-top: 1.25rem; }
  .label {
    display: block; font-size: .75rem; text-transform: uppercase;
    letter-spacing: .06em; color: var(--subtle);
  }
  li p { margin: .25rem 0 0; }
  .call {
    margin-top: 2rem; padding: 1rem; border-radius: 12px;
    border: 1px solid var(--danger); background: rgba(180, 69, 58, .1);
    font-size: .875rem;
  }
  .call strong { display: block; color: var(--danger-text); font-weight: 500; }
  .call p { margin: .25rem 0 0; color: var(--muted); }
  .offline {
    margin-top: 1.5rem; padding: .75rem 1rem; border-radius: 12px;
    border: 1px solid rgba(196, 165, 106, .5); background: rgba(196, 165, 106, .1);
    color: var(--warn); font-size: .8125rem;
  }
  .back {
    display: inline-flex; align-items: center; min-height: 44px;
    margin-top: 2rem; color: var(--muted); font-size: .875rem;
  }
</style>
</head>
<body>
<main>
  <p class="kicker">${esc(EMERGENCY_KICKER)}</p>
  <h1>${esc(EMERGENCY_TITLE)}</h1>
  <ol>
${steps}
  </ol>
  <div class="call" role="alert">
    <strong>${esc(EMERGENCY_CALL_HEADLINE)}</strong>
    <p>${esc(EMERGENCY_CALL_BODY)}</p>
  </div>
  <p class="offline">${esc(EMERGENCY_OFFLINE_NOTE)}</p>
  <a class="back" href="/">Back to Knotty</a>
</main>
</body>
</html>
`;
}

function main() {
  const target = join(projectRoot(), OUTPUT_REL_PATH);
  const next = renderOfflineEmergencyHtml();
  if (process.argv.includes("--check")) {
    const current = readFileSync(target, "utf8");
    if (current !== next) {
      console.error(
        `[offline-emergency] ${OUTPUT_REL_PATH} is stale. Run: npm run build:offline-emergency`,
      );
      process.exit(1);
    }
    console.log(`[offline-emergency] ${OUTPUT_REL_PATH} is up to date`);
    return;
  }
  const current = existsSync(target) ? readFileSync(target, "utf8") : null;
  writeFileSync(target, next);
  if (current !== next) {
    console.log(
      `[offline-emergency] regenerated ${OUTPUT_REL_PATH} (was stale — commit it)`,
    );
  } else {
    console.log(`[offline-emergency] ${OUTPUT_REL_PATH} unchanged`);
  }
}

// Reuses the shared symlink-safe entry check: a raw argv comparison makes a
// CLI launched through a symlinked path a silent no-op that still exits 0.
if (isMainModule(import.meta.url)) {
  main();
}
