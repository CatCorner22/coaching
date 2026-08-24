import { KnotFigure } from "@/components/knot-figure";
import { TieStepFigure } from "@/components/learn/tie-step-figure";
import type { LearnMedia, Pose, View } from "@/lib/kb/types";
import { LearnVideo } from "./learn-video";

type LearnMediaPanelProps = {
  media: LearnMedia[];
  tieContext?: {
    pose: Pose;
    view: View;
    nerves: string[];
    highlightIndex?: number;
  };
  animateDiagram?: boolean;
  className?: string;
};

export function LearnMediaPanel({
  media,
  tieContext,
  animateDiagram = true,
  className,
}: LearnMediaPanelProps) {
  const diagram = media.find((m) => m.kind === "diagram");
  const wraps = media.find((m) => m.kind === "wraps");
  const video = media.find((m) => m.kind === "video");

  return (
    <div className={className}>
      {diagram && (
        <KnotFigure diagramId={diagram.diagramId} className="aspect-[5/4] w-full" animate={animateDiagram} />
      )}
      {wraps && tieContext && (
        <TieStepFigure
          pose={tieContext.pose}
          view={tieContext.view}
          wraps={wraps.wraps}
          nerves={tieContext.nerves}
          highlightIndex={tieContext.highlightIndex}
          className="aspect-[4/5] w-full text-rope"
        />
      )}
      {video && (
        <LearnVideo src={video.src} poster={video.poster} className={diagram || wraps ? "mt-3" : undefined} />
      )}
    </div>
  );
}
