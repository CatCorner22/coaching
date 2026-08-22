import {
  SAFETY_SOURCE_IDS,
  SOURCE_LEDGER_REVISION,
  type SafetySourceId,
} from "@/lib/kb/sources";

export const CANONICAL_IDS = [
  "negotiation_materials_visible",
  "aftercare_materials_visible",
  "roleplay_or_power_exchange_context_possible",
  "rope_restraint_unspecified",
  "ground_or_surface_supported_restraint_possible",
  "rope_present_no_visible_load_path",
  "cuff_strap_or_wrap_restraint",
  "multiple_restraint_modalities",
  "positional_restraint_possible",
  "support_or_furniture_connection_possible",
  "lock_or_key_mechanism_connected_possible",
  "attending_adult_not_visible",
  "partial_load_bearing_possible",
  "off_ground_load_bearing_possible",
  "inverted_orientation",
  "transition_across_frames_possible",
  "load_path_component_visible",
  "fall_exposure_possible",
  "visual_sensory_restriction",
  "auditory_sensory_restriction",
  "mouth_covering_or_signal_limitation_possible",
  "impact_activity_context_possible",
  "temperature_source_context_possible",
  "pressure_device_context_possible",
  "balance_or_fall_demand_possible",
  "neck_or_airway_overlap_possible",
  "torso_breathing_restriction_possible",
  "fire_or_heat_edge_context_possible",
  "electrical_edge_context_possible",
  "needle_cutting_or_blood_context_possible",
  "weapon_context_possible",
  "chemical_or_intoxication_context_possible",
  "release_tool_like_object_visible",
  "phone_or_communication_device_visible",
  "first_aid_or_emergency_equipment_visible",
  "equipment_damage_like_feature",
  "unknown_object",
] as const;

export type CanonicalId = (typeof CANONICAL_IDS)[number];
export type ConsequenceBand =
  | "C1_lower_consequence_learning"
  | "C2_elevated"
  | "C3_high_consequence_instructor_only"
  | "C4_stop_or_decline";
export type EvidenceSource =
  | "single_frame_visual"
  | "multi_frame_visual"
  | "user_report"
  | "nonvisual_attestation";
export type EvidenceState = "observed" | "possible" | "unknown" | "not_assessed";
export type AbstainReason =
  | "not_applicable"
  | "insufficient_coverage"
  | "perspective_distortion"
  | "two_dimensional_overlap"
  | "chronology_unknown"
  | "ambiguous_object"
  | "nonvisual_fact"
  | "sensitive_view_required"
  | "out_of_scope";
export type ActionId =
  | "stop_now"
  | "do_not_proceed"
  | "pause_and_correct_while_unrestrained"
  | "obtain_lower_sensitivity_view"
  | "lower_consequence_only"
  | "qualified_instructor"
  | "prompt_medical_assessment"
  | "emergency_services"
  | "direct_nonvisual_check"
  | "no_action_from_image";
export type Disposition =
  | "stop_now"
  | "do_not_proceed"
  | "pause_and_correct"
  | "insufficient_view"
  | "lower_consequence_learning_only"
  | "no_visible_concern_not_clearance";
export type SourceId = SafetySourceId;
export type ModelStatus = "not_requested" | "completed" | "refused" | "unavailable" | "failed";
export type TriageState = "none" | "prompt_medical" | "emergency" | "coercion_or_secret_recording";

export type ObservationReport = {
  schema_version: "1.2";
  source_ledger_revision: typeof SOURCE_LEDGER_REVISION;
  report_type: "readiness" | "activity_recognition" | "urgent_alert" | "post_scene" | "instructor_handoff";
  media_mode: "static_photos" | "selected_video_stills" | "no_media";
  adult_status_confirmed: boolean;
  activity_consent_confirmed: boolean;
  recording_consent_confirmed: boolean;
  upload_consent_confirmed: boolean;
  output_consent_confirmed: boolean;
  urgent_stop: boolean;
  disposition: Disposition;
  media_quality: {
    focus: "adequate" | "soft" | "unusable" | "not_applicable";
    lighting: "adequate" | "shadowed" | "color_cast" | "unusable" | "not_applicable";
    coverage: "full_relevant_area" | "partial" | "obscured" | "not_applicable";
    angle: "useful" | "foreshortened" | "panoramic_or_fisheye" | "unknown" | "not_applicable";
    scale: "contextual" | "close_up_without_context" | "unknown" | "not_applicable";
    occlusion: "none_material" | "material" | "unknown" | "not_applicable";
    chronology: "user_labeled" | "unknown" | "not_applicable";
    transformations: "none_reported" | "user_reported" | "unknown" | "not_applicable";
    usable_for_requested_conclusion: boolean;
  };
  recognized_categories: Array<{
    canonical_id: CanonicalId;
    evidence_source: EvidenceSource;
    evidence_state: EvidenceState;
    consequence_band: ConsequenceBand;
    visible_discriminators: string[];
    confounders_considered: string[];
    abstain_reason: AbstainReason;
  }>;
  observations: Array<{
    frame_id: string;
    visible_fact: string;
    visibility: "clear" | "partial" | "obscured" | "not_shown";
    confidence: "high" | "moderate" | "low" | "abstain";
    why_it_matters: string;
    action_id: ActionId;
  }>;
  nonvisual_checks: string[];
  limitations: string[];
  escalation: {
    level: "none" | "prompt_medical_assessment" | "emergency_services";
    reason: string;
  };
  next_step_id: ActionId;
  source_ids: SourceId[];
};

export type ModelCategoryMatch = { frame_id: string; canonical_id: CanonicalId };

export type ObservationValidationContext = {
  /** Canonical frame IDs that were actually present in the submitted batch. */
  allowedFrameIds?: readonly string[];
};

type CategoryMeta = { label: string; feature: string; confounders: [string, ...string[]] };

