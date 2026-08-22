import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RopeFigure } from "@/components/rope-figure";
import { getKnot, getTie } from "@/lib/kb";
import { useSettings } from "@/lib/stores/settings";
import { playCoachVoice } from "@/lib/voice/play";

export const Route = createFileRoute("/tie/$slug")({ component: TiePage });

function TiePage() {
  const { slug } = Route.useParams();
  const tie = getTie(slug);
  const cloudVoice = useSettings((settings) => settings.voice);
  const [step, setStep] = useState(0);
  if (!tie) {
    return (
      <div className="px-5 py-16 text-muted">
        Unknown tie. <Link to="/library">Library</Link>
      </div>
    );
  }
  const s = tie.steps[step]!;
  const wraps = tie.steps.slice(0, step + 1).flatMap((x) => x.wraps);
  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_240px]">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-muted">{tie.jp}</p>
        <h1 className="mt-2 font-display text-4xl">{tie.name}</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge>{tie.level}</Badge>
          <Badge>
            {tie.minutes[1] === 0 ? "Instructor route" : `${tie.minutes[0]}–${tie.minutes[1]} min study`}
          </Badge>
          <Badge>{tie.position}</Badge>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted">{tie.summary}</p>
        <p className="mt-3 text-sm text-fg">{tie.why}</p>
        <p className="mt-3 rounded-md border border-warn/30 bg-warn/10 px-3 py-2 text-xs leading-relaxed text-warn">
          Planning estimates, fit rules, diagrams, and checklists are not safety clearance. Consent
          and symptoms can change at any moment; pause and release for concern or uncertainty.
        </p>

        <div className="mt-8 rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-wide text-muted">
              Section {step + 1} of {tie.steps.length}
            </p>
            <Button variant="ghost" size="sm" onClick={() => void playCoachVoice(s.speak, cloudVoice)}>
              {cloudVoice ? "Speak with cloud voice" : "Browser voice · no xAI"}
            </Button>
          </div>
          <h2 className="mt-2 font-display text-3xl">{s.title}</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Block k="Operator" v={s.rigger} />
            <Block k="Participant" v={s.bottom} />
            <Block k="Check" v={s.check} />
          </dl>
          <div className="mt-5 flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              disabled={step === 0}
              onClick={() => setStep((n) => n - 1)}
            >
              Back
            </Button>
            <Button
              className="flex-1"
              disabled={step >= tie.steps.length - 1}
              onClick={() => setStep((n) => n + 1)}
            >
              Next section
            </Button>
          </div>
        </div>

        <h3 className="mt-10 font-display text-2xl">Stop if</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-danger-text">
          {tie.stop.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <h3 className="mt-8 font-display text-2xl">Common mistakes</h3>
        <ul className="mt-2 space-y-3">
          {tie.mistakes.map((m) => (
            <li key={m.title}>
              <p className="text-sm font-medium">{m.title}</p>
              <p className="text-sm text-muted">{m.body}</p>
            </li>
          ))}
        </ul>
        <h3 className="mt-8 font-display text-2xl">Aftercare</h3>
        <p className="mt-2 text-sm text-muted">{tie.aftercare}</p>
        {tie.knots.length > 0 && (
          <div className="mt-8">
            <h3 className="font-display text-2xl">Knots</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {tie.knots.map((k) => (
                <Link
                  key={k}
                  to="/knot/$slug"
                  params={{ slug: k }}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted hover:text-fg"
                >
                  {getKnot(k)?.name ?? k}
                </Link>
              ))}
            </div>
          </div>
        )}
        {tie.minutes[1] === 0 ? (
          <Button className="mt-10" disabled>
            Instructor route · Studio unavailable
          </Button>
        ) : (
          <Button asChild className="mt-10">
            <Link to="/studio" search={{ tie: tie.slug }}>
              Open limited observation—not coaching
            </Link>
          </Button>
        )}
      </div>
      <aside className="h-fit rounded-lg border border-border bg-surface p-4">
        <RopeFigure pose={s.expected.pose} view={s.expected.view} wraps={wraps} nerves={tie.nerves} />
        <p className="mt-2 text-center text-[11px] uppercase tracking-wide text-subtle">
          {s.expected.view} · {s.expected.wrapBands} bands
        </p>
      </aside>
    </div>
  );
}

function Block({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-subtle">{k}</dt>
      <dd className="mt-1 leading-relaxed text-fg">{v}</dd>
    </div>
  );
}
