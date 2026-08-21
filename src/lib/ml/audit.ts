import type { Tie } from "@/lib/kb/types";
import { compactText, foldText, sanitizeDraft } from "./sanitize";
import type { AuditVerdict, DeterministicReport, LlmDraft, Prediction } from "./types";

const STOP_COACH =
  "Stop and release the restraint now without creating a fall. Call emergency services for abnormal breathing, unresponsiveness, seizure, chest pain, major weakness, or a serious fall.";
const STOP_NEXT = "Release now. Do not re-tie or delay medical care for another image.";
const STOP_SPEAK = "Stop and release now. Get emergency help for any serious symptom.";
const BANNED_COACH =
  "I will not provide procedural coaching for neck or breathing restriction, suspension, load-bearing rope, abandonment, or inaccessible release. Use a clothed, ground-level, non-loaded rehearsal with a qualified in-person instructor.";
const OBSERVATION_COACH =
  "Image-only observation cannot establish consent, circulation, nerve function, breathing, pressure, load, or technique correctness. Use direct communication and hands-on checks; release for any concerning symptom or uncertainty.";
const OBSERVATION_NEXT =
  "Pause before making any change. Confirm current consent, normal sensation and movement, ordinary breathing and speech, and immediate release readiness directly.";
const OBSERVATION_SPEAK =
  "Pause. Check consent, sensation, movement, breathing, and release readiness directly.";

const BANNED = [
  /breath\s*play/i,
  /chok(e|ing)/i,
  /strangle/i,
  /strangulation/i,
  /asphyx/i,
  /suffocat/i,
  /windpipe/i,
  /full suspension/i,
  /self[-\s]?suspension/i,
  /suspend(ing)? (her|him|them|the|from)/i,
  /hang(ing)? (her|him|them|the bottom)/i,
  /hang(ing)? (from|off) (the |a |an )?/i,
  /hanging (from|off|in)/i,
  /string (her|him|them) up/i,
  /(add|use|clip|tie|run) (an |the )?uplines?/i,
  /uplines? to the (ceiling|neck|throat|ring|beam|fan|hook)/i,
  /hoist (her|him|them)/i,
  /lift (her|him|them) off/i,
  /get (her|him|them) off the (floor|ground|mat|bed)/i,
  /take (her|them|him) off the (floor|ground|mat|bed)/i,
  /rope (on|around|at) (the )?(neck|throat|nape)/i,
  /neck\s*rope/i,
  /on the nape|at the nape|load the nape|nape rope/i,
  /nape (harness|wrap|rope|tie|band|cuff)/i,
  /collar (on|around|the )?(the )?(throat|neck)/i,
  /collar (her|him|them)\b/i,
  /posture collar/i,
  /collar for posture/i,
  /\bchoker\b/i,
  /under the jaw/i,
  /below the ears/i,
  /\b(thyroid|larynx|trachea)\b/i,
  /throat rope/i,
  /rope at the throat/i,
  /pressure on the throat/i,
  /gag and leave/i,
  /gag .{0,16}(leave|walk away)/i,
  /leave (her|him|them) (tied|alone|bound)/i,
  /leave (her|him|them) tied/i,
  /left (tied|bound) and alone/i,
  /unattended/i,
  /leave the (room|house|studio|apartment).{0,40}(tied|bound|gagged|rope)/i,
  /(tied|bound|gagged).{0,40}leave the (room|house|studio|apartment)/i,
  /go make (tea|coffee|a drink)/i,
  /around (her |his |their |the )?(neck|throat|nape)/i,
  /full[-\s]?suspension/i,
  /restrict (her |his |their )?(air|breath|airway)/i,
  /(close|block|shut|cover) (her |his |their |the )?airway/i,
  /steal .{0,16}(her |his |their )?(air|breath)/i,
  /hold (her |his |their )?breath/i,
  /rebreath/i,
  /smother/i,
  /bag over (her |his |their |the )?head/i,
  /co2\s*play/i,
  /gag (her |them |him )?(and|&) leave/i,
  /collar (her |his |their |the )?(throat|neck)/i,
  /under the chin/i,
  /cinch(ing)? (her |his |their |the )?(throat|neck|nape)/i,
  /wrap(ping)? (her |his |their |the )?(neck|throat|nape)/i,
  /carotid/i,
  /noose/i,
  /garr?ot+e/i,
  /ligature/i,
  /blood choke/i,
  /both feet (off|leave)/i,
  /invert(ed|ing)? (hang|suspension)/i,
  /strappado/i,
  /hair suspension/i,
  /hoist from/i,
  /hoist (her|him|them) (from|off|by)/i,
  /wrist suspension/i,
  /elevate (her|him|them)/i,
  /(take|put|shift) (her |his |their |the )?(weight|mass) (on|onto|to)/i,
  /toes? (leave|clear|off) the (mat|floor|ground)/i,
  /plastic bag over/i,
  /bag over (her |his |their |the )?face/i,
  /gas ?mask play/i,
  /air hunger/i,
  /oxygen (play|restriction)/i,
  /\bhyoid\b/i,
  /cervical (wrap|spine|band|rope)/i,
  /under the mandible/i,
  /leave (her|him|them) in it/i,
  /sleep while .{0,28}(bound|tied|gagged)/i,
  /\bhang point\b/i,
  /(add|use|clip|tie|run|improvis(?:e|ing)?) (an |the |a )?up[- ]?lines?/i,
  /up[- ]?lines? to the (ceiling|neck|throat|ring|beam|fan|hook|pole|swing)/i,
  /pole is (your |the |an )?up[- ]?line/i,
  /(swing|table|cross|pole|fan|hook) .{0,28}(as a hang|as an? up[- ]?line)/i,
  /[首吊縊]/,
  /窒息/,
];

