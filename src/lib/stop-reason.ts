/**
 * Human wording for the internal stop-reason codes the session store carries.
 *
 * The codes are written by call sites ("safeword", "checkin-concern") and are
 * not sentences: Rig Mode printed one straight into the release instruction,
 * so a stop read "safeword Support the position and release…".
 *
 * The Studio keeps its own inline copy of this mapping, pinned by
 * scripts/integration-contracts.test.mjs so the banner cannot silently lose a
 * case; keep the two in step.
 */
export function stopReasonLabel(reason: string | undefined): string {
  switch (reason) {
    case "safeword":
      return "Safeword heard";
    case "safeword-button":
      return "Safeword called";
    case "coach":
    case "observation":
      return "Stopped by an observation flag";
    case "medical-emergency":
    case "medical":
      return "Stopped for a medical concern";
    case "checkin-concern":
      return "Stopped at a check-in concern";
    case "consent":
      return "Stopped at the consent triage";
    default:
      return "Stopped manually";
  }
}
