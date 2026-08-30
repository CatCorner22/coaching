import type { Tie, TieStep } from "./types";
import { guidedPractice } from "./tie-factories";

/**
 * The ties this app actually teaches, step by step.
 *
 * Everything here is written to be followed by someone who has never done it,
 * with a partner, in a room, at eleven at night, without a class to fall back
 * on. That means saying the obvious parts out loud — where your hands go, what
 * it should look like, what it feels like when it is wrong — because the parts
 * people get wrong are almost never the clever parts.
 *
 * Two rules run through all of it.
 *
 * **Nothing is a clearance.** Every check below tells you when to stop. None of
 * them tells you it is safe to carry on, because no check can. The classic
 * ones — two fingers under the rope, pink fingertips, can she wiggle her
 * thumb — are all real things people do and none of them detects the injury
 * they are believed to detect. A nerve compresses without changing circulation,
 * so colour and warmth stay normal while the damage happens. Use the checks to
 * catch problems, never to grant permission.
 *
 * **You are aiming for reversible, not tight.** Almost every mistake a beginner
 * makes is a version of pulling harder than necessary. Rope holds by wrapping
 * and friction, not by squeezing.
 */

const RELEASE_REHEARSAL: TieStep = {
  title: "Before any rope: rehearse getting it off",
  rigger:
    "Do this before the first wrap of the first session, and again any time you use a new structure. Put your safety shears where your dominant hand reaches them without looking and without standing up — not in a drawer, not across the room, not in the bag they came in. Now close your eyes, reach for them, and open them. If that took more than about two seconds, move them and try again. Then practise the cut itself on a scrap of the same rope: blunt-nosed shears go flat against the skin with the blunt tip sliding underneath, and you cut the rope, never the knot. Cutting a knot means sawing at the thickest, tightest part of the structure while somebody waits.",
  bottom:
    "Watch him do it, then do it yourself. You need to know where the shears are and how they work, because the emergency this app worries about most is the one where he is the person who cannot act — he faints, he is hurt, he is simply not in the room. If you cannot reach the shears yourself, the tie you are about to do is one you should not be in.",
  check:
    "Both of you can find the shears blind, in under two seconds, from where you will actually be sitting or lying. Both of you have cut a piece of rope with them at least once and know how much force it takes.",
  speak: "Find the shears with your eyes closed. Both of you.",
  expected: { wrapBands: 0, pose: "stand", view: "front", handsVisible: true, neckClear: true },
  wraps: [],
};