const META: Record<CanonicalId, CategoryMeta> = {
  negotiation_materials_visible: meta("Negotiation materials", "A checklist, boundary card, or stop-signal aid may be visible.", "Generic notes or props"),
  aftercare_materials_visible: meta("Aftercare materials", "Water, a blanket, a debrief card, or another comfort item may be visible.", "Ordinary household items"),
  roleplay_or_power_exchange_context_possible: meta("Roleplay or power-exchange context", "Role-like symbols or staging may be visible.", "Costume, theater, fashion, or photography"),
  rope_restraint_unspecified: meta("Unspecified rope restraint", "Rope-like material may encircle or connect visible regions or equipment.", "Clothing trim, lingerie or garment strap, lace or elastic edge, cable, hair, decorative cord, or a skin crease"),
  ground_or_surface_supported_restraint_possible: meta("Surface-supported restraint", "A surface and restraint-like material may appear in the same view.", "Hidden loading, cropped support, or forced perspective"),
  rope_present_no_visible_load_path: meta("Rope with no visible load path", "Rope-like material may be visible without a load path in the supplied crop.", "Unseen attachment, crop, or rear routing"),
  cuff_strap_or_wrap_restraint: meta("Cuff, strap, or wrap restraint", "A cuff-, strap-, tape-, belt-, or wrap-like item may encircle or connect visible regions.", "Clothing, lingerie or garter strap, waistband, watch band or jewelry, medical support, or sports equipment"),
  multiple_restraint_modalities: meta("Multiple restraint modalities", "More than one restraint-medium class may be visible.", "Decorative accessories, lingerie or garment straps, or one ambiguous class"),
  positional_restraint_possible: meta("Positional restraint", "Visible connections may coincide with a maintained body configuration.", "Voluntary pose, exercise, dance, or hidden support"),
  support_or_furniture_connection_possible: meta("Support or furniture connection", "Restraint-like material may connect to a support-like object.", "Exercise, medical, photography, or theatrical equipment"),
  lock_or_key_mechanism_connected_possible: meta("Connected lock or key mechanism", "A lock- or key-like object may connect to restraint-like equipment.", "Jewelry, cosmetic fastener, or prop"),
  attending_adult_not_visible: meta("Attending adult not visible", "No second adult appears within the supplied field of view.", "An attendant may be outside the crop or behind the camera"),
  partial_load_bearing_possible: meta("Possible partial load bearing", "Surface contact and one or more lines toward a possible load path may be visible.", "Slack line, theatrical support, or hidden furniture"),
  off_ground_load_bearing_possible: meta("Possible off-ground load bearing", "No support contact may be visible while lines extend toward a possible load path.", "Hidden support, camera rotation, or staged motion"),
  inverted_orientation: meta("Inverted orientation", "The head may appear lower than the torso in an apparently oriented view.", "Rotated camera, reclining, or side-lying pose"),
  transition_across_frames_possible: meta("Possible transition across frames", "User-labeled frames may show a configuration change involving a possible load path.", "Gallery order, unrelated frames, or camera movement"),
  load_path_component_visible: meta("Load-path-like component", "A beam-, ring-, line-, stand-, or connector-like component may connect to a line.", "Gym, climbing, lighting, or household hardware"),
  fall_exposure_possible: meta("Possible fall exposure", "Apparent elevation or proximity to an edge may be visible.", "Camera tilt, hidden floor, or scale ambiguity"),
  visual_sensory_restriction: meta("Visual sensory restriction", "An item may visibly cover both eyes.", "Sleep mask, costume, or protective equipment"),
  auditory_sensory_restriction: meta("Auditory sensory restriction", "An ear-covering device may be visible.", "Headphones, hearing aids, or protective equipment"),
  mouth_covering_or_signal_limitation_possible: meta("Possible mouth covering or signal limitation", "An item may visually overlap the mouth region.", "Costume, medical item, or perspective"),
  impact_activity_context_possible: meta("Impact activity context", "An impact-implement-like object may appear in the supplied context.", "Sports, cleaning, costume, or theatrical prop"),
  temperature_source_context_possible: meta("Temperature-source context", "An ice-, wax-, or temperature-device-like object may appear in context.", "Food, spa items, an ordinary candle, or household device"),
  pressure_device_context_possible: meta("Pressure-device context", "A device-like object may visibly contact a non-intimate region.", "Jewelry, medical clip, garter or lingerie clasp, or clothing fastener"),
  balance_or_fall_demand_possible: meta("Possible balance or fall demand", "Posture or support may appear position-dependent.", "Yoga, exercise, dance, or staged performance"),
  neck_or_airway_overlap_possible: meta("Possible neck or airway overlap", "Material or an object may visually overlap a neck, throat, mouth, or nose region.", "Perspective, clothing, necklace or choker-style jewelry, or medical equipment"),
  torso_breathing_restriction_possible: meta("Possible torso breathing restriction", "Restraint-like material may cross the chest or abdomen in a concerning pattern.", "Clothing, bra band or lingerie edge, posture, or two-dimensional overlap"),
  fire_or_heat_edge_context_possible: meta("Fire or active-heat context", "A flame-, heated-tool-, or active-heat-like source may be visible.", "Ordinary candle, cooking, or theatrical prop"),
  electrical_edge_context_possible: meta("Electrical edge context", "Electrode-, lead-, or electrical-device-like equipment may be visible.", "Medical, exercise, audio, or household equipment"),
  needle_cutting_or_blood_context_possible: meta("Needle, cutting, or blood context", "A sharp-tool-, needle-, cutting-, or blood-like feature may be visible.", "Medical care, craft tools, makeup, or prop"),
  weapon_context_possible: meta("Weapon-like context", "A weapon-like object may be visible.", "Tool, costume, replica, or prop"),
  chemical_or_intoxication_context_possible: meta("Chemical or intoxication context", "A substance container or delivery item may appear in the supplied context.", "Medication, beverage, or household product"),
  release_tool_like_object_visible: meta("Release-tool-like object", "A cutter-, shear-, or scissor-like object may be visible.", "Prop, ordinary scissors, or unrelated tool"),
  phone_or_communication_device_visible: meta("Communication-device-like object", "A phone-, radio-, or communication-device-like object may be visible.", "Remote, case, or prop"),
  first_aid_or_emergency_equipment_visible: meta("First-aid or emergency equipment", "A labeled first-aid or emergency item may be visible.", "Storage pouch, cosmetic kit, or prop"),
  equipment_damage_like_feature: meta("Equipment-damage-like feature", "A discontinuity, deformation, fray-like texture, or crack-like feature may be visible.", "Seam, glare, compression artifact, or normal texture"),
  unknown_object: meta("Unknown object", "An object-like region may be visible, but no supported broad class was established.", "Occlusion, blur, unusual equipment, or an ordinary object"),
};

const C1 = new Set<CanonicalId>([
  "negotiation_materials_visible",
  "aftercare_materials_visible",
  "release_tool_like_object_visible",
  "phone_or_communication_device_visible",
  "first_aid_or_emergency_equipment_visible",
]);
const C3 = new Set<CanonicalId>([
  "partial_load_bearing_possible",
  "off_ground_load_bearing_possible",
  "inverted_orientation",
  "transition_across_frames_possible",
  "load_path_component_visible",
  "fall_exposure_possible",
  "balance_or_fall_demand_possible",
]);
const C4 = new Set<CanonicalId>([
  "mouth_covering_or_signal_limitation_possible",
  "neck_or_airway_overlap_possible",
  "torso_breathing_restriction_possible",
  "fire_or_heat_edge_context_possible",
  "electrical_edge_context_possible",
  "needle_cutting_or_blood_context_possible",
  "weapon_context_possible",
  "chemical_or_intoxication_context_possible",
]);
const TWO_DIMENSIONAL = new Set<CanonicalId>([
  "mouth_covering_or_signal_limitation_possible",
  "neck_or_airway_overlap_possible",
  "torso_breathing_restriction_possible",
  "ground_or_surface_supported_restraint_possible",
  "positional_restraint_possible",
]);

function meta(label: string, feature: string, confounder: string): CategoryMeta {
  return { label, feature, confounders: [confounder, "Crop, occlusion, lighting, and camera perspective"] };
}

