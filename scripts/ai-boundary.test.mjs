import assert from "node:assert/strict";
import test from "node:test";
import {
  GROK_ZDR_ERROR,
  GROK_ZDR_RESPONSE_ERROR,
  grokChat,
  grokProviderConfigured,
  parseJson,
  parseStrictJson,
  readTextBounded,
} from "../src/lib/ai/grok.ts";
import { requestGrokVoice } from "../src/lib/ai/voice-provider.ts";

function zdrResponse(body = "", init = {}) {
  const headers = new Headers(init.headers);
  if (!headers.has("content-type")) headers.set("content-type", "application/json");
  headers.set("x-zero-data-retention", "true");
  return new Response(body, { ...init, headers });
}

function restoreEnv(name, value) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

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
  const originalZdr = process.env.XAI_REQUIRE_ZERO_DATA_RETENTION;
  let request;
  process.env.XAI_API_KEY = "test-key";
  process.env.XAI_REQUIRE_ZERO_DATA_RETENTION = "true";
  globalThis.fetch = async (_url, init) => {
    request = JSON.parse(String(init?.body));
    return zdrResponse(
      JSON.stringify({
        choices: [
          {
            message: { content: '{"matches":[],"audit":{}}', refusal: null },
            finish_reason: "stop",
          },
        ],
      }),
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
    restoreEnv("XAI_API_KEY", originalKey);
    restoreEnv("XAI_REQUIRE_ZERO_DATA_RETENTION", originalZdr);
  }
});

test("grokChat recognizes bounded HTTP-200 refusals without exposing provider prose", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.XAI_API_KEY;
  const originalZdr = process.env.XAI_REQUIRE_ZERO_DATA_RETENTION;
  process.env.XAI_API_KEY = "test-key";
  process.env.XAI_REQUIRE_ZERO_DATA_RETENTION = "true";
  globalThis.fetch = async () =>
    zdrResponse(
      JSON.stringify({
        choices: [
          {
            message: { content: null, refusal: "provider-specific private explanation" },
            finish_reason: "stop",
          },
        ],
      }),
    );
  try {
    const result = await grokChat({ messages: [] });
    assert.equal(result.ok, false);
    assert.equal(result.refused, true);
    assert.equal(result.error, "xAI declined this media");
    assert.doesNotMatch(result.error, /private explanation/u);
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv("XAI_API_KEY", originalKey);
    restoreEnv("XAI_REQUIRE_ZERO_DATA_RETENTION", originalZdr);
  }
});

test("grokChat rejects partial and unterminated HTTP-200 output", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.XAI_API_KEY;
  const originalZdr = process.env.XAI_REQUIRE_ZERO_DATA_RETENTION;
  process.env.XAI_API_KEY = "test-key";
  process.env.XAI_REQUIRE_ZERO_DATA_RETENTION = "true";
  try {
    for (const finishReason of ["length", null, undefined]) {
      globalThis.fetch = async () =>
        zdrResponse(
          JSON.stringify({
            choices: [
              {
                message: { content: '{"matches":[],"audit":{}}', refusal: null },
                ...(finishReason === undefined ? {} : { finish_reason: finishReason }),
              },
            ],
          }),
        );
      const result = await grokChat({ messages: [] });
      assert.equal(result.ok, false, String(finishReason));
      assert.equal(result.refused, false, String(finishReason));
      assert.equal(result.error, "xAI returned an incomplete response", String(finishReason));
    }
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv("XAI_API_KEY", originalKey);
    restoreEnv("XAI_REQUIRE_ZERO_DATA_RETENTION", originalZdr);
  }
});

test("grokChat marks only explicit structured safety errors as provider refusals", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.XAI_API_KEY;
  const originalZdr = process.env.XAI_REQUIRE_ZERO_DATA_RETENTION;
  process.env.XAI_API_KEY = "test-key";
  process.env.XAI_REQUIRE_ZERO_DATA_RETENTION = "true";
  let requests = 0;
  try {
    globalThis.fetch = async () => {
      requests += 1;
      return requests % 2 === 1
        ? zdrResponse()
        : zdrResponse(
            JSON.stringify({ error: { code: "invalid_request", type: "bad_request" } }),
            { status: 400 },
          );
    };
    const malformed = await grokChat({ messages: [] });
    assert.equal(malformed.ok, false);
    assert.equal(malformed.refused, false);

    globalThis.fetch = async () => {
      requests += 1;
      return requests % 2 === 1
        ? zdrResponse()
        : zdrResponse(
            JSON.stringify({
              error: { code: "content_policy_violation", type: "moderation" },
            }),
            { status: 400 },
          );
    };
    const policy = await grokChat({ messages: [] });
    assert.equal(policy.ok, false);
    assert.equal(policy.refused, true);
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv("XAI_API_KEY", originalKey);
    restoreEnv("XAI_REQUIRE_ZERO_DATA_RETENTION", originalZdr);
  }
});

