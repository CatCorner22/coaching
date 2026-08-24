import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Lightbulb, Users, Volume2 } from "lucide-react";
import { getArticle } from "@/lib/kb";

export const Route = createFileRoute("/learn-foundations")({
  component: LearnFoundationsPage,
});

function LearnFoundationsPage() {
  // Ordered as a reading path, not by topic: the two that explain why previous
  // attempts failed come before the ones that ask the reader to do anything.
  // `evidence-based-teaching` was written and then left off this list, so the
  // only entry that ranks the techniques was reachable through search alone.
  const pedagogyArticles = [
    "learning-pacing",
    "learning-modalities",
    "rope-basics",
    "evidence-based-teaching",
    "spaced-learning",
    "learning-disabilities-rope",
    "knot-foundations",
  ];

  const articles = pedagogyArticles
    .map((slug) => getArticle(slug))
    .filter((a) => a !== undefined);

  return (
    <div className="academy-hub easy-read mx-auto max-w-5xl px-5 py-10">
      <div className="flex items-start gap-4">
        <div className="hidden rounded-xl border border-accent/25 bg-accent/8 p-3 sm:block">
          <BookOpen className="size-8 text-accent" aria-hidden />
        </div>
        <div>
          <p className="text-sm uppercase tracking-wide text-muted">Learning Foundations</p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl">Why the videos didn&rsquo;t work</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
            There is a documented reason a fast, continuous tutorial teaches a complex manual skill badly, and it
            describes the format rather than the person watching it. These guides cover what the evidence actually
            supports, what it does not, and how to use that here. Start here if online rope tutorials have never
            worked for you.
          </p>
        </div>
      </div>

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        <InfoCard
          icon={<Lightbulb className="size-5 text-accent" />}
          title="You set the segments"
          text="Short pieces you start and stop yourself beat the same demonstration run straight through"
        />
        <InfoCard
          icon={<Volume2 className="size-5 text-accent" />}
          title="Words and pictures together"
          text="Both channels at once beats either alone — for everyone, not for a personality type"
        />
        <InfoCard
          icon={<Users className="size-5 text-accent" />}
          title="Graded, not asserted"
          text="Techniques are ranked by how strong the evidence is, including one popular idea that failed"
        />
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Start with these guides</h2>
        <p className="mt-2 text-base text-muted">
          Written to be read in this order. The first two explain why earlier attempts went wrong; the rest ask you to
          do something. Each takes about 5&ndash;11 minutes.
        </p>
        <div className="mt-4 space-y-3">
          {articles.map((article) => (
            <Link
              key={article.slug}
              to="/article/$slug"
              params={{ slug: article.slug }}
              className="block min-w-0 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-strong sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg">{article.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{article.summary}</p>
                  <p className="mt-2 text-xs text-subtle">{article.minutes} minute read</p>
                </div>
                <p className="shrink-0 text-sm font-medium text-accent">Read →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Then learn the knots</h2>
        <p className="mt-2 text-base text-muted">
          Once you understand how you learn best, head to the knot lessons. You will learn six foundation knots,
          one at a time, using the modalities and pace that work for you.
        </p>
        <div className="mt-4">
          <Link
            to="/learn"
            className="inline-flex items-center gap-2 rounded-lg border border-accent/50 bg-accent/10 px-4 py-3 font-medium text-accent transition-colors hover:border-accent"
          >
            Go to knot lessons
            <span>→</span>
          </Link>
        </div>
      </section>

      <section className="mt-12 rounded-lg border border-ok/25 bg-ok/5 p-5 sm:p-6">
        <h3 className="font-display text-xl">Your learning journey</h3>
        <ol className="mt-4 space-y-3">
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ok font-semibold text-ok-fg text-sm">
              1
            </span>
            <div>
              <p className="font-medium">Read the learning foundations</p>
              <p className="text-sm text-muted">Understand how your brain learns best and why knot tying is within reach</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ok font-semibold text-ok-fg text-sm">
              2
            </span>
            <div>
              <p className="font-medium">Start with one knot</p>
              <p className="text-sm text-muted">The Somerville Bowline is four steps. Take your time with it</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ok font-semibold text-ok-fg text-sm">
              3
            </span>
            <div>
              <p className="font-medium">Practice over days</p>
              <p className="text-sm text-muted">Come back tomorrow and tie it again. Your hands will surprise you</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ok font-semibold text-ok-fg text-sm">
              4
            </span>
            <div>
              <p className="font-medium">Add the next knot</p>
              <p className="text-sm text-muted">Once this one feels automatic, learn the second. Mastery beats speed</p>
            </div>
          </li>
        </ol>
      </section>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="text-muted">{icon}</div>
      <h3 className="mt-2 font-display text-lg">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
    </div>
  );
}
