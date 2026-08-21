import { ARTICLES } from "./articles";
import { GEAR } from "./gear";
import { KNOTS } from "./knots";
import { DUNGEON } from "./dungeon";
import { NERVES } from "./nerves";
import { TIES } from "./ties";

export type HitKind = "tie" | "knot" | "article" | "gear" | "dungeon" | "nerve";

export type SearchHit = {
  kind: HitKind;
  slug: string;
  title: string;
  href: string;
  summary: string;
  score: number;
};

const MAX_QUERY_CODE_POINTS = 600;
const MAX_QUERY_TERMS = 24;
const MAX_RESULTS = 50;
const MAX_EXCERPT_SLUGS = 12;
const MAX_EXCERPT_CHARS = 4_000;
const DEFAULT_EXCERPT_CHARS = 900;
const WORDS = /[\p{L}\p{N}]+/gu;
const CJK = /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/u;
const CJK_RUNS = /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]+/gu;
const MAX_CJK_WHOLE_TERM_CODE_POINTS = 8;
const CJK_SEARCH_TERMS = [
  "呼吸できない",
  "息ができない",
  "呼吸困難",
  "不能呼吸",
  "无法呼吸",
  "呼吸困难",
  "意識がない",
  "反応がない",
  "失神",
  "けいれん",
  "痙攣",
  "転倒",
  "頭を打った",
  "昏倒",
  "失去意识",
  "无反应",
  "没有反应",
  "癫痫发作",
  "抽搐",
  "胸痛",
  "跌倒",
  "摔倒",
  "撞到头",
  "头部受伤",
  "ロープを切る",
  "緊急時",
  "緊急",
  "切る",
  "紧急",
  "切断",
  "绳索",
  "绳",
  "同意",
  "撤回",
  "取り消し",
  "撤销",
  "取消",
  "收回",
  "神経",
  "神经",
  "しびれ",
  "痺れ",
  "麻木",
  "安全に始める",
  "安全开始",
  "安全",
  "始める",
  "始め",
  "开始",
  "縛り",
  "绑缚",
] as const;
const STOP_TERMS = new Set([
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "do",
  "does",
  "for",
  "from",
  "how",
  "in",
  "is",
  "it",
  "me",
  "my",
  "of",
  "on",
  "or",
  "our",
  "the",
  "this",
  "to",
  "us",
  "we",
  "what",
  "when",
  "where",
  "which",
  "who",
  "why",
  "with",
  "you",
  "your",
]);

const SEARCH_ALIASES: Readonly<Record<string, string>> = {
  "article:circulation":
    "blue limb cold limb pale limb gray limb colour change color change discoloration swelling numbness tingling",
  "article:consent-frameworks":
    "coercion coerced forced pressure retaliation freely given revoke withdrawn consent 合意 同意 撤回 取り消し 拒否 中止 取消 撤销 收回",
  "article:emergency-stop":
    "911 emergency services ambulance unconscious unresponsive not responding passed out fainted seizure chest pain serious fall hit head stroke rapid release cut shears not breathing cannot breathe can't breathe 呼吸できない 息ができない 呼吸困難 意識がない 反応がない 失神 けいれん 痙攣 胸痛 転倒 頭を打った 緊急 緊急時 ロープを切る 切断 不能呼吸 无法呼吸 呼吸困难 昏倒 失去意识 无反应 没有反应 癫痫发作 抽搐 胸痛 跌倒 摔倒 撞到头 头部受伤 紧急 切断绳索",
  "article:hard-limits":
    "strangulation choking choke neck compression airway breath restriction intoxication unconscious solo bondage",
  "article:negotiation":
    "coercion capacity sober ehlers danlos ehlers-danlos eds raynauds raynaud's medication health condition safe start start safely begin safely beginner 安全に始める 始め方 初心者 縛り 安全开始 如何开始 绑缚",
  "article:nerve-atlas":
    "radial ulnar median peroneal fibular femoral tibial saphenous brachial pudendal numbness tingling weakness 神経 末梢神経 しびれ 痺れ 麻痺 神经 麻木 刺痛 无力",
  "article:photography-ethics":
    "secret recording coercion privacy deletion revoke permission sharing retention",
  "article:safewords": "red yellow safeword safe word stop signal nonverbal signal",
  "gear:shears":
    "trauma shears emergency release cut rope cut rope now rapid release unresponsive passed out seizure serious fall ロープを切る 緊急 切断 意識がない 失神 痙攣 転倒 绳索 紧急 切断绳索 昏倒 无反应 癫痫发作 摔倒",
  "tie:takate-kote": "tk takatekote takate kote box tie box-tie",
};

