import assert from "node:assert/strict";
import { test } from "node:test";
import { useSession } from "./session.ts";

function fresh() {
  useSession.setState({
    tieSlug: undefined,
    furnitureSlug: undefined,
    stepIndex: 0,
    startedAt: null,
    lastCheckAt: null,
    elapsed: 0,
    listening: false,
    stopped: false,
    stopReason: undefined,
  });
}

test("changing the tie does not clear a safeword stop", () => {
  fresh();
  useSession.getState().stop("safeword");
  useSession.getState().setTie("karada");
  assert.equal(useSession.getState().stopped, true);
  assert.equal(useSession.getState().stopReason, "safeword");
  assert.equal(useSession.getState().tieSlug, undefined);
});

test("setStep is a no-op after stop", () => {
  fresh();
  useSession.getState().setStep(2);
  assert.equal(useSession.getState().stepIndex, 2);
  useSession.getState().stop("coach");
  useSession.getState().setStep(3);
  assert.equal(useSession.getState().stepIndex, 2);
});

test("start is a no-op after stop; reset is the only way out", () => {
  fresh();
  useSession.getState().start();
  useSession.getState().stop("coach");
  const startedAt = useSession.getState().startedAt;
  useSession.getState().start();
  assert.equal(useSession.getState().stopped, true);
  assert.equal(useSession.getState().startedAt, startedAt);
  useSession.getState().reset();
  assert.equal(useSession.getState().stopped, false);
  assert.ok(useSession.getState().startedAt);
});

test("furniture cannot change after a halt", () => {
  fresh();
  useSession.getState().setFurniture("hismith");
  assert.equal(useSession.getState().furnitureSlug, "hismith");
  useSession.getState().stop("safeword");
  useSession.getState().setFurniture("pole");
  assert.equal(useSession.getState().furnitureSlug, "hismith");
  assert.equal(useSession.getState().stopped, true);
});

test("tick is a no-op after stop and when the second has not advanced", () => {
  fresh();
  useSession.getState().start();
  const t0 = useSession.getState().startedAt!;
  useSession.getState().tick(t0 + 2500);
  assert.equal(useSession.getState().elapsed, 2);
  useSession.getState().tick(t0 + 2800);
  assert.equal(useSession.getState().elapsed, 2);
  useSession.getState().stop("manual");
  useSession.getState().tick(t0 + 9000);
  assert.equal(useSession.getState().elapsed, 2);
});

test("tick never stores a negative elapsed under clock skew", () => {
  fresh();
  useSession.getState().start();
  const t0 = useSession.getState().startedAt!;
  useSession.getState().tick(t0 - 5000);
  assert.equal(useSession.getState().elapsed, 0);
});

test("yellow is information, not a stop", () => {
  // The knowledge base is explicit that red ends the night and yellow changes
  // it. Yellow used to call stop(), which raised the full red alert including
  // the call-emergency-services text — and a yellow that ends the scene is a
  // yellow people stop saying.
  const s = useSession.getState();
  s.reset();
  s.flagYellow();
  assert.equal(useSession.getState().stopped, false, "yellow must not stop the session");
  assert.ok(useSession.getState().yellowAt, "yellow must raise its own flag");

  // Re-flagging while one already stands must not restart the clock on a
  // check-in that has not happened yet.
  const first = useSession.getState().yellowAt;
  s.flagYellow();
  assert.equal(useSession.getState().yellowAt, first);

  // The top clears it after actually checking in.
  s.clearYellow();
  assert.equal(useSession.getState().yellowAt, null);

  // Red supersedes an outstanding yellow rather than stacking with it.
  s.flagYellow();
  s.stop("safeword");
  assert.equal(useSession.getState().stopped, true);
  assert.equal(useSession.getState().yellowAt, null);
  assert.equal(useSession.getState().stopReason, "safeword");

  // A yellow cannot be raised on top of a stop.
  s.flagYellow();
  assert.equal(useSession.getState().yellowAt, null);

  // Reset clears both.
  s.reset();
  assert.equal(useSession.getState().stopped, false);
  assert.equal(useSession.getState().yellowAt, null);
  assert.equal(useSession.getState().stopReason, undefined);
});

