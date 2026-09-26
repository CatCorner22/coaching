import { Link } from "@tanstack/react-router";
import { Camera, ExternalLink, SwitchCamera, Video } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cameraErrorMessage } from "@/lib/camera/error-message";
import {
  openRopeCamera,
  playCameraPreview,
  startClip,
  type ClipHandle,
} from "@/lib/camera/stream";
import { buildAcademyFeedback, type AcademyFeedback } from "@/lib/learn/academy-feedback";
import { extractVideoFrames, processMediaFrame } from "@/lib/media";
import { buildDeterministic } from "@/lib/ml/predict";
import { observeFrame } from "@/lib/ml/detect";
import type { Tie } from "@/lib/kb/types";
import { useNegotiate } from "@/lib/stores/negotiate";
import { useSettings } from "@/lib/stores/settings";
import { playCoachVoice } from "@/lib/voice/play";
import { cn } from "@/lib/utils";

type AcademyObservePanelProps = {
  tie?: Tie;
  stepIndex: number;
  expectedBands?: number;
  cloudVoice: boolean;
  className?: string;
};

/**
 * Local practice cam only. Everything here stays on the device: frames are
 * scored by the local band heuristic and never leave page memory. Selected-still
 * cloud observation is deliberately NOT offered from this panel — it lives in
 * the Studio, behind the per-batch attestation checkboxes, the one-hour window,
 * and the one-use batch reservation. An earlier version of this panel submitted
 * to the analyze endpoint with every attestation hardcoded to true; do not
 * bring that back.
 *
 * The negotiated `photos` limit gates this camera: "photos / video for
 * coaching" is one decision, and a practice prop does not exempt the lens from
 * it. A later revision swapped this for the home-screen consent checkbox
 * alone; that is the adult gate, not the photos decision, and it silently
 * opened every lesson-page lens for anyone past the front door. Restored —
 * and pinned by integration-contracts — because the two gates answer
 * different questions.
 *
 * The Studio holds the same line (`cameraGateReason` in src/routes/studio.tsx),
 * so the blocked copy here can speak for every lens in the app.
 */
