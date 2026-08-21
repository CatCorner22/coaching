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
        width: { ideal: 1920 },
        height: { ideal: 1080 },
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
  let resolveDone!: (blob: Blob) => void;
  let rejectDone!: (error: Error) => void;
  const done = new Promise<Blob>((resolve, reject) => {
    resolveDone = resolve;
    rejectDone = reject;
  });

  rec.ondataavailable = (e) => {
    if (!cancelled && e.data.size) {
      recordedBytes += e.data.size;
      if (recordedBytes > maxBytes) {
        cancelled = true;
        chunks.length = 0;
        if (!settled) {
          settled = true;
          rejectDone(new Error("Recording is too large. Keep clips under 100 MB."));
        }
        if (rec.state !== "inactive") rec.stop();
        return;
      }
      recordedMime ||= e.data.type;
      chunks.push(e.data);
    }
  };
  rec.onerror = () => {
    if (settled) return;
    settled = true;
    rejectDone(new Error("Video recording failed."));
  };
  rec.onstop = () => {
    if (settled) return;
    settled = true;
    resolveDone(new Blob(cancelled ? [] : chunks, { type: recordedMime || "video/webm" }));
  };
  rec.start(200);

  return {
    stop: () => {
      if (rec.state !== "inactive") rec.stop();
      return done;
    },
    cancel: () => {
      cancelled = true;
      chunks.length = 0;
      void done.catch(() => undefined);
      if (rec.state !== "inactive") rec.stop();
    },
  };
}