const BANNED_COMPACT = [
  "neckrope",
  "breathplay",
  "fullsuspension",
  "selfsuspension",
  "gagandleave",
  "hangher",
  "hangthem",
  "hanghim",
  "bloodchoke",
  "aroundherneck",
  "aroundtheneck",
  "cinchtheneck",
  "cinchthethroat",
  "wraptheneck",
  "wrapherneck",
  "wrapthethroat",
  "hangfromthering",
  "hangfromaring",
  "hangfromtheceiling",
  "closeherairway",
  "blocktheairway",
  "carotid",
  "noose",
  "garrote",
  "garrotte",
  "suffocate",
  "windpipe",
  "strappado",
  "hairsuspension",
  "posturecollar",
  "rebreathing",
  "unattended",
  "underthejaw",
  "napeharness",
  "naperope",
  "hyoid",
  "airhunger",
  "wristsuspension",
];

const NO_STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "anything",
  "as",
  "at",
  "be",
  "being",
  "bound",
  "by",
  "do",
  "for",
  "free",
  "from",
  "full",
  "hands",
  "hang",
  "her",
  "his",
  "if",
  "in",
  "is",
  "it",
  "large",
  "left",
  "maybe",
  "no",
  "not",
  "of",
  "on",
  "or",
  "play",
  "safeword",
  "she",
  "support",
  "that",
  "the",
  "their",
  "them",
  "this",
  "tied",
  "to",
  "while",
  "with",
  "yes",
  "you",
  "your",
]);

