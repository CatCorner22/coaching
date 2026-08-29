import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  MAX_PHOTO_BYTES,
  MAX_VIDEO_BYTES,
  dataUrlSize,
  extractVideoFrames,
  digitalZoomCrop,
  processMediaFrame,
  validateMediaFile,
  validateMediaSignature,
} from "../src/lib/media.ts";
import {
  applyFocus,
  applyZoom,
  BURST_FRAME_COUNT,
  BURST_KEEP,
  CLIP_DURATION_MS,
  inspectCameraCapabilities,
  openRopeCamera,
  playCameraPreview,
  setTorch,
  startClip,
  torchAvailable,
  waitForNextVideoFrame,
  zoomRange,
} from "../src/lib/camera/stream.ts";

test("dataUrlSize measures padded base64 payloads", () => {
  assert.equal(dataUrlSize("data:image/jpeg;base64,YWJjZA=="), 4);
  assert.equal(dataUrlSize("data:image/jpeg;base64,YWJj"), 3);
  assert.equal(dataUrlSize(""), 0);
});

test("validateMediaFile rejects empty, oversized, and mismatched media", () => {
  assert.throws(
    () => validateMediaFile({ size: 0, type: "image/jpeg", name: "empty.jpg" }, "photo"),
    /empty/i,
  );
  assert.throws(
    () =>
      validateMediaFile(
        { size: MAX_PHOTO_BYTES + 1, type: "image/jpeg", name: "large.jpg" },
        "photo",
      ),
    /25 MB/i,
  );
  assert.throws(
    () =>
      validateMediaFile(
        { size: MAX_VIDEO_BYTES + 1, type: "video/mp4", name: "large.mp4" },
        "video",
      ),
    /100 MB/i,
  );
  assert.throws(
    () => validateMediaFile({ size: 10, type: "text/plain", name: "fake.jpg" }, "photo"),
    /photo file/i,
  );
});

test("validateMediaFile accepts supported files when the browser omits MIME type", () => {
  assert.doesNotThrow(() =>
    validateMediaFile({ size: 10, type: "", name: "capture.HEIC" }, "photo"),
  );
  assert.doesNotThrow(() =>
    validateMediaFile({ size: 10, type: "", name: "capture.MOV" }, "video"),
  );
  assert.doesNotThrow(() =>
    validateMediaFile({ size: 10, type: "application/octet-stream", name: "capture.mov" }, "video"),
  );
  assert.doesNotThrow(() =>
    validateMediaFile({ size: 10, type: "image/jpg", name: "capture.jpeg" }, "photo"),
  );
});

test("validateMediaFile rejects executable and unsupported media containers", () => {
  assert.throws(
    () => validateMediaFile({ size: 10, type: "image/svg+xml", name: "vector.svg" }, "photo"),
    /supported photo/i,
  );
  assert.throws(
    () => validateMediaFile({ size: 10, type: "image/gif", name: "animated.gif" }, "photo"),
    /supported photo/i,
  );
  assert.throws(
    () => validateMediaFile({ size: 10, type: "video/x-matroska", name: "clip.mkv" }, "video"),
    /supported video/i,
  );
});

test("validateMediaSignature rejects MIME-spoofed uploads and accepts supported headers", async () => {
  await assert.rejects(
    validateMediaSignature(new Blob(["<svg><script>bad()</script></svg>"], { type: "image/jpeg" }), "photo"),
    /does not contain a supported media file/i,
  );
  await assert.doesNotReject(
    validateMediaSignature(
      new Blob([Uint8Array.from([
        0xff, 0xd8, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x00, 0x10, 0x00, 0x10,
        0x03, 0x01, 0x11, 0x00, 0x02, 0x11, 0x00, 0x03, 0x11, 0x00,
      ])]),
      "photo",
    ),
  );
  await assert.doesNotReject(
    validateMediaSignature(
      new Blob([Uint8Array.from([0x1a, 0x45, 0xdf, 0xa3, 0x01, 0x00])]),
      "video",
    ),
  );
  await assert.rejects(
    validateMediaSignature(new Blob(["not a movie"], { type: "video/mp4" }), "video"),
    /does not contain a supported media file/i,
  );
});

test("validateMediaSignature rejects oversized PNG dimensions before decoding", async () => {
  const bytes = new Uint8Array(24);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  bytes.set([0x49, 0x48, 0x44, 0x52], 12);
  new DataView(bytes.buffer).setUint32(16, 9000);
  new DataView(bytes.buffer).setUint32(20, 9000);
  await assert.rejects(validateMediaSignature(new Blob([bytes]), "photo"), /too large to score safely/i);
});

test("validateMediaSignature accepts a common 24 MP phone still", async () => {
  const bytes = new Uint8Array(24);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  bytes.set([0x49, 0x48, 0x44, 0x52], 12);
  new DataView(bytes.buffer).setUint32(16, 5712);
  new DataView(bytes.buffer).setUint32(20, 4284);
  await assert.doesNotReject(validateMediaSignature(new Blob([bytes]), "photo"));
});

test("validateMediaSignature accepts a modern 48 MP phone still", async () => {
  const bytes = new Uint8Array(24);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  bytes.set([0x49, 0x48, 0x44, 0x52], 12);
  new DataView(bytes.buffer).setUint32(16, 8064);
  new DataView(bytes.buffer).setUint32(20, 6048);
  await assert.doesNotReject(validateMediaSignature(new Blob([bytes]), "photo"));
});

test("validateMediaSignature rejects pathological single-edge image dimensions", async () => {
  const bytes = new Uint8Array(24);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  bytes.set([0x49, 0x48, 0x44, 0x52], 12);
  new DataView(bytes.buffer).setUint32(16, 1);
  new DataView(bytes.buffer).setUint32(20, 32_000_000);
  await assert.rejects(validateMediaSignature(new Blob([bytes]), "photo"), /too large to score safely/i);
});

