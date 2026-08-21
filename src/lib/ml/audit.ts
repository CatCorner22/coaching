import type { Tie } from "@/lib/kb/types";
import { compactText, foldText, sanitizeDraft } from "./sanitize";
import type { AuditVerdict, DeterministicReport, LlmDraft, Prediction } from "./types";

const STOP_COACH =
  "Stop. Shears first. Check hands and throat. Do not add rope until she is pink, warm, and talking in full sentences.";
const STOP_NEXT = "Stop. Shears. Check hands and throat. Do not add rope.";
const STOP_SPEAK = "Stop. Check her hands and throat. Cut if you cannot make it right.";
const BANNED_COACH =
  "I will not coach neck restraint, breath play, or full suspension. Stay on the floor tie in front of you, shears in reach.";

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
  /collar (on|around|the )?(the )?(throat|neck)/i,
  /throat rope/i,
  /rope at the throat/i,
  /pressure on the throat/i,
  /gag and leave/i,
  /gag .{0,16}(leave|walk away)/i,
  /leave (her|him|them) (tied|alone)/i,
  /leave (her|him|them) tied/i,
  /around (her |his |their |the )?(neck|throat)/i,
  /full[-\s]?suspension/i,
  /restrict (her |his |their )?(air|breath|airway)/i,
  /(close|block|shut|cover) (her |his |their |the )?airway/i,
  /gag (her |them |him )?(and|&) leave/i,
  /collar (her |his |their |the )?(throat|neck)/i,
  /under the chin/i,
  /cinch(ing)? (her |his |their |the )?(throat|neck)/i,
  /wrap(ping)? (her |his |their |the )?(neck|throat)/i,
  /carotid/i,
  /noose/i,
  /garr?ot+e/i,
  /ligature/i,
  /blood choke/i,
  /both feet (off|leave)/i,
  /invert(ed|ing)? (hang|suspension)/i,
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

export function scrubBannedAnswer(s: string) {
  if (!textIsBanned(s)) return s;
  return BANNED_COACH;
}

const WEAK_NO = new Set(["neck", "throat", "breath", "air", "hang", "alone"]);

function dangerousWeak(k: string, hay: string) {
  const h = ` ${hay} `;
  if (k === "neck" || k === "throat") {
    return / (on|around|at|wrap|rope|collar|cinch|pressure) (her |his |the )?(neck|throat)|(neck|throat) (rope|collar|wrap|cinch|restraint)/.test(h);
  }
  if (k === "breath" || k === "air") {
    return /breath play|restrict .{0,12}(breath|air)|hold (her |his )?breath/.test(h);
  }
  if (k === "hang") {
    return /hang (her|him|them|from)/.test(h);
  }
  if (k === "alone") {
    return /left (tied and )?alone|tied and alone|leave (her|him|them) alone/.test(h);
  }
  return false;
}

/** Distinctive-token match for negotiated nos. Never keys generic words like "the" / "on". */
export function hitsHardNo(token: string, hayRaw: string): boolean {
  const t = String(token ?? "").trim();
  if (t.length < 2) return false;
  const original = String(hayRaw ?? "");
  if (/[^\u0000-\u00ff]/.test(t) && original.includes(t)) return true;

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
    if (!haySet.has(k)) return false;
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
    overrides.push("Local wrap/circulation model asked for an adjustment.");
  }
  if (opts.pred.recommend === "stop") {
    halt("Predictor vetoed continuation on rising risk.");
  }

  const fields = `${coaching} ${next} ${speak}`;
  if (textIsBanned(fields)) {
    droppedClaims.push("Removed disallowed coaching.");
    halt(
      "Banned coaching stripped.",
      "Stop. That suggestion is outside what this atelier will coach.",
      "I will not coach that. Stay with the floor tie. Check her throat and hands.",
      "I will not coach neck restraint, breath play, or full suspension. Stay on the floor tie in front of you.",
    );
  }

  const originalHay = `${base.coaching} ${base.next} ${base.speak} ${base.stepGuess}`;
  for (const no of opts.hardNos ?? []) {
    if (!hitsHardNo(no, originalHay)) continue;
    droppedClaims.push(`Honored negotiated no: ${no}`);
    halt(
      `Negotiated no (${no}) is a hard limit.`,
      "Stop. That is on your no list. Do not add it.",
      "That is a no. Do not add it. Check her.",
      `You marked “${String(no).slice(0, 80)}” as a no. I will not coach it. Stay with what is already on her and keep the throat empty.`,
    );
  }

  if (opts.det.neckRope > 0.1 && quality !== "unsafe") {
    quality = "adjust";
    next = "Look at the throat. Empty it. Do not add rope.";
    coaching = "Neck-zone rope signal. Confirm the throat is empty. Do not add wraps until it is.";
    speak = "Check the throat. Do not add rope.";
    overrides.push("Neck-zone density forced a throat check.");
  }

  if (opts.tie) {
    const max = Math.max(0, opts.tie.steps.length - 1);
    if (opts.stepIndex > max || opts.stepIndex < 0) {
      overrides.push("Step index clamped to the tie.");
    }
  }

  speak = speak.replace(/\s+/g, " ").trim().slice(0, 220);
  coaching = coaching.trim().slice(0, 900);
  next = next.trim().slice(0, 240);

  const passed = droppedClaims.length === 0;
  return {
    draft: {
      ...base,
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
  const step = opts.tie?.steps[opts.stepIndex];
  const quality =
    opts.det.recommend === "stop" || opts.pred.recommend === "stop"
      ? "unsafe"
      : opts.det.recommend === "adjust" || opts.pred.recommend === "adjust"
        ? "adjust"
        : "sound";
  const notes = opts.det.notes.join(" ");
  const coaching =
    quality === "unsafe"
      ? STOP_COACH
      : step
        ? `${notes} Expected now: ${step.rigger} Check: ${step.check}`
        : `${notes} Freeform — build only what you can name and undo.`;
  const speak =
    quality === "unsafe"
      ? STOP_SPEAK
      : step
        ? step.speak
        : "Count the wraps. Two fingers of space. Ask her how the hands feel.";
  const next =
    quality === "unsafe" ? STOP_NEXT : (step?.rigger ?? opts.pred.nextFailure);
  return {
    tieGuess: opts.tie?.name ?? "freeform",
    stepGuess: step?.title ?? "observation",
    quality,
    seen: opts.det.notes,
    next,
    coaching,
    speak,
    circulation: quality !== "sound",
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
      coaching: "I will not coach neck restraint, breath play, or full suspension. Stay on the floor tie in front of you.",
      next: "Stop. That suggestion is outside what this atelier will coach.",
      speak: "I will not coach that. Return to a floor tie and check her.",
      circulation: true,
    };
  }
  if (flags.contradictsDet) {
    return {
      ...clean,
      quality: "unsafe",
      coaching: STOP_COACH,
      next: "Stop. The still disagrees with that grade. Check her hands and throat.",
      speak: "Stop. Trust what you see on her, not the flattering grade.",
      circulation: true,
    };
  }
  return {
    ...clean,
    quality: "adjust",
  };
}
