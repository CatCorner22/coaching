import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  buildObservationReport,
  type ModelStatus,
  type ObservationReport,
  type TriageState,
} from "@/lib/observation/report";

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
  const captureContextKey = `${session.tieSlug ?? ""}|${session.stepIndex}|${session.furnitureSlug ?? ""}|${hardNoKey}`;
  const [capture, setCapture] = useState<CaptureResult | null>(null);
  const [report, setReport] = useState<CoachReport | null>(null);
  const [observationReport, setObservationReport] = useState<ObservationReport | null>(null);
  const [modelStatus, setModelStatus] = useState<ModelStatus>("not_requested");
  const [pending, setPending] = useState(false);
  const [analysisConsumed, setAnalysisConsumed] = useState(false);
  const [triage, setTriage] = useState<TriageState | "unanswered">("unanswered");
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [refusal, setRefusal] = useState(false);
  const [saved, setSaved] = useState(false);
  const [micArmed, setMicArmed] = useState(false);
  const [micStatus, setMicStatus] = useState<"idle" | "starting" | "active" | "error" | "unsupported">("idle");
  const analysisRequestRef = useRef(0);
  const tie = getTie(session.tieSlug ?? "");
  const instructorOnlyTie = tie?.minutes[1] === 0;
  const tieBlocked = blockedByIds(session.tieSlug, TIE_LIMIT_IDS, hardNoIds);
  const furnitureBlocked = blockedByIds(session.furnitureSlug, FURNITURE_LIMIT_IDS, hardNoIds);
  const mediaBlocked = hardNoIds.has("photos");

  useEffect(() => {
    if (tieBlocked || instructorOnlyTie) useSession.getState().setTie(undefined);
    if (furnitureBlocked) useSession.getState().setFurniture(undefined);
    if (mediaBlocked) {
      analysisRequestRef.current += 1;
      setCapture(null);
      setReport(null);
      setObservationReport(null);
      setAnalysisConsumed(false);
      setTriage("unanswered");
      setPending(false);
    }
  }, [tieBlocked, instructorOnlyTie, furnitureBlocked, mediaBlocked]);

  useEffect(() => {
    if (search.tie) {
      const requestedTie = getTie(search.tie);
      session.setTie(requestedTie && requestedTie.minutes[1] > 0 ? search.tie : undefined);
    }
    if (!session.startedAt) session.start();
    const id = window.setInterval(() => session.tick(Date.now()), 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.tie]);

  const stopSession = useSession((s) => s.stop);
  const setStep = useSession((s) => s.setStep);
  const nagged = useRef(false);
  const stopAlertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!settings.listen || !micArmed) return;
    return listenForWords(
      [settings.safeword, settings.yellowWord, "red"],
      (w) => {
        const t = w.toLowerCase();
        if (t === settings.safeword.toLowerCase() || t === "red") stopSession("safeword");
        else if (t === settings.yellowWord.toLowerCase()) {
          if (useSession.getState().stopped) return;
          stopSession("yellow");
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
    stopSession,
  ]);

  const captureContextRef = useRef(captureContextKey);

  useEffect(() => {
    const contextChanged = captureContextRef.current !== captureContextKey;
    captureContextRef.current = captureContextKey;
    setSaved(false);
    analysisRequestRef.current += 1;
    setPending(false);
    setAnalysisError(null);
    if (contextChanged && capture) {
      setCapture(null);
      setReport(null);
      setObservationReport(null);
      setModelStatus("not_requested");
      setAnalysisConsumed(false);
      setTriage("unanswered");
    }
  }, [capture, captureContextKey]);
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
    stopAlertRef.current?.focus();
  }, [stopped]);

  useEffect(() => () => stopCoachVoice(), []);

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
    setObservationReport(
      buildObservationReport({
        mediaMode: capture.kind === "video" ? "selected_video_stills" : "static_photos",
        consent: capture.consent,
        quality: capture.quality,
        allowedFrameIds: capture.frameLabels,
        modelStatus: "not_requested",
      }),
    );
    setModelStatus("not_requested");
    if (next.final.recommend === "stop") stopSession("coach");
  }, [det, capture, tie, stepIndex, nerveHits, hardNos, stopSession]);

  useEffect(() => {
    if (triage === "unanswered" || triage === "none") return;
    setAnalysisConsumed(true);
    setModelStatus("not_requested");
    setObservationReport(
      buildObservationReport({
        mediaMode: capture ? (capture.kind === "video" ? "selected_video_stills" : "static_photos") : "no_media",
        consent: capture?.consent,
        quality: capture?.quality,
        allowedFrameIds: capture?.frameLabels,
        modelStatus: "not_requested",
        triage,
      }),
    );
    stopSession(triage === "emergency" ? "medical-emergency" : triage === "prompt_medical" ? "medical" : "consent");
  }, [capture, triage, stopSession]);

  async function runAnalyze() {
    if (!capture || !det) return;
    if (session.stopped || mediaBlocked || analysisConsumed || triage !== "none") return;
    const request = ++analysisRequestRef.current;
    setAnalysisConsumed(true);
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
          hardNos: hardNos.map((n) => `${n.id}: ${n.label}`),
          triage,
          media: {
            mode: capture.kind === "video" ? "selected_video_stills" : "static_photos",
            quality: {
              sharpness: capture.quality.sharpness,
              exposure: capture.quality.exposure,
              score: capture.quality.score,
            },
          },
          consent: capture.consent,
        },
      });
      if (request !== analysisRequestRef.current || useSession.getState().stopped) return;
      if (res.ok) {
        setRefusal(res.refusal);
        setReport(res.report);
        setObservationReport(res.observationReport);
        setModelStatus(res.modelStatus);
        if (res.observationReport.urgent_stop || res.observationReport.disposition === "do_not_proceed") {
          session.stop("observation");
        } else if (settings.voice && !micArmed) {
          void playCoachVoice(res.report.final.speak, settings.voice);
        }
      } else {
        setAnalysisError(res.error || "The analysis could not be completed.");
        // The server sets this flag only when admission failed before any
        // provider request and the replay reservation was rolled back. Never
        // reopen a batch after an ambiguous network/provider outcome or replay.
        if (res.retryableBeforeProvider && res.providerAttempted === false) {
          setAnalysisConsumed(false);
        }
      }
    } catch (cause) {
      if (request === analysisRequestRef.current) {
        setAnalysisError(cause instanceof Error ? cause.message : "The analysis could not be completed.");
      }
    } finally {
      if (request === analysisRequestRef.current) setPending(false);
    }
  }

  const acceptCapture = useCallback((next: CaptureResult) => {
    analysisRequestRef.current += 1;
    setPending(false);
    setAnalysisError(null);
    setReport(null);
    setObservationReport(null);
    setModelStatus("not_requested");
    setAnalysisConsumed(false);
    // Capture was only possible after the action-first screen was answered
    // "none". Preserve that context so CameraCapture keeps the committed
    // permission ledger, withdrawal controls, and expiry timer for this batch.
    setCapture(next);
  }, []);

  const discardCapture = useCallback(() => {
    analysisRequestRef.current += 1;
    setPending(false);
    setAnalysisError(null);
    setReport(null);
    setObservationReport(null);
    setModelStatus("not_requested");
    setAnalysisConsumed(false);
    setTriage("unanswered");
    setCapture(null);
  }, []);

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
    if (line && settings.voice && !micArmed) void playCoachVoice(line, settings.voice);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.stepIndex, tie?.slug, settings.voice, micArmed]);

  const dueCheck =
    !!lastCheckAt && Date.now() - lastCheckAt > settings.circulationMins * 60 * 1000;

  useEffect(() => {
    if (dueCheck && settings.voice && !micArmed && !session.stopped && !nagged.current) {
      nagged.current = true;
      void playCoachVoice(
        "Direct-check reminder. Ask about comfort, sensation, motion, and change. Release for concern.",
        settings.voice,
      );
    }
    if (!dueCheck) nagged.current = false;
  }, [dueCheck, settings.voice, micArmed]);

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      {session.stopped && (
        <div
          ref={stopAlertRef}
          role="alert"
          aria-live="assertive"
          tabIndex={-1}
          className="mb-6 rounded-lg border border-danger/40 bg-danger/10 p-4 outline-none focus:ring-2 focus:ring-danger"
        >
          <p className="font-display text-3xl text-danger">Stop</p>
          <p className="mt-1 text-sm text-fg">
            Stop the activity. Support the person's position and release without creating a fall.
            Call emergency services for abnormal breathing, unresponsiveness, seizure, chest pain,
            a serious fall, stroke-like signs, major weakness, or concerning symptoms after neck
            pressure. Seek prompt assessment for persistent or worsening symptoms after release.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                analysisRequestRef.current += 1;
                stopCoachVoice();
                setCapture(null);
                setReport(null);
                setObservationReport(null);
                setAnalysisConsumed(false);
                setTriage("unanswered");
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
          <h1 className="mt-1 font-display text-4xl">Limited observation</h1>
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
          <span className="ml-2" role="status" aria-live="polite">
            Status: {micStatus}. It can only surface configured red/yellow words; convenience only,
            never a safety control.
          </span>
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
          <label htmlFor="studio-tie" className="text-xs uppercase tracking-wide text-subtle">Tie</label>
          <select
            id="studio-tie"
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
                disabled={t.minutes[1] === 0 || blockedByIds(t.slug, TIE_LIMIT_IDS, hardNoIds)}
              >
                {t.name}
                {t.minutes[1] === 0
                  ? " — instructor route"
                  : blockedByIds(t.slug, TIE_LIMIT_IDS, hardNoIds)
                    ? " — negotiated no"
                    : ""}
              </option>
            ))}
          </select>
          <label htmlFor="studio-surface" className="mt-3 block text-xs uppercase tracking-wide text-subtle">On</label>
          <select
            id="studio-surface"
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
                disabled={session.stopped || !settings.voice}
                onClick={() => {
                  if (session.stopped) return;
                  setMicArmed(false);
                  setMicStatus("idle");
                  const line = tie.steps[session.stepIndex]?.speak;
                  if (line) void playCoachVoice(line, settings.voice);
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
            <fieldset className="mb-3 rounded-lg border border-border bg-surface p-3">
              <legend className="px-1 text-xs uppercase tracking-wide text-subtle">
                Action-first screen · required before media
              </legend>
              <p className="mb-3 text-xs leading-relaxed text-muted">
                Answer from direct reports before opening or importing media. A concern stops the
                activity and routes action without requiring a photo.
              </p>
              <div className="space-y-2 text-xs text-fg">
                <TriageOption
                  checked={triage === "none"}
                  onChange={() => setTriage("none")}
                  label="No urgent symptom, coercion or secret-recording concern, unconsented bystander, or unresolved media-permission issue is being reported. This is not safety clearance."
                />
                <TriageOption
                  checked={triage === "prompt_medical"}
                  onChange={() => setTriage("prompt_medical")}
                  label="After release, a symptom such as numbness, weakness, pain, swelling, discoloration, temperature change, dizziness, or loss of function is persistent or worsening."
                />
                <TriageOption
                  checked={triage === "emergency"}
                  onChange={() => setTriage("emergency")}
                  label="There is abnormal breathing, unresponsiveness, seizure, chest pain, a serious fall, stroke-like signs, major weakness, severe confusion, or concerning symptoms after neck pressure."
                />
                <TriageOption
                  checked={triage === "coercion_or_secret_recording"}
                  onChange={() => setTriage("coercion_or_secret_recording")}
                  label="There is coercion, secret recording, unclear adult status, absent or revoked permission, or an unconsented bystander."
                />
              </div>
            </fieldset>
            <CameraCapture
              key={captureContextKey}
              onCapture={acceptCapture}
              onDiscard={discardCapture}
              disabled={session.stopped || mediaBlocked || triage !== "none"}
            />
          </div>
          {capture && (
            <WrapOverlay src={capture.preview} obs={capture.previewObservation} />
          )}
        </div>
        <div className="space-y-4">
          <CoachPanel
            report={report}
            observationReport={observationReport}
            modelStatus={modelStatus}
            voice={settings.voice && !micArmed}
            pending={pending}
            refusal={refusal}
            halted={session.stopped}
          />
          {analysisError && <p className="text-sm text-danger" role="alert">{analysisError}</p>}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => void runAnalyze()}
              disabled={
                !capture ||
                pending ||
                session.stopped ||
                mediaBlocked ||
                triage !== "none" ||
                analysisConsumed
              }
            >
              {analysisConsumed ? "Batch already submitted" : "Analyze selected stills once"}
            </Button>
            <Button asChild variant="outline">
              <Link to="/checkin">Open direct check-in</Link>
            </Button>
            <Button variant="danger" onClick={() => session.stop("manual")}>
              {settings.safeword}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            disabled={!report || !observationReport}
            onClick={() => {
              if (!report || !observationReport) return;
              addEntry({
                tieSlug: session.tieSlug,
                minutes: Math.round(session.elapsed / 60),
                notes: report.final.coaching.slice(0, 280),
                flags: report.final.flags.map((f) => f.code),
                disposition: observationReport.disposition,
                limitations: observationReport.limitations.slice(0, 3),
                sourceIds: observationReport.source_ids,
              });
              setSaved(true);
            }}
          >
            {saved ? "Saved on this device" : "Save to journal"}
          </Button>
          <p className="text-xs leading-relaxed text-subtle">
            Captures stay in page memory until replaced, stopped, or the page closes; the journal
            never saves them. One Analyze request sends only selected compressed stills and generic
            frame labels to xAI. Already-transmitted data cannot be recalled and may be retained
            under workspace settings. Closed consequence floors can force a stop or instructor
            route, but model misses remain possible and no report is clearance.
          </p>
        </div>
      </div>
    </div>
  );
}

function TriageOption({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex items-start gap-2">
      <input
        type="radio"
        name="pre-analysis-triage"
        className="mt-0.5"
        checked={checked}
        onChange={onChange}
      />
      <span>{label}</span>
    </label>
  );
}
