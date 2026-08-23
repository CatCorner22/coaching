import { cn } from "@/lib/utils";

type StepProgressProps = {
  step: number;
  total: number;
  className?: string;
};

export function StepProgress({ step, total, className }: StepProgressProps) {
  const pct = total > 0 ? Math.round(((step + 1) / total) * 100) : 0;
  return (
    <div className={cn("space-y-2", className)} aria-label={`Step ${step + 1} of ${total}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-fg">
          Step {step + 1} of {total}
        </span>
        <span className="text-muted">{pct}% done</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-elevated">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={total}
        />
      </div>
    </div>
  );
}
