/** Copy a leftover Musubi persist blob onto the Knotty key once. */
export function adoptPersistKey(next: string, prev: string) {
  if (typeof localStorage === "undefined") return;
  try {
    if (!localStorage.getItem(next)) {
      const old = localStorage.getItem(prev);
      if (old) localStorage.setItem(next, old);
    }
  } catch {
    /* private mode / blocked storage */
  }
}
