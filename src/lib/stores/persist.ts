/** Copy a legacy persisted blob to its current key without overwriting newer data. */
export function adoptPersistKey(next: string, previous: string) {
  if (typeof localStorage === "undefined") return;
  try {
    if (!localStorage.getItem(next)) {
      const old = localStorage.getItem(previous);
      if (old) localStorage.setItem(next, old);
    }
  } catch {
    /* Private mode or blocked storage: Zustand will fall back normally. */
  }
}
