import { BookOpen, Camera, House, Library, Shield } from "lucide-react";

export const NAV = [
  { to: "/", label: "Home", icon: House },
  { to: "/library", label: "Library", icon: BookOpen },
  { to: "/studio", label: "Studio", icon: Camera },
  { to: "/knowledge", label: "Guide", icon: Library },
  { to: "/safety", label: "Safety", icon: Shield },
] as const;

export const MORE = [
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
  // One name for this destination everywhere; it used to be "Cut down" here,
  // "Emergency" on the home tools, and "Cut-down card" in Studio.
  { to: "/emergency", label: "Emergency" },
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
