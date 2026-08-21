import assert from "node:assert/strict";
import test from "node:test";
import {
  grokChat,
  grokProviderConfigured,
  parseJson,
  parseStrictJson,
  readTextBounded,
} from "../src/lib/ai/grok.ts";

test("parseJson accepts bounded fenced JSON and rejects malformed or oversized output", () => {
  assert.deepEqual(parseJson("```json\n{\"matches\":[]}\n```"), { matches: [] });
  assert.equal(parseJson("not json"), null);
  assert.equal(parseJson("{" + "x".repeat(300_000) + "}"), null);
});

test("parseStrictJson requires the entire structured-output payload to be JSON", () => {
  assert.deepEqual(parseStrictJson('{"matches":[]}'), { matches: [] });
  assert.equal(parseStrictJson('prefix {"matches":[]}'), null);
  assert.equal(parseStrictJson('{"matches":[]} suffix'), null);
  assert.equal(parseStrictJson('```json\n{"matches":[]}\n```'), null);
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

test("grokChat transports a strict structured-output contract without changing messages", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.XAI_API_KEY;
  let request;
  process.env.XAI_API_KEY = "test-key";
  globalThis.fetch = async (_url, init) => {
    request = JSON.parse(String(init?.body));
    return new Response(
      JSON.stringify({
        choices: [
          {
            message: { content: '{"matches":[],"audit":{}}', refusal: null },
            finish_reason: "stop",
          },
        ],
      }),
      { headers: { "content-type": "application/json" } },
    );
  };
  const responseFormat = {
    type: "json_schema",
    json_schema: {
      name: "bounded_categories",
      strict: true,
      schema: {
        type: "object",
        properties: { matches: { type: "array", maxItems: 12 } },
        required: ["matches"],
        additionalProperties: false,
      },
    },
  };
  try {
    const result = await grokChat({
      messages: [{ role: "user", content: "bounded" }],
      responseFormat,
    });
    assert.equal(result.ok, true);
    assert.deepEqual(request.response_format, responseFormat);
    assert.deepEqual(request.messages, [{ role: "user", content: "bounded" }]);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.XAI_API_KEY;
    else process.env.XAI_API_KEY = originalKey;
  }
});

test("grokChat recognizes bounded HTTP-200 refusals without exposing provider prose", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.XAI_API_KEY;
  process.env.XAI_API_KEY = "test-key";
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        choices: [
          {
            message: { content: null, refusal: "provider-specific private explanation" },
            finish_reason: "stop",
          },
        ],
      }),
      { headers: { "content-type": "application/json" } },
    );
  try {
    const result = await grokChat({ messages: [] });
    assert.equal(result.ok, false);
    assert.equal(result.refused, true);
    assert.equal(result.error, "xAI declined this media");
    assert.doesNotMatch(result.error, /private explanation/u);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.XAI_API_KEY;
    else process.env.XAI_API_KEY = originalKey;
  }
});

test("grokChat rejects partial and unterminated HTTP-200 output", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.XAI_API_KEY;
  process.env.XAI_API_KEY = "test-key";
  try {
    for (const finishReason of ["length", null, undefined]) {
      globalThis.fetch = async () =>
        new Response(
          JSON.stringify({
            choices: [
              {
                message: { content: '{"matches":[],"audit":{}}', refusal: null },
                ...(finishReason === undefined ? {} : { finish_reason: finishReason }),
              },
            ],
          }),
          { headers: { "content-type": "application/json" } },
        );
      const result = await grokChat({ messages: [] });
      assert.equal(result.ok, false, String(finishReason));
      assert.equal(result.refused, false, String(finishReason));
      assert.equal(result.error, "xAI returned an incomplete response", String(finishReason));
    }
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.XAI_API_KEY;
    else process.env.XAI_API_KEY = originalKey;
  }
});

test("grokChat marks only explicit structured safety errors as provider refusals", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.XAI_API_KEY;
  process.env.XAI_API_KEY = "test-key";
  try {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ error: { code: "invalid_request", type: "bad_request" } }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    const malformed = await grokChat({ messages: [] });
    assert.equal(malformed.ok, false);
    assert.equal(malformed.refused, false);

    globalThis.fetch = async () =>
      new Response(JSON.stringify({ error: { code: "content_policy_violation", type: "moderation" } }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    const policy = await grokChat({ messages: [] });
    assert.equal(policy.ok, false);
    assert.equal(policy.refused, true);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.XAI_API_KEY;
    else process.env.XAI_API_KEY = originalKey;
  }
});

test("provider configuration preflight rejects blank credentials without a request", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.XAI_API_KEY;
  let fetchCalled = false;
  process.env.XAI_API_KEY = "   ";
  globalThis.fetch = async () => {
    fetchCalled = true;
    throw new Error("fetch must not run");
  };
  try {
    assert.equal(grokProviderConfigured(), false);
    const result = await grokChat({ messages: [] });
    assert.equal(result.ok, false);
    assert.equal(result.error, "AI is not available in this environment");
    assert.equal(fetchCalled, false);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.XAI_API_KEY;
    else process.env.XAI_API_KEY = originalKey;
  }
});
