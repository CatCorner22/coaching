import type { Article } from "./types";

export const ARTICLES: Article[] = [
  {
    slug: "consent-frameworks",
    title: "Consent Frameworks",
    jp: "合意",
    section: "consent",
    minutes: 7,
    summary:
      "SSC, RACK, PRICK, FRIES — the languages people use to talk about risk. Pick one you both can actually say out loud, then get specific.",
    related: ["negotiation", "safewords", "hard-limits"],
    blocks: [
      { type: "h", text: "The acronyms are not a personality" },
      {
        type: "p",
        text: "SSC (Safe, Sane, Consensual) is the old public-facing slogan. It is comforting and slightly dishonest: rope is not safe, and 'sane' has been used to police people's desires. RACK (Risk-Aware Consensual Kink) admits that you are choosing a risk. PRICK (Personal Responsibility, Informed, Consensual Kink) puts the duty to know the risk on the person taking it. FRIES (Freely given, Reversible, Informed, Enthusiastic, Specific) is a good test for a given act in a given minute.",
      },
      {
        type: "callout",
        title: "What we use in Knotty",
        text: "Informed, reversible, specific. She can revoke a tie without revoking the evening. You both know which nerves you are gambling with. Nothing happens because it looked good on someone else's body.",
      },
      {
        type: "ul",
        items: [
          "Freely given — not bargained out of sulking",
          "Reversible — a safeword that actually stops the thing",
          "Informed — you can name the nerve you are wrapping",
          "Enthusiastic — 'I guess' is a no on a TK",
          "Specific — 'rope tonight' is not consent to a crotch rope",
        ],
      },
    ],
  },
  {
    slug: "negotiation",
    title: "Negotiation",
    section: "consent",
    minutes: 8,
    summary: "The unsexy conversation that makes the sexy one possible. Yes / no / maybe, medical, time, aftercare, photos.",
    related: ["yes-no-maybe", "safewords", "photography-ethics"],
    blocks: [
      { type: "h", text: "Do it dressed, sitting, not already hard" },
      {
        type: "p",
        text: "Negotiation is not dirty talk. It is project planning. Cover: what ties are on the table, what is off, injuries and meds (especially anything that affects bleeding, fainting, nerves, or joints), how long you have, whether there will be sex, whether there will be photos, what aftercare looks like, and who is responsible for the clock.",
      },
      {
        type: "ul",
        items: [
          "Medical: EDS, diabetes, Raynaud's, clotting, asthma, previous nerve injury, shoulder history",
          "Psychological: panic, claustrophobia, gagging, humiliation, quiet vs. vocal",
          "Logistics: kids in the house, work in the morning, alcohol (answer: no)",
          "Sex: during, after, not at all — pick one before the karada goes on",
          "Photos: this app can see a still you send. Agree that before you open the camera.",
        ],
      },
      {
        type: "warn",
        text: "Alcohol and rope do not share a bed. A drink that makes her braver is a drink that makes her slower to notice a hand going numb.",
      },
    ],
  },
  {
    slug: "safewords",
    title: "Safewords and Traffic Lights",
    section: "consent",
    minutes: 5,
    summary: "Red stops the scene. Yellow changes it. Green is a check-in, not an invitation to escalate.",
    related: ["negotiation", "emergency-stop"],
    blocks: [
      {
        type: "p",
        text: "Traffic lights outperform unique safewords because they survive panic. Red: everything stops, rope comes off as fast as is safe. Yellow: pause escalation, loosen, check, maybe change ties. Green: a reply to 'where are you?' — not a request for harder.",
      },
      {
        type: "callout",
        title: "Non-verbal",
        text: "If a gag is ever in play, agree a drop object or a triple tap before the gag goes in. Knotty's studio can listen for 'red' and 'yellow' when the mic is on. A bound person who cannot speak still needs a channel.",
      },
      {
        type: "p",
        text: "Rigger safeword exists too. You can stop because you are lost, tired, or scared of the next wrap. That is competence, not weakness.",
      },
    ],
  },
  {
    slug: "yes-no-maybe",
    title: "Yes / No / Maybe",
    section: "consent",
    minutes: 6,
    summary: "A living list, not a contract carved in stone. Revisit it when a scene surprised you.",
    related: ["negotiation", "hard-limits"],
    blocks: [
      {
        type: "ul",
        items: [
          "Yes: single column, futomomo, karada, shinju, photography, sex after",
          "Maybe: TK, crotch rope, predicament, light impact on a harness, partial lift",
          "No: neck rope, gag, full suspension from a tutorial, breath play, leaving the house, surprise visitors",
        ],
      },
      {
        type: "p",
        text: "The lists above are examples, not yours. Write yours in the journal. A maybe can move after a good scene. A no does not move because you are bored.",
      },
    ],
  },
  {
    slug: "hard-limits",
    title: "Hard Limits We Will Not Coach",
    section: "risk",
    minutes: 4,
    summary: "Things this atelier will refuse to walk you through, even if you ask nicely.",
    related: ["consent-frameworks", "emergency-stop"],
    blocks: [
      {
        type: "warn",
        text: "No neck rope as restraint. No breath play. No full suspension from this app. No gag-and-leave. No rope on a person who cannot consent in real time. No scene while drunk or high.",
      },
      {
        type: "p",
        text: "Kinbaku history includes torture positions and hojojutsu captures. Knowing that history is not the same as recreating it on someone you love. Punishment ties (ebi as torment, hair suspension, strappado) are either time-boxed with a clock or they are not happening.",
      },
    ],
  },
  {
    slug: "nerve-atlas",
    title: "Nerve Atlas",
    jp: "神経",
    section: "body",
    minutes: 9,
    summary: "Where rope makes people drop hands and feet. Learn these five and you will prevent most of the horror stories.",
    related: ["circulation", "takate-kote", "futomomo"],
    blocks: [
      { type: "h", text: "Radial — the TK killer" },
      {
        type: "p",
        text: "Spirals around the outer upper arm in a groove a few fingers below the deltoid. A tight wrap or cinch here causes wrist-drop: she cannot extend the wrist or thumb. Check: 'touch my finger with your thumb. Open the hand.' Symptoms can appear after the rope is off.",
      },
      { type: "h", text: "Ulnar" },
      {
        type: "p",
        text: "Funny bone at the elbow and the pinky edge of the wrist. Cuffs that sit in the inner elbow or on the pinky-side wrist go numb in the fourth and fifth fingers.",
      },
      { type: "h", text: "Median" },
      {
        type: "p",
        text: "Inner elbow and carpal tunnel. Palmar numbness, clumsy grip. Do not park knots in the inner elbow crease.",
      },
      { type: "h", text: "Peroneal (fibular)" },
      {
        type: "p",
        text: "Outside of the knee, just below the head of the fibula. Futomomo and any wrap near the outer knee. Foot-drop: she cannot lift the foot. This is a walking injury. Outer knee is a no-cinch zone.",
      },
      { type: "h", text: "Femoral and pudendal" },
      {
        type: "p",
        text: "Inner thigh / groin, and the crotch. Hip harnesses and matanawa. Numb genitals or a dead-feeling thigh is not 'intense'. It is a nerve or a vessel asking you to stop.",
      },
      {
        type: "callout",
        title: "After the rope is off",
        text: "Nerve injuries often announce themselves later the same night or the next morning. If a weakness remains in the morning, it is a medical issue, not a 'shake it off'.",
      },
    ],
  },
  {
    slug: "circulation",
    title: "Circulation",
    section: "body",
    minutes: 6,
    summary: "Color, temperature, capillary refill, motion, feeling. Five checks, every few minutes, out loud.",
    related: ["nerve-atlas", "emergency-stop"],
    blocks: [
      {
        type: "ul",
        items: [
          "Color — pink, not white, not dusky, not blue",
          "Temperature — compare to the unbound hand",
          "Capillary refill — press a nail bed, color back in under two seconds",
          "Motion — squeeze, thumb extension, ankle pump",
          "Feeling — can she tell which finger you are touching without looking",
        ],
      },
      {
        type: "p",
        text: "Knotty's studio can compare hand color to a calibration photo you take unbound. It is a hint, not a doctor. Pale plus cold plus slow refill is a reason to strip rope, not a reason to 'see how she does'.",
      },
      {
        type: "warn",
        text: "Numbness is not a circulation check you have passed. Numbness is a nerve or a vessel already in trouble.",
      },
    ],
  },
  {
    slug: "emergency-stop",
    title: "Emergency Stop",
    section: "risk",
    minutes: 5,
    summary: "Shears, cutting order, fainting, panic. Rehearse this once while nobody is tied.",
    related: ["safewords", "circulation"],
    blocks: [
      {
        type: "p",
        text: "Trauma shears, not kitchen scissors, not a knife toward a body. They live where your hand already is — on a lanyard, on the mat, in a pocket — not in a drawer. Practice cutting cheap rope on a chair leg so the first cut of your life is not on her.",
      },
      {
        type: "ul",
        items: [
          "Cut tensioned stems first, then bands that hold the position, then decorative rope",
          "If she faints, get her horizontal, rope off the chest, airway clear, call emergency services if she does not come back immediately",
          "Panic looks like fighting the rope. Yellow is already late. Cut.",
          "Never cut toward the body. Slide the blunt beak under, blades up away from skin",
        ],
      },
    ],
  },
  {
    slug: "aftercare",
    title: "Aftercare",
    section: "aftercare",
    minutes: 7,
    summary: "Water, warmth, food, skin, words, and a check the next day. Tops need it too.",
    related: ["drop", "subspace", "nerve-atlas"],
    blocks: [
      {
        type: "p",
        text: "The scene is not over when the last wrap comes off. Blood returns, endorphins fall, marks bloom, and the story of what just happened is still being written. Physical: water, a blanket, something salty or sweet, a look at every place rope lived. Emotional: she may want quiet, or jokes, or to be held, or to be left alone in the same room. Ask. Do not assume the aftercare you like is the aftercare she needs.",
      },
      {
        type: "h",
        text: "The 24-hour check",
      },
      {
        type: "p",
        text: "Text or talk the next day on purpose. 'How are your hands. How are you with what we did. Anything we do not repeat.' Nerve symptoms, unusual bruising, or a sudden coldness toward the scene are all data.",
      },
    ],
  },
  {
    slug: "drop",
    title: "Sub Drop and Top Drop",
    section: "aftercare",
    minutes: 6,
    summary: "The chemical hangover. It can arrive hours or days later and it is not a verdict on the marriage.",
    related: ["aftercare", "subspace"],
    blocks: [
      {
        type: "p",
        text: "Sub drop is a slump: sadness, itchiness in the skin, irritability, sudden shame, fatigue. Top drop is less famous and just as real: you were the responsible one, the adrenaline leaves, and you feel monstrous or empty. Both are physiology plus meaning. Treat them with food, sleep, ordinary kindness, and a scheduled debrief — not with a bigger scene to 'fix' the mood.",
      },
    ],
  },
  {
    slug: "subspace",
    title: "Subspace and Topspace",
    section: "scene",
    minutes: 5,
    summary: "Altered states are not consent. They are a reason to slow down and check more, not less.",
    related: ["drop", "safewords"],
    blocks: [
      {
        type: "p",
        text: "Subspace can look like floating, time loss, slurry speech, a smile that is not tracking. It is beautiful and it is a person with reduced capacity. Do not add a new edge because she seems 'gone in a good way'. Topspace can look like flow, or like tunnel vision. If you notice you have not checked her hands in five minutes, you are not in flow, you are negligent.",
      },
    ],
  },
  {
    slug: "scene-architecture",
    title: "Scene Architecture",
    section: "scene",
    minutes: 7,
    summary: "Open, rise, peak, land. Rope scenes fail when they are just a sequence of ties with no landing.",
    related: ["negotiation", "aftercare", "rigger-mindset"],
    blocks: [
      {
        type: "ul",
        items: [
          "Open — consent recap, shears, bathroom, water, calibration photo",
          "Rise — a cuff, a futomomo, something that lets both of you find the rhythm",
          "Peak — the one ambitious tie, timed",
          "Land — a simpler harness or just hands, then aftercare",
        ],
      },
      {
        type: "p",
        text: "Knotty's planner is built around that arc. A night that is four ambitious ties is not impressive. It is how radial nerves get ignored.",
      },
    ],
  },
  {
    slug: "rigger-mindset",
    title: "Rigger Mindset",
    section: "protocol",
    minutes: 6,
    summary: "You are the person who can cut. That job outranks the photo, the plan, and your ego.",
    related: ["rope-bunny", "emergency-stop"],
    blocks: [
      {
        type: "p",
        text: "A nawashi is not a magician. You are a slow, vain, careful craftsperson with shears. Watch her, not the rope, when the rope and her face disagree. Narrate what you are doing so she is inside the work. If you get lost, pause. If you get aroused past your competence, pause. If you want to 'just finish this wrap' over a yellow, you have already failed.",
      },
    ],
  },
  {
    slug: "rope-bunny",
    title: "For the Person in the Rope",
    section: "protocol",
    minutes: 6,
    summary: "You are not furniture. Your job is to inhabit the tie and to report the truth.",
    related: ["rigger-mindset", "circulation"],
    blocks: [
      {
        type: "p",
        text: "Good bottoms are not quiet. They say when a wrap is on a nerve, when a hip is done, when a feeling is delicious, when a feeling is wrong. Pride in 'taking it' is how people go home with wrist-drop. You can be bratty, floaty, formal, or filthy — those are flavors. Circulation reports are not flavors. They are the job.",
      },
      {
        type: "ul",
        items: [
          "Wiggle fingers when asked, and also when not asked if they stop belonging to you",
          "Eat and drink before, not after you faint",
          "Your no does not need a better argument than his yes",
        ],
      },
    ],
  },
  {
    slug: "protocol-ds",
    title: "Protocol and Power Exchange",
    section: "protocol",
    minutes: 7,
    summary: "Rope can be a language of D/s. It does not have to be. Decide which night this is.",
    related: ["negotiation", "rigger-mindset"],
    blocks: [
      {
        type: "p",
        text: "Some couples use honorifics, kneeling, and ritual as the container for rope. Some want peer-to-peer craft with filthy conversation. Mixing them by accident — she thinks this is protocol, you think this is a workshop — is how people get their feelings broken. If you want protocol: agree forms of address, when she may speak, how she asks for a check, and how you drop protocol for a medical stop. A safeword punches through protocol. Always.",
      },
    ],
  },
  {
    slug: "impact-and-rope",
    title: "Impact and Rope",
    section: "scene",
    minutes: 6,
    summary: "A harness is a handle and a map of places not to hit.",
    related: ["scene-architecture", "nerve-atlas"],
    blocks: [
      {
        type: "p",
        text: "Hit muscle, not rope over bone, not kidneys, not the spine, not the neck. A TK gives you a still back; it also gives you a person who cannot catch herself. Start lighter than you would if she were free. Watch hands — impact plus a tight wrap is a circulation stack. Aftercare includes looking at the hit tissue and the rope marks separately.",
      },
      {
        type: "warn",
        text: "Do not flog over a nerve you have already compressed. The radial nerve does not need your help.",
      },
    ],
  },
  {
    slug: "sensation",
    title: "Sensation Play in Rope",
    section: "scene",
    minutes: 5,
    summary: "Ice, wax, breath on skin, a fingernail, a vibrator against a crotch rope. Small tools, big scenes.",
    related: ["matanawa", "scene-architecture"],
    blocks: [
      {
        type: "p",
        text: "Once she cannot move, ordinary sensations get loud. That is the gift. Wax: not on the face, not in hair, not at a temperature you have not tested on your own inner arm. Ice: not trapped against skin under rope (burns). Vibration: watch that a crotch rope plus a wand does not become a numbness machine — pleasure that goes numb is a nerve asking you to ease.",
      },
    ],
  },
  {
    slug: "photography-ethics",
    title: "Photography Ethics",
    section: "consent",
    minutes: 5,
    summary: "This app will look at stills you choose to send. That is a form of showing her. Treat it as one.",
    related: ["negotiation", "yes-no-maybe"],
    blocks: [
      {
        type: "p",
        text: "Photos of a bound partner are easy to take and impossible to un-take. Agree: who keeps them, whether faces are in frame, whether they leave the house, whether they go to an AI coach (they do, compressed, when you tap Analyze), and what happens if the relationship ever changes. Knotty stores the journal on this device, not on our servers. Analysis stills go to Grok for the coaching pass you asked for. If that sentence bothers either of you, use the written guides and leave the camera off.",
      },
    ],
  },
  {
    slug: "rope-materials",
    title: "Rope Materials",
    section: "craft",
    minutes: 8,
    summary: "Jute, hemp, cotton, synthetics. What they do to skin, knots, and drop.",
    related: ["gear-care", "emergency-stop"],
    blocks: [
      {
        type: "p",
        text: "Jute is the Japanese default: light, grippy, a little harsh, breaks in with oil and use. Hemp is stronger, heavier, slower to break in, kinder to some skin. Cotton is soft and stretchy — it feels beginner-friendly and then tightens when she moves, which is why we do not recommend it as a load-bearing cuff. Nylon and MFP are strong and slick; knots need more lock, burns are real, and they do not tell your hands the truth the way plant fiber does.",
      },
      {
        type: "ul",
        items: [
          "Standard starting kit: six to eight pieces of 6mm jute, 7–8 meters, plus two 4-meter pieces",
          "Condition jute with a little camellia or jojoba, then bake or tumble — not with wax that turns it into a crayon",
          "Retire rope that has a crunchy spot, a glossy melted nylon patch, or a memory of a previous cut",
        ],
      },
    ],
  },
  {
    slug: "suspension-reality",
    title: "Suspension Reality",
    section: "risk",
    minutes: 6,
    summary: "Why this app will teach partial load and then send you to a human.",
    related: ["partial-suspension", "hip-harness", "emergency-stop"],
    blocks: [
      {
        type: "p",
        text: "Full suspension is not a harder TK. It is a different sport: rated anchors, upline management, crash pads, spotters, and a lowering plan that works when she panics. People die from getting this wrong. People also lose hands. Knotty will coach a few kilos off one foot, on a real harness, with a munter. It will not coach you to hang her from a ceiling fan.",
      },
    ],
  },
  {
    slug: "combining-sex",
    title: "Sex and Rope",
    section: "scene",
    minutes: 6,
    summary: "Access, friction, lube, and the moment a beautiful harness becomes a problem.",
    related: ["matanawa", "karada", "aftercare"],
    blocks: [
      {
        type: "p",
        text: "If sex is part of the scene, build for access: open crotch, arms in a position that still lets her be a participant if she wants that, a futomomo instead of a full agura. Plant fiber plus lube is a mess and a hygiene project — plan a towel. A TK during penetrative sex means she cannot catch herself; you are responsible for the bed not eating her shoulder. After, rope off before you fall asleep.",
      },
    ],
  },
  {
    slug: "warmup-stretch",
    title: "Warm-up and Stretching",
    section: "body",
    minutes: 5,
    summary: "Shoulders, hips, wrists, and a few minutes of ordinary touching before the first cuff.",
    related: ["takate-kote", "futomomo"],
    blocks: [
      {
        type: "p",
        text: "Cold shoulders do not belong in a gote. Spend five minutes: arm circles, doorway pec stretch, gentle wrist flex, hip openers, a squat. Then put hands on her unbound — a massage is a circulation check you both enjoy. The first rope of the night should feel like a continuation, not a jump scare, unless a jump scare was the negotiated scene.",
      },
    ],
  },
  {
    slug: "gear-care",
    title: "Caring for Rope",
    section: "craft",
    minutes: 5,
    summary: "Coil, inspect, wash when you must, retire when you should.",
    related: ["rope-materials"],
    blocks: [
      {
        type: "p",
        text: "Coil so it pays out without kinks. Inspect for broken yarns, thin spots, and anything that crunches. Jute does not love a washing machine; spot-clean, air, re-oil lightly. Synthetics can be washed and must be fully dry. Anything that has been cut, melted, or used to actually suspend a human past its working history gets demoted to decorative or trash.",
      },
    ],
  },
  {
    slug: "furniture",
    title: "Beds, Chairs, and Hard Points",
    section: "craft",
    minutes: 5,
    summary: "The room is part of the tie. Most bedroom furniture is not a rigging point.",
    related: ["chair", "partial-suspension"],
    blocks: [
      {
        type: "p",
        text: "A solid chair with no wheels is a gift. A four-poster is not automatically rated. A door hook will extract from drywall at the worst time. If you want a hard point, buy one, install it into structure, and know the rating. Until then, floor work and furniture as shape — not as an anchor — will give you years of scenes.",
      },
    ],
  },
  {
    slug: "marks-vs-injury",
    title: "Marks versus Injury",
    section: "body",
    minutes: 5,
    summary: "Imprints, hickey-like rope kisses, bruises, blisters, and the things that mean you call a doctor.",
    related: ["aftercare", "nerve-atlas"],
    blocks: [
      {
        type: "p",
        text: "A rope mark is a badge that fades in hours. A bruise is blood under skin — cosmetic, usually. A blister is a friction problem; dress it, do not put rope on it tomorrow. Weakness, foot-drop, wrist-drop, loss of feeling that is still there in the morning, chest pain, fainting that does not make sense: those are injuries. Do not put them in the journal as 'intense' and try again on Saturday.",
      },
    ],
  },
  {
    slug: "time-and-clocks",
    title: "Time, Clocks, and Ambition",
    section: "scene",
    minutes: 4,
    summary: "Every tie has a clock. Ambition is a budget you spend on one peak, not on the whole night.",
    related: ["scene-architecture", "takate-kote"],
    blocks: [
      {
        type: "p",
        text: "A TK might be honest for fifteen minutes on a given body and dishonest at minute sixteen. Futomomo is often done before you are done looking at it. Decorative hishi can run long because it is not load, but her feet are still her feet. Set timers. Knotty will nag you. That nag is the feature.",
      },
    ],
  },
  {
    slug: "furniture-not-hardpoints",
    title: "Furniture Is Not a Hardpoint",
    section: "risk",
    minutes: 6,
    summary:
      "A swing, a pole, a cross, and a table are scenes. They are not inspected Shibari rigs. Rope dresses. Hardware that was sold for sex holds sex, not a hang.",
    related: ["hard-limits", "emergency-stop"],
    blocks: [
      { type: "h", text: "What you own" },
      {
        type: "p",
        text: "You have a sex bench, a massage table, a stripper pole, a Saint Andrew's Cross, and a sex swing. Those are excellent. They let her hips be high, her arms be displayed, her back be flogged, her legs be open without a squat. None of them is a bamboo, a ring, or a span set that a rigger would hang from.",
      },
      {
        type: "ul",
        items: [
          "Massage table — platform. Face cradle is not a collar.",
          "Sex bench — kneeling/drape. A handle, not a hoist.",
          "Cross — arms-up clock. Short. Hands in the photograph.",
          "Swing — sling. Straps hold her. Rope does not.",
          "Pole — chrome to cuff to. Not an upline.",
        ],
      },
      {
        type: "warn",
        text: "If the ceiling mount was not installed by someone who hangs people for a living, it is furniture. Knotty will not coach you to clip an upline to it.",
      },
    ],
  },
  {
    slug: "machine-and-rope",
    title: "Machines, Large Toys, and Bound Hips",
    section: "scene",
    minutes: 7,
    summary:
      "A Hismith does not watch her face. A Bad Dragon flare does not migrate itself off if crotch rope forbids backing out. You are the safeword channel.",
    related: ["safewords", "circulation", "furniture-not-hardpoints"],
    blocks: [
      { type: "h", text: "The machine is not a partner" },
      {
        type: "p",
        text: "Speed is a privilege she can revoke. If her hands are tied, that revoke is a word, a bell, a knee, or you watching her go quiet and stopping it yourself. Never: TK + gag + machine. That is three ways she cannot help herself.",
      },
      { type: "h", text: "Size is warmup" },
      {
        type: "p",
        text: "Large toys are a lube and time problem, not a dominance problem. Insert before the restrictive hip rope, or leave a way to lift the crotch rope without untying the night. Rope positions. It does not force depth.",
      },
      {
        type: "warn",
        text: "Do not walk away while the machine is on. A machine does not hear yellow.",
      },
    ],
  },
];

export function getArticle(slug: string) {
  return ARTICLES.find((a) => a.slug === slug);
}
