import assert from "node:assert/strict";
import { test } from "node:test";
import {
  canRegisterEmergencyWorker,
  EMERGENCY_WORKER_URL,
  registerEmergencyWorker,
  type WorkerHost,
} from "./offline-emergency.ts";

const ok: WorkerHost = { serviceWorker: { register: () => Promise.resolve({}) } };

test("an unsupported or insecure context simply declines", () => {
  // Registering over plain HTTP throws rather than resolving, which is the case
  // that actually bites: the app served to a phone on the LAN.
  assert.equal(canRegisterEmergencyWorker(undefined, true), false);
  assert.equal(canRegisterEmergencyWorker({}, true), false);
  assert.equal(canRegisterEmergencyWorker({ serviceWorker: {} } as WorkerHost, true), false);
  assert.equal(canRegisterEmergencyWorker(ok, false), false);
  assert.equal(canRegisterEmergencyWorker(ok, true), true);
  // A runtime that does not report secureContext at all (node, jsdom) is not a
  // refusal — only an explicit false is.
  assert.equal(canRegisterEmergencyWorker(ok, undefined), true);
});

test("registration reports failure instead of throwing into the app", async () => {
  // A missing offline fallback must never break the online app.
  assert.equal(await registerEmergencyWorker(undefined, true), false);
  assert.equal(await registerEmergencyWorker(ok, false), false);
  assert.equal(
    await registerEmergencyWorker(
      { serviceWorker: { register: () => Promise.reject(new Error("blocked in sandbox")) } },
      true,
    ),
    false,
  );
  assert.equal(
    await registerEmergencyWorker(
      {
        serviceWorker: {
          register: () => {
            throw new DOMException("storage disabled", "SecurityError");
          },
        },
      },
      true,
    ),
    false,
  );
});

test("it registers the worker at the root scope", async () => {
  // Scope matters: a worker scoped below / cannot answer a /emergency
  // navigation, which would make the whole feature silently inert.
  const calls: { url: string; scope?: string }[] = [];
  const host: WorkerHost = {
    serviceWorker: {
      register: (url, options) => {
        calls.push({ url, scope: options?.scope });
        return Promise.resolve({});
      },
    },
  };
  assert.equal(await registerEmergencyWorker(host, true), true);
  assert.deepEqual(calls, [{ url: EMERGENCY_WORKER_URL, scope: "/" }]);
  assert.equal(EMERGENCY_WORKER_URL, "/sw.js");
});
