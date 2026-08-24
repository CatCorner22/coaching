import { RopeFigure } from "@/components/rope-figure";
import type { Pose, View, WrapSpec } from "@/lib/kb/types";
import { cn } from "@/lib/utils";

type TieStepFigureProps = {
  pose?: Pose;
  view?: View;
  wraps?: WrapSpec[];
  nerves?: string[];
  /** Index of the wrap band to highlight (defaults to last). */
  highlightIndex?: number;
  compact?: boolean;
  className?: string;
};

/** Tie step diagram with animated highlight on the active wrap band. */
export function TieStepFigure({
  pose = "stand",
  view = "front",
  wraps = [],
  nerves = [],
  highlightIndex,
  compact = false,
  className,
}: TieStepFigureProps) {
  const active = highlightIndex ?? (wraps.length > 0 ? wraps.length - 1 : -1);

  return (
    <div className={cn("learn-tie-figure relative overflow-hidden rounded-lg bg-elevated", className)}>
      <RopeFigure
        pose={pose}
        view={view}
        wraps={wraps}
        nerves={nerves}
        highlightIndex={active}
        compact={compact}
        className="h-full w-full transition-opacity duration-[280ms] ease-[var(--ease-rope)]"
      />
      {active >= 0 && (
        <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-surface/90 to-transparent px-2 py-2 text-center text-[10px] uppercase tracking-wide text-subtle">
          New wrap highlighted
        </p>
      )}
    </div>
  );
}
