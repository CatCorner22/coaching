import { createFileRoute, Link } from "@tanstack/react-router";
import { ARTICLES } from "@/lib/kb";

export const Route = createFileRoute("/safety")({ component: SafetyPage });

function SafetyPage() {
  const picks = ARTICLES.filter((a) =>
    ["nerve-atlas", "circulation", "emergency-stop", "safewords", "hard-limits", "marks-vs-injury"].includes(
      a.slug,
    ),
  );
  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">安</p>
      <h1 className="mt-2 font-display text-4xl">Safety</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        Shears in reach. Traffic lights. Keep the neck empty. Release for symptoms, distress, or
        uncertainty. Fit rules, timers, direct checks, and camera output can reveal concern; none
        of them proves a restraint is safe.
      </p>
      <div className="mt-8 grid gap-3">
        <Callout title="Red" body="Everything stops. Rope comes off as fast as is safe. Aftercare starts." />
        <Callout title="Direct checks" body="Ask about comfort, sensation, motion, and change; compare sides and baseline. Check whenever anything changes and release for concern—never wait for a timer." />
        <Callout title="Radial" body="Outer upper arm, a few fingers below the deltoid. Wrist-drop is how TK becomes an injury." />
        <Callout title="Peroneal" body="Outer knee. Futomomo cinches do not live here. Foot-drop is a walking injury." />
      </div>
      <ul className="mt-10 space-y-2">
        {picks.map((a) => (
          <li key={a.slug}>
            <Link
              to="/article/$slug"
              params={{ slug: a.slug }}
              className="block rounded-lg border border-border bg-surface p-4 hover:border-border-strong"
            >
              <p className="font-display text-2xl">{a.title}</p>
              <p className="mt-1 text-sm text-muted">{a.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Callout({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-wide text-subtle">{title}</p>
      <p className="mt-1 text-sm text-fg">{body}</p>
    </div>
  );
}
