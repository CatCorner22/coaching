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

const studioBoundary =
  "Studio accepts an unoccupied equipment view for broad category recognition only. It cannot verify installation, condition, capacity, loading, placement, consent, physiology, technique, or a release plan.";

export const DUNGEON: DungeonPiece[] = [
  {
    slug: "massage-table",
    name: "Massage table",
    kind: "furniture",
    summary:
      "A table may support ordinary positioning, but it is furniture—not a verified anchor or person-bearing rope system.",
    withRope: [
      "Keep app-guided rope learning separate, ground-level, non-loaded, and easy to release.",
      "Inspect an unoccupied surface for damage, instability, sharp edges, pinch points, and clear access around it.",
      "Use manufacturer instructions and qualified hands-on guidance before combining furniture with restraint.",
    ],
    never: [
      "Never use the face opening, legs, rails, or accessories as restraint or load points from this app.",
      "Never leave a restrained person alone or use a photograph as structural clearance.",
    ],
    studio: studioBoundary,
    ties: ["single-column", "futomomo", "karada"],
    minutes: [0, 0],
  },
  {
    slug: "sex-bench",
    name: "Sex bench",
    kind: "furniture",
    summary:
      "A bench may support an unrestrained body, but its shape and marketing do not establish restraint points, capacity, or a safe release path.",
    withRope: [
      "Treat rope and bench use as separate skills until a qualified instructor can evaluate the proposed combination.",
      "Keep controls, exits, communication, and rapid-release equipment directly accessible.",
      "Prefer the least restrictive setup that meets the negotiated goal.",
    ],
    never: [
      "Never attach cuffs or a person-bearing harness to unknown furniture from app instructions.",
      "Never combine furniture restraint with impact, a gag, or powered equipment without qualified in-person planning.",
    ],
    studio: studioBoundary,
    ties: ["single-column", "futomomo", "karada"],
    minutes: [0, 0],
  },
  {
    slug: "st-andrews-cross",
    name: "Saint Andrew's Cross",
    kind: "furniture",
    summary:
      "A cross can create an arms-up restraint and fall hazard. This app provides recognition, not attachment or impact instructions.",
    withRope: [
      "Learn attachment, monitoring, and release hands-on from a qualified, consent-centered instructor.",
      "Plan a verbal and nonverbal stop signal that remains usable in the proposed position.",
      "Stop and release for any symptom, distress, communication change, or uncertainty.",
    ],
    never: [
      "Never treat a cross or its hardware as a suspension point based on appearance or a label.",
      "Never leave a restrained person alone or use normal speech, movement, color, or a photo as clearance.",
    ],
    studio: studioBoundary,
    ties: ["single-column", "shinju"],
    minutes: [0, 0],
  },
  {
    slug: "sex-swing",
    name: "Sex swing",
    kind: "furniture",
    summary:
      "A swing is not a verified Shibari rig. Adding rope can create unclear load paths and make rapid release harder.",
    withRope: [
      "Keep swing operation and rope learning separate in app-guided practice.",
      "Use manufacturer guidance for the unmodified product and qualified hands-on instruction for any proposed combination.",
      "Treat every mount, connector, strap, and attachment as unverified by the camera.",
    ],
    never: [
      "Never attach rope, uplines, body harnesses, or extra loading to swing hardware from this app.",
      "Never infer installation quality, capacity, or a safe release path from a photo or product rating.",
    ],
    studio: studioBoundary,
    ties: ["single-column", "hip-harness", "karada"],
    minutes: [0, 0],
  },
  {
    slug: "pole",
    name: "Stripper pole",
    kind: "furniture",
    summary:
      "A dance pole is not a verified rope anchor, and combining attachment with spinning or impact is outside this app's coaching scope.",
    withRope: [
      "Use the pole and practice rope separately while app-guided.",
      "Inspect only the unoccupied base, labels, guards, and clear floor area in Studio.",
      "Route any attachment or person-bearing proposal to qualified in-person instruction and structural expertise.",
    ],
    never: [
      "Never attach a person to the pole or use it as an upline from app instructions.",
      "Never combine pole restraint with spinning, impact, or abandonment.",
    ],
    studio: studioBoundary,
    ties: ["single-column", "pole-cuffs", "tasuki"],
    minutes: [0, 0],
  },
  {
    slug: "floggers",
    name: "Floggers",
    kind: "impact",
    summary:
      "Combining impact with restraint changes mobility, communication, tissue, and fall risks. This app does not teach impact placement.",
    withRope: [
      "Negotiate impact and restraint as separate activities, each with specific limits and an immediate stop channel.",
      "Use qualified in-person education for impact technique and any combined scene.",
      "Stop and release for symptoms, distress, unusual silence, loss of response, or uncertainty.",
    ],
    never: [
      "Never use a body photograph or camera output to select an impact target or approve continuation.",
      "Never add impact when mobility, communication, or rapid release is compromised.",
    ],
    studio: "Do not upload body, impact, or injury images. An equipment-only view cannot validate a combined activity.",
    ties: ["single-column", "karada", "shinju"],
    minutes: [0, 0],
  },
  {
    slug: "hismith",
    name: "Hismith machine",
    kind: "machine",
    summary:
      "Powered equipment does not monitor consent or distress. Combining it with restraint can remove ordinary escape and control options.",
    withRope: [
      "Learn controls, guards, emergency stop, and ordinary operation while unrestrained.",
      "Keep app-guided rope practice separate from powered equipment.",
      "Use the least restrictive alternative and qualified in-person planning for any proposed combination.",
    ],
    never: [
      "Never use restraint to force position, depth, duration, or continued participation.",
      "Never combine powered equipment with impaired communication, abandonment, or inaccessible controls.",
    ],
    studio:
      "Keep the machine off and unoccupied. Studio may recognize broad equipment categories but cannot verify guards, controls, operation, placement, consent, or a combined scene.",
    ties: ["single-column", "futomomo", "karada"],
    minutes: [0, 0],
  },
  {
    slug: "bad-dragon",
    name: "Large fantasy toys",
    kind: "toy",
    summary:
      "Large or unfamiliar toys and restraint create combined friction, mobility, consent, and rapid-release risks. This app does not provide an intimate configuration.",
    withRope: [
      "Negotiate toy use separately from restraint, including barriers, hygiene, limits, stop channels, and withdrawal from either activity.",
      "Learn fit and use while unrestrained and able to move away independently.",
      "Use the least restrictive alternative and seek qualified in-person education for combined activities.",
    ],
    never: [
      "Never use restraint to force size, depth, endurance, or continued participation.",
      "Never upload intimate media or ask a camera to assess fit, pressure, consent, or injury.",
    ],
    studio: "Keep intimate media out of the app. Equipment recognition is not technique, consent, or medical assessment.",
    ties: ["single-column", "futomomo", "karada"],
    minutes: [0, 0],
  },
];

