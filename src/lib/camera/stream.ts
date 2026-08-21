type Facing = "user" | "environment";

export async function openRopeCamera(facing: Facing): Promise<MediaStream> {
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
    try {
      const stream = await navigator.mediaDevices.getUserMedia(c);
      await applyFocus(stream);
      return stream;
    } catch (e) {
      last = e;
    }
  }
  throw last instanceof Error ? last : new Error("Camera unavailable");
}

export async function applyFocus(stream: MediaStream) {
  const track = stream.getVideoTracks()[0];
  if (!track) return;
  const caps = (track.getCapabilities?.() ?? {}) as Record<string, unknown>;
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
  const caps = (track.getCapabilities?.() ?? {}) as { torch?: boolean };
  if (!caps.torch) return false;
  try {
    await track.applyConstraints({
      advanced: [{ torch: on } as MediaTrackConstraintSet],
    });
    return true;
  } catch {
    return false;
  }
}

export function torchAvailable(stream: MediaStream | null) {
  const track = stream?.getVideoTracks()[0];
  const caps = (track?.getCapabilities?.() ?? {}) as { torch?: boolean };
  return !!caps.torch;
}

export function startClip(stream: MediaStream): {
  stop: () => Promise<Blob>;
} {
  const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : MediaRecorder.isTypeSupported("video/webm")
      ? "video/webm"
      : "";
  const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
  const chunks: BlobPart[] = [];
  rec.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };
  rec.start(200);
  return {
    stop: () =>
      new Promise((resolve, reject) => {
        rec.onerror = () => reject(new Error("Record failed"));
        rec.onstop = () => resolve(new Blob(chunks, { type: rec.mimeType || "video/webm" }));
        rec.stop();
      }),
  };
}
