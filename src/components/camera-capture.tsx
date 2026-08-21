import { Camera, Flashlight, ImagePlus, SwitchCamera, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  openRopeCamera,
  setTorch,
  startClip,
  torchAvailable,
  type ClipHandle,
} from "@/lib/camera/stream";
import { pickBest, scoreFrame, type FrameQuality } from "@/lib/camera/quality";
import {
  compressToJpeg,
  extractVideoFrames,
  toImageData,
  validateMediaFile,
} from "@/lib/media";
import { observeFrame } from "@/lib/ml/detect";
import type { FrameObservation } from "@/lib/ml/types";
import { cn } from "@/lib/utils";

export type CaptureResult = {
  preview: string;
  previewObservation: FrameObservation;
  jpegs: string[];
  observations: FrameObservation[];
  kind: "photo" | "video";
  quality: FrameQuality;
};

type Guide = "torso" | "back" | "hands" | "legs";

export function CameraCapture({
  onCapture,
  disabled = false,
}: {
  onCapture: (c: CaptureResult) => void;
  disabled?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const clipRef = useRef<ClipHandle | null>(null);
  const recordTimerRef = useRef<number | null>(null);
  const cameraRequestRef = useRef(0);
  const mediaOperationRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;
  const [live, setLive] = useState(false);
  const [facing, setFacing] = useState<"user" | "environment">("environment");
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [torch, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [guide, setGuide] = useState<Guide>("torso");
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      mediaOperationRef.current?.abort();
      cameraRequestRef.current += 1;
      if (recordTimerRef.current !== null) {
        window.clearTimeout(recordTimerRef.current);
        recordTimerRef.current = null;
      }
      clipRef.current?.cancel();
      clipRef.current = null;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!disabled) return;
    mediaOperationRef.current?.abort();
    cameraRequestRef.current += 1;
    if (recordTimerRef.current !== null) {
      window.clearTimeout(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    clipRef.current?.cancel();
    clipRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    setRecording(false);
    setLive(false);
    setTorchOn(false);
    setHasTorch(false);
    setBusy(false);
  }, [disabled]);

  function clearRecordTimer() {
    if (recordTimerRef.current !== null) {
      window.clearTimeout(recordTimerRef.current);
      recordTimerRef.current = null;
    }
  }

  function beginMediaOperation(): AbortSignal {
    mediaOperationRef.current?.abort();
    const controller = new AbortController();
    mediaOperationRef.current = controller;
    return controller.signal;
  }

  async function startLive(next: "user" | "environment" = facing) {
    if (disabledRef.current) return;
    setError(null);
    stopLive();
    const request = ++cameraRequestRef.current;
    let openedStream: MediaStream | null = null;
    setBusy(true);
    try {
      const stream = await openRopeCamera(next);
      openedStream = stream;
      if (!mountedRef.current || request !== cameraRequestRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      setHasTorch(torchAvailable(stream));
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      } else {
        throw new Error("Camera view is unavailable.");
      }
      setLive(true);
      setFacing(next);
      stream.getVideoTracks()[0]?.addEventListener(
        "ended",
        () => {
          if (streamRef.current === stream) stopLive();
        },
        { once: true },
      );
    } catch (cause) {
      openedStream?.getTracks().forEach((track) => track.stop());
      if (streamRef.current === openedStream) {
        streamRef.current = null;
        if (videoRef.current?.srcObject === openedStream) {
          videoRef.current.pause();
          videoRef.current.srcObject = null;
        }
      }
      if (mountedRef.current && request === cameraRequestRef.current) {
        setLive(false);
        setHasTorch(false);
        setTorchOn(false);
        setError(cameraErrorMessage(cause));
      }
    } finally {
      if (mountedRef.current && request === cameraRequestRef.current) setBusy(false);
    }
  }

  function stopLive() {
    cameraRequestRef.current += 1;
    mediaOperationRef.current?.abort();
    clearRecordTimer();
    clipRef.current?.cancel();
    clipRef.current = null;
    setRecording(false);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    setLive(false);
    setTorchOn(false);
    setHasTorch(false);
  }

  async function emitFromMedia(
    kind: "photo" | "video",
    jpegs: string[],
    observations: FrameObservation[],
    qualities: FrameQuality[],
    previewObservation = observations[0],
  ) {
    if (!mountedRef.current || disabledRef.current) return;
    if (!jpegs.length || !observations.length) throw new Error("No readable frame was captured.");
    const quality =
      [...qualities].sort((a, b) => b.score - a.score)[0] ??
      ({ sharpness: 0, exposure: 0, ropeHint: 0, score: 0, notes: ["No frame"] } satisfies FrameQuality);
    setHint(quality.notes[0] ?? `Sharpness ${Math.round(quality.sharpness * 100)}`);
    onCapture({
      preview: jpegs[0] ?? "",
      previewObservation: previewObservation!,
      jpegs,
      observations,
      kind,
      quality,
    });
  }

  async function snapBurst() {
    const v = videoRef.current;
    if (!v || v.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !v.videoWidth) {
      setError("The camera is not ready yet.");
      return;
    }
    setBusy(true);
    setError(null);
    const signal = beginMediaOperation();
    try {
      const frames: { jpeg: string; imageData: ImageData }[] = [];
      for (let i = 0; i < 3; i++) {
        signal.throwIfAborted();
        frames.push({
          jpeg: await compressToJpeg(v, 768, 0.74),
          imageData: await toImageData(v, 240),
        });
        await new Promise((r) => setTimeout(r, 90));
      }
      const observed = frames.map((frame) => ({ frame, observation: observeFrame(frame.imageData) }));
      const best = pickBest(
        observed.map(({ frame, observation }) => ({
          data: frame.imageData,
          item: { ...frame, observation },
          neck: observation.neckRope,
          paleness: observation.paleness,
        })),
        1,
      );
      const chosen = best[0] ?? { ...frames[0]!, observation: observed[0]!.observation };
      signal.throwIfAborted();
      await emitFromMedia(
        "photo",
        [chosen.jpeg],
        [chosen.observation],
        [scoreFrame(chosen.imageData)],
      );
    } catch (cause) {
      if (!(cause instanceof DOMException && cause.name === "AbortError")) {
        setError(cause instanceof Error ? cause.message : "Could not capture a photo.");
      }
    } finally {
      if (mountedRef.current) setBusy(false);
    }
  }

  async function toggleRecord() {
    const stream = streamRef.current;
    if (!stream) return;
    if (!recording) {
      try {
        setError(null);
        clipRef.current = startClip(stream);
        setRecording(true);
        recordTimerRef.current = window.setTimeout(() => {
          recordTimerRef.current = null;
          if (clipRef.current) void finishRecord();
        }, 7000);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not start recording.");
      }
      return;
    }
    await finishRecord();
  }

  async function finishRecord() {
    clearRecordTimer();
    const handle = clipRef.current;
    clipRef.current = null;
    setRecording(false);
    if (!handle) return;
    setBusy(true);
    const signal = beginMediaOperation();
    try {
      const blob = await handle.stop();
      signal.throwIfAborted();
      await ingestVideo(blob, signal);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not record");
    } finally {
      if (mountedRef.current) setBusy(false);
    }
  }

  async function ingestVideo(file: Blob, signal = beginMediaOperation()) {
    if (!file.size) throw new Error("The video is empty.");
    if (file.size > 100 * 1024 * 1024) {
      throw new Error("Video is too large. Choose one under 100 MB.");
    }
    const frames = await extractVideoFrames(file, 6, signal);
    let prev: Uint8ClampedArray | undefined;
    const observed = frames.map((f) => {
      const obs = observeFrame(f.imageData, prev);
      prev = f.imageData.data;
      return { f, obs };
    });
    const ranked = pickBest(
      observed.map((x) => ({
        data: x.f.imageData,
        item: x,
        neck: x.obs.neckRope,
        paleness: x.obs.paleness,
      })),
      3,
    );
    // Safety trends must stay chronological. Frame ranking is only for the
    // three stills sent to the optional remote coach.
    const observations = observed.map((x) => x.obs);
    signal.throwIfAborted();
    await emitFromMedia(
      "video",
      ranked.map((x) => x.f.jpeg),
      observations,
      ranked.map((x) => scoreFrame(x.f.imageData)),
      ranked[0]?.obs ?? observations[0],
    );
  }

  async function onFile(file: File, kind: "photo" | "video") {
    setBusy(true);
    setError(null);
    const signal = beginMediaOperation();
    try {
      const actualKind = file.type.startsWith("video/") ? "video" : kind;
      validateMediaFile(file, actualKind);
      if (actualKind === "video") {
        await ingestVideo(file, signal);
      } else {
        const jpeg = await compressToJpeg(file, 768, 0.74);
        signal.throwIfAborted();
        const imageData = await toImageData(file, 240);
        signal.throwIfAborted();
        await emitFromMedia("photo", [jpeg], [observeFrame(imageData)], [scoreFrame(imageData)]);
      }
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) {
        setError(e instanceof Error ? e.message : "Could not read media");
      }
    } finally {
      if (mountedRef.current) setBusy(false);
    }
  }

  async function toggleTorch() {
    const stream = streamRef.current;
    if (!stream) return;
    const next = !torch;
    const ok = await setTorch(stream, next);
    setTorchOn(ok ? next : false);
    if (!ok) setError("Torch is not available on this camera.");
  }

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-lg bg-elevated">
        <video
          ref={videoRef}
          className={cn("aspect-[3/4] w-full object-cover", !live && "hidden")}
          playsInline
          muted
        />
        {live && <GuideOverlay guide={guide} />}
        {!live && (
          <div className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 bg-elevated">
            <div className="absolute inset-0 bg-bg/70" />
            <Camera className="relative size-8 text-muted" />
            <p className="relative px-6 text-center text-sm text-muted">
              Photograph or record her in the tie. The camera skill picks the sharpest frame and
              prefers close wraps over a full-room pose.
            </p>
          </div>
        )}
        {recording && (
          <span className="absolute right-3 top-3 rounded-full bg-danger px-2 py-0.5 text-[11px] uppercase tracking-wide text-danger-fg">
            Rec
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {(["torso", "back", "hands", "legs"] as Guide[]).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGuide(g)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-wide",
              guide === g ? "border-accent text-fg" : "border-border text-muted",
            )}
          >
            {g}
          </button>
        ))}
      </div>
      {hint && (
        <p className="text-xs text-muted" aria-live="polite">
          {hint}
        </p>
      )}
      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        <label
          className={cn(
            "inline-flex h-11 items-center justify-center gap-2 rounded-md bg-accent text-sm font-medium text-accent-fg",
            busy || disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          )}
        >
          <ImagePlus className="size-4" />
          Photo
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={busy || disabled}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onFile(f, "photo");
              e.target.value = "";
            }}
          />
        </label>
        <label
          className={cn(
            "inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-elevated text-sm font-medium",
            busy || disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          )}
        >
          <Video className="size-4" />
          Video
          <input
            type="file"
            accept="video/*"
            className="sr-only"
            disabled={busy || disabled}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onFile(f, "video");
              e.target.value = "";
            }}
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        {live ? (
          <>
            <Button className="flex-1" onClick={() => void snapBurst()} disabled={busy || disabled}>
              Burst still
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => void toggleRecord()}
              disabled={busy || disabled}
            >
              {recording ? "Stop clip" : "Record 7s"}
            </Button>
            {hasTorch && (
              <Button
                variant={torch ? "default" : "secondary"}
                size="icon"
                onClick={() => void toggleTorch()}
                aria-label="Torch"
                disabled={busy || recording || disabled}
              >
                <Flashlight />
              </Button>
            )}
            <Button
              variant="secondary"
              size="icon"
              onClick={() => void startLive(facing === "user" ? "environment" : "user")}
              aria-label="Flip camera"
              disabled={busy || recording || disabled}
            >
              <SwitchCamera />
            </Button>
            <Button variant="ghost" onClick={stopLive} disabled={disabled}>
              Close
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => void startLive()}
            disabled={busy || disabled}
          >
            Open live camera
          </Button>
        )}
      </div>
      {busy && (
        <p className="text-xs text-muted" role="status">
          Processing camera frames…
        </p>
      )}
    </div>
  );
}

