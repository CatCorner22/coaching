type Facing = "user" | "environment";

export type ClipHandle = {
  stop: () => Promise<Blob>;
  cancel: () => void;
};

export async function openRopeCamera(facing: Facing): Promise<MediaStream> {
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
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia(c);
      await applyFocus(stream);
      return stream;
    } catch (e) {
      stream?.getTracks().forEach((track) => track.stop());
      last = e;
      if (isPermissionFailure(e)) break;
    }
  }
  throw last instanceof Error ? last : new Error("Camera unavailable");
}

function isPermissionFailure(error: unknown): boolean {
  return (
    typeof DOMException !== "undefined" &&
    error instanceof DOMException &&
    (error.name === "NotAllowedError" || error.name === "SecurityError")
  );
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
  if ("focusMode" in caps) advanced.focusMode = "continuous";
  if ("exposureMode" in caps) advanced.exposureMode = "continuous";
  if ("whiteBalanceMode" in caps) advanced.whiteBalanceMode = "continuous";
  if (Object.keys(advanced).length) {
    try {
      await track.applyConstraints({ advanced: [advanced] } as MediaTrackConstraints);
    } catch {
      /* device refused */
    }
  }
}

export async function setTorch(stream: MediaStream, on: boolean) {
  const track = stream.getVideoTracks()[0];
  if (!track) return false;
  try {
    const caps = (track.getCapabilities?.() ?? {}) as { torch?: boolean };
    if (!caps.torch) return false;
    await track.applyConstraints({
      advanced: [{ torch: on } as MediaTrackConstraintSet],
    });
    return true;
  } catch {
    return false;
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
