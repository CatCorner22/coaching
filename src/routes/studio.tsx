import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { CameraCapture, type CaptureResult } from "@/components/camera-capture";
import { ClockRing, RopeFigure } from "@/components/rope-figure";
import { WrapOverlay } from "@/components/wrap-overlay";
import { CoachPanel } from "@/components/coach-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { analyzeRope } from "@/lib/ai/analyze";
import { DUNGEON, TIES, getTie } from "@/lib/kb";
import { sampleHands } from "@/lib/ml/detect";
import { fuseCoach } from "@/lib/ml/fuse";
import { toImageData } from "@/lib/media";
import type { CoachReport } from "@/lib/ml/types";
import type { RGB } from "@/lib/ml/color";
import { saveStill, useJournal } from "@/lib/stores/journal";
import { useNegotiate } from "@/lib/stores/negotiate";
import { useSession } from "@/lib/stores/session";
import { useSettings } from "@/lib/stores/settings";
import { listenForWords, playCoachVoice } from "@/lib/voice/play";
import { buildDeterministic } from "@/lib/ml/predict";

export const Route = createFileRoute("/studio")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): { tie?: string } => ({
    tie: typeof s.tie === "string" && s.tie.length > 0 ? s.tie : undefined,
  }),
  component: StudioPage,
});

