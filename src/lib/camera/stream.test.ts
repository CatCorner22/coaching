import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CLIP_DURATION_MS,
  openRopeCamera,
  setTorch,
  startClip,
  torchAvailable,
} from "./stream.ts";
import { MAX_VIDEO_BYTES } from "../media.ts";

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
  // unknown torch state; the camera closes rather than guessing.
  const refuses = fakeStream(fakeTrack({ torch: true }, true));
  assert.equal(await setTorch(refuses, true), false);
  assert.equal(refuses.track.stopped, true, "failure must stop the stream, not leave it ambiguous");
});

// ---------------------------------------------------------------------------
// startClip: the recorder budget and the component's auto-stop contract.
// ---------------------------------------------------------------------------

type RecorderHandlers = {
  ondataavailable: ((event: { data: { size: number; type: string } }) => void) | null;
  onstop: (() => void) | null;
  onerror: (() => void) | null;
};

async function withFakeRecorder<T>(
  body: (recorders: Array<RecorderHandlers & { state: string }>) => Promise<T>,
): Promise<T> {
  const recorders: Array<RecorderHandlers & { state: string }> = [];
  class FakeRecorder {
    state = "recording";
    mimeType = "video/webm";
    ondataavailable: RecorderHandlers["ondataavailable"] = null;
    onstop: RecorderHandlers["onstop"] = null;
    onerror: RecorderHandlers["onerror"] = null;
    constructor() {
      recorders.push(this as unknown as RecorderHandlers & { state: string });
    }
    start() {
      /* timeslice accepted */
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

test("startClip rejects a recording that exceeds the shared byte budget", async () => {
  await withFakeRecorder(async (recorders) => {
    const handle = startClip(fakeStream() as unknown as MediaStream);
    const rec = recorders[0]!;
    const half = { size: Math.ceil(MAX_VIDEO_BYTES / 2) + 1, type: "video/webm" };
    rec.ondataavailable?.({ data: half });
    assert.equal(rec.state, "recording", "under budget keeps recording");
    rec.ondataavailable?.({ data: half });
    await assert.rejects(() => handle.stop(), /Keep clips under 100 MB/);
    assert.equal(rec.state, "inactive", "an over-budget recorder is stopped");
  });
});

test("startClip resolves the recorded bytes on stop and empties on cancel", async () => {
  await withFakeRecorder(async (recorders) => {
    const handle = startClip(fakeStream() as unknown as MediaStream);
    recorders[0]!.ondataavailable?.({ data: { size: 3, type: "video/webm" } });
    const blob = await handle.stop();
    assert.equal(blob.type, "video/webm");

    const second = startClip(fakeStream() as unknown as MediaStream);
    recorders[1]!.ondataavailable?.({ data: { size: 3, type: "video/webm" } });
    second.cancel();
    await assert.rejects(() => second.stop(), (error: unknown) => {
      assert.ok(error instanceof DOMException && error.name === "AbortError");
      return true;
    });
  });
});

test("the studio clip auto-stop budget matches the recorder contract", () => {
  // The component schedules finishRecord after CLIP_DURATION_MS; the value is
  // part of the recording contract the UI copy states ("3 second practice
  // loop" is the academy's own 3s timer; the studio clip is this one).
  assert.equal(CLIP_DURATION_MS, 7_000);
});
