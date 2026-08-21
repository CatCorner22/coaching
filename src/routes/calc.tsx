import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TIES } from "@/lib/kb";
import { catalogLengths, metersFor } from "@/lib/calc/rope";
import { useKit } from "@/lib/stores/kit";
import { usePlanner } from "@/lib/stores/planner";

export const Route = createFileRoute("/calc")({ component: CalcPage });

function CalcPage() {
  const plan = usePlanner((s) => s.slugs);
  const eights = useKit((s) => s.eights);
  const fours = useKit((s) => s.fours);
  const setEights = useKit((s) => s.setEights);
  const setFours = useKit((s) => s.setFours);
  const have = eights * 8 + fours * 4;
  const [extra, setExtra] = useState<string[]>([]);
  const result = useMemo(() => metersFor([...plan, ...extra]), [plan, extra]);
  const catalog = catalogLengths();
  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Kit</p>
      <h1 className="mt-2 font-display text-4xl">Rope calculator</h1>
      <p className="mt-3 text-sm text-muted">
        Lengths from the library, plus 15% waste for tails and a second staff. Jute is sold in
        eights for a reason.
      </p>
      <p className="mt-6 font-display text-5xl tabular-nums">{result.plusWaste}m</p>
      <p className="text-sm text-muted">
        {result.eights} × 8m staffs for the current plan
        {plan.length ? "" : " (add ties below, or load a scene in Plan)"}
        . You have {eights} × 8m and {fours} × 4m ({have}m).
        {have < result.plusWaste ? " Short. Add rope or cut the scene." : " Enough, including waste."}
      </p>
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
        {result.rows.map((r) => (
          <li key={r.slug} className="flex justify-between border-b border-border py-2">
            <span>{r.name}</span>
            <span className="tabular-nums text-muted">{r.meters}m</span>
          </li>
        ))}
      </ul>
      <select
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
      <h2 className="mt-10 font-display text-2xl">Catalog</h2>
      <ul className="mt-3 space-y-1 text-sm">
        {catalog.map((c) => (
          <li key={c.slug} className="flex justify-between text-muted">
            <span>{c.name}</span>
            <span className="tabular-nums">{c.meters}m</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
