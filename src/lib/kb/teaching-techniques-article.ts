import type { Article } from "./types";

/**
 * Techniques ranked honestly by how well the evidence actually supports them,
 * rather than presented as nine equally-established findings.
 *
 * An earlier draft of this entry cited a study for every technique and gave
 * them all the same confident footing. Three of those citations were wrong:
 * elaboration was attributed to Bjork & Bjork 1992 (which is the New Theory of
 * Disuse, and underpins spacing rather than elaboration), immediate feedback
 * was asserted to beat delayed feedback (contested at best — delayed feedback
 * wins for retention in much of the verbal-learning work), and the whole entry
 * closed by telling readers to pick techniques by learning style, which is the
 * meshing hypothesis and does not survive testing. Citing a study per claim
 * made the entry look more rigorous while making it less accurate. What is
 * here now is graded, and the grading is the point.
 */
export const TEACHING_TECHNIQUES_ARTICLE: Article = {
  slug: "evidence-based-teaching",
  title: "What Actually Works, Ranked by How Sure We Are",
  section: "craft",
  minutes: 11,
  summary:
    "Six techniques, sorted honestly: two with strong evidence, three that are promising, and one popular idea that failed testing. Start at the top.",
  related: ["learning-modalities", "learning-disabilities-rope", "spaced-learning", "learning-pacing"],
  blocks: [
    { type: "h", text: "Why this is a ranking and not a list" },
    {
      type: "p",
      text: "Most study-skills advice hands you ten techniques as though they were equally proven. They are not. When reviewers graded common techniques against the evidence, the spread was wide: a couple were well supported across ages and materials, several were promising but thinly tested, and several of the most popular ones did close to nothing. Presenting that as a flat list would waste your effort on the weak ones.",
    },
    {
      type: "p",
      text: "One caveat that applies to all of it: most of this research was done on students learning verbal material — text, vocabulary, classroom subjects. Knot tying is a manual skill. The two techniques at the top have held up broadly enough that applying them here is reasonable. The middle ones are a judgement call. Nobody has run these studies on rope.",
    },

    { type: "h", text: "Strong evidence: do these two" },

    { type: "h", text: "1. Test yourself instead of reviewing" },
    {
      type: "p",
      text: "Retrieving something from memory strengthens it far more than looking at it again. This is one of the two best-supported techniques in the review, and it is also the one people skip, because reviewing feels productive and retrieving feels like failing.",
    },
    {
      type: "ul",
      items: [
        "Tie the knot before you open the lesson, not after.",
        "When you get stuck, stay stuck for a moment. The effortful pause is the part that works — looking it up immediately spends the effort and gets nothing back.",
        "Then look it up, and note which step broke. That step is tomorrow's practice.",
        "Re-watching a demonstration you already understand is the low-value activity that feels like the high-value one.",
      ],
    },

    { type: "h", text: "2. Spread practice across days" },
    {
      type: "p",
      text: "The other top-rated technique. Six short sessions across two weeks beat one long session, and it is not close. Its own article covers the detail, including why the second session feels worse and why that is fine.",
    },

    { type: "h", text: "Promising, less certain: worth doing, hold loosely" },

    { type: "h", text: "3. Ask why it holds" },
    {
      type: "p",
      text: "Explaining a step to yourself — why this wrap holds, why that loop stays open under load — rated moderate: promising, but not yet tested enough in real settings to promise you a result. It costs little, so it is worth doing.",
    },
    {
      type: "p",
      text: "For rope there is a second reason beyond memory. A knot you have only memorized as a sequence fails silently when a variable changes — different rope, different diameter, a post instead of a rail. A knot you understand mechanically degrades more visibly, because you can tell what the structure is supposed to be doing.",
    },

    { type: "h", text: "4. Mix knots within a session" },
    {
      type: "p",
      text: "Practising several knots interleaved rather than one at a time also rated moderate. Expect it to feel worse: interleaved practice performs worse during the session and better afterwards, which is exactly why people abandon it. If mixing makes you feel clumsy and confused, that is the expected sensation, not a sign it is going wrong.",
    },
    {
      type: "p",
      text: "Sequence it after you can complete each knot at all. Interleaving things you cannot yet do produces confusion without the benefit.",
    },

    { type: "h", text: "5. Watch hands move, in short pieces you control" },
    {
      type: "p",
      text: "For hand-manipulation tasks specifically — knot tying is one of the tasks this was actually tested on — watching a demonstrator's hands beat static graphics. That runs against the general rule that moving displays teach worse than still ones, and the proposed reason is that copying human movement is something we do almost for free.",
    },
    {
      type: "p",
      text: "Pair it with the pacing finding: segmented and user-paced. A short clip you replay eight times is the good version. The same footage inside a continuous ten-minute tutorial is the version that has been failing you.",
    },

    { type: "h", text: "Failed testing: skip this one" },

    { type: "h", text: "6. Matching lessons to your 'learning style'" },
    {
      type: "p",
      text: "The idea that you have a modality — visual, auditory, kinesthetic — and learn better when teaching matches it is the most widely believed claim in this whole area, and it did not survive proper testing. It is worth actively discarding rather than merely not using, because believing it leads you to skip channels you need and to explain your difficulties with a story that is not true.",
    },
    {
      type: "p",
      text: "Two things it is easy to confuse with learning styles, both real: using words and pictures together helps everyone, and a genuine access need — low vision, a screen reader, a reading disability — is a real reason to change format. Neither of those is style-matching.",
    },

    { type: "h", text: "If you only take three things" },
    {
      type: "ul",
      items: [
        "Tie it from memory before you open the lesson.",
        "Come back on a different day rather than repeating it now.",
        "Watch moving hands, in short pieces, as many times as you want.",
      ],
    },
    {
      type: "callout",
      title: "On the studies named here",
      text: "The evidence panel on this page lists the reviews these claims come from. They are studies about how skills are learned, mostly outside rope entirely. None of them is a safety source: nothing in this article establishes that a tie is safe, that you are ready for one, or that a technique may go on a person.",
    },
  ],
};
