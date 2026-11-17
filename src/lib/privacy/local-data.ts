const LEGACY_EMERGENCY_NUMBER_KEY = "knotty-emergency-number";

export const LOCAL_DATA_KEYS = [
  "knotty-settings",
  "knotty-negotiate",
  "knotty-boundaries",
  "knotty-plan",
  "knotty-journal",
  // Lesson progress and the pre-scene checklist are personal data too: which
  // ties someone practised and what they prepared for crossed account
  // sessions on a shared device when these two were left off this list.
  "knotty-learn",
  "knotty-checklist",
  // The live session record: which tie, when it started, and any called stop.
  "knotty-session",
  "musubi-settings",
  "musubi-negotiate",
  "musubi-plan",
  "musubi-journal",
  "musubi-learn",
  "knotty-kit",
  "knotty-checkin",
  LEGACY_EMERGENCY_NUMBER_KEY,
] as const;

const ERASE_SIGNAL_KEY = "knotty-local-data-erase-signal";
const ERASE_CHANNEL = "knotty-local-data";
const LEGACY_PHOTO_DB = "musubi-photos";
const LEGACY_PURGE_ATTEMPTS = 2;
const LEGACY_PURGE_TIMEOUT_MS = 1_500;

/**
 * Deliberately NOT part of `LOCAL_DATA_KEYS`: it records which authenticated
 * subject the now-empty origin storage is bound to. Keeping it across an erase
 * lets the auth boundary detect an automatic hosting-gate account swap before
 * any app children can render data hydrated for the previous subject.
 */
export const ACCOUNT_MARKER_KEY = "knotty-account-marker-v1";

/** A collision-free, synchronous marker so render-time checks cannot flash. */
export function accountMarkerFor(userId: string | null): string {
  return JSON.stringify(userId === null ? [1, "signed-out"] : [1, "account", userId]);
}

/** Read the durable account binding. Storage failures intentionally throw. */
export function readAccountMarker(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCOUNT_MARKER_KEY);
}

/** Write and read back the binding so a silent/no-op storage shim fails closed. */
export function writeAccountMarker(marker: string): void {
  if (typeof window === "undefined") {
    throw new Error("Browser storage is unavailable.");
  }
  window.localStorage.setItem(ACCOUNT_MARKER_KEY, marker);
  if (window.localStorage.getItem(ACCOUNT_MARKER_KEY) !== marker) {
    throw new Error("The account data boundary could not be persisted.");
  }
}

export type LocalEraseResult = {
  browserStorageCleared: boolean;
  voiceCacheCleared: boolean;
  legacyStills: "deleted_or_absent" | "not_confirmed";
  warnings: string[];
};

/**
 * Reload this tab when another Knotty tab erases data. Reloading drops
 * in-memory Zustand state so it cannot later write the erased snapshot back.
 */
export function subscribeToLocalDataErase(onErase: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  let lastNonce = "";
  const receive = (nonce: unknown) => {
    if (typeof nonce !== "string" || !nonce || nonce === lastNonce) return;
    lastNonce = nonce;
    onErase();
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === ERASE_SIGNAL_KEY && event.newValue) receive(event.newValue);
  };
  window.addEventListener("storage", onStorage);

  let channel: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== "undefined") {
    try {
      channel = new BroadcastChannel(ERASE_CHANNEL);
      channel.addEventListener("message", (event) => receive(event.data));
    } catch {
      channel = null;
    }
  }
  return () => {
    window.removeEventListener("storage", onStorage);
    channel?.close();
  };
}

/**
 * Remove Knotty-owned browser data and notify other open Knotty tabs. This
 * cannot remove authentication cookies, downloaded exports, device backups,
 * browser/provider logs, or requests already transmitted to cloud services.
 */
export async function eraseAllLocalData(
  options: { broadcastToCurrentContext?: boolean } = {},
): Promise<LocalEraseResult> {
  if (typeof window === "undefined") {
    return {
      browserStorageCleared: false,
      voiceCacheCleared: false,
      legacyStills: "not_confirmed",
      warnings: ["Browser storage is unavailable."],
    };
  }

  const warnings: string[] = [];
  let browserStorageCleared = clearAndVerifyBrowserStorage();

  publishEraseSignal(options.broadcastToCurrentContext !== false);

  let voiceCacheCleared = false;
  try {
    const { clearCoachVoiceCache } = await import("@/lib/voice/play");
    clearCoachVoiceCache();
    voiceCacheCleared = true;
  } catch {
    warnings.push("The in-memory voice cache could not be confirmed cleared; reload this tab.");
  }

  const legacyStills = await purgeLegacyStillsWithRetry();
  if (legacyStills === "not_confirmed") {
    warnings.push("Legacy photo storage could not be confirmed deleted. Close other Knotty tabs and erase again.");
  }

  // IndexedDB retries and the dynamic cache import create await points. Make a
  // final removal/verification pass in case a store that was hydrated before
  // the auth gate wrote its stale snapshot back while those operations ran.
  browserStorageCleared = clearAndVerifyBrowserStorage() && browserStorageCleared;
  if (!browserStorageCleared) warnings.push("Some browser storage could not be removed.");

  return { browserStorageCleared, voiceCacheCleared, legacyStills, warnings };
}

function clearAndVerifyBrowserStorage(): boolean {
  let cleared = true;
  for (const key of LOCAL_DATA_KEYS) {
    try {
      window.localStorage.removeItem(key);
      if (window.localStorage.getItem(key) !== null) cleared = false;
    } catch {
      cleared = false;
    }
  }
  return cleared;
}

function publishEraseSignal(useBroadcastChannel: boolean) {
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  try {
    window.localStorage.setItem(ERASE_SIGNAL_KEY, nonce);
    window.localStorage.removeItem(ERASE_SIGNAL_KEY);
  } catch {
    /* BroadcastChannel remains as a fallback when storage is unavailable. */
  }
  if (useBroadcastChannel && typeof BroadcastChannel !== "undefined") {
    try {
      const channel = new BroadcastChannel(ERASE_CHANNEL);
      channel.postMessage(nonce);
      channel.close();
    } catch {
      /* The storage event remains as a fallback. */
    }
  }
}

async function purgeLegacyStillsWithRetry(): Promise<LocalEraseResult["legacyStills"]> {
  for (let attempt = 0; attempt < LEGACY_PURGE_ATTEMPTS; attempt += 1) {
    try {
      await within(deleteLegacyStillsAttempt(), LEGACY_PURGE_TIMEOUT_MS);
      return "deleted_or_absent";
    } catch {
      if (attempt + 1 < LEGACY_PURGE_ATTEMPTS) await delay(150);
    }
  }
  return "not_confirmed";
}

function deleteLegacyStillsAttempt(): Promise<void> {
  if (typeof indexedDB === "undefined") return Promise.resolve();
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(LEGACY_PHOTO_DB);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("Could not delete legacy stills."));
    // Keep the request pending when blocked: the cross-tab erase signal asks
    // other tabs to reload, which can release their open database connection.
    request.onblocked = () => undefined;
  });
}

function within<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("Timed out deleting legacy stills.")), timeoutMs);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