test("provider configuration preflight rejects blank credentials without a request", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.XAI_API_KEY;
  const originalZdr = process.env.XAI_REQUIRE_ZERO_DATA_RETENTION;
  let fetchCalled = false;
  process.env.XAI_API_KEY = "   ";
  process.env.XAI_REQUIRE_ZERO_DATA_RETENTION = "true";
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
    process.env.XAI_API_KEY = "test-key";
    delete process.env.XAI_REQUIRE_ZERO_DATA_RETENTION;
    assert.equal(grokProviderConfigured(), false);
    assert.equal((await grokChat({ messages: [] })).providerAttempted, false);
    assert.equal(fetchCalled, false);
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv("XAI_API_KEY", originalKey);
    restoreEnv("XAI_REQUIRE_ZERO_DATA_RETENTION", originalZdr);
  }
});

test("every media call requires a successful exact ZDR preflight before any selected media is sent", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.XAI_API_KEY;
  const originalZdr = process.env.XAI_REQUIRE_ZERO_DATA_RETENTION;
  process.env.XAI_API_KEY = "test-key";
  process.env.XAI_REQUIRE_ZERO_DATA_RETENTION = "true";
  try {
    for (const scenario of [
      "missing",
      "false",
      "uppercase",
      "list",
      "http-error",
      "network-error",
    ]) {
      let calls = 0;
      let body = "";
      globalThis.fetch = async (_url, init) => {
        calls += 1;
        body = String(init?.body);
        if (scenario === "network-error") throw new Error("non-sensitive probe failed");
        if (scenario === "http-error") {
          return zdrResponse("", { status: 500 });
        }
        return new Response("", {
          status: 200,
          headers:
            scenario === "false"
              ? { "x-zero-data-retention": "false" }
              : scenario === "uppercase"
                ? { "x-zero-data-retention": "TRUE" }
                : scenario === "list"
                  ? { "x-zero-data-retention": "true, false" }
                  : undefined,
        });
      };
      const result = await grokChat({
        messages: [
          {
            role: "user",
            content: [{ type: "image_url", image_url: { url: "data:image/jpeg;base64,secret" } }],
          },
        ],
      });
      assert.equal(result.ok, false, scenario);
      assert.equal(result.error, GROK_ZDR_ERROR, scenario);
      assert.equal(result.providerAttempted, false, scenario);
      assert.equal(result.privacyFailure, "preflight", scenario);
      assert.equal(calls, 1, scenario);
      assert.doesNotMatch(body, /data:image/u, scenario);
      assert.match(body, /Return OK\./u, scenario);
    }

    let calls = 0;
    const controller = new AbortController();
    globalThis.fetch = async () => {
      calls += 1;
      controller.abort();
      return zdrResponse();
    };
    const aborted = await grokChat({ messages: [{ role: "user", content: "media" }], signal: controller.signal });
    assert.equal(aborted.ok, false);
    assert.equal(aborted.providerAttempted, false);
    assert.equal(calls, 1);

    process.env.XAI_REQUIRE_ZERO_DATA_RETENTION = "true";
    calls = 0;
    globalThis.fetch = async () => {
      calls += 1;
      delete process.env.XAI_REQUIRE_ZERO_DATA_RETENTION;
      return zdrResponse();
    };
    const disabledAfterProbe = await grokChat({ messages: [{ role: "user", content: "media" }] });
    assert.equal(disabledAfterProbe.ok, false);
    assert.equal(disabledAfterProbe.providerAttempted, false);
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv("XAI_API_KEY", originalKey);
    restoreEnv("XAI_REQUIRE_ZERO_DATA_RETENTION", originalZdr);
  }
});

test("ZDR is re-probed per batch and the preflight credential is reused for its media request", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.XAI_API_KEY;
  const originalZdr = process.env.XAI_REQUIRE_ZERO_DATA_RETENTION;
  process.env.XAI_API_KEY = "key-a";
  process.env.XAI_REQUIRE_ZERO_DATA_RETENTION = "true";
  const authorizations = [];
  const requestBodies = [];
  let calls = 0;
  globalThis.fetch = async (_url, init) => {
    calls += 1;
    authorizations.push(new Headers(init?.headers).get("authorization"));
    requestBodies.push(JSON.parse(String(init?.body)));
    assert.equal(init?.cache, "no-store");
    assert.equal(init?.redirect, "error");
    if (calls === 1) process.env.XAI_API_KEY = "key-b";
    if (calls % 2 === 1) return zdrResponse();
    return zdrResponse(
      JSON.stringify({
        choices: [
          {
            message: { content: '{"matches":[],"audit":{}}', refusal: null },
            finish_reason: "stop",
          },
        ],
      }),
    );
  };
  try {
    assert.equal((await grokChat({ messages: [{ role: "user", content: "first" }] })).ok, true);
    assert.equal((await grokChat({ messages: [{ role: "user", content: "second" }] })).ok, true);
    assert.equal(calls, 4);
    assert.deepEqual(authorizations, ["Bearer key-a", "Bearer key-a", "Bearer key-b", "Bearer key-b"]);
    assert.deepEqual(requestBodies[0].messages, [{ role: "user", content: "Return OK." }]);
    assert.deepEqual(requestBodies[2].messages, [{ role: "user", content: "Return OK." }]);
    assert.deepEqual(requestBodies[1].messages, [{ role: "user", content: "first" }]);
    assert.deepEqual(requestBodies[3].messages, [{ role: "user", content: "second" }]);
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv("XAI_API_KEY", originalKey);
    restoreEnv("XAI_REQUIRE_ZERO_DATA_RETENTION", originalZdr);
  }
});

