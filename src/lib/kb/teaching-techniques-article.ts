import type { Article } from "./types";

export const TEACHING_TECHNIQUES_ARTICLE: Article = {
  slug: "evidence-based-teaching",
  title: "Techniques That Work: Evidence-Based Teaching",
  section: "craft",
  minutes: 12,
  summary:
    "Nine proven techniques from learning science research. Learn how to teach yourself knots in a way that actually sticks.",
  related: ["learning-modalities", "learning-disabilities-rope", "spaced-learning"],
  blocks: [
    { type: "h", text: "What the research actually says works" },
    {
      type: "p",
      text: "Learning science research tells us what helps people learn fastest and retain longest. These nine techniques are grounded in peer-reviewed research. They are not opinions or marketing — they are tools that have been proven in studies with real learners.",
    },
    { type: "h", text: "1. One Step at a Time (Chunking)" },
    {
      type: "p",
      text: "Break the skill into small pieces. One action per step. One check per step. One idea per sentence. Cognitive load theory (Sweller, 1988) shows that smaller chunks reduce overwhelm and improve retention, especially for learners with processing differences.",
    },
    {
      type: "ul",
      items: [
        "Instead of: 'Wrap, pull through, check and tighten' all at once",
        "Do: Wrap (one step). Pull through (one step). Check (one step). Tighten (one step).",
        "Each step should take 1-3 minutes, not 10.",
      ],
    },
    { type: "h", text: "2. Spaced Repetition" },
    {
      type: "p",
      text: "Practice the same skill over multiple days or weeks, not all at once. The spacing effect (Cepeda et al., 2006) shows that distributed practice over time produces better long-term retention than marathon sessions. This is especially powerful for procedural skills like knot tying.",
    },
    {
      type: "ul",
      items: [
        "Day 1: Learn a new knot. Tie it 2 times.",
        "Day 2: Tie it from memory (do not look at instructions first). Notice how much easier it is.",
        "Day 4: Tie it again. Your hands remember.",
        "Day 7: Teach it to someone. By now, it is automatic.",
      ],
    },
    { type: "h", text: "3. Elaboration" },
    {
      type: "p",
      text: "Do not just learn what to do. Learn why it works. Elaboration (Bjork & Bjork, 1992) shows that explaining the 'why' behind steps improves understanding and retention. Say it out loud. Write it down. Teach it to someone.",
    },
    {
      type: "ul",
      items: [
        "Instead of: 'Now wrap the rope.'",
        "Do: 'I wrap the rope because it creates friction. Friction is what holds the knot in place. Without friction, the knot would slip.'",
        "Say this out loud. Write it in your journal. Explain it to a partner.",
      ],
    },
    { type: "h", text: "4. Interleaving" },
    {
      type: "p",
      text: "Do not practice one knot for an hour. Practice one knot, then the next, then back to the first. Interleaving (Rohrer & Taylor, 2007) shows that mixing different skills during practice improves transfer and prevents false mastery.",
    },
    {
      type: "ul",
      items: [
        "Knot 1: two times",
        "Knot 2: two times",
        "Back to Knot 1: two times (it will feel harder — that is correct)",
        "The confusion you feel is your brain consolidating. That is learning.",
      ],
    },
    { type: "h", text: "5. Retrieval Practice" },
    {
      type: "p",
      text: "Test yourself by tying from memory, not from instructions. The testing effect (Roediger & Karpicke, 2006) shows that retrieval practice produces better learning than restudying.",
    },
    {
      type: "ul",
      items: [
        "Do not re-watch the video. Instead, tie it without looking.",
        "If you get stuck, look it up. But look it up AFTER you tried.",
        "The struggle is not failure. It is learning.",
      ],
    },
    { type: "h", text: "6. Multi-Sensory Engagement" },
    {
      type: "p",
      text: "Use your hands, eyes, ears, and voice. Listen, look, do, say, write, teach. Multi-modal learning (Mayer, 2009) shows that combining audio, visual, and kinesthetic input produces better retention, especially for procedural skills.",
    },
    {
      type: "ul",
      items: [
        "LISTEN: auto-read",
        "LOOK: diagram",
        "DO: rope in your hands",
        "SAY: speak the steps",
        "WRITE: journal",
        "TEACH: explain to someone",
      ],
    },
    { type: "h", text: "7. Metacognition" },
    {
      type: "p",
      text: "Think about your thinking. Notice what is hard. Notice what is easy. Adjust your practice based on what you discover. Metacognitive monitoring (Schraw & Dennison, 1994) shows that learners who reflect on their own learning improve more.",
    },
    {
      type: "ul",
      items: [
        "After each session, ask: What was hard? What was easy?",
        "Do I learn better by listening or looking?",
        "Am I going too fast? Should I slow down?",
        "Adjust next time based on what you learned about yourself.",
      ],
    },
    { type: "h", text: "8. Concrete Before Abstract" },
    {
      type: "p",
      text: "Do the physical action first. Understand the mechanics with your hands. Then learn the name and concept. The CRA progression (Witzel, 2005) shows that starting with physical manipulation improves understanding for all learners.",
    },
    {
      type: "ul",
      items: [
        "STEP 1: Tie the knot with rope",
        "STEP 2: Look at the diagram",
        "STEP 3: Name the parts and explain why it works",
        "Do not learn the name first. Learn the action first.",
      ],
    },
    { type: "h", text: "9. Immediate Feedback" },
    {
      type: "p",
      text: "Check yourself right away. Feedback timing (Metcalfe, 1991) shows that immediate feedback is more effective for learning than delayed feedback, especially for skill acquisition.",
    },
    {
      type: "ul",
      items: [
        "After each step, check against the diagram immediately",
        "If it does not match, try again right now",
        "Do not move on if you are not sure",
        "Close the loop fast: action → check → adjustment",
      ],
    },
    { type: "h", text: "How to use these techniques" },
    {
      type: "p",
      text: "You do not need to use all nine at once. In fact, doing too many things at the same time creates cognitive overload. Start with three that match your learning style:",
    },
    {
      type: "ul",
      items: [
        "If you struggle with fast visuals: focus on Spaced Repetition, Concrete Before Abstract, and Multi-Sensory Engagement",
        "If you have ADHD: focus on Interleaving, Retrieval Practice, and Progress Tracking",
        "If you struggle with reading: focus on Multi-Sensory Engagement, Elaboration (say it out loud), and Concrete Before Abstract",
        "If you are autistic or have sensory sensitivities: focus on Spaced Repetition, Metacognition, and Concrete Before Abstract",
      ],
    },
    {
      type: "callout",
      title: "The research is clear",
      text: "These techniques work. They have been tested in hundreds of studies with thousands of learners. If rope tying has never worked for you before, it is not because you are not capable. It is because the teaching method did not match how your brain learns. Try these techniques. You will surprise yourself.",
    },
  ],
};
