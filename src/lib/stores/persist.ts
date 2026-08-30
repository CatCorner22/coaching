import { MAX_NEGOTIATION_ITEMS } from "@/lib/negotiation-bounds";
import { createJSONStorage, type PersistStorage } from "zustand/middleware";

type SyncStateStorage = {
  getItem: (name: string) => string | null;
  setItem: (name: string, value: string) => void;
  removeItem: (name: string) => void;
};

/**
 * A write that could not be persisted.
 *
 * setItem swallowed these and returned normally, so zustand — and every screen
 * reading from it — treated a failed write as a successful save. The live tab
 * looked right and the change was gone on reload. For the negotiation store
 * that means a limit the couple revoked comes back as they left it, which is
 * the one class of silence this app cannot afford.
 */
export type PersistFailure = { key: string; reason: "quota" | "blocked" };

let lastPersistFailure: PersistFailure | null = null;
const persistFailureListeners = new Set<(failure: PersistFailure) => void>();
const persistStatusListeners = new Set<(failure: PersistFailure | null) => void>();

function announcePersistStatus(failure: PersistFailure | null) {
  for (const listener of persistStatusListeners) {
    try {
      listener(failure);
    } catch {
      // A broken listener must not stop the others from hearing about it.
    }
  }
}

function reportPersistFailure(key: string, error: unknown) {
  const name = (error as { name?: string })?.name ?? "";
  const failure: PersistFailure = {
    key,
    reason: /quota|QuotaExceeded|NS_ERROR_DOM_QUOTA/i.test(name) ? "quota" : "blocked",
  };
  lastPersistFailure = failure;
  for (const listener of persistFailureListeners) {
    try {
      listener(failure);
    } catch {
      // A broken listener must not stop the others from hearing about it.
    }
  }
  announcePersistStatus(failure);
}

/**
 * A write landed.
 *
 * Without this the banner was permanent: one transient quota error left every
 * later save looking unsaved, which trains people to ignore the one warning
 * that matters.
 */
function notePersistSuccess() {
  if (lastPersistFailure === null) return;
  lastPersistFailure = null;
  announcePersistStatus(null);
}

/** Most recent failed write, or null if every write so far has landed. */
export function getPersistFailure(): PersistFailure | null {
  return lastPersistFailure;
}

/** Subscribe to failed writes. Returns an unsubscribe function. */
export function onPersistFailure(listener: (failure: PersistFailure) => void): () => void {
  persistFailureListeners.add(listener);
  return () => persistFailureListeners.delete(listener);
}

/**
 * Subscribe to whether writes are landing, failures and recoveries alike.
 * Returns an unsubscribe function.
 */
export function onPersistStatus(
  listener: (failure: PersistFailure | null) => void,
): () => void {
  persistStatusListeners.add(listener);
  return () => persistStatusListeners.delete(listener);
}

/** Test seam. */
export function resetPersistFailure() {
  lastPersistFailure = null;
}

/**
 * Storage that cannot store.
 *
 * A browser with storage switched off entirely (private mode, site data
 * blocked) never reaches a throwing setItem — `localStorage` is simply absent —
 * so the app used to run write-only-to-memory with nothing on screen saying so.
 * Every write here is reported as blocked, which is exactly what it is.
 */
const UNAVAILABLE_STORAGE: SyncStateStorage = {
  getItem: () => null,
  setItem: (name) => reportPersistFailure(name, { name: "StorageUnavailable" }),
  removeItem: () => undefined,
};

/** Return a bounded browser storage adapter that never throws during import or hydration. */
export function safeBrowserStorage(): SyncStateStorage {
  try {
    const storage = globalThis.localStorage;
    if (!storage) return UNAVAILABLE_STORAGE;
    return {
      getItem: (name) => {
        try {
          return storage.getItem(name);
        } catch {
          return null;
        }
      },
      setItem: (name, value) => {
        try {
          storage.setItem(name, value);
          notePersistSuccess();
        } catch (error) {
          // The live store keeps working from memory, but the change is NOT
          // saved. Say so rather than letting the tab look correct until reload.
          reportPersistFailure(name, error);
        }
      },
      removeItem: (name) => {
        try {
          storage.removeItem(name);
        } catch {
          // Treat blocked removal as unavailable storage.
        }
      },
    };
  } catch {
    return UNAVAILABLE_STORAGE;
  }
}

