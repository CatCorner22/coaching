import { NYX_SHIBARI, nyxCaption, nyxPhoto, type NyxShibariPose } from "@/lib/learn/nyx-model";
import { cn } from "@/lib/utils";

type NyxModelPanelProps = {
  pose: NyxShibariPose;
  className?: string;
  compact?: boolean;
};

/**
 * Academy demonstration still — fictional model reference, not live coaching or
 * clearance. Shown alongside procedural diagrams on taught tie and knot pages.
 */
export function NyxModelPanel({ pose, className, compact = false }: NyxModelPanelProps) {
  const src = nyxPhoto(pose);
  const caption = nyxCaption(pose);

  return (
    <figure
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-elevated",
        compact ? "max-w-xs" : "w-full",
        className,
      )}
    >
      <div className={cn("relative w-full bg-bg", compact ? "aspect-[3/4]" : "aspect-[4/5]")}>
        <img
          src={src}
          alt={`${NYX_SHIBARI.name} — ${caption}`}
          className="h-full w-full object-cover object-center"
          loading="lazy"
          decoding="async"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-surface/95 via-surface/40 to-transparent px-3 pb-3 pt-10">
          <p className="text-xs font-medium text-fg">{NYX_SHIBARI.name}</p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted">{caption}</p>
        </div>
      </div>
      <figcaption className="sr-only">{NYX_SHIBARI.name}: {caption}</figcaption>
    </figure>
  );
}
