import type { Article } from "./types";

/**
 * Knowledge expansion, audited 2026-08-22: breathing position risk, gags and
 * signals, nerve and circulation self-observation, fainting response, device
 * fit, solo risk, medical disclosure, gear inspection, and incident response.
 * Same contract as every entry: education and risk recognition only — no
 * procedural construction detail, no clearance, no diagnosis.
 */
export const EXPANSION_ARTICLES: Article[] = [
  {
    slug: "positional-asphyxia",
    title: "Position and Breathing",
    section: "risk",
    minutes: 7,
    summary:
      "Some positions restrict breathing by themselves, without anything near the neck. Recognize them and change position early.",
    related: ["hard-limits", "emergency-stop", "circulation"],
    blocks: [
      {
        type: "p",
        text: "Breathing can fail from position alone. Face-down (prone) positioning, chest or abdomen compression, thighs folded hard against the belly, a head forced lower than the torso, and restraint that prevents repositioning have each contributed to deaths documented in restraint literature — without any neck contact at all.",
      },
      {
        type: "ul",
        items: [
          "Treat face-down restraint, chest loading, and tight fold-up positions as elevated-risk by default, and keep them short, monitored, and easy to reverse.",
          "Body weight, fatigue, intoxication, respiratory or cardiac conditions, and panic each raise the risk; struggle itself consumes oxygen and can mask distress as resistance.",
          "'I can breathe right now' is not a guarantee for the next several minutes. Positional breathing failure can develop gradually, then quickly.",
          "Change position at the first sign of labored breathing, unusual quietness, slow responses, or a change in voice. Do not wait to be asked.",
          "A restrained person must always retain a working stop signal, and the partner must stay present and attentive for the whole scene.",
        ],
      },
      {
        type: "warn",
        text: "Abnormal breathing, unresponsiveness, or confusion is an emergency: release, support breathing position, and call emergency services now. This entry describes recognized patterns only; it cannot define a safe position or duration for any person.",
      },
    ],
  },
  {
    slug: "gag-signal-safety",
    title: "Gags and Stop Signals",
    section: "risk",
    minutes: 6,
    summary:
      "A gag removes the spoken safeword and adds airway risk. Agree on a nonverbal stop signal that works even with hands restrained.",
    related: ["safewords", "positional-asphyxia", "emergency-stop"],
    blocks: [
      {
        type: "p",
        text: "Anything that blocks the mouth converts breathing to a nose-only path and removes normal speech. Congestion, allergies, a cold, or anything else that narrows nasal breathing makes a mouth-blocking item unsafe that day. Nausea or recent eating adds a choking risk if vomiting occurs while the mouth is blocked.",
      },
      {
        type: "ul",
        items: [
          "Agree on a nonverbal stop signal before anything goes in or over the mouth: a held object that gets dropped, a repeated distinct tap, or a hand signal that stays physically possible in the planned position.",
          "Rehearse the signal once while everyone is free, and treat the signal — or its loss, like a dropped object — as an immediate stop, the same as the word.",
          "Check in more often than usual, with yes/no questions answerable by the agreed signal.",
          "Remove the item immediately for any breathing change, gagging, distress, escalating congestion, or uncertainty about the signal.",
          "Never combine a mouth-blocking item with being alone, with intoxication, or with anything near the neck.",
        ],
      },
      {
        type: "warn",
        text: "If a gagged person vomits, becomes unresponsive, or shows any breathing difficulty, remove the item and treat it as an emergency. This entry does not certify any product or configuration as safe.",
      },
    ],
  },
  {
    slug: "nerve-self-checks",
    title: "Nerve Awareness During a Scene",
    section: "body",
    minutes: 7,
    summary:
      "Simple, repeated hand and foot awareness lets a restrained person notice nerve trouble early. Any positive finding means release now.",
    related: ["nerve-atlas", "circulation-vs-nerve", "incident-response"],
    blocks: [
      {
        type: "p",
        text: "Nerve irritation from compression or stretch often announces itself as tingling, a 'sleepy' patch, burning, or sudden weakness — sometimes in only part of a hand or foot. The restrained person is the sensor: periodic self-observation catches change earlier than any outside check, and earlier than any camera possibly could.",
      },
      {
        type: "ul",
        items: [
          "Every few minutes, deliberately notice each hand and foot: can you feel all fingers and toes, and does anything tingle, burn, or feel absent or 'asleep'?",
          "Gently move what the position allows — spread and touch fingers together, make and release a light fist, flex the wrist or ankle — and compare both sides against each other and against how you felt at the start.",
          "A change in only part of a hand or foot, or a movement that suddenly feels weak or wrong, is a release-now signal even if everything else feels fine and nothing hurts.",
          "Arms overhead, wrists behind the back, and tightly folded legs put nerves on stretch, which lowers their tolerance for any added pressure. Expect less margin in those positions and check more often.",
          "Report changes immediately and specifically: which hand, which fingers, what changed. The partner's job is to release first and discuss afterward.",
        ],
      },
      {
        type: "warn",
        text: "These observations exist to trigger release, never to justify continuing. No self-test, interval, or app clears nerve function. Symptoms that persist after release need prompt medical assessment.",
      },
    ],
  },
  {
    slug: "circulation-vs-nerve",
    title: "Circulation Change vs Nerve Change",
    section: "body",
    minutes: 6,
    summary:
      "Both mean release now. The pattern of the change is worth noticing only because it helps you describe symptoms accurately afterward.",
    related: ["circulation", "nerve-self-checks", "incident-response"],
    blocks: [
      {
        type: "p",
        text: "Educational pattern, not a triage tool: restricted circulation tends to involve a whole hand or foot — coldness, heaviness, swelling, or an overall color change. Nerve compression more often affects a specific patch or a few fingers — tingling, numbness, burning, or weakness in one territory while the rest feels normal. Real symptoms overlap, and neither pattern is ever the 'acceptable' one.",
      },
      {
        type: "ul",
        items: [
          "Whole-limb cold, color change, or swelling: release now.",
          "Partial numbness, tingling, burning, or weakness — even one finger: release now.",
          "Do not test your way to continuing. Nail-bed timing, pulse hunting, forced movement, and photographs are not clearance and can delay release.",
          "After release, note what was felt, where, and roughly when it started and resolved. That description is what a clinician can actually use.",
          "Symptoms that persist, worsen, or return after release need prompt medical assessment — sooner for weakness or movement loss.",
        ],
      },
      {
        type: "warn",
        text: "The distinction exists for description, never for deciding to continue. Any of these signs is an immediate-release signal, and this entry cannot diagnose the cause of any symptom.",
      },
    ],
  },
  {
    slug: "fainting-response",
    title: "Faintness and Fainting",
    section: "risk",
    minutes: 6,
    summary:
      "Lightheadedness while restrained or upright is a release-now signal. An actual faint while restrained is an emergency until proven otherwise.",
    related: ["emergency-stop", "positional-asphyxia", "aftercare"],
    blocks: [
      {
        type: "p",
        text: "Fainting is a sudden drop in blood flow to the brain. Standing still for a long time, pain, heat, dehydration, strong emotion, and seeing blood or needles are all common triggers. Being upright and unable to move freely — including standing in restraint or loaded in a harness or line — is specifically dangerous, because the person cannot fall safe or reposition, and staying upright keeps blood pooled away from the brain.",
      },
      {
        type: "ul",
        items: [
          "Treat lightheadedness, nausea, sweating, ringing ears, tunnel or graying vision, or 'I feel weird' as a release-now signal, not something to push through.",
          "Get the person down and released without creating a fall, then lying flat; raising the legs can help recovery from a simple faint.",
          "Someone who faints while upright and restrained must come down immediately — minutes matter.",
          "After any faint: no immediate re-tying. Recheck how they feel, hydrate, and end the scene generously.",
          "Seek emergency care for any faint with a head strike, slow or incomplete recovery, chest pain, breathing difficulty, or that happened during exertion; discuss any restraint-related faint with a clinician afterward.",
        ],
      },
      {
        type: "warn",
        text: "A person who does not recover promptly and completely is an emergency: call emergency services. This entry describes recognized responses; it cannot determine why someone fainted.",
      },
    ],
  },
  {
    slug: "cuff-and-collar-fit",
    title: "Cuffs, Collars, and Fit",
    section: "craft",
    minutes: 7,
    summary:
      "Fit, padding, release access, and what never gets loaded. A well-made cuff still needs the same monitoring as rope.",
    related: ["circulation", "nerve-self-checks", "gear-care"],
    blocks: [
      {
        type: "p",
        text: "Manufactured restraints change the failure modes, not the risks. Wide, padded contact spreads pressure better than a narrow edge, but any cuff can still compress nerves and vessels, and any attachment can still load a joint at a bad angle. Fit is checked at the start and re-checked whenever position changes.",
      },
      {
        type: "ul",
        items: [
          "No finger-width or gap rule establishes safe pressure. Published references disagree — a fingertip, one finger, two fingers — precisely because none of them measures what actually injures a nerve. Treat any such number as a rough starting point you then monitor, never as a check that passed.",
          "Both directions fail. Too tight compresses: cuff injury to the nerves at the wrist is a documented pattern, and cuffs that can ratchet or slip tighter after they are applied are a recognized part of it. Too loose is not the safe side either — a cuff that slides under load concentrates its edge on the narrow wrist, which is exactly where those nerves lie shallow.",
          "Because both ends fail, the check that matters is the person, repeated: ask what they feel, and release for any change. A cuff that felt right at the start is not a cuff that is still right ten minutes later.",
          "Prefer equipment with fast, practiced release: buckles you have actually operated under mild stress beat locks whose key has a single location. If it locks, the key stays in arm's reach of the scene.",
          "The same signals as rope apply: tingling, numbness, coldness, color change, or weakness at any point means release now.",
          "A collar is symbolic equipment. Never attach a load, a downward line, or a pulling force to anything around a neck, and never leave a collared person attached to a fixed point unattended.",
        ],
      },
      {
        type: "warn",
        text: "Nothing worn around a neck has a safe loaded configuration; serious harm from neck pressure can occur without visible injury and can be delayed. This entry does not certify any product, and fit rules never replace monitoring.",
      },
    ],
  },
  {
    slug: "solo-self-tying",
    title: "Tying Alone",
    section: "risk",
    minutes: 6,
    summary:
      "Self-tying for craft practice is one thing. Self-restraint alone removes the person who would notice trouble and respond.",
    related: ["emergency-stop", "hard-limits", "positional-asphyxia"],
    blocks: [
      {
        type: "p",
        text: "Practicing pattern craft on your own body with free hands and no fixed attachment is a reasonable way to learn rope handling. Genuine self-restraint alone is categorically different, for a structural reason rather than a statistical one: it removes the only person who could notice trouble and act. A faint, a slip, a jammed release, or position trouble all become unrecoverable at the moment they happen, because the one thing every emergency response in this app assumes — someone present and able — is absent.",
      },
      {
        type: "ul",
        items: [
          "Keep solo work to unloaded pattern practice: hands free, nothing fixed to furniture or hardware, nothing near the neck, nothing over the mouth, and no positions you cannot simply stand up out of.",
          "Keep a practiced cutting tool physically within reach of your restrained hand positions — reachable in the position you would actually be stuck in, not on a table across the room.",
          "Escape mechanisms fail: ice releases jam, knots capsize out of reach, hands go numb and lose dexterity. Plan for the release you cannot operate.",
          "A phone that can call for help, reachable and usable in the restrained position, is a minimum — and still not a substitute for a present partner.",
          "Anything involving fixed attachment, load, neck, mouth, breath, or intoxication has no solo version. With a partner in the next room, agree on scheduled check-ins that trigger a look when missed.",
        ],
      },
      {
        type: "warn",
        text: "This entry cannot make solo restraint safe; it can only shrink what you attempt alone. The activities this app treats as instructor-route or stop categories remain so — alone, doubly.",
      },
    ],
  },
  {
    slug: "top-incapacitated",
    title: "If the Top Goes Down",
    section: "risk",
    minutes: 6,
    summary:
      "Every emergency instruction in this app is addressed to the person who can act. This is the one where that person is the emergency.",
    related: ["solo-self-tying", "emergency-stop", "hard-limits", "fainting-response"],
    blocks: [
      {
        type: "p",
        text: "Read the rest of this app and you will notice something: every emergency response assumes someone present and able. Stop and release. Support the position. Call for help. All of it is addressed to the person with free hands. A two-person household practising alone has exactly one of those people, and tops are not exempt from fainting, seizures, cardiac events, strokes, low blood sugar, or simply falling and hitting their head. None of that has anything to do with rope, and none of it announces itself in advance.",
      },
      {
        type: "p",
        text: "What makes this different from every other risk here is that it has no in-the-moment answer. The restrained person cannot be talked through a response they have no hands for. So the whole of the mitigation happens earlier, when you are deciding what to tie — which means it is a negotiation decision, not a safety technique.",
      },
      {
        type: "ul",
        items: [
          "The question to settle before a tie, every time: if the top stopped responding right now, could the bottom get out or get help without them? If the answer is no, that is the tie being chosen, not an unlucky outcome.",
          "Rehearse the bottom's unaided exit while calm, unhurried, and not in the middle of a scene. An escape nobody has actually performed is a plan, not a capability — and hands that are cold, numb, or shaking do not perform it the way rested hands do.",
          "Keep a phone within the bottom's reach, unlocked or with voice activation and emergency SOS already enabled and tested. Test it: many phones will not answer a voice assistant from a locked screen, and a phone across the room is decoration.",
          "Anything the bottom cannot exit alone — fixed attachment, load, suspension, anything on the neck, anything blocking the mouth, hands secured beyond reach of a release — has no version of this that works. Those are already stop or instructor-route categories in this app; alone with one partner, they are also unrecoverable.",
          "Someone outside should notice. A scheduled message, a friend expecting a check-in at a set time, anything that turns silence into a knock. It does not have to explain what you are doing.",
        ],
      },
      {
        type: "p",
        text: "If it happens and you are the restrained one: your own position and breathing come first, because an unresponsive partner cannot be helped by someone who has passed out beside them. Get your airway clear of pressure, get out by the route you rehearsed, and call emergency services — an unresponsive person needs them whether or not you are free yet. Say plainly that someone is unresponsive and give the address; dispatchers do not need the rest of the context, and no part of what you were doing changes the medical response.",
      },
      {
        type: "warn",
        text: "This entry cannot make the scenario survivable after the fact. It can only move the decision to the point where it is still a decision. If you would not accept the outcome of the top going down mid-tie, do not build the tie that makes it unrecoverable.",
      },
    ],
  },
  {
    slug: "medical-disclosure",
    title: "Health Disclosure in Negotiation",
    section: "consent",
    minutes: 7,
    summary:
      "Some conditions quietly change rope risk. Naming them beforehand is part of informed consent, not oversharing.",
    related: ["negotiation", "consent-frameworks", "check-in-script"],
    blocks: [
      {
        type: "p",
        text: "Informed consent includes what the body brings to the scene. This is a conversation between partners, not a medical exam: each person names what changes their risk or their signals, and the plan adjusts. When a condition raises questions neither partner can answer, the honest move is asking a clinician who knows the person — framed simply as restraint, pressure, and position questions.",
      },
      {
        type: "ul",
        items: [
          "Nerve history: past compression injuries, neuropathy, diabetes, or carpal tunnel lower the margin and argue for gentler positions and more frequent checks.",
          "Circulation and bleeding: blood thinners, clotting disorders, Raynaud's, and vascular disease change what pressure and cold do, and how marks and bruises behave.",
          "Joints and connective tissue: hypermobility and Ehlers-Danlos change safe range of motion; a position that feels available is not necessarily one to hold.",
          "Heart, blood pressure, and breathing: cardiac conditions, asthma, and anything affecting breathing weigh against chest loading, folded positions, and long upright holds.",
          "Also worth naming: seizure history, fainting tendency, pregnancy, panic and trauma responses, medications that blunt sensation or alertness, and anything affecting how the person signals distress.",
        ],
      },
      {
        type: "warn",
        text: "Disclosure changes the plan; it never transfers responsibility or makes an elevated-risk activity safe. This entry is a conversation guide, not medical advice, and it cannot assess any individual condition.",
      },
    ],
  },
  {
    slug: "rope-inspection-retirement",
    title: "Rope Inspection and Retirement",
    section: "craft",
    minutes: 6,
    summary:
      "Run every rope through your hands before use. Damage you find on the shelf is damage that will not surprise you mid-scene.",
    related: ["gear-care", "rope-materials", "emergency-stop"],
    blocks: [
      {
        type: "p",
        text: "Before each use, run the full length slowly through your hands and eyes. You are feeling for change from last time: new fuzzing concentrated in one spot, a thin or soft segment, a lump or waist in the core, crunchy or brittle fiber, glazing, or a strand that has shifted. Natural fiber also announces trouble by smell — mustiness means moisture got in.",
      },
      {
        type: "ul",
        items: [
          "Retire or shorten rope with localized core damage: a soft flat segment, a popped or displaced strand, or a sharp kink that stays after tension.",
          "Uniform light surface fuzz is normal wear on natural fiber; a concentrated fuzzy patch over one spot is a wear point to watch or cut out.",
          "Dry rope thoroughly before storage; store coiled, dry, out of sunlight, and away from rodents and chemicals. Mildew and UV both weaken fiber invisibly.",
          "Wash by material: synthetics tolerate machine washing in a bag; natural fiber prefers spot cleaning, and full washing changes its behavior and needs re-tensioned drying.",
          "Keep retired rope out of the active kit — cut it into short craft pieces or mark it unmistakably. An 'almost fine' rope in the bag will eventually be used.",
        ],
      },
      {
        type: "warn",
        text: "Inspection reduces surprises; it does not create a load rating. No rope in this app's scope is certified for suspension or other high-consequence loading, and a clean inspection is not clearance.",
      },
    ],
  },
  {
    slug: "incident-response",
    title: "After Something Goes Wrong",
    section: "risk",
    minutes: 7,
    summary:
      "A calm sequence for the hours and days after a suspected injury: care first, notes second, blame never.",
    related: ["marks-vs-injury", "nerve-self-checks", "aftercare"],
    blocks: [
      {
        type: "p",
        text: "When a scene produces a suspected injury — numbness that stays, weakness, a hand that will not lift, unusual pain, or anything that scares either of you — the sequence is simple: stop and release, care for the person, decide the level of medical response, and write down what happened while memory is fresh. Shame is the enemy of all four steps.",
      },
      {
        type: "ul",
        items: [
          "Emergency signs — unresponsiveness, breathing trouble, chest pain, stroke-like signs, uncontrolled bleeding, a head strike — mean emergency services now, not observation.",
          "Persistent numbness, tingling, or any weakness after release deserves prompt medical assessment. Early evaluation matters for nerve symptoms; 'wait and see' is a decision for a clinician, not for the couple.",
          "Be plainly honest with clinicians: 'sustained pressure on the arm from restraint play' gives them what they need. Clinicians see activity-related injuries constantly; a vague story only degrades the care.",
          "Write down the position, roughly where pressure was, when symptoms started and what they were, and what resolved when. Bring the notes to any appointment.",
          "Debrief later, without blame: what signal was missed or absent, and what changes — positions, check frequency, duration, equipment — before anything similar happens again. Nothing resumes until symptoms are fully resolved and both people genuinely want it.",
        ],
      },
      {
        type: "warn",
        text: "This entry cannot diagnose, grade, or predict recovery of any injury. When either partner is uncertain whether medical care is needed, that uncertainty is itself the answer: seek assessment.",
      },
    ],
  },
];
