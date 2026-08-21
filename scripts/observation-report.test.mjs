import assert from "node:assert/strict";
import test from "node:test";
import {
  admitRemoteCategories,
  buildObservationReport,
  CANONICAL_IDS,
  consequenceFloor,
  validateObservationReport,
} from "../src/lib/observation/report.ts";

const consent = {
  adults: true,
  activity: true,
  recording: true,
  upload: true,
  output: true,
};
const quality = { sharpness: 0.8, exposure: 0.8, score: 0.8 };

function reportFor(canonicalId, modelStatus = "completed") {
  const transition = canonicalId === "transition_across_frames_possible";
  return buildObservationReport({
    mediaMode: transition ? "selected_video_stills" : "static_photos",
    consent,
    quality,
    matches: transition
      ? [
          { frame_id: "F01", canonical_id: canonicalId },
          { frame_id: "F02", canonical_id: canonicalId },
        ]
      : [{ frame_id: "F01", canonical_id: canonicalId }],
    allowedFrameIds: transition ? ["F01", "F02"] : ["F01"],
    modelStatus,
  });
}

function clone(value) {
  return structuredClone(value);
}

test("every canonical category is emitted at or above its fixed consequence floor", () => {
  const rank = {
    C1_lower_consequence_learning: 1,
    C2_elevated: 2,
    C3_high_consequence_instructor_only: 3,
    C4_stop_or_decline: 4,
  };
  for (const canonicalId of CANONICAL_IDS) {
    const report = reportFor(canonicalId);
    assert.equal(report.recognized_categories[0].canonical_id, canonicalId);
    assert.ok(
      rank[report.recognized_categories[0].consequence_band] >= rank[consequenceFloor(canonicalId)],
      canonicalId,
    );
    assert.equal(validateObservationReport(report).success, true, canonicalId);
    assert.equal(report.media_quality.usable_for_requested_conclusion, true);
    assert.match(report.limitations.join(" "), /cannot establish.*consent/i);
  }
});

test("C1 ontology categories are promoted without separate readiness attestations", () => {
  const report = reportFor("release_tool_like_object_visible");
  assert.equal(consequenceFloor("release_tool_like_object_visible"), "C1_lower_consequence_learning");
  assert.equal(report.recognized_categories[0].consequence_band, "C2_elevated");
  assert.notEqual(report.next_step_id, "no_action_from_image");
});

test("reports do not invent pixel discriminators or user chronology", () => {
  const report = reportFor("rope_restraint_unspecified");
  assert.deepEqual(report.recognized_categories[0].visible_discriminators, []);
  assert.equal(report.media_quality.chronology, "unknown");
  assert.match(report.observations[0].visible_fact, /no independently verified pixel-level discriminator/i);
});

test("C3 classifications never authorize proceeding and route to an instructor", () => {
  const report = reportFor("partial_load_bearing_possible");
  assert.equal(report.urgent_stop, false);
  assert.equal(report.disposition, "do_not_proceed");
  assert.equal(report.next_step_id, "qualified_instructor");
});

test("C4 classifications force stop_now regardless of low visual confidence", () => {
  const report = reportFor("neck_or_airway_overlap_possible");
  assert.equal(report.urgent_stop, true);
  assert.equal(report.disposition, "stop_now");
  assert.equal(report.next_step_id, "stop_now");
  assert.equal(report.observations[0].confidence, "low");
});

test("model failure fails closed as insufficient view and never as clearance", () => {
  const report = buildObservationReport({
    mediaMode: "selected_video_stills",
    consent,
    quality,
    matches: [],
    modelStatus: "unavailable",
  });
  assert.equal(report.disposition, "insufficient_view");
  assert.equal(report.recognized_categories[0].canonical_id, "unknown_object");
  assert.match(report.limitations.join(" "), /did not complete/i);
  assert.notEqual(report.disposition, "no_visible_concern_not_clearance");
  assert.notEqual(report.next_step_id, "no_action_from_image");
});

test("procedural self-audit cannot wipe a neck category", () => {
  const admitted = admitRemoteCategories(
    [
      { frame_id: "F01", canonical_id: "rope_restraint_unspecified" },
      { frame_id: "F01", canonical_id: "neck_or_airway_overlap_possible" },
    ],
    ["F01"],
    { nonvisual_inference: false, exact_identification: false, procedural_content: true },
  );
  assert.equal(admitted.hardLimit, true);
  assert.deepEqual(
    admitted.matches.map((match) => match.canonical_id),
    ["neck_or_airway_overlap_possible"],
  );
  const report = buildObservationReport({
    mediaMode: "static_photos",
    consent,
    quality,
    matches: admitted.matches,
    allowedFrameIds: ["F01"],
    modelStatus: admitted.modelStatus,
    hardLimit: admitted.hardLimit,
  });
  assert.equal(report.urgent_stop, true);
  assert.equal(report.disposition, "stop_now");
  assert.equal(report.next_step_id, "stop_now");
});

