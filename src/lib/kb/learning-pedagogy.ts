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
    title: "How You Learn Best",
    section: "craft",
    minutes: 6,
    summary:
      "Different people absorb information different ways. Use the mix of audio, visual, and hands-on that works for you, not what works for someone else.",
    related: ["rope-basics", "knot-foundations"],
    blocks: [
      { type: "h", text: "There is no single right way to learn" },
      {
        type: "p",
        text: "Learning research shows that people absorb information through multiple channels: hearing (audio), seeing (visual), and doing (kinesthetic). Most people learn best with a mix, not a single modality, and the best mix is different for every person.",
      },
      {
        type: "h",
        text: "Audio (listening)",
      },
      {
        type: "ul",
        items: [
          "Great for: learning concepts, hearing instructions spoken aloud, having a coach's voice guide you through steps",
          "Why it helps: you can pause to let ideas settle, you can listen while your hands are busy with rope, you do not need to read fast",
          "This app: Turn on auto-read to hear every step spoken in a warm coach voice. You can replay any step.",
        ],
      },
      {
        type: "h",
        text: "Visual (seeing)",
      },
      {
        type: "ul",
        items: [
          "Great for: recognizing a finished state, spotting what comes next, seeing the step-by-step progression",
          "Why it helps: once you understand a step with your hands, the picture confirms what your rope actually looks like",
          "This app: every step has a diagram. Tap the filmstrip to jump between steps. Let your eyes rest between sections if fast-changing images feel overwhelming.",
        ],
      },
      {
        type: "h",
        text: "Kinesthetic (doing)",
      },
      {
        type: "ul",
        items: [
          "Great for: muscle memory, the feel of rope in your hands, understanding how tension works",
          "Why it helps: your hands learn what your eyes cannot see — how tight is enough, what the rope feels like",
          "This app: the practice cam lets you frame your empty prop and get heuristic hints. Compare your rope to the diagram, not to a fast video.",
        ],
      },
      {
        type: "callout",
        title: "Use the modality that fits the moment",
        text: "You do not need all three for every step. If a diagram confuses you, skip it and listen instead. If audio is overwhelming, silence it and look at the pictures. The app is yours to customize.",
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
    related: ["learning-modalities", "knot-foundations"],
    blocks: [
      { type: "h", text: "Rope is a tool, not magic" },
      {
        type: "p",
        text: "A rope is twisted or braided strands of fiber. It has two ends and a middle. Nothing about rope makes it hold by itself — it holds because of how you wrap it, where you tie it, and the physics of knots. When you understand that, the knots become clear.",
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
        text: "Tie every knot in this app on a smooth post or chair leg, never on a person. This keeps the focus on the rope mechanics without the complication of watching whether someone is comfortable. Once you can tie it on a post every time without thinking, a person becomes a detail, not the whole challenge.",
      },
    ],
  },
  {
    slug: "learning-pacing",
    title: "Why This App Goes Slow",
    section: "craft",
    minutes: 5,
    summary:
      "Fast-paced video teaches the person who learns fast. This app waits for you. Pause, repeat, take hours if you need them.",
    related: ["learning-modalities", "rope-basics"],
    blocks: [
      { type: "h", text: "Most rope videos are too fast" },
      {
        type: "p",
        text: "Online rope tutorials often show a knot being tied in real time or sped up, with fast hand movements and quick camera work. That teaching style works great if you can: (a) follow fast visuals, (b) process multiple steps in sequence, and (c) remember the sequence after seeing it once or twice.",
      },
      {
        type: "p",
        text: "Not everyone learns that way. If you are bright and curious but struggle with fast-paced visual learning, that is not a weakness. That is how your brain is wired. This app is built for how you actually learn, not how someone else's tutorial assumes you do.",
      },
      {
        type: "h",
        text: "How this app teaches differently",
      },
      {
        type: "ul",
        items: [
          "One step at a time. Each step is one idea, one action, one check. You finish the check before you see the next step.",
          "Listen to the voice. You can rewind and listen again. The voice goes at a speed you control, not at real-world rope speed.",
          "See the diagram. Pictures do not move. You can look as long as you need to.",
          "Hands on the rope. Your hands work at your speed, not someone else's. There is no timer watching you.",
          "Confirm each step. The app checks that you actually looked and checked the rope before it lets you move forward. That means you are not skipping, not guessing.",
        ],
      },
      {
        type: "callout",
        title: "Slow is not a weakness",
        text: "Learning science research shows that learners who go slow and repeat steps actually learn faster in the long run than people who rush through. You are doing it right.",
      },
    ],
  },
  {
    slug: "spaced-learning",
    title: "Space Your Practice Over Time",
    section: "craft",
    minutes: 5,
    summary:
      "Your brain learns better when you tie the same knot over days or weeks, not all in one session. That is proven by learning research.",
    related: ["learning-pacing", "rope-basics"],
    blocks: [
      { type: "h", text: "Your brain needs time to consolidate" },
      {
        type: "p",
        text: "Learning science research (called spacing effect or distributed practice) shows that skills stick better when you practice them over days or weeks instead of all in one long session. When you tie a knot and then come back to it tomorrow, your brain treats it as a new challenge and learns deeper.",
      },
      {
        type: "p",
        text: "This is not about forgetting and relearning. It is about your brain having time to consolidate the memory into a stable, reliable skill.",
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
      "If you have dyslexia, ADHD, autism, or another learning difference, rope tying is an area where you can absolutely excel. Here is what to know.",
    related: ["learning-modalities", "learning-pacing", "spaced-learning"],
    blocks: [
      { type: "h", text: "Many rope practitioners have learning disabilities" },
      {
        type: "p",
        text: "Rope tying can be an excellent skill for people with ADHD, dyslexia, autism, dyscalculia, or other learning differences. This is because rope does not rely on reading speed, spelling, numbers, or linear text processing. It relies on spatial thinking, pattern recognition, kinesthetic sense, and persistence — things many neurodivergent people are naturally strong at.",
      },
      {
        type: "h",
        text: "How this app supports different learning styles",
      },
      {
        type: "ul",
        items: [
          "Short text with bullets: not dense paragraphs. Each point is one idea.",
          "Audio available for every step: no requirement to read fast or to read at all",
          "Diagrams and visual patterns: spatial thinking, not text-based instructions",
          "Pause and restart anytime: no time pressure, no 'you are falling behind'",
          "Same structure every time: your brain learns where to find what it needs",
          "Hands-on practice: kinesthetic learning that does not require sitting still",
        ],
      },
      {
        type: "h",
        text: "If you have ADHD",
      },
      {
        type: "ul",
        items: [
          "Hyperfocus is your friend. If you get interested, rope can be one of the things you get very, very good at.",
          "Body doubling helps: practice with someone else in the room, even if you are both doing your own knots",
          "Movement helps: if you need to fidget or move between steps, do that. Your hands will still remember.",
          "Short sessions work: 5-10 minutes is fine. Come back tomorrow.",
        ],
      },
      {
        type: "h",
        text: "If you have dyslexia or reading challenges",
      },
      {
        type: "ul",
        items: [
          "Use auto-read for everything. Turn it on and leave it on. Your ears process this faster than your eyes.",
          "The diagrams are your textbook. Your spatial-visual brain is designed to understand these patterns.",
          "You do not need to remember text. You only need to remember what the rope does.",
        ],
      },
      {
        type: "h",
        text: "If you are autistic or have sensory sensitivities",
      },
      {
        type: "ul",
        items: [
          "Rope is a predictable, repeatable activity. Most autistic people find that soothing.",
          "If the voice speed is wrong, you can change it. If the screen is too bright, use dark mode.",
          "Pattern recognition is often a strength for autistic people. Knot patterns follow rules — learn the rules and you can tie anything.",
        ],
      },
      {
        type: "callout",
        title: "You belong in rope",
        text: "The rope community includes many brilliant people with learning disabilities and processing differences. Your brain is not broken — it just works differently. Find the learning style that fits you, and you will probably surprise yourself with how good you can get.",
      },
    ],
  },
  {
    slug: "knot-foundations",
    title: "The Six Foundation Knots and Why They Matter",
    section: "craft",
    minutes: 8,
    summary:
      "These six knots teach you everything you need to know to tie safely. Every other knot is a variation or a combination.",
    related: ["rope-basics", "learning-modalities"],
    blocks: [
      { type: "h", text: "Start with these six, master them completely" },
      {
        type: "p",
        text: "The six foundation knots in this app are not random. Each one teaches a core principle. Master these six and you will understand the mechanics behind dozens of other knots.",
      },
      {
        type: "h",
        text: "1. Somerville Bowline — the non-cinching loop",
      },
      {
        type: "p",
        text: "Teaches: How to make a loop that stays open no matter how much you pull. This is the foundation of safe rope work because a cinching loop can trap and cut off circulation. Once you tie a bowline correctly, you never have to guess whether a loop is safe.",
      },
      {
        type: "h",
        text: "2. Lark's Head — anchoring the rope",
      },
      {
        type: "p",
        text: "Teaches: How to use the middle of a rope and attach it to a post. This is the most reliable starting point for any rope work. Every single shibari tie can be started with a lark's head and a post.",
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
        text: "Teaches: How two identical wraps make a strong, stable hold. This is the basis for cuffs and for most of the rope-to-rope connections you will use.",
      },
      {
        type: "h",
        text: "5. Square Knot — rope-to-rope on open ends",
      },
      {
        type: "p",
        text: "Teaches: How to tie two rope ends together when you need the knot to be completely predictable and not slip. This is used when you are joining two separate ropes.",
      },
      {
        type: "h",
        text: "6. Overhand on a Bight — the emergency loop",
      },
      {
        type: "p",
        text: "Teaches: How to tie a secure loop in the middle of a rope without using the ends. This is used for attachment points and for backup loops in ties.",
      },
      {
        type: "callout",
        title: "One knot at a time",
        text: "Do not rush to learn all six. Learn one knot very well. Come back to it in a few days. Then learn the second. Every knot you truly know is better than six knots you half-know.",
      },
    ],
  },
];
