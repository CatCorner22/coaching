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
  setTie: (slug?: string) => void;
  setFurniture: (slug?: string) => void;
  setStep: (n: number) => void;
  start: () => void;
  tick: (now: number) => void;
  checked: () => void;
  stop: (reason: string) => void;
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
  stop: (reason) => set({ stopped: true, stopReason: reason }),
  reset: () => {
    const now = Date.now();
    set({
      stepIndex: 0,
      startedAt: now,
      lastCheckAt: now,
      elapsed: 0,
      stopped: false,
      stopReason: undefined,
    });
  },
  setListening: (v) => set({ listening: v }),
}));
