type Facing = "user" | "environment";
const FOCUS_SETUP_TIMEOUT_MS = 1_000;
const CAMERA_OPEN_TIMEOUT_MS = 20_000;
const CAMERA_PLAY_TIMEOUT_MS = 5_000;

export type ClipHandle = {
  stop: () => Promise<Blob>;
  cancel: () => void;
};

export async function openRopeCamera(
  facing: Facing,
  options: { signal?: AbortSignal; timeoutMs?: number } = {},
): Promise<MediaStream> {
  if (typeof globalThis.isSecureContext === "boolean" && !globalThis.isSecureContext) {
    throw new Error("Live camera requires HTTPS or localhost. Open this app in a secure context.");
  }
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    throw new Error("Live camera is not supported in this browser.");
  }
  const tries: MediaStreamConstraints[] = [
    {
      audio: false,
      video: {
        facingMode: { ideal: facing },
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
      },
    },
    {
      audio: false,
      video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
    },
    { audio: false, video: true },
  ];
  let last: unknown;
  for (const c of tries) {
    throwIfCameraAborted(options.signal);
    let stream: MediaStream | null = null;
    try {
      stream = await acquireUserMedia(c, options.signal, options.timeoutMs ?? CAMERA_OPEN_TIMEOUT_MS);
      throwIfCameraAborted(options.signal);
      await applyFocus(stream);
      throwIfCameraAborted(options.signal);
      return stream;
    } catch (e) {
      if (stream) stopStream(stream);
      last = e;
      if (isPermissionFailure(e) || isTerminalCameraOpenFailure(e) || options.signal?.aborted) break;
    }
  }
  throw last instanceof Error ? last : new Error("Camera unavailable");
}

function acquireUserMedia(
  constraints: MediaStreamConstraints,
  signal: AbortSignal | undefined,
  timeoutMs: number,
): Promise<MediaStream> {
  throwIfCameraAborted(signal);
  const boundedTimeout = Number.isFinite(timeoutMs) ? Math.max(1, Math.trunc(timeoutMs)) : CAMERA_OPEN_TIMEOUT_MS;
  return new Promise((resolve, reject) => {
    let settled = false;
    const cleanup = () => {
      globalThis.clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
    };
    const fail = (error: unknown) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };
    const onAbort = () => fail(cameraAbortError("Camera opening was cancelled."));
    const timer = globalThis.setTimeout(() => {
      const error = new Error("Camera permission or device startup timed out. Try again or choose a file.");
      error.name = "TimeoutError";
      fail(error);
    }, boundedTimeout);
    signal?.addEventListener("abort", onAbort, { once: true });

    let pending: Promise<MediaStream>;
    try {
      pending = navigator.mediaDevices.getUserMedia(constraints);
    } catch (cause) {
      fail(cause);
      return;
    }
    void pending.then(
      (stream) => {
        if (settled || signal?.aborted) {
          stopStream(stream);
          if (!settled) fail(cameraAbortError("Camera opening was cancelled."));
          return;
        }
        settled = true;
        cleanup();
        resolve(stream);
      },
      (cause) => fail(cause),
    );
  });
}

export async function playCameraPreview(
  video: HTMLVideoElement,
  signal?: AbortSignal,
  timeoutMs = CAMERA_PLAY_TIMEOUT_MS,
): Promise<void> {
  throwIfCameraAborted(signal);
  const boundedTimeout = Number.isFinite(timeoutMs) ? Math.max(1, Math.trunc(timeoutMs)) : CAMERA_PLAY_TIMEOUT_MS;
  await new Promise<void>((resolve, reject) => {
    let settled = false;
    const cleanup = () => {
      globalThis.clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
    };
    const finish = (error?: unknown) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (error === undefined) resolve();
      else reject(error);
    };
    const onAbort = () => finish(cameraAbortError("Camera preview was cancelled."));
    const timer = globalThis.setTimeout(() => {
      const error = new Error("Camera preview did not start. Try again or choose a file.");
      error.name = "TimeoutError";
      finish(error);
    }, boundedTimeout);
    signal?.addEventListener("abort", onAbort, { once: true });
    let pending: Promise<void>;
    try {
      pending = video.play();
    } catch (cause) {
      finish(cause);
      return;
    }
    void pending.then(() => finish(), (cause) => finish(cause));
  });
}

function throwIfCameraAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw cameraAbortError("Camera opening was cancelled.");
}

function cameraAbortError(message: string): Error {
  if (typeof DOMException !== "undefined") return new DOMException(message, "AbortError");
  const error = new Error(message);
  error.name = "AbortError";
  return error;
}

function isTerminalCameraOpenFailure(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("name" in error)) return false;
  const name = (error as { name?: unknown }).name;
  return name === "AbortError" || name === "TimeoutError";
}

function isPermissionFailure(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  // Browser exceptions may cross realms, where `instanceof DOMException`
  // fails. The standardized name is the stable permission boundary.
  const name = "name" in error ? (error as { name?: unknown }).name : undefined;
  return name === "NotAllowedError" || name === "SecurityError";
}

