import { NYX_SHIBARI } from "@/lib/learn/nyx-model";
import { nyxNudeCaption, type NyxNudePose } from "@/lib/learn/nyx-nudes";
import { NyxFigure } from "./nyx-figure";
import { cn } from "@/lib/utils";

type NyxNudePanelProps = {
  pose: NyxNudePose;
  className?: string;
  compact?: boolean;
};

/** One illustrated adult nude study of Nyx, with a teaching caption. */
export function NyxNudePanel({ pose, className, compact = false }: NyxNudePanelProps) {
  const caption = nyxNudeCaption(pose);

  return (
    <figure
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-elevated",
        compact ? "max-w-xs" : "w-full",
        className,
      )}
    >
      <div className={cn("relative w-full bg-bg", compact ? "aspect-[3/4]" : "aspect-[1/2]")}>
        <NyxFigure pose={pose} className="h-full w-full" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-surface/95 via-surface/40 to-transparent px-3 pb-3 pt-10">
          <p className="text-xs font-medium text-fg">{NYX_SHIBARI.name} · nude study</p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted">{caption}</p>
        </div>
      </div>
      <figcaption className="sr-only">
        {NYX_SHIBARI.name} nude study: {caption}
      </figcaption>
    </figure>
  );
}

type NyxNudeStripProps = {
  poses: NyxNudePose[];
  className?: string;
};

/** Several nudes per lesson step — the body is the teaching surface. */
export function NyxNudeStrip({ poses, className }: NyxNudeStripProps) {
  if (poses.length === 0) return null;

  return (
    <div className={cn("learn-panel rounded-xl border border-border bg-surface p-4", className)}>
      <p className="mb-3 text-sm font-medium text-fg">Nyx — nude body studies</p>
      <div className="grid grid-cols-3 gap-2">
        {poses.map((pose) => (
          <NyxNudePanel key={pose} pose={pose} compact />
        ))}
      </div>
    </div>
  );
}
