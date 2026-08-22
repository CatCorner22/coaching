import type { NegItem } from "@/lib/stores/negotiate";

const TIE_LIMIT_IDS: Readonly<Record<string, readonly string[]>> = {
  "takate-kote": ["gote"],
  ebi: ["gote", "predicament"],
  "gyaku-ebi": ["gote", "predicament"],
  "hogtie-floor": ["predicament"],
  matanawa: ["crotch"],
  karada: ["torso"],
  shinju: ["torso"],
  tasuki: ["torso"],
  hishi: ["torso"],
  kikkou: ["torso"],
  "partial-suspension": ["suspension"],
};

const FURNITURE_LIMIT_IDS: Readonly<Record<string, readonly string[]>> = {
  "massage-table": ["bench"],
  "sex-bench": ["bench"],
  "st-andrews-cross": ["cross"],
  "sex-swing": ["swing"],
  pole: ["pole"],
  floggers: ["impact"],
  hismith: ["machine"],
  "bad-dragon": ["toys"],
};

function blockedByIds(
  slug: string | undefined,
  table: Readonly<Record<string, readonly string[]>>,
  blockedIds: ReadonlySet<string>,
) {
  return !!slug && (table[slug] ?? []).some((id) => blockedIds.has(id));
}

/**
 * Resolve action-facing Studio policy from negotiation state. A maybe remains
 * unresolved and therefore blocks the same actions as no until it becomes yes.
 */
export function buildStudioNegotiationPolicy(items: readonly NegItem[]) {
  const operationalLimits = items.filter((item) => item.rank !== "yes");
  const operationalLimitIds = new Set(operationalLimits.map((item) => item.id));
  return {
    operationalLimits,
    negotiationKey: items
      .map((item) => `${item.id}:${item.rank}:${item.label}`)
      .sort()
      .join("\u0000"),
    mediaBlocked: operationalLimitIds.has("photos"),
    voiceBlocked: operationalLimitIds.has("voice"),
    isTieBlocked: (slug: string | undefined) =>
      blockedByIds(slug, TIE_LIMIT_IDS, operationalLimitIds),
    isFurnitureBlocked: (slug: string | undefined) =>
      blockedByIds(slug, FURNITURE_LIMIT_IDS, operationalLimitIds),
  };
}
