import { TIES, getTie } from "@/lib/kb";

export function metersFor(slugs: string[]) {
  const rows = slugs.map((slug) => {
    const t = getTie(slug);
    const meters = t ? t.ropes.reduce((n, r) => n + r.lengthM * r.count, 0) : 8;
    return { slug, name: t?.name ?? slug, meters, ropes: t?.ropes ?? [{ lengthM: 8, count: 1 }] };
  });
  const total = rows.reduce((n, r) => n + r.meters, 0);
  const eights = Math.ceil(total / 8);
  return { rows, total, eights, plusWaste: Math.round(total * 1.15 * 10) / 10 };
}

export function catalogLengths() {
  return TIES.map((t) => ({
    slug: t.slug,
    name: t.name,
    meters: t.ropes.reduce((n, r) => n + r.lengthM * r.count, 0),
    ropes: t.ropes,
  }));
}
