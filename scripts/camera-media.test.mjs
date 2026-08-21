import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_PHOTO_BYTES,
  MAX_VIDEO_BYTES,
  dataUrlSize,
  extractVideoFrames,
  validateMediaFile,
} from "../src/lib/media.ts";
import { openRopeCamera, startClip, torchAvailable } from "../src/lib/camera/stream.ts";

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

test("openRopeCamera retries constraint failures but not permission denials", async (t) => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  t.after(() => restoreGlobal("navigator", original));

  const track = {
    getCapabilities: () => ({}),
    applyConstraints: async () => undefined,
  };
  const stream = { getVideoTracks: () => [track] };
  let calls = 0;
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      mediaDevices: {
        getUserMedia: async () => {
          calls += 1;
          if (calls === 1) throw new DOMException("constraints", "OverconstrainedError");
          return stream;
        },
      },
    },
  });

  assert.equal(await openRopeCamera("environment"), stream);
  assert.equal(calls, 2);

  calls = 0;
  globalThis.navigator.mediaDevices.getUserMedia = async () => {
    calls += 1;
    throw new DOMException("denied", "NotAllowedError");
  };
  await assert.rejects(openRopeCamera("environment"), /denied/);
  assert.equal(calls, 1);
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

test("torch capability races fail closed instead of throwing", () => {
  assert.equal(
    torchAvailable({ getVideoTracks: () => [{ getCapabilities: () => { throw new DOMException("ended", "InvalidStateError"); } }] }),
    false,
  );
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

test("extractVideoFrames rejects an indeterminate non-seekable duration", async (t) => {
  const dom = installFakeVideoDom({ duration: Number.POSITIVE_INFINITY });
  t.after(dom.restore);
  await assert.rejects(
    extractVideoFrames(new Blob(["video"], { type: "video/mp4" }), 6),
    /determine the video duration/i,
  );
  assert.equal(dom.revoked.length, 1);
});

function restoreGlobal(name, descriptor) {
  if (descriptor) Object.defineProperty(globalThis, name, descriptor);
  else delete globalThis[name];
}

function installFakeVideoDom({ duration }) {
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
