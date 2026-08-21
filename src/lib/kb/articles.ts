import type { Article } from "./types";
import { MORE_ARTICLES } from "./more-articles";

const CORE_ARTICLES: Article[] = [
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
        text: "Informed, reversible, and specific. Anyone can revoke an activity without consenting to a substitute. No photo, checklist, timer, or model output overrides a current no or uncertainty.",
      },
      {
        type: "ul",
        items: [
          "Freely given — not bargained out of sulking",
          "Reversible — a safeword that actually stops the thing",
          "Informed — everyone can describe the planned activity, material risks, and release plan",
          "Enthusiastic — uncertainty is not permission to start or escalate",
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
        text: "Traffic-light words can be easier to remember than a unique phrase. Red: stop the activity and begin the rehearsed release while preventing a secondary fall. Yellow: stop adding intensity, reduce restriction, and check directly. Green: a reply to a check-in, not permission to escalate. Freezing, unusual silence, confusion, distress, or loss of response requires stopping even if no word is spoken.",
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
          "Yes: only specific activities both adults explicitly choose for this session",
          "Maybe: discuss further; maybe is not permission and defaults to no until clarified",
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
        text: "Kinbaku history includes torture positions and hojojutsu captures. Knowing that history is not permission or instruction to recreate high-consequence positions. This app routes those activities to qualified, hands-on adult education.",
      },
    ],
  },
  {
    slug: "nerve-atlas",
    title: "Nerve Atlas",
    jp: "神経",
    section: "body",
    minutes: 9,
    summary: "Recognize concerning changes without trying to diagnose a nerve or derive a placement rule from an atlas.",
    related: ["circulation", "takate-kote", "futomomo"],
    blocks: [
      { type: "h", text: "Symptoms are stop signals, not anatomy tests" },
      {
        type: "p",
        text: "New numbness, tingling, burning, electric sensations, weakness, loss of movement, loss of coordination, severe or escalating pain, swelling, or a marked temperature or color change all require prompt release. A symptom pattern cannot identify the structure involved, and a normal-looking limb does not clear the tie.",
      },
      { type: "h", text: "What an atlas can and cannot do" },
      {
        type: "p",
        text: "Names such as radial, ulnar, median, fibular, femoral, and pudendal are vocabulary for an instructor or clinician conversation. A diagram, body landmark, finger-width rule, color check, pulse check, photograph, or movement test cannot define safe placement, pressure, or duration. Learn person-specific placement and release skills hands-on from a qualified, consent-centered instructor.",
      },
      {
        type: "callout",
        title: "After the rope is off",
        text: "New weakness, numbness, loss of movement, severe pain, swelling, or temperature change is a reason to release. Persistent or worsening symptoms need prompt medical assessment; do not wait overnight for a photo, timer, or app result.",
      },
    ],
  },
  {
    slug: "circulation",
    title: "Circulation",
    section: "body",
    minutes: 6,
    summary: "Direct communication and comparison checks can reveal a reason to release, but no interval or threshold proves safety.",
    related: ["nerve-atlas", "emergency-stop"],
    blocks: [
      {
        type: "ul",
        items: [
          "Ask about new or changing sensation, movement, strength, pain, swelling, and temperature.",
          "Compare with the person's own baseline only to notice change, never to approve continuation.",
          "Release for numbness, tingling, weakness, loss of movement, severe or escalating pain, or a marked color or temperature change.",
          "Do not use nail-bed timing, pulse checks, finger-width rules, photographs, or forced movement as clearance.",
          "Persistent or worsening symptoms after release need prompt medical assessment.",
        ],
      },
      {
        type: "p",
        text: "A camera cannot assess circulation, nerve function, pain, sensation, breathing, or injury. Directly ask, compare both sides and baseline, and release for any concerning change or uncertainty rather than waiting for an app or a fixed threshold.",
      },
      {
        type: "warn",
        text: "Numbness is an immediate-release signal, not evidence of a particular diagnosis. If symptoms persist or worsen after release, seek prompt medical assessment.",
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
        text: "Keep an appropriate release tool immediately accessible and practice using it on unoccupied material. In an emergency, stop the activity, prevent a fall, release within your training, call emergency services when indicated, and follow dispatcher instructions.",
      },
      {
        type: "ul",
        items: [
          "There is no universal cutting order; stabilize against a fall and use the release method you have practiced for the actual configuration.",
          "Call emergency services immediately for unresponsiveness, abnormal breathing, severe confusion, collapse, or another emergency sign.",
          "Stop and release for panic, a stop signal, loss of communication, or uncertainty.",
          "Keep sharp edges directed away from the body and follow your hands-on training and dispatcher instructions.",
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
        text: "The scene is not over when the last wrap comes off. Ask what support is wanted: water, warmth, quiet, reassurance, space, company, or something else. Do not impose food, touch, photographs, or a standard ritual. Recheck for pain, weakness, numbness, breathing or swallowing changes, dizziness, confusion, or significant distress.",
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
    summary: "Some people report delayed emotional or physical changes after an intense scene; the cause should not be assumed.",
    related: ["aftercare", "subspace"],
    blocks: [
      {
        type: "p",
        text: "Some people report sadness, irritability, shame, fatigue, emptiness, or other changes after an intense scene. Those experiences have many possible causes and are not diagnosed here. Offer ordinary, consented support and a later debrief; do not use another scene to override distress. Seek professional help for severe, persistent, or safety-threatening symptoms.",
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
        text: "An altered or less-responsive presentation can mean reduced capacity or a medical problem; this app cannot distinguish them. Do not introduce a new activity. Stop, check directly, and call emergency services for unresponsiveness, abnormal breathing, severe confusion, collapse, or another emergency sign. No fixed check interval proves safety.",
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
          "Open — direct consent recap, release plan, bathroom, water, and baseline conversation; no photo is a physiological baseline",
          "Rise — a lower-consequence, ground-level activity with active communication",
          "Peak — stay within the least experienced person's demonstrated skill and pre-negotiated limits",
          "Land — a simpler harness or just hands, then aftercare",
        ],
      },
      {
        type: "p",
        text: "Knotty's planner is built around that arc. Time estimates organize a plan; they never establish a safe duration or excuse a delayed response to symptoms or withdrawn consent.",
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
        text: "The person in rope should be able to communicate freely and stop without penalty. Report new or changing sensation, movement, pain, swelling, temperature, breathing, alertness, or distress without trying to diagnose the cause. Silence, freezing, unusual quiet, or loss of responsiveness also require a stop and direct assessment.",
      },
      {
        type: "ul",
        items: [
          "Use the agreed verbal and nonverbal stop signals as soon as anything changes or feels wrong.",
          "Do not use a movement test, speech test, or normal appearance as proof that continuing is safe.",
          "Your no does not need a better argument than someone else's yes.",
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
        text: "Combining impact with restraint changes mobility, communication, fall, and tissue risks. This app does not teach impact placement or remotely validate a configuration. Keep release access immediate, maintain direct communication, and use qualified in-person education for technique.",
      },
      {
        type: "warn",
        text: "Do not combine impact with restraint from app instructions. Stop and release for symptoms, distress, loss of communication, or uncertainty; use qualified in-person education for impact technique.",
      },
    ],
  },
  {
    slug: "sensation",
    title: "Sensation Play in Rope",
    section: "scene",
    minutes: 5,
    summary: "Adding sensation to restraint changes heat, friction, communication, and release risks.",
    related: ["matanawa", "scene-architecture"],
    blocks: [
      {
        type: "p",
        text: "This app does not teach heat, wax, intense cold, electrical stimulation, or intimate restraint combinations. Discuss the exact activity, limits, stop channels, hygiene, and rapid release while everyone is unrestrained. Stop for numbness, pain, skin injury, distress, or any communication change, and learn higher-consequence techniques in person.",
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
        text: "For every batch, directly confirm legal-adult status, clothed/non-explicit scope, and four separate current permissions: the depicted activity, recording, one upload of selected stills with generic frame labels, and the generated output's recipient, use, sharing, and deletion plan. Prefer equipment-only, non-identifying frames; exclude faces, intimate contact, tattoos, screens, mail, and room details. New journal entries store text, not captures. xAI may retain inputs and outputs under workspace settings, and withdrawal cannot recall a request already transmitted. If any attestation is absent or withdrawn, keep the camera off and delete the local batch.",
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
        text: "Jute, hemp, cotton, and synthetics differ in feel, stretch, friction, maintenance, and failure behavior. A fiber label, diameter, appearance, or familiar knot does not establish condition or suitability for restraint or person-bearing use. Keep app-guided practice ground-level and non-loaded, inspect before each use, and obtain hands-on guidance for body application.",
      },
      {
        type: "ul",
        items: [
          "Choose practice material using the maker's documented purpose, care, and retirement guidance; a common label or dimension is not a safety rating.",
          "Do not heat, oil, wash, or otherwise condition rope from generic app instructions. Follow the specific manufacturer's instructions and fire-safety warnings.",
          "Retire cut, melted, contaminated, damaged, or uncertain material from body use; do not rely on appearance alone.",
        ],
      },
    ],
  },
  {
    slug: "suspension-reality",
    title: "Suspension Reality",
    section: "risk",
    minutes: 6,
    summary: "Why all load-bearing rope is routed to qualified in-person instruction.",
    related: ["partial-suspension", "hip-harness", "emergency-stop"],
    blocks: [
      {
        type: "p",
        text: "Partial or full suspension, inversion, dynamic transitions, anchors, and loaded rope are high-consequence activities. This app does not teach or validate their construction, placement, load path, equipment, or emergency release. Use a qualified in-person instructor with hands-on emergency practice. For app-based learning, stay with a clothed, ground-level, non-loaded rehearsal.",
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
        text: "If sexual activity is part of a scene, negotiate it separately from restraint, including barriers, fluids, recording, observers, stop channels, and the ability to withdraw from either activity without accepting a substitute. Combining restraint with penetration or machinery increases fall, friction, mobility, and rapid-release risks; this app does not provide a configuration. Never leave someone restrained or fall asleep before all restraint is removed.",
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
        text: "Warm up voluntarily and unrestrained within an ordinary, pain-free range. Do not force flexibility or use a fixed routine, massage, photograph, or range-of-motion snapshot as clearance for a restrictive position. High-consequence forms require qualified hands-on instruction.",
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
        text: "Store, clean, dry, condition, inspect, and retire rope according to the specific manufacturer's instructions. Do not apply generic heat, oil, washing, or strength-restoration advice. Cut, melted, contaminated, damaged, or uncertain material is not cleared for body use by looking normal; retire it conservatively.",
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
        text: "Furniture and household fixtures are not established load paths. This app cannot assess structure, installation, capacity, redundancy, or condition from a description or image. Keep app-guided practice ground-level and non-loaded; route any anchor or load-bearing question to qualified in-person instruction and appropriate structural expertise.",
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
        text: "An image cannot distinguish an expected mark from injury. Stop and assess directly. Call emergency services for chest pain, unresponsiveness, abnormal breathing, severe confusion, collapse, or another emergency sign. Persistent or worsening weakness, numbness, severe pain, swelling, temperature change, blistering, or broken skin warrants prompt medical assessment.",
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
        text: "Time ranges in this library are planning estimates, never safe-duration guarantees. Risk can change immediately with position, movement, construction, health, communication, or equipment. A reminder prompts a direct check; it is not permission to wait, continue, or escalate.",
      },
    ],
  },
  {
    slug: "furniture-not-hardpoints",
    title: "Furniture Is Not a Hardpoint",
    section: "risk",
    minutes: 6,
    summary:
      "A swing, pole, cross, table, or bench is not a verified person-bearing rope system, and a camera cannot establish that it is one.",
    related: ["hard-limits", "emergency-stop"],
    blocks: [
      { type: "h", text: "What an equipment label cannot prove" },
      {
        type: "p",
        text: "Household and specialty furniture may be useful for unrestrained support, but appearance, marketing, a household test, or a photograph cannot establish installation, condition, capacity, redundancy, or a safe load path. Keep app-guided activity unoccupied or ground-level and non-loaded.",
      },
      {
        type: "ul",
        items: [
          "Massage table or bench — furniture, not an anchor; a face opening is never a restraint point.",
          "Cross — an arms-up restraint can change risk quickly and requires qualified hands-on instruction.",
          "Swing — do not add rope loading or treat shared hardware as a rigging system.",
          "Pole — do not attach a person with rope or treat a dance-pole installation as an anchor.",
          "Any proposed person-bearing use — route to qualified in-person instruction and appropriate structural expertise.",
        ],
      },
      {
        type: "warn",
        text: "Knotty does not coach attachment, loading, anchors, uplines, or emergency release from furniture. Use unoccupied equipment inspection in Studio and seek qualified in-person guidance before any person-bearing use.",
      },
    ],
  },
  {
    slug: "machine-and-rope",
    title: "Machines, Large Toys, and Bound Hips",
    section: "scene",
    minutes: 7,
    summary:
      "Combining powered equipment, large toys, and restraint can remove ordinary escape and communication options; this app does not provide a configuration.",
    related: ["safewords", "circulation", "furniture-not-hardpoints"],
    blocks: [
      { type: "h", text: "Powered equipment does not monitor consent" },
      {
        type: "p",
        text: "Do not combine powered equipment with restraint from app instructions. If a machine is used in any adult scene, consent must remain specific and reversible, controls and emergency stop must stay immediately accessible, and unusual silence, freezing, distress, or loss of response requires an immediate stop.",
      },
      { type: "h", text: "Keep learning unrestrained" },
      {
        type: "p",
        text: "Do not use restraint to force position, depth, endurance, or continued participation. Learn equipment operation and stop controls while unrestrained, use the least restrictive alternative, and seek qualified in-person education for combined activities.",
      },
      {
        type: "warn",
        text: "Do not walk away while the machine is on. A machine does not hear yellow.",
      },
    ],
  },
];

export const ARTICLES: Article[] = [...CORE_ARTICLES, ...MORE_ARTICLES];

export function getArticle(slug: string) {
  return ARTICLES.find((a) => a.slug === slug);
}
