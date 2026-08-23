import assert from "node:assert/strict";
import { test } from "node:test";
import {
  acquireWakeLock,
  cadenceAnnouncement,
  checkCadence,
  CHECK_DUE_PULSE,
  DEFAULT_CHECK_MINUTES,
  formatClock,
  MAX_CHECK_MINUTES,
  MIN_CHECK_MINUTES,
  normalizeCheckMinutes,
  pulse,
} from "./rig.ts";

const MIN = 60_000;

test("an unstarted session is not overdue", () => {
  // A screen that opens already shouting teaches people to ignore it.
  for (const last of [null, undefined, 0, -1, Number.NaN]) {
    const c = checkCadence(last as number | null, 5_000_000, 4);
    assert.equal(c.overdue, false, String(last));
    assert.equal(c.overdueSec, 0);
    assert.equal(c.progress, 0);
    assert.equal(c.remainingSec, 240);
    assert.equal(c.phase, "ok");
  }
});

test("the countdown runs down and then over", () => {
  const base = 1_700_000_000_000;
  const at = (ms: number) => checkCadence(base, base + ms, 4);

  assert.deepEqual(
    { r: at(0).remainingSec, p: at(0).phase },
    { r: 240, p: "ok" },
  );
  assert.equal(at(1 * MIN).remainingSec, 180);
  assert.equal(at(1 * MIN).phase, "ok");
  // Last quarter of the interval warns before it elapses.
  assert.equal(at(3 * MIN).phase, "soon");
  assert.equal(at(3 * MIN).remainingSec, 60);
  // Exactly on the interval is not yet over it.
  assert.equal(at(4 * MIN).overdue, false);
  assert.equal(at(4 * MIN).remainingSec, 0);
  assert.equal(at(4 * MIN).progress, 1);
  assert.equal(at(4 * MIN + 1000).overdue, true);
  assert.equal(at(4 * MIN + 1000).overdueSec, 1);
  assert.equal(at(4 * MIN + 1000).phase, "overdue");
  assert.equal(at(10 * MIN).overdueSec, 360);
  // Progress never exceeds a full ring, however far past it runs.
  assert.equal(at(99 * MIN).progress, 1);
});

test("a backwards wall clock reads as a fresh interval, never as overdue", () => {
  // A device syncing time or a manual clock change used to render negative
  // elapsed seconds straight onto the screen.
  const base = 1_700_000_000_000;
  const c = checkCadence(base, base - 10 * MIN, 4);
  assert.equal(c.overdue, false);
  assert.equal(c.overdueSec, 0);
  assert.equal(c.remainingSec, 240);
  assert.equal(c.progress, 0);
});

test("a hostile interval setting still yields a renderable clock", () => {
  assert.equal(normalizeCheckMinutes(4), 4);
  assert.equal(normalizeCheckMinutes("7"), 7);
  assert.equal(normalizeCheckMinutes(3.4), 3);
  assert.equal(normalizeCheckMinutes(0), MIN_CHECK_MINUTES);
  assert.equal(normalizeCheckMinutes(-99), MIN_CHECK_MINUTES);
  assert.equal(normalizeCheckMinutes(10_000), MAX_CHECK_MINUTES);
  for (const bad of [undefined, null, "", "abc", {}, [], Number.NaN, Infinity]) {
    assert.equal(normalizeCheckMinutes(bad), DEFAULT_CHECK_MINUTES, String(bad));
  }
  // And the cadence itself never divides by zero or renders NaN.
  const c = checkCadence(1, 1 + 60_000, 0);
  assert.ok(Number.isFinite(c.progress) && Number.isFinite(c.remainingSec));
});

test("the clock never renders NaN or a negative time", () => {
  assert.equal(formatClock(0), "0:00");
  assert.equal(formatClock(9), "0:09");
  assert.equal(formatClock(69), "1:09");
  assert.equal(formatClock(600), "10:00");
  assert.equal(formatClock(3599), "59:59");
  assert.equal(formatClock(3600), "1:00:00");
  assert.equal(formatClock(3661), "1:01:01");
  assert.equal(formatClock(86_399), "23:59:59");
  for (const bad of [-1, -10_000, Number.NaN, Infinity, -Infinity]) {
    assert.match(formatClock(bad), /^\d+:\d{2}(:\d{2})?$/, String(bad));
  }
  assert.equal(formatClock(-5), "0:00");
});

test("the spoken cadence says it is a reminder, not a deadline", () => {
  const base = 1_700_000_000_000;
  const soon = cadenceAnnouncement(checkCadence(base, base + 60_000, 4));
  assert.match(soon, /Next direct-check reminder in 3:00/);
  const late = cadenceAnnouncement(checkCadence(base, base + 5 * MIN, 4));
  assert.match(late, /elapsed 1:00 ago/);
  assert.match(late, /Not a deadline/);
});

test("haptics report failure instead of pretending to have buzzed", () => {
  // No Vibration API at all: desktop, and every iOS browser.
  assert.equal(pulse(CHECK_DUE_PULSE, undefined), false);
  assert.equal(pulse(CHECK_DUE_PULSE, {}), false);
  // Present but refused, which a browser does without a user gesture.
  assert.equal(pulse(CHECK_DUE_PULSE, { vibrate: () => false }), false);
  // Present and throwing, which a hardened/embedded browser does.
  assert.equal(
    pulse(CHECK_DUE_PULSE, {
      vibrate: () => {
        throw new Error("blocked by permissions policy");
      },
    }),
    false,
  );
  let got: number | number[] | undefined;
  assert.equal(
    pulse(CHECK_DUE_PULSE, {
      vibrate: (p) => {
        got = p;
        return true;
      },
    }),
    true,
  );
  assert.deepEqual(got, CHECK_DUE_PULSE);
});

test("an unavailable wake lock is null, never a thrown error", async () => {
  // Plain HTTP, an unsupported browser, and a backgrounded tab all land here,
  // and the screen's job is to say so rather than to break.
  assert.equal(await acquireWakeLock(undefined), null);
  assert.equal(await acquireWakeLock({}), null);
  assert.equal(
    await acquireWakeLock({
      wakeLock: {
        request: () => Promise.reject(new DOMException("not allowed", "NotAllowedError")),
      },
    }),
    null,
  );
  // A sentinel that is not actually usable is refused rather than handed back.
  assert.equal(
    await acquireWakeLock({
      wakeLock: { request: () => Promise.resolve({} as { release: () => Promise<void> }) },
    }),
    null,
  );
});

test("a held wake lock releases once, and a failing release is not an error", async () => {
  let releases = 0;
  const handle = await acquireWakeLock({
    wakeLock: {
      request: () =>
        Promise.resolve({
          release: () => {
            releases += 1;
            return Promise.resolve();
          },
        }),
    },
  });
  assert.ok(handle);
  await handle.release();
  assert.equal(releases, 1);

  // Releasing a lock the browser already dropped must not reject: this runs in
  // an unmount cleanup, where a rejection becomes an unhandled rejection.
  const flaky = await acquireWakeLock({
    wakeLock: {
      request: () =>
        Promise.resolve({ release: () => Promise.reject(new Error("already released")) }),
    },
  });
  assert.ok(flaky);
  await flaky.release();
});
