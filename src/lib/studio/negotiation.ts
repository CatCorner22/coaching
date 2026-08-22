import { normalizeNegotiationItems, type NegItem } from "@/lib/stores/negotiate";

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
  approvedIds: ReadonlySet<string>,
) {
  return !!slug && (table[slug] ?? []).some((id) => !approvedIds.has(id));
}

/**
 * Resolve action-facing Studio policy from negotiation state. A maybe remains
 * unresolved and therefore blocks the same actions as no until it becomes yes.
 */
export function buildStudioNegotiationPolicy(items: readonly NegItem[]) {
  const normalizedItems = normalizeNegotiationItems(items);
  const operationalLimits = normalizedItems.filter((item) => item.rank !== "yes");
  const approvedIds = new Set(
    normalizedItems.filter((item) => item.rank === "yes").map((item) => item.id),
  );
  const negotiationEntries = normalizedItems
    .map((item) => [item.id, item.rank, item.label] as const)
    .sort(
      (left, right) =>
        left[0].localeCompare(right[0]) ||
        left[1].localeCompare(right[1]) ||
        left[2].localeCompare(right[2]),
    );
  return {
    operationalLimits,
    negotiationKey: JSON.stringify(negotiationEntries),
    mediaBlocked: !approvedIds.has("photos"),
    voiceBlocked: !approvedIds.has("voice"),
    isTieBlocked: (slug: string | undefined) =>
      blockedByIds(slug, TIE_LIMIT_IDS, approvedIds),
    isFurnitureBlocked: (slug: string | undefined) =>
      blockedByIds(slug, FURNITURE_LIMIT_IDS, approvedIds),
  };
}
