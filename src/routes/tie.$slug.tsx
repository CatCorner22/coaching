import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AcademyShell, InstructorPrepCard, StepCard, StepFilmstrip, StepNav, StopStrip } from "@/components/learn";
import { RopeFigure } from "@/components/rope-figure";
import { getAcademyTie, getKnot, isFoundationTie, isInstructorRoute } from "@/lib/kb";
import { useSettings } from "@/lib/stores/settings";
import { playCoachVoice } from "@/lib/voice/play";

export const Route = createFileRoute("/tie/$slug")({ component: TiePage });

function TiePage() {
  const { slug } = Route.useParams();
  const tie = getAcademyTie(slug);
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
  const instructor = isInstructorRoute(tie);
  const foundation = isFoundationTie(slug);
  const voiceLabel = cloudVoice ? "Speak with cloud voice" : "Browser voice · no xAI";

  return (
    <AcademyShell
      backTo={foundation ? "/learn" : "/library"}
      backLabel={foundation ? "Knotty Academy" : "Library"}
      eyebrow={tie.jp}
      title={tie.name}
      subtitle={tie.summary}
      goal={tie.goal}
      badges={
        <>
          {foundation && <Badge className="border-accent/30 bg-accent/10 text-accent">Academy</Badge>}
          <Badge>{tie.level}</Badge>
          <Badge>
            {tie.minutes[1] === 0 ? "Instructor route" : `${tie.minutes[0]}–${tie.minutes[1]} min study`}
          </Badge>
          <Badge>{tie.position}</Badge>
        </>
      }
      sidebar={
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-surface p-4">
            <RopeFigure pose={s.expected.pose} view={s.expected.view} wraps={wraps} nerves={tie.nerves} />
            <p className="mt-2 text-center text-[11px] uppercase tracking-wide text-subtle">
              {s.expected.view} · {s.expected.wrapBands} bands
            </p>
          </div>
          {instructor && <InstructorPrepCard tieName={tie.name} />}
        </div>
      }
    >
      {instructor && <InstructorPrepCard tieName={tie.name} className="lg:hidden" />}

      <p className="rounded-md border border-warn/30 bg-warn/10 px-3 py-2 text-xs leading-relaxed text-warn">
        Planning estimates, fit rules, diagrams, and checklists are not safety clearance. Consent and symptoms can
        change at any moment; pause and release for concern or uncertainty.
      </p>

      <StepFilmstrip steps={tie.steps} active={step} onSelect={setStep} />

      <StepCard
        index={step}
        total={tie.steps.length}
        title={s.title}
        doText={s.rigger}
        checkText={s.check}
        speak={s.speak}
        voiceLabel={voiceLabel}
        onSpeak={() => void playCoachVoice(s.speak, cloudVoice)}
        media={
          s.goal ? (
            <p className="px-4 py-3 text-sm text-muted">
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-accent">Step goal · </span>
              {s.goal}
            </p>
          ) : undefined
        }
      />

      <dl className="rounded-lg border border-border bg-surface px-4 py-3 text-sm">
        <dt className="text-[10px] uppercase tracking-[0.18em] text-subtle">Participant note</dt>
        <dd className="mt-1 leading-relaxed text-muted">{s.bottom}</dd>
      </dl>

      <StepNav
        step={step}
        total={tie.steps.length}
        onBack={() => setStep((n) => n - 1)}
        onNext={() => setStep((n) => n + 1)}
        nextLabel="Next section"
      />

      <StopStrip items={tie.stop} className="mt-6" />

      <section className="mt-8">
        <h3 className="font-display text-2xl">Common mistakes</h3>
        <ul className="mt-3 space-y-3">
          {tie.mistakes.map((m) => (
            <li key={m.title} className="rounded-lg border border-border bg-surface px-4 py-3">
              <p className="text-sm font-medium">{m.title}</p>
              <p className="mt-1 text-sm text-muted">{m.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h3 className="font-display text-2xl">Aftercare</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{tie.aftercare}</p>
      </section>

      {tie.knots.length > 0 && (
        <section className="mt-8">
          <h3 className="font-display text-2xl">Related knots</h3>
          <div className="mt-3 flex flex-wrap gap-2">
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
        </section>
      )}

      {tie.minutes[1] === 0 ? (
        <Button className="mt-8 w-full sm:w-auto" disabled>
          Instructor route · Studio unavailable
        </Button>
      ) : (
        <Button asChild className="mt-8 w-full sm:w-auto">
          <Link to="/studio" search={{ tie: tie.slug }}>
            Open limited observation—not coaching
          </Link>
        </Button>
      )}
    </AcademyShell>
  );
}