test("validateMediaSignature handles a maximum-header ISO video without argument overflow", async () => {
  const bytes = new Uint8Array(64 * 1024);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, bytes.length);
  bytes.set([0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d], 4); // ftyp + isom
  await assert.doesNotReject(validateMediaSignature(new Blob([bytes]), "video"));
});

test("validateMediaSignature accepts registered ISO video brands used by common phones", async () => {
  for (const brand of ["iso5", "iso6", "mp4v", "M4V ", "MSNV"]) {
    const bytes = new Uint8Array(24);
    const view = new DataView(bytes.buffer);
    view.setUint32(0, bytes.length);
    bytes.set([0x66, 0x74, 0x79, 0x70], 4);
    bytes.set([...brand].map((char) => char.charCodeAt(0)), 8);
    await assert.doesNotReject(validateMediaSignature(new Blob([bytes]), "video"), brand);
  }
});

test("3GP MIME, extension, and ISO signature support are consistent", async () => {
  assert.doesNotThrow(() =>
    validateMediaFile({ size: 24, type: "video/3gpp", name: "capture.3gp" }, "video"),
  );
  assert.doesNotThrow(() =>
    validateMediaFile({ size: 24, type: "application/octet-stream", name: "capture.3gp" }, "video"),
  );
  for (const brand of ["3gp4", "3gp5", "3gp6", "3gp7", "3gp8", "3gp9"]) {
    const bytes = new Uint8Array(24);
    const view = new DataView(bytes.buffer);
    view.setUint32(0, bytes.length);
    bytes.set([0x66, 0x74, 0x79, 0x70], 4);
    bytes.set([...brand].map((char) => char.charCodeAt(0)), 8);
    await assert.doesNotReject(validateMediaSignature(new Blob([bytes]), "video"), brand);
  }

  const unregistered = new Uint8Array(24);
  new DataView(unregistered.buffer).setUint32(0, unregistered.length);
  unregistered.set([0x66, 0x74, 0x79, 0x70, 0x33, 0x67, 0x70, 0x41], 4);
  await assert.rejects(validateMediaSignature(new Blob([unregistered]), "video"));
});

test("validateMediaSignature rejects every accepted WebP and HEIC dimension bomb before decode", async () => {
  const vp8x = new Uint8Array(30);
  vp8x.set([0x52, 0x49, 0x46, 0x46], 0); // RIFF
  vp8x.set([0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x58], 8); // WEBPVP8X
  vp8x.fill(0xff, 24, 30);
  await assert.rejects(validateMediaSignature(new Blob([vp8x]), "photo"), /too large to score safely/i);

  const vp8l = new Uint8Array(30);
  vp8l.set([0x52, 0x49, 0x46, 0x46], 0); // RIFF
  vp8l.set([0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x4c], 8); // WEBPVP8L
  vp8l[20] = 0x2f;
  new DataView(vp8l.buffer).setUint32(21, 0xffffffff, true);
  await assert.rejects(validateMediaSignature(new Blob([vp8l]), "photo"), /too large to score safely/i);

  const vp8 = new Uint8Array(30);
  vp8.set([0x52, 0x49, 0x46, 0x46], 0); // RIFF
  vp8.set([0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x20], 8); // WEBPVP8
  vp8.set([0x9d, 0x01, 0x2a], 23);
  vp8.set([0xff, 0x3f, 0xff, 0x3f], 26);
  await assert.rejects(validateMediaSignature(new Blob([vp8]), "photo"), /too large to score safely/i);

  const heic = makeHeic(16_384, 16_384);
  await assert.rejects(validateMediaSignature(new Blob([heic]), "photo"), /too large to score safely/i);
});

test("HEIC dimensions must be associated with the primary item", async () => {
  await assert.rejects(
    validateMediaSignature(new Blob([makeHeic(6000, 4000, false)]), "photo"),
    /verify the image dimensions/i,
  );
  await assert.doesNotReject(
    validateMediaSignature(new Blob([makeHeic(6000, 4000, true)]), "photo"),
  );
});

test("camera preflight reports only browser layers and never opens or enumerates a camera", async (t) => {
  const originals = ["isSecureContext", "navigator", "document", "MediaRecorder"].map((name) => [
    name,
    Object.getOwnPropertyDescriptor(globalThis, name),
  ]);
  t.after(() => {
    for (const [name, descriptor] of originals) restoreGlobal(name, descriptor);
  });

  let getUserMediaCalls = 0;
  let enumerateDevicesCalls = 0;
  let recorderConstructions = 0;
  let permissionState = "granted";
  Object.defineProperties(globalThis, {
    isSecureContext: { configurable: true, value: true },
    navigator: {
      configurable: true,
      value: {
        mediaDevices: {
          getUserMedia: () => {
            getUserMediaCalls += 1;
            throw new Error("preflight must not open a camera");
          },
          enumerateDevices: () => {
            enumerateDevicesCalls += 1;
            throw new Error("preflight must not enumerate devices");
          },
        },
        permissions: { query: async () => ({ state: permissionState }) },
      },
    },
    document: {
      configurable: true,
      value: { permissionsPolicy: { allowsFeature: (name) => name === "camera" } },
    },
    MediaRecorder: {
      configurable: true,
      value: class {
        constructor() {
          recorderConstructions += 1;
        }
      },
    },
  });

  for (const state of ["granted", "prompt", "denied"]) {
    permissionState = state;
    const report = await inspectCameraCapabilities({ permissionTimeoutMs: 20 });
    assert.deepEqual(report, {
      secureContext: "secure",
      cameraPolicy: "allowed",
      liveCameraApi: "detected",
      clipRecordingApi: "detected",
      permission: state,
      cameraOpened: false,
    });
  }
  assert.equal(getUserMediaCalls, 0);
  assert.equal(enumerateDevicesCalls, 0);
  assert.equal(recorderConstructions, 0);
});

