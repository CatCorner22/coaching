import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TIES, getTie } from "@/lib/kb";
import { catalogLengths, kitCoverage, metersFor } from "@/lib/calc/rope";
import { useKit } from "@/lib/stores/kit";
import { usePlanner } from "@/lib/stores/planner";

export const Route = createFileRoute("/calc")({ component: CalcPage });

function CalcPage() {
  const plan = usePlanner((s) => s.slugs);
  const eights = useKit((s) => s.eights);
  const fours = useKit((s) => s.fours);
  const setEights = useKit((s) => s.setEights);
  const setFours = useKit((s) => s.setFours);
  const [extra, setExtra] = useState<string[]>([]);
  const result = useMemo(() => metersFor([...plan, ...extra]), [plan, extra]);
  const coverage = kitCoverage(result, eights, fours);
  const catalog = catalogLengths();
  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Kit</p>
      <h1 className="mt-2 font-display text-4xl">Rope calculator</h1>
      <p className="mt-3 text-sm text-muted">
        Lengths from the library, plus 15% waste for tails and a second staff. Jute is sold in
        eights for a reason.
      </p>
      <p className="mt-6 font-display text-5xl tabular-nums">
        {result.nothingEstimable ? "No estimate" : `${result.totalWithWaste}m`}
      </p>
      {result.nothingEstimable ? (
        <p className="text-sm text-muted">
          Nothing in this plan lists a rope length — instructor routes are taught in person and
          carry no spec, so this is not a zero-rope plan, it is an unestimated one. Add a tie with
          a listed length to get a number.
        </p>
      ) : (
        <p className="text-sm text-muted">
          {result.eights} × 8m staffs for the current plan
          {plan.length ? "" : " (add ties below, or load a scene in Plan)"}. That is{" "}
          {result.total}m of listed rope plus 15% waste. You have {eights} × 8m and {fours} × 4m,
          so {coverage.meters}m.{" "}
          {coverage.enough
            ? "Enough, including waste."
            : coverage.eightsShort > 0 && coverage.metersShort === 0
              ? `You have the metres but ${coverage.eightsShort} too few 8m staffs — a tie that wants an 8m rope cannot be tied from two 4m ones.`
              : `Short by ${coverage.metersShort}m. Add rope or cut the scene.`}
        </p>
      )}
      {!result.nothingEstimable && result.rows.some((r) => !r.estimable) && (
        <p className="mt-2 text-sm text-muted">
          Entries marked “not estimated” list no rope length and add nothing to the total.
        </p>
      )}
      {result.unknownSlugs.length > 0 && (
        <p className="mt-2 text-sm text-warn">
          {result.unknownSlugs.length} entr{result.unknownSlugs.length === 1 ? "y is" : "ies are"}{" "}
          not in the library ({result.unknownSlugs.join(", ")}), counted at 8m each. Treat the total
          as a guess until you replace {result.unknownSlugs.length === 1 ? "it" : "them"}.
        </p>
      )}
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <label>
          8m staffs
          <input
            type="number"
            min={0}
            className="mt-1 h-11 w-full rounded-md border border-border bg-elevated px-3"
            value={eights}
            onChange={(e) => setEights(Number(e.target.value) || 0)}
          />
        </label>
        <label>
          4m staffs
          <input
            type="number"
            min={0}
            className="mt-1 h-11 w-full rounded-md border border-border bg-elevated px-3"
            value={fours}
            onChange={(e) => setFours(Number(e.target.value) || 0)}
          />
        </label>
      </div>
      <ul className="mt-6 space-y-1 text-sm">
        {/* Keyed by position, not slug: the same tie can legitimately appear
            twice in one plan. */}
        {result.rows.map((r, index) => (
          <li key={`${r.slug}-${index}`} className="flex justify-between border-b border-border py-2">
            <span>
              {r.name}
              {!r.known && <span className="ml-2 text-xs text-warn">not in the library</span>}
            </span>
            <span className="tabular-nums text-muted">
              {r.estimable ? `${r.meters}m` : "not estimated"}
            </span>
          </li>
        ))}
      </ul>
      <label htmlFor="calc-add-tie" className="sr-only">
        Add a tie to this estimate
      </label>
      <select
        id="calc-add-tie"
        className="mt-6 h-11 w-full rounded-md border border-border bg-elevated px-3 text-sm"
        defaultValue=""
        onChange={(e) => {
          if (e.target.value) setExtra((x) => [...x, e.target.value]);
          e.target.value = "";
        }}
      >
        <option value="">Add a tie</option>
        {TIES.map((t) => (
          <option key={t.slug} value={t.slug}>
            {t.name}
          </option>
        ))}
      </select>
      {/* Added ties were folded into the total with no list of their own and no
          way to remove one, so a mis-tapped entry silently inflated the
          estimate for the rest of the session. */}
      {extra.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xs uppercase tracking-wide text-subtle">Added to this estimate</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {extra.map((slug, index) => (
              <li
                key={`${slug}-${index}`}
                className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-1"
              >
                <span>{getTie(slug)?.name ?? slug}</span>
                <button
                  type="button"
                  aria-label={`Remove ${getTie(slug)?.name ?? slug} from this estimate`}
                  className="min-h-11 cursor-pointer rounded-md px-3 text-xs text-muted hover:text-fg"
                  onClick={() => setExtra((x) => x.filter((_, i) => i !== index))}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <h2 className="mt-10 font-display text-2xl">Catalog</h2>
      <ul className="mt-3 space-y-1 text-sm">
        {catalog.map((c) => (
          <li key={c.slug} className="flex justify-between text-muted">
            <span>{c.name}</span>
            <span className="tabular-nums">
              {c.ropes.length > 0 ? `${c.meters}m` : "not estimated"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
