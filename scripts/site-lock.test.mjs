import test from "node:test";
import assert from "node:assert/strict";
import { checkSiteLock } from "./site-lock.mjs";

const b = (s) => "Basic " + Buffer.from(s, "utf8").toString("base64");
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
test("UTF-8 user names and passwords open the site without losing accented or non-Latin characters", () => {
  assert.equal(checkSiteLock(b("us:páss:秘密🔒"), "us", "páss:秘密🔒"), "open");
  assert.equal(checkSiteLock(b("élise:秘密"), "élise", "秘密"), "open");
  assert.equal(checkSiteLock(b("us:pass"), "us", "páss"), "locked");
});
test("malformed UTF-8 stays locked instead of matching replacement characters", () => {
  const header = "Basic " + Buffer.from([117, 115, 58, 255]).toString("base64");
  assert.equal(checkSiteLock(header, "us", "�"), "locked");
});
