import type { KnotSource } from "./types";

export const MORE_KNOTS: KnotSource[] = [
  {
    slug: "overhand-on-bight",
    name: "Overhand on a Bight",
    jp: "止め結び",
    summary:
      "A stopper-loop category demonstrated only on loose, unoccupied material. This app does not teach it as a cuff, loaded connection, or person-bearing component.",
    cinches: true,
    loadBearing: false,
    steps: [
      {
        title: "Fold, wrap, pull",
        body: "On loose, unoccupied practice material, fold a bight, pass it through the sample loop, and dress it only for recognition. Untie before any loading.",
        speak: "Recognition on loose, unoccupied material only.",
      },
    ],
    mistakes: [
      {
        title: "Twisting the bight before the tuck",
        body: "The doubled section has to fold flat, so both strands of the bight run parallel through every turn of the overhand. Give the bight a half-twist before pushing it through and one strand crosses the other inside the knot: the finished loop sits crooked instead of square to the standing part, and one strand carries more of the bend than the other ever does. Check by looking through the loop before you snug it down — two flat strands side by side, no crossing, and the loop square to both standing parts rather than cocked toward one.",
      },
      {
        title: "Snugging by the tail instead of the bight",
        body: "Dressing this knot down means loading the bight and both standing parts at the same time. Pull on only the loose ends and the loop can roll over on itself before it sets, leaving a lopsided knot with the loop shoved off to one side instead of centered between the two standing parts. Take up slack on all the parts together and watch the loop stay centered as the knot closes, rather than yanking one end and hoping the rest follows.",
      },
      {
        title: "Treating the loop as a fixed size once tied",
        body: "This knot cinches, so the loop is not a diameter you set once — it's a diameter that keeps changing whenever the standing parts on either side get pulled afterward. Size the loop, then tension something else in the piece, and you'll come back to find it has drawn down smaller than you left it. Set tension everywhere else in the arrangement first, and size this loop last, on the practice cord, not before.",
      },
      {
        title: "Cranking it fully tight on the practice cord",
        body: "Because the knot is doubled through every turn, hauling it all the way down against a dowel or bolster multiplies the internal friction and it can jam solid rather than staying a knot you can open again for the next repetition. Snug it only enough to hold its shape for inspection, then work it back open with your fingers or a fid — don't rely on pulling it down hard to prove it's tied right.",
      },
      {
        title: "Losing track of which face is the show side",
        body: "Tied on a bight, this knot has a cleaner face where the strands sit in an even shell and a messier back where the tuck bunches up. In a repeating pattern built from several of these loops, an inconsistent face from one to the next reads as sloppy even when each individual knot is sound. Dress every repeat the same way on the practice cord and check the show face before moving to the next one.",
      },
    ],
    watch: [
      "This structure can jam and is not a rapid-release method.",
      "Do not load it, put it on a body, or infer a cutting procedure from this entry.",
    ],
  },
  {
    slug: "prusik",
    name: "Prusik: Instructor Route",
    jp: "プルージック",
    summary:
      "A friction-hitch category used in loaded systems. This app identifies the term but does not teach, size, test, or approve it for a person-bearing system.",
    cinches: false,
    loadBearing: false,
    steps: [
      {
        title: "Learn in person before any load",
        body: "Friction-hitch performance depends on material, diameter, dressing, direction, contamination, movement, and the whole load path. Use qualified hands-on instruction and a separately engineered system; do not load a person from an app description.",
        speak: "Instructor-only for loaded use. This entry is recognition, not a procedure.",
      },
    ],
    mistakes: [
      {
        title: "Mistaking recognition for validation",
        body: "This app naming a hitch 'prusik' only confirms that a wrap pattern in a photo resembles a known shape — it says nothing about the cord diameter relative to the host rope, the material pairing, the wrap count, or contamination on either surface, all of which decide whether that specific hitch actually grips under load or slides. A label is not a build report.",
      },
      {
        title: "Reading a still photo as proof of grip",
        body: "A friction hitch holds by biting into the host rope as it moves under load, and a static image cannot show that behavior at all. Comparing a photo against a reference diagram and concluding the two 'match' ignores that diameter ratio, sheath condition, and loading direction are exactly the variables a picture cannot capture.",
      },
      {
        title: "Treating any unloaded check as a load test",
        body: "A friction hitch that looks and feels secure before it is carrying its real load can behave completely differently once it is — an unloaded assessment and an in-use assessment are not interchangeable, and nothing about a recognition-only label can tell you which one you actually performed. Assuming a hitch that seemed fine a moment ago will hold the same way once it is doing its job is a judgment error this entry cannot fill in for you.",
      },
      {
        title: "Assuming 'prusik' names one fixed hitch",
        body: "The word covers a family of similar-looking wrap patterns — classic prusik, klemheist, distel, autoblock among them — that differ in how they release, how direction-sensitive they are, and how they respond to cord material. Identifying the family name is not the same as identifying which variant is actually tied, and different variants can behave in opposite ways under the same pull.",
      },
      {
        title: "Letting an app's label substitute for an instructor's eye",
        body: "When this app or any automated response names a hitch 'prusik,' that word is a term match, not an assessment of how it was tied, dressed, or whether it belongs in the load path being used. Only a qualified person examining the actual rope, actual diameters, and actual system in front of them can make that judgment; a name from a screen is not a substitute for that eye.",
      },
    ],
    watch: [
      "A name, photo, or apparent grip does not establish capacity, controllability, redundancy, or safe release.",
    ],
  },
  {
    slug: "alpine-butterfly",
    name: "Alpine Butterfly: Instructor Route",
    jp: "蝶結び",
    summary:
      "A mid-line loop category. This app does not teach or approve it as part of a person-bearing rope system.",
    cinches: false,
    loadBearing: false,
    steps: [
      {
        title: "Recognition only",
        body: "Do not use a diagram or model response to construct a loaded system. Learn tying, inspection, failure modes, compatibility, and release through qualified in-person instruction.",
        speak: "Recognition only. Do not load a person from this entry.",
      },
    ],
    mistakes: [
      {
        title: "Treating a diagram match as proof of correct construction",
        body: "A reference photo showing a loop that resembles an alpine butterfly does not confirm the dressing or symmetry underneath it. Two loops can look identical face-on in a still image while differing in exactly the ways that matter, and no picture can show you that difference — only qualified in-person instruction, with hands on the actual rope, can.",
      },
      {
        title: "Assuming a recognizable name means a validated use",
        body: "Alpine butterfly is a well-documented loop from climbing and rescue contexts, and that familiarity can make an unverified setup feel more trustworthy than it actually is. But being able to name a knot on sight is not the same as knowing whether this particular rope, this configuration, and this application have been engineered and checked to the standard a load-bearing system actually requires.",
      },
      {
        title: "Using this entry as a substitute for hands-on training",
        body: "This page exists so you can recognize an alpine butterfly when you see one, not so you can learn to produce one from a description. Reproducing something that looks similar from memory or from outside material skips every step where a qualified instructor would normally catch a mistake before it mattered.",
      },
      {
        title: "Mistaking a similar mid-line loop for this one",
        body: "Alpine butterfly is one of several fixed loops tied into the middle of a line rather than at an end, and once dressed these can look nearly identical at a glance or in a photo. The details that distinguish them are exactly what a still image won't show. Misidentifying which mid-line loop you're looking at means any assumption you make about its behavior is an assumption about the wrong knot entirely.",
      },
      {
        title: "Reading 'recognition only' as an overcautious formality",
        body: "The absence of construction steps here is not a simplification you're meant to fill in from other references or general rope knowledge. It marks a category this app deliberately does not teach, and working around that boundary with outside material defeats the reason the boundary exists in the first place.",
      },
    ],
    watch: ["Visual similarity cannot validate the knot, the rope, or the surrounding system."],
  },
  {
    slug: "daisy-chain",
    name: "Daisy Chain",
    jp: "鎖編み",
    summary:
      "A chain of bights for storing leftover tail or making a decorative stem. It is not a cuff and it is not a hang.",
    cinches: false,
    loadBearing: false,
    steps: [
      {
        title: "Pull the first bight through",
        body: "A daisy chain is nothing but a bight pulled through a bight, repeated down the rope, so the whole knot rides on getting that one motion clean the first time. Work it on loose practice cord, or on the leftover tail hanging past the lock of a chair-leg or post tie, never anywhere on a body.",
        do: "Twist a bight into the rope near where the slack you want to store begins, and hold it open with two fingers. Reach through that bight, take hold of the rope further along its own length, and pull a second bight through the first until the first bight closes snugly around the base of the second.",
        doBullets: [
          "Twist a bight into the rope and hold it open",
          "Reach through it and grab the rope further along",
          "Pull a second bight through and let the first close around it",
        ],
        check:
          "Look at the link you just made before you start pulling the next one down the chain.",
        checkBullets: [
          "The first bight should sit snug around the base of the second, not loose",
          "The new bight should pass cleanly through, not twisted or crossed on itself",
        ],
        speak: "Pull a bight through a bight and snug it down.",
      },
      {
        title: "Repeat down the slack",
        body: "The chain is just the first step done over and over — each new bight goes through the loop before it, down the whole length of rope you're storing, which is what turns a single link into a sinnet you can compact and carry.",
        do: "Grab the rope just past the last bight you pulled, twist it into a new bight, and pull that new bight through the previous loop, snugging that previous loop closed around it. Keep repeating this same pull down the remaining slack, always threading a doubled bight through, never the bare working end.",
        doBullets: [
          "Grab the rope past the last bight and twist a new one",
          "Pull it through the previous loop and snug that loop closed",
          "Repeat down the remaining slack",
          "Always thread a doubled bight, never the bare end",
        ],
        check: "Run your eye down the finished links before you lock the last one.",
        checkBullets: [
          "Each link should be close to the same size as its neighbors",
          "No link should be a single strand instead of a doubled bight",
        ],
        speak: "Same pull, link after link, down the rope.",
      },
      {
        title: "Lock the last loop",
        body: "The final loop in the chain is only a bight resting inside another bight, and nothing is holding it shut yet — without one more piece of construction, a tug on the working end will walk straight back through every link you just made.",
        do: "When you reach the working end, tie a half hitch with it around the final loop, or thread the entire working end all the way through that last loop instead of just doubling it into a bight, then pull the lock down snug against the chain.",
        doBullets: [
          "Bring the working end to the last loop of the chain",
          "Tie a half hitch around it, or pass the whole end through it",
          "Pull the lock snug against the final link",
        ],
        check:
          "Pull on the working end to see what the lock actually does under tension, not just how it looks sitting still.",
        checkBullets: [
          "A tug on the working end should stop at the lock, not travel down the chain",
          "The last loop should stay closed, with nothing feeding backward out of it",
        ],
        speak: "Lock the last loop so a tug on the tail can't unravel it.",
      },
    ],
    mistakes: [
      {
        title: "Leaving the final loop unlocked",
        body: "The last loop of a chain sinnet is just a bight sitting inside another bight, and nothing holds it shut once you let go of the working end. Tie a half hitch around it, or feed the whole working end through it instead of another bight, and snug it down. Skip that step and one tug on the tail walks backward through every link, unraveling the entire chain at once.",
      },
      {
        title: "Treating the chain as if it could bear weight",
        body: "A daisy chain exists to store a long tail compactly or dress up a finished tie — it is not built, sized, or dressed to carry anything, and it is not rated to. If it ever does take load and the final lock lets go, the chain does not pay out gradually the way a coiled rope would: every bight releases in the same instant, dumping the whole stored length in one motion. Keep tension off the working end entirely.",
      },
      {
        title: "Feeding the bare end through mid-chain",
        body: "Partway down a long chain it's easy to grab the working end itself instead of doubling it into a bight before pulling it through the last loop. That one substitution turns a chain link into an overhand knot, which jams tight under the next pull, breaks the even compacting of the chain, and is awkward to pick apart later. Check each link as you build it: you should see a doubled loop passing through, never a single strand.",
      },
      {
        title: "Uneven bight size link to link",
        body: "Pulling each new bight to a different length than the one before leaves some links loose and baggy and others cinched down hard, so the finished chain looks lumpy and the oversized loops can snag on whatever it's coiled next to. Pull each bight to roughly the same length as you go, using the width of the cord itself as a rough gauge, so the chain sits even along its whole length.",
      },
    ],
    watch: ["A daisy that takes load will dump all at once when the lock fails."],
  },
  {
    slug: "truckers-hitch",
    name: "Trucker's Hitch: Object-Only",
    jp: "トラックヒッチ",
    summary:
      "A mechanical-advantage category for securing inanimate cargo. It is excluded from body restraint and person-bearing systems in this app.",
    cinches: false,
    loadBearing: false,
    steps: [
      {
        title: "Tie the mid-line loop",
        body: "This loop, tied partway along the rope rather than at an end, becomes the pulley point the whole system reeves through. It has to hold its own shape before any load hits it — if it depends on tension to stay closed, hauling on the working end will cinch it down and eat into the mechanical advantage instead of passing it through to the anchor.",
        do: "On the rope, pull a bight partway along its length — not at either end — and tie a slipped half-hitch loop (or another fixed loop knot) around that bight. Snug it down firmly by hand so it holds its round shape without you supporting it.",
        doBullets: [
          "Pull a bight partway along the rope's length",
          "Tie a slipped half-hitch loop or fixed loop knot around it",
          "Snug it down so it stands open unsupported",
          "Leave enough working end beyond it to reach the anchor and back, plus several extra feet for hauling and tying the two half hitches",
        ],
        check:
          "Let go of the rope entirely and look at the loop on its own: it should stand open, keeping its round shape without your fingers pinching it closed. If it wants to flatten or slip open the moment you release it, retie it.",
        checkBullets: [
          "Release the loop and watch whether it holds its own shape",
          "Retie it if it flattens or slips without your hand pinching it",
        ],
        speak: "Snug the loop until it holds its own shape, no hand needed.",
      },
      {
        title: "Reeve around the anchor and haul the tension",
        body: "Running the working end around the far anchor and back up through the mid-line loop turns one length of rope into roughly three lines sharing the pull, which is what gives you the 3:1 mechanical advantage — you're hauling a third of the final tension with your hands to get the full tension on the standing line. That reeving is what makes the hitch worth using over pulling the rope straight.",
        do: "Take the working end out to the far anchor point, run it around that point, and feed it back up through the mid-line loop you just tied. Then pull the working end steadily, hand over hand, drawing the whole line as tight as you can manage by hand alone.",
        doBullets: [
          "Run the working end around the far anchor point",
          "Feed it back up through the mid-line loop",
          "Pull the working end hand over hand to tension the line",
          "Keep hauling until the line is as tight as you can get it",
        ],
        check:
          "Once you've hauled the working end as tight as you can by hand, look at the standing part along its whole length — it should be uniformly taut with no slack pooling near the anchor or near the mid-line loop.",
        checkBullets: [
          "Sight along the whole standing part for uniform tautness",
          "Look for slack pooling at the anchor or at the mid-line loop",
          "Trace where any slack is coming from before locking off",
        ],
        speak: "Reeve it around and haul it tight, hand over hand.",
      },
      {
        title: "Lock off with two half hitches",
        body: "A tensioned line has nowhere to store that tension on its own — something has to grip the standing part and hold it there once your hand lets go of the working end. One half hitch isn't friction enough to do that alone; it needs a second hitch locked against it, both dressed down flat, or the tension you just built bleeds back out through the reeved loop the instant you release the rope.",
        do: "While holding the tension you just built, wrap the working end around the standing part right where it comes down from the mid-line loop and tie a half hitch. Tie a second half hitch directly against the first, then snug both down flat before easing your pulling hand off the rope.",
        doBullets: [
          "Tie a half hitch around the standing part with the working end",
          "Tie a second half hitch stacked directly against the first",
          "Snug both hitches down flat",
          "Ease your pulling hand off only after both are dressed down",
        ],
        check:
          "After tying both half hitches, ease your pulling hand off the working end gradually and watch the standing part for any give — it should hold its exact tension, with no creeping or lengthening, as your hand fully releases.",
        checkBullets: [
          "Ease off the working end gradually while watching the line",
          "Confirm no creep or lengthening as your hand fully releases",
        ],
        speak: "Two half hitches, dressed flat, before you let go.",
      },
    ],
    mistakes: [
      {
        title: "The mid-line loop closing under tension",
        body: "The loop tied partway along the rope has to hold its own round shape before you load it — if it's only staying closed because your fingers are pinching it, hauling the working end back through it will cinch the loop down small under the multiplied tension, defeating the whole point of the reeve. A loop that closes under load stops being a fixed anchor point, and you lose part of the 3:1 advantage without any warning. Retie the loop so it holds open on its own, unsupported, before you ever run the working end through it.",
      },
      {
        title: "Locking off with a single half hitch",
        body: "A single half hitch around the standing part only holds while your hand is still pulling on the working end; nothing opposes it once you let go, so it rolls open and the line pays back out, losing everything you just hauled in. Two half hitches, snugged one against the other, are what actually holds a tensioned line without your hand on it.",
      },
      {
        title: "Half hitches left loose or crossed",
        body: "A half hitch that isn't pulled down snug, or that ends up crossed over itself instead of stacked flat against the first one, has slack built into it before it ever takes a load; that slack lets the line creep back a little every time the rope shifts or the cargo settles, and a system that was tensioned hard in the morning is loose by the time you check it later. Snug each hitch down individually and stack the second directly against the first before trusting the lock-off.",
      },
      {
        title: "Tying the mid-line loop too close to either end",
        body: "The loop's position along the rope sets how much rope is left to work with on either side of it — tie it too near the end you started from, and after running the working end out to the anchor and back up through the loop, there won't be enough tail left to haul any real distance, let alone tie the two half hitches at the finish. Before you commit to the loop's position, picture the whole path the rope has to travel — out to the anchor and back through the loop — and leave several extra feet of working end past the loop for the haul and the lock-off.",
      },
    ],
    watch: ["Mechanical advantage can create high force before the operator recognizes it."],
  },
];
