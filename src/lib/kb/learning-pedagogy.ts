import type { Article } from "./types";
import { TEACHING_TECHNIQUES_ARTICLE } from "./teaching-techniques-article";

/**
 * Learning science and accessibility articles focused on how to learn knot tying
 * effectively, especially for people with learning disabilities, processing differences,
 * or who struggle with fast-paced visual instruction.
 */
export const LEARNING_PEDAGOGY_ARTICLES: Article[] = [
  TEACHING_TECHNIQUES_ARTICLE,
  {
    slug: "learning-modalities",
    title: "Words, Pictures, and Hands Together",
    section: "craft",
    minutes: 7,
    summary:
      "Using words, pictures, and your hands together beats any one of them alone — for everyone. That is not the same as being an 'auditory learner', and the difference matters.",
    related: ["rope-basics", "knot-foundations", "learning-pacing"],
    blocks: [
      { type: "h", text: "First, a myth worth clearing out of the way" },
      {
        type: "p",
        text: "You have probably been told there are visual learners, auditory learners, and hands-on learners, and that you should find your type and stick to it. It is one of the most repeated ideas in education. It has also been tested properly, and it did not hold up. A commissioned review of the evidence found that studies with the right design flatly contradicted it: matching teaching to someone's stated preference did not improve their learning.",
      },
      {
        type: "p",
        text: "We are saying this out loud because the myth does real damage to people who have struggled. It tells you the problem is a mismatch between your type and the lesson, so you go looking for your type instead of for a better lesson. And it quietly writes off whole channels — 'I am not a visual learner, so diagrams are not for me' — when the evidence says you need all of them.",
      },
      { type: "h", text: "What actually holds up" },
      {
        type: "p",
        text: "Words and pictures together beat words alone. That is one of the best-supported findings in instructional research, and it is true of people in general, not of one type of person. So this app narrates and shows and puts rope in your hands at the same time — not because we guessed your type, but because the combination works.",
      },
      {
        type: "ul",
        items: [
          "Hearing the step while you watch it keeps your eyes free for the rope instead of splitting them between rope and paragraph.",
          "Watching a hand actually make the movement is the strongest single format for a knot — see the next section.",
          "Doing it yourself is not optional. Nobody has ever learned a knot by watching one.",
        ],
      },
      { type: "h", text: "For a knot specifically, watching hands move wins" },
      {
        type: "p",
        text: "Here is the finding that matters most for you, and it is a genuinely surprising one. For most subjects, a moving demonstration is harder to learn from than a still picture, because the information disappears before you have finished processing it. Hand-manipulation tasks are the documented exception — and knot tying is one of the actual tasks this was tested on. Watching a demonstrator's hands beat static graphics.",
      },
      {
        type: "p",
        text: "The proposed reason is that watching another person move and copying them is something humans do without effort. It costs your working memory very little, so a moving demonstration of hands is cheap to watch in a way that a moving diagram of, say, a circulatory system is not.",
      },
      {
        type: "callout",
        title: "So your instinct about video was half right",
        text: "Watching someone tie is the right format. What went wrong in those tutorials was not that they were video — it was that they were fast, continuous, and driven by someone else's clock. Same content, cut into short pieces you start and stop, is a different thing entirely. That is what the pacing article is about.",
      },
      { type: "h", text: "What this means for how you use the app" },
      {
        type: "ul",
        items: [
          "Use all of it at once: auto-read on, diagram open, rope in your hands. Not one instead of another.",
          "Do not skip the diagrams because you 'are not visual'. Do not skip the audio because you 'read fine'. Both channels are carrying different parts of the same step.",
          "Where a step has a demonstration of hands moving, watch it — and watch it more than once, in short pieces.",
          "If a channel is genuinely unusable for you — a screen reader user, a noisy room, a diagram you cannot resolve — dropping it is an accommodation, and a legitimate one. That is different from picking a type.",
        ],
      },
    ],
  },
  {
    slug: "rope-basics",
    title: "What Rope Is and How to Hold It",
    section: "craft",
    minutes: 8,
    summary:
      "Before a knot, there is rope. Learn what rope is, how to identify the working end, and how your hands should feel.",
    related: ["rope-materials", "reading-the-rope", "getting-rope-off", "knot-foundations"],
    blocks: [
      { type: "h", text: "Rope is a tool, not magic" },
      {
        type: "p",
        text: "A rope is twisted or braided strands of fibre. It has two ends and a middle. Nothing about rope makes it hold by itself — it holds because of how you wrap it, where you tie it, and the physics of knots. When you understand that, the knots become clear.",
      },
      {
        type: "h",
        text: "Parts of a rope",
      },
      {
        type: "ul",
        items: [
          "Working end: the end you are actively wrapping (the end you're holding in your hand)",
          "Standing part: the rest of the rope, not moving right now",
          "Bight: a loop in the rope (like folding the rope back on itself without tying anything)",
          "Wraps: loops of rope around a post or another rope",
        ],
      },
      {
        type: "h",
        text: "How rope feels in your hands",
      },
      {
        type: "ul",
        items: [
          "Rope has texture — not smooth like string, but not rough like sandpaper. The texture is what gives grip.",
          "Rope has weight. You notice that weight when you wrap it. That weight is what keeps wraps in place.",
          "When you pull rope, it moves smoothly in some directions and holds in others. That is friction, and it is the whole point.",
          "Rope can compress (get tighter) or spread (relax). You will feel the difference as you work.",
        ],
      },
      {
        type: "callout",
        title: "Do not race",
        text: "Hold rope for a minute before you tie anything. Let your hands know what it feels like. Feel the weight. Let it move through your fingers. This is not wasted time — this is learning time.",
      },
      {
        type: "h",
        text: "The working end is your focus",
      },
      {
        type: "ul",
        items: [
          "Always know which end you are working with. Watch that end. Keep it visible.",
          "The working end does the wrapping, the looping, the tying.",
          "Once you know where the working end is, the rest of the step usually makes sense.",
        ],
      },
      {
        type: "p",
        text: "Use knot lessons on a smooth, empty prop, never on a person. Keep the prop stable and the rope unloaded. Prop practice teaches rope handling, not how to judge pressure or nerve risk on a body. Before any body tie, read its full lesson, agree specific limits and rehearse release. Seek qualified hands-on instruction; a checklist or camera cannot clear a tie.",
      },
    ],
  },
  {
    slug: "learning-pacing",
    title: "Why Fast Rope Videos Fail",
    section: "craft",
    minutes: 6,
    summary:
      "There is a specific, well-documented reason a fast continuous tutorial teaches badly — and it names your exact situation. It is a fact about the video, not about you.",
    related: ["learning-modalities", "rope-basics", "evidence-based-teaching"],
    blocks: [
      { type: "h", text: "The finding, and the three conditions it names" },
      {
        type: "p",
        text: "People learn better from a demonstration broken into short segments they start and stop themselves than from the same demonstration run straight through. That is the segmenting principle, and it is standard instructional research. What makes it worth your time is the fine print: the effect is strongest when the material is complex, when the presentation is fast, and when the learner is new to the subject.",
      },
      {
        type: "p",
        text: "Read that list again. Complex material, fast presentation, inexperienced learner. That is a person who has never tied a knot watching a rope tutorial at full speed. The research is not describing an unusual learner who needs special help. It is describing the predictable result of that format, for people in general.",
      },
      { type: "h", text: "What that means about the last ten years" },
      {
        type: "p",
        text: "If fast rope videos have never worked for you, the honest reading is not that you have a deficit that video exposes. It is that continuous, uncontrolled, expert-speed demonstration is a poor teaching format for a complex manual skill, and it is the format almost all free rope instruction happens to come in. You were not failing a good lesson. You were meeting a badly paced one, repeatedly, and concluding something about yourself.",
      },
      {
        type: "p",
        text: "The same is worth considering about the wrestling room and the BJJ mat. A coach demonstrating a sequence twice at speed to a roomful of people is the same format with the same weakness. Some people reconstruct the missing pieces fast enough to keep up. That is a real difference between people, and it is not the same thing as a difference in what you can end up able to do.",
      },
      { type: "h", text: "The fix is control, not slowness for its own sake" },
      {
        type: "p",
        text: "Note what the principle actually says: user-paced segments. Not slow-motion, not simplified, not less content. The active ingredient is that you decide when the next piece starts, so a piece you have not finished processing cannot be replaced by the next one.",
      },
      {
        type: "ul",
        items: [
          "One step at a time — one action and one check per step, so a segment is small enough to finish.",
          "You press Next. Nothing advances on a timer, and there is no clock anywhere in a lesson.",
          "Confirming the check before Next unlocks is the segment boundary doing its job: it stops you sliding into step four while step three is unfinished.",
          "Replay is unlimited and free. Re-watching a five-second movement eight times is normal use, not remedial use.",
          "Where a demonstration of moving hands exists, watch it in short pieces — the moving version is the better format for a knot, once you control when it plays.",
        ],
      },
      {
        type: "callout",
        title: "One caution, so this stays honest",
        text: "Going slowly is not itself the thing that works — plenty of slow practice teaches nothing. What works is that each segment finishes before the next begins, and that you actually retrieve and check rather than watch. A slow lesson you passively absorb is still a lesson you will not have next week.",
      },
    ],
  },
  {
    slug: "spaced-learning",
    title: "Space Your Practice Over Time",
    section: "craft",
    minutes: 5,
    summary:
      "Tying the same knot across several days beats tying it twenty times tonight. Of everything in these articles, this is the finding with the strongest support.",
    related: ["learning-pacing", "rope-basics", "evidence-based-teaching"],
    blocks: [
      { type: "h", text: "The best-supported thing you can change" },
      {
        type: "p",
        text: "When reviewers rated common study techniques by how well the evidence supports them, two came out top: testing yourself, and spreading practice over time instead of massing it into one session. Spacing is not a nice extra. It is close to the highest-value change available to you, and it costs nothing but a calendar.",
      },
      {
        type: "p",
        text: "The uncomfortable part is that spacing feels worse while you do it. Coming back after two days, the knot is harder than it was at the end of last session, and that reads as going backwards. It is not. The version that felt fluent at the end of a long session was fluent because you had just done it nine times, and most of that fades. The version you can retrieve cold on Thursday is the one you actually have.",
      },
      {
        type: "p",
        text: "So expect the second session to feel like a step back, and do not respond by cramming. That feeling is what spacing costs, and the durability is what it buys.",
      },
      {
        type: "h",
        text: "How to space your knot practice",
      },
      {
        type: "ul",
        items: [
          "Session 1: Learn a new knot step by step. Tie it once or twice. Confirm each step.",
          "Session 2 (next day or next practice): Start fresh. Tie it again. You will feel how much more automatic it is.",
          "Session 3+ (over the next week): Tie it in different ways. Tie it fast, tie it slow. Tie it on different posts.",
          "Within a week: your hands know it well enough that you can teach it or use it in a tie.",
        ],
      },
      {
        type: "callout",
        title: "The journal is your tool",
        text: "Write down when you learned each knot. Come back to it in a day or a week. See how much easier it is the second time. That is your brain consolidating, and it is exactly what should happen.",
      },
    ],
  },
  {
    slug: "learning-disabilities-rope",
    title: "Learning Disabilities and Rope Tying",
    section: "craft",
    minutes: 7,
    summary:
      "Accommodations that remove a specific barrier — reading load, sustained attention, sensory input. Not personality types, and not a different curriculum.",
    related: ["learning-modalities", "learning-pacing", "spaced-learning", "evidence-based-teaching"],
    blocks: [
      { type: "h", text: "An accommodation is not a learning style" },
      {
        type: "p",
        text: "These two get confused constantly, and the difference decides whether the advice is any good. A learning style claims you have a preferred channel and learn better when teaching matches it — that failed testing. An accommodation removes a specific barrier between you and material you are perfectly able to learn. Text-to-speech for a reading disability is not style-matching; it is routing around a decoding problem so you can spend your attention on the knot instead of on the sentence.",
      },
      {
        type: "p",
        text: "So nothing below is a different curriculum. It is the same six knots, with a barrier taken out of the way.",
      },
      { type: "h", text: "What rope asks of you, and what it does not" },
      {
        type: "p",
        text: "Worth naming plainly, because a lot of people arrive expecting to struggle: tying a knot does not require reading speed, spelling, arithmetic, or holding a lecture in your head. It requires noticing where a rope goes, doing that with your hands, and repeating it. Several of the demands that make school hard are simply absent here.",
      },
      {
        type: "p",
        text: "One honest caution against the flattering version of this: neurodivergent people are often told they will have a natural gift for spatial or pattern-based skills. Sometimes true, not reliably. Treat it as a subject where the usual obstacles are missing, which is a real advantage, rather than as one you are owed a talent for.",
      },
      { type: "h", text: "If sustained attention is the barrier" },
      {
        type: "ul",
        items: [
          "Short sessions are not a compromise here — five to ten minutes, several days a week, is the arrangement the spacing evidence already recommends. Your constraint and the best practice schedule agree.",
          "Stop mid-knot if attention goes. A knot abandoned at step three costs nothing; there is no partner in rope and nothing to unwind.",
          "Body doubling — someone else in the room doing their own thing — is widely reported to help. It is practitioner experience, not something these studies measured.",
          "Deliberate hyperfocus sessions are fine. Just do not let one three-hour night replace practising on Thursday: massed practice is the thing spacing beats.",
        ],
      },
      { type: "h", text: "If reading is the barrier" },
      {
        type: "ul",
        items: [
          "Turn auto-read on and leave it on. The point is not that hearing suits you better; it is that decoding text costs you effort that should be going to the rope.",
          "Where a demonstration of moving hands exists, it carries the step with no text at all — and for knots specifically that format tested better than static graphics anyway.",
          "You never need to reproduce any wording. Nothing in a lesson asks you to recall a sentence.",
          "The safety pages are the exception worth slowing down for. Have those read aloud too rather than skimmed.",
        ],
      },
      { type: "h", text: "If sensory load or unpredictability is the barrier" },
      {
        type: "ul",
        items: [
          "Every lesson has the same shape — do, check, say — so the structure itself is never the surprise.",
          "Voice, contrast and theme are adjustable in settings. Silence the voice entirely if it is noise rather than signal.",
          "Rope texture is a real sensory variable. If a fibre is unpleasant in your hands, change fibre; there is no virtue in enduring jute.",
          "Practising alone on a chair leg is a complete way to learn every knot here. Group classes are not a prerequisite.",
        ],
      },
      { type: "h", text: "If sequencing or counting is the barrier" },
      {
        type: "ul",
        items: [
          "Nothing here requires arithmetic. 'Two wraps' is wrap-and-wrap, felt rather than counted.",
          "Say each step aloud as you do it. Externalising the sequence is a well-worn workaround for holding one in your head.",
          "Left and right rarely matter as such — what matters is same-direction-as-last-time, which you can check by looking at the rope you just laid.",
        ],
      },
      {
        type: "callout",
        title: "The part that is actually true",
        text: "You are not being taught a lesser version of this. The evidence-backed advice — retrieve rather than review, spread practice across days, watch hands move in short controlled pieces — is the same advice regardless of diagnosis. What changes is which barrier you remove first.",
      },
    ],
  },
  {
    slug: "knot-foundations",
    title: "The Six Foundation Knots and Why They Matter",
    section: "craft",
    minutes: 8,
    summary:
      "Six knots that teach the core mechanics behind most of the catalog. Knowing them is understanding, not clearance — no knot knowledge makes a tie safe.",
    related: ["rope-basics", "learning-modalities"],
    blocks: [
      { type: "h", text: "Start with these six, learn them one at a time" },
      {
        type: "p",
        text: "The six foundation knots in this app are not random. Each one teaches a core principle, and mastering them will let you read the mechanics behind dozens of other knots. None of them makes anything safe: a correctly tied knot is a correctly tied knot, nothing more.",
      },
      {
        type: "h",
        text: "1. Somerville Bowline — the non-cinching loop",
      },
      {
        type: "p",
        text: "Teaches: How to make a loop that holds its size instead of drawing down when pulled. That matters because a cinching loop on a limb tightens under movement. Tying it correctly removes one specific failure mode — cinching — and nothing else: placement, tension, duration, and nerve position all still matter, and no knot check clears any of them.",
      },
      {
        type: "h",
        text: "2. Lark's Head — using the middle of the rope",
      },
      {
        type: "p",
        text: "Teaches: How doubled rope anchors to an object, and what a cinching hitch feels like as it loads. This app teaches it on an unoccupied post or beam only — it cinches, which is exactly why it is worth understanding and exactly why the catalog never uses it as a cuff, a harness start, or anything else that touches a person.",
      },
      {
        type: "h",
        text: "3. Half Hitch (single) — the basic wrap",
      },
      {
        type: "p",
        text: "Teaches: How a single wrap around a rope holds. This is the atomic unit of rope work. You will tie hundreds of half hitches as you learn. Understanding one teaches you all of them.",
      },
      {
        type: "h",
        text: "4. Double Half Hitch — doubling the hold",
      },
      {
        type: "p",
        text: "Teaches: How two identical wraps make a stable hold, and how friction accumulates. It is the mechanical idea underneath many of the finishes and direction changes you will meet later.",
      },
      {
        type: "h",
        text: "5. Square Knot — a flat, decorative finish, not a join",
      },
      {
        type: "p",
        text: "Teaches: How two mirrored throws press flat against each other — and the limits of that. A square knot is a binding and decorative knot. It is not a knot for joining two ropes that will carry real tension: under a hard steady pull the interlocked bights slide, capsize into a girth-hitch shape, and the ends work loose, which is why rope-craft references pair it with a proper bend whenever an actual working load is expected. Learn it for what it is; the knot's own entry lists the ways it fails.",
      },
      {
        type: "h",
        text: "6. Overhand on a Bight — a loop without the ends",
      },
      {
        type: "p",
        text: "Teaches: How to put a loop in the middle of a rope without using the ends, and why that structure has costs. It cinches, it can jam solid when loaded, and it is not a rapid-release method — so it is demonstrated on loose practice material and used in the catalog only as the karada's decorative, unloaded knot chain. It is not an attachment point and not a backup for anything that carries load.",
      },
      {
        type: "callout",
        title: "One knot at a time",
        text: "Do not rush to learn all six. Learn one knot very well. Come back to it in a few days. Then learn the second. Every knot you truly know is better than six knots you half-know.",
      },
    ],
  },
];
