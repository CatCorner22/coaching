import { Camera, Sparkles, SwitchCamera, Video } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { analyzeRope } from "@/lib/ai/analyze";
import { authEnabled } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { openRopeCamera, startClip, type ClipHandle } from "@/lib/camera/stream";
import { scoreFrame } from "@/lib/camera/quality";
import { buildAcademyFeedback, type AcademyFeedback } from "@/lib/learn/academy-feedback";
import { extractVideoFrames, processMediaFrame } from "@/lib/media";
import { buildDeterministic } from "@/lib/ml/predict";
import { observeFrame } from "@/lib/ml/detect";
import type { Tie } from "@/lib/kb/types";
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

export function AcademyObservePanel({
  tie,
  stepIndex,
  expectedBands,
  cloudVoice,
  className,
}: AcademyObservePanelProps) {
  const settings = useSettings();
  const { user } = useCurrentUserState();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const clipRef = useRef<ClipHandle | null>(null);
  const prevFrameRef = useRef<Uint8ClampedArray | undefined>(undefined);

  const [cameraOn, setCameraOn] = useState(false);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<AcademyFeedback | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [clipUrl, setClipUrl] = useState<string | null>(null);
  const [aiNote, setAiNote] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    clipRef.current?.cancel();
    clipRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  }, []);

  useEffect(() => () => {
    stopCamera();
    if (clipUrl) URL.revokeObjectURL(clipUrl);
  }, [stopCamera, clipUrl]);

  async function startCamera() {
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
    setAiNote(null);
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

  async function recordClip() {
    const stream = streamRef.current;
    if (!stream) {
      setError("Start the camera first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      clipRef.current?.cancel();
      if (clipUrl) URL.revokeObjectURL(clipUrl);
      const clip = startClip(stream);
      clipRef.current = clip;
      window.setTimeout(() => {
        void clip.stop().then((blob) => {
          setClipUrl(URL.createObjectURL(blob));
          setBusy(false);
        }).catch((e) => {
          setError(e instanceof Error ? e.message : "Could not record clip.");
          setBusy(false);
        });
      }, 3000);
      return;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not record clip.");
    } finally {
      setBusy(false);
    }
  }

  async function runCloudAnalyze() {
    if (!preview) {
      setError("Snap a photo first.");
      return;
    }
    if (authEnabled && !user) {
      setError("Sign in to run cloud observation on selected stills.");
      return;
    }
    if (!settings.consented || !settings.photosOk) {
      setError("Enable photo consent in Settings before cloud observation.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const v = videoRef.current;
      let quality = { sharpness: 0.5, exposure: 0.5, score: 0.5 };
      if (v && v.readyState >= 2) {
        const canvas = document.createElement("canvas");
        canvas.width = v.videoWidth;
        canvas.height = v.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(v, 0, 0);
          quality = scoreFrame(ctx.getImageData(0, 0, canvas.width, canvas.height));
        }
      }
      const batchId = `academy-${Date.now()}`;
      const res = await analyzeRope({
        data: {
          images: [preview],
          frameLabels: ["F01"],
          deterministic: buildDeterministic([]),
          tieSlug: tie?.slug,
          stepIndex,
          triage: "none",
          media: { mode: "static_photos", quality },
          consent: {
            adults: true,
            nonExplicit: true,
            nonSecret: true,
            nonCoerced: true,
            allPeopleConsented: true,
            activity: true,
            recording: true,
            upload: true,
            output: true,
            batchId,
            confirmedAt: Date.now(),
          },
        },
      });
      if (res.ok) {
        const note =
          res.observationReport.observations[0]?.visible_fact ??
          res.observationReport.limitations[0] ??
          "Cloud observation complete — not clearance.";
        setAiNote(note);
        if (settings.voice) void playCoachVoice(res.report.final.speak, cloudVoice);
      } else {
        setError(res.error ?? "Cloud observation failed.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cloud observation failed.");
    } finally {
      setBusy(false);
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
            Frame your <strong className="font-medium text-fg">empty prop and rope only</strong>. The app gives
            heuristic guesses — never safety clearance.
          </p>
        </div>
      </div>

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
            <Button size="lg" variant="secondary" disabled={busy} onClick={() => void recordClip()}>
              <Video className="size-4" aria-hidden />
              Record 3s
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
        {preview && authEnabled && (
          <Button size="lg" variant="outline" disabled={busy} onClick={() => void runCloudAnalyze()}>
            <Sparkles className="size-4" aria-hidden />
            Cloud observe
          </Button>
        )}
      </div>

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
              Bands: {feedback.wrapCount} detected · {Math.round(feedback.confidence * 100)}% step guess · not
              validated
            </p>
          )}
        </aside>
      )}

      {aiNote && (
        <p className="mt-3 rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-muted">{aiNote}</p>
      )}

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </section>
  );
}
