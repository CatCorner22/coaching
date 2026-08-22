import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { eraseAllLocalData } from "@/lib/privacy/local-data";
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
  const [erasing, setErasing] = useState(false);
  const [eraseFailed, setEraseFailed] = useState(false);
  if (erasing) {
    return (
      <div className="mx-auto max-w-xl px-5 py-10">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">Protocol</p>
        <h1 className="mt-2 font-display text-4xl">Local data erase</h1>
        <p
          className="mt-6 text-sm leading-relaxed text-muted"
          role={eraseFailed ? "alert" : "status"}
        >
          {eraseStatus ?? "Erasing local data…"}
        </p>
        {eraseFailed && (
          <Button className="mt-4" variant="outline" onClick={() => window.location.reload()}>
            Reload before retrying
          </Button>
        )}
      </div>
    );
  }
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
        <Field
          label="Red"
          value={s.safeword}
          onChange={(v) => s.set({ safeword: v })}
          hint="At least two characters. Command words (next, analyze, hands, stop, pause, release) are rejected and the previous word is kept."
        />
        <Field label="Yellow" value={s.yellowWord} onChange={(v) => s.set({ yellowWord: v })} />
        <Field label="Green" value={s.greenWord} onChange={(v) => s.set({ greenWord: v })} />
        <label className="block text-sm">
          <span className="text-xs uppercase tracking-wide text-subtle">Direct-check reminder (minutes; not a safety interval)</span>
          <NumberField
            min={2}
            max={12}
            value={s.circulationMins}
            onCommit={(n) => s.set({ circulationMins: n })}
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
          Enable cloud voice; send each reviewed spoken line to xAI TTS after a privacy preflight
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
        <Button variant="outline" onClick={() => s.resetConsent()}>
          Reset consent gate
        </Button>
        <section className="rounded-lg border border-border bg-surface p-4">
          <h2 className="font-display text-2xl">Local data</h2>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Names and titles, safewords, negotiation choices and notes, plans, kit state, and journal
            summaries are stored unencrypted in this browser profile until erased. The app holds
            current captures in page memory; pressing Analyze sends selected compressed stills and
            generic labels through the app server to xAI. Each selected-media analysis and reviewed
            cloud-voice line is sent only after a non-sensitive request confirms the deployment's
            zero-data-retention setting; every media or audio response must confirm it again before
            the app reads the body. A missing confirmation is discarded, but a request already
            initiated cannot be recalled. Browser speech recognition may use a browser-vendor
            service. This remains unsuitable for a shared or monitored device.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Erase attempts to remove Knotty's named site-storage records, clear this tab's voice
            cache, signal other open Knotty tabs to reload, and delete legacy still storage. It does
            not sign you out or remove authentication cookies, downloaded exports, device backups,
            browser or server logs, provider-side copies, or requests already transmitted.
            Knotty deliberately retains one minimal account-ID marker so it can block one signed-in
            account from inheriting another account's local content; the marker contains no notes,
            captures, plans, or journal text.
          </p>
          {!confirmErase ? (
            <Button className="mt-3" variant="outline" onClick={() => setConfirmErase(true)}>
              Erase Knotty local content and caches…
            </Button>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="danger"
                onClick={() => {
                  setErasing(true);
                  setEraseFailed(false);
                  setEraseStatus("Erasing local data…");
                  // AppShell subscribes to the cross-tab BroadcastChannel. Do
                  // not notify this document before async IndexedDB deletion
                  // and final verification finish; this handler owns its reload.
                  void eraseAllLocalData({ broadcastToCurrentContext: false }).then(
                    (result) => {
                      if (
                        result.browserStorageCleared &&
                        result.voiceCacheCleared &&
                        result.legacyStills === "deleted_or_absent"
                      ) {
                        // Reload immediately; do not leave hydrated persisted
                        // controls mounted after their storage was cleared.
                        window.location.reload();
                        return;
                      }
                      setEraseFailed(true);
                      setEraseStatus(
                        "Local content erasure could not be fully confirmed. Close other Knotty tabs, reload this page, and retry before sharing this browser.",
                      );
                    },
                    (error) => {
                      setEraseFailed(true);
                      setEraseStatus(
                        error instanceof Error ? error.message : "Could not erase local data.",
                      );
                    },
                  );
                }}
              >
                Confirm erase local content
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

/**
 * Same commit-on-blur reason as Field: the store clamps to 2..12, so typing the
 * first digit of "10" was clamped to 2 and the rest of the entry was lost. The
 * declared min/max now match the store's own bounds.
 */
function NumberField({
  value,
  min,
  max,
  onCommit,
}: {
  value: number;
  min: number;
  max: number;
  onCommit: (n: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  const [editing, setEditing] = useState(false);
  return (
    <input
      type="number"
      min={min}
      max={max}
      className="mt-1 h-11 w-full rounded-md border border-border bg-elevated px-3"
      value={editing ? draft : String(value)}
      onFocus={() => {
        setDraft(String(value));
        setEditing(true);
      }}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        setEditing(false);
        const parsed = Number(draft);
        onCommit(Number.isFinite(parsed) && draft.trim() !== "" ? parsed : value);
      }}
    />
  );
}

/**
 * Commit on blur rather than per keystroke. The settings store clamps words to
 * at least two characters and rejects command words, so writing every keystroke
 * straight through made a field impossible to retype: the first character of a
 * replacement was rejected and the old value snapped back mid-edit.
 */
function Field({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState(false);
  return (
    <label className="block text-sm">
      <span className="text-xs uppercase tracking-wide text-subtle">{label}</span>
      <input
        className="mt-1 h-11 w-full rounded-md border border-border bg-elevated px-3"
        value={editing ? draft : value}
        onFocus={() => {
          setDraft(value);
          setEditing(true);
        }}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setEditing(false);
          onChange(draft);
        }}
      />
      {hint && <span className="mt-1 block text-[11px] leading-relaxed text-muted">{hint}</span>}
    </label>
  );
}
