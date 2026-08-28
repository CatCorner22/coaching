import { Camera, Flashlight, ImagePlus, SwitchCamera, Video } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  inspectCameraCapabilities,
  openRopeCamera,
  playCameraPreview,
  setTorch,
  startClip,
  torchAvailable,
  type CameraCapabilityReport,
  type ClipHandle,
} from "@/lib/camera/stream";
import {
  pickBest,
  privacySafeQualityHint,
  scoreFrame,
  worstFrameQuality,
  type FrameQuality,
} from "@/lib/camera/quality";
import {
  extractVideoFrames,
  MAX_VIDEO_BYTES,
  processMediaFrame,
  validateMediaFile,
  validateMediaSignature,
  type ProcessedMediaFrame,
} from "@/lib/media";
import { mediaUploadScope } from "@/lib/media-scope";
import { observeFrame } from "@/lib/ml/detect";
import type { FrameObservation } from "@/lib/ml/types";
import { cn } from "@/lib/utils";
import { useSettings } from "@/lib/stores/settings";

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
  withinUploadScope: true;
  /** Which upload-scope attestation wording this batch confirmed. */
  scope: "non_explicit" | "adult_nudity";
  nonSecret: true;
  nonCoerced: true;
  allPeopleConsented: true;
  activity: true;
  recording: true;
  upload: true;
  output: true;
  batchId: string;
  confirmedAt: number;
};

type PermissionKey =
  | "adults"
  | "withinUploadScope"
  | "nonSecret"
  | "nonCoerced"
  | "allPeopleConsented"
  | "activity"
  | "recording"
  | "upload"
  | "output";
type PendingVideoFrame = {
  id: string;
  jpeg: string;
  observation: FrameObservation;
  quality: FrameQuality;
};

const EMPTY_PERMISSIONS: Record<PermissionKey, boolean> = {
  adults: false,
  withinUploadScope: false,
  nonSecret: false,
  nonCoerced: false,
  allPeopleConsented: false,
  activity: false,
  recording: false,
  upload: false,
  output: false,
};
// Must stay shorter than the server's shared batch reservation (two hours in
// src/lib/ai/media-replay-core.ts): the reservation exists to outlive every
// permission this client still treats as fresh. A revision widened this to
// four hours for convenience, which inverted that relationship — a three-hour
// batch read as confirmed here after its replay protection had lapsed.
const BATCH_PERMISSION_MAX_AGE_MS = 60 * 60 * 1000;

type Guide = "equipment" | "context" | "detail" | "label";

