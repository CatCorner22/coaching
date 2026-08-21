import type { GearItem } from "./types";

export const GEAR: GearItem[] = [
  {
    slug: "jute-8m",
    name: "Jute 6mm × 8m",
    kind: "rope",
    summary: "The standard working length. Most floor harnesses want one or two of these.",
    notes: [
      "Six to eight pieces is a real kit, not two",
      "Natural fiber will shed; that is normal",
      "Treat lightly with camellia or jojoba, then work it in",
    ],
  },
  {
    slug: "jute-4m",
    name: "Jute 6mm × 4m",
    kind: "rope",
    summary: "Uplines, cinches, and finishing. Too short to start a karada, perfect to finish one.",
    notes: ["Keep two. Never use a 4m as your only rope in a TK."],
  },
  {
    slug: "hemp",
    name: "Hemp 6mm",
    kind: "rope",
    summary: "Heavier, stronger, slower to break in. Kind to some skin, harsh on your shoulders if you carry a full bag.",
    notes: ["Excellent for hip harnesses you might one day load."],
  },
  {
    slug: "cotton",
    name: "Cotton",
    kind: "rope",
    summary: "Soft and treacherous. Stretches, then tightens. Fine for decorative practice on furniture, not for cuffs you trust.",
    notes: ["If it is what you have tonight, double-check every cuff after she leans."],
  },
  {
    slug: "shears",
    name: "Trauma shears",
    kind: "tool",
    summary: "The only piece of kit that is not optional. Blunt beak, serrated, on a lanyard.",
    notes: [
      "Practice on scrap rope",
      "A knife is not a substitute",
      "If you cannot put a hand on them without looking, they are too far away",
    ],
  },
  {
    slug: "carabiner",
    name: "Locking carabiner",
    kind: "tool",
    summary: "For munters and ring work. A climbing-rated locker, not a keychain.",
    notes: ["Gate locked. Major axis loaded. Never a homemade hard point."],
  },
  {
    slug: "pad",
    name: "Crash pad",
    kind: "support",
    summary: "A folded duvet is a start. A real pad is what you want before any lift.",
    notes: ["Place it before you lift, not after she panics."],
  },
  {
    slug: "ring",
    name: "Ring or bamboo",
    kind: "support",
    summary: "A ring gathers uplines. Bamboo can be a spreader. Both are intermediate tools.",
    notes: ["Do not invent a spreader from a broom handle that will snap."],
  },
  {
    slug: "oil",
    name: "Camellia / jojoba",
    kind: "care",
    summary: "A few drops in jute, then friction and time. You are feeding fiber, not frying it.",
    notes: ["Wax makes pretty rope that slips and then dirties skin."],
  },
  {
    slug: "blanket",
    name: "Aftercare blanket",
    kind: "care",
    summary: "Warmth is medical, not cute. Drop and shock look like cold.",
    notes: ["Keep water and a snack next to it so you do not leave her to go hunting."],
  },
];
