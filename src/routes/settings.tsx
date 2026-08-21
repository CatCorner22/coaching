import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  eraseAllLocalData,
  readEmergencyNumber,
  saveEmergencyNumber,
} from "@/lib/privacy/local-data";
import { useSettings } from "@/lib/stores/settings";
import { clearCoachVoiceCache } from "@/lib/voice/play";

export const Route = createFileRoute("/settings")({
  ssr: false,
  component: SettingsPage,
});

function SettingsPage() {
  const s = useSettings();
  const [confirmErase, setConfirmErase] = useState(false);
  const [eraseStatus, setEraseStatus] = useState<string | null>(null);
  const [emergencyNumber, setEmergencyNumber] = useState("");
  const [emergencyStatus, setEmergencyStatus] = useState<string | null>(null);
  useEffect(() => setEmergencyNumber(readEmergencyNumber()), []);
  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Protocol</p>
      <h1 className="mt-2 font-display text-4xl">Settings</h1>
      <div className="mt-8 space-y-4">
        <Field label="Your name / title" value={s.riggerName} onChange={(v) => s.set({ riggerName: v })} />
        <Field label="Other participant's name / title" value={s.bottomName} onChange={(v) => s.set({ bottomName: v })} />
        <Field label="Optional agreed honorific" value={s.honorific} onChange={(v) => s.set({ honorific: v })} />
        <label className="block text-sm">
          <span className="text-xs uppercase tracking-wide text-subtle">Dynamic</span>
          <select
            className="mt-1 h-11 w-full rounded-md border border-border bg-elevated px-3"
            value={s.style}
            onChange={(e) => s.set({ style: e.target.value as "peer" | "ds" })}
          >
            <option value="ds">D/s — agreed protocol while preserving direct stop channels</option>
            <option value="peer">Peer — two adults, no protocol</option>
          </select>
        </label>
        <Field label="Red" value={s.safeword} onChange={(v) => s.set({ safeword: v })} />
        <Field label="Yellow" value={s.yellowWord} onChange={(v) => s.set({ yellowWord: v })} />
        <Field label="Green" value={s.greenWord} onChange={(v) => s.set({ greenWord: v })} />
        <label className="block text-sm">
          <span className="text-xs uppercase tracking-wide text-subtle">Direct-check reminder (minutes; not a safety interval)</span>
          <input
            type="number"
            min={2}
            max={8}
            className="mt-1 h-11 w-full rounded-md border border-border bg-elevated px-3"
            value={s.circulationMins}
            onChange={(e) => s.set({ circulationMins: Number(e.target.value) || 4 })}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={s.voice}
            onChange={(event) => {
              if (!event.target.checked) clearCoachVoiceCache();
              s.set({ voice: event.target.checked });
            }}
          />
          Enable cloud voice; send each spoken line to xAI TTS
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={s.listen} onChange={(e) => s.set({ listen: e.target.checked })} />
          Optional microphone word detection
        </label>
        <p className="text-xs leading-relaxed text-subtle">
          Browser speech recognition can fail silently or use a cloud speech service. It is never a
          safeword system or substitute for direct communication and agreed nonverbal signals.
          While armed, Knotty listens only for the configured red/yellow words and suppresses its
          own speech to reduce feedback.
        </p>
        <section className="rounded-lg border border-border bg-surface p-4">
          <h2 className="font-display text-2xl">Emergency calling</h2>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Knotty does not infer your location or guess an emergency number. Before a scene, verify
            the emergency-services number for the place where this device will be used. If saved,
            it appears as the call link on the emergency page. The number is stored unencrypted in
            this browser profile; leaving it blank keeps generic call instructions.
          </p>
          <label className="mt-3 block text-sm">
            <span className="text-xs uppercase tracking-wide text-subtle">Verified local emergency number</span>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="off"
              placeholder="Enter the number for your location"
              className="mt-1 h-11 w-full rounded-md border border-border bg-elevated px-3"
              value={emergencyNumber}
              onChange={(event) => {
                setEmergencyNumber(event.target.value.slice(0, 32));
                setEmergencyStatus(null);
              }}
            />
          </label>
          <Button
            className="mt-3"
            variant="outline"
            onClick={() => {
              try {
                const saved = saveEmergencyNumber(emergencyNumber);
                setEmergencyNumber(saved);
                setEmergencyStatus(saved ? "Verified number saved in this browser." : "Saved number removed.");
              } catch (error) {
                setEmergencyStatus(error instanceof Error ? error.message : "Could not save this number.");
              }
            }}
          >
            Save emergency number
          </Button>
          {emergencyStatus && <p className="mt-2 text-xs text-muted" role="status">{emergencyStatus}</p>}
        </section>
        <Button variant="outline" onClick={() => s.set({ consented: false })}>
          Reset consent gate
        </Button>
        <section className="rounded-lg border border-border bg-surface p-4">
          <h2 className="font-display text-2xl">Local data</h2>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Names and titles, safewords, negotiation choices and notes, plans, kit state, and journal
            summaries are stored unencrypted in this browser profile until erased. The app holds
            current captures in page memory; pressing Analyze sends selected compressed stills and
            generic labels through the app server to xAI. Cloud voice sends each spoken line to xAI
            TTS, and browser speech recognition may use a browser-vendor service. Providers may log
            or retain transmitted data according to their service and workspace settings. This is
            unsuitable for a shared or monitored device.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Erase attempts to remove Knotty's named site-storage records, clear this tab's voice
            cache, signal other open Knotty tabs to reload, and delete legacy still storage. It does
            not sign you out or remove authentication cookies, downloaded exports, device backups,
            browser or server logs, provider-side copies, or requests already transmitted.
          </p>
          {!confirmErase ? (
            <Button className="mt-3" variant="outline" onClick={() => setConfirmErase(true)}>
              Erase all Knotty local data…
            </Button>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="danger"
                onClick={() => {
                  setEraseStatus("Erasing local data…");
                  void eraseAllLocalData().then(
                    (result) => {
                      const status = result.browserStorageCleared
                        ? "Knotty browser records removed."
                        : "Some Knotty browser records could not be removed.";
                      const legacy = result.legacyStills === "deleted_or_absent"
                        ? " Legacy still storage deleted or absent."
                        : " Legacy still deletion was not confirmed; close other Knotty tabs and try again.";
                      setEraseStatus(`${status}${legacy} Reloading to clear in-memory state…`);
                      window.setTimeout(() => window.location.reload(), 600);
                    },
                    (error) => setEraseStatus(error instanceof Error ? error.message : "Could not erase local data."),
                  );
                }}
              >
                Confirm erase all
              </Button>
              <Button variant="ghost" onClick={() => setConfirmErase(false)}>Cancel</Button>
            </div>
          )}
          {eraseStatus && <p className="mt-2 text-xs text-muted" role="status">{eraseStatus}</p>}
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="text-xs uppercase tracking-wide text-subtle">{label}</span>
      <input
        className="mt-1 h-11 w-full rounded-md border border-border bg-elevated px-3"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
