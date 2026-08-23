import { createFileRoute, Link } from "@tanstack/react-router";
import { RopeFigure } from "@/components/rope-figure";
import { NERVES } from "@/lib/kb/nerves";
import { TIES } from "@/lib/kb/ties";

export const Route = createFileRoute("/nerves")({
  validateSearch: (search: Record<string, unknown>): { nerve?: string } => ({
    nerve:
      typeof search.nerve === "string" && NERVES.some((nerve) => nerve.slug === search.nerve)
        ? search.nerve
        : undefined,
  }),
  component: NervesPage,
});

function NervesPage() {
  const search = Route.useSearch();
  const slug = search.nerve ?? NERVES[0]!.slug;
  const n = NERVES.find((x) => x.slug === slug) ?? NERVES[0]!;
  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-5 py-10 lg:grid-cols-[240px_minmax(0,1fr)]">
      <div className="relative h-fit overflow-hidden rounded-lg border border-border bg-surface p-4">
        <div className="mx-auto h-[420px] w-[200px]">
          <RopeFigure activeNerve={slug} nerves={[slug]} className="text-muted" />
        </div>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-muted">Atlas</p>
        <h1 className="mt-2 font-display text-4xl">Nerves</h1>
        <p className="mt-3 text-sm text-muted">
          Orientation only—not diagnosis, placement instruction, or clearance. Symptoms can have many causes; stop and release for concern.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {NERVES.map((x) => (
            <Link
              key={x.slug}
              to="/nerves"
              search={{ nerve: x.slug }}
              aria-current={x.slug === slug ? "page" : undefined}
              className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wide hover:text-fg ${
                x.slug === slug ? "border-accent text-fg" : "border-border text-muted"
              }`}
            >
              {x.name}
            </Link>
          ))}
        </div>
        <h2 className="mt-8 font-display text-3xl">{n.name}</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-subtle">Zone</dt>
            <dd className="mt-1">{n.zone}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-subtle">Why changes matter</dt>
            <dd className="mt-1 text-danger-text">{n.risk}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-subtle">Check</dt>
            <dd className="mt-1">{n.check}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-subtle">Boundary</dt>
            <dd className="mt-1">{n.avoid}</dd>
          </div>
        </dl>
        <h3 className="mt-8 font-display text-2xl">Ties that watch this</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {TIES.filter((t) => t.nerves.includes(n.slug)).slice(0, 8).map((t) => (
            <Link
              key={t.slug}
              to="/tie/$slug"
              params={{ slug: t.slug }}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted hover:text-fg"
            >
              {t.name}
            </Link>
          ))}
        </div>
        <Link to="/article/$slug" params={{ slug: "nerve-atlas" }} className="mt-8 inline-block text-sm text-muted hover:text-fg">
          Full essay
        </Link>
      </div>
    </div>
  );
}
