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
