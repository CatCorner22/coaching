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
  "大量出血",
  "激しい出血",
  "出血がひどい",
  "脳卒中",
  "片側の脱力",
  "首を圧迫",
  "喉が締まっている",
  "声の変化",
  "飲み込みにくい",
  "跌倒",
  "摔倒",
  "撞到头",
  "头部受伤",
  "大量出血",
  "严重出血",
  "中风症状",
  "中风",
  "单侧无力",
  "颈部受压",
  "声音改变",
  "吞咽困难",
  "호흡곤란",
  "의식이 없다",
  "반응이 없다",
  "심한 출혈",
  "뇌졸중 증상",
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
    "911 emergency services ambulance cardiac arrest no pulse collapse collapsed blackout unconscious unresponsive won't wake up not responding passed out fainted seizure chest pain severe bleeding uncontrolled bleeding bleeding heavily bleeding profusely serious fall hit head stroke facial droop speech difficulty major weakness rapid release cut shears stopped breathing gasping for air can't catch breath not breathing cannot breathe can't breathe 呼吸できない 息ができない 呼吸困難 意識がない 反応がない 失神 けいれん 痙攣 胸痛 大量出血 激しい出血 脳卒中 片側の脱力 転倒 頭を打った 緊急 緊急時 ロープを切る 切断 不能呼吸 无法呼吸 呼吸困难 昏倒 失去意识 无反应 没有反应 癫痫发作 抽搐 胸痛 大量出血 严重出血 中风症状 单侧无力 跌倒 摔倒 撞到头 头部受伤 紧急 切断绳索 호흡곤란 의식이 없다 반응이 없다 심한 출혈 뇌졸중 증상",
  "article:hard-limits":
    "strangulation choking choke neck compression airway breath restriction intoxication unconscious solo bondage",
  "article:negotiation":
    "coercion capacity sober ehlers danlos ehlers-danlos eds raynauds raynaud's medication health condition safe start start safely begin safely beginner 安全に始める 始め方 初心者 縛り 安全开始 如何开始 绑缚",
  "article:nerve-atlas":
    "radial ulnar median peroneal fibular femoral tibial saphenous brachial pudendal numbness tingling weakness 神経 末梢神経 しびれ 痺れ 麻痺 神经 麻木 刺痛 无力",
  "article:photography-ethics":
    "secret recording coercion privacy deletion revoke permission sharing retention minor underage under 18 teen ambiguous age nude naked explicit image explicit photo unsupported media",
  "article:safewords": "red yellow safeword safe word stop signal nonverbal signal",
  "article:positional-asphyxia":
    "prone face down facedown chest compression can't expand chest belly compression folded position hogtie breathing position restricted breathing positional asphyxia",
  "article:gag-signal-safety":
    "ball gag gagged mouth covered tape over mouth nose blocked congestion stuffy nose drop signal held object nonverbal safeword",
  "article:nerve-self-checks":
    "hand check finger check thumbs up ok sign wiggle fingers grip strength tingling fingers sleepy hand numb patch self check",
  "article:circulation-vs-nerve":
    "cold hand whole hand numb part of hand few fingers purple hand swollen hand pins and needles which is it circulation or nerve",
  "article:fainting-response":
    "faint fainting fainted lightheaded light-headed dizzy woozy tunnel vision graying vision nausea standing too long vasovagal syncope suspension syndrome",
  "article:cuff-and-collar-fit":
    "cuff cuffs handcuff leather cuff two finger fit collar leash spreader bar padlock key quick release too tight",
  "article:solo-self-tying":
    "self tie self-tie solo alone by myself self bondage self-bondage practice alone escape release plan",
  "article:medical-disclosure":
    "health condition medical history diabetes neuropathy blood thinner anticoagulant ehlers danlos hypermobile asthma seizure epilepsy pregnant pregnancy medication disclosure",
  "article:rope-inspection-retirement":
    "inspect inspection fray frayed fuzzy worn core damage retire retirement wash washing store storage mildew",
  "article:incident-response":
    "injury injured hurt after injury wrist drop weak hand still numb next day doctor urgent care report debrief what happened",
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

export type KnowledgeDispositionKind =
  | "ordinary"
  | "emergency"
  | "prompt_medical"
  | "release_now"
  | "consent_withdrawn"
  | "unsupported_media";

export type KnowledgeDisposition = {
  kind: KnowledgeDispositionKind;
  action: string;
  emergencyHref?: "/emergency";
};

const ORDINARY_DISPOSITION: KnowledgeDisposition = {
  kind: "ordinary",
  action: "",
};

function intentText(query: unknown) {
  return normalized(query, true).replace(/[’‘]/gu, "'").replace(/\s+/gu, " ").trim();
}

function includesAny(text: string, phrases: readonly string[]) {
  return phrases.some((phrase) => text.includes(phrase));
}

/**
 * Conservative, local routing for time-critical or unsupported requests.
 * This is deliberately separate from relevance scoring: a high score must never
 * be the only thing standing between an urgent query and an action-first answer.
 */