test("camera preflight distinguishes known blockers without attempting fallbacks", async (t) => {
  const originals = ["isSecureContext", "navigator", "document", "MediaRecorder"].map((name) => [
    name,
    Object.getOwnPropertyDescriptor(globalThis, name),
  ]);
  t.after(() => {
    for (const [name, descriptor] of originals) restoreGlobal(name, descriptor);
  });

  Object.defineProperties(globalThis, {
    isSecureContext: { configurable: true, value: false },
    navigator: {
      configurable: true,
      value: { permissions: { query: async () => { throw new Error("unsupported"); } } },
    },
    document: {
      configurable: true,
      value: { permissionsPolicy: { allowsFeature: () => false } },
    },
    MediaRecorder: { configurable: true, value: undefined },
  });

  assert.deepEqual(await inspectCameraCapabilities({ permissionTimeoutMs: 20 }), {
    secureContext: "insecure",
    cameraPolicy: "blocked",
    liveCameraApi: "unavailable",
    clipRecordingApi: "unavailable",
    permission: "unknown",
    cameraOpened: false,
  });
});

test("camera preflight fails indeterminate and bounds stalled or malformed permission queries", async (t) => {
  const originals = ["isSecureContext", "navigator", "document", "MediaRecorder"].map((name) => [
    name,
    Object.getOwnPropertyDescriptor(globalThis, name),
  ]);
  t.after(() => {
    for (const [name, descriptor] of originals) restoreGlobal(name, descriptor);
  });

  let permissionResult = new Promise(() => undefined);
  Object.defineProperties(globalThis, {
    isSecureContext: { configurable: true, value: undefined },
    navigator: {
      configurable: true,
      value: {
        mediaDevices: { getUserMedia: () => Promise.reject(new Error("must not run")) },
        permissions: { query: () => permissionResult },
      },
    },
    document: {
      configurable: true,
      value: {
        permissionsPolicy: { allowsFeature: () => { throw new Error("not exposed"); } },
      },
    },
    MediaRecorder: { configurable: true, value: class {} },
  });

  const stalled = await inspectCameraCapabilities({ permissionTimeoutMs: 5 });
  assert.deepEqual(stalled, {
    secureContext: "unknown",
    cameraPolicy: "unknown",
    liveCameraApi: "detected",
    clipRecordingApi: "detected",
    permission: "unknown",
    cameraOpened: false,
  });

  permissionResult = Promise.resolve({ state: "surprising" });
  assert.equal(
    (await inspectCameraCapabilities({ permissionTimeoutMs: 20 })).permission,
    "unknown",
  );
});

test("openRopeCamera retries constraint failures but not permission denials", async (t) => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  t.after(() => restoreGlobal("navigator", original));

  const track = {
    getCapabilities: () => ({}),
    applyConstraints: async () => undefined,
  };
  const stream = { getVideoTracks: () => [track] };
  let calls = 0;
  const constraints = [];
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      mediaDevices: {
        getUserMedia: async (requested) => {
          constraints.push(requested);
          calls += 1;
          if (calls === 1) throw new DOMException("constraints", "OverconstrainedError");
          return stream;
        },
      },
    },
  });

  assert.equal(await openRopeCamera("environment"), stream);
  assert.equal(calls, 2);
  assert.deepEqual(constraints[0].video.width, { ideal: 1920 });
  assert.deepEqual(constraints[0].video.height, { ideal: 1080 });

  calls = 0;
  globalThis.navigator.mediaDevices.getUserMedia = async () => {
    calls += 1;
    throw new DOMException("denied", "NotAllowedError");
  };
  await assert.rejects(openRopeCamera("environment"), /denied/);
  assert.equal(calls, 1);
});

test("openRopeCamera recognizes cross-realm-style permission errors by standardized name", async (t) => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  t.after(() => restoreGlobal("navigator", original));
  let calls = 0;
  const denied = Object.assign(new Error("permission denied"), { name: "NotAllowedError" });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      mediaDevices: {
        getUserMedia: async () => {
          calls += 1;
          throw denied;
        },
      },
    },
  });
  await assert.rejects(openRopeCamera("environment"), /permission denied/i);
  assert.equal(calls, 1);
});

test("openRopeCamera explains the HTTPS requirement before requesting permission", async (t) => {
  const secureDescriptor = Object.getOwnPropertyDescriptor(globalThis, "isSecureContext");
  const navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  t.after(() => {
    restoreGlobal("isSecureContext", secureDescriptor);
    restoreGlobal("navigator", navigatorDescriptor);
  });
  let calls = 0;
  Object.defineProperty(globalThis, "isSecureContext", { configurable: true, value: false });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { mediaDevices: { getUserMedia: async () => { calls += 1; } } },
  });
  await assert.rejects(openRopeCamera("environment"), /HTTPS or localhost/i);
  assert.equal(calls, 0);
});

test("openRopeCamera stops every acquired stream when post-acquisition setup throws", async (t) => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  t.after(() => restoreGlobal("navigator", original));
  let opened = 0;
  let stopped = 0;
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      mediaDevices: {
        getUserMedia: async () => {
          opened += 1;
          return {
            getVideoTracks: () => { throw new Error("track race"); },
            getTracks: () => [{ stop: () => { stopped += 1; } }],
          };
        },
      },
    },
  });
  await assert.rejects(openRopeCamera("environment"), /track race/);
  assert.equal(opened, 3);
  assert.equal(stopped, 3);
});

