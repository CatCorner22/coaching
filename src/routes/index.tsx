import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Camera, Shield, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MiniTie } from "@/components/rope-figure";
import { SEQUENCES, TIES, kbStats } from "@/lib/kb";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const stats = kbStats();
  const featured = TIES.filter((t) =>
    ["single-column", "futomomo", "karada", "takate-kote"].includes(t.slug),
  );
  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <img
          src="/hero.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/30" />
        <div className="relative mx-auto max-w-3xl px-5 pb-16 pt-14 md:pt-24">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">Private atelier</p>
          <h1 className="mt-4 font-display text-5xl leading-[0.95] text-fg md:text-6xl">
            Tie her.
            <br />
            Read the rope.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted">
            Photograph or record your wife in Shibari. On-device vision counts wraps and watches
            her hands. Grok coaches the next pass. Voice speaks it so you can keep your eyes on her.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/studio">
                <Camera />
                Open studio
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/library">Tie library</Link>
            </Button>
          </div>
          <dl className="mt-10 grid grid-cols-3 gap-4 text-sm">
            <Stat n={stats.ties} l="ties" />
            <Stat n={stats.knots} l="knots" />
            <Stat n={stats.articles} l="essays" />
          </dl>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-3 px-5 py-10 md:grid-cols-3">
        <Card
          icon={<Camera className="size-4" />}
          title="Photo & video coach"
          body="Still or clip. Local geometry first, then an audited Grok pass. Deterministic safety can veto the model."
        />
        <Card
          icon={<Shield className="size-4" />}
          title="Consent is the container"
          body="Safewords, shears, nerve atlas, clocks. Yellow changes the tie. Red ends it. Dominance is attention."
        />
        <Card
          icon={<BookOpen className="size-4" />}
          title="A working knowledge base"
          body="Foundations through partial lift. Knots, scenes, aftercare, and what this atelier will refuse to teach."
        />
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-8">
        <h2 className="mb-4 font-display text-3xl">Tools</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { to: "/negotiate" as const, t: "Negotiate", d: "Yes / maybe / no" },
            { to: "/nerves" as const, t: "Nerve atlas", d: "Radial to peroneal" },
            { to: "/calc" as const, t: "Rope calc", d: "Staffs for tonight" },
            { to: "/aftercare" as const, t: "Aftercare", d: "Sit with her" },
            { to: "/emergency" as const, t: "Cut down", d: "Shears first" },
            { to: "/settings" as const, t: "Settings", d: "Safewords, voice" },
            { to: "/knots" as const, t: "Knots", d: "Non-cinch school" },
            { to: "/journal" as const, t: "Journal", d: "Local notes" },
          ].map((x) => (
            <Link
              key={x.to}
              to={x.to}
              className="rounded-lg border border-border bg-surface p-4 hover:border-border-strong"
            >
              <p className="font-display text-2xl">{x.t}</p>
              <p className="mt-1 text-xs text-muted">{x.d}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-8">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-3xl">Tonight</h2>
          <Link to="/plan" className="text-sm text-muted hover:text-fg">
            Scene planner
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {SEQUENCES.map((s) => (
            <Link
              key={s.slug}
              to="/plan"
              className="rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-strong"
            >
              <p className="text-xs uppercase tracking-wide text-muted">{s.minutes} min</p>
              <p className="mt-1 font-display text-2xl">{s.name}</p>
              <p className="mt-2 text-sm text-muted">{s.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-16">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-3xl">Start here</h2>
          <Link to="/library" className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg">
            All ties <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {featured.map((t) => (
            <Link
              key={t.slug}
              to="/tie/$slug"
              params={{ slug: t.slug }}
              className="flex gap-4 rounded-lg border border-border bg-surface p-3 hover:border-border-strong"
            >
              <MiniTie wraps={t.steps.at(-1)?.wraps ?? []} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-display text-2xl">{t.name}</p>
                  <Badge>{t.level}</Badge>
                </div>
                <p className="text-xs text-subtle">{t.jp}</p>
                <p className="mt-2 line-clamp-3 text-sm text-muted">{t.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ n, l }: { n: number; l: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-subtle">{l}</dt>
      <dd className="font-display text-3xl tabular-nums">{n}</dd>
    </div>
  );
}

function Card({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="text-muted">{icon}</div>
      <h3 className="mt-3 font-display text-2xl">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}
