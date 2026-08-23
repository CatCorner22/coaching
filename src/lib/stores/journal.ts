import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Disposition, SourceId } from "@/lib/observation/report";
import { SAFETY_SOURCE_IDS } from "@/lib/kb/sources";
import { summarizeImport, type ImportSummary } from "@/lib/journal-backup";
import {
  adoptPersistKey,
  journalMergingStorage,
  mergeJournalEntriesById,
  syncPersistedAcrossTabs,
} from "./persist";

export type JournalEntry = {
  id: string;
  at: number;
  tieSlug?: string;
  minutes: number;
  notes: string;
  flags: string[];
  disposition: Disposition;
  limitations: string[];
  sourceIds: SourceId[];
};

type JournalState = {
  entries: JournalEntry[];
  /**
   * Ids of deleted entries, so a stale tab's older copy cannot resurrect them
   * when the two are unioned. Bounded; the union keeps both sides' tombstones.
   */
  removedIds: string[];
  nerveHits: number;
  add: (e: Omit<JournalEntry, "id" | "at">) => string;
  remove: (id: string) => void;
  clear: () => void;
  /** Merge a decrypted backup in, never replacing what is already here. */
  importEntries: (entries: readonly unknown[], removedIds: readonly string[]) => ImportSummary;
};

const DISPOSITIONS = new Set<Disposition>([
  "stop_now",
  "do_not_proceed",
  "pause_and_correct",
  "insufficient_view",
  "lower_consequence_learning_only",
  "no_visible_concern_not_clearance",
]);
const SOURCE_IDS = new Set<SourceId>(SAFETY_SOURCE_IDS);

function normalizeJournalEntry(value: unknown, index: number): JournalEntry | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Partial<JournalEntry>;
  const at = Number(row.at);
  const minutes = Number(row.minutes);
  const disposition = DISPOSITIONS.has(row.disposition as Disposition)
    ? (row.disposition as Disposition)
    : "insufficient_view";
  return {
    id: typeof row.id === "string" && row.id ? row.id.slice(0, 100) : `legacy-${index}-${Number.isFinite(at) ? at : 0}`,
    at: Number.isFinite(at) && at > 0 ? at : Date.now(),
    tieSlug: typeof row.tieSlug === "string" ? row.tieSlug.slice(0, 100) : undefined,
    minutes: Number.isFinite(minutes) ? Math.max(0, Math.min(24 * 60, Math.round(minutes))) : 0,
    notes: String(row.notes ?? "").slice(0, 400),
    flags: Array.isArray(row.flags)
      ? row.flags.filter((flag): flag is string => typeof flag === "string").slice(0, 20).map((flag) => flag.slice(0, 80))
      : [],
    disposition,
    limitations: Array.isArray(row.limitations)
      ? row.limitations.filter((item): item is string => typeof item === "string").slice(0, 6).map((item) => item.slice(0, 240))
      : ["Legacy entry: no structured limitation record was stored."],
    sourceIds: Array.isArray(row.sourceIds)
      ? row.sourceIds.filter((source): source is SourceId => SOURCE_IDS.has(source as SourceId)).slice(0, 12)
      : [],
  };
}

adoptPersistKey("knotty-journal", "musubi-journal");

export const useJournal = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: [],
      removedIds: [],
      nerveHits: 0,
      add: (e) => {
        const id = crypto.randomUUID();
        const nerve = e.flags.some((f) => /nerve|radial|numb/i.test(f)) ? 1 : 0;
        set({
          entries: [{ id, at: Date.now(), ...e, notes: String(e.notes ?? "").slice(0, 400) }, ...get().entries].slice(0, 80),
          nerveHits: get().nerveHits + nerve,
        });
        return id;
      },
      remove: (id) => {
        set({
          entries: get().entries.filter((x) => x.id !== id),
          removedIds: [...get().removedIds, id].slice(-200),
        });
      },
      clear: () =>
        set({
          entries: [],
          // Tombstone what was there, or another tab restores all of it.
          removedIds: [...get().removedIds, ...get().entries.map((x) => x.id)].slice(-200),
          nerveHits: 0,
        }),
      /**
       * Restore is a union, not a replace: an old backup must never delete
       * entries written since it was taken. Every incoming row goes through the
       * same normalizer as a rehydrate, and tombstones from either side win —
       * so restoring a backup cannot bring back something already deleted.
       */
      importEntries: (incoming, incomingRemoved) => {
        const existing = get().entries;
        const existingRemoved = get().removedIds;
        const summary = summarizeImport(
          incoming as readonly { id?: unknown }[],
          existing,
          existingRemoved,
          incomingRemoved,
        );
        const normalized = incoming
          .map(normalizeJournalEntry)
          .filter((entry): entry is JournalEntry => entry !== null);
        const merged = mergeJournalEntriesById(
          normalized,
          existing,
          incomingRemoved,
          existingRemoved,
        );
        if (!merged) return { added: 0, alreadyPresent: 0, skippedDeleted: 0 };
        const entries = merged.entries as JournalEntry[];
        set({
          entries,
          removedIds: merged.removedIds,
          nerveHits: entries.reduce(
            (count, entry) =>
              count + (entry.flags.some((flag) => /nerve|radial|numb/i.test(flag)) ? 1 : 0),
            0,
          ),
        });
        return summary;
      },
    }),
    {
      name: "knotty-journal",
      storage: journalMergingStorage<JournalState>("knotty-journal"),
      merge: (persisted, current) => {
        const snapshot = (persisted ?? {}) as Partial<JournalState>;
        const entries = Array.isArray(snapshot.entries)
          ? snapshot.entries
              .slice(0, 80)
              .map(normalizeJournalEntry)
              .filter((entry): entry is JournalEntry => entry !== null)
          : current.entries;
        return {
          ...current,
          entries,
          removedIds: Array.isArray(snapshot.removedIds)
            ? snapshot.removedIds.filter((id): id is string => typeof id === "string").slice(-200)
            : current.removedIds,
          nerveHits: entries.reduce(
            (count, entry) => count + (entry.flags.some((flag) => /nerve|radial|numb/i.test(flag)) ? 1 : 0),
            0,
          ),
        };
      },
    },
  ),
);

const PHOTO_DB = "musubi-photos";

export function purgeLegacyStills(): Promise<void> {
  if (typeof indexedDB === "undefined") return Promise.resolve();
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(PHOTO_DB);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("Could not delete legacy stills"));
    request.onblocked = () => reject(new Error("Close other Knotty tabs, then try again."));
  });
}

// The journal was the only persisted store without this, so a report saved in
// one tab was invisible in the other until reload — and the stale tab's next
// write erased it.
syncPersistedAcrossTabs("knotty-journal", () => {
  void useJournal.persist.rehydrate();
});