function cameraErrorMessage(cause: unknown): string {
  if (typeof DOMException !== "undefined" && cause instanceof DOMException) {
    if (cause.name === "NotAllowedError" || cause.name === "SecurityError") {
      return "Camera access was blocked. Allow camera permission or choose a photo or video.";
    }
    if (cause.name === "NotFoundError" || cause.name === "OverconstrainedError") {
      return "No compatible camera was found. Choose a photo or video instead.";
    }
    if (cause.name === "NotReadableError" || cause.name === "AbortError") {
      return "The camera is busy in another app. Close it there and try again.";
    }
  }
  return cause instanceof Error ? cause.message : "Could not open the camera.";
}

function GuideOverlay({ guide }: { guide: Guide }) {
  const box =
    guide === "hands"
      ? "inset-[58%_12%_8%_12%]"
      : guide === "legs"
        ? "inset-[48%_18%_6%_18%]"
        : guide === "back"
          ? "inset-[10%_16%_18%_16%]"
          : "inset-[12%_14%_22%_14%]";
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className={cn("absolute rounded-md border border-accent/70", box)} />
      <p className="absolute bottom-2 left-0 right-0 text-center text-[11px] uppercase tracking-wide text-accent">
        Fill this frame with rope
      </p>
    </div>
  );
}
