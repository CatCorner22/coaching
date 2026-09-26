import { MAX_CHECK_MINUTES, MIN_CHECK_MINUTES } from "./stores/settings";
export { MAX_CHECK_MINUTES, MIN_CHECK_MINUTES } from "./stores/settings";

/**
 * Glanceable-scene helpers for Rig Mode.
 *
 * Rig Mode is the arm's-length view: one screen, big type, no chrome. Everything
 * here is deliberately pure or thinly wrapped so the numbers on that screen —
 * which people read while someone is tied — are covered by tests rather than by
 * eyeballing a running app in a dim room.
 *
 * Nothing here is a safety control. The cadence is a reminder the operator
 * configured; it is not a deadline, and letting it run out is not an alarm
 * condition the app can reason about.
 */

/** Interval bounds, mirroring what the settings screen accepts. */
export const DEFAULT_CHECK_MINUTES = 4;

export type CadencePhase =
  /** Comfortably inside the interval. */
  | "ok"
  /** Inside the interval but within the last quarter of it. */
  | "soon"
  /** Past the interval. */
  | "overdue";

export type CheckCadence = {
  /** Seconds left in the interval; 0 once overdue. */
  remainingSec: number;
  /** Whole seconds past the interval; 0 until overdue. */
  overdueSec: number;
  /** Fraction of the interval consumed, clamped to 0..1. */
  progress: number;
  phase: CadencePhase;
  overdue: boolean;
};

/**
 * Clamp an operator-supplied interval to something a clock can render.
 *
 * An absent value falls back to the default, not to the minimum. `Number()`
 * turns null, "" and [] into 0, which clamps to one minute — so a setting that
 * simply had not been written yet would have produced a screen nagging every
 * sixty seconds. An out-of-range *number* is a real answer and still clamps.
 */
export function normalizeCheckMinutes(value: unknown): number {
  const isNumericString = typeof value === "string" && value.trim() !== "";
  if (typeof value !== "number" && !isNumericString) return DEFAULT_CHECK_MINUTES;
  const n = Number(value);
  if (!Number.isFinite(n)) return DEFAULT_CHECK_MINUTES;
  return Math.min(MAX_CHECK_MINUTES, Math.max(MIN_CHECK_MINUTES, Math.round(n)));
}

/**
 * Where the direct-check reminder stands right now.
 *
 * `lastCheckAt` is null before the session starts, which is not "overdue" — a
 * fresh screen that opens already shouting has taught nobody anything. A
 * backwards wall clock (a device syncing time, a manual change) also must not
 * read as overdue, so `now` earlier than the last check is treated as the
 * interval having just restarted rather than as negative elapsed time.
 */
export function checkCadence(
  lastCheckAt: number | null | undefined,
  now: number,
  intervalMinutes: number,
): CheckCadence {
  const intervalSec = normalizeCheckMinutes(intervalMinutes) * 60;
  const fresh: CheckCadence = {
    remainingSec: intervalSec,
    overdueSec: 0,
    progress: 0,
    phase: "ok",
    overdue: false,
  };
  if (typeof lastCheckAt !== "number" || !Number.isFinite(lastCheckAt) || lastCheckAt <= 0) {
    return fresh;
  }
  if (!Number.isFinite(now)) return fresh;
  const elapsedSec = Math.floor((now - lastCheckAt) / 1000);
  if (elapsedSec <= 0) return fresh;
  const remainingSec = Math.max(0, intervalSec - elapsedSec);
  const overdueSec = Math.max(0, elapsedSec - intervalSec);
  const progress = Math.min(1, elapsedSec / intervalSec);
  const phase: CadencePhase =
    overdueSec > 0 ? "overdue" : progress >= 0.75 ? "soon" : "ok";
  return { remainingSec, overdueSec, progress, phase, overdue: overdueSec > 0 };
}

/**
 * `M:SS`, or `H:MM:SS` once an hour has passed.
 *
 * Read at arm's length, so no leading zero on the largest unit and always two
 * digits on the rest. Negative and non-finite inputs render as zero rather than
 * as `NaN:aN`, which is what a clock-skew bug used to put on screen.
 */
export function formatClock(totalSeconds: number): string {
  const s = Number.isFinite(totalSeconds) ? Math.max(0, Math.floor(totalSeconds)) : 0;
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

/** Screen-reader wording for the cadence, which the big digits alone do not carry. */
export function cadenceAnnouncement(cadence: CheckCadence): string {
  if (cadence.overdue) {
    return `Direct-check reminder elapsed ${formatClock(cadence.overdueSec)} ago. Not a deadline.`;
  }
  return `Next direct-check reminder in ${formatClock(cadence.remainingSec)}.`;
}

type VibrateCapable = { vibrate?: (pattern: number | number[]) => boolean };

/**
 * Best-effort haptic pulse.
 *
 * Desktop and iOS Safari have no Vibration API at all, and a browser may refuse
 * without a user gesture, so this reports whether it fired rather than assuming
 * it did — the caller must not treat a buzz as delivered.
 */
export function pulse(
  pattern: number | number[],
  nav: VibrateCapable | undefined = globalThis.navigator as VibrateCapable | undefined,
): boolean {
  try {
    if (typeof nav?.vibrate !== "function") return false;
    return nav.vibrate(pattern) === true;
  } catch {
    return false;
  }
}

/** Two short buzzes: distinct from a notification, short enough to ignore. */
export const CHECK_DUE_PULSE = [180, 120, 180];

export type WakeLockHandle = { release: () => Promise<void> };

type WakeLockCapable = {
  wakeLock?: { request: (type: "screen") => Promise<{ release: () => Promise<void> }> };
};

/**
 * Hold the screen awake, or report honestly that it could not.
 *
 * A phone dimming and locking partway through a tie is the single most annoying
 * thing this screen can do, but the API is unavailable over plain HTTP, absent
 * in several browsers, and rejects outright in a background tab. Every one of
 * those is a null return, never a throw, because the caller's fallback is to
 * say so on screen rather than to fail.
 */
export async function acquireWakeLock(
  nav: WakeLockCapable | undefined = globalThis.navigator as WakeLockCapable | undefined,
): Promise<WakeLockHandle | null> {
  try {
    if (typeof nav?.wakeLock?.request !== "function") return null;
    const sentinel = await nav.wakeLock.request("screen");
    if (!sentinel || typeof sentinel.release !== "function") return null;
    return {
      release: async () => {
        try {
          await sentinel.release();
        } catch {
          // Already released, or the document went away. Nothing to undo.
        }
      },
    };
  } catch {
    return null;
  }
}
