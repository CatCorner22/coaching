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
