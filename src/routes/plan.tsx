import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SEQUENCES, TIES, getTie } from "@/lib/kb";
import { usePlanner } from "@/lib/stores/planner";

export const Route = createFileRoute("/plan")({
  validateSearch: (s: Record<string, unknown>): { seq?: string } => ({
    seq: typeof s.seq === "string" && s.seq.length > 0 ? s.seq : undefined,
  }),
  component: PlanPage,
});

function PlanPage() {
  const search = Route.useSearch();
  const slugs = usePlanner((s) => s.slugs);
  const add = usePlanner((s) => s.add);
  const remove = usePlanner((s) => s.remove);
  const loadSequence = usePlanner((s) => s.loadSequence);
  const firstTie = slugs[0] ? getTie(slugs[0]) : undefined;
  useEffect(() => {
    if (search.seq) loadSequence(search.seq);
  }, [search.seq, loadSequence]);
  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Education</p>
      <h1 className="mt-2 font-display text-4xl">Learning planner</h1>
      <p className="mt-3 text-sm text-muted">
        Build a short reading or unoccupied-practice plan. Instructor-route entries are for risk
        recognition and questions, not remote construction or a live-scene sequence.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {SEQUENCES.map((s) => (
          <Button key={s.slug} variant="outline" size="sm" onClick={() => loadSequence(s.slug)}>
            {s.name}
          </Button>
        ))}
      </div>
      <ol className="mt-8 space-y-2">
        {slugs.map((slug, i) => {
          const t = getTie(slug);
          return (
            <li
              key={slug + i}
              className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2"
            >
              <Link to="/tie/$slug" params={{ slug }} className="font-display text-xl">
                {t?.name ?? slug}
              </Link>
              <button className="text-xs text-muted" onClick={() => remove(i)}>
                Remove
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-xs text-subtle">
        Library times are reading and planning estimates, never safe-duration limits. Check directly and release for any concern.
      </p>
      <select
        className="mt-6 h-11 w-full rounded-md border border-border bg-elevated px-3 text-sm"
        defaultValue=""
        onChange={(e) => {
          if (e.target.value) add(e.target.value);
          e.target.value = "";
        }}
      >
        <option value="">Add a library entry</option>
        {TIES.map((t) => (
          <option key={t.slug} value={t.slug}>
            {t.name}
          </option>
        ))}
      </select>
      {firstTie && firstTie.minutes[1] > 0 ? (
        <Button asChild className="mt-6">
          <Link to="/studio" search={{ tie: firstTie.slug }}>
            Open limited observation—not coaching
          </Link>
        </Button>
      ) : firstTie ? (
        <Button className="mt-6" disabled>
          Instructor route · Studio unavailable
        </Button>
      ) : null}
    </div>
  );
}
