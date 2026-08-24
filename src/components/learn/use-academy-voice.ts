import { useEffect, useRef } from "react";
import { buildAcademyVoiceScript, type VoiceStepInput } from "@/lib/learn/voice-script";
import { playCoachVoice, stopCoachVoice } from "@/lib/voice/play";
import { useLearnProgress } from "@/lib/stores/learn-progress";

/** Auto-read the full step script when the step index changes. */
export function useAcademyAutoVoice(
  input: VoiceStepInput | null,
  cloudVoice: boolean,
  enabled: boolean,
) {
  const spokeRef = useRef(-1);

  useEffect(() => {
    if (!enabled || !input) return;
    if (spokeRef.current === input.stepIndex) return;
    spokeRef.current = input.stepIndex;
    const script = buildAcademyVoiceScript(input);
    void playCoachVoice(script, cloudVoice);
    return () => stopCoachVoice();
  }, [enabled, input, cloudVoice]);
}

export function readAcademyStep(input: VoiceStepInput, cloudVoice: boolean) {
  return playCoachVoice(buildAcademyVoiceScript(input), cloudVoice);
}

export function useAutoReadEnabled() {
  const autoRead = useLearnProgress((s) => s.autoReadVoice);
  const setAutoRead = useLearnProgress((s) => s.setAutoReadVoice);
  return [autoRead, setAutoRead] as const;
}
