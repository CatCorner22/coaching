export const SOURCE_LEDGER_REVISION = "2026-08-21.2" as const;

export const SAFETY_SOURCES = [
  {
    id: "CONSENT-1",
    title: "Dunkley & Brotto · The Role of Consent in BDSM",
    href: "https://pubmed.ncbi.nlm.nih.gov/31010393/",
    note: "Peer-reviewed narrative review supporting explicit negotiation; it is not legal advice or physical-safety clearance.",
  },
  {
    id: "CONSENT-2",
    title: "NCSF · Best Practices for Consent to Kink",
    href: "https://ncsfreedom.org/wp-content/uploads/2022/01/Best-Practices-for-Consent-to-Kink.pdf",
    note: "Practice guidance for explicit, informed, specific, and revocable consent; not legal advice or physical-safety clearance.",
  },
  {
    id: "VISION-1",
    title: "OpenAI · Image inputs",
    href: "https://learn.chatgpt.com/docs/image-inputs",
    note: "General image-input documentation; product behavior can change and this source does not validate xAI or this app.",
  },
  {
    id: "ROPE-1",
    title: "Khodulev et al. · Acute Radial Compressive Neuropathy",
    href: "https://pubmed.ncbi.nlm.nih.gov/37384078/",
    note: "A small retrospective convenience sample describing injuries; it cannot establish incidence, universal placement rules, or safe duration.",
  },
  {
    id: "FATAL-1",
    title: "Schori et al. · Fatal outcome literature review",
    href: "https://pubmed.ncbi.nlm.nih.gov/34383118/",
    note: "Published case literature identifies catastrophic patterns but cannot produce an individual risk rate.",
  },
  {
    id: "NFS-1",
    title: "Gloucestershire Hospitals NHS · Non-fatal strangulation",
    href: "https://www.gloshospitals.nhs.uk/about-us/news-media/press-releases-statements/non-fatal-strangulation-there-is-no-safe-way-to-strangle/",
    note: "Clinical warning that serious or delayed harm can occur without visible injury; use local emergency guidance.",
  },
  {
    id: "FIRSTAID-1",
    title: "AHA / American Red Cross · 2024 First Aid Guidelines",
    href: "https://pubmed.ncbi.nlm.nih.gov/39540278/",
    note: "General first-aid guidance, not rope-specific; follow local emergency dispatchers and current training.",
  },
  {
    id: "VISION-2",
    title: "OpenAI · Images and vision limitations",
    href: "https://developers.openai.com/api/docs/guides/images-vision",
    note: "Documents crop, spatial, rotation, resizing, and other image-model limitations; it does not validate this app or xAI.",
  },
  {
    id: "VISION-3",
    title: "OpenAI · GPT Realtime model modality boundary",
    href: "https://developers.openai.com/api/docs/models/gpt-realtime-2.1",
    note: "A model-specific example distinguishing discrete image input from video; it does not describe xAI or every product surface.",
  },
  {
    id: "PRIVACY-1",
    title: "OpenAI · Data controls in the OpenAI platform",
    href: "https://developers.openai.com/api/docs/guides/your-data",
    note: "OpenAI-specific retention and input-handling documentation retained under its original immutable ID; it does not describe xAI or this app's deployed configuration.",
  },
  {
    id: "STRUCTURE-1",
    title: "OpenAI · Structured model outputs",
    href: "https://developers.openai.com/api/docs/guides/structured-outputs",
    note: "General support for closed schemas; schema adherence does not establish factual accuracy and this app independently validates xAI output locally.",
  },
  {
    id: "AI-SAFETY-1",
    title: "OpenAI · Safety best practices",
    href: "https://developers.openai.com/api/docs/guides/safety-best-practices",
    note: "General guidance for adversarial testing, constrained input, human review, and limitation disclosure; not clinical validation.",
  },
  {
    id: "XAI-VISION-1",
    title: "xAI · Image Understanding",
    href: "https://docs.x.ai/developers/model-capabilities/images/understanding",
    note: "First-party image-input contract for supported formats and transport. It does not establish visual accuracy, clinical reliability, or safety clearance.",
  },
  {
    id: "XAI-VISION-2",
    title: "xAI · Chat Completions",
    href: "https://docs.x.ai/developers/model-capabilities/legacy/chat-completions",
    note: "Documents the legacy endpoint and image_url request shape used by this app; high detail can cost more and still does not guarantee fine-detail accuracy.",
  },
  {
    id: "XAI-MODEL-1",
    title: "xAI · Grok 4.5",
    href: "https://docs.x.ai/developers/models/grok-4.5",
    note: "Lists text and image input, text output, and structured-output support. Direct arbitrary-video input is not listed, so this app submits selected stills only.",
  },
  {
    id: "XAI-STRUCTURE-1",
    title: "xAI · Structured Outputs",
    href: "https://docs.x.ai/developers/model-capabilities/text/structured-outputs",
    note: "Documents a supported JSON Schema subset and best-effort constraints. Shape adherence does not establish factual accuracy or safety.",
  },
  {
    id: "XAI-VIDEO-1",
    title: "xAI · X Search video understanding",
    href: "https://docs.x.ai/developers/tools/x-search",
    note: "Video understanding is documented for videos encountered through X Search, not as proof that Grok 4.5 accepts an arbitrary uploaded clip in a chat message.",
  },
  {
    id: "XAI-PRIVACY-1",
    title: "xAI · API Security and Zero Data Retention",
    href: "https://docs.x.ai/developers/faq/security",
    note: "Default retention and optional team-wide Zero Data Retention vary by configuration. Any ZDR claim must be verified from the provider response, not assumed.",
  },
  {
    id: "XAI-TERMS-1",
    title: "xAI · Enterprise Terms",
    href: "https://x.ai/legal/terms-of-service-enterprise",
    note: "Provider terms warn that outputs may be incomplete or inaccurate and describe conditional retention and deletion. The operator must verify the terms and settings that actually apply.",
  },
] as const;

export type SafetySourceId = (typeof SAFETY_SOURCES)[number]["id"];
export const SAFETY_SOURCE_IDS = SAFETY_SOURCES.map((source) => source.id) as readonly SafetySourceId[];

export function getSafetySource(id: SafetySourceId) {
  return SAFETY_SOURCES.find((source) => source.id === id);
}

export function safetySourceAnchor(id: SafetySourceId) {
  return `source-${id.toLowerCase()}`;
}
