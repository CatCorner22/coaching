import type { Rank } from "@/lib/stores/negotiate";

const ORDER: Record<Rank, number> = { no: 0, maybe: 1, yes: 2 };

/**
 * The shared answer is the more cautious of the two: both must say yes for a
 * yes, any no is a no, everything else is maybe. An unanswered side counts as no.
 */
export function combineRanks(a: Rank | undefined, b: Rank | undefined): Rank {
  const x = a ?? "no";
  const y = b ?? "no";
  return ORDER[x] <= ORDER[y] ? x : y;
}

/** True when the two partners gave different answers (worth talking about). */
export function needsTalk(a: Rank | undefined, b: Rank | undefined): boolean {
  return (a ?? "no") !== (b ?? "no");
}
