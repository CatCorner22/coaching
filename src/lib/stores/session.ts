import { create } from "zustand";
import { persist, type PersistStorage } from "zustand/middleware";
import {
  persistFailureFor,
  safeBrowserStorage,
  safeJsonStorage,
  syncPersistedAcrossTabs,
} from "./persist";

const SESSION_KEY = "knotty-session";

/**
 * A stored session older than this is treated as last night's, not as the one
 * you are in the middle of. Long enough that a scene with a break in it comes
 * back intact, short enough that opening the app the next day does not restore
 * a stale red alert nobody is still living under.
 */
const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;

/**
 * Persisted so a reload cannot erase a called stop.
 *
 * The session used to be memory-only: a refresh, an OS tab discard or a
 * crash-and-restore returned to a page that looked like a fresh, running
 * session — red banner gone, clock back to zero — which is the one state this
 * app must never invent. `elapsed` is deliberately NOT stored: it is derived
 * from `startedAt` by tick(), so the clock keeps counting real time across a
 * reload instead of resuming from a stale number, and the derived value cannot
 * write to storage once a second.
 */
type PersistedSession = Pick<
  SessionState,
  | "tieSlug"
  | "furnitureSlug"
  | "stepIndex"
  | "startedAt"
  | "lastCheckAt"
  | "stopped"
  | "stopReason"
  | "stoppedAt"
  | "yellowAt"
>;

/**
 * Skip a write whose payload is byte-identical to the last one. tick() sets
 * state every second; without this the store rewrote (and cross-tab
 * broadcast) an unchanged blob at 1 Hz for the whole scene.
 */
export function unchangedWriteSkippingStorage<State>(): PersistStorage<State> {
  const base = safeJsonStorage<State>();
  let lastWritten: string | null = null;
  return {
    ...base,
    setItem: (key, value) => {
      let serialized: string | null = null;
      try {
        serialized = JSON.stringify(value);
      } catch {
        serialized = null;
      }
      if (serialized !== null && serialized === lastWritten) return;
      const result = base.setItem(key, value);
      // Only remember a payload the storage actually took. Caching it first
      // meant a write that failed once was skipped forever after, so a stop
      // called during a quota error never reached disk.
      lastWritten = persistFailureFor(key) === null ? serialized : null;
      return result;
    },
    removeItem: (key) => {
      lastWritten = null;
      return base.removeItem(key);
    },
  };
}

const numberOr = (value: unknown, fallback: number | null): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

/**
 * Keep the newest safety event across tabs.
 *
 * The store writes the whole blob on every set(), so a tab that had not yet
 * heard about a stop — a tick, a check-in, a step change — persisted
 * `stopped: false` straight over it and the red state vanished everywhere.
 * A stop is only superseded by a session that provably began after it, which
 * is what reset() does when the couple starts again.
 */
export function mergeSessionSafety(
  incoming: Partial<PersistedSession>,
  existing: Partial<PersistedSession> | null,
): Partial<PersistedSession> {
  if (!existing?.stopped) return incoming;
  if (!withinSessionWindow(existing)) {
    return { ...incoming, stopped: false, stoppedAt: null, stopReason: undefined };
  }
  const stoppedAt = numberOr(existing.stoppedAt, 0) ?? 0;
  // This tab already knows about a stop at least as new: nothing to restore.
  if (incoming.stopped === true && (numberOr(incoming.stoppedAt, 0) ?? 0) >= stoppedAt) {
    return incoming;
  }
  const restartedAt = numberOr(incoming.startedAt, 0) ?? 0;
  const restarted = incoming.stopped !== true && restartedAt > stoppedAt;
  if (restarted) return incoming;
  return {
    ...incoming,
    stopped: true,
    stopReason: existing.stopReason,
    stoppedAt: existing.stoppedAt ?? null,
    yellowAt: null,
  };
}

/**
 * `unchangedWriteSkippingStorage`, plus the stop merge above. `onStoredStop`
 * fires when storage knew about a stop this tab did not, so the writing tab
 * can rehydrate instead of continuing to show a running session it just
 * failed to overwrite.
 */
function sessionStorage(onStoredStop: () => void): PersistStorage<PersistedSession> {
  const base = unchangedWriteSkippingStorage<PersistedSession>();
  return {
    ...base,
    setItem: (key, value) => {
      let diverged = false;
      try {
        const raw = safeBrowserStorage().getItem(key);
        if (raw) {
          const existing = (JSON.parse(raw) as { state?: Partial<PersistedSession> })?.state ?? null;
          const merged = mergeSessionSafety(value.state, existing);
          diverged = merged !== value.state;
          if (diverged) value.state = merged as PersistedSession;
        }
      } catch {
        // A corrupt stored blob is simply replaced by the incoming one.
      }
      const result = base.setItem(key, value);
      if (diverged) {
        try {
          onStoredStop();
        } catch {
          // Self-repair is best effort; storage already holds the stop.
        }
      }
      return result;
    },
  };
}

export function withinSessionWindow(snapshot: Partial<PersistedSession>): boolean {
  const marks = [snapshot.startedAt, snapshot.lastCheckAt, snapshot.yellowAt, snapshot.stoppedAt];
  const newest = marks.reduce<number>(
    (best, mark) => (typeof mark === "number" && Number.isFinite(mark) && mark > best ? mark : best),
    0,
  );
  if (newest === 0) return false;
  const age = Date.now() - newest;
  // A stored mark in the future means the wall clock moved backwards; treat it
  // as current rather than discarding a live stop over clock skew.
  return age < SESSION_MAX_AGE_MS;
}