test("C4 with a junk frame id is rebound instead of dropped", () => {
  const admitted = admitRemoteCategories(
    [{ frame_id: "F99", canonical_id: "neck_or_airway_overlap_possible" }],
    ["F01"],
    { nonvisual_inference: false, exact_identification: false, procedural_content: false },
  );
  assert.deepEqual(admitted.matches, [
    { frame_id: "F01", canonical_id: "neck_or_airway_overlap_possible" },
  ]);
});

test("procedural self-audit without a high-consequence match refuses continuation", () => {
  const admitted = admitRemoteCategories(
    [{ frame_id: "F01", canonical_id: "rope_restraint_unspecified" }],
    ["F01"],
    { nonvisual_inference: false, exact_identification: true, procedural_content: false },
  );
  assert.equal(admitted.hardLimit, true);
  assert.equal(admitted.matches.length, 0);
  const report = buildObservationReport({
    mediaMode: "static_photos",
    consent,
    quality,
    matches: admitted.matches,
    allowedFrameIds: ["F01"],
    modelStatus: admitted.modelStatus,
    hardLimit: true,
  });
  assert.equal(report.disposition, "do_not_proceed");
  assert.equal(report.next_step_id, "do_not_proceed");
  assert.notEqual(report.disposition, "insufficient_view");
});

test("missing per-batch permission refuses media analysis", () => {
  const report = buildObservationReport({
    mediaMode: "static_photos",
    consent: { ...consent, output: false },
    quality,
    matches: [{ frame_id: "F01", canonical_id: "rope_present_no_visible_load_path" }],
    modelStatus: "completed",
  });
  assert.equal(report.disposition, "do_not_proceed");
  assert.equal(report.next_step_id, "do_not_proceed");
  assert.equal(report.output_consent_confirmed, false);
});

test("direct symptom and coercion triage outrank image appearance", () => {
  const prompt = buildObservationReport({
    mediaMode: "no_media",
    modelStatus: "not_requested",
    triage: "prompt_medical",
  });
  assert.equal(prompt.disposition, "do_not_proceed");
  assert.equal(prompt.next_step_id, "prompt_medical_assessment");
  assert.equal(prompt.escalation.level, "prompt_medical_assessment");

  const emergency = buildObservationReport({
    mediaMode: "no_media",
    modelStatus: "not_requested",
    triage: "emergency",
  });
  assert.equal(emergency.urgent_stop, true);
  assert.equal(emergency.disposition, "stop_now");
  assert.equal(emergency.next_step_id, "emergency_services");

  const coercion = buildObservationReport({
    mediaMode: "no_media",
    consent,
    modelStatus: "not_requested",
    triage: "coercion_or_secret_recording",
  });
  assert.equal(coercion.urgent_stop, true);
  assert.equal(coercion.disposition, "stop_now");
  assert.equal(coercion.next_step_id, "stop_now");
  assert.equal(coercion.adult_status_confirmed, false);
  assert.equal(coercion.recording_consent_confirmed, false);
  assert.match(coercion.nonvisual_checks.join(" "), /stop the activity and recording/i);
});

test("validator rejects invented IDs, changed floors, and nonvisual observed claims", () => {
  const valid = reportFor("rope_restraint_unspecified");

  const invented = clone(valid);
  invented.recognized_categories[0].canonical_id = "invented_safe_category";
  assert.equal(validateObservationReport(invented).success, false);

  const underBanded = clone(reportFor("neck_or_airway_overlap_possible"));
  underBanded.recognized_categories[0].consequence_band = "C1_lower_consequence_learning";
  assert.equal(validateObservationReport(underBanded).success, false);

  const nonvisualObserved = clone(valid);
  nonvisualObserved.recognized_categories[0].evidence_state = "observed";
  nonvisualObserved.recognized_categories[0].evidence_source = "user_report";
  assert.equal(validateObservationReport(nonvisualObserved).success, false);
});

test("validator rejects malformed enums, extra keys, and compatible C3/C4 dispositions", () => {
  const malformed = clone(reportFor("rope_restraint_unspecified"));
  malformed.media_quality.focus = "perfect";
  malformed.extra = true;
  assert.equal(validateObservationReport(malformed).success, false);

  const c3 = clone(reportFor("fall_exposure_possible"));
  c3.disposition = "lower_consequence_learning_only";
  c3.next_step_id = "lower_consequence_only";
  assert.equal(validateObservationReport(c3).success, false);

  const c4 = clone(reportFor("fire_or_heat_edge_context_possible"));
  c4.urgent_stop = false;
  c4.disposition = "lower_consequence_learning_only";
  assert.equal(validateObservationReport(c4).success, false);
});

