import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StepCardProps = {
  index: number;
  total: number;
  title: string;
  doText: string;
  checkText: string;
  speak: string;
  onSpeak: () => void;
  voiceLabel: string;
  media?: React.ReactNode;
  className?: string;
};

export function StepCard({
  index,
  total,
  title,
  doText,
  checkText,
  speak,
  onSpeak,
  voiceLabel,
  media,
  className,
}: StepCardProps) {
  return (
    <article className={cn("academy-step-card rounded-xl border border-border bg-surface p-5", className)}>
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-subtle">
            Step {index + 1} of {total}
          </p>
          <h2 className="mt-1 font-display text-2xl leading-tight sm:text-3xl">{title}</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onSpeak} className="shrink-0">
          {voiceLabel}
        </Button>
      </header>

      {media && <div className="academy-media mt-5 overflow-hidden rounded-lg border border-border bg-elevated">{media}</div>}

      <dl className="mt-5 space-y-4">
        <div className="academy-do rounded-lg border border-border/60 bg-elevated/50 px-4 py-3">
          <dt className="text-[10px] font-medium uppercase tracking-[0.18em] text-accent">Do</dt>
          <dd className="mt-1.5 text-sm leading-relaxed text-fg">{doText}</dd>
        </div>
        <div className="academy-check rounded-lg border border-ok/25 bg-ok/5 px-4 py-3">
          <dt className="text-[10px] font-medium uppercase tracking-[0.18em] text-ok">Check</dt>
          <dd className="mt-1.5 text-sm leading-relaxed text-fg">{checkText}</dd>
        </div>
        <div className="rounded-lg border border-border/40 px-4 py-3">
          <dt className="text-[10px] font-medium uppercase tracking-[0.18em] text-subtle">Say</dt>
          <dd className="mt-1.5 text-sm italic leading-relaxed text-muted">{speak}</dd>
        </div>
      </dl>
    </article>
  );
}