test("openRopeCamera aborts a pending acquisition, stops a late stream, and does not retry", async (t) => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  t.after(() => restoreGlobal("navigator", original));
  let resolveAcquisition;
  let calls = 0;
  let stopped = 0;
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      mediaDevices: {
        getUserMedia: () => {
          calls += 1;
          return new Promise((resolve) => {
            resolveAcquisition = resolve;
          });
        },
      },
    },
  });
  const controller = new AbortController();
  const pending = openRopeCamera("environment", { signal: controller.signal, timeoutMs: 1_000 });
  controller.abort();
  await assert.rejects(pending, (error) => error?.name === "AbortError");
  assert.equal(calls, 1);
  resolveAcquisition({
    getTracks: () => [{ stop: () => { stopped += 1; } }],
    getVideoTracks: () => [],
  });
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(stopped, 1);
  assert.equal(calls, 1);
});

test("openRopeCamera bounds a stalled permission prompt without starting fallback requests", async (t) => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  t.after(() => restoreGlobal("navigator", original));
  let calls = 0;
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      mediaDevices: {
        getUserMedia: () => {
          calls += 1;
          return new Promise(() => undefined);
        },
      },
    },
  });
  await assert.rejects(
    openRopeCamera("environment", { timeoutMs: 5 }),
    /timed out/i,
  );
  assert.equal(calls, 1);
});

test("playCameraPreview is abortable when HTMLMediaElement.play never settles", async () => {
  const controller = new AbortController();
  const pending = playCameraPreview(
    { play: () => new Promise(() => undefined) },
    controller.signal,
    1_000,
  );
  controller.abort();
  await assert.rejects(pending, (error) => error?.name === "AbortError");
});

test("applyFocus is bounded when a device never settles constraints", async (t) => {
  const timeoutDescriptor = Object.getOwnPropertyDescriptor(globalThis, "setTimeout");
  const clearDescriptor = Object.getOwnPropertyDescriptor(globalThis, "clearTimeout");
  t.after(() => {
    restoreGlobal("setTimeout", timeoutDescriptor);
    restoreGlobal("clearTimeout", clearDescriptor);
  });
  Object.defineProperty(globalThis, "setTimeout", {
    configurable: true,
    value: (callback) => {
      queueMicrotask(callback);
      return 1;
    },
  });
  Object.defineProperty(globalThis, "clearTimeout", {
    configurable: true,
    value: () => undefined,
  });
  let attempts = 0;
  const stream = {
    getVideoTracks: () => [{
      getCapabilities: () => ({ focusMode: ["continuous"] }),
      applyConstraints: () => {
        attempts += 1;
        return new Promise(() => undefined);
      },
    }],
  };
  await applyFocus(stream);
  assert.equal(attempts, 1);
});

test("applyFocus requests continuous modes only when each capability advertises them", async () => {
  const applied = [];
  const stream = {
    getVideoTracks: () => [{
      getCapabilities: () => ({
        focusMode: ["manual", "single-shot"],
        exposureMode: ["manual", "continuous"],
        whiteBalanceMode: "continuous",
      }),
      applyConstraints: async (constraints) => {
        applied.push(constraints);
      },
    }],
  };
  await applyFocus(stream);
  assert.deepEqual(applied, [{ advanced: [{ exposureMode: "continuous" }] }]);
});

test("zoom helpers stay fail-closed and burst/clip constants stay aligned", () => {
  assert.equal(CLIP_DURATION_MS, 7000);
  assert.equal(BURST_FRAME_COUNT, 5);
  assert.equal(BURST_KEEP, 3);
  assert.equal(zoomRange(null), null);
  assert.deepEqual(
    zoomRange({
      getVideoTracks: () => [{ getCapabilities: () => ({ zoom: { min: 1, max: 4, step: 0.25 } }) }],
    }),
    { min: 1, max: 4, step: 0.25 },
  );
});

test("applyZoom clamps and applies when a track advertises zoom", async () => {
  const applied = [];
  const stream = {
    getVideoTracks: () => [
      {
        getCapabilities: () => ({ zoom: { min: 1, max: 3, step: 0.5 } }),
        applyConstraints: (c) => {
          applied.push(c);
          return Promise.resolve();
        },
      },
    ],
  };
  assert.deepEqual(zoomRange(stream), { min: 1, max: 3, step: 0.5 });
  assert.equal(await applyZoom(stream, 9), true);
  assert.equal(applied[0].advanced[0].zoom, 3);
});

test("applyZoom returns false when constraints fail", async () => {
  const stream = {
    getVideoTracks: () => [
      {
        getCapabilities: () => ({ zoom: { min: 1, max: 3, step: 0.5 } }),
        applyConstraints: () => Promise.reject(new Error("constraint failed")),
      },
    ],
  };
  assert.equal(await applyZoom(stream, 2), false);
});

test("digitalZoomCrop is a no-op at 1x and centre-crops above", () => {
  assert.equal(digitalZoomCrop(1000, 800, 1), undefined);
  assert.deepEqual(digitalZoomCrop(1000, 800, 2), { sx: 250, sy: 200, sw: 500, sh: 400 });
  assert.equal(digitalZoomCrop(0, 800, 2), undefined);
});

test("waitForNextVideoFrame settles even without video frame callbacks", async () => {
  await waitForNextVideoFrame(/** @type {HTMLVideoElement} */ ({}), 30);
});

test("torch capability races fail closed instead of throwing", () => {
  assert.equal(
    torchAvailable({ getVideoTracks: () => [{ getCapabilities: () => { throw new DOMException("ended", "InvalidStateError"); } }] }),
    false,
  );
});

test("torch track lookup races close the stream instead of rejecting", async () => {
  let stopped = 0;
  const stream = {
    getVideoTracks: () => { throw new DOMException("ended", "InvalidStateError"); },
    getTracks: () => [{ stop: () => { stopped += 1; } }],
  };
  assert.equal(await setTorch(stream, true), false);
  assert.equal(stopped, 1);
});

