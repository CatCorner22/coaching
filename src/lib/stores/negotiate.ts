import { create } from "zustand";
import { randomId } from "@/lib/random-id";
import { MAX_NEGOTIATION_ITEMS } from "@/lib/negotiation-bounds";
import { persist } from "zustand/middleware";
import {
  adoptPersistKey,
  negotiationMergingStorage,
  nextNegotiationStamp,
  syncPersistedAcrossTabs,
  unionRemovedIds,
} from "./persist";

// Re-exported: the ceiling is shared with the analyze request schema, which
// must accept the whole list being at no. See @/lib/negotiation-bounds.
export { MAX_NEGOTIATION_ITEMS };

export type Rank = "yes" | "maybe" | "no";

/**
 * `updatedAt` versions each decision. zustand persists the WHOLE state blob on
 * every set(), so without it a tab holding stale state resurrects a rank that
 * another tab just revoked, simply by saving something unrelated. Reads and
 * writes both resolve per item by this stamp instead of by write order.
 */
export type NegItem = { id: string; label: string; rank: Rank; updatedAt?: number };

export const LOCKED_NO = new Set(["neck", "breath", "suspension", "alone"]);

const STARTER: NegItem[] = [
  { id: "photos", label: "Photos / video for coaching", rank: "no" },
  { id: "voice", label: "Being spoken to in protocol", rank: "no" },
  { id: "cuffs", label: "Wrist and ankle cuffs", rank: "no" },
  { id: "torso", label: "Chest / karada harnesses", rank: "no" },
  { id: "arms", label: "Arm and shoulder ties", rank: "no" },
  { id: "legs", label: "Leg and thigh ties", rank: "no" },
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
  // Activity families beyond rope. Each is its own row because negotiating
  // "impact" or "sensation" as one item is close to useless — the categories
  // inside them have almost nothing in common.
  { id: "spanking", label: "Hand spanking", rank: "no" },
  { id: "implements", label: "Floggers, paddles, canes", rank: "no" },
  { id: "wax", label: "Wax or temperature play", rank: "no" },
  { id: "clamps", label: "Clamps and pinching", rank: "no" },
  { id: "blindfold", label: "Blindfold", rank: "no" },
  { id: "hood", label: "Hood or anything over the head", rank: "no" },
  { id: "electrical", label: "Electrical play", rank: "no" },
  { id: "denial", label: "Orgasm control or denial", rank: "no" },
  { id: "chastity", label: "Chastity device", rank: "no" },
  { id: "degradation", label: "Degrading or humiliating language", rank: "no" },
  { id: "roleplay", label: "Personas and role play", rank: "no" },
  { id: "objectify", label: "Objectification / held positions", rank: "no" },
  { id: "anal", label: "Anal play", rank: "no" },
  { id: "cnc", label: "Consensual non-consent / resistance", rank: "no" },
  { id: "discipline", label: "Punishment or discipline", rank: "no" },
  { id: "substances", label: "Playing after drinking", rank: "no" },
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

/**
 * Superseded by `normalizeNegotiationItems`, and kept only because this merge
 * brought both forward and its tests still cover it.
 *
 * Do not call it from production code. It enforces LOCKED_NO, but it does not
 * carry per-item `updatedAt` stamps, does not collapse a duplicated id to no,
 * and does not preserve custom rows — all of which the normalizer does, and all
 * of which matter on the store that records consent decisions.
 */
export function lockItems(items: NegItem[]): NegItem[] {
  const mapped = items
    .filter((i): i is NegItem => !!i && typeof i === "object")
    .slice(0, 40)
    .map((i) => ({
      id: String(i.id ?? "").slice(0, 80),
      label: String(i.label ?? "").slice(0, 80),
      rank: LOCKED_NO.has(String(i.id)) ? ("no" as Rank) : clampRank(i.rank),
    }))
    .filter((i) => i.id && i.label);
  const have = new Set(mapped.map((i) => i.id));
  for (const seed of STARTER) {
    if (LOCKED_NO.has(seed.id) && !have.has(seed.id)) mapped.push({ ...seed, rank: "no" });
  }
  return mapped;
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
  const updatedAt = Number(candidate.updatedAt);
  return {
    id,
    label,
    rank: clampRank(candidate.rank),
    ...(Number.isFinite(updatedAt) && updatedAt > 0 ? { updatedAt } : {}),
  };
}

/**
 * Normalize untrusted persisted negotiation data into one bounded, complete
 * policy. Missing or duplicated canonical rows revert to no; locked rows can
 * never be restored as yes. Custom rows are retained once by ID.
 */
export function normalizeNegotiationItems(value: unknown, removedIds: readonly string[] = []): NegItem[] {
  const removed = new Set(removedIds);
  const candidates = Array.isArray(value)
    ? value.slice(0, MAX_NEGOTIATION_ITEMS).map(parseCandidate).filter((item): item is NegItem => item !== null)
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
    const stamp = matches.length === 1 ? matches[0].updatedAt : undefined;
    return { ...seed, rank, ...(stamp ? { updatedAt: stamp } : {}) };
  });

  const customIds = new Set<string>();
  for (const candidate of candidates) {
    if (!candidate.label || starterIds.has(candidate.id) || customIds.has(candidate.id)) continue;
    if (removed.has(candidate.id)) continue;
    const matches = matchesById.get(candidate.id) ?? [];
    normalized.push({
      ...candidate,
      rank: matches.length === 1 ? candidate.rank : "no",
    });
    customIds.add(candidate.id);
    if (normalized.length === MAX_NEGOTIATION_ITEMS) break;
  }
  return normalized;
}