/** Zustand JSON storage that always exists and falls back to safe in-memory defaults. */
export function safeJsonStorage<State>(): PersistStorage<State> {
  return createJSONStorage<State>(() => {
    const storage = safeBrowserStorage();
    return {
      ...storage,
      getItem: (name) => {
        const value = storage.getItem(name);
        if (typeof value !== "string") return null;
        try {
          JSON.parse(value);
          return value;
        } catch {
          storage.removeItem(name);
          return null;
        }
      },
    };
  })!;
}

/**
 * Storage for the negotiation policy that resolves per item on WRITE.
 *
 * zustand persists the entire state blob on every set(), so a tab holding a
 * stale snapshot resurrects a rank another tab just revoked simply by saving
 * something unrelated (verified: revoking "photos" in one tab, then editing
 * notes in the other, restored the approval). Reading the current value and
 * keeping whichever side carries the newer per-item `updatedAt` makes the
 * outcome independent of write order, while still allowing a later
 * re-approval to win.
 */
export function negotiationMergingStorage<State>(
  name: string,
  /**
   * Called after a write whose merge overrode what the writing tab held —
   * i.e. storage already knew something this tab does not. The merge protected
   * storage; without this the writing tab kept offering, from memory, a tie or
   * a camera the persisted policy had already revoked, until something else
   * happened to rehydrate it.
   */
  onStoredPolicyDiverged?: () => void,
): PersistStorage<State> {
  const base = safeJsonStorage<State>();
  return {
    ...base,
    setItem: (key, value) => {
      if (key !== name) return base.setItem(key, value);
      let diverged = false;
      try {
        const raw = safeBrowserStorage().getItem(key);
        if (raw) {
          type Blob = {
            state?: {
              items?: unknown;
              notes?: unknown;
              notesUpdatedAt?: unknown;
              removedIds?: unknown;
            };
          };
          const existing = JSON.parse(raw) as Blob;
          const incoming = value as Blob;
          // A row removed in either tab stays removed: the item union below
          // keeps anything present on one side, so without the tombstones a
          // deleted custom line reappeared on the next write from the other tab.
          const removedIds = unionRemovedIds(
            incoming?.state?.removedIds,
            existing?.state?.removedIds,
          );
          (value as { state: { removedIds: unknown } }).state.removedIds = removedIds;
          const merged = mergeNegotiationItemsByStamp(
            incoming?.state?.items,
            existing?.state?.items,
          )?.filter((item) => !removedIds.includes(String((item as StampedItem).id)));
          if (merged) {
            diverged = negotiationItemsDiffer(incoming?.state?.items, merged);
            (value as { state: { items: unknown } }).state.items = merged;
          }
          // Notes were whole-blob last-writer-wins, so a stale tab erased what
          // the couple wrote in the other one. Keep the newer text; a tie keeps
          // whatever is already stored rather than overwriting it with older
          // state the writing tab happens to be holding.
          const incomingNotesAt = Number(incoming?.state?.notesUpdatedAt) || 0;
          const existingNotesAt = Number(existing?.state?.notesUpdatedAt) || 0;
          if (
            typeof existing?.state?.notes === "string" &&
            existingNotesAt >= incomingNotesAt &&
            existing.state.notes !== incoming?.state?.notes
          ) {
            (value as { state: { notes: unknown; notesUpdatedAt: unknown } }).state.notes =
              existing.state.notes;
            (value as { state: { notes: unknown; notesUpdatedAt: unknown } }).state.notesUpdatedAt =
              existing.state.notesUpdatedAt;
          }
        }
      } catch {
        // A corrupt existing blob is simply replaced by the incoming one.
      }
      const result = base.setItem(key, value);
      if (diverged && onStoredPolicyDiverged) {
        try {
          onStoredPolicyDiverged();
        } catch {
          // Self-repair is best effort; the stored policy is already correct.
        }
      }
      return result;
    },
  };
}

/** Removal tombstones for custom negotiation rows, from both tabs. */
export function unionRemovedIds(...sides: unknown[]): string[] {
  const ids = new Set<string>();
  for (const side of sides) {
    if (!Array.isArray(side)) continue;
    for (const id of side) {
      if (typeof id === "string" && id) ids.add(id.slice(0, 80));
    }
  }
  return [...ids].slice(0, MERGED_ITEM_CAP);
}

