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
  // These twelve were selectable in Studio with every limit set to no: the map
  // had only ever covered the categories that happened to have an obviously
  // matching row, and the rest fell through it silently. `arms` and `legs`
  // exist as negotiable rows because most of them had no limit to map to.
  futomomo: ["legs"],
  "frog-tie": ["legs"],
  mermaid: ["legs"],
  agura: ["legs", "predicament"],
  tengu: ["arms"],
  tesuji: ["arms"],
  bunny: ["arms"],
  "hip-harness": ["torso"],
  chair: ["bench"],
  starfish: ["bench"],
  "pole-cuffs": ["pole"],
  "bench-drape": ["bench"],
  // Expanded catalog. A tie maps to every limit its category actually touches,
  // so an unresolved maybe on any one of them blocks it — an entry that maps to
  // nothing is open by default, which is only ever right for a prop drill.
  "kata-te-kote": ["gote"],
  "yoko-gote": ["gote"],
  teppou: ["arms"],
  strappado: ["arms"],
  "reverse-prayer": ["arms"],
  armbinder: ["arms"],
  "ushiro-te-shibari": ["arms"],
  "waki-shibari": ["arms", "torso"],
  munenawa: ["torso"],
  "rope-corset": ["torso"],
  "kubi-nawa": ["neck"],
  "nawa-kutsuwa": ["gag"],
  "m-ji-kaikyaku": ["crotch", "legs"],
  kani: ["predicament", "legs"],
  daruma: ["predicament", "legs", "arms"],
  sakura: ["predicament", "legs"],
  predicament: ["predicament"],
  "hashira-shibari": ["pole"],
  "mae-te-shibari": ["arms"],
  "ashi-shibari": ["legs"],
  "spread-eagle": ["bench"],
  tsurikomi: ["suspension"],
  "kata-ashi-zuri": ["suspension"],
  "yoko-zuri": ["suspension"],
  "tate-zuri": ["suspension"],
  "sakasa-zuri": ["suspension"],
  "ebi-zuri": ["suspension", "predicament"],
  "hogtie-suspended": ["suspension", "predicament"],
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
 * Media cleanup is required only after an approval that was already active is
 * lost. An initial blocked hydration snapshot is not a revocation: treating it
 * as one lets a stale passive effect erase a newer action-first answer after
 * persisted approval finishes loading.
 */
export function mediaAuthorizationWasRevoked(
  previouslyAllowed: boolean,
  currentlyAllowed: boolean,
): boolean {
  return previouslyAllowed && !currentlyAllowed;
}

/**
 * A stable signature of everything that gates Studio: the negotiated ranks plus
 * the consent-bearing settings flags. Cross-tab invalidation compares this so an
 * unrelated keystroke in another tab (a negotiation note, a name field) cannot
 * reload an open Studio and discard a live capture, while a real policy or
 * consent change still does.
 */
export function studioPolicySignature(
  items: readonly NegItem[],
  settings: { consented?: boolean; voice?: boolean; listen?: boolean },
): string {
  const { negotiationKey } = buildStudioNegotiationPolicy(items);
  const flag = (value: unknown) => (value === true ? "1" : "0");
  return `${negotiationKey}|${flag(settings.consented)}${flag(settings.voice)}${flag(settings.listen)}`;
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
    isTieBlocked: (slug: string | undefined) => blockedByIds(slug, TIE_LIMIT_IDS, approvedIds),
    isFurnitureBlocked: (slug: string | undefined) =>
      blockedByIds(slug, FURNITURE_LIMIT_IDS, approvedIds),
  };
}
