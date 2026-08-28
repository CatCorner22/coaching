import { Link } from "@tanstack/react-router";
import { Camera, ExternalLink, SwitchCamera, Video } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { openRopeCamera, startClip, type ClipHandle } from "@/lib/camera/stream";
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
 * The blocked copy deliberately speaks only for this camera. The same
 * revision also removed the Studio's media gate (`cameraGateReason` in
 * src/routes/studio.tsx now reads only `stopped`), so the Studio lens opens
 * regardless of this limit. Until that gate is restored, any wording here
 * promising that every lens waits would be an assurance the app does not
 * honour — a reader could leave this panel, open Studio, and film anyway.
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
  const prevFrameRef = useRef<Uint8ClampedArray | undefined>(undefined);

  const [cameraOn, setCameraOn] = useState(false);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<AcademyFeedback | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [clipUrl, setClipUrl] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    clipRef.current?.cancel();
    clipRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
    setRecording(false);
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

  async function startCamera() {
    if (!cameraAllowed) return;
    setError(null);
    setBusy(true);
    try {
      stopCamera();
      const stream = await openRopeCamera(facing);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Camera unavailable on this device.");
    } finally {
      setBusy(false);
    }
  }

  async function captureAndAnalyze() {
    const v = videoRef.current;
    if (!v || v.readyState < 2) {
      setError("Start the camera first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { jpeg, imageData } = await processMediaFrame(v, 768, 240, 0.74);
      setPreview(jpeg);
      const obs = observeFrame(imageData, prevFrameRef.current);
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
    setError(null);
    try {
      clipRef.current?.cancel();
      const clip = startClip(stream);
      clipRef.current = clip;
      // Busy stays held for the whole 3-second recording; releasing it in a
      // finally here re-enabled every control mid-recording.
      setBusy(true);
      setRecording(true);
      window.setTimeout(() => {
        clip
          .stop()
          .then((blob) => {
            setClipUrl(URL.createObjectURL(blob));
          })
          .catch((e) => {
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
      const frames = await extractVideoFrames(file, 3);
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
                    setFacing((f) => (f === "environment" ? "user" : "environment"));
                    void startCamera();
                  }}
                >
                  <SwitchCamera className="size-4" aria-hidden />
                  Flip
                </Button>
                <Button size="lg" variant="ghost" disabled={busy} onClick={stopCamera}>
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
