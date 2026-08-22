import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ARTICLES,
  isKnowledgeQueryUsable,
  knowledgeAnswer,
  knowledgeDisposition,
  searchKnowledge,
  type SearchHit,
} from "@/lib/kb";

export const Route = createFileRoute("/knowledge")({ component: KnowledgePage });

function KnowledgePage() {
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const usableQuery = isKnowledgeQueryUsable(q);
  const hits = useMemo(() => (usableQuery ? searchKnowledge(q, 8) : []), [q, usableQuery]);
  const disposition = useMemo(() => knowledgeDisposition(q), [q]);
  const actionFirst = disposition.kind !== "ordinary";
  const sections = [...new Set(ARTICLES.map((a) => a.section))];

  function updateQuery(value: string) {
    setQ(value);
    setAnswer(null);
  }

  function ask() {
    const question = q.trim();
    if (!isKnowledgeQueryUsable(question)) return;
    setAnswer(knowledgeAnswer(question));
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Guide</p>
      <h1 className="mt-2 font-display text-4xl">Knowledge</h1>
      <p className="mt-3 text-sm text-muted">
        Consent, risk recognition, privacy, and aftercare. Search in your words; results point to
        curated local entries without generating individualized rope instructions. Evidence status
        and source anchors appear on each article.
      </p>
      <div className="mt-6 flex gap-2">
        <input
          value={q}
          onChange={(e) => updateQuery(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.nativeEvent.isComposing && usableQuery) {
              ask();
            }
          }}
          maxLength={600}
          placeholder="Radial nerve, aftercare, crotch rope…"
          aria-label="Search the knowledge base"
          className="h-11 flex-1 rounded-md border border-border bg-elevated px-3 text-sm"
        />
        <Button onClick={ask} disabled={!usableQuery}>
          Find entries
        </Button>
      </div>
      {answer && (
        <div
          role={actionFirst ? "alert" : "status"}
          aria-live={actionFirst ? "assertive" : "polite"}
          className={`mt-4 whitespace-pre-wrap rounded-lg border p-4 text-sm leading-relaxed ${
            actionFirst ? "border-danger/50 bg-danger/10" : "border-border bg-surface"
          }`}
        >
          <p>{answer}</p>
          {disposition.emergencyHref && (
            <Link
              to={disposition.emergencyHref}
              className="mt-3 inline-flex rounded-md border border-danger px-3 py-2 font-medium text-danger hover:bg-danger/10"
            >
              Open emergency card
            </Link>
          )}
        </div>
      )}
      {hits.length > 0 && (
        <ul className="mt-4 space-y-2">
          {hits.map((h) => (
            <li key={h.kind + h.slug}>
              <HitLink hit={h} />
            </li>
          ))}
        </ul>
      )}
      {usableQuery && hits.length === 0 && (
        <p className="mt-4 text-sm text-muted">
          No curated local entry matched that wording. Try consent, privacy, aftercare, nerves,
          equipment, or emergency release.
        </p>
      )}
      {!actionFirst && sections.map((sec) => (
        <section key={sec} className="mt-10">
          <h2 className="font-display text-2xl capitalize">{sec}</h2>
          <ul className="mt-3 space-y-2">
            {ARTICLES.filter((a) => a.section === sec).map((a) => (
              <li key={a.slug}>
                <Link
                  to="/article/$slug"
                  params={{ slug: a.slug }}
                  className="block rounded-lg border border-border bg-surface p-4 hover:border-border-strong"
                >
                  <p className="font-display text-2xl">{a.title}</p>
                  <p className="mt-1 text-sm text-muted">{a.summary}</p>
                  <p className="mt-2 text-[11px] uppercase tracking-wide text-subtle">
                    {a.minutes} min reading estimate
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function HitLink({ hit }: { hit: SearchHit }) {
  const className = "text-sm text-muted hover:text-fg";
  const label = (
    <>
      {hit.title}
      <span className="text-subtle"> · {hit.kind}</span>
    </>
  );
  if (hit.kind === "tie") {
    return (
      <Link to="/tie/$slug" params={{ slug: hit.slug }} className={className}>
        {label}
      </Link>
    );
  }
  if (hit.kind === "knot") {
    return (
      <Link to="/knot/$slug" params={{ slug: hit.slug }} className={className}>
        {label}
      </Link>
    );
  }
  if (hit.kind === "article") {
    return (
      <Link to="/article/$slug" params={{ slug: hit.slug }} className={className}>
        {label}
      </Link>
    );
  }
  if (hit.kind === "dungeon") {
    return (
      <Link to="/dungeon" hash={hit.slug} className={className}>
        {label}
      </Link>
    );
  }
  if (hit.kind === "nerve") {
    return (
      <Link to="/nerves" search={{ nerve: hit.slug }} className={className}>
        {label}
      </Link>
    );
  }
  return (
    <Link to="/gear" hash={hit.slug} className={className}>
      {label}
    </Link>
  );
}