export const GUIDED_TIES: Tie[] = [
  guidedPractice({
    slug: "single-column",
    name: "Single Column",
    jp: "一本縛り",
    summary:
      "The first structure to learn and the one everything else is built from: a cuff around one limb that holds without closing. Taught here in full, step by step, from the first fold of the rope to taking it off.",
    level: "foundation",
    minutes: [10, 25],
    ropes: [{ lengthM: 8, count: 1 }],
    knots: ["somerville-bowline"],
    nerves: ["ulnar", "radial", "median"],
    intent: ["foundation", "craft", "limb"],
    goal: "Tie a cuff on one limb that will not tighten when the rope is pulled, and be able to take it off fast.",
    why: "Every other tie in the vocabulary is single columns and double columns joined together, so this is not a beginner tie you graduate from — it is the thing you will still be doing in ten years. The whole skill is one idea: a cuff that stays the size you made it, no matter which direction the rope is pulled afterwards. A cuff that closes when pulled is the single most common way beginners injure someone, and the difference between the two is entirely in how the rope turns at the end.",
    stop: [
      "The cuff got smaller when you pulled on the standing rope — untie it completely and start again rather than loosening it",
    ],
    mistakes: [
      {
        title: "Making it tight",
        body: "The commonest beginner error by a distance. A single column holds by wrapping around a limb, not by gripping it. If you find yourself pulling to make it hold, the structure is wrong and tightening is hiding the fault rather than fixing it. Aim for a cuff that would slide off over the hand if the hand were not in the way — snug enough not to travel, loose enough that you could work a finger under it without effort. And note that the finger is how it should look, not a test that it is safe.",
      },
      {
        title: "Wrapping over a joint",
        body: "Rope belongs on the middle of a limb segment, not across a wrist, elbow, knee or ankle joint. Joints move, so rope on one changes position every time she does; joints are also where nerves run closest to the surface with the least tissue over them. Put the cuff on the forearm rather than the wrist crease, and on the calf rather than the ankle bone.",
      },
      {
        title: "Two wraps that have crossed",
        body: "The wraps should lie side by side like two rings, flat, not crossed over each other. A crossing turns two broad bands into one narrow ridge, and a narrow ridge concentrates all the pressure into a line. If they have crossed, undo them and lay them again — you cannot fix a crossed wrap by pulling it.",
      },
      {
        title: "Leaving no tail",
        body: "Run out of rope at the knot and you have a structure you cannot tie off and cannot use to go anywhere. Start with far more rope than you think you need; a beginner's single column on a forearm wants most of a standard length.",
      },
    ],
    variations: [
      {
        name: "On an ankle or calf",
        body: "Identical structure, placed on the calf rather than across the ankle bone. Legs are thicker so you will use more rope, and the peroneal nerve runs close to the surface just below the outside of the knee — so keep well away from the knee itself, lower down the calf where there is more muscle between the rope and anything important.",
      },
      {
        name: "As a decorative cuff",
        body: "The same cuff, tied and left, with no second rope and nothing attached. This is the version to spend your first several sessions on: it gives you all the practice in structure, tension and removal with none of the questions that come from joining it to anything.",
      },
      {
        name: "Two of them, unconnected",
        body: "A cuff on each forearm, not joined to each other. Visually it reads as restraint and functionally she can still move both arms freely and independently, which makes it a genuinely useful step between decoration and anything that actually holds.",
      },
    ],
    steps: [
      RELEASE_REHEARSAL,
      {
        title: "1 · Prepare the rope and find the middle",
        rigger:
          "Take one rope and find its midpoint by holding both ends together and running your hands down the doubled rope until you reach the fold. That fold is called the bight, and from here on you work with the rope doubled — every wrap is two strands travelling together, which is what makes the pressure broad instead of narrow. Shake the rope out so it is not twisted on itself. If it is coiled, uncoil it fully; a rope that snags halfway through a wrap is a rope you will be tempted to yank.",
        bottom:
          "Sit or lie somewhere you are comfortable and could stay comfortable for twenty minutes. Get this right now rather than adjusting later, because moving after the rope is on changes where the rope sits. Say if you are cold — you will get colder once you stop moving, and being cold makes everything harder to feel and report.",
        check:
          "The rope is doubled, untwisted, and long enough that the bight reaches the limb with the great majority of the length still in your hand.",
        speak: "Find the middle of the rope and work doubled from here.",
        expected: { wrapBands: 0, pose: "sit", view: "front", handsVisible: true, neckClear: true },
        wraps: [],
      },
      {
        title: "2 · Choose where the cuff goes, and say why out loud",
        rigger:
          "Pick the middle of a limb segment — the meat of the forearm, not the wrist; the calf, not the ankle. Say out loud where you are putting it and why, every time, for at least your first dozen sessions. Saying it is not a ritual: it is the thing that catches you about to put rope somewhere you would not have chosen if you had thought about it. Then run your fingers over the spot. You are feeling for the bony bits, because bone with little tissue over it is where rope concentrates pressure, and you want the wraps sitting on muscle instead.",
        bottom:
          "Tell him if that spot has any history — an old fracture, a joint that dislocates, surgery, a numb patch, anything that already tingles when you sleep on it. This is not a small detail to mention later. Nerve injury from rope happens preferentially where something was already vulnerable, and he cannot see any of that.",
        check:
          "The chosen spot is on the fleshy middle of a limb segment, not on or across a joint, and neither of you knows anything about that spot that should rule it out.",
        speak: "Middle of the forearm, not the wrist. Say where it is going and why.",
        expected: { wrapBands: 0, pose: "sit", view: "front", handsVisible: true, neckClear: true },
        wraps: [],
      },
      {
        title: "3 · Lay the first two wraps",
        rigger:
          "Hold the bight against the limb and take the doubled rope around it twice, laying the second wrap beside the first rather than on top of it. Two wraps, side by side, flat. Do not pull them snug yet — leave them visibly loose, loose enough to look wrong. You will take the slack out at the end, and a wrap you laid loose and then adjusted is far better than one you laid tight and then tried to loosen. Keep about a hand's width of the bight sticking out past the wraps; that is what you will need in a moment.",
        bottom:
          "Hold still and let your arm rest heavy rather than helping. Tensing changes the size of your forearm, so a cuff that fits a tensed arm is loose on a relaxed one, and the arm always relaxes eventually.",
        check:
          "Two wraps, lying side by side, flat, not crossed, visibly slack. The bight is still accessible.",
        speak: "Two wraps, side by side, deliberately loose.",
        expected: { wrapBands: 2, pose: "sit", view: "front", handsVisible: true, neckClear: true },
        wraps: [{ kind: "cuff", at: "lw" }],
      },
      {
        title: "4 · Take the slack out slowly, and watch her face",
        rigger:
          "Now draw the wraps in, slowly, a little at a time, keeping them flat and beside each other as they close. Stop as soon as they stay put on their own without being held. That is the correct amount, and it is much less than most people expect — the wraps should still slide a little along the limb if you push them, and there should be visible daylight between rope and skin in places. Watch her face while you do this, not the rope. Faces report discomfort about a second before mouths do.",
        bottom:
          "Say something as it closes. Not \"fine\" — describe it: where you feel it, whether it is even all the way round, whether one wrap bites more than the other. He cannot feel any of this and is entirely dependent on your description. If one wrap is doing all the work, say so now while it is easy to fix.",
        check:
          "The wraps stay in place unheld, still move slightly when pushed along the limb, and she can describe an even pressure rather than a line or a bite.",
        speak: "Take the slack out slowly. Watch her face, not the rope.",
        expected: { wrapBands: 2, pose: "sit", view: "front", handsVisible: true, neckClear: true },
        wraps: [],
      },
      {
        title: "5 · The turn that makes it non-cinching",
        rigger:
          "This step is the whole tie. Everything before it was wrapping; this is what decides whether you have made a cuff or a noose. Pass the bight up underneath the wraps you just laid so it emerges on the far side of them, then bring it back over the top of the wraps and down through the space it came out of — so that the bight is now locked around the wraps themselves rather than around the limb. That is the Somerville bowline, and its point is that pulling the standing rope now pulls on the knot, which is anchored to the wraps, instead of pulling the wraps closed around the limb. Follow the knot entry for the detailed hand movements; what matters here is understanding what it is for.",
        bottom:
          "Stay still through this bit. It involves the most fiddling and it is where a rigger concentrating on his hands stops watching your face. If anything changes while he is working — a pinch, a wrap riding up, a sensation that was not there a minute ago — say it immediately, even though it feels like interrupting.",
        check:
          "The knot sits on the wraps, not against skin, and the structure looks like a cuff with a knot on the outside of it.",
        speak: "The knot locks to the wraps, not around the limb.",
        expected: { wrapBands: 2, pose: "sit", view: "front", handsVisible: true, neckClear: true },
        wraps: [],
      },
      {
        title: "6 · Test it in the direction it will actually be pulled",
        rigger:
          "Take the standing part — the long remainder running away from the knot — and pull it steadily, firmly, in the direction it would go if it were attached to something. Now watch the cuff. It must not get smaller. Not a little, not once, not \"only when I really pull\". If it closes at all, the turn in the previous step is wrong: untie the whole thing and do it again rather than loosening it and hoping. This is the single most important check in the whole tie and it takes three seconds.",
        bottom:
          "Tell him what you feel during the pull, not after. A cuff that closes will feel like a grip tightening rather than a tug travelling through. Say it while he is pulling, because that is the moment when the information is unambiguous.",
        check:
          "Pulling the standing part firmly, in several directions, does not reduce the size of the cuff at all.",
        speak: "Pull the standing part. The cuff must not get smaller.",
        expected: { wrapBands: 2, pose: "sit", view: "front", handsVisible: true, neckClear: true },
        wraps: [],
      },
      {
        title: "7 · Dress it, then look at it properly",
        rigger:
          "Dressing means making the rope lie the way it should: run a finger along each wrap and flatten any twist, so the two strands of the doubled rope sit side by side rather than one riding on top of the other. A twisted strand halves the contact width and doubles the pressure on that line, which is exactly the thing you spent the last five steps avoiding. Then stop and actually look. Two flat wraps, even spacing, knot outside the wraps, no rope crossing a joint, and a tail long enough to be useful.",
        bottom:
          "Look at it too, and move — flex your hand, rotate your forearm slowly, do the things you would do in the next twenty minutes. Rope that is fine still is not always fine moving. If a wrap bites when you rotate, that is worth fixing now rather than discovering in ten minutes.",
        check:
          "No twisted strands, no crossed wraps, no rope on a joint, and the cuff behaves the same when the limb moves as when it is still.",
        speak: "Flatten every twist, then look at the whole thing.",
        expected: { wrapBands: 2, pose: "sit", view: "front", handsVisible: true, neckClear: true },
        wraps: [],
      },
      {
        title: "8 · Set a clock, and keep asking",
        rigger:
          "Decide out loud how long this stays on, and set an actual timer — the Rig mode screen has one. Left to your own sense of time you will be wrong by a factor of two, always in the direction of longer. While it is on, ask her specific questions rather than \"are you okay\", which reliably produces a reflex yes: ask what her fingertips feel like, ask her to move her hand and say what that was like, ask whether anything has changed since you last asked. Change is the thing you are listening for. If she reports numbness, tingling, weakness or shooting pain, the rope comes off first and you discuss it afterwards.",
        bottom:
          "Report changes without being asked, including small ones and including ones you think are probably nothing. The whole system depends on you being the instrument, and an instrument that filters its readings to avoid spoiling the mood is not one he can use. Reporting is not a failure of anything.",
        check:
          "A timer is running, and you have asked at least one specific question that needed a real answer rather than a yes.",
        speak: "Set a timer. Ask what has changed, not whether she is okay.",
        expected: { wrapBands: 2, pose: "sit", view: "front", handsVisible: true, neckClear: true },
        wraps: [],
      },
      {
        title: "9 · Take it off, and check again tomorrow",
        rigger:
          "Undo it rather than cutting it — that is the whole point of having tied a reversible structure, and untying it is practice at the thing you will need to do quickly one day. Reverse the knot, unwrap, and keep hold of the rope so it does not drop. As it comes off, ask her to move everything that was wrapped and describe how each part feels. Then ask again in an hour, because compression symptoms very often show up late, and again the next morning. Anything still numb, weak, altered or painful the next day is a doctor, not a wait-and-see.",
        bottom:
          "Move everything deliberately and say what you notice, including things that seem trivial. A patch of skin that feels slightly different, a grip that is slightly weaker, a thumb that tingles — these are the early presentations of the injury that matters here, and they are easy to dismiss on the night and obvious in hindsight a week later.",
        check:
          "The rope is off, she has moved and described every wrapped part, and both of you have agreed to check again tomorrow morning.",
        speak: "Untie rather than cut. Ask again tomorrow.",
        expected: { wrapBands: 0, pose: "sit", view: "front", handsVisible: true, neckClear: true },
        wraps: [],
        // An empty `wraps` does not clear the cumulative figure (the route
        // draws steps.slice(0, i + 1)); the explicit empty media is what
        // "you have taken it off" should look like — the same override the
        // prop-drill strip-down step uses.
        media: [{ kind: "wraps" as const, wraps: [] }],
      },
    ],
  }),

  guidedPractice({
    slug: "double-column",
    name: "Double Column",
    jp: "二本縛り",
    summary:
      "Two limbs held side by side — wrists together, ankles together — using a cinch between them so neither column closes. The second structure to learn, and the first one that actually restrains.",
    level: "foundation",
    minutes: [12, 30],
    ropes: [{ lengthM: 8, count: 1 }],
    knots: ["wrap-cinch", "somerville-bowline"],
    nerves: ["ulnar", "radial", "median"],
    intent: ["foundation", "craft", "limb"],
    prereqs: ["single-column"],
    goal: "Hold two limbs side by side with a cinch between them, so neither column closes, and take it off fast.",
    why: "A single column holds one limb; a double column holds two together, which is the first thing in this catalog that genuinely restrains rather than decorates. The extra idea is the cinch: a turn of rope passed between the two limbs and pulled snug, which stops the wraps sliding into a single closing loop. Without a cinch, two limbs in one set of wraps is not a double column at all — it is a noose with two things in it, and it closes on both of them at once.",
    stop: [
      "The wraps have slid so both limbs are in one closing loop with nothing between them",
      "She reports the sensation in both limbs at once, which usually means the cinch has failed and the wraps are acting as a single band",
    ],
    mistakes: [
      {
        title: "No cinch, or a cinch that has slipped out",
        body: "The failure mode of this tie. Without rope passing between the limbs, the wraps behave as one loop around a single wider object and close on both limbs when pulled. Check for the cinch by looking for rope visibly passing through the gap between the two limbs — if you cannot see it there, it is not doing its job.",
      },
      {
        title: "Cinching so hard the limbs are pressed together",
        body: "The cinch exists to separate the wraps, not to clamp the limbs against each other. Pulling it hard grinds two wrists together, concentrates pressure exactly where the bones are closest to the surface, and makes a numb hand far more likely. Snug enough that the wraps cannot slide past it, and no more.",
      },
      {
        title: "Wrists crossed rather than parallel",
        body: "Crossed wrists put one directly on top of the other, so the upper one presses into the lower one with the rope's whole force focused through that crossing point. Parallel and side by side spreads the same load across two forearms. If she prefers the look of crossed wrists, that is a conversation for after you have done this parallel a dozen times.",
      },
      {
        title: "Forgetting that two limbs move independently",
        body: "One arm can shift, roll, or be leaned on while the other stays put, and that changes the fit on both. Recheck after any change of position — this tie goes out of adjustment in a way a single column does not.",
      },
    ],
    variations: [
      {
        name: "Ankles",
        body: "Same structure, more rope, and the calves rather than across the ankle bones. Ankles are the more forgiving version for a first attempt because the limbs are further apart and there is more muscle to work with.",
      },
      {
        name: "In front rather than behind",
        body: "Wrists in front is the version to learn on and the version to stay with for a long time. She can see what is happening, she can bring her hands to her own face, she can break a fall, and you can see her hands without moving. Hands behind the back removes all four of those and is a different risk conversation.",
      },
    ],
    steps: [
      RELEASE_REHEARSAL,
      {
        title: "1 · Position the two limbs parallel, with a gap",
        rigger:
          "Bring the two limbs together side by side, parallel, not crossed, with a small visible gap between them. The gap is not cosmetic — it is where the cinch is going to go, and if the limbs are pressed flat together there is nowhere for it to pass. Ask her to hold them in the position she would like to be held in, then take a moment to see whether that position is one a shoulder can stay in comfortably for the time you have in mind.",
        bottom:
          "Choose a position you could hold for a while without rope, then relax into it rather than holding it. Rope fitted around actively held limbs comes loose when you stop holding, and then it does not sit where he put it. Say now if either shoulder is complaining, because it will complain more later, not less.",
        check:
          "Two limbs, parallel, side by side, with a visible gap between them and both shoulders comfortable.",
        speak: "Parallel with a gap. Not crossed.",
        expected: { wrapBands: 0, pose: "sit", view: "front", handsVisible: true, neckClear: true },
        wraps: [],
      },
      {
        title: "2 · Two wraps around both, still loose",
        rigger:
          "With the rope doubled as before, take two wraps around both limbs together, laid side by side and flat, and again leave them visibly loose. Looser than you would for a single column, in fact, because you are about to add a cinch and the cinch takes up slack. A beginner who wraps tight and then cinches ends up with something considerably tighter than intended and no easy way back.",
        bottom:
          "Keep the gap between your limbs while he wraps. It is easy to let them drift together as you relax, and then there is nowhere for the cinch to pass.",
        check:
          "Two flat wraps around both limbs, visibly slack, with the gap between the limbs still open.",
        speak: "Two wraps around both. Looser than you think.",
        expected: { wrapBands: 2, pose: "sit", view: "front", handsVisible: true, neckClear: true },
        wraps: [{ kind: "cuff", at: "lw" }, { kind: "cuff", at: "rw" }],
      },
      {
        title: "3 · The cinch — the step that makes this safe",
        rigger:
          "Bring the working end to the gap between the two limbs and pass it through, between them, perpendicular to the wraps. Take it around the wraps on that side, back through the gap, and draw it snug — snug meaning the wraps can no longer slide sideways past the cinch, not meaning the limbs are squeezed together. Now look at the gap: you should see rope running through it. That visible rope is the entire difference between a double column and a loop that closes on two limbs at once.",
        bottom:
          "This is the moment to report anything uneven. A cinch pulled off-centre tightens one side more than the other, and the side that got tighter is the one that goes numb in fifteen minutes. Say if one limb feels different from the other, immediately, because a difference between the two is the specific signal this tie produces when it is going wrong.",
        check:
          "Rope is visibly passing through the gap between the two limbs, the wraps cannot slide sideways past it, and both limbs feel the same as each other.",
        speak: "Cinch through the gap. You should be able to see it there.",
        expected: { wrapBands: 2, pose: "sit", view: "front", handsVisible: true, neckClear: true },
        wraps: [],
      },
      {
        title: "4 · Finish with the same non-cinching knot",
        rigger:
          "Tie off with the same structure you used on the single column, so that pulling the standing part loads the knot rather than the wraps. Then repeat the test that matters: pull the standing part firmly in the direction it would actually go, and confirm that neither column gets smaller and that the limbs are not drawn harder together. If either happens, take it apart and start again — this is not something to adjust your way out of.",
        bottom:
          "Say what the pull feels like, at each limb separately. \"Both fine\" is less useful here than \"left is fine, right tightened a bit\", and the asymmetric answer is the one that catches the problem.",
        check:
          "Pulling the standing part firmly does not shrink either column and does not press the limbs harder together.",
        speak: "Pull it. Neither column shrinks, and they do not squeeze together.",
        expected: { wrapBands: 2, pose: "sit", view: "front", handsVisible: true, neckClear: true },
        wraps: [],
      },
      {
        title: "5 · Dress, clock, and ask about each limb separately",
        rigger:
          "Flatten every twist as before. Set a timer. Then, for as long as this is on, ask about the two limbs separately every time — \"how is your left hand, how is your right\" — rather than asking about her hands as a pair. A double column produces its warning as a difference between the sides, and a question phrased in the plural invites an answer that averages them and loses exactly the information you needed.",
        bottom:
          "Answer separately even when it is the same answer, because the habit is what makes the difference audible on the occasion when it is not the same. And keep moving your fingers periodically — not as a test that passes, but because held-still limbs stiffen and because the moment you notice a change is worth having sooner rather than later.",
        check:
          "A timer is running and you have asked about each limb individually and got two separate answers.",
        speak: "Ask about each hand separately, every time.",
        expected: { wrapBands: 2, pose: "sit", view: "front", handsVisible: true, neckClear: true },
        wraps: [],
      },
      {
        title: "6 · Removal, and the twenty-four hour check",
        rigger:
          "Undo the knot, release the cinch, unwrap. Do not pull the rope out through the cinch under tension — release it first, or you drag loaded rope across skin. Then the same routine as always: move everything, describe everything, ask again in an hour and again tomorrow morning. A double column loads two limbs at once, so there are twice as many places for a late symptom to appear, and the one that gets missed is usually the side she was not thinking about.",
        bottom:
          "Check both sides deliberately even if only one felt like anything. Compare them to each other — a difference in grip strength or sensation between your two hands is easier to notice than either one in isolation, and it is the most sensitive check you have.",
        check:
          "Rope off, both limbs moved and described separately, and a twenty-four-hour check agreed.",
        speak: "Release the cinch before unwrapping. Compare both sides.",
        expected: { wrapBands: 0, pose: "sit", view: "front", handsVisible: true, neckClear: true },
        wraps: [],
        // An empty `wraps` does not clear the cumulative figure (the route
        // draws steps.slice(0, i + 1)); the explicit empty media is what
        // "you have taken it off" should look like — the same override the
        // prop-drill strip-down step uses.
        media: [{ kind: "wraps" as const, wraps: [] }],
      },
    ],
  }),

  guidedPractice({
    slug: "karada",
    name: "Karada Body Harness",
    jp: "体",
    summary:
      "The decorative diamond-pattern harness worn over the torso. It restrains nothing, bears no load, and is the traditional first tie to put on a person — taught here in full.",
    level: "building",
    minutes: [20, 40],
    ropes: [{ lengthM: 8, count: 1 }],
    // Only the knot the steps actually use: the chain down the front is a
    // series of overhand knots in the doubled rope — overhands on a bight.
    // The previously declared lark's head, square knot and reverse tension
    // appear nowhere in the sequence.
    knots: ["overhand-on-bight"],
    nerves: [],
    intent: ["decorative", "craft", "torso"],
    prereqs: ["single-column"],
    goal: "Lay an even diamond harness over a torso that hangs from the shoulders, restrains nothing, and comes off fast.",
    why: "A karada is the answer to \"I want rope on her but I do not want to restrain her yet\". It is a row of knots down the front joined into diamonds, worn like a garment: her arms stay free, she can stand, walk, sit and lie down in it, and nothing about it depends on tension. That combination makes it the standard first body tie almost everywhere, because it lets you practise the two things that actually take time to learn — even spacing and comfortable tension over a torso — with the restraint question removed entirely.",
    stop: [
      "Any rope has ridden up towards the throat — this pattern hangs from the shoulders and must never be adjusted upward",
      "Breathing feels different in any way, however slight",
    ],
    mistakes: [
      {
        title: "Starting the knots too high",
        body: "The chain of knots runs down the front of the torso and the top one wants to sit at the breastbone, not at the base of the throat. Started too high, the whole pattern rides up as she moves and the top loop ends up somewhere it must never be. If in doubt start lower: a karada that sits an inch low looks slightly odd, and one that sits an inch high is a problem.",
      },
      {
        title: "Uneven knot spacing",
        body: "The diamonds are formed by joining adjacent knots, so uneven spacing produces lopsided diamonds and no amount of later adjustment fixes it. Measure by eye against something consistent — a hand's width between knots is the usual starting point — and accept that your first few will be uneven. This is the skill the tie is for.",
      },
      {
        title: "Pulling it tight because it looks loose",
        body: "A karada is meant to sit on the body rather than grip it, and it looks looser than beginners expect. Tightening it does not make it more secure — it is not securing anything — it just makes it uncomfortable and moves rope towards the ribs and the diaphragm. If it stays put when she stands up, it is tight enough.",
      },
      {
        title: "Forgetting it goes between the legs",
        body: "The traditional pattern passes between the legs to anchor the bottom. That is an intimate contact and needs its own explicit yes, separately from the yes about rope on the torso — this app gates it behind the crotch limit for that reason. There is a perfectly good version that stops at the waist, and starting there is entirely reasonable.",
      },
    ],
    variations: [
      {
        name: "Waist-length only",
        body: "Stop the pattern at the hips and tie off at the waist rather than passing between the legs. Visually most of the effect, none of the intimate-contact question, and the version to learn on.",
      },
      {
        name: "Over clothing",
        body: "Worked over a fitted top it is a genuinely good way to learn the spacing without any of the skin-contact considerations, and it can go on and come off in a few minutes. Underrated as practice.",
      },
      {
        name: "As a foundation for nothing",
        body: "A karada looks as though it should be a base to attach things to. It is not — the knots are decorative and the pattern is not built to carry load anywhere. Anything that bears weight is a different structure and a different conversation.",
      },
    ],
    steps: [
      RELEASE_REHEARSAL,
      {
        title: "1 · Doubled rope, folded over the shoulders",
        rigger:
          "Find the bight as before. Lay the doubled rope over one shoulder and down the front, with the bight hanging behind at about the level of her shoulder blades — the pattern hangs from the shoulders, which is what stops the whole thing sliding down her body later. Bring the ends round so you are working down the front with the doubled rope in your hands.",
        bottom:
          "Stand or kneel upright and breathe normally. Do not hold yourself unusually straight for this — the shape you make now is the shape the rope is fitted to, and if it is not the shape you will actually be in, the fit is wrong from the start.",
        check:
          "The rope hangs from the shoulders, doubled, with plenty of length to work down the front.",
        speak: "Over the shoulders, doubled, hanging from the top.",
        expected: { wrapBands: 0, pose: "stand", view: "front", handsVisible: true, neckClear: true },
        wraps: [],
      },
      {
        title: "2 · The first knot, deliberately low",
        rigger:
          "Tie a simple overhand knot in the doubled rope so it sits at about the breastbone. Consciously place it lower than instinct suggests: this is the knot the whole pattern hangs off, and every one below it inherits its height. Once tied, hold the rope up and look at where the loop above it sits relative to her collarbones and throat. If it is anywhere near the throat, undo it and start lower.",
        bottom:
          "Say where that knot sits from your side. He is looking at it from the front and cannot feel whether the loop above it is resting on your collarbones or riding up your neck. Nothing about this tie should touch your throat at any point, at any stage, in any position.",
        check:
          "The first knot is at the breastbone or lower, and the loop above it sits clear of the throat with room to spare when she looks up and turns her head.",
        speak: "First knot at the breastbone. Lower than you think.",
        expected: { wrapBands: 1, pose: "stand", view: "front", handsVisible: true, neckClear: true },
        wraps: [{ kind: "diamond", cy: 0.3 }],
      },
      {
        title: "3 · A chain of knots down the front",
        rigger:
          "Continue down the front tying knots at even intervals — roughly a hand's width apart is a fine starting spacing — until you reach the top of the hips. Even spacing is the entire craft of this tie and the thing that will take you several attempts, so do not chase perfection on the first one. Keep the rope untwisted between knots: a twist here shows up as a diamond that will not lie flat later.",
        bottom:
          "Breathe normally the whole time and say so if any knot lands somewhere awkward — over a rib, on a scar, on something tender. A knot is a hard point pressing on one spot for however long this stays on, so a knot that is slightly annoying now is genuinely uncomfortable in half an hour.",
        check:
          "An even chain of knots running from breastbone to hips, no twists in the rope between them, and no knot sitting anywhere she has flagged.",
        speak: "Even spacing, hand's width apart, down to the hips.",
        expected: { wrapBands: 3, pose: "stand", view: "front", handsVisible: true, neckClear: true },
        wraps: [{ kind: "diamond", cy: 0.39 }, { kind: "diamond", cy: 0.475 }],
      },
      {
        title: "4 · Anchor at the waist",
        rigger:
          "Take the two ends around her waist, cross them at the back, and bring them forward again. This anchors the bottom of the chain so the whole pattern stays where you put it. Snug rather than tight — you are stopping it sliding, not holding anything in place. This is also the natural stopping point for the waist-length version: tie off here and you have a complete tie.",
        bottom:
          "Take a deep breath in and let it out fully while he sets this. If the waist wrap is right, both are unremarkable. If a full breath feels restricted at all, say so — the rope is too tight or it is sitting too high on the ribs, and both are fixed by loosening rather than by getting used to it.",
        check:
          "The waist wrap holds the chain in place, a full breath in and out feels entirely normal, and the rope sits on the waist rather than up on the ribs.",
        speak: "Waist wrap, snug not tight. Take a full breath.",
        expected: { wrapBands: 4, pose: "stand", view: "front", handsVisible: true, neckClear: true },
        wraps: [{ kind: "band", y: 0.49 }],
      },
      {
        title: "5 · Optional — pass between the legs, if that has its own yes",
        rigger:
          "The traditional pattern brings the rope down from the waist, between the legs, and up to the waist wrap at the back. Only do this if it has been agreed as its own separate thing: consent to rope on her torso is not consent to rope between her legs, and this app keeps them as two different negotiated limits for exactly that reason. If it is agreed, keep it deliberately loose — this passes over tissue with very little padding and a nerve that does not tolerate pressure well. Loose enough to be decorative, and no tension applied to it afterwards from any direction.",
        bottom:
          "This is yours to decline at this step even if you agreed to it an hour ago, and declining it does not undo the rest of the tie. If it goes on: report pressure, rubbing, numbness or any change in sensation immediately, and understand that this is the part of the pattern that most needs saying something about early rather than putting up with.",
        check:
          "Either this step was skipped, or it was separately agreed just now, is visibly loose, and she has reported no pressure or altered sensation.",
        speak: "Separate yes for this, or skip it. Loose if it goes on.",
        limitIds: ["crotch"],
        expected: { wrapBands: 5, pose: "stand", view: "front", handsVisible: true, neckClear: true },
        wraps: [{ kind: "stem", y1: 0.49, y2: 0.62 }],
      },
      {
        title: "6 · Join the knots into diamonds",
        rigger:
          "Now the part that makes it a karada. Take the rope up the back, split the two strands, and bring one round each side to the front, passing them through the loops beside each knot in the chain and back out. Each pass joins two adjacent knots into a diamond. Work down or up consistently and keep the tension the same on both sides, or the diamonds pull the chain off-centre and the whole thing sits crooked. This is fiddly, it takes a while, and it is the part worth taking your time over.",
        bottom:
          "This step involves a lot of hands and a lot of concentration on his part, which is exactly when the person doing it stops watching your face. Speak up about anything at all — you have effectively become the monitoring system for a few minutes while he is absorbed in the pattern.",
        check:
          "The diamonds are even, the chain still runs down the centre, and nothing has migrated upward towards the throat.",
        speak: "Even tension both sides, or the pattern goes crooked.",
        expected: { wrapBands: 6, pose: "stand", view: "front", handsVisible: true, neckClear: true },
        wraps: [{ kind: "diamond", cy: 0.345 }, { kind: "diamond", cy: 0.435 }],
      },
      {
        title: "7 · Tie off, then have her move in it",
        rigger:
          "Finish at the waist with a knot that will not work loose, and tuck the ends rather than leaving long tails to catch on things. Then ask her to stand, sit, lie down, reach up and turn round. A karada is a garment and its whole test is whether it stays put and stays comfortable through the movements of an ordinary evening. Watch particularly for anything travelling upward — that is the failure mode that matters, and movement is what reveals it.",
        bottom:
          "Move properly rather than tentatively — reach for something on a high shelf, sit down and get up, lie on your side. Report anything that shifts, digs in, or changes when you move. Somewhere it rubs after twenty minutes of ordinary movement is worth knowing about before it becomes a burn.",
        check:
          "It stays put through standing, sitting, lying and reaching, nothing has moved upward, and breathing is unchanged in every position.",
        speak: "Have her move properly in it. Watch for anything riding up.",
        expected: { wrapBands: 6, pose: "stand", view: "front", handsVisible: true, neckClear: true },
        wraps: [],
      },
      {
        title: "8 · Taking it off",
        rigger:
          "A karada comes off in reverse and it takes longer than putting it on feels like it should — allow for that rather than getting impatient near the end. Untie the waist, unthread the diamonds, and work back up. If she needs it off quickly, do not unthread: cut the chain of knots at the front, in the gaps between knots where a single doubled strand runs, and the whole pattern falls apart. Knowing that in advance is what makes a fast removal fast.",
        bottom:
          "Once it is off, check your skin where the knots sat — those are single points that have been pressing for however long, and they are the places that mark. Ordinary red marks that fade over an hour or two are unremarkable; anything that stays, blisters, breaks the skin, or is still numb tomorrow is worth a proper look.",
        check:
          "The rope is off, skin under the knot line has been looked at, and any marks are the fading kind.",
        speak: "Cut between knots if it needs to be fast.",
        expected: { wrapBands: 0, pose: "stand", view: "front", handsVisible: true, neckClear: true },
        wraps: [],
        // An empty `wraps` does not clear the cumulative figure (the route
        // draws steps.slice(0, i + 1)); the explicit empty media is what
        // "you have taken it off" should look like — the same override the
        // prop-drill strip-down step uses.
        media: [{ kind: "wraps" as const, wraps: [] }],
      },
    ],
  }),
];
