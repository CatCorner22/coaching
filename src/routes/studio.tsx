import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CameraCapture, type CaptureResult } from "@/components/camera-capture";
import { ClockRing, RopeFigure } from "@/components/rope-figure";
import { WrapOverlay } from "@/components/wrap-overlay";
import { CoachPanel } from "@/components/coach-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { analyzeRope } from "@/lib/ai/analyze";
import { authEnabled } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { DUNGEON, TIES, getTie } from "@/lib/kb";
import { fuseCoach } from "@/lib/ml/fuse";
import type { CoachReport } from "@/lib/ml/types";
import { useJournal } from "@/lib/stores/journal";
import { useNegotiate } from "@/lib/stores/negotiate";
import { useSession } from "@/lib/stores/session";
import { useSettings } from "@/lib/stores/settings";
import {
  buildStudioNegotiationPolicy,
  mediaAuthorizationWasRevoked,
} from "@/lib/studio/negotiation";
import { listenForWords, playCoachVoice, stopCoachVoice } from "@/lib/voice/play";
import { DIRECT_CHECK_REMINDER } from "@/lib/voice/reviewed-lines";
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

function StudioPage() {
  const search = Route.useSearch();
  const settings = useSettings();
  const { user: currentUser, isPending: authPending } = useCurrentUserState();
  const nerveHits = useJournal((j) => j.nerveHits);
  const addEntry = useJournal((j) => j.add);
  const removeEntry = useJournal((j) => j.remove);
  const items = useNegotiate((s) => s.items);
  // Persist middleware can finish before React switches from its initial
  // hydration snapshot to the live store. Keep actions fail-closed until the
  // mounted effect synchronizes both layers.
  const [negotiationReady, setNegotiationReady] = useState(false);
  const stopSession = useSession((s) => s.stop);
  const setStep = useSession((s) => s.setStep);
  const setTie = useSession((s) => s.setTie);
  const setFurniture = useSession((s) => s.setFurniture);
  const startSession = useSession((s) => s.start);
  const resetSession = useSession((s) => s.reset);
  const stopped = useSession((s) => s.stopped);
  const stepIndex = useSession((s) => s.stepIndex);
  const tieSlug = useSession((s) => s.tieSlug);
  const furnitureSlug = useSession((s) => s.furnitureSlug);
  const negotiationPolicy = useMemo(() => buildStudioNegotiationPolicy(items), [items]);
  const {
    operationalLimits,
    negotiationKey,
    voiceBlocked,
    mediaBlocked: negotiatedMediaBlocked,
  } = negotiationPolicy;
  const mediaBlocked = !negotiationReady || negotiatedMediaBlocked;
  const mediaAllowed = negotiationReady && !negotiatedMediaBlocked;
  const previousMediaAllowedRef = useRef(mediaAllowed);
  const captureContextKey = `${tieSlug ?? ""}|${stepIndex}|${furnitureSlug ?? ""}|${negotiationKey}`;
  const [capture, setCapture] = useState<CaptureResult | null>(null);
  const [report, setReport] = useState<CoachReport | null>(null);
  const [observationReport, setObservationReport] = useState<ObservationReport | null>(null);
  const [modelStatus, setModelStatus] = useState<ModelStatus>("not_requested");
  const [pending, setPending] = useState(false);
  const [analysisConsumed, setAnalysisConsumed] = useState(false);
  const [triage, setTriage] = useState<TriageState | "unanswered">("unanswered");
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [refusal, setRefusal] = useState(false);
  const [savedReportRevision, setSavedReportRevision] = useState<string | null>(null);
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);
  const [micArmed, setMicArmed] = useState(false);
  const micArmedRef = useRef(false);
  const [micStatus, setMicStatus] = useState<
    "idle" | "starting" | "active" | "error" | "unsupported"
  >("idle");
  const analysisRequestRef = useRef(0);
  const mountedRef = useRef(true);
  const currentContextRef = useRef(captureContextKey);
  const captureContextAtCommitRef = useRef<string | null>(null);
  currentContextRef.current = captureContextKey;
  const tie = getTie(tieSlug ?? "");
  const instructorOnlyTie = tie?.minutes[1] === 0;
  const tieBlocked = negotiationPolicy.isTieBlocked(tieSlug);
  const furnitureBlocked = negotiationPolicy.isFurnitureBlocked(furnitureSlug);
  const studioVoice = settings.voice && !voiceBlocked;
  const cameraGateReason = stopped
    ? "session-stopped"
    : !negotiationReady
      ? "negotiation-hydrating"
      : negotiatedMediaBlocked
        ? "media-not-approved"
        : triage === "unanswered"
          ? "triage-unanswered"
          : triage !== "none"
            ? "triage-concern"
            : "enabled";

  useEffect(() => {
    const api = useNegotiate.persist;
    const finish = () => setNegotiationReady(true);
    const unsubscribe = api.onFinishHydration(finish);
    if (api.hasHydrated()) finish();
    return unsubscribe;
  }, []);

  useEffect(() => {
    const invalidateAcrossTabs = (event: StorageEvent) => {
      if (event.key !== null && event.key !== "knotty-negotiate" && event.key !== "knotty-settings")
        return;
      analysisRequestRef.current += 1;
      captureContextAtCommitRef.current = null;
      micArmedRef.current = false;
      stopCoachVoice();
      window.location.reload();
    };
    window.addEventListener("storage", invalidateAcrossTabs);
    return () => window.removeEventListener("storage", invalidateAcrossTabs);
  }, []);

  useEffect(() => {
    if (tieBlocked || instructorOnlyTie) useSession.getState().setTie(undefined);
    if (furnitureBlocked) useSession.getState().setFurniture(undefined);
  }, [tieBlocked, instructorOnlyTie, furnitureBlocked]);

  useEffect(() => {
    const previouslyAllowed = previousMediaAllowedRef.current;
    previousMediaAllowedRef.current = mediaAllowed;
    if (!mediaAuthorizationWasRevoked(previouslyAllowed, mediaAllowed)) return;
    analysisRequestRef.current += 1;
    stopCoachVoice();
    captureContextAtCommitRef.current = null;
    setCapture(null);
    setReport(null);
    setObservationReport(null);
    setAnalysisConsumed(false);
    setTriage("unanswered");
    setPending(false);
  }, [mediaAllowed]);

  useEffect(() => {
    if (!studioVoice) stopCoachVoice();
  }, [studioVoice]);

  useEffect(() => {
    if (search.tie) {
      const requestedTie = getTie(search.tie);
      setTie(
        negotiationReady &&
          requestedTie &&
          requestedTie.minutes[1] > 0 &&
          !negotiationPolicy.isTieBlocked(search.tie)
          ? search.tie
          : undefined,
      );
    }
    if (!useSession.getState().startedAt) startSession();
    useSession.getState().tick(Date.now());
    const id = window.setInterval(() => useSession.getState().tick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [negotiationPolicy, negotiationReady, search.tie, setTie, startSession]);

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
          micArmedRef.current = false;
          setMicArmed(false);
        }
      },
    );
  }, [settings.listen, micArmed, settings.safeword, settings.yellowWord, stopSession]);

  const captureContextRef = useRef(captureContextKey);

  useEffect(() => {
    const contextChanged = captureContextRef.current !== captureContextKey;
    captureContextRef.current = captureContextKey;
    setSavedReportRevision(null);
    setSavedEntryId(null);
    setRefusal(false);
    analysisRequestRef.current += 1;
    setPending(false);
    setAnalysisError(null);
    if (contextChanged && capture) {
      stopCoachVoice();
      captureContextAtCommitRef.current = null;
      setCapture(null);
      setReport(null);
      setObservationReport(null);
      setModelStatus("not_requested");
      setAnalysisConsumed(false);
      setTriage("unanswered");
    }
  }, [capture, captureContextKey]);
  const captureMatchesContext =
    capture !== null && captureContextAtCommitRef.current === captureContextKey;
  const det = useMemo(() => {
    if (!capture || !captureMatchesContext) return null;
    return buildDeterministic(capture.observations, null);
  }, [capture, captureMatchesContext]);
  const contextBoundReport = capture && !captureMatchesContext ? null : report;
  const contextBoundObservationReport =
    capture && !captureMatchesContext ? null : observationReport;
  const reportRevision = useMemo(() => {
    if (!contextBoundReport || !contextBoundObservationReport) return null;
    return [
      capture?.consent.batchId ?? "no-media",
      modelStatus,
      contextBoundObservationReport.schema_version,
      contextBoundObservationReport.source_ledger_revision,
      contextBoundObservationReport.report_type,
      contextBoundObservationReport.disposition,
      contextBoundObservationReport.next_step_id,
      contextBoundReport.final.coaching,
      contextBoundReport.final.flags.map((flag) => `${flag.code}:${flag.severity}`).join(","),
    ].join("|");
  }, [capture?.consent.batchId, contextBoundObservationReport, contextBoundReport, modelStatus]);
  const currentReportSaved = reportRevision !== null && savedReportRevision === reportRevision;

  useEffect(() => {
    if (!stopped) return;
    analysisRequestRef.current += 1;
    stopCoachVoice();
    micArmedRef.current = false;
    setMicArmed(false);
    setPending(false);
    captureContextAtCommitRef.current = null;
    setCapture(null);
    stopAlertRef.current?.focus();
  }, [stopped]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      analysisRequestRef.current += 1;
      currentContextRef.current = "";
      captureContextAtCommitRef.current = null;
      micArmedRef.current = false;
      stopCoachVoice();
    };
  }, []);

  useEffect(() => {
    if (!det || !capture) return;
    if (captureContextAtCommitRef.current !== currentContextRef.current) return;
    if (useSession.getState().stopped) return;
    const next = fuseCoach({
      det,
      frames: capture.observations,
      llm: null,
      tie,
      stepIndex,
      elapsedSec: useSession.getState().elapsed,
      priorNerveHits: nerveHits,
      hardNos: operationalLimits.map((item) => item.label),
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
    setRefusal(false);
    setModelStatus("not_requested");
    if (next.final.recommend === "stop") stopSession("coach");
  }, [det, capture, tie, stepIndex, nerveHits, operationalLimits, stopSession]);

  useEffect(() => {
    if (triage === "unanswered" || triage === "none") return;
    // A direct symptom/consent report supersedes every prior visual result.
    // Invalidate the request and capture-derived coach text so an urgent action
    // cannot be displayed or journaled beside stale visual coaching.
    analysisRequestRef.current += 1;
    setPending(false);
    setReport(null);
    setSavedReportRevision(null);
    setAnalysisError(null);
    setAnalysisConsumed(true);
    setRefusal(false);
    setModelStatus("not_requested");
    setObservationReport(
      buildObservationReport({
        mediaMode: capture
          ? capture.kind === "video"
            ? "selected_video_stills"
            : "static_photos"
          : "no_media",
        consent: capture?.consent,
        quality: capture?.quality,
        allowedFrameIds: capture?.frameLabels,
        modelStatus: "not_requested",
        triage,
      }),
    );
    stopSession(
      triage === "emergency"
        ? "medical-emergency"
        : triage === "prompt_medical"
          ? "medical"
          : "consent",
    );
  }, [capture, triage, stopSession]);

  function chooseTriage(next: TriageState) {
    analysisRequestRef.current += 1;
    stopCoachVoice();
    setPending(false);
    setAnalysisError(null);
    if (next !== "none") {
      micArmedRef.current = false;
      setMicArmed(false);
      setMicStatus("idle");
      setReport(null);
      setSavedReportRevision(null);
      setAnalysisConsumed(true);
      stopSession(
        next === "emergency"
          ? "medical-emergency"
          : next === "prompt_medical"
            ? "medical"
            : "consent",
      );
    }
    setTriage(next);
  }

  async function runAnalyze() {
    if (!mountedRef.current) return;
    if (!capture || !det) return;
    if (authEnabled && !currentUser) {
      setAnalysisError("Sign in before sending selected stills to xAI.");
      return;
    }
    if (captureContextAtCommitRef.current !== currentContextRef.current) return;
    const sessionSnapshot = useSession.getState();
    if (sessionSnapshot.stopped || mediaBlocked || analysisConsumed || triage !== "none") return;
    const request = ++analysisRequestRef.current;
    const requestContext = currentContextRef.current;
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
          elapsedSec: sessionSnapshot.elapsed,
          hardNos: operationalLimits.map((item) => `${item.id}: ${item.label}`),
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
      const liveNegotiationPolicy = buildStudioNegotiationPolicy(useNegotiate.getState().items);
      if (
        !mountedRef.current ||
        request !== analysisRequestRef.current ||
        requestContext !== currentContextRef.current ||
        captureContextAtCommitRef.current !== requestContext ||
        liveNegotiationPolicy.mediaBlocked ||
        useSession.getState().stopped
      )
        return;
      if (res.ok) {
        setRefusal(res.refusal);
        setReport(res.report);
        setObservationReport(res.observationReport);
        setModelStatus(res.modelStatus);
        if (
          res.observationReport.urgent_stop ||
          res.observationReport.disposition === "do_not_proceed" ||
          res.selfAudit.hardLimit
        ) {
          stopSession("observation");
        } else if (
          useSettings.getState().voice &&
          !liveNegotiationPolicy.voiceBlocked &&
          !micArmedRef.current
        ) {
          void playCoachVoice(res.report.final.speak, true);
        }
      } else {
        setAnalysisError(res.error || "The analysis could not be completed.");
        // Only a server-declared retryable admission denial before durable
        // reservation can reopen this batch. Never reopen after reservation,
        // selected-media dispatch, an ambiguous outcome, or replay.
        if (res.retryableBeforeProvider && res.providerAttempted === false) {
          setAnalysisConsumed(false);
        }
      }
    } catch (cause) {
      if (mountedRef.current && request === analysisRequestRef.current) {
        setAnalysisError(
          cause instanceof Error ? cause.message : "The analysis could not be completed.",
        );
      }
    } finally {
      if (mountedRef.current && request === analysisRequestRef.current) setPending(false);
    }
  }

  const acceptCapture = useCallback((next: CaptureResult) => {
    analysisRequestRef.current += 1;
    stopCoachVoice();
    captureContextAtCommitRef.current = currentContextRef.current;
    setPending(false);
    setAnalysisError(null);
    setRefusal(false);
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
    stopCoachVoice();
    captureContextAtCommitRef.current = null;
    setPending(false);
    setAnalysisError(null);
    setRefusal(false);
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
      spoke.current = stepIndex;
      return;
    }
    if (spoke.current === stepIndex) return;
    spoke.current = stepIndex;
    if (stopped) return;
    const line = tie?.steps[stepIndex]?.speak;
    if (line && studioVoice && !micArmed) void playCoachVoice(line, studioVoice);
  }, [stepIndex, stopped, tie, studioVoice, micArmed]);

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      {stopped && (
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
            Call emergency services for abnormal breathing, unresponsiveness, seizure, chest pain, a
            serious fall, stroke-like signs, major weakness, or concerning symptoms after neck
            pressure. Seek prompt assessment for persistent or worsening symptoms after release.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                analysisRequestRef.current += 1;
                stopCoachVoice();
                setCapture(null);
                captureContextAtCommitRef.current = null;
                setReport(null);
                setObservationReport(null);
                setAnalysisConsumed(false);
                setTriage("unanswered");
                resetSession();
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
          <SessionClock limitSec={settings.circulationMins * 60} />
        </div>
      </div>
      {operationalLimits.length > 0 && (
        <p className="mt-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          Not approved (no or unresolved maybe):{" "}
          {operationalLimits.map((item) => `${item.label} (${item.rank})`).join(" · ")}
        </p>
      )}
      {settings.listen && !stopped && (
        <div className="mt-3 rounded-md border border-border bg-surface px-3 py-2 text-xs text-muted">
          <button
            type="button"
            className="font-medium text-fg underline-offset-2 hover:underline"
            onClick={() => {
              if (micArmed) {
                micArmedRef.current = false;
                setMicArmed(false);
                setMicStatus("idle");
              } else {
                setMicStatus("starting");
                micArmedRef.current = true;
                setMicArmed(true);
              }
            }}
          >
            {micArmed
              ? "Turn off optional mic word detection"
              : "Enable optional mic word detection for this session"}
          </button>
          <span className="ml-2" role="status" aria-live="polite">
            Status: {micStatus}. It can only surface configured red/yellow words; convenience only,
            never a safety control.
          </span>
        </div>
      )}
      <CirculationBanner
        minutes={settings.circulationMins}
        voice={studioVoice}
        micArmed={micArmed}
      />
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <label htmlFor="studio-tie" className="text-xs uppercase tracking-wide text-subtle">
            Tie
          </label>
          <select
            id="studio-tie"
            className="mt-1 h-11 w-full rounded-md border border-border bg-elevated px-3 text-sm"
            value={tieSlug ?? ""}
            disabled={stopped || pending}
            onChange={(e) => {
              if (useSession.getState().stopped || pending) return;
              setTie(e.target.value || undefined);
            }}
          >
            <option value="">Freeform</option>
            {TIES.map((t) => (
              <option
                key={t.slug}
                value={t.slug}
                disabled={t.minutes[1] === 0 || negotiationPolicy.isTieBlocked(t.slug)}
              >
                {t.name}
                {t.minutes[1] === 0
                  ? " — instructor route"
                  : negotiationPolicy.isTieBlocked(t.slug)
                    ? " — not approved"
                    : ""}
              </option>
            ))}
          </select>
          <label
            htmlFor="studio-surface"
            className="mt-3 block text-xs uppercase tracking-wide text-subtle"
          >
            On
          </label>
          <select
            id="studio-surface"
            className="mt-1 h-11 w-full rounded-md border border-border bg-elevated px-3 text-sm"
            value={furnitureSlug ?? ""}
            disabled={stopped || pending}
            onChange={(e) => {
              if (useSession.getState().stopped || pending) return;
              setFurniture(e.target.value || undefined);
            }}
          >
            <option value="">Floor / bed</option>
            {DUNGEON.map((d) => (
              <option
                key={d.slug}
                value={d.slug}
                disabled={negotiationPolicy.isFurnitureBlocked(d.slug)}
              >
                {d.name}
                {negotiationPolicy.isFurnitureBlocked(d.slug) ? " — not approved" : ""}
              </option>
            ))}
          </select>
          {tie && (
            <div className="mt-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm text-muted">
                  Step {stepIndex + 1}/{tie.steps.length}: {tie.steps[stepIndex]?.title}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={stopped || pending || stepIndex === 0}
                  onClick={() => {
                    if (useSession.getState().stopped || pending) return;
                    setStep(stepIndex - 1);
                  }}
                >
                  Prev
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={stopped || pending || stepIndex >= tie.steps.length - 1}
                  onClick={() => {
                    if (useSession.getState().stopped || pending) return;
                    setStep(stepIndex + 1);
                  }}
                >
                  Next
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={stopped || !studioVoice}
                  onClick={() => {
                    if (useSession.getState().stopped || !studioVoice) return;
                    micArmedRef.current = false;
                    setMicArmed(false);
                    setMicStatus("idle");
                    const line = tie.steps[stepIndex]?.speak;
                    if (line) void playCoachVoice(line, studioVoice);
                  }}
                >
                  {voiceBlocked ? "Speak step — not approved" : "Speak step"}
                </Button>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-fg">{tie.steps[stepIndex]?.rigger}</p>
              <p className="mt-1 text-xs text-muted">Check. {tie.steps[stepIndex]?.check}</p>
              <div className="mx-auto mt-3 h-64 w-36">
                <RopeFigure
                  pose={tie.steps[stepIndex]?.expected.pose}
                  view={tie.steps[stepIndex]?.expected.view}
                  wraps={tie.steps.slice(0, stepIndex + 1).flatMap((x) => x.wraps)}
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
            {!negotiationReady ? (
              <p
                role="status"
                className="mb-3 rounded-md border border-border px-3 py-2 text-xs text-muted"
              >
                Loading negotiation choices…
              </p>
            ) : mediaBlocked ? (
              <p
                role="status"
                className="mb-3 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger"
              >
                Media is not affirmatively approved. Resolve no or maybe together before enabling
                photo or video capture.
              </p>
            ) : null}
            <fieldset
              disabled={!negotiationReady}
              data-camera-gate="action-first"
              data-negotiation-ready={negotiationReady ? "true" : "false"}
              data-media-blocked={negotiatedMediaBlocked ? "true" : "false"}
              data-triage={triage}
              data-session-stopped={stopped ? "true" : "false"}
              data-camera-gate-reason={cameraGateReason}
              data-camera-ready={cameraGateReason === "enabled" ? "true" : "false"}
              className="mb-3 rounded-lg border border-border bg-surface p-3 disabled:opacity-60"
            >
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
                  onChange={() => chooseTriage("none")}
                  label="No urgent symptom, coercion or secret-recording concern, unconsented bystander, or unresolved media-permission issue is being reported. This is not safety clearance."
                />
                <TriageOption
                  checked={triage === "prompt_medical"}
                  onChange={() => chooseTriage("prompt_medical")}
                  label="After release, a symptom such as numbness, weakness, pain, swelling, discoloration, temperature change, dizziness, or loss of function is persistent or worsening."
                />
                <TriageOption
                  checked={triage === "emergency"}
                  onChange={() => chooseTriage("emergency")}
                  label="There is abnormal breathing, unresponsiveness, seizure, chest pain, a serious fall, stroke-like signs, major weakness, severe confusion, or concerning symptoms after neck pressure."
                />
                <TriageOption
                  checked={triage === "coercion_or_secret_recording"}
                  onChange={() => chooseTriage("coercion_or_secret_recording")}
                  label="There is coercion, secret recording, unclear adult status, absent or revoked permission, or an unconsented bystander."
                />
              </div>
            </fieldset>
            {cameraGateReason === "triage-unanswered" && (
              <p
                role="status"
                className="mb-3 rounded-md border border-border bg-surface px-3 py-2 text-xs text-muted"
              >
                Answer the action-first screen for this batch before confirming media permissions.
              </p>
            )}
            <CameraCapture
              key={captureContextKey}
              onCapture={acceptCapture}
              onDiscard={discardCapture}
              disabled={cameraGateReason !== "enabled"}
            />
          </div>
          {capture && captureMatchesContext && (
            <WrapOverlay src={capture.preview} obs={capture.previewObservation} />
          )}
        </div>
        <div className="space-y-4">
          <CoachPanel
            report={contextBoundReport}
            observationReport={contextBoundObservationReport}
            modelStatus={modelStatus}
            voice={studioVoice && !micArmed}
            pending={pending}
            refusal={refusal}
            halted={stopped}
          />
          {analysisError && (
            <p className="text-sm text-danger" role="alert">
              {analysisError}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {authEnabled && !currentUser && !authPending ? (
              <Button asChild>
                <Link to="/login">Sign in to analyze selected stills</Link>
              </Button>
            ) : (
              <Button
                onClick={() => void runAnalyze()}
                disabled={
                  authPending ||
                  !capture ||
                  !captureMatchesContext ||
                  pending ||
                  stopped ||
                  mediaBlocked ||
                  triage !== "none" ||
                  analysisConsumed
                }
              >
                {authPending
                  ? "Checking sign-in…"
                  : analysisConsumed
                    ? "Batch already submitted"
                    : "Analyze selected stills once"}
              </Button>
            )}
            <Button asChild variant="outline">
              <Link to="/checkin">Open direct check-in</Link>
            </Button>
            <Button variant="danger" onClick={() => stopSession("manual")}>
              {settings.safeword}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            disabled={
              !contextBoundReport ||
              !contextBoundObservationReport ||
              !reportRevision ||
              currentReportSaved
            }
            onClick={() => {
              if (!contextBoundReport || !contextBoundObservationReport || !reportRevision) return;
              const snapshot = useSession.getState();
              if (savedEntryId) removeEntry(savedEntryId);
              const entryId = addEntry({
                tieSlug: snapshot.tieSlug,
                minutes: Math.round(snapshot.elapsed / 60),
                notes: contextBoundReport.final.coaching.slice(0, 280),
                flags: contextBoundReport.final.flags.map((flag) => flag.code),
                disposition: contextBoundObservationReport.disposition,
                limitations: contextBoundObservationReport.limitations.slice(0, 3),
                sourceIds: contextBoundObservationReport.source_ids,
              });
              setSavedEntryId(entryId);
              setSavedReportRevision(reportRevision);
            }}
          >
            {currentReportSaved
              ? "Saved on this device"
              : savedEntryId
                ? "Update journal report"
                : "Save to journal"}
          </Button>
          <p className="text-xs leading-relaxed text-subtle">
            Captures stay in page memory until replaced, stopped, or the page closes; the journal
            never saves them. One Analyze request sends only selected compressed stills and generic
            frame labels to xAI. A fixed, non-sensitive request must first confirm zero data
            retention, and the selected-media response must confirm it again before the app reads
            the body. A missing confirmation is discarded, but an already-initiated request cannot
            be recalled. Closed consequence floors can force a stop or instructor route, but model
            misses remain possible and no report is clearance.
          </p>
        </div>
      </div>
    </div>
  );
}

function SessionClock({ limitSec }: { limitSec: number }) {
  const elapsed = useSession((state) => state.elapsed);
  return <ClockRing elapsed={elapsed} limitSec={limitSec} label="reminder" />;
}

function CirculationBanner({
  minutes,
  voice,
  micArmed,
}: {
  minutes: number;
  voice: boolean;
  micArmed: boolean;
}) {
  const lastCheckAt = useSession((state) => state.lastCheckAt);
  const reminderTick = useSession((state) => state.elapsed);
  const stopped = useSession((state) => state.stopped);
  const nagged = useRef(false);
  const due = reminderTick >= 0 && !!lastCheckAt && Date.now() - lastCheckAt > minutes * 60 * 1000;

  useEffect(() => {
    if (due && voice && !micArmed && !stopped && !nagged.current) {
      nagged.current = true;
      void playCoachVoice(DIRECT_CHECK_REMINDER, voice);
    }
    if (!due) nagged.current = false;
  }, [due, voice, micArmed, stopped]);

  if (!due) return null;
  return (
    <p className="mt-4 rounded-md border border-warn/30 bg-warn/10 px-3 py-2 text-sm text-warn">
      The optional direct-check reminder elapsed. It is not a safety deadline or clearance.{" "}
      <Link to="/checkin" className="underline">
        Log it
      </Link>
    </p>
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
