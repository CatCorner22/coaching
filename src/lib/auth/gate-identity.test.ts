import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync, type KeyObject } from "node:crypto";
import { SignJWT, exportJWK, type JWK } from "jose";
import {
  GATE_JWKS_MAX_BYTES,
  GATE_JWKS_MAX_KEYS,
  gateIdentityFromHeaders,
  gateKeyResolver,
  parseGateJwksResponse,
  resolveGateEndpoints,
  sessionBoundToGateIdentity,
  verifyGateIdentityToken,
  type GateJwks,
} from "./gate-identity.server.ts";

const ISSUER = "https://gate.app-builder-testing.com";
const AUDIENCE = "app:proj-123";

type TestKey = { privateKey: KeyObject; jwk: JWK; kid: string };

async function makeKey(kid: string): Promise<TestKey> {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const jwk = await exportJWK(publicKey);
  return {
    privateKey,
    kid,
    jwk: { ...jwk, alg: "EdDSA", use: "sig", kid },
  };
}

type SignOptions = {
  issuer?: string;
  audience?: string;
  expiresIn?: number;
  issuedAt?: number;
  omitExp?: boolean;
};

async function signToken(
  key: TestKey,
  claims: Record<string, unknown>,
  options: SignOptions = {},
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const jwt = new SignJWT(claims)
    .setProtectedHeader({ alg: "EdDSA", kid: key.kid })
    .setIssuer(options.issuer ?? ISSUER)
    .setAudience(options.audience ?? AUDIENCE)
    .setIssuedAt(options.issuedAt ?? now);
  if (!options.omitExp) {
    jwt.setExpirationTime((options.issuedAt ?? now) + (options.expiresIn ?? 300));
  }
  return jwt.sign(key.privateKey);
}

function staticJwks(keys: JWK[]): {
  fetchImpl: (url: string) => Promise<GateJwks | null>;
  calls: () => number;
} {
  let count = 0;
  return {
    fetchImpl: async () => {
      count += 1;
      return { keys };
    },
    calls: () => count,
  };
}

let urlCounter = 0;
function uniqueUrl(): string {
  urlCounter += 1;
  return `https://test-${urlCounter}.invalid/__gate/identity-key`;
}

