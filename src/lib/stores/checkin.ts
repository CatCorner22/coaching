import { create } from "zustand";

export type CheckChoice = "not_checked" | "no_concern" | "concern";
export type ConsentChoice = "not_checked" | "yes" | "no";

export type CheckIn = {
  id: string;
  at: number;
  consent: ConsentChoice;
  sensation: CheckChoice;
  movement: CheckChoice;
  breathingSpeechAlertness: CheckChoice;
  painSwellingTemperature: CheckChoice;
  emergencySigns: CheckChoice;
  note: string;
};

type State = {
  logs: CheckIn[];
  add: (check: Omit<CheckIn, "id" | "at">) => void;
  clear: () => void;
};

// Check-ins are intentionally session-memory only. They can contain health and
// consent information and should not silently persist on a shared device.
export const useCheckIn = create<State>((set, get) => ({
  logs: [],
  add: (check) =>
    set({
      logs: [
        {
          id: crypto.randomUUID(),
          at: Date.now(),
          ...check,
          note: String(check.note ?? "").slice(0, 240),
        },
        ...get().logs,
      ].slice(0, 20),
    }),
  clear: () => set({ logs: [] }),
}));
