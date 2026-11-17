import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CLIP_DURATION_MS,
  listCameraDevices,
  openRopeCamera,
  setTorch,
  startClip,
  torchAvailable,
} from "./stream.ts";
import { MAX_VIDEO_BYTES } from "../media.ts";
import { cameraErrorMessage } from "./error-message.ts";

// ---------------------------------------------------------------------------
// Environment scaffolding. These tests exercise the real ladder, torch, and
// recorder logic against scripted browser doubles — the audit found camera
// facing, torch, and the recorder byte-cap/auto-stop untested at every layer.
// ---------------------------------------------------------------------------

type FakeTrack = {
  stopped: boolean;
  appliedConstraints: unknown[];
  stop: () => void;
  getCapabilities?: () => Record<string, unknown>;
  applyConstraints: (constraints: unknown) => Promise<void>;
};

function fakeTrack(caps: Record<string, unknown> = {}, applyRejects = false): FakeTrack {
  const track: FakeTrack = {
    stopped: false,
    appliedConstraints: [],
    stop() {
      track.stopped = true;
    },
    getCapabilities: () => caps,
    applyConstraints(constraints: unknown) {
      track.appliedConstraints.push(constraints);
      return applyRejects ? Promise.reject(new Error("device refused")) : Promise.resolve();
    },
  };
  return track;
}

function fakeStream(track: FakeTrack = fakeTrack()) {
  return {
    track,
    getVideoTracks: () => [track],
    getTracks: () => [track],
  } as unknown as MediaStream & { track: FakeTrack };
}

const globals = globalThis as Record<string, unknown>;

async function withCameraEnv<T>(
  getUserMedia: (constraints: MediaStreamConstraints) => Promise<unknown>,
  body: () => Promise<T>,
): Promise<T> {
  const hadNavigator = "navigator" in globals;
  const previousNavigator = globals.navigator;
  const previousSecure = globals.isSecureContext;
  Object.defineProperty(globalThis, "navigator", {
    value: { mediaDevices: { getUserMedia } },
    configurable: true,
    writable: true,
  });
  globals.isSecureContext = true;
  try {
    return await body();
  } finally {
    if (hadNavigator) {
      Object.defineProperty(globalThis, "navigator", {
        value: previousNavigator,
        configurable: true,
        writable: true,
      });
    } else {
      delete globals.navigator;
    }
    globals.isSecureContext = previousSecure;
  }
}

// ---------------------------------------------------------------------------
// openRopeCamera: the facing a caller asks for must reach the device, and the
// quality ladder must degrade without ever abandoning that request until the
// final permissive fallback.
// ---------------------------------------------------------------------------

test("openRopeCamera sends the requested facing through the constraint ladder", async () => {
  for (const facing of ["environment", "user"] as const) {
    const seen: MediaStreamConstraints[] = [];
    const stream = fakeStream();
    const opened = await withCameraEnv(
      async (constraints) => {
        seen.push(constraints);
        return stream;
      },
      () => openRopeCamera(facing),
    );
    assert.equal(opened, stream);
    assert.equal(seen.length, 1, "a successful first try must not retry");
    const video = seen[0]!.video as MediaTrackConstraints;
    assert.deepEqual(video.facingMode, { ideal: facing }, `first try asks for ${facing}`);
    assert.deepEqual(video.width, { ideal: 1920 });
    assert.deepEqual(video.height, { ideal: 1080 });
  }
});

test("openRopeCamera degrades through exact facing to any camera, in order", async () => {
  const seen: MediaStreamConstraints[] = [];
  const stream = fakeStream();
  const opened = await withCameraEnv(
    async (constraints) => {
      seen.push(constraints);
      if (seen.length < 3) {
        throw Object.assign(new Error("no such device"), { name: "OverconstrainedError" });
      }
      return stream;
    },
    () => openRopeCamera("user"),
  );
  assert.equal(opened, stream);
  assert.equal(seen.length, 3);
  assert.deepEqual((seen[0]!.video as MediaTrackConstraints).facingMode, { ideal: "user" });
  assert.equal((seen[1]!.video as MediaTrackConstraints).facingMode, "user");
  assert.equal(seen[2]!.video, true, "the last resort accepts any camera");
});

test("openRopeCamera stops the ladder on a permission denial instead of retrying around it", async () => {
  const seen: MediaStreamConstraints[] = [];
  await withCameraEnv(
    async (constraints) => {
      seen.push(constraints);
      throw Object.assign(new Error("denied"), { name: "NotAllowedError" });
    },
    async () => {
      await assert.rejects(() => openRopeCamera("environment"), /denied/);
    },
  );
  // Retrying a denial with looser constraints would re-prompt (or re-log) a
  // user who just said no.
  assert.equal(seen.length, 1);
});

