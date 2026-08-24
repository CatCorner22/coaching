import type { Tie, TieStep } from "./types";

/**
 * What each prop drill actually teaches, kept beside the other drills rather
 * than inside the tie definitions.
 *
 * Every one of these pages used to render the same paragraph. Twelve drills —
 * diamonds, hexagons, an open net, a ladder, a corset lacing, a flower knot —
 * and one shared 189-character step between them that named none of those
 * things. The catalog entries carried distinct titles, distinct summaries and
 * distinct band counts, so every structural test passed; there was simply no
 * instruction on any of the pages.
 *
 * The content lives here for two reasons. It is long, and burying it inside
 * `unoccupiedPractice({ ... })` calls would make the tie definitions unreadable
 * for the parts that matter — the slug, the level, the risk framing. And having
 * one table keyed by slug makes the failure that started all this visible at a
 * glance: a drill missing from this table renders the factory's placeholder
 * step, and `catalog-expansion.test.ts` fails by name when one does.
 *
 * What is NOT here, deliberately: the setup step, the strip-down step, the
 * universal stop conditions, and the two closing mistakes. Those are appended
 * by `unoccupiedPractice` so that no drill can be published without the
 * sentence about who is not in the pattern, or without rehearsing how the rope
 * comes off. Authored content extends the safety copy; it never replaces it.
 */
export type PropDrillContent = {
  goal: string;
  steps: TieStep[];
  mistakes: Tie["mistakes"];
  variations: Tie["variations"];
};

