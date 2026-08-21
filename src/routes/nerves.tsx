import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { RopeFigure } from "@/components/rope-figure";
import { NERVES } from "@/lib/kb";

export const Route = createFileRoute("/nerves")({ component: NervesPage });

function NervesPage() {
  const [slug, setSlug] = useState<string>(NERVES[0]!.slug);
  const n = NERVES.find((x) => x.slug === slug) ?? NERVES[0]!;
  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-5 py-10 lg:grid-cols-[240px_minmax(0,1fr)]">
      <div className="relative h-fit rounded-lg border border-border bg-surface p-4">
        <RopeFigure />
        {NERVES.map((x) => (
          <button
            key={x.slug}
            type="button"
            onClick={() => setSlug(x.slug)}
            className="absolute size-3 rounded-full bg-danger"
            style={{ left: `${x.x * 100}%`, top: `${x.y * 100}%` }}
            aria-label={x.name}
          />
        ))}
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-muted">Atlas</p>
        <h1 className="mt-2 font-display text-4xl">Nerves</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          {NERVES.map((x) => (
            <button
              key={x.slug}
              type="button"
              onClick={() => setSlug(x.slug)}
              className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-wide text-muted hover:text-fg"
            >
              {x.name}
            </button>
          ))}
        </div>
        <h2 className="mt-8 font-display text-3xl">{n.name}</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-subtle">Zone</dt>
            <dd className="mt-1">{n.zone}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-subtle">If you miss it</dt>
            <dd className="mt-1 text-danger">{n.risk}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-subtle">Check</dt>
            <dd className="mt-1">{n.check}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-subtle">Avoid</dt>
            <dd className="mt-1">{n.avoid}</dd>
          </div>
        </dl>
        <Link to="/article/$slug" params={{ slug: "nerve-atlas" }} className="mt-8 inline-block text-sm text-muted hover:text-fg">
          Full essay
        </Link>
      </div>
    </div>
  );
}
