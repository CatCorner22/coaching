import { createFileRoute } from "@tanstack/react-router";
import { GEAR } from "@/lib/kb";

export const Route = createFileRoute("/gear")({ component: GearPage });

function GearPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">道具</p>
      <h1 className="mt-2 font-display text-4xl">Gear</h1>
      <p className="mt-3 text-sm text-muted">
        Shears are not optional. Pretty rope that you cannot cut is a vanity object.
      </p>
      <ul className="mt-8 space-y-3">
        {GEAR.map((g) => (
          <li key={g.slug} className="rounded-lg border border-border bg-surface p-4">
            <p className="text-[11px] uppercase tracking-wide text-subtle">{g.kind}</p>
            <h2 className="font-display text-2xl">{g.name}</h2>
            <p className="mt-2 text-sm text-muted">{g.summary}</p>
            <ul className="mt-2 list-disc pl-5 text-sm text-fg">
              {g.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
