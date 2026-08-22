import assert from "node:assert/strict";
import { test } from "node:test";

type Handler = ((ev?: unknown) => void) | null;

class FakeRecognition {
  continuous = false;
  interimResults = false;
  lang = "";
  onresult: Handler = null;
  onstart: Handler = null;
  onend: Handler = null;
  onerror: Handler = null;
  static instances: FakeRecognition[] = [];
  starts = 0;
  running = false;
  constructor() {
    FakeRecognition.instances.push(this);
  }
  start() {
    this.starts++;
    this.running = true;
    queueMicrotask(() => this.onstart?.());
  }
  stop() {
    this.running = false;
  }
  /** Browsers end recognition on their own after a stretch of silence. */
  endFromSilence() {
    this.running = false;
    this.onend?.();
  }
  speak(text: string) {
    // A recognizer that is not running hears nothing. That is the whole point.
    if (!this.running) return;
    this.onresult?.({ resultIndex: 0, results: [{ 0: { transcript: text }, isFinal: true }] });
  }
}

/** Deterministic clock + timers so the retry schedule can be driven exactly. */
function harness() {
  const timers: Array<{ id: number; fn: () => void; at: number }> = [];
  let now = 0;
  let nextId = 1;
  const realDateNow = Date.now;
  const realWindow = (globalThis as { window?: unknown }).window;
  (globalThis as Record<string, unknown>).window = {
    SpeechRecognition: FakeRecognition,
    setTimeout: (fn: () => void, ms: number) => {
      const id = nextId++;
      timers.push({ id, fn, at: now + ms });
      return id;
    },
    clearTimeout: (id: number) => {
      const index = timers.findIndex((t) => t.id === id);
      if (index >= 0) timers.splice(index, 1);
    },
  };
  Date.now = () => 1_700_000_000_000 + now;
  FakeRecognition.instances.length = 0;
  return {
    advance(ms: number) {
      now += ms;
      for (;;) {
        const due = timers.filter((t) => t.at <= now).sort((a, b) => a.at - b.at)[0];
        if (!due) break;
        timers.splice(timers.indexOf(due), 1);
        due.fn();
      }
    },
    flush: () => new Promise((resolve) => queueMicrotask(() => resolve(null))),
    restore() {
      Date.now = realDateNow;
      (globalThis as { window?: unknown }).window = realWindow;
    },
  };
}

test("the safeword listener survives a quiet scene", async () => {
  // Browsers end recognition on their own during silence. The retry budget used
  // to reset only on a speech result, so silence was indistinguishable from a
  // broken recognizer: five quiet cycles exhausted it and the listener stopped
  // for the rest of the scene — exactly when a safeword matters most, with a
  // quiet or gagged bottom, and having reported nothing louder than "idle".
  const h = harness();
  try {
    const { listenForWords } = await import("./listen.ts");
    const hits: string[] = [];
    const statuses: string[] = [];
    listenForWords(["red", "yellow"], (word) => hits.push(word), (status) => statuses.push(status));
    await h.flush();
    const rec = FakeRecognition.instances[0]!;

    for (let cycle = 0; cycle < 8; cycle++) {
      h.advance(30_000); // the recognizer runs through 30s of quiet
      await h.flush();
      rec.endFromSilence(); // then the browser ends it on its own
      h.advance(5_000);
      await h.flush();
    }
    assert.equal(
      statuses[statuses.length - 1],
      "active",
      "the listener went idle during an ordinary quiet stretch",
    );

    rec.speak("red");
    await h.flush();
    assert.deepEqual(hits, ["red"], "the safeword was not heard after a quiet stretch");
  } finally {
    h.restore();
  }
});

test("a recognizer that fails immediately still stops instead of restart-storming", async () => {
  // The budget must still do its original job: a recognizer whose every start
  // ends at once is genuinely broken, and retrying forever would burn battery
  // and the microphone without ever listening.
  const h = harness();
  try {
    const { listenForWords } = await import("./listen.ts");
    const statuses: string[] = [];
    listenForWords(["red"], () => {}, (status) => statuses.push(status));
    await h.flush();
    const rec = FakeRecognition.instances[0]!;
    const originalStart = rec.start.bind(rec);
    rec.start = () => {
      originalStart();
      queueMicrotask(() => rec.endFromSilence());
    };
    rec.endFromSilence();
    await h.flush();
    for (let i = 0; i < 12; i++) {
      h.advance(5_000);
      await h.flush();
      await h.flush();
    }
    assert.ok(rec.starts <= 8, `restart storm: ${rec.starts} starts`);
    assert.equal(statuses[statuses.length - 1], "idle");
  } finally {
    h.restore();
  }
});

test("safeword matching is bounded to whole words and debounced", async () => {
  const h = harness();
  try {
    const { listenForWords } = await import("./listen.ts");
    const hits: string[] = [];
    listenForWords(["red", "banana split"], (word) => hits.push(word));
    await h.flush();
    const rec = FakeRecognition.instances[0]!;

    // A safeword inside a longer word must not fire: "hundred" contains "red".
    rec.speak("a hundred percent fine");
    await h.flush();
    assert.deepEqual(hits, [], "a substring match fired a false stop");

    // Punctuation and case around the real word must still match.
    rec.speak("RED!");
    await h.flush();
    assert.deepEqual(hits, ["red"]);

    // Repeats inside the debounce window are one signal, not many.
    rec.speak("red red red");
    await h.flush();
    assert.deepEqual(hits, ["red"]);

    // A multi-word safeword works.
    h.advance(3_000);
    rec.speak("please, banana split, now");
    await h.flush();
    assert.deepEqual(hits, ["red", "banana split"]);
  } finally {
    h.restore();
  }
});

test("a result flushed after the mic is taken off is ignored", async () => {
  // Browsers can deliver one more result after stop(). Acting on it stopped a
  // session the user had just disarmed.
  const h = harness();
  try {
    const { listenForWords } = await import("./listen.ts");
    const hits: string[] = [];
    const dispose = listenForWords(["red"], (word) => hits.push(word));
    await h.flush();
    const rec = FakeRecognition.instances[0]!;

    rec.speak("red");
    await h.flush();
    assert.deepEqual(hits, ["red"], "an armed listener must hear the safeword");

    dispose();
    rec.running = true; // the browser still has one result queued
    rec.speak("red");
    await h.flush();
    assert.deepEqual(hits, ["red"], "a result after disposal must be ignored");
  } finally {
    h.restore();
  }
});

test("safewords still match when the recognizer punctuates them differently", async () => {
  // The same word arrives as "don't" or "dont", "co-signed" or "co signed",
  // depending on the recognizer. A safeword must not depend on which.
  const h = harness();
  try {
    const { listenForWords } = await import("./listen.ts");
    const hits: string[] = [];
    listenForWords(["don't", "co-signed"], (word) => hits.push(word));
    await h.flush();
    const rec = FakeRecognition.instances[0]!;

    rec.speak("she said dont");
    await h.flush();
    assert.deepEqual(hits, ["don't"], "an unpunctuated transcript must still match");

    h.advance(3_000);
    rec.speak("co signed");
    await h.flush();
    assert.deepEqual(hits, ["don't", "co-signed"], "a hyphen split across a space must match");
  } finally {
    h.restore();
  }
});