export function consequenceFloor(id: CanonicalId): ConsequenceBand {
  if (C4.has(id)) return "C4_stop_or_decline";
  if (C3.has(id)) return "C3_high_consequence_instructor_only";
  if (C1.has(id)) return "C1_lower_consequence_learning";
  return "C2_elevated";
}

export function isHighConsequence(id: CanonicalId): boolean {
  const band = consequenceFloor(id);
  return band === "C3_high_consequence_instructor_only" || band === "C4_stop_or_decline";
}

/**
 * Admit only closed, batch-bound remote categories. A model that self-flags a
 * prohibited inference must not erase a C3/C4 observation; high-consequence
 * matches with a junk frame label are conservatively rebound to the batch.
 */
export function admitRemoteCategories(
  matches: ReadonlyArray<{ frame_id?: unknown; canonical_id?: unknown }>,
  allowedFrameIds: readonly string[],
  audit: {
    nonvisual_inference: boolean;
    exact_identification: boolean;
    procedural_content: boolean;
  },
): {
  matches: ModelCategoryMatch[];
  hardLimit: boolean;
  modelStatus: Extract<ModelStatus, "completed" | "failed">;
} {
  const allowed = allowedFrameIds.filter((id) => /^F0[1-3]$/.test(id));
  const fallback = allowed[0] ?? "F01";
  const bound: ModelCategoryMatch[] = [];
  const seen = new Set<string>();
  for (const raw of matches) {
    if (!isCanonicalId(raw.canonical_id)) continue;
    const requested = typeof raw.frame_id === "string" ? raw.frame_id : "";
    const frameId = allowed.includes(requested)
      ? requested
      : isHighConsequence(raw.canonical_id)
        ? fallback
        : "";
    if (!frameId) continue;
    const key = `${frameId}:${raw.canonical_id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    bound.push({ frame_id: frameId, canonical_id: raw.canonical_id });
  }
  const disallowed =
    audit.nonvisual_inference || audit.exact_identification || audit.procedural_content;
  if (!disallowed) return { matches: bound, hardLimit: false, modelStatus: "completed" };
  const critical = bound.filter((match) => isHighConsequence(match.canonical_id));
  return {
    matches: critical,
    hardLimit: true,
    modelStatus: "failed",
  };
}

const CONSEQUENCE_RANK: Record<ConsequenceBand, number> = {
  C1_lower_consequence_learning: 1,
  C2_elevated: 2,
  C3_high_consequence_instructor_only: 3,
  C4_stop_or_decline: 4,
};

/** Preserve the ontology floor but emit at least C2 without separate readiness attestations. */
function consequenceBandForReport(id: CanonicalId): ConsequenceBand {
  const floor = consequenceFloor(id);
  return floor === "C1_lower_consequence_learning" ? "C2_elevated" : floor;
}

export function isCanonicalId(value: unknown): value is CanonicalId {
  return typeof value === "string" && (CANONICAL_IDS as readonly string[]).includes(value);
}

export function normalizeFrameId(value: string | undefined, index: number): string {
  const match = String(value ?? "").match(/^F(0[1-3])$/i);
  const fallback = Math.max(1, Math.min(3, Math.floor(index) + 1));
  return match ? `F${match[1]}` : `F${String(fallback).padStart(2, "0")}`;
}

export function buildObservationReport(options: {
  mediaMode: "static_photos" | "selected_video_stills" | "no_media";
  consent?: {
    adults: boolean;
    activity: boolean;
    recording: boolean;
    upload: boolean;
    output: boolean;
  };
  quality?: { sharpness: number; exposure: number; score: number } | null;
  matches?: ModelCategoryMatch[];
  allowedFrameIds?: string[];
  modelStatus: ModelStatus;
  triage?: TriageState;
  /** A closed rule forbade trusting the full remote output. */
  hardLimit?: boolean;
}): ObservationReport {
  const triage = options.triage ?? "none";
  const consent = options.consent ?? {
    adults: false,
    activity: false,
    recording: false,
    upload: false,
    output: false,
  };
  // A direct triage concern bypasses visual analysis even if a hostile or stale
  // client includes media. Represent that action-only result as no_media.
  const mediaMode = triage === "none" ? options.mediaMode : "no_media";
  const mediaQuality = qualityFor(mediaMode, options.quality ?? null);
  const allowedFrameIds =
    mediaMode === "no_media"
      ? []
      : normalizeAllowedFrameIds(options.allowedFrameIds, options.matches ?? []);
  const matches =
    triage === "none" && mediaMode !== "no_media"
      ? normalizeMatches(options.matches ?? [], allowedFrameIds)
      : [];
  const categories = buildCategories(matches);
  const highest = highestBand(categories.map((category) => category.consequence_band));
  const triageStop = triage === "emergency" || triage === "coercion_or_secret_recording";
  const urgentStop = triageStop || highest === "C4_stop_or_decline";
  const hasC3 = highest === "C3_high_consequence_instructor_only";
  const modelUnavailable = options.modelStatus !== "completed";
  const permissionsComplete =
    consent.adults && consent.activity && consent.recording && consent.upload && consent.output;

  let disposition: Disposition = "lower_consequence_learning_only";
  let nextStep: ActionId = "lower_consequence_only";
  let escalation: ObservationReport["escalation"] = {
    level: "none",
    reason: "No medical conclusion is made from the image. Escalate based on directly reported symptoms or events.",
  };
  if (triage === "emergency") {
    disposition = "stop_now";
    nextStep = "emergency_services";
    escalation = {
      level: "emergency_services",
      reason: "An urgent symptom or event was reported directly; image appearance cannot reduce that response.",
    };
  } else if (triage === "prompt_medical") {
    disposition = "do_not_proceed";
    nextStep = "prompt_medical_assessment";
    escalation = {
      level: "prompt_medical_assessment",
      reason: "A persistent or worsening symptom after release was reported directly; do not re-tie or delay assessment for an image.",
    };
  } else if (triage === "coercion_or_secret_recording") {
    // This is an immediate stop to the activity and recording. The closed
    // next-step action still communicates that no analysis may proceed.
    disposition = "stop_now";
    nextStep = "stop_now";
    escalation = {
      level: "none",
      reason: "Current voluntary activity, recording, upload, and output permission were not all confirmed. No analysis is permitted.",
    };
  } else if (urgentStop) {
    disposition = "stop_now";
    nextStep = "stop_now";
  } else if (hasC3) {
    disposition = "do_not_proceed";
    nextStep = "qualified_instructor";
  } else if (mediaMode !== "no_media" && !permissionsComplete) {
    disposition = "do_not_proceed";
    nextStep = "do_not_proceed";
  } else if (options.hardLimit) {
    disposition = "do_not_proceed";
    nextStep = "do_not_proceed";
  } else if (mediaMode !== "no_media" && !mediaQuality.usable_for_requested_conclusion) {
    disposition = "insufficient_view";
    nextStep = "lower_consequence_only";
  } else if (modelUnavailable || categories.some((category) => category.canonical_id === "unknown_object")) {
    disposition = "insufficient_view";
    nextStep = "lower_consequence_only";
  }

  const sourceIds = sourcesFor(categories, triage, mediaMode);
  const report: ObservationReport = {
    schema_version: "1.2",
    source_ledger_revision: SOURCE_LEDGER_REVISION,
    report_type: urgentStop ? "urgent_alert" : triage === "prompt_medical" ? "post_scene" : "activity_recognition",
    media_mode: mediaMode,
    // This combined stop route includes unclear legal-adult status as well as
    // coercion, secret recording, or revoked permission. Because the selected
    // reason is intentionally not narrowed further, do not preserve an earlier
    // adult-status attestation as if the ambiguity had been resolved.
    adult_status_confirmed: triage === "coercion_or_secret_recording" ? false : consent.adults,
    activity_consent_confirmed: triage === "coercion_or_secret_recording" ? false : consent.activity,
    recording_consent_confirmed: triage === "coercion_or_secret_recording" ? false : consent.recording,
    upload_consent_confirmed: triage === "coercion_or_secret_recording" ? false : consent.upload,
    output_consent_confirmed: triage === "coercion_or_secret_recording" ? false : consent.output,
    urgent_stop: urgentStop,
    disposition,
    media_quality: mediaQuality,
    recognized_categories: categories,
    observations: triage === "none" ? observationsFor(matches, mediaQuality) : [],
    nonvisual_checks: nonvisualChecksFor(triage),
    limitations: limitationsFor(options.modelStatus, mediaMode, options.hardLimit === true),
    escalation,
    next_step_id: nextStep,
    source_ids: sourceIds,
  };
  const validation = validateObservationReport(report, { allowedFrameIds });
  if (!validation.success) {
    throw new Error(`Observation report invariant failed: ${validation.issues.join("; ")}`);
  }
  return report;
}

function qualityFor(
  mode: ObservationReport["media_mode"],
  quality: { sharpness: number; exposure: number; score: number } | null,
): ObservationReport["media_quality"] {
  if (mode === "no_media") {
    return {
      focus: "not_applicable",
      lighting: "not_applicable",
      coverage: "not_applicable",
      angle: "not_applicable",
      scale: "not_applicable",
      occlusion: "not_applicable",
      chronology: "not_applicable",
      transformations: "not_applicable",
      usable_for_requested_conclusion: false,
    };
  }
  const sharpness = finite01(quality?.sharpness);
  const exposure = finite01(quality?.exposure);
  return {
    focus: quality === null ? "unusable" : sharpness >= 0.55 ? "adequate" : sharpness >= 0.25 ? "soft" : "unusable",
    lighting: quality === null ? "unusable" : exposure >= 0.55 ? "adequate" : exposure >= 0.25 ? "shadowed" : "unusable",
    coverage: "partial",
    angle: "unknown",
    scale: "unknown",
    occlusion: "unknown",
    // F01/F02 are generated by the app, not chronology supplied by the user.
    chronology: "unknown",
    transformations: "unknown",
    // This flag addresses only the requested broad visual-category conclusion.
    // It never means the media is usable for consent, physiology, technique, or safety.
    // Technical usability is independent of the rope-color ranking hint folded
    // into `score`. A clear frame of first-aid supplies, a release tool, or
    // another supported non-rope category must not become unusable merely
    // because little rope-like color is present.
    usable_for_requested_conclusion: quality !== null && sharpness >= 0.55 && exposure >= 0.55,
  };
}

function finite01(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(1, number)) : 0;
}

function normalizeAllowedFrameIds(
  frameIds: readonly string[] | undefined,
  matches: readonly ModelCategoryMatch[],
): string[] {
  // Submitted images are canonicalized by their bounded batch position. Raw
  // clip labels may be sparse (for example F02 and F05 after user selection)
  // and must not collapse onto the same report frame ID.
  const normalized = frameIds?.length
    ? frameIds.slice(0, 3).map((_, index) => `F${String(index + 1).padStart(2, "0")}`)
    : matches.length
      ? matches.slice(0, 3).map((match, index) => normalizeFrameId(match.frame_id, index))
      : ["F01"];
  return [...new Set(normalized)];
}

function normalizeMatches(matches: ModelCategoryMatch[], allowedFrameIds: readonly string[]): ModelCategoryMatch[] {
  const allowed = new Set(allowedFrameIds);
  const seen = new Set<string>();
  const output: ModelCategoryMatch[] = [];
  for (const [index, match] of matches.slice(0, 12).entries()) {
    if (!isCanonicalId(match?.canonical_id)) continue;
    // The capture flow assigns frame labels but never receives user-attested
    // chronology. A transition label therefore cannot satisfy its ontology
    // discriminator and is replaced by a per-frame abstention below.
    if (match.canonical_id === "transition_across_frames_possible") continue;
    const frameId = normalizeFrameId(match?.frame_id, index);
    if (!allowed.has(frameId)) continue;
    const key = `${frameId}:${match.canonical_id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push({ frame_id: frameId, canonical_id: match.canonical_id });
  }

  const bounded = output;
  const framesWithMatch = new Set(bounded.map((match) => match.frame_id));
  for (const frameId of allowedFrameIds) {
    if (!framesWithMatch.has(frameId)) bounded.push({ frame_id: frameId, canonical_id: "unknown_object" });
  }
  return bounded.length ? bounded : [{ frame_id: "F01", canonical_id: "unknown_object" }];
}

function buildCategories(matches: ModelCategoryMatch[]): ObservationReport["recognized_categories"] {
  const byId = new Map<CanonicalId, ModelCategoryMatch[]>();
  for (const match of matches) {
    byId.set(match.canonical_id, [...(byId.get(match.canonical_id) ?? []), match]);
  }
  return [...byId.entries()].map(([id, entries]) => {
    const metadata = META[id];
    const unknown = id === "unknown_object";
    const multipleFrames = new Set(entries.map((entry) => entry.frame_id)).size > 1;
    return {
      canonical_id: id,
      evidence_source: multipleFrames ? "multi_frame_visual" : "single_frame_visual",
      evidence_state: unknown ? "unknown" : "possible",
      consequence_band: consequenceBandForReport(id),
      // The remote result contains only a category ID. Do not synthesize a
      // pixel-level discriminator that was never returned or locally verified.
      visible_discriminators: [],
      confounders_considered: [...metadata.confounders],
      abstain_reason: unknown
        ? "ambiguous_object"
        : id === "transition_across_frames_possible"
          ? "chronology_unknown"
          : TWO_DIMENSIONAL.has(id)
            ? "two_dimensional_overlap"
            : "ambiguous_object",
    };
  });
}

function observationsFor(
  matches: ModelCategoryMatch[],
  quality: ObservationReport["media_quality"],
): ObservationReport["observations"] {
  // normalizeMatches already bounds remote matches; include any per-frame
  // unknown abstentions it adds so every emitted category stays evidenced.
  return matches.map((match) => {
    const band = consequenceBandForReport(match.canonical_id);
    return {
      frame_id: match.frame_id,
      visible_fact: visibleFactFor(match.canonical_id),
      visibility:
        quality.focus === "unusable" || quality.lighting === "unusable" ? "obscured" : "partial",
      confidence:
        !quality.usable_for_requested_conclusion || match.canonical_id === "unknown_object"
          ? "abstain"
          : "low",
      why_it_matters: `${band} is a consequence floor, not a probability estimate or safety clearance.`,
      action_id: actionForBand(band),
    };
  });
}

function visibleFactFor(id: CanonicalId): string {
  if (id === "unknown_object") return "No supported broad object class was established from this frame.";
  return `No independently verified pixel-level discriminator was recorded for the possible ${META[id].label.toLowerCase()} match.`;
}

const VISIBLE_FACT_CATEGORY = new Map<string, CanonicalId>(
  CANONICAL_IDS.map((id) => [visibleFactFor(id), id]),
);

function actionForBand(band: ConsequenceBand): ActionId {
  if (band === "C4_stop_or_decline") return "stop_now";
  if (band === "C3_high_consequence_instructor_only") return "qualified_instructor";
  if (band === "C2_elevated") return "lower_consequence_only";
  return "no_action_from_image";
}

function highestBand(bands: ConsequenceBand[]): ConsequenceBand {
  return bands.reduce<ConsequenceBand>(
    (highest, band) => (CONSEQUENCE_RANK[band] > CONSEQUENCE_RANK[highest] ? band : highest),
    "C1_lower_consequence_learning",
  );
}

function nonvisualChecksFor(triage: TriageState): string[] {
  if (triage === "emergency") {
    return [
      "Release restraint now without creating a fall and call local emergency services.",
      "Follow dispatcher instructions; give CPR, AED care, or first aid only within current training.",
      "Do not delay care for another image or a normal-looking photo.",
    ];
  }
  if (triage === "prompt_medical") {
    return [
      "Do not re-tie. Seek prompt medical assessment for the persistent or worsening symptom reported after release.",
      "Use emergency services if abnormal breathing, unresponsiveness, seizure, chest pain, a serious fall, major weakness, or stroke-like signs develop.",
    ];
  }
  if (triage === "coercion_or_secret_recording") {
    return [
      "Stop the activity and recording. Do not upload or produce an image report without current, voluntary, specific permission from every depicted adult.",
      "Prioritize immediate personal safety and contact a trusted local resource or emergency service if anyone is in danger.",
    ];
  }
  return [
    "Confirm current, specific, revocable consent directly; an image cannot establish it.",
    "Ask directly about sensation, movement, breathing or speech change, pain, distress, and release readiness; release for any concern or uncertainty.",
    "Confirm continuous adult attendance and an immediately accessible, rehearsed release plan outside the image.",
  ];
}

function limitationsFor(
  status: ModelStatus,
  mode: ObservationReport["media_mode"],
  hardLimit: boolean,
): string[] {
  if (mode === "no_media") {
    return [
      "No media was analyzed; this report reflects only the selected action-first triage path and cannot determine cause, severity, consent, physiology, injury, or future condition.",
      "Use direct assessment and the stated emergency or consent response. Do not delay care or treat this no-media report as a visual finding or clearance.",
    ];
  }
  const limitations = [
    "Images cannot establish legal age, consent, capacity, comfort, pain, sensation, nerve function, circulation, breathing adequacy, pressure, force, load, duration, injury, or future condition.",
    "The report cannot validate an exact knot, tie, harness, placement, construction, material, anchor, rating, technique, instructor qualification, or safety.",
    "Broad category matches are unvalidated and may contain false positives or false negatives; no visible concern is never an all-clear.",
  ];
  limitations.push("The app resized and re-encoded the selected stills; crop, lighting, perspective, occlusion, and unknown prior edits can change appearance.");
  if (hardLimit) {
    limitations.unshift(
      "Remote visual classification violated the closed output contract. Only any conservative high-consequence match was retained; do not proceed from the remaining output.",
    );
  } else if (status !== "completed") {
    limitations.push(
      "Remote visual classification did not complete; this is an insufficient-view, lower-consequence-only report.",
    );
  }
  return limitations;
}

function sourcesFor(
  categories: ObservationReport["recognized_categories"],
  triage: TriageState,
  mediaMode: ObservationReport["media_mode"],
): SourceId[] {
  const sources = new Set<SourceId>(["CONSENT-2"]);
  if (mediaMode !== "no_media") {
    sources.add("XAI-VISION-1");
    sources.add("XAI-VISION-2");
    sources.add("XAI-MODEL-1");
    sources.add("XAI-STRUCTURE-1");
    sources.add("XAI-PRIVACY-1");
    sources.add("XAI-TERMS-1");
  }
  if (mediaMode === "selected_video_stills") sources.add("XAI-VIDEO-1");
  if (categories.some((category) => category.canonical_id.includes("rope") || category.canonical_id.includes("load"))) {
    sources.add("ROPE-1");
  }
  if (
    categories.some((category) =>
      [
        "neck_or_airway_overlap_possible",
        "torso_breathing_restriction_possible",
        "mouth_covering_or_signal_limitation_possible",
      ].includes(category.canonical_id),
    )
  ) {
    sources.add("NFS-1");
  }
  if (triage === "emergency" || triage === "prompt_medical") sources.add("FIRSTAID-1");
  return [...sources];
}

const REQUIRED_KEYS = [
  "schema_version",
  "source_ledger_revision",
  "report_type",
  "media_mode",
  "adult_status_confirmed",
  "activity_consent_confirmed",
  "recording_consent_confirmed",
  "upload_consent_confirmed",
  "output_consent_confirmed",
  "urgent_stop",
  "disposition",
  "media_quality",
  "recognized_categories",
  "observations",
  "nonvisual_checks",
  "limitations",
  "escalation",
  "next_step_id",
  "source_ids",
] as const;

/** Runtime guard for the security-sensitive invariants beyond TypeScript. */
export function validateObservationReport(
  value: unknown,
  context: ObservationValidationContext = {},
): { success: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { success: false, issues: ["report must be an object"] };
  }
  const report = value as Partial<ObservationReport> & Record<string, unknown>;
  const keys = Object.keys(report).sort();
  const expected = [...REQUIRED_KEYS].sort();
  if (keys.length !== expected.length || keys.some((key, index) => key !== expected[index])) {
    issues.push("top-level keys do not match schema 1.2");
  }
  if (report.schema_version !== "1.2") issues.push("schema_version must be 1.2");
  if (report.source_ledger_revision !== SOURCE_LEDGER_REVISION) {
    issues.push("source_ledger_revision must match the current ledger");
  }
  if (!REPORT_TYPES.has(report.report_type as ObservationReport["report_type"])) issues.push("invalid report_type");
  if (!MEDIA_MODES.has(report.media_mode as ObservationReport["media_mode"])) issues.push("invalid media_mode");
  for (const key of CONSENT_BOOLEAN_KEYS) {
    if (typeof report[key] !== "boolean") issues.push(`${key} must be boolean`);
  }
  if (typeof report.urgent_stop !== "boolean") issues.push("urgent_stop must be boolean");
  if (!DISPOSITIONS.has(report.disposition as Disposition)) issues.push("invalid disposition");
  if (!isStringArray(report.limitations) || report.limitations.length < 1) issues.push("limitations are required strings");
  if (!isStringArray(report.nonvisual_checks) || report.nonvisual_checks.length < 1) issues.push("nonvisual_checks are required strings");
  if (
    !Array.isArray(report.source_ids) ||
    report.source_ids.length < 1 ||
    report.source_ids.some((source) => !SOURCE_IDS.has(source))
  ) issues.push("source_ids are required canonical values");
  if (Array.isArray(report.source_ids) && new Set(report.source_ids).size !== report.source_ids.length) {
    issues.push("source_ids must not contain duplicates");
  }
  if (!ACTIONS.has(report.next_step_id as ActionId)) issues.push("invalid next_step_id");
  validateMediaQuality(report.media_quality, issues);
  validateEscalation(report.escalation, issues);
  if (!Array.isArray(report.recognized_categories)) {
    issues.push("recognized_categories must be an array");
  } else {
    if (report.media_mode !== "no_media" && report.recognized_categories.length < 1) {
      issues.push("media reports require at least one recognized or unknown category");
    }
    const seenCanonicalIds = new Set<CanonicalId>();
    for (const category of report.recognized_categories) {
      if (!hasExactKeys(category, CATEGORY_KEYS)) issues.push("category keys do not match schema");
      if (!isCanonicalId(category?.canonical_id)) {
        issues.push("invented canonical_id");
        continue;
      }
      if (seenCanonicalIds.has(category.canonical_id)) issues.push("duplicate canonical_id");
      seenCanonicalIds.add(category.canonical_id);
      if (!EVIDENCE_SOURCES.has(category.evidence_source)) issues.push("invalid evidence_source");
      if (!EVIDENCE_STATES.has(category.evidence_state)) issues.push("invalid evidence_state");
      if (!CONSEQUENCE_BANDS.has(category.consequence_band)) issues.push("invalid consequence_band");
      if (!ABSTAIN_REASONS.has(category.abstain_reason)) issues.push("invalid abstain_reason");
      if (!isStringArray(category.visible_discriminators)) issues.push("visible_discriminators must be strings");
      if (
        CONSEQUENCE_RANK[category.consequence_band] <
        CONSEQUENCE_RANK[consequenceBandForReport(category.canonical_id)]
      ) {
        issues.push(`under-banded category: ${category.canonical_id}`);
      }
      if (
        isStringArray(category.visible_discriminators) &&
        new Set(category.visible_discriminators).size !== category.visible_discriminators.length
      ) issues.push("visible_discriminators must not contain duplicates");
      if (
        category.evidence_state === "observed" &&
        category.evidence_source !== "single_frame_visual" &&
        category.evidence_source !== "multi_frame_visual"
      ) {
        issues.push("nonvisual evidence cannot be observed");
      }
      if (
        category.evidence_state !== "observed" &&
        category.abstain_reason === "not_applicable"
      ) {
        issues.push("uncertain evidence requires an abstain reason");
      }
      if (category.evidence_state === "observed" && category.abstain_reason !== "not_applicable") {
        issues.push("observed evidence requires abstain_reason not_applicable");
      }
      if (
        category.evidence_state === "observed" &&
        (!Array.isArray(category.visible_discriminators) || category.visible_discriminators.length < 1)
      ) {
        issues.push("observed evidence requires at least one visible discriminator");
      }
      if (!isStringArray(category.confounders_considered) || category.confounders_considered.length < 1) {
        issues.push("each category requires confounders");
      }
      if (
        isStringArray(category.confounders_considered) &&
        new Set(category.confounders_considered).size !== category.confounders_considered.length
      ) issues.push("confounders must not contain duplicates");
      if (category.evidence_state === "not_assessed" && category.abstain_reason !== "out_of_scope") {
        issues.push("not_assessed evidence requires out_of_scope abstention");
      }
      if (
        category.canonical_id === "transition_across_frames_possible" &&
        report.media_quality?.chronology !== "user_labeled"
      ) {
        issues.push("transition evidence requires user-labeled chronology");
      }
    }
  }
  if (!Array.isArray(report.observations)) {
    issues.push("observations must be an array");
  } else {
    if (report.media_mode !== "no_media" && report.observations.length < 1) {
      issues.push("media reports require at least one observation or abstention");
    }
    const categoriesById = new Map<CanonicalId, ObservationReport["recognized_categories"][number]>();
    if (Array.isArray(report.recognized_categories)) {
      for (const category of report.recognized_categories) {
        if (isCanonicalId(category?.canonical_id)) categoriesById.set(category.canonical_id, category);
      }
    }
    const observationFramesByCategory = new Map<CanonicalId, Set<string>>();
    const allowedFrames = new Set(
      (context.allowedFrameIds ?? []).filter((frameId): frameId is string => /^F0[1-3]$/.test(frameId)),
    );
    for (const observation of report.observations) {
      if (!hasExactKeys(observation, OBSERVATION_KEYS)) issues.push("observation keys do not match schema");
      if (typeof observation?.frame_id !== "string" || !/^F0[1-3]$/.test(observation.frame_id)) issues.push("invalid frame_id");
      if (allowedFrames.size > 0 && !allowedFrames.has(observation?.frame_id)) {
        issues.push("observation frame_id was not present in the submitted batch");
      }
      if (typeof observation?.visible_fact !== "string" || !observation.visible_fact) issues.push("visible_fact is required");
      if (!VISIBILITIES.has(observation?.visibility)) issues.push("invalid visibility");
      if (!CONFIDENCES.has(observation?.confidence)) issues.push("invalid confidence");
      if (typeof observation?.why_it_matters !== "string" || !observation.why_it_matters) issues.push("why_it_matters is required");
      if (!ACTIONS.has(observation?.action_id)) issues.push("invalid observation action_id");

      const canonicalId = VISIBLE_FACT_CATEGORY.get(observation?.visible_fact);
      if (!canonicalId) {
        issues.push("visible_fact is not a closed builder-owned observation");
        continue;
      }
      const category = categoriesById.get(canonicalId);
      if (!category) {
        issues.push("observation does not map to a recognized category");
        continue;
      }
      const expectedAction = actionForBand(category.consequence_band);
      if (observation.action_id !== expectedAction) {
        issues.push(`observation action is below or inconsistent with ${canonicalId}`);
      }
      const mediaUnusable = report.media_quality?.usable_for_requested_conclusion === false;
      if (mediaUnusable || canonicalId === "unknown_object") {
        if (observation.confidence !== "abstain") issues.push("unusable or unknown observation must abstain");
      } else if (observation.confidence !== "low") {
        issues.push("possible visual categories require low observation confidence");
      }
      if (observation.visibility === "clear") {
        issues.push("unverified category observations cannot claim clear visibility");
      }
      const frames = observationFramesByCategory.get(canonicalId) ?? new Set<string>();
      if (typeof observation.frame_id === "string") frames.add(observation.frame_id);
      observationFramesByCategory.set(canonicalId, frames);
    }
    for (const [canonicalId, category] of categoriesById) {
      const frames = observationFramesByCategory.get(canonicalId) ?? new Set<string>();
      if (report.media_mode !== "no_media" && frames.size < 1) {
        issues.push(`recognized category lacks an observation: ${canonicalId}`);
      }
      if (category.evidence_source === "multi_frame_visual" && frames.size < 2) {
        issues.push(`multi-frame evidence requires two frames: ${canonicalId}`);
      }
      if (category.evidence_source === "single_frame_visual" && frames.size > 1) {
        issues.push(`single-frame evidence cannot span multiple frames: ${canonicalId}`);
      }
    }
  }
  const hasC4 = Array.isArray(report.recognized_categories)
    ? report.recognized_categories.some((category) => category?.consequence_band === "C4_stop_or_decline")
    : false;
  if (hasC4 && (!report.urgent_stop || report.disposition !== "stop_now" || report.next_step_id !== "stop_now")) {
    issues.push("C4 requires urgent_stop, stop_now, and a stop_now next step");
  }
  const hasC3 = Array.isArray(report.recognized_categories)
    ? report.recognized_categories.some((category) => category?.consequence_band === "C3_high_consequence_instructor_only")
    : false;
  if (hasC3 && !hasC4 && (report.disposition !== "do_not_proceed" || report.next_step_id !== "qualified_instructor")) {
    issues.push("C3 requires do_not_proceed and qualified_instructor");
  }
  if (Array.isArray(report.observations) && hasC4 && !report.observations.some((item) => item?.action_id === "stop_now")) {
    issues.push("C4 requires a stop_now observation action");
  }
  if (
    Array.isArray(report.observations) &&
    hasC3 &&
    !hasC4 &&
    !report.observations.some((item) => item?.action_id === "qualified_instructor")
  ) {
    issues.push("C3 requires a qualified_instructor observation action");
  }
  if (
    Array.isArray(report.observations) &&
    (hasC3 || hasC4) &&
    report.observations.some((item) => item?.action_id === "no_action_from_image")
  ) {
    issues.push("high-consequence categories cannot contain no_action_from_image");
  }
  if (report.urgent_stop === true && report.disposition !== "stop_now") {
    issues.push("urgent_stop requires a stop_now disposition");
  }
  if (report.disposition === "stop_now" && report.urgent_stop !== true) {
    issues.push("stop_now requires urgent_stop");
  }
  if (report.urgent_stop === true && report.report_type !== "urgent_alert") {
    issues.push("urgent_stop requires an urgent_alert report type");
  }
  if (report.report_type === "urgent_alert" && report.disposition !== "stop_now") {
    issues.push("urgent_alert requires a stop_now disposition");
  }
  if (report.escalation?.level === "emergency_services") {
    if (!report.urgent_stop || report.disposition !== "stop_now" || report.next_step_id !== "emergency_services") {
      issues.push("emergency escalation requires urgent stop_now and emergency_services");
    }
  }
  if (report.escalation?.level === "prompt_medical_assessment") {
    if (
      (report.disposition !== "do_not_proceed" && report.disposition !== "stop_now") ||
      report.next_step_id !== "prompt_medical_assessment"
    ) {
      issues.push("prompt-medical escalation requires a non-proceeding disposition and prompt assessment");
    }
  }
  if (report.next_step_id === "emergency_services" && report.escalation?.level !== "emergency_services") {
    issues.push("emergency_services next step requires emergency escalation");
  }
  if (report.next_step_id === "prompt_medical_assessment" && report.escalation?.level !== "prompt_medical_assessment") {
    issues.push("prompt_medical_assessment next step requires prompt-medical escalation");
  }
  if (Array.isArray(report.source_ids)) {
    const requiredSources = requiredSourcesForReport(report);
    for (const sourceId of requiredSources) {
      if (!report.source_ids.includes(sourceId)) issues.push(`missing required source_id: ${sourceId}`);
    }
  }
  const compatibleActions: Partial<Record<Disposition, ReadonlySet<ActionId>>> = {
    stop_now: new Set(["stop_now", "prompt_medical_assessment", "emergency_services"]),
    do_not_proceed: new Set(["do_not_proceed", "lower_consequence_only", "qualified_instructor", "prompt_medical_assessment"]),
    pause_and_correct: new Set(["pause_and_correct_while_unrestrained", "obtain_lower_sensitivity_view", "direct_nonvisual_check"]),
    insufficient_view: new Set(["obtain_lower_sensitivity_view", "lower_consequence_only", "no_action_from_image"]),
    lower_consequence_learning_only: new Set(["lower_consequence_only", "qualified_instructor", "direct_nonvisual_check"]),
    no_visible_concern_not_clearance: new Set(["direct_nonvisual_check", "no_action_from_image"]),
  };
  const allowedNextSteps = compatibleActions[report.disposition as Disposition];
  if (allowedNextSteps && !allowedNextSteps.has(report.next_step_id as ActionId)) {
    issues.push("next_step_id is incompatible with disposition");
  }
  const missingMediaPermission =
    report.media_mode !== "no_media" &&
    CONSENT_BOOLEAN_KEYS.some((key) => report[key] !== true);
  if (
    missingMediaPermission &&
    report.disposition !== "do_not_proceed" &&
    report.disposition !== "stop_now"
  ) {
    issues.push("missing media permission requires a non-proceeding disposition");
  }
  if (
    missingMediaPermission &&
    report.escalation?.level === "none" &&
    report.next_step_id !== "do_not_proceed" &&
    report.next_step_id !== "stop_now" &&
    !(hasC3 && !hasC4 && report.next_step_id === "qualified_instructor")
  ) {
    issues.push("missing media permission requires a non-proceeding next step");
  }
  if (report.disposition === "no_visible_concern_not_clearance") {
    issues.push("this unvalidated camera path cannot issue a no-visible-concern disposition");
  }
  const mediaUnusable =
    report.media_mode !== "no_media" &&
    report.media_quality?.usable_for_requested_conclusion === false;
  if (
    mediaUnusable &&
    !missingMediaPermission &&
    !hasC3 &&
    !hasC4 &&
    report.disposition !== "insufficient_view" &&
    !(
      report.disposition === "do_not_proceed" &&
      report.next_step_id === "do_not_proceed"
    )
  ) {
    issues.push("unusable media requires insufficient_view or a stricter do_not_proceed disposition");
  }
  if (
    mediaUnusable &&
    Array.isArray(report.observations) &&
    report.observations.some((observation) => observation?.confidence !== "abstain")
  ) {
    issues.push("unusable media observations must abstain");
  }
  if (
    report.media_quality?.usable_for_requested_conclusion === true &&
    (report.media_mode === "no_media" ||
      report.media_quality.focus === "unusable" ||
      report.media_quality.focus === "not_applicable" ||
      report.media_quality.lighting === "unusable" ||
      report.media_quality.lighting === "not_applicable" ||
      report.media_quality.coverage === "obscured" ||
      report.media_quality.coverage === "not_applicable")
  ) {
    issues.push("media usability conflicts with quality or media mode");
  }
  if (report.media_mode === "no_media") {
    const quality = report.media_quality;
    if (
      quality &&
      (quality.focus !== "not_applicable" ||
        quality.lighting !== "not_applicable" ||
        quality.coverage !== "not_applicable" ||
        quality.angle !== "not_applicable" ||
        quality.scale !== "not_applicable" ||
        quality.occlusion !== "not_applicable" ||
        quality.chronology !== "not_applicable" ||
        quality.transformations !== "not_applicable" ||
        quality.usable_for_requested_conclusion !== false)
    ) issues.push("no_media requires not_applicable quality and unusable conclusion");
    if (Array.isArray(report.recognized_categories) && report.recognized_categories.length > 0) {
      issues.push("no_media cannot contain visual categories");
    }
    if (Array.isArray(report.observations) && report.observations.length > 0) {
      issues.push("no_media cannot contain visual observations");
    }
  }
  return { success: issues.length === 0, issues };
}

