import assert from "node:assert/strict";
import { test } from "node:test";
import { isTrustedAppOrigin, matchesHostPattern } from "./origin.ts";

test("AI request origins are checked against configuration, not against the request itself", () => {
  // The old check compared the browser Origin to new URL(request.url).origin,
  // which is built from the raw Host header with an http: scheme. Reproduced
  // against the same request construction the dev server uses, that denied
  // every https request — the scheme alone differs — and allowed any caller who
  // set Host and Origin to the same forged value.
  const PROD = { configuredOrigin: "https://knotty.example.com" };

  // Must be allowed: the environments the app actually runs in.
  assert.equal(isTrustedAppOrigin("http://localhost:8080", { allowLoopback: true }), true);
  assert.equal(isTrustedAppOrigin("http://127.0.0.1:8080", { allowLoopback: true }), true);
  assert.equal(
    isTrustedAppOrigin("https://abc123.grok-sandbox.com", { allowPreviewHosts: true }),
    true,
  );
  assert.equal(isTrustedAppOrigin("https://knotty.example.com", PROD), true);
  // A configured origin with a trailing slash names the same origin.
  assert.equal(
    isTrustedAppOrigin("https://knotty.example.com", { configuredOrigin: "https://knotty.example.com/" }),
    true,
  );

  // Must be refused.
  for (const [origin, options, why] of [
    ["http://evil.com", {}, "a forged Host/Origin pair no longer matches itself"],
    ["https://evil.com", {}, "unrelated https origin"],
    ["http://localhost:8080", PROD, "loopback must never widen a deployed app"],
    [
      "https://abc123.grok-sandbox.com",
      PROD,
      "the shared preview domain must not be trusted by a production deployment that has not opted into the live preview",
    ],
    [
      "https://evilgrok-sandbox.com",
      { allowPreviewHosts: true },
      "the wildcard must not match a bare suffix",
    ],
    [
      "https://grok-sandbox.com",
      { allowPreviewHosts: true },
      "the bare preview domain is not a preview host",
    ],
    [
      "http://abc123.grok-sandbox.com",
      { allowPreviewHosts: true },
      "preview hosts are https only",
    ],
    ["https://other.example.com", PROD, "a different origin than the configured one"],
    ["javascript:alert(1)", { allowLoopback: true }, "non-http scheme"],
    ["not a url", { allowLoopback: true }, "malformed origin"],
    ["null", { allowLoopback: true }, "the literal null origin"],
    ["", { allowLoopback: true }, "empty origin"],
    ["https://knotty.example.com", { configuredOrigin: "not a url" }, "a malformed config authorizes nothing"],
  ] as const) {
    assert.equal(isTrustedAppOrigin(origin, options), false, why);
  }
});

test("wildcard host matching requires a real subdomain", () => {
  assert.equal(matchesHostPattern("a.grok-sandbox.com", "*.grok-sandbox.com"), true);
  assert.equal(matchesHostPattern("A.GROK-SANDBOX.COM", "*.grok-sandbox.com"), true);
  assert.equal(matchesHostPattern("deep.a.grok-sandbox.com", "*.grok-sandbox.com"), true);
  assert.equal(matchesHostPattern("grok-sandbox.com", "*.grok-sandbox.com"), false);
  assert.equal(matchesHostPattern("evilgrok-sandbox.com", "*.grok-sandbox.com"), false);
  assert.equal(matchesHostPattern(".grok-sandbox.com", "*.grok-sandbox.com"), false);
  assert.equal(matchesHostPattern("example.com", "example.com"), true);
  assert.equal(matchesHostPattern("sub.example.com", "example.com"), false);
});
