import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getTie } from "@/lib/kb";
import { loadStill, useJournal } from "@/lib/stores/journal";

export const Route = createFileRoute("/journal")({
  ssr: false,
  component: JournalPage,
});

function JournalPage() {
  const entries = useJournal((s) => s.entries);
  const remove = useJournal((s) => s.remove);
  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Log</p>
      <h1 className="mt-2 font-display text-4xl">Journal</h1>
      <p className="mt-3 text-sm text-muted">
        Local to this device. Notes, not a cloud of nudes. Write what the hands felt like tomorrow.
      </p>
      {entries.length > 0 && (
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => {
            const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "knotty-journal.json";
            a.click();
            window.setTimeout(() => URL.revokeObjectURL(a.href), 1000);
          }}
        >
          Export notes
        </Button>
      )}
      {entries.length === 0 ? (
        <p className="mt-10 text-sm text-muted">No scenes yet. The studio can save a pass here.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {entries.map((e) => (
            <li key={e.id} className="rounded-lg border border-border bg-surface p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-2xl">{getTie(e.tieSlug ?? "")?.name ?? "Freeform"}</p>
                <button className="text-xs text-muted" onClick={() => remove(e.id)}>
                  Delete
                </button>
              </div>
              <p className="text-xs text-subtle">
                {new Date(e.at).toLocaleString()} · {e.minutes} min
              </p>
              <Still id={e.id} />
              <p className="mt-2 text-sm text-fg">{e.notes}</p>
              {e.flags.length > 0 && (
                <p className="mt-1 text-xs text-warn">{e.flags.join(" · ")}</p>
              )}
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

function Still({ id }: { id: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    void loadStill(id).then((u) => {
      if (live) setSrc(u);
    });
    return () => {
      live = false;
    };
  }, [id]);
  if (!src) return null;
  return <img src={src} alt="" className="mt-3 max-h-40 w-full rounded-md object-cover ring-1 ring-border" />;
}
