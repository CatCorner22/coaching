import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AcademyShell,
  BeforeYouStart,
  InstructorPrepCard,
  StepCard,
  StepFilmstrip,
  StepNav,
  StepProgress,
  StopStrip,
  emptyStepConfirm,
  type StepConfirm,
} from "@/components/learn";
import { RopeFigure } from "@/components/rope-figure";
import { bulletsOrFallback } from "@/lib/learn/plain-language";
import { getAcademyTie, getKnot, isFoundationTie, isInstructorRoute } from "@/lib/kb";
import { useSettings } from "@/lib/stores/settings";
import { playCoachVoice } from "@/lib/voice/play";

export const Route = createFileRoute("/tie/$slug")({ component: TiePage });

function TiePage() {
  const { slug } = Route.useParams();
  const tie = getAcademyTie(slug);
  const cloudVoice = useSettings((settings) => settings.voice);
  const [step, setStep] = useState(0);
  const [confirm, setConfirm] = useState<StepConfirm>(emptyStepConfirm);

  useEffect(() => {
    setConfirm(emptyStepConfirm());
  }, [step]);

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
  const bottomLines = bulletsOrFallback(s.bottomBullets, s.bottom);

  return (
    <AcademyShell
      backTo={foundation ? "/learn" : "/library"}
      backLabel={foundation ? "Knotty Academy" : "Library"}
      eyebrow={tie.jp}
      title={tie.name}
      subtitle={foundation ? "Practice on an empty dress form — one step at a time." : tie.summary}
      goal={tie.goal}
      badges={
        <>
          {foundation && <Badge className="border-accent/30 bg-accent/10 text-accent">Easy-read lesson</Badge>}
          <Badge>{tie.level}</Badge>
          <Badge>
            {tie.minutes[1] === 0 ? "Instructor route" : `${tie.minutes[0]}–${tie.minutes[1]} min study`}
          </Badge>
        </>
      }
      sidebar={
        <div className="space-y-4">
          <BeforeYouStart />
          <div className="rounded-xl border border-border bg-surface p-4">
            <RopeFigure pose={s.expected.pose} view={s.expected.view} wraps={wraps} nerves={tie.nerves} />
            <p className="mt-2 text-center text-sm text-muted">Picture for this step</p>
          </div>
          {instructor && <InstructorPrepCard tieName={tie.name} />}
        </div>
      }
    >
      {instructor && <InstructorPrepCard tieName={tie.name} className="lg:hidden" />}

      <BeforeYouStart className="lg:hidden" />

      <p className="rounded-lg border border-warn/30 bg-warn/10 px-4 py-3 text-base leading-relaxed text-warn">
        These steps teach words and patterns. They are not permission to tie a person. Stop any time you feel unsure.
      </p>

      <StepProgress step={step} total={tie.steps.length} />

      <StepFilmstrip steps={tie.steps} active={step} onSelect={setStep} />

      <StepCard
        index={step}
        total={tie.steps.length}
        title={s.title}
        stepGoal={s.goal}
        doText={s.rigger}
        checkText={s.check}
        doBullets={s.riggerBullets}
        checkBullets={s.checkBullets}
        speak={s.speak}
        voiceLabel={voiceLabel}
        confirm={confirm}
        onConfirmChange={setConfirm}
        requireConfirm={foundation}
        onSpeak={() => void playCoachVoice(s.speak, cloudVoice)}
      />

      <aside className="rounded-lg border border-border bg-surface px-4 py-4 sm:px-5">
        <h3 className="text-base font-medium text-fg">Remember</h3>
        <ul className="mt-2 space-y-2">
          {bottomLines.map((line) => (
            <li key={line} className="flex gap-2 text-base leading-relaxed text-muted">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-subtle" aria-hidden />
              {line}
            </li>
          ))}
        </ul>
      </aside>

      <StepNav
        step={step}
        total={tie.steps.length}
        onBack={() => setStep((n) => n - 1)}
        onNext={() => setStep((n) => n + 1)}
        nextLabel="Next section"
        canAdvance={!foundation || (confirm.didDo && confirm.didCheck)}
      />

      <StopStrip items={tie.stop} className="mt-4" />

      {tie.mistakes.length > 0 && (
        <section className="mt-8">
          <h3 className="font-display text-2xl">Common mistakes</h3>
          <ul className="mt-3 space-y-3">
            {tie.mistakes.map((m) => (
              <li key={m.title} className="rounded-lg border border-border bg-surface px-4 py-3">
                <p className="text-base font-medium">{m.title}</p>
                <p className="mt-1 text-base leading-relaxed text-muted">{m.body}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tie.knots.length > 0 && (
        <section className="mt-8">
          <h3 className="font-display text-2xl">Knots to learn first</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {tie.knots.map((k) => (
              <Link
                key={k}
                to="/knot/$slug"
                params={{ slug: k }}
                className="rounded-full border border-border px-3 py-1.5 text-sm text-muted hover:text-fg"
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
