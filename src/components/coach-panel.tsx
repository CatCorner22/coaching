import { Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CoachReport } from "@/lib/ml/types";
import { playCoachVoice } from "@/lib/voice/play";
import { cn } from "@/lib/utils";

export function CoachPanel({
  report,
  voice,
  pending,
  refusal,
  halted,
}: {
  report: CoachReport | null;
  voice: boolean;
  pending?: boolean;
  refusal?: boolean;
  halted?: boolean;
}) {
  if (pending) {
    return (
      <div className="rounded-lg border border-border bg-elevated p-4 text-sm text-muted">
        xAI is preparing a limited report from the selected stills…
      </div>
    );
  }
  if (!report) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted">
        Capture a still or short clip for limited visible observations. The camera cannot clear a
        tie, assess physiology or consent, or replace direct checks and an in-person instructor.
      </div>
    );
  }
  const rec = report.final.recommend;
  return (
    <div className="space-y-3 rounded-lg border border-border bg-elevated p-4">
      <div className="flex items-center justify-between gap-2">
        <Badge variant={rec === "stop" ? "danger" : rec === "adjust" ? "warn" : "ok"}>
          {rec === "stop" ? "stop now" : "observation only"}
        </Badge>
        <span className="text-[11px] uppercase tracking-wide text-subtle">
          {report.audit.source}
          {report.audit.overrides.length ? " · audited" : ""}
        </span>
      </div>
      {refusal && (
        <p className="text-xs text-muted">
          The vision model declined the still. Only limited local image observations are shown.
        </p>
      )}
      <p className="text-sm leading-relaxed text-fg">{report.final.coaching}</p>
      <p className="text-sm text-muted">
        <span className="text-fg">Nonvisual check. </span>
        {report.final.next}
      </p>
      {report.final.flags.length > 0 && (
        <ul className="space-y-1.5">
          {report.final.flags.map((f, i) => (
            <li
              key={i}
              className={cn(
                "text-xs",
                f.severity === "stop" ? "text-danger" : "text-warn",
              )}
            >
              {f.note}
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-subtle">
        No visible concern is never an all-clear. Images cannot establish consent, sensation,
        circulation, breathing, pressure, load, or future condition.
      </p>
      {voice && !halted && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => void playCoachVoice(report.final.speak)}
        >
          <Volume2 />
          Speak it
        </Button>
      )}
    </div>
  );
}
