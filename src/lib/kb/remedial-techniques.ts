/**
 * Remedial and evidence-based teaching techniques specifically designed for
 * learners with slow visual processing, learning disabilities, or those who
 * struggle with traditional fast-paced video instruction.
 *
 * These techniques are grounded in learning science research:
 * - Spaced repetition / distributed practice (Cepeda et al., 2006)
 * - Chunking (Cowan, 2010)
 * - Interleaving (Rohrer & Taylor, 2007)
 * - Elaboration (Bjork & Bjork, 1992)
 * - Cognitive load theory (Sweller, 1988)
 */

export interface TeachingTechnique {
  name: string;
  description: string;
  evidence: string;
  implementation: string[];
  example?: string;
}

export const REMEDIAL_TECHNIQUES: TeachingTechnique[] = [
  {
    name: "One Step at a Time (Chunking)",
    description:
      "Break complex skills into small, manageable pieces. One physical action per step. One idea per explanation.",
    evidence:
      "Cognitive load theory (Sweller, 1988) shows that breaking information into chunks reduces cognitive overload and improves retention, especially for learners with processing differences.",
    implementation: [
      "Each step has ONE action, not multiple",
      "Each step has ONE check, not a list of checks",
      "One idea per sentence in the explanation",
      "Pause between steps — do not rush to the next one",
    ],
    example:
      "Instead of: 'Wrap the working end around the standing part and pass it through the loop twice, checking for flatness.' Say: STEP 1: Wrap. STEP 2: Pass through. STEP 3: Check it is flat.",
  },
  {
    name: "Spaced Repetition (Spacing Effect)",
    description:
      "Practice the same skill over multiple days or weeks, not all in one long session. This creates lasting memory.",
    evidence:
      "The spacing effect (Cepeda et al., 2006) shows that distributed practice over time produces better long-term retention than massed practice. This is especially powerful for procedural skills like knot tying.",
    implementation: [
      "Learn one knot per session (not all six at once)",
      "Come back to each knot in 1-3 days",
      "Tie it again from memory (do not look at the instructions first)",
      "Notice how much easier it is the second time",
      "By day 7, your hands know it well",
    ],
    example:
      "Day 1: Learn the Somerville Bowline. Tie it 2 times. Day 2: Tie it without looking at the instructions first. Day 3: Tie it in a different way or faster. Day 5: Teach it to someone. Day 10: Tie it without thinking.",
  },
  {
    name: "Elaboration (Connecting to What You Know)",
    description:
      "Explain why each step works, not just what to do. Connect new learning to things you already understand.",
    evidence:
      "Elaboration (Bjork & Bjork, 1992) shows that explaining the 'why' behind steps, not just the 'what', improves understanding and retention. This is critical for learners with processing differences.",
    implementation: [
      "After each step, ask: why does this work?",
      "Connect to physics: tension, friction, knot structure",
      "Say it out loud: 'I wrap because it creates friction.'",
      "Write it down: journal or notebook",
      "Explain it to a partner or to yourself",
    ],
    example:
      "When tying a half-hitch, do not just say 'wrap and pull through.' Say: 'I wrap the working end around the standing rope (creating a loop). Then I pass the working end through its own loop (creating friction). The friction is what holds it.'",
  },
  {
    name: "Interleaving (Mixing Practice)",
    description:
      "Do not practice one knot for an hour, then move to the next. Practice one knot, then the next, then back to the first.",
    evidence:
      "Interleaving (Rohrer & Taylor, 2007) shows that mixing different skills during practice (instead of practicing one skill at a time) improves transfer and prevents the false sense of mastery that massed practice creates.",
    implementation: [
      "Knot 1: tie it 2 times",
      "Knot 2: tie it 2 times",
      "Back to Knot 1: tie it 2 times (it will feel harder — that is correct)",
      "Back to Knot 2: tie it 2 times",
      "Notice which one you got confused on? That is the one that needs more practice.",
    ],
    example: "In week 2, do not spend an hour on the bowline. Instead: bowline twice, half-hitch twice, bowline twice, half-hitch twice. The confusion you feel means you are learning.",
  },
  {
    name: "Retrieval Practice (Testing Yourself)",
    description:
      "Do not just watch and listen. Test yourself by tying from memory, not from looking at the instructions.",
    evidence:
      "The testing effect (Roediger & Karpicke, 2006) shows that retrieval practice (testing yourself) produces better learning than restudying. This is even more powerful than spacing.",
    implementation: [
      "Tie the knot without looking at the instructions first",
      "If you forget a step, look it up. But look it up AFTER trying",
      "Write down where you got stuck",
      "Next time, focus on that step",
      "The struggle is not a failure — it is learning",
    ],
    example:
      "Do not re-watch the Somerville Bowline video. Instead: tie it without the instructions. You will probably get stuck on step 3. Good. Now you know what to practice tomorrow.",
  },
  {
    name: "Multi-Sensory Engagement (Full Body Learning)",
    description: "Use your hands, your eyes, your ears, and your voice. Not just one sense.",
    evidence:
      "Multi-modal learning (Mayer, 2009) shows that combining audio, visual, and kinesthetic input produces better retention, especially for procedural skills. Kinesthetic learners especially need hands-on practice.",
    implementation: [
      "Listen: turn on auto-read. Hear the steps spoken.",
      "Look: watch the diagram as you tie",
      "Do: your hands tied the rope, feeling the weight and texture",
      "Say: speak the steps out loud as you do them",
      "Write: journal about what you learned",
      "Teach: explain it to someone else",
    ],
    example:
      "LISTEN: 'Push the working loop up through the collar.' LOOK: see the diagram. DO: your hands feel the rope moving through the collar. SAY: 'I am pushing the loop up through the collar.' WRITE: 'The collar gets tighter when I push up.' TEACH: 'See, when you push the loop up, you are creating a path for the standing ropes.'",
  },
  {
    name: "Metacognition (Thinking About Your Thinking)",
    description:
      "Notice what is hard. Notice what is easy. Adjust your practice based on what you discover about how YOU learn.",
    evidence:
      "Metacognitive monitoring (Schraw & Dennison, 1994) shows that learners who reflect on their own learning improve more than those who do not. This is powerful for learners with processing differences because they often understand themselves better than standard teaching assumes.",
    implementation: [
      "After each knot session, ask: What was hard? What was easy?",
      "What do I need to practice more?",
      "Do I learn better by listening or looking?",
      "Am I going too fast? Should I slow down?",
      "What would help me remember this better?",
      "Adjust next time based on what you learned about yourself",
    ],
    example:
      "You tie the half-hitch and notice that you always forget which direction to wrap. That is the thing to focus on. Next time, do not try to tie it fast. Instead, slow down on the wrap. Feel which direction is natural. Come back tomorrow and do it again.",
  },
  {
    name: "Concrete Before Abstract (Physical Before Conceptual)",
    description:
      "Do the physical action first. Understand the mechanics with your hands. Then learn the name and the concept.",
    evidence:
      "Concrete-representational-abstract (CRA) progression (Witzel, 2005) shows that starting with physical manipulation, then moving to diagrams, then to abstract concepts improves understanding for learners with learning differences.",
    implementation: [
      "STEP 1: Tie the knot with rope in your hands",
      "STEP 2: Look at the diagram WHILE tying (or after)",
      "STEP 3: Name the parts and explain why it works",
      "Do not learn the name first. Learn the action first.",
    ],
    example:
      "Do not start by saying 'This is called a half-hitch and it works because of friction.' Start by: tie it, feel what happens, look at the diagram, then say 'This is a half-hitch and it creates friction.'",
  },
  {
    name: "Immediate Feedback (Close the Loop Fast)",
    description:
      "Check yourself right away. Do not wait until tomorrow to find out you were doing it wrong.",
    evidence:
      "Feedback timing (Metcalfe, 1991) shows that immediate feedback is more effective for learning than delayed feedback, especially for skill acquisition.",
    implementation: [
      "After each step, check against the diagram immediately",
      "If it does not match, try again right now",
      "Do not move on if you are not sure",
      "The practice cam can help you see if your rope matches the diagram",
      "Ask someone else to look and tell you if it matches",
    ],
    example:
      "You finish step 2 of the bowline. Check the diagram immediately. Does your rope look like the diagram? If not, untie and try again. Do not move to step 3 until step 2 is right.",
  },
  {
    name: "Progress Tracking (Celebrate the Small Wins)",
    description:
      "Keep track of what you have learned. Look back at your progress. This is motivating and helps with metacognition.",
    evidence:
      "Progress monitoring (Fuchs & Fuchs, 2002) shows that tracking progress improves motivation and learning, especially for learners who have struggled with learning in the past.",
    implementation: [
      "Use the journal to record when you learned each knot",
      "Write the date you first learned it and when you mastered it",
      "Look back at the journal. You learned 6 knots. That is real progress.",
      "Notice how much faster you get each time",
      "Celebrate small wins: 'I tied this from memory today.'",
    ],
    example:
      "Journal entry: 'Learned Somerville Bowline on 2025-08-24. Took 20 minutes. Now on 2025-08-31, I can tie it in 3 minutes without looking. Seven days, 17 minutes faster. That is learning.'",
  },
];