function boundedText(value: unknown, maxCodePoints = MAX_QUERY_CODE_POINTS) {
  const prefix = String(value ?? "").slice(0, maxCodePoints * 2);
  return Array.from(prefix).slice(0, maxCodePoints).join("");
}

function normalized(value: unknown, bounded = false) {
  const text = bounded ? boundedText(value) : String(value ?? "");
  return text.normalize("NFKC").toLowerCase();
}

function words(value: unknown, bounded = false) {
  return normalized(value, bounded).match(WORDS) ?? [];
}

function tokens(q: unknown) {
  const unique = new Set<string>();
  const add = (term: string) => {
    if (unique.size >= MAX_QUERY_TERMS || unique.has(term)) return;
    unique.add(term);
  };

  for (const term of words(q, true)) {
    if (!CJK.test(term)) {
      if (STOP_TERMS.has(term) || term.length < 2) continue;
      add(term);
      if (unique.size >= MAX_QUERY_TERMS) break;
      continue;
    }

    for (const run of term.match(CJK_RUNS) ?? []) {
      const codePoints = Array.from(run);
      if (codePoints.length <= MAX_CJK_WHOLE_TERM_CODE_POINTS) add(run);

      // Recognized safety terms go first so a long, unspaced sentence cannot
      // consume the term budget before its emergency/consent intent is seen.
      for (const candidate of CJK_SEARCH_TERMS) {
        if (run.includes(candidate)) add(candidate);
      }

      // Bigrams and trigrams make natural CJK sentences searchable without a
      // language-specific segmenter. `add` keeps this globally capped at 24.
      for (const size of [2, 3] as const) {
        for (let index = 0; index + size <= codePoints.length; index += 1) {
          add(codePoints.slice(index, index + size).join(""));
          if (unique.size >= MAX_QUERY_TERMS) break;
        }
        if (unique.size >= MAX_QUERY_TERMS) break;
      }
      if (unique.size >= MAX_QUERY_TERMS) break;
    }
    if (unique.size >= MAX_QUERY_TERMS) break;
  }
  return [...unique];
}