function StudioPage() {
  const search = Route.useSearch();
  const settings = useSettings();
  const session = useSession();
  const nerveHits = useJournal((j) => j.nerveHits);
  const addEntry = useJournal((j) => j.add);
  const items = useNegotiate((s) => s.items);
  const hardNos = useMemo(() => items.filter((i) => i.rank === "no"), [items]);
  const [capture, setCapture] = useState<CaptureResult | null>(null);
  const [prior, setPrior] = useState<CaptureResult | null>(null);
  const [baseline, setBaseline] = useState<RGB | null>(null);
  const [report, setReport] = useState<CoachReport | null>(null);
  const [pending, setPending] = useState(false);
  const [refusal, setRefusal] = useState(false);
  const [saved, setSaved] = useState(false);
  const [question, setQuestion] = useState("");
  const tie = getTie(session.tieSlug ?? "");

  useEffect(() => {
    if (search.tie) session.setTie(search.tie);
    if (!session.startedAt) session.start();
    const id = window.setInterval(() => session.tick(Date.now()), 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.tie]);

  const stopSession = useSession((s) => s.stop);
  const setStep = useSession((s) => s.setStep);
  const checked = useSession((s) => s.checked);
  const analyzeRef = useRef<() => void>(() => undefined);
  const nagged = useRef(false);

  useEffect(() => {
    if (!settings.listen) return;
    return listenForWords(
      [settings.safeword, settings.yellowWord, settings.greenWord, "red", "next", "analyze", "hands"],
      (w) => {
        const t = w.toLowerCase();
        if (t === settings.safeword.toLowerCase() || t === "red") stopSession("safeword");
        else if (t === settings.yellowWord.toLowerCase()) {
          if (useSession.getState().stopped) return;
          checked();
          if (settings.voice) void playCoachVoice("Yellow. Check color, heat, squeeze. Do not add rope.");
        } else if (t === settings.greenWord.toLowerCase()) {
          if (useSession.getState().stopped) return;
          checked();
          if (settings.voice) void playCoachVoice("Green. Continue.");
        } else if (t === "next") {
          const s = useSession.getState();
          if (s.stopped) return;
          const max = getTie(s.tieSlug ?? "")?.steps.length ?? 1;
          s.setStep(Math.min(s.stepIndex + 1, Math.max(0, max - 1)));
        } else if (t === "analyze") {
          if (useSession.getState().stopped) return;
          analyzeRef.current();
        } else if (t === "hands") {
          checked();
        }
      },
    );
  }, [
    settings.listen,
    settings.safeword,
    settings.yellowWord,
    settings.greenWord,
    settings.voice,
    stopSession,
    checked,
  ]);

  useEffect(() => {
    setSaved(false);
  }, [capture]);
  const det = useMemo(() => {
    if (!capture) return null;
    return buildDeterministic(capture.observations, baseline);
  }, [capture, baseline]);

  const stopped = useSession((s) => s.stopped);
  const stepIndex = useSession((s) => s.stepIndex);
  const tieSlug = useSession((s) => s.tieSlug);
  const furnitureSlug = useSession((s) => s.furnitureSlug);
  const elapsed = useSession((s) => s.elapsed);
  const lastCheckAt = useSession((s) => s.lastCheckAt);

  useEffect(() => {
    if (!det || !capture) return;
    if (useSession.getState().stopped) return;
    const next = fuseCoach({
      det,
      frames: capture.observations,
      llm: null,
      tie,
      stepIndex,
      elapsedSec: useSession.getState().elapsed,
      priorNerveHits: nerveHits,
      hardNos: hardNos.map((n) => n.label),
    });
    setReport(next);
    if (next.final.recommend === "stop") stopSession("coach");
  }, [det, capture, tie, stepIndex, nerveHits, hardNos, stopSession]);

  async function runAnalyze() {
    if (!capture || !det) return;
    if (session.stopped) return;
    setPending(true);
    setRefusal(false);
    try {
      const res = await analyzeRope({
        data: {
          images: capture.jpegs.slice(0, 3),
          deterministic: det,
          tieSlug,
          stepIndex,
          elapsedSec: elapsed,
          question: question || undefined,
          furnitureSlug,
          hardNos: hardNos.map((n) => n.label),
          protocol: {
            rigger: settings.riggerName || "rigger",
            bottom: settings.bottomName || "your wife",
            style: settings.style,
          },
        },
      });
      if (res.ok) {
        if (useSession.getState().stopped) return;
        setRefusal(res.refusal);
        setReport(res.report);
        if (res.report.final.recommend === "stop") session.stop("coach");
        if (settings.voice) void playCoachVoice(res.report.final.speak);
      }
    } finally {
      setPending(false);
    }
  }
  analyzeRef.current = () => {
    void runAnalyze();
  };

  const spoke = useRef<number | null>(null);
  useEffect(() => {
    if (spoke.current === null) {
      spoke.current = session.stepIndex;
      return;
    }
    if (spoke.current === session.stepIndex) return;
    spoke.current = session.stepIndex;
    if (session.stopped) return;
    const line = tie?.steps[session.stepIndex]?.speak;
    if (line && settings.voice) void playCoachVoice(line);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.stepIndex, tie?.slug, settings.voice]);

  const dueCheck =
    !!lastCheckAt && Date.now() - lastCheckAt > settings.circulationMins * 60 * 1000;

  useEffect(() => {
    if (dueCheck && settings.voice && !session.stopped && !nagged.current) {
      nagged.current = true;
      void playCoachVoice("Circulation check. Color, heat, squeeze.");
    }
    if (!dueCheck) nagged.current = false;
  }, [dueCheck, settings.voice]);

  async function calibrate(file: File) {
    const imageData = await toImageData(file, 240);
    const rgb = sampleHands(imageData);
    if (rgb) setBaseline(rgb);
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      {session.stopped && (
        <div className="mb-6 rounded-lg border border-danger/40 bg-danger/10 p-4">
          <p className="font-display text-3xl text-danger">Stop</p>
          <p className="mt-1 text-sm text-fg">
            Safeword or coach halt. Shears. Cut tensioned stems first. Hands, then throat, then
            the rest. Aftercare is the scene now.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCapture(null);
                setPrior(null);
                setReport(null);
                session.reset();
              }}
            >
              Reset studio
            </Button>
            <Button asChild variant="danger">
              <Link to="/emergency">Cut-down card</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/aftercare">Aftercare</Link>
            </Button>
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted">Studio</p>
          <h1 className="mt-1 font-display text-4xl">Read the rope</h1>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Badge variant="danger">{settings.safeword}</Badge>
          <ClockRing
            elapsed={session.elapsed}
            limitSec={settings.circulationMins * 60}
            label="hands"
          />
        </div>
      </div>
      {hardNos.length > 0 && (
        <p className="mt-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          Negotiated no: {hardNos.map((n) => n.label).join(" · ")}
        </p>
      )}
      {dueCheck && (
        <p className="mt-4 rounded-md border border-warn/30 bg-warn/10 px-3 py-2 text-sm text-warn">
          Circulation check is due. Color, heat, refill, squeeze, which finger.{" "}
          <Link to="/checkin" className="underline">
            Log it
          </Link>
        </p>
      )}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-wide text-subtle">Tie</label>
          <select
            className="mt-1 h-11 w-full rounded-md border border-border bg-elevated px-3 text-sm"
            value={tieSlug ?? ""}
            disabled={stopped}
            onChange={(e) => session.setTie(e.target.value || undefined)}
          >
            <option value="">Freeform</option>
            {TIES.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
          <label className="mt-3 block text-xs uppercase tracking-wide text-subtle">On</label>
          <select
            className="mt-1 h-11 w-full rounded-md border border-border bg-elevated px-3 text-sm"
            value={furnitureSlug ?? ""}
            disabled={stopped}
            onChange={(e) => session.setFurniture(e.target.value || undefined)}
          >
            <option value="">Floor / bed</option>
            {DUNGEON.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
          {tie && (
            <div className="mt-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm text-muted">
                  Step {session.stepIndex + 1}/{tie.steps.length}: {tie.steps[session.stepIndex]?.title}
                </p>
              <Button
                size="sm"
                variant="ghost"
                disabled={session.stopped || session.stepIndex === 0}
                onClick={() => {
                  if (session.stopped) return;
                  setStep(session.stepIndex - 1);
                }}
              >
                Prev
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={session.stopped || session.stepIndex >= tie.steps.length - 1}
                onClick={() => {
                  if (session.stopped) return;
                  setStep(session.stepIndex + 1);
                }}
              >
                Next
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={session.stopped}
                onClick={() => {
                  if (session.stopped) return;
                  const line = tie.steps[session.stepIndex]?.speak;
                  if (line) void playCoachVoice(line);
                }}
              >
                Speak step
              </Button>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-fg">
                {tie.steps[session.stepIndex]?.rigger}
              </p>
              <p className="mt-1 text-xs text-muted">Check. {tie.steps[session.stepIndex]?.check}</p>
              <div className="mx-auto mt-3 h-64 w-36">
                <RopeFigure
                  pose={tie.steps[session.stepIndex]?.expected.pose}
                  view={tie.steps[session.stepIndex]?.expected.view}
                  wraps={tie.steps.slice(0, session.stepIndex + 1).flatMap((x) => x.wraps)}
                  nerves={tie.nerves}
                  compact
                  className="text-muted"
                />
              </div>
              {det && (
                <p className="text-center text-xs tabular-nums text-subtle">
                  Camera sees {det.wrapCount} wrap{det.wrapCount === 1 ? "" : "s"} · this step wants{" "}
                  {tie.steps[session.stepIndex]?.expected.wrapBands ?? "—"}
                </p>
              )}
            </div>
          )}
          <div className="mt-4">
            <CameraCapture
              onCapture={(c) => {
                setPrior(capture);
                setCapture(c);
              }}
            />
          </div>
          {capture && (
            <WrapOverlay src={capture.preview} obs={capture.observations.at(-1)} />
          )}
          {prior && capture && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <figure>
                <img src={prior.preview} alt="Previous still" className="w-full rounded-md border border-border" />
                <figcaption className="mt-1 text-[11px] text-subtle">Previous</figcaption>
              </figure>
              <figure>
                <img src={capture.preview} alt="Current still" className="w-full rounded-md border border-border" />
                <figcaption className="mt-1 text-[11px] text-subtle">Now</figcaption>
              </figure>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <CoachPanel
            report={report}
            voice={settings.voice}
            pending={pending}
            refusal={refusal}
            halted={session.stopped}
          />
          <textarea
            className="h-20 w-full rounded-md border border-border bg-elevated p-3 text-sm"
            placeholder="Optional: what you want coached in this still"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void runAnalyze()} disabled={!capture || pending || session.stopped}>
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
            disabled={!report}
            onClick={() => {
              if (!report) return;
              const id = addEntry({
                tieSlug: session.tieSlug,
                minutes: Math.round(session.elapsed / 60),
                notes: report.final.coaching.slice(0, 280),
                rating: report.final.recommend === "stop" ? 1 : 4,
                flags: report.final.flags.map((f) => f.code),
                photoCount: capture?.jpegs.length ?? 0,
              });
              const still = capture?.preview ?? capture?.jpegs[0];
              if (still) void saveStill(id, still);
              setSaved(true);
            }}
          >
            {saved ? "Saved on this device" : "Save to journal"}
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
