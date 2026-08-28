import type { NyxNudePose } from "@/lib/learn/nyx-nudes";
import {
  illustratedPoseForPhoto,
  isNyxPhotoNudePose,
  nyxPhotoNudeAvailable,
  photoPoseForIllustrated,
  nyxPhotoNudeCaption,
  nyxPhotoNudeUrl,
  type NyxPhotoNudePose,
} from "@/lib/learn/nyx-photo-nudes";
import { nyxNudeCaption } from "@/lib/learn/nyx-nudes";
import { NyxFigure } from "./nyx-figure";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { NYX_SHIBARI } from "@/lib/learn/nyx-model";

type NyxNudePanelProps = {
  pose: NyxNudePose | NyxPhotoNudePose;
  className?: string;
  compact?: boolean;
  /** When set, try this photo pose before falling back to illustration. */
  photoPose?: NyxPhotoNudePose | null;
};

function captionFor(pose: NyxNudePose | NyxPhotoNudePose, photoPose: NyxPhotoNudePose | null) {
  if (photoPose) return nyxPhotoNudeCaption(photoPose);
  if (isNyxPhotoNudePose(pose)) return nyxPhotoNudeCaption(pose);
  return nyxNudeCaption(pose as NyxNudePose);
}

/** One nude study — real photo when the file exists, illustrated fallback otherwise. */
export function NyxNudePanel({ pose, className, compact = false, photoPose: photoPoseProp }: NyxNudePanelProps) {
  const isPhotoKey = isNyxPhotoNudePose(pose);
  const photoPose =
    photoPoseProp ??
    (isPhotoKey ? pose : photoPoseForIllustrated(String(pose)));
  const illustrated = (
    !isPhotoKey ? (pose as NyxNudePose) : (illustratedPoseForPhoto(pose) ?? "standFront")
  ) as NyxNudePose;
  const [photoFailed, setPhotoFailed] = useState(false);
  const caption = captionFor(pose, photoPose);
  const showPhoto = Boolean(
    photoPose && nyxPhotoNudeAvailable(photoPose) && !photoFailed,
  );

  return (
    <figure
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-elevated",
        compact ? "max-w-xs" : "w-full",
        className,
      )}
    >
      <div className={cn("relative w-full bg-bg", compact ? "aspect-[3/4]" : "aspect-[1/2]")}>
        {showPhoto && photoPose ? (
          <img
            src={nyxPhotoNudeUrl(photoPose)}
            alt={`${NYX_SHIBARI.name} — ${caption}`}
            className="h-full w-full object-cover object-center"
            loading="lazy"
            decoding="async"
            onError={() => setPhotoFailed(true)}
          />
        ) : (
          <NyxFigure pose={illustrated} className="h-full w-full" />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-surface/95 via-surface/40 to-transparent px-3 pb-3 pt-10">
          <p className="text-xs font-medium text-fg">
            {NYX_SHIBARI.name} · {showPhoto ? "photo nude" : "nude study"}
          </p>
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
  poses: Array<NyxNudePose | NyxPhotoNudePose>;
  className?: string;
};

/** Several nudes per lesson step — photos when generated, illustrated fallback. */
export function NyxNudeStrip({ poses, className }: NyxNudeStripProps) {
  if (poses.length === 0) return null;

  return (
    <div className={cn("learn-panel rounded-xl border border-border bg-surface p-4", className)}>
      <p className="mb-3 text-sm font-medium text-fg">Nyx — nude body studies</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {poses.map((pose) => (
          <NyxNudePanel key={pose} pose={pose} compact />
        ))}
      </div>
    </div>
  );
}
