import { Camera, Flashlight, ImagePlus, SwitchCamera, Video } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { openRopeCamera, setTorch, startClip, torchAvailable } from "@/lib/camera/stream";
import { pickBest, scoreFrame, type FrameQuality } from "@/lib/camera/quality";
import { compressToJpeg, extractVideoFrames, toImageData } from "@/lib/media";
import { observeFrame } from "@/lib/ml/detect";
import type { FrameObservation } from "@/lib/ml/types";
import { cn } from "@/lib/utils";

export type CaptureResult = {
  preview: string;
  jpegs: string[];
  observations: FrameObservation[];
  kind: "photo" | "video";
  quality: FrameQuality;
};

type Guide = "torso" | "back" | "hands" | "legs";

export function CameraCapture({
  onCapture,
}: {
  onCapture: (c: CaptureResult) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const clipRef = useRef<{ stop: () => Promise<Blob> } | null>(null);
  const [live, setLive] = useState(false);
  const [facing, setFacing] = useState<"user" | "environment">("environment");
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [torch, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [guide, setGuide] = useState<Guide>("torso");
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startLive(next: "user" | "environment" = facing) {
    setError(null);
    stopLive();
    try {
      const stream = await openRopeCamera(next);
      streamRef.current = stream;
      setHasTorch(torchAvailable(stream));
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setLive(true);
      setFacing(next);
    } catch {
      setError("Camera blocked in this view. Use Photo or Video — those still run the sharpness picker.");
    }
  }

  function stopLive() {
    clipRef.current = null;
    setRecording(false);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setLive(false);
    setTorchOn(false);
  }

  async function emitFromMedia(
    kind: "photo" | "video",
    jpegs: string[],
    observations: FrameObservation[],
    qualities: FrameQuality[],
  ) {
    const quality =
      qualities.sort((a, b) => b.score - a.score)[0] ??
      ({ sharpness: 0, exposure: 0, ropeHint: 0, score: 0, notes: ["No frame"] } satisfies FrameQuality);
    setHint(quality.notes[0] ?? `Sharpness ${Math.round(quality.sharpness * 100)}`);
    onCapture({
      preview: jpegs[0] ?? "",
      jpegs,
      observations,
      kind,
      quality,
    });
  }

  async function snapBurst() {
    const v = videoRef.current;
    if (!v) return;
    setBusy(true);
    try {
      const frames: { jpeg: string; imageData: ImageData }[] = [];
      for (let i = 0; i < 3; i++) {
        frames.push({
          jpeg: await compressToJpeg(v, 768, 0.74),
          imageData: await toImageData(v, 240),
        });
        await new Promise((r) => setTimeout(r, 90));
      }
      const best = pickBest(
        frames.map((f) => ({ data: f.imageData, item: f })),
        1,
      );
      const chosen = best[0] ?? frames[0]!;
      await emitFromMedia(
        "photo",
        [chosen.jpeg],
        [observeFrame(chosen.imageData)],
        [scoreFrame(chosen.imageData)],
      );
    } finally {
      setBusy(false);
    }
  }

  async function toggleRecord() {
    const stream = streamRef.current;
    if (!stream) return;
    if (!recording) {
      clipRef.current = startClip(stream);
      setRecording(true);
      window.setTimeout(() => {
        if (clipRef.current) void finishRecord();
      }, 7000);
      return;
    }
    await finishRecord();
  }

  async function finishRecord() {
    const handle = clipRef.current;
    clipRef.current = null;
    setRecording(false);
    if (!handle) return;
    setBusy(true);
    try {
      const blob = await handle.stop();
      await ingestVideo(blob);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not record");
    } finally {
      setBusy(false);
    }
  }

  async function ingestVideo(file: Blob) {
    const frames = await extractVideoFrames(file, 6);
    const ranked = pickBest(
      frames.map((f) => ({ data: f.imageData, item: f })),
      3,
    );
    let prev: Uint8ClampedArray | undefined;
    const observations = ranked.map((f) => {
      const obs = observeFrame(f.imageData, prev);
      prev = f.imageData.data;
      return obs;
    });
    await emitFromMedia(
      "video",
      ranked.map((f) => f.jpeg),
      observations,
      ranked.map((f) => scoreFrame(f.imageData)),
    );
  }

  async function onFile(file: File, kind: "photo" | "video") {
    setBusy(true);
    setError(null);
    try {
      if (kind === "video" || file.type.startsWith("video/")) {
        await ingestVideo(file);
      } else {
        const jpeg = await compressToJpeg(file, 768, 0.74);
        const imageData = await toImageData(file, 240);
        await emitFromMedia("photo", [jpeg], [observeFrame(imageData)], [scoreFrame(imageData)]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read media");
    } finally {
      setBusy(false);
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
          <div className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 bg-[url('/hero.jpg')] bg-cover bg-center">
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
      {hint && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="grid grid-cols-2 gap-2">
        <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-accent text-sm font-medium text-accent-fg">
          <ImagePlus className="size-4" />
          Photo
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onFile(f, "photo");
              e.target.value = "";
            }}
          />
        </label>
        <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-elevated text-sm font-medium">
          <Video className="size-4" />
          Video
          <input
            type="file"
            accept="video/*"
            capture="environment"
            className="sr-only"
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
            <Button className="flex-1" onClick={() => void snapBurst()} disabled={busy}>
              Burst still
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => void toggleRecord()} disabled={busy}>
              {recording ? "Stop clip" : "Record 7s"}
            </Button>
            {hasTorch && (
              <Button
                variant={torch ? "default" : "secondary"}
                size="icon"
                onClick={() => void toggleTorch()}
                aria-label="Torch"
              >
                <Flashlight />
              </Button>
            )}
            <Button
              variant="secondary"
              size="icon"
              onClick={() => void startLive(facing === "user" ? "environment" : "user")}
              aria-label="Flip camera"
            >
              <SwitchCamera />
            </Button>
            <Button variant="ghost" onClick={stopLive}>
              Close
            </Button>
          </>
        ) : (
          <Button variant="outline" className="flex-1" onClick={() => void startLive()}>
            Open live camera
          </Button>
        )}
      </div>
      {busy && <p className="text-xs text-muted">Scoring frames for rope and sharpness…</p>}
    </div>
  );
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