test("torch application is bounded when device constraints never settle", async (t) => {
  const timeoutDescriptor = Object.getOwnPropertyDescriptor(globalThis, "setTimeout");
  const clearDescriptor = Object.getOwnPropertyDescriptor(globalThis, "clearTimeout");
  t.after(() => {
    restoreGlobal("setTimeout", timeoutDescriptor);
    restoreGlobal("clearTimeout", clearDescriptor);
  });
  Object.defineProperty(globalThis, "setTimeout", {
    configurable: true,
    value: (callback) => {
      queueMicrotask(callback);
      return 1;
    },
  });
  Object.defineProperty(globalThis, "clearTimeout", { configurable: true, value: () => undefined });
  let stopped = 0;
  const track = {
    stop: () => { stopped += 1; },
    getCapabilities: () => ({ torch: true }),
    applyConstraints: () => new Promise(() => undefined),
  };
  const stream = {
    getTracks: () => [track],
    getVideoTracks: () => [{
      ...track,
    }],
  };
  assert.equal(await setTorch(stream, true), false);
  assert.equal(stopped, 1);
});

test("torch constraint rejection stops the whole stream fail closed", async () => {
  let stopped = 0;
  const track = {
    stop: () => { stopped += 1; },
    getCapabilities: () => ({ torch: true }),
    applyConstraints: async () => { throw new DOMException("ended", "InvalidStateError"); },
  };
  const stream = {
    getTracks: () => [track, { stop: () => { stopped += 1; } }],
    getVideoTracks: () => [track],
  };
  assert.equal(await setTorch(stream, true), false);
  assert.equal(stopped, 2);
});

test("camera capture closes media on both visibility loss and pagehide", () => {
  const source = readFileSync(new URL("../src/components/camera-capture.tsx", import.meta.url), "utf8");
  assert.match(source, /addEventListener\("visibilitychange",\s*onVisibility\)/);
  assert.match(source, /addEventListener\("pagehide",\s*onPageHide\)/);
  assert.match(source, /removeEventListener\("pagehide",\s*onPageHide\)/);
});

test("startClip reports unsupported browsers and returns the native recorded type", async (t) => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "MediaRecorder");
  t.after(() => restoreGlobal("MediaRecorder", original));

  Object.defineProperty(globalThis, "MediaRecorder", {
    configurable: true,
    value: undefined,
  });
  assert.throws(() => startClip({}), /not supported/i);

  class FakeRecorder {
    state = "inactive";
    mimeType = "video/mp4";

    start() {
      this.state = "recording";
      this.ondataavailable?.({ data: new Blob(["frame"], { type: "video/mp4" }) });
    }

    stop() {
      this.state = "inactive";
      queueMicrotask(() => this.onstop?.());
    }
  }
  Object.defineProperty(globalThis, "MediaRecorder", {
    configurable: true,
    value: FakeRecorder,
  });

  const clip = startClip({});
  const blob = await clip.stop();
  assert.equal(blob.type, "video/mp4");
  assert.equal(await blob.text(), "frame");
});

test("startClip stop is bounded and idempotent when a recorder omits its stop event", async (t) => {
  const recorderDescriptor = Object.getOwnPropertyDescriptor(globalThis, "MediaRecorder");
  const timeoutDescriptor = Object.getOwnPropertyDescriptor(globalThis, "setTimeout");
  const realSetTimeout = globalThis.setTimeout;
  t.after(() => {
    restoreGlobal("MediaRecorder", recorderDescriptor);
    restoreGlobal("setTimeout", timeoutDescriptor);
  });

  let stopCalls = 0;
  class StuckRecorder {
    state = "inactive";
    mimeType = "video/webm";

    start() {
      this.state = "recording";
    }

    stop() {
      stopCalls += 1;
      this.state = "inactive";
    }
  }
  Object.defineProperty(globalThis, "MediaRecorder", {
    configurable: true,
    value: StuckRecorder,
  });
  Object.defineProperty(globalThis, "setTimeout", {
    configurable: true,
    value: (callback, ms, ...args) =>
      realSetTimeout(callback, ms === 5_000 ? 15 : ms, ...args),
  });

  const clip = startClip({});
  await assert.rejects(clip.stop(), /did not finish stopping/i);
  await assert.rejects(clip.stop(), /did not finish stopping/i);
  assert.equal(stopCalls, 1);
});

test("startClip cancel settles immediately, stops once, and remains idempotent", async (t) => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "MediaRecorder");
  t.after(() => restoreGlobal("MediaRecorder", original));

  let stopCalls = 0;
  class CancelRecorder {
    state = "inactive";
    mimeType = "video/mp4";

    start() {
      this.state = "recording";
    }

    stop() {
      stopCalls += 1;
      this.state = "inactive";
    }
  }
  Object.defineProperty(globalThis, "MediaRecorder", {
    configurable: true,
    value: CancelRecorder,
  });

  const clip = startClip({});
  clip.cancel();
  clip.cancel();
  await assert.rejects(clip.stop(), (error) => error?.name === "AbortError");
  assert.equal(stopCalls, 1);
});

test("startClip observes recorder errors that arrive before the UI calls stop", async (t) => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "MediaRecorder");
  t.after(() => restoreGlobal("MediaRecorder", original));

  class ErrorRecorder {
    state = "inactive";
    mimeType = "video/webm";

    start() {
      this.state = "recording";
      queueMicrotask(() => this.onerror?.());
    }

    stop() {
      this.state = "inactive";
      queueMicrotask(() => this.onstop?.());
    }
  }
  Object.defineProperty(globalThis, "MediaRecorder", {
    configurable: true,
    value: ErrorRecorder,
  });

  const clip = startClip({});
  await new Promise((resolve) => setImmediate(resolve));
  await assert.rejects(clip.stop(), /video recording failed/i);
});

