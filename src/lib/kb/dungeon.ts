export type DungeonKind = "furniture" | "impact" | "machine" | "toy";

export type DungeonPiece = {
  slug: string;
  name: string;
  kind: DungeonKind;
  summary: string;
  withRope: string[];
  never: string[];
  studio: string;
  ties: string[];
  minutes: [number, number];
};

export const DUNGEON: DungeonPiece[] = [
  {
    slug: "massage-table",
    name: "Massage table",
    kind: "furniture",
    summary:
      "Your best floor-adjacent platform. Height saves your back. She is already supine or prone — karada, futomomo, and hip harnesses live here.",
    withRope: [
      "Prone karada: photograph from the side so chest bands and breathing are visible.",
      "Supine futomomo: one leg, then the other. Outer knee stays empty.",
      "Ankle cuffs to the table frame only if the frame is wood/steel you have tested with your own weight, not her full hang.",
    ],
    never: [
      "Do not use the face cradle as a neck restraint.",
      "Do not slide her toward the edge until a cuff is a leash. Tables tip.",
    ],
    studio: "Side three-quarter, whole torso in frame, one hand visible.",
    ties: ["karada", "futomomo", "single-column"],
    minutes: [20, 45],
  },
  {
    slug: "sex-bench",
    name: "Sex bench",
    kind: "furniture",
    summary:
      "Kneeling or draped. Good for rear access, crotch rope work, and keeping her hips high without asking her thighs to hold a squat.",
    withRope: [
      "Futomomo on the bench so the knee is supported, not hanging in space.",
      "Wrist cuffs to the front legs — two-finger, non-cinch, shears in the same hand you are not flogging with.",
      "A hip harness here is a handle, not a hang.",
    ],
    never: [
      "Do not add a TK and then fold her over the bench for a long scene. Shoulders plus drop is how wrists go numb.",
      "Do not gag unless she has a held bell or a knee-stomp.",
    ],
    studio: "From the hip line. Show the bench contact so the coach can see what is loaded.",
    ties: ["futomomo", "karada", "single-column"],
    minutes: [15, 40],
  },
  {
    slug: "st-andrews-cross",
    name: "Saint Andrew's Cross",
    kind: "furniture",
    summary:
      "Arms up is a clock. Blood leaves the hands. This is impact and display, not a place to invent a TK.",
    withRope: [
      "Single-column wrists to the upper points. Two fingers. Shears clipped to your belt.",
      "Ankles to the lower points so she cannot collapse a knee inward.",
      "Chest harness only if it does not climb. Photograph the throat empty.",
    ],
    never: [
      "Do not put a takate-kote on the cross. Arms are already loaded overhead.",
      "Do not leave her on the cross to fetch a drink. Hands go quiet fast with arms up.",
      "The cross is not a suspension hardpoint.",
    ],
    studio: "Full figure, both hands in frame. If you cannot see fingers, the still is useless.",
    ties: ["single-column", "shinju"],
    minutes: [8, 20],
  },
  {
    slug: "sex-swing",
    name: "Sex swing",
    kind: "furniture",
    summary:
      "A sling, not a rig. It holds hips. It is not rated, inspected Shibari suspension. Use it to support her while you tie what you can still cut.",
    withRope: [
      "Let the swing take her weight. Rope dresses her; it does not hang her.",
      "Ankle cuffs to the stirrups so legs stay open without a groin-cinch.",
      "A karada over a supported torso is wearable, not load-bearing.",
    ],
    never: [
      "Do not clip an upline to the swing hardware and call it suspension.",
      "Do not put a TK in a swing and spin her. Shoulders plus spin plus unknown hardware.",
      "If the ceiling mount was not installed by someone who hangs people for a living, it is furniture.",
    ],
    studio: "Show the straps and the rope separately. The coach must see what is actually holding weight.",
    ties: ["karada", "futomomo", "single-column"],
    minutes: [15, 35],
  },
  {
    slug: "pole",
    name: "Stripper pole",
    kind: "furniture",
    summary:
      "A dance pole is chrome and spin. It is not a bamboo or a ring. Cuff to it. Do not hang from it.",
    withRope: [
      "Single-column a wrist or both ankles around the pole at floor height for a standing predicament she can still step out of.",
      "A chest harness looks good against chrome. Keep the throat empty. Photograph the gap.",
      "If she is dancing first, tie after — sweaty skin plus jute is slippage, then a cinch.",
    ],
    never: [
      "Do not use the pole as an upline. Spinning hardware plus body weight is how mounts rip out of ceilings.",
      "Do not tie her to the pole and walk to another room.",
    ],
    studio: "Vertical three-quarter. Include the floor contact so we can see she is standing.",
    ties: ["single-column", "karada", "tasuki"],
    minutes: [10, 25],
  },
  {
    slug: "floggers",
    name: "Floggers",
    kind: "impact",
    summary:
      "Tied flesh takes a flogger differently. Wrapped tissue cannot flinch the way loose tissue can. Shorter scene, more check-ins.",
    withRope: [
      "Flog a karada or a supported back on the cross. Stay off kidneys, spine, and anything already pale.",
      "If a futomomo is on, flog the meat of the ass and thighs, never the outer knee.",
      "Put the flogger down to check hands. You cannot hold both honestly.",
    ],
    never: [
      "Do not flog over a nerve groove to 'see if she can take it'.",
      "Do not combine heavy impact with a TK on a first clock.",
    ],
    studio: "After a pass, photograph the back and the hands. Marks vs injury is the essay.",
    ties: ["karada", "shinju", "single-column"],
    minutes: [10, 25],
  },
  {
    slug: "hismith",
    name: "Hismith machine",
    kind: "machine",
    summary:
      "A machine does not watch her face. You must. Speed is a privilege she can revoke without using her hands if you set that up first.",
    withRope: [
      "Cuff wrists in front or to the bench so she cannot shove the machine — and so you can still cut.",
      "A futomomo or swing stirrups keep legs open. Outer knee empty.",
      "Start slow. Photograph hips and hands, not the toy, when you want coaching on the rope.",
    ],
    never: [
      "Do not run the machine with a TK and a gag. That is three ways she cannot help herself.",
      "Do not walk away while it is on. A machine does not hear yellow.",
      "Do not aim at the cervix as a joke. Large toys plus thrust plus bondage is how scenes become clinics.",
    ],
    studio: "Frame her face and a hand. If you cannot see a safeword channel, stop the machine before you photograph.",
    ties: ["futomomo", "single-column", "karada"],
    minutes: [10, 30],
  },
  {
    slug: "bad-dragon",
    name: "Large Bad Dragon toys",
    kind: "toy",
    summary:
      "Size is a warmup problem, not a dominance problem. Bound, she cannot migrate off a flare the way she can with free hips.",
    withRope: [
      "Insert before the restrictive hip rope, or leave a way to lift the crotch rope without untying the whole harness.",
      "Lube as if you mean it. Reapply. Jute drinks lube off the skin around it.",
      "If she is on the machine with a large toy, the rope only positions. It does not force depth.",
    ],
    never: [
      "Do not combine a too-large toy, a crotch rope that prevents backing off, and a gag.",
      "Do not 'just see if it fits' while she is already in a TK. Hands are busy being tied.",
    ],
    studio: "Coach the rope, not the toy. Photograph harness clearance at the groin, not pornography for the model.",
    ties: ["karada", "futomomo", "single-column"],
    minutes: [15, 40],
  },
];