function intentBoosts(query: unknown) {
  const text = normalized(query, true).replace(/[’‘]/gu, "'").replace(/\s+/gu, " ").trim();
  const boosts = new Map<string, number>();
  const add = (key: string, amount: number) => boosts.set(key, (boosts.get(key) ?? 0) + amount);

  const breathingEmergency =
    /\b(?:not|cannot|can't|cant|unable to)\s+breath(?:e|ing)\b/u.test(text) ||
    /\b(?:difficulty|trouble)\s+breath(?:ing|e)\b/u.test(text) ||
    ["呼吸できない", "息ができない", "呼吸困難", "不能呼吸", "无法呼吸", "呼吸困难"].some((phrase) =>
      text.includes(phrase),
    );
  const responsivenessEmergency =
    /\b(?:passed out|pass(?:es|ed|ing)? out|fainted|fainting|unconscious|unresponsive|not responding|not responsive)\b/u.test(
      text,
    ) ||
    [
      "意識がない",
      "反応がない",
      "失神",
      "昏倒",
      "失去意识",
      "无反应",
      "没有反应",
    ].some((phrase) => text.includes(phrase));
  const seizureEmergency =
    /\b(?:seizure|seizing|convulsion|convulsions)\b/u.test(text) ||
    ["けいれん", "痙攣", "癫痫发作", "抽搐"].some((phrase) => text.includes(phrase));
  const chestPainEmergency = /\bchest pain\b/u.test(text) || text.includes("胸痛");
  const fallOrHeadEmergency =
    /\b(?:serious fall|fell|fallen|falling)\b[^.!?]{0,48}\b(?:hit|struck|hurt|injured)\s+(?:their|his|her|my|the)?\s*head\b/u.test(
      text,
    ) ||
    /\b(?:hit|struck|hurt|injured)\s+(?:their|his|her|my|the)?\s*head\b/u.test(text) ||
    ["転倒", "頭を打った", "跌倒", "摔倒", "撞到头", "头部受伤"].some((phrase) => text.includes(phrase));
  const emergencyCut =
    /\bcut\s+(?:the\s+)?rope(?:\s+(?:now|immediately))?\b/u.test(text) ||
    ((text.includes("緊急") || text.includes("緊急時")) && text.includes("ロープ") &&
      (text.includes("切る") || text.includes("切断"))) ||
    (text.includes("紧急") && (text.includes("绳") || text.includes("绳索")) &&
      (text.includes("切") || text.includes("切断")));
  if (
    breathingEmergency ||
    responsivenessEmergency ||
    seizureEmergency ||
    chestPainEmergency ||
    fallOrHeadEmergency ||
    emergencyCut
  ) {
    add("article:emergency-stop", 2_000);
    add("gear:shears", 1_800);
    add("article:hard-limits", 900);
  }

  const consentWithdrawal =
    /\b(?:revoke|withdraw|cancel)\s+(?:my\s+)?consent\b/u.test(text) ||
    /\bconsent\s+(?:is\s+)?(?:revoked|withdrawn|cancelled|canceled)\b/u.test(text) ||
    (text.includes("同意") && ["撤回", "取り消し", "取消", "撤销", "收回"].some((term) => text.includes(term)));
  if (consentWithdrawal) {
    add("article:consent-frameworks", 1_600);
    add("article:safewords", 1_000);
    add("article:emergency-stop", 600);
  }

  const safeStart =
    ((/\b(?:safe|safely)\b/u.test(text) && /\b(?:start|begin|starting|beginning)\b/u.test(text)) ||
      (text.includes("安全") && ["始め", "始める", "开始"].some((term) => text.includes(term)))) &&
    !breathingEmergency &&
    !emergencyCut;
  if (safeStart) {
    add("article:negotiation", 1_400);
    add("article:consent-frameworks", 1_200);
    add("article:scene-architecture", 800);
  }

  if (text.includes("神経") || text.includes("神经")) {
    add("article:nerve-atlas", 1_400);
  }

  return boosts;
}

function intentBoost(boosts: ReadonlyMap<string, number>, kind: HitKind, slug: string) {
  return boosts.get(`${kind}:${slug}`) ?? 0;
}

export function isKnowledgeQueryUsable(query: unknown) {
  return tokens(query).length > 0;
}

function scoreText(terms: string[], parts: { text: string; w: number }[]) {
  let s = 0;
  for (const part of parts) {
    const hay = normalized(part.text);
    const hayWords = words(hay);
    const wordSet = new Set(hayWords);
    const compact = hay.replace(/[^\p{L}\p{N}]+/gu, "");
    for (const term of terms) {
      if (hay === term) {
        s += 8 * part.w;
      } else if (wordSet.has(term)) {
        s += 4 * part.w;
      } else if (term.length >= 4 && compact === term) {
        s += 6 * part.w;
      } else if (
        term.length >= 4 &&
        hayWords.some((word) => word.length >= 4 && (word.startsWith(term) || term.startsWith(word)))
      ) {
        s += part.w;
      } else if (CJK.test(term) && hay.includes(term)) {
        s += 2 * part.w;
      }
    }
  }
  return s;
}

function aliasPart(kind: HitKind, slug: string) {
  return { text: SEARCH_ALIASES[`${kind}:${slug}`] ?? "", w: 7 };
}

function boundedLimit(limit: number | undefined) {
  if (limit === undefined) return 12;
  const numeric = Number(limit);
  if (!Number.isFinite(numeric)) return 12;
  return Math.max(0, Math.min(MAX_RESULTS, Math.trunc(numeric)));
}

export function searchKnowledge(query: string, limit = 12): SearchHit[] {
  const terms = tokens(query);
  if (!terms.length) return [];
  const safeLimit = boundedLimit(limit);
  if (safeLimit === 0) return [];
  const boosts = intentBoosts(query);
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
      aliasPart("tie", t.slug),
    ]) + intentBoost(boosts, "tie", t.slug);
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
      { text: k.watch.join(" "), w: 1 },
      aliasPart("knot", k.slug),
    ]) + intentBoost(boosts, "knot", k.slug);
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
      { text: a.jp ?? "", w: 4 },
      { text: a.slug, w: 4 },
      { text: a.summary, w: 3 },
      { text: a.section, w: 2 },
      { text: body, w: 1 },
      aliasPart("article", a.slug),
    ]) + intentBoost(boosts, "article", a.slug);
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
      aliasPart("gear", g.slug),
    ]) + intentBoost(boosts, "gear", g.slug);
    if (score > 0) {
      hits.push({
        kind: "gear",
        slug: g.slug,
        title: g.name,
        href: `/gear#${g.slug}`,
        summary: g.summary,
        score,
      });
    }
  }

  for (const d of DUNGEON) {
    const score = scoreText(terms, [
      { text: d.name, w: 6 },
      { text: d.slug, w: 4 },
      { text: d.kind, w: 3 },
      { text: d.summary, w: 2 },
      { text: d.withRope.join(" "), w: 1 },
      { text: d.never.join(" "), w: 2 },
      aliasPart("dungeon", d.slug),
    ]) + intentBoost(boosts, "dungeon", d.slug);
    if (score > 0) {
      hits.push({
        kind: "dungeon",
        slug: d.slug,
        title: d.name,
        href: `/dungeon#${d.slug}`,
        summary: d.summary,
        score,
      });
    }
  }

  for (const n of NERVES) {
    const score = scoreText(terms, [
      { text: n.name, w: 7 },
      { text: n.slug, w: 5 },
      { text: n.zone, w: 2 },
      { text: n.risk, w: 3 },
      { text: n.check, w: 2 },
      { text: n.avoid, w: 1 },
      aliasPart("nerve", n.slug),
    ]) + intentBoost(boosts, "nerve", n.slug);
    if (score > 0) {
      hits.push({
        kind: "nerve",
        slug: n.slug,
        title: n.name,
        href: `/nerves?nerve=${encodeURIComponent(n.slug)}`,
        summary: `${n.zone} ${n.risk}`,
        score,
      });
    }
  }

  const kindOrder: Record<HitKind, number> = {
    article: 0,
    nerve: 1,
    tie: 2,
    knot: 3,
    gear: 4,
    dungeon: 5,
  };
  return hits
    .sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      if (kindOrder[a.kind] !== kindOrder[b.kind]) return kindOrder[a.kind] - kindOrder[b.kind];
      if (a.slug === b.slug) return 0;
      return a.slug < b.slug ? -1 : 1;
    })
    .slice(0, safeLimit);
}

