import type { Article } from "./types";

/**
 * D/s practice and the wider activity families.
 *
 * Rope is one thing two people do together; it is rarely the only thing. This
 * file covers the rest — the dynamic the rope sits inside, and the activities
 * that get combined with it.
 *
 * The editorial line is the same as everywhere else in this catalog, and it is
 * worth stating plainly because these topics attract how-to writing: **this app
 * does not teach technique.** Not impact technique, not wax technique, not
 * electrical technique. What it does is name the thing, describe what actually
 * goes wrong with it, say what has to be agreed before it happens, and point at
 * a person who can teach it in a room. Everything a reader could mistake for a
 * recipe has been left out on purpose.
 *
 * The consent material is written for a couple who have been together a long
 * time, because that is the harder case. Negotiating with a stranger is
 * self-evidently necessary. Negotiating with someone you have been married to
 * for years feels redundant right up until it turns out not to have been.
 */
export const BDSM_ARTICLES: Article[] = [
  // ─── Power exchange and protocol ────────────────────────────────────────
  {
    slug: "power-exchange-scope",
    title: "Scene, Evening, or Ongoing",
    section: "protocol",
    minutes: 7,
    summary: "The single most useful thing to be explicit about: when the dynamic is on, and when it is not.",
    related: ["protocol-ds", "negotiation", "rules-vs-limits"],
    blocks: [
      {
        type: "p",
        text: "Power exchange has a duration, and most avoidable friction comes from the two people assuming different ones. A scene-limited dynamic starts and ends with a ritual and does not survive the walk to the kitchen. An evening or weekend dynamic covers a defined block. An ongoing dynamic runs by default and is switched off rather than on. None of these is more serious or more advanced than the others. They are just different agreements, and only one of them can be in force at a time.",
      },
      {
        type: "h",
        text: "Say where the edges are",
      },
      {
        type: "ul",
        items: [
          "What starts it — a phrase, a piece of jewellery, a kneel, an explicit \"we're on\".",
          "What ends it — and whether ending is available to both of you, at any moment, without explanation.",
          "What is never inside it. Money, medical decisions, contact with other people, and anything involving children are the usual exclusions, and they are worth naming out loud even if they feel obvious.",
          "What happens when life interrupts — a phone call, a delivery, someone unwell. Agree that ordinary life suspends the dynamic without anyone having to formally end it.",
        ],
      },
      {
        type: "callout",
        title: "The ongoing case needs more, not less",
        text: "An ongoing dynamic removes the natural checkpoint that starting a scene provides. If yours is ongoing, put a checkpoint back in deliberately: a standing conversation, on a schedule, where both of you review it while it is switched off.",
      },
      {
        type: "warn",
        text: "No scope of power exchange, however total, removes the right to stop. A dynamic that treats the safeword as something that can be given up is not a dynamic this app has any guidance for.",
      },
    ],
  },
  {
    slug: "dominant-responsibilities",
    title: "What the Dominant Role Actually Obliges",
    section: "protocol",
    minutes: 8,
    summary: "Authority is the visible half. The obligations are the half that makes it work.",
    related: ["rigger-mindset", "power-exchange-scope", "top-drop"],
    blocks: [
      {
        type: "p",
        text: "The role is usually described in terms of what you get to decide. In practice it is mostly a set of things you have taken on. The submissive has narrowed her own decision-making on purpose; whatever she has set down, you are now carrying. That is the actual content of the role, and it is why doing it well is tiring.",
      },
      {
        type: "h",
        text: "The obligations",
      },
      {
        type: "ul",
        items: [
          "Knowing more than she does about the risk of what you are proposing — not the same amount, more. She is consenting to your assessment as well as to the activity.",
          "Watching. Not glancing between other things: actually watching, for the whole time she is restrained or under your direction.",
          "Being the person who stops it. She may be too far into the experience to notice a problem, or unwilling to be the one who ends a scene that is going well. That responsibility does not transfer to her just because she has a safeword.",
          "Being honest about your own state. Tired, drunk, distracted, angry at something unrelated — any of these makes you worse at the job, and saying so is part of doing it.",
          "Aftercare, including your own. See the top-drop entry.",
        ],
      },
      {
        type: "h",
        text: "Two failure modes worth naming",
      },
      {
        type: "p",
        text: "The first is treating her enthusiasm as a risk assessment. She can want something a great deal and still be wrong about whether it is safe; wanting it is not evidence. The second is letting the role suppress your own doubt. If something feels wrong to you and you continue because stopping would break the mood or the character, you have inverted the whole arrangement — the person with the authority to stop has decided not to use it in order to protect a performance.",
      },
      {
        type: "warn",
        text: "If you cannot reach shears, see her face, and undo what you have done, you are not currently able to do this job — whatever the scene is doing and however well it is going.",
      },
    ],
  },
  {
    slug: "submissive-agency",
    title: "Submission Is Something You Do",
    section: "protocol",
    minutes: 7,
    summary: "The passive reading of the role is both wrong and unsafe.",
    related: ["rope-bunny", "power-exchange-scope", "check-in-script"],
    blocks: [
      {
        type: "p",
        text: "Submission is often described as giving up control, which makes it sound like absence — like the submissive's job is to stop doing things. It is the opposite. Yielding is an activity, it takes attention and effort, and it comes with work that only she can do.",
      },
      {
        type: "h",
        text: "The work only she can do",
      },
      {
        type: "ul",
        items: [
          "Reporting the inside of her own body accurately, including when it would spoil something. Nobody else has access to this.",
          "Distinguishing what she does not like from what is harming her, and saying which one is happening. Both are worth reporting; they need different responses.",
          "Saying what she wants beforehand, in specifics, rather than hoping to be read correctly.",
          "Keeping the right to stop live rather than treating it as something surrendered. A safeword that she has privately decided she will not use is not a safeword.",
        ],
      },
      {
        type: "callout",
        title: "Submission does not include enduring silently",
        text: "There is a widespread idea that reporting a problem is a failure of submission — that the good submissive takes it. That idea gets people hurt, and it is worth explicitly rejecting between the two of you rather than assuming neither of you holds it.",
      },
      {
        type: "p",
        text: "The practical version: she is the instrument that reads the situation from the inside, and the whole arrangement depends on that instrument being honest. A dynamic that punishes honest reporting has broken its own safety system.",
      },
    ],
  },
  {
    slug: "rules-vs-limits",
    title: "A Rule Is Not a Limit",
    section: "protocol",
    minutes: 6,
    summary: "One is a structure you built together. The other is a wall. Confusing them causes real damage.",
    related: ["hard-limits", "discipline-and-punishment", "negotiation"],
    blocks: [
      {
        type: "p",
        text: "A rule is something the two of you agreed she would do or not do — a bedtime, an asking-permission protocol, a form of address. Rules exist to be a structure, and breaking one is an ordinary event inside the dynamic. A limit is a boundary on what may be done to her. Limits are not part of the game. They are the edge of the field it is played on.",
      },
      {
        type: "h",
        text: "Why the distinction matters",
      },
      {
        type: "p",
        text: "Because a dynamic that treats them as the same kind of thing will eventually treat a limit as negotiable under pressure, or treat a broken rule as a betrayal. Both are bad. The test is simple: if she says no to this, is that her exercising a boundary, or is it her declining a structure you agreed on? The first is never a problem to be solved. The second might be a conversation.",
      },
      {
        type: "ul",
        items: [
          "Limits are set by the person they protect and can be changed only by her, at any time, without justification.",
          "Rules are set jointly and can be renegotiated by either of you when they stop working.",
          "A limit does not get a consequence. Ever. If breaking a limit has a consequence attached, it was never a limit.",
          "Some limits are structural rather than personal — this app locks four of them and will not open them. Those are not up for negotiation between you either.",
        ],
      },
      {
        type: "warn",
        text: "Pressure applied to a stated limit is coercion, whatever the dynamic says about authority. This includes disappointment, sulking, and repeated asking. If a limit moves, it moves in a conversation neither of you is aroused during.",
      },
    ],
  },
  {
    slug: "protocol-levels",
    title: "Building a Protocol That Fits",
    section: "protocol",
    minutes: 8,
    summary: "Forms of address, rituals, and permissions — and how to make them without importing someone else's.",
    related: ["protocol-ds", "orders-and-obedience", "power-exchange-scope"],
    blocks: [
      {
        type: "p",
        text: "Protocol is the set of small forms that mark the dynamic as being in effect. Its whole function is to be a signal, which means it works when it is distinctive and fails when it is either arbitrary or borrowed wholesale from a book. Most couples end up with three or four things, not thirty.",
      },
      {
        type: "h",
        text: "The pieces people actually use",
      },
      {
        type: "ul",
        items: [
          "Address. An honorific, a name used only in the dynamic, or nothing at all. Choose it for how it sounds in your own mouths, not for how it reads.",
          "Position. Somewhere she goes, or a way she waits. Physically comfortable enough to hold for as long as you will realistically leave her there.",
          "Permission. A category of thing she asks for rather than takes. Pick one or two; making everything permissioned makes nothing feel marked.",
          "Opening and closing rituals. The most useful piece and the one most often skipped. A closing ritual is what tells both nervous systems it is over.",
        ],
      },
      {
        type: "h",
        text: "Three practical rules",
      },
      {
        type: "p",
        text: "Protocol drops instantly for anything medical, for the door, for a child, and for a safeword — with no penalty and no acknowledgement needed. Protocol is not maintained in front of people who have not consented to see it. And protocol that has become a chore rather than a pleasure should be changed rather than endured; it is the one part of this that is purely voluntary on both sides.",
      },
      {
        type: "callout",
        title: "Start smaller than you think",
        text: "Two forms held reliably for a month beat ten adopted enthusiastically and quietly abandoned in a fortnight. The abandonment is the problem: it teaches both of you that the agreements here are soft.",
      },
    ],
  },
  {
    slug: "discipline-and-punishment",
    title: "Discipline, Punishment, and the Consent Problem",
    section: "protocol",
    minutes: 9,
    summary: "The area with the worst consent hygiene in the whole practice, and the one most worth getting explicit about.",
    related: ["rules-vs-limits", "impact-risk-families", "consent-incident"],
    blocks: [
      {
        type: "p",
        text: "Three different things share this vocabulary, and they behave completely differently.",
      },
      {
        type: "ul",
        items: [
          "Play framed as punishment. Both of you know it is a scene; the offence is a pretext; everyone wants what is about to happen. This is ordinary negotiated play wearing a costume.",
          "Discipline as structure. A rule was broken, a pre-agreed consequence follows, and its purpose is to maintain the shape of the dynamic. Only workable if the consequence was agreed in advance, in the specific, while nobody was upset.",
          "Real anger with a scene attached. One of you is genuinely angry and the dynamic is being used as a channel for it. This is not a form of BDSM. It is a relationship problem in fancy dress, and it is where the serious harm in this area happens.",
        ],
      },
      {
        type: "h",
        text: "The consent problem",
      },
      {
        type: "p",
        text: "Ordinary negotiated play is agreed to when it happens. A punishment, by design, happens when she does not want it — that is what makes it a punishment. So consent has to come from somewhere other than the moment, which means it has to be pre-agreed, specific, and bounded. \"You may discipline me as you see fit\" is not a consent that any careful person should accept, because it delegates a decision she has no way to evaluate in advance.",
      },
      {
        type: "h",
        text: "What makes it workable",
      },
      {
        type: "ul",
        items: [
          "The consequence is named in advance and is specific — this thing, this much, not \"a punishment\".",
          "The safeword works during it, in full, exactly as it does at any other time. A punishment she cannot stop is not something she has consented to.",
          "It never touches a limit, and never introduces an activity that was not already agreed for ordinary play.",
          "Neither of you is actually angry. If you are, that is the conversation to have — not the scene.",
          "There is a debrief afterwards, and either of you can say it did not work.",
        ],
      },
      {
        type: "warn",
        text: "If you find yourself reaching for a disciplinary frame because you are genuinely angry with her, stop. That impulse is exactly the one this structure exists to catch, and acting on it is how a dynamic becomes a way to hurt someone with permission you did not really have.",
      },
    ],
  },
  {
    slug: "orders-and-obedience",
    title: "Giving an Order Without Breaking the Safeword",
    section: "protocol",
    minutes: 6,
    summary: "Command works because refusal remains possible. Design orders so it stays that way.",
    related: ["protocol-levels", "submissive-agency", "safewords"],
    blocks: [
      {
        type: "p",
        text: "An order is enjoyable because obeying it is a choice she keeps making. The moment refusal genuinely stops being available, the thing that made it good is gone and what remains is just compulsion. Everything below is about keeping refusal live while the scene still feels like command.",
      },
      {
        type: "ul",
        items: [
          "Give orders she can physically complete. An order she cannot perform turns into a failure she has to report, which puts her in the position of arguing with you mid-scene.",
          "Keep a channel open that is not the safeword. A safeword ends things; most of what she needs to tell you is smaller than that. Yellow, or a plain sentence, should be available without ending the scene.",
          "Do not order her not to speak unless you have agreed a non-verbal signal and tested it while she was unrestrained.",
          "Do not order her to give up the safeword, to endure a fixed count regardless, or to stop reporting sensation. These are the three orders that break the system.",
          "Notice compliance that has gone quiet. A submissive who has stopped responding and is simply absorbing is not necessarily deep in it — she may be somewhere she cannot get out of on her own.",
        ],
      },
      {
        type: "callout",
        title: "The check that costs nothing",
        text: "Ask a question that needs a real answer, not a yes. \"Tell me where your hands are\" gets you information; \"are you okay?\" gets you a reflex.",
      },
    ],
  },
  {
    slug: "service-submission",
    title: "Service as a Practice",
    section: "protocol",
    minutes: 6,
    summary: "The part of the dynamic that involves no rope, no pain, and often no sex at all.",
    related: ["power-exchange-scope", "protocol-levels", "aftercare"],
    blocks: [
      {
        type: "p",
        text: "Service submission is doing things for someone as the substance of the dynamic rather than as a prelude to a scene. It is common, it is often the most sustainable part of a long-term arrangement, and it gets almost no attention compared to the parts that photograph well.",
      },
      {
        type: "h",
        text: "What makes it work",
      },
      {
        type: "ul",
        items: [
          "The task is real. Invented busywork is legible as invented, and it corrodes the dynamic faster than almost anything else.",
          "The standard is knowable. She can tell whether she has done it well without having to guess your mood.",
          "It is noticed. Service that disappears into the background stops being an exchange and becomes unpaid labour with a costume on.",
          "It has an off switch. Illness, work, a bad week — the dynamic should degrade gracefully rather than becoming another thing she is failing at.",
        ],
      },
      {
        type: "warn",
        text: "Watch for the drift where service quietly becomes the whole domestic load with a D/s justification attached. That is worth checking on periodically, out of role, because it happens gradually and neither person tends to notice the moment it crossed over.",
      },
    ],
  },
  {
    slug: "collars-and-symbols",
    title: "Collars and What They Mean",
    section: "protocol",
    minutes: 6,
    summary: "Meaningful, common, and worn on the one part of the body this app locks to no.",
    related: ["cuff-and-collar-fit", "kubi-nawa", "power-exchange-scope"],
    blocks: [
      {
        type: "p",
        text: "A collar is a symbol, and what it symbolises is entirely local to the two people involved: ownership, commitment, being in a scene, or nothing at all beyond liking how it looks. There is no shared external meaning, so it is worth saying out loud what yours means rather than assuming a common understanding exists. Many couples distinguish a day collar from a scene collar precisely so the symbol does not have to carry two jobs.",
      },
      {
        type: "h",
        text: "The safety part",
      },
      {
        type: "p",
        text: "Everything about the neck is a separate question from everything about the symbol. This app locks the neck limit to no and does not open it at any setting, and that lock covers rope, attachment, tension, and anything load-bearing — not the existence of a collar as an object.",
      },
      {
        type: "ul",
        items: [
          "Nothing attaches to a collar. Not a lead under tension, not an anchor, not rope, not a hand pulling. A collar is a symbol, not a handle.",
          "Nothing that closes further under load. A buckled or fixed-circumference collar behaves very differently from anything that can tighten.",
          "Not worn while she sleeps, and not worn unsupervised, for the same reason nothing else goes on the neck unattended.",
          "It comes off instantly, by either of you, with no ceremony required. A locked collar with the key somewhere else is a safety problem with a romantic story attached.",
        ],
      },
      {
        type: "warn",
        text: "Pressure on the neck can cause collapse or death without warning and without a reliable visible sign, including some time after the pressure is gone. No collar, however meaningful, is worth treating that as an acceptable risk.",
      },
    ],
  },

  // ─── Consent architecture ───────────────────────────────────────────────
  {
    slug: "ongoing-consent-longterm",
    title: "Consent After the First Hundred Times",
    section: "consent",
    minutes: 8,
    summary: "Negotiating with a stranger is obviously necessary. Negotiating with your wife is where it actually gets skipped.",
    related: ["negotiation", "blanket-consent", "medical-disclosure"],
    blocks: [
      {
        type: "p",
        text: "The consent literature is mostly written for people who do not know each other. Long-term couples read it, conclude it does not apply to them, and stop doing the thing it describes. Then the negotiation shrinks to a glance, and one evening a glance turns out to have been carrying more meaning than it could hold.",
      },
      {
        type: "h",
        text: "What actually erodes",
      },
      {
        type: "ul",
        items: [
          "Specificity. Early on you agreed to a named activity. Years later you are agreeing to \"tonight\", which is not the same thing and covers whatever you decide it covers.",
          "Currency. A yes from two years ago is being carried forward. Bodies, health, medication, stress, and taste all change; the yes has not been re-examined since.",
          "Asymmetry of information. You have been reading about something new. She has agreed to \"whatever you want\" without knowing what you have been reading about.",
          "The cost of objecting. In a long relationship, saying no carries relationship freight that it did not carry with a stranger. That makes her no quieter, not less real.",
        ],
      },
      {
        type: "h",
        text: "What to do instead",
      },
      {
        type: "p",
        text: "Keep the negotiated-limits list current and actually look at it, rather than treating it as something set up once. Re-ask about anything new to either of you, in words, in advance. And build in a periodic conversation — out of role, not on an evening you are playing — where either of you can move something without it being a rejection of the other person. The list on the negotiate screen exists for this; a limit that has not been reviewed in a year is a limit neither of you has actually confirmed lately.",
      },
      {
        type: "callout",
        title: "The useful question",
        text: "Not \"is this still okay?\", which invites a reflex yes. Try \"what would you change about how we've been doing this?\" — it assumes there is an answer, which makes giving one much easier.",
      },
    ],
  },
  {
    slug: "blanket-consent",
    title: "Why \"You Always Have Permission\" Fails",
    section: "consent",
    minutes: 6,
    summary: "It sounds like the deepest possible trust. It is mostly a way of not having a conversation.",
    related: ["ongoing-consent-longterm", "rules-vs-limits", "consensual-non-consent"],
    blocks: [
      {
        type: "p",
        text: "Standing consent — some version of \"you may do anything to me, any time\" — is appealing because it expresses trust and removes the friction of asking. It fails for a structural reason rather than a moral one: she cannot consent to a thing she has no way to imagine, and the whole point of an open-ended grant is that neither of you knows what is inside it.",
      },
      {
        type: "h",
        text: "What it actually delegates",
      },
      {
        type: "p",
        text: "It puts the entire risk assessment on you, permanently, for activities that have not been named yet. That is a heavy thing to accept, and the failure mode is not that you would deliberately abuse it — it is that you will one day get something wrong that a five-minute conversation would have caught.",
      },
      {
        type: "h",
        text: "A workable version",
      },
      {
        type: "ul",
        items: [
          "Blanket consent within a named, closed set. Everything on the yes list, without asking each time. Nothing outside it without a conversation.",
          "New activities always get negotiated, no matter how the standing agreement is phrased.",
          "The safeword is never inside the blanket. It cannot be pre-consented away.",
          "The grant expires. A standing agreement that gets re-confirmed periodically is a real one; one that has run untouched for years is a fossil.",
        ],
      },
      {
        type: "warn",
        text: "\"She said I could do anything\" is not a consent record for an activity you have never discussed. If you are about to do something new, the standing agreement is not the thing to rely on.",
      },
    ],
  },
  {
    slug: "consensual-non-consent",
    title: "Consensual Non-Consent",
    section: "consent",
    minutes: 9,
    summary: "The hardest consent structure in the practice. Wanting it is common; doing it safely takes more scaffolding than anything else here.",
    related: ["blanket-consent", "safewords", "consent-incident"],
    blocks: [
      {
        type: "p",
        text: "Consensual non-consent covers scenes built around resistance, being overpowered, or being taken by surprise — the appeal being precisely that in-the-moment consent is suspended. It is a common desire and there is nothing wrong with wanting it. It is also the structure with the least margin for error, because the ordinary safety mechanism has been deliberately switched off.",
      },
      {
        type: "h",
        text: "Why it is harder than it looks",
      },
      {
        type: "p",
        text: "Every other kind of scene is protected by the fact that distress reads as a signal to stop. In CNC, distress is part of what was asked for. That removes your main instrument, and nothing else is as good. Reading her correctly is now a skill you are relying on absolutely, in a scene designed to make her signals ambiguous.",
      },
      {
        type: "h",
        text: "What has to be in place",
      },
      {
        type: "ul",
        items: [
          "A signal that is unmistakable and impossible to produce by accident, agreed in advance and tested while she was calm and unrestrained. Not a word she might say in character.",
          "A closed list of what can happen. CNC is not a licence for the unplanned — it is a performance of the unplanned within a boundary you both set.",
          "A hard time bound. Someone knows when this ends regardless.",
          "No surprise about the existence of the scene. \"You never know when it might happen\" adds a whole class of risk — including a genuine emergency being read as part of the game — and should be off the table until you have done many of these with a known start.",
          "Nothing high-consequence inside it. No restraint you cannot undo quickly, nothing on the neck, no impact you would not do in an ordinary scene. CNC changes the framing, not the risk tolerance.",
          "A debrief, always, even when it went well. Especially when it went well.",
        ],
      },
      {
        type: "callout",
        title: "Start with the smallest version",
        text: "A five-minute scene with a known start, a known end, and one agreed act teaches you both far more than an ambitious one — and the failure mode of getting it wrong is a conversation rather than an injury.",
      },
      {
        type: "warn",
        text: "If either of you cannot describe, precisely, how this scene ends early, it is not ready to happen. That description is the entire safety system.",
      },
    ],
  },
  {
    slug: "two-person-scene",
    title: "Playing With No One Else in the House",
    section: "risk",
    minutes: 7,
    summary: "Most safety writing quietly assumes a third person exists. Yours does not.",
    related: ["top-incapacitated", "solo-self-tying", "emergency-stop"],
    blocks: [
      {
        type: "p",
        text: "A great deal of community guidance was written for public play spaces, where a dungeon monitor exists, other people are present, and someone will notice if the top goes quiet. At home, two people, door closed, that layer is simply absent — and the guidance rarely says so, which means the gap is easy to miss.",
      },
      {
        type: "h",
        text: "What the missing third person was doing",
      },
      {
        type: "ul",
        items: [
          "Noticing that the top had stopped responding. If you faint, have a seizure, or are injured, she is restrained and alone with it.",
          "Providing a second opinion on whether a scene was going badly.",
          "Being able to call for help while someone else stayed with the person in rope.",
        ],
      },
      {
        type: "h",
        text: "Replacing it, partially",
      },
      {
        type: "ul",
        items: [
          "Nothing goes on that she cannot get herself out of if you stop responding. This single rule replaces most of what the missing person did.",
          "A phone, unlocked or with emergency calling available, within her reach — not yours.",
          "Shears she can reach and has practised using, not only ones you can reach.",
          "A check-in cadence you actually keep, so a gap is noticeable rather than something discovered much later.",
          "Someone outside who knows roughly when you expect to be done, even without knowing what you are doing.",
        ],
      },
      {
        type: "warn",
        text: "Being left tied and alone is locked to no in this app, and this is why: the failure mode is not the rope, it is the absence of anyone able to respond. Read the top-incapacitated entry with her, not just yourself.",
      },
    ],
  },

  // ─── Activity families ──────────────────────────────────────────────────
  {
    slug: "impact-risk-families",
    title: "Impact: What Actually Goes Wrong",
    section: "risk",
    minutes: 8,
    summary: "Not a technique guide. The categories of harm, so you know what you are asking an instructor about.",
    related: ["impact-and-rope", "marks-vs-injury", "implements-vocabulary"],
    blocks: [
      {
        type: "p",
        text: "This app does not teach impact technique, target areas, or intensity progression, and there is no version of this entry that ends with you knowing how to do it. What it can usefully give you is the shape of what goes wrong, which is what makes a conversation with a qualified instructor productive rather than vague.",
      },
      {
        type: "h",
        text: "The harm categories",
      },
      {
        type: "ul",
        items: [
          "Deep structures. Some regions of the body have organs or nerve trunks close enough to the surface that force transmits to them. This is the category with the worst outcomes and the least visible warning, and it is the main reason implement placement is taught in person.",
          "Bone and joint. Force over bone, or on a joint, does not distribute the way it does over muscle.",
          "Tissue injury. Broken skin, deep bruising, and haematoma — mostly a healing-time problem, occasionally an infection or a clot one.",
          "Cumulative effect. The same intensity applied for a long time is not the same as applied briefly, and the person receiving it is often the last to notice the shift.",
          "Combination with restraint. Restraint removes flinching, which is a protective reflex. It also removes her ability to move away from a strike that has landed wrong.",
        ],
      },
      {
        type: "h",
        text: "What to agree beforehand",
      },
      {
        type: "ul",
        items: [
          "Which implements, specifically. Not \"impact\".",
          "Whether marks are acceptable and for how long — the marks-vs-injury entry covers the difference.",
          "How she reports intensity, in a way that works while endorphins are running.",
          "What happens if something lands wrong. Agree that a mis-landed strike stops the scene for a look, without either of you treating it as a failure.",
        ],
      },
      {
        type: "warn",
        text: "Impact combined with restraint is on the negotiated-limits list as its own item for a reason. Learn technique from a qualified in-person instructor; nothing in this app validates a placement, an implement, or an intensity.",
      },
    ],
  },
  {
    slug: "implements-vocabulary",
    title: "Implements: A Vocabulary, Not a Technique",
    section: "craft",
    minutes: 6,
    summary: "Enough language to negotiate specifically and buy sensibly. Nothing about how to use them.",
    related: ["impact-risk-families", "gear-care", "negotiation"],
    blocks: [
      {
        type: "p",
        text: "Negotiating \"impact\" as a single item is close to useless, because the category spans sensations that have almost nothing in common. Some vocabulary makes the conversation specific.",
      },
      {
        type: "h",
        text: "The sensation axis",
      },
      {
        type: "p",
        text: "Practitioners usually describe implements as producing thud or sting, with most sitting somewhere between. Broad, heavy, soft implements tend towards thud — a deep, diffuse sensation. Narrow, light, stiff implements tend towards sting — a sharp, surface one. This is a rough guide to how something will feel, not a safety ranking: heavy thuddy implements transmit more force to deep structures, so \"gentler-feeling\" and \"lower risk\" are not the same axis at all.",
      },
      {
        type: "ul",
        items: [
          "Hands. The most controllable and the most informative, because you feel every strike too.",
          "Floggers. Many falls, weight and material varying enormously; the same word covers very different objects.",
          "Paddles. Broad and rigid, so force spreads but transmits.",
          "Canes and rods. Narrow, fast, and among the least forgiving of a mis-landed strike; commonly taught only in person for that reason.",
          "Crops and slappers. Small contact areas, sharp sensation, easy to underestimate.",
        ],
      },
      {
        type: "h",
        text: "Care",
      },
      {
        type: "ul",
        items: [
          "Anything porous — leather, suede, wood, rope — cannot be reliably disinfected. Keep those personal rather than shared, and treat any implement that has contacted broken skin as needing disposal or a non-porous replacement.",
          "Inspect before use. A split cane, a cracked handle, or a flogger with a fall coming loose changes what the implement does mid-swing.",
          "Store them where the two of you can find them and nobody else can.",
        ],
      },
    ],
  },
  {
    slug: "temperature-play",
    title: "Wax, Ice, and Heat",
    section: "scene",
    minutes: 7,
    summary: "Burns and cold injuries are the two outcomes, and both are easier to cause than people expect.",
    related: ["sensation", "clamps-and-constriction", "incident-response"],
    blocks: [
      {
        type: "p",
        text: "Temperature play covers wax, ice, warmed or chilled objects, and anything else that works by thermal contrast. The appeal is that a small physical stimulus produces a large sensation. The risk is the same fact from the other side: the margin between intense and injurious is narrower than for most other sensations, and skin does not warn you much in advance.",
      },
      {
        type: "h",
        text: "Wax",
      },
      {
        type: "ul",
        items: [
          "Melting point varies enormously by wax type, and ordinary household and scented candles are not formulated for skin contact. Candles sold for this purpose exist because the difference matters.",
          "Additives, dyes and scents change the melting behaviour of a candle in ways that are not visible.",
          "Anything that traps heat against skin — including rope, a garment, or a fold of the body — holds it there instead of letting it dissipate, which is the usual mechanism when a burn happens.",
          "Restraint removes her ability to move away from wax that has landed hotter than expected. That is a real interaction between the two activities and worth deciding about deliberately.",
        ],
      },
      {
        type: "h",
        text: "Cold",
      },
      {
        type: "p",
        text: "Prolonged contact with ice or very cold objects can injure tissue, and the numbness it produces is exactly what stops the person noticing. Cold also masks other sensation, which means a rope problem underneath a cold area can develop unreported.",
      },
      {
        type: "p",
        text: "This app does not teach wax technique — not temperature, not height, not where. Learn it hands-on from a qualified in-person instructor, and buy candles made for the purpose rather than working out which household ones are survivable.",
      },
      {
        type: "warn",
        text: "Treat any blistering, white or waxy-looking skin, persistent pain after the stimulus is removed, or any burn beyond superficial redness as a medical matter rather than a scene event. Do not continue, and do not treat a normal appearance later as evidence it was fine at the time.",
      },
    ],
  },
  {
    slug: "clamps-and-constriction",
    title: "Clamps and Time",
    section: "risk",
    minutes: 6,
    summary: "The main variable is not tightness. It is how long, and what happens when they come off.",
    related: ["circulation", "temperature-play", "sensation"],
    blocks: [
      {
        type: "p",
        text: "Clamps, clips, and anything else that pinches work by restricting blood flow to a small area. Two things follow from that, and both surprise people the first time.",
      },
      {
        type: "h",
        text: "Duration is the risk variable",
      },
      {
        type: "p",
        text: "A clamp that felt fine for two minutes is a different proposition at twenty. Sensation typically fades as the area goes numb, which reads as the clamp becoming gentler and is actually the opposite — the tissue has stopped reporting. Numbness is a reason to remove, not a sign that it has settled. Practitioners generally work to a clock rather than to how it feels, precisely because how it feels stops being informative.",
      },
      {
        type: "h",
        text: "Removal is the intense part",
      },
      {
        type: "p",
        text: "Blood returning to a restricted area commonly produces a sensation considerably sharper than anything the clamp itself caused. Both of you should expect this rather than discovering it. Removing several at once means several of those at once, which is worth deciding about rather than doing by accident.",
      },
      {
        type: "ul",
        items: [
          "Agree a time limit before they go on, and keep to it even if she says it is fine — that report is coming from a numb area.",
          "Anything that stays discoloured, painful, or numb well after removal is a medical question.",
          "Anything sharp enough to break skin moves this into a bloodborne-risk activity and out of what this app covers.",
          "Never on anything already under rope pressure. Stacking two circulation restrictions on one area is the interaction to avoid.",
        ],
      },
    ],
  },
  {
    slug: "sensory-deprivation",
    title: "Blindfolds, Hoods, and Earplugs",
    section: "risk",
    minutes: 7,
    summary: "Cheap to add, disproportionately powerful, and each one removes a channel you were relying on.",
    related: ["gag-signal-safety", "orders-and-obedience", "subspace"],
    blocks: [
      {
        type: "p",
        text: "Removing a sense intensifies everything else, which is why a blindfold is often the highest-value thing you can add to a scene. It is also why each removal has a cost: every channel you take away is one you were both using.",
      },
      {
        type: "h",
        text: "What each one costs",
      },
      {
        type: "ul",
        items: [
          "Sight. She loses anticipation, orientation, and the ability to read your face — including reading that something has gone wrong. Disorientation on standing afterwards is common; expect it rather than being surprised by it.",
          "Hearing. This removes your voice, which is usually the main reassurance channel. Combined with a blindfold it can move a scene somewhere much more isolating than either of you intended.",
          "Speech. A gag removes the safeword. This needs a tested physical signal, and it has its own entry.",
          "The head, enclosed. Hoods and anything covering the face introduce airway and overheating considerations that the other items do not. Treat anything enclosing the head as a category of its own rather than as a stronger blindfold.",
        ],
      },
      {
        type: "h",
        text: "The compounding problem",
      },
      {
        type: "p",
        text: "These are usually added one at a time, each seeming small. Blindfolded, gagged, ears covered, and restrained is a person who cannot see a problem, report it, hear you ask, or move away — and no single step in that sequence felt like the significant one. Add deliberately, and treat each addition as its own decision.",
      },
      {
        type: "warn",
        text: "Never cover the head, mouth, or airway of someone who cannot remove it herself and cannot signal in a way you will reliably see. Anything over the mouth combined with restraint is a breathing question, not a sensation one.",
      },
    ],
  },
  {
    slug: "electrical-play",
    title: "Electrical Play",
    section: "risk",
    minutes: 6,
    summary: "A category with a hard anatomical rule and a real cardiac risk. In-person instruction, not an app.",
    related: ["edge-play-line", "medical-disclosure", "sensation"],
    blocks: [
      {
        type: "p",
        text: "Electrical play covers a range of devices with genuinely different risk profiles, from surface-only static devices to units that pass current between two contacts. This app does not teach any of it. The entry exists so the category is searchable and so you know which questions matter.",
      },
      {
        type: "h",
        text: "The rule everyone in this area repeats",
      },
      {
        type: "p",
        text: "Current is kept away from any path that could cross the chest. That is the reason the practice is organised the way it is, and it is not a guideline that gets adjusted for a particular scene. Anything that could route current across the heart is treated as categorically off-limits rather than as a risk to be managed.",
      },
      {
        type: "ul",
        items: [
          "Implanted electronic devices — pacemakers, defibrillators, neurostimulators, some pumps — are an absolute exclusion. So is a known heart-rhythm condition, and pregnancy. This belongs in the medical-disclosure conversation.",
          "Devices sold for medical use, such as TENS units, are not designed or approved for this, and their instructions typically say so explicitly.",
          "Metal — jewellery, piercings, and any conductive object in a possible path — has to be accounted for.",
          "Electrical devices and rope interact, and both change how current travels. Do not combine them from a written description.",
        ],
      },
      {
        type: "warn",
        text: "Learn this hands-on from someone qualified, or not at all. Stop immediately for any chest discomfort, palpitations, dizziness, faintness, or unusual breathlessness during or after, and treat those as reasons to seek urgent medical assessment rather than to rest and see.",
      },
    ],
  },
  {
    slug: "edge-play-line",
    title: "Edge Play: Where This App Stops",
    section: "risk",
    minutes: 5,
    summary: "The families this app names and refuses, and why naming them is still worth doing.",
    related: ["hard-limits", "electrical-play", "consensual-non-consent"],
    blocks: [
      {
        type: "p",
        text: "Some activity families carry risk of death or permanent injury that no amount of care removes — only reduces. This app names them, describes the risk, and stops there. That is not squeamishness about the content; it is that written guidance is a genuinely inadequate teaching medium for them, and a half-learned version is more dangerous than no version.",
      },
      {
        type: "h",
        text: "The families",
      },
      {
        type: "ul",
        items: [
          "Anything restricting breathing, or anything on the neck. Locked to no here and not openable at any setting. The mechanism can kill without warning, and there is no technique that makes it safe.",
          "Blood, needles, and cutting. Infection, bloodborne transmission, and injury; a medical-grade skill set with medical-grade consequences.",
          "Knives and fire. Both are usually practised in ways designed to look far more dangerous than they are — and that gap is exactly what makes an amateur reconstruction hazardous.",
          "Full suspension. Locked to no here; see the suspension-reality entry for what it actually requires.",
          "Anything requiring medical judgement to do or to recover from.",
        ],
      },
      {
        type: "p",
        text: "If one of these matters to you, the honest route is an instructor, a community, and years — not a better-written article. Nothing in this app moves you closer to any of them, and an entry that named one without saying so would be worse than no entry at all.",
      },
      {
        type: "warn",
        text: "Do not use this app's other material as a partial substitute for instruction in these families. Fluency in the safe parts of a practice is not competence in its dangerous parts.",
      },
    ],
  },
  {
    slug: "orgasm-control",
    title: "Edging, Denial, and Overstimulation",
    section: "scene",
    minutes: 6,
    summary: "Low physical risk, high consent granularity — the opposite profile to most of this catalog.",
    related: ["combining-sex", "orders-and-obedience", "chastity-devices"],
    blocks: [
      {
        type: "p",
        text: "Control over whether and when someone comes is one of the lower-risk things on this list physically, and one of the ones most worth negotiating precisely — because the interesting part is psychological and the possible versions differ enormously.",
      },
      {
        type: "h",
        text: "Worth separating",
      },
      {
        type: "ul",
        items: [
          "Edging within a scene — repeatedly approaching and stopping.",
          "Denial across a scene — it does not happen tonight.",
          "Denial across time — days or weeks, which is a different agreement with a different emotional weight.",
          "Forced or continued stimulation past orgasm, which is a distinct activity with a distinct answer. Overstimulation can become genuinely painful and is worth its own explicit yes.",
          "Whether any of this is announced in advance or discovered during. Both are enjoyable; they are not the same negotiation.",
        ],
      },
      {
        type: "h",
        text: "Practical notes",
      },
      {
        type: "ul",
        items: [
          "Extended stimulation combined with restraint means she cannot move away — that is often the point, and it is also the mechanism for soreness and friction injury. Lubrication and duration both matter more than they would otherwise.",
          "Sensation from a restraint and sensation from stimulation get hard to distinguish when arousal is high. Ask about rope specifically rather than asking how she is.",
          "Extended denial across days can produce real irritability and preoccupation. That is worth planning around rather than treating as a failure of attitude.",
        ],
      },
    ],
  },
  {
    slug: "chastity-devices",
    title: "Chastity Devices",
    section: "craft",
    minutes: 6,
    summary: "A wearable device with fit, circulation, hygiene, and access considerations that scale with duration.",
    related: ["orgasm-control", "cuff-and-collar-fit", "power-exchange-scope"],
    blocks: [
      {
        type: "p",
        text: "Chastity devices are worn rather than applied, so the relevant risks are the ones that accumulate over hours and days rather than the ones that appear in a scene. Duration is the variable that changes everything.",
      },
      {
        type: "ul",
        items: [
          "Fit is the whole thing. Too tight restricts circulation; too loose chafes and can allow the device to move into a worse position. Manufacturers sell sizing kits because getting this wrong is common.",
          "Any numbness, colour change, persistent pain, swelling, or coldness means it comes off immediately — not at the next agreed opportunity.",
          "Hygiene needs a routine, and the routine needs the device to come off. Skin under a device that is never removed will eventually have a problem.",
          "Access to a key is a safety matter, not a game element. Whoever holds it has to be reachable at all times, and there needs to be a backup — a key in a sealed envelope she can open is the usual arrangement.",
          "Sleeping in one, and being alone in one, both need to be decided deliberately rather than by default.",
          "Metal devices and airport security, medical imaging, and emergency care are real logistical considerations for long-term wear.",
        ],
      },
      {
        type: "warn",
        text: "Never make removal dependent on someone else being available. A device that cannot be removed on the spot in an emergency is a device with a foreseeable failure mode, however much the key-holding is part of the appeal.",
      },
    ],
  },
  {
    slug: "humiliation-and-degradation",
    title: "Degradation, Humiliation, and Language",
    section: "scene",
    minutes: 8,
    summary: "The activity where the damage is invisible, delayed, and done with words you agreed to.",
    related: ["scene-debrief", "roleplay-personas", "aftercare"],
    blocks: [
      {
        type: "p",
        text: "Erotic humiliation covers a wide range, from mild embarrassment to sustained verbal degradation. It is common and can be extremely effective. It is also the family where harm is hardest to notice, because nothing shows and the damage tends to arrive days later.",
      },
      {
        type: "h",
        text: "Negotiate the words themselves",
      },
      {
        type: "p",
        text: "This is the one activity where the specific vocabulary needs to be on the list. A word that is thrilling to one person is the word someone used about her when she was fifteen. Go through them explicitly — the ones she wants, the ones that are fine, and the ones that are never said. Do the same for themes: appearance, intelligence, worth, sexuality, and body are separate categories and people frequently want one and not another.",
      },
      {
        type: "h",
        text: "The structural risks",
      },
      {
        type: "ul",
        items: [
          "It survives the scene. Physical sensation ends when you stop; a sentence can stay with someone for months.",
          "It bypasses the safeword. She may not know in the moment that something landed wrong — only afterwards. So a debrief is not optional here, it is the actual safety mechanism.",
          "It can be true. Degradation that touches a real insecurity is not intense play, it is confirmation from someone whose opinion matters most. Avoid the true ones.",
          "It leaks. Language used in scene has a way of appearing in ordinary conversation. Decide explicitly that it does not, and treat a slip as something to apologise for rather than to laugh off.",
        ],
      },
      {
        type: "callout",
        title: "Aftercare here is verbal",
        text: "Blankets and water do not undo a sentence. Say the opposite, plainly, in your own voice, out of role — and let her hear you mean it.",
      },
      {
        type: "warn",
        text: "If she is quiet in a way she is not usually quiet after a scene, ask directly rather than letting her rest. This family's harm looks exactly like tiredness.",
      },
    ],
  },
  {
    slug: "roleplay-personas",
    title: "Personas, Pet Play, and Primal",
    section: "scene",
    minutes: 6,
    summary: "The psychological equivalent of restraint: easy to enter, and needing a deliberate way out.",
    related: ["humiliation-and-degradation", "scene-debrief", "subspace"],
    blocks: [
      {
        type: "p",
        text: "A great deal of play involves inhabiting a role — an animal persona, a younger self, a predator-and-prey frame, a service character, a scenario with parts. It works by letting someone put down their ordinary self for a while, which is genuinely restorative and is also the thing to be careful with.",
      },
      {
        type: "h",
        text: "Practical structure",
      },
      {
        type: "ul",
        items: [
          "An entry and an exit, both explicit. A persona is easier to leave when leaving is a defined act rather than a gradual fading.",
          "A way to speak out of character that is not the safeword — a name, a gesture, a phrase. Many roles involve reduced or absent speech, and she needs a way back that does not require ending everything.",
          "Agreement on where it happens. Some personas are private in a way ordinary play is not.",
          "Physical care that the persona may prevent. Someone deep in a non-verbal role may not ask for water, or mention a numb hand. That becomes your job entirely.",
        ],
      },
      {
        type: "h",
        text: "Primal and resistance frames",
      },
      {
        type: "p",
        text: "Play involving chasing, wrestling, or overpowering adds unpredictable physical movement — falls, collisions, and accidental injury from bodies moving fast in a room designed for walking. Clear the space first, and treat an accidental injury as an immediate stop rather than something to absorb in character. If the frame includes real resistance, the consensual-non-consent entry applies.",
      },
      {
        type: "callout",
        title: "Coming back takes longer than going in",
        text: "Allow real time. Someone who has been somewhere else for an hour does not return the moment the scene stops, and hurrying that transition is how a good scene ends badly.",
      },
    ],
  },
  {
    slug: "objectification",
    title: "Objectification and Held Positions",
    section: "risk",
    minutes: 6,
    summary: "Being treated as furniture is a psychological activity with an entirely physical risk profile.",
    related: ["positional-asphyxia", "getting-cold", "predicament"],
    blocks: [
      {
        type: "p",
        text: "Objectification play — being used as furniture, an ornament, or a fixture, or simply being required to hold a position and be ignored — is psychologically compelling for many people. The risks, though, are all physical, and they come from the two things the frame requires: stillness and inattention.",
      },
      {
        type: "h",
        text: "What stillness does",
      },
      {
        type: "ul",
        items: [
          "People shift constantly without noticing, and those shifts are what prevent pressure injuries and joint stiffness. Removing them is the point of the activity and also its main hazard.",
          "Body temperature falls when someone is still, undressed, and not exerting — faster than expected, and cold degrades judgement and sensation reporting.",
          "A position that is fine for five minutes can be a problem at forty, with no clear moment in between.",
          "Some positions restrict breathing in ways that develop gradually. The positional-asphyxia entry covers the mechanism.",
        ],
      },
      {
        type: "h",
        text: "What inattention does",
      },
      {
        type: "p",
        text: "Being ignored is usually part of the appeal, which means the scene is asking you to do less watching at exactly the point where more is needed. Set a timer rather than relying on your own sense of elapsed time — inattention is the mode you have deliberately entered.",
      },
      {
        type: "warn",
        text: "Objectification is not a reason to leave someone restrained and unattended. Being left tied and alone is locked to no in this app, and a scene framing does not change that.",
      },
    ],
  },
  {
    slug: "anal-play-safety",
    title: "Anal Play and Restraint",
    section: "body",
    minutes: 6,
    summary: "Toy design, hygiene, and the specific problem restraint adds.",
    related: ["combining-sex", "gear-care", "orgasm-control"],
    blocks: [
      {
        type: "p",
        text: "Common, and with a small number of well-understood ways to go wrong. All of them are avoidable with equipment choice and pace.",
      },
      {
        type: "ul",
        items: [
          "A flared base, always. Anything without one can be drawn in and become a surgical problem — this is the single most important item and it is entirely about which object you bought.",
          "Body-safe non-porous materials. Porous ones cannot be properly cleaned and harbour bacteria; that matters more here than anywhere else.",
          "Generous lubrication, and the right kind — silicone lubricant degrades silicone toys, and this tissue is not self-lubricating.",
          "Slowly. Tearing is caused by pace and by size increments, and the resulting injury heals slowly in an area that is hard to keep clean.",
          "Nothing goes from here to anywhere else without cleaning. This is the main infection route.",
          "Pain that persists after, bleeding beyond a trace, or fever afterwards are medical, not scene aftermath.",
        ],
      },
      {
        type: "h",
        text: "What restraint adds",
      },
      {
        type: "p",
        text: "Restraint removes the ordinary ability to move away, adjust angle, or slow things down, and those are the involuntary responses that normally prevent injury here. If you are combining them, the pace has to be set more conservatively than it would be otherwise, and she needs a way to say slow down that is faster and easier than a full safeword.",
      },
    ],
  },
  {
    slug: "substances-and-play",
    title: "Substances and Capacity",
    section: "consent",
    minutes: 5,
    summary: "The awkward one. Worth a clear rule agreed while sober rather than a judgement call made otherwise.",
    related: ["ongoing-consent-longterm", "medical-disclosure", "negotiation"],
    blocks: [
      {
        type: "p",
        text: "A glass of wine with dinner is part of many people's evenings and this entry is not an argument against it. But intoxication affects the two things this practice depends on absolutely — the ability to consent and the ability to report sensation — and it does so before anyone feels notably drunk.",
      },
      {
        type: "h",
        text: "What it actually affects",
      },
      {
        type: "ul",
        items: [
          "Pain perception. Sensation that would normally stop a scene may not register, which removes your main early warning.",
          "Circulation and temperature. Alcohol changes both, and both matter in rope.",
          "Nausea and vomiting risk, which is a serious matter if anything is over her mouth or if she is restrained in a position she cannot turn from.",
          "Your judgement, and your fine motor control with shears in a hurry.",
          "Memory. A scene neither of you remembers clearly cannot be debriefed, and a consent conversation held during it is not one you can rely on.",
        ],
      },
      {
        type: "h",
        text: "A workable rule",
      },
      {
        type: "p",
        text: "Decide the line while sober and write it into your agreements, rather than assessing it in the moment — assessing it in the moment is precisely the capacity that has been affected. Many couples set a hard rule that anything new, anything high-consequence, and any negotiation happens completely sober, and keep alcohol to activities already well established. Whatever you choose, the person who is least sober does not get to be the one who decides whether everyone is sober enough.",
      },
      {
        type: "warn",
        text: "Restraint plus significant intoxication plus no third person is the combination with the least margin. Do not add sedatives, cannabis, or anything else that increases sleepiness to a scene involving restraint.",
      },
    ],
  },

  // ─── Aftercare and repair ───────────────────────────────────────────────
  {
    slug: "top-drop",
    title: "Top Drop",
    section: "aftercare",
    minutes: 6,
    summary: "The dominant's version, which is real, less discussed, and usually goes uncared for.",
    related: ["drop", "dominant-responsibilities", "scene-debrief"],
    blocks: [
      {
        type: "p",
        text: "Aftercare is nearly always described as something the top provides. Many dominants also report a comedown afterwards — flat, irritable, anxious, or specifically guilty about what they enjoyed doing. It tends to arrive later than the bottom's, often the next day, and it tends to go unaddressed because the person experiencing it is the one who is supposed to be looking after everyone.",
      },
      {
        type: "h",
        text: "The specific shapes it takes",
      },
      {
        type: "ul",
        items: [
          "Guilt disproportionate to anything that happened, sometimes strongest after the scenes that went best.",
          "Doubt about your own reading of consent, retrospectively, about something she enthusiastically wanted.",
          "Flatness or exhaustion out of proportion to the physical effort.",
          "Reluctance to play again, which if unexamined quietly becomes a pattern rather than a mood.",
        ],
      },
      {
        type: "h",
        text: "What helps",
      },
      {
        type: "ul",
        items: [
          "Naming it in advance, so neither of you interprets it as evidence that something was wrong.",
          "Aftercare that includes you. Being told plainly that she wanted it, that it was good, and that she is fine is the specific reassurance that works, and she can only give it if she knows to.",
          "Food, water, warmth, sleep. The physical basics are not less relevant because you were the one doing the work.",
          "The debrief, on a different day, when both of you are ordinary again.",
        ],
      },
      {
        type: "callout",
        title: "Ask for it",
        text: "The role makes asking feel like a failure of it. It is not; a dominant who cannot say what he needs is asking her to guess, which is exactly what neither of you does about anything else here.",
      },
    ],
  },
  {
    slug: "scene-debrief",
    title: "The Debrief",
    section: "aftercare",
    minutes: 6,
    summary: "Not the cuddle afterwards. The conversation a day or two later, which is where the useful information lives.",
    related: ["aftercare", "top-drop", "humiliation-and-degradation"],
    blocks: [
      {
        type: "p",
        text: "Immediate aftercare and a debrief do different jobs. Aftercare is physiological and emotional care in the hour afterwards. A debrief is a conversation held once both of you are ordinary again — the next day or the one after — and it is where anything that landed wrong actually becomes speakable.",
      },
      {
        type: "h",
        text: "Why not straight afterwards",
      },
      {
        type: "p",
        text: "Because immediately after a good scene, everything was wonderful. Endorphins, closeness, and relief make an honest critical assessment nearly impossible, and asking \"was that alright?\" in that window reliably produces a yes that means very little. The delay is what makes the answer worth having.",
      },
      {
        type: "h",
        text: "Four questions that work",
      },
      {
        type: "ul",
        items: [
          "What was the best part? Start here — it is easy, it is true, and it makes the rest of the conversation possible.",
          "Was there a moment you wanted something different? Not \"was anything wrong\", which invites a no.",
          "Is there anything you have thought about since? This is the one that catches delayed reactions, especially to language.",
          "What do you want more of next time? Ends forward rather than on an audit.",
        ],
      },
      {
        type: "callout",
        title: "Both directions",
        text: "The top answers these too. A debrief where only one person is assessed is a performance review, and it will teach her that the conversation is about her conduct rather than about the two of you.",
      },
      {
        type: "p",
        text: "Where something did land wrong, treat it as information rather than an accusation. The couples who keep doing this well over years are the ones for whom \"that bit didn't work for me\" is an ordinary sentence rather than a crisis.",
      },
    ],
  },
  {
    slug: "consent-incident",
    title: "When Something Goes Wrong That Isn't an Injury",
    section: "risk",
    minutes: 7,
    summary: "A limit got crossed, a safeword was missed, or something landed badly. What to do next matters more than how it happened.",
    related: ["scene-debrief", "incident-response", "rules-vs-limits"],
    blocks: [
      {
        type: "p",
        text: "Sooner or later something goes wrong that is not a medical matter. A safeword was not heard. A limit was crossed because one of you misremembered it. Something landed in a place neither of you knew was there. This is not evidence that you are doing it badly; it is what happens when two people do something complicated repeatedly. What determines the damage is almost entirely what happens next.",
      },
      {
        type: "h",
        text: "In the moment",
      },
      {
        type: "ul",
        items: [
          "Stop. Everything, immediately, without finishing the thing you were doing.",
          "Release, and get her comfortable and warm before any conversation begins.",
          "Do not explain yet. Explanation immediately after sounds like defence, whatever you intend, and she is not in a state to process it.",
          "Do not require her to reassure you. That inverts who is being looked after, and it is a strong pull at exactly this moment.",
        ],
      },
      {
        type: "h",
        text: "Afterwards",
      },
      {
        type: "ul",
        items: [
          "Acknowledge it plainly and without qualification. \"I crossed something you had said no to\" — not \"I'm sorry if\", and not an account of why it was understandable.",
          "Work out the mechanism together, later. Was it a missed signal, an unclear agreement, a misremembered limit, an intensity misjudgement? Different causes need different fixes.",
          "Change something concrete. Write the limit down. Change the signal. Add a check. An apology with no change is a promise to repeat it.",
          "Give it time before playing again, and let her set how much.",
        ],
      },
      {
        type: "callout",
        title: "Missing a safeword is a systems problem",
        text: "If you did not hear it, the issue is the channel, not her volume. Gagged, face-down, music on, or deep in it — all of these are foreseeable, and the fix is a signal that survives them.",
      },
      {
        type: "warn",
        text: "A pattern is different from an incident. If the same category of thing keeps happening, or if either of you is reluctant to raise it, that is worth talking about outside the dynamic entirely — with a professional, if it comes to it.",
      },
    ],
  },
];
