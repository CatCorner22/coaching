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
}: {
  report: CoachReport | null;
  voice: boolean;
  pending?: boolean;
  refusal?: boolean;
}) {
  if (pending) {
    return (
      <div className="rounded-lg border border-border bg-elevated p-4 text-sm text-muted">
        Grok is reading the rope…
      </div>
    );
  }
  if (!report) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted">
        Capture a still or a short clip. On-device vision grades wraps immediately. Ask Grok for
        the full coach pass.
      </div>
    );
  }
  const rec = report.final.recommend;
  return (
    <div className="space-y-3 rounded-lg border border-border bg-elevated p-4">
      <div className="flex items-center justify-between gap-2">
        <Badge variant={rec === "stop" ? "danger" : rec === "adjust" ? "warn" : "ok"}>
          {rec}
        </Badge>
        <span className="text-[11px] uppercase tracking-wide text-subtle">
          {report.audit.source}
          {report.audit.overrides.length ? " · audited" : ""}
        </span>
      </div>
      {refusal && (
        <p className="text-xs text-muted">
          The vision model declined the still. Local rope geometry is still coaching you.
        </p>
      )}
      <p className="text-sm leading-relaxed text-fg">{report.final.coaching}</p>
      <p className="text-sm text-muted">
        <span className="text-fg">Next. </span>
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
      <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-muted">
        <Risk label="Circulation" v={report.prediction.risks.circulation} />
        <Risk label="Nerve" v={report.prediction.risks.nerve} />
        <Risk label="Throat" v={report.prediction.risks.neck} />
        <Risk label="Time" v={report.prediction.risks.time} />
      </div>
      <p className="text-xs text-subtle">If this keeps going: {report.prediction.nextFailure}</p>
      {voice && (
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

function Risk({ label, v }: { label: string; v: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between">
        <span>{label}</span>
        <span className="tabular-nums">{Math.round(v * 100)}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-bg">
        <div
          className={cn("h-full bg-accent", v > 0.65 && "bg-danger", v > 0.4 && v <= 0.65 && "bg-warn")}
          style={{ width: `${Math.round(v * 100)}%` }}
        />
      </div>
    </div>
  );
}
