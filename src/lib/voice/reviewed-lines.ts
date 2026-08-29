export const DIRECT_CHECK_REMINDER =
  "Direct-check reminder. Ask about comfort, sensation, motion, and change. Release for concern.";

/**
 * Ceiling on one reviewed utterance, shared by the speakCoach validator's
 * input slice and the allowlist check. Membership in the reviewed set is the
 * real control; this bound only has to admit the longest narration the app
 * itself composes. It was 400 — shorter than almost every composed step
 * script — so the "· cloud" voice could speak bare per-line prompts but
 * never the step narration the label promised, and every step advance made
 * one doomed authenticated request before falling back to browser speech.
 */
export const MAX_REVIEWED_SPEECH_LENGTH = 6000;
