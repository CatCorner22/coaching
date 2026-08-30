import { MAX_VIDEO_BYTES } from "@/lib/media";

type Facing = "user" | "environment";
const FOCUS_SETUP_TIMEOUT_MS = 1_000;
const CAMERA_OPEN_TIMEOUT_MS = 20_000;
const CAMERA_PLAY_TIMEOUT_MS = 5_000;
const CAMERA_PERMISSION_QUERY_TIMEOUT_MS = 750;

export type CameraCapabilityReport = {
  secureContext: "secure" | "insecure" | "unknown";
  cameraPolicy: "allowed" | "blocked" | "unknown";
  liveCameraApi: "detected" | "unavailable";
  clipRecordingApi: "detected" | "unavailable";
  permission: "granted" | "prompt" | "denied" | "unknown";
  /** A passive preflight never acquires a stream. */
  cameraOpened: false;
};

export type ClipHandle = {
  stop: () => Promise<Blob>;
  cancel: () => void;
};

/**
 * Inspect browser-exposed camera layers without prompting, enumerating devices,
 * constructing a recorder, or acquiring a stream. This is deliberately not a
 * hardware, codec, privacy, consent, or safety test.
 */
export async function inspectCameraCapabilities(
  options: { permissionTimeoutMs?: number } = {},
): Promise<CameraCapabilityReport> {
  return {
    secureContext: cameraSecureContextState(),
    cameraPolicy: inspectCameraPolicy(),
    liveCameraApi: hasLiveCameraApi() ? "detected" : "unavailable",
    clipRecordingApi:
      typeof globalThis.MediaRecorder === "function" ? "detected" : "unavailable",
    permission: await inspectCameraPermission(
      options.permissionTimeoutMs ?? CAMERA_PERMISSION_QUERY_TIMEOUT_MS,
    ),
    cameraOpened: false,
  };
}

function cameraSecureContextState(): CameraCapabilityReport["secureContext"] {
  if (typeof globalThis.isSecureContext !== "boolean") return "unknown";
  return globalThis.isSecureContext ? "secure" : "insecure";
}

function hasLiveCameraApi(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.mediaDevices?.getUserMedia === "function"
  );
}

function inspectCameraPolicy(): CameraCapabilityReport["cameraPolicy"] {
  if (typeof document === "undefined") return "unknown";
  const policyDocument = document as Document & {
    permissionsPolicy?: { allowsFeature?: (feature: string) => unknown };
    featurePolicy?: { allowsFeature?: (feature: string) => unknown };
  };
  const policy = policyDocument.permissionsPolicy ?? policyDocument.featurePolicy;
  if (typeof policy?.allowsFeature !== "function") return "unknown";
  try {
    const result = policy.allowsFeature("camera");
    return result === true ? "allowed" : result === false ? "blocked" : "unknown";
  } catch {
    return "unknown";
  }
}

async function inspectCameraPermission(
  timeoutMs: number,
): Promise<CameraCapabilityReport["permission"]> {
  if (typeof navigator === "undefined" || typeof navigator.permissions?.query !== "function") {
    return "unknown";
  }
  const boundedTimeout = Number.isFinite(timeoutMs)
    ? Math.max(1, Math.min(5_000, Math.trunc(timeoutMs)))
    : CAMERA_PERMISSION_QUERY_TIMEOUT_MS;
  const timedOut = Symbol("camera-permission-timeout");
  let timer: ReturnType<typeof globalThis.setTimeout> | undefined;
  try {
    const query = Promise.resolve().then(() =>
      navigator.permissions.query({ name: "camera" as PermissionName }),
    );
    const result = await Promise.race([
      query,
      new Promise<typeof timedOut>((resolve) => {
        timer = globalThis.setTimeout(() => resolve(timedOut), boundedTimeout);
      }),
    ]);
    if (result === timedOut) return "unknown";
    return result.state === "granted" || result.state === "prompt" || result.state === "denied"
      ? result.state
      : "unknown";
  } catch {
    return "unknown";
  } finally {
    if (timer !== undefined) globalThis.clearTimeout(timer);
  }
}

export async function openRopeCamera(
  facing: Facing,
  options: { signal?: AbortSignal; timeoutMs?: number } = {},
): Promise<MediaStream> {
  if (cameraSecureContextState() === "insecure") {
    throw new Error("Live camera requires HTTPS or localhost. Open this app in a secure context.");
  }
  if (!hasLiveCameraApi()) {
    throw new Error("Live camera is not supported in this browser.");
  }
  const tries: MediaStreamConstraints[] = [
    {
      audio: false,
      video: {
        facingMode: { ideal: facing },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30 },
      },
    },
    {
      audio: false,
      video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } },
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