test("a bitmap that resolves after its decode timeout is still closed", async (t) => {
  const names = ["window", "HTMLVideoElement", "HTMLImageElement", "createImageBitmap"];
  const originals = new Map(
    names.map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]),
  );
  const realSetTimeout = globalThis.setTimeout;
  const realClearTimeout = globalThis.clearTimeout;
  t.after(() => {
    for (const [name, descriptor] of originals) restoreGlobal(name, descriptor);
  });

  let closes = 0;
  let decodeCalls = 0;
  Object.defineProperties(globalThis, {
    window: {
      configurable: true,
      value: {
        setTimeout: (callback, ms) => realSetTimeout(callback, ms === 30_000 ? 50 : 0),
        clearTimeout: realClearTimeout,
      },
    },
    HTMLVideoElement: { configurable: true, value: class {} },
    HTMLImageElement: { configurable: true, value: class {} },
    createImageBitmap: {
      configurable: true,
      value: () => {
        decodeCalls += 1;
        return new Promise((resolve) =>
          realSetTimeout(
            () => resolve({ width: 10, height: 10, close: () => { closes += 1; } }),
            20,
          ),
        );
      },
    },
  });

  await assert.rejects(processMediaFrame(new Blob(["image"])), /decode timed out/i);
  await assert.rejects(processMediaFrame(new Blob(["image"])), /previous image decode is still finishing/i);
  assert.equal(decodeCalls, 1);
  await new Promise((resolve) => realSetTimeout(resolve, 35));
  assert.equal(closes, 1);
});

test("a native bitmap decode that never settles cannot wedge later imports forever", async (t) => {
  const names = ["window", "HTMLVideoElement", "HTMLImageElement", "createImageBitmap"];
  const originals = new Map(
    names.map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]),
  );
  const realSetTimeout = globalThis.setTimeout;
  const realClearTimeout = globalThis.clearTimeout;
  t.after(() => {
    for (const [name, descriptor] of originals) restoreGlobal(name, descriptor);
  });

  let decodeCalls = 0;
  Object.defineProperties(globalThis, {
    window: {
      configurable: true,
      value: {
        setTimeout: (callback, ms) => realSetTimeout(callback, ms === 30_000 ? 10 : 0),
        clearTimeout: realClearTimeout,
      },
    },
    HTMLVideoElement: { configurable: true, value: class {} },
    HTMLImageElement: { configurable: true, value: class {} },
    createImageBitmap: {
      configurable: true,
      value: () => {
        decodeCalls += 1;
        if (decodeCalls === 1) return new Promise(() => undefined);
        throw new Error("decoder retry reached");
      },
    },
  });

  await assert.rejects(processMediaFrame(new Blob(["image"])), /decode timed out/i);
  await assert.rejects(processMediaFrame(new Blob(["image"])), /previous image decode/i);
  assert.equal(decodeCalls, 1);
  await new Promise((resolve) => realSetTimeout(resolve, 15));
  await assert.rejects(processMediaFrame(new Blob(["image"])), /decoder retry reached/i);
  assert.equal(decodeCalls, 2);
});

test("extractVideoFrames handles a zero-duration recording and always revokes its URL", async (t) => {
  const dom = installFakeVideoDom({ duration: 0 });
  t.after(dom.restore);

  const frames = await extractVideoFrames(new Blob(["video"], { type: "video/webm" }), 6);
  assert.equal(frames.length, 1);
  assert.equal(dom.seekTimes.length, 0);
  assert.equal(dom.revoked.length, 1);
  assert.equal(dom.video.sourceCleared, true);
});

test("extractVideoFrames samples finite videos in chronological order", async (t) => {
  const dom = installFakeVideoDom({ duration: 2 });
  t.after(dom.restore);

  const frames = await extractVideoFrames(new Blob(["video"], { type: "video/mp4" }), 2);
  assert.equal(frames.length, 2);
  assert.deepEqual(dom.seekTimes.map((time) => Number(time.toFixed(2))), [0.5, 1.5]);
  assert.equal(dom.revoked.length, 1);
});

test("extractVideoFrames rejects overlong uploads and still cleans up", async (t) => {
  const dom = installFakeVideoDom({ duration: 61 });
  t.after(dom.restore);

  await assert.rejects(
    extractVideoFrames(new Blob(["video"], { type: "video/mp4" }), 6),
    /under 60 seconds/i,
  );
  assert.equal(dom.revoked.length, 1);
  assert.equal(dom.video.sourceCleared, true);
});

test("extractVideoFrames rejects oversized decoder surfaces at metadata", async (t) => {
  const dom = installFakeVideoDom({ duration: 2 });
  t.after(dom.restore);
  dom.video.videoWidth = 7680;
  dom.video.videoHeight = 4320;
  await assert.rejects(
    extractVideoFrames(new Blob(["video"], { type: "video/mp4" }), 2),
    /resolution is too large/i,
  );
  assert.equal(dom.seekTimes.length, 0);
  assert.equal(dom.revoked.length, 1);
});

test("extractVideoFrames rejects an indeterminate non-seekable duration", async (t) => {
  const dom = installFakeVideoDom({ duration: Number.POSITIVE_INFINITY });
  t.after(dom.restore);
  await assert.rejects(
    extractVideoFrames(new Blob(["video"], { type: "video/mp4" }), 6),
    /determine the video duration/i,
  );
  assert.equal(dom.revoked.length, 1);
});

