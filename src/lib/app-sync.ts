import { useNegotiate } from "@/lib/stores/negotiate";
import { useChecklist } from "@/lib/stores/checklist";
import { useSettings } from "@/lib/stores/settings";

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
  useSettings.getState().set(bundle.settings);
  useNegotiate.setState({ items: bundle.negotiate });
  useChecklist.setState({ done: bundle.checklist });
}

export function appSyncFilename(exportedAt: number): string {
  const stamp = new Date(exportedAt).toISOString().slice(0, 10);
  return `knotty-sync-${stamp}.json`;
}
