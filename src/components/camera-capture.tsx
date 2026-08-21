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
  extractVideoFrames,
  processMediaFrame,
  validateMediaFile,
  validateMediaSignature,
} from "@/lib/media";
import { observeFrame } from "@/lib/ml/detect";
import type { FrameObservation } from "@/lib/ml/types";
import { cn } from "@/lib/utils";

export type CaptureResult = {
  preview: string;
  previewObservation: FrameObservation;
  jpegs: string[];
  frameLabels: string[];
  observations: FrameObservation[];
  kind: "photo" | "video";
  quality: FrameQuality;
  consent: MediaConsent;
};

export type MediaConsent = {
  adults: true;
  activity: true;
  recording: true;
  upload: true;
  output: true;
  confirmedAt: number;
};

type PermissionKey = "adults" | "activity" | "recording" | "upload" | "output";
type PendingVideoFrame = {
  id: string;
  jpeg: string;
  observation: FrameObservation;
  quality: FrameQuality;
};

const EMPTY_PERMISSIONS: Record<PermissionKey, boolean> = {
  adults: false,
  activity: false,
  recording: false,
  upload: false,
  output: false,
};
const BATCH_PERMISSION_MAX_AGE_MS = 60 * 60 * 1000;

type Guide = "torso" | "back" | "hands" | "legs";