export interface AccessibilityProfile {
  name: string;
  description: string;
  recommendations: string[];
  techniques: string[]; // names of techniques from REMEDIAL_TECHNIQUES
}

export const ACCESSIBILITY_PROFILES: AccessibilityProfile[] = [
  {
    name: "Slow Visual Processing",
    description: "You process images and videos slowly. Fast-moving visuals overwhelm you.",
    recommendations: [
      "Turn on auto-read and listen to every step",
      "Pause between steps. Do not rush to the next diagram.",
      "The practice cam moves slowly. Use it instead of watching videos.",
      "Tie on a smooth, well-lit post so you can see your work clearly",
      "One knot per session. Not all six at once.",
    ],
    techniques: [
      "One Step at a Time (Chunking)",
      "Spaced Repetition (Spacing Effect)",
      "Concrete Before Abstract",
      "Immediate Feedback",
    ],
  },
  {
    name: "ADHD (Attention-Deficit/Hyperactivity Disorder)",
    description: "You struggle with sustained focus, but rope can be hyperfocus. You need breaks and movement.",
    recommendations: [
      "Use body doubling: practice with someone else in the room",
      "Take movement breaks. Stand up, walk around, come back.",
      "If you get hyperfocused, that is great. Rope can be very rewarding for ADHD brains.",
      "Set a timer. Practice for 10-15 minutes, then rest.",
      "Use the journal to track your wins. ADHD brains need dopamine hits.",
    ],
    techniques: [
      "One Step at a Time (Chunking)",
      "Interleaving (Mixing Practice)",
      "Progress Tracking (Celebrate the Small Wins)",
      "Retrieval Practice (Testing Yourself)",
    ],
  },
  {
    name: "Dyslexia (Reading and Language Processing)",
    description: "You struggle with reading speed or comprehension. Text-heavy instruction overwhelms you.",
    recommendations: [
      "Turn on auto-read for everything. Do not try to read the steps.",
      "Listen to the voice. Your ears can process this faster than your eyes.",
      "The diagrams are your guide. Rope tying is very visual and spatial.",
      "Do not use the journal for notes if writing is hard. Use voice recording instead.",
      "Pair with someone who can read the steps aloud if auto-read is not available.",
    ],
    techniques: [
      "Multi-Sensory Engagement (Full Body Learning)",
      "Concrete Before Abstract (Physical Before Conceptual)",
      "Immediate Feedback (Close the Loop Fast)",
      "Elaboration (Connecting to What You Know)",
    ],
  },
  {
    name: "Autism Spectrum / Sensory Processing Differences",
    description: "You may struggle with sensory input, social interaction, or non-preferred tasks.",
    recommendations: [
      "Rope is predictable and repetitive. Most autistic people find that soothing.",
      "Pattern recognition is often a strength for autistic people. Knots follow rules — learn the rules, tie anything.",
      "Practice alone if social practice is overwhelming. Solo practice is valid.",
      "If the voice speed is wrong or the screen brightness is wrong, customize it. Make it work for your sensory needs.",
      "Special interest hyperfocus is powerful for learning. If rope becomes a special interest, embrace it.",
    ],
    techniques: [
      "Spaced Repetition (Spacing Effect)",
      "Metacognition (Thinking About Your Thinking)",
      "Progress Tracking (Celebrate the Small Wins)",
      "Elaboration (Connecting to What You Know)",
    ],
  },
  {
    name: "Dyscalculia (Number and Sequence Processing)",
    description: "You struggle with numbers and sequences. Counting and left-right can be hard.",
    recommendations: [
      "This app does not ask you to count or memorize numbers. It teaches knots as sequences of actions, not numbers.",
      "Use touch and feel instead of mental counting. 'Two wraps' is just 'wrap, wrap' — feel it, do not count it.",
      "The diagrams show you the sequence. Do not try to number them.",
      "Say the steps out loud as you do them. This helps your brain sequence them without numbers.",
    ],
    techniques: [
      "One Step at a Time (Chunking)",
      "Multi-Sensory Engagement (Full Body Learning)",
      "Elaboration (Connecting to What You Know)",
      "Concrete Before Abstract (Physical Before Conceptual)",
    ],
  },
];
