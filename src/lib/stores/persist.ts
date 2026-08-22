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

/** Copy a legacy persisted blob to its current key without overwriting newer data. */
export function adoptPersistKey(next: string, previous: string) {
  const storage = safeBrowserStorage();
  if (!storage.getItem(next)) {
    const old = storage.getItem(previous);
    if (old) storage.setItem(next, old);
  }
}
