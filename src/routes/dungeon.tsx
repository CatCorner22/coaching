import { createFileRoute, Link } from "@tanstack/react-router";
import { DUNGEON, DUNGEON_SCENES, getTie } from "@/lib/kb";

export const Route = createFileRoute("/dungeon")({ component: DungeonPage });

function DungeonPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Your room</p>
      <h1 className="mt-2 font-display text-4xl">Dungeon</h1>
      <p className="mt-3 text-sm text-muted">
        Bench, table, pole, cross, swing, floggers, Hismith, large toys. Rope dresses her. Furniture
        holds her. Nothing in this room is a hang point unless a rigger would stake their name on it.
      </p>
      <h2 className="mt-10 font-display text-2xl">Tonight on your kit</h2>
      <ul className="mt-3 space-y-2">
        {DUNGEON_SCENES.map((s) => (
          <li key={s.slug} className="rounded-lg border border-border bg-surface p-4">
            <p className="text-xs uppercase tracking-wide text-muted">{s.minutes} min</p>
            <p className="font-display text-2xl">{s.name}</p>
            <p className="mt-1 text-sm text-muted">{s.blurb}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {s.steps.map((slug) => (
                <Link
                  key={slug}
                  to="/tie/$slug"
                  params={{ slug }}
                  className="text-xs text-muted hover:text-fg"
                >
                  {getTie(slug)?.name ?? slug}
                </Link>
              ))}
              <Link
                to="/studio"
                search={{ tie: s.steps[0] }}
                className="text-xs text-accent"
              >
                Open studio
              </Link>
            </div>
          </li>
        ))}
      </ul>
      <h2 className="mt-12 font-display text-2xl">Inventory</h2>
      <ul className="mt-3 space-y-3">
        {DUNGEON.map((d) => (
          <li key={d.slug} className="rounded-lg border border-border bg-surface p-4">
            <p className="text-[11px] uppercase tracking-wide text-subtle">{d.kind}</p>
            <h3 className="font-display text-2xl">{d.name}</h3>
            <p className="mt-2 text-sm text-muted">{d.summary}</p>
            <p className="mt-3 text-xs uppercase tracking-wide text-subtle">With rope</p>
            <ul className="mt-1 list-disc pl-5 text-sm">
              {d.withRope.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs uppercase tracking-wide text-danger">Never</p>
            <ul className="mt-1 list-disc pl-5 text-sm text-danger">
              {d.never.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-subtle">Studio: {d.studio}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
