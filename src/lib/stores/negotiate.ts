import { create } from "zustand";
import { persist } from "zustand/middleware";
import { adoptPersistKey, safeJsonStorage, syncPersistedAcrossTabs } from "./persist";

export type Rank = "yes" | "maybe" | "no";

export type NegItem = { id: string; label: string; rank: Rank };

export const LOCKED_NO = new Set(["neck", "breath", "suspension", "alone"]);

const STARTER: NegItem[] = [
  { id: "photos", label: "Photos / video for coaching", rank: "no" },
  { id: "voice", label: "Being spoken to in protocol", rank: "no" },
  { id: "cuffs", label: "Wrist and ankle cuffs", rank: "no" },
  { id: "torso", label: "Chest / karada harnesses", rank: "no" },
  { id: "gote", label: "Takate-kote (box tie)", rank: "no" },
  { id: "crotch", label: "Crotch rope", rank: "no" },
  { id: "gag", label: "Gags", rank: "no" },
  { id: "predicament", label: "Predicament / endurance", rank: "no" },
  { id: "marks", label: "Marks that last past tomorrow", rank: "no" },
  { id: "impact", label: "Impact on tied flesh", rank: "no" },
  { id: "cross", label: "Saint Andrew's Cross (arms up)", rank: "no" },
  { id: "swing", label: "Sex swing as support", rank: "no" },
  { id: "pole", label: "Cuffed to the pole", rank: "no" },
  { id: "bench", label: "Bench / table bondage", rank: "no" },
  { id: "machine", label: "Machine use while bound", rank: "no" },
  { id: "toys", label: "Large toys while bound", rank: "no" },
  { id: "face", label: "Face in photos", rank: "no" },
  { id: "public", label: "Anyone else seeing the stills", rank: "no" },
  { id: "neck", label: "Anything on the neck", rank: "no" },
  { id: "breath", label: "Breath play", rank: "no" },
  { id: "suspension", label: "Full suspension", rank: "no" },
  { id: "alone", label: "Being left tied and alone", rank: "no" },
];

function clampRank(r: unknown): Rank {
  return r === "yes" || r === "maybe" || r === "no" ? r : "no";
}

function parseCandidate(value: unknown): NegItem | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  const id = typeof candidate.id === "string" ? candidate.id.trim().slice(0, 80) : "";
  const label =
    typeof candidate.label === "string" ? candidate.label.trim().slice(0, 80) : "";
  // Keep a canonical ID even when its untrusted label is malformed so that a
  // duplicate cannot disappear during sanitization and preserve a prior yes.
  if (!id) return null;
  return { id, label, rank: clampRank(candidate.rank) };
}

/**
 * Normalize untrusted persisted negotiation data into one bounded, complete
 * policy. Missing or duplicated canonical rows revert to no; locked rows can
 * never be restored as yes. Custom rows are retained once by ID.
 */
export function normalizeNegotiationItems(value: unknown): NegItem[] {
  const candidates = Array.isArray(value)
    ? value.slice(0, 40).map(parseCandidate).filter((item): item is NegItem => item !== null)
    : [];
  const starterIds = new Set(STARTER.map((item) => item.id));
  const matchesById = new Map<string, NegItem[]>();
  for (const candidate of candidates) {
    const matches = matchesById.get(candidate.id) ?? [];
    matches.push(candidate);
    matchesById.set(candidate.id, matches);
  }

  const normalized = STARTER.map((seed) => {
    const matches = matchesById.get(seed.id) ?? [];
    const rank =
      matches.length === 1 && matches[0].label && !LOCKED_NO.has(seed.id)
        ? matches[0].rank
        : ("no" as Rank);
    return { ...seed, rank };
  });

  const customIds = new Set<string>();
  for (const candidate of candidates) {
    if (!candidate.label || starterIds.has(candidate.id) || customIds.has(candidate.id)) continue;
    const matches = matchesById.get(candidate.id) ?? [];
    normalized.push({
      ...candidate,
      rank: matches.length === 1 ? candidate.rank : "no",
    });
    customIds.add(candidate.id);
    if (normalized.length === 40) break;
  }
  return normalized;
}

type State = {
  negotiationVersion: number;
  items: NegItem[];
  notes: string;
  setRank: (id: string, rank: Rank) => void;
  setNotes: (n: string) => void;
  add: (label: string) => void;
};

adoptPersistKey("knotty-negotiate", "musubi-negotiate");

export const useNegotiate = create<State>()(
  persist(
    (set, get) => ({
      negotiationVersion: 2,
      items: normalizeNegotiationItems(STARTER),
      notes: "",
      setRank: (id, rank) =>
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, rank: LOCKED_NO.has(i.id) ? "no" : clampRank(rank) } : i,
          ),
        }),
      setNotes: (notes) => set({ notes: notes.slice(0, 600) }),
      add: (label) => {
        const clean = label.trim().slice(0, 80);
        if (!clean) return;
        if (get().items.some((item) => item.label.toLowerCase() === clean.toLowerCase())) return;
        set({
          items: normalizeNegotiationItems([
            ...get().items,
            { id: crypto.randomUUID(), label: clean, rank: "no" as Rank },
          ]),
        });
      },
    }),
    {
      name: "knotty-negotiate",
      storage: safeJsonStorage<State>(),
      version: 1,
      migrate: (persisted) => persisted as State,
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<State>;
        const currentPolicy = p.negotiationVersion === 2;
        const items =
          currentPolicy && Array.isArray(p.items)
            ? normalizeNegotiationItems(p.items)
            : current.items;
        return {
          ...current,
          negotiationVersion: 2,
          items,
          notes: typeof p.notes === "string" ? p.notes.slice(0, 600) : current.notes,
        };
      },
    },
  ),
);

// Propagate a limit revocation (including the media-gating "photos" yes) from
// another tab instead of letting a stale tab's later write resurrect it.
syncPersistedAcrossTabs("knotty-negotiate", () => {
  void useNegotiate.persist.rehydrate();
});
