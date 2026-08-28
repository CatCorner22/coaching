#!/usr/bin/env node
/**
 * End-to-end camera verification against a running dev server.
 *
 *   npm run dev            # terminal 1
 *   node scripts/camera-e2e.mjs   # terminal 2 (S=<dir> to keep screenshots)
 *
 * Drives the real UI: consent gate, Studio live preview, still capture, the
 * academy practice cam blocked before the photos limit and unlocked after.
 * This build's --use-fake-device-for-media-capture is inert, so a synthetic
 * camera (canvas.captureStream painting rope-band stripes) is injected before
 * app code runs; the app still exercises its genuine constraint ladder,
 * preview attach, quality scoring and capture. Exits non-zero on failure.
 */
import { chromium } from "playwright";

const OUT = process.env.S ?? ".tanstack/tmp";
const shot = (p, n) => p.screenshot({ path: `${OUT}/${n}.png`, fullPage: false }).catch(() => {});
const log = (...a) => console.log("[e2e]", ...a);

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium",
  args: [
    "--use-fake-device-for-media-capture",
    "--use-fake-ui-for-media-capture",
    "--no-sandbox",
    "--no-proxy-server",
  ],
});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.grantPermissions(["camera"], { origin: "http://localhost:8080" });
const page = await ctx.newPage();
// This build's --use-fake-device-for-media-capture is inert (zero devices in
// both headless modes), so synthesize a camera: a canvas painting slow
// high-contrast "rope band" stripes, captured as a real MediaStream. The app
// still runs its genuine constraint ladder, preview attach, quality scoring
// and still capture against it.
await page.addInitScript(() => {
  const canvas = document.createElement("canvas");
  canvas.width = 1280; canvas.height = 960;
  const g = canvas.getContext("2d");
  let t = 0;
  const paint = () => {
    t += 1;
    g.fillStyle = "#d8d2c8"; g.fillRect(0, 0, canvas.width, canvas.height);
    g.fillStyle = "#7a5230";
    for (let i = 0; i < 4; i++) {
      const y = 260 + i * 110 + Math.sin(t / 40) * 6;
      g.fillRect(140, y, canvas.width - 280, 46);
    }
  };
  setInterval(paint, 66);
  paint();
  const fakeStream = () => {
    const s = canvas.captureStream(15);
    Object.defineProperty(s.getVideoTracks()[0], "label", { value: "Synthetic rope cam" });
    return s;
  };
  const md = navigator.mediaDevices;
  md.getUserMedia = async (constraints) => {
    if (!constraints || !constraints.video) throw Object.assign(new Error("no video requested"), { name: "NotFoundError" });
    return fakeStream();
  };
  md.enumerateDevices = async () => [{ deviceId: "synthetic", groupId: "synthetic", kind: "videoinput", label: "Synthetic rope cam", toJSON() { return this; } }];
});
// Classified at capture time rather than regexed out of a formatted string
// later: the console message for a failed subresource ("Failed to load
// resource: net::ERR_...") carries no URL, so only the paired requestfailed
// event knows which host it was.
const errors = [];
const isExternal = (url) => /^https?:\/\//.test(url) && !/^https?:\/\/(localhost|127\.0\.0\.1)[:/]/.test(url);
// A subresource that never loaded also surfaces as a console error with no
// URL of its own; treat that shape as transport noise, since a genuine app
// exception arrives as `pageerror` and a real same-origin failure still shows
// up as a requestfailed we do count.
const TRANSPORT = /Failed to load resource|net::ERR_/;
page.on("pageerror", (e) => errors.push({ own: true, text: `pageerror: ${e.message}` }));
page.on("console", (m) => {
  if (m.type() !== "error") return;
  const text = m.text();
  errors.push({ own: !TRANSPORT.test(text), text: `console: ${text}` });
});
page.on("requestfailed", (r) => {
  const url = r.url();
  errors.push({
    own: !isExternal(url),
    text: `requestfailed: ${url.slice(0, 120)} — ${r.failure()?.errorText}`,
  });
});