type State = {
  negotiationVersion: number;
  items: NegItem[];
  /** Custom rows the couple deleted. Starter rows are never removable. */
  removedIds: string[];
  notes: string;
  notesUpdatedAt?: number;
  setRank: (id: string, rank: Rank) => void;
  setNotes: (n: string) => void;
  add: (label: string) => void;
  remove: (id: string) => void;
};

export const STARTER_IDS: ReadonlySet<string> = new Set(STARTER.map((item) => item.id));

adoptPersistKey("knotty-negotiate", "musubi-negotiate");

export const useNegotiate = create<State>()(
  persist(
    (set, get) => ({
      negotiationVersion: 2,
      items: normalizeNegotiationItems(STARTER),
      removedIds: [],
      notes: "",
      setRank: (id, rank) => {
        // Monotonic, so a backward clock correction cannot stamp a fresh
        // decision as older than the one it replaces.
        const stamp = nextNegotiationStamp(get().items.map((i) => i.updatedAt));
        set({
          items: get().items.map((i) =>
            i.id === id
              ? { ...i, rank: LOCKED_NO.has(i.id) ? "no" : clampRank(rank), updatedAt: stamp }
              : i,
          ),
        });
      },
      setNotes: (notes) =>
        set({
          notes: notes.slice(0, 600),
          notesUpdatedAt: nextNegotiationStamp([get().notesUpdatedAt]),
        }),
      add: (label) => {
        const clean = label.trim().slice(0, 80);
        if (!clean) return;
        if (get().items.some((item) => item.label.toLowerCase() === clean.toLowerCase())) return;
        set({
          items: normalizeNegotiationItems([
            ...get().items,
            {
              id: randomId(),
              label: clean,
              rank: "no" as Rank,
              updatedAt: nextNegotiationStamp(get().items.map((i) => i.updatedAt)),
            },
          ]),
        });
      },
      remove: (id) => {
        if (STARTER_IDS.has(id)) return;
        if (!get().items.some((item) => item.id === id)) return;
        set({
          items: get().items.filter((item) => item.id !== id),
          removedIds: unionRemovedIds(get().removedIds, [id]),
        });
      },
    }),
    {
      name: "knotty-negotiate",
      storage: negotiationMergingStorage<State>("knotty-negotiate", () => {
        // The write-merge just kept a stored rank over the one this tab held,
        // which means memory is more permissive than the persisted policy.
        // Read it back so the tab stops offering what has been revoked, with
        // or without a delivered `storage` event.
        void useNegotiate.persist.rehydrate();
      }),
      version: 1,
      migrate: (persisted) => persisted as State,
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<State>;
        const currentPolicy = p.negotiationVersion === 2;
        const removedIds = unionRemovedIds(p.removedIds, current.removedIds);
        const items =
          currentPolicy && Array.isArray(p.items)
            ? normalizeNegotiationItems(p.items, removedIds)
            : current.items.filter((item) => !removedIds.includes(item.id));
        return {
          ...current,
          negotiationVersion: 2,
          items,
          removedIds,
          notes: typeof p.notes === "string" ? p.notes.slice(0, 600) : current.notes,
          notesUpdatedAt: Number(p.notesUpdatedAt) || current.notesUpdatedAt,
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
