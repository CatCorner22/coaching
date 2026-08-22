#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, extname } from "node:path";
import { chromium } from "playwright";
import { checkedOutputPath, checkedUrl } from "./browser-guard.mjs";

const baseUrl = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8081/");
const requestedDesktopPng = checkedOutputPath(
  process.argv[3] ?? "/workspace/screenshots/camera-preflight.png",
  ["/workspace"],
);
const requestedExtension = extname(requestedDesktopPng);
const desktopPng = requestedExtension
  ? requestedDesktopPng
  : checkedOutputPath(`${requestedDesktopPng}.png`, ["/workspace"]);
const extension = extname(desktopPng);
const stem = desktopPng.slice(0, -extension.length);
const mobilePng = checkedOutputPath(`${stem}.mobile${extension}`, ["/workspace"]);
const verdictPath = checkedOutputPath(`${stem}.json`, ["/workspace"], "verdict JSON");
const studioUrl = new URL("/studio", baseUrl).href;
const viewports = [
  { name: "desktop", width: 1280, height: 800, screenshot: desktopPng },
  { name: "mobile", width: 390, height: 844, screenshot: mobilePng },
];

mkdirSync(dirname(desktopPng), { recursive: true });
const verdict = { ok: true, url: studioUrl, viewports: {} };
let browser;
try {
  browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  for (const viewport of viewports) {
    const page = await browser.newPage({
      viewport: { width: viewport.width, height: viewport.height },
    });
    const consoleErrors = [];
    const pageErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => pageErrors.push(String(error?.message ?? error)));

    const response = await page.goto(studioUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
    if (response?.status() !== 200)
      throw new Error(`${viewport.name}: HTTP ${response?.status() ?? 0}`);
    await page.getByText("Loading your consent on this device…", { exact: true }).waitFor({
      state: "hidden",
      timeout: 10_000,
    });

    const enter = page.getByRole("button", { name: "Enter", exact: true });
    if (await enter.isVisible().catch(() => false)) {
      const checks = page.getByRole("checkbox");
      if ((await checks.count()) !== 4) throw new Error(`${viewport.name}: consent gate changed`);
      for (let index = 0; index < 4; index += 1) await checks.nth(index).check();
      await enter.click();
    }

    const noConcern = page.getByRole("radio").first();
    await noConcern.waitFor({ state: "visible", timeout: 10_000 });
    await noConcern.check();
    await page.evaluate(() => {
      globalThis.__cameraPreflightCalls = { getUserMedia: 0, enumerateDevices: 0 };
      const devices = navigator.mediaDevices;
      if (!devices) return;
      Object.defineProperty(devices, "getUserMedia", {
        configurable: true,
        value: async () => {
          globalThis.__cameraPreflightCalls.getUserMedia += 1;
          throw new DOMException("preflight opened camera", "NotAllowedError");
        },
      });
      Object.defineProperty(devices, "enumerateDevices", {
        configurable: true,
        value: async () => {
          globalThis.__cameraPreflightCalls.enumerateDevices += 1;
          return [];
        },
      });
    });

    const button = page.getByRole("button", {
      name: "Check browser capabilities — camera stays off",
      exact: true,
    });
    await button.click({ trial: true });
    await button.focus();
    await button.press("Enter");
    const status = page.getByRole("status").filter({ hasText: "Secure context" });
    await status.waitFor({ state: "visible", timeout: 5_000 });
    const statusText = await status.innerText();
    if (!statusText.includes("not device certification or safety clearance")) {
      throw new Error(`${viewport.name}: bounded preflight disclaimer missing`);
    }
    const calls = await page.evaluate(() => globalThis.__cameraPreflightCalls);
    if (calls.getUserMedia !== 0 || calls.enumerateDevices !== 0) {
      throw new Error(
        `${viewport.name}: passive preflight touched camera APIs: ${JSON.stringify(calls)}`,
      );
    }
    const focusStayed = await button.evaluate((element) => document.activeElement === element);
    if (!focusStayed) throw new Error(`${viewport.name}: preflight moved keyboard focus`);

    await page.evaluate(() => {
      const devices = navigator.mediaDevices;
      if (!devices) throw new Error("Synthetic camera requires navigator.mediaDevices");
      globalThis.__syntheticCamera = {
        calls: 0,
        requestedAudio: [],
        streams: [],
      };
      Object.defineProperty(devices, "getUserMedia", {
        configurable: true,
        value: async (constraints) => {
          const canvas = document.createElement("canvas");
          canvas.width = 640;
          canvas.height = 480;
          const context = canvas.getContext("2d", { alpha: false });
          if (!context || typeof canvas.captureStream !== "function") {
            throw new Error("Canvas captureStream is unavailable");
          }
          let animationFrame = 0;
          let tick = 0;
          const draw = () => {
            context.fillStyle = "#20242a";
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.strokeStyle = "#d6b47a";
            context.lineWidth = 18;
            for (let row = 0; row < 5; row += 1) {
              const y = 70 + row * 82;
              context.beginPath();
              context.moveTo(60, y);
              context.bezierCurveTo(190, y - 25, 420, y + 25, 580, y);
              context.stroke();
            }
            context.fillStyle = "#e6eef5";
            context.font = "24px sans-serif";
            context.fillText(`Synthetic equipment frame ${tick}`, 130, 450);
            tick += 1;
            animationFrame = requestAnimationFrame(draw);
          };
          draw();
          const stream = canvas.captureStream(15);
          const track = stream.getVideoTracks()[0];
          if (!track) throw new Error("Synthetic stream has no video track");
          const nativeStop = track.stop.bind(track);
          Object.defineProperty(track, "stop", {
            configurable: true,
            value: () => {
              cancelAnimationFrame(animationFrame);
              nativeStop();
            },
          });
          globalThis.__syntheticCamera.calls += 1;
          globalThis.__syntheticCamera.requestedAudio.push(constraints?.audio);
          globalThis.__syntheticCamera.streams.push(stream);
          return stream;
        },
      });
    });

    const confirmBatchPermissions = async () => {
      const checks = page.getByRole("checkbox");
      const count = await checks.count();
      if (count !== 9) {
        throw new Error(`${viewport.name}: expected 9 batch permissions, found ${count}`);
      }
      for (let index = 0; index < count; index += 1) await checks.nth(index).check();
    };
    const waitForLivePreview = async () => {
      const video = page.getByLabel(
        "Live camera preview; no media is sent until capture and confirmation",
        { exact: true },
      );
      await page.waitForFunction(
        (element) =>
          element instanceof HTMLVideoElement &&
          element.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
          element.videoWidth > 0 &&
          !element.classList.contains("hidden"),
        await video.elementHandle(),
        { timeout: 10_000 },
      );
    };
    const committed = page.getByText("This page locks the batch to the attestations above", {
      exact: false,
    });

    await confirmBatchPermissions();
    await page.getByRole("button", { name: "Open live camera", exact: true }).click();
    await waitForLivePreview();
    await page.getByRole("button", { name: "Capture still", exact: true }).click();
    await committed.waitFor({ state: "visible", timeout: 15_000 });

    await page
      .getByRole("button", { name: "Discard batch and start another", exact: true })
      .click();
    await committed.waitFor({ state: "hidden", timeout: 5_000 });
    await confirmBatchPermissions();
    await page.getByRole("button", { name: "Open live camera", exact: true }).click();
    await waitForLivePreview();
    await page.getByRole("button", { name: "Record 7s", exact: true }).click();
    await page.getByRole("button", { name: "Stop clip", exact: true }).waitFor({
      state: "visible",
      timeout: 5_000,
    });
    await page.waitForTimeout(700);
    await page.getByRole("button", { name: "Stop clip", exact: true }).click();
    await page.getByText("Select one to three stills.", { exact: false }).waitFor({
      state: "visible",
      timeout: 25_000,
    });
    await page.getByRole("img", { name: "F01 video still", exact: true }).click();
    await page.getByRole("button", { name: "Use selected stills", exact: true }).click();
    await committed.waitFor({ state: "visible", timeout: 15_000 });

    const syntheticCapture = await page.evaluate(() => ({
      calls: globalThis.__syntheticCamera.calls,
      requestedAudio: globalThis.__syntheticCamera.requestedAudio,
      audioTrackCounts: globalThis.__syntheticCamera.streams.map(
        (stream) => stream.getAudioTracks().length,
      ),
      trackStates: globalThis.__syntheticCamera.streams.map((stream) =>
        stream.getTracks().map((track) => track.readyState),
      ),
    }));
    if (syntheticCapture.calls !== 2) {
      throw new Error(
        `${viewport.name}: expected 2 synthetic camera opens, found ${syntheticCapture.calls}`,
      );
    }
    if (syntheticCapture.requestedAudio.some((audio) => audio !== false)) {
      throw new Error(
        `${viewport.name}: live camera requested audio: ${JSON.stringify(syntheticCapture.requestedAudio)}`,
      );
    }
    if (syntheticCapture.audioTrackCounts.some((count) => count !== 0)) {
      throw new Error(
        `${viewport.name}: synthetic streams contain audio: ${JSON.stringify(syntheticCapture.audioTrackCounts)}`,
      );
    }
    if (syntheticCapture.trackStates.some((states) => states.some((state) => state !== "ended"))) {
      throw new Error(
        `${viewport.name}: capture left tracks live: ${JSON.stringify(syntheticCapture.trackStates)}`,
      );
    }
    const horizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    if (horizontalOverflow) throw new Error(`${viewport.name}: horizontal overflow`);
    if (consoleErrors.length || pageErrors.length) {
      throw new Error(
        `${viewport.name}: browser errors: ${JSON.stringify({ consoleErrors, pageErrors })}`,
      );
    }
    await page.screenshot({ path: viewport.screenshot, type: "png", fullPage: false });
    verdict.viewports[viewport.name] = {
      status: response.status(),
      cameraCalls: calls,
      syntheticCapture,
      focusStayed,
      horizontalOverflow,
      screenshot: viewport.screenshot,
    };
    await page.close();
  }
} catch (error) {
  verdict.ok = false;
  verdict.error = String(error?.message ?? error);
  process.exitCode = 1;
} finally {
  await browser?.close();
  writeFileSync(verdictPath, JSON.stringify(verdict, null, 2));
  console.log(JSON.stringify(verdict, null, 2));
}
