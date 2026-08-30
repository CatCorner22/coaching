import { create } from "zustand";
import { persist, type PersistStorage } from "zustand/middleware";
import { safeJsonStorage, syncPersistedAcrossTabs } from "./persist";

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
  | "yellowAt"
>;

/**
 * Skip a write whose payload is byte-identical to the last one. tick() sets
 * state every second; without this the store rewrote (and cross-tab
 * broadcast) an unchanged blob at 1 Hz for the whole scene.
 */
function unchangedWriteSkippingStorage<State>(): PersistStorage<State> {
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
      lastWritten = serialized;
      return base.setItem(key, value);
    },
    removeItem: (key) => {
      lastWritten = null;
      return base.removeItem(key);
    },
  };
}

function withinSessionWindow(snapshot: Partial<PersistedSession>): boolean {
  const marks = [snapshot.startedAt, snapshot.lastCheckAt, snapshot.yellowAt];
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
      checked: () => set({ lastCheckAt: Date.now() }),
      stop: (reason) => set({ stopped: true, stopReason: reason, yellowAt: null }),
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
          yellowAt: null,
        });
      },
      setListening: (v) => set({ listening: v }),
    }),
    {
      name: SESSION_KEY,
      storage: unchangedWriteSkippingStorage<PersistedSession>(),
      partialize: (state): PersistedSession => ({
        tieSlug: state.tieSlug,
        furnitureSlug: state.furnitureSlug,
        stepIndex: state.stepIndex,
        startedAt: state.startedAt,
        lastCheckAt: state.lastCheckAt,
        stopped: state.stopped,
        stopReason: state.stopReason,
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