const REPORT_TYPES = new Set<ObservationReport["report_type"]>(["readiness", "activity_recognition", "urgent_alert", "post_scene", "instructor_handoff"]);
const MEDIA_MODES = new Set<ObservationReport["media_mode"]>(["static_photos", "selected_video_stills", "no_media"]);
const DISPOSITIONS = new Set<Disposition>(["stop_now", "do_not_proceed", "pause_and_correct", "insufficient_view", "lower_consequence_learning_only", "no_visible_concern_not_clearance"]);
const ACTIONS = new Set<ActionId>(["stop_now", "do_not_proceed", "pause_and_correct_while_unrestrained", "obtain_lower_sensitivity_view", "lower_consequence_only", "qualified_instructor", "prompt_medical_assessment", "emergency_services", "direct_nonvisual_check", "no_action_from_image"]);
const EVIDENCE_SOURCES = new Set<EvidenceSource>(["single_frame_visual", "multi_frame_visual", "user_report", "nonvisual_attestation"]);
const EVIDENCE_STATES = new Set<EvidenceState>(["observed", "possible", "unknown", "not_assessed"]);
const CONSEQUENCE_BANDS = new Set<ConsequenceBand>(["C1_lower_consequence_learning", "C2_elevated", "C3_high_consequence_instructor_only", "C4_stop_or_decline"]);
const ABSTAIN_REASONS = new Set<AbstainReason>(["not_applicable", "insufficient_coverage", "perspective_distortion", "two_dimensional_overlap", "chronology_unknown", "ambiguous_object", "nonvisual_fact", "sensitive_view_required", "out_of_scope"]);
const SOURCE_IDS = new Set<SourceId>(SAFETY_SOURCE_IDS);
const VISIBILITIES = new Set(["clear", "partial", "obscured", "not_shown"]);
const CONFIDENCES = new Set(["high", "moderate", "low", "abstain"]);
const CONSENT_BOOLEAN_KEYS = ["adult_status_confirmed", "activity_consent_confirmed", "recording_consent_confirmed", "upload_consent_confirmed", "output_consent_confirmed"] as const;
const CATEGORY_KEYS = ["canonical_id", "evidence_source", "evidence_state", "consequence_band", "visible_discriminators", "confounders_considered", "abstain_reason"] as const;
const OBSERVATION_KEYS = ["frame_id", "visible_fact", "visibility", "confidence", "why_it_matters", "action_id"] as const;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string" && item.length > 0);
}

