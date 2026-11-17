import { createFileRoute, Link } from "@tanstack/react-router";
import { articleEvidenceSources, getArticle, getArticleEvidence, getKnot, getTie } from "@/lib/kb";

export const Route = createFileRoute("/article/$slug")({ component: ArticlePage });

function ArticlePage() {
  const { slug } = Route.useParams();
  const article = getArticle(slug);
  if (!article) {
    return (
      <div className="px-5 py-16 text-muted">
        Missing article. <Link to="/knowledge">Knowledge base</Link>
      </div>
    );
  }
  const evidence = getArticleEvidence(article.slug);
  const evidenceSources = articleEvidenceSources(article.slug);
  return (
    <article className="mx-auto max-w-2xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Full article · {article.section}</p>
      <h1 className="mt-2 font-display text-4xl">{article.title}</h1>
      <p className="mt-4 text-sm text-muted">{article.summary}</p>
      {article.slug === "aftercare" && (
        <Link to="/aftercare" className="mt-4 inline-flex text-sm text-accent underline">
          Open the aftercare checklist
        </Link>
      )}
      <div className="mt-8 space-y-4">
        {article.blocks.map((b, i) => {
          if (b.type === "h")
            return (
              <h2 key={i} className="pt-4 font-display text-2xl">
                {b.text}
              </h2>
            );
          if (b.type === "p")
            return (
              <p key={i} className="text-sm leading-relaxed text-fg">
                {b.text}
              </p>
            );
          if (b.type === "ul")
            return (
              <ul key={i} className="list-disc space-y-1 pl-5 text-sm text-fg">
                {b.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          if (b.type === "warn")
            return (
              <p key={i} className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger-text">
                {b.text}
              </p>
            );
          return (
            <div key={i} className="rounded-md border border-border bg-elevated px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-subtle">{b.title}</p>
              <p className="mt-1 text-sm text-fg">{b.text}</p>
            </div>
          );
        })}
      </div>
      <section className="mt-10 rounded-lg border border-border bg-surface p-4" aria-labelledby="evidence-status">
        <p className="text-xs uppercase tracking-wide text-subtle">Evidence status</p>
        <h2 id="evidence-status" className="mt-1 font-display text-2xl">
          {evidence.status === "source_anchored" ? "Source-anchored editorial" : "Editorial only"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{evidence.note}</p>
        <p className="mt-2 text-[11px] text-subtle">
          Ledger {evidence.ledgerRevision} · audited {evidence.auditedAt}
        </p>
        {evidenceSources.length > 0 && (
          <ul className="mt-3 space-y-2">
            {evidenceSources.map((source) => (
              <li key={source.id}>
                <a
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-fg underline"
                >
                  {source.id} · {source.title}
                </a>
                <p className="mt-0.5 text-xs leading-relaxed text-muted">{source.note}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      {article.related.length > 0 && (
        <div className="mt-10">
          <p className="text-xs uppercase tracking-wide text-subtle">Related</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {article.related.map((r) => {
              const a = getArticle(r);
              const t = getTie(r);
              const k = getKnot(r);
              if (a) {
                return (
                  <Link
                    key={r}
                    to="/article/$slug"
                    params={{ slug: r }}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted hover:text-fg"
                  >
                    {a.title}
                  </Link>
                );
              }
              if (t) {
                return (
                  <Link
                    key={r}
                    to="/tie/$slug"
                    params={{ slug: r }}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted hover:text-fg"
                  >
                    {t.name}
                  </Link>
                );
              }
              if (k) {
                return (
                  <Link
                    key={r}
                    to="/knot/$slug"
                    params={{ slug: k.slug }}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted hover:text-fg"
                  >
                    {k.name}
                  </Link>
                );
              }
              return (
                <span key={r} className="text-xs text-subtle">
                  {r}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
}