test("extractVideoFrames uses the caller's elapsed hint for an indeterminate recorded WebM", async (t) => {
  const dom = installFakeVideoDom({ duration: Number.POSITIVE_INFINITY });
  t.after(dom.restore);

  const frames = await extractVideoFrames(
    new Blob(["video"], { type: "video/webm" }),
    2,
    undefined,
    2,
  );
  assert.equal(frames.length, 2);
  assert.deepEqual(dom.seekTimes.map((time) => Number(time.toFixed(2))), [0.5, 1.5]);
  assert.equal(dom.revoked.length, 1);
});

test("extractVideoFrames aborts a pending metadata read immediately and cleans up", async (t) => {
  const dom = installFakeVideoDom({ duration: 2, silentLoad: true });
  t.after(dom.restore);
  const controller = new AbortController();

  const pending = extractVideoFrames(
    new Blob(["video"], { type: "video/mp4" }),
    2,
    controller.signal,
  );
  controller.abort();

  await assert.rejects(pending, (error) => error?.name === "AbortError");
  assert.equal(dom.revoked.length, 1);
  assert.equal(dom.video.sourceCleared, true);
});

test("extractVideoFrames aborts an in-flight seek and removes the source", async (t) => {
  const controller = new AbortController();
  const dom = installFakeVideoDom({
    duration: 2,
    onSeek: () => controller.abort(),
  });
  t.after(dom.restore);

  await assert.rejects(
    extractVideoFrames(
      new Blob(["video"], { type: "video/mp4" }),
      2,
      controller.signal,
    ),
    (error) => error?.name === "AbortError",
  );
  assert.equal(dom.seekTimes.length, 1);
  assert.equal(dom.revoked.length, 1);
});

function restoreGlobal(name, descriptor) {
  if (descriptor) Object.defineProperty(globalThis, name, descriptor);
  else delete globalThis[name];
}

function makeHeic(width, height, associated = true) {
  const bytes = new Uint8Array(106);
  const view = new DataView(bytes.buffer);
  const type = (offset, value) => bytes.set([...value].map((char) => char.charCodeAt(0)), offset);

  view.setUint32(0, 24);
  type(4, "ftyp");
  type(8, "heic");
  type(16, "mif1");
  type(20, "heic");

  view.setUint32(24, 82);
  type(28, "meta");
  view.setUint32(36, 14);
  type(40, "pitm");
  view.setUint16(48, 1);

  view.setUint32(50, 56);
  type(54, "iprp");
  view.setUint32(58, 28);
  type(62, "ipco");
  view.setUint32(66, 20);
  type(70, "ispe");
  view.setUint32(78, width);
  view.setUint32(82, height);

  view.setUint32(86, 20);
  type(90, "ipma");
  view.setUint32(98, 1);
  view.setUint16(102, associated ? 1 : 2);
  bytes[104] = 1;
  bytes[105] = 1;
  return bytes;
}

function installFakeVideoDom({ duration, silentLoad = false, onSeek = undefined }) {
  const names = ["document", "window", "HTMLVideoElement", "HTMLImageElement", "ImageData"];
  const originals = new Map(
    names.map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]),
  );
  const createObjectURL = URL.createObjectURL;
  const revokeObjectURL = URL.revokeObjectURL;
  const revoked = [];
  const seekTimes = [];

  class FakeImageData {
    constructor(data, width, height) {
      this.data = data;
      this.width = width;
      this.height = height;
    }
  }

  class FakeVideo extends EventTarget {
    readyState = 0;
    videoWidth = 640;
    videoHeight = 480;
    muted = false;
    playsInline = false;
    preload = "";
    duration = duration;
    sourceCleared = false;
    #currentTime = 0;

    set src(_value) {
      if (silentLoad) return;
      queueMicrotask(() => {
        this.readyState = 2;
        this.dispatchEvent(new Event("loadedmetadata"));
        this.dispatchEvent(new Event("loadeddata"));
      });
    }

    get currentTime() {
      return this.#currentTime;
    }

    set currentTime(value) {
      this.#currentTime = value;
      seekTimes.push(value);
      onSeek?.(value);
      queueMicrotask(() => this.dispatchEvent(new Event("seeked")));
    }

    load() {}

    pause() {}

    removeAttribute(name) {
      if (name === "src") this.sourceCleared = true;
    }
  }

  const video = new FakeVideo();
  const canvas = () => ({
    width: 1,
    height: 1,
    getContext: () => ({
      drawImage: () => undefined,
      getImageData: (_x, _y, width, height) =>
        new FakeImageData(new Uint8ClampedArray(width * height * 4), width, height),
    }),
    toDataURL: () => "data:image/jpeg;base64,YWJjZA==",
  });

  Object.defineProperties(globalThis, {
    window: { configurable: true, value: globalThis },
    HTMLVideoElement: { configurable: true, value: FakeVideo },
    HTMLImageElement: { configurable: true, value: class {} },
    ImageData: { configurable: true, value: FakeImageData },
    document: {
      configurable: true,
      value: {
        createElement: (tag) => (tag === "video" ? video : canvas()),
      },
    },
  });
  URL.createObjectURL = () => "blob:test-video";
  URL.revokeObjectURL = (url) => revoked.push(url);

  return {
    video,
    revoked,
    seekTimes,
    restore: () => {
      for (const [name, descriptor] of originals) restoreGlobal(name, descriptor);
      URL.createObjectURL = createObjectURL;
      URL.revokeObjectURL = revokeObjectURL;
    },
  };
}