test("validator rejects contradictory urgent, escalation, consent, and evidence mutations", () => {
  const urgent = clone(reportFor("neck_or_airway_overlap_possible"));
  urgent.disposition = "do_not_proceed";
  assert.equal(validateObservationReport(urgent).success, false);

  const stopWithoutUrgency = clone(reportFor("rope_restraint_unspecified"));
  stopWithoutUrgency.disposition = "stop_now";
  stopWithoutUrgency.urgent_stop = false;
  assert.equal(validateObservationReport(stopWithoutUrgency).success, false);

  const emergency = buildObservationReport({
    mediaMode: "no_media",
    modelStatus: "not_requested",
    triage: "emergency",
  });
  const weakenedEmergency = clone(emergency);
  weakenedEmergency.next_step_id = "lower_consequence_only";
  assert.equal(validateObservationReport(weakenedEmergency).success, false);

  const missingPermission = clone(reportFor("rope_restraint_unspecified"));
  missingPermission.upload_consent_confirmed = false;
  missingPermission.disposition = "lower_consequence_learning_only";
  assert.equal(validateObservationReport(missingPermission).success, false);

  const observedWithAbstention = clone(reportFor("rope_restraint_unspecified"));
  observedWithAbstention.recognized_categories[0].evidence_state = "observed";
  observedWithAbstention.recognized_categories[0].abstain_reason = "ambiguous_object";
  assert.equal(validateObservationReport(observedWithAbstention).success, false);

  const observedWithoutEvidence = clone(reportFor("rope_restraint_unspecified"));
  observedWithoutEvidence.recognized_categories[0].evidence_state = "observed";
  observedWithoutEvidence.recognized_categories[0].abstain_reason = "not_applicable";
  observedWithoutEvidence.recognized_categories[0].visible_discriminators = [];
  assert.equal(validateObservationReport(observedWithoutEvidence).success, false);

  const mismatchedEmergency = clone(reportFor("rope_restraint_unspecified"));
  mismatchedEmergency.next_step_id = "emergency_services";
  assert.equal(validateObservationReport(mismatchedEmergency).success, false);
});

test("validator rejects duplicate ledger entries and weakened high-consequence actions", () => {
  const duplicateCategory = clone(reportFor("rope_restraint_unspecified"));
  duplicateCategory.recognized_categories.push(clone(duplicateCategory.recognized_categories[0]));
  assert.equal(validateObservationReport(duplicateCategory).success, false);

  const duplicateSource = clone(reportFor("rope_restraint_unspecified"));
  duplicateSource.source_ids.push(duplicateSource.source_ids[0]);
  assert.equal(validateObservationReport(duplicateSource).success, false);

  const c3 = clone(reportFor("partial_load_bearing_possible"));
  c3.observations[0].action_id = "no_action_from_image";
  assert.equal(validateObservationReport(c3).success, false);

  const c4 = clone(reportFor("weapon_context_possible"));
  c4.observations[0].action_id = "no_action_from_image";
  assert.equal(validateObservationReport(c4).success, false);

  const duplicateConfounder = clone(reportFor("rope_restraint_unspecified"));
  duplicateConfounder.recognized_categories[0].confounders_considered.push(
    duplicateConfounder.recognized_categories[0].confounders_considered[0],
  );
  assert.equal(validateObservationReport(duplicateConfounder).success, false);

  const unmatchedFrame = clone(reportFor("rope_restraint_unspecified"));
  unmatchedFrame.observations[0].frame_id = "F99";
  assert.equal(validateObservationReport(unmatchedFrame).success, false);

  const emptyCategories = clone(reportFor("rope_restraint_unspecified"));
  emptyCategories.recognized_categories = [];
  assert.equal(validateObservationReport(emptyCategories).success, false);
});

test("validator preserves the app-level C2 promotion and per-category action floor", () => {
  const promoted = clone(reportFor("release_tool_like_object_visible"));
  promoted.recognized_categories[0].consequence_band = "C1_lower_consequence_learning";
  promoted.observations[0].action_id = "no_action_from_image";
  assert.equal(validateObservationReport(promoted).success, false);

  const c2 = clone(reportFor("rope_restraint_unspecified"));
  c2.observations[0].action_id = "no_action_from_image";
  assert.equal(validateObservationReport(c2).success, false);
});