export const CameraCapture = memo(function CameraCapture({
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
  const cameraOpenRef = useRef<AbortController | null>(null);
  const capabilityRequestRef = useRef(0);
  const mediaOperationRef = useRef<AbortController | null>(null);
  const mediaOperationIdRef = useRef(0);
  // True only while a decode/import is actually running. The controller ref is
  // never cleared, so testing it for null reported "in flight" forever after
  // the first operation — every later app switch then claimed work was lost.
  const mediaOperationActiveRef = useRef(false);
  const torchRequestRef = useRef(0);
  const torchBusyRef = useRef(false);
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
  const [guide, setGuide] = useState<Guide>("equipment");
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState(EMPTY_PERMISSIONS);
  // What this deployment is configured to transmit. An operator setting, so it
  // is read once rather than being something anyone can flip mid-scene.
  const scope = mediaUploadScope();
  const [capabilityReport, setCapabilityReport] = useState<CameraCapabilityReport | null>(null);
  const [checkingCapabilities, setCheckingCapabilities] = useState(false);
  const [capabilityError, setCapabilityError] = useState<string | null>(null);
  const [batchCommitted, setBatchCommitted] = useState(false);
  const [permissionExpiresAt, setPermissionExpiresAt] = useState<number | null>(null);
  const [videoFrames, setVideoFrames] = useState<PendingVideoFrame[]>([]);
  const [selectedFrames, setSelectedFrames] = useState<number[]>([]);
  const permissionsReady = Object.values(permissions).every(Boolean);
  permissionsRef.current = permissions;
  const studioConsented = useSettings((s) => s.consented);

  function armBatchPermissions() {
    const allTrue = Object.fromEntries(
      Object.keys(EMPTY_PERMISSIONS).map((key) => [key, true]),
    ) as Record<PermissionKey, boolean>;
    permissionsRef.current = allTrue;
    setPermissions(allTrue);
    const confirmedAt = Date.now();
    permissionConfirmedAtRef.current = confirmedAt;
    setPermissionExpiresAt(confirmedAt + BATCH_PERMISSION_MAX_AGE_MS);
    if (permissionExpiryTimerRef.current !== null) {
      window.clearTimeout(permissionExpiryTimerRef.current);
    }
    permissionExpiryTimerRef.current = window.setTimeout(() => {
      permissionExpiryTimerRef.current = null;
      permissionConfirmedAtRef.current = null;
      setPermissionExpiresAt(null);
      permissionsRef.current = EMPTY_PERMISSIONS;
      setPermissions({ ...EMPTY_PERMISSIONS });
      setBatchCommitted(false);
      stopLive();
      setVideoFrames([]);
      setSelectedFrames([]);
      onDiscard();
      setHint("This batch timed out — start a fresh capture when you're ready.");
    }, BATCH_PERMISSION_MAX_AGE_MS);
  }

  useEffect(() => {
    if (!studioConsented || disabled || batchCommitted) return;
    if (Object.values(permissionsRef.current).every(Boolean)) return;
    armBatchPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studioConsented, disabled, batchCommitted]);

  useEffect(() => {
    mountedRef.current = true;
    const video = videoRef.current;
    return () => {
      mountedRef.current = false;
      mediaOperationRef.current?.abort();
      mediaOperationActiveRef.current = false;
      cameraOpenRef.current?.abort();
      cameraOpenRef.current = null;
      capabilityRequestRef.current += 1;
      mediaOperationIdRef.current += 1;
      torchRequestRef.current += 1;
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
      if (video) {
        video.pause();
        video.srcObject = null;
      }
    };
  }, []);

  useEffect(() => {
    const stopForBackground = () => {
      // A local file decode holds no camera hardware, but it is aborted with
      // the rest of the teardown. Say so instead of leaving the capture area
      // blank with no explanation of where the import went.
      const hadMediaOperation = mediaOperationActiveRef.current;
      stopLive();
      if (hadMediaOperation) {
        setHint("Processing stopped when the app went to the background. Choose the file again.");
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") stopForBackground();
    };
    const onPageHide = () => stopForBackground();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
    };
    // stopLive intentionally reads the latest refs and does not need resubscription.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!disabled) return;
    capabilityRequestRef.current += 1;
    setCheckingCapabilities(false);
    setCapabilityReport(null);
    setCapabilityError(null);
    mediaOperationRef.current?.abort();
    mediaOperationActiveRef.current = false;
    cameraOpenRef.current?.abort();
    cameraOpenRef.current = null;
    mediaOperationIdRef.current += 1;
    torchRequestRef.current += 1;
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
    setPermissionExpiresAt(null);
    setPermissions({ ...EMPTY_PERMISSIONS });
    if (permissionExpiryTimerRef.current !== null) {
      window.clearTimeout(permissionExpiryTimerRef.current);
      permissionExpiryTimerRef.current = null;
    }
  }, [disabled]);

  async function checkBrowserCapabilities() {
    if (disabledRef.current || checkingCapabilities) return;
    const request = ++capabilityRequestRef.current;
    setCheckingCapabilities(true);
    setCapabilityError(null);
    try {
      const report = await inspectCameraCapabilities();
      if (mountedRef.current && !disabledRef.current && request === capabilityRequestRef.current) {
        setCapabilityReport(report);
      }
    } catch {
      if (mountedRef.current && !disabledRef.current && request === capabilityRequestRef.current) {
        setCapabilityReport(null);
        setCapabilityError(
          "The browser capability check could not finish. You can still try file selection.",
        );
      }
    } finally {
      if (mountedRef.current && request === capabilityRequestRef.current) {
        setCheckingCapabilities(false);
      }
    }
  }

  function clearRecordTimer() {
    if (recordTimerRef.current !== null) {
      window.clearTimeout(recordTimerRef.current);
      recordTimerRef.current = null;
    }
  }

  function beginMediaOperation(): { signal: AbortSignal; id: number } {
    mediaOperationRef.current?.abort();
    mediaOperationActiveRef.current = false;
    const controller = new AbortController();
    mediaOperationRef.current = controller;
    mediaOperationActiveRef.current = true;
    const id = ++mediaOperationIdRef.current;
    return { signal: controller.signal, id };
  }

  function ownsMediaOperation(id: number): boolean {
    return mountedRef.current && mediaOperationIdRef.current === id;
  }

  function startNewBatch() {
    stopLive();
    if (permissionExpiryTimerRef.current !== null) {
      window.clearTimeout(permissionExpiryTimerRef.current);
      permissionExpiryTimerRef.current = null;
    }
    permissionConfirmedAtRef.current = null;
    setPermissionExpiresAt(null);
    permissionsRef.current = EMPTY_PERMISSIONS;
    setPermissions({ ...EMPTY_PERMISSIONS });
    setBatchCommitted(false);
    setVideoFrames([]);
    setSelectedFrames([]);
    onDiscard();
    if (studioConsented && !disabledRef.current) armBatchPermissions();
    else setHint("Previous batch discarded.");
  }

  function confirmedAtForBatch(): number {
    const confirmedAt = permissionConfirmedAtRef.current;
    if (
      confirmedAt === null ||
      Date.now() - confirmedAt < 0 ||
      Date.now() - confirmedAt > BATCH_PERMISSION_MAX_AGE_MS
    ) {
      throw new Error("Batch permissions are no longer current. Start a new capture.");
    }
    return confirmedAt;
  }

  function hasCurrentBatchPermissions(): boolean {
    try {
      confirmedAtForBatch();
      return true;
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Start a new capture when you're ready.",
      );
      return false;
    }
  }

  async function startLive(next: "user" | "environment" = facing) {
    if (disabledRef.current || batchCommitted) return;
    if (!Object.values(permissionsRef.current).every(Boolean)) {
      setError("Step inside from the home screen first, then open the camera.");
      return;
    }
    if (!hasCurrentBatchPermissions()) return;
    setError(null);
    stopLive();
    setVideoFrames([]);
    setSelectedFrames([]);
    const request = ++cameraRequestRef.current;
    const cameraController = new AbortController();
    cameraOpenRef.current = cameraController;
    let openedStream: MediaStream | null = null;
    setBusy(true);
    try {
      const stream = await openRopeCamera(next, { signal: cameraController.signal });
      openedStream = stream;
      if (!mountedRef.current || request !== cameraRequestRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      setHasTorch(torchAvailable(stream));
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await playCameraPreview(videoRef.current, cameraController.signal);
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
      if (cameraOpenRef.current === cameraController) cameraOpenRef.current = null;
      if (mountedRef.current && request === cameraRequestRef.current) setBusy(false);
    }
  }

  function stopLive() {
    cameraRequestRef.current += 1;
    cameraOpenRef.current?.abort();
    cameraOpenRef.current = null;
    mediaOperationRef.current?.abort();
    mediaOperationActiveRef.current = false;
    mediaOperationIdRef.current += 1;
    torchRequestRef.current += 1;
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
      throw new Error("Step inside from the home screen first, then capture again.");
    }
    const confirmedAt = confirmedAtForBatch();
    if (!jpegs.length || !observations.length) throw new Error("No readable frame was captured.");
    const quality = worstFrameQuality(qualities);
    setHint(privacySafeQualityHint(quality));
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
        withinUploadScope: true,
        // The scope this build's attestation checkbox actually described; the
        // server rejects a batch whose scope does not match the deployment's.
        scope,
        nonSecret: true,
        nonCoerced: true,
        allPeopleConsented: true,
        activity: true,
        recording: true,
        upload: true,
        output: true,
        batchId: crypto.randomUUID(),
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
    const operation = beginMediaOperation();
    const { signal } = operation;
    try {
      const frames: ProcessedMediaFrame[] = [];
      for (let i = 0; i < 3; i++) {
        signal.throwIfAborted();
        frames.push(await processMediaFrame(v, 1600, 240, 0.82));
        await new Promise((r) => setTimeout(r, 90));
      }
      const observed = frames.map((frame) => ({
        frame,
        observation: observeFrame(frame.imageData),
      }));
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
        [scoreFrame(chosen.imageData, chosen.detailData)],
      );
    } catch (cause) {
      if (
        ownsMediaOperation(operation.id) &&
        !(cause instanceof DOMException && cause.name === "AbortError")
      ) {
        setError(cause instanceof Error ? cause.message : "Could not capture a photo.");
      }
    } finally {
      if (ownsMediaOperation(operation.id)) {
        mediaOperationActiveRef.current = false;
        setBusy(false);
      }
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
    const operation = beginMediaOperation();
    const { signal } = operation;
    try {
      const stoppedAt = Date.now();
      const blob = await handle.stop();
      signal.throwIfAborted();
      const durationHint =
        startedAt === null ? undefined : Math.max(0.05, (stoppedAt - startedAt) / 1000);
      await ingestVideo(blob, operation, durationHint);
    } catch (e) {
      if (
        ownsMediaOperation(operation.id) &&
        !(e instanceof DOMException && e.name === "AbortError")
      ) {
        setError(e instanceof Error ? e.message : "Could not record");
      }
    } finally {
      recordTransitionRef.current = false;
      if (ownsMediaOperation(operation.id)) {
        mediaOperationActiveRef.current = false;
        setBusy(false);
      }
    }
  }

  async function ingestVideo(
    file: Blob,
    operation: { signal: AbortSignal; id: number },
    durationHintSeconds?: number,
  ) {
    const { signal } = operation;
    if (!file.size) throw new Error("The video is empty.");
    if (file.size > MAX_VIDEO_BYTES) {
      throw new Error(
        `Video is too large. Choose one under ${Math.round(MAX_VIDEO_BYTES / 1024 / 1024)} MB.`,
      );
    }
    const frames = await extractVideoFrames(file, 6, signal, durationHintSeconds);
    let prev: Uint8ClampedArray | undefined;
    const observed = frames.map((f) => {
      const obs = observeFrame(f.imageData, prev);
      prev = f.imageData.data;
      return { f, obs };
    });
    signal.throwIfAborted();
    if (!ownsMediaOperation(operation.id) || disabledRef.current) return;
    setVideoFrames(
      observed.map((x, index) => ({
        id: `F${String(index + 1).padStart(2, "0")}`,
        jpeg: x.f.jpeg,
        observation: x.obs,
        quality: scoreFrame(x.f.imageData, x.f.detailData),
      })),
    );
    setSelectedFrames([]);
    setHint(
      "Choose one to three labeled stills from the clip. Nothing is analyzed remotely until you confirm.",
    );
  }

  async function commitSelectedVideoFrames() {
    if (!hasCurrentBatchPermissions()) return;
    const indices = [...selectedFrames].sort((a, b) => a - b).slice(0, 3);
    const chosen = indices
      .map((index) => videoFrames[index])
      .filter(Boolean) as PendingVideoFrame[];
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
      if (current.length >= 3) {
        // Silently ignoring the fourth tap read as an unresponsive control.
        setHint("Up to three stills per batch. Deselect one before choosing another.");
        return current;
      }
      return [...current, index];
    });
  }

  async function onFile(file: File, kind: "photo" | "video") {
    if (recording || batchCommitted) return;
    if (!hasCurrentBatchPermissions()) return;
    setBusy(true);
    setError(null);
    const operation = beginMediaOperation();
    const { signal } = operation;
    try {
      // Recover in both directions: a video chosen through the photo control
      // was already corrected, while a photo chosen through the video control
      // used to fail with "Choose a supported video file."
      const actualKind = file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("image/")
          ? "photo"
          : kind;
      validateMediaFile(file, actualKind);
      const dimensions = await validateMediaSignature(file, actualKind);
      signal.throwIfAborted();
      // Only now discard any pending clip-still selection. Clearing before
      // validation meant a rejected pick destroyed extracted stills that only
      // a fresh recording could restore.
      if (!ownsMediaOperation(operation.id) || disabledRef.current) return;
      setVideoFrames([]);
      setSelectedFrames([]);
      if (actualKind === "video") {
        await ingestVideo(file, operation);
      } else {
        const { jpeg, imageData, detailData } = await processMediaFrame(file, 1600, 240, 0.82, dimensions);
        signal.throwIfAborted();
        if (!ownsMediaOperation(operation.id) || disabledRef.current) return;
        const observation = observeFrame(imageData);
        // The detail crop matters most here: an imported phone photo judged
        // only on the 240px downscale scored blurred frames as adequate,
        // because a downscale is a low-pass filter. Live capture and video
        // stills already pass it.
        const quality = scoreFrame(imageData, detailData);
        signal.throwIfAborted();
        if (!ownsMediaOperation(operation.id) || disabledRef.current) return;
        await emitFromMedia("photo", [jpeg], [observation], [quality]);
      }
    } catch (e) {
      if (
        ownsMediaOperation(operation.id) &&
        !(e instanceof DOMException && e.name === "AbortError")
      ) {
        setError(e instanceof Error ? e.message : "Could not read media");
      }
    } finally {
      if (ownsMediaOperation(operation.id)) {
        mediaOperationActiveRef.current = false;
        setBusy(false);
      }
    }
  }

  async function toggleTorch() {
    const stream = streamRef.current;
    if (!stream) return;
    // setTorch tears the stream down itself when a constraint fails or times
    // out, so a second concurrent call from a double-tap could kill a stream
    // the first call had already applied successfully. One at a time.
    if (torchBusyRef.current) return;
    torchBusyRef.current = true;
    const request = cameraRequestRef.current;
    const torchRequest = ++torchRequestRef.current;
    const next = !torch;
    let ok: boolean;
    try {
      ok = await setTorch(stream, next);
    } finally {
      torchBusyRef.current = false;
    }
    if (
      !mountedRef.current ||
      disabledRef.current ||
      request !== cameraRequestRef.current ||
      torchRequest !== torchRequestRef.current ||
      streamRef.current !== stream
    )
      return;
    if (!ok) {
      stopLive();
      setError(
        "Torch could not be applied safely, so the camera was closed. Reopen it to continue without torch.",
      );
      return;
    }
    setTorchOn(next);
  }

  return (
    <div className="space-y-3">
      <details className="rounded-lg border border-border bg-surface p-3">
        <summary className="cursor-pointer text-sm font-medium text-fg">
          Browser camera check (optional)
        </summary>
        <div className="mt-2">
        <p className="text-xs leading-relaxed text-muted">
          See whether this browser can use a camera — without opening the lens yet.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-3 h-auto min-h-11 whitespace-normal py-2 text-left"
          onClick={() => void checkBrowserCapabilities()}
          disabled={disabled}
          aria-disabled={disabled || checkingCapabilities}
        >
          {checkingCapabilities
            ? "Checking browser capabilities…"
            : "Check browser capabilities — camera stays off"}
        </Button>
        {capabilityReport && (
          <div
            className="mt-3 rounded-md border border-border bg-elevated p-3"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <dl className="space-y-2 text-xs text-muted">
              <CapabilityRow
                label="Secure context"
                value={secureContextCopy(capabilityReport.secureContext)}
              />
              <CapabilityRow
                label="Camera policy"
                value={cameraPolicyCopy(capabilityReport.cameraPolicy)}
              />
              <CapabilityRow
                label="Live camera API"
                value={apiCopy(capabilityReport.liveCameraApi)}
              />
              <CapabilityRow
                label="In-app clip API"
                value={apiCopy(capabilityReport.clipRecordingApi)}
              />
              <CapabilityRow
                label="Camera permission"
                value={permissionCopy(capabilityReport.permission)}
              />
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-subtle">
              Photo/video file decoding is tested only after you select a file. In-app recording is
              tested only when recording starts. This does not test the physical camera, image
              quality, consent, privacy, or safety. It is not device certification or safety
              clearance.
            </p>
          </div>
        )}
        {capabilityError && (
          <p className="mt-2 text-xs text-danger-text" role="alert">
            {capabilityError}
          </p>
        )}
        </div>
      </details>
      {batchCommitted && (
        <div className="rounded-md border border-accent/30 bg-accent/10 p-3 text-xs text-muted">
          <p>
            This batch is ready for Analyze once from this view — tap it when you want cloud
            categories. Capture again anytime; nothing uploads until you tap Analyze.
          </p>
          <Button className="mt-2" variant="outline" size="sm" onClick={startNewBatch}>
            Start a new capture
          </Button>
        </div>
      )}
      <div className="relative overflow-hidden rounded-lg bg-elevated">
        <video
          ref={videoRef}
          className={cn("aspect-[3/4] w-full object-contain", !live && "hidden")}
          aria-label="Live camera preview; no media is sent until capture and confirmation"
          playsInline
          muted
        />
        {live && <GuideOverlay guide={guide} />}
        {!live && (
          <div className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 bg-elevated">
            <div className="absolute inset-0 bg-bg/70" />
            <Camera className="relative size-8 text-muted" />
            <p className="relative px-6 text-center text-sm text-muted">
              Open the camera and capture when you are ready — prefer a non-identifying view of
              equipment or rope. Short clips become stills you pick yourself.
            </p>
          </div>
        )}
        {recording && (
          <span
            className="absolute right-3 top-3 rounded-full bg-danger px-2 py-0.5 text-[11px] uppercase tracking-wide text-danger-fg"
            role="status"
            aria-live="polite"
            aria-label="Recording in progress"
          >
            Rec
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {(["equipment", "context", "detail", "label"] as Guide[]).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGuide(g)}
            aria-pressed={guide === g}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-wide",
              guide === g ? "border-accent text-fg" : "border-border text-muted",
            )}
          >
            {g}
          </button>
        ))}
      </div>
      {/* The one-hour batch window was invisible until it expired and silently
          discarded the batch. Show when it runs out. */}
      {permissionsReady && permissionExpiresAt !== null && (
        <p className="text-xs text-muted">
          This capture window closes at{" "}
          {new Date(permissionExpiresAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          .
        </p>
      )}
      {hint && (
        <p className="text-xs text-muted" aria-live="polite">
          {hint}
        </p>
      )}
      {error && (
        <p className="text-sm text-danger-text" role="alert">
          {error}
        </p>
      )}
      {videoFrames.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs leading-relaxed text-muted">
            Select one to three stills. Labels preserve clip order; selection is not safety ranking
            or clearance.
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
                  <img
                    src={frame.jpeg}
                    alt={`${frame.id} video still`}
                    className="aspect-[4/3] w-full object-contain"
                  />
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
              onClick={() => void commitSelectedVideoFrames()}
              disabled={
                !selectedFrames.length || busy || recording || disabled || !permissionsReady
              }
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
                aria-pressed={torch}
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
        ) : busy ? (
          <Button variant="ghost" className="flex-1" onClick={stopLive} disabled={disabled}>
            Cancel current operation
          </Button>
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
          Opening or processing camera media…
        </p>
      )}
    </div>
  );
});

function CapabilityRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-medium text-fg">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function secureContextCopy(state: CameraCapabilityReport["secureContext"]): string {
  if (state === "secure") return "Secure context detected; live access may be attempted later.";
  if (state === "insecure") return "Blocked: live camera requires HTTPS or localhost.";
  return "Unknown: this browser did not expose secure-context status.";
}

function cameraPolicyCopy(state: CameraCapabilityReport["cameraPolicy"]): string {
  if (state === "allowed") return "Camera use is allowed at the document-policy layer only.";
  if (state === "blocked") return "Blocked by this document's camera policy.";
  return "Unknown: this browser did not expose the effective camera policy.";
}

function apiCopy(state: CameraCapabilityReport["liveCameraApi"]): string {
  return state === "detected"
    ? "API detected; no hardware, stream, or successful operation was tested."
    : "API unavailable in this browser; file selection may still work.";
}

function permissionCopy(state: CameraCapabilityReport["permission"]): string {
  if (state === "granted") {
    return "Browser reports granted; no hardware or stream was tested.";
  }
  if (state === "prompt") {
    return "Browser may ask only after you choose Open live camera.";
  }
  if (state === "denied") {
    return "Browser reports denied; live capture appears blocked, but file selection may still work.";
  }
  return "Unknown: this browser did not report camera-permission state.";
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
    guide === "detail"
      ? "inset-[28%_22%_28%_22%]"
      : guide === "label"
        ? "inset-[35%_18%_35%_18%]"
        : guide === "context"
          ? "inset-[8%_8%_12%_8%]"
          : "inset-[14%_14%_20%_14%]";
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className={cn("absolute rounded-md border border-accent/70", box)} />
      <p className="absolute bottom-2 left-0 right-0 text-center text-[11px] uppercase tracking-wide text-accent">
        Keep only the relevant, non-identifying area in frame
      </p>
    </div>
  );
}
