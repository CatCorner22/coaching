import { normalizeNegotiationItems, type NegItem } from "@/lib/stores/negotiate";

const TIE_LIMIT_IDS: Readonly<Record<string, readonly string[]>> = {
  // The two guided restraint ties. Their cards promise "may go on a consenting
  // adult once its negotiated limit is agreed", but neither mapped to a limit,
  // so both were selectable in Studio — and taught in full on their own pages —
  // with every limit at no. A wrist or ankle cuff is exactly what the "cuffs"
  // row negotiates.
  "single-column": ["cuffs"],
  "double-column": ["cuffs"],
  "takate-kote": ["gote"],
  ebi: ["gote", "predicament"],
  "gyaku-ebi": ["gote", "predicament"],
  "hogtie-floor": ["predicament"],
  matanawa: ["crotch"],
  karada: ["torso"],
  shinju: ["torso"],
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
  // so an unresolved maybe on any one of them blocks it. Unoccupied prop drills
  // (`tasuki`, `hishi`, `kikkou`, `rope-corset`, and the rest) map to nothing
  // and stay open: they put rope on a dress form, never on a person, so a body
  // limit is not theirs to ask for.
  "kata-te-kote": ["gote"],
  "yoko-gote": ["gote"],
  teppou: ["arms"],
  strappado: ["arms"],
  "reverse-prayer": ["arms"],
  armbinder: ["arms"],
  "ushiro-te-shibari": ["arms"],
  "waki-shibari": ["arms", "torso"],
  munenawa: ["torso"],
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
 * The negotiation rows a tie's category touches. The tie page uses this to
 * gate a guided tie's taught steps behind the same limits Studio enforces,
 * and to say which rows are missing rather than just refusing.
 */
export function tieLimitIds(slug: string | undefined): readonly string[] {
  return slug ? (TIE_LIMIT_IDS[slug] ?? []) : [];
}

/**
 * The rows a tie still needs before its taught steps open, with labels for
 * saying so. Fail-closed on every edge: a maybe is not a yes, and a required
 * row missing from the list entirely (an unhydrated store, an edited list)
 * counts as missing rather than as approved.
 */
export function missingTieLimits(
  slug: string | undefined,
  items: readonly NegItem[],
): { id: string; label: string }[] {
  const required = tieLimitIds(slug);
  if (required.length === 0) return [];
  const byId = new Map(normalizeNegotiationItems(items).map((item) => [item.id, item]));
  return required
    .filter((id) => byId.get(id)?.rank !== "yes")
    .map((id) => ({ id, label: byId.get(id)?.label ?? id }));
}

/**
 * The rows a single taught step still needs, on top of its tie's own limit.
 * Karada negotiates `torso` and then teaches an optional pass between the legs,
 * which is what the `crotch` row is for; the step said so in prose while
 * nothing in the code checked it. Fail-closed the same way tie limits are.
 */
export function missingStepLimits(
  step: { limitIds?: readonly string[] } | undefined,
  items: readonly NegItem[],
): { id: string; label: string }[] {
  const required = step?.limitIds ?? [];
  if (required.length === 0) return [];
  const byId = new Map(normalizeNegotiationItems(items).map((item) => [item.id, item]));
  return required
    .filter((id) => byId.get(id)?.rank !== "yes")
    .map((id) => ({ id, label: byId.get(id)?.label ?? id }));
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

const RANK_PERMISSION: Readonly<Record<string, number>> = { no: 0, maybe: 1, yes: 2 };

type PolicyFlags = { consented?: boolean; voice?: boolean; listen?: boolean };

/**
 * Whether a policy change takes something away.
 *
 * Studio reloads itself when another tab changes the policy, which is right for
 * a revocation and wrong for an approval: approving a limit in the other tab —
 * exactly what a blocked tie's "This tie waits for a yes" invites — used to
 * reload a live scene, dropping the circulation-check countdown, the step and
 * any pending capture. A widening change needs no reload at all, because the
 * route re-derives its gating from the store on the next render.
 */
export function policyRestrictionIncreased(
  previous: readonly NegItem[],
  next: readonly NegItem[],
  previousFlags: PolicyFlags,
  nextFlags: PolicyFlags,
): boolean {
  const permission = (rank: string) => RANK_PERMISSION[rank] ?? 0;
  const before = new Map(
    normalizeNegotiationItems(previous).map((item) => [item.id, permission(item.rank)]),
  );
  for (const item of normalizeNegotiationItems(next)) {
    const was = before.get(item.id);
    if (was !== undefined && permission(item.rank) < was) return true;
  }
  // A row that disappeared entirely is a removal of whatever it allowed.
  const nextIds = new Set(normalizeNegotiationItems(next).map((item) => item.id));
  for (const [id, was] of before) if (was > 0 && !nextIds.has(id)) return true;
  return (["consented", "voice", "listen"] as const).some(
    (flag) => previousFlags[flag] === true && nextFlags[flag] !== true,
  );
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
