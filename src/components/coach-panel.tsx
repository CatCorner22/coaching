import { Volume2 } from "lucide-react";
import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SourceEvidence } from "@/components/source-evidence";
import type { CoachReport } from "@/lib/ml/types";
import type { ModelStatus, ObservationReport } from "@/lib/observation/report";
import { playCoachVoice } from "@/lib/voice/play";
import { cn } from "@/lib/utils";

export const CoachPanel = memo(function CoachPanel({
  report,
  observationReport,
  modelStatus,
  voice,
  pending,
  refusal,
  halted,
}: {
  report: CoachReport | null;
  observationReport: ObservationReport | null;
  modelStatus: ModelStatus;
  voice: boolean;
  pending?: boolean;
  refusal?: boolean;
  halted?: boolean;
}) {
  if (!report && !observationReport && pending) {
    return (
      <div className="rounded-lg border border-border bg-elevated p-4 text-sm text-muted">
        xAI is preparing a limited report from the selected stills…
      </div>
    );
  }
  if (!report && !observationReport) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted">
        Capture a still or short clip for limited visible observations. The camera cannot clear a
        tie, assess physiology or consent, or replace direct checks and an in-person instructor.
      </div>
    );
  }
  const disposition = observationReport?.disposition ?? "insufficient_view";
  const urgent = observationReport?.urgent_stop || disposition === "stop_now" || disposition === "do_not_proceed";
  const statusLabel: Record<ModelStatus, string> = {
    not_requested: "local report · model not requested",
    completed: "xAI categories · closed schema",
    refused: "xAI declined · insufficient view",
    unavailable: "xAI unavailable · local report",
    failed: "xAI contract failure · conservative report",
  };
  return (
    <div className="space-y-3 rounded-lg border border-border bg-elevated p-4">
      {pending && (
        <p className="text-xs uppercase tracking-wide text-muted" role="status">
          xAI is preparing an updated limited report…
        </p>
      )}
      <div className="flex items-center justify-between gap-2">
        <Badge variant={urgent ? "danger" : "warn"}>
          {disposition.replaceAll("_", " ")}
        </Badge>
        <span className="text-[11px] uppercase tracking-wide text-subtle">
          {statusLabel[modelStatus]}
        </span>
      </div>
      {refusal && (
        <p className="text-xs text-muted">
          The vision model declined the still. Only limited local image observations are shown.
        </p>
      )}
      {report && <p className="text-sm leading-relaxed text-fg">{report.final.coaching}</p>}
      {observationReport && (
        <p className="text-sm text-muted">
          <span className="text-fg">Next action. </span>
          {observationReport.next_step_id.replaceAll("_", " ")}.
        </p>
      )}
      {observationReport && observationReport.nonvisual_checks.length > 0 && (
        <div
          className={cn(
            "rounded-md border px-3 py-2",
            urgent ? "border-danger/40 bg-danger/10" : "border-border bg-surface",
          )}
          role={urgent ? "alert" : undefined}
        >
          <p className="text-[11px] uppercase tracking-wide text-subtle">Action checklist</p>
          <ol className="mt-1 list-decimal space-y-1 pl-4">
            {observationReport.nonvisual_checks.map((check) => (
              <li key={check} className="text-xs text-fg">
                {check}
              </li>
            ))}
          </ol>
        </div>
      )}
      {report && report.final.flags.length > 0 && (
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
      {observationReport && observationReport.recognized_categories.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-wide text-subtle">Broad categories</p>
          <ul className="mt-1 space-y-1.5">
            {observationReport.recognized_categories.map((category) => (
              <li key={category.canonical_id} className="text-xs text-muted">
                <span className="text-fg">{category.canonical_id.replaceAll("_", " ")}</span>
                {" · "}{category.evidence_state}{" · "}{category.consequence_band.split("_")[0]}
                <br />
                <span className="text-subtle">
                  Confounders: {category.confounders_considered.join("; ")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {observationReport && (
        <>
          <p className="text-xs text-subtle">
            {observationReport.limitations[0]} No visible concern is never an all-clear.
          </p>
          <p className="text-[11px] text-subtle">
            Schema {observationReport.schema_version} · ledger {observationReport.source_ledger_revision}
          </p>
          <SourceEvidence sourceIds={observationReport.source_ids} />
        </>
      )}
      {voice && !halted && report && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => void playCoachVoice(report.final.speak, voice)}
        >
          <Volume2 />
          Speak it
        </Button>
      )}
    </div>
  );
});
