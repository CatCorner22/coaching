import assert from "node:assert/strict";
import { test } from "node:test";
import { isActive, MORE, NAV, routeTitle } from "./nav.ts";

test("every navigable destination has one canonical label", () => {
  const all = [...NAV, ...MORE];
  const paths = all.map((item) => item.to);
  assert.equal(new Set(paths).size, paths.length, "a destination is listed twice");
  const labels = all.map((item) => item.label);
  assert.equal(new Set(labels).size, labels.length, "two destinations share a label");
  // The emergency destination previously had three different names across
  // surfaces; the shell is the single source for it.
  assert.equal(MORE.find((item) => item.to === "/emergency")?.label, "Emergency");
});

test("routeTitle distinguishes every section and detail route", () => {
  assert.equal(routeTitle("/"), "Knotty");
  assert.equal(routeTitle("/studio"), "Studio · Knotty");
  assert.equal(routeTitle("/emergency"), "Emergency · Knotty");
  assert.equal(routeTitle("/tie/karada"), "Tie · Knotty");
  assert.equal(routeTitle("/article/positional-asphyxia"), "Article · Knotty");
  assert.equal(routeTitle("/knot/somerville-bowline"), "Knot · Knotty");
  assert.equal(routeTitle("/unknown-path"), "Knotty");
  // Distinct titles are the point: a single shared title told a screen reader
  // nothing on navigation.
  const titles = [...NAV, ...MORE].map((item) => routeTitle(item.to));
  assert.equal(new Set(titles).size, titles.length);
});

test("isActive claims detail routes for their section without over-matching", () => {
  assert.equal(isActive("/", "/"), true);
  assert.equal(isActive("/library", "/"), false, "home must not match every route");
  assert.equal(isActive("/tie/karada", "/library"), true);
  assert.equal(isActive("/article/aftercare", "/knowledge"), true);
  assert.equal(isActive("/knot/square", "/knots"), true);
  assert.equal(isActive("/tie/karada", "/knowledge"), false);
  assert.equal(isActive("/studio", "/library"), false);
});