function hasExactKeys(value: unknown, expected: readonly string[]): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  return actual.length === wanted.length && actual.every((key, index) => key === wanted[index]);
}

function validateMediaQuality(value: unknown, issues: string[]): void {
  const keys = ["focus", "lighting", "coverage", "angle", "scale", "occlusion", "chronology", "transformations", "usable_for_requested_conclusion"] as const;
  if (!hasExactKeys(value, keys)) {
    issues.push("media_quality keys do not match schema");
    return;
  }
  const quality = value as ObservationReport["media_quality"];
  if (!["adequate", "soft", "unusable", "not_applicable"].includes(quality.focus)) issues.push("invalid media focus");
  if (!["adequate", "shadowed", "color_cast", "unusable", "not_applicable"].includes(quality.lighting)) issues.push("invalid media lighting");
  if (!["full_relevant_area", "partial", "obscured", "not_applicable"].includes(quality.coverage)) issues.push("invalid media coverage");
  if (!["useful", "foreshortened", "panoramic_or_fisheye", "unknown", "not_applicable"].includes(quality.angle)) issues.push("invalid media angle");
  if (!["contextual", "close_up_without_context", "unknown", "not_applicable"].includes(quality.scale)) issues.push("invalid media scale");
  if (!["none_material", "material", "unknown", "not_applicable"].includes(quality.occlusion)) issues.push("invalid media occlusion");
  if (!["user_labeled", "unknown", "not_applicable"].includes(quality.chronology)) issues.push("invalid media chronology");
  if (!["none_reported", "user_reported", "unknown", "not_applicable"].includes(quality.transformations)) issues.push("invalid media transformations");
  if (typeof quality.usable_for_requested_conclusion !== "boolean") issues.push("invalid media usability flag");
}

