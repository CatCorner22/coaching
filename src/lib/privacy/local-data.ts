export const EMERGENCY_NUMBER_KEY = "knotty-emergency-number";

export const LOCAL_DATA_KEYS = [
  "knotty-settings",
  "knotty-negotiate",
  "knotty-plan",
  "knotty-journal",
  "musubi-settings",
  "musubi-negotiate",
  "musubi-plan",
  "musubi-journal",
  "knotty-kit",
  "knotty-checkin",
  EMERGENCY_NUMBER_KEY,
] as const;

const ERASE_SIGNAL_KEY = "knotty-local-data-erase-signal";
const ERASE_CHANNEL = "knotty-local-data";
const LEGACY_PHOTO_DB = "musubi-photos";
const LEGACY_PURGE_ATTEMPTS = 2;
const LEGACY_PURGE_TIMEOUT_MS = 1_500;

export type LocalEraseResult = {
  browserStorageCleared: boolean;
  memoryCacheCleared: boolean;
  legacyStills: "deleted_or_absent" | "not_confirmed";
  warnings: string[];
};

/**
 * Normalize a user-supplied emergency-services number without guessing it from
 * browser locale. Spaces and common visual separators are removed; arbitrary
 * dial strings and extensions are rejected.
 */
export function normalizeEmergencyNumber(value: string): string | null {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return null;
  const compact = trimmed.replace(/[\s().-]/g, "");
  return /^\+?[0-9]{2,15}$/.test(compact) ? compact : null;
}

export function readEmergencyNumber(): string {
  if (typeof window === "undefined") return "";
  try {
    return normalizeEmergencyNumber(window.localStorage.getItem(EMERGENCY_NUMBER_KEY) ?? "") ?? "";
  } catch {
    return "";
  }
}

/** Save a verified number in this browser profile. An empty value removes it. */
export function saveEmergencyNumber(value: string): string {
  if (typeof window === "undefined") throw new Error("Browser storage is unavailable.");
  const trimmed = value.trim();
  if (!trimmed) {
    window.localStorage.removeItem(EMERGENCY_NUMBER_KEY);
    return "";
  }
  const normalized = normalizeEmergencyNumber(trimmed);
  if (!normalized) {
    throw new Error("Enter 2–15 digits, optionally starting with +. Verify the number locally.");
  }
  window.localStorage.setItem(EMERGENCY_NUMBER_KEY, normalized);
  return normalized;
}

export function emergencyNumberHref(value: string): string | null {
  const normalized = normalizeEmergencyNumber(value);
  return normalized ? `tel:${normalized}` : null;
}

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
export async function eraseAllLocalData(): Promise<LocalEraseResult> {
  if (typeof window === "undefined") {
    return {
      browserStorageCleared: false,
      memoryCacheCleared: false,
      legacyStills: "not_confirmed",
      warnings: ["Browser storage is unavailable."],
    };
  }

  const warnings: string[] = [];
  let browserStorageCleared = true;
  for (const key of LOCAL_DATA_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      browserStorageCleared = false;
    }
  }
  if (!browserStorageCleared) warnings.push("Some browser storage could not be removed.");

  publishEraseSignal();

  let memoryCacheCleared = false;
  try {
    const { clearCoachVoiceCache } = await import("@/lib/voice/play");
    clearCoachVoiceCache();
    memoryCacheCleared = true;
  } catch {
    warnings.push("The in-memory voice cache could not be confirmed cleared; reload this tab.");
  }

  const legacyStills = await purgeLegacyStillsWithRetry();
  if (legacyStills === "not_confirmed") {
    warnings.push("Legacy photo storage could not be confirmed deleted. Close other Knotty tabs and erase again.");
  }

  return { browserStorageCleared, memoryCacheCleared, legacyStills, warnings };
}

function publishEraseSignal() {
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  try {
    window.localStorage.setItem(ERASE_SIGNAL_KEY, nonce);
    window.localStorage.removeItem(ERASE_SIGNAL_KEY);
  } catch {
    /* BroadcastChannel remains as a fallback when storage is unavailable. */
  }
  if (typeof BroadcastChannel !== "undefined") {
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
