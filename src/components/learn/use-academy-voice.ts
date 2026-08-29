import { useEffect, useRef } from "react";
import {
  buildAcademyVoiceScript,
  buildAcademyVoiceSegments,
  type VoiceSegment,
  type VoiceStepInput,
} from "@/lib/learn/voice-script";
import { playCoachVoice, stopCoachVoice } from "@/lib/voice/play";
import { useLearnProgress } from "@/lib/stores/learn-progress";

/** Auto-read the full step script when the step index changes. */
export function useAcademyAutoVoice(
  input: VoiceStepInput | null,
  cloudVoice: boolean,
  enabled: boolean,
) {
  // The callers rebuild the step object every render, so the effect must not
  // key on its identity: when it did, the first re-render after narration
  // began ran the cleanup (stopping the voice mid-sentence) and the
  // spoke-once guard then refused to restart the step — auto-read only ever
  // survived on a page that happened not to re-render. The latest input rides
  // in a ref; the effect keys on the transitions that should actually restart
  // speech: the step, the voice, and the toggle.
  const inputRef = useRef(input);
  inputRef.current = input;
  const stepIndex = input ? input.stepIndex : -1;

  useEffect(() => {
    if (!enabled || stepIndex < 0) return;
    const current = inputRef.current;
    if (!current) return;
    void playCoachVoice(buildAcademyVoiceScript(current), cloudVoice, { reviewed: true });
    return () => stopCoachVoice();
  }, [enabled, stepIndex, cloudVoice]);
}

export function readAcademyStep(input: VoiceStepInput, cloudVoice: boolean) {
  return playCoachVoice(buildAcademyVoiceScript(input), cloudVoice, { reviewed: true });
}

/** Read one section of the step — the check on its own, for instance. */
export function readAcademySegment(segment: VoiceSegment, cloudVoice: boolean) {
  return playCoachVoice(segment.text, cloudVoice, { reviewed: true });
}

export function academyStepSegments(input: VoiceStepInput): VoiceSegment[] {
  return buildAcademyVoiceSegments(input);
}

export function useAutoReadEnabled() {
  const autoRead = useLearnProgress((s) => s.autoReadVoice);
  const setAutoRead = useLearnProgress((s) => s.setAutoReadVoice);
  return [autoRead, setAutoRead] as const;
}