test("closed visible facts bind each observation to its category and defeat action swaps", () => {
  const c4Mixed = buildObservationReport({
    mediaMode: "selected_video_stills",
    consent,
    quality,
    allowedFrameIds: ["F01", "F02"],
    matches: [
      { frame_id: "F01", canonical_id: "neck_or_airway_overlap_possible" },
      { frame_id: "F02", canonical_id: "rope_restraint_unspecified" },
    ],
    modelStatus: "completed",
  });
  [c4Mixed.observations[0].action_id, c4Mixed.observations[1].action_id] = [
    c4Mixed.observations[1].action_id,
    c4Mixed.observations[0].action_id,
  ];
  assert.equal(validateObservationReport(c4Mixed).success, false);

  const c3Mixed = buildObservationReport({
    mediaMode: "selected_video_stills",
    consent,
    quality,
    allowedFrameIds: ["F01", "F02"],
    matches: [
      { frame_id: "F01", canonical_id: "partial_load_bearing_possible" },
      { frame_id: "F02", canonical_id: "rope_restraint_unspecified" },
    ],
    modelStatus: "completed",
  });
  [c3Mixed.observations[0].action_id, c3Mixed.observations[1].action_id] = [
    c3Mixed.observations[1].action_id,
    c3Mixed.observations[0].action_id,
  ];
  assert.equal(validateObservationReport(c3Mixed).success, false);

  const prose = clone(reportFor("rope_restraint_unspecified"));
  prose.observations[0].visible_fact = "This exact tie is safe and consent is proven.";
  prose.observations[0].visibility = "clear";
  prose.observations[0].confidence = "high";
  assert.equal(validateObservationReport(prose).success, false);
});

test("validator binds sources, evidence multiplicity, and observations to the submitted batch", () => {
  const strippedSources = clone(reportFor("neck_or_airway_overlap_possible"));
  strippedSources.source_ids = ["CONSENT-2"];
  assert.equal(validateObservationReport(strippedSources).success, false);

  const falseMultiFrame = clone(reportFor("rope_restraint_unspecified"));
  falseMultiFrame.recognized_categories[0].evidence_source = "multi_frame_visual";
  assert.equal(validateObservationReport(falseMultiFrame).success, false);

  const substitutedFrame = clone(reportFor("rope_restraint_unspecified"));
  substitutedFrame.observations[0].frame_id = "F03";
  assert.equal(
    validateObservationReport(substitutedFrame, { allowedFrameIds: ["F01"] }).success,
    false,
  );
});

test("single-frame transitions abstain and no-media non-triage reports build without visual rows", () => {
  const transition = buildObservationReport({
    mediaMode: "selected_video_stills",
    consent,
    quality,
    allowedFrameIds: ["F01"],
    matches: [{ frame_id: "F01", canonical_id: "transition_across_frames_possible" }],
    modelStatus: "completed",
  });
  assert.equal(transition.recognized_categories[0].canonical_id, "unknown_object");
  assert.equal(transition.observations[0].confidence, "abstain");

  const noMedia = buildObservationReport({
    mediaMode: "no_media",
    modelStatus: "not_requested",
    triage: "none",
  });
  assert.deepEqual(noMedia.recognized_categories, []);
  assert.deepEqual(noMedia.observations, []);
  assert.equal(validateObservationReport(noMedia).success, true);

  const staleMediaDuringTriage = buildObservationReport({
    mediaMode: "static_photos",
    consent,
    quality,
    allowedFrameIds: ["F01"],
    matches: [{ frame_id: "F01", canonical_id: "rope_restraint_unspecified" }],
    modelStatus: "not_requested",
    triage: "emergency",
  });
  assert.equal(staleMediaDuringTriage.media_mode, "no_media");
  assert.deepEqual(staleMediaDuringTriage.recognized_categories, []);
  assert.deepEqual(staleMediaDuringTriage.observations, []);
});

test("per-frame abstentions remain represented when the model fills its match budget", () => {
  const matches = CANONICAL_IDS.filter((id) => id !== "unknown_object")
    .slice(0, 12)
    .map((canonical_id) => ({ frame_id: "F01", canonical_id }));
  const report = buildObservationReport({
    mediaMode: "selected_video_stills",
    consent,
    quality,
    allowedFrameIds: ["F01", "F02", "F03"],
    matches,
    modelStatus: "completed",
  });
  assert.equal(report.observations.length, 14);
  assert.equal(report.observations.filter((observation) => observation.confidence === "abstain").length, 2);
  assert.equal(validateObservationReport(report).success, true);
});

test("sparse source clip labels become distinct bounded report frames", () => {
  const report = buildObservationReport({
    mediaMode: "selected_video_stills",
    consent,
    quality,
    allowedFrameIds: ["F02", "F05"],
    matches: [],
    modelStatus: "unavailable",
  });
  assert.deepEqual(report.observations.map((observation) => observation.frame_id), ["F01", "F02"]);
  assert.equal(validateObservationReport(report, { allowedFrameIds: ["F01", "F02"] }).success, true);
});
