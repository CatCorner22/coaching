import { create } from "zustand";

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

export const useSession = create<SessionState>((set, get) => ({
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
}));
