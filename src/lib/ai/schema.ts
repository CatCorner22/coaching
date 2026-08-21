import type { CoachReport, DeterministicReport, LlmDraft } from "@/lib/ml/types";

export type AnalyzeInput = {
  images: string[];
  deterministic: DeterministicReport;
  tieSlug?: string;
  stepIndex?: number;
  elapsedSec?: number;
  question?: string;
  protocol?: { rigger: string; bottom: string; style: "peer" | "ds" };
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
      report: CoachReport;
    }
  | { ok: false; error: string };

export type AskInput = {
  question: string;
  excerpts: { slug: string; title: string; text: string }[];
};

export type SpeakInput = { text: string };
