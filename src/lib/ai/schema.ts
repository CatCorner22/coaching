import type { CoachReport, DeterministicReport, LlmDraft } from "@/lib/ml/types";
import type { ModelStatus, ObservationReport, TriageState } from "@/lib/observation/report";

export type AnalyzeInput = {
  images: string[];
  frameLabels?: string[];
  deterministic: DeterministicReport;
  tieSlug?: string;
  stepIndex?: number;
  elapsedSec?: number;
  hardNos?: string[];
  triage: TriageState;
  media: {
    mode: "static_photos" | "selected_video_stills";
    quality: { sharpness: number; exposure: number; score: number };
  };
  consent: {
    adults: true;
    nonExplicit: true;
    nonSecret: true;
    nonCoerced: true;
    allPeopleConsented: true;
    activity: true;
    recording: true;
    upload: true;
    output: true;
    batchId: string;
    confirmedAt: number;
  };
};

export type AnalyzeResult =
  | {
      ok: true;
      llm: LlmDraft | null;
      selfAudit: {
        contradictsDet: boolean;
        hardLimit: boolean;
        invented: boolean;
        note: string;
      };
      refusal: boolean;
      modelStatus: ModelStatus;
      report: CoachReport;
      observationReport: ObservationReport;
    }
  | {
      ok: false;
      error: string;
      /** Admission failures happen before any provider request is attempted. */
      providerAttempted: false;
      code:
        | "AI_PROVIDER_UNAVAILABLE"
        | "AI_RATE_LIMITED"
        | "MEDIA_BATCH_REPLAYED"
        | "MEDIA_BATCH_RESERVATION_UNCERTAIN";
      status: 409 | 429 | 503;
      /** Only quota rejection rolls back the batch reservation for a later retry. */
      retryableBeforeProvider: boolean;
      retryAfterMs?: number;
    };

export type AskInput = {
  question: string;
  excerpts: { slug: string; title: string; text: string }[];
};

export type SpeakInput = { text: string };
