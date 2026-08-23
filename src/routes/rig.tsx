import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { getTie } from "@/lib/kb";
import { useNegotiate } from "@/lib/stores/negotiate";
import { useSession } from "@/lib/stores/session";
import { useSettings } from "@/lib/stores/settings";
import {
  acquireWakeLock,
  cadenceAnnouncement,
  checkCadence,
  CHECK_DUE_PULSE,
  formatClock,
  normalizeCheckMinutes,
  pulse,
  type WakeLockHandle,
} from "@/lib/rig";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/rig")({ ssr: false, component: RigPage });

/**
 * Rig Mode: the arm's-length view.
 *
 * Everything the Studio shows is still true here — this screen adds no
 * observation, no clearance, and no safety control. It only removes chrome, so
 * the four things worth reading across a room (how long it has been, when the
 * next direct check comes round, which step, and how to stop) are readable
 * without picking the phone up.
 */
function RigPage() {
  const settings = useSettings();
  const elapsed = useSession((s) => s.elapsed);
  const startedAt = useSession((s) => s.startedAt);
  const lastCheckAt = useSession((s) => s.lastCheckAt);
  const stopped = useSession((s) => s.stopped);
  const stopReason = useSession((s) => s.stopReason);
  const yellowAt = useSession((s) => s.yellowAt);
  const stepIndex = useSession((s) => s.stepIndex);
  const tieSlug = useSession((s) => s.tieSlug);
  const start = useSession((s) => s.start);
  const checked = useSession((s) => s.checked);
  const setStep = useSession((s) => s.setStep);
  const stop = useSession((s) => s.stop);
  const flagYellow = useSession((s) => s.flagYellow);
  const clearYellow = useSession((s) => s.clearYellow);
  const items = useNegotiate((s) => s.items);

  const tie = tieSlug ? getTie(tieSlug) : undefined;
  const step = tie?.steps[stepIndex];
  const minutes = normalizeCheckMinutes(settings.circulationMins);

  // Same 1s driver the Studio uses. `elapsed` re-renders this component, and
  // `now` is read fresh so the countdown does not lag behind a resumed tab.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const advance = () => {
      useSession.getState().tick(Date.now());
      setNow(Date.now());
    };
    advance();
    const id = window.setInterval(advance, 1000);
    return () => window.clearInterval(id);
  }, []);

  const cadence = checkCadence(lastCheckAt, now, minutes);
  const running = startedAt !== null && !stopped;

  // Screen wake lock, re-acquired on return to the foreground: a browser drops
  // the lock whenever the tab is hidden and never restores it by itself.
  const [wakeHeld, setWakeHeld] = useState(false);
  useEffect(() => {
    if (!running) return;
    let disposed = false;
    let handle: WakeLockHandle | null = null;
    const take = async () => {
      if (disposed || handle || document.visibilityState !== "visible") return;
      handle = await acquireWakeLock();
      if (disposed) {
        void handle?.release();
        handle = null;
        return;
      }
      setWakeHeld(handle !== null);
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        handle = null;
        void take();
      }
    };
    void take();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", onVisible);
      void handle?.release();
      setWakeHeld(false);
    };
  }, [running]);

  // One buzz per elapse, not one per second. Re-arms when the check is logged.
  const buzzed = useRef(false);
  useEffect(() => {
    if (!cadence.overdue || stopped) {
      buzzed.current = false;
      return;
    }
    if (buzzed.current) return;
    buzzed.current = true;
    pulse(CHECK_DUE_PULSE);
  }, [cadence.overdue, stopped]);

  const blocked = items.filter((i) => i.rank !== "yes");

  if (stopped) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-6 px-5 py-10">
        <div role="alert" className="rounded-lg border border-danger bg-danger/10 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-danger-text">Session stopped</p>
          <h1 className="mt-2 font-display text-5xl text-danger-text">Release now</h1>
          <p className="mt-3 text-sm text-muted">
            {stopReason ?? "Stopped."} Support the position and release without creating a fall.
            Then check in directly — this app has not observed anything and cannot tell you it is
            over.
          </p>
        </div>
        <div className="grid gap-3">
          <Button asChild variant="danger" size="lg" className="h-16 text-lg">
            <Link to="/emergency">Emergency card</Link>
          </Button>
          <Button asChild size="lg" className="h-14">
            <Link to="/checkin">Log a direct check-in</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-14">
            <Link to="/studio">Back to Studio</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-4 px-4 py-5">
      <div className="flex items-center justify-between gap-3 text-xs">
        <Link
          to="/studio"
          className="inline-flex min-h-11 items-center text-muted underline underline-offset-4"
        >
          Exit rig mode
        </Link>
        <span className="text-subtle" role="status" aria-live="off">
          {wakeHeld ? "Screen held awake" : "Screen may sleep"}
        </span>
      </div>

      {/* Elapsed and cadence, sized to be read across a room. The cadence is a
          reminder the operator set; the copy never calls it a deadline. */}
      <section
        className={cn(
          "rounded-xl border p-5 text-center",
          cadence.overdue
            ? "border-warn/60 bg-warn/10"
            : "border-border bg-surface",
        )}
      >
        <p className="text-xs uppercase tracking-[0.22em] text-subtle">Elapsed</p>
        <p className="font-display text-6xl tabular-nums leading-none text-fg sm:text-7xl">
          {formatClock(elapsed)}
        </p>
        <div className="mt-4" aria-hidden="true">
          <div className="h-2 w-full overflow-hidden rounded-full bg-elevated">
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-500",
                cadence.phase === "overdue"
                  ? "bg-warn"
                  : cadence.phase === "soon"
                    ? "bg-warn/60"
                    : "bg-ok/70",
              )}
              style={{ width: `${Math.round(cadence.progress * 100)}%` }}
            />
          </div>
        </div>
        <p
          className={cn(
            "mt-3 text-lg tabular-nums",
            cadence.overdue ? "text-warn" : "text-muted",
          )}
        >
          {cadence.overdue
            ? `Check reminder elapsed ${formatClock(cadence.overdueSec)} ago`
            : `Next check reminder in ${formatClock(cadence.remainingSec)}`}
        </p>
        <p className="sr-only" role="status" aria-live="polite">
          {cadenceAnnouncement(cadence)}
        </p>
        <p className="mt-1 text-xs text-subtle">
          A reminder you set, not a safety deadline. Ask directly; release for any concern.
        </p>
      </section>

      {!running ? (
        <Button size="lg" className="h-16 text-lg" onClick={start}>
          Start the session clock
        </Button>
      ) : (
        <Button
          size="lg"
          variant={cadence.overdue ? "default" : "outline"}
          className="h-16 text-lg"
          onClick={() => checked()}
        >
          I checked in directly
        </Button>
      )}

      {yellowAt !== null && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-warn/50 bg-warn/10 px-4 py-3"
        >
          <p className="text-sm text-warn">
            {settings.yellowWord} called — change something, keep talking.
          </p>
          <Button size="sm" variant="outline" onClick={clearYellow}>
            Checked in
          </Button>
        </div>
      )}

      {tie && step ? (
        <section className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-subtle">
            {tie.name}
            {tie.steps.length > 1 && ` · step ${stepIndex + 1} of ${tie.steps.length}`}
          </p>
          <h2 className="mt-1 font-display text-3xl">{step.title}</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wide text-subtle">Rigger</dt>
              <dd className="text-fg">{step.rigger}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-subtle">Bottom</dt>
              <dd className="text-muted">{step.bottom}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-subtle">Check</dt>
              <dd className="text-muted">{step.check}</dd>
            </div>
          </dl>
          {/* Every tie in the library is currently a single step, and two
              permanently-disabled buttons are worse than none. This renders
              the moment any tie gains a second step. */}
          {tie.steps.length > 1 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                size="lg"
                className="h-14"
                disabled={stepIndex === 0}
                onClick={() => setStep(stepIndex - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="h-14"
                disabled={stepIndex >= tie.steps.length - 1}
                onClick={() => setStep(stepIndex + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </section>
      ) : (
        <p className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
          No tie selected. Pick one in{" "}
          <Link to="/studio" className="underline">
            Studio
          </Link>{" "}
          and its steps appear here.
        </p>
      )}

      {/* Bottom of the screen and thumb-reachable one-handed, which is the only
          place the stop control is any use. */}
      <div className="mt-auto grid grid-cols-2 gap-3 pt-2">
        <Button
          size="lg"
          variant="outline"
          className="h-20 border-warn/50 text-lg text-warn hover:bg-warn/10"
          onClick={flagYellow}
        >
          {settings.yellowWord}
        </Button>
        <Button
          size="lg"
          variant="danger"
          className="h-20 text-lg"
          onClick={() => stop(`${settings.safeword} called in rig mode`)}
        >
          {settings.safeword}
        </Button>
      </div>

      {blocked.length > 0 && (
        <details className="rounded-lg border border-border bg-surface px-4 py-3">
          <summary className="cursor-pointer text-xs uppercase tracking-wide text-subtle">
            Not approved ({blocked.length})
          </summary>
          <p className="mt-2 text-xs leading-relaxed text-danger-text">
            {blocked.map((i) => `${i.label} (${i.rank})`).join(" · ")}
          </p>
        </details>
      )}

      <Link
        to="/emergency"
        className="inline-flex min-h-11 items-center justify-center text-sm text-danger-text underline underline-offset-4"
      >
        Emergency card
      </Link>
    </main>
  );
}