export const DUNGEON_SCENES = [
  {
    slug: "table-fold",
    name: "Table / bench: instructor route",
    piece: "massage-table",
    minutes: 0,
    steps: ["bench-drape", "frog-tie"],
    blurb: "Recognition and negotiation only. Do not construct a furniture-restraint combination from this app.",
  },
  {
    slug: "cross-short",
    name: "Cross: instructor route",
    piece: "st-andrews-cross",
    minutes: 0,
    steps: ["single-column", "shinju"],
    blurb: "Arms-up restraint and impact combinations require qualified hands-on instruction; a timer or image never clears them.",
  },
  {
    slug: "bench-machine",
    name: "Bench and machine: instructor route",
    piece: "hismith",
    minutes: 0,
    steps: ["single-column", "futomomo"],
    blurb: "Keep powered equipment and restraint separate in app-guided practice.",
  },
  {
    slug: "swing-support",
    name: "Swing and rope: instructor route",
    piece: "sex-swing",
    minutes: 0,
    steps: ["single-column", "hip-harness"],
    blurb: "Do not add rope attachment or loading to swing hardware from this app.",
  },
  {
    slug: "pole-dress",
    name: "Pole and rope: instructor route",
    piece: "pole",
    minutes: 0,
    steps: ["pole-cuffs", "shinju"],
    blurb: "Keep pole and rope practice separate until a qualified instructor evaluates the combination.",
  },
] as const;

export function getDungeon(slug: string) {
  return DUNGEON.find((d) => d.slug === slug);
}
