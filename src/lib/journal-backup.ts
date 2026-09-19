/**
 * The plaintext payload that goes inside an encrypted journal backup.
 *
 * A backup carries tombstones as well as entries. Without them, importing an
 * older file resurrects everything the owner has since deleted — the one
 * failure mode that turns a backup into a privacy incident rather than a
 * convenience.
 */
import type { JournalEntry } from "@/lib/stores/journal";

export const BACKUP_FORMAT = "knotty-journal";
export const BACKUP_VERSION = 1;

export type JournalBackup = {
  format: typeof BACKUP_FORMAT;
  v: number;
  exportedAt: number;
  entries: JournalEntry[];
  removedIds: string[];
};

export function serializeJournalBackup(
  entries: readonly JournalEntry[],
  removedIds: readonly string[],
  exportedAt: number,
): string {
  const backup: JournalBackup = {
    format: BACKUP_FORMAT,
    v: BACKUP_VERSION,
    exportedAt,
    entries: [...entries],
    removedIds: [...removedIds],
  };
  return JSON.stringify(backup);
}

/**
 * Read a decrypted payload back.
 *
 * Returns null rather than throwing for anything that is not this format: the
 * caller has already got past decryption, so the only remaining question is
 * whether the plaintext is a backup, and a null keeps that one decision in one
 * place. Entry contents are deliberately *not* validated here — the journal
 * store normalizes every entry it accepts, and duplicating those rules is how
 * the two drift apart.
 */
export function parseJournalBackup(text: string): JournalBackup | null {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return null;
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const b = raw as Partial<JournalBackup>;
  if (b.format !== BACKUP_FORMAT) return null;
  if (typeof b.v !== "number" || b.v > BACKUP_VERSION) return null;
  if (!Array.isArray(b.entries)) return null;
  const exportedAt = Number(b.exportedAt);
  return {
    format: BACKUP_FORMAT,
    v: b.v,
    exportedAt: Number.isFinite(exportedAt) && exportedAt > 0 ? exportedAt : 0,
    entries: b.entries as JournalEntry[],
    removedIds: Array.isArray(b.removedIds)
      ? b.removedIds.filter((id): id is string => typeof id === "string")
      : [],
  };
}

/** What an import actually did, so the screen can report it rather than claiming success. */
export type ImportSummary = {
  added: number;
  alreadyPresent: number;
  skippedDeleted: number;
  /** Imported entries the journal cap discarded — older rows that did not fit. */
  notKept: number;
  /** Existing entries the same cap pushed out to make room. */
  displaced: number;
  /**
   * Entries on this device the file records as deleted, and which the restore
   * therefore removed. The screen used to report these as nothing at all,
   * while promising a restore never deletes.
   */
  deletedByFile: number;
};

/**
 * Derived from the merge RESULT, not from intent. The previous version
 * mirrored the merge's tombstone and dedup rules but not its newest-first
 * cap, so with a full journal it reported "Added 20." while zero of the
 * twenty survived the slice — and said nothing when the same merge pushed
 * out existing entries, which the restore screen promises never happens
 * silently.
 */
export function summarizeImport(
  merged: readonly { id?: unknown }[],
  incoming: readonly { id?: unknown }[],
  existing: readonly { id?: unknown }[],
  existingRemoved: readonly string[],
  incomingRemoved: readonly string[],
): ImportSummary {
  const removed = new Set<string>([...existingRemoved, ...incomingRemoved]);
  const have = new Set<string>();
  for (const entry of existing) if (typeof entry?.id === "string") have.add(entry.id);
  const kept = new Set<string>();
  for (const entry of merged) if (typeof entry?.id === "string") kept.add(entry.id);

  let added = 0;
  let alreadyPresent = 0;
  let skippedDeleted = 0;
  let notKept = 0;
  const seen = new Set<string>();
  for (const entry of incoming) {
    const id = entry?.id;
    if (typeof id !== "string") continue;
    if (seen.has(id)) continue;
    seen.add(id);
    if (removed.has(id)) skippedDeleted += 1;
    else if (have.has(id)) alreadyPresent += 1;
    else if (kept.has(id)) added += 1;
    else notKept += 1;
  }
  let displaced = 0;
  for (const id of have) if (!kept.has(id) && !removed.has(id)) displaced += 1;
  const fileRemoved = new Set<string>(incomingRemoved);
  let deletedByFile = 0;
  for (const id of have) if (fileRemoved.has(id) && !kept.has(id)) deletedByFile += 1;
  return { added, alreadyPresent, skippedDeleted, notKept, displaced, deletedByFile };
}

/** `knotty-journal-2026-08-23.knotty` — sorts by date and says nothing else. */
export function backupFilename(exportedAt: number): string {
  const d = new Date(Number.isFinite(exportedAt) && exportedAt > 0 ? exportedAt : 0);
  const iso = Number.isNaN(d.getTime()) ? "unknown" : d.toISOString().slice(0, 10);
  return `knotty-journal-${iso}.knotty`;
}