export async function applyFocus(stream: MediaStream) {
  const track = stream.getVideoTracks()[0];
  if (!track) return;
  let caps: Record<string, unknown>;
  try {
    caps = (track.getCapabilities?.() ?? {}) as Record<string, unknown>;
  } catch {
    return;
  }
  const advanced: Record<string, unknown> = {};
  if (supportsContinuous(caps.focusMode)) advanced.focusMode = "continuous";
  if (supportsContinuous(caps.exposureMode)) advanced.exposureMode = "continuous";
  if (supportsContinuous(caps.whiteBalanceMode)) advanced.whiteBalanceMode = "continuous";
  if (Object.keys(advanced).length) {
    try {
      await settleWithin(
        track.applyConstraints({ advanced: [advanced] } as MediaTrackConstraints),
        FOCUS_SETUP_TIMEOUT_MS,
      );
    } catch {
      /* device refused */
    }
  }
}

function supportsContinuous(value: unknown): boolean {
  return Array.isArray(value) && value.includes("continuous");
}

function settleWithin(promise: Promise<unknown>, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    let finished = false;
    const finish = (applied: boolean) => {
      if (finished) return;
      finished = true;
      globalThis.clearTimeout(timer);
      resolve(applied);
    };
    const timer = globalThis.setTimeout(() => finish(false), timeoutMs);
    void promise.then(() => finish(true), () => finish(false));
  });
}

export async function setTorch(stream: MediaStream, on: boolean) {
  try {
    const track = stream.getVideoTracks()[0];
    if (!track) return false;
    const caps = (track.getCapabilities?.() ?? {}) as { torch?: boolean };
    if (!caps.torch) return false;
    const applied = await settleWithin(
      track.applyConstraints({
        advanced: [{ torch: on } as MediaTrackConstraintSet],
      }),
      FOCUS_SETUP_TIMEOUT_MS,
    );
    if (!applied) stopStream(stream);
    return applied;
  } catch {
    stopStream(stream);
    return false;
  }
}

function stopStream(stream: MediaStream): void {
  try {
    stream.getTracks().forEach((track) => track.stop());
  } catch {
    // The source may already have ended; the operation still fails closed.
  }
}

export function torchAvailable(stream: MediaStream | null) {
  try {
    const track = stream?.getVideoTracks()[0];
    const caps = (track?.getCapabilities?.() ?? {}) as { torch?: boolean };
    return !!caps.torch;
  } catch {
    return false;
  }
}

export function startClip(stream: MediaStream): ClipHandle {
  if (typeof MediaRecorder === "undefined") {
    throw new Error("Video recording is not supported in this browser. Choose a video instead.");
  }

  // Let the browser select its native container and codec. This is more reliable
  // across Safari/iOS (usually MP4) and Chromium/Firefox (usually WebM).
  const rec = new MediaRecorder(stream);
  const chunks: BlobPart[] = [];
  const maxBytes = 100 * 1024 * 1024;
  let recordedBytes = 0;
  let recordedMime = rec.mimeType;
  let cancelled = false;
  let settled = false;
  let stopRequested = false;
  let stopTimer: ReturnType<typeof globalThis.setTimeout> | null = null;
  let resolveDone!: (blob: Blob) => void;
  let rejectDone!: (error: Error) => void;
  const done = new Promise<Blob>((resolve, reject) => {
    resolveDone = resolve;
    rejectDone = reject;
  });
  // Recorder errors can arrive before the UI calls stop(). Mark the promise as
  // observed immediately while preserving its rejected state for stop().
  void done.catch(() => undefined);

  const clearStopTimer = () => {
    if (stopTimer === null) return;
    globalThis.clearTimeout(stopTimer);
    stopTimer = null;
  };
  const settleError = (error: Error) => {
    if (settled) return;
    settled = true;
    chunks.length = 0;
    clearStopTimer();
    rejectDone(error);
  };
  const settleBlob = () => {
    if (settled) return;
    let blob: Blob;
    try {
      blob = new Blob(cancelled ? [] : chunks, { type: recordedMime || "video/webm" });
    } catch (cause) {
      settleError(cause instanceof Error ? cause : new Error("Could not finalize video recording."));
      return;
    }
    settled = true;
    chunks.length = 0;
    clearStopTimer();
    resolveDone(blob);
  };
  const stopRecorderQuietly = () => {
    try {
      if (rec.state !== "inactive") rec.stop();
    } catch {
      // A concurrent track-ending transition may have already stopped it.
    }
  };
  const requestStop = () => {
    if (settled || stopRequested) return;
    stopRequested = true;
    stopTimer = globalThis.setTimeout(() => {
      stopTimer = null;
      stopRecorderQuietly();
      settleError(new Error("Video recorder did not finish stopping. Try a shorter clip."));
    }, 5_000);
    try {
      if (rec.state !== "inactive") rec.stop();
    } catch (cause) {
      settleError(cause instanceof Error ? cause : new Error("Could not stop video recording."));
    }
  };

  rec.ondataavailable = (e) => {
    if (!settled && !cancelled && e.data.size) {
      recordedBytes += e.data.size;
      if (recordedBytes > maxBytes) {
        cancelled = true;
        settleError(new Error("Recording is too large. Keep clips under 100 MB."));
        stopRecorderQuietly();
        return;
      }
      recordedMime ||= e.data.type;
      chunks.push(e.data);
    }
  };
  rec.onerror = () => {
    settleError(new Error("Video recording failed."));
    stopRecorderQuietly();
  };
  rec.onstop = () => {
    settleBlob();
  };
  rec.start(200);

  return {
    stop: () => {
      requestStop();
      return done;
    },
    cancel: () => {
      if (cancelled) return;
      cancelled = true;
      chunks.length = 0;
      settleError(new DOMException("Recording cancelled.", "AbortError"));
      stopRecorderQuietly();
    },
  };
}
