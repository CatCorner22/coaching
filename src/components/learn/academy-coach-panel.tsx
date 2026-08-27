import { AcademyObservePanel } from "./academy-observe-panel";
import { AcademyVoiceBar } from "./academy-voice-bar";
import { LearnMediaPanel } from "./learn-media";
import { NyxModelPanel } from "./nyx-model-panel";
import type { LearnMedia } from "@/lib/kb/types";
import type { Tie } from "@/lib/kb/types";
import { nyxPoseForKnotStep, nyxPoseForTieStep, type NyxShibariPose } from "@/lib/learn/nyx-model";
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
}: AcademyCoachPanelProps) {
  const nyxPose =
    nyxPoseProp ??
    (tieSlug ? nyxPoseForTieStep(tieSlug, stepIndex) : null);

  return (
    <div className="space-y-4">
      <AcademyVoiceBar step={voice} cloudVoice={cloudVoice} />
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
