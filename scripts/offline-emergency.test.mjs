import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  OUTPUT_REL_PATH,
  projectRoot,
  renderOfflineEmergencyHtml,
} from "./build-offline-emergency.mjs";
import {
  EMERGENCY_CALL_HEADLINE,
  EMERGENCY_OFFLINE_NOTE,
  EMERGENCY_STEPS,
  EMERGENCY_TITLE,
} from "../src/lib/emergency-card.ts";

const root = projectRoot();
const committed = readFileSync(join(root, OUTPUT_REL_PATH), "utf8");
const routeSource = readFileSync(join(root, "src/routes/emergency.tsx"), "utf8");
const workerSource = readFileSync(join(root, "public/sw.js"), "utf8");

test("the committed offline card matches the generator", () => {
  // Two hand-maintained copies of emergency instructions is exactly the drift
  // that gets noticed at the worst possible moment.
  assert.equal(
    committed,
    renderOfflineEmergencyHtml(),
    `${OUTPUT_REL_PATH} is stale — run: npm run build:offline-emergency`,
  );
});

test("every step of the card survives into the offline copy", () => {
  assert.ok(EMERGENCY_STEPS.length >= 5);
  for (const step of EMERGENCY_STEPS) {
    assert.ok(committed.includes(step.label), `missing label: ${step.label}`);
    // Apostrophes are the realistic escaping trap here ("the person's position").
    assert.ok(
      committed.includes(step.body.replace(/&/g, "&amp;").replace(/</g, "&lt;")),
      `missing body: ${step.label}`,
    );
  }
  assert.ok(committed.includes(EMERGENCY_TITLE));
  assert.ok(committed.includes(EMERGENCY_CALL_HEADLINE));
});

test("the offline copy says it is the offline copy", () => {
  // A cached card cannot know how stale it is, and a reader must not mistake it
  // for a live page that just checked something.
  assert.ok(committed.includes(EMERGENCY_OFFLINE_NOTE));
  assert.match(EMERGENCY_OFFLINE_NOTE, /saved offline copy/i);
  assert.match(EMERGENCY_OFFLINE_NOTE, /do not wait for a network/i);
});

test("the offline copy depends on no network resource", () => {
  // The entire point is that it renders when everything else is unreachable.
  assert.doesNotMatch(committed, /<script/i, "a script tag would need the network");
  assert.doesNotMatch(committed, /<link[^>]+stylesheet/i, "an external stylesheet");
  assert.doesNotMatch(committed, /<img|<svg[^>]+src=/i, "a remote image");
  assert.doesNotMatch(committed, /https?:\/\//i, "an absolute remote URL");
  assert.doesNotMatch(committed, /@import|url\(/i, "a CSS-fetched asset");
  // Only same-origin, path-relative hrefs.
  for (const href of committed.match(/href="([^"]*)"/g) ?? []) {
    assert.match(href, /href="\/[^"]*"/, `non-root-relative href: ${href}`);
  }
});

test("the offline copy still refuses to guess an emergency number", () => {
  // Browser language and geolocation both get this wrong on a roaming SIM or a
  // VPN, on the one screen that must not be confidently wrong.
  assert.match(committed, /will not guess a number/i);
  assert.doesNotMatch(committed, /\btel:/i, "a dialer link implies a known number");
  assert.doesNotMatch(committed, /\b(911|999|112|000)\b/, "a hardcoded emergency number");
});

test("the route and the offline copy render from the same module", () => {
  // If the route ever inlines its own copy again, this fails.
  assert.match(routeSource, /from "@\/lib\/emergency-card"/);
  assert.match(routeSource, /EMERGENCY_STEPS\.map/);
  for (const step of EMERGENCY_STEPS) {
    assert.ok(
      !routeSource.includes(step.body),
      `the route inlines step copy again: ${step.label}`,
    );
  }
});

test("the worker's scope stays narrow enough to be safe", () => {
  // A worker that caches the bundle serves a stale build for days after a
  // deploy. This one must only ever answer the emergency card.
  assert.match(workerSource, /request\.mode !== "navigate"/);
  assert.match(workerSource, /path !== "\/emergency"/);
  assert.match(workerSource, /url\.origin !== self\.location\.origin/);
  // Network-first: the live card wins whenever it can be fetched.
  const respondIndex = workerSource.indexOf("respondWith");
  const fetchIndex = workerSource.indexOf("await fetch(request)");
  const matchIndex = workerSource.indexOf("caches.match");
  assert.ok(fetchIndex > respondIndex && fetchIndex < matchIndex, "cache must be the fallback");
  // Exactly one call site, so nothing else can be intercepted by accident.
  // Counts `event.respondWith(` rather than the bare word, which also appears
  // in the file's own doc comment.
  assert.equal(workerSource.match(/event\.respondWith\(/g)?.length, 1);
  // The precached entry is the generated card, not the app route.
  assert.match(workerSource, /const OFFLINE_CARD = "\/emergency-offline\.html"/);
});

test("a failed precache does not block the worker from activating", () => {
  // Otherwise a single bad install leaves the worker permanently stuck and no
  // later install can repair it.
  const install = workerSource.slice(
    workerSource.indexOf('addEventListener("install"'),
    workerSource.indexOf('addEventListener("activate"'),
  );
  assert.match(install, /try \{/);
  assert.match(install, /catch \{/);
  assert.ok(
    install.indexOf("skipWaiting") > install.indexOf("catch {"),
    "skipWaiting must run after the catch, not inside the try",
  );
});
