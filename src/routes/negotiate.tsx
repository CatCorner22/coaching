import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNegotiate, LOCKED_NO, type Rank } from "@/lib/stores/negotiate";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/negotiate")({
  ssr: false,
  component: NegotiatePage,
});

function NegotiatePage() {
  const items = useNegotiate((s) => s.items);
  const setRank = useNegotiate((s) => s.setRank);
  const notes = useNegotiate((s) => s.notes);
  const setNotes = useNegotiate((s) => s.setNotes);
  const add = useNegotiate((s) => s.add);
  const [label, setLabel] = useState("");
  const nos = items.filter((i) => i.rank === "no");
  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Before rope</p>
      <h1 className="mt-2 font-display text-4xl">Negotiate</h1>
      <p className="mt-3 text-sm text-muted">
        Yes / maybe / no, out loud, while she can still use her hands. No is a wall, not a dare.
      </p>
      <ul className="mt-8 space-y-2">
        {items.map((i) => (
          <li
            key={i.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 py-2"
          >
            <span className="text-sm">{i.label}</span>
            <div className="flex gap-1">
              {(["yes", "maybe", "no"] as Rank[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  disabled={LOCKED_NO.has(i.id) && r !== "no"}
                  onClick={() => setRank(i.id, r)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] uppercase tracking-wide",
                    i.rank === r
                      ? r === "no"
                        ? "bg-danger text-danger-fg"
                        : r === "yes"
                          ? "bg-ok/20 text-ok"
                          : "bg-warn/20 text-warn"
                      : "text-muted",
                    LOCKED_NO.has(i.id) && r !== "no" && "cursor-not-allowed opacity-40",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex gap-2">
        <input
          className="h-11 flex-1 rounded-md border border-border bg-elevated px-3 text-sm"
          placeholder="Add a line…"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <Button
          onClick={() => {
            if (label.trim()) add(label.trim());
            setLabel("");
          }}
        >
          Add
        </Button>
      </div>
      <textarea
        className="mt-4 h-28 w-full rounded-md border border-border bg-elevated p-3 text-sm"
        placeholder="Notes, aftercare asks, who holds the shears…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      {nos.length > 0 && (
        <div className="mt-6 rounded-lg border border-danger/30 bg-danger/10 p-4">
          <p className="text-xs uppercase tracking-wide text-danger">Hard no</p>
          <p className="mt-1 text-sm">{nos.map((n) => n.label).join(" · ")}</p>
        </div>
      )}
    </div>
  );
}
