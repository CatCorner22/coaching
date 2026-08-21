import assert from "node:assert/strict";
import test from "node:test";
import {
  assertProductionAuthEnvironment,
  AuthConfigurationError,
  productionAuthProblems,
} from "./config.ts";

const valid = {
  NODE_ENV: "production",
  VITE_AUTH_ENABLED: "true",
  DATABASE_URL: "postgres://example.invalid/app",
  BETTER_AUTH_URL: "https://knotty.example",
  BETTER_AUTH_SECRET: "a".repeat(32),
  GROK_PROJECT_ID: "project-1",
};

test("production auth accepts the gate-identity deployment contract", () => {
  assert.deepEqual(productionAuthProblems(valid), []);
  assert.doesNotThrow(() => assertProductionAuthEnvironment(valid));
});

test("production auth accepts an explicit OAuth client pair", () => {
  const source = {
    ...valid,
    GROK_PROJECT_ID: undefined,
    GROK_AUTH_CLIENT_ID: "client",
    GROK_AUTH_CLIENT_SECRET: "secret",
  };
  assert.deepEqual(productionAuthProblems(source), []);
});

test("production auth fails closed without durable secrets, origin, DB, or identity", () => {
  assert.throws(
    () => assertProductionAuthEnvironment({ NODE_ENV: "production", VITE_AUTH_ENABLED: "true" }),
    (error) =>
      error instanceof AuthConfigurationError &&
      error.code === "AUTH_CONFIGURATION_INVALID" &&
      error.problems.length === 4 &&
      !error.message.includes("undefined"),
  );
});

test("partial OAuth and unsafe production origins are rejected", () => {
  const problems = productionAuthProblems({
    ...valid,
    GROK_PROJECT_ID: undefined,
    GROK_AUTH_CLIENT_ID: "client",
    BETTER_AUTH_URL: "http://knotty.example/path",
  });
  assert.ok(problems.some((problem) => problem.includes("HTTPS origin")));
  assert.ok(problems.some((problem) => problem.includes("configured together")));
  assert.ok(problems.some((problem) => problem.includes("GROK_PROJECT_ID")));
});

test("development and an explicit production auth-off build retain safe fallbacks", () => {
  assert.deepEqual(productionAuthProblems({ NODE_ENV: "development" }), []);
  assert.deepEqual(
    productionAuthProblems({ NODE_ENV: "production", VITE_AUTH_ENABLED: "false" }),
    [],
  );
});
