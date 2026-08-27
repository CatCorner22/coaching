import type { Knot, KnotSource } from "./types";
import { MORE_KNOTS } from "./more-knots";
import { TIES } from "./ties";

const CORE_KNOTS: KnotSource[] = [
  {
    slug: "somerville-bowline",
    name: "Somerville Bowline",
    jp: "非締め付けシングルコラム",
    summary:
      "The non-cinching single-column knot. Learn the hand movements here as an unoccupied handling drill first; the guided single-column lesson then applies it on a consenting adult once its negotiated limit is agreed, with direct monitoring and rehearsed release.",
    cinches: false,
    loadBearing: false,
    steps: [
      {
        title: "Bight around a practice column",
        body: "Fold a working bight and wrap it around a smooth, unoccupied practice column so the folded end and standing pair sit side by side. Leave visible slack and enough tail to complete the drill.",
        speak: "Practice on an unoccupied column with visible slack.",
      },
      {
        title: "Working bight through",
        body: "Pass the working bight up through the collar of rope. Keep the collar flat and easy to inspect.",
        speak: "Pass the working bight up through the collar.",
      },
      {
        title: "Around the standing pair",
        body: "Take that bight around the standing pair (or around the whole collar, depending on the variation you learned) and back down through the same opening it came from.",
        speak: "Around the standing pair, then back down through.",
      },
      {
        title: "Dress and set",
        body: "Dress the knot on the unoccupied practice column. Pull the standing pair gently and confirm that the practice loop does not constrict; this drill does not validate fit, placement, or use on a person.",
        speak: "Dress the practice knot and confirm its structure without body loading.",
      },
    ],
    mistakes: [
      {
        title: "Catching only the standing pair when the full collar was intended",
        body: "This variant's extra security over a plain bowline comes from the return bight enclosing the whole collar — folded end and standing pair together — not the standing pair on its own. If you set out to drill the full-collar version but the bight only catches the standing pair as it passes through, the knot quietly turns into an ordinary bowline's nipping loop: capsize-prone under repeated slack-and-load cycles, with nothing different to see by eye once it's dressed. Know which variation you're practicing before you dress it, and check that the bight actually closed around everything that variation calls for, not just part of it.",
      },
      {
        title: "Collar twisted before the bight goes through",
        body: "The folded end and the standing pair need to sit side by side and parallel around the practice column. If the first wrap crosses itself instead, the collar carries a hidden twist, and threading that bight through a twisted collar traps that twist inside the finished knot, so it dresses lumpy and one turn ends up doing the work while the other stays slack.",
      },
      {
        title: "Return bight comes back through the wrong gap",
        body: "The working bight has to return down through the same opening it went up through. Feeding it through a neighboring gap in the collar instead produces something that resembles the knot from across the room but isn't the same interlock, and it can walk apart with ordinary handling on the practice column.",
      },
      {
        title: "Tail left too short after dressing",
        body: "The extra collar wrap in this variant eats more rope than a plain bowline does, so a tail length that feels routine on a standard bowline can be too short here. A short tail has room to draw back through the knot as you dress and re-dress it during drilling, and you won't notice until it's already gone.",
      },
      {
        title: "Treating a clean practice loop as clearance for a person",
        body: "The full-collar wrap dresses into a visibly bulkier, tighter-looking loop than a plain bowline's, and on a smooth practice column that can read as reassuringly 'more secure.' That impression is about watching a column, not about a body: it says nothing about consent, positioning, active monitoring, or how quickly the rope comes off a person. This drill is craft practice; moving to a person is a separate step with its own instruction, not something this loop earns on its own by looking tidy.",
      },
    ],
    watch: [
      "If the practice loop cinches, untie and restart; do not troubleshoot a body cuff while it is under tension.",
      "A prop drill cannot establish safe body placement, pressure, duration, or release competence.",
    ],
  },
  {
    slug: "larks-head",
    name: "Lark's Head",
    jp: "ラークスヘッド",
    summary:
      "A cow-hitch category on a bight. Because it cinches, this app teaches it on an unoccupied object only—not as a cuff, harness start, or person-bearing component.",
    cinches: true,
    loadBearing: false,
    steps: [
      {
        title: "Find the middle",
        body: "Double the rope at its midpoint. You now have a bight and two running ends.",
        speak: "Find the midpoint and double the rope.",
      },
      {
        title: "Collar",
        body: "Pass the bight around an unoccupied practice object. Feed the running ends through the bight and dress the hitch for inspection.",
        speak: "Bight around, ends through, snug.",
      },
    ],
    mistakes: [
      {
        title: "Loading only one running end",
        body: "If you pull one running end tight and leave the other slack, the hitch has nothing to balance it and it rolls around the object instead of cinching straight down. The crossing point drifts off-center and the whole hitch can walk toward one edge of the object. Take up both running ends together, a little at a time, watching the crossing stay centered over the bight as it tightens.",
      },
      {
        title: "Cinching before the bight is seated square",
        body: "This hitch grips by cinching, so the geometry you tighten into is the geometry you're stuck with. Pull the running ends snug while the bight is still sitting crooked or twisted around the object and it locks in at that angle, biting unevenly into the rope instead of gripping the object cleanly. Seat the bight flat and square first, confirm it sits without a twist, and only then take up the running ends.",
      },
      {
        title: "Doubling the rope off-center",
        body: "Finding the middle means finding the true midpoint, not eyeballing it. Double the rope even a hand's width off-center and you get two running ends of different length feeding into the bight, so one leg takes more of the pull than the other once you cinch. The hitch cants sideways instead of sitting level. Fold the rope end-to-end to locate the actual midpoint before you form the bight.",
      },
      {
        title: "Practicing the cinch on a tapered or slick object",
        body: "The grip in this hitch comes entirely from the bight biting down against the object's surface. A tapered dowel, a rounded chair leg, or anything coated or slick gives the cinch nothing consistent to bite, so it slides down the taper or rotates under tension instead of locking. Practice on an object with a steady, consistent diameter and un-slick surface so what you feel when it cinches is the hitch, not the object letting go.",
      },
      {
        title: "Pulling the load off the hitch's centerline",
        body: "This hitch holds only when the two running ends leave the bight running straight and parallel to each other, in line with the collared object, not angled off to one side. Pull them off to one side instead and the bight can open, roll, or slip rather than cinch tighter, especially under a sudden tug rather than steady tension. Look at where the running ends actually run: if they angle apart instead of tracking side by side and true, stop and re-dress the bight before loading it again.",
      },
    ],
    watch: [
      "This hitch cinches and is not taught here as a body cuff or harness start.",
      "Use only an unoccupied practice object in this app; seek hands-on instruction for body application.",
    ],
  },
  {
    slug: "double-half-hitch",
    name: "Double Half Hitch",
    jp: "ダブルハーフヒッチ",
    summary:
      "Two half hitches stacked, demonstrated here on unoccupied material only. This entry does not approve a loaded or person-bearing use.",
    cinches: false,
    loadBearing: false,
    steps: [
      {
        title: "First hitch",
        body: "On an unoccupied practice bundle, pass the working end around the standing part and through its own loop. Dress it without loading.",
        speak: "First half hitch against the wrap.",
      },
      {
        title: "Second hitch",
        body: "Repeat in the same direction so the two hitches nest. Dress them flat. This is not a cinch — it is a lock.",
        speak: "Second hitch in the same direction. Dress them flat.",
      },
    ],
    mistakes: [
      {
        title: "Second hitch reversed",
        body: "The second half hitch has to wrap the same direction as the first so the two loops sit side by side and bite the same way. Reverse it and the loops cross into an X instead of stacking flat, so the lock fights itself and can walk under handling instead of holding still. Check that both loops lean the same way before you call it dressed.",
      },
      {
        title: "Pulling the tail to cinch it down",
        body: "This knot is a lock, not a cinch — pulling hard on the working end after the second hitch does not draw the wraps tighter around the object, it just drags one hitch out of shape while the other stays put. On a dowel or chair leg this shows up as one loop bunched small and the other still loose. Snug each hitch by hand as you dress it, then leave the tail alone.",
      },
      {
        title: "Loading before the hitches are dressed flat",
        body: "A double half hitch has to be worked flat — both loops lying parallel against the object, no twists — before it takes any pull. Load it while the wraps are still bunched or crossed and the first pull can capsize the loose hitch into a different, weaker shape than the one you tied. Flatten both loops with your fingers and check they mirror each other before testing the knot at all.",
      },
      {
        title: "Tail too short beyond the second hitch",
        body: "Leave only a stub past the last hitch and repeated handling — coiling the practice bundle, running your hand along it, working the next knot in the pattern — can walk the end back through both loops until the whole thing unravels. Leave a tail several times the rope's own diameter past the second hitch, and check that length again after the piece has been handled a few times, not just right after tying.",
      },
      {
        title: "Loading from the wrong side of the hitches",
        body: "A half hitch grips by pulling its own loop snug against the object; it only does that when the load comes from the same side the loop closes toward. Pull the standing part from the other direction and the loops open instead of tightening, letting the whole stack slide along the dowel or rail. Note which way the loops face when you dress them, and keep any test pull on that same side.",
      },
    ],
    watch: [
      "Opposite-direction hitches slip. Same direction, stacked.",
      "Do not use this app entry to select or validate a lock for a loaded system.",
    ],
  },
  {
    slug: "wrap-cinch",
    name: "Wrap and Cinch",
    jp: "巻きと締め",
    summary:
      "A wrap-and-cinch structure shown as unoccupied craft. Cinches can concentrate pressure; this app does not teach body placement or loaded use.",
    cinches: true,
    loadBearing: false,
    steps: [
      {
        title: "Lay the parallel wraps",
        body: "Two or three wraps laid side by side around the practice form create the flat band the cinch will lock onto. Keeping them parallel rather than twisted means every wrap can share the load evenly once the cinch is set, and it lets you see the whole structure before you commit any tension to it.",
        do: "Wrap the working rope around the dowel, chair leg, or bolster two to three times, laying each pass flat against the one before it rather than on top of it. Leave enough working end free to route the cinch, and keep the standing end anchored back to its origin.",
        doBullets: [
          "Wrap 2-3 times around the object, side by side",
          "Keep each pass flat, not twisted or crossed over another",
          "Leave enough working end free to route the cinch",
        ],
        check:
          "Sight down the band before cinching: you should see each wrap as a separate flat line lying next to its neighbors, with no wrap riding up over another and no gaps opening between passes.",
        checkBullets: [
          "Each wrap visible as its own flat line",
          "No wrap overlapping or riding above another",
          "No gaps between adjacent wraps",
        ],
        speak: "Lay them flat and side by side — no twists, no crossings.",
      },
      {
        title: "Cinch the band",
        body: "The cinch is what actually locks the wraps in place: the working end threads under or around the flat band and draws tight, biting into the wraps by friction rather than by a knot. Direction matters here — the pull has to travel back toward the anchor point, because a cinch that pulls away from the anchor is really a slip noose that keeps closing instead of a structure that holds a fixed size.",
        do: "Route the working end under the band from the side closest to the anchor, bring it back over the wraps, and draw the tension through toward the anchor rather than away from it. Snug it down with steady, even pressure — don't haul on it like a single strand, since the force is spread across every wrap underneath.",
        doBullets: [
          "Thread the working end under the band from the anchor side",
          "Draw tension back toward the anchor, not away from it",
          "Snug down with steady pressure, not a hard yank",
        ],
        check:
          "Tug the standing end firmly and watch the band itself: it should keep its width and stay put on the object, with the cinch line sitting square across the wraps rather than sliding or dragging them out of line.",
        checkBullets: [
          "Band holds its width when tugged",
          "Cinch line stays square, doesn't slide down the wraps",
          "Wraps stay evenly spaced, not bunched to one side",
        ],
        speak: "Pull it back toward the anchor — never let it run away into a noose.",
      },
    ],
    mistakes: [
      {
        title: "Cinching into a slip noose",
        body: "If the working end is routed so a pull keeps traveling around the loop instead of running back to the anchor, you've built a noose, not a cinch — it will keep closing under any tension instead of locking at the size you set. Route the working end back toward the anchor point, and check by tugging the standing end: a true cinch holds its width where a noose keeps shrinking.",
      },
      {
        title: "Overtightening because the wraps double the force",
        body: "The cinch line crosses two or three stacked wraps, so pulling it as hard as you would a single strand multiplies the pressure at that crossing point by however many wraps sit underneath. A cinch that looks only moderately snug is already carrying more force there than anywhere else on the band. Set it with less tension than instinct suggests, then check the result rather than yanking harder to compensate.",
      },
      {
        title: "Twisted or crossed wraps under the cinch",
        body: "When the parallel wraps cross over each other or twist before the cinch goes on, they stop sharing the load evenly — one wrap rides higher and takes most of the pressure while the others go slack underneath it. That defeats the point of laying multiple wraps in the first place. Lay the wraps flat and side by side, and confirm by eye that the band shows even parallel lines before you cinch.",
      },
      {
        title: "Cinch creeping after it's set",
        body: "A cinch on an object should hold the size it was drawn to. If tugging the standing end afterward narrows the band further or slides the cinch line down along the wraps, it wasn't actually locked by friction — it was only resting in place. Re-route the working end cleanly and draw it snug again, then re-check with a firm tug before treating the structure as finished.",
      },
    ],
    watch: [
      "Do not derive a body-placement rule from this diagram or from anatomical landmarks.",
      "Learn body application, monitoring, and rapid release from a qualified in-person instructor.",
    ],
  },
  {
    slug: "square",
    name: "Square Knot",
    jp: "本結び",
    summary:
      "A decorative end-joining category shown only on loose, unoccupied material. It is not a lock, backup, or component for body restraint or a person-bearing system.",
    cinches: false,
    loadBearing: false,
    steps: [
      {
        title: "First throw",
        body: "On loose, unoccupied practice material, cross the right end over the left and tuck it under without applying load.",
        speak: "Practice the first throw only on loose, unoccupied material.",
      },
      {
        title: "Second throw",
        body: "Cross the left end over the right and tuck it under. Dress the loose sample only for visual recognition, then untie it; appearance does not validate strength, security, or body use.",
        speak: "Dress the loose sample for recognition, then untie it.",
      },
    ],
    mistakes: [
      {
        title: "Second throw repeats the first (tying a granny)",
        body: "The square knot depends on the two throws being mirror images of each other: right-over-left then left-over-right. If the second throw copies the handedness of the first instead of reversing it, you get a granny knot. It looks almost the same lying flat, but the interlocking bights sit at an angle rather than square to the standing parts, and under any pull the knot capsizes and rolls through itself instead of holding its shape. Check by seeing whether both ends and both standing parts exit the knot parallel, on the same side, top and bottom.",
      },
      {
        title: "Using it as a load-bearing join",
        body: "A square knot is a binding and decorative knot, not a joining knot for two ropes under real tension. Its security comes from friction between two ends of similar rope pressed flat against each other with no load pulling them apart; put a hard, steady pull on both standing parts and the interlocked bights slide, capsize into a girth-hitch shape, and the ends work loose. This is true of the knot's construction in general, independent of any body use, which is why rope-craft references pair it with a bend like a fisherman's knot whenever an actual working load is expected.",
      },
      {
        title: "Joining ropes of different diameter or material",
        body: "The two throws only grip each other when the ends are close to the same thickness and the same surface friction. Join a thick cord to a thin one, or a slick synthetic to a fuzzy natural-fiber rope, and one bight can pull straight through the other because there isn't enough contact area or grip to hold it in place. On mismatched material the knot will look identical when first dressed and still fail apart the moment you snug it down.",
      },
      {
        title: "Snugging one end instead of both together",
        body: "Because the knot's shape depends on two bights seated symmetrically against each other, pulling only one end (or one standing part) tight while the other stays slack drags that side's bight out of alignment and can spill the second throw before it locks. Take up slack on both ends at the same time, in small even pulls, so the two throws close on each other symmetrically instead of one sliding through the other.",
      },
      {
        title: "Mistaking a neat lay for a finished, secure knot",
        body: "A square knot dressed for a clean photo or demonstration can look identical whether or not the second throw actually reversed the first. Flat, symmetric appearance on a loose sample tells you the knot was dressed carefully; it does not tell you the throws were tied in opposing directions or that the knot would hold under a real pull. Confirm the construction by tracing each end back through its own throw, not by how tidy the finished shape looks.",
      },
    ],
    watch: [
      "Visual flatness does not establish security, compatibility, or load capacity.",
      "Do not use this entry to choose, back up, or validate any loaded or person-bearing connection.",
    ],
  },
  {
    slug: "reverse-tension",
    name: "Reverse Tension",
    jp: "返し",
    summary:
      "The Japanese way to change direction without a bulky knot: wrap, then fold the working pair back over itself so friction holds the line. The backbone of harnesses.",
    cinches: false,
    loadBearing: false,
    // Written out properly because five catalog entries send the reader here —
    // karada, shinju, hishi, tasuki and kikkou all say "turn it with a reverse
    // tension" and then stop. Before this, the page they arrived at described
    // the whole technique in one sentence ("reverse 180 degrees so the working
    // pair lies over the standing pair") with no account of which way the fold
    // goes, what dressing it means, or how to tell a good one from one that
    // will creep. A pattern drill that cites a knot entry is only as followable
    // as the entry it cites.
    steps: [
      {
        title: "1 · Understand what you are about to make",
        body: "A reverse tension is a direction change, not a knot. You bring the doubled rope up to the point where you want the line to turn, fold it back on itself, and let the friction of rope lying against rope hold the turn while the standing part stays under tension. Nothing is tied. That is the entire point: a knot at every turn would leave a hard lump at every turn, and a harness is mostly turns.",
        do: "Look at where your rope is going and decide where it should turn. Say the direction out loud before you fold anything — this is the step people skip, and a fold made in the wrong direction has to be undone rather than adjusted.",
        doBullets: [
          "Find the point where you want the line to change direction.",
          "Say out loud which way it is going to turn.",
          "Keep the standing pair — the rope behind you — under steady tension.",
        ],
        check:
          "You can point at the turning point and say which direction the rope leaves it. Nothing is tied yet.",
        checkBullets: [
          "You know where the turn happens.",
          "You know which way the rope leaves it.",
          "No knot has been made.",
        ],
        speak: "This is a direction change, not a knot. Decide which way it turns.",
      },
      {
        title: "2 · Take the working pair under the wraps",
        body: "Pass the working pair — the two strands you are travelling with — underneath the wrap already lying at the turning point, and bring it out the other side. Go under the wrap, not over it: the wrap is what the fold will press against, and a fold sitting on top of a wrap has nothing holding it down. On a prop you can lift the wrap with a finger to make room. If the rope will not pass without force, the wrap is too tight to work with rather than the pass being wrong.",
        do: "Slide the working pair under the existing wrap and out the far side, keeping the two strands flat and side by side as they go.",
        doBullets: [
          "Pass the working pair under the wrap, not over it.",
          "Keep the two strands flat and parallel — do not let them twist.",
          "If it will not pass without forcing, loosen the wrap instead of pulling harder.",
        ],
        check:
          "The working pair comes out the far side of the wrap, both strands flat and lying beside each other rather than crossed.",
        checkBullets: [
          "It went under the wrap.",
          "Both strands are flat, not twisted around each other.",
          "You did not have to force it.",
        ],
        speak: "Under the wrap, not over it. Both strands flat.",
      },
      {
        title: "3 · Fold it back on itself, one hundred and eighty degrees",
        body: "Now turn the working pair back the way it came, folding it hard over the wrap so it lies against its own standing part. That fold is the whole mechanism: rope pressed against rope, held there by the tension you keep on the standing pair. Fold it fully — a lazy fold of ninety or a hundred and twenty degrees has far less rope in contact and will creep as soon as the pull changes direction. Keep tension on the standing pair the entire time you are folding; the moment it goes slack the fold opens.",
        do: "Fold the working pair back over the wrap until it lies alongside the rope it came from, holding steady tension on the standing pair throughout.",
        doBullets: [
          "Fold it all the way back, not part-way.",
          "Keep the standing pair under tension while you fold.",
          "Let the fold sit on the wrap, so the wrap is pressed between rope and form.",
        ],
        check:
          "The working pair now runs back alongside its own standing part, and the fold sits on the wrap rather than beside it.",
        checkBullets: [
          "The fold is a full turn back, not a gentle bend.",
          "The fold is sitting on the wrap.",
          "The standing pair never went slack.",
        ],
        speak: "Fold it all the way back. Keep the standing pair tight.",
      },
      {
        title: "4 · Dress it, then test it by pulling the wrong way",
        body: "Dressing means laying the strands so they sit flat and parallel where they cross, with no strand riding on top of another. An undressed fold has less rope in contact and concentrates the load onto whichever strand ended up on top. Once it is dressed, pull the working pair in the direction the line is about to travel and watch the fold: a good one stays where it is, and a poor one slides along the wrap or opens out. This is the useful part of the drill — the failure is visible on a prop, quietly, with nobody waiting on you.",
        do: "Lay the strands flat where they cross, then pull the working pair along its new direction and watch whether the fold moves.",
        doBullets: [
          "Lay the crossing strands flat and parallel — no strand riding on another.",
          "Pull the working pair the way the line is about to go.",
          "Watch the fold, not your hands.",
        ],
        check:
          "The strands lie flat where they cross, and you have seen for yourself whether the fold stays put or creeps when pulled. A fold that moves is one to lay again, not one to tighten.",
        checkBullets: [
          "Strands flat where they cross.",
          "You pulled it and watched what happened.",
          "If it crept, you laid it again rather than pulling harder.",
        ],
        speak: "Dress it flat, then pull and watch whether it moves.",
      },
    ],
    mistakes: [
      {
        title: "Threading the fold over the wrap instead of under it",
        body: "The working pair has to pass underneath the wrap at the turning point so the fold has something solid to press down against. Go over the top instead and the fold just lies on bare rope with nothing beneath it — it looks identical for a second, then slides straight along the wrap the moment tension changes. Check by looking at what the fold is actually resting on: if you can see bare rope beneath the fold instead of the wrap, pull it out and rethread it low, underneath the wrap this time.",
      },
      {
        title: "Letting the standing part go slack mid-fold",
        body: "This knot has no locking mechanism of its own — the fold holds only because the standing pair stays under tension and presses it against the wrap. Relax that tension for a moment to get a tidier-looking fold and you remove the one thing doing the work; the rope will sit there looking finished with nothing actually gripping. Keep a hand or your body weight on the standing part the entire time you are folding, not just before and after.",
      },
      {
        title: "Leaving the strands crossed instead of dressed flat",
        body: "Dressing means the two strands of the working pair lie side by side and parallel where they cross the wrap, spreading the friction across both of them evenly. Skip this and the strands cross each other at an angle, so only the strand on top is actually gripping while the other one is just along for the ride — that single strand takes the full load and is the one that slips first. Run a finger along the cross point and separate the strands flat before you move on.",
      },
      {
        title: "Testing the fold in the wrong direction",
        body: "The fold only has to resist the direction the line travels next, so the test in step four means pulling the working pair that way, not tugging on the standing part or pulling back the way the rope already came. Pulling backward tells you the wrap is holding, which was never in question, and lets a bad fold pass as good. Pull the working pair the direction it is about to travel and watch specifically whether the fold itself shifts along the wrap.",
      },
      {
        title: "Folding at less than a full one-hundred-eighty degrees",
        body: "The mechanism depends on the working pair doubling straight back against its own standing part — a half-hearted fold that only bends partway leaves a shallow angle with a small contact patch instead of rope pressed flat against rope. A shallow fold holds under a straight pull but opens the moment the direction of travel shifts even slightly, which is exactly what happens as a harness is built out around it. Fold it hard enough that the working pair is running back parallel to itself, not at a diagonal.",
      },
    ],
    watch: [
      "If the practice fold slips, reset the unoccupied drill. This entry does not validate a body harness or loaded use.",
      "A reverse tension holds by friction alone, so it can creep when the direction of pull changes. Seeing one hold in a drill says nothing about how it behaves under a pull it has not met.",
    ],
  },
  {
    slug: "sheet-bend",
    name: "Sheet Bend",
    jp: "シートベンド",
    summary:
      "Joins two ropes for non-loaded floor craft. This entry does not validate the knot for human load or suspension.",
    cinches: false,
    loadBearing: false,
    steps: [
      {
        title: "Form the bight",
        body: "A sheet bend joins two ropes by trapping one working end against a bight folded in the other. Fold a bight near the end of the first rope — call it the standing rope — leaving both the bight's legs and its closed end clearly visible so there is somewhere for the second rope to travel around.",
        do: "Fold the standing rope back on itself a hand's width or so from its end, so you have a bight with an open mouth and a closed round end. Hold the bight so both legs run parallel and the mouth stays open — you are about to feed the second rope's working end through it.",
        doBullets: [
          "Fold the rope back on itself near its end to form a bight",
          "Keep both legs of the bight parallel, not twisted",
          "Leave the mouth of the bight open and easy to feed through",
        ],
        check:
          "The bight sits open with two parallel legs and a rounded closed end, and nothing is pinched shut yet.",
        checkBullets: [
          "Bight is open, not pinched closed",
          "Two legs run parallel, not twisted",
          "Closed end is rounded and visible",
        ],
        speak: "Fold a bight and keep it open — this is what the second rope threads through.",
      },
      {
        title: "Thread the second rope through, around, and under itself",
        body: "The second rope's working end does all the locking: it enters the bight from the front, wraps around behind both legs together, then tucks under its own strand where it first crossed the bight — not through the bight a second time. Trapped that way, pulling the two standing parts apart only presses the crossing tighter; done the mirrored way instead, it looks identical at rest but slips loose the moment one side is pulled harder than the other.",
        do: "Pass the working end of the second rope up through the mouth of the bight, take it fully around the back of both legs together, and bring it back across the front to tuck it underneath the part of itself that first crossed the bight — so it pins between that crossing and its own standing part, and both working ends end up finishing on the same side of the knot.",
        doBullets: [
          "Pass the working end up through the bight's mouth",
          "Wrap it around behind both legs of the bight together",
          "Tuck it back under its own strand, not through the bight again",
          "Check both working ends finish on the same side",
        ],
        check:
          "Both working ends exit the knot on the same side, and the second rope's tuck is trapped under its own crossing rather than threaded back through the bight.",
        checkBullets: [
          "Both working ends on the same side",
          "Tucked under its own strand, not back through the bight",
          "Dressed flat, not twisted",
        ],
        speak: "Around the back, then tuck under itself — both ends finish the same side.",
      },
    ],
    mistakes: [
      {
        title: "Tucking the working end the wrong way round",
        body: "This is the granny version of the sheet bend: the working end gets tucked under itself from the wrong side, so it ends up in front of the bight's crossing point instead of pinned behind it. At a glance the two versions look identical, but the granny version has no built-in jamming action — pull the two ropes apart unevenly and the tuck slides straight through the bight instead of biting down on it.",
      },
      {
        title: "Making the thinner rope the bight",
        body: "When the two ropes differ in diameter, form the bight in the thicker or stiffer rope and tuck the thinner one around it, not the other way round. A bight tied in limp, thin rope collapses under the tuck instead of holding its shape, so the join ends up loose and lopsided even when every tuck is in the technically right place.",
      },
      {
        title: "Tucking back through the bight instead of under itself",
        body: "The working end's final tuck goes under its own standing part, pinned between that part and the crossing point — it does not go back through the loop of the bight a second time. Threading it through the bight again produces a different, weaker arrangement with nothing actually holding the tuck in place once tension comes off the rope.",
      },
      {
        title: "Cinching it down as if it were a permanent splice",
        body: "A sheet bend is a joining knot meant to come apart again once the two ropes get separated for storage or the next project. Hauling it fully tight the way you would a locking hitch work-hardens the tuck into the bight and turns a knot that should untie with a thumbnail into one you have to fight apart, or cut, later.",
      },
      {
        title: "Skipping the dress and pulling on a loose knot",
        body: "Before you trust the join, snug down all four parts — the bight's two legs, the tuck, and the working end's own standing part — so they lie flat and parallel instead of crossed and bunched. Skip this step and the knot can look tied while the slack in those parts lets the whole thing shift and roll the moment the pull turns uneven, walking the tuck loose instead of biting down on the bight.",
      },
    ],
    watch: ["Do not use this app entry to select or validate a load-bearing join."],
  },
  {
    slug: "munter",
    name: "Munter Hitch",
    jp: "マンター",
    summary:
      "A load-management hitch named here only for instructor discussion. This app does not teach or validate its use with a person.",
    cinches: false,
    loadBearing: false,
    steps: [
      {
        title: "Instructor-only",
        body: "Learn load management, backups, failure response, and emergency release hands-on from a qualified in-person instructor. Do not load a person from this entry.",
        speak: "Instructor-only. Do not load a person from this app.",
      },
    ],
    mistakes: [
      {
        title: "Mistaking recognition for qualification",
        body: "Being able to name the Munter Hitch and pick it out in a photo or diagram is not the same as having hands-on training in how it behaves under load. People learn to run this hitch from a qualified instructor through real supervised practice, not from an app entry. The gap between knowing what something is called and being qualified to rig it is the entire reason this entry stops at recognition, not a shortcut around that gap.",
      },
      {
        title: "Treating a still photo as proof a setup is correct",
        body: "A photograph or video frame shows one angle at one instant. It cannot show whether the load path is correct, whether the hitch is holding the way it looks like it's holding, or whether that stays true as weight shifts a second later. A picture that looks right is not the same evidence as a qualified person checking the actual rope in front of them.",
      },
      {
        title: "Borrowing confidence from a different rope discipline",
        body: "The Munter Hitch shows up in climbing belay and rappel backups, rope access, and mountaineering, and someone fluent in one of those settings will recognize its shape on sight. That recognition can feel like competence carried into an unrelated rigging context. The margins for error, the consequences of a mistake, and what a qualified person insists on checking before trusting the hitch all change with the setting, and familiarity from one discipline does not transfer automatically to a person-bearing rig in another.",
      },
      {
        title: "Reading this app's description as sign-off",
        body: "This entry names the Munter Hitch for discussion with a qualified instructor, nothing more. A written description, a chat response, or any output from this app has no way to see the actual rope, the actual load, or the person involved, and cannot confirm a setup is sound no matter how specific or confident the wording sounds.",
      },
      {
        title: "Assuming an uneventful lower means the system was sound",
        body: "A Munter Hitch that held or lowered a load without incident on one attempt tells you it didn't fail that particular time. It does not tell you why, and a setup with a real error in it can look identical to a correct one for many uses before the difference shows up. Absence of a problem so far is not the same as a system actually checked by someone qualified to check it.",
      },
    ],
    watch: ["A remote description or image cannot validate a lowering system."],
  },
  {
    slug: "surgeon",
    name: "Surgeon's Knot",
    jp: "外科結び",
    summary:
      "A square-knot variation for unoccupied craft practice. It is not a person-bearing or suspension lock.",
    cinches: false,
    loadBearing: false,
    steps: [
      {
        title: "Double first throw",
        body: "A surgeon's knot is a square knot with one change: the first crossing gets an extra wrap before you pull it through. That extra friction is what holds the throw in place on its own, which is the entire reason to use this over a plain square knot — a plain first throw alone will slip loose while your hands are busy tying the second.",
        do: "Cross the right end over the left, then instead of pulling straight through as you would for a plain square knot, wrap the right end around the left a second time in the same direction before drawing both ends through. Snug it down — this doubled first throw should hold its own tension without your hands pinning it.",
        doBullets: [
          "Cross the right end over the left",
          "Wrap around a second time in the same direction before pulling through",
          "Snug it down and let go — it should hold on its own",
        ],
        check:
          "Let go of both ends: the doubled first throw stays snug and does not loosen or slip apart on its own.",
        checkBullets: [
          "Doubled throw holds its tension unassisted",
          "Both wraps lie flat, not crossed over each other",
        ],
        speak: "Wrap around twice before you pull it through — then let go and check it holds.",
      },
      {
        title: "Finish with a single opposite throw",
        body: "The second throw is a normal, single crossing — left over right, the opposite direction from the first — exactly like the second throw of a plain square knot. That single opposite crossing is what locks the whole thing flat; doubling this throw instead of the first does not solve the problem the extra wrap exists for, and produces a lopsided knot that can slip under load instead of one that lies flat.",
        do: "Cross the left end over the right once — a single crossing, not doubled — and tuck it through, the same way you would finish a plain square knot. Dress both throws flat against each other before testing.",
        doBullets: [
          "Cross the left end over the right once, single crossing only",
          "Tuck it through the same way as a plain square knot's second throw",
          "Dress both throws flat against each other",
        ],
        check:
          "The finished knot lies flat like a square knot, with the doubled throw on one side balanced by a single opposite throw on the other — not lopsided, and not held together by pinching.",
        checkBullets: [
          "Lies flat, not lopsided",
          "Second throw is single, not doubled",
          "Both throws dressed flat against each other",
        ],
        speak: "Single crossing, opposite direction — dress it flat like a square knot.",
      },
    ],
    mistakes: [
      {
        title: "Doubling the second throw instead of the first",
        body: "The extra wrap belongs on throw one only. Doubling throw two instead leaves the vulnerable moment - right after the first throw, before the second is shaped - completely unprotected, so the first throw still creeps loose while your hands are busy shaping the second. It also produces a lopsided, twisted knot rather than a flat one, because a doubled second throw fights the first throw's direction instead of locking against it the way a correctly-built surgeon's knot does.",
      },
      {
        title: "Skipping the extra wrap entirely",
        body: "Tying a plain single-wrap first throw defeats the reason this variant exists. A surgeon's knot is used precisely because one wrap of friction isn't enough to hold tension while both hands let go of the first throw to shape the second - a single-wrap first throw creeps loose in that gap, and you'll find the two working ends have gone slack before you ever get to the locking throw.",
      },
      {
        title: "Crossing the extra wrap over itself",
        body: "The second turn of the first throw should run as a second parallel pass through the same loop, sitting flat alongside the first pass - not twisted or stacked on top of it. If the extra wrap crosses itself instead of lying cleanly next to the first turn, the two turns bind against each other rather than gripping the standing part, so you get the bulk of a doubled throw without the friction it's supposed to add.",
      },
      {
        title: "Stopping after the doubled first throw",
        body: "A surgeon's knot is only half-built once the double wrap is in - it still needs a single, opposite-direction second throw to become a true square knot. Stopping there, or repeating the same crossing direction for both throws, leaves something that looks tied but is really a wrapped overhand: it holds friction briefly but has none of the flat, symmetric locking geometry a reef knot relies on to stay put.",
      },
      {
        title: "Dressing the double wrap loose",
        body: "If you pull the ends taut without first seating the two turns of the first throw snugly against each other, one turn ends up carrying all the tension while the other rides loose beside it. That defeats the redundancy the double wrap exists for - snug both turns down evenly before you add the second throw, rather than only checking the pair's overall tightness at the end.",
      },
    ],
    watch: ["Still not a suspension lock."],
  },
  {
    slug: "half-hitch",
    name: "Half Hitch",
    jp: "ハーフヒッチ",
    summary:
      "A basic hitch shown for unoccupied craft practice. This entry does not select or validate a loaded lock.",
    cinches: false,
    loadBearing: false,
    steps: [
      {
        title: "Around and through",
        body: "On an unoccupied object, take the working end around the standing part and through its loop, then dress for inspection.",
        speak: "Around, through, snug.",
      },
    ],
    mistakes: [
      {
        title: "Wrapping around the object, not the standing part",
        body: "The working end needs to pass around the rope's own standing part and back through the loop it makes there — not around the dowel, chair leg, or post the rope is looped over. Wrap around the object itself instead and you get a girth-hitch-like turn with no crossing point to bite; it slides along the object under the lightest pull instead of holding its position.",
      },
      {
        title: "Leaving the crossing loose instead of dressed",
        body: "After the working end comes through the loop, the crossing has to be snugged down against the standing part until the two lengths sit flush and the loop closes tight around them. A hitch left baggy at that crossing isn't actually holding anything yet — any tug on the standing part can walk the working end back out of the loop it just passed through, so dress it fully before calling the hitch finished.",
      },
      {
        title: "Trusting a single hitch to resist a sideways pull",
        body: "One half hitch on a smooth dowel or chair leg holds fine when pulled in line with the standing part, but pull it from an angle instead and the whole hitch rolls around the object rather than staying put, because a lone crossing has nothing bracing it against rotation. Stack a second hitch, or seat the first one against a knob, ridge, or corner on the practice object so it has something to catch on.",
      },
      {
        title: "Switching wrap direction if you repeat the hitch",
        body: "A half hitch can be tied with the working end crossing over the standing part from either side, and either way produces a working hitch on its own. But if you add more than one hitch to the same dowel or practice cord, pick one crossing direction and keep it: cross the opposite way on a later hitch and it jams against the one before it instead of nesting the same way, so the stack sits lumpy and uneven instead of lying in a flat, inspectable line.",
      },
      {
        title: "Cutting the tail short right after the hitch",
        body: "Leave only a stub of working end past the final half hitch and there is nothing left to grip if the crossing is ever nudged loose — the end can pull straight back through the loop with no warning and no way to recover it by hand. Leave enough tail past the hitch that you could re-dress or re-tighten it before calling the practice piece finished.",
      },
    ],
    watch: [
      "A hitch that looks familiar can still move or release unpredictably.",
      "Do not use this recognition entry to select or build a loaded lock or body-restraint component.",
    ],
  },
  {
    slug: "portuguese-bowline",
    name: "Portuguese Bowline",
    jp: "ポルトガルボウライン",
    summary:
      "A two-loop bowline category shown only for recognition on an unoccupied practice object. This entry does not teach body restraint or loaded use.",
    cinches: false,
    loadBearing: false,
    steps: [
      {
        title: "Two loops",
        body: "Recognize two sibling loops on an unoccupied practice object. Learn construction, inspection, body application, and release hands-on before any restraint use.",
        speak: "Recognition only on an unoccupied object.",
      },
    ],
    mistakes: [
      {
        title: "Assuming the two loops are functionally identical",
        body: "A Portuguese bowline finishes as two loops sitting side by side, but they are not interchangeable — one is fixed in size and the other is adjustable, and the two are not meant to carry the same role. Nothing about how the pair looks from outside tells you which loop is which, or confirms that either one is actually the loop it appears to be. Assuming that what's true of one loop is automatically true of its neighbor is a recognition shortcut, and it's exactly the kind of judgment call this entry cannot make for you from a description or a photo.",
      },
      {
        title: "Confusing this knot for a Spanish bowline",
        body: "A Spanish bowline also finishes as two loops coming off a knotted body, and set next to a Portuguese bowline — in a photo, across a room, tied on a practice dowel — the two silhouettes are close enough to swap by mistake. They are different knots, built differently underneath, and this app does not teach you to tell them apart by construction. Naming one because its outline matched a picture of the other is a recognition error, not a minor labeling slip, and it matters because the two are not used the same way.",
      },
      {
        title: "Treating a finished-knot photo as proof of correct construction",
        body: "A photograph shows the outer shape: two loops, evenly seated, no stray tail poking out. It cannot show what the rope is doing on the inside of that shape, which is exactly where a Portuguese bowline can be built wrong while still looking, from the outside, like the real thing. Matching a picture to this catalog entry tells you what the knot is called. It does not tell you that a specific tied instance is sound, and treating those two as the same skill is the mistake.",
      },
      {
        title: "Assuming familiarity with an ordinary bowline carries over",
        body: "The name puts 'bowline' front and center, and the standard single-loop bowline is common enough that a lot of people can already tie one without thinking hard about it. The Portuguese bowline is not a small variation on that knot — it has a second loop and a different role, which is exactly why this app treats it as recognition-only instead of teaching it the way it teaches the plain bowline. Carrying confidence from one over to the other is a mistake precisely because the two look related and are not equivalent.",
      },
      {
        title: "Treating this entry as a stand-in for instructor training",
        body: "This page exists so you can recognise the Portuguese bowline's name and its two-loop shape on an unoccupied object — nothing more. Reading this description, matching it to the photo, or handling a practice cord does not build the judgment needed to verify that a real, person-bearing instance of it is sound. A photo, a familiar name, or a tidy-looking result cannot validate construction, and no amount of familiarity with the picture substitutes for the training this app deliberately does not provide here.",
      },
    ],
    watch: [
      "A visually similar loop does not establish correct construction, fit, or safe body use.",
    ],
  },
  {
    slug: "figure-eight",
    name: "Figure Eight on a Bight: Instructor Route",
    jp: "フィギュアエイト",
    summary:
      "A loop category used in engineered systems. This app names it for recognition but does not teach or approve person-bearing use.",
    cinches: false,
    loadBearing: false,
    steps: [
      {
        title: "Recognition only",
        body: "Learn construction, inspection, compatibility, loading, backups, and release through qualified in-person instruction and the relevant manufacturer or standards guidance. Do not load a person from this entry.",
        speak: "Recognition only. Do not load a person from this app.",
      },
    ],
    mistakes: [
      {
        title: "Mistaking a photo match for a correct tie",
        body: "A figure eight on a bight can look right in a single photo while everything that actually determines whether it is sound is invisible at that resolution — a picture cannot validate construction any more than a timer or a symptom-free moment can. This entry lets you recognise and name the knot when talking with a qualified instructor; it is not a reference image to hold your own rigging up against and call confirmed. If comparing a photo to your rope is the last check you are running, that comparison is the mistake.",
      },
      {
        title: "Treating the catalog listing as sign-off on this loop",
        body: "This entry exists so you can put a name to the closed eye tied into a doubled bight that shows up at the end of a suspension line — nothing more. Because it has a name, a summary, and a link from another entry that cites it, the loop can read as pre-approved for building or clipping into. It teaches you to recognise that eye shape in conversation, not whether this particular loop, tied in this particular rope, in this particular spot, is sound. Treating 'the app has a page for this loop' as 'the app told me to go ahead and tie one' is exactly the gap qualified in-person instruction exists to close.",
      },
      {
        title: "Reading an uneventful past session as proof for this loop",
        body: "A bight loop that held weight without incident last time tells you only that it did not fail that time, under that load, in that spot — it says nothing about whether the bight was doubled correctly, the eye was dressed correctly, or the rope was sound that day either. The finished eye can look identical from one tie to the next while the geometry inside it differs. Treating a memory of 'it held before' as evidence the technique was correct is a mistake a qualified instructor is trained to catch in person, and one a rigger reviewing only their own recollection is not.",
      },
      {
        title: "Letting a model or app response stand in for a teacher",
        body: "An AI response, an app entry, or a chat that correctly names a loop as a figure eight on a bight can sound authoritative without being able to see the eye you actually tied, how the bight was doubled, or the rope it's sitting in. If any description here or anywhere else reads as confirmation that a specific loop in front of you is put together soundly, that reading is the mistake — none of these can inspect the actual knot in the room. This entry hands you a name and a boundary, not a stand-in for a person who can.",
      },
      {
        title: "Confusing this bight loop with a follow-through or other loop",
        body: "A figure eight on a bight and a figure eight follow-through finish as the same-looking compact eye with a tail, even though one is doubled straight from a bight and the other is retraced strand-by-strand around an anchor — and both can be confused at a glance with an alpine butterfly or a doubled overhand loop. Close enough in a fast tie or a low-resolution photo that the wrong name ends up attached to the wrong loop, and the two builds are not interchangeable in how they're meant to be used. Naming the wrong one to an instructor, or trusting a tutorial for the wrong one, starts the whole conversation from a false premise before any real evaluation happens.",
      },
    ],
    watch: [
      "Visual similarity cannot validate the knot, rope, connector, anchor, or complete system.",
    ],
  },
];

/**
 * `usedIn` for every knot, computed once from the ties that actually cite it
 * rather than hand-copied onto the knot. `Tie.knots` is the only place this
 * relationship is authored; a knot's own page just reflects it back.
 */
function usedInFor(slug: string): string[] {
  return TIES.filter((tie) => tie.knots.includes(slug)).map((tie) => tie.slug);
}

export const KNOTS: Knot[] = [...CORE_KNOTS, ...MORE_KNOTS].map((knot) => ({
  ...knot,
  usedIn: usedInFor(knot.slug),
}));

export function getKnot(slug: string) {
  return KNOTS.find((k) => k.slug === slug);
}
