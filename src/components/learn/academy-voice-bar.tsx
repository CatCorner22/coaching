import { Mic, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { readAcademyStep, useAcademyAutoVoice, useAutoReadEnabled } from "@/components/learn/use-academy-voice";
import type { VoiceStepInput } from "@/lib/learn/voice-script";
import { coachVoiceLabel } from "@/lib/voice/coach-profile";
import { playCoachVoice } from "@/lib/voice/play";
import { cn } from "@/lib/utils";

type AcademyVoiceBarProps = {
  step: VoiceStepInput;
  cloudVoice: boolean;
  className?: string;
};

export function AcademyVoiceBar({ step, cloudVoice, className }: AcademyVoiceBarProps) {
  const [autoRead, setAutoRead] = useAutoReadEnabled();
  useAcademyAutoVoice(step, cloudVoice, autoRead);

  const voiceLabel = coachVoiceLabel(cloudVoice);

  return (
    <section
      className={cn(
        "learn-panel rounded-xl border border-border bg-surface p-4 sm:p-5",
        className,
      )}
      aria-label="Verbal instructions"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Volume2 className="size-5 text-accent" aria-hidden />
            <h3 className="text-base font-medium text-fg">Listen to this step</h3>
          </div>
          <p className="mt-1 text-sm text-muted">
            Full verbal walkthrough in a warm, lower-register female coach voice: what to do, what to check, and
            what to say. {voiceLabel}.
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={autoRead}
            onChange={(e) => setAutoRead(e.target.checked)}
            className="size-4 accent-[var(--color-accent)]"
          />
          Auto-read each step
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="lg"
          className="flex-1 sm:flex-none"
          onClick={() => void readAcademyStep(step, cloudVoice)}
        >
          <Mic className="size-4" aria-hidden />
          Read full step aloud
        </Button>
        <Button variant="outline" size="lg" onClick={() => void playCoachVoice(step.speak, cloudVoice)}>
          Say line only
        </Button>
        {autoRead && (
          <Button variant="ghost" size="lg" onClick={() => setAutoRead(false)}>
            <VolumeX className="size-4" aria-hidden />
            Mute auto-read
          </Button>
        )}
      </div>
    </section>
  );
}
