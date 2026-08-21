export type SafetyFlag = {
  code: "neck" | "circulation" | "time" | "radial" | "peroneal" | "breathing" | "unknown";
  severity: "info" | "watch" | "stop";
  note: string;
};

export type WrapBand = {
  yNorm: number;
  strength: number;
};

export type FrameObservation = {
  width: number;
  height: number;
  ropeShare: number;
  skinShare: number;
  wrapBands: WrapBand[];
  neckRope: number;
  paleness: number;
  blueness: number;
  motion: number;
  body: { x: number; y: number; w: number; h: number } | null;
};

export type DeterministicReport = {
  wrapCount: number;
  wrapBands: WrapBand[];
  neckRope: number;
  paleness: number;
  palenessDelta: number;
  motion: number;
  flags: SafetyFlag[];
  recommend: "continue" | "adjust" | "stop";
  notes: string[];
};

export type Prediction = {
  stepIndex: number;
  stepConfidence: number;
  risks: {
    circulation: number;
    nerve: number;
    neck: number;
    time: number;
    breathing: number;
  };
  nextFailure: string;
  etaMinutes: number | null;
  recommend: "continue" | "adjust" | "stop";
};

export type LlmDraft = {
  tieGuess: string;
  stepGuess: string;
  quality: "sound" | "adjust" | "unsafe";
  seen: string[];
  next: string;
  coaching: string;
  speak: string;
  circulation: boolean;
};

export type AuditVerdict = {
  passed: boolean;
  overrides: string[];
  droppedClaims: string[];
  source: "local-rules" | "model-self-audit" | "fused";
};

export type CoachReport = {
  deterministic: DeterministicReport;
  prediction: Prediction;
  llm: LlmDraft | null;
  audit: AuditVerdict;
  final: {
    recommend: "continue" | "adjust" | "stop";
    coaching: string;
    speak: string;
    next: string;
    flags: SafetyFlag[];
  };
};
