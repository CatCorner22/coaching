import type { Article } from "./types";

/**
 * The explanatory layer under the step-by-step ties.
 *
 * The steps in `guided-ties.ts` tell you what to do. These tell you why, at the
 * level of mechanism, because a rigger who understands what is actually
 * happening to tissue under a rope makes better decisions in the situations no
 * instruction anticipated — and those are the situations that matter.
 *
 * Written to be over-explained rather than under-explained. Where a claim is
 * commonly believed and wrong, it is named and contradicted directly instead of
 * being quietly omitted, because a reader who has already met the wrong version
 * needs it addressed rather than avoided.
 */
export const TECHNIQUE_ARTICLES: Article[] = [
  {
    slug: "how-rope-injures",
    title: "How Rope Actually Injures People",
    section: "body",
    minutes: 12,
    summary:
      "Four mechanisms, in order of how often they cause harm. Understanding these makes every other rule in this app obvious rather than arbitrary.",
    related: ["nerve-atlas", "circulation-vs-nerve", "single-column"],
    blocks: [
      {
        type: "p",
        text: "Almost every safety rule in rope is downstream of one of four mechanisms. Learn the mechanisms and you stop needing to memorise the rules, because you can derive them — including for the situation nobody wrote a rule about, which is the one you will eventually be in.",
      },
      {
        type: "h",
        text: "1 · Nerve compression — by far the most common",
      },
      {
        type: "p",
        text: "This is the injury of rope bondage. Not circulation, not falls, not rope burn: nerve compression, by a wide margin, and it is the one that lasts. A nerve is a cable running through tissue, and where it passes close to the surface with little padding over it — often against bone — sustained pressure squashes it. Squashed long enough or hard enough, it stops conducting properly. The result is numbness, tingling, weakness, or a limb that will not do what it is told, and recovery takes anywhere from hours to many months.",
      },
      {
        type: "callout",
        title: "The fact that makes this dangerous",
        text: "Nerve compression does not require the blood supply to be cut off. A rope can leave a hand pink, warm, and with a normal pulse while it is crushing the nerve beside it. This is why colour checks, warmth checks and capillary-refill checks do not detect the injury they are used to detect — they are measuring an entirely different system.",
      },
      {
        type: "p",
        text: "Two properties make it worse. It is often painless while it is happening — the early sign is loss of sensation, not pain, so the person may notice nothing until function is already affected. And it can present hours later: a hand that was fine on the night and weak in the morning is a well-documented pattern, which is why every guided tie here asks you to check again the next day.",
      },
      {
        type: "h",
        text: "What actually reduces it",
      },
      {
        type: "ul",
        items: [
          "Width. Two flat wraps spread the same force over twice the area of one, and a doubled rope lying flat spreads it over twice the area of a twisted one. Width is the single biggest lever you have.",
          "Placement on muscle rather than over bone or a joint. Muscle is padding; bone is an anvil.",
          "Less tension. Rope holds by wrapping and friction. Pulling harder buys you very little grip and a great deal of pressure.",
          "Time. Compression is dose-dependent — pressure multiplied by duration. A tie that is fine for ten minutes is not automatically fine for an hour.",
          "Movement. Position changes redistribute pressure. Someone held perfectly still is at more risk than someone shifting about, which is one of several reasons immobility is its own risk factor.",
        ],
      },
      {
        type: "h",
        text: "2 · Positional compromise of breathing",
      },
      {
        type: "p",
        text: "Breathing is mechanical: the chest and diaphragm have to move. A position or a wrap that prevents that movement reduces breathing without obstructing the airway at all — the person is not choking, they simply cannot ventilate properly. This develops gradually, produces confusion and distress before it produces anything obvious, and can be fatal. It is the reason compressive folded positions, chest constriction, and prone restraint are treated as a category apart, and the reason this app locks breath play and suspension to no.",
      },
      {
        type: "h",
        text: "3 · Circulation restriction",
      },
      {
        type: "p",
        text: "Genuine circulation restriction is less common than people assume and generally more forgiving than nerve compression, because it announces itself: colour change, coldness, throbbing, and pain. A hand that has gone dusky and cold is telling you clearly. Take the rope off — but do not congratulate yourself on a system that works, because the far more dangerous nerve injury produces none of those signals.",
      },
      {
        type: "h",
        text: "4 · Mechanical events",
      },
      {
        type: "p",
        text: "Falls, collisions, and rope burn. A restrained person cannot break a fall, cannot put a hand out, and cannot roll — so an ordinary stumble becomes a head injury. Rope moving fast across skin under tension burns it. These are the most obvious risks and the ones people plan for best, which is roughly why they cause the least harm of the four.",
      },
      {
        type: "warn",
        text: "The ranking matters. Beginners spend their attention on the mechanism that is most visible (circulation) and least attention on the one that actually causes lasting injury (nerve compression), because the second one is silent. If you take one thing from this entry: pink and warm means nothing.",
      },
    ],
  },
  {
    slug: "tension-mental-model",
    title: "Tension: You Are Aiming for Reversible, Not Tight",
    section: "craft",
    minutes: 8,
    summary:
      "Nearly every beginner mistake is a version of pulling too hard. Here is what the rope is actually doing, and how to know when to stop pulling.",
    related: ["how-rope-injures", "single-column", "reading-the-rope"],
    blocks: [
      {
        type: "p",
        text: "New riggers pull too hard. Not through carelessness — through a completely reasonable mental model, which is that rope holds things by squeezing them. It does not, and replacing that model is probably the highest-value thing on this page.",
      },
      {
        type: "h",
        text: "What is actually holding",
      },
      {
        type: "p",
        text: "Three things hold a tie together, and tension is the least important of them. **Geometry** — a loop that goes all the way around a limb cannot come off past a hand or a foot regardless of how loose it is. **Friction** — rope against rope generates enormous resistance; a few wraps and a turn will hold against a pull that would take real effort to produce. **Structure** — a knot that locks to the wraps means force applied to the standing part is absorbed by the knot rather than transmitted to the limb.",
      },
      {
        type: "p",
        text: "Tension's actual job is small: stopping the wraps sliding along the limb, and keeping the pattern tidy. That is all. A wrap that stays where you put it is at correct tension, and everything past that point is pressure you are adding to tissue for no return.",
      },
      {
        type: "h",
        text: "How to know when to stop pulling",
      },
      {
        type: "ul",
        items: [
          "Draw the slack out slowly and stop the instant the wraps hold their position without being held. That is the target, and it is much earlier than instinct suggests.",
          "It should still be able to slide slightly along the limb if you push it deliberately. If it cannot slide at all, it is tighter than it needs to be.",
          "There should be visible daylight between rope and skin in places. A wrap pressed evenly into the skin all the way round has gone past correct.",
          "You should be able to work a finger under it without effort. Note carefully: this is a description of what correct looks like, not a test that it is safe. A rope can be finger-loose and still compressing a nerve underneath. It tells you when you are too tight; it never tells you that you are fine.",
        ],
      },
      {
        type: "h",
        text: "Where the pull comes from",
      },
      {
        type: "p",
        text: "Pull along the line of the rope, not away from the body. Pulling outward lifts the wrap and then drops it back down harder, which both moves it out of position and spikes the pressure. Take the slack out by drawing the rope through in the direction it already runs, and let it settle rather than seating it with force.",
      },
      {
        type: "callout",
        title: "The tell you can watch for in yourself",
        text: "If you are bracing — leaning back, planting a foot, using bodyweight — you are pulling harder than any tie in this app requires. Rope work should look and feel unhurried, and your hands should be doing the work rather than your back.",
      },
      {
        type: "h",
        text: "Why tight feels right",
      },
      {
        type: "p",
        text: "Because tight feels secure, and because a loose-looking tie feels like it is not working. Both feelings are misleading. A well-built loose tie is more secure than a badly built tight one, since the security is coming from the structure either way. And there is a second pull: tightness reads as intensity, so the tie gets tightened to make the scene feel like more. If intensity is what you are after, get it from what you do and say rather than from pressure — that route has no injury attached to it.",
      },
    ],
  },
  {
    slug: "reading-the-rope",
    title: "Reading and Dressing Rope",
    section: "craft",
    minutes: 7,
    summary:
      "Dressing is not tidiness. A twisted strand halves the contact width and doubles the pressure on that line.",
    related: ["tension-mental-model", "how-rope-injures", "rope-materials"],
    blocks: [
      {
        type: "p",
        text: "Dressing a tie means making the rope lie the way it is supposed to: strands flat and side by side, wraps parallel and evenly spaced, no crossings, no twists. It is usually presented as an aesthetic step and dismissed accordingly. It is actually a load-spreading step, and it is one of the cheapest safety improvements available.",
      },
      {
        type: "h",
        text: "The arithmetic",
      },
      {
        type: "p",
        text: "You work with the rope doubled, so each wrap is two strands. Lying flat, side by side, they present roughly twice the contact width of a single strand. Let one twist over the other and that contact collapses to a single strand's width — and since pressure is force divided by area, the same tension now presses roughly twice as hard along a narrower line. A twisted strand is not untidy. It is a pressure ridge you built by accident.",
      },
      {
        type: "h",
        text: "What to look for",
      },
      {
        type: "ul",
        items: [
          "Twists. Run a finger along each wrap; a twist is easier to feel than to see, and it feels like a ridge where there should be a flat band.",
          "Crossings. Two wraps that cross each other concentrate at the crossing point in the same way, and worse because they are pressing on each other.",
          "Uneven spacing. Wraps bunched together behave as one thick band rather than several distributed ones, which loses you the width you laid them for.",
          "Rope on a joint, a bony point, or a scar. Move it before you finish, not after.",
          "Anything that has migrated since you laid it. Migration is what happens between checks, and it is the main reason to look again rather than assuming the tie is as you left it.",
        ],
      },
      {
        type: "h",
        text: "Managing the rope you are not using yet",
      },
      {
        type: "p",
        text: "Most of an eight-metre rope is not in the tie for most of the time, and a working end that has been dropped, dragged, or tangled is a rope you will be tempted to yank free. Keep the unused length gathered in your non-dominant hand or over a shoulder, and feed it out as needed. Never let a long tail lie across the floor where either of you might stand on it, and never let it lie across her neck, not even briefly, not even while you are reaching for something.",
      },
      {
        type: "callout",
        title: "Dress as you go",
        text: "Flattening a wrap is easy before the next one goes over it and awkward afterwards. Dressing at the end is a habit that produces ties which are dressed everywhere except underneath.",
      },
    ],
  },
  {
    slug: "getting-rope-off",
    title: "Getting Rope Off Fast",
    section: "risk",
    minutes: 9,
    summary:
      "The skill you will need on the worst night. Rehearse it before the first wrap of every new structure, and rehearse it with her too.",
    related: ["emergency-stop", "two-person-scene", "single-column"],
    blocks: [
      {
        type: "p",
        text: "Everything else in this app is about not needing this. This is what you do when you need it anyway, and it is the one skill worth being genuinely practised at rather than merely informed about.",
      },
      {
        type: "h",
        text: "Shears: which, where, how",
      },
      {
        type: "ul",
        items: [
          "Blunt-nosed safety shears — the kind paramedics carry, sometimes sold as tuff cuts or trauma shears. The blunt tip is the whole point: it slides between rope and skin without cutting the skin. Scissors, kitchen knives and pocket knives are not substitutes and have injured people being used as ones.",
          "Where: within reach of your dominant hand from where you actually sit or kneel, without standing up and without looking. Not in a drawer. Not in the bag they came in. Test it with your eyes closed; if it took more than a couple of seconds, move them.",
          "A second pair within her reach. If you are the emergency — you faint, you are hurt, you have gone to answer the door and fallen down the stairs — she needs her own way out. This is not a theoretical scenario and it is the single strongest argument for the pair she can reach.",
          "Practise the cut on scrap rope of the same type. Knowing how much force it takes, and how the blades bite, removes the hesitation you would otherwise have the first time.",
        ],
      },
      {
        type: "h",
        text: "How to cut",
      },
      {
        type: "p",
        text: "Slide the blunt tip under the rope with the flat of the blade against the skin, then cut. Cut the rope, never the knot: a knot is the thickest, tightest, most compressed part of the whole structure, and sawing at it takes far longer than cutting a single span a few inches away. Look for a place where a single doubled strand runs clear of the body with a gap under it — those spans are your cut points, and it is worth identifying them while you are building the tie rather than while you are trying to undo it.",
      },
      {
        type: "h",
        text: "Cut in the right order",
      },
      {
        type: "ul",
        items: [
          "Whatever is affecting breathing, first. Always, without exception, whatever else is happening.",
          "Then whatever is taking weight or holding a position she cannot get out of.",
          "Then the limb that has the symptom.",
          "Then everything else, at a normal pace.",
        ],
      },
      {
        type: "p",
        text: "Support before you cut when a position depends on the rope. Cutting the thing that is holding someone up drops them, and a fall onto a hard floor is a worse injury than the one you were responding to. Take the weight, then cut.",
      },
      {
        type: "h",
        text: "Untying, and when not to bother",
      },
      {
        type: "p",
        text: "For ordinary removal, untie — it is practice, it saves rope, and reversing a structure you built teaches you how it works. For anything urgent, cut. The single commonest error in a real incident is trying to untie something because cutting feels wasteful or dramatic, and losing a minute to fumbling at a knot that has tightened under load. Rope is cheap. Decide in advance that you are willing to destroy a rope, so the decision is already made when you need it.",
      },
      {
        type: "warn",
        text: "If someone is unresponsive, not breathing normally, or has a suspected head or spinal injury, call emergency services first, then release only what is affecting breathing or circulation. Do not spend minutes tidily removing rope before making the call.",
      },
    ],
  },
  {
    slug: "the-check-that-works",
    title: "The Check-in That Works, and the Four That Do Not",
    section: "body",
    minutes: 9,
    summary:
      "Two fingers, pink fingertips, wiggle your thumb, capillary refill — all widely taught, all measuring the wrong system. Here is what to do instead.",
    related: ["how-rope-injures", "check-in-script", "circulation-vs-nerve"],
    blocks: [
      {
        type: "p",
        text: "Four checks appear in almost every introduction to rope. All four are real practices, taught in good faith, by people who care about safety. All four are poor detectors of the injury that actually happens, and the confidence they produce is worse than no check at all — because a check that reassures you is a check that stops you looking.",
      },
      {
        type: "h",
        text: "Why they fail",
      },
      {
        type: "ul",
        items: [
          "**Two fingers under the rope.** Measures the gap at the point you chose to measure. Pressure is not uniform around a wrap, a nerve is compressed by what is happening at one specific spot, and your fingers are not there. A tie can pass this and be compressing a nerve an inch away.",
          "**Pink and warm fingertips.** Measures blood supply. Nerve compression does not require blood supply to be interrupted, so this stays perfectly normal while the damage happens. This is the most confidently wrong of the four.",
          "**Capillary refill.** Same system, same problem, with a number attached — which makes it feel more rigorous and no more relevant.",
          "**Can you wiggle your fingers.** Weakness is a *late* sign of nerve compression, arriving after sensation is already affected. Passing this check means the injury has not progressed far, not that it is not underway.",
        ],
      },
      {
        type: "callout",
        title: "The pattern",
        text: "Three of the four measure circulation. Circulation is not the mechanism. The fourth measures a symptom that appears after the damage is already established.",
      },
      {
        type: "h",
        text: "What to do instead",
      },
      {
        type: "p",
        text: "Ask about *sensation*, ask for *description* rather than assessment, and listen for *change over time*. The person in the rope is the only instrument that can detect this, and the whole job is getting an honest reading out of her rather than a reflex.",
      },
      {
        type: "ul",
        items: [
          "\"What can you feel in your fingertips?\" — needs a description, cannot be answered with yes.",
          "\"Has anything changed since I last asked?\" — change is the signal. A sensation that was there ten minutes ago and is still the same is far less interesting than a new one.",
          "\"Is either hand different from the other?\" — comparison is more sensitive than absolute judgement, and asymmetry is often the first thing noticeable.",
          "\"Is there anywhere that feels less than it should?\" — invites reporting a *reduction*, which is the actual early sign and the one people do not spontaneously mention because absence is hard to notice.",
        ],
      },
      {
        type: "h",
        text: "What means stop, immediately",
      },
      {
        type: "ul",
        items: [
          "Numbness, or a patch that feels dulled, muffled, or asleep.",
          "Tingling, pins and needles, buzzing, or anything electrical.",
          "Weakness, or a hand or foot that will not do what it is told.",
          "Sharp, shooting, burning or radiating pain — distinct from the dull ache of a held position.",
          "Anything that appeared suddenly rather than building gradually.",
          "Anything either of you is uncertain about. Uncertainty is a reason to release, not a reason to look more closely for a minute.",
        ],
      },
      {
        type: "p",
        text: "The rope comes off first and the conversation happens afterwards. Discussing a reported symptom while the rope is still on trades minutes of compression for a conversation that would be identical two minutes later.",
      },
      {
        type: "h",
        text: "The cadence",
      },
      {
        type: "p",
        text: "Set an interval and keep it even when things are going well — especially then, because a scene going well is precisely when time distorts and attention narrows. Rig mode has a countdown for this. And ask again after the rope is off, again an hour later, and again the next morning: late presentation is common enough that a check the following day is part of the tie rather than an afterthought.",
      },
      {
        type: "warn",
        text: "Anything still numb, weak, altered or painful the next day is a doctor's question. Not a wait-and-see, not a rest-it-and-check-next-week. Early assessment of a compression injury genuinely changes what can be done about it.",
      },
    ],
  },
  {
    slug: "first-ten-sessions",
    title: "Your First Ten Sessions",
    section: "craft",
    minutes: 8,
    summary:
      "A concrete progression from never having tied anything to a decorative harness — and an honest account of where it stops.",
    related: ["single-column", "double-column", "karada"],
    blocks: [
      {
        type: "p",
        text: "The commonest way to get hurt in rope is to skip. Not recklessness — enthusiasm, plus tutorials that make the elaborate ties look attainable. Here is a progression that gets you somewhere real without skipping, written as sessions rather than weeks because pace should be yours.",
      },
      {
        type: "h",
        text: "Sessions 1–2 · Rope in your hands, nobody in it",
      },
      {
        type: "p",
        text: "Find the bight, work doubled, keep the working end managed. Tie the single column structure on a chair leg or a rolled towel, twenty times, until your hands do it without your attention. Do the shears drill: both of you, eyes closed, under two seconds. Cut a scrap of rope so you know the force. This sounds like homework and it is the reason session three goes well.",
      },
      {
        type: "h",
        text: "Sessions 3–4 · One cuff, on a forearm",
      },
      {
        type: "p",
        text: "A single column on one forearm, attached to nothing. Tie it, test that it does not close, dress it, ask her to describe it, take it off, ask again in an hour. Then again the next day. That is the entire session and it is enough — the goal is that both of you become fluent at the conversation, not just at the knot.",
      },
      {
        type: "h",
        text: "Sessions 5–6 · Two cuffs, still unconnected",
      },
      {
        type: "p",
        text: "One on each forearm. She can still move both arms; you are practising doing the same thing twice and asking about two limbs separately. Introduce the timer. Notice how much longer twenty minutes is than it feels.",
      },
      {
        type: "h",
        text: "Sessions 7–8 · Double column, wrists in front",
      },
      {
        type: "p",
        text: "The first thing that genuinely restrains. In front, not behind — she can see her hands, bring them to her face, and break a fall. Learn the cinch and learn to see it in the gap. Keep the durations short and the questions frequent, and expect to take it apart and redo it; that is the session working, not failing.",
      },
      {
        type: "h",
        text: "Sessions 9–10 · A karada",
      },
      {
        type: "p",
        text: "Rope on a torso, nothing restrained, nothing loaded. This is the session that takes an hour and looks like the pictures. It is also where you find out whether your spacing is even, which no amount of limb work reveals.",
      },
      {
        type: "h",
        text: "And then — honestly — a class",
      },
      {
        type: "p",
        text: "The next things you will want are chest harnesses and box ties. Those are where rope nerve injury actually clusters, they fail without a visible warning, and the failure costs weeks to months of hand function. This app will not teach them and no written source is a good medium for them. A single weekend workshop with a competent teacher, who can watch your hands and see her body, will take you further than a year of reading — and it is the difference between the two of you having a hobby and one of you having a nerve injury.",
      },
      {
        type: "callout",
        title: "The pace question",
        text: "Ten sessions is not ten evenings. If a session goes badly, do it again rather than moving on. There is no schedule, nobody is watching, and the only thing rushing buys is the chance to skip the session that would have caught the habit you are building wrong.",
      },
      {
        type: "warn",
        text: "Do not learn a tie from a video and try it the same night. The gap between watching a competent person and having competent hands is the gap this whole progression exists to cross.",
      },
    ],
  },
];
