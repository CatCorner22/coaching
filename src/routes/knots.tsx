import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { FOUNDATION_KNOT_SLUGS, KNOTS, matchesQuery } from "@/lib/kb";
import { useState } from "react";

export const Route = createFileRoute("/knots")({ component: KnotsPage });

function KnotsPage() {
  const [q, setQ] = useState("");
  const filtered = KNOTS.filter((k) => !q.trim() || matchesQuery([k.name, k.slug, k.summary, k.watch.join(" ")], q));
  const foundation = FOUNDATION_KNOT_SLUGS.map((slug) => filtered.find((k) => k.slug === slug)).filter(
    (k): k is (typeof KNOTS)[number] => Boolean(k),
  );
  const later = filtered.filter((k) => !FOUNDATION_KNOT_SLUGS.includes(k.slug as (typeof FOUNDATION_KNOT_SLUGS)[number]));
  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Knots</p>
      <h1 className="mt-2 font-display text-4xl">Knot school</h1>
      <p className="mt-3 text-sm text-muted">
        Practice on a chair leg until it is boring. A cinching cuff is not a personality.
      </p>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search knots" aria-label="Search knots" className="mt-6 h-11 w-full rounded-md border border-border bg-elevated px-3 text-sm" />
      <h2 className="mt-8 font-display text-2xl">Foundation six (in order)</h2>
      <ol className="mt-3 space-y-3">
        {foundation.map((k) => (
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
      </ol>
      <h2 className="mt-10 font-display text-2xl">Later</h2>
      <ul className="mt-3 space-y-3">
        {later.map((k) => (
          <li key={k.slug}><Link to="/knot/$slug" params={{ slug: k.slug }} className="block rounded-lg border border-border bg-surface p-4 hover:border-border-strong"><div className="flex flex-wrap items-center gap-2"><span className="font-display text-2xl">{k.name}</span>{k.cinches ? <Badge variant="warn">cinches</Badge> : <Badge variant="ok">non-cinch</Badge>}{k.loadBearing && <Badge>load</Badge>}</div><p className="mt-2 text-sm text-muted">{k.summary}</p></Link></li>
        ))}
      </ul>
    </div>
  );
}
