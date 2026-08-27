/**
 * What this app is willing to transmit to the analysis provider.
 *
 * This is an operator setting, not a per-scene choice, because it is not a
 * question about any one batch: it is a question about what the provider's
 * acceptable-use policy permits to be sent. Whoever deploys the app reads that
 * policy and records the answer here once; nobody flips it mid-scene.
 *
 * It governs one thing — the upload — and has nothing to say about what anyone
 * photographs, keeps, or shares. The app cannot see any of that.
 *
 * Two limits are NOT configurable and never will be, because they are not the
 * provider's policy:
 *
 *  - Ambiguous or apparent-minor age is refused at every setting, as a
 *    required attestation, a search-side refusal, and passthrough of
 *    provider refusals — not as detection. The prompt forbids inferring age.
 *  - Secretly or coercively obtained media is refused at every setting,
 *    the same way: attestation, coercion-triage stop, search-side refusal.
 *    The app cannot detect either.
 *
 * Set with `VITE_MEDIA_UPLOAD_SCOPE`, via `.grok/app-env.json` in this
 * workspace or the provider's project environment when deployed.
 */
export type MediaUploadScope =
  /** Clothed and intimate-wear views only. The conservative default. */
  | "non_explicit"
  /** Adds full nudity of confirmed adults. Sexual activity stays out of scope. */
  | "adult_nudity";

export const MEDIA_UPLOAD_SCOPES: readonly MediaUploadScope[] = [
  "non_explicit",
  "adult_nudity",
];

/**
 * The setting an unconfigured deployment gets.
 *
 * Conservative on purpose: an operator who has not read the provider's policy
 * has not agreed to anything, and the failure mode of guessing wrong here is
 * the couple's intimate images sent somewhere the terms did not permit.
 */
export const DEFAULT_MEDIA_UPLOAD_SCOPE: MediaUploadScope = "non_explicit";

/** Coerce an untrusted setting value, falling back to the conservative default. */
export function parseMediaUploadScope(value: unknown): MediaUploadScope {
  if (typeof value !== "string") return DEFAULT_MEDIA_UPLOAD_SCOPE;
  const normalized = value.trim().toLowerCase();
  return (MEDIA_UPLOAD_SCOPES as readonly string[]).includes(normalized)
    ? (normalized as MediaUploadScope)
    : DEFAULT_MEDIA_UPLOAD_SCOPE;
}

/** Whether full nudity of confirmed adults may be transmitted. */
export function allowsAdultNudity(scope: MediaUploadScope): boolean {
  return scope === "adult_nudity";
}

function configuredScopeValue(): string | undefined {
  // Vite replaces this exact expression at build time, so it has to be written
  // out rather than aliased. Under node — tests, and any tooling that imports
  // this module — import.meta has no env at all, hence the guard.
  try {
    const fromVite = import.meta.env?.VITE_MEDIA_UPLOAD_SCOPE;
    if (typeof fromVite === "string") return fromVite;
  } catch {
    // No import.meta.env in this runtime.
  }
  try {
    return globalThis.process?.env?.VITE_MEDIA_UPLOAD_SCOPE;
  } catch {
    return undefined;
  }
}

/** The scope this build is configured for. */
export function mediaUploadScope(): MediaUploadScope {
  return parseMediaUploadScope(configuredScopeValue());
}

/**
 * The batch attestation wording for a scope.
 *
 * The two settings ask the operator to confirm different things, so the
 * checkbox has to say which one it is rather than describing a fixed rule.
 */
export function uploadScopeAttestation(scope: MediaUploadScope): string {
  return allowsAdultNudity(scope)
    ? "I confirm this batch is within upload scope: nudity of confirmed adults is in scope for this deployment; no sexual activity."
    : "I confirm this batch is within upload scope: lingerie or intimate wear is fine; no full nudity or sexual activity.";
}

/** One sentence describing what may be uploaded, for the capture panel. */
export function uploadScopeSummary(scope: MediaUploadScope): string {
  return allowsAdultNudity(scope)
    ? "Clothed, intimate-wear and nude views of consenting adults can be uploaded; sexual activity cannot."
    : "Clothed and intimate-wear views of consenting adults can be uploaded; full nudity and sexual activity cannot.";
}

/** Preferred framing for capture panels — privacy-minimizing and scope-aware. */
export function uploadScopeCapturePreference(scope: MediaUploadScope): string {
  return allowsAdultNudity(scope)
    ? "Prefer non-identifying stills; nude views of consenting adults are in upload scope when attested. Exclude faces, tattoos, screens, mail, and room details."
    : "Prefer equipment-only, non-identifying stills, and exclude faces, tattoos, screens, mail, and room details.";
}

/** Home hero line describing what may be sent for analysis. */
export function uploadScopeIntroLine(scope: MediaUploadScope): string {
  return allowsAdultNudity(scope)
    ? "Capture non-identifying stills within this deployment's upload scope (including nude views of consenting adults when attested)."
    : "Capture equipment-only or non-identifying stills within this deployment's upload scope.";
}

/** Consent-gate media preference line. */
export function uploadScopeGateLine(scope: MediaUploadScope): string {
  return allowsAdultNudity(scope)
    ? "Prefer non-identifying media. Nude views of consenting adults are in upload scope when each batch is attested; sexual activity is never in scope."
    : "Prefer equipment-only or non-identifying media within the clothed and intimate-wear upload scope.";
}

/** Settings readout for operators. */
export function uploadScopeSettingsDescription(scope: MediaUploadScope): string {
  return allowsAdultNudity(scope)
    ? "Adult nudity is in upload scope for confirmed adults. Sexual activity, ambiguous age, and secret or coerced media remain refused at every setting."
    : "Clothed and intimate-wear views only. Full nudity, sexual activity, ambiguous age, and secret or coerced media remain refused at every setting.";
}

/** Pre-scene checklist media line. */
export function uploadScopeChecklistLine(scope: MediaUploadScope): string {
  return allowsAdultNudity(scope)
    ? "If using media, adult/activity/recording/upload/output permissions and the attested upload scope (including nudity when confirmed) are current."
    : "If using media, adult/activity/recording/upload/output permissions and the non-explicit, non-secret upload scope are current.";
}

/** Login footer media line. */
export function uploadScopeLoginLine(scope: MediaUploadScope): string {
  return allowsAdultNudity(scope)
    ? "Use only separately consented, non-identifying media within this deployment's upload scope (nude views of confirmed adults when attested; sexual activity never in scope)."
    : "Use only separately consented, non-explicit, non-identifying media; clothed or intimate wear is within scope.";
}

/** Short label for settings and status surfaces. */
export function uploadScopeLabel(scope: MediaUploadScope): string {
  return allowsAdultNudity(scope) ? "Adult nudity" : "Non-explicit (clothed & intimate wear)";
}

/** Quality-hint framing noun phrase — never asks for a more intimate view. */
export function uploadScopeQualityFraming(scope: MediaUploadScope): string {
  return allowsAdultNudity(scope)
    ? "a non-identifying view with the relevant rope or restraint visible"
    : "an equipment-only or non-identifying view";
}
