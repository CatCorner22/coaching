import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { KNOTS } from "@/lib/kb";

export const Route = createFileRoute("/knots")({ component: KnotsPage });

function KnotsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Knots</p>
      <h1 className="mt-2 font-display text-4xl">Knot school</h1>
      <p className="mt-3 text-sm text-muted">
        Practice on a chair leg until it is boring. A cinching cuff is not a personality.
      </p>
      <ul className="mt-8 space-y-3">
        {KNOTS.map((k) => (
          <li key={k.slug}>
            <Link
              to="/knot/$slug"
              params={{ slug: k.slug }}
              className="block rounded-lg border border-border bg-surface p-4 hover:border-border-strong"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-2xl">{k.name}</span>
                {k.cinches ? <Badge variant="warn">cinches</Badge> : <Badge variant="ok">non-cinch</Badge>}
                {k.loadBearing && <Badge>load</Badge>}
              </div>
              <p className="mt-2 text-sm text-muted">{k.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