test("the capture surface honours digital zoom, resets it for clips, and scopes shortcuts", () => {
  const capture = readFileSync(new URL("../src/components/camera-capture.tsx", import.meta.url), "utf8");

  // Burst stills pass the digital-zoom crop into processMediaFrame. Without
  // this a 2.4x "zoomed" capture transmitted the full wide scene — everything
  // the user had deliberately framed out. The preview aspect rides along so
  // the crop matches the object-contain letterbox, not the raw sensor frame.
  assert.match(capture, /digitalZoom = zoomCapsRef\.current \? 1 : Math\.max\(1, zoomRef\.current\)/);
  assert.match(capture, /processMediaFrame\(v, 1600, 240, 0\.82, null, digitalZoom, CAPTURE_PREVIEW_ASPECT\)/);

  // A clip records the raw stream; recording under a CSS-only zoom is the
  // same lie in video form. The record path resets to 1x and says why.
  assert.match(capture, /setZoom\(1\);/);
  assert.match(capture, /clip records the camera's full frame, so zoom was reset/);

  // The 3s timer waits real seconds per displayed count — 450ms per step
  // fired after ~1.35s — and a dead stream (plain Close does not bump the
  // camera request) aborts the count.
  assert.match(capture, /setTimeout\(resolve, 1000\)/);
  assert.doesNotMatch(capture, /setTimeout\(resolve, 450\)/);
  assert.match(capture, /request !== cameraRequestRef\.current \|\|\s*\n\s*!streamRef\.current/);

  // Space/R fire only from non-interactive targets, one bail for both keys.
  // Space on a focused Close used to fire a burst and consume the one-use
  // batch; R from a focused link started a recording; Space on a focused
  // <summary> both toggled the disclosure and fired a capture.
  assert.match(
    capture,
    /closest\(\s*\n?\s*"button, a, input, textarea, select, summary, label, \[role='button'\], \[role='slider'\], \[contenteditable\]",?\s*\n?\s*\)/,
  );
});

test("digitalZoomCrop edge semantics stay total and centred", () => {
  // Ported from the softwareCropRect suite this replaced in the merge: the
  // helper must be total over junk zoom values and bottom out at one pixel.
  assert.equal(digitalZoomCrop(640, 480, NaN), undefined);
  assert.equal(digitalZoomCrop(640, 480, 0.5), undefined);
  const tiny = digitalZoomCrop(640, 480, 10_000);
  assert.ok(tiny && tiny.sw >= 1 && tiny.sh >= 1);
  const r = digitalZoomCrop(1920, 1080, 2.4);
  assert.ok(r);
  assert.ok(Math.abs(r.sx * 2 + r.sw - 1920) < 1e-6, "horizontally centred");
  assert.ok(Math.abs(r.sy * 2 + r.sh - 1080) < 1e-6, "vertically centred");
});

test("digitalZoomCrop models object-contain letterboxing when given the viewport aspect", () => {
  // The Studio preview is a fixed 3:4 object-contain box. A 16:9 stream sits
  // letterboxed inside it: at 2x the element scale hides half the WIDTH but
  // the full height is still on screen (the vertical slack is 16:9 / 3:4 =
  // 2.37). The first version of this fix cropped both axes by 1/zoom and
  // discarded half the visible height — content the user deliberately kept
  // in frame. These cases compare preview-visible bounds with captured
  // bounds, per the review that caught it.
  const BOX = 3 / 4;

  // Landscape 16:9 at 2x: width halves, height stays FULL.
  const wide = digitalZoomCrop(1920, 1080, 2, BOX);
  assert.ok(wide);
  assert.ok(Math.abs(wide.sw - 960) < 1e-6, "binding axis crops by 1/z");
  assert.ok(Math.abs(wide.sh - 1080) < 1e-6, "letterboxed axis keeps its full visible extent");
  assert.ok(Math.abs(wide.sy) < 1e-6);

  // The slack axis only starts cropping once z exceeds its letterbox ratio
  // (16:9 in 3:4 → slackH = (16/9)/(3/4) ≈ 2.37).
  const past = digitalZoomCrop(1920, 1080, 3, BOX);
  assert.ok(past);
  assert.ok(past.sh < 1080, "beyond the slack ratio the height crops too");
  assert.ok(Math.abs(past.sh - 1080 * (((16 / 9) / BOX) / 3)) < 1e-6);

  // Portrait 9:16 at 2x: height halves, width keeps slackW/z = (3/4 / 9/16)/2.
  const tall = digitalZoomCrop(1080, 1920, 2, BOX);
  assert.ok(tall);
  assert.ok(Math.abs(tall.sh - 960) < 1e-6);
  assert.ok(Math.abs(tall.sw - 1080 * ((BOX / (9 / 16)) / 2)) < 1e-6);
  assert.ok(Math.abs(tall.sx * 2 + tall.sw - 1080) < 1e-6, "centred");

  // A stream matching the box exactly degrades to the plain both-axes crop.
  const exact = digitalZoomCrop(1200, 1600, 2, BOX);
  assert.deepEqual(exact, { sx: 300, sy: 400, sw: 600, sh: 800 });

  // Without the aspect the legacy both-axes behavior is unchanged.
  assert.deepEqual(digitalZoomCrop(1920, 1080, 2), { sx: 480, sy: 270, sw: 960, sh: 540 });
});

test("capture and live meter share the letterbox-aware crop", () => {
  const capture = readFileSync(new URL("../src/components/camera-capture.tsx", import.meta.url), "utf8");
  const meter = readFileSync(new URL("../src/lib/camera/live-meter.ts", import.meta.url), "utf8");
  // Both surfaces must pass the preview box's aspect, or the HUD scores
  // pixels a capture would not keep (and vice versa).
  assert.match(capture, /CAPTURE_PREVIEW_ASPECT = 3 \/ 4/);
  assert.match(capture, /processMediaFrame\(v, 1600, 240, 0\.82, null, digitalZoom, CAPTURE_PREVIEW_ASPECT\)/);
  assert.match(capture, /scoreLivePreview\(video, digitalZoom, CAPTURE_PREVIEW_ASPECT\)/);
  assert.match(meter, /digitalZoomCrop\(video\.videoWidth, video\.videoHeight, digitalZoom, previewAspect\)/);
});
