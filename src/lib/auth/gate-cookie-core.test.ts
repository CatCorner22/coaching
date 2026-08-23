import assert from "node:assert/strict";
import { test } from "node:test";
import {
  isCookieFamilyMember,
  removeRequestCookieFamily,
  requestCookieFamilyNames,
} from "./gate-cookie-core.ts";

test("cookie family membership accepts only the exact base and numeric chunks", () => {
  const base = "better-auth.session_data";
  assert.equal(isCookieFamilyMember(base, base), true);
  assert.equal(isCookieFamilyMember(`${base}.0`, base), true);
  assert.equal(isCookieFamilyMember(`${base}.27`, base), true);
  assert.equal(isCookieFamilyMember(`${base}.x`, base), false);
  assert.equal(isCookieFamilyMember(`${base}.1.extra`, base), false);
  assert.equal(isCookieFamilyMember(`${base}-old`, base), false);
});

test("cookie family discovery includes every present chunk without a stale-tail cap", () => {
  const base = "better-auth.session_data";
  const chunks = Array.from({ length: 64 }, (_, index) => `${base}.${index}=v${index}`);
  const headers = new Headers({ cookie: [`${base}=root`, ...chunks, "other=keep"].join("; ") });
  const names = requestCookieFamilyNames(headers, base);
  assert.equal(names.length, 65);
  assert.equal(names[0], base);
  assert.equal(names.at(-1), `${base}.63`);
});

test("cookie family removal drops base and chunks while preserving near names", () => {
  const base = "better-auth.session_data";
  const headers = new Headers({
    cookie: [
      `${base}=root`,
      `${base}.0=part0`,
      `${base}.12=part12`,
      `${base}.x=keep-x`,
      `${base}-old=keep-old`,
      "other=keep",
    ].join("; "),
  });
  removeRequestCookieFamily(headers, base);
  assert.equal(
    headers.get("cookie"),
    `${base}.x=keep-x; ${base}-old=keep-old; other=keep`,
  );

  const onlyFamily = new Headers({ cookie: `${base}=root; ${base}.0=part0` });
  removeRequestCookieFamily(onlyFamily, base);
  assert.equal(onlyFamily.has("cookie"), false);
});
