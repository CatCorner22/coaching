import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type StepFilmstripProps = {
  steps: { title: string }[];
  active: number;
  onSelect: (index: number) => void;
  className?: string;
};

export function StepFilmstrip({ steps, active, onSelect, className }: StepFilmstripProps) {
  return (
    <nav aria-label="Jump to a step" className={cn("academy-filmstrip space-y-2", className)}>
      <p className="text-sm text-muted">Tap a step to jump (or use Previous / Next below).</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {steps.map((step, i) => {
          const done = i < active;
          const current = i === active;
          return (
            <button
              key={step.title + i}
              type="button"
              onClick={() => onSelect(i)}
              aria-current={current ? "step" : undefined}
              className={cn(
                "min-w-[5.5rem] shrink-0 rounded-lg border px-3 py-2.5 text-left transition-colors duration-150",
                current
                  ? "border-accent bg-elevated text-fg ring-1 ring-accent/30"
                  : done
                    ? "border-ok/30 bg-ok/5 text-muted"
                    : "border-border bg-surface text-muted hover:border-border-strong hover:text-fg",
              )}
            >
              <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-subtle">
                {done ? <Check className="size-3 text-ok" aria-hidden /> : null}
                Step {i + 1}
              </span>
              <span className={cn("mt-1 block text-sm font-medium leading-snug", current ? "max-w-none" : "max-w-[8rem] truncate")}>
                {step.title}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
