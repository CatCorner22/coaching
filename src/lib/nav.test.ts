import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
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

test("the emergency card is the first item behind the More sheet", () => {
  // On a phone every MORE destination is behind one sheet, and measured at
  // 390x844 Emergency sat 12th of 13 — between Rope calc and Settings. It is
  // the only time-critical route in the list, so it opens the sheet.
  assert.equal(MORE[0]?.to, "/emergency");
  assert.equal(MORE.filter((item) => item.to === "/emergency").length, 1);
  // It must not also be in the bottom bar, or the two would disagree. Widened
  // because the literal union already excludes it today — this keeps the check
  // meaningful if the bottom bar ever gains the route.
  const navRoutes: readonly { to: string }[] = NAV;
  assert.equal(navRoutes.filter((item) => item.to === "/emergency").length, 0);
});

test("every static route is a registered destination", () => {
  // The uniqueness assertions above can only see routes that are in NAV or
  // MORE, so a route added to the shell without being registered here inherits
  // the bare "Knotty" title and is invisible to the very test written to stop
  // that. `/learn` did exactly this. Derive the expected set from the route
  // files instead, so the next one fails loudly.
  const dir = new URL("../routes/", import.meta.url);
  const registered = new Set<string>([...NAV, ...MORE].map((item) => item.to));
  const missing = readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".tsx"))
    .map((entry) => entry.name.replace(/\.tsx$/, ""))
    // `__root` is the layout, `$` routes and `/login` are covered by
    // routeTitle's prefix branches rather than by a list entry.
    .filter((name) => !name.startsWith("__") && !name.includes("$") && name !== "login")
    .map((name) => (name === "index" ? "/" : `/${name}`))
    .filter((path) => !registered.has(path));
  assert.deepEqual(missing, [], `route(s) missing from NAV/MORE, so routeTitle falls back to "Knotty"`);
});

test("the prefix-covered routes routeTitle names still exist", () => {
  // routeTitle's fallbacks are only correct while these files are the detail
  // routes. If one is renamed, the branch quietly stops matching and the route
  // rejoins the untitled default.
  for (const file of ["tie.$slug.tsx", "article.$slug.tsx", "knot.$slug.tsx", "login.tsx"]) {
    assert.ok(existsSync(new URL(`../routes/${file}`, import.meta.url)), `${file} moved`);
  }
});