try {
  await page.goto("http://localhost:8080/", { waitUntil: "networkidle", timeout: 30000 });
  await shot(page, "01-home");
  log("home title:", await page.title());

  // Front door: sign-in (auth now default-on) or straight to consent checkbox.
  const bodyText = await page.locator("body").innerText();
  if (/sign in|log in|create account|email/i.test(bodyText) && !/step inside/i.test(bodyText)) {
    log("auth wall detected — attempting local sign-up");
    const email = `e2e-${Date.now()}@example.com`;
    const emailBox = page.locator('input[type="email"], input[name="email"]').first();
    if (await emailBox.count()) {
      await emailBox.fill(email);
      const pw = page.locator('input[type="password"]').first();
      await pw.fill("e2e-password-123!");
      const signUpTab = page.getByRole("button", { name: /sign up|create/i }).first();
      if (await signUpTab.count()) await signUpTab.click();
      await page.waitForTimeout(2500);
      await shot(page, "02-after-auth");
    }
  }

  // Consent checkbox + Step inside, wherever it now lives.
  for (let i = 0; i < 3; i++) {
    const cb = page.locator('input[type="checkbox"]');
    const stepInside = page.getByRole("button", { name: /step inside/i });
    if (await stepInside.count()) {
      const n = await cb.count();
      for (let k = 0; k < n; k++) { const c = cb.nth(k); if (!(await c.isChecked())) await c.check(); }
      await stepInside.click();
      log("passed consent gate with", n, "checkbox(es)");
      await page.waitForTimeout(1000);
      break;
    }
    await page.waitForTimeout(1000);
  }
  await shot(page, "03-inside");

  // Studio: open live camera on the fake device, capture a still.
  await page.goto("http://localhost:8080/studio", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await shot(page, "04-studio");
  const openCam = page.getByRole("button", { name: /open live camera/i }).first();
  if (!(await openCam.count())) throw new Error("Open live camera button not found on /studio");
  const disabled = await openCam.isDisabled();
  log("Open live camera present; disabled =", disabled);
  if (disabled) throw new Error("Open live camera is disabled — gate state: " + (await page.locator("body").innerText()).slice(0, 400));
  await openCam.click();
  // Live <video> should attach the fake stream (element may start hidden).
  try {
    await page.waitForFunction(() => {
      const v = document.querySelector("video");
      return v && v.readyState >= 2 && v.videoWidth > 0;
    }, { timeout: 20000 });
  } catch (e) {
    const state = await page.evaluate(() => {
      const v = document.querySelector("video");
      return v ? { cls: v.className, ready: v.readyState, w: v.videoWidth, src: !!v.srcObject } : null;
    });
    log("video state at timeout:", JSON.stringify(state));
    const t = await page.locator("body").innerText();
    log("page says:", t.replace(/\n+/g, " | ").slice(0, 2000));
    const hits = t.split("\n").filter((l) => /camera|permission|denied|failed|error|https/i.test(l));
    log("error-ish lines:", JSON.stringify(hits.slice(0, 10)));
    throw e;
  }
  const dims = await page.evaluate(() => {
    const v = document.querySelector("video");
    return { w: v.videoWidth, h: v.videoHeight };
  });
  log("live preview streaming at", dims.w + "x" + dims.h);
  await shot(page, "05-live");

  // The still control is "Burst stills" since the five-shot burst landed; it
  // was "Capture still" before. Match either so this harness keeps working
  // across that rename rather than failing on a label change.
  const capture = page.getByRole("button", { name: /burst stills|capture still/i }).first();
  if (!(await capture.count())) throw new Error("still-capture button not found");
  await capture.click();
  await page.waitForTimeout(2500);
  await shot(page, "06-captured");
  // Assert something that exists only after a still commits. An earlier
  // version matched /analyze/i, which the always-present "Analyze selected
  // stills once" button satisfies — so a capture that failed internally still
  // reported success. The readiness headlines are rendered from the captured
  // frame's own quality score and cannot appear without one.
  const READINESS = /good to analyze|stills are hard to read|a little soft|lighting is dim|rope is small in frame/i;
  const readiness = page.locator("p").filter({ hasText: READINESS }).first();
  await readiness.waitFor({ state: "visible", timeout: 15000 }).catch(() => {});
  if (!(await readiness.count())) {
    const body = (await page.locator("body").innerText()).replace(/\n+/g, " | ");
    throw new Error(`no readiness card after capture — page: ${body.slice(0, 400)}`);
  }
  log("capture produced a still + readiness card:", (await readiness.innerText()).trim());

  // Academy practice cam: must be BLOCKED before photos=yes, open after.
  await page.goto("http://localhost:8080/tie/single-column", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  let academy = await page.locator("body").innerText();
  const blockedBefore = /photos \/ video/i.test(academy) && /limit is a yes/i.test(academy);
  log("academy cam blocked before photos limit:", blockedBefore);
  await shot(page, "07-academy-blocked");
  if (!blockedBefore) {
    throw new Error("academy practice cam was NOT gated on the photos limit before it was agreed");
  }

  await page.goto("http://localhost:8080/negotiate", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  // Find the photos row and click its "yes".
  const yesBtn = page.locator('[aria-labelledby="neg-label-photos"] button', { hasText: /^yes$/i }).first();
  if (!(await yesBtn.count())) {
    // Silently skipping this left the unlock half of the test unexercised
    // while still reporting PASS.
    throw new Error('the photos "yes" control was not found on /negotiate');
  }
  await yesBtn.click();
  log("set photos limit to yes");
  await page.waitForTimeout(600);
  await shot(page, "08-negotiated");

  await page.goto("http://localhost:8080/tie/single-column", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  academy = await page.locator("body").innerText();
  const openAfter = !( /limit is a yes/i.test(academy) );
  log("academy cam unlocked after photos=yes:", openAfter);
  await shot(page, "09-academy-open");
  if (!openAfter) {
    throw new Error("academy practice cam stayed blocked after the photos limit was agreed");
  }

  // An uncaught exception or a failed same-origin request during the camera
  // flow is a regression, and printing it after PASS (as this did) hides it.
  // External-host failures are excluded on purpose: this sandbox has no
  // outbound network, and the page embeds a third-party script, so failing on
  // those would make the harness red for environmental reasons rather than
  // app ones. CI runners do reach them, and the preflight smoke there fails
  // closed on any browser error.
  const ownErrors = errors.filter((entry) => entry.own);
  if (ownErrors.length) {
    throw new Error(
      `browser errors during the camera flow:\n${ownErrors.slice(0, 8).map((e) => e.text).join("\n")}`,
    );
  }
  console.log("\nRESULT: PASS");
  const external = errors.length - ownErrors.length;
  if (external) console.log(`(${external} external-resource error(s) ignored — no outbound network here)`);
} catch (e) {
  await shot(page, "99-failure").catch(() => {});
  console.log("\nRESULT: FAIL —", e.message);
  if (errors.length) console.log("browser errors:\n" + errors.slice(0, 8).map((e) => e.text).join("\n"));
  process.exitCode = 1;
} finally {
  await browser.close();
}