/** Whether the merge changed any rank the writing tab was holding. */
function negotiationItemsDiffer(incoming: unknown, merged: readonly unknown[]): boolean {
  if (!Array.isArray(incoming)) return true;
  if (incoming.length !== merged.length) return true;
  const byId = new Map<string, string>();
  for (const item of incoming as StampedItem[]) {
    if (item && typeof item.id === "string") byId.set(item.id, String(item.rank));
  }
  return (merged as StampedItem[]).some(
    (item) =>
      !!item &&
      typeof item.id === "string" &&
      (!byId.has(item.id) || byId.get(item.id) !== String(item.rank)),
  );
}

type StampedItem = { id?: unknown; rank?: unknown; updatedAt?: unknown };

/** Restrictiveness order. A tie must never resolve toward more permission. */
const RANK_RESTRICTION: Record<string, number> = { no: 2, maybe: 1, yes: 0 };

function restriction(rank: unknown) {
  return RANK_RESTRICTION[String(rank)] ?? 2;
}

function itemStamp(item: StampedItem) {
  const value = Number(item?.updatedAt);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/**
 * Per-id resolution between the writing tab's items and what is already stored.
 *
 * Two rules, both chosen so the failure mode is a limit that is too tight
 * rather than a permission the couple did not give:
 *
 *  - An item present on only one side is kept. Mapping over the incoming array
 *    alone deleted any limit added in another tab the moment a stale tab saved
 *    anything.
 *  - When the two sides disagree, the MORE RESTRICTIVE rank wins unless the
 *    more permissive one is strictly newer. Equal stamps therefore resolve to
 *    the restriction instead of to whichever tab happened to write last, while
 *    a genuine later re-approval still takes effect. Stamps are monotonic per
 *    store (see nextNegotiationStamp), so a backward wall-clock correction
 *    cannot make a fresh revocation look older than the approval it replaces.
 *
 * Exported for tests.
 */
export function mergeNegotiationItemsByStamp(
  incoming: unknown,
  existing: unknown,
): unknown[] | null {
  if (!Array.isArray(incoming) || !Array.isArray(existing)) return null;

  const existingById = new Map<string, StampedItem>();
  for (const item of existing as StampedItem[]) {
    if (item && typeof item.id === "string") existingById.set(item.id, item);
  }

  const seen = new Set<string>();
  const merged: unknown[] = [];
  for (const item of incoming as StampedItem[]) {
    if (!item || typeof item.id !== "string") {
      merged.push(item);
      continue;
    }
    seen.add(item.id);
    const other = existingById.get(item.id);
    if (!other) {
      merged.push(item);
      continue;
    }
    const mineIsMorePermissive = restriction(item.rank) < restriction(other.rank);
    const mineIsStrictlyNewer = itemStamp(item) > itemStamp(other);
    if (mineIsMorePermissive && !mineIsStrictlyNewer) {
      merged.push({ ...item, rank: other.rank, updatedAt: other.updatedAt });
      continue;
    }
    if (!mineIsMorePermissive && restriction(item.rank) === restriction(other.rank)) {
      // Same rank: keep the newer stamp so ordering stays monotonic.
      merged.push(itemStamp(other) > itemStamp(item) ? { ...item, updatedAt: other.updatedAt } : item);
      continue;
    }
    if (itemStamp(other) > itemStamp(item)) {
      // Mirror quadrant of the first branch: the stored side is more
      // permissive AND strictly newer — a genuine later re-approval from
      // another tab. The documented rule already says it wins; without this
      // branch the fallthrough wrote the stale older 'no' over it and
      // regressed the stored stamp, so the re-approval silently flipped back.
      merged.push({ ...item, rank: other.rank, updatedAt: other.updatedAt });
      continue;
    }
    merged.push(item);
  }

  // Anything the writing tab has never seen survives rather than being erased.
  // Bounded: without a cap the stored array grows on every write, because each
  // merge appends the survivors of the last one. The read path keeps 40, so
  // twice that is ample headroom for two tabs holding different custom limits
  // while keeping the blob from growing without limit.
  for (const [id, item] of existingById) {
    if (merged.length >= MERGED_ITEM_CAP) break;
    if (!seen.has(id)) merged.push(item);
  }
  return merged;
}

// Matches what the read path keeps. When the write cap was the larger of the
// two, rows the merge deliberately preserved were dropped on the next
// rehydrate, so the merger's promise that neither tab loses a row was not
// honoured end to end.
const MERGED_ITEM_CAP = MAX_NEGOTIATION_ITEMS;

/**
 * A stamp strictly greater than every stamp already recorded, so ordering does
 * not depend on the wall clock being monotonic. Without this a backward NTP or
 * manual clock correction made a revocation unsaveable: it was stamped earlier
 * than the approval it replaced, so the merge above kept the approval and the
 * store silently disagreed with storage.
 */
export function nextNegotiationStamp(stamps: readonly unknown[]): number {
  let highest = 0;
  for (const value of stamps) {
    const stamp = Number(value);
    if (Number.isFinite(stamp) && stamp > highest) highest = stamp;
  }
  const now = Date.now();
  return now > highest ? now : highest + 1;
}

/** Entries are append-only records with stable ids. */
type IdentifiedEntry = { id?: unknown };

const JOURNAL_ENTRY_CAP = 80;
const JOURNAL_TOMBSTONE_CAP = 200;

/**
 * Union journal entries across tabs, honouring deletions from either side.
 *
 * The journal was the only persisted store with neither a merge nor a cross-tab
 * listener, so it was whole-blob last-writer-wins: a report saved in one tab was
 * erased by an unrelated save in a stale one. A plain union fixes that and
 * introduces the mirror bug — a deleted entry coming back from the other tab's
 * older copy — so removals leave tombstones and both sides' tombstones apply.
 *
 * Exported for tests.
 */
export function mergeJournalEntriesById(
  incoming: unknown,
  existing: unknown,
  incomingRemoved: unknown,
  existingRemoved: unknown,
): { entries: unknown[]; removedIds: string[] } | null {
  if (!Array.isArray(incoming) || !Array.isArray(existing)) return null;

  // Existing first, incoming last: the cap below keeps the tail, and dropping
  // the file's fresh tombstones let a deletion undo itself on the next reload.
  const removed = new Set<string>();
  for (const list of [existingRemoved, incomingRemoved]) {
    if (!Array.isArray(list)) continue;
    for (const id of list) if (typeof id === "string") removed.add(id);
  }

  const byId = new Map<string, IdentifiedEntry>();
  const anonymous: unknown[] = [];
  // Incoming first so the writing tab's version of a shared id wins; entries are
  // immutable once written, so this only matters for a rewritten row.
  for (const entry of [...(incoming as IdentifiedEntry[]), ...(existing as IdentifiedEntry[])]) {
    if (!entry || typeof entry !== "object") continue;
    const id = (entry as { id?: unknown }).id;
    if (typeof id !== "string") {
      anonymous.push(entry);
      continue;
    }
    if (removed.has(id) || byId.has(id)) continue;
    byId.set(id, entry);
  }

  const merged = [...byId.values(), ...anonymous];
  // Newest first, matching how the store writes them.
  merged.sort((a, b) => Number((b as { at?: unknown }).at ?? 0) - Number((a as { at?: unknown }).at ?? 0));
  // A tombstone whose entry is still present on one side is the only thing
  // suppressing that entry, so it is evicted last.
  const contested = new Set<string>();
  for (const list of [incoming, existing]) {
    for (const entry of list as IdentifiedEntry[]) {
      const id = entry && typeof entry === "object" ? entry.id : undefined;
      if (typeof id === "string" && removed.has(id)) contested.add(id);
    }
  }
  const ordered = [...removed].filter((id) => !contested.has(id)).concat([...contested]);
  return {
    entries: merged.slice(0, JOURNAL_ENTRY_CAP),
    removedIds: ordered.slice(-JOURNAL_TOMBSTONE_CAP),
  };
}

/** Storage for the journal that unions entries on WRITE. */
/**
 * Write-merge for the consent-bearing settings flags, which move as one
 * stamped unit (consented, voice, listen, consentVersion, consentStamp).
 *
 * The settings blob was whole-blob last-writer-wins with only the storage
 * event rehydrate to repair it, so a stale tab's unrelated save — a name
 * keystroke — landing before its rehydrate resurrected consent withdrawn in
 * another tab, persistently and in both tabs. The same class negotiate and
 * journal already fixed. A newer stored consent decision survives a stale
 * write in either direction (a withdrawal cannot be resurrected, a genuine
 * re-consent cannot be un-done by an older withdrawal blob); everything else
 * in the blob stays last-write-wins.
 */
export function settingsConsentMergingStorage<State>(name: string): PersistStorage<State> {
  const base = safeJsonStorage<State>();
  return {
    ...base,
    setItem: (key, value) => {
      if (key !== name) return base.setItem(key, value);
      try {
        const raw = safeBrowserStorage().getItem(key);
        if (raw) {
          type ConsentSlice = {
            consented?: unknown;
            voice?: unknown;
            listen?: unknown;
            consentVersion?: unknown;
            consentStamp?: unknown;
          };
          const existing = (JSON.parse(raw) as { state?: ConsentSlice })?.state;
          const incoming = (value as { state?: ConsentSlice })?.state;
          if (
            incoming &&
            existing &&
            (Number(existing.consentStamp) || 0) > (Number(incoming.consentStamp) || 0)
          ) {
            incoming.consented = existing.consented;
            incoming.voice = existing.voice;
            incoming.listen = existing.listen;
            incoming.consentVersion = existing.consentVersion;
            incoming.consentStamp = existing.consentStamp;
          }
        }
      } catch {
        // A corrupt existing blob is simply replaced by the incoming one.
      }
      return base.setItem(key, value);
    },
  };
}

export function journalMergingStorage<State>(name: string): PersistStorage<State> {
  const base = safeJsonStorage<State>();
  return {
    ...base,
    setItem: (key, value) => {
      if (key !== name) return base.setItem(key, value);
      try {
        const raw = safeBrowserStorage().getItem(key);
        if (raw) {
          type Blob = { state?: { entries?: unknown; removedIds?: unknown } };
          const existing = JSON.parse(raw) as Blob;
          const incoming = value as Blob;
          const merged = mergeJournalEntriesById(
            incoming?.state?.entries,
            existing?.state?.entries,
            incoming?.state?.removedIds,
            existing?.state?.removedIds,
          );
          if (merged) {
            (value as { state: { entries: unknown; removedIds: unknown } }).state.entries =
              merged.entries;
            (value as { state: { entries: unknown; removedIds: unknown } }).state.removedIds =
              merged.removedIds;
          }
        }
      } catch {
        // A corrupt existing blob is simply replaced by the incoming one.
      }
      return base.setItem(key, value);
    },
  };
}

/**
 * Whether a `storage` event should trigger a rehydrate for the store at `name`.
 * A null key means the whole store was cleared (storage.clear()); a matching
 * key means another tab rewrote this store. Same-key writes from other tabs are
 * exactly the consent-revocation case that must propagate here.
 */
export function storageEventTargetsKey(eventKey: string | null, name: string): boolean {
  return eventKey === null || eventKey === name;
}

/**
 * Rehydrate a persisted store when another tab rewrites its key, so a consent
 * revocation in one tab cannot be silently overwritten by a stale tab's later
 * write. Rehydrate only reads storage into state (it never writes), so there is
 * no cross-tab feedback loop. No-op outside the browser.
 */
export function syncPersistedAcrossTabs(name: string, rehydrate: () => void): void {
  if (typeof window === "undefined" || typeof window.addEventListener !== "function") return;
  const reread = () => {
    try {
      rehydrate();
    } catch {
      // Best effort: a failed rehydrate leaves the current in-memory state.
    }
  };
  window.addEventListener("storage", (event) => {
    if (!storageEventTargetsKey(event.key, name)) return;
    reread();
  });
  // A backgrounded or frozen tab never receives the `storage` event, so coming
  // back to it would otherwise show a policy that was revoked while it slept.
  window.addEventListener("focus", reread);
  if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") reread();
    });
  }
}

/** Copy a legacy persisted blob to its current key without overwriting newer data. */
export function adoptPersistKey(next: string, previous: string) {
  const storage = safeBrowserStorage();
  if (!storage.getItem(next)) {
    const old = storage.getItem(previous);
    if (old) storage.setItem(next, old);
  }
}
