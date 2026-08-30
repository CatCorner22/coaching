/**
 * Browser speech listener for spoken safewords.
 *
 * Split out of play.ts, which imports the server-side voice function: that made
 * this safety-critical listener impossible to load — and therefore to test —
 * outside a browser. It has no dependencies of its own.
 */
type Rec = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((ev: unknown) => void) | null;
  onerror: ((ev: unknown) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export function listenForWords(
  words: string[],
  onHit: (word: string) => void,
  onStatus?: (status: "starting" | "active" | "idle" | "error" | "unsupported") => void,
): () => void {
  const SR =
    (window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec })
      .SpeechRecognition ??
    (window as unknown as { webkitSpeechRecognition?: new () => Rec }).webkitSpeechRecognition;
  if (!SR) {
    onStatus?.("unsupported");
    return () => undefined;
  }
  const rec = new SR();
  let disposed = false;
  let fatal = false;
  let restartAttempts = 0;
  let restartTimer: number | null = null;
  let sessionStartedAt = 0;
  // A recognizer that ran for a meaningful stretch before ending was working.
  // Below this, repeated end-immediately cycles are a real fault and should
  // consume the retry budget.
  const HEALTHY_SESSION_MS = 1_000;
  const report = (status: "starting" | "active" | "idle" | "error" | "unsupported") => {
    if (!disposed) onStatus?.(status);
  };
  rec.continuous = true;
  rec.interimResults = false;
  rec.lang = "en-US";
  const last = new Map<string, number>();
  // A safeword is called out, not mentioned in passing. Without this, ordinary
  // scene talk stopped the session: with a custom safeword the hardcoded "red"
  // fired on "hand me the red rope" and "her marks are going red", and the
  // default safeword IS "red", so the same sentences broke it out of the box.
  // Two words of room around the safeword covers how it is actually said —
  // "red", "red red red", "ok red", "im calling red" — while a sentence that
  // merely contains it does not fire.
  // Recognizers are inconsistent about apostrophes and hyphens: the same word
  // arrives as "don't" or "dont", "co-signed" or "co signed". Normalise both
  // sides identically so a safeword spelled either way still matches.
  const spoken = (value: string) =>
    value
      .toLowerCase()
      .replace(/['’]/gu, "")
      .replace(/[-–—]/gu, " ")
      .replace(/\s+/gu, " ");
  const UTTERANCE_SLACK_WORDS = 2;
  const wordsIn = (value: string): string[] => value.match(/[a-z0-9]+/gu) ?? [];
  const wordCount = (value: string) => wordsIn(value).length;
  // Two words of room is too tight for how a safeword is actually called under
  // stress — "red stop now please" and "wait wait red red red stop" are both
  // real calls and both were silently discarded. So a longer utterance still
  // counts as a call when everything around the safeword is call-out language:
  // the words below plus the configured safewords themselves. Deliberately no
  // nouns, so "hand me the red rope" and "her marks are going red" stay quiet.
  const CALLOUT_WORDS = new Set([
    "a", "again", "all", "alright", "am", "and", "call", "calling", "cut", "done",
    "down", "enough", "get", "go", "hey", "hold", "i", "im", "is", "it", "let",
    "me", "my", "need", "no", "now", "off", "ok", "okay", "on", "out", "please",
    "really", "right", "safeword", "say", "saying", "seriously", "stop",
    "stopping", "this", "to", "up", "wait", "yes",
  ]);
  // Past this a transcript is a paragraph of scene talk, not a call, whatever
  // it is made of.
  const MAX_CALLOUT_WORDS = 12;
  const isCallOut = (transcript: string, needle: string, allWords: string[]) => {
    const tokens = wordsIn(transcript);
    if (tokens.length > MAX_CALLOUT_WORDS) return false;
    const safewordTokens = new Set(allWords.flatMap((word) => wordsIn(spoken(word))));
    const needleTokens = wordsIn(needle);
    return tokens.every(
      (token) =>
        needleTokens.includes(token) || safewordTokens.has(token) || CALLOUT_WORDS.has(token),
    );
  };
  rec.onresult = (ev: unknown) => {
    // Browsers can flush a final result after stop(). Without this, taking the
    // mic off and then being overheard saying the safeword stopped a session
    // the user had just disarmed.
    if (disposed) return;
    restartAttempts = 0;
    const e = ev as {
      resultIndex: number;
      results: ArrayLike<{ 0: { transcript: string }; isFinal?: boolean }>;
    };
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = ` ${spoken(e.results[i]![0]!.transcript)} `;
      const now = Date.now();
      for (const w of words) {
        const needle = spoken(w).trim();
        if (!needle) continue;
        const re = new RegExp(`(?:^|[^a-z0-9])${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:[^a-z0-9]|$)`);
        if (!re.test(t)) continue;
        if (
          wordCount(t) > wordCount(needle) + UTTERANCE_SLACK_WORDS &&
          !isCallOut(t, needle, words)
        )
          continue;
        if ((last.get(w) ?? 0) + 2500 > now) continue;
        last.set(w, now);
        onHit(w);
      }
    }
  };
  rec.onstart = () => {
    sessionStartedAt = Date.now();
    report("active");
  };
  const scheduleRestart = () => {
    if (disposed || fatal || restartTimer !== null) return;
    if (restartAttempts >= 5) {
      report("idle");
      return;
    }
    report("starting");
    const delay = Math.min(4_000, 250 * 2 ** restartAttempts);
    restartTimer = window.setTimeout(() => {
      restartTimer = null;
      if (disposed || fatal) return;
      restartAttempts += 1;
      try {
        rec.start();
      } catch {
        scheduleRestart();
      }
    }, delay);
  };
  rec.onerror = (event: unknown) => {
    const code = (event as { error?: string }).error;
    if (code === "not-allowed" || code === "service-not-allowed") {
      fatal = true;
      report("error");
    }
  };
  rec.onend = () => {
    // Browsers end recognition on their own after a stretch of silence, which
    // is normal — and it is exactly what a quiet or gagged bottom produces.
    // The budget used to reset only on a speech result, so silence was
    // indistinguishable from a broken recognizer: five quiet cycles exhausted
    // it and the listener stopped for the rest of the scene, having reported
    // nothing louder than "idle". Session duration is what actually separates
    // the two cases.
    if (sessionStartedAt > 0 && Date.now() - sessionStartedAt >= HEALTHY_SESSION_MS) {
      restartAttempts = 0;
    }
    sessionStartedAt = 0;
    scheduleRestart();
  };
  report("starting");
  try {
    rec.start();
  } catch {
    report("error");
  }
  return () => {
    disposed = true;
    if (restartTimer !== null) {
      window.clearTimeout(restartTimer);
      restartTimer = null;
    }
    try {
      rec.stop();
    } catch {
      /* ignore */
    }
  };
}
