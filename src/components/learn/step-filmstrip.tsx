import { cn } from "@/lib/utils";

type StepFilmstripProps = {
  steps: { title: string }[];
  active: number;
  onSelect: (index: number) => void;
  className?: string;
};

export function StepFilmstrip({ steps, active, onSelect, className }: StepFilmstripProps) {
  return (
    <nav aria-label="Lesson steps" className={cn("academy-filmstrip flex gap-2 overflow-x-auto pb-1", className)}>
      {steps.map((step, i) => (
        <button
          key={step.title + i}
          type="button"
          onClick={() => onSelect(i)}
          aria-current={i === active ? "step" : undefined}
          className={cn(
            "min-w-[4.5rem] shrink-0 rounded-lg border px-3 py-2 text-left transition-colors duration-150",
            i === active
              ? "border-accent bg-elevated text-fg"
              : i < active
                ? "border-ok/30 bg-ok/5 text-muted"
                : "border-border bg-surface text-muted hover:border-border-strong hover:text-fg",
          )}
        >
          <span className="block text-[10px] uppercase tracking-wide text-subtle">{i + 1}</span>
          <span className="mt-0.5 block max-w-[7rem] truncate text-xs font-medium">{step.title}</span>
        </button>
      ))}
    </nav>
  );
}