const PROP_DRILLS: Record<string, PropDrillContent> = {
  "amime": {
    goal: "A six-cell-round open lattice hung off a measured header on one continuous line: a drill in even spacing, cumulative drift and rope management.",
    steps: [
      {
        title: "1 · Lay the header and mark six points on the form",
        goal: "Put down the single level circuit that every cell in the net will hang from, and divide it into six measured intervals before any cell exists.",
        rigger:
          "Choose a level line about a third of the way down the form, on a section whose circumference changes as little as possible over the next twenty centimetres, because a header laid across a taper will not stay level no matter how carefully you dress it. Take one full circuit of rope round the form there, leaving a tail of about thirty centimetres. Bring the working end round to meet that tail and join the two with a square knot, backed by a half hitch on each side so it cannot creep. Flake the rope out on the floor before you tie, because the entire remaining working length has to pass through that knot as you close it and fighting a tangle one-handed is how people end up yanking the circuit crooked. Lay the circuit flat as you close it: one strand, no twist along its length, sitting level rather than in a slow spiral, because every cell hangs off this line and a spiralling header builds a spiralling net. Snug it only until it stops sliding when you push it along with a thumb, and no further. Now name the face the knot sits on. That is the seam, and from here every circuit starts and finishes there. Finally, measure the circuit with a tape, divide the number by six, and step that distance round the form, marking six points with chalk or a tab of low-tack tape on the form itself, not on the rope. Marks on the form stay put while rope moves, which is the only way you will later see a hitch dragging the header along behind it. Do not eyeball the sixths. Eyeballed sixths look convincing for exactly one row.",
        bottom:
          "Nobody is inside this pattern and nobody will be; the form is an object and stays one for the whole drill. If a second person is in the room, hand them the tape and have them read the six divisions back to you while you mark, because an arithmetic slip is invisible to the person making it and obvious to the person watching.",
        check:
          "One flat, level circuit with no twist in it, the knot on the face you have named the seam, and six marks stepped off a measured circumference rather than judged — walk the tape round gap by gap and look for any pair differing by more than a centimetre.",
        speak: "Level header, knot at the seam, six marks measured onto the form.",
        expected: {"wrapBands":1,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"band","y":0.28}],
      },
      {
        title: "2 · Hang the first row of six scallops",
        goal: "Hang the first row of the net by hitching to the header at each mark and letting a gauged length of rope swag down between them.",
        rigger:
          "Decide now which way round the form you will travel and never change it: say, to your right as you stand at the seam, and every circuit after this one goes the same way. Carry the working end from the seam to the first mark. Pass the end up behind the header, over the top of it, and back down across its own standing part, then draw it snug. That is a half hitch, and it is the join this net is made of. On the header take two of them, one after the other in the same direction, because a single half hitch on a taut straight line slides along that line and takes your spacing with it; on the rows below, where each hitch grips a hanging bight instead, one turn is enough. Seat the hitch on the mark rather than beside it. Now the depth, which is the number the whole pattern is built on. Do not judge it by eye. Cut a strip of card or pick up a chopstick at the depth you want, six to eight centimetres being easy to see, hold one end of it against the header at the mark you are leaving, and feed rope out until the lowest point of the swag hangs level with the far end of the gauge. Pinch the rope there with your off hand, carry the end on to the next mark, and only then take the hitch. Work all six marks that way and finish back at the seam with six hitches taken and six loops hanging. Every hitch the same way round — always up behind and down to the left, or always the other way, never a mixture.",
        bottom:
          "The pattern has nobody in it, which is the whole reason you can afford to work this slowly and untie a hitch you do not like. An observer earns their place here as a counter: ask them to count the hitches aloud with you as you travel, because six is easy to hold in your head and easy to lose the moment you start thinking about tension instead.",
        check:
          "Six loops hanging from six hitches, one hitch on every mark and none between marks, every low point sitting at the same gauge depth below the header, and all six hitches lying the same way round — sight along the row and see which side the working leg leaves each hitch on.",
        speak: "Six hitches, six scallops, gauge every low point before you move on.",
        expected: {"wrapBands":2,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"band","y":0.36}],
      },
      {
        title: "3 · Step down at the seam and hitch row two into the low points",
        goal: "Produce the half-cell offset that makes this a net rather than a stack of loops, by hitching into the lowest point of each swag above.",
        rigger:
          "Mark nothing for this row. The half-cell offset is produced, not measured, and you get it by hitching into the low point of each swag above. First the step-down. You are at the seam with the last header hitch behind you, so let the working end run from that hitch diagonally down to the lowest point of the first swag. That short diagonal is the step-down, and it is the one place in each circuit where the repeating geometry breaks. It will happen three more times before you are finished, so put it in the same place every time: here, at the seam. Now hitch. Pass the end up behind the bight at the swag's lowest point, over it, down across its own standing part, and snug — the same half hitch, taken the same way round as on the header, one turn this time because it is gripping a hanging bight rather than a taut line. Seat it at the lowest point and not a centimetre to one side, because that centimetre is the width of your cell error and it will still be there in row four. Gauge the depth again, carry on to the low point of the next swag, hitch, and continue round to the seam. Cells close behind you as you travel: each is a diamond with one crossing above it on the header, one crossing at each side — the two row-one low points you have just hitched — and the bottom of the new swag closing it below, four legs of rope in all. Count them when you get back. Six. Five or seven means a swag skipped or one hitched twice, and the repair is to undo back to the fault rather than stretch its neighbours over the gap. Do not pull this row downwards to crisp the cells up. One line runs through the whole field, so slack taken here comes straight out of the row above.",
        bottom:
          "Nothing is in the pattern but the form itself. Station an observer a quarter turn round from you and ask them to say the word 'off' whenever a crossing lands beside a low point instead of on it, because from where you are standing an off-centre hitch on the far side of the form is nearly invisible, and it is precisely the error this row exists to avoid.",
        check:
          "Six closed diamonds the whole way round, each new crossing sitting midway between two header marks rather than under one of them, and every header hitch still sitting on its own mark instead of dragged along towards the working end.",
        speak: "Hitch the lowest point of each swag. Do not pull the row down.",
        expected: {"wrapBands":3,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"band","y":0.44},{"kind":"diamond","cy":0.4}],
      },
      {
        title: "4 · Add two more rows, gauged from the header",
        goal: "Add two more rows without letting a small spacing error compound, and keep a long working end untangled and reachable while you do it.",
        rigger:
          "Two more circuits, the same move each time: step down at the seam, hitch at the low point of the swag above, gauge, hitch at the next, round to the seam. What changes is where the gauge is taken from. Hang a marked strip of card or a tape from the header down the side of the form, marked at one, two and three gauges from the header, and set each new row's low points to the next mark down. Measure from the header itself every time, never from the row immediately above it. This is the reason the pattern is worth drilling at all. Three millimetres of extra depth taken off the row above is three millimetres in row two, six in row three, nine in row four, and by then the bottom of the lattice sags visibly while no single row can be pointed at as the wrong one. Measured from the header, an error stays the size it was born. Manage the line while you work, because it will be in your way for the next twenty minutes: keep the remainder in a loose butterfly coil in your off hand, pay out about a metre at a time, and never let the tail lie in a heap on the floor, since a heap finds knots on its own and you then drag them through every new hitch. Once a row, let the free end hang and spin, because taking every hitch the same way round quietly puts turns into the rope and those turns end up in the last metre. Finish with three rows of crossings below the header and three step-downs stacked in one place at the seam.",
        bottom:
          "Still an object, still nobody in it, at every stage of the drill. This is a good moment to give an observer the working coil to hold while you walk round the form, and to ask them to call out any row that looks deeper than the one above it, because a drift of a few millimetres per row is far easier to see from across the room than from arm's length.",
        check:
          "Three rows of crossings below the header, six cells across in each row of cells, every row one gauge deeper than the one above when read off the strip hung from the header rather than measured from its neighbour, and the three step-downs stacked in one vertical line at the seam instead of wandering round the field.",
        speak: "Gauge every row from the header, never from the row above it.",
        expected: {"wrapBands":5,"pose":"stand","view":"side","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"band","y":0.52},{"kind":"band","y":0.6},{"kind":"diamond","cy":0.48},{"kind":"diamond","cy":0.56}],
      },
      {
        title: "5 · Close the bottom onto a border and dress the field",
        goal: "Gather the bottom row onto a level border line and dress every crossing so the whole lattice reads as one repeating field.",
        rigger:
          "The last pass is not another row of scallops. Carry the working end round the form on a level line and, at the lowest point of each swag in the bottom row, take one half hitch — the same direction as every other hitch in the net — so the border gathers those six low points onto a single straight line instead of leaving them hanging at six slightly different depths. A border merely threaded behind the swags without hitches slides along them and holds nothing. Take the slack out of the border in two trips round rather than one: on the first trip pull out roughly half of it, spread evenly across all six, then go round again and take the rest, because drawing each section fully home in turn drags the cells sideways towards whatever you pulled last. Close the border at the seam by tying the working end to its own standing part with a square knot, backed by a half hitch each side. Now dress the field, and dress it from the top downwards, since slack in one continuous line travels downhill and anything you square up at the bottom first comes undone the moment you correct the header. At each crossing flatten the two legs so they lie side by side rather than one riding over the other, re-take any hitch that has ended up facing the wrong way round, and nudge crossings a couple of millimetres along the leg above until each cell matches its neighbours. A well seated crossing stays where a light push leaves it and still moves under a deliberate one. Then stand back two metres and look at the whole field at once.",
        bottom:
          "The finished lattice sits on an object and on nothing else, and it comes off the same object at the end. Ask an observer to photograph the field square-on from two metres and look at the picture together, because a camera flattens the curve of the form and shows row drift that both of you will have stopped noticing after twenty minutes of close work.",
        check:
          "A bottom border running level all the way round with a hitch at every low point, six cells across in every row, no crossing with one leg riding over the other, and from two metres away no row reading deeper, shallower or more slanted than the rest.",
        speak: "Dress from the top down, then stand back and look at all of it.",
        expected: {"wrapBands":6,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"band","y":0.68},{"kind":"stem","x":0.5,"y1":0.28,"y2":0.68}],
      },
    ],
    mistakes: [
      { title: "Eyeballing the six divisions", body: "Sixths judged by eye are commonly out by a centimetre or two, and on this pattern the header is never a one-row mistake: every crossing below is placed relative to the swags hanging above it, so the header's gaps are inherited the whole way down. It surfaces as one column of cells consistently wider than its neighbours, running the full depth of the net, and by the time that is obvious there are four rows sitting on top of it. Measure the circumference, divide the number, and step the marks off the form." },
      { title: "Taking each row's depth from the row above", body: "The gauge has to hang from the header every single row. Measured from the row immediately above, an error is not corrected but carried and multiplied: three millimetres of extra depth in row two is six by row three and nine by row four, because one continuous line runs the entire field and nothing along the way resets it. The tell is a lattice that looks even across the top and sags at the bottom, with no single row you can name as the culprit. Gauged from the header, an error stays the size it was born." },
      { title: "Pulling a row down to crisp the cells up", body: "Tension here is a shared resource, not a local setting, because every cell in the field is fed by the same line. Draw row three in hard and the slack comes out of rows one and two: the header stops sitting level, hitches migrate along it towards the pull, and the cells above open exactly as fast as the ones you pulled close. The tell is a field that is tight and handsome along the bottom and gaping across the top, which no amount of further pulling ever fixes. Set the depth with the gauge and leave it alone." },
      { title: "Hitches taken in both directions", body: "A half hitch has a handedness, and this net is nothing but half hitches. Take some crossings up behind and down to the left and the rest the other way round, and the field looks visibly restless even when every measurement is correct, because the two versions sit at different angles and catch the light differently. Crouch and sight along a row: the working leg should leave every crossing on the same side. Correcting one means untying and re-taking that hitch, not tugging at it until it looks better." },
      { title: "Working out of a heap on the floor", body: "This pattern runs one long line through many minutes of work, so the tail spends most of the drill unattended. Left in a pile it finds knots on its own, collects grit, and holds the turns that same-handed hitching keeps adding. You then drag all of that through every new crossing, and the rope ratchets through the hitch instead of running through it, which makes the depth you set impossible to hold steady. The tell is the last metre corkscrewing when you let it hang free." },
    ],
    variations: [
      { name: "On a rolled duvet or a bolster", body: "A soft prop takes the header quite differently: the circuit sinks in, the marks creep out from under their hitches as the stuffing compresses, and cells that were even at the start have shifted by the fourth row. Seat the header on the fattest even section, re-measure the six gaps after the second row, and expect to spend noticeably more rope than on a firm form." },
      { name: "As a flat panel across a chair back", body: "Worked back and forth in rows with a turn at each side instead of continuous circuits, so there is no seam but there are two edges. The edge becomes the new problem: the outermost cell of each row wants to come out half width. Decide before you start whether each row turns above or below the previous row's edge crossing, and keep that decision identical every row, or the two edges will disagree with each other all the way down." },
      { name: "Twelve marks and half-depth cells", body: "Double the divisions to twelve and halve the gauge. Twice as many crossings means twice as many chances to drift and roughly double the rope to manage, and the smaller cell makes an off-centre hitch obvious about two rows sooner than the coarse version does. It is a fair way to find out whether your spacing was genuinely good or merely coarse enough to hide the error." },
      { name: "Two colours joined at the seam", body: "Join a second colour so that the rows alternate. The colour change turns drift into something readable at a glance, because a row that has crept deep shows as one thickening band of colour rather than as a general sag, and it forces you to place the join deliberately at the seam instead of wherever the first rope happens to run out." },
    ],
  },
  "cuff-pattern": {
    goal: "A two-wrap band locked across its own wraps on a dowel or bottle: a drill in laying wraps side by side and in seeing whether a structure holds its size.",
    steps: [
      {
        title: "1 · Pin the bight and lay the first wrap",
        goal: "Get one flat, deliberately slack wrap of doubled rope onto the rigid object, with the bight trapped under it and both ends free to work with.",
        rigger:
          "Hold the two ends of the rope together and run your hands down the doubled length until you reach the fold. That fold is the bight, and from here everything travels doubled, two strands moving together side by side. Choose a spot on the dowel or bottle where the diameter stays the same for at least the width of the band, so you are not working on a taper, a shoulder or a moulding seam. Lay the bight flat along the object, pointing to your left, and pin it there with your left thumb; mirror all of this if that is not how your hands work, but pick one way and keep it. Now take the two ends round the far side of the object and back to the front, so that the wrap lands across the pinned bight and traps it against the surface. Lay the two strands flat as they land, beside each other, not one rolled over the other. Do not draw it in. Leave it loose enough that you can push the wrap along the object with one finger. A dowel gives nothing back, so there is no surface to squeeze and no give to borrow later, which means the only slack this band will ever have is the slack you lay into it now.",
        bottom:
          "If someone is watching, put them level with the object and to one side so they see the band edge-on, because whether two strands are lying beside each other or rolled over is close to invisible from the hand that laid them. Their other useful job is stopping a round object rolling on the table. Nobody is in this pattern, and the object stands in for nobody.",
        check:
          "One flat wrap of doubled rope with the bight trapped under it, the two strands beside each other rather than rolled over, the loop of the bight still clear of the wrap, and the wrap moving along the object when you push it with a finger.",
        speak: "One flat wrap over the bight, loose enough to push along.",
        expected: {"wrapBands":1,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"band","y":0.4,"w":0.3}],
      },
      {
        title: "2 · Land the second wrap beside the first",
        goal: "Add a second wrap that sits parallel to the first instead of climbing over it, which is the handling skill this band exists to drill.",
        rigger:
          "Take the two ends round the object a second time, going the same way round as the first pass, and land the new wrap beside the first on the side away from the bight loop. Choose that side now and keep it for the whole band, because wraps that alternate sides end up crossing each other round the back where you are not looking. Do not place this wrap by eye. Run your free hand along the edge of the first wrap and let the new wrap come to rest against it, so the first wrap works as a fence and the second has somewhere definite to land. Keep exactly the slack you laid before; the two wraps should still push along the object together, as one unit, with the bight loop travelling with them. If the second wrap climbs on top of the first, take it off and lay it again rather than trying to press it down into place, because rope that has settled over its neighbour on a hard surface will not be persuaded sideways.",
        bottom:
          "The person watching helps most here by sighting down the length of the object and calling out the moment the new wrap starts to climb, which is far easier to see from a step away than from arm's length. They can also feed you the two ends so you are not reaching for rope mid-pass. Nobody is placed in the pattern; the object is the object and stays that way.",
        check:
          "Two wraps parallel all the way round the circumference, touching along their length with neither riding over the other, the bight loop still clear on the far side of the pair, and both wraps still pushing along the object together.",
        speak: "Second wrap beside the first, never on top of it.",
        expected: {"wrapBands":2,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"band","y":0.46,"w":0.3}],
      },
      {
        title: "3 · Take the ends under both wraps, along the object",
        goal: "Send the two working ends under the wrap bundle at right angles to it, which is the turn that will carry any later pull.",
        rigger:
          "Both ends are now coming off the second wrap at the face of the object you have been working on. Bring them to the middle of the band and feed them underneath both wraps at once, travelling along the length of the object rather than round it, moving from the second wrap toward the first so they come out on the same side as the bight loop. Under both wraps, not between them: if you can see rope running in the gap between the two wraps you have split the bundle, and the lock will end up sitting in that gap instead of across the top of it. Pull through only as much as you need to work with, a hand's length or so, because dragging the whole remaining rope through a slack band drags the wraps out of line with it. Watch the wraps rather than the ends while you feed, and stop if either wrap lifts off the surface or is tugged toward its neighbour. This crossing turn is the whole mechanism of the band. It runs at right angles to the wraps, so tension arriving along the ends is taken by a turn wrapped round the wrap bundle rather than by the circumference of the wraps themselves.",
        bottom:
          "The job here is holding the dowel so it cannot roll while you are feeding rope underneath it, and watching the two wrap edges rather than your hands, calling out the moment either wrap lifts off the surface or shifts toward the other. Nobody is in the pattern; the object is a piece of wood and is not standing in for anyone.",
        check:
          "The two ends emerging on the far side of the band having gone under both wraps at once rather than between them, running along the length of the object rather than round it, with both wraps still flat on the surface and still the same distance apart.",
        speak: "Under both wraps at once, along the object, not around it.",
        expected: {"wrapBands":2,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"stem","x":0.5,"y1":0.34,"y2":0.52}],
      },
      {
        title: "4 · Turn the ends back through the bight and set the lock",
        goal: "Reverse the ends through the bight so the crossing turn closes on the wrap bundle and a pull cannot travel round the circumference.",
        rigger:
          "The bight loop is lying right where your ends have come out from under the wraps. Feed both ends through that loop, keeping them side by side and flat rather than twisted round each other, and then turn them back the way they came, so they run over the top of the band and away along the object in the direction they first travelled. That reversal is the lock: under the wraps one way, through the bight, back over the wraps the other way. Now seat it. Pull the ends steadily along the object and watch the crossing turn settle down onto the top of the wraps, finishing proud on the rope rather than pinched between rope and surface. Then look at where the ends leave the knot. They must leave running along the length of the object. If they leave heading round the circumference, the reversal has not happened, the turn is nothing but a third wrap, and a pull will shorten the band. Keep the two wraps as loose as you laid them while you set this, because the tension you are putting in should be going into the crossing turn and nowhere else.",
        bottom:
          "This is the fiddly part, so the useful thing to watch is not your hands but the two wrap edges and the gap between them, and to say out loud if either wrap twists or creeps while your attention is on the knot. Holding the object still matters more here than anywhere else. Nothing here is on a person: nobody is in the band and nobody is waiting to be.",
        check:
          "The crossing turn seated on top of the wraps rather than pinched underneath them, the bight drawn down flat, the ends leaving the knot along the length of the object rather than round its circumference, and both wraps still slack enough to push along.",
        speak: "Through the bight, then turn the ends back the way they came.",
        expected: {"wrapBands":2,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"x","y":0.43},{"kind":"stem","x":0.5,"y1":0.18,"y2":0.34}],
      },
      {
        title: "5 · Dress the band and look at the back",
        goal: "Flatten every twist and even out the slack all the way round, so that the band you are about to test is the band you actually built.",
        rigger:
          "Dressing means making the rope lie the way it is meant to lie. Run a thumb along each wrap all the way round and flatten any place where the two strands of the doubled rope have rolled over one another. On a hard surface a twist shows as a narrow ridge standing off the object and catching the light, and it halves the width of rope actually touching. Then roll the object over, or walk round it, and look at the back of the band. The back is where splay hides: two wraps that touch neatly on the face you built them on and open into a V behind. Ease them back together by pushing the rope sideways along the surface, never by tightening anything. Spread the slack out as well, so the gap between rope and wood is about the same all the way round instead of pooling on one face while another face sits hard against the surface. Finish by pushing the whole band along the object once, to see that the pair still travels together after all that handling.",
        bottom:
          "The far side is worth another pair of eyes, because you already know what you meant to build and will see that instead of what is there. Ask for a description of the actual back of this band, whether that is a V, a ridge standing off the wood, or one wrap wandering toward an end. Nobody is in the pattern, and nothing here is a stand-in for anyone.",
        check:
          "No rolled strands anywhere round the full circumference, the two wraps touching behind as well as in front rather than opening into a V, the gap between rope and surface roughly even all the way round, and the pair still travelling together when pushed.",
        speak: "Flatten every twist, then turn it round and check the back.",
        expected: {"wrapBands":2,"pose":"stand","view":"side","handsVisible":true,"neckClear":true},
        wraps: [],
      },
      {
        title: "6 · Pull the ends and watch the wrap edges",
        goal: "Find out by pulling whether the band holds its size or closes, on a surface that cannot deform and therefore cannot hide the answer.",
        rigger:
          "This is why the drill lives on something rigid. Mark the object at each outside edge of the band first, with a pencil line, a strip of tape or the edge of a label, so you have a reference you cannot argue with afterwards. Then take the two ends, the long remainder running away from the lock, and pull them steadily and firmly with your own hand, first along the length of the object and then across it, and pull more than once. Nothing is ever made fast to anything in this drill; your hand is the only thing on the other end of that rope. Watch the wrap edges while you pull, not your hand. A band that holds its size does not change: the edges stay at the marks, the gap between rope and wood survives, and the band still pushes along afterwards. A band that closes announces itself on a hard object in a way a soft prop would swallow, and you feel it as much as see it. The wraps draw in toward each other, the gap disappears, the rope goes hard against the surface, and the band that travelled a moment ago will not move at all. Wood gives nothing back, so all of that tension has to show up in the rope, where your eyes and hands can find it. If it closed, the reversal in step four did not take. Undo the band completely and build it again rather than easing it off and carrying on, and if you alter anything at all afterwards, dress it and pull it again.",
        bottom:
          "Ask whoever is watching to stand where the two pencil marks are visible, because you cannot pull properly and look closely at the same time, and ask them to describe what the wrap edges did rather than whether it looked all right. The only things under tension here are a rope and a piece of wood; nobody is in the pattern.",
        check:
          "Under a firm pull along the object and then across it: whether the wrap edges stayed at their marks, whether the gap between rope and surface survived, and whether the band still pushes along the object afterwards.",
        speak: "Pull hard, watch the edges, not your hand.",
        expected: {"wrapBands":2,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [],
      },
    ],
    mistakes: [
      { title: "The second wrap climbs on top of the first", body: "It happens in the last hand's width of the pass, when you stop guiding the rope and let it land where it likes. From the face you are working on the band still reads as a band, so people carry on. The giveaway is that the two wraps are not parallel: they converge somewhere round the back, and one stands proud of the other, so the band has a ridge instead of a flat face. On a rigid object it also rocks rather than travels when you push it. Take that wrap off and lay it again, because rope that has settled over its neighbour on a hard surface will not slide sideways into place." },
      { title: "The ends leave the lock around the circumference", body: "This is the failure the whole drill exists to expose, and it is invisible until you pull. It happens when the ends are fed under the wraps and then simply carried on the way the wraps were already going, without turning back through the bight, so the crossing turn is not a crossing turn at all but a third wrap. The test is where the ends leave the knot: along the length of the object means the reversal took, round the circumference means it did not. Pull that band and the wrap edges march toward each other and the gap shuts. A forgiving prop would hide most of this. A dowel shows all of it." },
      { title: "Laying the wraps snug and planning to loosen them later", body: "This is the error a rigid object punishes hardest. There is no give in a dowel to borrow back, so a band laid tight has nowhere to go: you cannot redistribute the rope, you cannot open the wraps by pushing them, and every later adjustment turns into dragging the whole band along the object. You can tell long before the lock goes in, because the band will not push along when you press it and there is no gap between rope and surface anywhere round the circumference. Lay it loose enough that it looks unfinished, and let the reversal rather than the tension hold the shape." },
      { title: "The crossing turn ends up pinched under the wraps", body: "From the front this sits close enough to a finished band that it gets left alone. What has happened is that the ends went under the wraps and never came back over them, so the turn lies between rope and object instead of across the top of the bundle. Pull the ends and the whole band drags along the object rather than loading a turn seated on the wraps, and on a hard surface it grinds and sets as it goes. Run a hand over the band: the crossing should be the highest thing on it, standing off the wraps, not something you have to hunt for underneath them." },
      { title: "Judging the band from whichever side you are standing on", body: "A band on an object has a back, and the back is where the errors collect: wraps that touch neatly in front and open into a V behind, a twist invisible from where you built it, a wrap that has wandered toward one end. On a bottle it is worse, because a taper drags the wraps toward the narrow end while you are looking at the wide one. Roll the object over, or walk round it, before deciding the band is finished. What you built and what is actually there are not the same thing until you have looked at every side of it." },
    ],
    variations: [
      { name: "Swap the dowel for a bottle", body: "A taper changes the problem completely. Wraps laid on a cone want to migrate toward the narrow end, so a band that looked parallel while you laid it will have crept and splayed by the time the lock is seated. Work with the taper in mind: land each wrap a fraction toward the wide side of where you want it to finish, and judge the spacing after the reversal rather than before." },
      { name: "A chair leg with corners on it", body: "A square or turned leg gives you edges, and rope crossing an edge behaves nothing like rope on a cylinder. The wraps bridge the corners, and the slack you laid on one face is not the slack on the next. It is the most honest test of even tension in this drill, because a band that closes does it unevenly, gripping at the corners first while the flats are still open." },
      { name: "Change the rope, keep the pattern", body: "Run the same band in a stiff, dry, hairy rope and then in something slick and synthetic, back to back on the same object. The stiff rope stays where you lay it and shows a rolled strand plainly; the slick one moves while you are still working, hides a twist inside its own sheen, and lets a failed reversal creep quietly rather than announcing itself. Same geometry, entirely different hands." },
      { name: "Name where the lock lands before you start", body: "Decide out loud, before the first wrap, which face of the object the crossing turn will finish on, and then build the band so that it does. It forces you to think about rope consumption and wrap direction from the first pass instead of discovering at the end that the lock is round the back. Get it wrong and rebuild rather than sliding the band round to cover the miss." },
    ],
  },
  "hana-musubi": {
    goal: "A flat four-petal flower knot in a spare length of rope: it holds nothing, and the skill is weaving the ring, dressing the petals and closing it evenly.",
    steps: [
      {
        title: "1 · Pin the centre and lay the first petal",
        goal: "Fix the centre under a fingertip, anchor the clock reference the whole knot is measured against, and lay the first oversized petal bight out at ten-thirty.",
        rigger:
          "Work with a single strand. This knot is drawn from one continuous line, so do not double the rope. Lay it down so about twenty-five centimetres of tail points at six o'clock, straight towards you, and put the fingertip of your non-dominant hand on the point where that tail meets the rest of the rope. That fingertip is the centre of the knot, and it does not move again until the ring is closed. Everything else is worked with the far end, which from here on is the working end. Take the working end out to ten-thirty, make a bight roughly fifteen centimetres long, and bring it back into the centre so the petal's two legs run into your fingertip side by side rather than crossed. Leave the whole thing slack — slack enough that it looks wrong to you. The finished petals will end up about half that length, and the extra is the material you will dress with later. A bight laid deliberately large can still be dressed. A bight laid at finished size locks in every spacing error you make from here.",
        bottom:
          "Nobody is in this pattern and it holds nothing at any point — the rope lies loose on a flat surface and stays there for the whole drill. The observer stands at the far side of the table, calls out the clock position the bight actually points at rather than the one you meant, and keeps the loose tail from sliding off the edge while you work.",
        check:
          "One bight out at ten-thirty, about fifteen centimetres long, both legs running side by side into the centre without crossing, the tail still pointing at six o'clock, and the whole of it visibly slack rather than snug.",
        speak: "One loose bight out to ten-thirty. Centre stays under your finger.",
        expected: {"wrapBands":1,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"band","y":0.44,"w":0.26}],
      },
      {
        title: "2 · Add the one-thirty and four-thirty petals, each over the last",
        goal: "Lay two more bights of the same size going clockwise, each one crossing over both legs of the petal laid immediately before it.",
        rigger:
          "Keep your fingertip on the centre and carry the working end clockwise. Lay the second bight out at one-thirty, the same length as the first. On its way out and on its way back it crosses the two legs of the ten-thirty petal, and it passes over both of them — over, not under, and over both together, not one of each. Carry on clockwise and lay the third bight out at four-thirty in exactly the same way, over both legs of the one-thirty petal. That is the whole rule while you are going round: each new petal lies on top of the petal you laid immediately before it, so the pile at the centre builds in one direction. Keep all three flat in one plane on the surface, none of them lifted, none of them rolled, and keep everything loose enough that you can slide a petal sideways with one fingertip and it stays where you put it. If a petal has rolled so its two legs sit stacked one on the other instead of side by side, roll it flat again now, while the rope still moves freely.",
        bottom:
          "Still nobody in the pattern; this is ornamental knotwork in a spare length and it holds nothing at any stage. The observer calls the sizes out loud — 'four-thirty is shorter than ten-thirty' — and watches for a petal that has quietly rolled so its legs stack instead of lying side by side, which is far easier to see from across the table than from above it.",
        check:
          "Three bights at ten-thirty, one-thirty and four-thirty, near enough the same length, all lying flat in one plane, and a centre where each new petal crosses over both legs of the one before it with nothing yet tucked underneath anything.",
        speak: "Each new petal goes over the last. Same size, keep going clockwise.",
        expected: {"wrapBands":3,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"band","y":0.48,"w":0.42},{"kind":"band","y":0.54,"w":0.42}],
      },
      {
        title: "3 · Lay the fourth petal and lock the ring under the first",
        goal: "Complete the ring with a fourth bight and close it with the one tuck that turns four stacked loops into a knot.",
        rigger:
          "Lay the fourth bight out at seven-thirty exactly as you laid the others, passing over both legs of the four-thirty petal on the way. Then comes the pass that makes this a knot rather than four loops resting on each other. The returning leg of that fourth petal has to go under the two legs of the very first petal, the one at ten-thirty, which has been sitting at the bottom of the pile since you started. Lift those two legs with a fingertip and feed the end through beneath them, keeping the pair together so the end passes under both at once rather than splitting them. Then bring the working end out at six o'clock alongside the tail, so both ends leave the knot in the same direction and the empty gap at the bottom becomes the stem. Three petals over, one petal under: that closure is why the finished centre reads as woven and why it will not fall apart when you lift it. If the end will not go through without force, do not force it. Follow the rope back round with a fingertip and find the petal that went under where it should have gone over. Leave everything as loose as it already is.",
        bottom:
          "The observer follows the fourth petal with you and says the word 'under' out loud on that last pass, because that is the one people get wrong and the one that cannot be fixed later. Nobody is in the pattern, nothing is loaded, and this knot is not holding anything during the drill or afterwards.",
        check:
          "Four petals, one on each diagonal, six o'clock left empty, and a centre where every petal's legs pass over one neighbour's pair and under the other's — no petal lying on top of both its neighbours and none trapped under both — with the two ends leaving together at six o'clock.",
        speak: "Fourth petal tucks under the first. Both ends out at six.",
        expected: {"wrapBands":4,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"diamond","cy":0.5}],
      },
      {
        title: "4 · Dress the petals out before you take any slack",
        goal: "Even the four petals for length, angle and lie while rope can still travel through the centre, because dressing is what makes this read as a flower rather than a tangle.",
        rigger:
          "This is the step that decides whether the finished knot reads as a flower or as a knot someone gave up on, so slow right down for it. Work round in one direction, starting at ten-thirty and going the way you wove, and tease each petal out to the same length with a fingertip inside the bight, drawing rope along its own path rather than pulling on the ends. Rope travels through a knot: length you take out of one petal has to come out of its neighbour, which is exactly why you keep circling instead of perfecting one petal and moving on. Roll each petal until its two legs lie parallel and flat with the same face of the rope upward the whole way round the bight, because a half-twist in one leg is the single commonest thing that makes a finished flower look grubby. Set the petals on the four diagonals by eye, then compare them in opposite pairs through the centre — ten-thirty against four-thirty, one-thirty against seven-thirty — because a pair catches an error that looking at one petal on its own never will. Last, look at the two gaps either side of six o'clock and make them equal.",
        bottom:
          "Nobody is in the pattern; this is a knot lying loose on a flat surface and it holds nothing. The observer stands opposite, names the longest petal and the diagonal that has drifted, and says it again after every adjustment, because from directly above nobody can see their own asymmetry.",
        check:
          "Sighted from the side at table level the whole knot lies in one plane with no petal riding up over another; from above, the four petals match in length, sit on their diagonals, and the two gaps flanking the stem are the same width.",
        speak: "Dress every petal before you take a single centimetre of slack.",
        expected: {"wrapBands":4,"pose":"stand","view":"side","handsVisible":true,"neckClear":true},
        wraps: [],
      },
      {
        title: "5 · Tighten in small laps and set the stem",
        goal: "Close the centre evenly with small pulls taken round the knot in laps, then pair the two ends into a stem so the flower keeps the shape you dressed into it.",
        rigger:
          "Take the slack out in small amounts and always by moving round the knot, never by hauling on the two ends. Start at the ten-thirty petal and draw about two centimetres out of it by pulling its bight down towards the centre. Move clockwise to the next petal and do the same. Keep circling. The rope you free up does not vanish: it travels through the weave and arrives at the tails, so at the end of each lap take up a centimetre at the tails and no more — that is the only pulling the ends ever get. Three or four laps close a flower knot far more evenly than one strong pull, and they let you stop the instant a petal begins to distort rather than long after it already has. Re-dress as you go: on every lap, flatten any leg that has picked up a twist while the rope moved, and square the woven centre up again with a fingernail. When the centre is firm and the petals are the size you want, stop. Pulled to its limit the centre packs solid, the petals lose their curve, and it will not open again without a spike. Finish by laying the two ends together below the knot as a stem and putting a plain overhand stopper in the pair, well clear of the petals, so the tails stay paired.",
        bottom:
          "Still nobody in the pattern, and the finished knot stays decorative: it holds nothing and bears nothing, here or anywhere afterwards. The observer watches petal length lap by lap and calls stop the moment one petal starts shrinking faster than the other three.",
        check:
          "After the last lap the four petals still match in length and still sit on their diagonals, the woven centre is square and firm without being crushed flat, and the two tails run side by side below the knot with the stopper clear of the petals.",
        speak: "Small pulls, keep moving round, stop before the centre packs.",
        expected: {"wrapBands":4,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"stem","x":0.5,"y1":0.56,"y2":0.78}],
      },
    ],
    mistakes: [
      { title: "Tightening by hauling on the two ends", body: "The ends are the fastest route to a closed knot and by a distance the worst one. Pull them and the slack nearest each end feeds in first, so the two petals closest to six o'clock shrink while the far pair stays fat, the woven centre slides off true, and the closure packs down somewhere you can no longer reach with a fingertip. You will see it as a knot that is genuinely tight and obviously lopsided, with one petal plainly shorter than the petal opposite it. Take length out petal by petal in laps and let the surplus arrive at the tails on its own." },
      { title: "The fourth petal laid over the first instead of under it", body: "Everything up to the last pass goes over, so the hand wants to keep going over, and the fourth petal ends up on top of the ten-thirty petal like all the others. Nothing is then locked. Lift the knot and it does not hold its shape: the petals slide out into a loose chain, or the centre domes up because four crossings are stacked instead of woven. Check it before you tighten by looking at each petal in turn — every one should pass over one neighbour and under the other. A petal sitting on top of both neighbours is the fourth petal, and it needs unpicking back and re-tucking." },
      { title: "A half-twist left in one petal leg", body: "Every petal has two legs and both should show the same face of the rope the whole way round the bight. If one leg carries a half-twist, that petal reads as pinched: it catches the light differently from the other three, it shows its edge where the others show their face, and it looks narrower even though it holds the same length of rope. Spot it from a metre away rather than from directly above, and roll it out while the knot is still slack, because once the centre closes the twist has nowhere left to travel to." },
      { title: "Dressing after the centre has already closed", body: "Once the woven centre is firm the rope no longer travels through it, so every centimetre you add back to one petal is stolen from the petal beside it and never comes back. You end up chasing the same error round and round the ring, each correction creating the next one. The tell is that the total amount of loop in the flower stays exactly the same however long you fiddle with it, and the petal you fixed two moves ago has quietly gone wrong again. Dress fully while everything is slack, then tighten, and never the other way round." },
      { title: "Petals drifting onto the quarters so the stem fights a petal", body: "The four petals belong on the diagonals, with six o'clock kept empty for the stem. Under the hands they creep towards twelve, three, six and nine, because the quarters feel more natural to aim at. Then the two tails have to leave the knot through the middle of the seven-thirty petal, which splays that petal open, drags it out of line and leaves the flower looking as though it has three good petals and one accident. Check the two gaps either side of the stem: if they are not the same width, the ring has rotated and the petals need walking back round before you tighten." },
    ],
    variations: [
      { name: "Five petals instead of four", body: "Work the same ring but lay five bights at five even points round the circle, each one over the legs of the petal before it, with the fifth tucked under the first to close as usual. The opposite-pair check disappears, because no petal now sits directly across from another, so you have to judge angles by eye alone. Slower to dress and far less forgiving of a lazy eye." },
      { name: "Two colours worked as one strand", body: "Lay two ropes of different colours side by side and treat the pair as a single line all the way through the weave and the dressing. Every half-twist and every petal that has rolled shows instantly as the colours swapping sides, so the knot becomes its own diagnostic. Dressing takes longer, because both strands have to stay flat and in the same order the whole way round each petal." },
      { name: "Worked upright against a prop instead of flat on a table", body: "Build the same ring held against the front of a dress form, a bolster or a rolled duvet rather than flat on a surface, with an observer steadying the tail for you. Gravity now drags every bight out of position while you weave, so you learn to hold the plane with your fingers instead of borrowing it from the table. Expect your first few to sag towards six o'clock." },
      { name: "Dress it by feel, then look", body: "Weave and close the ring as usual, then shut your eyes and dress the petals entirely by touch — matching lengths, setting the diagonals, rolling twists out of the legs, squaring the centre. Look only when you believe it is finished. The gap between what your hands reported and what you actually see is the rope memory this drill exists to build, and it narrows quickly with repetition." },
    ],
  },
  "hashigo": {
    goal: "Five parallel bands stacked down one locked spine, gauged not guessed: the drill where a rung tied tighter or spaced wider than its neighbours cannot hide.",
    steps: [
      {
        title: "1 · Fold a rope gauge, then pin the bight at the top-rung height",
        goal: "Make a physical measure for the spacing out of rope, and put the first rope on the form at the height the top rung will sit.",
        rigger:
          "Start with the gauge, because every gap in this ladder gets measured against it rather than guessed at. Take a spare length of rope, fold it in half, then in half again, and keep halving until the folded bundle is about the gap you want between rungs. Ten centimetres is a sensible first ladder on a bolster or a dress form. Pinch the fold so the bundle keeps its length and set it down where you can reach it, because you will pick it up four times. If you want a visible reference for the spine, run a strip of low-tack tape straight down the front of the form now. It is not structural and it holds nothing; it only tells you at the end whether your locks wandered sideways. Then take your working rope, find its middle, and make a bight. Lay that bight flat against the form on the spine line at the height you want the top rung, both ends pointing down the form, and pin it there under the thumb of your non-dominant hand. From this moment until the last rung you are working with the doubled rope as a pair, never a single strand.",
        bottom:
          "Nobody is in this pattern and nobody will be at any point in this drill. Whoever is watching can press the tape flat while you run it down, then gather the loose ends of the working rope and keep them coiled clear of the floor, because a pair of ends dragging round your feet is what pulls a pinned bight off its mark.",
        check:
          "A folded gauge that keeps the same length when you pick it up again, and the bight lying flat on the spine line at the height you chose for the top rung with both ends the same length, pointing down the form, and not crossed over each other.",
        speak: "Fold the gauge, pin the bight flat at the top mark.",
        expected: {"wrapBands":0,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [],
      },
      {
        title: "2 · Lay the first rung loose, then lock it into the bight",
        goal: "Get one horizontal rung round the form at even tension and fix it to the spine with a lock that points the rope downward.",
        rigger:
          "Keep your thumb on the bight and carry both ends round the form in one direction. Pick left or right now and never change it for the rest of the ladder, because the direction of travel decides which side of the spine each lock lands on. Bring the pair back to the spine line at the same height you left it. Keep the two strands side by side and flat the whole way round, not stacked and not crossed, so the rung reads as a flat ribbon rather than a rope. Do not haul on the ends. With the rung still visibly loose, run an open hand right round the circuit and push the slack ahead of you toward the spine, so the tension you end up with was gathered evenly from every part of the rung instead of being dragged out of the one arc nearest your hands. Now lock it. Pass both ends up through the bight from underneath so the bight closes around the pair, then turn them down the spine line and pull straight down until the rung sits snug against the form. Down, not sideways. That downward turn is the lock, and it is the thing that stops the rung sliding.",
        bottom:
          "The pattern is on an object and it stays on the object; nobody is inside it. Ask whoever is watching to stand square in front of the form and say whether that rung reads level or tilted, because a couple of degrees of tilt is obvious from a pace back and invisible from where your hands are.",
        check:
          "One rung round the form, flat and level, both strands lying side by side with no roll and no cross, the bight closed around the pair on the spine line, and both ends leaving that lock straight down the form rather than off to one side.",
        speak: "Lay it loose, chase the slack round, lock it downward.",
        expected: {"wrapBands":1,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"band","y":0.26,"w":0.62}],
      },
      {
        title: "3 · Gauge the drop and lay the second rung",
        goal: "Set the first gap with the folded gauge rather than by eye, and learn what the vertical run between rungs is and is not for.",
        rigger:
          "Stand the folded gauge on the spine line with its top edge touching the underside of the first rung, and run the doubled rope straight down beside it to the gauge's bottom edge. That point is the height of the second rung. Pin the pair there under your thumb so the spine cannot creep back up while both hands are busy, then lift the gauge away. Take the pair round the form again in the same direction as the first rung, lay the second rung visibly loose, and chase the slack round with an open hand exactly as before. The lock changes now, because the bight has been used up. Take both ends up underneath the new rung right beside the spine, between the rung and the form, bring them over the top of the rung, and pull them down the spine line. That is a half hitch, and it traps the rung against the vertical run. Every rung from here gets that same hitch, taken the same way round. Keep the vertical run straight and only taut enough to hold its own shape. Pull hard on it and it shortens, dragging the new rung up toward the first one at the spine while the far side of the form stays exactly where you put it, which gives you a wedge instead of a rung.",
        bottom:
          "Still an object, still nobody in it and nothing hung from it. The observer has the useful angle here: from the side they can see whether the second rung runs parallel to the first or fans open toward the back of the form, which is the one thing you cannot judge from in front of your own hands.",
        check:
          "The gap matching the folded gauge at the spine and matching it again when you walk round and stand the gauge in the same gap at the back, a straight rather than bowed vertical run, and both locks turning the same way.",
        speak: "Gauge the drop, pin it, lay loose, half hitch downward.",
        expected: {"wrapBands":2,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"stem","x":0.5,"y1":0.26,"y2":0.38},{"kind":"band","y":0.38,"w":0.62}],
      },
      {
        title: "4 · Build rungs three, four and five the same way",
        goal: "Finish the stack, gauging every single gap from the rung above it and never from memory or by eye.",
        rigger:
          "Three more rungs, each built with the same five moves in the same order: stand the gauge under the last rung, run the spine down to its bottom edge and pin, wrap round in the same direction, chase the slack to the spine, half hitch downward. Use the gauge every time, including on the last rung when you can already see where it ought to go. Eye judgement drifts, and for a given person on a given day it drifts one way rather than randomly, so the error does not cancel out — it accumulates and arrives as a bottom of the ladder that is visibly crowded or visibly stretched. Watch your rope as you go. Five circuits plus the vertical runs eat more rope than people expect, so before you start each rung, hold what is left against the form and satisfy yourself there is enough to go round and still lock. If there is not, stop at the last rung you can finish and lock properly rather than laying one you cannot. Feed rope through your hand as you wrap instead of dragging the whole remaining length round the form on every pass, because that dragging is where most of the twist in your strands comes from.",
        bottom:
          "Nobody is inside this and no weight goes onto it. Whoever is watching should call the gaps as you build, since \"that one is wider\" is worth far more said at the third rung than discovered at the fifth, and they can count the rungs aloud so you are not counting and tying at the same time.",
        check:
          "Five rungs down the form, each one horizontal, every gap taking the folded gauge when it is stood between neighbouring rungs, and the five locks sitting in a single vertical line rather than stepping left and right down the spine.",
        speak: "Gauge, pin, wrap, chase, hitch. Same order every rung.",
        expected: {"wrapBands":5,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"stem","x":0.5,"y1":0.38,"y2":0.5},{"kind":"band","y":0.5,"w":0.62},{"kind":"stem","x":0.5,"y1":0.5,"y2":0.62},{"kind":"band","y":0.62,"w":0.62},{"kind":"stem","x":0.5,"y1":0.62,"y2":0.74},{"kind":"band","y":0.74,"w":0.62}],
      },
      {
        title: "5 · Compare the rungs against each other for tension",
        goal: "Use the finished stack the way this pattern is meant to be used: as five samples side by side that expose any rung tied harder or softer than the rest.",
        rigger:
          "Here is the whole reason for building a ladder rather than one band. Hook a finger under the free span of the top rung, roughly midway between the spine and the side of the form, pluck it and listen. A slack rung answers dull and low, an over-tight one gives a short hard note, and two rungs at matching tension sound and feel alike under the hand. Work down the stack plucking each in turn, then work back up, because the second pass catches what the first one normalised. Next, crouch until your eye is level with the stack and sight along the rungs; from that angle a rung that is not truly horizontal shows as a line crossing the others rather than running with them. Then walk round the form and do both again from the back, since tension hauled out of one side leaves the front looking even while the back stays ragged. Name any rung that is out. Do not fix it by slackening its neighbours to match, which converts one wrong rung into five wrong rungs.",
        bottom:
          "The form has held a decorative pattern and nothing else. The observer's job now is to disagree with you: have them pluck and sight the stack independently, and if they pick a different rung than you did, look again at both rather than settling it by whoever spoke first.",
        check:
          "Each rung plucking at a similar pitch to the ones above and below it, no rung crossing the others when sighted along the stack, the back of the form read as well as the front, and any odd rung said out loud rather than quietly worked around.",
        speak: "Pluck each rung against the one above it. Name the odd one.",
        expected: {"wrapBands":5,"pose":"stand","view":"side","handsVisible":true,"neckClear":true},
        wraps: [],
      },
      {
        title: "6 · Dress the rungs, finish the tail and pull the tape",
        goal: "Roll every rung flat, stack the locks into one column, tie the tail onto the spine, then judge the spacing with the reference removed.",
        rigger:
          "Start at the top rung. Take it between thumb and forefinger where it leaves the spine and run along it to the far side of the form and back, rolling any twist out as you go until the two strands lie side by side and flat the whole way round. Do all five, top to bottom, and do not skip the one that already looks fine. Then look at the spine itself and straighten the column of locks so they sit one directly under another instead of wandering left and right; a lock that has crept sideways can usually be nudged back with a thumb while the rope below it is still only holding its own shape. Now finish the tail. Bring what is left of the pair straight down the spine below the bottom rung, then split the pair and put two half hitches with both ends around the vertical run just above the bottom rung, both turned the same way round as your locks, so the finish reads as part of the pattern rather than something added to it. Last, peel the tape off and look at the ladder with nothing helping you.",
        bottom:
          "Nothing was ever inside this pattern and nothing was hung from it at any stage. Ask the observer for a final read from three paces back, where uneven spacing shows itself as a rhythm that stutters rather than as a measurement, and let them point at the rung they mean before you start explaining it.",
        check:
          "Five flat untwisted rungs with both strands lying side by side, the locks stacked in one straight vertical column, the tail hitched onto the vertical run just above the bottom rung rather than left loose, and the gaps still reading even once the tape, if you used any, is gone.",
        speak: "Roll each rung flat, stack the locks, then pull the tape.",
        expected: {"wrapBands":5,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"stem","x":0.5,"y1":0.74,"y2":0.82}],
      },
    ],
    mistakes: [
      { title: "Gauging the first gaps, then trusting your eye for the rest", body: "The gauge gets used religiously for the first two gaps, and by the fourth rung you can see where it goes, so you place that one by eye. Eye judgement drifts, and for a given person on a given day it drifts consistently one way rather than randomly, so the error is not noise that cancels out — it compounds down the stack and lands as a bottom that is crowded or stretched. The way to catch it is to stand the gauge in the top gap and then in the bottom gap at the end; comparing each gap only against the one immediately above it hides a drift that is tiny at every single step." },
      { title: "Taking the slack out of a rung by hauling on the ends", body: "The rope comes back to the spine and the reflex is to pull. Tension then arrives from one direction only: the arc nearest your hands goes hard while the far side of the form stays loose, and the moment the lock goes on there is no path left for tension to travel across it and even itself out. The tell is a stack that looks convincing from the front and sags at the back, so read every rung from behind the form before you dress anything. The fix is a habit, not a correction: push the slack round the whole circuit with an open hand first, lock second." },
      { title: "Treating the vertical run as something to pull on", body: "The spine holds the gap; it does not set the rung's tension. Pull it hard between rungs and it shortens, which drags each new rung up toward the one above at the spine while the far side of the form stays exactly where you laid it. What you end up with is a herringbone rather than a ladder, gaps pinching at the front and fanning open at the back. The giveaway is a gauge that stands comfortably in the gap at the back of the form and will not stand in the same gap at the front." },
      { title: "Letting the doubled strands barber-pole round the form", body: "Two strands travelling round a curve want to roll over each other, and once they have, that rung is narrower, sits darker and takes the light differently, so it reads as tighter than its neighbours to anyone looking even when its tension matches theirs exactly. It also stores a hidden twist, which is why slack you were sure you had removed turns up again later. Catch it by running finger and thumb along each rung immediately after locking it, before the rung below traps the twist in place and makes the dressing in step 6 much harder." },
      { title: "Changing the lock direction partway down the stack", body: "Each lock takes a bite of its rung, and the direction of the turn decides exactly where that rung ends up sitting. Take one over the top and down, the next under and up, and every rung seats slightly differently: heights land a few millimetres off, the locks sit at different sideways positions, and the column snakes down the form instead of stacking. It is the one fault on this pattern that cannot be dressed out at the end, because the error is in how each turn seated. It goes away only if you rebuild from the rung where the direction changed." },
    ],
    variations: [
      { name: "The same ladder on a much narrower prop", body: "Build the identical five rungs on something slim — a rolled towel, a fat cardboard tube, a bolster stood on its end — keeping exactly the same gap. Far less rope goes into each circuit, so a one-sided pull shows up within a single wrap instead of averaging out round a wide form, and spacing that looked generous suddenly reads sparse and stretched." },
      { name: "Doubled rungs", body: "Lay each rung as two wraps side by side rather than one, so the ladder finishes as five doubled rungs. Both wraps have to carry the same tension and lie flat against one another without crossing, barber-poling becomes twice as easy to see, and the half hitch now has to take four strands cleanly without bunching them into a lump at the spine." },
      { name: "Blind spacing, measured afterwards", body: "Mark nothing and tape nothing. Set every gap with the folded gauge alone, or with nothing at all, then measure the finished ladder gap by gap and write down how far the spacing drifted and in which direction. Repeat on other days until the drift stops running consistently one way; that number tells you more about your handling than how tidy the pattern looks." },
      { name: "Two spines, front and back", body: "Lock every rung twice, once where it crosses the back of the form and again at the front, so two vertical lines run down the prop instead of one. Both spines have to drop the same distance between rungs or the rungs tilt out of horizontal, and the drill stops being about one column of locks and becomes about keeping two columns in step with each other." },
    ],
  },
  "hishi": {
    goal: "A single column of even diamonds worked down an unoccupied prop from one doubled rope, drilling gauged spacing, plumb joins and matched tension in both hands.",
    steps: [
      {
        title: "1 · Lark's head band, then join zero",
        goal: "Set one level anchor band on a constant-girth section of the prop and put a single flat half-knot at front centre as the origin every later drop is measured from.",
        rigger:
          "Pick a stretch of the prop where the girth does not change over the length you mean to work. This matters more than it sounds: a diamond takes its width from the girth of the prop and its height from the drop you set, so a tapering section will fatten or pinch every cell no matter how carefully you measure. Find the middle of the rope, pinch a bight there, and hold the bight against the front of the prop at the top of that stretch. Take both ends round the back, one going each way, bring them home to the front and pass them both through the bight, then draw them up until the band is firm enough that it does not slide when you tug downward on it, and no firmer. On varnished wood, steel or glass, take a second full turn round before you pass through the bight, because one turn on a slick prop will creep down under the first row of tension. Draw both ends with the same force, then walk round and look at the back of the band. A band that has ridden a centimetre higher on one side tilts every cell you build below it in that same direction, and you will not recognise it until the fourth join, by which point the fix is to start again. Now tie the two strands together at front centre, immediately under the band, with one half-knot, left over right, laid flat and pressed down. That knot is join zero.",
        bottom:
          "Nobody is in this pattern and the prop is not standing in for anyone. An observer earns their place here by standing behind the prop while you work at the front and saying plainly whether the band sits at the same height at the back as it does at the front, because you cannot see both faces at once and the rope will not tell you.",
        check:
          "The band lies level, the same height at the back as at the front, with no twist along it, and one flat half-knot sits at front centre with both strands leaving it downward, side by side and uncrossed.",
        speak: "Band level front and back. One flat half-knot at front centre.",
        expected: {"wrapBands":1,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"band","y":0.2}],
      },
      {
        title: "2 · Make a gauge, split the pair, join at the back",
        goal: "Fix the drop with a physical gauge before any more rope moves, then send the two strands opposite ways round the prop and join them at back centre.",
        rigger:
          "Before another centimetre of rope moves, make a gauge, because the drop between one join and the next is the single number this whole pattern lives on. Cut a strip of card, put a pencil mark on a chopstick, or tie a knot in a short offcut, at the drop you want. Eight to ten centimetres is a sane start on a bolster. Every join from here sits one gauge below the join above it, front and back alike, which means a finished diamond on the front face stands two gauge lengths tall, front join to front join. Now take the left strand in your left hand and the right strand in your right and send them apart from join zero on mirrored downward angles: whatever angle you set on the left, match it on the right. The left strand travels round the left side of the prop, the right strand round the right, so the two are running in opposite directions round the girth and will meet at back centre. Before you tie, hold the gauge against the side of the prop, from the height of join zero down to where the knot will sit, and bring the strands to that height. Tie one half-knot there, same handedness as join zero, left over right, holding both strands under equal light tension with your free hand as you set it. A half-knot pulled up while one strand is slack does not settle at the midpoint: it drags the tight side straight, lets the slack side bow, and dressing afterwards never fully recovers it. Leave it only just tight enough to hold its height.",
        bottom:
          "The observer's job this join is to stand square behind the prop and call the knot left, right or centre while you tie it, since you are working blind at the back with both hands full. Nobody is in the pattern, and the prop is an object and stays one for the whole drill.",
        check:
          "Both strands leave join zero at mirrored angles, cross the sides of the prop at the same height as each other, and the half-knot sits at back centre one gauge below the height of join zero, not off toward one side.",
        speak: "Mirror the angles. One gauge down, knot at back centre.",
        expected: {"wrapBands":2,"pose":"stand","view":"side","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"x","y":0.27}],
      },
      {
        title: "3 · Carry on round and close the first diamond",
        goal: "Bring both strands onward in the direction they are already travelling and join them at front centre, which closes the first four-sided diamond on the front face.",
        rigger:
          "Do not turn either strand round. This is the step people get wrong and it is worth saying slowly. The half-knot at the back crossed the two strands, so the one that arrived from your left now leaves the knot heading right, and it carries on round the right side of the prop; its partner carries on round the left. Each strand keeps going the same way round the girth for the whole run and completes one full turn of the prop every two joins. If instead you send a strand back the way it came, the pattern stops being a hishi run and becomes a stack of plain loops with knots in them, and it will look wrong immediately without you being able to say why. Bring both strands round to front centre, one arriving from each side, and hold them there without tying. Measure: one gauge below the back join, which puts this join two gauges below join zero. Set the half-knot at that height, same handedness again, both strands under equal tension. Then step back and sight straight down the front of the prop, or hang a weighted string beside it, and check that this join sits directly under join zero rather than a centimetre off. The first diamond now exists on the front face: join zero at its top, this new join at its bottom, and its two side points sitting out at the edges of the prop, level with the back join between them.",
        bottom:
          "Hand your observer the gauge and the plumb string and let them measure this drop themselves before you snug it, because an outside eye catches a creeping interval several joins before the eye that built the thing does. Nobody is inside the pattern and the prop is not a stand-in for anyone.",
        check:
          "A closed four-sided diamond on the front face, join zero at its top point and the new join at its bottom point, its two side points level with each other and with the back join, and the new join sitting plumb under join zero.",
        speak: "Carry each strand onward. Front join plumb under join zero.",
        expected: {"wrapBands":3,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"diamond","cy":0.27}],
      },
      {
        title: "4 · Four more joins, back and front alternating",
        goal: "Add four more joins at the same gauge, which puts two more diamonds on the front face and two on the back, while hunting the two drifts that ruin a hishi run.",
        rigger:
          "Repeat the same move four more times, back, front, back, front, one gauge apart every time, carrying each strand onward in its own direction and never doubling one back. That gives you two more diamonds on the front face and two on the back, offset from the front ones by one gauge. Gauge every single drop rather than trusting an eye that has now calibrated itself to whatever you have already built. Hunt two failures as you go. The first is rotation: nearly everyone pulls harder with the dominant hand, which walks each join a few degrees round the prop in the same direction every time, so reset each knot to true front or true back centre before you snug it, and mark a vertical line on the prop with chalk or tape to check against. The second is stretch, where the drops quietly grow as measuring turns back into guessing. Manage the tails while you work: keep the unused rope in loose bights in your free hand or let it hang clear, because a tail that wraps itself round the work drags a join off centre while you are looking at something else. Budget your rope too. Each join costs roughly half a girth per strand plus the drop, so decide in advance how many joins your length allows and stop at a join, never halfway between two.",
        bottom:
          "Ask your observer to walk a slow circle round the prop between joins and call out which way the knots are creeping, since spiral drift is visible from outside a good join before it is visible from where you stand. Nothing and nobody is inside the pattern at any point.",
        check:
          "Sighted from the side, the joins alternate front edge and back edge in a regular ladder with equal gaps between them, no gap wider or narrower than its neighbours, and the side points of the diamonds sit at even heights all the way down rather than bunching toward the bottom.",
        speak: "Back, front, back, front. One gauge every single time.",
        expected: {"wrapBands":5,"pose":"stand","view":"side","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"diamond","cy":0.41},{"kind":"diamond","cy":0.55}],
      },
      {
        title: "5 · Dress from the top down and lock the last join",
        goal: "Take the slack out in the one order that preserves the spacing you measured, even the diamonds sideways, and close the column with a flat square knot.",
        rigger:
          "Only now do you take the slack out, and you do it from join zero downward, never from the bottom up. Slack in this column travels upward when you pull on it, so tightening a low join first drags every join above it closer together and spends the spacing you spent ten minutes measuring. Work down join by join. At each one, pull the two strands leaving it until the four sides of the diamond it heads run straight from that join, out through the two side points, and down into the join two steps below, with no belly in any of the four. Then set the half-knot flat, so both strands lie side by side through it rather than one riding over the other, and press it down onto the prop. Even each diamond sideways as you go by easing the side points until they sit at the same height on the left and the right; a diamond with one high shoulder means the strand on that side was carrying more tension when you tied the join beneath it. After the last join, tie a second half-knot on top of it in the opposite handedness, right over left, which locks the pair as a flat square knot rather than a granny that will roll. Leave the two tails hanging free. They are attached to nothing, nothing overhead is involved, and no part of this column carries any load.",
        bottom:
          "Ask your observer to measure the top diamond and the bottom diamond with the gauge and say out loud which is bigger before you call the column finished, because you will defend your own spacing and they have no reason to. Nobody is inside the pattern and the prop is not standing in for anyone.",
        check:
          "Every diamond side runs straight between its points with no belly, every half-knot lies flat with both strands side by side through it, the front joins are still plumb under join zero after tensioning, and the top and bottom diamonds measure within a centimetre of each other.",
        speak: "Tighten from the top down. Straight sides, flat knots.",
        expected: {"wrapBands":5,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [],
      },
    ],
    mistakes: [
      { title: "Sending a strand back the way it came", body: "At every join the two strands cross, so each one must leave heading the opposite way and carry on round the prop in the direction it is already travelling. Turn one back instead and the pair stops spiralling: you get a stack of flattened loops with knots down the middle and no side points at all. The tell is that the edges of the prop show rope doubling on itself rather than a single clean turning point level with the join on the opposite face, and the front face shows lens shapes instead of four-sided diamonds." },
      { title: "Tightening the column from the bottom up", body: "Slack in this column migrates upward. Snug the lowest join first and the rope you pull out of it comes straight from the joins above, so every diamond you measured closes a little and the run finishes crisp at the bottom and saggy at the top. The signature is diamonds that get steadily shorter and slacker the higher you look, with the topmost one visibly loose against the anchor band. The only honest repair is to slacken the whole column and tension it again downward from join zero." },
      { title: "Letting the joins creep round the prop", body: "Most people pull harder with the dominant hand, which walks each join a few degrees round the girth in the same direction every time. Nothing looks wrong at the second join. By the fifth, what you called front centre is sitting near the side of the prop, the front face shows half diamonds running off the edge, and the whole column reads as a lazy spiral rather than a straight run. Chalk or tape a vertical line on the prop before the first join and check every knot against it rather than against the knot above." },
      { title: "Guessing the drop once the gauge feels unnecessary", body: "Your eye recalibrates to the last thing you made, so a drop drifting half a centimetre per join never looks wrong while you are working and looks obviously wrong in a photograph afterwards. The giveaway is that the error runs one way only: the diamonds shrink steadily or grow steadily down the column instead of varying at random. Measure the first diamond and the last with the same gauge at the end, and if they differ by more than a centimetre, your eye was doing the measuring somewhere around join three." },
      { title: "Tying a join with one strand slack", body: "A half-knot pulled up while one of the two strands is loose does not settle at the midpoint between the sides. It drags the tight strand straight and lets the slack one bow outward, so the diamond above ends up with one straight side and one bellied side, and the knot itself lands a centimetre or two off the centre line. Look at the two sides above each join and ask whether they are the same length rather than whether they look roughly symmetrical, because roughly symmetrical is exactly what a bad one looks like." },
    ],
    variations: [
      { name: "The same column on a bottle or a length of pipe", body: "A narrow prop brings the strands from back to front in far less rope, so the gauge that gave you square diamonds on a bolster now gives you narrow tall ones. Shorten the drop until they read square again, and write down the number you land on. The interval belongs to the girth of the prop, not to the pattern, and knowing that stops you carrying one gauge everywhere." },
      { name: "Half the gauge, twice the joins", body: "Run the same column with the gauge halved, which doubles the number of joins over the same length of prop and roughly doubles the rope you spend. Small diamonds punish drift far faster than large ones, because a fixed error is a bigger fraction of a short drop, so both spiral and stretch announce themselves two or three joins earlier than they did before." },
      { name: "Reverse-tension folds instead of half-knots", body: "Swap the half-knot at each join for a reverse-tension fold: bring the pair together at the join, fold each strand back over itself and away, and let friction hold the height while you dress it flat. It is quicker and it sits much flatter against the prop, and it is far less forgiving, because the fold slips the instant the strand above it goes slack." },
      { name: "Two doubled ropes, two columns of diamonds", body: "Anchor a second doubled rope to the same band a quarter turn round the prop, so four strands hang in two columns. Each join now marries a strand from one column to its neighbour from the other, and the joins alternate in two columns instead of one. Rope management, not knot skill, is the part that gets hard: four tails tangle in half the time two do." },
    ],
  },
  "kikkou": {
    goal: "A column of six-sided cells opened out of a knotted rope ladder by paired encircling passes. It drills knot spacing, matched widths and even tension.",
    steps: [
      {
        title: "1 · Tie the knot ladder off the form",
        goal: "Build the spine of the pattern: one doubled rope carrying four identically spaced overhand knots, which become the narrow waists of the hexagons.",
        rigger:
          "Tie this part in your hands or laid out along the floor, never against the form, because a ladder tied against a curved surface always comes out uneven and you will not see it until the cells are open. Fold the rope in half and find the bight. Cut a strip of stiff card, somewhere between ten and twenty centimetres long, and from now on that card is the only measure you use. Tie the first overhand knot on the bight about half a card-length below the fold. That short top loop is deliberately not a cell; it exists only to take the anchor in the next step, so its length does not matter as long as it is big enough to pass a bight under. Now tie three more knots, each one card-length below the last, measured centre of knot to centre of knot rather than edge to edge. An overhand knot on the bight swallows several centimetres of rope, and it swallows a different amount depending on how hard you set it, so edge-to-edge measuring quietly hands every gap a different share of that swallowed length. Keep both strands parallel and untwisted as they go through each knot so it lies flat instead of rolling onto its side. Pull every knot up with the same effort. A knot left soft sits taller and lengthens the gap beneath it.",
        bottom:
          "Your observer holds the card, reads each gap back to you as you tie, and says plainly when one looks longer than the one above it. They also compare knot to knot for size, since a soft knot is easier to spot from outside than from inside. Nobody is inside this pattern and nobody will be. The form is an object and stays an object.",
        check:
          "Four knots on one doubled rope, three gaps below the top knot all measured centre to centre against the same card, every knot pulled up to the same size, and both strands flat and parallel through each knot.",
        speak: "Four knots. Three gaps. One card, centre to centre.",
        expected: {"wrapBands":0,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [],
      },
      {
        title: "2 · Anchor the second rope and take the first pass",
        goal: "Lay the ladder on the front centreline, lock a second doubled rope to the unused top loop, and thread the first encircling pass through the top cell loop.",
        rigger:
          "Lay the ladder down the front of the form on the centreline, fold uppermost, the four knots stacked one directly beneath the next and the two tails hanging free below the bottom knot. Fold the second rope in half. Lift the short top loop, the one between the fold and the first knot, away from the surface, pass the second rope's bight underneath it, then feed both working ends of the second rope through that bight and draw it down snug. That is a lark's head, and because the top loop is not a cell you can pin it flat without costing yourself anything. It stops the ladder wandering while you walk rope round the far side, which a thumb will not do. Now take both strands of the second rope together and treat them as one rope for the rest of the drill. Travel to your left as you face the front, and keep that one direction throughout. Let the pair fall to the height you want for the first pass as it goes round the left side; that single short diagonal is the only diagonal in the whole piece. Cross the back, come back to the front on the right. Lift the loop between the first and second knots clear of the surface and pass the pair underneath both of its strands, so that loop is threaded onto the pass like a ring onto a bar, then carry on to the left. Finally slide that loop's left strand outward along the pass and its right strand outward the other way, the same card-measured distance from the centreline on each side, and take the slack out slowly so the strands stay where you put them instead of being dragged back to the middle.",
        bottom:
          "Your observer stands two metres back and calls whether the pass is level the whole way round, because level is far easier to see from a distance than up close. They also watch that the lark's head has actually bitten and the ladder has not crept off the centreline. There is nobody in the pattern; the form is unoccupied throughout.",
        check:
          "The pass level all the way round apart from the single short lead-in diagonal on the left side, the loop threaded onto it from underneath rather than lying across the top of it, and the loop's two strands slid out the same distance either side of the centreline.",
        speak: "Thread the loop onto the pass, then slide both strands out level.",
        expected: {"wrapBands":1,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"stem","x":0.5,"y1":0.16,"y2":0.9},{"kind":"band","y":0.32,"w":0.7}],
      },
      {
        title: "3 · Close the first hexagon with a second pass",
        goal: "Take a second pass through the same loop, lower down, so the cell gains two straight vertical sides and reads as six-sided rather than four.",
        rigger:
          "Keep travelling in the same direction. As you cross the back centreline, step the rope down by about a third of the gap between two knots. From here on, every change of height happens at the back centreline and nowhere else; that is the whole reason the back stays tidy and the front stays level. Come back to the front on the right at the new height, lift the same loop again, and pass the pair beneath both of its strands below the first pass, so the loop is now threaded onto two passes. Carry on to the left. Slide the left strand out along the lower pass until it matches the width you set above, then the right, both measured out from the centreline with the card rather than judged by eye. Take the slack out. Now look hard at what you have made. Between the two passes each strand runs straight down, parallel to the centreline: those two straight runs are the vertical sides. Above the upper pass the strands angle inward to the first knot, and below the lower pass they angle inward to the second knot: four angled sides. Six in all, which is what makes this kikkou. If the widths do not match, the vertical sides lean and the cell reads as a lopsided quadrilateral. If the two passes sit too close together the vertical sides disappear entirely and you have built a four-sided hishi cell, which is a different pattern with a different name.",
        bottom:
          "Your observer watches the widest part of the cell and calls it the moment the lower width fails to match the upper. Handing you the card as you need it saves you letting go of a strand halfway through an adjustment, which is when a width slips back. Nothing here goes on a person, and the form stays unoccupied.",
        check:
          "Between the two passes both strands run straight and parallel to the centreline; above and below they angle in to a knot. Six sides, not four, and the upper and lower widths equal at the widest point.",
        speak: "Match the lower width to the upper, then look for straight sides.",
        expected: {"wrapBands":2,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"band","y":0.4,"w":0.7}],
      },
      {
        title: "4 · Build the second and third cells",
        goal: "Repeat the paired-pass sequence down the next two loops so the column reads as three stacked hexagons of matching width and matching height.",
        rigger:
          "Work downward one loop at a time and do not skip ahead. After the lower pass of the first cell, cross the back and step down about twice as far as you stepped inside the cell, because this drop has to carry the rope past the second knot and leave that knot sitting as the waist between two cells. Front on the right, lift the loop between the second and third knots, pass beneath both strands, carry on left, then set both widths outward from the centreline with the card. Never set a width against the cell above it: a width copied from a neighbour inherits that neighbour's error and adds to it, and by the third cell the column has visibly fanned out or pinched in. Back centreline, short step down, second pass through that same loop, widths matched, slack out. That is the second hexagon. Do the loop between the third and fourth knots identically. Keep the pull on every pass the same as the last, because a pass hauled harder than its neighbours borrows rope from the cells above and below it, both go narrow, and the pass itself still looks perfectly good. Somewhere in here you will run out of rope, and since you are travelling with a doubled rope both strands run out together. Make the joins on the back, in a step-down between two passes rather than in any run that crosses a cell, and stagger the two joins a few centimetres apart so they do not sit side by side and bulk up into something that will not pull round the form.",
        bottom:
          "Your observer feeds rope round the far side so you are not dragging it, keeps the tails out from under your feet, names any cell that looks narrower than the one above it, and watches that neither join creeps round onto the front face. The pattern is on an object, and nobody is in it.",
        check:
          "Three cells stacked, each the same width at its widest and the same height between its two passes, each waist sitting on a knot, and both joins on the back inside a step-down rather than in a run that crosses a cell.",
        speak: "Top down. Two passes per loop. Same width in every cell.",
        expected: {"wrapBands":6,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"band","y":0.52,"w":0.7},{"kind":"band","y":0.6,"w":0.7},{"kind":"band","y":0.72,"w":0.7},{"kind":"band","y":0.8,"w":0.7}],
      },
      {
        title: "5 · Walk round and true the back",
        goal: "Stack the step-downs on one line and even the tension across all six passes, because that is where the cells are being pulled off centre from.",
        rigger:
          "Walk round to the back and look at it properly, because this is where the tension inequality actually lives and the front only shows you the symptom. You are looking for six level passes joined by five short step-downs, and those five step-downs should stack on the back centreline like rungs on one line. Where a step-down has wandered off to one side, the pass below it is being pulled that way, and on the front the cell that pass holds open will sit off centre. Ease each wandering step-down back to the middle, then re-tension from the top pass downward, one at a time, drawing the slack round the form to the next pass rather than hauling on the pass in front of you. Pulling a low pass tight to correct a high one only moves the problem further down the column. Run a flat hand down the back across all six passes and feel for one that stands proud of the surface; that one is slack, and the one that has sunk in below its neighbours is the one that has been over-tightened and is stealing width from the cells either side of it. Look as well for a pass that has ridden up over the pass above it instead of lying beside it, which reads on the front as one cell suddenly shorter than the rest.",
        bottom:
          "Your observer stays at the front while you work the back and reports what each correction does to the cells, because you cannot watch both faces at once and a fix that looks right from behind can pull a cell crooked in front. The form is unoccupied and remains so for the whole drill.",
        check:
          "Six level passes on the back, five step-downs stacked on one vertical line at the centreline, no pass riding over another, and no pass standing proud when a flat hand runs down them.",
        speak: "One line of step-downs at the back. Six level passes.",
        expected: {"wrapBands":6,"pose":"stand","view":"side","handsVisible":true,"neckClear":true},
        wraps: [],
      },
      {
        title: "6 · Finish the ends, dress the front, read the column",
        goal: "Secure all four ends in one place at the back, take the twists out of every strand, and read the three vertical sight lines that expose the spacing errors.",
        rigger:
          "Carry the two ends of the travelling rope round to the back and tie two half hitches around the lowest step-down, just above the bottom pass, so the tails finish below it, the finish sits at the back and the front face stays clean. Take the ladder's two tails from below the fourth knot, bring them together round to the back the same way, and half hitch them onto the same line, so all four ends finish in one place and none of them lies across a cell. Now dress the front. Run a finger along every strand from one knot to the next and push any twist out towards the nearest knot, because a twisted strand catches light differently and reads as a change of width even when the geometry underneath is correct. Square up the lark's head at the top so it sits flat rather than cocked. Then step back two metres and read the column as a whole. The four knots should sit on one straight vertical line, and the widest points of the three cells should sit on two more straight vertical lines, one either side. Where a knot sits off its line, the two cells it joins are unequal, and that came out of the measuring in the first step rather than out of the dressing, so no amount of pulling here will fix it. Note which gap it was. That is the one to measure differently next time.",
        bottom:
          "Your observer stands back with you and sights the three vertical lines on their own before either of you says anything, so the two of you are not merely agreeing with each other. They should also confirm no end has been left lying across the front. Nobody is in the pattern and no part of it goes on a person.",
        check:
          "Four knots on one vertical line and the widest points on two more, one either side; no twist left in any strand; all four ends secured at the back on the lowest step-down and nothing crossing a cell.",
        speak: "Step back and sight three lines: centre, left edge, right edge.",
        expected: {"wrapBands":6,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [],
      },
    ],
    mistakes: [
      { title: "Laying the pass over the loop instead of threading the loop onto it", body: "This is the mistake that stops the pattern working at all. If the encircling pass simply lies across the top of the loop's two strands, nothing holds those strands apart and they slide back to the centreline the moment you tension anything. The pass must go underneath both strands so the loop hangs on it, and the strands then ride outward along it and are held by friction where they cross. Tell them apart by looking at a crossing point side on: threaded correctly, the ladder strand sits on top of the pass and the pass disappears beneath it." },
      { title: "Measuring the gaps from the edge of the knot", body: "An overhand knot on the bight swallows several centimetres of rope, and it swallows a different amount depending on how hard you set it. Measure the next gap from the lower edge of the last knot rather than from its centre and you hand every gap a slightly different share of that swallowed length. The error runs one way and accumulates, so the bottom cell of the column comes out visibly squat or visibly stretched. Lay the finished ladder flat before it goes near the form and compare the three gaps against each other side by side, not against the card one at a time." },
      { title: "Setting each cell's width off the cell above it", body: "Eyeing the new width against the finished cell directly above feels efficient, but you are copying a copy. Every small overshoot is inherited and then added to, so by the third cell the column has fanned outward or pinched inward and the two edge sight lines are no longer vertical. Measure every width outward from the centreline with the same card you used for the knots. Do that and the cells stay square to one another no matter how sloppy any single one turns out, which is the whole point of measuring from a fixed reference." },
      { title: "Two passes too close together, and a four-sided cell", body: "If the pair of passes through one loop end up nearly touching, or you take only one pass through a loop at all, the strands never get a straight vertical run and the cell closes to a point at its widest. That is a hishi cell, four sides, and it belongs to a different pattern. Look hard at the widest part of every cell: a kikkou cell shows a short straight length of rope on each side running parallel to the centreline, with a knot above and a knot below. A point there means the step-down inside that loop was too small." },
      { title: "Joining rope in a run that crosses a cell", body: "You will run out of rope partway down the column and the temptation is to join wherever the rope happens to end. A join landing in a run that crosses a cell sits proud in the middle of the pattern, stops that strand sliding when you try to even the widths, and pulls the cell out of shape in a way no dressing will recover. Carry the last of the rope round to the back and join in a step-down between two passes. Remember you are travelling doubled, so there are two joins, and they need staggering by a few centimetres." },
    ],
    variations: [
      { name: "Tighter ladder, five cells", body: "Halve the card and tie six knots instead of four, which gives five cells rather than three, then build the column exactly the same way. The cells get smaller and your tolerance for a mismeasured gap shrinks with them, so a two-centimetre error that hid at wide spacing now shows on every cell at once. Expect to need noticeably more rope and at least one join." },
      { name: "Same ladder, much narrower prop", body: "Tie the identical knot ladder, then build it on something far narrower round the girth, such as a length of pipe or a tightly rolled duvet rather than a broad chair back. The knot spacing has not changed but the cells come out completely different in proportion, which forces you to measure every width out from the centreline afresh instead of reaching for the width your hands have already learned." },
      { name: "Two colours, two jobs", body: "Use one colour for the knotted ladder and a contrasting colour for the travelling rope. The finished column becomes far easier to read, because spacing faults live entirely in the first colour and tension faults live entirely in the second. When a cell looks wrong you can see at a glance which of the two you got wrong, and the threading at each crossing point becomes obvious rather than a guess." },
      { name: "One rope only, built upward", body: "Skip the second rope entirely. Tie the ladder, then use its own two tails below the bottom knot as your travelling pair, which forces you to build the column upward with the step-ups stacked on the back centreline instead of step-downs. There is no lark's head and no second-rope anchor, so the top loop has no job and only two ends need finishing at the back. Every width is now measured against knots you tied before you knew where any pass would land, and the errors have nowhere to hide." },
    ],
  },
  "larks-head-cuff": {
    goal: "A lark's head tied on a dowel or bottle, dressed and then pulled twice, so its cinching stops being a claim and becomes a distance you can measure.",
    steps: [
      {
        title: "1 · Find the middle, fold the bight, mark both parts",
        goal: "Get one clean open bight with a measured mark on each standing part, so the amount this hitch draws in can be read off later instead of guessed at.",
        rigger:
          "Run the rope through both hands from the two ends until the ends finish level with each other, and fold it there. That is the middle found by feel rather than by eye. The reason it matters is narrow and worth saying plainly: later you will grip both standing parts as one and pull them as one, so you want them the same length, marked the same distance back, and gripped at the same point. Leave the fold open. Aim for a loop about 100 mm deep, held open rather than pressed flat, because both standing parts have to pass through that loop shortly and a fold squashed flat is one you end up prising apart with a rope in the way. Now measure 300 mm back from the fold along each standing part and put a strip of tape there, measured against a rule, not stepped out by hand. Both strips at the same distance, and check the second against the first. Those two marks are the only instrument this drill has. Finish by laying the folded bight flat against the object where the hitch is going to sit, so you can see how much of the fold the girth of the object will take up. Nothing is round anything yet.",
        bottom:
          "Whoever is watching holds the rule and reads both marks back to you, because two marks set at different distances quietly spoil every number the drill produces afterwards. Nobody is inside the pattern at any point in this drill: the hitch goes on an object and stays on the object.",
        check:
          "Ends level, one fold you can see through rather than a flattened crease, and two tape strips sitting at the same measured distance back from that fold.",
        speak: "Middle by feel, fold left open, both marks the same distance back.",
        expected: {"wrapBands":0,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [],
      },
      {
        title: "2 · Bight round the object, both standing parts through",
        goal: "Build the hitch itself — the fold passed around the object and both standing parts fed through it the same way — and leave it deliberately slack.",
        rigger:
          "Take the fold in one hand and pass it around the object, bringing it back out on the side you are standing on, and keep the two legs of the bight lying side by side the whole way round rather than letting one climb over the other where you cannot see. Hold the fold open from outside it, gripping the two legs just below the fold so the loop cannot collapse while your other hand works. Keep your hand out of the loop. This is the hitch that closes on whatever is inside it, and the only things that go inside are the object and the rope. Now gather both standing parts together, hold them parallel, and pass them through the fold as one, entering from the same side, both the same way round. Threading one part in from each side is a different tangle altogether and will not cinch. Draw about 200 mm through and stop there. Take no slack out yet. It should hang loose enough that you can lift both turns clear of the surface of the object with one hand, because everything this drill measures happens in the journey from that state to closed, and a hitch snugged on the way in has already spent the thing you came to watch.",
        bottom:
          "The observer takes the far side of the object, the side you cannot see from where you stand, and says out loud whether the two legs of the bight are running parallel back there or have crossed. Nobody is in the pattern, and nothing goes inside the fold but the object and the rope.",
        check:
          "Two rope turns lying side by side around the object with no crossing on the far side, both standing parts leaving through the fold on the same side, and the whole hitch still obviously slack.",
        speak: "Bight round, both parts through together, leave it slack.",
        expected: {"wrapBands":1,"pose":"stand","view":"side","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"band","y":0.46,"w":0.26},{"kind":"stem","y1":0.46,"y2":0.86,"x":0.5}],
      },
      {
        title: "3 · Dress it square, then name what you are looking at",
        goal: "Set the hitch so its structure is legible and say aloud the one traceable feature that identifies a lark's head on sight.",
        rigger:
          "Work the slack round with both hands until the hitch is dressed: the two turns flat and parallel where they meet the object, the fold sitting square across the two standing parts instead of rolled up onto its edge, and no strand riding over its neighbour. Then draw the slack out slowly, both standing parts together, a little at a time, and stop the moment the rope is touching the object the whole way round. No further than that. Now read what you have built, out loud, in these terms. On the near side there is a small closed loop of rope lying across the object — that is the fold — and both standing parts come out from under it and through it. The two legs of that loop are the turns that go round the object. That is the recognition test, in the hand or in a photograph: find the loop lying on the object, then trace the standing parts and see that they run through it, which is why pulling them shortens the loop. Say it in words before you touch it again. A hitch you can only point at is one you will misname later on a screen.",
        bottom:
          "The observer makes you describe the hitch in words instead of pointing at it, and argues if the description does not match what is on the object. There is nobody in the pattern to watch; the object and the rope path are the only things being read here.",
        check:
          "The fold lying square across both standing parts rather than on its edge, the two turns parallel and flat, and rope touching the object the whole way round with no gap standing open anywhere.",
        speak: "Dress the fold square, then name the loop and trace the parts.",
        expected: {"wrapBands":1,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [],
      },
      {
        title: "4 · Draw a datum, pull twice, measure what it swallowed",
        goal: "Turn cinching from a claim into a measured distance by pulling a counted amount and reading how far both marks travelled.",
        rigger:
          "Draw a pencil line on the object hard against the near edge of the dressed fold. That line is your datum and it does not move. Measure from that line along each standing part to its tape mark, and write both figures down. Now take both standing parts in one hand, together, gripping them at the same point on each, and pull straight along the direction they already run: hand pressure only, no jerking, no leaning your weight into it, no hauling on one leg by itself. Hold for a count of three, then stop and let go. Measure the same two distances again. Both will have shortened, and that shortening is rope the hitch drew in through the fold as it closed. Look at the pencil line as well and note whether the whole hitch has crept along the object away from it, because a lark's head on a smooth surface slides about as readily as it closes and a datum you let travel gives you a number about nothing. Then pull again, the same way but harder, same count, and measure a third time. Treat these as comparisons between your own pulls rather than absolute values, because a hand is not a calibrated instrument. The finding is not the millimetres. The finding is that the figure keeps growing for as long as there is pull left to give it.",
        bottom:
          "The observer counts the three out loud and reads one mark while you read the other, so an uneven pull shows up as two different figures instead of a shrug. The object is the only thing this hitch is closing on, and nothing about that changes at any point.",
        check:
          "Both marks shortened by roughly the same amount as each other, a written figure for the light pull and for the harder one, and a note of whether the fold crept off the pencil datum.",
        speak: "Both parts, one hand, three-count pull, then measure again.",
        expected: {"wrapBands":1,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [],
      },
      {
        title: "5 · Fixed loop alongside it, given the same pull",
        goal: "Show on one object, with one pull, the difference between a hitch whose size the next pull decides and a loop whose size you decided when you tied it.",
        rigger:
          "Take a second rope and tie a fixed loop in it — a bowline, or a figure of eight tied on a bight folded into the end, whichever of the two you tie cleanly. Drop it over the end of the object so it sits about 100 mm along from the lark's head, then draw its standing part steadily until the loop has come to bear on the object all the way round. That step is the one people skip and it is the one that makes the comparison honest: a loop left hanging slack will feed rope on the first pull and look exactly like a hitch that closes, when all it did was take up slack. Both structures now start from the same place, in contact, no slack. Mark that standing part 300 mm back, draw a second pencil line against the loop, and measure line to mark as before. Give it the same three-count pull at the lighter of the two hand pressures you used in step 4. Watch it: it may slide along the object, it may stand up on end, but the circle itself does not get smaller, so the mark travels by almost nothing. The knot that closes it sits outside the circle and never feeds. Leave both structures in place and photograph them together from one angle, tails hanging the same way.",
        bottom:
          "The observer sets the camera position and confirms both structures read clearly from that single angle before anything is photographed, then keeps the two sets of figures written side by side. Neither structure has anything inside it but the object it was tied on.",
        check:
          "Almost no travel on the fixed loop's mark against the travel both lark's head marks showed on that same light pull, and a photograph in which each standing part can be traced either to a knot outside the circle or through a loop lying on the object.",
        speak: "Same object, same pull: one closes, one keeps its size.",
        expected: {"wrapBands":2,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"band","y":0.66,"w":0.24},{"kind":"stem","y1":0.66,"y2":0.92,"x":0.62}],
      },
    ],
    mistakes: [
      { title: "Pulling one standing part instead of both together", body: "Load one leg on its own and the hitch closes around that leg, so the fold rolls sideways where it lies on the object and one tape mark travels while the other barely stirs. The number you write down then describes your grip, not the hitch. You can see it before you measure anything: the fold sits at an angle across the standing parts instead of square to them, and one leg of the bight has climbed over the other on the object. Work the slack back out by hand, dress it square again, and pull both parts as one from a single grip point." },
      { title: "Feeding the two parts through the fold the wrong way", body: "Both standing parts must enter the fold from the same side and lie parallel through it. Take one in from each side, or let the fold take a half turn before you feed them, and the loop lands on the object on its edge rather than flat. It bites earlier and harder for the same pull, it closes unevenly along the object, and it sets into a lump you have to pick apart rather than one that eases open. The tell is on the far side, which is exactly why somebody is watching it: back there the two legs cross instead of running parallel. Undo it and re-feed rather than trying to twist it flat once it has tightened." },
      { title: "Believing the size you dressed it at", body: "A lark's head dressed loose looks like a loose lark's head and it is nothing of the kind, because it has no size of its own to be loose at. Its dimension is whatever the last pull left it at, and the next pull sets a new one. Skip the measuring and you finish describing this hitch by how it looked in the moment you stopped dressing it, which is a description with a variable buried in it that you never wrote down. The two marks and the pencil datum exist so that the description leaves your hands with a number attached to it." },
      { title: "Naming it from a photograph before tracing the rope", body: "In a still image a lark's head and a fixed loop can look nearly identical: a circle of rope on an object with a tail leaving it. The difference is one line you can follow with your eye. In a lark's head the standing parts run into and through the loop that lies on the object, so pulling them shortens that loop. In a fixed loop the standing part stops dead at a knot sitting outside the circle, so pulling it cannot make the circle any smaller. Trace the standing part first and name the structure second. Doing it the other way round is how confident people get it wrong." },
      { title: "Testing it on one surface and generalising", body: "A hard, incompressible object gives this hitch an obvious stopping point. Once the rope is flat against the surface the whole way round, another pull of the same size moves the marks barely at all, and you walk away believing the hitch closes by a set amount and then stops. Tie the same hitch on a tightly rolled towel, give it the same three-count pull, and the marks keep travelling. The stop was never in the hitch. It was in the object, and the next object is under no obligation to provide one." },
    ],
    variations: [
      { name: "Same hitch, two very different ropes", body: "Run the whole drill again with a slick synthetic and then with a hairy natural-fibre rope of the same diameter, on the same object, with the same three-count pull, and write the two travel figures next to each other. The slick rope usually draws in more and eases open again afterwards; the hairy one grabs early and then sets where it stopped. One hitch, two different amounts of closing, which is precisely the thing worth carrying away from it." },
      { name: "Build it blind on the far side", body: "Use a bolster or a roll wide enough that you cannot see the back of it, and build the hitch by feel alone: fold round, both parts through from the same side, dressed square, without leaning over to look. Then walk round and check whether the two legs came out parallel or crossed. This version tells you whether your hands know the rope path or whether your eyes have quietly been doing the work for them the whole time." },
      { name: "Staged pulls read against a rule", body: "Keep the marks at 300 mm and lay a rule alongside so you can read to the millimetre, then pull in three separate counted stages of the same effort, measuring after each rather than only at the end. You get three numbers instead of one, and the shape of that little sequence tells you whether the hitch gives most of its ground on the first pull or keeps surrendering at a steady rate for every pull after it." },
      { name: "Assemble a recognition set", body: "Tie a lark's head on one bottle and a fixed loop on an identical bottle, photograph both from the same angle and distance with the tails hanging the same way, then look at the two pictures again a week later having touched nothing in between. Name each one. If you cannot separate them on the screen, trace the standing part in each image until you can, because that trace is the entire skill this drill is built around." },
    ],
  },
  "rope-corset": {
    goal: "Four slack bands with a second rope laced up through them in matched crossings; the drill is symmetrical lacing and a path that opens from either end.",
    steps: [
      {
        title: "1 · Mark the lines and lay the top band",
        goal: "Set the three reference lines the whole panel is measured from, then lay the first band across them, slack.",
        rigger:
          "Pick one face of the form and call it the panel face. Every crossing will show on that face, so choose it now rather than discovering it halfway down. Run a strip of masking tape straight down the middle of that face, top to bottom. That is the lacing line, and it is the centre of the column of crossings. Tape rather than cord, because a cord laid down the face gets pinned under every band you then lay over it and you cannot move it afterwards. Next, knot a short spare cord so two knots sit eight or nine centimetres apart. That knotted length is your gauge, and every measurement in this panel comes off it. Lay it flat across the panel face and put a second strip of tape half a gauge to the left of the lacing line and a third half a gauge to the right. Those two are the tuck lines, the places the lacing will pass under every band. Marking them costs a minute and it is the minute that stops the panel wandering later. Now fold the first rope in half and hold the bight against the back of the form. Take the doubled rope round, across the panel face, and back to the bight. Pass both working ends through the bight, then lock them with a half hitch over the band's own wrap so the knot lies flat on the back. All the hardware sits behind; the panel face carries one clean band and nothing else. Leave that band visibly slack — slack enough that it looks wrong to you — because the lacing, not the band, takes the tension out of this panel at the end, and a band you have already pulled tight has nothing left to give.",
        bottom:
          "If someone is helping, their job here is to stand off to one side and say whether the band sits level the whole way round the form, because you cannot watch the far side and the panel face at the same time while your hands are working. They can also keep the loose tails off the floor and out from under your feet. Nobody is inside this pattern. The form is an object and it stays one for the whole drill.",
        check:
          "One band crossing the panel face, level rather than slanting, meeting the lacing line and both tuck lines square, the half hitch and both working ends sitting on the back, and the band slack enough that a bight of spare rope slides under it at either tuck line without being forced.",
        speak: "One band, level, lock on the back, deliberately slack.",
        expected: {"wrapBands":1,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"band","y":0.28,"w":0.62}],
      },
      {
        title: "2 · Stack three more bands into a ladder",
        goal: "Build the four-band ladder the lacing is woven through, gauged rather than eyeballed, with every band still slack.",
        rigger:
          "Both working ends are on the back of the form. Run them straight down the back to where the next band goes — down the back rather than round the side, so the panel face stays clear of everything except bands and lacing. Set the drop with the gauge cord instead of your eye: hold one knot against the lower edge of the band above and lay the new band where the other knot falls. Then lay it as you laid the first, except that there is no bight left to pass through: doubled rope once round, across the panel face, back to the working position, locked with a half hitch on the back. Do that twice more, so you finish with four bands and three gaps. If the rope runs out partway, join it on the back with a bend and carry on; a join sitting on the panel face reads as a fault from across the room even when it holds perfectly well. Keep every band as slack as the first one. This is the part people rush, because four slack bands look like nothing much and the pattern has not started to appear yet. But a laced panel takes its tension from the lacing, not from the bands, and if you have already taken the slack out of the bands there is nothing left for the lacing to draw. Check as you go that each band meets all three tape lines square, because a band that slants by a couple of degrees puts its two tuck points at different heights and you will see that as a lopsided crossing four minutes from now.",
        bottom:
          "A second pair of eyes earns more on this step than on any other. Ask whoever is watching to stand well back and say whether the four gaps read as equal from over there, because a centimetre of drift is invisible at arm's reach and obvious from across the room. They call it out, you adjust; they do not reach in and fix it, because then neither of you knows what you laid. Nobody is in the pattern — the form is unoccupied and stays that way.",
        check:
          "Four bands down the panel face, parallel to one another, the gaps equal when you offer the gauge cord to each of them, every band meeting the lacing line and both tuck lines square, and all four still slack enough to pass a bight under at the tuck lines.",
        speak: "Gauge every gap. Locks on the back. All four still slack.",
        expected: {"wrapBands":4,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"band","y":0.4,"w":0.62},{"kind":"band","y":0.52,"w":0.62},{"kind":"band","y":0.64,"w":0.62}],
      },
      {
        title: "3 · Set the lacing rope under the bottom band",
        goal: "Get the lacing rope onto the panel so it can still slide, with a free loop hanging below and both tails level.",
        rigger:
          "Take the second rope and find its middle: run both ends together through your hand until they sit level, then follow the doubled rope back to the fold. Hold that fold below the bottom band, on the lacing line, with about a gauge of it hanging free. Now take the left tail up under the bottom band at the left tuck line — under both strands of that band, not between them — and bring it out above the band. Take the right tail up under the same band at the right tuck line, again under both strands. Do not hitch either one. Do not pull the tails through the fold to lark's-head the lacing onto the band, however much tidier that feels while you work. A lacing fixed to a band can only ever be worked from the far end, and the first you will know about it is when you are picking at a buried tuck in the middle of a finished panel. What hangs below the bottom band is a free loop, and that loop is the handle you will snug the lower half of the panel with, so it has to stay free to slide. Tug each tail in turn and watch the loop shorten and lengthen; if it stays put, you have caught something. Finally, bring the two tail ends together above the panel and confirm they are still level, because everything above this depends on the two sides having the same amount of rope to spend.",
        bottom:
          "An observer can hold the two tails apart, one in each hand, while you set the loop, so they do not twist round each other before the crossings start. A twist put in here shows up three gaps higher as a crossing that will not lie flat, and it is far easier to prevent than to chase. There is nobody in the pattern to attend to on this drill, so all of that attention goes to the rope and the form.",
        check:
          "A free loop of about a gauge hanging below the bottom band, each tail passing under both strands of that band at its own tuck line, the loop shortening and lengthening when you tug a tail rather than staying put, and the two tail ends level when you bring them together.",
        speak: "Both tails up under the bottom band. Loop hangs free below.",
        expected: {"wrapBands":4,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"stem","x":0.5,"y1":0.64,"y2":0.76}],
      },
      {
        title: "4 · Cross and climb, left over right in every gap",
        goal: "Weave the lacing up the ladder with three matching crossings, one centred in each gap.",
        rigger:
          "Work upward, one gap at a time. Bring the two tails in to meet on the lacing line, halfway up the gap between the bottom band and the one above it, and cross them there. The strand arriving from your left lies on top of the strand arriving from your right. Every crossing, the same way, the whole way up. That is a rule about position rather than about which piece of rope is which — each strand swaps sides at every crossing, so left over right by position is exactly what makes the three crossings match, and matching crossings are the only thing anyone can assess from across the room. Having crossed, each strand carries straight on in the direction it is now pointing, out to the tuck line on that side, and tucks under the next band up from below, under both strands of that band and never between them, coming out above it. The strand that went under on the left of the band below goes under on the right of this one. Then bring both back in to the lacing line and cross again in the next gap. Four bands give you three gaps and three crossings, and no more. Because the tuck lines sit half a gauge out and the bands sit a gauge apart, each crossing should read as a square X with its arms at about forty-five degrees; a crossing that comes out long and thin, or squat and wide, is telling you that a tuck went in at the wrong place, not that the crossing is wrong. Keep all of it loose while you work. You are laying the path, not tightening it, and a crossing you placed loose and then set is worth three you placed tight and then argued with.",
        bottom:
          "The most useful thing an observer can do here is call the crossings out loud as you make them — left over right, left over right — because the error is almost never a misunderstanding of the rule, it is losing the count while your hands are busy and the rope is talking to you. They can also stand back and say whether each tuck is landing on its tuck line. They are watching rope go onto a form, and there is nobody in the pattern for them to be watching instead.",
        check:
          "Three crossings, each centred on the lacing line halfway up its gap rather than riding against a band, each one a square X of roughly the same size as the others, and at every one the strand arriving from the left lying over the strand arriving from the right.",
        speak: "Left over right, then under the next band on that side.",
        expected: {"wrapBands":4,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"x","y":0.58},{"kind":"x","y":0.46},{"kind":"x","y":0.34}],
      },
      {
        title: "5 · Draw the slack out from both ends",
        goal: "Snug the panel from the loop and from the tails in turn, so the tension is even and the lacing proves it runs free.",
        rigger:
          "Now take the slack out, and take it from both ends in turn rather than hauling on one. Start at the bottom. Draw the free loop downward, gently and steadily, and watch the panel above it: slack should travel up through the crossings a gap at a time and you should be able to see it move. Then go to the top, take a tail in each hand, draw them up, and watch slack travel back down. Alternate, a little at each end, three or four times, and let the tension meet somewhere in the middle of the panel. Between pulls, nudge each crossing so it sits centred on the lacing line and each tuck so it sits on its own tuck line, because tension drags both of them sideways and they do not go back on their own. If a crossing stays loose no matter which end you pull, the band below it is trapping the lacing, and the usual cause is a tuck that went between the band's two strands instead of under both. The answer is to go back and re-lay that tuck, not to pull harder. Pulling harder on a trapped lacing is how a laced panel jams, and once it has jammed you are picking it apart rather than drawing it open. Step round and look from the side while you work, because bands ride up on one edge as tension comes on, and from the front you will not see it happen.",
        bottom:
          "Ask whoever is watching to stand square in front of the panel and tell you which crossing sits highest and which sits lowest, since that drift is plain from head-on and impossible to judge from where your hands are. Nothing is being tightened onto anybody here. This is a laced panel on an unoccupied form, and the only thing under tension is rope against an object that cannot feel it.",
        check:
          "Slack travelling through the panel when you pull at either end, no single crossing staying loose while the ones either side of it draw tight, the tucks still sitting on their tuck lines, and from the side the four bands still level rather than one edge climbing.",
        speak: "Pull the loop, then the tails. Watch the slack travel.",
        expected: {"wrapBands":4,"pose":"stand","view":"side","handsVisible":true,"neckClear":true},
        wraps: [],
      },
      {
        title: "6 · Tie the tails to each other and dress the panel",
        goal: "Close the lacing with a tie-off that holds the two tails alone, then set every crossing flat.",
        rigger:
          "Bring both tails up above the top band, in to the lacing line, and tie them to each other — to each other, and to nothing else. A square knot finished with a slipped bight is plenty here. What matters is that the tie-off does not pass round a band, does not capture a crossing, and does not pinch the lacing where it runs under the top band. The moment the tie-off grips the pattern rather than the two tails alone, the panel stops being something you can open from either end and becomes something you have to dismantle from one, which is the exact failure this whole construction exists to avoid. Check the bottom as well as the top: with the knot tied, the free loop below the bottom band should still draw down a centimetre or so and spring back, and if it has gone solid the tie-off has caught something above it. Then dress the panel. Run your hand down the column and set each crossing flat, so the two strands lie side by side where they meet instead of one rolling over the other. Straighten any band that has twisted along its length, turning the twist out towards the back rather than pulling on it. Leave the two tails hanging clear below the tie-off and leave the bottom loop hanging clear too, so the two ends that open this panel are also the two easiest things to find.",
        bottom:
          "There is an honest test a second person can run here: ask them to point at the tie-off and say out loud which single pull opens it. If they cannot tell by looking, that is information about the knot you tied rather than about them, and it is worth more to you now than after the panel has set. As on every step of this drill, the pattern is on a form and there is nobody in it.",
        check:
          "The tie-off holding the two tails and nothing else, with no band and no crossing caught inside it, the free loop below the bottom band still able to draw down, and the three crossings still stacked on the lacing line with all four bands level.",
        speak: "Tails to each other only. Never round a band.",
        expected: {"wrapBands":4,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"stem","x":0.5,"y1":0.18,"y2":0.28}],
      },
    ],
    mistakes: [
      { title: "The lacing is lark's-headed onto the bottom band", body: "It happens at the entry. Instead of leaving the fold hanging free below the bottom band and taking both tails up under it, you pull the two tails through the fold and cinch it onto the band, because that holds while you work and looks tidier. It also welds the lacing to the panel. You find out at the snugging step, when the free loop will not draw down at all and slack refuses to travel past that band whichever end you pull. Free it and re-enter the lacing rather than compensating with tension from the top." },
      { title: "A tuck went between the band's two strands, not under both", body: "Each band is a doubled rope, so it presents two parallel strands and a tempting gap between them. A tuck that goes into that gap looks identical to a correct one until you load the lacing, at which point the band closes on it and the lacing stops sliding at that point. The tell is local: one crossing stays loose while the crossings above and below it both draw tight, and pulling from either end changes nothing. Go back to that band, pull the tuck out, and re-lay it under both strands together." },
      { title: "Bands laid tight, so the lacing has nothing to draw", body: "A laced panel takes its tension from the lacing, and that only works if the bands went on slack. Lay them snug and there is no slack in the system for the crossings to take up: the lacing sits limp on top of a rigid ladder, the crossings will not centre on the lacing line, and pulling harder does nothing except bury the bands into the form. It has a specific look. The crossings flop about while the bands themselves appear neat and tidy, which is precisely the wrong way round for a finished panel." },
      { title: "The crossings change handedness partway up", body: "You start with the left strand over the right, then somewhere around the second gap your hands take the shorter route and the right goes over instead. Part of the panel now reads as a plait and part as a row of matching crossings. Look at the upper strand of each crossing and see which way it leans: in a consistent lacing every one leans the same way, and the odd one out marks the gap where you lost the rule. It shows worst after snugging, when the mismatched crossing pulls the column off the lacing line." },
      { title: "Snugged from one end only, so half the panel never moves", body: "Working the whole panel from the top tails feels efficient and gives you a panel that is crisp at the top and slack at the bottom, because friction under each band eats the tension before it reaches the gaps below. The tell is in the gaps: the top crossing sits tight and centred while the bottom one still carries a visible loop. If the two tails also finish at wildly different lengths, the entry was off centre as well. Alternate ends, a little at a time, and let the tension meet in the middle." },
    ],
    variations: [
      { name: "Work it on something that compresses", body: "Build the same four-band panel on a rolled duvet or a bolster rather than a firm form. A soft prop swallows a slack band, so the lacing has nothing to pass under, and you learn quickly how much slack a band actually needs before its two strands stay findable. The gauge cord matters more here too, because the surface gives under the rope and hides drift in the spacing." },
      { name: "Six bands at half the spacing", body: "Same construction, six bands, gaps half as wide, and the tuck lines moved in to a quarter gauge each side so the crossings stay square. That gives five crossings instead of three in much less room, so any drift in the column accumulates twice as fast and shows two gaps earlier. It is the honest test of whether the gauge is doing the work or your eye has been guessing." },
      { name: "Lace downward instead of upward", body: "Hold the fold above the top band and take both tails down under it, working the crossings downward and tying off below the bottom band. The geometry is identical and the handling is not: gravity now helps the tails and fights the free loop, and you find out whether you were following the crossing rule or merely following your direction of travel." },
      { name: "Stiff jute against soft cotton", body: "Run the panel once in a stiff, dry jute and once in a soft cotton of the same diameter. Stiff rope holds every crossing exactly where you set it, faults included, and shows them plainly as you build. Soft rope slides under the bands and forgives placement, then hands you the whole accumulated error at once the moment you take the slack out." },
    ],
  },
  "rope-dress": {
    goal: "A knotted stem and a lattice of four-sided cells worked down a form from ropes joined end to end, drilling working-end management and knowing your place.",
    steps: [
      {
        title: "1 · Set the reference band and name the five sections",
        goal: "Fix the doubled band the whole pattern is measured down from, dress it flat, and settle the five section names you will use to say where you are.",
        rigger:
          "Fold your first rope in half and hold the bight. Work on the wide upper part of the torso section of the form, a good hand's span below where that section ends, and never up at the narrow top of the form — nothing in this drill goes above this band at any point, and the top of the form stays bare rope-free from start to finish. Pass the bight round the form, then pass both working ends through the bight and draw it closed so it chokes on the form. That is a lark's head. This band is the reference line: every knot and every cell below is measured down from it, so if it sits crooked the whole pattern sits crooked and you will not see why until you are four cells in. Dress it before anything else moves. Run your thumbs along the band and draw the two strands apart until they lie as two flat parallel lines the whole way round, not as a rolled twist. A doubled band laid twisted stays twisted, and every section below inherits the roll. Then say the five section names out loud in build order: reference band, knot stem, upper cells, lower cells, hem band. Say them twice. It feels like theatre and it is not — on a build this long what fails is not a knot, it is knowing where you are.",
        bottom:
          "An observer's job on this step is to listen for the five names and say them back in order, and to look at the band from the far side of the form and report whether it sits level all the way round. Nobody is in the pattern and nobody stands in for the form. An observer watches, hands rope, and calls out what they can see.",
        check:
          "Both strands of the band lie flat and parallel with no twist between them, the band sits level all the way round rather than dipping at the back, and no rope sits above it or anywhere near the top of the form.",
        speak: "Band doubled and flat. Say the five section names aloud.",
        expected: {"wrapBands":1,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"band","y":0.3,"w":0.6}],
      },
      {
        title: "2 · Hank the tail, then tie the knot stem",
        goal: "Shorten the loose rope into a hank you can carry, and tie the chain of stem knots that will give every cell its top and bottom vertex.",
        rigger:
          "Do not start the stem with three metres of loose rope swinging off your hand. Hank it first. Gather the working end into folds about thirty centimetres long, stacked flat against each other, then lock the bundle at its middle with one slipped half hitch, so a pull on the tail spills the whole thing in a second. Leave roughly a metre and a half running loose — that is one section's reach and no more. Keep the hank in your working hand and off the floor, because rope on the floor collects grit and, more to the point, it is the rope you tread on when you step round the form. Now bring both strands together down the centre-front line and tie the stem. Each stem knot is a plain overhand knot tied in the doubled pair itself, both strands handled as one rope: the first about a hand's width below the reference band, then four more at intervals that grow slightly as you go down, ending about level with the middle of the form. Tie every one the same way round, the same strand riding on top each time, or the stem corkscrews off the centre line and you will not notice until the fault is three knots back. Leave each knot loose enough that the loop of doubled rope below it stays open, because you will pass rope through those loops later and a knot pulled shut now is a knot you fight then. Count them out loud as they go on. Five knots give you four cells.",
        bottom:
          "An observer should stand three paces off to one side and call out drift, because a stem wandering off the centre line is obvious from there and nearly invisible from where you are standing. Nobody is in the pattern; the form takes every knot and no person is placed in rope at any point of this drill.",
        check:
          "Five knots down the centre line, each tied the same way round, each with a visibly open loop of doubled rope below it, the spacing growing slightly rather than shrinking, the stem still tracking the centre line, and no rope lying on the floor.",
        speak: "Hank the tail first. Five knots, all the same way round.",
        expected: {"wrapBands":2,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"stem","x":0.5,"y1":0.3,"y2":0.64}],
      },
      {
        title: "3 · Make the first join, then open the first cell",
        goal: "Join a fresh rope in a place you chose rather than a place you ran out in, then build the first four-sided cell between the top two stem knots.",
        rigger:
          "Rope runs out. The difference between managing rope and holding rope is whether it runs out where you decided, so count before you build. Run what is left through your hands and estimate it in full passes round the form, because one pass costs a known length and you now roughly know that number. Fewer than two passes in hand and you join here rather than halfway through a cell. To join: tie a plain overhand stopper in the end of the running rope, leaving a short tail beyond it. Fold the fresh rope and hold its bight. Lay that bight across the running rope just behind the stopper, pass the fresh rope's two standing parts through their own bight, and draw them down hard until the bight chokes onto the running rope and jams against the stopper so it cannot slide off. Place that join deliberately, on the back face of the form and on a plain run of rope — never inside a stem knot, never at a cell vertex, where a knot sits proud and gets worked over later. Now the first cell. Below the top stem knot, separate the pair: one strand out to the left, one out to the right. Carry both round the back at the same height, cross them once at the back, and bring them to the front again at the second stem knot. Pass each strand through that knot's open loop from its own side, then draw both outward and down. That is the cell: top vertex in the upper knot, bottom vertex in the second knot, two flank turns, four sides.",
        bottom:
          "Ask your observer to watch the join go in and to remember which face of the form it landed on, because you will want that answer later and you will not want to trace the whole rope path to get it. Nobody is in the pattern, and an observer never stands in for the form for any part of this.",
        check:
          "The join is closed hard against its stopper with no gap showing and sits on a plain back run rather than in a knot or at a vertex, and the first cell shows four straight sides with its two flank turns at the same height on both sides.",
        speak: "Count before you join. Join on the back, never mid-cell.",
        expected: {"wrapBands":3,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"diamond","cy":0.37}],
      },
      {
        title: "4 · Build the remaining cells with widening spacing",
        goal: "Work the three cells below the first, opening each one wider than the one above, and keep every flank turn level with its opposite number.",
        rigger:
          "Carry on down the stem one cell at a time, and say the row number out loud as you start it. From the second knot, spread the two strands outward and down, take them round the back at equal height on both sides, cross them once at the back, bring them forward to the third knot, and pass one strand through that knot's open loop from each side before spreading them again. Repeat from the third knot to the fourth, and from the fourth to the fifth. The cells must grow as they go down. That widening is the whole reason this reads as a garment pattern instead of a stack of identical rungs, so let each pair of flank turns sit a little further apart and a little further down than the pair above. Do not eyeball it. Knot two marks in a short cord and use the cord to set each drop, because a gap that is meant to grow is exactly the gap that comes out even when you judge it by hand. Draw each cell up along the line the rope was travelling — outward and down — rather than straight out from the form, because pulling straight out drags the cell above it out of shape, and that is a fault you only see once you step back. Finish the section by naming your place out loud: cells done, four of them, hem band next. That sentence is the drill.",
        bottom:
          "An observer is better placed than you to see whether the cells actually widen going down and whether the back crossings stack in a line, so ask for those two calls specifically rather than for a general opinion. Nobody is in the pattern, and no person is placed in rope at any stage of this drill.",
        check:
          "Four cells down the stem, each visibly taller and wider than the one above it, every flank turn level with the turn on the opposite side, and the crossings at the back stacked in a line rather than wandering left and right.",
        speak: "Each cell wider than the last. Flank turns level, both sides.",
        expected: {"wrapBands":6,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"diamond","cy":0.44},{"kind":"diamond","cy":0.52},{"kind":"diamond","cy":0.61}],
      },
      {
        title: "5 · Count the rope, plan the second join, close the hem",
        goal: "Measure what is left before the last section, join early if it will not reach, and close the pattern with a single hem band tied off short.",
        rigger:
          "This is where people get caught, because the last section is the one you can see the end of and so you stop counting. Count anyway. The hem band costs one full pass round the widest part of the form, plus enough to lock it and tie off short, so pace that length out through your hands before you commit to it. If what you are holding will not cover it with a comfortable margin, make the second join now. A join made calmly two minutes early is invisible in the finished pattern; a join forced in the middle of the hem band with fifteen centimetres left is a lump in the most visible line you have. Make it exactly as you made the first — overhand stopper in the running end, bight of the fresh rope choked onto the rope behind that stopper — and put it on the back face close to the first one, so both joins live in one place and you can find them both later without tracing the whole path. Then lay the hem band. From the bottom stem knot, take the pair round the form in one continuous pass about a hand's span below that knot, holding it parallel to the reference band rather than letting it follow the taper of the form. Meet the stem again at the front and lock it: pass the working end under both stem strands, back over them, under itself, and pull along the direction the rope was travelling. Tie off with two half hitches snugged against that lock and leave the tail short and tucked, because a long hanging tail is rope you will tread on and rope you cannot account for.",
        bottom:
          "Have your observer count the remaining rope out loud with you before the join goes in — two people agreeing that it will not reach is quicker than one person hoping it will. Nobody is in the pattern, and nothing about this drill involves a person wearing any part of it.",
        check:
          "Both joins sit on the back face within a hand's reach of each other, each closed hard against its own stopper, and the hem band runs parallel to the reference band rather than tilting with the taper, with the tail finished short rather than hanging.",
        speak: "Count what is left. Join early or not at all.",
        expected: {"wrapBands":7,"pose":"stand","view":"side","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"band","y":0.74,"w":0.72}],
      },
      {
        title: "6 · Dress it section by section and call your position",
        goal: "Take the slack out at each section's own lock, square every cell, and prove you can name where any rope in the pattern sits.",
        rigger:
          "Go back to the reference band and work downward in the same order you built: reference band, knot stem, upper cells, lower cells, hem band. In each section, straighten the doubled rope so both strands lie flat and parallel, and take twists out by running them along the rope's own path rather than lifting a strand away from the form. Take the slack out along the direction the rope travelled and finish it at that section's own lock, so the slack leaves the pattern there. Slack pushed downward has not gone anywhere — it has become the next section's problem, and by the hem there is nowhere left for it to go. Square each cell as you pass it: top vertex sitting in its knot, bottom vertex in the next knot down, both flank turns level, so the cell reads as four straight sides rather than a bag. Then run the actual exam of this drill. Ask your observer to point at any rope in the pattern at random, and answer in one sentence, without tracing it with your hand: which section it belongs to, whether it was laid before or after each join, and which way the working end was travelling when it went on. Do that three times, on three different sections. If you cannot answer, the pattern in front of you came out looking right by accident, and a pattern that came out right by accident is one you cannot repeat, reverse, or correct halfway through.",
        bottom:
          "The observer's job here is to point and then keep quiet, so the answer is yours rather than theirs. Nobody is in the pattern and nobody has been at any point. If a person is in the room they are pointing, handing rope, or watching, and nothing else.",
        check:
          "Every doubled run shows two flat parallel strands with no twist left in it, each section's slack was finished at its own lock rather than pushed into the section below, all four cells sit square, and three ropes picked at random get named by section, build order and direction.",
        speak: "Dress top to hem. Name any rope you are pointed at.",
        expected: {"wrapBands":7,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [],
      },
    ],
    mistakes: [
      { title: "Running the stem with the whole rope loose", body: "Skipping the hank feels faster for about ninety seconds. Then the loose end is under your feet, wound round the stand and picking grit off the floor, and every stem knot costs you three metres of rope pulled through by hand instead of thirty centimetres. You can tell because you keep walking round the form to retrieve the end rather than the rope reaching you, and because the tail whips when you pull. The pattern still appears, but the drill this page exists for has not been practised at all." },
      { title: "Pulling the stem knots shut", body: "An overhand knot tied in the doubled pair and then snugged hard has no loop left below it, and the loop is the whole point — it is what the next cell's strands pass through. With the loops closed you end up laying the strands across the front of the knot instead of through it, and the cell has no real top vertex. The tell is that the cell slides down the stem when you touch it, and that the knots look tidy and tight while every cell below them sags. Tie them loose, leave the loops open, and take the slack out at dressing." },
      { title: "Joining where the rope ran out rather than where you chose", body: "A join that happens to you lands mid-cell, or worse inside a stem knot, where it sits proud in the most worked part of the pattern and takes tension from both directions. It is also the hardest place to undo later. The tell comes at strip-down: you go looking for your two joins and find them on two different faces of the form, and you have to trace the entire rope path to locate the second one. Count the rope in passes round the form before each section, join early, and put both joins on the back face near each other." },
      { title: "Cells that do not grow, and flank turns that do not match", body: "Two faults with one cause, which is judging by hand instead of measuring. If every knot interval is identical the cells come out as identical rungs and the pattern reads as a ladder rather than a garment. If the two flank turns of a cell sit at different heights, the cell leans and every cell below inherits the lean. Both are hard to see close in and obvious from three paces or in a photograph. Use a cord with two knots in it to set each drop, and check each cell's left turn against its right before you move down." },
      { title: "Losing which section you are in", body: "On a build this long there is a point, usually during the third or fourth cell, where you stop narrating and start reacting to whatever rope is in your hand. From there you spread a cell off the wrong knot, or dress one section twice and never touch another, or lay the hem band before the last cell is closed. The test is blunt: someone asks where you are and you cannot answer without putting a hand on the reference band and tracing down. Naming the section out loud as you finish it costs two seconds and is the only thing that reliably prevents this." },
    ],
    variations: [
      { name: "Three short ropes instead of two long ones", body: "Run the same five sections with deliberately short ropes, so that you are forced into three or four joins rather than two. Every join then has to be planned onto a section boundary rather than absorbed mid-build, and the counting habit gets drilled hard because you are never more than a section away from running out again." },
      { name: "A straight-sided prop", body: "Build it on a length of pipe, a bolster or a rolled duvet instead of a tapered form. Without the taper, uneven cells have nowhere to hide and every flank turn is measurable against its neighbour. On a smooth pipe the cells also slide, which shows you immediately which stem knots are holding the geometry and which ones you left as decoration." },
      { name: "Two colours to expose the joins", body: "Work the reference band and knot stem in one colour and join in a contrasting rope for the cells and hem. The joins become impossible to hide, so you can see at a glance whether both landed on the back face, on plain runs rather than in knots or vertices, and at section boundaries rather than wherever the rope happened to end." },
      { name: "Hard limit on loose rope", body: "Set a rule that no more than one metre of working end may ever be loose, and re-hank at the start of every section without exception. It slows the build noticeably at first and then stops slowing it at all, and it removes the floor entirely as a place rope can go. Have your observer call it out whenever more than a metre is hanging." },
    ],
  },
  "sennin-pattern": {
    goal: "Eight identical rope diamonds in a row between two measured frame lines on a flat board. It teaches spacing, repeatability and honest measurement.",
    steps: [
      {
        title: "1 · Lark's head the datum line across the board",
        goal: "Fix the upper frame line to the board so it cannot slide, dress it parallel to the top edge, and settle on a rigid gauge that will not shrink over eight repeats.",
        rigger:
          "Find the bight at the middle of the rope and lay the doubled line across the face of the board about a third of the way down, so both strands run side by side and read as one thick line rather than two thin ones. Carry the bight off the right-hand edge, across the back, and round the left-hand edge so it comes back to the front beside where you started. Now pass both working strands through the bight and draw them up until the loop closes on the edge of the board. That is a lark's head, and it is the reason the panel does not travel down the face the moment a diagonal pulls on it — a plain wrap round a flat board is held by friction and nothing else, and friction is the first thing to go. Dress the line before you go further: run a flat palm along it from the lark's head to the far edge so the two strands lie beside each other rather than rolling one over the other, then nudge the whole line until it runs parallel to the board's top edge along its entire length. That line is the datum, and every vertical measurement in this panel is taken from it or from the left edge of the board, never from the last thing you happened to lay down. Before any diagonal rope exists, choose a gauge: a strip of stiff card cut to a fixed width, or a lolly stick. It has to be rigid, and it has to be an object you can set down and pick up again unchanged. Anything that squashes, stretches or gets estimated by eye is not a gauge, because it changes size without telling you, and it will change size at exactly the point in the drill where everything depends on the unit holding still.",
        bottom:
          "If someone is in the room with you, hand them the gauge and make them the one who measures. An observer who did not build the panel will see drift that the builder's eye has already learned to forgive. Nobody is placed in this pattern at any point — the board is the only thing rope goes on here.",
        check:
          "The doubled line lies flat with both strands side by side rather than crossed, the lark's head is closed down on the edge rather than sitting slack, and the gap between the line and the board's top edge reads the same at the left end, the middle and the right end. The gauge is one rigid object of one fixed width.",
        speak: "Lark's head the datum line, then dress it flat and parallel.",
        expected: {"wrapBands":1,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"band","y":0.3,"w":0.62}],
      },
      {
        title: "2 · Lay the lower frame line four gauge widths down",
        goal: "Set the panel's second boundary a measured distance below the datum, prove it parallel in three places, and only then lock it, because every cell inherits this gap.",
        rigger:
          "Carry the working rope down the face and take it round the board the same way the first line went — off the right-hand edge, across the back, round the left-hand edge — so both lines turn the board in the same direction and both leave their working parts at the left edge. Lay it flat, strands side by side, and leave it loose enough to slide under a flat palm. Now do not eye the gap. Stand the gauge on end in the space between the two lines at the left end of the panel and count how many widths fit. Four is a sensible panel height for a first attempt, and whatever number you choose you are stuck with it for the rest of the drill, because it fixes the height of all eight cells at once. Take the same reading in the middle of the panel, then again at the right end. All three must come out the same whole number. If it reads four at the left and three and a half at the right, the lower line is not parallel to the datum, and every cell built between them inherits the same lean: the crossings climb steadily across the panel and no amount of dressing at the end brings them level again. Correct it by sliding the whole line with a flat palm until the three readings agree, never by pulling one end tighter, because pulling flatters the picture and leaves the tension uneven underneath it. Only once the three readings agree, lock the line: tuck the working rope under the upper line where that line turns the left edge, and half hitch it back on itself. Write the three readings down on a scrap of paper. You will want those numbers at the end, and memory is not a gauge either.",
        bottom:
          "Ask your observer to take the three gauge readings themselves and say the numbers out loud before you lock anything. You already believe the line is parallel or you would have moved it, and that belief is precisely the thing that needs an outside opinion. No person stands in for the board and no person is in the pattern.",
        check:
          "Three gauge readings taken in the space between the frame lines — left end, middle, right end — the same whole number each time and written down. Both lines flat where they turn the edges of the board, neither strand riding up over its pair, and the lower line hitched off rather than left free to travel.",
        speak: "Gauge the gap at both ends and the middle. Same number three times.",
        expected: {"wrapBands":2,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"band","y":0.62,"w":0.62}],
      },
      {
        title: "3 · Mark ten stations on each line before any diagonal",
        goal: "Set out every turning point in one measured run from the left edge, so the spacing is decided by measurement rather than by wherever the rope happens to fall.",
        rigger:
          "This is the step that makes the drill worth doing and it is the one people skip. Work along the upper frame line from the left edge of the board. Set the first mark one full gauge width in from that edge and call it station nought, which keeps the first hitch clear of the edge turns and the lark's head. Then step the gauge along and mark stations one to nine at successive widths: ten marks in all, made with a small tab of low-tack tape or a chalk tick on the board itself, never on the rope, because rope moves throughout this drill and a mark that travels with it is not a measurement. Do the same along the lower frame line, starting from the same left edge, so the two rows of marks stand vertically above one another. Know what those ten marks buy you before you start hitching: ten marks give nine intervals, nine intervals give nine crossings, and nine crossings give eight full diamonds with a half cell left over at each end of the panel. The half cells are offcuts and you do not compare them with anything. Stepping a gauge carries a sliver of error forward at every step, so every third or fourth mark stop and measure the whole distance back to the left edge instead of trusting the neighbour, and confirm the running total is the number of widths it ought to be. If the mark that should sit at eight widths sits at seven and a half, move it now. Marks are free to move. Rope that has been hitched to a mark that was wrong is not.",
        bottom:
          "The observer's job here is the running total. Give them the gauge and let them call out the distance back to the left edge while you place the marks, so a mark that has crept never gets defended by the person who made it. Nothing is worn by anybody; the marks are on the board and so is the rope.",
        check:
          "Two rows of ten marks, upper and lower, one gauge width apart, standing vertically above one another, with the first of each row one full width in from the left edge. All marks on the board rather than on rope, and at least every fourth one verified against a measurement back to that edge rather than against its neighbour.",
        speak: "Ten marks a line. Measure back to the edge, not to the last mark.",
        expected: {"wrapBands":2,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [],
      },
      {
        title: "4 · Lay the first pass, station by station",
        goal: "Run one continuous zigzag from station nought to station nine, turning alternately on the upper and lower frame lines, with every hitch made the same way round.",
        rigger:
          "Bring the working rope up from the lock at the left edge to the upper frame line at station nought. Make the hitch like this, and make every hitch in the panel like this: the leg arrives from inside the panel, so slide the bight beneath the frame line until it comes out on the far side of that line, outside the panel; bring it back over the top of the line into the panel again; then tuck it under its own incoming leg and draw it down. That is a half hitch, and it is the only thing stopping a station sliding along the frame line once there is tension anywhere in the panel. Described that way it reads identically on both lines, which is the point — under, over, tuck under your own leg, every single time. Now run diagonally down and to the right to station one on the lower line and hitch there exactly the same way round. Then diagonally up to station two on the upper line, down to station three, up to four, and on to station nine, which lands on the lower line. That is one continuous zigzag of nine legs with one hitch at every station. Two things matter more than speed. First, sameness: the rope must enter and leave every hitch on the same side, so say the sequence aloud for the first three or four until your hands stop having to think about it. Second, tension: draw each leg in only until the belly of slack disappears, never until it sings, because an overtightened leg drags its own hitch along the frame line and takes the neighbouring cell with it.",
        bottom:
          "Have the observer read the station numbers out to you as you work — nought, one, two — and say so at once if you have run past one. A missed station shows up as a single double-wide cell, and by the time the builder notices it there are four more cells sitting on top of the mistake. Nobody is inside the pattern and nobody is going into it.",
        check:
          "One continuous zigzag touching stations nought to nine in order, alternating lines, one hitch per station, none missed and none used twice. Every hitch made the same way round, so the rope leaves each of them on the same side. The legs are straight runs with no belly of slack hanging in them.",
        speak: "Every station in order. Same hitch, same way round.",
        expected: {"wrapBands":4,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"stem","x":0.16,"y1":0.3,"y2":0.62},{"kind":"stem","x":0.24,"y1":0.3,"y2":0.62},{"kind":"stem","x":0.32,"y1":0.3,"y2":0.62},{"kind":"stem","x":0.4,"y1":0.3,"y2":0.62},{"kind":"stem","x":0.48,"y1":0.3,"y2":0.62},{"kind":"stem","x":0.56,"y1":0.3,"y2":0.62},{"kind":"stem","x":0.64,"y1":0.3,"y2":0.62},{"kind":"stem","x":0.72,"y1":0.3,"y2":0.62},{"kind":"stem","x":0.8,"y1":0.3,"y2":0.62}],
      },
      {
        title: "5 · Lay the mirror pass and close the diamonds",
        goal: "Work back from the far end in the opposite phase, taking the mark each station has left over, so every interval gains one crossing and the cells close into diamonds.",
        rigger:
          "Your first pass finished with a hitch at station nine on the lower line. The mirror pass begins directly above it, at station nine on the upper line: carry the rope up, hitch it there the same way round as every other hitch, and then work back towards the left edge in the opposite phase. Down to station eight on the lower line, up to seven on the upper, down to six, up to five, and on to station nought, which lands on the lower line. Notice what that does to your marks. The first pass took the upper mark at even stations and the lower mark at odd ones; this pass takes whichever mark was left over. When you finish, every one of the twenty marks carries exactly one hitch and no mark carries two, and counting that is the fastest way to prove you held the phase all the way back. Each leg of this pass runs against a leg of the first pass and meets it once, halfway between the two frame lines, so nine intervals give nine crossings. Decide at the very first crossing whether the returning rope rides over the outgoing leg or is threaded under it, then do not change your mind: over is the easy default because the rope lands there on its own, while under has to be threaded deliberately at every meeting. A panel where the answer changes halfway along splits visibly into two halves under raking light even when every measurement is perfect, because the strands are presenting different faces to it. Finished, the panel reads as a row of diamonds — each one centred on a station, its top and bottom points at that station's two hitches, its left and right points at the crossings either side of it.",
        bottom:
          "Ask the observer to stand at one end of the board and sight along the row of crossings while you are still working, because from directly above every crossing looks correct and only a shallow angle shows the wave. They are handing you rope and calling faults, not standing in the pattern — nothing here goes on a person.",
        check:
          "Every mark carries one hitch and no mark carries two. The nine crossings sit on one imaginary line halfway between the frame lines, forming a straight row rather than a wave when sighted along from one end. The returning rope passes on the same side of the outgoing rope at every crossing without exception.",
        speak: "Mirror it back. Same side at every crossing, no exceptions.",
        expected: {"wrapBands":6,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"x","y":0.46},{"kind":"diamond","cy":0.46}],
      },
      {
        title: "6 · True the row and lock the working end",
        goal: "Take the drift out by sliding rope along the frame lines rather than pulling on it, finish the end so nothing creeps, then measure the eighth cell against the first.",
        rigger:
          "Stand at one end of the board and look along the panel at a shallow angle, almost edge on. Faults that are invisible from above are obvious from there: a crossing riding high, one diamond a shade wider than its neighbours, a frame line bowed in the middle. Fix each one by sliding rope along the frame line towards or away from the fault, using a flat palm or a blunt hook, and never by hauling on the working end. Tension applied at the end travels the whole run, so it moves the crossing you were fixing and every other crossing besides, and you trade one visible fault for nine small ones that are harder to see and much harder to undo. Work outwards from the middle of the panel, because from the middle slack has somewhere to go in both directions. When the row of crossings is straight and the diamonds match, finish the working end: tuck it under the nearest frame line and half hitch it back on itself twice, the same way round as every other hitch in the panel, then lay the tail flat along that frame line rather than leaving it loose across the face where it will catch and drag a station out of place. Last of all, gauge the first full cell and the eighth full cell directly against each other — width in gauge widths, and the height of their crossings above the lower line — and compare both against the three readings you wrote down at the start. That comparison is the whole drill. Everything before it was setting up an honest measurement.",
        bottom:
          "This is the moment to ask the observer for the honest version: which end of the panel is better, and by how much. They saw it for the first time when it was finished and you have been looking at it for an hour, which is why their answer is worth more than yours. Nobody was ever in the pattern, and the panel is finished as it stands.",
        check:
          "The first full cell and the eighth measure the same number of gauge widths, and their crossings sit at the same height above the lower frame line. Sighted along at a shallow angle the nine crossings form a straight row, the two frame lines still read parallel end to end, and the tail lies flat along a frame line rather than across the face.",
        speak: "Sight along it. Slide rope to fix it, never pull on it.",
        expected: {"wrapBands":6,"pose":"stand","view":"side","handsVisible":true,"neckClear":true},
        wraps: [],
      },
    ],
    mistakes: [
      { title: "Measuring each cell against the one before it", body: "Neighbour-to-neighbour measurement feels careful and is the main way this panel goes wrong. Each cell comes out a fraction wide, and because you only ever compared it with the one beside it, every fraction is invisible and every fraction is inherited by the next. By the eighth repeat the error is several millimetres and the crossings have walked off the midline in a steady slope. The tell is a panel that looks even everywhere you inspect it closely and wrong the moment you step back from it. Measure from the left edge of the board every time, and compare the last full cell with the first rather than with its neighbour." },
      { title: "Frame lines that were never parallel", body: "Every cell is built in the space between the two frame lines, so a gap of four gauge widths at one end and three and a half at the other puts an identical lean into all eight of them. The cells will still be evenly spaced across the panel and will still read as a proper repeat, which is exactly why this fault survives to the end: the spacing is right and the geometry is not. Catch it with three gauge readings, both ends and the middle, taken before a single diagonal goes on, and treat a mismatch as a reason to slide a line rather than as something to dress out later." },
      { title: "The mirror pass landing on marks the first pass already used", body: "If you start the return at the wrong end, or on the wrong line, the second pass turns on the same line at the same stations as the first. Two hitches pinch together on one mark while the mark opposite stays bare, the legs run parallel to the first pass instead of against it, and you get a row of narrow lens shapes and gaps rather than diamonds. Count hitches, not diamonds, to catch it: when both passes are done, every mark carries exactly one hitch and no mark carries two. A single mark with two hitches on it means the phase flipped, and it flipped at the station before." },
      { title: "Changing your mind at the crossings partway along", body: "Every hitch should be made the same way round, with the rope arriving and leaving on the same side, and at every crossing the returning rope should pass on the same side of the outgoing rope — over throughout or under throughout, decided at the first crossing and never revisited. Change either partway and the panel visibly splits into two halves under raking light, because the strands present different faces to it. Measurement will never find this, since all the numbers come out correct. You find it by sighting along the panel from one end, or by photographing it and turning the photograph upside down, which makes the inconsistency jump out." },
      { title: "Building it on a curve because a curve was what was to hand", body: "The reason this drill specifies a flat board is that a curved surface lies to you about spacing. On a curve the far side of each cell is foreshortened, so an unevenly spaced panel can look even and an evenly spaced one can look wrong, and you end up adjusting good work to improve a bad picture. Build this on a bolster or a rolled duvet and you have thrown away the only thing the drill offers, which is an honest measurement. Keep the surface flat, keep the gauge a rigid object, and save the curved prop for a pattern that is not about spacing." },
    ],
    variations: [
      { name: "Halve the gauge", body: "Cut a gauge half the width you used the first time and build the same panel with twice as many cells in the same span — twenty marks a line rather than ten. Everything that was forgiving stops being forgiving: a mark placed a hair off is now a hair of a much smaller unit, and the crossings crowd close enough that drift announces itself within half the distance. This is the version to come back to once the standard panel has stopped teaching you anything." },
      { name: "Change the prop, keep the numbers", body: "Build the identical panel — same gauge, same ten stations, same four-width panel height — on a different flat prop each session: a bread board, a clipboard, an offcut of ply, a firm flat cushion. The cushion in particular will show you how much of your spacing quietly depended on a surface that did not give under the rope. Write the readings down each time and compare the sets of numbers rather than the panels." },
      { name: "Build it blind to the marks", body: "Lay both frame lines and mark out all twenty stations as usual, then cover the marks with a strip of paper and build the whole panel by eye, hitching where you believe each station to be. Uncover the marks at the end and measure how far you drifted, in which direction, and whether the drift was steady or arrived all at once. Most people find they run short, and that the shortening starts at a particular station they can then watch for." },
      { name: "Two colours, and then weave it under", body: "Lay the first pass in one colour and the mirror pass in another. The crossings become instantly readable — one glance tells you whether the returning rope went over every time or whether you changed your mind partway — and any diamond that is not symmetrical splits into two halves you can compare directly. Once that is easy, run the mirror pass under the outgoing leg at every crossing instead of over, which has to be threaded deliberately nine times and punishes any slack you left behind." },
    ],
  },
  "shime-pattern": {
    goal: "Three look-alike bands on a rigid prop: one runs closed under a pull, one cannot move, one closes then stops — and how to tell which is which.",
    steps: [
      {
        title: "1 · Build the band that can run closed",
        goal: "Build the first band so one strand is free to slide through an eye, since a free-running strand is the only thing that lets a wrap lose circumference.",
        rigger:
          "Start with the tell-tale, because without it this study shows you nothing. Lay something soft along the prop where the band will sit: a rolled tea towel, a folded flannel, a short offcut of foam pipe lagging. Three or four millimetres of closure is invisible on rope and obvious on a squashed towel. Now tie a fixed eye in the rope about forty centimetres from one end. An overhand loop is enough. Make the eye big enough to pass the rope through without fighting it. Hold that eye flat against the prop under your left thumb. With your right hand take the working end around the prop and over the tell-tale three times, laying each turn beside the last rather than on top of it, walking the turns down the prop away from the eye. Leave them loose, loose enough to rock the whole group along the prop with the flat of your hand. Then bring the working end back up the outside of the turns to the eye, pass it through the eye from the far side, and let it hang. That passage through the eye is the whole of this band. There is no knot anywhere in the loop you have just made, and one strand is free to slide. Pull the hanging end and rope leaves the circumference by running through the eye, so the band gets smaller, and nothing inside the structure says stop.",
        bottom:
          "Nobody is in this pattern and nobody is going to be. The only things under the rope are a prop and a rolled towel. If someone is in the room, put them where they can see the tell-tale edge-on and ask them to say out loud when it changes thickness, because your hands will be on the rope and you will be the last person to notice.",
        check:
          "Trace the rope with a fingertip: tail, eye, three turns lying side by side down the prop, a return leg back up the outside, then the end passing through the eye. If the end is knotted to anything, or does not pass through the eye, this band has nowhere to run.",
        speak: "Three loose turns, then the end back through the eye.",
        expected: {"wrapBands":1,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"band","y":0.28,"w":0.55},{"kind":"stem","x":0.5,"y1":0.18,"y2":0.3}],
      },
      {
        title: "2 · Build the band that cannot run, below it",
        goal: "Build a second band that looks the same but has every strand dead-ended, so a pull has nowhere at all to travel.",
        rigger:
          "Use a separate rope for this one, not the far end of the first. The two bands have to be independent systems, because a pull on one can quietly feed the other through the run between them and you will not know which result you are reading. Set a second tell-tale about twenty centimetres below the first, far enough down that you can haul on one band without nudging the other. Leave a tail of about forty centimetres hanging, then take three turns around prop and tell-tale, side by side, walking down the prop, again slack enough to rock with your palm. Nothing passes underneath these turns at any point. Bring the working end back up the outside of the turns to meet the tail, and tie the two together on top of the wraps where you can see the knot. A square knot is the right shape here, but back it up with an overhand in each tail: a bare reef knot hauled on one tail alone can capsize and pay out rope, which would fake the exact result this band exists to rule out. Leave one tail forty centimetres long so this band hangs a loose end just like the first. Then say out loud what you have built, because saying it is what makes it stick: a closed loop of fixed length, both ends dead, nothing free to slide.",
        bottom:
          "Still an object, still nobody in the pattern. Ask whoever is watching to stand back a few paces and say which of the two bands will close when it is pulled. They will not be able to tell, and hearing somebody guess wrong out loud is a large part of what this drill is for.",
        check:
          "Both ends of this band finish outside its turns in one backed-up knot, and no strand passes beneath the wraps anywhere along them. From two paces back it should be hard to tell this band from the first.",
        speak: "Ends outside, knot backed up, nothing running underneath.",
        expected: {"wrapBands":2,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"band","y":0.46,"w":0.55},{"kind":"stem","x":0.5,"y1":0.38,"y2":0.5}],
      },
      {
        title: "3 · Build the band that closes to a stop",
        goal: "Build a third band with a cinch passing under its turns, left untied, so a pull has somewhere to go but only a fixed distance to travel.",
        rigger:
          "Third rope, third tell-tale, lowest of the three and well clear of the others. Take three turns around prop and tell-tale as before, side by side and deliberately loose, and this time leave the working end hanging long at the bottom with no knot in it at all. Now feed that end in between the wraps and the prop: in at one edge of the group of three, underneath all three at right angles to the way they run, and out at the far edge, so it lies flat along the prop beneath the turns. That passage is the thing the other two bands do not have. Notice the difference in your hands. In the first band the running strand slides through an eye on the outside; here the running strand slides underneath the wraps and drags on them the whole way. Draw the cinch through until it lies flat and no further, then stop and leave it slack. Do not tie it off yet, because you need something to pull in the next step. Pulling this strand does not withdraw rope from the circumference through a redirect. It gathers the three turns towards one another and sits them down onto the tell-tale, and once the turns are gathered tight against each other and hard on the prop, the cinch has nothing left to gather and stops.",
        bottom:
          "Nothing is inside any of these bands except a rolled towel. Whoever is watching has two jobs here: check from the side that all three groups of turns are still flat and separate rather than climbing over one another, and hand you the free end while both of your hands are busy feeding the cinch under the wraps.",
        check:
          "One strand, and only one, passes beneath this band's turns, entering at one edge and leaving at the other at right angles to them, and it ends free and unknotted. If you have already tied it off, there is nothing left to pull.",
        speak: "Cinch under the turns, across them, and leave it untied.",
        expected: {"wrapBands":3,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"band","y":0.64,"w":0.55},{"kind":"stem","x":0.5,"y1":0.66,"y2":0.78}],
      },
      {
        title: "4 · Mark the ends, then pull each band in turn",
        goal: "Load the three bands one at a time with the same slow one-handed pull and read which of them actually loses size.",
        rigger:
          "Mark first. A strip of masking tape or a dab of chalk on each band's free end, right where that end meets the structure: at the eye on the first, at the knot on the second, at the edge of the wraps on the third. If a mark travels, rope is going out of your hand and into that band. If a mark sits still, nothing is moving, whatever the rope feels like. Feel is exactly what this drill exists to correct. Now work top to bottom and pull each free end with one hand, slowly, about as hard as you would pull open a stuck drawer. Nothing hangs from any of this, nothing takes weight, nothing is fastened to anything else, and your own hand is the only force in the drill, so you can stop it dead at any moment. Expect three different answers. The first mark crawls towards you and goes on crawling for as long as you keep feeding it, and the towel under those turns flattens as it goes; it will stall eventually, but only because the turns have bottomed out on the prop and friction at the eye has caught up with your hand, not because anything in the band said stop. The second mark does not move at all. The third moves a short way, firms up, and then refuses. Say each answer out loud as you get it.",
        bottom:
          "The observer calls the tell-tales, not you. Edge-on from the side they can see a rolled towel losing thickness well before that shows from where you stand with rope in your fist. There is nothing and nobody inside any of these bands; the only thing being squeezed anywhere here is a folded towel.",
        check:
          "Three marks and three different distances travelled: one still creeping when you stop pulling, one that has not shifted at all, one that moved a little and jammed. If two of them behave alike, one band is not built the way you think it is.",
        speak: "Pull slowly, one band at a time. Watch the mark, not the rope.",
        expected: {"wrapBands":3,"pose":"stand","view":"side","handsVisible":true,"neckClear":true},
        wraps: [],
      },
      {
        title: "5 · Lock the cinch, slacken, and try to give the size back",
        goal: "Finish the third band where the pull left it, then find out that a band which has run closed does not reopen when you let go, and record what each one did.",
        rigger:
          "Lock the third band first, while it is still sitting where the pull left it. Take the cinch end back over the outside of the turns and tie two half hitches around the standing part of the cinch where it enters the wraps, so the hitches sit on the outside and the cinch cannot slide back out. Now let go of all three ends and take your hands off the prop. Slack is the only thing in the system. Try to give the size back without unbuilding anything. Push the first band's turns open with your thumbs and try to feed rope back through the eye the way it came in. It will not go. The rope that left that circumference is pinned by the turns bearing on the prop and by the nip where it passes through the eye, and it returns only if you deliberately reverse it, working slack round turn by turn back towards the eye, which is a different job from letting go and is the one worth practising. The second band is precisely where it was, because nothing in it ever moved. The third holds where the cinch stopped. Then dress all three: turns flat and parallel, tails laid where you can find them without hunting, marks left on. Write one line for each band saying what it did.",
        bottom:
          "Nobody is in the pattern and nothing here is on a clock, so the one-way band costs nothing but a few minutes of patient rope work to reverse. Whoever is watching can write the three lines down while your hands are still on the rope, since you will not remember which band did what by tomorrow.",
        check:
          "Band one has not gone back to the circumference it started at and will not be pushed back by thumb pressure; band two's tell-tale is as plump as when you laid it; band three sits where the cinch stopped. From the front all three still look much alike.",
        speak: "Letting go does not reopen a band. Reversing it does.",
        expected: {"wrapBands":3,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [],
      },
    ],
    mistakes: [
      { title: "You dressed the turns tight before you pulled anything", body: "A band can only show you the closure it has room to perform. Snug those three turns down onto the tell-tale as you lay them and the rope has already left the circumference, so your pull produces a firm band that barely changes, which looks exactly like the knotted band that cannot change at all. The study then teaches you the opposite of the truth. The symptom shows before you pull anything: the towel under the turns is already flattened. Lay every band loose enough to rock along the prop with your palm, and take the slack out only with the pull you are there to watch." },
      { title: "The first band's end was not actually free to run", body: "Everything about band one depends on one strand being able to slide through the eye. If you knotted the end after passing it through, or the eye is a knot that grips the strand rather than a loop it can move in, or the return leg has hooked itself under a turn on its way back up, nothing can run and the band behaves like the dead-ended one. You then pull all three, get two identical results, and conclude that nothing constricts. Test it before you mark anything: take the hanging end and slide it a centimetre by hand. If it will not move by hand, it will not move under a pull." },
      { title: "The prop squashed and stole the result", body: "A rolled duvet, a cushion, a bolster with nothing rigid inside will give up shape long before the rope does, and then every band appears to close, including the one that has no mechanism for closing. The study confirms whatever you expected and teaches nothing. Work on something that will not deform: a length of pipe, a thick dowel, a solid chair-back upright, a full bottle. Keep the soft material to the tell-tales alone. The tell is that the prop itself narrows under the turns, and that the dead-ended band seems to tighten when there is nothing in it that can." },
      { title: "You judged it by how tight it looked", body: "Tightness and closure are different properties and the eye cannot separate them. A band dressed firm and going nowhere looks like a band halfway through running down, and both look like one that has already finished running. That is exactly why the marks matter: a strip of tape where the free end meets the structure turns an impression into a measurement, because either rope is leaving your hand and going into the band and the mark travels, or it is not and the mark sits still. Read the mark and read the tell-tale. Do not read the general appearance of the rope." },
      { title: "You hauled on the first band to find where it ends", body: "That band one has no stop of its own is the finding, not an invitation to go hunting for one. Pulling it hand over hand until it jams costs you two things worth keeping: the turns set so hard on the prop that the run cannot be reversed and the rope has to be worked free or cut, and a permanent set left in the fibres where the strands bear on each other at the eye. Pull until the mark has clearly travelled and the towel has clearly lost thickness, then stop. You already have the answer, and going further only spends rope and the chance to reverse the band by hand." },
    ],
    variations: [
      { name: "The same three bands on a much fatter prop", body: "Build the set on a broom handle, then build it again on something considerably fatter: a two-litre bottle, a fire extinguisher standing on the floor, a thick chair-back upright. Compare how far the first band's mark travels under the same slow pull. Travel scales with circumference, so on a thin dowel the running band bottoms out almost at once while on a fat prop it keeps going and going. Same structure, very different amount of travel available, and the difference is the prop rather than the rope path." },
      { name: "Three different ropes, the same three structures", body: "Run the study with a stiff dry natural-fibre rope and then again with something softer and slicker. Band one changes character noticeably, because friction inside the turns and at the eye is what stops rope moving: a slick rope runs further and faster for the same pull, while a hairy stiff one hangs up early and can feel as though it hardly constricts. The structure decides what a band is capable of doing. The rope decides how readily it does it." },
      { name: "Blind identification", body: "Have whoever is with you build one of the three bands on the prop while you look the other way, dressed to the same slackness with the free end left the same length. Come back and name which one it is. You may look for as long as you like, and then you get one slow pull. Most people are wrong from looking and right from pulling, and the size of that gap is the whole point of the exercise." },
      { name: "All three bands from one continuous rope", body: "Build the set from a single length instead of three separate ropes, running the working end down from one band to the next. It is a much harder rope-management problem: you have to plan where each band's pulling end emerges, keep the runs between bands from being mistaken for structure, and stay able to trace any strand back to the band it belongs to. You will also find a pull on one band quietly feeding the next, which is its own lesson about where tension actually goes." },
    ],
  },
  "tasuki": {
    goal: "Two level bands and four diagonal runs that cross in a flat X on the front and a matching X on the back: a drill in symmetry and holding a crossing point.",
    steps: [
      {
        title: "1 · Lay the lower band and mark all four targets",
        goal: "Put down the level band that every diagonal starts or finishes on, and mark the two crossing targets and the upper band height before any rope exists to argue with them.",
        rigger:
          "Find the middle of the rope and fold it, so you are handling a doubled pair with a bight at one end. Stand at the front of the form and hold the bight against it about two thirds of the way down, at the left side. Left means the left as you see it from the front, and that is what left means for the rest of this drill, even after you have walked round behind and it has swapped over in front of your eyes. Take the pair one full turn around the form, keeping the turn parallel to the floor the whole way and keeping the two strands side by side and flat rather than rolled over one another. Bring the pair back round to the bight, pass it through, and fold it back over the turn it has just made, so friction holds the band and no knot sits in the line. That fold is your lock and it stays at the left side. Now mark, while there is still nothing to argue with. Put a short piece of masking tape at the centre of the front face and another at the centre of the back face, both at the height you want the crossings to sit, which is midway between this band and the upper one. Put a third and fourth piece at the left and right sides at the height the upper band will run. The two side flags give the first diagonal something to arrive at instead of a guess, and the two centre marks are the only way you will ever catch a crossing moving, which is the entire exercise.",
        bottom:
          "An observer earns their place standing a couple of paces back and saying whether the band is truly level, because from close in a band that drops a centimetre round the far side looks perfectly straight. They can also read the four marks back to you. Nobody is in the pattern. The form is the whole subject of this drill and it stays that way.",
        check:
          "One doubled turn round the lower third, both strands flat and side by side, running level all the way round when you step back two paces. The lock sitting at the left side. Four pieces of tape in place: front centre, back centre, and one at each side at the upper band height.",
        speak: "Band level, lock on the left. Mark both crossings before any rope crosses.",
        expected: {"wrapBands":1,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"band","y":0.68,"w":0.7}],
      },
      {
        title: "2 · Run the first diagonal up across the front",
        goal: "Lay the front rising run from the lower band at the left to the upper band height at the right, slack, straight, and passing over the front mark.",
        rigger:
          "From the lock at the left side, take the pair up across the front face on one steady slant, aiming so the centre of the pair passes over the front tape mark — over it, not beside it — and finishing at the right side of the form at the upper flag. Stop there. This run belongs to the front face only. Do not carry it on round the back, because the back gets its own two runs later and they cannot cross anything if this one has already taken the corner they need. You are not choosing the angle freehand. The two ends fix it: the lock at the left and the flag at the right. Aim at the flag and the slant looks after itself, which is also why a band gap you never actually decided on gives you an angle you cannot repeat on the other three runs. Run a flat hand along the pair as you lay it, thumb on top, so the two strands stay flat and in the same order end to end; a twist hides beautifully in a long unsupported run and only shows up later as a lump at the crossing. Leave the run visibly slack, slack enough to lift a hand's width away from the form. A slack run can still be walked onto the mark with a thumb. A run laid tight has already chosen its own line, and it will not be the line you drew.",
        bottom:
          "The useful job here is watching the right side of the form: ask the observer to stand there and say whether the pair arrives at the flag flat or rolled over itself, because you are looking straight down the length of it and cannot see. They are describing an object. Nobody is in the pattern and nobody stands in for the form.",
        check:
          "One straight run across the front face only, from the lower band at the left up to the flag at the right, its centre passing over the front mark rather than to one side of it. Both strands flat and in the same order end to end. Slack enough to lift away from the form. Nothing of this run round the back yet.",
        speak: "Front face only. Left low to right high, over the mark, laid slack.",
        expected: {"wrapBands":2,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"stem","x":0.38,"y1":0.34,"y2":0.68}],
      },
      {
        title: "3 · Take the upper band and fold the diagonal into it",
        goal: "Give the first run a top terminal that pinches it instead of letting it slide along the band, and get the second rail level and parallel to the first.",
        rigger:
          "The pair is at the right side at the height of the flags. Take one full level turn from there — round the back, past the left flag, across the front, and home to the right — sitting parallel to the lower band and passing over both side flags on the way. Sight it from the side before you go any further, because a band laid by feel almost always dips round the back where your hands are least honest, and the gap between the two bands is what sets the slant of every run you have left to lay. As the turn closes back onto the top of the arriving diagonal, do not cross it and hope. Bring the pair under the diagonal's top and fold it back over itself, so the top of the diagonal is pinched between the band and its own standing part. A diagonal under tension pulls sideways along the band as well as along its own length, and an unpinched top slides along that band towards its partner until the crossing has walked off the mark. Test the joint with your hands rather than your eyes: pull gently on the working pair and a folded joint stays where it is and loads the band evenly, while an unfolded one gives a small slip you feel in the palm a moment before anything shows.",
        bottom:
          "Ask the observer to sight the form from the side and call whether the two bands are parallel and whether the gap is the same at the front edge as at the back, because that comparison is close to impossible from where you are standing. They are describing a prop. Nobody is inside this pattern at any point of the drill.",
        check:
          "Sighted from the side, two bands running parallel, with the same gap between them at the front edge as at the back edge and at both side flags. At the right side the top of the diagonal is folded into the band, and the band has not been dragged down into a shallow V at that point.",
        speak: "Upper band parallel. Fold the diagonal into it, not across it.",
        expected: {"wrapBands":3,"pose":"stand","view":"side","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"band","y":0.34,"w":0.66}],
      },
      {
        title: "4 · Build the crossing on the back",
        goal: "Lay both back runs so they cross over the back mark, using the lower band as the road that carries the pair from one bottom corner to the other.",
        rigger:
          "Leave the upper band at the right side and run the pair round the back on a steady fall, over the back tape mark, down to the lower band at the left side, and lock it there with the same fold you used at the top: under the band, then back over itself. You are now at the corner you began from, and the pattern still needs its other two corners. So carry the pair along the lower band, round the back, laid snug against the band so it reads as a doubled band rather than as a new line, until you are at the right side. From there run up across the back on the mirrored slant to the upper band at the left, passing over the back mark and crossing the falling run you laid a moment ago. At that crossing lay the falling pair over the rising pair, and say it out loud, because the front crossing has to match it and you will not remember by then. Fold this top into the upper band at the left. One warning that costs people this whole drill: standing behind the form, left and right swap over in front of your eyes, and a back run leaned by hand instead of by name comes out parallel to its partner rather than crossing it. Keep naming corners by the form's front.",
        bottom:
          "Standing behind the form, an observer with a phone is worth more than an observer with an opinion: a square-on photograph of the back face, taken before anything is tensioned, records the two slants better than memory does. They can also call it out when the carried section starts to lift away from the lower band. The form is unoccupied and nothing in this step changes that.",
        check:
          "Walk round to the back. Two runs of matching slant crossing over the back mark rather than beside it, four strands flat where they meet, the falling pair lying over the rising pair. The carried section lying along the lower band, not cutting across below it. Both back runs still slack.",
        speak: "Down the back, along the band, up the back. Cross on the mark.",
        expected: {"wrapBands":5,"pose":"stand","view":"side","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"stem","x":0.6,"y1":0.34,"y2":0.68},{"kind":"stem","x":0.4,"y1":0.34,"y2":0.68},{"kind":"x","y":0.5}],
      },
      {
        title: "5 · Close the crossing on the front",
        goal: "Close the front crossing with the last run, matching the slant and the over-and-under of everything already laid.",
        rigger:
          "Back round to the front. From the fold at the left side of the upper band, run the pair down across the front face on the mirror of the first diagonal's slant, aiming so that it crosses that first run directly over the front tape mark rather than above it, below it or beside it. Make the same over-and-under choice you named out loud on the back: falling pair on top, both faces. Consistent over-and-under is what makes the two faces read as one pattern instead of two separate attempts, and it is also what makes the two crossings hold with the same friction, so they creep together or not at all. Land at the lower band on the right side, the corner the carried section arrived at, and fold it in the same way as the others. Every corner now carries two diagonal ends folded into a band: four runs in total, two on each face, and a crossing sitting on tape front and back. Do not take any slack out. The whole thing is still loose and still movable, which is exactly the state you want going into the last step.",
        bottom:
          "Ask for one comparison before any slack comes out: the observer stands square to the front, then square to the back, and says whether the two crossings sit at the same height and lean by the same amount. That is the last cheap moment to fix a slant. Nobody is in the pattern, and the drill never puts anyone there.",
        check:
          "Four runs, two on each face, each face crossing once and each crossing sitting over its own tape mark. On the front, the falling pair lies over the rising pair, matching the back. Each of the four corners carries two diagonal ends folded into a band. Everything still visibly slack.",
        speak: "Front falling run. Mirror the slant, same pair on top as the back.",
        expected: {"wrapBands":6,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [{"kind":"stem","x":0.62,"y1":0.34,"y2":0.68},{"kind":"x","y":0.5}],
      },
      {
        title: "6 · Take the slack out in bites and dress both crossings",
        goal: "Bring all four runs to matching tension without letting either crossing leave its mark, then dress both X's flat.",
        rigger:
          "Take the slack out in small alternating bites and never in one long pull. A little from the front rising run, a little from the front falling run, then round to the back and the same there, then round again, working the slack outwards towards the folded corners rather than dragging it all through one line. Tension one run fully and then try to bring the others up to match, and the first one wins and takes the crossing with it, and you end up two centimetres left of the mark wondering which run did it. Watch the tape, not the rope in your hands. If a crossing starts to walk, stop, ease both runs on that face, push the crossing back onto the mark with a thumb, and take the slack more evenly than you did the first time. Dress the crossings last, one face at a time: lay all four strands flat where they meet, each pair side by side rather than stacked on its twin, nothing riding up over the join in a lump. Then run the tail along the lower band and tuck it under so it neither hangs nor pulls a corner out of line.",
        bottom:
          "Give the observer one job while you tension: stand where they can see one tape mark and say the moment the crossing leaves it, because you will be looking at your hands. They change faces when you do. There is nobody in this pattern, and the pace of the drill is set by the rope and nothing else.",
        check:
          "Both crossings sitting on their marks, within their own width. Both bands still level and, sighted from the side, still parallel. On each face, the four legs of the X matching their opposite number in length. No strand stacked on its twin at either crossing, and the tail lying along the lower band rather than hanging.",
        speak: "Small alternating bites. Watch the marks, not your hands.",
        expected: {"wrapBands":6,"pose":"stand","view":"front","handsVisible":true,"neckClear":true},
        wraps: [],
      },
    ],
    mistakes: [
      { title: "One run tensioned first, and the crossing walks", body: "A run under tension is trying to become the shortest line between its two folded corners, and part of that pull runs sideways along the bands. Take the slack out of one diagonal completely before the others and it drags the crossing with it, almost always downwards and towards the side you pulled from. You catch it two ways: the tape mark reappears beside the crossing instead of underneath it, and the two upper legs of the X finish visibly longer than the two lower legs." },
      { title: "The two faces disagree about which pair is on top", body: "The front crosses once and the back crosses once, and it is easy to let the second crossing fall however the rope happens to land. Two faces that do not match are not only untidy: the crossings then hold with different amounts of friction, so one keeps its mark while the other creeps under tension and you spend your time correcting the face that was never the problem. Name the choice aloud at the first crossing, repeat the same words at the second, and walk round and compare both faces before any slack comes out." },
      { title: "Left and right swap when you step behind the form", body: "The back runs have to lean the opposite way from their front partners, and the reliable way to get that wrong is to lay them by your own hands while standing behind. What you get is a back face with two runs leaning the same way, which is no crossing at all, or a crossing crammed into one corner instead of sitting over the mark. Name every corner by the form's front, and check by walking round and looking rather than by reasoning it out, because reasoning it out while standing behind is exactly what fails." },
      { title: "The carried section sags and becomes a fifth line", body: "The pair that travels along the lower band from one bottom corner to the other is meant to sit snug against the band and read as a doubled band. Pull on it and it lifts away, cutting the corner as a straight chord across the back and stealing slack that belonged to the back runs. Sight the lower band from behind at its own height: you want one line of rope, doubled, following the form all the way round. A second line drifting below it, or a chord cutting across the back, is the fault." },
      { title: "A band that dips at the back sets two different slants", body: "The slant of each run is fixed by the gap between the bands at the corners it connects, so a band that is level across the front and drops a centimetre round the back gives you steeper diagonals on one face than the other. The two crossings then sit at different heights and no amount of careful even tensioning will bring them together. Measure the gap at four points — front, back and both sides — before you lay the second diagonal, not after you have four runs on and nothing to blame." },
    ],
    variations: [
      { name: "Change the band gap, then change it again", body: "Run the whole drill with the bands about twenty centimetres apart, then again with them as far apart as the form allows. Short shallow runs barely move when you take the slack out. Long steep ones pull hard along the bands and walk off the mark at the smallest unevenness in how you did it. Same pattern, completely different handling." },
      { name: "A round prop with no front and no corners", body: "Work the same two bands and four runs on a smooth cylinder: a wide cardboard tube, a large bottle, a length of pipe standing on the floor. There is no seam and no front, so you have to invent the four corners yourself. Quarter the prop with tape before you start, then hold every slant honest against marks you made rather than against a shape that helps you." },
      { name: "One colour per direction", body: "Change colour at every direction change — at the upper-right fold, at the lower-left lock, and at the upper-left fold — so both rising runs come out one colour and both falling runs the other. Over-and-under at both crossings becomes unmissable, a twisted pair shows up as a barber-pole from across the room, and a photograph of each face makes a mismatched slant obvious to anyone you show it to." },
      { name: "Build it starting from the other side", body: "Run the drill mirrored: lock the lower band at the right, take the first diagonal up to the left, and reverse every direction after that. Most people lay one lean cleanly and fudge the other, and the fudged one only shows when it is carrying the pattern. Building it the other way round is how you find out which of yours is which." },
    ],
  },
};

/**
 * The authored content for a drill, or nothing.
 *
 * Returns an empty object rather than throwing so that a newly added drill
 * still renders — the factory's placeholder step is honest about being a
 * placeholder, and the catalog test names the slug that is missing.
 */
export function propDrill(slug: string): Partial<PropDrillContent> {
  return PROP_DRILLS[slug] ?? {};
}

/** Every slug this table has content for. Used by the catalog tests. */
export const AUTHORED_DRILL_SLUGS = Object.keys(PROP_DRILLS).sort();