describe("verifyGateIdentityToken", () => {
  it("returns the identity for a valid token", async () => {
    const key = await makeKey("k1");
    const token = await signToken(key, {
      sub: "user-1",
      email: "viewer@example.com",
      name: "Viewer",
      team_id: "team-9",
      jti: "j1",
    });
    const identity = await verifyGateIdentityToken(token, {
      issuer: ISSUER,
      audience: AUDIENCE,
      getKey: gateKeyResolver(uniqueUrl(), staticJwks([key.jwk]).fetchImpl),
    });
    assert.deepEqual(identity, {
      sub: "user-1",
      email: "viewer@example.com",
      name: "Viewer",
      teamId: "team-9",
    });
  });

  it("omits optional claims as nulls", async () => {
    const key = await makeKey("k1");
    const token = await signToken(key, { sub: "user-2", jti: "j2" });
    const identity = await verifyGateIdentityToken(token, {
      issuer: ISSUER,
      audience: AUDIENCE,
      getKey: gateKeyResolver(uniqueUrl(), staticJwks([key.jwk]).fetchImpl),
    });
    assert.deepEqual(identity, {
      sub: "user-2",
      email: null,
      name: null,
      teamId: null,
    });
  });

  it("rejects a wrong audience", async () => {
    const key = await makeKey("k1");
    const token = await signToken(key, { sub: "user-1" }, { audience: "app:other-project" });
    const identity = await verifyGateIdentityToken(token, {
      issuer: ISSUER,
      audience: AUDIENCE,
      getKey: gateKeyResolver(uniqueUrl(), staticJwks([key.jwk]).fetchImpl),
    });
    assert.equal(identity, null);
  });

  it("rejects a wrong issuer", async () => {
    const key = await makeKey("k1");
    const token = await signToken(key, { sub: "user-1" }, { issuer: "https://evil.example.com" });
    const identity = await verifyGateIdentityToken(token, {
      issuer: ISSUER,
      audience: AUDIENCE,
      getKey: gateKeyResolver(uniqueUrl(), staticJwks([key.jwk]).fetchImpl),
    });
    assert.equal(identity, null);
  });

  it("rejects an expired token", async () => {
    const key = await makeKey("k1");
    const past = Math.floor(Date.now() / 1000) - 3600;
    const token = await signToken(key, { sub: "user-1" }, { issuedAt: past, expiresIn: 300 });
    const identity = await verifyGateIdentityToken(token, {
      issuer: ISSUER,
      audience: AUDIENCE,
      getKey: gateKeyResolver(uniqueUrl(), staticJwks([key.jwk]).fetchImpl),
    });
    assert.equal(identity, null);
  });

  it("rejects a token without exp", async () => {
    const key = await makeKey("k1");
    const token = await signToken(key, { sub: "user-1" }, { omitExp: true });
    const identity = await verifyGateIdentityToken(token, {
      issuer: ISSUER,
      audience: AUDIENCE,
      getKey: gateKeyResolver(uniqueUrl(), staticJwks([key.jwk]).fetchImpl),
    });
    assert.equal(identity, null);
  });

  it("rejects a token signed by a different key with the same kid", async () => {
    const trusted = await makeKey("k1");
    const attacker = await makeKey("k1");
    const token = await signToken(attacker, { sub: "user-1" });
    const identity = await verifyGateIdentityToken(token, {
      issuer: ISSUER,
      audience: AUDIENCE,
      getKey: gateKeyResolver(uniqueUrl(), staticJwks([trusted.jwk]).fetchImpl),
    });
    assert.equal(identity, null);
  });

  it("refetches the JWKS when the kid rotates", async () => {
    const oldKey = await makeKey("k-old");
    const newKey = await makeKey("k-new");
    const url = uniqueUrl();
    let calls = 0;
    let published: JWK[] = [oldKey.jwk];
    const fetchImpl = async (): Promise<GateJwks> => {
      calls += 1;
      return { keys: published };
    };
    const getKey = gateKeyResolver(url, fetchImpl);

    const first = await verifyGateIdentityToken(await signToken(oldKey, { sub: "user-1" }), {
      issuer: ISSUER,
      audience: AUDIENCE,
      getKey,
    });
    assert.equal(first?.sub, "user-1");
    assert.equal(calls, 1);

    published = [newKey.jwk];
    const second = await verifyGateIdentityToken(await signToken(newKey, { sub: "user-1" }), {
      issuer: ISSUER,
      audience: AUDIENCE,
      getKey,
    });
    assert.equal(second?.sub, "user-1");
    assert.equal(calls, 2);
  });

  it("coalesces concurrent cold-start JWKS fetches", async () => {
    const key = await makeKey("k-single-flight");
    const token = await signToken(key, { sub: "user-1" });
    let calls = 0;
    let release: (() => void) | undefined;
    const ready = new Promise<void>((resolve) => {
      release = resolve;
    });
    const fetchImpl = async (): Promise<GateJwks> => {
      calls += 1;
      await ready;
      return { keys: [key.jwk] };
    };
    const getKey = gateKeyResolver(uniqueUrl(), fetchImpl);
    const verifications = Array.from({ length: 20 }, () =>
      verifyGateIdentityToken(token, {
        issuer: ISSUER,
        audience: AUDIENCE,
        getKey,
      }),
    );
    await new Promise<void>((resolve) => setImmediate(resolve));
    assert.equal(calls, 1);
    release?.();
    const identities = await Promise.all(verifications);
    assert.ok(identities.every((identity) => identity?.sub === "user-1"));
    assert.equal(calls, 1);
  });

  it("fails closed within the configured budget when JWKS retrieval stalls", async () => {
    const key = await makeKey("k-timeout");
    const token = await signToken(key, { sub: "user-1" });
    const neverReturns = async (): Promise<GateJwks | null> =>
      new Promise<GateJwks | null>(() => undefined);
    const startedAt = Date.now();
    const identity = await verifyGateIdentityToken(token, {
      issuer: ISSUER,
      audience: AUDIENCE,
      getKey: gateKeyResolver(uniqueUrl(), neverReturns, { fetchTimeoutMs: 10 }),
    });
    assert.equal(identity, null);
    assert.ok(Date.now() - startedAt < 1_000, "JWKS timeout should remain bounded");
  });

  it("rejects an injected JWKS with too many keys", async () => {
    const key = await makeKey("k-many");
    const token = await signToken(key, { sub: "user-1" });
    const identity = await verifyGateIdentityToken(token, {
      issuer: ISSUER,
      audience: AUDIENCE,
      getKey: gateKeyResolver(
        uniqueUrl(),
        staticJwks(Array.from({ length: GATE_JWKS_MAX_KEYS + 1 }, () => key.jwk)).fetchImpl,
      ),
    });
    assert.equal(identity, null);
  });
});

describe("parseGateJwksResponse", () => {
  it("accepts a bounded key set", async () => {
    const key = await makeKey("k1");
    const response = new Response(JSON.stringify({ keys: [key.jwk] }), {
      headers: { "content-type": "application/json" },
    });
    assert.deepEqual(await parseGateJwksResponse(response), { keys: [key.jwk] });
  });

  it("rejects a response body beyond the byte budget", async () => {
    const response = new Response(
      JSON.stringify({ keys: [], padding: "x".repeat(GATE_JWKS_MAX_BYTES) }),
      { headers: { "content-type": "application/json" } },
    );
    assert.equal(await parseGateJwksResponse(response), null);
  });

  it("rejects a parsed response beyond the key-count budget", async () => {
    const key = await makeKey("k1");
    const response = new Response(
      JSON.stringify({
        keys: Array.from({ length: GATE_JWKS_MAX_KEYS + 1 }, () => key.jwk),
      }),
      { headers: { "content-type": "application/json" } },
    );
    assert.equal(await parseGateJwksResponse(response), null);
  });
});

