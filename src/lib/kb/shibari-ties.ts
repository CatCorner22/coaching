import type { Tie } from "./types";
import { instructorRoute, unoccupiedPractice } from "./tie-factories";
import { propDrill } from "./prop-drills";

/**
 * The wider shibari and kinbaku vocabulary.
 *
 * The catalog's job is naming and risk recognition. Knowing that a shape is
 * called *teppou* and that it is a shoulder-and-nerve category is genuinely
 * useful: it makes a negotiation specific, it makes a search land somewhere
 * honest, and it gives an instructor a starting question. It is not a step
 * towards putting it on anyone, and none of these entries pretend otherwise.
 *
 * Two buckets, and nothing between them:
 *
 *  - `unoccupiedPractice` — pattern and handling drills for a dress form.
 *    Only patterns that are decorative in themselves qualify. A shape whose
 *    whole point is restraining a body is never in this bucket, however
 *    pretty it looks on a mannequin.
 *  - `instructorRoute` — every body-restraint category, named with its risk
 *    family and pointed at a person who can teach it hands-on.
 *
 * Four categories are locked to no in this app and cannot be negotiated open:
 * anything on the neck, breath play, full suspension, and being left tied and
 * alone. Entries touching them are here so the words are searchable and their
 * risk is stated — never as a route in.
 */

const DECORATIVE_PATTERNS: Tie[] = [
  unoccupiedPractice({
    slug: "amime",
    name: "Amime Net: Unoccupied Practice",
    jp: "網目",
    summary:
      "Open net patterning as a craft drill on a dress form. Even spacing on a prop says nothing about pressure, fit, or wear on a person.",
    level: "building",
    knots: ["reverse-tension", "square"],
    nerves: [],
    intent: ["decorative", "craft"],
    purpose:
      "The drill trains consistent spacing across a long rope path, where errors accumulate visibly rather than hiding in a single band.",
    bands: 6,
    ...propDrill("amime"),
  }),
  unoccupiedPractice({
    slug: "hashigo",
    name: "Hashigo Ladder: Unoccupied Practice",
    jp: "梯子縛り",
    summary:
      "A stacked ladder of parallel bands, practiced on an unoccupied form. This app does not teach torso wear, restraint, or loading.",
    level: "foundation",
    knots: ["reverse-tension"],
    nerves: [],
    intent: ["decorative", "craft"],
    purpose:
      "Repeated parallel bands are the clearest drill for even tension, because an uneven one is obvious against its neighbours.",
    bands: 5,
    ...propDrill("hashigo"),
  }),
  unoccupiedPractice({
    slug: "rope-corset",
    name: "Rope Corset: Unoccupied Practice",
    jp: "コルセット",
    summary:
      "A laced decorative panel practiced on a dress form. A corset shape can restrict the ribcage, so this app keeps it entirely off people.",
    level: "building",
    knots: ["reverse-tension", "square"],
    nerves: [],
    intent: ["decorative", "craft"],
    purpose:
      "The drill develops symmetrical lacing and a rope path that can be reversed from either end without hunting for a start.",
    bands: 4,
    ...propDrill("rope-corset"),
  }),
  unoccupiedPractice({
    slug: "hana-musubi",
    name: "Hana-musubi Flower Knot: Unoccupied Practice",
    jp: "花結び",
    summary:
      "Decorative flower knotwork on a prop or a spare length. Ornamental knotting only; nothing here is structural or load-bearing.",
    level: "foundation",
    knots: ["square"],
    nerves: [],
    intent: ["decorative", "craft"],
    purpose:
      "Ornamental knotwork is a low-stakes way to build rope memory and finger habits away from anything that has to hold.",
    ...propDrill("hana-musubi"),
  }),
  unoccupiedPractice({
    slug: "sennin-pattern",
    name: "Repeating Panel: Unoccupied Practice",
    jp: "文様",
    summary:
      "A repeating geometric panel worked on a flat prop or dress form, for pattern vocabulary rather than any wearable shape.",
    level: "building",
    knots: ["reverse-tension"],
    nerves: [],
    intent: ["decorative", "craft"],
    purpose:
      "Working a repeat on a flat surface isolates spacing and tension from the distortion a curved form introduces.",
    bands: 4,
    ...propDrill("sennin-pattern"),
  }),
  unoccupiedPractice({
    slug: "rope-dress",
    name: "Rope Dress Pattern: Unoccupied Practice",
    jp: "縄衣装",
    summary:
      "A long decorative garment pattern rehearsed on a dress form. This app excludes neck contact, intimate passes, restraint, and loading.",
    level: "advanced",
    knots: ["larks-head", "reverse-tension", "square"],
    nerves: [],
    intent: ["decorative", "craft"],
    purpose:
      "A long pattern is the drill for rope management — keeping a working end untangled and reachable over many minutes.",
    bands: 7,
    ...propDrill("rope-dress"),
  }),
  unoccupiedPractice({
    slug: "cuff-pattern",
    name: "Decorative Cuff Band: Unoccupied Practice",
    jp: "飾り手枷",
    summary:
      "A decorative band worked on a dowel or bottle. Practicing a band on an object is explicitly not practice for a wrist or ankle.",
    level: "foundation",
    knots: ["somerville-bowline", "wrap-cinch"],
    nerves: [],
    intent: ["foundation", "object-only"],
    purpose:
      "A rigid object shows a cinch closing in a way a forgiving limb does not, which is exactly why the drill stays on the object.",
    bands: 2,
    ...propDrill("cuff-pattern"),
  }),
  unoccupiedPractice({
    slug: "shime-pattern",
    name: "Binding Pattern Study: Unoccupied Practice",
    jp: "締め文様",
    summary:
      "A study of how a binding pattern closes as tension is added, on an unoccupied form. Recognition of constricting behaviour, not application.",
    level: "building",
    knots: ["larks-head", "wrap-cinch"],
    nerves: [],
    intent: ["craft", "object-only"],
    purpose:
      "Watching a pattern tighten on a prop is the cheapest way to learn which structures constrict and which hold their shape.",
    bands: 3,
    ...propDrill("shime-pattern"),
  }),
];

