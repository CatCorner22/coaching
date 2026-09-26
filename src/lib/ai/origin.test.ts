import assert from "node:assert/strict";
import { test } from "node:test";
import { availabilityOriginDecision } from "./availability-origin.ts";
import { isTrustedAppOrigin, isTrustedDevelopmentOrigin, matchesHostPattern } from "./origin.ts";

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
    isTrustedAppOrigin("https://knotty.example.com", {
      configuredOrigin: "https://knotty.example.com/",
    }),
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
    ["http://abc123.grok-sandbox.com", { allowPreviewHosts: true }, "preview hosts are https only"],
    ["https://other.example.com", PROD, "a different origin than the configured one"],
    ["javascript:alert(1)", { allowLoopback: true }, "non-http scheme"],
    ["not a url", { allowLoopback: true }, "malformed origin"],
    ["null", { allowLoopback: true }, "the literal null origin"],
    ["", { allowLoopback: true }, "empty origin"],
    [
      "https://knotty.example.com",
      { configuredOrigin: "not a url" },
      "a malformed config authorizes nothing",
    ],
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

test("the dev server trusts the LAN address it binds, and only in development", () => {
  // npm run dev binds 0.0.0.0:8080 so the phone in the room can load it, but
  // every AI call from http://192.168.x.x:8080 was refused as an untrusted
  // origin, with no documentation saying so.
  for (const origin of [
    "http://192.168.1.50:8080",
    "http://10.0.0.4:8080",
    "http://172.16.3.9:8080",
  ]) {
    const host = new URL(origin).host;
    assert.equal(isTrustedAppOrigin(origin, { allowLoopback: true, devHost: host }), true, origin);
    assert.equal(
      isTrustedAppOrigin(origin, { devHost: host }),
      false,
      `${origin} is not trusted when deployed`,
    );
    // Another page on the same LAN is not this app, and must not be able to
    // spend the owner's xAI quota through the dev server.
    assert.equal(
      isTrustedAppOrigin(origin, { allowLoopback: true, devHost: "192.168.1.99:8080" }),
      false,
      `${origin} from a different LAN host`,
    );
    assert.equal(
      isTrustedAppOrigin(origin, { allowLoopback: true }),
      false,
      `${origin} with no host`,
    );
  }
  assert.equal(
    isTrustedAppOrigin("http://nas.local:8080", {
      allowLoopback: true,
      devHost: "192.168.1.50:8080",
    }),
    false,
  );
  assert.equal(
    isTrustedAppOrigin("http://172.32.0.1:8080", {
      allowLoopback: true,
      devHost: "172.32.0.1:8080",
    }),
    false,
  );
  assert.equal(
    isTrustedAppOrigin("http://11.0.0.1:8080", { allowLoopback: true, devHost: "11.0.0.1:8080" }),
    false,
  );
});

test("development AI trusts the configured Tailscale origin", () => {
  assert.equal(
    isTrustedDevelopmentOrigin("https://laptop.tail1234.ts.net", "https://laptop.tail1234.ts.net"),
    true,
  );
  assert.equal(isTrustedDevelopmentOrigin("https://laptop.tail1234.ts.net"), false);
  assert.equal(
    isTrustedDevelopmentOrigin("https://evil.tail1234.ts.net", "https://laptop.tail1234.ts.net"),
    false,
  );
  assert.equal(isTrustedDevelopmentOrigin("http://192.168.1.23:8080"), true);
  assert.equal(isTrustedDevelopmentOrigin("http://localhost:8080"), true);
});

test("availability accepts same-origin fetches without an Origin header", () => {
  const headers = (values: Record<string, string>) => ({
    get(name: string) {
      return values[name] ?? null;
    },
  });
  const env = { viteDevServer: true, devHost: "localhost:8080" };
  assert.equal(availabilityOriginDecision(headers({ "sec-fetch-site": "same-origin" }), env), "ok");
  assert.equal(availabilityOriginDecision(headers({ "sec-fetch-site": "none" }), env), "ok");
  assert.equal(
    availabilityOriginDecision(headers({ "sec-fetch-site": "cross-site" }), env),
    "origin_not_trusted",
  );
});

test("availability applies configured and development origin trust", () => {
  const headers = (values: Record<string, string>) => ({
    get(name: string) {
      return values[name] ?? null;
    },
  });
  assert.equal(
    availabilityOriginDecision(
      headers({
        origin: "https://laptop.tail1234.ts.net",
        "sec-fetch-site": "same-origin",
      }),
      { viteDevServer: true, configuredOrigin: "https://laptop.tail1234.ts.net" },
    ),
    "ok",
  );
  assert.equal(
    availabilityOriginDecision(
      headers({ origin: "https://random.example.com", "sec-fetch-site": "cross-site" }),
      { viteDevServer: true, configuredOrigin: "https://laptop.tail1234.ts.net" },
    ),
    "origin_not_trusted",
  );
});