export function knowledgeDisposition(query: unknown): KnowledgeDisposition {
  const text = intentText(query);
  if (!text) return ORDINARY_DISPOSITION;

  const breathingEmergency =
    /\b(?:not|cannot|can't|cant|isn't|isnt|wasn't|wasnt|unable to|stopped|stops|has stopped|no longer)\s+breath(?:e|ing)\b/u.test(
      text,
    ) ||
    /\b(?:abnormal|difficult|difficulty|trouble)\s+breath(?:ing|e)\b/u.test(text) ||
    /\b(?:struggling to|hard to)\s+breath(?:e|ing)\b/u.test(text) ||
    /\b(?:breathless|short of breath|shortness of breath|struggling for breath|gasping|suffocat(?:e|ed|ing))\b/u.test(text) ||
    /\b(?:can't|cant|cannot|unable to)\s+(?:get (?:enough )?air|speak)\b/u.test(text) ||
    /\b(?:barely|labou?red|shallow|agonal|irregular)\s+breathing\b/u.test(text) ||
    /\bno\s+breathing\b/u.test(text) ||
    // Vomiting or aspiration behind a gag is an airway emergency; the gag
    // article routes it here.
    /\b(?:aspirat(?:e|ed|ing|ion)|choking on (?:vomit|sick|their tongue))\b/u.test(text) ||
    // An actual incident, not an educational question about gag risk. Requires a
    // present/past report ("she is vomiting with the gag in"), so "does a ball
    // gag increase the risk of vomiting" stays an ordinary search.
    ((/\b(?:vomit(?:s|ed|ing)?|throw(?:s|ing)? up|threw up|be(?:ing)? sick|puk(?:e|es|ed|ing)|retch(?:es|ed|ing)?|heav(?:es|ed|ing))\b[^.!?]{0,32}\bgag(?:ged|ging)?\b/u.test(text) ||
      /\bgag(?:ged|ging)?\b[^.!?]{0,32}\b(?:vomit(?:s|ed|ing)?|throw(?:s|ing)? up|threw up|be(?:ing)? sick|puk(?:e|es|ed|ing)|retch(?:es|ed|ing)?|heav(?:es|ed|ing)|choking)\b/u.test(text)) &&
      !/\b(?:risk|risks|danger|dangers|safety|prevent|avoid|reduce|clean|cleaning|wash|advice|guide|article|why|should i|can a|does a|do gags|is it safe)\b/u.test(text)) ||
    includesAny(text, ["猿ぐつわ", "口塞", "재갈"]) &&
      includesAny(text, ["嘔吐", "吐いて", "呕吐", "구토", "토하"]) ||
    /\bwheez(?:e|ed|ing)\b[^.!?]{0,32}\b(?:can't|cant|cannot|unable to)\s+speak\b/u.test(text) ||
    /\b(?:gasping for air|(?:can't|cant|cannot|unable to) catch (?:their |his |her |my )?breath)\b/u.test(text) ||
    includesAny(text, [
      "呼吸できない",
      "息ができない",
      "呼吸困難",
      "息が苦しい",
      "不能呼吸",
      "无法呼吸",
      "呼吸困难",
      "喘不上气",
      "호흡곤란",
      "숨을 못 쉬",
      "숨을 쉴 수 없어요",
      "喉が締まっている",
    ]);
  const chokingEmergency = /\bchok(?:e|ed|ing)\b/u.test(text);
  const responsivenessEmergency =
    /\b(?:passed out|pass(?:es|ed|ing)? out|fainted|fainting|unconscious|unresponsive|out cold|knocked out|not conscious|not awake|not responding|not responsive|stopped responding|lost consciousness|loss of consciousness|blackout|blacked out|collapsed?|won't wake(?: up)?|will not wake(?: up)?|does not wake(?: up)?|(?:can't|cant|cannot|unable to) (?:wake|awaken)(?: (?:them|him|her|me))?(?: up)?|(?:can't|cant|cannot|unable to) stay (?:awake|conscious)|not waking(?: up)?)\b/u.test(
      text,
    ) ||
    includesAny(text, [
      "意識がない",
      "反応がない",
      "失神",
      "意識不明",
      "昏倒",
      "失去意识",
      "无反应",
      "没有反应",
      "怎么叫也叫不醒",
      "의식이 없다",
      "반응이 없다",
      "깨워도 안 일어나요",
    ]);
  const seizureEmergency =
    /\b(?:seizure|seizing|convulsion|convulsions|convulsing)\b/u.test(text) ||
    includesAny(text, ["けいれん", "痙攣", "癫痫发作", "抽搐", "발작"]);
  const chestPainEmergency = /\bchest pain\b/u.test(text) || includesAny(text, ["胸痛", "흉통"]);
  const cardiacEmergency =
    /\b(?:cardiac arrest|heart attack|heart (?:has )?stopped|no (?:pulse|heart ?beat)|pulseless)\b/u.test(
      text,
    );
  const bleedingEmergency =
    /\b(?:severe|serious|heavy|major|uncontrolled|won't stop|will not stop)\s+bleed(?:ing)?\b/u.test(text) ||
    /\bbleed(?:ing)?\s+(?:profusely|heavily|severely|uncontrollably)\b/u.test(text) ||
    /\bbleed(?:ing)?\b[^.!?]{0,24}\b(?:won't|will not|does not)\s+stop\b/u.test(text) ||
    /\bblood\b[^.!?]{0,24}\b(?:won't|will not|does not)\s+stop\b/u.test(text) ||
    /\b(?:blood (?:is )?(?:spurting|gushing)|(?:spurting|gushing) blood|bleeding out|massive blood loss|h[ae]morrhag(?:e|ed|ing))\b/u.test(
      text,
    ) ||
    includesAny(text, [
      "大量出血",
      "激しい出血",
      "出血がひどい",
      "血が止まらない",
      "严重出血",
      "血流不止",
      "심한 출혈",
      "피가 멈추지 않아요",
    ]);
  const strokeEmergency =
    /\b(?:stroke(?:-like)?(?: signs?| symptoms?)?|facial droop|drooping face|face (?:is )?drooping|one[- ]sided weakness|one side (?:is )?weak|weak on (?:the )?(?:left|right) side|major weakness|sudden weakness|(?:left|right) (?:arm|leg) (?:is |became |suddenly )?(?:suddenly )?weak|slurred speech|(?:speech|words?) (?:are |is |became )?slurred|slurring (?:speech|words?))\b/u.test(
      text,
    ) ||
    includesAny(text, ["脳卒中", "片側の脱力", "中风症状", "中风", "单侧无力", "뇌졸중 증상"]);
  const fallOrHeadEmergency =
    /\b(?:serious|major|bad) fall\b/u.test(text) ||
    /\b(?:head injury|fell from (?:suspension|a height|height|the ceiling|a rig|the rig)|dropped from (?:a rig|the rig|suspension))\b/u.test(text) ||
    /\b(?:fell|fallen|falling)\b[^.!?]{0,48}\b(?:hit|struck|hurt|injured|banged)\s+(?:their|his|her|my|the)?\s*head\b/u.test(
      text,
    ) ||
    /\b(?:hit|struck|hurt|injured)\s+(?:their|his|her|my|the)?\s*head\b/u.test(text) ||
    includesAny(text, ["転倒", "頭を打った", "跌倒", "摔倒", "撞到头", "头部受伤"]);
  const severeConfusionEmergency =
    /\b(?:severe|sudden) confusion\b/u.test(text) ||
    /\b(?:suddenly|very) confused\b/u.test(text) ||
    /\baltered mental status\b/u.test(text);
  const materialColorChange =
    /\b(?:rope|cord|line|fabric|screen|light)\b[^.!?]{0,32}\bturning blue\b/u.test(text);
  const cyanosisEmergency =
    /\b(?:cyanotic|cyanosis|(?:blue|gr[ae]y|ashen|purple|dusky) (?:face|lips|skin|tongue)|(?:face|lips|skin|tongue) (?:are |is |was |were |look |looks |looked |seem |seems )?(?:looking |going |turning |getting |gone )?(?:blue|gr[ae]y|ashen|purple|dusky)|turning (?:blue|gr[ae]y|ashen|purple|dusky) around (?:the )?(?:face|lips))\b/u.test(
      text,
    ) ||
    includesAny(text, ["唇が紫", "唇が青", "顔が紫", "嘴唇发紫", "嘴唇发青", "脸色发紫", "입술이 보라", "입술이 파래"]) ||
    (/\bturning blue\b/u.test(text) && !materialColorChange);
  const neckTerminologyContext =
    /\b(?:chokehold|strangulation|asphyxiation)\s+(?:terminology|definition|meaning|history)\b/u.test(
      text,
    );
  const neckContext =
    !neckTerminologyContext &&
    (/\b(?:neck (?:pressure|compression|constriction|was squeezed)|pressure (?:on|to) (?:the |my |their |his |her )?(?:neck|throat)|(?:squeezed|grabbed|compressed) (?:the |my |their |his |her )?(?:neck|throat)|strang(?:le|led|ling|ulation|ulated)|chok(?:e|ed|ing|ehold)|throttl(?:e|ed|ing)|garrot(?:e|ed|ing)|manual strangulation|(?:erotic )?asphyxi(?:a|ation|ated))\b/u.test(
      text,
    ) ||
      /\b(?:rope|cord|line|ligature|noose|hands?)\b[^.!?]{0,48}\b(?:around|on|across|near|over|touching)\s+(?:the\s+|my\s+|their\s+|his\s+|her\s+)?(?:neck|throat)\b/u.test(
        text,
      ) ||
      // Hanging is a neck-loading emergency. The object must be the neck or a
      // ligature — NOT rope/rig, because "hanging from the rope" is ordinary
      // suspension vocabulary and must not be emergency-routed. "hung" is an
      // irregular form the inflection group cannot produce.
      /\b(?:hang(?:s|ed|ing)?|hung)\s+(?:by|from)\s+(?:the\s+|their\s+|his\s+|her\s+|my\s+|a\s+)?(?:neck|throat|noose|ligature)\b/u.test(
        text,
      ) ||
      /\b(?:hung|hang(?:ed|ing))\s+(?:themsel(?:f|ves)|him ?self|her ?self|my ?self)\b/u.test(text) ||
      /\bself[- ]?hang(?:ed|ing)?\b/u.test(text) ||
      /\b(?:neck|throat)\b[^.!?]{0,16}\b(?:hung|hanging|hanged)\b/u.test(text) ||
      // "hung from the rig by his neck": the neck object can trail the verb.
      /\b(?:hung|hang(?:s|ed|ing)?)\b[^.!?]{0,24}\bby\s+(?:the\s+|his\s+|her\s+|their\s+|my\s+)?(?:neck|throat)\b/u.test(
        text,
      ) ||
      includesAny(text, ["首を吊", "首吊り", "首つり", "上吊", "吊死", "목을 맸", "목맴", "목을 매"]) ||
      /\bbreath\s*play\b[^.!?]{0,32}\b(?:last night|yesterday|earlier|happened|after|during)\b/u.test(
        text,
      ) ||
      /\b(?:after|during)\b[^.!?]{0,32}\bbreath\s*play\b/u.test(text) ||
      includesAny(text, [
        "首を圧迫",
        "首が締",
        "喉が締まっている",
        "颈部受压",
        "勒颈",
        "목 압박",
      ]));
  const concerningNeckSymptom =
    /\b(?:concerning symptoms?|breath(?:ing)? (?:change|changed|difficulty|problem)|swallow(?:ing)?|voice chang(?:e|ed|ing)|hoarse|raspy voice|(?:can't|cant|cannot|unable to) speak|confusion|confused|faint(?:ed|ing|ness)?|headache|dizz(?:y|iness)|weakness|vision change)\b/u.test(
      text,
    ) ||
    includesAny(text, [
      "声の変化",
      "飲み込みにくい",
      "めまい",
      "混乱",
      "声音改变",
      "吞咽困难",
      "头晕",
      "혼란",
      "어지러",
      "삼키기",
      "목소리 변화",
    ]);
  const emergencyReleaseRequest =
    /\bcut\s+(?:the\s+)?ropes?(?:\s+(?:now|immediately))?\b/u.test(text) ||
    /\bcut\s+(?:them|him|her|me)\s+free(?:\s+(?:now|immediately))?\b/u.test(text) ||
    /\bemergency release(?:\s+(?:now|immediately))?\b/u.test(text) ||
    ((text.includes("緊急") || text.includes("緊急時")) && text.includes("ロープ") &&
      (text.includes("切る") || text.includes("切断"))) ||
    includesAny(text, ["今すぐ縄を切って", "马上把绳子剪断", "지금 당장 밧줄을 잘라"]) ||
    (text.includes("紧急") && (text.includes("绳") || text.includes("绳索")) &&
      (text.includes("切") || text.includes("切断")));

  if (
    breathingEmergency ||
    chokingEmergency ||
    responsivenessEmergency ||
    seizureEmergency ||
    chestPainEmergency ||
    cardiacEmergency ||
    bleedingEmergency ||
    strokeEmergency ||
    fallOrHeadEmergency ||
    severeConfusionEmergency ||
    cyanosisEmergency ||
    emergencyReleaseRequest ||
    (neckContext && concerningNeckSymptom)
  ) {
    return {
      kind: "emergency",
      action:
        "Emergency: stop the activity. Support the person's position and release restraint without creating a fall. Call local emergency services now and follow dispatcher instructions. Do not delay for this app.",
      emergencyHref: "/emergency",
    };
  }

  if (neckContext) {
    return {
      kind: "prompt_medical",
      action:
        "Possible neck-pressure exposure: stop and release. Do not resume. Seek urgent medical assessment because serious or delayed harm can occur without visible injury; call emergency services now for breathing or swallowing change, voice change, confusion, fainting, severe headache, dizziness, weakness, or any worsening symptom.",
      emergencyHref: "/emergency",
    };
  }

  const consentWithdrawal =
    /\b(?:revoke|withdraw|cancel)\s+(?:my\s+)?consent\b/u.test(text) ||
    /\bconsent\s+(?:is\s+)?(?:revoked|withdrawn|cancelled|canceled)\b/u.test(text) ||
    /\b(?:(?:i|we|they|he|she)\s+)?(?:do not|don't|does not|doesn't)\s+consent\b/u.test(text) ||
    /\b(?:there is |there's )?no consent\b/u.test(text) ||
    /\b(?:stop|quit)\s+(?:recording|filming|photographing)\s+me\b/u.test(text) ||
    /\b(?:i |they |he |she |the person |my partner )?(?:said|says?)\s+stop\s+(?:recording|filming|photographing|taking (?:photos|pictures))\b/u.test(
      text,
    ) ||
    /\bstop\s+taking\s+(?:photos|pictures)\s+of\s+(?:me|them|him|her)\b/u.test(text) ||
    /\bdelete\s+(?:my|their|his|her)\s+(?:photo|image|picture|video|recording|upload)\b/u.test(text) ||
    /\b(?:revoke|withdraw|cancel)\s+(?:my |their |his |her )?(?:upload|recording|camera|photo|video)\s+permission\b/u.test(
      text,
    ) ||
    /\bpermission\s+to\s+(?:upload|record|film|photograph|share)\s+(?:was |is |has been )?(?:withdrawn|revoked|cancelled|canceled)\b/u.test(
      text,
    ) ||
    /\bchanged\s+(?:my|their|his|her)\s+mind\b/u.test(text) ||
    /\b(?:they|he|she|the person|my partner)\s+(?:told|asked)\s+me\s+to\s+stop\b/u.test(text) ||
    includesAny(text, ["やめてと言われた", "对方说停下", "상대가 그만하라고 했어요"]) ||
    (text.includes("同意") && ["撤回", "取り消し", "取消", "撤销", "收回"].some((term) => text.includes(term)));
  const secretRecordingPrevention =
    /\bhow to (?:prevent|avoid|detect|protect against)\b[^.!?]{0,48}\bsecret recording\b/u.test(
      text,
    );
  const secretOrCoercedRecording =
    !secretRecordingPrevention &&
    (/\b(?:secret(?:ly)?|hidden|without (?:their|his|her|my)?\s*permission|coerced?|forced)\s+(?:camera|recording|photo|image|upload)\b/u.test(
      text,
    ) ||
      /\b(?:recorded|filmed|photographed|uploaded|shared)\b[^.!?]{0,32}\bwithout\s+(?:their|his|her|my)?\s*permission\b/u.test(
        text,
      ) ||
      /\b(?:recorded|filmed|photographed|uploaded|shared)\b[^.!?]{0,32}\bwithout\s+(?:their|his|her|my)?\s*consent\b/u.test(
        text,
      ) ||
      /\b(?:didn't|did not|never)\s+agree\s+to\s+(?:the\s+)?(?:camera|recording|filming|photo|video|upload|sharing)\b/u.test(
        text,
      ) ||
      /\b(?:recording|photo|image|upload)\s+(?:is|was)\s+(?:secret|hidden|coerced|forced)\b/u.test(
        text,
      ) ||
      /\b(?:camera|recorder)\s+(?:is|was)\s+(?:secret|hidden)\b/u.test(text) ||
      /\b(?:forced|coerced)\b[^.!?]{0,48}\b(?:pose|posing)\b[^.!?]{0,32}\b(?:photo|image|picture)\b/u.test(
        text,
      ) ||
      /\b(?:surreptitious|nonconsensual|unconsented)\s+(?:camera|recording|video|photo|image|upload)\b/u.test(
        text,
      ) ||
      /\b(?:took|captured|recorded|filmed)\b[^.!?]{0,48}\b(?:photo|picture|image|video)?\b[^.!?]{0,24}\bwhile (?:asleep|sleeping|unconscious)\b/u.test(
        text,
      ) ||
      /\b(?:spy\s*cam|spy camera)\b[^.!?]{0,32}\b(?:video|photo|image|recording|footage)\b/u.test(
        text,
      ) ||
      /\b(?:shared|uploaded|posted)\b[^.!?]{0,32}\bagainst\s+(?:their|his|her|my)\s+wishes\b/u.test(
        text,
      ) ||
      /\b(?:revenge porn|stolen (?:intimate|nude|explicit) (?:photo|image|video|recording))\b/u.test(
        text,
      ) ||
      /\b(?:didn't|did not|never) ask\b[^.!?]{0,48}\bbefore (?:filming|recording|photographing|uploading)\b/u.test(
        text,
      ) ||
      /\bno permission to (?:record|film|photograph|upload|share)\b/u.test(text) ||
      /\b(?:they|he|she|the person|my partner) (?:said|told me) no to (?:the )?(?:camera|recording|photo|video|upload)\b/u.test(
        text,
      ) ||
      includesAny(text, [
        "隠し撮り",
        "盗撮",
        "未经同意拍摄",
        "未经同意录像",
        "몰래 촬영",
        "몰래 찍",
      ]));
  const mediaContext =
    /\b(?:camera|capture|clip|filming|image|media|model|photo|photograph|picture|recording|still|upload|video)\b/u.test(
      text,
    );
  const minorNonAgeContext =
    /\bminor (?:damage|fraying|injur(?:y|ies)|issue|repair|rope|wear)\b/u.test(text);
  // Equipment age ("my rope is 5 years old", "16 year old jute") is not a
  // person's age. Gate only the otherwise-unconditional bare years-old pattern
  // on this; person/media-anchored age patterns below still fail closed.
  // Any reference to a person forbids the equipment reading outright. This
  // guard exists only so "my rope is 5 years old" is not treated as a
  // child-safety report, and it must fail closed: an earlier, looser version
  // let "16 year old girlfriend rope photo" and "rope for my 14 year old"
  // bypass the block simply because a rope word sat nearby.
  // A possessive directly before an equipment noun ("her rope is 5 years old")
  // describes the equipment, so it must not veto the equipment reading.
  const ageScanText = text.replace(
    /\b(?:my|your|his|her|their|our|its)\s+(?=(?:rope|ropes|hemp|jute|jutes|cotton|nylon|mfp|cord|cords|line|lines|webbing|hardware|harness|harnesses|gear|equipment|kit|carabiner|carabiners|ring|rings|shears|bamboo)\b)/gu,
    "",
  );
  const personReference =
    /\b(?:he|him|his|she|her|hers|they|them|their|theirs|you|your|partner|girlfriend|boyfriend|wife|husband|spouse|model|person|people|someone|somebody|anyone|friend|sub|bottom|top|rigger|bunny|girl|boy|woman|women|man|men|lady|guy|kid|kids|child|children|son|daughter|niece|nephew|cousin|student|teen|teenager|minor|adult|adults)\b/u.test(
      ageScanText,
    );
  const EQUIPMENT = "rope|ropes|hemp|jute|jutes|cotton|nylon|mfp|cord|cords|line|lines|webbing|hardware|harness|harnesses|gear|equipment|kit|carabiner|carabiners|ring|rings|shears|bamboo";
  const equipmentAgeContext =
    !personReference &&
    // The equipment noun must actually govern the age through a copula, with at
    // most one intervening word ("my rope is 5 years old", "these ropes are 12
    // years old") — not merely appear within a window of it.
    (new RegExp(
      `\\b(?:${EQUIPMENT})\\b(?:\\s+\\w+)?\\s+(?:is|are|was|were)\\s+(?:about\\s+|around\\s+|roughly\\s+)?(?:[0-9]|1[0-7])[- ]years?[- ]old\\b`,
      "u",
    ).test(text) ||
      // Or the age directly qualifies the equipment noun ("16 year old jute").
      new RegExp(`\\b(?:[0-9]|1[0-7])[- ]years?[- ]old\\s+(?:${EQUIPMENT})\\b`, "u").test(text));
  const ambiguousAgeMedia =
    !minorNonAgeContext &&
    (/^(?:minor|underage|under[- ]?18|under eighteen|ambiguous age|child)$/u.test(text) ||
      /\b(?:underage|under[- ]?18|under eighteen|below 18|ambiguous age|age (?:is )?(?:unknown|unclear|unconfirmed|not verified)|unknown age|unknown[- ]aged|young[- ]looking (?:person|participant|model)|childlike (?:person|participant|model)|looks? young (?:in (?:the )?)?(?:photo|image|picture|video)|not sure (?:if )?(?:(?:they are|he is|she is|the person is) )?(?:an )?adult|(?:can't|cant|cannot|unable to) (?:confirm|verify) (?:an )?adult|(?:don't|do not) know (?:their|his|her|the person's) age|not eighteen|not of age|below (?:the )?legal age|under (?:the )?legal age)\b/u.test(
        text,
      ) ||
      (mediaContext &&
        /\b(?:minor|teen(?:ager)?|child|kid|preteen|adolescent|schoolchild|high school student|middle school student|schoolgirl|schoolboy|juvenile)\b/u.test(
          text,
        )) ||
    (mediaContext &&
      /\b(?:id|age) (?:was |is )?not (?:checked|verified|confirmed)\b/u.test(text)) ||
    // "her age is 16" — a person's stated age without the "years old" wording.
    // Requires a person reference so an equipment age ("the rope age is 5")
    // is not swept in.
    (personReference && /\bage (?:is |was )?(?:[0-9]|1[0-7])\b/u.test(text)) ||
    (!equipmentAgeContext &&
      /\b(?:(?:[0-9]|1[0-7])|(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen))[- ]years?[- ]old\b/u.test(
        text,
      )) ||
    /\b(?:age[ds]?\s*:?\s*(?:[0-9]|1[0-7])|(?:[0-9]|1[0-7])\s*years? of age)\b[^.!?]{0,32}\b(?:photo|image|picture|video|media|model|person)\b/u.test(
      text,
    ) ||
    /\b(?:[0-9]|1[0-7])\s*(?:yo\b|y\/o\b|y\.?\s*o\.?|yrs? old\b)[^!?]{0,32}\b(?:photo|image|picture|video|media|model|person)\b/u.test(
      text,
    ) ||
    /\baged\s+(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen)\b[^.!?]{0,32}\b(?:photo|image|video|media|model|person)\b/u.test(
      text,
    ) ||
    /\b(?:kid|schoolgirl|schoolboy|juvenile|childlike (?:person|participant|model))\b[^.!?]{0,32}\b(?:photo|image|video|media|model|person)\b/u.test(
      text,
    ));
  const explicitScanText = text.replace(/\bnon[- ]explicit\b/gu, "");
  const nudeColorContext =
    /\bnude(?:[- ](?:pink|beige|tan|tone|toned|colou?r(?:ed)?))?\s+(?:rope|cord|line|shade|paint)\b/u.test(
      text,
    );
  const explicitMedia =
    (!nudeColorContext && /\b(?:nude|nudes|nudity|naked|nakedness|nsfw)\b/u.test(explicitScanText)) ||
    /^(?:porn|pornographic|xxx|explicit (?:image|photo|video|media))$/u.test(explicitScanText) ||
    (mediaContext &&
      /\b(?:nude|nudes|nudity|naked|nakedness|topless|nsfw|undressed|unclothed|no clothes|full frontal|bare (?:breasts?|chest)|(?:breasts?|nipples?|private parts?|genitals?)(?: are| is| look)? visible|genital|vulva|penis|sex(?:ual)? acts?|sexual activity|sexual intercourse|sex scene|graphic sex|xxx|intimate|explicit|porn(?:ographic)?|hardcore|adult content|lewd)\b/u.test(
        explicitScanText,
      ));
  const unsupportedMedia =
    ambiguousAgeMedia ||
    explicitMedia ||
    /(?:[0-9]|1[0-7])歳(?:の)?写真/u.test(text) ||
    /(?:[0-9]|1[0-7])岁照片/u.test(text) ||
    /(?:[0-9]|1[0-7])살 사진/u.test(text) ||
    includesAny(text, [
      "未成年の写真",
      "露出写真",
      "裸の写真",
      "ヌード写真",
      "未成年照片",
      "裸体照片",
      "成人视频",
      "미성년자 사진",
      "나체 사진",
      "성인물 영상",
    ]);
  const releaseSymptom =
    /\b(?:new |sudden |worsening |sharp worsening |increasing )?(?:numb(?:ness)?|tingl(?:e|ing|y)|pins and needles|burning|electric sensation|weakness|loss of (?:movement|function|coordination|sensation)|no sensation|reduced movement|weak grip|foot drop|wrist drop|severe pain|escalating pain|excruciating pain|faintness|lightheaded(?:ness)?|swollen|swelling|edema)\b/u.test(
      text,
    ) ||
    /\b(?:can't|cant|cannot|can not|won't|wont|will not|unable to)\s+(?:lift|extend|raise|straighten|move)\s+(?:my |their |his |her |the )?(?:wrist|hand)\b/u.test(text) ||
    /\b(?:wrist|hand)\b[^.!?]{0,16}\b(?:won't|wont|will not|can't|cant|cannot|can not|unable to|doesn't|doesnt|does not)\s+(?:lift|extend|raise|move|straighten|go up)\b/u.test(text) ||
    includesAny(text, ["手首が上がらない", "手首が動かない", "手腕抬不起", "手腕无力", "손목이 올라가지"]) ||
    /\b(?:feel|feels|feeling|felt|am|is|are|was|were|got|gets|getting|went|seems?)\s+(?:very |really |so |quite |a bit )?(?:faint|light[- ]?headed|woozy|dizzy)\b/u.test(text) ||
    /\b(?:going to|about to|gonna)\s+(?:faint|pass out|black out)\b/u.test(text) ||
    includesAny(text, ["めまい", "立ちくらみ", "ふらつく", "头晕", "頭暈", "어지러", "현기증"]) ||
    /\bloss of grip\b(?![^.!?]{0,24}\b(?:rope )?tool\b)/u.test(text) ||
    /\b(?:dropping things|hand (?:feels?|felt) dead)\b/u.test(text) ||
    /\b(?:can't|cant|cannot|unable to)\s+feel\s+(?:my|their|his|her)?\s*(?:finger|fingers|hand|hands|toe|toes|foot|feet)\b/u.test(
      text,
    ) ||
    /\b(?:finger|fingers|hand|hands|toe|toes|foot|feet)\b[^.!?]{0,24}\b(?:won't|will not|cannot|can't)\s+move\b/u.test(
      text,
    ) ||
    /\b(?:can't|cant|cannot|unable to)\s+(?:grip|wiggle (?:my |their |his |her )?(?:fingers?|toes?))\b/u.test(
      text,
    ) ||
    /\b(?:can't|cant|cannot|unable to)\s+move\s+(?:my |their |his |her )?(?:fingers?|hands?|toes?|feet)\b/u.test(
      text,
    ) ||
    /\b(?:arm|arms|hand|hands|leg|legs|limb|limbs|foot|feet|finger|fingers|fingertip|fingertips|toe|toes)\s+(?:is |are )?(?:purple|blue|black|white|grey|gray|cold|cool|pale|asleep|puffy)\b/u.test(
      text,
    ) ||
    /\b(?:purple|blue|black|white|grey|gray|cold|cool|pale|puffy)\s+(?:arm|arms|hand|hands|leg|legs|limb|limbs|foot|feet|finger|fingers|fingertip|fingertips|toe|toes)\b/u.test(
      text,
    ) ||
    /\b(?:arm|arms|hand|hands|leg|legs|limb|limbs|foot|feet|finger|fingers|fingertip|fingertips|toe|toes)\b[^.!?]{0,16}\b(?:went|feels?|became|looks?)\s+(?:purple|blue|black|white|grey|gray|cold|cool|pale|puffy)\b/u.test(
      text,
    ) ||
    /\b(?:discolou?red)\s+(?:arm|hand|leg|limb|foot|finger|fingertip|toe)s?\b/u.test(text) ||
    /\b(?:sharp worsening|increasing)\s+pain\b/u.test(text) ||
    /\bpain\s+(?:has |is\s+)?(?:increased|worsened|getting|becoming|growing)\s*(?:worse)?\b/u.test(
      text,
    ) ||
    /\b(?:rope|cord|line)\b[^.!?]{0,48}\bcut\s+off\s+(?:the\s+)?circulation\b/u.test(text) ||
    includesAny(text, [
      "しびれ",
      "痺れ",
      "指の感覚がない",
      "麻木",
      "刺痛",
      "无力",
      "手没有知觉",
      "붓기",
      "저림",
      "손에 감각이 없어요",
    ]);
  if (releaseSymptom) {
    const consentAction =
      consentWithdrawal || secretOrCoercedRecording
        ? " Consent is absent or withdrawn: keep the camera off, delete any unsent local batch, and do not substitute another activity or upload."
        : "";
    const unsupportedMediaAction = unsupportedMedia
      ? " Do not capture or upload unsupported media; ambiguous age, nudity, and explicit sexual activity are outside this app's camera scope."
      : "";
    return {
      kind: "release_now",
      action:
        "Stop and release now without creating a fall. Check the person directly; a photo or normal appearance cannot clear sensation, movement, circulation, pain, or injury. Seek prompt medical assessment for persistent or worsening symptoms, and call emergency services for any emergency sign." +
        consentAction +
        unsupportedMediaAction,
      emergencyHref: "/emergency",
    };
  }

  if (consentWithdrawal || secretOrCoercedRecording) {
    return {
      kind: "consent_withdrawn",
      action:
        "Consent is absent or withdrawn: stop the activity, release any restraint, keep the camera off, and delete any unsent local batch. Do not substitute another activity or upload. A request already transmitted cannot be recalled by this app.",
    };
  }

  if (unsupportedMedia) {
    return {
      kind: "unsupported_media",
      action:
        "Unsupported media: do not capture or upload it. Camera analysis is limited to confirmed legal adults in non-explicit, consented images or selected video stills; clothed or intimate-wear views are within scope. The app does not automatically detect these conditions; ambiguous age, full nudity, explicit sexual activity, secret recording, and coerced media are prohibited and must not be selected or uploaded.",
    };
  }

  return ORDINARY_DISPOSITION;
}

function intentBoosts(query: unknown) {
  const text = intentText(query);
  const boosts = new Map<string, number>();
  const add = (key: string, amount: number) => boosts.set(key, (boosts.get(key) ?? 0) + amount);
  const disposition = knowledgeDisposition(text);
  if (disposition.kind === "emergency" || disposition.kind === "prompt_medical") {
    add("article:emergency-stop", 2_000);
    add("gear:shears", 1_800);
    add("article:hard-limits", 900);
  }

  if (disposition.kind === "consent_withdrawn") {
    add("article:consent-frameworks", 1_600);
    add("article:safewords", 1_000);
    add("article:emergency-stop", 600);
  }
  if (disposition.kind === "unsupported_media") {
    add("article:photography-ethics", 2_000);
    add("article:consent-frameworks", 1_100);
    add("article:hard-limits", 800);
  }
  if (disposition.kind === "release_now") {
    add("article:circulation", 1_900);
    add("article:nerve-atlas", 1_700);
    add("article:emergency-stop", 900);
  }

  const safeStart =
    ((/\b(?:safe|safely)\b/u.test(text) && /\b(?:start|begin|starting|beginning)\b/u.test(text)) ||
      (text.includes("安全") && ["始め", "始める", "开始"].some((term) => text.includes(term)))) &&
    disposition.kind === "ordinary";
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

const ACTION_HIT_ALLOWLIST: Record<
  Exclude<KnowledgeDispositionKind, "ordinary">,
  ReadonlySet<string>
> = {
  emergency: new Set([
    "article:emergency-stop",
    "article:hard-limits",
    "article:positional-asphyxia",
    "article:fainting-response",
    "gear:shears",
  ]),
  prompt_medical: new Set([
    "article:emergency-stop",
    "article:hard-limits",
    "article:positional-asphyxia",
    "article:fainting-response",
    "article:incident-response",
  ]),
  release_now: new Set([
    "article:circulation",
    "article:nerve-atlas",
    "article:nerve-self-checks",
    "article:circulation-vs-nerve",
    "article:incident-response",
    "article:emergency-stop",
    "gear:shears",
  ]),
  consent_withdrawn: new Set([
    "article:consent-frameworks",
    "article:safewords",
    "article:photography-ethics",
    "article:emergency-stop",
  ]),
  unsupported_media: new Set([
    "article:photography-ethics",
    "article:consent-frameworks",
    "article:hard-limits",
  ]),
};

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
  const ranked = hits.sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      if (kindOrder[a.kind] !== kindOrder[b.kind]) return kindOrder[a.kind] - kindOrder[b.kind];
      if (a.slug === b.slug) return 0;
      return a.slug < b.slug ? -1 : 1;
    });
  const disposition = knowledgeDisposition(query);
  if (disposition.kind === "ordinary") return ranked.slice(0, safeLimit);
  const allowlist = ACTION_HIT_ALLOWLIST[disposition.kind];
  return ranked
    .filter((hit) => allowlist.has(`${hit.kind}:${hit.slug}`))
    .slice(0, safeLimit);
}

/** Format a deterministic local answer; this never needs AI or a network. */
export function knowledgeAnswer(query: string, limit = 6): string {
  const disposition = knowledgeDisposition(query);
  const hits = searchKnowledge(query, limit);
  if (!hits.length) {
    const noMatch =
      "No curated local entry matched that wording. Try a broad topic such as consent, privacy, aftercare, nerves, equipment, or emergency release. This search does not generate individualized rope instructions.";
    return disposition.action ? `${disposition.action}\n\n${noMatch}` : noMatch;
  }
  const reading = hits.map((hit) => `• ${hit.title} (${hit.kind})`).join("\n");
  const catalog = `Relevant curated entries:\n${reading}\n\nOpen the matching entries below. Entries may be source-anchored or app-authored; check each article's evidence panel. Search is educational only and does not validate a setup, infer consent or physiology, or provide individualized high-consequence instructions.`;
  return disposition.action ? `${disposition.action}\n\n${catalog}` : catalog;
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
