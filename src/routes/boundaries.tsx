import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { combineRanks, needsTalk } from "@/lib/boundaries/combine";
import { useBoundaries, type Side } from "@/lib/stores/boundaries";
import { LOCKED_NO, useNegotiate, type Rank } from "@/lib/stores/negotiate";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/boundaries")({
  ssr: false,
  component: BoundariesPage,
});

type Tab = Side | "together";
const RANKS: Rank[] = ["yes", "maybe", "no"];

function rankClass(active: boolean, r: Rank) {
  if (!active) return "text-muted";
  return r === "no" ? "bg-danger text-danger-fg" : r === "yes" ? "bg-ok/20 text-ok" : "bg-warn/20 text-warn";
}

function BoundariesPage() {
  const [tab, setTab] = useState<Tab>("a");
  const names = useBoundaries((s) => s.names);
  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Before anything</p>
      <h1 className="mt-2 font-display text-4xl">Boundaries checklist</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Each of you answers on your own, without looking. Then open Together: only what you both
        said yes to counts as yes. Different answers are a conversation, not a negotiation to win.
      </p>
      <div role="tablist" aria-label="Whose answers" className="mt-6 grid grid-cols-3 gap-1 rounded-full border border-border bg-surface p-1">
        {(["a", "b", "together"] as Tab[]).map((t) => (
          <button
            key={t}
            role="tab"
            type="button"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "min-h-11 cursor-pointer truncate rounded-full px-2 text-sm",
              tab === t ? "bg-accent text-accent-fg" : "text-muted",
            )}
          >
            {t === "together" ? "Together" : names[t]}
          </button>
        ))}
      </div>
      {tab === "together" ? <Together /> : <PartnerSheet key={tab} side={tab} />}
    </div>
  );
}

function PartnerSheet({ side }: { side: Side }) {
  const items = useNegotiate((s) => s.items);
  const name = useBoundaries((s) => s.names[side]);
  const answers = useBoundaries((s) => s.answers[side]);
  const notes = useBoundaries((s) => s.notes[side]);
  const setName = useBoundaries((s) => s.setName);
  const setAnswer = useBoundaries((s) => s.setAnswer);
  const setNote = useBoundaries((s) => s.setNote);
  const clearSide = useBoundaries((s) => s.clearSide);
  const answered = items.filter((i) => answers[i.id]).length;
  return (
    <section className="mt-6" aria-label={`${name}'s answers`}>
      <label className="block text-sm">
        <span className="text-muted">Name shown on this sheet</span>
        <input
          value={name}
          onChange={(e) => setName(side, e.target.value)}
          className="mt-1 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-base"
        />
      </label>
      <p className="mt-4 text-xs text-muted">
        {answered} of {items.length} answered. Skipped rows count as no.
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((i) => {
          const locked = LOCKED_NO.has(i.id);
          const current = locked ? "no" : answers[i.id];
          return (
            <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 py-2">
              <span className="text-sm" id={`b-${side}-${i.id}`}>
                {i.label}
                {locked && <span className="mt-0.5 block text-[11px] text-muted">Always no in this app.</span>}
              </span>
              <div role="group" aria-labelledby={`b-${side}-${i.id}`} className="flex gap-1">
                {RANKS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    disabled={locked && r !== "no"}
                    aria-pressed={current === r}
                    onClick={() => setAnswer(side, i.id, r)}
                    className={cn(
                      "min-h-11 min-w-14 cursor-pointer rounded-full px-3 text-[11px] uppercase tracking-wide",
                      rankClass(current === r, r),
                      locked && r !== "no" && "cursor-not-allowed opacity-40",
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
      <label className="mt-6 block text-sm">
        <span className="text-muted">Health notes (injuries, meds, joints, anything that numbs easily)</span>
        <textarea
          value={notes.health}
          onChange={(e) => setNote(side, "health", e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-md border border-border bg-surface p-3 text-base"
        />
      </label>
      <label className="mt-4 block text-sm">
        <span className="text-muted">What I need afterwards (aftercare)</span>
        <textarea
          value={notes.aftercare}
          onChange={(e) => setNote(side, "aftercare", e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-md border border-border bg-surface p-3 text-base"
        />
      </label>
      <Button variant="ghost" className="mt-4" onClick={() => clearSide(side)}>
        Clear {name}'s answers
      </Button>
    </section>
  );
}

function Together() {
  const items = useNegotiate((s) => s.items);
  const setRank = useNegotiate((s) => s.setRank);
  const names = useBoundaries((s) => s.names);
  const answers = useBoundaries((s) => s.answers);
  const notes = useBoundaries((s) => s.notes);
  const [applied, setApplied] = useState(false);
  const rows = items.map((i) => {
    const a = LOCKED_NO.has(i.id) ? "no" : answers.a[i.id];
    const b = LOCKED_NO.has(i.id) ? "no" : answers.b[i.id];
    return { ...i, a, b, shared: combineRanks(a, b), talk: needsTalk(a, b) };
  });
  const yes = rows.filter((r) => r.shared === "yes");
  const talk = rows.filter((r) => r.talk);
  const apply = () => {
    for (const r of rows) setRank(r.id, r.shared);
    setApplied(true);
  };
  return (
    <section className="mt-6 space-y-6" aria-label="Shared answers">
      <div className="rounded-lg border border-ok/30 bg-ok/5 p-4">
        <h2 className="font-display text-xl">You both said yes ({yes.length})</h2>
        {yes.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Nothing yet. Fill in both sheets first.</p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-2">
            {yes.map((r) => (
              <li key={r.id} className="rounded-full bg-ok/15 px-3 py-1 text-sm text-ok">{r.label}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="rounded-lg border border-warn/30 bg-warn/5 p-4">
        <h2 className="font-display text-xl">Talk about these ({talk.length})</h2>
        <p className="mt-1 text-xs text-muted">You answered differently. Until you agree, the cautious answer stands.</p>
        <ul className="mt-3 space-y-1 text-sm">
          {talk.map((r) => (
            <li key={r.id} className="flex justify-between gap-2 border-b border-border py-1">
              <span>{r.label}</span>
              <span className="text-muted">
                {names.a}: {r.a ?? "—"} · {names.b}: {r.b ?? "—"}
              </span>
            </li>
          ))}
        </ul>
        <Link to="/conversation" className="mt-3 inline-block text-sm text-accent underline">
          Conversation guide for these talks
        </Link>
      </div>
      {(["a", "b"] as Side[]).map((s) =>
        notes[s].health || notes[s].aftercare ? (
          <div key={s} className="rounded-lg border border-border bg-surface p-4 text-sm">
            <h2 className="font-display text-xl">{names[s]}</h2>
            {notes[s].health && <p className="mt-2"><span className="text-muted">Health: </span>{notes[s].health}</p>}
            {notes[s].aftercare && <p className="mt-1"><span className="text-muted">Aftercare: </span>{notes[s].aftercare}</p>}
          </div>
        ) : null,
      )}
      <div>
        <Button onClick={apply} className="min-h-11 w-full">Use these shared answers as tonight's limits</Button>
        <p className="mt-2 text-xs text-muted">
          This sets the app's limits list to your shared answers. Ties and the camera unlock only for shared yes.
          {applied && " Done — "}
          {applied && <Link to="/negotiate" className="underline">review limits</Link>}
        </p>
      </div>
    </section>
  );
}
