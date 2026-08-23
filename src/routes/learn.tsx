import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HowToLearn } from "@/components/learn";
import { KnotFigure } from "@/components/knot-figure";
import { RopeFigure } from "@/components/rope-figure";
import {
  FOUNDATION_KNOT_SLUGS,
  FOUNDATION_TIE_SLUGS,
  getAcademyKnot,
  getAcademyTie,
  getKnot,
  getTie,
} from "@/lib/kb";

export const Route = createFileRoute("/learn")({ component: LearnPage });

function LearnPage() {
  const knots = FOUNDATION_KNOT_SLUGS.map((slug) => getAcademyKnot(slug)).filter(Boolean);
  const ties = FOUNDATION_TIE_SLUGS.map((slug) => getAcademyTie(slug)).filter(Boolean);

  return (
    <div className="academy-hub easy-read mx-auto max-w-5xl px-5 py-10">
      <div className="flex items-start gap-4">
        <div className="hidden rounded-xl border border-accent/25 bg-accent/8 p-3 sm:block">
          <GraduationCap className="size-8 text-accent" aria-hidden />
        </div>
        <div>
          <p className="text-sm uppercase tracking-wide text-muted">Knotty Academy</p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl">Easy-read lessons</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
            Short steps. Plain words. Pictures on every step. Listen aloud or use the practice cam for hints. Practice
            on a post or dress form only — never on a person from these lessons.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <HowToLearn />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Knot lessons" value={knots.length} hint="On a post or chair leg" />
        <StatCard label="Tie lessons" value={ties.length} hint="On an empty dress form" />
        <StatCard label="Every step has" value="3 parts" hint="Do · Check · Say" />
      </div>

      <section className="mt-12">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-accent" aria-hidden />
          <h2 className="font-display text-2xl">Start here</h2>
        </div>
        <p className="mt-2 text-base text-muted">If you are new, begin with this knot. Four short steps.</p>
        <Link
          to="/knot/$slug"
          params={{ slug: "somerville-bowline" }}
          className="academy-feature mt-4 flex min-w-0 flex-col overflow-hidden rounded-xl border border-accent/25 bg-surface transition-colors hover:border-accent/50 sm:flex-row"
        >
          <div className="min-w-0 flex-1 p-5 sm:p-6">
            <Badge className="border-accent/30 bg-accent/10 text-accent">Best first lesson</Badge>
            <h3 className="mt-3 font-display text-2xl">Somerville Bowline</h3>
            <p className="mt-2 text-base leading-relaxed text-muted">
              {getAcademyKnot("somerville-bowline")?.goal}
            </p>
            <p className="mt-4 text-sm font-medium text-accent">Open lesson →</p>
          </div>
          <div className="h-44 w-full shrink-0 border-t border-border bg-elevated p-3 sm:h-auto sm:w-56 sm:border-t-0 sm:border-l">
            <KnotFigure diagramId="somerville-bowline-0" className="h-full w-full" />
          </div>
        </Link>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Knot lessons</h2>
        <p className="mt-2 text-base text-muted">Use a chair leg, pipe, or post. Check each box before you go on.</p>
        <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
          {FOUNDATION_KNOT_SLUGS.map((slug) => {
            const knot = getKnot(slug);
            const academy = getAcademyKnot(slug);
            if (!knot || !academy) return null;
            return (
              <Link
                key={slug}
                to="/knot/$slug"
                params={{ slug }}
                className="academy-card flex min-w-0 gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border-strong sm:p-5"
              >
                <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-elevated">
                  <KnotFigure diagramId={`${slug}-0`} className="h-full w-full" animate={false} />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-display text-lg">{knot.name}</p>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{academy.goal}</p>
                  <p className="mt-2 text-sm text-subtle">{knot.steps.length} steps</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Tie lessons</h2>
        <p className="mt-2 text-base text-muted">Pattern practice on an empty dress form.</p>
        <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
          {FOUNDATION_TIE_SLUGS.map((slug) => {
            const tie = getTie(slug);
            const academy = getAcademyTie(slug);
            if (!tie || !academy) return null;
            const instructor = tie.minutes[1] === 0;
            return (
              <Link
                key={slug}
                to="/tie/$slug"
                params={{ slug }}
                className="academy-card flex min-w-0 gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border-strong sm:p-5"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-elevated">
                  <RopeFigure
                    pose={academy.steps.at(-1)?.expected.pose ?? "stand"}
                    view={academy.steps.at(-1)?.expected.view ?? "front"}
                    wraps={academy.steps.at(-1)?.wraps ?? []}
                    compact
                    className="h-full w-full text-rope"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-display text-lg">{tie.name}</p>
                    {instructor && (
                      <Badge variant="warn" className="text-[10px]">
                        Instructor
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{academy.goal}</p>
                  <p className="mt-2 text-sm text-subtle">{academy.steps.length} sections</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-subtle">{label}</p>
      <p className="mt-1 font-display text-2xl">{value}</p>
      <p className="mt-1 text-sm text-muted">{hint}</p>
    </div>
  );
}
