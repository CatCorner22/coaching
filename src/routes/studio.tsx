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
import { fuseCoach } from "@/lib/ml/fuse";
import type { CoachReport } from "@/lib/ml/types";
import { useJournal } from "@/lib/stores/journal";
import { useNegotiate } from "@/lib/stores/negotiate";
import { useSession } from "@/lib/stores/session";
import { useSettings } from "@/lib/stores/settings";
import { listenForWords, playCoachVoice, stopCoachVoice } from "@/lib/voice/play";
import { buildDeterministic } from "@/lib/ml/predict";

export const Route = createFileRoute("/studio")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): { tie?: string } => ({
    tie: typeof s.tie === "string" && s.tie.length > 0 ? s.tie : undefined,
  }),
  component: StudioPage,
});

const TIE_LIMIT_IDS: Record<string, string[]> = {
  "takate-kote": ["gote"],
  ebi: ["gote", "predicament"],
  "gyaku-ebi": ["gote", "predicament"],
  "hogtie-floor": ["predicament"],
  matanawa: ["crotch"],
  karada: ["torso"],
  shinju: ["torso"],
  tasuki: ["torso"],
  hishi: ["torso"],
  kikkou: ["torso"],
  "partial-suspension": ["suspension"],
};

const FURNITURE_LIMIT_IDS: Record<string, string[]> = {
  "massage-table": ["bench"],
  "sex-bench": ["bench"],
  "st-andrews-cross": ["cross"],
  "sex-swing": ["swing"],
  pole: ["pole"],
  floggers: ["impact"],
  hismith: ["machine"],
  "bad-dragon": ["toys"],
};

function blockedByIds(slug: string | undefined, table: Record<string, string[]>, noIds: Set<string>) {
  return !!slug && (table[slug] ?? []).some((id) => noIds.has(id));
}

