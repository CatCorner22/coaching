import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { MiniTie } from "@/components/rope-figure";
import { TIES, type Level } from "@/lib/kb";

export const Route = createFileRoute("/library")({ component: LibraryPage });

const LEVELS: Level[] = ["foundation", "building", "advanced"];

function LibraryPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">縄</p>
      <h1 className="mt-2 font-display text-4xl">Library</h1>
      <p className="mt-3 max-w-xl text-sm text-muted">
        Floor work first. A TK is not a first night. Suspension is a primer, not a hang.
      </p>
      {LEVELS.map((level) => (
        <section key={level} className="mt-10">
          <h2 className="font-display text-2xl capitalize">{level}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {TIES.filter((t) => t.level === level).map((t) => (
              <Link
                key={t.slug}
                to="/tie/$slug"
                params={{ slug: t.slug }}
                className="flex gap-4 rounded-lg border border-border bg-surface p-3 hover:border-border-strong"
              >
                <MiniTie wraps={t.steps.at(-1)?.wraps ?? []} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-2xl leading-none">{t.name}</span>
                    <Badge>{t.minutes[0]}–{t.minutes[1]}m</Badge>
                  </div>
                  <p className="mt-1 text-xs text-subtle">{t.jp}</p>
                  <p className="mt-2 line-clamp-3 text-sm text-muted">{t.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
