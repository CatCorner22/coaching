import { normalizeNegotiationItems, useNegotiate } from "@/lib/stores/negotiate";
import { useChecklist } from "@/lib/stores/checklist";
import { useSettings, type Settings } from "@/lib/stores/settings";

export type AppSyncBundle = {
  version: 1;
  exportedAt: number;
  settings: {
    riggerName: string;
    bottomName: string;
    honorific: string;
    style: "peer" | "ds";
    safeword: string;
    yellowWord: string;
    greenWord: string;
    circulationMins: number;
  };
  negotiate: ReturnType<typeof useNegotiate.getState>["items"];
  checklist: Record<string, boolean>;
};

export function buildAppSyncBundle(): AppSyncBundle {
  const settings = useSettings.getState();
  const negotiate = useNegotiate.getState();
  const checklist = useChecklist.getState();
  return {
    version: 1,
    exportedAt: Date.now(),
    settings: {
      riggerName: settings.riggerName,
      bottomName: settings.bottomName,
      honorific: settings.honorific,
      style: settings.style,
      safeword: settings.safeword,
      yellowWord: settings.yellowWord,
      greenWord: settings.greenWord,
      circulationMins: settings.circulationMins,
    },
    negotiate: negotiate.items,
    checklist: checklist.done,
  };
}

export function parseAppSyncBundle(text: string): AppSyncBundle | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return null;
  const bundle = parsed as Partial<AppSyncBundle>;
  if (bundle.version !== 1 || typeof bundle.exportedAt !== "number") return null;
  if (bundle.settings === null || typeof bundle.settings !== "object") return null;
  if (!Array.isArray(bundle.negotiate)) return null;
  if (bundle.checklist === null || typeof bundle.checklist !== "object") return null;
  return bundle as AppSyncBundle;
}

export function applyAppSyncBundle(bundle: AppSyncBundle): void {
  // Only the fields the export writes, each type-checked — never the object
  // as parsed. `settings.set` merges every key it is handed, so an edited
  // file could otherwise set the consent-bearing flags (consented, adults,
  // voice, listen, consentVersion) without the gate ever being shown. Sync
  // moves preferences between devices; consent is asked for on each device.
  const raw = bundle.settings as Partial<Record<keyof AppSyncBundle["settings"], unknown>>;
  const picked: Partial<Settings> = {};
  for (const key of [
    "riggerName",
    "bottomName",
    "honorific",
    "safeword",
    "yellowWord",
    "greenWord",
  ] as const) {
    if (typeof raw[key] === "string") picked[key] = raw[key];
  }
  if (raw.style === "peer" || raw.style === "ds") picked.style = raw.style;
  if (typeof raw.circulationMins === "number") picked.circulationMins = raw.circulationMins;
  useSettings.getState().set(picked);

  // Normalized, not raw: the same pass the store applies on rehydration, so a
  // file cannot show a locked-no row as yes even transiently, and malformed
  // rows never reach the UI.
  useNegotiate.setState({ items: normalizeNegotiationItems(bundle.negotiate) });

  const done: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(bundle.checklist)) {
    if (typeof value === "boolean") done[key] = value;
  }
  useChecklist.setState({ done });
}

export function appSyncFilename(exportedAt: number): string {
  const stamp = new Date(exportedAt).toISOString().slice(0, 10);
  return `knotty-sync-${stamp}.json`;
}
