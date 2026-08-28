import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HowToLearn, NyxModelPanel, NyxNudePanel } from "@/components/learn";
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
import { tieShape, tieShapeBlurb, tieShapeLabel } from "@/lib/kb/tie-factories";
import { NYX_SHIBARI, NYX_SHIBARI_POSES } from "@/lib/learn/nyx-model";
import { NYX_NUDE_POSES, nyxPhotoGalleryPoses } from "@/lib/learn/nyx-nudes";

export const Route = createFileRoute("/learn")({ component: LearnPage });

function LearnPage() {
  const knots = FOUNDATION_KNOT_SLUGS.map((slug) => getAcademyKnot(slug)).filter((knot) => knot !== undefined);
  const ties = FOUNDATION_TIE_SLUGS.map((slug) => getAcademyTie(slug)).filter((tie) => tie !== undefined);
  // Counted, not asserted. This card used to read "On an empty dress form" over
  // every tie lesson, which stopped being true the moment the catalog started
  // teaching some of them in full.
  const shapes = ties.map((tie) => tieShape(tie));
  const drills = shapes.filter((shape) => shape === "practice").length;
  const guided = shapes.filter((shape) => shape === "guided").length;
  const tieHint = `${drills} prop drill${drills === 1 ? "" : "s"} · ${guided} taught step by step`;

  return (
    <div className="academy-hub easy-read mx-auto max-w-5xl px-5 py-10">
      <div className="flex items-start gap-4">
        <div className="hidden rounded-xl border border-accent/25 bg-accent/8 p-3 sm:block">
          <GraduationCap className="size-8 text-accent" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm uppercase tracking-wide text-muted">Knotty Academy</p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl">Easy-read lessons</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
            Short steps. Plain words. Pictures on every step. {NYX_SHIBARI.name}, our demonstration
            model, appears on taught lessons alongside diagrams. Listen aloud or use the practice cam
            for hints. Every knot lesson here stays on a post or chair leg. The tie lessons differ from
            each other, so each one says on its own card what it is — a prop drill, a tie taught in
            full, or a route this app only names.
          </p>
        </div>
        <div className="hidden w-36 shrink-0 sm:block lg:w-44">
          <NyxModelPanel pose="portrait" compact />
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <HowToLearn />
        <section className="rounded-lg border border-accent/25 bg-accent/5 p-5 sm:p-6">
          <h2 className="font-display text-2xl">New to rope or struggle with fast videos?</h2>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted">
            Read our learning foundations first. They explain how your brain learns, why pacing matters, and how to make
            rope tying accessible for you — whether you have a learning disability or just learn differently than online
            tutorials assume.
          </p>
          <Link
            to="/learn-foundations"
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-accent/50 bg-accent/10 px-4 py-2 font-medium text-accent transition-colors hover:border-accent"
          >
            Read learning foundations
            <span>→</span>
          </Link>
        </section>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Knot lessons" value={knots.length} hint="On a post or chair leg" />
        <StatCard label="Tie lessons" value={ties.length} hint={tieHint} />
        <StatCard label={`${NYX_SHIBARI.name} stills`} value={NYX_SHIBARI_POSES.length} hint="Full frames + close crops" />
        <StatCard label="Nude studies" value={NYX_NUDE_POSES.length + nyxPhotoGalleryPoses().length} hint="28 illustrated + 40 photo slots" />
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Meet {NYX_SHIBARI.name}</h2>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted">
          {NYX_SHIBARI.fullName} is our fictional demonstration model — {NYX_SHIBARI.ageLabel},{" "}
          {NYX_SHIBARI.look.split(".")[0].toLowerCase()}. She appears on taught lessons with step-matched stills.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {NYX_SHIBARI_POSES.map((pose) => (
            <NyxModelPanel key={pose} pose={pose} compact />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">{NYX_SHIBARI.name} nude body studies</h2>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted">
          Forty photo slots plus twenty-eight illustrated fallbacks. Generate real photo nudes with{" "}
          <code className="text-xs">npm run generate:nyx-nudes</code> (see Settings for details) — they replace the
          drawings automatically. Eight appear on every taught lesson step.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {nyxPhotoGalleryPoses().map((pose) => (
            <NyxNudePanel key={pose} pose={pose} compact />
          ))}
        </div>
        <p className="mt-6 text-sm font-medium text-muted">Illustrated fallback set ({NYX_NUDE_POSES.length})</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {NYX_NUDE_POSES.map((pose) => (
            <NyxNudePanel key={pose} pose={pose} compact />
          ))}
        </div>
      </section>

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
                  <p className="mt-2 text-sm text-subtle">
                    {knot.steps.length} step{knot.steps.length === 1 ? "" : "s"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Tie lessons</h2>
        <p className="mt-2 text-base text-muted">
          Some of these are pattern drills for an empty prop. Some are taught in full and may go on a consenting adult
          once the limit is agreed. Some this app only names. Every card says which.
        </p>
        <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
          {FOUNDATION_TIE_SLUGS.map((slug) => {
            const tie = getTie(slug);
            const academy = getAcademyTie(slug);
            if (!tie || !academy) return null;
            // The hub asks the same question the tie page asks, of the same
            // source. It used to sniff `minutes[1] === 0`, which only told
            // instructor routes apart from everything else — so a guided tie
            // and a dress-form drill were presented identically.
            const shape = tieShape(tie);
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
                    <Badge
                      variant={shape === "guided" ? "accent" : shape === "instructor" ? "warn" : "default"}
                      className="text-[10px]"
                    >
                      {tieShapeLabel(shape)}
                    </Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{academy.goal}</p>
                  {/* What the reader may actually do with this entry, in the
                      same words the lesson itself uses. */}
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-subtle">{tieShapeBlurb(shape)}</p>
                  <p className="mt-2 text-sm text-subtle">
                    {academy.steps.length} section{academy.steps.length === 1 ? "" : "s"}
                  </p>
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