function StudioPage() {
  const search = Route.useSearch();
  const settings = useSettings();
  const session = useSession();
  const nerveHits = useJournal((j) => j.nerveHits);
  const addEntry = useJournal((j) => j.add);
  const items = useNegotiate((s) => s.items);
  const hardNos = useMemo(() => items.filter((i) => i.rank === "no"), [items]);
  const hardNoIds = useMemo(() => new Set(hardNos.map((item) => item.id)), [hardNos]);
  const hardNoKey = useMemo(() => hardNos.map((item) => `${item.id}:${item.label}`).sort().join("\u0000"), [hardNos]);
  const [capture, setCapture] = useState<CaptureResult | null>(null);
  const [report, setReport] = useState<CoachReport | null>(null);
  const [pending, setPending] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [refusal, setRefusal] = useState(false);
  const [saved, setSaved] = useState(false);
  const [question, setQuestion] = useState("");
  const [micArmed, setMicArmed] = useState(false);
  const [micStatus, setMicStatus] = useState<"idle" | "starting" | "active" | "error" | "unsupported">("idle");
  const analysisRequestRef = useRef(0);
  const tie = getTie(session.tieSlug ?? "");
  const tieBlocked = blockedByIds(session.tieSlug, TIE_LIMIT_IDS, hardNoIds);
  const furnitureBlocked = blockedByIds(session.furnitureSlug, FURNITURE_LIMIT_IDS, hardNoIds);
  const mediaBlocked = hardNoIds.has("photos");

  useEffect(() => {
    if (tieBlocked) useSession.getState().setTie(undefined);
    if (furnitureBlocked) useSession.getState().setFurniture(undefined);
    if (mediaBlocked) {
      analysisRequestRef.current += 1;
      setCapture(null);
      setReport(null);
      setPending(false);
    }
  }, [tieBlocked, furnitureBlocked, mediaBlocked]);

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
  const nagged = useRef(false);

  useEffect(() => {
    if (!settings.listen || !micArmed) return;
    return listenForWords(
      [settings.safeword, settings.yellowWord, settings.greenWord, "red"],
      (w) => {
        const t = w.toLowerCase();
        if (t === settings.safeword.toLowerCase() || t === "red") stopSession("safeword");
        else if (t === settings.yellowWord.toLowerCase()) {
          if (useSession.getState().stopped) return;
          stopSession("yellow");
        } else if (t === settings.greenWord.toLowerCase()) {
          if (useSession.getState().stopped) return;
          checked();
          if (settings.voice) void playCoachVoice("Green received. Keep checking consent and symptoms directly.");
        }
      },
      (status) => {
        setMicStatus(status);
        if (status === "error" || status === "unsupported" || status === "idle") {
          setMicArmed(false);
        }
      },
    );
  }, [
    settings.listen,
    micArmed,
    settings.safeword,
    settings.yellowWord,
    settings.greenWord,
    settings.voice,
    stopSession,
    checked,
  ]);

  useEffect(() => {
    setSaved(false);
    analysisRequestRef.current += 1;
    setPending(false);
    setAnalysisError(null);
  }, [
    capture,
    session.tieSlug,
    session.stepIndex,
    session.furnitureSlug,
    question,
    hardNoKey,
    settings.riggerName,
    settings.bottomName,
    settings.style,
  ]);
  const det = useMemo(() => {
    if (!capture) return null;
    return buildDeterministic(capture.observations, null);
  }, [capture]);

  const stopped = useSession((s) => s.stopped);
  const stepIndex = useSession((s) => s.stepIndex);
  const tieSlug = useSession((s) => s.tieSlug);
  const furnitureSlug = useSession((s) => s.furnitureSlug);
  const elapsed = useSession((s) => s.elapsed);
  const lastCheckAt = useSession((s) => s.lastCheckAt);

  useEffect(() => {
    if (!stopped) return;
    analysisRequestRef.current += 1;
    stopCoachVoice();
    setMicArmed(false);
    setPending(false);
    setCapture(null);
    setReport(null);
  }, [stopped]);

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
    if (session.stopped || mediaBlocked) return;
    const request = ++analysisRequestRef.current;
    setPending(true);
    setRefusal(false);
    setAnalysisError(null);
    try {
      const res = await analyzeRope({
        data: {
          images: capture.jpegs.slice(0, 3),
          frameLabels: capture.frameLabels.slice(0, 3),
          deterministic: det,
          tieSlug,
          stepIndex,
          elapsedSec: elapsed,
          question: question || undefined,
          furnitureSlug,
          hardNos: hardNos.map((n) => `${n.id}: ${n.label}`),
          protocol: {
            rigger: settings.riggerName || "rigger",
            bottom: settings.bottomName || "partner",
            style: settings.style,
          },
          consent: capture.consent,
        },
      });
      if (request !== analysisRequestRef.current || useSession.getState().stopped) return;
      if (res.ok) {
        setRefusal(res.refusal);
        setReport(res.report);
        if (res.report.final.recommend === "stop") session.stop("coach");
        else if (settings.voice) void playCoachVoice(res.report.final.speak);
      } else {
        setAnalysisError(res.error || "The analysis could not be completed.");
      }
    } catch (cause) {
      if (request === analysisRequestRef.current) {
        setAnalysisError(cause instanceof Error ? cause.message : "The analysis could not be completed.");
      }
    } finally {
      if (request === analysisRequestRef.current) setPending(false);
    }
  }

  function acceptCapture(next: CaptureResult) {
    analysisRequestRef.current += 1;
    setPending(false);
    setAnalysisError(null);
    setReport(null);
    setCapture(next);
  }

  function discardCapture() {
    analysisRequestRef.current += 1;
    setPending(false);
    setAnalysisError(null);
    setReport(null);
    setCapture(null);
  }

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
      void playCoachVoice("Direct-check reminder. Ask about comfort, sensation, motion, and change. Release for concern.");
    }
    if (!dueCheck) nagged.current = false;
  }, [dueCheck, settings.voice]);

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      {session.stopped && (
        <div className="mb-6 rounded-lg border border-danger/40 bg-danger/10 p-4">
          <p className="font-display text-3xl text-danger">Stop</p>
          <p className="mt-1 text-sm text-fg">
            Stop loading immediately. Support your partner's position, release or cut rope without
            pulling it tighter, and call emergency services for breathing trouble, loss of
            consciousness, severe color or temperature change, chest pain, or persistent numbness
            or weakness.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                analysisRequestRef.current += 1;
                stopCoachVoice();
                setCapture(null);
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
            label="reminder"
          />
        </div>
      </div>
      {hardNos.length > 0 && (
        <p className="mt-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          Negotiated no: {hardNos.map((n) => n.label).join(" · ")}
        </p>
      )}
      {settings.listen && !session.stopped && (
        <div className="mt-3 rounded-md border border-border bg-surface px-3 py-2 text-xs text-muted">
          <button
            type="button"
            className="font-medium text-fg underline-offset-2 hover:underline"
            onClick={() => {
              if (micArmed) {
                setMicArmed(false);
                setMicStatus("idle");
              } else {
                setMicStatus("starting");
                setMicArmed(true);
              }
            }}
          >
            {micArmed ? "Turn off optional mic word detection" : "Enable optional mic word detection for this session"}
          </button>
          <span className="ml-2">Status: {micStatus}. Convenience only; never a safety control.</span>
        </div>
      )}
      {dueCheck && (
        <p className="mt-4 rounded-md border border-warn/30 bg-warn/10 px-3 py-2 text-sm text-warn">
          The optional direct-check reminder elapsed. It is not a safety deadline or clearance.{" "}
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
              <option
                key={t.slug}
                value={t.slug}
                disabled={blockedByIds(t.slug, TIE_LIMIT_IDS, hardNoIds)}
              >
                {t.name}{blockedByIds(t.slug, TIE_LIMIT_IDS, hardNoIds) ? " — negotiated no" : ""}
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
              <option
                key={d.slug}
                value={d.slug}
                disabled={blockedByIds(d.slug, FURNITURE_LIMIT_IDS, hardNoIds)}
              >
                {d.name}{blockedByIds(d.slug, FURNITURE_LIMIT_IDS, hardNoIds) ? " — negotiated no" : ""}
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
                  Image heuristic marked {det.wrapCount} possible horizontal rope-like feature
                  {det.wrapCount === 1 ? "" : "s"}. This does not validate the selected tie or step.
                </p>
              )}
            </div>
          )}
          <div className="mt-4">
            {mediaBlocked && (
              <p className="mb-3 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
                Media is a negotiated no. Change that decision together before enabling photo or video capture.
              </p>
            )}
            <CameraCapture
              onCapture={acceptCapture}
              onDiscard={discardCapture}
              disabled={session.stopped || mediaBlocked}
            />
          </div>
          {capture && (
            <WrapOverlay src={capture.preview} obs={capture.previewObservation} />
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
            placeholder="Optional: which visible area or image limitation should the report describe?"
            aria-label="Optional observation question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={session.stopped}
          />
          {analysisError && <p className="text-sm text-danger" role="alert">{analysisError}</p>}
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void runAnalyze()} disabled={!capture || pending || session.stopped || mediaBlocked}>
              Observe selected stills
            </Button>
            <Button variant="outline" onClick={() => session.checked()} disabled={session.stopped}>
              Hands checked
            </Button>
            <Button variant="danger" onClick={() => session.stop("manual")}>
              {settings.safeword}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            disabled={!report}
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
              setSaved(true);
            }}
          >
            {saved ? "Saved on this device" : "Save to journal"}
          </Button>
          <p className="text-xs leading-relaxed text-subtle">
            Captures stay in this page's memory until replaced, stopped, or the page closes; the
            journal does not save them. Analyze sends compressed frames to xAI. xAI may retain API
            inputs and outputs under the workspace's data-retention settings. A local auditor can
            veto the model, but it cannot prove that a tie is safe.
          </p>
        </div>
      </div>
    </div>
  );
}
