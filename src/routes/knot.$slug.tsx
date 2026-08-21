import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { getKnot } from "@/lib/kb";
import { playCoachVoice } from "@/lib/voice/play";

export const Route = createFileRoute("/knot/$slug")({ component: KnotPage });

function KnotPage() {
  const { slug } = Route.useParams();
  const knot = getKnot(slug);
  if (!knot) {
    return (
      <div className="px-5 py-16 text-muted">
        Unknown knot. <Link to="/knots">Knots</Link>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">{knot.jp}</p>
      <h1 className="mt-2 font-display text-4xl">{knot.name}</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">{knot.summary}</p>
      <ol className="mt-8 space-y-5">
        {knot.steps.map((s, i) => (
          <li key={s.title} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-muted">Pass {i + 1}</p>
              <Button variant="ghost" size="sm" onClick={() => void playCoachVoice(s.speak)}>
                Speak
              </Button>
            </div>
            <h2 className="mt-1 font-display text-2xl">{s.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-fg">{s.body}</p>
          </li>
        ))}
      </ol>
      <h3 className="mt-10 font-display text-2xl">Watch</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
        {knot.watch.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
    </div>
  );
}
