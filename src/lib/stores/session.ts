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
  setTie: (slug) => set({ tieSlug: slug, stepIndex: 0, stopped: false, stopReason: undefined }),
  setFurniture: (slug) => set({ furnitureSlug: slug }),
  setStep: (n) => set({ stepIndex: Math.max(0, n) }),
  start: () => {
    const now = Date.now();
    set({ startedAt: now, lastCheckAt: now, elapsed: 0, stopped: false });
  },
  tick: (now) => {
    const { startedAt } = get();
    if (!startedAt) return;
    set({ elapsed: Math.floor((now - startedAt) / 1000) });
  },
  checked: () => set({ lastCheckAt: Date.now() }),
  stop: (reason) => set({ stopped: true, stopReason: reason }),
  reset: () =>
    set({
      stepIndex: 0,
      startedAt: null,
      lastCheckAt: null,
      elapsed: 0,
      stopped: false,
      stopReason: undefined,
    }),
  setListening: (v) => set({ listening: v }),
}));
