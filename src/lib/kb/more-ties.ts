import type { Tie } from "./types";
import { instructorRoute } from "./tie-factories";

export const MORE_TIES: Tie[] = [
  instructorRoute({
    slug: "frog-tie",
    name: "Frog Tie",
    jp: "開脚",
    summary:
      "A folded-leg restraint category with joint, nerve, circulation, mobility, and rapid-release risks. This app provides recognition, not construction or placement instructions.",
    nerves: ["peroneal", "femoral"],
    intent: ["legs", "floor"],
    risks: "Folding and restraining both legs can limit independent repositioning and make symptoms harder to respond to.",
    alternative: "Practice rope handling on an unoccupied form or choose an unrestrained, self-selected position.",
  }),
  instructorRoute({
    slug: "mermaid",
    name: "Mermaid",
    jp: "人魚",
    summary:
      "A legs-together restraint category that can limit movement and concentrate pressure. This app provides recognition only.",
    nerves: ["peroneal"],
    intent: ["legs", "decorative"],
    risks: "Multiple bands across two legs can complicate monitoring and rapid release.",
    alternative: "Rehearse the visual pattern on an unoccupied bolster without tightening or body loading.",
  }),
  instructorRoute({
    slug: "starfish",
    name: "Starfish",
    jp: "星",
    summary:
      "A multi-point furniture-restraint category with fall, joint, circulation, abandonment, and release-path risks. This app does not teach attachment.",
    nerves: ["ulnar", "radial", "peroneal"],
    intent: ["furniture", "restraint"],
    risks: "Independent attachment of several limbs can remove ordinary movement and create several failure points.",
    alternative: "Keep the furniture unoccupied and practice identifying exits, controls, and release-tool access.",
  }),
  instructorRoute({
    slug: "hogtie-floor",
    name: "Floor Hogtie",
    jp: "後手海老",
    summary:
      "A compact restraint-position category associated with breathing, joint, nerve, panic, mobility, and release risk. This app identifies the term but does not teach or assess it.",
    nerves: ["radial", "peroneal"],
    intent: ["compact", "restraint"],
    risks: "Compact positions can compromise movement, communication, breathing, and rapid release without any single visible warning.",
    alternative: "Choose a neutral, unrestrained, ground-level rehearsal and discuss risk recognition with an instructor.",
  }),
  instructorRoute({
    slug: "tesuji",
    name: "Tesuji",
    jp: "手筋",
    summary:
      "A folded-arm restraint category with joint, nerve, circulation, and release risks. Anatomical landmarks in an app are not placement instructions.",
    nerves: ["radial", "ulnar"],
    intent: ["arms", "compact"],
    risks: "A folded arm can develop concerning symptoms even when appearance and simple movement checks seem normal.",
    alternative: "Use an unoccupied padded form to discuss the category; keep people unrestrained until hands-on instruction.",
  }),
  instructorRoute({
    slug: "bunny",
    name: "Bunny Tie",
    jp: "兎",
    summary:
      "A hands-high restraint category with shoulder, nerve, circulation, neck-migration, and release risks. This app provides recognition only.",
    nerves: ["radial", "brachial"],
    intent: ["shape", "shoulders"],
    risks: "Hands-high positions can change risk quickly and a brief unrestrained pose does not clear a restrained version.",
    alternative: "Create decorative loops on an unoccupied prop, with no body or neck application.",
  }),
  instructorRoute({
    slug: "pole-cuffs",
    name: "Pole Cuffs",
    jp: "ポール",
    summary:
      "A pole-attachment category with structural, fall, shoulder, circulation, and abandonment risks. This app does not teach attachment.",
    nerves: ["ulnar", "radial"],
    intent: ["pole", "restraint"],
    risks: "A dance pole and its installation are not verified rope anchors, even if feet are intended to remain on the floor.",
    alternative: "Keep pole use and rope practice separate; inspect unoccupied labels and clear floor space only.",
  }),
  instructorRoute({
    slug: "bench-drape",
    name: "Bench Drape",
    jp: "ベンチ",
    summary:
      "A furniture-restraint category that may involve prone positioning or powered equipment. This app does not provide a body configuration.",
    nerves: ["ulnar", "peroneal", "femoral"],
    intent: ["bench", "machine"],
    risks: "Furniture restraint can combine fall, breathing, mobility, pressure, machine-control, and rapid-release hazards.",
    alternative: "Keep equipment off and unoccupied; identify controls, guards, exits, and release access without attaching anyone.",
  }),
];
