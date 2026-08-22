import assert from "node:assert/strict";
import test from "node:test";
import {
  PREVIEW_BRIDGE_CHANNEL,
  PREVIEW_BRIDGE_VERSION,
  parsePreviewHostMessage,
} from "./preview-host-bridge.ts";

const envelope = {
  channel: PREVIEW_BRIDGE_CHANNEL,
  version: PREVIEW_BRIDGE_VERSION,
};

test("preview bridge accepts only the three bounded host commands", () => {
  assert.deepEqual(parsePreviewHostMessage({ ...envelope, type: "hello" }), {
    type: "hello",
  });
  assert.deepEqual(
    parsePreviewHostMessage({ ...envelope, type: "navigate", path: "/studio?from=host" }),
    { type: "navigate", path: "/studio?from=host" },
  );
  assert.deepEqual(parsePreviewHostMessage({ ...envelope, type: "history", delta: -1 }), {
    type: "history",
    delta: -1,
  });
  assert.deepEqual(parsePreviewHostMessage({ ...envelope, type: "history", delta: 1 }), {
    type: "history",
    delta: 1,
  });
});

test("preview bridge rejects malformed, stale, and over-broad commands", () => {
  for (const value of [
    null,
    [],
    "hello",
    {},
    { ...envelope, type: "" },
    { ...envelope, version: PREVIEW_BRIDGE_VERSION + 1, type: "hello" },
    { ...envelope, channel: "lookalike", type: "hello" },
    { ...envelope, type: "unknown" },
    { ...envelope, type: "navigate" },
    { ...envelope, type: "navigate", path: 42 },
    { ...envelope, type: "navigate", path: "" },
    { ...envelope, type: "history", delta: 0 },
    { ...envelope, type: "history", delta: 2 },
    { ...envelope, type: "history", delta: "-1" },
  ]) {
    assert.equal(parsePreviewHostMessage(value), null);
  }
});
