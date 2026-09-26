import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ARTICLES,
  articleMinutes,
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
  // knowledgeAnswer prefixes the same action text. The banner below now carries
  // it, so drop the duplicate when a submitted answer is also on screen.
  const answerBody =
    answer && disposition.action && answer.startsWith(disposition.action)
      ? answer.slice(disposition.action.length).trimStart()
      : answer;
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
      <h1 className="mt-2 font-display text-4xl">Guide</h1>
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
          placeholder="Try: karada, TK, shears, where do I start"
          aria-label="guide"
          className="h-11 flex-1 rounded-md border border-border bg-elevated px-3 text-sm"
        />
        <Button onClick={ask} disabled={!usableQuery}>
          Find entries
        </Button>
      </div>
      {/*
        The action has to stand on its own as soon as the wording is recognised.
        It used to render only inside the submitted answer, so someone typing
        "she cant breathe" saw a reordered list of links and nothing else unless
        they also pressed Find entries — the one thing a person in that moment
        should not have to do. Routing this query well and then hiding the
        result behind a second tap defeats the whole point of routing it.
      */}
      {actionFirst && (
        <div
          role="alert"
          aria-live="assertive"
          className="mt-4 whitespace-pre-wrap rounded-lg border border-danger/50 bg-danger/10 p-4 text-sm leading-relaxed"
        >
          <p>{disposition.action}</p>
          {disposition.emergencyHref && (
            <Link
              to={disposition.emergencyHref}
              className="mt-3 inline-flex rounded-md border border-danger px-3 py-2 font-medium text-danger-text hover:bg-danger/10"
            >
              Open emergency card
            </Link>
          )}
        </div>
      )}
      {answerBody && (
        <div
          role="status"
          aria-live="polite"
          className="mt-4 whitespace-pre-wrap rounded-lg border border-border bg-surface p-4 text-sm leading-relaxed"
        >
          <p>{answerBody}</p>
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
      {!actionFirst && !usableQuery && (
        <section className="mt-10">
          <h2 className="font-display text-2xl">Start here</h2>
          <div className="mt-3 space-y-2">
            {["first-ten-sessions", "getting-rope-off", "the-check-that-works", "negotiation", "aftercare", "circulation"].map((slug, index) => {
              const article = ARTICLES.find((item) => item.slug === slug);
              if (!article) return null;
              return (
                <details key={slug} open={index === 0} className="rounded-lg border border-border bg-surface p-4">
                  <summary className="cursor-pointer font-display text-xl">{article.title}</summary>
                  <p className="mt-2 text-sm text-muted">{article.summary}</p>
                  <Link to="/article/$slug" params={{ slug }} className="mt-2 inline-flex text-sm text-accent">
                    Read ~{articleMinutes(article)} min →
                  </Link>
                </details>
              );
            })}
          </div>
        </section>
      )}
      {!actionFirst && !usableQuery && sections.map((sec) => (
        <details key={sec} className="mt-10 rounded-lg border border-border p-4">
          <summary className="cursor-pointer font-display text-2xl capitalize">
            {sec} ({ARTICLES.filter((a) => a.section === sec).length})
          </summary>
          <ul className="mt-3 space-y-2">
            {ARTICLES.filter((a) => a.section === sec).map((a) => (
              <li key={a.slug}>
                <Link to="/article/$slug" params={{ slug: a.slug }} className="block rounded-lg border border-border bg-surface p-4 hover:border-border-strong">
                  <p className="font-display text-2xl">{a.title}</p>
                  <p className="mt-1 text-sm text-muted">{a.summary}</p>
                  <p className="mt-2 text-[11px] uppercase tracking-wide text-subtle">~{articleMinutes(a)} min read</p>
                </Link>
              </li>
            ))}
          </ul>
        </details>
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
  if (hit.kind === "tool") {
    return (
      <Link to={hit.href as never} className={className}>
        <span className="mr-2 rounded-full border border-accent/30 px-2 py-0.5 text-[10px] uppercase tracking-wide text-accent">Tool</span>
        {hit.title}
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