const RESTRAINT_CATEGORIES: Tie[] = [
  instructorRoute({
    slug: "ushiro-te-shibari",
    name: "Ushiro-te Shibari",
    jp: "後手縛り",
    summary:
      "The basic hands-behind-the-back category. Simple to describe and still a nerve, shoulder, and release-path category on a real person.",
    nerves: ["radial", "ulnar", "median"],
    intent: ["arms", "foundation-restraint"],
    risks:
      "Being the simplest arm restraint does not make it low-consequence: the same nerve paths are involved as in far more elaborate ties, and hands behind the back remove the ordinary ability to break a fall.",
    alternative:
      "Talk through what the position would feel like while she is unrestrained and free to move, and note what she wants a check-in to ask about.",
  }),
  instructorRoute({
    slug: "mae-te-shibari",
    name: "Mae-te Shibari",
    jp: "前手縛り",
    summary:
      "The hands-in-front category. Often described as the gentle option, which is a comparison rather than a clearance.",
    nerves: ["radial", "ulnar", "median"],
    intent: ["arms", "foundation-restraint"],
    risks:
      "Hands in front leaves more mobility than hands behind, and that comparison is routinely mistaken for safety — the wrist structures and the release problem are unchanged.",
    alternative:
      "Rehearse the release: where the shears live, who reaches them, and how long it takes with the lights low.",
  }),
  instructorRoute({
    slug: "teppou",
    name: "Teppou",
    jp: "鉄砲縛り",
    summary:
      "The asymmetric one-arm-up, one-arm-down category. Asymmetry loads the two shoulders differently and changes what a check-in has to ask.",
    nerves: ["radial", "brachial", "ulnar"],
    intent: ["arms", "asymmetric"],
    risks:
      "An asymmetric position can be comfortable on one side and developing a problem on the other, so a single 'how are your hands' answer covers only half of it.",
    alternative:
      "Ask an instructor how they monitor an asymmetric tie, and what they change when only one side reports a symptom.",
  }),
  instructorRoute({
    slug: "kata-te-kote",
    name: "Kata-te-kote",
    jp: "片手小手",
    summary:
      "A single-arm box category. Half the rope of a full box tie and none of the reduction in nerve consequence for the arm involved.",
    nerves: ["radial", "ulnar", "median"],
    intent: ["arms", "box-tie"],
    risks:
      "Doing one arm instead of two halves the number of limbs at risk, not the risk to the limb that is tied.",
    alternative:
      "Use the box-tie entry's instructor questions; this is the same nerve territory with a smaller footprint.",
  }),
  instructorRoute({
    slug: "yoko-gote",
    name: "Yoko-gote",
    jp: "横小手",
    summary:
      "A side-oriented box-tie variant. A variant of a high-consequence category is still that category.",
    nerves: ["radial", "ulnar", "median", "brachial"],
    intent: ["box-tie", "high-consequence"],
    risks:
      "Variants of the box tie change where load sits without changing which nerves run underneath, and 'it is only a variation' is how people skip the instruction the original needed.",
    alternative:
      "Bring the variant name to an instructor rather than adapting a remembered box tie towards it.",
  }),
  instructorRoute({
    slug: "strappado",
    name: "Strappado",
    jp: "後手吊り上げ",
    summary:
      "Arms bound behind and then raised. A shoulder category with a named injury history well outside rope.",
    nerves: ["brachial", "radial", "ulnar"],
    intent: ["arms", "high-consequence"],
    risks:
      "Raising arms bound behind the back loads the shoulder joint in a direction it does not defend well, and the position can pass from fine to injury without an intermediate warning.",
    alternative:
      "Nothing about this belongs in an app. If it interests you, it is an in-person conversation with someone who can watch a shoulder.",
  }),
  instructorRoute({
    slug: "reverse-prayer",
    name: "Reverse Prayer",
    jp: "背面合掌",
    summary:
      "Palms together behind the back. A flexibility-dependent shoulder category that varies enormously between people and between days.",
    nerves: ["brachial", "radial"],
    intent: ["arms", "flexibility"],
    risks:
      "What a shoulder tolerates depends on the person, the warmth of the room, and the day; managing it in an unrestrained stretch says nothing about holding it under rope.",
    alternative:
      "Have her find the position unrestrained and tell you where it stops being comfortable — then treat that as information, not as a target.",
  }),
  instructorRoute({
    slug: "armbinder",
    name: "Rope Armbinder",
    jp: "腕縛り",
    summary:
      "A full-length sleeve binding both arms together. Long continuous contact concentrates whatever is wrong along the whole limb.",
    nerves: ["radial", "ulnar", "median"],
    intent: ["arms", "restraint"],
    risks:
      "A sleeve covers so much of the arm that a developing problem has nowhere to show as a local change, and removal is slower than any single band.",
    alternative:
      "Time an unoccupied removal drill honestly, with a timer running, before this is ever a conversation about a person.",
  }),
  instructorRoute({
    slug: "waki-shibari",
    name: "Waki-shibari",
    jp: "脇縛り",
    summary:
      "An underarm-line category. The area carries major vessels and nerves and tolerates pressure poorly.",
    nerves: ["brachial", "ulnar"],
    intent: ["chest", "high-consequence"],
    risks:
      "Rope that migrates into the underarm can compress structures that produce symptoms in the whole arm, and migration is not something a still photograph reliably shows.",
    alternative:
      "Ask an instructor specifically about migration: what they do to prevent it and how they notice it while it is happening.",
  }),
  instructorRoute({
    slug: "munenawa",
    name: "Munenawa",
    jp: "胸縄",
    summary:
      "The chest-rope family, including breast bondage. A torso category with breathing, tissue, and migration considerations.",
    nerves: ["brachial"],
    intent: ["chest", "harness"],
    risks:
      "Bands around the chest interact with breathing in ways that change with position and over time, and tissue under sustained constriction is not reliably assessed by looking at it.",
    alternative:
      "Agree in advance what she will say about breathing without being asked, and what you will do the first time she says it.",
  }),
  instructorRoute({
    slug: "kubi-nawa",
    name: "Kubi-nawa (Neck Rope)",
    jp: "首縄",
    summary:
      "Rope on or across the neck. Locked to no in this app and not negotiable open here, at any setting.",
    nerves: ["brachial"],
    intent: ["neck", "locked"],
    risks:
      "The neck carries the airway, the major vessels supplying the brain, and reflex-sensitive structures, and pressure there can cause collapse or death with no warning and no reliable visible sign — including minutes to hours after the rope is gone.",
    alternative:
      "This app locks the neck limit to no and will not open it. If a collar or neck rope matters to the two of you, that is a conversation with a qualified instructor about non-load-bearing decorative alternatives — not something to work out between yourselves from a description.",
  }),
  instructorRoute({
    slug: "nawa-kutsuwa",
    name: "Nawa-kutsuwa (Rope Gag)",
    jp: "縄轡",
    summary:
      "A rope gag category. Anything across the mouth changes how a safeword works and can affect the airway.",
    nerves: [],
    intent: ["gag", "airway"],
    risks:
      "A gag removes the signal the whole scene depends on, and rope across the mouth can move, tighten, or interact with saliva and vomiting in ways that are dangerous rather than merely uncomfortable.",
    alternative:
      "Agree a physical signal she can give and you can see without looking for it — and test it while she is unrestrained and can tell you it works.",
  }),
  instructorRoute({
    slug: "ashi-shibari",
    name: "Ashi-shibari",
    jp: "足縛り",
    summary:
      "The general leg-binding family. Legs carry nerves that sit close to the surface at several points.",
    nerves: ["peroneal", "tibial", "saphenous"],
    intent: ["legs", "floor"],
    risks:
      "Leg nerve injuries from rope are among the better-documented ones, and a foot that has gone numb is not always noticed by someone whose attention is elsewhere.",
    alternative:
      "Read the nerve entries together and agree what she reports without waiting to be asked.",
  }),
  instructorRoute({
    slug: "m-ji-kaikyaku",
    name: "M-ji Kaikyaku",
    jp: "M字開脚",
    summary:
      "An open-legged held position. An exposure category as much as a restraint one, so it needs explicit act-specific consent.",
    nerves: ["femoral", "peroneal", "lateral-femoral-cutaneous"],
    intent: ["legs", "exposure", "intimate"],
    risks:
      "Holding a position open combines joint and nerve load with exposure, and consent to being tied is not consent to being exposed or to what might follow.",
    alternative:
      "Negotiate the exposure separately from the rope, and separately again from anything sexual. Three questions, three answers.",
  }),
  instructorRoute({
    slug: "kani",
    name: "Kani (Crab)",
    jp: "蟹縛り",
    summary:
      "A folded, compact seated category. Compact positions restrict movement and complicate release.",
    nerves: ["peroneal", "femoral"],
    intent: ["compact", "floor"],
    risks:
      "Folding a body into itself limits the small adjustments people make constantly without noticing, and those adjustments are what normally prevent pressure injuries.",
    alternative:
      "Have her hold the shape unrestrained for as long as she would want to be tied in it, and see what she reports.",
  }),
  instructorRoute({
    slug: "daruma",
    name: "Daruma",
    jp: "達磨縛り",
    summary:
      "A tightly folded whole-body category named for the limbless doll. Among the most restrictive floor shapes in the vocabulary.",
    nerves: ["peroneal", "radial", "femoral"],
    intent: ["compact", "high-consequence"],
    risks:
      "The more completely a body is folded, the fewer independent ways out it has — for her, and for you when something needs to come off quickly.",
    alternative:
      "Ask an instructor to demonstrate the release before ever discussing the construction.",
  }),
  instructorRoute({
    slug: "sakura",
    name: "Sakura",
    jp: "桜縛り",
    summary:
      "A folded seated category whose name refers to the shape it makes. Decorative naming, restraint-category risk.",
    nerves: ["peroneal", "femoral"],
    intent: ["compact", "decorative"],
    risks:
      "A pretty name and a photogenic shape are the two things most likely to get a restraint category tried without instruction.",
    alternative:
      "Rehearse the pattern's look on an unoccupied form; keep the folding out of it.",
  }),
  instructorRoute({
    slug: "hashira-shibari",
    name: "Hashira-shibari",
    jp: "柱縛り",
    summary:
      "Binding a person to a post or pillar. A structural category before it is a rope one.",
    nerves: ["ulnar", "radial", "peroneal"],
    intent: ["furniture", "restraint"],
    risks:
      "A household post is not a rated restraint point, a standing person can faint, and being attached to something fixed removes the option of simply sitting down.",
    alternative:
      "Keep the post unoccupied and work out where the shears live, whether she can be lowered, and who is catching her if she goes.",
  }),
  instructorRoute({
    slug: "spread-eagle",
    name: "Spread-eagle",
    jp: "大の字",
    summary:
      "A four-point bed or frame restraint category. Four independent attachments mean four independent things to undo.",
    nerves: ["ulnar", "radial", "peroneal", "femoral"],
    intent: ["furniture", "restraint"],
    risks:
      "Four-point restraint removes the ability to move to comfort, and every added attachment lengthens the time between deciding to release and being released.",
    alternative:
      "Time a full four-point release on an unoccupied bed. The number is usually a surprise.",
  }),
  instructorRoute({
    slug: "predicament",
    name: "Predicament Bondage",
    jp: "責め縛り",
    summary:
      "A category built to make a position deliberately unsustainable. Endurance is the point, which changes what a safeword means.",
    nerves: ["peroneal", "radial", "femoral"],
    intent: ["predicament", "endurance"],
    risks:
      "A tie designed to become uncomfortable teaches the person in it to expect discomfort, which is exactly the condition under which a real symptom gets reported late or not at all.",
    alternative:
      "Agree explicitly, beforehand, which sensations she reports immediately no matter what the scene is doing — and say them out loud rather than assuming they are obvious.",
  }),
  instructorRoute({
    slug: "hojojutsu",
    name: "Hojojutsu",
    jp: "捕縄術",
    summary:
      "The historical arresting and transport art that modern kinbaku partly descends from. Included for context, not reconstruction.",
    nerves: ["radial", "ulnar", "peroneal"],
    intent: ["historical", "context"],
    risks:
      "These were restraints for captives, designed around control and sometimes around cruelty; they were never designed around the safety of the person in them.",
    alternative:
      "Read the history as history. Its aesthetics survive into modern practice; its indifference to the tied person's welfare should not.",
  }),
  instructorRoute({
    slug: "tsurikomi",
    name: "Tsurikomi (Loaded Transitions)",
    jp: "吊り込み",
    summary:
      "The moment weight moves onto or off rope. Suspension is locked to no here, and transitions are where the incidents cluster.",
    nerves: ["radial", "brachial", "peroneal", "femoral"],
    intent: ["load-bearing", "high-consequence"],
    risks:
      "Loads change fastest during a transition, which is when a harness that held fine can shift, and when a rigger's hands are busiest and least able to respond.",
    alternative:
      "Suspension is locked to no in this app. Any loaded work belongs entirely to in-person instruction with a second competent person present.",
  }),
  instructorRoute({
    slug: "kata-ashi-zuri",
    name: "Kata-ashi-zuri",
    jp: "片足吊り",
    summary:
      "A one-leg partial-load category. Concentrating load through a single limb is a load-bearing activity whatever the feet are doing.",
    nerves: ["peroneal", "femoral", "tibial"],
    intent: ["load-bearing", "high-consequence"],
    risks:
      "Putting a share of body weight through one leg concentrates force on the structures of that limb and can produce injury quickly.",
    alternative:
      "Locked category. Keep rehearsal clothed, ground-level, unoccupied, and unloaded.",
  }),
  instructorRoute({
    slug: "yoko-zuri",
    name: "Yoko-zuri",
    jp: "横吊り",
    summary:
      "Side suspension. A full load-bearing category, locked to no in this app.",
    nerves: ["radial", "brachial", "peroneal", "femoral"],
    intent: ["load-bearing", "suspension"],
    risks:
      "Full suspension puts a person's whole weight on rope, hardware, an anchor, and a rigger's competence at once, and a failure in any of them is immediate.",
    alternative:
      "Locked category. If you want this eventually, it starts with years of in-person instruction, not with an app.",
  }),
  instructorRoute({
    slug: "tate-zuri",
    name: "Tate-zuri",
    jp: "縦吊り",
    summary:
      "Upright suspension. A full load-bearing category, locked to no in this app.",
    nerves: ["radial", "brachial", "femoral"],
    intent: ["load-bearing", "suspension"],
    risks:
      "An upright suspended position can restrict circulation and lead to fainting while there is no way to lie down, and recovery depends entirely on how fast someone can lower a loaded person.",
    alternative:
      "Locked category. Read the suspension-reality entry for what the commitment actually involves.",
  }),
  instructorRoute({
    slug: "sakasa-zuri",
    name: "Sakasa-zuri (Inversion)",
    jp: "逆さ吊り",
    summary:
      "Inverted suspension. The highest-consequence category in the vocabulary and locked to no here.",
    nerves: ["radial", "brachial", "peroneal", "femoral"],
    intent: ["load-bearing", "suspension", "high-consequence"],
    risks:
      "Inversion changes blood pressure, breathing, and consciousness on a timescale of minutes, and an inverted person who faints cannot be assessed or released quickly by one person.",
    alternative:
      "Locked category. Nothing in this app moves you towards it.",
  }),
  instructorRoute({
    slug: "ebi-zuri",
    name: "Ebi-zuri",
    jp: "海老吊り",
    summary:
      "A suspended compact-fold category, combining a restrictive floor position with load. Locked to no in this app.",
    nerves: ["peroneal", "radial", "femoral"],
    intent: ["load-bearing", "suspension", "compact"],
    risks:
      "Combining a compressive folded position with suspension stacks breathing, circulation, and release problems on top of each other.",
    alternative:
      "Locked category. The floor version already routes to an instructor; the suspended one is further away, not closer.",
  }),
  instructorRoute({
    slug: "hogtie-suspended",
    name: "Suspended Hogtie",
    jp: "海老吊り後手",
    summary:
      "A suspended version of the compact hogtie family. Locked to no in this app.",
    nerves: ["radial", "peroneal"],
    intent: ["load-bearing", "suspension", "compact"],
    risks:
      "Restrictive positioning under load has an established association with breathing compromise, and a person in it may be unable to signal.",
    alternative:
      "Locked category. Read the positional-asphyxia entry rather than looking for a version of this that is fine.",
  }),
  instructorRoute({
    slug: "kinbaku-scene",
    name: "Extended Kinbaku Session",
    jp: "緊縛",
    summary:
      "The long-form session as a whole: several ties, transitions, and a duration measured in hours. Time is itself a risk factor.",
    nerves: ["radial", "ulnar", "peroneal", "femoral"],
    intent: ["session", "duration", "context"],
    risks:
      "Risk accumulates across a long session in ways no single tie shows — temperature drops, blood sugar falls, attention degrades, and the same rope that was fine an hour ago is not.",
    alternative:
      "Set a real interval for direct checks and keep it even when the scene is going well. Rig mode's countdown exists for exactly this.",
  }),
];

export const SHIBARI_TIES: Tie[] = [...DECORATIVE_PATTERNS, ...RESTRAINT_CATEGORIES];