function stemWord(w: string) {
  if (w.length <= 3) return w;
  if (w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.endsWith("ses") || w.endsWith("xes") || w.endsWith("zes")) return w.slice(0, -2);
  if (w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function textIsBanned(s: string) {
  const folded = foldText(s);
  const compact = compactText(s);
  if (BANNED.some((re) => re.test(s) || re.test(folded))) return true;
  return BANNED_COMPACT.some((p) => compact.includes(p));
}

function sentenceLooksLikeRefusal(s: string) {
  return /\b(do not|don't|doesn't|never|will not|won't|cannot|can't|refuse|not coach|will not coach|this app will not|not a hang|not an upline)\b/i.test(
    s,
  );
}

/** For knowledge answers: drop coaching-ban sentences, keep refusal/lecture sentences. */
export function scrubBannedSentences(s: string) {
  const raw = String(s ?? "").trim();
  if (!raw) return raw;
  if (!textIsBanned(raw)) return raw;
  const sentences = raw.match(/[^.!?]+(?:[.!?]+|$)/g) ?? [raw];
  const kept = sentences
    .map((sent) => sent.trim())
    .filter(Boolean)
    .map((sent) => {
      if (!textIsBanned(sent) || sentenceLooksLikeRefusal(sent)) return sent;
      return "";
    })
    .filter(Boolean);
  if (!kept.length) return BANNED_COACH;
  return kept.join(" ");
}

export function scrubBannedAnswer(s: string) {
  if (!textIsBanned(s)) return s;
  if (sentenceLooksLikeRefusal(s) && !/\b(add|put|cinch|wrap|hoist|clip)\b/i.test(s)) return s;
  return BANNED_COACH;
}

const WEAK_NO = new Set(["neck", "throat", "nape", "breath", "air", "hang", "alone", "suspension"]);

const KEY_ALIASES: Record<string, string[]> = {
  neck: ["neck", "throat", "nape"],
  throat: ["neck", "throat", "nape"],
  nape: ["neck", "throat", "nape"],
  breath: ["breath", "air", "airway"],
  air: ["breath", "air", "airway"],
  hang: ["hang", "hoist"],
  suspension: ["suspension", "hang", "hoist"],
  alone: ["alone", "unattended", "bound"],
};

function dangerousWeak(k: string, hay: string) {
  const h = ` ${hay} `;
  if (k === "neck" || k === "throat" || k === "nape") {
    return / (on|around|at|wrap|rope|collar|cinch|pressure|harness) (her |his |the )?(neck|throat|nape)|(neck|throat|nape) (rope|collar|wrap|cinch|restraint|harness|band|choker)/.test(
      h,
    );
  }
  if (k === "breath" || k === "air") {
    return /breath play|restrict .{0,12}(breath|air)|hold (her |his )?breath|steal .{0,12}(air|breath)/.test(h);
  }
  if (k === "hang") return /hang (her|him|them|from)|hoist (her|him|them|from)/.test(h);
  if (k === "suspension") {
    return /full suspension|hang (her|him|them|from)|hoist (her|him|them|from)|both feet (off|leave)|string (her|him|them) up/.test(h);
  }
  if (k === "alone") {
    return /left (tied and )?alone|tied and alone|leave (her|him|them) (tied|alone|bound)|leave (her|him|them) in it|unattended/.test(h);
  }
  return false;
}

/** Distinctive-token match for negotiated nos. Never keys generic words like "the" / "on". */
export function hitsHardNo(token: string, hayRaw: string): boolean {
  const t = String(token ?? "").trim();
  if (t.length < 2) return false;
  const original = String(hayRaw ?? "");
  if (Array.from(t).some((char) => (char.codePointAt(0) ?? 0) > 0xff) && original.includes(t)) {
    return true;
  }

  const folded = foldText(t);
  const hay = foldText(original);
  if (!folded || !hay) return false;

  if (folded.length >= 3) {
    const re = new RegExp(`(?:^| )${escapeRe(folded)}(?: |$)`);
    if (re.test(` ${hay} `)) return true;
  }

  if (!folded.includes(" ") && folded.length >= 2 && folded.length <= 4 && !NO_STOPWORDS.has(folded)) {
    const forms = new Set([folded, stemWord(folded)]);
    for (const form of forms) {
      if (!form || NO_STOPWORDS.has(form)) continue;
      const re = new RegExp(`(?:^| )${escapeRe(form)}(?: |$)`);
      if (re.test(` ${hay} `)) return true;
    }
  }

  const keys = folded
    .split(" ")
    .filter((w) => w.length >= 3 && !NO_STOPWORDS.has(w))
    .map(stemWord)
    .filter((w) => w.length >= 3 && !NO_STOPWORDS.has(w));
  if (!keys.length) return false;

  const hayWords = hay.split(" ").map(stemWord);
  const haySet = new Set(hayWords);
  return keys.some((k) => {
    const aliases = KEY_ALIASES[k] ?? [k];
    const present = aliases.some((a) => haySet.has(a));
    if (!present) return false;
    if (WEAK_NO.has(k)) return dangerousWeak(k, hay);
    return true;
  });
}

export function localAudit(opts: {
  det: DeterministicReport;
  pred: Prediction;
  llm: LlmDraft | null;
  tie?: Tie;
  stepIndex: number;
  hardNos?: string[];
}): { draft: LlmDraft; verdict: AuditVerdict } {
  const overrides: string[] = [];
  const droppedClaims: string[] = [];
  const incoming = opts.llm ? sanitizeDraft(opts.llm) : null;
  const base = incoming ?? fallbackDraft(opts);
  const tieGuess = opts.tie
    ? `User-selected label: ${opts.tie.name}; not visually validated.`
    : "Not identified from images.";
  const stepGuess = opts.tie
    ? "User-selected step context only; not inferred or validated from images."
    : "Not inferred from images.";
  const seen = [
    "Limited image view only; age, consent, sensation, circulation, breathing, pressure, load, and technique are not observable.",
  ];
  if (
    incoming &&
    (incoming.tieGuess !== tieGuess ||
      incoming.stepGuess !== stepGuess ||
      incoming.seen.length > 0)
  ) {
    droppedClaims.push("Removed unverified model identification and nonvisual claims.");
  }

  let quality = base.quality === "sound" || base.quality === "adjust" || base.quality === "unsafe" ? base.quality : "adjust";
  let coaching = base.coaching;
  let next = base.next;
  let speak = base.speak;
  let circulation = base.circulation || opts.det.recommend !== "continue";

  const halt = (why: string, nextLine?: string, speakLine?: string, coachLine?: string) => {
    quality = "unsafe";
    next = nextLine || STOP_NEXT;
    speak = speakLine || STOP_SPEAK;
    coaching = coachLine || STOP_COACH;
    circulation = true;
    if (!overrides.includes(why)) overrides.push(why);
  };

  if (opts.det.recommend === "stop") {
    halt(
      "Deterministic stop forced halt language.",
      STOP_NEXT,
      STOP_SPEAK,
      STOP_COACH,
    );
  }
  if (opts.det.recommend === "adjust" && quality === "sound") {
    quality = "adjust";
    overrides.push("Image analysis cannot issue a continuation clearance.");
  }
  if (opts.pred.recommend === "stop") {
    halt("Predictor vetoed continuation on rising risk.");
  }

  const fields = `${coaching} ${next} ${speak}`;
  if (textIsBanned(fields)) {
    droppedClaims.push("Removed disallowed coaching.");
    halt(
      "Banned coaching stripped.",
      STOP_NEXT,
      STOP_SPEAK,
      "That suggestion is outside this app's scope. Stop and release; do not use a model response to modify or clear the setup.",
    );
  }

  const originalHay = `${base.coaching} ${base.next} ${base.speak} ${base.stepGuess} ${(base.seen ?? []).join(" ")}`;
  for (const no of opts.hardNos ?? []) {
    if (!hitsHardNo(no, originalHay)) continue;
    droppedClaims.push(`Honored negotiated no: ${no}`);
    halt(
      `Negotiated no (${no}) is a hard limit.`,
      "Stop. That is on the negotiated no list. Do not begin or add it; if it is underway, release.",
      "That is a negotiated no. Stop and release.",
      `You marked “${String(no).slice(0, 80)}” as a no. The app will not coach it. Stop and release rather than modifying the setup.`,
    );
  }

  if (opts.det.neckRope > 0.1 && quality !== "unsafe") {
    halt(
      "Possible neck-zone overlap forced release.",
      STOP_NEXT,
      STOP_SPEAK,
      "Possible neck or throat overlap appears in this view. Stop and release; the image cannot establish contact, pressure, breathing, or injury.",
    );
  }

  if (opts.tie) {
    const max = Math.max(0, opts.tie.steps.length - 1);
    if (opts.stepIndex > max || opts.stepIndex < 0) {
      overrides.push("Step index clamped to the tie.");
    }
  }

  // Model prose is untrusted and can evade lexical filters through paraphrase.
  // The camera path therefore exposes only fixed, reviewed action text for both
  // stop and non-stop branches. A model cannot preserve its own prose merely by
  // self-labeling it "unsafe".
  if (quality === "unsafe") {
    coaching = STOP_COACH;
    next = STOP_NEXT;
    speak = STOP_SPEAK;
    circulation = true;
    if (!overrides.includes("Unsafe action prose replaced with fixed halt guidance.")) {
      overrides.push("Unsafe action prose replaced with fixed halt guidance.");
    }
  } else {
    quality = "adjust";
    coaching = OBSERVATION_COACH;
    next = OBSERVATION_NEXT;
    speak = OBSERVATION_SPEAK;
    circulation = true;
    if (!overrides.includes("Model action prose replaced with observation-only guidance.")) {
      overrides.push("Model action prose replaced with observation-only guidance.");
    }
  }

  speak = speak.replace(/\s+/g, " ").trim().slice(0, 220);
  coaching = coaching.trim().slice(0, 900);
  next = next.trim().slice(0, 240);

  const passed = droppedClaims.length === 0;
  return {
    draft: {
      ...base,
      tieGuess,
      stepGuess,
      seen,
      quality,
      coaching,
      next,
      speak,
      circulation,
    },
    verdict: {
      passed,
      overrides,
      droppedClaims,
      source: opts.llm ? "fused" : "local-rules",
    },
  };
}

export function fallbackDraft(opts: {
  det: DeterministicReport;
  pred: Prediction;
  tie?: Tie;
  stepIndex: number;
}): LlmDraft {
  const quality =
    opts.det.recommend === "stop" || opts.pred.recommend === "stop"
      ? "unsafe"
      : opts.det.recommend === "adjust" || opts.pred.recommend === "adjust"
        ? "adjust"
        : "adjust";
  const notes = opts.det.notes.join(" ");
  const coaching =
    quality === "unsafe"
      ? STOP_COACH
      : `${notes} ${OBSERVATION_COACH}`;
  const speak =
    quality === "unsafe"
      ? STOP_SPEAK
      : OBSERVATION_SPEAK;
  const next =
    quality === "unsafe" ? STOP_NEXT : OBSERVATION_NEXT;
  return {
    tieGuess: opts.tie?.name ?? "freeform",
    stepGuess: "observation only",
    quality,
    seen: opts.det.notes,
    next,
    coaching,
    speak,
    circulation: true,
  };
}

export function applyModelSelfAudit(
  draft: LlmDraft,
  flags: { contradictsDet: boolean; hardLimit: boolean; invented: boolean },
): LlmDraft {
  const clean = sanitizeDraft(draft) ?? draft;
  if (!flags.hardLimit && !flags.contradictsDet && !flags.invented) return clean;
  if (flags.hardLimit) {
    return {
      ...clean,
      quality: "unsafe",
      coaching:
        "I cannot coach neck restraint, breath restriction, suspension, or another high-consequence setup from an image. Stop and fully release it.",
      next:
        "Do not proceed from camera feedback. If symptoms or immediate danger are present, follow the emergency guidance; otherwise use a qualified in-person instructor.",
      speak:
        "Stop and fully release the setup. Camera feedback cannot clear this activity.",
      circulation: true,
    };
  }
  if (flags.contradictsDet) {
    return {
      ...clean,
      quality: "unsafe",
      coaching: STOP_COACH,
      next:
        "Stop and fully release the setup. Use direct, nonvisual checks and escalate based on symptoms, not an image grade.",
      speak:
        "Stop and release. Treat the conflicting image grade as unreliable.",
      circulation: true,
    };
  }
  return {
    ...clean,
    quality: "adjust",
  };
}
