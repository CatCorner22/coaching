import { BookOpen, Camera, GraduationCap, House, Library, Shield } from "lucide-react";

export const NAV = [
  { to: "/", label: "Home", icon: House },
  // The Academy is a destination like any other, so it is registered here
  // rather than spliced into the shell's own array. Everything downstream of
  // this list — the sidebar, the bottom bar, `routeTitle` and the <main>
  // landmark's accessible name — reads from it, and a route that reaches the
  // shell without passing through here silently inherits the bare "Knotty"
  // title this module exists to replace.
  { to: "/learn", label: "Learn", icon: GraduationCap },
  { to: "/library", label: "Library", icon: BookOpen },
  { to: "/studio", label: "Studio", icon: Camera },
  { to: "/knowledge", label: "Guide", icon: Library },
  { to: "/safety", label: "Safety", icon: Shield },
] as const;

export const MORE = [
  // First on purpose. This is the only route that is time-critical, and on a
  // phone the whole list lives behind the More sheet: measured at 390x844 it
  // sat 12th of 13, so reaching it meant scanning past Rope calc and Dungeon.
  // The Studio stop banner already offers it as a one-tap danger button once a
  // session is stopped; this covers wanting the card *before* hitting stop.
  // One name for this destination everywhere; it used to be "Cut down" here,
  // "Emergency" on the home tools, and "Cut-down card" in Studio.
  { to: "/emergency", label: "Emergency" },
  // Second for the same reason Emergency is first: both are scene-time
  // destinations, and everything below here is read before or after.
  { to: "/rig", label: "Rig mode" },
  { to: "/learn-foundations", label: "Learn how to learn" },
  { to: "/checklist", label: "Pre-scene" },
  { to: "/checkin", label: "Check-in" },
  { to: "/knots", label: "Knots" },
  { to: "/plan", label: "Plan" },
  { to: "/journal", label: "Journal" },
  { to: "/gear", label: "Gear" },
  { to: "/dungeon", label: "Dungeon" },
  { to: "/negotiate", label: "Negotiate" },
  { to: "/nerves", label: "Nerves" },
  { to: "/aftercare", label: "Aftercare" },
  { to: "/calc", label: "Rope calc" },
  { to: "/settings", label: "Settings" },
] as const;

const SECTION_TITLES: Record<string, string> = Object.fromEntries(
  [...NAV, ...MORE].map((item) => [item.to, item.label]),
);

/**
 * A per-route document title. Every route previously shared the single title
 * "Knotty", so a screen reader announced nothing distinguishing on navigation
 * and browser history was unusable.
 */
export function routeTitle(pathname: string): string {
  const section = SECTION_TITLES[pathname];
  if (section) return section === "Home" ? "Knotty" : `${section} · Knotty`;
  if (pathname.startsWith("/tie/")) return "Tie · Knotty";
  if (pathname.startsWith("/article/")) return "Article · Knotty";
  if (pathname.startsWith("/knot/")) return "Knot · Knotty";
  if (pathname.startsWith("/login")) return "Sign in · Knotty";
  return "Knotty";
}

/** Detail routes belong to their section so nav state survives a deep link. */
export function isActive(pathname: string, to: string): boolean {
  if (to === "/") return pathname === "/";
  if (pathname === to) return true;
  if (to === "/library") return pathname.startsWith("/tie/");
  if (to === "/knowledge") return pathname.startsWith("/article/");
  if (to === "/knots") return pathname.startsWith("/knot/");
  return false;
}