describe("gateIdentityFromHeaders", () => {
  const originalAuthEnabled = process.env.VITE_AUTH_ENABLED;

  before(() => {
    // Gate identity is deliberately an auth-on deployment mode. Declare that
    // precondition instead of depending on the runner's ambient environment.
    process.env.VITE_AUTH_ENABLED = "true";
  });

  after(() => {
    if (originalAuthEnabled === undefined) delete process.env.VITE_AUTH_ENABLED;
    else process.env.VITE_AUTH_ENABLED = originalAuthEnabled;
  });

  it("verifies the header token end to end and fails closed without it", async () => {
    const key = await makeKey("k1");
    const { fetchImpl } = staticJwks([key.jwk]);
    process.env.GROK_PROJECT_ID = "proj-123";
    process.env.GROK_GATE_ORIGIN = ISSUER;
    try {
      const token = await signToken(key, {
        sub: "user-1",
        email: "viewer@example.com",
      });
      const withToken = await gateIdentityFromHeaders(
        new Headers({ "x-grok-identity": token }),
        fetchImpl,
      );
      assert.equal(withToken?.sub, "user-1");

      const withoutToken = await gateIdentityFromHeaders(new Headers(), fetchImpl);
      assert.equal(withoutToken, null);
    } finally {
      delete process.env.GROK_PROJECT_ID;
      delete process.env.GROK_GATE_ORIGIN;
    }
  });

  it("activates on a deployed-shaped request without GROK_GATE_ORIGIN", async () => {
    const key = await makeKey("k-deployed");
    const fetchedFrom: string[] = [];
    const fetchImpl = async (url: string): Promise<GateJwks> => {
      fetchedFrom.push(url);
      return { keys: [key.jwk] };
    };
    process.env.GROK_PROJECT_ID = "proj-123";
    delete process.env.GROK_GATE_ORIGIN;
    try {
      const token = await signToken(key, {
        sub: "user-1",
        email: "viewer@example.com",
      });
      const identity = await gateIdentityFromHeaders(
        new Headers({
          host: "my-app.app-builder-testing.com",
          "x-grok-identity": token,
        }),
        fetchImpl,
      );
      assert.equal(identity?.sub, "user-1");
      assert.equal(fetchedFrom[0], "https://gate.app-builder-testing.com/__gate/identity-key");
    } finally {
      delete process.env.GROK_PROJECT_ID;
    }
  });

  it("fails closed when GROK_PROJECT_ID is unset", async () => {
    const key = await makeKey("k1");
    const { fetchImpl } = staticJwks([key.jwk]);
    delete process.env.GROK_PROJECT_ID;
    process.env.GROK_GATE_ORIGIN = ISSUER;
    try {
      const token = await signToken(key, { sub: "user-1" });
      const identity = await gateIdentityFromHeaders(
        new Headers({ "x-grok-identity": token }),
        fetchImpl,
      );
      assert.equal(identity, null);
    } finally {
      delete process.env.GROK_GATE_ORIGIN;
    }
  });
});

describe("resolveGateEndpoints", () => {
  it("rejects an unsafe explicit trust root", () => {
    process.env.GROK_GATE_ORIGIN = "http://attacker.invalid/path";
    try {
      assert.equal(resolveGateEndpoints(new Headers({ host: "app.grok.me" })), null);
    } finally {
      delete process.env.GROK_GATE_ORIGIN;
    }
  });
});

describe("sessionBoundToGateIdentity", () => {
  const provider = "grok-gate";

  it("keeps the session when it is bound to the same gate sub", () => {
    assert.equal(
      sessionBoundToGateIdentity(
        [
          { providerId: "google", accountId: "g-1" },
          { providerId: provider, accountId: "user-1" },
        ],
        "user-1",
        provider,
      ),
      true,
    );
  });

  it("rotates when the session belongs to a different gate sub", () => {
    assert.equal(
      sessionBoundToGateIdentity(
        [{ providerId: provider, accountId: "user-1" }],
        "user-2",
        provider,
      ),
      false,
    );
  });

  it("rotates when the session user has no gate-bound account", () => {
    assert.equal(
      sessionBoundToGateIdentity(
        [{ providerId: "google", accountId: "user-1" }],
        "user-1",
        provider,
      ),
      false,
    );
    assert.equal(sessionBoundToGateIdentity([], "user-1", provider), false);
  });
});