test("missing or unavailable ZDR confirmation after media dispatch discards the response", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.XAI_API_KEY;
  const originalZdr = process.env.XAI_REQUIRE_ZERO_DATA_RETENTION;
  process.env.XAI_API_KEY = "test-key";
  process.env.XAI_REQUIRE_ZERO_DATA_RETENTION = "true";
  let calls = 0;
  let cancelled = false;
  globalThis.fetch = async () => {
    calls += 1;
    if (calls % 2 === 1) return zdrResponse();
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("provider-private-body"));
      },
      cancel() {
        cancelled = true;
      },
    });
    return new Response(body, { headers: { "content-type": "application/json" } });
  };
  try {
    const missing = await grokChat({ messages: [{ role: "user", content: "media" }] });
    assert.equal(missing.ok, false);
    assert.equal(missing.error, GROK_ZDR_RESPONSE_ERROR);
    assert.equal(missing.providerAttempted, true);
    assert.equal(missing.privacyFailure, "response");
    assert.equal(cancelled, true);
    assert.doesNotMatch(missing.error, /provider-private-body/u);

    globalThis.fetch = async () => {
      calls += 1;
      if (calls % 2 === 1) return zdrResponse();
      throw new Error("no response");
    };
    const unavailable = await grokChat({ messages: [{ role: "user", content: "media" }] });
    assert.equal(unavailable.ok, false);
    assert.equal(unavailable.error, GROK_ZDR_RESPONSE_ERROR);
    assert.equal(unavailable.providerAttempted, true);
    assert.equal(unavailable.privacyFailure, "response");

    globalThis.fetch = async () => {
      calls += 1;
      if (calls % 2 === 1) return zdrResponse();
      const body = new ReadableStream({
        start(controller) {
          controller.error(new Error("truncated after headers"));
        },
      });
      return zdrResponse(body);
    };
    const truncated = await grokChat({ messages: [{ role: "user", content: "media" }] });
    assert.equal(truncated.ok, false);
    assert.equal(truncated.error, "xAI response failed");
    assert.equal(truncated.providerAttempted, true);
    assert.equal(truncated.privacyFailure, undefined);
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv("XAI_API_KEY", originalKey);
    restoreEnv("XAI_REQUIRE_ZERO_DATA_RETENTION", originalZdr);
  }
});

test("cloud voice distinguishes privacy failures from post-confirmation body failures", async () => {
  const originalFetch = globalThis.fetch;
  const originalZdr = process.env.XAI_REQUIRE_ZERO_DATA_RETENTION;
  process.env.XAI_REQUIRE_ZERO_DATA_RETENTION = "true";
  let calls = 0;
  try {
    globalThis.fetch = async () => {
      calls += 1;
      if (calls % 2 === 1) return zdrResponse();
      const body = new ReadableStream({
        start(controller) {
          controller.error(new Error("audio truncated after headers"));
        },
      });
      return zdrResponse(body, { headers: { "content-type": "audio/mpeg" } });
    };
    const truncated = await requestGrokVoice({ apiKey: "voice-key", text: "Stop." });
    assert.deepEqual(truncated, { ok: false, error: "Voice response failed" });

    calls = 0;
    let cancelled = false;
    globalThis.fetch = async () => {
      calls += 1;
      if (calls % 2 === 1) return zdrResponse();
      const body = new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array([1, 2, 3]));
        },
        cancel() {
          cancelled = true;
        },
      });
      return new Response(body, { headers: { "content-type": "audio/mpeg" } });
    };
    const unconfirmed = await requestGrokVoice({ apiKey: "voice-key", text: "Stop." });
    assert.deepEqual(unconfirmed, {
      ok: false,
      error: "Voice privacy confirmation unavailable",
    });
    assert.equal(cancelled, true);

    calls = 0;
    globalThis.fetch = async () => {
      calls += 1;
      return calls % 2 === 1
        ? zdrResponse()
        : zdrResponse(new Uint8Array([1, 2, 3]), {
            headers: { "content-type": "audio/mpeg" },
          });
    };
    const success = await requestGrokVoice({ apiKey: "voice-key", text: "Stop." });
    assert.deepEqual(success, { ok: true, mime: "audio/mpeg", b64: "AQID" });
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv("XAI_REQUIRE_ZERO_DATA_RETENTION", originalZdr);
  }
});
