import assert from "node:assert/strict";
import test from "node:test";
import { parseJson, readTextBounded } from "../src/lib/ai/grok.ts";

test("parseJson accepts bounded fenced JSON and rejects malformed or oversized output", () => {
  assert.deepEqual(parseJson("```json\n{\"matches\":[]}\n```"), { matches: [] });
  assert.equal(parseJson("not json"), null);
  assert.equal(parseJson("{" + "x".repeat(300_000) + "}"), null);
});

test("readTextBounded cancels an upstream body that exceeds the byte budget", async () => {
  let cancelled = false;
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(8));
      controller.enqueue(new Uint8Array(8));
    },
    cancel() {
      cancelled = true;
    },
  });
  await assert.rejects(readTextBounded(new Response(body), 12), /too large/i);
  assert.equal(cancelled, true);
});

test("readTextBounded reconstructs multibyte UTF-8 across stream chunks", async () => {
  const encoded = new TextEncoder().encode("limited observation ✓");
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(encoded.slice(0, encoded.length - 2));
      controller.enqueue(encoded.slice(encoded.length - 2));
      controller.close();
    },
  });
  assert.equal(await readTextBounded(new Response(body), 100), "limited observation ✓");
});