export function CameraCapture({
  onCapture,
  onDiscard,
  disabled = false,
}: {
  onCapture: (c: CaptureResult) => void;
  onDiscard: () => void;
  disabled?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const clipRef = useRef<ClipHandle | null>(null);
  const recordTimerRef = useRef<number | null>(null);
  const recordStartedAtRef = useRef<number | null>(null);
  const cameraRequestRef = useRef(0);
  const mediaOperationRef = useRef<AbortController | null>(null);
  const permissionsRef = useRef(EMPTY_PERMISSIONS);
  const permissionConfirmedAtRef = useRef<number | null>(null);
  const permissionExpiryTimerRef = useRef<number | null>(null);
  const recordTransitionRef = useRef(false);
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
  const [permissions, setPermissions] = useState(EMPTY_PERMISSIONS);
  const [batchCommitted, setBatchCommitted] = useState(false);
  const [videoFrames, setVideoFrames] = useState<PendingVideoFrame[]>([]);
  const [selectedFrames, setSelectedFrames] = useState<number[]>([]);
  const permissionsReady = Object.values(permissions).every(Boolean);
  permissionsRef.current = permissions;

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
      if (permissionExpiryTimerRef.current !== null) {
        window.clearTimeout(permissionExpiryTimerRef.current);
        permissionExpiryTimerRef.current = null;
      }
      clipRef.current?.cancel();
      clipRef.current = null;
      recordStartedAtRef.current = null;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") stopLive();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
    // stopLive intentionally reads the latest refs and does not need resubscription.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    recordStartedAtRef.current = null;
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
    setVideoFrames([]);
    setSelectedFrames([]);
    setBatchCommitted(false);
    permissionsRef.current = EMPTY_PERMISSIONS;
    permissionConfirmedAtRef.current = null;
    setPermissions({ ...EMPTY_PERMISSIONS });
    if (permissionExpiryTimerRef.current !== null) {
      window.clearTimeout(permissionExpiryTimerRef.current);
      permissionExpiryTimerRef.current = null;
    }
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

  function updatePermission(key: PermissionKey, checked: boolean) {
    const wasReady = Object.values(permissionsRef.current).every(Boolean);
    const next = { ...permissionsRef.current, [key]: checked };
    const isReady = Object.values(next).every(Boolean);
    permissionsRef.current = next;
    setPermissions(next);
    if (isReady && !wasReady) {
      const confirmedAt = Date.now();
      permissionConfirmedAtRef.current = confirmedAt;
      if (permissionExpiryTimerRef.current !== null) {
        window.clearTimeout(permissionExpiryTimerRef.current);
      }
      permissionExpiryTimerRef.current = window.setTimeout(() => {
        permissionExpiryTimerRef.current = null;
        permissionConfirmedAtRef.current = null;
        permissionsRef.current = EMPTY_PERMISSIONS;
        setPermissions({ ...EMPTY_PERMISSIONS });
        setBatchCommitted(false);
        stopLive();
        setVideoFrames([]);
        setSelectedFrames([]);
        onDiscard();
        setHint("Batch permissions expired; the pending batch was discarded. Reconfirm all items.");
      }, BATCH_PERMISSION_MAX_AGE_MS);
    } else if (!isReady) {
      permissionConfirmedAtRef.current = null;
      if (permissionExpiryTimerRef.current !== null) {
        window.clearTimeout(permissionExpiryTimerRef.current);
        permissionExpiryTimerRef.current = null;
      }
    }
    if (!checked) {
      stopLive();
      setBatchCommitted(false);
      setVideoFrames([]);
      setSelectedFrames([]);
      onDiscard();
      setHint("Permission withdrawn; the pending batch was discarded.");
    }
  }

  function startNewBatch() {
    stopLive();
    if (permissionExpiryTimerRef.current !== null) {
      window.clearTimeout(permissionExpiryTimerRef.current);
      permissionExpiryTimerRef.current = null;
    }
    permissionConfirmedAtRef.current = null;
    permissionsRef.current = EMPTY_PERMISSIONS;
    setPermissions({ ...EMPTY_PERMISSIONS });
    setBatchCommitted(false);
    setVideoFrames([]);
    setSelectedFrames([]);
    onDiscard();
    setHint("Previous batch discarded. Confirm each item for the new batch.");
  }

  function confirmedAtForBatch(): number {
    const confirmedAt = permissionConfirmedAtRef.current;
    if (
      confirmedAt === null ||
      Date.now() - confirmedAt < 0 ||
      Date.now() - confirmedAt > BATCH_PERMISSION_MAX_AGE_MS
    ) {
      throw new Error("Batch permissions are no longer current. Reconfirm every item.");
    }
    return confirmedAt;
  }

  function hasCurrentBatchPermissions(): boolean {
    try {
      confirmedAtForBatch();
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Reconfirm every permission for this batch.");
      return false;
    }
  }

  async function startLive(next: "user" | "environment" = facing) {
    if (disabledRef.current || batchCommitted) return;
    if (!Object.values(permissionsRef.current).every(Boolean)) {
      setError("Confirm adult status and all four permissions before opening the camera.");
      return;
    }
    if (!hasCurrentBatchPermissions()) return;
    setError(null);
    stopLive();
    setVideoFrames([]);
    setSelectedFrames([]);
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
      if (
        !mountedRef.current ||
        disabledRef.current ||
        request !== cameraRequestRef.current ||
        streamRef.current !== stream ||
        videoRef.current?.srcObject !== stream
      ) {
        stream.getTracks().forEach((track) => track.stop());
        if (streamRef.current === stream) streamRef.current = null;
        if (videoRef.current?.srcObject === stream) {
          videoRef.current.pause();
          videoRef.current.srcObject = null;
        }
        return;
      }
      setLive(true);
      setFacing(next);
      const track = stream.getVideoTracks()[0];
      const closeInterruptedCamera = () => {
        if (streamRef.current === stream) {
          setError("Camera access was interrupted. Reconfirm the view before reopening.");
          stopLive();
        }
      };
      track?.addEventListener("ended", closeInterruptedCamera, { once: true });
      track?.addEventListener("mute", closeInterruptedCamera, { once: true });
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
    recordStartedAtRef.current = null;
    setRecording(false);
    const stream = streamRef.current;
    streamRef.current = null;
    stream?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    setLive(false);
    setTorchOn(false);
    setHasTorch(false);
    setBusy(false);
  }

  async function emitFromMedia(
    kind: "photo" | "video",
    jpegs: string[],
    observations: FrameObservation[],
    qualities: FrameQuality[],
    previewObservation = observations[0],
    frameLabels = jpegs.map((_, index) => `S${String(index + 1).padStart(2, "0")}`),
  ) {
    if (!mountedRef.current || disabledRef.current) return;
    if (!Object.values(permissionsRef.current).every(Boolean)) {
      throw new Error("Reconfirm adult status and all four permissions for this batch.");
    }
    const confirmedAt = confirmedAtForBatch();
    if (!jpegs.length || !observations.length) throw new Error("No readable frame was captured.");
    const quality =
      [...qualities].sort((a, b) => b.score - a.score)[0] ??
      ({ sharpness: 0, exposure: 0, ropeHint: 0, score: 0, notes: ["No frame"] } satisfies FrameQuality);
    setHint(quality.notes[0] ?? `Sharpness ${Math.round(quality.sharpness * 100)}`);
    onCapture({
      preview: jpegs[0] ?? "",
      previewObservation: previewObservation!,
      jpegs,
      frameLabels,
      observations,
      kind,
      quality,
      consent: {
        adults: true,
        activity: true,
        recording: true,
        upload: true,
        output: true,
        confirmedAt,
      },
    });
    stopLive();
    setBatchCommitted(true);
    setVideoFrames([]);
    setSelectedFrames([]);
  }

  async function snapBurst() {
    if (recording || batchCommitted) return;
    if (!hasCurrentBatchPermissions()) return;
    const v = videoRef.current;
    if (!v || v.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !v.videoWidth) {
      setError("The camera is not ready yet.");
      return;
    }
    setVideoFrames([]);
    setSelectedFrames([]);
    setBusy(true);
    setError(null);
    const signal = beginMediaOperation();
    try {
      const frames: { jpeg: string; imageData: ImageData }[] = [];
      for (let i = 0; i < 3; i++) {
        signal.throwIfAborted();
        frames.push(await processMediaFrame(v, 768, 240, 0.74));
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
    if (recordTransitionRef.current) return;
    if (batchCommitted) return;
    const stream = streamRef.current;
    if (!stream) return;
    if (!clipRef.current) {
      if (!hasCurrentBatchPermissions()) return;
      try {
        setError(null);
        setVideoFrames([]);
        setSelectedFrames([]);
        const handle = startClip(stream);
        if (streamRef.current !== stream || disabledRef.current) {
          handle.cancel();
          return;
        }
        clipRef.current = handle;
        recordStartedAtRef.current = Date.now();
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
    if (recordTransitionRef.current) return;
    recordTransitionRef.current = true;
    clearRecordTimer();
    const handle = clipRef.current;
    const startedAt = recordStartedAtRef.current;
    clipRef.current = null;
    recordStartedAtRef.current = null;
    setRecording(false);
    if (!handle) {
      recordTransitionRef.current = false;
      return;
    }
    setBusy(true);
    const signal = beginMediaOperation();
    try {
      const blob = await handle.stop();
      signal.throwIfAborted();
      const durationHint = startedAt === null ? undefined : Math.max(0.05, (Date.now() - startedAt) / 1000);
      await ingestVideo(blob, signal, durationHint);
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) {
        setError(e instanceof Error ? e.message : "Could not record");
      }
    } finally {
      recordTransitionRef.current = false;
      if (mountedRef.current) setBusy(false);
    }
  }

  async function ingestVideo(file: Blob, signal = beginMediaOperation(), durationHintSeconds?: number) {
    if (!file.size) throw new Error("The video is empty.");
    if (file.size > 100 * 1024 * 1024) {
      throw new Error("Video is too large. Choose one under 100 MB.");
    }
    const frames = await extractVideoFrames(file, 6, signal, durationHintSeconds);
    let prev: Uint8ClampedArray | undefined;
    const observed = frames.map((f) => {
      const obs = observeFrame(f.imageData, prev);
      prev = f.imageData.data;
      return { f, obs };
    });
    signal.throwIfAborted();
    if (!mountedRef.current || disabledRef.current) return;
    setVideoFrames(
      observed.map((x, index) => ({
        id: `F${String(index + 1).padStart(2, "0")}`,
        jpeg: x.f.jpeg,
        observation: x.obs,
        quality: scoreFrame(x.f.imageData),
      })),
    );
    setSelectedFrames([]);
    setHint("Choose one to three labeled stills from the clip. Nothing is analyzed remotely until you confirm.");
  }

  async function useSelectedVideoFrames() {
    if (!hasCurrentBatchPermissions()) return;
    const indices = [...selectedFrames].sort((a, b) => a - b).slice(0, 3);
    const chosen = indices.map((index) => videoFrames[index]).filter(Boolean) as PendingVideoFrame[];
    if (!chosen.length) {
      setError("Select at least one still from the clip.");
      return;
    }
    setError(null);
    await emitFromMedia(
      "video",
      chosen.map((frame) => frame.jpeg),
      chosen.map((frame) => frame.observation),
      chosen.map((frame) => frame.quality),
      chosen[0]?.observation,
      chosen.map((frame) => frame.id),
    );
  }

  function toggleSelectedFrame(index: number) {
    setSelectedFrames((current) => {
      if (current.includes(index)) return current.filter((value) => value !== index);
      if (current.length >= 3) return current;
      return [...current, index];
    });
  }

  async function onFile(file: File, kind: "photo" | "video") {
    if (recording || batchCommitted) return;
    if (!hasCurrentBatchPermissions()) return;
    setVideoFrames([]);
    setSelectedFrames([]);
    setBusy(true);
    setError(null);
    const signal = beginMediaOperation();
    try {
      const actualKind = file.type.startsWith("video/") ? "video" : kind;
      validateMediaFile(file, actualKind);
      await validateMediaSignature(file, actualKind);
      signal.throwIfAborted();
      if (actualKind === "video") {
        await ingestVideo(file, signal);
      } else {
        const { jpeg, imageData } = await processMediaFrame(file, 768, 240, 0.74);
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
    const request = cameraRequestRef.current;
    const next = !torch;
    const ok = await setTorch(stream, next);
    if (
      !mountedRef.current ||
      disabledRef.current ||
      request !== cameraRequestRef.current ||
      streamRef.current !== stream
    ) return;
    setTorchOn(ok ? next : false);
    if (!ok) setError("Torch is not available on this camera.");
  }

  return (
    <div className="space-y-3">
      <fieldset className="rounded-lg border border-border bg-surface p-3">
        <legend className="px-1 text-xs uppercase tracking-wide text-subtle">Permission for this batch</legend>
        <p className="mb-2 text-xs leading-relaxed text-muted">
          Confirm legal-adult status plus all four permissions separately for each batch. Prefer
          equipment-only or clothed, non-identifying stills; exclude faces, nudity, tattoos,
          screens, mail, and room details when possible.
        </p>
        <div className="space-y-2 text-xs text-fg">
          <PermissionCheck
            checked={permissions.adults}
            onChange={(checked) => updatePermission("adults", checked)}
            label="I confirm every depicted person is a legal adult. The app cannot infer age from media."
          />
          <PermissionCheck
            checked={permissions.activity}
            onChange={(checked) => updatePermission("activity", checked)}
            label="Every depicted adult currently agrees to the activity."
          />
          <PermissionCheck
            checked={permissions.recording}
            onChange={(checked) => updatePermission("recording", checked)}
            label="Every depicted adult currently agrees to this photo or video recording."
          />
          <PermissionCheck
            checked={permissions.upload}
            onChange={(checked) => updatePermission("upload", checked)}
            label="Every depicted adult agrees to send only the selected compressed stills to xAI."
          />
          <PermissionCheck
            checked={permissions.output}
            onChange={(checked) => updatePermission("output", checked)}
            label="Every depicted adult agrees to this app producing an observation report for this operator."
          />
        </div>
      </fieldset>
      {batchCommitted && (
        <div className="rounded-md border border-accent/30 bg-accent/10 p-3 text-xs text-muted">
          <p>
            This batch is locked to the permissions above. Uncheck any item to withdraw permission
            and discard it, or discard it before starting another batch.
          </p>
          <Button className="mt-2" variant="outline" size="sm" onClick={startNewBatch}>
            Discard batch and start another
          </Button>
        </div>
      )}
      <div className="relative overflow-hidden rounded-lg bg-elevated">
        <video
          ref={videoRef}
          className={cn("aspect-[3/4] w-full object-contain", !live && "hidden")}
          playsInline
          muted
        />
        {live && <GuideOverlay guide={guide} />}
        {!live && (
          <div className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 bg-elevated">
            <div className="absolute inset-0 bg-bg/70" />
            <Camera className="relative size-8 text-muted" />
            <p className="relative px-6 text-center text-sm text-muted">
              Use a clothed, non-identifying still of equipment or a limited setup whenever possible.
              Video is converted to labeled stills that you choose yourself.
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
      {videoFrames.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs leading-relaxed text-muted">
            Select one to three stills. Labels preserve clip order; selection is not safety ranking or clearance.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {videoFrames.map((frame, index) => {
              const selected = selectedFrames.includes(index);
              return (
                <button
                  key={frame.id}
                  type="button"
                  className={cn(
                    "relative overflow-hidden rounded-md border bg-elevated",
                    selected ? "border-accent ring-1 ring-accent" : "border-border",
                  )}
                  aria-pressed={selected}
                  onClick={() => toggleSelectedFrame(index)}
                >
                  <img src={frame.jpeg} alt={`${frame.id} video still`} className="aspect-[4/3] w-full object-contain" />
                  <span className="absolute bottom-1 left-1 rounded bg-bg/85 px-1.5 py-0.5 text-[10px] text-fg">
                    {frame.id}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              className="flex-1"
              onClick={() => void useSelectedVideoFrames()}
              disabled={!selectedFrames.length || disabled || !permissionsReady}
            >
              Use selected stills
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setVideoFrames([]);
                setSelectedFrames([]);
              }}
            >
              Discard clip
            </Button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <label
          className={cn(
            "inline-flex h-11 items-center justify-center gap-2 rounded-md bg-accent text-sm font-medium text-accent-fg",
            busy || recording || batchCommitted || disabled || !permissionsReady
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer",
          )}
        >
          <ImagePlus className="size-4" />
          Photo
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={busy || recording || batchCommitted || disabled || !permissionsReady}
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
            busy || recording || batchCommitted || disabled || !permissionsReady
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer",
          )}
        >
          <Video className="size-4" />
          Video
          <input
            type="file"
            accept="video/*"
            className="sr-only"
            disabled={busy || recording || batchCommitted || disabled || !permissionsReady}
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
            <Button
              className="flex-1"
              onClick={() => void snapBurst()}
              disabled={busy || recording || batchCommitted || disabled || !permissionsReady}
            >
              Capture still
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => void toggleRecord()}
              disabled={busy || batchCommitted || disabled || (!permissionsReady && !recording)}
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
            disabled={busy || batchCommitted || disabled || !permissionsReady}
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
        Keep only the relevant, non-identifying area in frame
      </p>
    </div>
  );
}

function PermissionCheck({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2">
      <input
        type="checkbox"
        className="mt-0.5 size-4 accent-accent"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}