test("openRopeCamera stops a stream that arrives after the caller aborted", async () => {
  const stream = fakeStream();
  const controller = new AbortController();
  await withCameraEnv(
    async () => {
      controller.abort();
      return stream;
    },
    async () => {
      await assert.rejects(() => openRopeCamera("environment", { signal: controller.signal }));
    },
  );
  assert.equal(stream.track.stopped, true, "the orphaned stream's tracks must be stopped");
});

test("an explicitly selected camera stays selected when resolution constraints fail", async () => {
  const seen: MediaStreamConstraints[] = [];
  const stream = fakeStream();
  const opened = await withCameraEnv(async (constraints) => {
    seen.push(constraints);
    if (seen.length === 1) throw new DOMException("720p only", "OverconstrainedError");
    return stream;
  }, () => openRopeCamera("environment", { deviceId: "integrated" }));
  assert.equal(opened, stream);
  assert.equal(seen.length, 2);
  for (const constraints of seen) {
    assert.deepEqual((constraints.video as MediaTrackConstraints).deviceId, { exact: "integrated" });
    assert.equal((constraints.video as MediaTrackConstraints).facingMode, undefined);
  }
  assert.deepEqual(seen[1]!.video, { deviceId: { exact: "integrated" } });
});

test("an unavailable selected camera never silently opens a different camera", async () => {
  const seen: MediaStreamConstraints[] = [];
  await withCameraEnv(async (constraints) => {
    seen.push(constraints);
    throw new DOMException("unplugged", "NotFoundError");
  }, async () => {
    await assert.rejects(() => openRopeCamera("environment", { deviceId: "usb" }), /unplugged/);
  });
  assert.equal(seen.length, 2);
  assert.ok(seen.every((constraints) => (constraints.video as MediaTrackConstraints).deviceId));
});

test("camera-in-use failures do not retry and keep actionable copy across realms", async () => {
  let attempts = 0;
  const error = Object.assign(new Error("Could not start video source"), { name: "NotReadableError" });
  await withCameraEnv(async () => {
    attempts++;
    throw error;
  }, async () => {
    await assert.rejects(() => openRopeCamera("environment"), /Could not start/);
  });
  assert.equal(attempts, 1);
  assert.match(cameraErrorMessage(error), /busy in another app.*Close it there and try again/);
});

test("camera failures explain denied permission, missing devices and unknown errors", () => {
  assert.match(cameraErrorMessage(new DOMException("denied", "NotAllowedError")), /Allow camera permission/);
  assert.match(cameraErrorMessage({ name: "SecurityError" }), /Allow camera permission/);
  assert.match(cameraErrorMessage(new DOMException("missing", "NotFoundError")), /No compatible camera/);
  assert.match(cameraErrorMessage({ name: "OverconstrainedError" }), /Choose a photo or video/);
  assert.equal(cameraErrorMessage(new Error("preview failed")), "preview failed");
  assert.equal(cameraErrorMessage(null), "Could not open the camera.");
});

test("camera enumeration is optional, filters audio, and tolerates errors and empty lists", async () => {
  await withCameraEnv(async () => fakeStream(), async () => {
    assert.deepEqual(await listCameraDevices(), []);
    const devices = navigator.mediaDevices;
    const integrated = { kind: "videoinput", deviceId: "integrated", label: "Integrated Camera" };
    const usb = { kind: "videoinput", deviceId: "usb", label: "USB Camera" };
    Object.assign(devices, { enumerateDevices: async () => [integrated, { kind: "audioinput" }, usb] });
    assert.deepEqual(await listCameraDevices(), [integrated, usb]);
    Object.assign(devices, { enumerateDevices: async () => [] });
    assert.deepEqual(await listCameraDevices(), []);
    Object.assign(devices, { enumerateDevices: async () => { throw new Error("enumeration blocked"); } });
    assert.deepEqual(await listCameraDevices(), []);
  });
});

// ---------------------------------------------------------------------------
// Torch: capability-gated, fail-closed.
// ---------------------------------------------------------------------------

test("torch helpers are capability-gated and fail closed", async () => {
  assert.equal(torchAvailable(null), false);

  const noTorch = fakeStream(fakeTrack({}));
  assert.equal(torchAvailable(noTorch), false);
  assert.equal(await setTorch(noTorch, true), false);
  assert.equal(noTorch.track.appliedConstraints.length, 0, "no constraint call without the capability");

  const torch = fakeStream(fakeTrack({ torch: true }));
  assert.equal(torchAvailable(torch), true);
  assert.equal(await setTorch(torch, true), true);
  assert.deepEqual(torch.track.appliedConstraints, [{ advanced: [{ torch: true }] }]);
  assert.equal(torch.track.stopped, false);

  // A device that accepts the capability but rejects the constraint leaves an
  // unknown torch state. The toggle reports failure and the lamp is driven
  // back off, but the capture survives: closing a working camera over a light
  // is the worse outcome mid-session.
  const refuses = fakeStream(fakeTrack({ torch: true }, true));
  assert.equal(await setTorch(refuses, true), false);
  assert.equal(refuses.track.stopped, false, "a torch failure must not close the camera");
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.deepEqual(
    refuses.track.appliedConstraints.at(-1),
    { advanced: [{ torch: false }] },
    "an unconfirmed torch-on is followed by an off",
  );
});