test("a stop called late in a long session survives a reload", async () => {
  const { withinSessionWindow } = await import("./session.ts");
  const longAgo = Date.now() - 13 * 60 * 60_000;
  // Judging the snapshot by its start time alone expired a stop that was
  // called seconds ago, so a reload came back unstopped mid-scene.
  assert.equal(
    withinSessionWindow({ startedAt: longAgo, lastCheckAt: longAgo }),
    false,
  );
  assert.equal(
    withinSessionWindow({
      startedAt: longAgo,
      lastCheckAt: longAgo,
      stopped: true,
      stopReason: "safeword",
      stoppedAt: Date.now() - 5_000,
    }),
    true,
  );
});

test("a write that storage refused is retried, not cached as saved", async () => {
  const { unchangedWriteSkippingStorage } = await import("./session.ts");
  const { resetPersistFailure } = await import("./persist.ts");
  resetPersistFailure();
  let blocked = true;
  const written: string[] = [];
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: () => null,
      setItem: (_name: string, value: string) => {
        if (blocked) throw new DOMException("quota", "QuotaExceededError");
        written.push(value);
      },
      removeItem: () => undefined,
    },
  });
  try {
    const storage = unchangedWriteSkippingStorage<{ state: { stopped: boolean } }>();
    const payload = { state: { stopped: true }, version: 0 } as never;
    storage.setItem("knotty-session", payload);
    assert.deepEqual(written, []);
    // Same payload, storage recovered: skipping it because the identical write
    // was "already made" meant a called stop never reached disk.
    blocked = false;
    storage.setItem("knotty-session", payload);
    assert.equal(written.length, 1);
    // A genuinely unchanged write after a successful one is still skipped.
    storage.setItem("knotty-session", payload);
    assert.equal(written.length, 1);
  } finally {
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else Reflect.deleteProperty(globalThis, "localStorage");
    resetPersistFailure();
  }
});

test("a stale tab cannot erase a stop another tab called", async () => {
  const { mergeSessionSafety } = await import("./session.ts");
  const stopped = {
    stopped: true,
    stopReason: "safeword",
    stoppedAt: Date.now() - 5_000,
    startedAt: Date.now() - 13 * 60 * 60_000,
  };

  // The stale tab is still ticking a running session and writes the whole blob.
  const stale = {
    stopped: false,
    stopReason: undefined,
    stoppedAt: null,
    startedAt: stopped.startedAt,
  };
  const merged = mergeSessionSafety(stale, stopped);
  assert.equal(merged.stopped, true);
  assert.equal(merged.stopReason, "safeword");
  assert.equal(merged.stoppedAt, stopped.stoppedAt);

  // A session that provably began after the stop is a restart, and clears it.
  const restarted = {
    stopped: false,
    stopReason: undefined,
    stoppedAt: null,
    startedAt: Date.now(),
  };
  assert.equal(mergeSessionSafety(restarted, stopped).stopped, false);

  // A tab holding the same stop writes its own payload untouched.
  assert.equal(mergeSessionSafety(stopped, stopped), stopped);

  // Nothing stored, nothing to protect.
  assert.equal(mergeSessionSafety(stale, null), stale);
});

test("a stopped session outside the safety window is cleared", async () => {
  const { mergeSessionSafety } = await import("./session.ts");
  const stale = {
    startedAt: Date.now() - 13 * 60 * 60_000,
    stopped: true,
    stopReason: "safeword",
    stoppedAt: Date.now() - 13 * 60 * 60_000,
  };
  const merged = mergeSessionSafety(
    { startedAt: Date.now(), stopped: false, stoppedAt: null, stopReason: undefined },
    stale,
  );
  assert.equal(merged.stopped, false);
  assert.equal(merged.stoppedAt, null);
  assert.equal(merged.stopReason, undefined);
});
