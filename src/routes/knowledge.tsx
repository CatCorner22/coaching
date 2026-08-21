import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { askKnowledge } from "@/lib/ai/ask";
import { ARTICLES, searchKnowledge, type SearchHit } from "@/lib/kb";

export const Route = createFileRoute("/knowledge")({ component: KnowledgePage });

function KnowledgePage() {
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const hits = useMemo(() => (q.trim().length > 1 ? searchKnowledge(q, 8) : []), [q]);
  const sections = [...new Set(ARTICLES.map((a) => a.section))];

  async function ask() {
    setPending(true);
    try {
      const res = await askKnowledge({
        data: {
          question: q || "How do we start safely?",
          slugs: (hits.length ? hits : searchKnowledge(q || "consent", 4)).map((h) => h.slug),
        },
      });
      if (res.ok) setAnswer(res.text);
      else setAnswer(res.error);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Guide</p>
      <h1 className="mt-2 font-display text-4xl">Knowledge</h1>
      <p className="mt-3 text-sm text-muted">
        Consent, risk recognition, privacy, and aftercare. Search in your words; results point to
        reviewed entries without generating individualized rope instructions.
      </p>
      <div className="mt-6 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Radial nerve, aftercare, crotch rope…"
          aria-label="Search the knowledge base"
          className="h-11 flex-1 rounded-md border border-border bg-elevated px-3 text-sm"
        />
        <Button onClick={() => void ask()} disabled={pending}>
          {pending ? "Searching…" : "Find entries"}
        </Button>
      </div>
      {answer && (
        <div className="mt-4 whitespace-pre-wrap rounded-lg border border-border bg-surface p-4 text-sm leading-relaxed">
          {answer}
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
      {sections.map((sec) => (
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
                    {a.minutes} min
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
      <Link to="/dungeon" className={className}>
        {label}
      </Link>
    );
  }
  return (
    <Link to="/gear" className={className}>
      {label}
    </Link>
  );
}