// ---------------------------------------------------------------------------
// startClip: the recorder budget and the component's auto-stop contract.
// ---------------------------------------------------------------------------

type RecorderHandlers = {
  ondataavailable: ((event: { data: Blob }) => void) | null;
  onstop: (() => void) | null;
  onerror: (() => void) | null;
};

function chunk(bytes: number): Blob {
  return new Blob(["x".repeat(bytes)], { type: "video/webm" });
}

async function withFakeRecorder<T>(
  body: (recorders: Array<RecorderHandlers & { state: string }>) => Promise<T>,
): Promise<T> {
  const recorders: Array<RecorderHandlers & { state: string }> = [];
  class FakeRecorder {
    // A real MediaRecorder is inactive until start() is called — a double
    // that is born recording lets startClip skip start() entirely without
    // any test noticing (the adversarial audit's exact finding).
    state = "inactive";
    mimeType = "video/webm";
    ondataavailable: RecorderHandlers["ondataavailable"] = null;
    onstop: RecorderHandlers["onstop"] = null;
    onerror: RecorderHandlers["onerror"] = null;
    constructor() {
      recorders.push(this as unknown as RecorderHandlers & { state: string });
    }
    start() {
      this.state = "recording";
    }
    stop() {
      this.state = "inactive";
      queueMicrotask(() => this.onstop?.());
    }
  }
  const previous = globals.MediaRecorder;
  globals.MediaRecorder = FakeRecorder;
  try {
    return await body(recorders);
  } finally {
    if (previous === undefined) delete globals.MediaRecorder;
    else globals.MediaRecorder = previous;
  }
}

test("startClip starts the recorder and rejects past the shared byte budget", async () => {
  await withFakeRecorder(async (recorders) => {
    const handle = startClip(fakeStream() as unknown as MediaStream);
    const rec = recorders[0]!;
    // The double is born inactive, so this only holds if startClip actually
    // called start() — a clip that never starts records nothing and dies in
    // the 5s stop-timeout on every real device.
    assert.equal(rec.state, "recording", "startClip must start the recorder");
    rec.ondataavailable?.({ data: chunk(Math.ceil(MAX_VIDEO_BYTES / 2) + 1) });
    assert.equal(rec.state, "recording", "under budget keeps recording");
    rec.ondataavailable?.({ data: chunk(Math.ceil(MAX_VIDEO_BYTES / 2) + 1) });
    await assert.rejects(() => handle.stop(), /Keep clips under 100 MB/);
    assert.equal(rec.state, "inactive", "an over-budget recorder is stopped");
  });
});

test("startClip resolves the recorded bytes on stop and empties on cancel", async () => {
  await withFakeRecorder(async (recorders) => {
    const handle = startClip(fakeStream() as unknown as MediaStream);
    recorders[0]!.ondataavailable?.({ data: chunk(3) });
    recorders[0]!.ondataavailable?.({ data: chunk(4) });
    const blob = await handle.stop();
    assert.equal(blob.type, "video/webm");
    // The bytes, not just the label: a startClip that drops its chunks still
    // resolved a correctly-typed empty blob, and nothing at any layer failed
    // (the adversarial audit's exact finding).
    assert.equal(blob.size, 7, "every recorded chunk must reach the resolved blob");

    const second = startClip(fakeStream() as unknown as MediaStream);
    recorders[1]!.ondataavailable?.({ data: chunk(3) });
    second.cancel();
    await assert.rejects(() => second.stop(), (error: unknown) => {
      assert.ok(error instanceof DOMException && error.name === "AbortError");
      return true;
    });
  });
});

test("CLIP_DURATION_MS is the value the studio schedules its auto-stop with", async () => {
  // Not a bare constant pin: the component must actually schedule
  // finishRecord with this constant. Read the source so replacing the
  // constant at the call site with a literal fails here.
  const { readFileSync } = await import("node:fs");
  const capture = readFileSync(
    new URL("../../components/camera-capture.tsx", import.meta.url),
    "utf8",
  );
  assert.match(
    capture,
    /recordTimerRef\.current = window\.setTimeout\(\(\) => \{[\s\S]{0,120}finishRecord\(\);[\s\S]{0,40}\}, CLIP_DURATION_MS\);/,
    "the studio auto-stop must be scheduled with CLIP_DURATION_MS",
  );
  assert.equal(CLIP_DURATION_MS, 7_000);
});
