/**
 * The emergency card's content, in one place.
 *
 * It is rendered twice: by the `/emergency` route, and by a self-contained
 * static page that a service worker serves when the network cannot be reached.
 * Two hand-maintained copies of emergency instructions is exactly the kind of
 * drift that gets noticed at the worst possible moment, so both render from
 * here and a test fails if the generated copy falls behind.
 */

export type EmergencyStep = {
  /** "1 · Stop and release" — the number is part of the label people scan for. */
  label: string;
  body: string;
};

export const EMERGENCY_TITLE = "Release now";
export const EMERGENCY_KICKER = "Stop";
export const EMERGENCY_CALL_FIRST =
  "Call emergency services now (put the phone on speaker), then release only what is affecting breathing or circulation while you wait — do not spend minutes tidily removing rope.";

export const EMERGENCY_STEPS: readonly EmergencyStep[] = [
  {
    label: "1 · Stop and release",
    body: "Stop the activity. Support the person's position and release restraint without creating a fall or another injury. Use the practiced rapid-release method within your training.",
  },
  {
    label: "2 · Call emergency services",
    body: "Call now for abnormal breathing, unresponsiveness, seizure, chest pain, severe bleeding, a serious fall, stroke-like symptoms, major weakness, or any neck pressure followed by concerning symptoms.",
  },
  {
    label: "3 · Follow the dispatcher",
    body: "Follow dispatcher instructions. Give CPR, AED care, or first aid only within your current training. Do not use this app instead of emergency care.",
  },
  {
    label: "4 · Prompt medical assessment",
    body: "Seek prompt care for persistent or worsening numbness, weakness, pain, swelling, discoloration, temperature change, breathing or swallowing change, voice change, confusion, dizziness, or loss of function.",
  },
  {
    label: "5 · Do not re-tie",
    body: "Do not re-tie, delay care for a photo, or use normal-looking color or an app result to rule out injury.",
  },
] as const;

export const EMERGENCY_CALL_HEADLINE = "Call your local emergency-services number now.";

/**
 * Deliberately no number. Browser language and geolocation both get this wrong
 * — a VPN, a roaming SIM, or a phone still set to a previous country all
 * produce a confident, wrong number on the one screen that must not be wrong.
 */
export const EMERGENCY_CALL_BODY =
  "Use the device's phone dialer. This emergency card deliberately reads no saved account data and will not guess a number from browser language or location.";

/** Shown only on the offline copy, which cannot know how stale it is. */
export const EMERGENCY_OFFLINE_NOTE =
  "You are seeing the saved offline copy of this card because the app could not be reached. Its wording is fixed at the version you last loaded. Call emergency services directly; do not wait for a network.";
