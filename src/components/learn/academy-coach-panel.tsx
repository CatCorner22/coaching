import { AcademyObservePanel } from "./academy-observe-panel";
import { AcademyVoiceBar } from "./academy-voice-bar";
import { LearnMediaPanel } from "./learn-media";
import { NyxModelPanel } from "./nyx-model-panel";
import { NyxNudeStrip } from "./nyx-nude-panel";
import type { LearnMedia } from "@/lib/kb/types";
import type { Tie } from "@/lib/kb/types";
import { nyxPoseForTieStep, type NyxShibariPose } from "@/lib/learn/nyx-model";
import { nyxNudesForKnotStep, nyxNudesForTieStep, type NyxNudePose } from "@/lib/learn/nyx-nudes";
import type { NyxPhotoNudePose } from "@/lib/learn/nyx-photo-nudes";
import type { VoiceStepInput } from "@/lib/learn/voice-script";

type AcademyCoachPanelProps = {
  voice: VoiceStepInput;
  cloudVoice: boolean;
  media?: LearnMedia[];
  tie?: Tie;
  tieSlug?: string;
  stepIndex: number;
  expectedBands?: number;
  tieContext?: {
    pose: Tie["steps"][0]["expected"]["pose"];
    view: Tie["steps"][0]["expected"]["view"];
    nerves: string[];
    highlightIndex?: number;
  };
  showCamera?: boolean;
  /** When set, show the Nyx demonstration still above diagrams. */
  nyxPose?: NyxShibariPose | null;
  /** Knot slug — used to pick five nude body studies for this step. */
  knotSlug?: string;
  /** Extra nude studies; defaults from knot/tie slug + step. */
  nyxNudes?: Array<NyxNudePose | NyxPhotoNudePose>;
};

export function AcademyCoachPanel({
  voice,
  cloudVoice,
  media,
  tie,
  tieSlug,
  stepIndex,
  expectedBands,
  tieContext,
  showCamera = true,
  nyxPose: nyxPoseProp,
  knotSlug,
  nyxNudes: nyxNudesProp,
}: AcademyCoachPanelProps) {
  const nyxPose =
    nyxPoseProp ??
    (tieSlug ? nyxPoseForTieStep(tieSlug, stepIndex) : null);
  const nyxNudes =
    nyxNudesProp ??
    (tieSlug
      ? nyxNudesForTieStep(tieSlug, stepIndex)
      : knotSlug
        ? nyxNudesForKnotStep(knotSlug, stepIndex)
        : []);

  return (
    <div className="space-y-4">
      <AcademyVoiceBar step={voice} cloudVoice={cloudVoice} />
      <NyxNudeStrip poses={nyxNudes} />
      {nyxPose && (
        <div className="learn-panel rounded-xl border border-border bg-surface p-4">
          <p className="mb-3 text-sm font-medium text-fg">Demonstration model</p>
          <NyxModelPanel pose={nyxPose} />
        </div>
      )}
      {media && media.length > 0 && (
        <div className="learn-panel rounded-xl border border-border bg-surface p-4">
          <p className="mb-3 text-sm font-medium text-fg">Diagram &amp; motion</p>
          <LearnMediaPanel media={media} tieContext={tieContext} />
        </div>
      )}
      {showCamera && (
        <AcademyObservePanel
          tie={tie}
          stepIndex={stepIndex}
          expectedBands={expectedBands}
          cloudVoice={cloudVoice}
        />
      )}
    </div>
  );
}
