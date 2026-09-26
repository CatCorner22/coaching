import type { Article, ArticleBlock } from "./types";

function blockText(block: ArticleBlock): string {
  if (block.type === "ul") return block.items.join(" ");
  if (block.type === "callout") return `${block.title} ${block.text}`;
  return block.text;
}

export function articleMinutes(article: Pick<Article, "blocks">): number {
  const words = article.blocks
    .map(blockText)
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}
