import {
  SOURCE_LEDGER_REVISION,
  getSafetySource,
  type SafetySourceId,
} from "./sources";

export type ArticleEvidence = {
  status: "source_anchored" | "editorial_only";
  sourceIds: readonly SafetySourceId[];
  ledgerRevision: typeof SOURCE_LEDGER_REVISION;
  auditedAt: "2026-08-22";
  note: string;
};

const ARTICLE_SOURCE_IDS: Readonly<Record<string, readonly SafetySourceId[]>> = {
  "consent-frameworks": ["CONSENT-1", "CONSENT-2"],
  negotiation: ["CONSENT-1", "CONSENT-2"],
  safewords: ["CONSENT-2"],
  "yes-no-maybe": ["CONSENT-2"],
  "hard-limits": ["FATAL-1", "NFS-1"],
  "nerve-atlas": ["ROPE-1", "FIRSTAID-1"],
  circulation: ["ROPE-1", "FIRSTAID-1"],
  "emergency-stop": ["FIRSTAID-1", "NFS-1"],
  subspace: ["FIRSTAID-1"],
  "photography-ethics": [
    "CONSENT-2",
    "XAI-VISION-1",
    "XAI-VISION-2",
    "XAI-MODEL-1",
    "XAI-VIDEO-1",
    "XAI-PRIVACY-1",
    "XAI-TERMS-1",
  ],
  "suspension-reality": ["ROPE-1", "FATAL-1"],
  "marks-vs-injury": ["ROPE-1", "NFS-1", "FIRSTAID-1"],
  "check-in-script": ["CONSENT-2", "FIRSTAID-1"],
  "yellow-vs-red": ["CONSENT-2", "FIRSTAID-1"],
  "photo-for-coaching": [
    "CONSENT-2",
    "XAI-VISION-1",
    "XAI-MODEL-1",
    "XAI-VIDEO-1",
    "XAI-PRIVACY-1",
    "XAI-TERMS-1",
  ],
  "positional-asphyxia": ["ASPHYX-1", "FATAL-1", "FIRSTAID-1"],
  "gag-signal-safety": ["CONSENT-2", "FATAL-1"],
  "nerve-self-checks": ["ROPE-1", "ROPE-2"],
  "circulation-vs-nerve": ["ROPE-2", "FIRSTAID-1"],
  "fainting-response": ["SYNCOPE-1", "SYNCOPE-2", "FIRSTAID-1"],
  "cuff-and-collar-fit": ["CUFF-1", "NFS-1"],
  "solo-self-tying": ["FIRSTAID-1"],
  // FIRSTAID-1 anchors only the unresponsive-person half — airway, position,
  // and calling emergency services. The scoping argument is app-authored.
  "top-incapacitated": ["FIRSTAID-1"],
  // Anchored for the consent half only. The device and cloud-storage behaviour
  // it describes is general platform fact this app publishes no citation for,
  // so the entry stays honest about being app-authored on that.
  "where-the-images-live": ["CONSENT-2", "XAI-PRIVACY-1"],
  "getting-cold": ["FIRSTAID-1"],
  // The consent sources anchor the disclosure-is-part-of-consent argument. The
  // clinical items each needed their own: nerve history to the compression
  // series, fainting to the syncope guidance, breathing and position to the
  // asphyxia bulletin. The remaining conditions named in the list are
  // conversation prompts, and the article says so rather than implying every
  // one of them carries a citation.
  "medical-disclosure": ["CONSENT-1", "CONSENT-2", "CONSENT-3", "ROPE-1", "SYNCOPE-2", "ASPHYX-1"],
  // Anchors the fiber comparison and its skin-reaction warning; it is community
  // education about materials, not a clinical allergy reference.
  "rope-materials": ["MAT-1"],
  "rope-inspection-retirement": ["MAT-1"],
  "incident-response": ["ROPE-1", "FIRSTAID-1"],
};

export function getArticleEvidence(slug: string): ArticleEvidence {
  const sourceIds = ARTICLE_SOURCE_IDS[slug] ?? [];
  const status = sourceIds.length > 0 ? "source_anchored" : "editorial_only";
  return {
    status,
    sourceIds,
    ledgerRevision: SOURCE_LEDGER_REVISION,
    auditedAt: "2026-08-22",
    note:
      status === "source_anchored"
        ? "The linked sources anchor only the relevant consent, injury-pattern, emergency, provider-capability, privacy, or limitation claims. They do not validate every sentence, an individual setup, or a safe technique."
        : "App-authored educational boundary. No claim-level source anchors are published for this entry; do not treat it as independently validated guidance or a procedure.",
  };
}

export function articleEvidenceSources(slug: string) {
  return getArticleEvidence(slug)
    .sourceIds.map((id) => getSafetySource(id))
    .filter((source): source is NonNullable<typeof source> => source !== undefined);
}
