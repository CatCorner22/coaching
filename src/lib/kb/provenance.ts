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

  // ── D/s practice and activity families ──────────────────────────────────
  // Most of this material is app-authored and stays editorial_only on purpose.
  // The consent sources anchor the structure-of-consent argument wherever it
  // appears; the clinical ones anchor a specific named mechanism and nothing
  // else in the entry. Where no source in the ledger bears on a topic — the
  // shape of a protocol, what a role obliges, how a debrief goes — the entry
  // claims no anchor rather than borrowing a loosely related one.
  "power-exchange-scope": ["CONSENT-1", "CONSENT-2"],
  "submissive-agency": ["CONSENT-2"],
  "rules-vs-limits": ["CONSENT-2", "CONSENT-3"],
  "discipline-and-punishment": ["CONSENT-1", "CONSENT-2", "CONSENT-3"],
  "orders-and-obedience": ["CONSENT-2"],
  // Anchors the neck half only: the strangulation and fatality reviews for why
  // nothing attaches or tightens, and the handcuff series for worn-device fit.
  // What a collar means between two people has no source and needs none.
  "collars-and-symbols": ["NFS-1", "FATAL-1", "CUFF-1"],
  "ongoing-consent-longterm": ["CONSENT-1", "CONSENT-2", "CONSENT-3"],
  "blanket-consent": ["CONSENT-1", "CONSENT-2"],
  "consensual-non-consent": ["CONSENT-1", "CONSENT-2", "CONSENT-3"],
  // The first-aid guidance anchors the unresponsive-person half. That a home
  // scene lacks a third person is an observation, not a cited finding.
  "two-person-scene": ["FIRSTAID-1", "ASPHYX-1"],
  // Injury patterns and first response only. No source here endorses any
  // technique, target, or intensity, and the entry teaches none.
  "impact-risk-families": ["NFS-1", "FIRSTAID-1"],
  // Burn assessment only.
  "temperature-play": ["FIRSTAID-1"],
  // The compression series anchors what sustained restriction does to a
  // circumscribed area; the clock-not-sensation argument follows from it.
  "clamps-and-constriction": ["ROPE-1", "ROPE-2", "FIRSTAID-1"],
  // Anchors the airway and position half, which is the part that can kill.
  "sensory-deprivation": ["ASPHYX-1", "FATAL-1"],
  "edge-play-line": ["FATAL-1", "ASPHYX-1", "NFS-1"],
  // The handcuff neuropathy series is the closest published analogue for a
  // rigid device worn against the body over hours.
  "chastity-devices": ["CUFF-1"],
  "humiliation-and-degradation": ["CONSENT-2"],
  // Stillness, position and breathing; the psychological framing is
  // app-authored.
  objectification: ["ASPHYX-1", "FIRSTAID-1"],
  // Capacity to consent only.
  "substances-and-play": ["CONSENT-1", "CONSENT-3"],
  "consent-incident": ["CONSENT-2", "CONSENT-3"],

  // ── Technique and mechanism ─────────────────────────────────────────────
  // The compression series and the rope-specific nerve guidance anchor the
  // mechanism claims: that nerve injury is the common one, that it occurs
  // without circulatory change, and that it can present late. The asphyxia
  // bulletin anchors the positional-breathing mechanism. Everything about how
  // to hold a rope is craft, and craft has no citation here.
  "how-rope-injures": ["ROPE-1", "ROPE-2", "ASPHYX-1", "FIRSTAID-1"],
  // Anchors only the claim that colour, warmth and refill do not detect nerve
  // compression — which is the entire point of the entry.
  "the-check-that-works": ["ROPE-1", "ROPE-2", "FIRSTAID-1"],
  "getting-rope-off": ["FIRSTAID-1"],

  // ── Learning science ────────────────────────────────────────────────────
  // These entries name studies in their body text, so they have to carry the
  // anchors: an evidence panel reading "no claim-level source anchors are
  // published" directly beneath a paragraph citing a review is the panel
  // contradicting the page. The LEARN sources anchor how a skill is learned
  // and nothing else — no rope claim in these entries is anchored, because
  // none of these studies is about rope.
  "learning-modalities": ["LEARN-1", "LEARN-3", "LEARN-4"],
  "learning-pacing": ["LEARN-4", "LEARN-5"],
  "spaced-learning": ["LEARN-2"],
  "evidence-based-teaching": ["LEARN-1", "LEARN-2", "LEARN-3", "LEARN-4"],
  // Anchors the two general claims the entry leans on — that style-matching
  // failed testing, and that the retrieve/space advice is the same for every
  // reader. The specific accommodations are practitioner knowledge, and the
  // entry says which parts those are rather than implying a citation.
  "learning-disabilities-rope": ["LEARN-1", "LEARN-2"],
  // rope-basics and knot-foundations stay editorial_only on purpose: handling
  // rope and the choice of which six knots to teach first are craft, and craft
  // has no citation here.
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
