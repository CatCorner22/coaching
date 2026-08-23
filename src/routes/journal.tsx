import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/confirm-button";
import { JournalBackupPanel } from "@/components/journal-backup";
import { SourceEvidence } from "@/components/source-evidence";
import { getTie } from "@/lib/kb";
import { purgeLegacyStills, useJournal } from "@/lib/stores/journal";

export const Route = createFileRoute("/journal")({
  ssr: false,
  component: JournalPage,
});

function JournalPage() {
  const entries = useJournal((s) => s.entries);
  const remove = useJournal((s) => s.remove);
  const [purgeStatus, setPurgeStatus] = useState<string | null>(null);
  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Log</p>
      <h1 className="mt-2 font-display text-4xl">Journal</h1>
      <p className="mt-3 text-sm text-muted">
        Text summaries are stored unencrypted in this browser's site storage. Captures are never
        stored by current versions. Anyone with this browser profile may be able to read the notes;
        export only with the adults' agreed output scope.
      </p>
      <Button
        variant="outline"
        className="mt-4"
        onClick={() => {
          setPurgeStatus("Deleting legacy stills…");
          void purgeLegacyStills().then(
            () => setPurgeStatus("Legacy still storage deleted."),
            (error) => setPurgeStatus(error instanceof Error ? error.message : "Could not delete legacy stills."),
          );
        }}
      >
        Delete legacy stored stills
      </Button>
      {purgeStatus && <p className="mt-2 text-xs text-muted" role="status">{purgeStatus}</p>}
      <JournalBackupPanel />
      {entries.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 px-0"
          onClick={() => {
            const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "knotty-journal.json";
            a.click();
            window.setTimeout(() => URL.revokeObjectURL(a.href), 1000);
          }}
        >
          Export unencrypted notes instead
        </Button>
      )}
      {entries.length === 0 ? (
        <p className="mt-10 text-sm text-muted">No text summaries saved on this device.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {entries.map((e) => (
            <li key={e.id} className="rounded-lg border border-border bg-surface p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-2xl">{getTie(e.tieSlug ?? "")?.name ?? "Freeform"}</p>
                <DeleteButton
                  label={`Delete journal entry from ${new Date(e.at).toLocaleString()}`}
                  onConfirm={() => remove(e.id)}
                />
              </div>
              <p className="text-xs text-subtle">
                {new Date(e.at).toLocaleString()} · {e.minutes} min
              </p>
              <p className="mt-2 text-sm text-fg">{e.notes}</p>
              <p className="mt-1 text-xs text-muted">
                Disposition: {String(e.disposition ?? "legacy_entry_no_disposition").replaceAll("_", " ")}
              </p>
              {e.flags.length > 0 && (
                <p className="mt-1 text-xs text-warn">{e.flags.join(" · ")}</p>
              )}
              {Array.isArray(e.limitations) && e.limitations.length > 0 && (
                <p className="mt-1 text-xs text-subtle">{e.limitations[0]}</p>
              )}
              <div className="mt-2">
                <SourceEvidence sourceIds={e.sourceIds} />
              </div>
              {e.tieSlug && (
                <Button asChild variant="ghost" size="sm" className="mt-2 px-0">
                  <Link to="/tie/$slug" params={{ slug: e.tieSlug }}>
                    Open tie
                  </Link>
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
