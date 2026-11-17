import test from "node:test";
import assert from "node:assert/strict";
import { checkSiteLock } from "./site-lock.mjs";

const b = (s) => "Basic " + btoa(s);
test("no password configured leaves the site open", () => {
  assert.equal(checkSiteLock(null, undefined, undefined), "open");
});
test("missing credentials are locked when a password is set", () => {
  assert.equal(checkSiteLock(null, "us", "pw"), "locked");
});
test("correct user and password open the site", () => {
  assert.equal(checkSiteLock(b("us:pw"), "us", "pw"), "open");
});
test("wrong password stays locked", () => {
  assert.equal(checkSiteLock(b("us:nope"), "us", "pw"), "locked");
});
test("wrong user stays locked", () => {
  assert.equal(checkSiteLock(b("them:pw"), "us", "pw"), "locked");
});
test("user defaults to 'us'", () => {
  assert.equal(checkSiteLock(b("us:pw"), undefined, "pw"), "open");
});
test("garbage header stays locked", () => {
  assert.equal(checkSiteLock("Basic %%%", "us", "pw"), "locked");
});
