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
  const [addError, setAddError] = useState<string | null>(null);
  const nos = items.filter((i) => i.rank === "no");
  // The page's own copy says maybe is not permission, and Studio blocks on an
  // unresolved maybe, so the summary has to show them too.
  const maybes = items.filter((i) => i.rank === "maybe");
  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Before rope</p>
      <h1 className="mt-2 font-display text-4xl">Negotiate</h1>
      <p className="mt-3 text-sm text-muted">
        Everything starts at no. Discuss yes / maybe / no out loud before the activity. Maybe is
        not permission; no is a wall, not a dare.
      </p>
      <ul className="mt-8 space-y-2">
        {items.map((i) => (
          <li
            key={i.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 py-2"
          >
            <span className="text-sm" id={`neg-label-${i.id}`}>
              {i.label}
              {LOCKED_NO.has(i.id) && (
                <span className="mt-0.5 block text-[11px] leading-relaxed text-muted">
                  Locked to no in this app; it cannot be agreed here.
                </span>
              )}
            </span>
            <div role="group" aria-labelledby={`neg-label-${i.id}`} className="flex gap-1">
              {(["yes", "maybe", "no"] as Rank[]).map((r) => {
                const locked = LOCKED_NO.has(i.id) && r !== "no";
                return (
                  <button
                    key={r}
                    type="button"
                    disabled={locked}
                    aria-pressed={i.rank === r}
                    title={locked ? "Locked to no in this app" : undefined}
                    onClick={() => setRank(i.id, r)}
                    className={cn(
                      // 44px minimum target: these are the most consequential
                      // controls in the app and were ~24px tall and adjacent.
                      "min-h-11 min-w-14 cursor-pointer rounded-full px-3 text-[11px] uppercase tracking-wide",
                      i.rank === r
                        ? r === "no"
                          ? "bg-danger text-danger-fg"
                          : r === "yes"
                            ? "bg-ok/20 text-ok"
                            : "bg-warn/20 text-warn"
                        : "text-muted",
                      locked && "cursor-not-allowed opacity-40",
                    )}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex gap-2">
        <label htmlFor="negotiate-add" className="sr-only">
          Add a negotiated limit
        </label>
        <input
          id="negotiate-add"
          className="h-11 flex-1 rounded-md border border-border bg-elevated px-3 text-sm"
          placeholder="Add a line…"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <Button
          onClick={() => {
            const next = label.trim();
            setAddError(null);
            if (!next) return;
            const beforeItems = useNegotiate.getState().items;
            // A duplicate is rejected by the store too, so distinguish the two
            // causes: telling someone the list is full when the limit is
            // already recorded sends them to delete a negotiated line.
            const duplicate = beforeItems.some(
              (item) => item.label.toLowerCase() === next.toLowerCase(),
            );
            if (duplicate) {
              setAddError("That limit is already on the list.");
              return;
            }
            add(next);
            const after = useNegotiate.getState().items;
            if (after.length === beforeItems.length && !after.some((item) => item.label === next)) {
              setAddError(
                "This list is full, so that limit was not added. Remove or reword an existing line, and say it out loud regardless.",
              );
              return;
            }
            setLabel("");
          }}
        >
          Add
        </Button>
      </div>
      {addError && (
        <p className="mt-2 text-xs leading-relaxed text-danger-text" role="alert">
          {addError}
        </p>
      )}
      <label htmlFor="negotiate-notes" className="mt-4 block text-xs uppercase tracking-wide text-subtle">
        Notes
      </label>
      <textarea
        id="negotiate-notes"
        className="mt-1 h-28 w-full rounded-md border border-border bg-elevated p-3 text-sm"
        placeholder="Notes, aftercare asks, who holds the shears…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      {(nos.length > 0 || maybes.length > 0) && (
        <div className="mt-6 rounded-lg border border-danger/30 bg-danger/10 p-4">
          {nos.length > 0 && (
            <>
              <p className="text-xs uppercase tracking-wide text-danger-text">Hard no</p>
              <p className="mt-1 text-sm">{nos.map((n) => n.label).join(" · ")}</p>
            </>
          )}
          {maybes.length > 0 && (
            <>
              <p className={cn("text-xs uppercase tracking-wide text-warn", nos.length > 0 && "mt-3")}>
                Unresolved maybe — not permission
              </p>
              <p className="mt-1 text-sm">{maybes.map((m) => m.label).join(" · ")}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
