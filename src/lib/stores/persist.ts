import { createJSONStorage, type PersistStorage } from "zustand/middleware";

type SyncStateStorage = {
  getItem: (name: string) => string | null;
  setItem: (name: string, value: string) => void;
  removeItem: (name: string) => void;
};

const UNAVAILABLE_STORAGE: SyncStateStorage = {
  getItem: () => null,
  setItem: () => undefined,
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
        } catch {
          // The live store still works with conservative in-memory state.
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
export function negotiationMergingStorage<State>(name: string): PersistStorage<State> {
  const base = safeJsonStorage<State>();
  return {
    ...base,
    setItem: (key, value) => {
      if (key !== name) return base.setItem(key, value);
      try {
        const raw = safeBrowserStorage().getItem(key);
        if (raw) {
          const existing = JSON.parse(raw) as { state?: { items?: unknown } };
          const merged = mergeNegotiationItemsByStamp(
            (value as { state?: { items?: unknown } })?.state?.items,
            existing?.state?.items,
          );
          if (merged) {
            (value as { state: { items: unknown } }).state.items = merged;
          }
        }
      } catch {
        // A corrupt existing blob is simply replaced by the incoming one.
      }
      return base.setItem(key, value);
    },
  };
}

type StampedItem = { id?: unknown; rank?: unknown; updatedAt?: unknown };

/** Per-id newest-stamp-wins. Exported for tests. */
export function mergeNegotiationItemsByStamp(
  incoming: unknown,
  existing: unknown,
): unknown[] | null {
  if (!Array.isArray(incoming) || !Array.isArray(existing)) return null;
  const stamp = (item: StampedItem) => {
    const value = Number(item?.updatedAt);
    return Number.isFinite(value) && value > 0 ? value : 0;
  };
  const existingById = new Map<string, StampedItem>();
  for (const item of existing as StampedItem[]) {
    if (item && typeof item.id === "string") existingById.set(item.id, item);
  }
  return (incoming as StampedItem[]).map((item) => {
    if (!item || typeof item.id !== "string") return item;
    const other = existingById.get(item.id);
    if (!other) return item;
    // Strictly newer wins; equal stamps keep the writing tab's own value.
    return stamp(other) > stamp(item) ? { ...item, rank: other.rank, updatedAt: other.updatedAt } : item;
  });
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
  window.addEventListener("storage", (event) => {
    if (!storageEventTargetsKey(event.key, name)) return;
    try {
      rehydrate();
    } catch {
      // Best effort: a failed rehydrate leaves the current in-memory state.
    }
  });
}

/** Copy a legacy persisted blob to its current key without overwriting newer data. */
export function adoptPersistKey(next: string, previous: string) {
  const storage = safeBrowserStorage();
  if (!storage.getItem(next)) {
    const old = storage.getItem(previous);
    if (old) storage.setItem(next, old);
  }
}
