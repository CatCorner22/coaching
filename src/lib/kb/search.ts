import { ARTICLES } from "./articles";
import { GEAR } from "./gear";
import { KNOTS } from "./knots";
import { TIES } from "./ties";

export type HitKind = "tie" | "knot" | "article" | "gear";

export type SearchHit = {
  kind: HitKind;
  slug: string;
  title: string;
  href: string;
  summary: string;
  score: number;
};

function tokens(q: string) {
  return q
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1);
}

function scoreText(terms: string[], parts: { text: string; w: number }[]) {
  let s = 0;
  for (const term of terms) {
    for (const part of parts) {
      const hay = part.text.toLowerCase();
      if (hay === term) s += 8 * part.w;
      else if (hay.includes(term)) s += part.w;
    }
  }
  return s;
}

export function searchKnowledge(query: string, limit = 12): SearchHit[] {
  const terms = tokens(query);
  if (!terms.length) return [];
  const hits: SearchHit[] = [];

  for (const t of TIES) {
    const score = scoreText(terms, [
      { text: t.name, w: 6 },
      { text: t.jp, w: 4 },
      { text: t.slug, w: 4 },
      { text: t.summary, w: 2 },
      { text: t.nerves.join(" "), w: 3 },
      { text: t.intent.join(" "), w: 2 },
      { text: t.why, w: 1 },
    ]);
    if (score > 0) {
      hits.push({
        kind: "tie",
        slug: t.slug,
        title: t.name,
        href: `/tie/${t.slug}`,
        summary: t.summary,
        score,
      });
    }
  }

  for (const k of KNOTS) {
    const score = scoreText(terms, [
      { text: k.name, w: 6 },
      { text: k.slug, w: 4 },
      { text: k.summary, w: 2 },
    ]);
    if (score > 0) {
      hits.push({
        kind: "knot",
        slug: k.slug,
        title: k.name,
        href: `/knot/${k.slug}`,
        summary: k.summary,
        score,
      });
    }
  }

  for (const a of ARTICLES) {
    const body = a.blocks
      .map((b) => {
        if (b.type === "p" || b.type === "h" || b.type === "warn") return b.text;
        if (b.type === "callout") return `${b.title} ${b.text}`;
        return b.items.join(" ");
      })
      .join(" ");
    const score = scoreText(terms, [
      { text: a.title, w: 6 },
      { text: a.slug, w: 4 },
      { text: a.summary, w: 3 },
      { text: a.section, w: 2 },
      { text: body, w: 1 },
    ]);
    if (score > 0) {
      hits.push({
        kind: "article",
        slug: a.slug,
        title: a.title,
        href: `/article/${a.slug}`,
        summary: a.summary,
        score,
      });
    }
  }

  for (const g of GEAR) {
    const score = scoreText(terms, [
      { text: g.name, w: 6 },
      { text: g.slug, w: 3 },
      { text: g.summary, w: 2 },
      { text: g.notes.join(" "), w: 1 },
    ]);
    if (score > 0) {
      hits.push({
        kind: "gear",
        slug: g.slug,
        title: g.name,
        href: "/gear",
        summary: g.summary,
        score,
      });
    }
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function articleExcerpts(slugs: string[], maxChars = 900) {
  return slugs
    .map((slug) => {
      const a = ARTICLES.find((x) => x.slug === slug);
      if (!a) return null;
      const text = a.blocks
        .map((b) => {
          if (b.type === "ul") return b.items.join(" ");
          if (b.type === "callout") return `${b.title}: ${b.text}`;
          return b.text;
        })
        .join(" ");
      return { slug: a.slug, title: a.title, text: text.slice(0, maxChars) };
    })
    .filter((x): x is { slug: string; title: string; text: string } => !!x);
}
