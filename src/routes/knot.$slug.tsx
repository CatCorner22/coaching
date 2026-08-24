import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  AcademyCoachPanel,
  AcademyShell,
  BeforeYouStart,
  StepCard,
  StepFilmstrip,
  StepNav,
  StepProgress,
  StopStrip,
  emptyStepConfirm,
  type StepConfirm,
} from "@/components/learn";
import { getAcademyKnot, isFoundationKnot } from "@/lib/kb";
import { coachVoiceLabel } from "@/lib/voice/coach-profile";
import { useLearnProgress } from "@/lib/stores/learn-progress";
import { useSettings } from "@/lib/stores/settings";
import { playCoachVoice } from "@/lib/voice/play";

export const Route = createFileRoute("/knot/$slug")({ component: KnotPage });

function KnotPage() {
  const { slug } = Route.useParams();
  const knot = getAcademyKnot(slug);
  const cloudVoice = useSettings((settings) => settings.voice);
  const markStepComplete = useLearnProgress((s) => s.markStepComplete);
  const setLast = useLearnProgress((s) => s.setLast);
  const [step, setStep] = useState(0);
  const [confirm, setConfirm] = useState<StepConfirm>(emptyStepConfirm);

  useEffect(() => {
    setConfirm(emptyStepConfirm());
  }, [step]);

  useEffect(() => {
    if (knot) setLast({ kind: "knot", slug, step });
  }, [knot, slug, step, setLast]);

  if (!knot) {
    return (
      <div className="px-5 py-16 text-muted">
        Unknown knot. <Link to="/knots">Knots</Link>
      </div>
    );
  }

  const s = knot.steps[step]!;
  const foundation = isFoundationKnot(slug);
  const voiceLabel = coachVoiceLabel(cloudVoice);
  const voiceStep = {
    stepIndex: step,
    totalSteps: knot.steps.length,
    title: s.title,
    doText: s.do ?? s.body,
    checkText: s.check ?? "It looks like the diagram.",
    doBullets: s.doBullets,
    checkBullets: s.checkBullets,
    speak: s.speak,
  };

  function goNext() {
    markStepComplete("knot", slug, step);
    setStep((n) => n + 1);
  }

  return (
    <AcademyShell
      backTo={foundation ? "/learn" : "/knots"}
      backLabel={foundation ? "Knotty Academy" : "All knots"}
      eyebrow={knot.jp}
      title={knot.name}
      subtitle={
        // The catalog summary carries the entry's scope — "not a lock, backup,
        // or component for body restraint" — and the foundation lesson used to
        // replace it wholesale, so the six knots the app actually teaches were
        // the six whose framing the reader never saw. Keep both.
        foundation ? `${knot.summary} Practice on a post or chair leg — one step at a time.` : knot.summary
      }
      goal={knot.goal}
      badges={
        <>
          {foundation && <Badge className="border-accent/30 bg-accent/10 text-accent">Easy-read lesson</Badge>}
          <Badge>{knot.cinches ? "Cinches" : "Does not cinch"}</Badge>
        </>
      }
      sidebar={
        <div className="space-y-4">
          <BeforeYouStart />
          <AcademyCoachPanel
            voice={voiceStep}
            cloudVoice={cloudVoice}
            media={s.media}
            stepIndex={step}
            showCamera={foundation}
          />
        </div>
      }
      footer={
        knot.usedIn.length > 0 ? (
          <div>
            <h3 className="font-display text-2xl">Used in these ties</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {knot.usedIn.map((tieSlug) => (
                <Link
                  key={tieSlug}
                  to="/tie/$slug"
                  params={{ slug: tieSlug }}
                  className="rounded-full border border-border px-3 py-1 text-sm text-muted hover:text-fg"
                >
                  {tieSlug.replace(/-/g, " ")}
                </Link>
              ))}
            </div>
          </div>
        ) : undefined
      }
    >
      <BeforeYouStart className="lg:hidden" />

      <div className="lg:hidden">
        <AcademyCoachPanel
          voice={voiceStep}
          cloudVoice={cloudVoice}
          media={s.media}
          stepIndex={step}
          showCamera={foundation}
        />
      </div>

      <StepProgress step={step} total={knot.steps.length} />

      <StepFilmstrip steps={knot.steps} active={step} onSelect={setStep} />

      <StepCard
        index={step}
        total={knot.steps.length}
        title={s.title}
        doText={s.do ?? s.body}
        checkText={s.check ?? "It looks like the diagram."}
        doBullets={s.doBullets}
        checkBullets={s.checkBullets}
        speak={s.speak}
        voiceLabel={voiceLabel}
        confirm={confirm}
        onConfirmChange={setConfirm}
        requireConfirm={foundation}
        onSpeak={() => void playCoachVoice(s.speak, cloudVoice)}
      />

      <StepNav
        step={step}
        total={knot.steps.length}
        onBack={() => setStep((n) => n - 1)}
        onNext={goNext}
        canAdvance={!foundation || (confirm.didDo && confirm.didCheck)}
      />

      <StopStrip items={knot.watch} className="mt-4 rounded-xl border border-danger/20 bg-danger/5 p-5" />
    </AcademyShell>
  );
}