/**
 * Lamps are slow. A one-second budget shared with focus setup made a phone
 * that simply takes its time look like a failure.
 */
export const TORCH_TIMEOUT_MS = 5_000;

/**
 * Toggle the torch. Resolves false when the lamp state could not be confirmed.
 *
 * A failure used to stop the whole stream, so a slow-but-successful lamp on a
 * mid-range phone closed a working camera mid-session. Ending the capture is a
 * heavier consequence than an unconfirmed light: leave the camera up, drive
 * the lamp back off in the background, and let the caller report the toggle
 * failed.
 */
export async function setTorch(stream: MediaStream, on: boolean) {
  try {
    const track = stream.getVideoTracks()[0];
    if (!track) return false;
    const caps = (track.getCapabilities?.() ?? {}) as { torch?: boolean };
    if (!caps.torch) return false;
    const pending = track.applyConstraints({
      advanced: [{ torch: on } as MediaTrackConstraintSet],
    });
    const applied = await settleWithin(pending, TORCH_TIMEOUT_MS);
    if (!applied && on) void extinguishTorch(track, pending);
    return applied;
  } catch {
    return false;
  }
}

/** Best-effort: put the lamp back to a known-off state after an unclear on. */
async function extinguishTorch(track: MediaStreamTrack, pending: Promise<unknown>) {
  try {
    await pending.catch(() => undefined);
    if (track.readyState === "ended") return;
    await settleWithin(
      track.applyConstraints({ advanced: [{ torch: false } as MediaTrackConstraintSet] }),
      TORCH_TIMEOUT_MS,
    );
  } catch {
    // The lamp is the device's to own from here; the camera still works.
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

export type CameraZoomRange = { min: number; max: number; step: number };

export function zoomRange(stream: MediaStream | null): CameraZoomRange | null {
  try {
    const track = stream?.getVideoTracks()[0];
    const caps = (track?.getCapabilities?.() ?? {}) as {
      zoom?: { min?: number; max?: number; step?: number } | number[];
    };
    const zoom = caps.zoom;
    if (!zoom) return null;
    if (Array.isArray(zoom) && zoom.length >= 2) {
      const min = Number(zoom[0]);
      const max = Number(zoom[zoom.length - 1]);
      if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return null;
      return { min, max, step: 0.1 };
    }
    if (typeof zoom === "object" && zoom !== null && "min" in zoom && "max" in zoom) {
      const min = Number(zoom.min);
      const max = Number(zoom.max);
      const step = Number(zoom.step ?? 0.1);
      if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return null;
      return { min, max, step: Number.isFinite(step) && step > 0 ? step : 0.1 };
    }
    return null;
  } catch {
    return null;
  }
}

export async function applyZoom(stream: MediaStream, zoom: number): Promise<boolean> {
  const range = zoomRange(stream);
  if (!range) return false;
  const clamped = Math.min(range.max, Math.max(range.min, zoom));
  try {
    const track = stream.getVideoTracks()[0];
    if (!track) return false;
    return await settleWithin(
      track.applyConstraints({ advanced: [{ zoom: clamped } as MediaTrackConstraintSet] }),
      FOCUS_SETUP_TIMEOUT_MS,
    );
  } catch {
    return false;
  }
}

export const CLIP_DURATION_MS = 7_000;
export const BURST_FRAME_COUNT = 5;
export const BURST_KEEP = 3;

/**
 * Wait for a newly presented video frame so a burst does not encode the same
 * pixels five times. Times out so a static or synthetic stream cannot hang.
 */
export function waitForNextVideoFrame(video: HTMLVideoElement, timeoutMs = 180): Promise<void> {
  const budget = Number.isFinite(timeoutMs) ? Math.max(16, Math.min(1_000, timeoutMs)) : 180;
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    const withRvfc = video as HTMLVideoElement & {
      requestVideoFrameCallback?: (cb: () => void) => number;
    };
    if (typeof withRvfc.requestVideoFrameCallback === "function") {
      withRvfc.requestVideoFrameCallback(() => finish());
    } else if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => finish());
      });
    }
    globalThis.setTimeout(finish, budget);
  });
}

export function startClip(stream: MediaStream): ClipHandle {
  if (typeof MediaRecorder === "undefined") {
    throw new Error("Video recording is not supported in this browser. Choose a video instead.");
  }

  // Let the browser select its native container and codec. This is more reliable
  // across Safari/iOS (usually MP4) and Chromium/Firefox (usually WebM).
  const rec = new MediaRecorder(stream);
  const chunks: BlobPart[] = [];
  // One source of truth with the import path's cap, so the recorder budget and
  // the file-size rejection can never drift apart.
  const maxBytes = MAX_VIDEO_BYTES;
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