type SessionState = {
  tieSlug?: string;
  furnitureSlug?: string;
  stepIndex: number;
  startedAt: number | null;
  lastCheckAt: number | null;
  elapsed: number;
  listening: boolean;
  stopped: boolean;
  stopReason?: string;
  /** When the stop was called, so a fresh stop dates a long-running session. */
  stoppedAt: number | null;
  /**
   * A yellow signal is not a stop. The knowledge base is explicit that red ends
   * the night and yellow changes it, so yellow raises this flag and the session
   * keeps running; the studio renders its own banner and the top clears it after
   * checking in. Routing yellow through stop() showed the full red alert,
   * emergency-services text and all, which teaches people not to say yellow.
   */
  yellowAt: number | null;
  setTie: (slug?: string) => void;
  setFurniture: (slug?: string) => void;
  setStep: (n: number) => void;
  start: () => void;
  tick: (now: number) => void;
  checked: () => void;
  stop: (reason: string) => void;
  flagYellow: () => void;
  clearYellow: () => void;
  reset: () => void;
  setListening: (v: boolean) => void;
};

export const useSession = create<SessionState>()(
  persist(
    (set, get) => ({
      stepIndex: 0,
      startedAt: null,
      lastCheckAt: null,
      elapsed: 0,
      listening: false,
      stopped: false,
      stoppedAt: null,
      yellowAt: null,
      setTie: (slug) => {
        if (get().stopped) return;
        set({
          tieSlug: slug,
          stepIndex: 0,
        });
      },
      setFurniture: (slug) => {
        if (get().stopped) return;
        set({ furnitureSlug: slug });
      },
      setStep: (n) => {
        if (get().stopped) return;
        set({ stepIndex: Math.max(0, Math.floor(Number.isFinite(n) ? n : 0)) });
      },
      start: () => {
        if (get().stopped) return;
        const now = Date.now();
        set({ startedAt: now, lastCheckAt: now, elapsed: 0 });
      },
      tick: (now) => {
        const { startedAt, stopped, elapsed } = get();
        if (!startedAt || stopped) return;
        // Clock skew or a backward wall clock must not store a negative elapsed,
        // which would render in the session clock and ship as elapsedSec.
        const next = Math.max(0, Math.floor((now - startedAt) / 1000));
        if (next === elapsed) return;
        set({ elapsed: next });
      },
      checked: () => set({ lastCheckAt: Date.now(), yellowAt: null }),
      stop: (reason) =>
        set({ stopped: true, stopReason: reason, stoppedAt: Date.now(), yellowAt: null }),
      flagYellow: () => {
        // A stop already supersedes it, and re-flagging while one stands must not
        // restart the clock on a check-in that has not happened yet.
        const { stopped, yellowAt } = get();
        if (stopped || yellowAt !== null) return;
        set({ yellowAt: Date.now() });
      },
      clearYellow: () => set({ yellowAt: null }),
      reset: () => {
        const now = Date.now();
        set({
          stepIndex: 0,
          startedAt: now,
          lastCheckAt: now,
          elapsed: 0,
          stopped: false,
          stopReason: undefined,
          stoppedAt: null,
          yellowAt: null,
        });
      },
      setListening: (v) => set({ listening: v }),
    }),
    {
      name: SESSION_KEY,
      storage: sessionStorage(() => {
        // Deferred: rehydrate() reads the store that is mid-write here.
        queueMicrotask(() => void useSession.persist.rehydrate());
      }),
      partialize: (state): PersistedSession => ({
        tieSlug: state.tieSlug,
        furnitureSlug: state.furnitureSlug,
        stepIndex: state.stepIndex,
        startedAt: state.startedAt,
        lastCheckAt: state.lastCheckAt,
        stopped: state.stopped,
        stopReason: state.stopReason,
        stoppedAt: state.stoppedAt,
        yellowAt: state.yellowAt,
      }),
      merge: (persisted, current) => {
        const snapshot = (persisted ?? {}) as Partial<PersistedSession>;
        if (!withinSessionWindow(snapshot)) return current;
        const startedAt =
          typeof snapshot.startedAt === "number" && Number.isFinite(snapshot.startedAt)
            ? snapshot.startedAt
            : null;
        return {
          ...current,
          tieSlug: typeof snapshot.tieSlug === "string" ? snapshot.tieSlug : undefined,
          furnitureSlug:
            typeof snapshot.furnitureSlug === "string" ? snapshot.furnitureSlug : undefined,
          stepIndex:
            typeof snapshot.stepIndex === "number" && Number.isFinite(snapshot.stepIndex)
              ? Math.max(0, Math.floor(snapshot.stepIndex))
              : 0,
          startedAt,
          lastCheckAt:
            typeof snapshot.lastCheckAt === "number" && Number.isFinite(snapshot.lastCheckAt)
              ? snapshot.lastCheckAt
              : startedAt,
          // Recomputed from startedAt rather than restored, so the clock shows
          // how long the tie has actually been on.
          elapsed: startedAt === null ? 0 : Math.max(0, Math.floor((Date.now() - startedAt) / 1000)),
          stopped: snapshot.stopped === true,
          stopReason: typeof snapshot.stopReason === "string" ? snapshot.stopReason : undefined,
          stoppedAt:
            typeof snapshot.stoppedAt === "number" && Number.isFinite(snapshot.stoppedAt)
              ? snapshot.stoppedAt
              : null,
          yellowAt:
            typeof snapshot.yellowAt === "number" && Number.isFinite(snapshot.yellowAt)
              ? snapshot.yellowAt
              : null,
        };
      },
    },
  ),
);

// A stop called in one tab has to stop every tab. Rehydrate reads storage into
// state and never writes, so there is no cross-tab write loop.
syncPersistedAcrossTabs(SESSION_KEY, () => {
  void useSession.persist.rehydrate();
});
