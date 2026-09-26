import { TIES, getTie } from "@/lib/kb";

/** Waste allowance for tails, dressing and re-tying a section. */
export const WASTE_FACTOR = 1.15;
/** The length jute is actually sold and worked in. */
export const STAFF_METERS = 8;
/** What an unlisted tie is assumed to cost, so a total is still shown. */
export const UNKNOWN_TIE_METERS = 8;

export type RopeRow = {
  slug: string;
  name: string;
  meters: number;
  ropes: readonly { lengthM: number; count: number }[];
  /** False when the slug is not in the library and `meters` is a guess. */
  known: boolean;
  /** False when the entry carries no rope spec at all (instructor routes). */
  estimable: boolean;
};

export type RopeEstimate = {
  rows: RopeRow[];
  /** Sum of the listed lengths, no waste. */
  total: number;
  /** What to actually bring, waste included. */
  totalWithWaste: number;
  /** 8m staffs covering `totalWithWaste` — the number the page recommends. */
  eights: number;
  /** Slugs that were not in the library, so the total is an estimate. */
  unknownSlugs: string[];
  /** True when nothing in the plan carries a length, so 0m means "unknown". */
  nothingEstimable: boolean;
};

const round1 = (value: number) => Math.round(value * 10) / 10;

/**
 * Rope needed for a set of ties.
 *
 * The staff count is derived from the waste-inclusive total, not the bare sum:
 * dividing the bare total by 8 recommended a number of staffs the same page
 * then measured against the waste-inclusive figure and called "Short", so the
 * calculator disagreed with itself on the one number people pack from.
 */
export function metersFor(slugs: string[]): RopeEstimate {
  const rows: RopeRow[] = slugs.map((slug) => {
    const tie = getTie(slug);
    if (!tie) {
      return {
        slug,
        name: slug,
        meters: UNKNOWN_TIE_METERS,
        ropes: [{ lengthM: UNKNOWN_TIE_METERS, count: 1 }],
        known: false,
        estimable: true,
      };
    }
    return {
      slug,
      name: tie.name,
      meters: tie.ropes.reduce((n, r) => n + r.lengthM * r.count, 0),
      ropes: tie.ropes,
      known: true,
      // Most instructor routes list no rope at all. Folding them in as 0 made
      // an all-instructor plan read as a checked "0m, enough" requirement.
      estimable: tie.ropes.length > 0,
    };
  });
  const total = round1(rows.reduce((n, r) => n + r.meters, 0));
  const totalWithWaste = round1(total * WASTE_FACTOR);
  return {
    rows,
    total,
    totalWithWaste,
    eights: Math.ceil(totalWithWaste / STAFF_METERS),
    unknownSlugs: rows.filter((r) => !r.known).map((r) => r.slug),
    nothingEstimable: rows.length > 0 && rows.every((r) => !r.estimable),
  };
}

export type KitCoverage = {
  /** Total metres owned. */
  meters: number;
  /** Metres still to buy, 0 when covered. */
  metersShort: number;
  /** 8m staffs still to buy, 0 when covered. */
  eightsShort: number;
  enough: boolean;
};

/**
 * Whether a kit covers an estimate.
 *
 * Metres alone are not the answer: a tie that wants an 8m rope cannot be tied
 * from two 4m staffs, so the 8m count is checked as well and reported
 * separately.
 */
export function kitCoverage(
  estimate: RopeEstimate,
  eightsOwned: number,
  foursOwned: number,
): KitCoverage {
  const meters = eightsOwned * STAFF_METERS + foursOwned * 4;
  const metersShort = Math.max(0, round1(estimate.totalWithWaste - meters));
  const eightsNeeded = estimate.rows.reduce(
    (n, row) => n + row.ropes.filter((rope) => rope.lengthM >= STAFF_METERS).reduce((m, rope) => m + rope.count, 0),
    0,
  );
  const eightsShort = Math.max(0, eightsNeeded - eightsOwned);
  return { meters, metersShort, eightsShort, enough: metersShort === 0 && eightsShort === 0 };
}

export function catalogLengths() {
  return TIES.map((t) => ({
    slug: t.slug,
    name: t.name,
    meters: t.ropes.reduce((n, r) => n + r.lengthM * r.count, 0),
    ropes: t.ropes,
  }));
}