/** Format a deterministic, reviewed-only answer locally; this never needs AI or a network. */
export function knowledgeAnswer(query: string, limit = 6): string {
  const hits = searchKnowledge(query, limit);
  if (!hits.length) {
    return "No reviewed entry matched that wording. Try a broad topic such as consent, privacy, aftercare, nerves, equipment, or emergency release. This search does not generate individualized rope instructions.";
  }
  const reading = hits.map((hit) => `• ${hit.title} (${hit.kind})`).join("\n");
  return `Relevant reviewed entries:\n${reading}\n\nOpen the matching entries below. This search is educational only and does not validate a setup, infer consent or physiology, or provide individualized high-consequence instructions.`;
}

export function articleExcerpts(slugs: string[], maxChars = 900) {
  const safeMaxChars = Number.isFinite(maxChars)
    ? Math.max(0, Math.min(MAX_EXCERPT_CHARS, Math.trunc(maxChars)))
    : DEFAULT_EXCERPT_CHARS;
  const uniqueSlugs = [
    ...new Set(
      (Array.isArray(slugs) ? slugs : [])
        .filter((slug): slug is string => typeof slug === "string")
        .map((slug) => boundedText(slug, 80).trim())
        .filter(Boolean),
    ),
  ].slice(0, MAX_EXCERPT_SLUGS);
  return uniqueSlugs
    .map((slug) => {
      const a = ARTICLES.find((x) => x.slug === slug);
      if (a) {
        const text = a.blocks
          .map((b) => {
            if (b.type === "ul") return b.items.join(" ");
            if (b.type === "callout") return `${b.title}: ${b.text}`;
            return b.text;
          })
          .join(" ");
        return { slug: a.slug, title: a.title, text: text.slice(0, safeMaxChars) };
      }
      const t = TIES.find((x) => x.slug === slug);
      if (t) {
        return {
          slug: t.slug,
          title: t.name,
          text: `${t.summary} ${t.why} Stop: ${t.stop.join("; ")}`.slice(0, safeMaxChars),
        };
      }
      const k = KNOTS.find((x) => x.slug === slug);
      if (k) {
        return {
          slug: k.slug,
          title: k.name,
          text: `${k.summary} ${k.watch.join(" ")}`.slice(0, safeMaxChars),
        };
      }
      const d = DUNGEON.find((x) => x.slug === slug);
      if (d) {
        return {
          slug: d.slug,
          title: d.name,
          text: `${d.summary} With rope: ${d.withRope.join(" ")} Never: ${d.never.join(" ")}`.slice(0, safeMaxChars),
        };
      }
      return null;
    })
    .filter((x): x is { slug: string; title: string; text: string } => !!x);
}