function validateEscalation(value: unknown, issues: string[]): void {
  if (!hasExactKeys(value, ["level", "reason"])) {
    issues.push("escalation keys do not match schema");
    return;
  }
  const escalation = value as ObservationReport["escalation"];
  if (!["none", "prompt_medical_assessment", "emergency_services"].includes(escalation.level)) issues.push("invalid escalation level");
  if (typeof escalation.reason !== "string" || !escalation.reason) issues.push("escalation reason is required");
}

function requiredSourcesForReport(report: Partial<ObservationReport>): Set<SourceId> {
  const required = new Set<SourceId>(["CONSENT-2"]);
  if (report.media_mode !== "no_media") {
    required.add("XAI-VISION-1");
    required.add("XAI-VISION-2");
    required.add("XAI-MODEL-1");
    required.add("XAI-STRUCTURE-1");
    required.add("XAI-PRIVACY-1");
    required.add("XAI-TERMS-1");
  }
  const categories = Array.isArray(report.recognized_categories) ? report.recognized_categories : [];
  if (
    categories.some(
      (category) =>
        isCanonicalId(category?.canonical_id) &&
        (category.canonical_id.includes("rope") || category.canonical_id.includes("load")),
    )
  ) required.add("ROPE-1");
  if (
    categories.some((category) =>
      [
        "neck_or_airway_overlap_possible",
        "torso_breathing_restriction_possible",
        "mouth_covering_or_signal_limitation_possible",
      ].includes(String(category?.canonical_id)),
    )
  ) required.add("NFS-1");
  if (
    report.escalation?.level === "emergency_services" ||
    report.escalation?.level === "prompt_medical_assessment"
  ) required.add("FIRSTAID-1");
  if (report.media_mode === "selected_video_stills") required.add("XAI-VIDEO-1");
  return required;
}
