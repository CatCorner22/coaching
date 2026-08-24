import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AcademyCoachPanel,
  AcademyShell,
  BeforeYouStart,
  InstructorPrepCard,
  StepCard,
  StepFilmstrip,
  StepNav,
  StepProgress,
  StopStrip,
  TieStepFigure,
  emptyStepConfirm,
  type StepConfirm,
} from "@/components/learn";
import { bulletsOrFallback } from "@/lib/learn/plain-language";
import { getAcademyTie, getKnot, isFoundationTie, isInstructorRoute } from "@/lib/kb";
import { tieShape, tieShapeBlurb, tieShapeLabel } from "@/lib/kb/tie-factories";
import { coachVoiceLabel } from "@/lib/voice/coach-profile";
import { useLearnProgress } from "@/lib/stores/learn-progress";
import { useSettings } from "@/lib/stores/settings";
import { playCoachVoice } from "@/lib/voice/play";

export const Route = createFileRoute("/tie/$slug")({ component: TiePage });

function TiePage() {
  const { slug } = Route.useParams();
  // Step reconciliation lives in `getAcademyTie`, not here: it enriches the
  // catalog's steps rather than replacing them, so a guided tie keeps all of its
  // authored steps AND gains the Academy's per-step media and easy-read bullets.
  // Overriding again at this layer would hand back the raw catalog steps and
  // throw that enrichment away.
  const tie = useMemo(() => getAcademyTie(slug), [slug]);
  const cloudVoice = useSettings((settings) => settings.voice);
  const markStepComplete = useLearnProgress((s) => s.markStepComplete);
  const setLast = useLearnProgress((s) => s.setLast);
  const [step, setStep] = useState(0);
  const [confirm, setConfirm] = useState<StepConfirm>(emptyStepConfirm);

  useEffect(() => {
    setConfirm(emptyStepConfirm());
  }, [step]);

  // The route component is reused across slugs, so a step index survives the
  // navigation. Ten-step guided lessons sit next to one-step instructor routes;
  // carrying index 9 onto one of those indexes past the end of `tie.steps` and
  // takes the whole page down — including the stop conditions — so start every
  // entry at its first step.
  useEffect(() => {
    setStep(0);
  }, [slug]);

  useEffect(() => {
    if (tie) setLast({ kind: "tie", slug, step });
  }, [tie, slug, step, setLast]);

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
  // Which of the three catalog shapes this entry is — a prop drill, a tie
  // taught step by step, or a named instructor route. Derived once so the
  // badge and the sentence under it can never disagree.
  const shape = tieShape(tie);
  // The dress-form subtitle is only true of a prop drill. A foundation slug can
  // also be an instructor route (shinju, hip-harness, chair), which must not
  // invite practice on an entry the app refuses to teach, or a guided tie
  // (single-column, karada), whose own steps put rope on a person once its
  // negotiated limit is agreed — telling that reader to work on a dress form
  // while step four says to watch her face is not caution, it is a page
  // contradicting itself. Only the practice foundations get the lesson
  // subtitle; the rest show their summary. The unconditional "not permission to
  // tie a person" banner below still applies to every entry either way.
  const dressFormPractice = foundation && shape === "practice";
  const voiceLabel = coachVoiceLabel(cloudVoice);
  const bottomLines = bulletsOrFallback(s.bottomBullets, s.bottom);
  const voiceStep = {
    stepIndex: step,
    totalSteps: tie.steps.length,
    title: s.title,
    stepGoal: s.goal,
    doText: s.rigger,
    checkText: s.check,
    doBullets: s.riggerBullets,
    checkBullets: s.checkBullets,
    speak: s.speak,
  };

  function goNext() {
    markStepComplete("tie", slug, step);
    setStep((n) => n + 1);
  }

  const coachPanel = (
    <AcademyCoachPanel
      voice={voiceStep}
      cloudVoice={cloudVoice}
      media={s.media}
      tie={tie}
      stepIndex={step}
      expectedBands={s.expected.wrapBands}
      tieContext={{
        pose: s.expected.pose,
        view: s.expected.view,
        nerves: tie.nerves,
        highlightIndex: wraps.length - 1,
      }}
      showCamera={!instructor}
    />
  );

  // The coach panel only draws a figure for steps that carry media, and only
  // the three academy ties get media synthesised. Every other entry still gets
  // the rope diagram this page has always shown — inline in the step card, so
  // it never appears twice alongside the panel's copy.
  const stepFigure =
    (s.media?.length ?? 0) > 0 ? undefined : (
      <figure className="px-4 py-4">
        <TieStepFigure
          pose={s.expected.pose}
          view={s.expected.view}
          wraps={wraps}
          nerves={tie.nerves}
          className="mx-auto aspect-[4/5] w-full max-w-[16rem] text-rope"
        />
        <figcaption className="mt-2 text-center text-[11px] uppercase tracking-wide text-subtle">
          {s.expected.view} · {s.expected.wrapBands} bands
        </figcaption>
      </figure>
    );

  return (
    <AcademyShell
      backTo={foundation ? "/learn" : "/library"}
      backLabel={foundation ? "Knotty Academy" : "Library"}
      eyebrow={tie.jp}
      title={tie.name}
      subtitle={
        dressFormPractice ? "Practice on an empty dress form — one step at a time." : tie.summary
      }
      goal={tie.goal}
      badges={
        <>
          {/* Shape first: it is the one badge that says what kind of entry this
              is, and it carries "Instructor route", so the duration badge below
              stays a duration and never stands in for the label. */}
          <Badge variant={shape === "guided" ? "accent" : "default"}>{tieShapeLabel(shape)}</Badge>
          {foundation && <Badge className="border-accent/30 bg-accent/10 text-accent">Easy-read lesson</Badge>}
          <Badge>{tie.level}</Badge>
          {tie.minutes[1] > 0 && <Badge>{`${tie.minutes[0]}–${tie.minutes[1]} min study`}</Badge>}
        </>
      }
      sidebar={
        <div className="hidden space-y-4 lg:block">
          <BeforeYouStart />
          {coachPanel}
          {instructor && <InstructorPrepCard tieName={tie.name} />}
        </div>
      }
    >
      <section className="rounded-lg border border-border bg-surface px-4 py-4 sm:px-5">
        {/* Says up front what the reader may actually do with this entry,
            rather than leaving it to be inferred from a duration badge. */}
        <p className="text-base leading-relaxed text-fg">{tieShapeBlurb(shape)}</p>
        {/* The lesson subtitle displaced the summary on these pages; keep it. */}
        {dressFormPractice && <p className="mt-3 text-base leading-relaxed text-muted">{tie.summary}</p>}
        <p className="mt-3 text-base leading-relaxed text-muted">{tie.why}</p>
      </section>

      {instructor && <InstructorPrepCard tieName={tie.name} className="lg:hidden" />}

      <BeforeYouStart className="lg:hidden" />

      <div className="lg:hidden">{coachPanel}</div>

      <div className="rounded-lg border border-warn/30 bg-warn/10 px-4 py-3 text-base leading-relaxed text-warn">
        <p>
          These steps teach words and patterns. They are not permission to tie a person. Stop any time you feel unsure.
        </p>
        <p className="mt-2">
          Planning estimates, fit rules, diagrams, and checklists are not safety clearance. Consent
          and symptoms can change at any moment; pause and release for concern or uncertainty.
        </p>
      </div>

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
        media={stepFigure}
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
        onNext={goNext}
        nextLabel="Next section"
        canAdvance={!foundation || (confirm.didDo && confirm.didCheck)}
      />

      <StopStrip items={tie.stop} className="mt-4 rounded-xl border border-danger/20 bg-danger/5 p-5" />

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

      <section className="mt-8">
        <h3 className="font-display text-2xl">Aftercare</h3>
        <p className="mt-3 text-base leading-relaxed text-muted">{tie.aftercare}</p>
      </section>

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
          <Link to="/studio" search={{ tie: tie.slug, step }}>
            Open limited observation—not coaching
          </Link>
        </Button>
      )}
    </AcademyShell>
  );
}