export function AcademyObservePanel({
  tie,
  stepIndex,
  expectedBands,
  cloudVoice,
  className,
}: AcademyObservePanelProps) {
  const settings = useSettings();
  const photosApproved = useNegotiate((s) =>
    s.items.some((item) => item.id === "photos" && item.rank === "yes"),
  );
  // Fail closed until the client has hydrated the persisted negotiation
  // snapshot; the server-rendered HTML always shows the blocked state.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const cameraAllowed = hydrated && photosApproved;

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const clipRef = useRef<ClipHandle | null>(null);
  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);
  const cameraRequestRef = useRef(0);
  const cameraOpenRef = useRef<AbortController | null>(null);
  const recordTimeoutRef = useRef<number | null>(null);
  const muteTimerRef = useRef<number | null>(null);
  useEffect(() => {
    setFeedback(null);
    prevFrameRef.current = null;
  }, [stepIndex, tie?.slug]);

  const [cameraOn, setCameraOn] = useState(false);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<AcademyFeedback | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [clipUrl, setClipUrl] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    cameraRequestRef.current += 1;
    cameraOpenRef.current?.abort();
    cameraOpenRef.current = null;
    if (recordTimeoutRef.current !== null) {
      window.clearTimeout(recordTimeoutRef.current);
      recordTimeoutRef.current = null;
    }
    if (muteTimerRef.current !== null) {
      window.clearTimeout(muteTimerRef.current);
      muteTimerRef.current = null;
    }
    clipRef.current?.cancel();
    clipRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
    setRecording(false);
    setBusy(false);
  }, []);

  // Unmount teardown only. This must not depend on clipUrl: when it did, every
  // finished recording re-ran the cleanup and shut the live camera down.
  useEffect(() => () => stopCamera(), [stopCamera]);

  // Revoke each clip's object URL when it is replaced or the panel unmounts.
  useEffect(() => {
    if (!clipUrl) return;
    return () => URL.revokeObjectURL(clipUrl);
  }, [clipUrl]);

  // A revocation in another tab (or on /negotiate) closes a live camera.
  useEffect(() => {
    if (hydrated && !photosApproved) stopCamera();
  }, [hydrated, photosApproved, stopCamera]);

  // Backgrounding the tab releases the lens on iOS whether the panel notices
  // or not. Notice, so the controls do not keep offering to score a frame the
  // camera can no longer deliver.
  useEffect(() => {
    const dropCamera = () => {
      if (!streamRef.current) return;
      stopCamera();
      setError("The camera closed when the app went to the background. Start it again.");
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") dropCamera();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", dropCamera);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", dropCamera);
    };
  }, [stopCamera]);

  async function startCamera(nextFacing: "environment" | "user" = facing) {
    if (!cameraAllowed) return;
    stopCamera();
    const request = ++cameraRequestRef.current;
    const controller = new AbortController();
    cameraOpenRef.current = controller;
    setError(null);
    setBusy(true);
    try {
      const stream = await openRopeCamera(nextFacing, { signal: controller.signal });
      if (request !== cameraRequestRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Bounded and abortable: a bare play() that never settles left every
        // control, Stop included, disabled behind `busy` with the camera light
        // on and no way out but a reload.
        await playCameraPreview(videoRef.current, controller.signal);
      }
      if (request !== cameraRequestRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        if (streamRef.current === stream) streamRef.current = null;
        return;
      }
      // A track that ends (OS permission revoked, another app took the lens)
      // leaves the video element at readyState 4 with a frozen last frame, so
      // nothing downstream can tell the camera died. Listen for it instead.
      for (const track of stream.getVideoTracks()) {
        const lost = () => {
          if (streamRef.current !== stream) return;
          stopCamera();
          setError("The camera stopped. Tap Start camera…");
        };
        const onMute = () => {
          if (streamRef.current !== stream) return;
          setError("Camera paused by the device…");
          if (muteTimerRef.current !== null) window.clearTimeout(muteTimerRef.current);
          muteTimerRef.current = window.setTimeout(() => {
            muteTimerRef.current = null;
            if (streamRef.current === stream && track.readyState !== "live") lost();
          }, 4000);
        };
        const onUnmute = () => {
          if (muteTimerRef.current !== null) {
            window.clearTimeout(muteTimerRef.current);
            muteTimerRef.current = null;
          }
          if (streamRef.current === stream) setError(null);
        };
        track.addEventListener("ended", lost, { once: true });
        track.addEventListener("mute", onMute);
        track.addEventListener("unmute", onUnmute);
      }
      setFacing(nextFacing);
      setCameraOn(true);
    } catch (e) {
      // openRopeCamera can succeed and the preview still fail to play, which
      // left the lens open behind a panel showing no Stop button.
      if (request === cameraRequestRef.current) {
        stopCamera();
        setError(cameraErrorMessage(e));
      }
    } finally {
      if (request === cameraRequestRef.current) {
        setBusy(false);
        if (cameraOpenRef.current === controller) cameraOpenRef.current = null;
      }
    }
  }

  /** Whether the stream behind the preview is still delivering frames. */
  function cameraIsLive() {
    return streamRef.current?.getVideoTracks().some((track) => track.readyState === "live") === true;
  }

  async function captureAndAnalyze() {
    const v = videoRef.current;
    if (!v || v.readyState < 2) {
      setError("Start the camera first.");
      return;
    }
    if (!cameraIsLive()) {
      stopCamera();
      setError("The camera is no longer delivering frames. Start it again.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { jpeg, imageData } = await processMediaFrame(v, 768, 240, 0.74);
      setPreview(jpeg);
      const obs = observeFrame(imageData, prevFrameRef.current ?? undefined);
      prevFrameRef.current = imageData.data;
      const det = buildDeterministic([obs]);
      const fb = buildAcademyFeedback({
        det,
        frames: [obs],
        tie,
        stepIndex,
        expectedBands,
      });
      setFeedback(fb);
      if (settings.voice) void playCoachVoice(fb.speak, cloudVoice);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read this frame.");
    } finally {
      setBusy(false);
    }
  }

  function recordClip() {
    const stream = streamRef.current;
    if (!stream) {
      setError("Start the camera first.");
      return;
    }
    if (!cameraIsLive()) {
      stopCamera();
      setError("The camera is no longer delivering frames. Start it again.");
      return;
    }
    setError(null);
    try {
      clipRef.current?.cancel();
      const clip = startClip(stream);
      clipRef.current = clip;
      // Busy stays held for the whole 3-second recording; releasing it in a
      // finally here re-enabled every control mid-recording.
      setBusy(true);
      setRecording(true);
      recordTimeoutRef.current = window.setTimeout(() => {
        recordTimeoutRef.current = null;
        clip
          .stop()
          .then((blob) => {
            setClipUrl(URL.createObjectURL(blob));
          })
          .catch((e) => {
            if (e instanceof DOMException && e.name === "AbortError") return;
            setError(e instanceof Error ? e.message : "Could not record clip.");
          })
          .finally(() => {
            setBusy(false);
            setRecording(false);
          });
      }, 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not record clip.");
      setBusy(false);
      setRecording(false);
    }
  }

  async function analyzeClip() {
    if (!clipUrl) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(clipUrl);
      const blob = await res.blob();
      const file = new File([blob], "practice.webm", { type: blob.type || "video/webm" });
      // MediaRecorder WebM reports Infinity duration with no seekable range on
      // Chromium; without the hint every clip analysis threw. The panel
      // records a fixed 3-second clip (the timeout above), so say so.
      const frames = await extractVideoFrames(file, 3, undefined, 3);
      if (!frames.length) throw new Error("No frames from clip.");
      const observations = frames.map((f) => observeFrame(f.imageData));
      const det = buildDeterministic(observations);
      const fb = buildAcademyFeedback({
        det,
        frames: observations,
        tie,
        stepIndex,
        expectedBands,
      });
      setFeedback(fb);
      setPreview(frames[frames.length - 1]?.jpeg ?? null);
      if (settings.voice) void playCoachVoice(fb.speak, cloudVoice);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not analyze clip.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className={cn("learn-panel rounded-xl border border-border bg-surface p-4 sm:p-5", className)}
      aria-label="Camera observation"
    >
      <div className="flex items-start gap-2">
        <Camera className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
        <div>
          <h3 className="text-base font-medium text-fg">Practice cam — probabilistic hints</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Frame your <strong className="font-medium text-fg">empty prop and rope only</strong>. Everything stays on
            this device; the app gives heuristic guesses — never safety clearance.
          </p>
        </div>
      </div>

      {!cameraAllowed ? (
        <div className="mt-4 rounded-lg border border-border bg-elevated px-4 py-4 text-sm leading-relaxed text-muted">
          This practice camera is off until the{" "}
          <strong className="font-medium text-fg">photos / video</strong> limit is a yes.{" "}
          <Link to="/negotiate" className="text-accent underline underline-offset-2">
            Review limits
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-4 overflow-hidden rounded-lg border border-border bg-elevated">
            <video
              ref={videoRef}
              playsInline
              muted
              className={cn("aspect-[4/3] w-full bg-bg object-cover", !cameraOn && "hidden")}
            />
            {!cameraOn && !preview && (
              <div className="flex aspect-[4/3] items-center justify-center px-4 text-center text-sm text-muted">
                Camera off — practice on a post or dress form in good light
              </div>
            )}
            {preview && !cameraOn && (
              <img src={preview} alt="Captured practice frame" className="aspect-[4/3] w-full object-cover" />
            )}
          </div>

          {clipUrl && (
            <div className="mt-3 overflow-hidden rounded-lg border border-border">
              <video src={clipUrl} controls playsInline muted loop className="aspect-[4/3] w-full bg-bg object-cover" />
              <p className="px-3 py-2 text-xs text-muted">3 second practice loop — compare to the diagram</p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {!cameraOn ? (
              <Button size="lg" disabled={busy} onClick={() => void startCamera()}>
                <Camera className="size-4" aria-hidden />
                Start camera
              </Button>
            ) : (
              <>
                <Button size="lg" disabled={busy} onClick={() => void captureAndAnalyze()}>
                  Snap &amp; hint
                </Button>
                <Button size="lg" variant="secondary" disabled={busy} onClick={recordClip}>
                  <Video className="size-4" aria-hidden />
                  {recording ? "Recording…" : "Record 3s"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  disabled={busy}
                  onClick={() => {
                    void startCamera(facing === "environment" ? "user" : "environment");
                  }}
                >
                  <SwitchCamera className="size-4" aria-hidden />
                  Flip
                </Button>
                <Button size="lg" variant="ghost" onClick={stopCamera}>
                  Stop
                </Button>
              </>
            )}
            {clipUrl && (
              <Button size="lg" variant="outline" disabled={busy} onClick={() => void analyzeClip()}>
                Analyze clip
              </Button>
            )}
          </div>

          {recording && (
            <p className="mt-3 text-sm text-danger" role="status">
              Recording a 3-second clip…
            </p>
          )}

          {feedback && (
            <aside
              className={cn(
                "mt-4 rounded-lg border px-4 py-3",
                feedback.recommend === "stop"
                  ? "border-danger/40 bg-danger/10"
                  : "border-accent/25 bg-accent/5",
              )}
            >
              <p className="text-sm font-medium text-fg">{feedback.headline}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{feedback.detail}</p>
              {feedback.expectedBands != null && (
                <p className="mt-2 text-xs text-subtle">
                  Bands: {feedback.wrapCount} detected · {feedback.matchLabel} · not validated
                </p>
              )}
            </aside>
          )}

          <p className="mt-3 text-xs leading-relaxed text-subtle">
            Want cloud categories on selected stills? Open the{" "}
            <Link
              to="/studio"
              search={tie ? { tie: tie.slug, step: stepIndex } : undefined}
              className="text-accent underline underline-offset-2"
            >
              Studio
            </Link>{" "}
            with this tie loaded — nothing from here uploads automatically.
          </p>

          {feedback && tie && (
            <Button asChild className="mt-3 w-full sm:w-auto" variant="outline" size="sm">
              <Link to="/studio" search={{ tie: tie.slug, step: stepIndex }}>
                <ExternalLink className="size-4" aria-hidden />
                Continue in Studio
              </Link>
            </Button>
          )}

          {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        </>
      )}
    </section>
  );
}