export const DUNGEON_SCENES = [
  {
    slug: "table-fold",
    name: "Table / bench",
    piece: "massage-table",
    minutes: 30,
    steps: ["bench-drape", "frog-tie"],
    blurb: "Supine on the table. Cuffs, a wearable harness, one leg. Machine or toy only after hands check out green.",
  },
  {
    slug: "cross-short",
    name: "Cross, short clock",
    piece: "st-andrews-cross",
    minutes: 15,
    steps: ["single-column", "shinju"],
    blurb: "Wrists and ankles to the cross. Optional chest. Flogger in the middle. Off before the hands fade.",
  },
  {
    slug: "bench-machine",
    name: "Bench and machine",
    piece: "hismith",
    minutes: 30,
    steps: ["single-column", "futomomo"],
    blurb: "Draped on the bench, one or both legs tied, machine in front of you not instead of you.",
  },
  {
    slug: "swing-support",
    name: "Swing holds",
    piece: "sex-swing",
    minutes: 25,
    steps: ["single-column", "hip-harness"],
    blurb: "The sling holds her. Rope dresses. No uplines. Toy or machine only if her hands can still signal.",
  },
  {
    slug: "pole-dress",
    name: "Pole, feet planted",
    piece: "pole",
    minutes: 20,
    steps: ["pole-cuffs", "shinju"],
    blurb: "Dance first if you want. Tie after she is dry enough that jute will not cinch on sweat.",
  },
] as const;

export function getDungeon(slug: string) {
  return DUNGEON.find((d) => d.slug === slug);
}
