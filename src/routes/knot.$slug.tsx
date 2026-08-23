import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { KnotFigure } from "@/components/knot-figure";
import {
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
import { useSettings } from "@/lib/stores/settings";
import { playCoachVoice } from "@/lib/voice/play";

export const Route = createFileRoute("/knot/$slug")({ component: KnotPage });

function KnotPage() {
  const { slug } = Route.useParams();
  const knot = getAcademyKnot(slug);
  const cloudVoice = useSettings((settings) => settings.voice);
  const [step, setStep] = useState(0);
  const [confirm, setConfirm] = useState<StepConfirm>(emptyStepConfirm);

  useEffect(() => {
    setConfirm(emptyStepConfirm());
  }, [step]);

  if (!knot) {
    return (
      <div className="px-5 py-16 text-muted">
        Unknown knot. <Link to="/knots">Knots</Link>
      </div>
    );
  }

  const s = knot.steps[step]!;
  const foundation = isFoundationKnot(slug);
  const voiceLabel = cloudVoice ? "Speak with cloud voice" : "Browser voice · no xAI";

  return (
    <AcademyShell
      backTo={foundation ? "/learn" : "/knots"}
      backLabel={foundation ? "Knotty Academy" : "All knots"}
      eyebrow={knot.jp}
      title={knot.name}
      subtitle={foundation ? "Practice on a post or chair leg — one step at a time." : knot.summary}
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
          <div className="rounded-xl border border-border bg-surface p-4">
            <KnotFigure diagramId={s.diagramId ?? `${slug}-${step}`} className="aspect-[5/4] w-full" />
            <p className="mt-2 text-center text-sm text-muted">Picture for this step (post only)</p>
          </div>
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
        onNext={() => setStep((n) => n + 1)}
        canAdvance={!foundation || (confirm.didDo && confirm.didCheck)}
      />

      <StopStrip items={knot.watch} className="mt-4 rounded-xl border border-danger/20 bg-danger/5 p-5" />
    </AcademyShell>
  );
}
