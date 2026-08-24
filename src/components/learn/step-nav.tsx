import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type StepNavProps = {
  step: number;
  total: number;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  canAdvance?: boolean;
};

export function StepNav({
  step,
  total,
  onBack,
  onNext,
  nextLabel = "Next step",
  canAdvance = true,
}: StepNavProps) {
  const atEnd = step >= total - 1;
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button variant="outline" size="lg" className="flex-1 sm:min-h-12" disabled={step === 0} onClick={onBack}>
        <ChevronLeft className="size-4" aria-hidden />
        Previous step
      </Button>
      <Button
        size="lg"
        className="flex-1 sm:min-h-12"
        disabled={atEnd || !canAdvance}
        onClick={onNext}
      >
        {atEnd ? "You finished this lesson" : nextLabel}
        {!atEnd && <ChevronRight className="size-4" aria-hidden />}
      </Button>
    </div>
  );
}
