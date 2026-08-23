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
const negotiateUrl = new URL("/negotiate", baseUrl).href;
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

    const waitForConsentReady = async () => {
      const enter = page.getByRole("button", { name: "Enter", exact: true });
      await Promise.race([
        enter.waitFor({ state: "visible", timeout: 10_000 }),
        page.locator("main").waitFor({ state: "visible", timeout: 10_000 }),
      ]);
      if (await enter.isVisible().catch(() => false)) {
        const checks = page.getByRole("checkbox");
        if ((await checks.count()) !== 4) {
          throw new Error(`${viewport.name}: consent gate changed`);
        }
        for (let index = 0; index < 4; index += 1) await checks.nth(index).check();
        await enter.click();
        await page.locator("main").waitFor({ state: "visible", timeout: 10_000 });
      }
    };

    const response = await page.goto(studioUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
    if (response?.status() !== 200)
      throw new Error(`${viewport.name}: HTTP ${response?.status() ?? 0}`);
    await waitForConsentReady();

    const negotiateResponse = await page.goto(negotiateUrl, {
      waitUntil: "domcontentloaded",
      timeout: 45_000,
    });
    if (negotiateResponse?.status() !== 200) {
      throw new Error(`${viewport.name}: negotiate HTTP ${negotiateResponse?.status() ?? 0}`);
    }
    await waitForConsentReady();
    const photoPermissionRow = page
      .getByRole("listitem")
      .filter({ hasText: "Photos / video for coaching" });
    await photoPermissionRow.getByRole("button", { name: "yes", exact: true }).click();
    await page.waitForFunction(() => {
      const stored = localStorage.getItem("knotty-negotiate");
      if (!stored) return false;
      try {
        const parsed = JSON.parse(stored);
        return parsed?.state?.items?.some((item) => item?.id === "photos" && item?.rank === "yes");
      } catch {
        return false;
      }
    });
    const studioResponse = await page.goto(studioUrl, {
      waitUntil: "domcontentloaded",
      timeout: 45_000,
    });
    if (studioResponse?.status() !== 200) {
      throw new Error(`${viewport.name}: studio reload HTTP ${studioResponse?.status() ?? 0}`);
    }
    await waitForConsentReady();

    const actionFirst = page.getByRole("group", {
      name: "Action-first screen · required before media",
      exact: true,
    });
    await actionFirst.waitFor({ state: "visible", timeout: 10_000 });
    const noConcern = page.getByRole("radio", {
      name: /^No urgent symptom, coercion or secret-recording concern/,
    });
    const selectNoConcernForBatch = async (stage) => {
      await page.waitForFunction(
        () => {
          const element = document.querySelector('[data-camera-gate="action-first"]');
          return (
            element instanceof HTMLFieldSetElement &&
            element.dataset.negotiationReady === "true" &&
            element.dataset.mediaBlocked === "false" &&
            !element.disabled
          );
        },
        undefined,
        { timeout: 10_000 },
      );
      await noConcern.waitFor({ state: "visible", timeout: 10_000 });
      await noConcern.check();
      // Let passive effects from every committed hydration/render flush before
      // treating this per-batch answer as stable.
      await page.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve(undefined))),
          ),
      );
      await page.waitForFunction(
        () => {
          const element = document.querySelector('[data-camera-gate="action-first"]');
          return (
            element instanceof HTMLFieldSetElement &&
            element.dataset.triage === "none" &&
            element.dataset.sessionStopped === "false" &&
            element.dataset.cameraReady === "true"
          );
        },
        undefined,
        { timeout: 10_000 },
      );
      if (!(await noConcern.isChecked())) {
        throw new Error(`${viewport.name}: action-first answer reset during ${stage}`);
      }
    };
    await selectNoConcernForBatch("initial camera gate");
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
    await page.waitForFunction(
      () => {
        const element = document.querySelector('[data-camera-gate="action-first"]');
        return (
          element instanceof HTMLFieldSetElement &&
          element.dataset.triage === "none" &&
          element.dataset.cameraReady === "true"
        );
      },
      undefined,
      { timeout: 10_000 },
    );
    if (!(await noConcern.isChecked())) {
      throw new Error(`${viewport.name}: passive preflight reset the action-first answer`);
    }

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
      const permissionGroup = page.getByRole("group", {
        name: "Permission for this batch",
        exact: true,
      });
      await permissionGroup.waitFor({ state: "visible", timeout: 10_000 });
      const checks = permissionGroup.getByRole("checkbox");
      const count = await checks.count();
      if (count !== 9) {
        throw new Error(`${viewport.name}: expected 9 batch permissions, found ${count}`);
      }
      try {
        await page.waitForFunction(
          () => {
            const element = document.querySelector('[data-camera-permissions="true"]');
            return element instanceof HTMLFieldSetElement && !element.disabled;
          },
          undefined,
          { timeout: 10_000 },
        );
      } catch (cause) {
        const diagnostic = await page.evaluate(() => {
          const stored = localStorage.getItem("knotty-negotiate");
          let photos = "unreadable";
          try {
            const state = stored ? JSON.parse(stored)?.state : null;
            photos = state?.items?.find((item) => item?.id === "photos")?.rank ?? "missing";
          } catch {
            // Keep the diagnostic bounded and omit the rest of local storage.
          }
          return {
            photos,
            actionFirst: (() => {
              const element = document.querySelector('[data-camera-gate="action-first"]');
              return element instanceof HTMLFieldSetElement
                ? {
                    disabled: element.disabled,
                    negotiationReady: element.dataset.negotiationReady ?? null,
                    mediaBlocked: element.dataset.mediaBlocked ?? null,
                    triage: element.dataset.triage ?? null,
                    sessionStopped: element.dataset.sessionStopped ?? null,
                    gateReason: element.dataset.cameraGateReason ?? null,
                    cameraReady: element.dataset.cameraReady ?? null,
                    connected: element.isConnected,
                  }
                : null;
            })(),
            permissions: (() => {
              const element = document.querySelector('[data-camera-permissions="true"]');
              return element instanceof HTMLFieldSetElement
                ? {
                    disabled: element.disabled,
                    captureDisabled: element.dataset.captureDisabled ?? null,
                  }
                : null;
            })(),
            visibleAlerts: [...document.querySelectorAll("[role='alert']")]
              .filter((element) => element.getClientRects().length > 0)
              .map((element) => element.textContent?.replace(/\s+/g, " ").trim()),
            visibleStatuses: [...document.querySelectorAll("[role='status']")]
              .filter((element) => element.getClientRects().length > 0)
              .map((element) => element.textContent?.replace(/\s+/g, " ").trim()),
            checkedTriage:
              document.querySelector("input[type='radio']:checked")?.parentElement?.textContent ??
              null,
            url: location.href,
            navigationEntries: performance.getEntriesByType("navigation").length,
          };
        });
        throw new Error(
          `${viewport.name}: batch permissions stayed disabled: ${JSON.stringify(diagnostic)}; ${String(cause?.message ?? cause)}`,
        );
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
    const waitForCommittedBatch = async (stage) => {
      try {
        await committed.waitFor({ state: "visible", timeout: 15_000 });
      } catch (cause) {
        const failurePng = checkedOutputPath(
          `${stem}.${viewport.name}.${stage}-failure${extension}`,
          ["/workspace"],
        );
        await page.screenshot({ path: failurePng, type: "png", fullPage: true });
        const diagnostic = await page.evaluate(() => {
          const video = document.querySelector("video[aria-label^='Live camera preview']");
          const textFor = (selector) =>
            [...document.querySelectorAll(selector)]
              .filter((element) => element.getClientRects().length > 0)
              .map((element) => element.textContent?.replace(/\s+/g, " ").trim())
              .filter(Boolean);
          return {
            alerts: textFor("[role='alert']"),
            statuses: textFor("[role='status']"),
            relevantButtons: [...document.querySelectorAll("button")]
              .filter((element) =>
                /camera|capture|clip|record|batch|discard/i.test(element.textContent ?? ""),
              )
              .map((element) => ({
                text: element.textContent?.replace(/\s+/g, " ").trim(),
                disabled: element.disabled,
                ariaDisabled: element.getAttribute("aria-disabled"),
              })),
            video:
              video instanceof HTMLVideoElement
                ? {
                    readyState: video.readyState,
                    width: video.videoWidth,
                    height: video.videoHeight,
                    hidden: video.classList.contains("hidden"),
                  }
                : null,
            syntheticCamera: globalThis.__syntheticCamera
              ? {
                  calls: globalThis.__syntheticCamera.calls,
                  trackStates: globalThis.__syntheticCamera.streams.map((stream) =>
                    stream.getTracks().map((track) => track.readyState),
                  ),
                }
              : null,
          };
        });
        throw new Error(
          `${viewport.name}: ${stage} did not commit: ${JSON.stringify(diagnostic)}; evidence ${failurePng}; ${String(cause?.message ?? cause)}`,
        );
      }
    };
    const waitForNeutralLocalReport = async (stage) => {
      const stopAlert = page.getByRole("alert").filter({ hasText: "Stop the activity" });
      const localReport = page.getByText("local report · model not requested", { exact: true });
      await Promise.race([
        localReport.waitFor({ state: "visible", timeout: 10_000 }),
        stopAlert.first().waitFor({ state: "visible", timeout: 10_000 }),
      ]);
      if ((await stopAlert.count()) > 0) {
        throw new Error(`${viewport.name}: ${stage} incorrectly stopped the studio`);
      }
    };

    await confirmBatchPermissions();
    await page.getByRole("button", { name: "Open live camera", exact: true }).click();
    await waitForLivePreview();
    await page.getByRole("button", { name: "Capture still", exact: true }).click();
    await waitForCommittedBatch("photo");
    await waitForNeutralLocalReport("neutral synthetic still");

    const analyzeButton = page.getByRole("button", {
      name: "Analyze selected stills once",
      exact: true,
    });
    const [analysisResponse] = await Promise.all([
      page.waitForResponse(
        (response) =>
          response.request().method() === "POST" && response.url().includes("/_serverFn/"),
        { timeout: 15_000 },
      ),
      analyzeButton.click(),
    ]);
    const analysisBody = (await analysisResponse.text().catch(() => "<unreadable>")).slice(
      0,
      2_000,
    );
    try {
      await page
        .getByRole("alert")
        .filter({ hasText: "No media was sent to xAI. The service is not available" })
        .waitFor({ state: "visible", timeout: 5_000 });
    } catch (cause) {
      const providerFailurePng = checkedOutputPath(
        `${stem}.${viewport.name}.provider-failure${extension}`,
        ["/workspace"],
      );
      await page.screenshot({ path: providerFailurePng, type: "png", fullPage: true });
      const diagnostic = await page.evaluate(() => ({
        alerts: [...document.querySelectorAll("[role='alert']")]
          .filter((element) => element.getClientRects().length > 0)
          .map((element) => element.textContent?.replace(/\s+/g, " ").trim()),
        statuses: [...document.querySelectorAll("[role='status']")]
          .filter((element) => element.getClientRects().length > 0)
          .map((element) => element.textContent?.replace(/\s+/g, " ").trim()),
        analyzeButtons: [...document.querySelectorAll("button")]
          .filter((element) => /analy/i.test(element.textContent ?? ""))
          .map((element) => ({ text: element.textContent, disabled: element.disabled })),
      }));
      throw new Error(
        `${viewport.name}: provider failure did not surface: ${JSON.stringify({ response: { status: analysisResponse.status(), url: analysisResponse.url(), body: analysisBody }, diagnostic, evidence: providerFailurePng })}; ${String(cause?.message ?? cause)}`,
      );
    }
    if (!(await analyzeButton.isEnabled())) {
      throw new Error(`${viewport.name}: verified pre-provider failure did not reopen the batch`);
    }
    if (!(await committed.isVisible())) {
      throw new Error(
        `${viewport.name}: verified pre-provider failure discarded the committed batch`,
      );
    }
    await waitForNeutralLocalReport("verified pre-provider failure");

    await page
      .getByRole("button", { name: "Discard batch and start another", exact: true })
      .click();
    await committed.waitFor({ state: "hidden", timeout: 5_000 });
    await page.waitForFunction(() => {
      const element = document.querySelector('[data-camera-gate="action-first"]');
      const permissions = document.querySelector('[data-camera-permissions="true"]');
      return (
        element instanceof HTMLFieldSetElement &&
        element.dataset.triage === "unanswered" &&
        element.dataset.cameraGateReason === "triage-unanswered" &&
        permissions instanceof HTMLFieldSetElement &&
        permissions.disabled
      );
    });
    await selectNoConcernForBatch("second camera batch");
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
    await waitForCommittedBatch("video");
    await waitForNeutralLocalReport("neutral synthetic video still");

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
