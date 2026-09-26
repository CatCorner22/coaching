import { createFileRoute, Link } from "@tanstack/react-router";
import { ARTICLES } from "@/lib/kb";
import { SAFETY_SOURCES, safetySourceAnchor } from "@/lib/kb/sources";

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
        <Callout title="Red" body="Stop the activity. Support the person's position and release without creating a fall; escalate urgent symptoms immediately." />
        <Callout title="Direct checks" body="Ask about comfort, sensation, motion, and change; compare sides and baseline. Check whenever anything changes and release for concern—never wait for a timer." />
        <Callout title="Neurologic change" body="New numbness, weakness, altered sensation, or loss of movement means release now. Seek prompt assessment if it persists or worsens; do not diagnose a nerve from an image or symptom pattern." />
        <Callout title="Emergency" body="Call local emergency services for abnormal breathing, unresponsiveness, seizure, chest pain, a serious fall, stroke-like signs, major weakness, or concerning symptoms after neck pressure." />
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link to="/emergency" className="rounded-md border border-danger/40 px-3 py-2 text-sm text-danger-text">Emergency card</Link>
        <Link to="/nerves" className="rounded-md border border-border px-3 py-2 text-sm">Nerves</Link>
        <Link to="/aftercare" className="rounded-md border border-border px-3 py-2 text-sm">Aftercare</Link>
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
      <section className="mt-12">
        <h2 className="font-display text-3xl">Evidence and limits</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          The Shibari-specific evidence base is small and selected. These sources support consent,
          symptom escalation, first-aid, and image-model limitations—not safe placement, safe
          duration, individual diagnosis, or camera clearance.
        </p>
        <ul className="mt-4 space-y-3">
          {SAFETY_SOURCES.map((source) => (
            <li
              key={source.id}
              id={safetySourceAnchor(source.id)}
              className="scroll-mt-24 rounded-lg border border-border bg-surface p-4"
            >
              <a href={source.href} target="_blank" rel="noreferrer" className="text-sm text-fg underline">
                {source.id} · {source.title}
              </a>
              <p className="mt-1 text-xs leading-relaxed text-muted">{source.note}</p>
            </li>
          ))}
        </ul>
      </section>
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
