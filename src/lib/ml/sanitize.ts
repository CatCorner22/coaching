import { clamp01 } from "./signal";
import type { DeterministicReport, LlmDraft, SafetyFlag, WrapBand } from "./types";

const IMAGE = /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=\s]+$/i;
const MAX_DATA_URL = 900000;
const QUALITY = new Set(["sound", "adjust", "unsafe"]);
const FLAG_CODES = new Set<SafetyFlag["code"]>([
  "neck",
  "circulation",
  "time",
  "radial",
  "peroneal",
  "breathing",
  "unknown",
]);

export function foldText(s: string) {
  return String(s ?? "")
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF\u00AD\u2060\u180E]/g, "")
    .replace(/[еэєёЕЭЄЁεΕ]/g, "e")
    .replace(/[аАαΑ]/g, "a")
    .replace(/[оОοΟ]/g, "o")
    .replace(/[рРρΡ]/g, "p")
    .replace(/[сС]/g, "c")
    .replace(/[іıІιΙ]/g, "i")
    .replace(/[хХχΧ]/g, "x")
    .replace(/[уУυΥ]/g, "y")
    .replace(/[кКκΚ]/g, "k")
    .replace(/[нНηΗ]/g, "h")
    .replace(/[тТτΤ]/g, "t")
    .replace(/[вВν]/g, "n")
    .replace(/[мМμΜ]/g, "m")
    .replace(/[4@]/g, "a")
    .replace(/[1!]/g, "i")
    .replace(/0/g, "o")
    .replace(/3/g, "e")
    .replace(/\$/g, "s")
    .toLowerCase()
    .replace(/[^a-z]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function compactText(s: string) {
  return foldText(s).replace(/ /g, "");
}

export function isCameraDataUrl(s: string) {
  if (typeof s !== "string") return false;
  if (s.length < 32 || s.length > MAX_DATA_URL) return false;
  if (/svg|script|https?:|ftp:|file:|charset/i.test(s.slice(0, 48))) return false;
  if (!IMAGE.test(s)) return false;
  const comma = s.indexOf(",");
  if (comma < 0) return false;
  const b64 = s.slice(comma + 1).replace(/\s+/g, "");
  if (b64.length < 24 || b64.length % 4 !== 0) return false;
  try {
    const bytes = Uint8Array.from(atob(b64.slice(0, 32)), (c) => c.charCodeAt(0));
    return looksLikeImage(bytes);
  } catch {
    return false;
  }
}

function looksLikeImage(b: Uint8Array) {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return true;
  if (b.length >= 4 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return true;
  if (
    b.length >= 12 &&
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 &&
    b[8] === 0x57 &&
    b[9] === 0x45 &&
    b[10] === 0x42 &&
    b[11] === 0x50
  ) {
    return true;
  }
  return false;
}

export function sanitizeQuestion(q: unknown, max = 400) {
  const s = typeof q === "string" ? q : "";
  return s
    .replace(/ignore (all |any |the |previous |prior |above |system )?instructions?/gi, "")
    .replace(/you are now/gi, "")
    .replace(/jailbreak/gi, "")
    .replace(/system prompt/gi, "")
    .replace(/developer message/gi, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u200B-\u200D\uFEFF]/g, "")
    .trim()
    .slice(0, max);
}

function sanitizeWrapBands(raw: unknown): WrapBand[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(0, 16)
    .map((b) => {
      const row = b as { yNorm?: unknown; strength?: unknown };
      const y = Number(row?.yNorm);
      const s = Number(row?.strength);
      if (!Number.isFinite(y) || !Number.isFinite(s)) return null;
      return {
        yNorm: clamp01(y),
        strength: Math.max(0, Math.min(8, s)),
      };
    })
    .filter((b): b is WrapBand => !!b && (b.strength > 0 || b.yNorm > 0));
}

export function sanitizeDet(raw: DeterministicReport): DeterministicReport {
  const neckRope = clamp01(Number(raw?.neckRope) || 0);
  const paleness = clamp01(Number(raw?.paleness) || 0);
  const palenessDelta = Math.max(-1, Math.min(1, Number(raw?.palenessDelta) || 0));
  const motion = clamp01(Number(raw?.motion) || 0);
  const wrapCount = Math.max(0, Math.min(40, Math.round(Number(raw?.wrapCount) || 0)));
  const flags: SafetyFlag[] = Array.isArray(raw?.flags)
    ? raw.flags
        .filter((f) => f && typeof f.note === "string")
        .slice(0, 12)
        .map((f) => ({
          code: FLAG_CODES.has(f.code as SafetyFlag["code"]) ? (f.code as SafetyFlag["code"]) : "unknown",
          severity: f.severity === "stop" || f.severity === "watch" || f.severity === "info" ? f.severity : "watch",
          note: sanitizeQuestion(f.note, 240),
        }))
    : [];
  if (neckRope > 0.16 && !flags.some((f) => f.code === "neck" && f.severity === "stop")) {
    flags.push({
      code: "neck",
      severity: "stop",
      note: "Neck-zone density on the still. Confirm the throat is empty.",
    });
  }
  if (paleness > 0.78 && !flags.some((f) => f.code === "circulation" && f.severity === "stop")) {
    flags.push({
      code: "circulation",
      severity: "stop",
      note: "Hands look too pale. Strip distal rope.",
    });
  }
  let recommend: DeterministicReport["recommend"] = raw?.recommend;
  if (recommend !== "continue" && recommend !== "adjust" && recommend !== "stop") recommend = "adjust";
  if (flags.some((f) => f.severity === "stop") || neckRope > 0.16 || paleness > 0.78) {
    recommend = "stop";
  } else if (flags.some((f) => f.severity === "watch") && recommend === "continue") {
    recommend = "adjust";
  }
  return {
    wrapCount,
    wrapBands: sanitizeWrapBands(raw?.wrapBands),
    neckRope,
    paleness,
    palenessDelta,
    motion,
    flags,
    recommend,
    notes: Array.isArray(raw?.notes)
      ? raw.notes.map((n) => sanitizeQuestion(n, 200)).filter(Boolean).slice(0, 8)
      : [],
  };
}

export function sanitizeDraft(raw: unknown): LlmDraft | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  const quality = QUALITY.has(String(d.quality)) ? (d.quality as LlmDraft["quality"]) : "adjust";
  return {
    tieGuess: String(d.tieGuess ?? "freeform").slice(0, 80),
    stepGuess: String(d.stepGuess ?? "observation").slice(0, 80),
    quality,
    seen: Array.isArray(d.seen) ? d.seen.map((x) => sanitizeQuestion(x, 160)).filter(Boolean).slice(0, 8) : [],
    next: String(d.next ?? "").slice(0, 240),
    coaching: String(d.coaching ?? "").slice(0, 900),
    speak: String(d.speak ?? "").slice(0, 220),
    circulation: d.circulation === true,
  };
}

export function clampStep(stepIndex: number, len: number) {
  if (!Number.isFinite(stepIndex)) return 0;
  if (len <= 0) return 0;
  return Math.max(0, Math.min(len - 1, Math.round(stepIndex)));
}
