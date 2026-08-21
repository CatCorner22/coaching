import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CameraCapture, type CaptureResult } from "@/components/camera-capture";
import { WrapOverlay } from "@/components/wrap-overlay";
import { CoachPanel } from "@/components/coach-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { analyzeRope } from "@/lib/ai/analyze";
import { TIES, getTie } from "@/lib/kb";
import { sampleHands } from "@/lib/ml/detect";
import { fuseCoach } from "@/lib/ml/fuse";
import { toImageData } from "@/lib/media";
import type { CoachReport } from "@/lib/ml/types";
import type { RGB } from "@/lib/ml/color";
import { useJournal } from "@/lib/stores/journal";
import { useSession } from "@/lib/stores/session";
import { useSettings } from "@/lib/stores/settings";
import { formatDuration } from "@/lib/utils";
import { listenForWords, playCoachVoice } from "@/lib/voice/play";
import { buildDeterministic } from "@/lib/ml/predict";

export const Route = createFileRoute("/studio")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => {
    if (typeof s.tie === "string" && s.tie.length > 0) return { tie: s.tie };
    return {};
  },
  component: StudioPage,
});

function StudioPage() {
  const search = Route.useSearch();
  const settings = useSettings();
  const session = useSession();
  const nerveHits = useJournal((j) => j.nerveHits);
  const addEntry = useJournal((j) => j.add);
  const [capture, setCapture] = useState<CaptureResult | null>(null);
  const [baseline, setBaseline] = useState<RGB | null>(null);
  const [report, setReport] = useState<CoachReport | null>(null);
  const [pending, setPending] = useState(false);
  const [refusal, setRefusal] = useState(false);
  const [question, setQuestion] = useState("");

  useEffect(() => {
    if (search.tie) session.setTie(search.tie);
    if (!session.startedAt) session.start();
    const id = window.setInterval(() => session.tick(Date.now()), 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.tie]);

  useEffect(() => {
    if (!settings.listen) return;
    return listenForWords([settings.safeword, settings.yellowWord, "next", "analyze"], (w) => {
      if (w.toLowerCase() === settings.safeword.toLowerCase()) session.stop("safeword");
    });
  }, [settings.listen, settings.safeword, settings.yellowWord, session]);

  const tie = getTie(session.tieSlug ?? "");
  const det = useMemo(() => {
    if (!capture) return null;
    return buildDeterministic(capture.observations, baseline);
  }, [capture, baseline]);

  useEffect(() => {
    if (!det) return;
    setReport(
      fuseCoach({
        det,
        frames: capture?.observations ?? [],
        llm: null,
        tie,
        stepIndex: session.stepIndex,
        elapsedSec: session.elapsed,
        priorNerveHits: nerveHits,
      }),
    );
  }, [det, capture, tie, session.stepIndex, session.elapsed, nerveHits]);

  async function runAnalyze() {
    if (!capture || !det) return;
    setPending(true);
    setRefusal(false);
    try {
      const res = await analyzeRope({
        data: {
          images: capture.jpegs.slice(0, 3),
          deterministic: det,
          tieSlug: session.tieSlug,
          stepIndex: session.stepIndex,
          elapsedSec: session.elapsed,
          question: question || undefined,
          protocol: {
            rigger: settings.riggerName || "rigger",
            bottom: settings.bottomName || "your wife",
            style: settings.style,
          },
        },
      });
      if (res.ok) {
        setRefusal(res.refusal);
        setReport(res.report);
        if (settings.voice) void playCoachVoice(res.report.final.speak);
        if (res.report.final.recommend === "stop") session.stop("coach");
      }
    } finally {
      setPending(false);
    }
  }

  async function calibrate(file: File) {
    const imageData = await toImageData(file, 240);
    const rgb = sampleHands(imageData);
    if (rgb) setBaseline(rgb);
  }

  const dueCheck =
    !!session.lastCheckAt &&
    Date.now() - session.lastCheckAt > settings.circulationMins * 60 * 1000;

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      {session.stopped && (
        <div className="mb-6 rounded-lg border border-danger/40 bg-danger/10 p-4">
          <p className="font-display text-3xl text-danger">Stop</p>
          <p className="mt-1 text-sm text-fg">
            Safeword or coach halt. Shears. Cut tensioned stems first. Hands, then throat, then
            the rest. Aftercare is the scene now.
          </p>
          <Button className="mt-3" variant="outline" onClick={() => session.reset()}>
            Reset studio
          </Button>
        </div>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted">写 · studio</p>
          <h1 className="mt-1 font-display text-4xl">Read the rope</h1>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Badge variant="danger">{settings.safeword}</Badge>
          <span className="tabular-nums text-muted">{formatDuration(session.elapsed)}</span>
        </div>
      </div>
      {dueCheck && (
        <p className="mt-4 rounded-md border border-warn/30 bg-warn/10 px-3 py-2 text-sm text-warn">
          Circulation check is due. Color, heat, refill, squeeze, which finger.
        </p>
      )}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-wide text-subtle">Tie</label>
          <select
            className="mt-1 h-11 w-full rounded-md border border-border bg-elevated px-3 text-sm"
            value={session.tieSlug ?? ""}
            onChange={(e) => session.setTie(e.target.value || undefined)}
          >
            <option value="">Freeform</option>
            {TIES.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
          {tie && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <p className="text-sm text-muted">
                Step {session.stepIndex + 1}/{tie.steps.length}: {tie.steps[session.stepIndex]?.title}
              </p>
              <Button
                size="sm"
                variant="ghost"
                disabled={session.stepIndex === 0}
                onClick={() => session.setStep(session.stepIndex - 1)}
              >
                Prev
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={session.stepIndex >= tie.steps.length - 1}
                onClick={() => session.setStep(session.stepIndex + 1)}
              >
                Next
              </Button>
            </div>
          )}
          <div className="mt-4">
            <CameraCapture onCapture={setCapture} />
          </div>
          {capture && (
            <WrapOverlay src={capture.preview} obs={capture.observations.at(-1)} />
          )}
        </div>
        <div className="space-y-4">
          <CoachPanel
            report={report}
            voice={settings.voice}
            pending={pending}
            refusal={refusal}
          />
          <textarea
            className="h-20 w-full rounded-md border border-border bg-elevated p-3 text-sm"
            placeholder="Optional: what you want coached in this still"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void runAnalyze()} disabled={!capture || pending}>
              Ask Grok
            </Button>
            <Button variant="outline" onClick={() => session.checked()}>
              Hands checked
            </Button>
            <Button variant="danger" onClick={() => session.stop("manual")}>
              {settings.safeword}
            </Button>
          </div>
          <label className="block text-xs text-muted">
            Calibration still (unbound hands)
            <input
              type="file"
              accept="image/*"
              className="mt-1 block w-full text-xs"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void calibrate(f);
              }}
            />
            {baseline && <span className="text-ok"> Baseline stored on this device.</span>}
          </label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (!report) return;
              addEntry({
                tieSlug: session.tieSlug,
                minutes: Math.round(session.elapsed / 60),
                notes: report.final.coaching.slice(0, 280),
                rating: report.final.recommend === "stop" ? 1 : 4,
                flags: report.final.flags.map((f) => f.code),
                photoCount: capture?.jpegs.length ?? 0,
              });
            }}
          >
            Save to journal
          </Button>
          <p className="text-xs leading-relaxed text-subtle">
            Stills live in this browser until you analyze. Analyze sends compressed frames to Grok.
            A local auditor can veto the model. Nude is fine. Unattended rope is not.
          </p>
        </div>
      </div>
    </div>
  );
}
