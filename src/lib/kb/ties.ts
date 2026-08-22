import type { Tie } from "./types";
import { MORE_TIES } from "./more-ties";

type PracticeInput = Pick<Tie, "slug" | "name" | "jp" | "summary" | "level" | "knots" | "nerves" | "intent"> & {
  purpose: string;
  bands?: number;
};

function unoccupiedPractice(input: PracticeInput): Tie {
  return {
    slug: input.slug,
    name: input.name,
    jp: input.jp,
    summary: input.summary,
    level: input.level,
    minutes: [3, 12],
    ropes: [{ lengthM: 8, count: 1 }],
    position: "theory",
    prereqs: [],
    knots: input.knots,
    nerves: input.nerves,
    intent: [...input.intent, "unoccupied-practice"],
    why: `${input.purpose} This drill is for an unoccupied prop or dress form and does not validate body placement, pressure, duration, loading, or release competence.`,
    stop: [
      "Stop before applying this app drill to a person",
      "Never add body loading, attachment, neck contact, or an intimate pass",
    ],
    steps: [
      {
        title: "Unoccupied handling drill",
        rigger:
          "Use a smooth, stable, unoccupied practice form. Rehearse identifying the rope path, dressing the pattern, finding both ends, and removing it promptly without any body or structural loading.",
        bottom:
          "No participant is placed in rope for this app drill. Body application requires separate, current adult consent and qualified hands-on instruction.",
        check:
          "The form is unoccupied, stable, easy to access from every side, and the rope can be removed immediately.",
        speak: "Unoccupied practice only. No person-bearing or body-placement instruction.",
        expected: {
          wrapBands: input.bands ?? 1,
          pose: "stand",
          view: "front",
          handsVisible: true,
          neckClear: true,
        },
        wraps: [],
      },
    ],
    mistakes: [
      {
        title: "Treating appearance as validation",
        body: "A tidy pattern, successful prop drill, photograph, or model response does not establish safe use on a person.",
      },
    ],
    aftercare: "No participant is restrained in this drill. Inspect and store the practice rope after use.",
    variations: [],
  };
}

type InstructorInput = Pick<Tie, "slug" | "name" | "jp" | "summary" | "nerves" | "intent"> & {
  risks: string;
  alternative: string;
};

function instructorRoute(input: InstructorInput): Tie {
  return {
    slug: input.slug,
    name: `${input.name}: Instructor Route`,
    jp: input.jp,
    summary: input.summary,
    level: "advanced",
    minutes: [0, 0],
    ropes: [],
    position: "theory",
    prereqs: [],
    knots: [],
    nerves: input.nerves,
    intent: [...input.intent, "instructor-only", "risk-awareness"],
    why: `${input.risks} This app cannot establish anatomy, fit, pressure, tolerance, consent, loading, or release competence.`,
    stop: [
      "Do not construct or modify this tie from app instructions",
      "Release for any symptom, distress, communication change, withdrawn consent, or uncertainty",
    ],
    steps: [
      {
        title: "Recognition, negotiation, and qualified instruction",
        rigger:
          "Use this entry to recognize the category and prepare questions. Learn construction, person-specific fit, monitoring, and rapid release hands-on from a qualified, consent-centered adult instructor.",
        bottom:
          "A role, prior scene, normal appearance, movement check, timer, or camera result never replaces current consent or your right to stop.",
        check: input.alternative,
        speak: "Instructor-only. This app does not coach, modify, or clear this restraint.",
        expected: {
          wrapBands: 0,
          pose: "stand",
          view: "front",
          handsVisible: true,
          neckClear: true,
        },
        wraps: [],
      },
    ],
    mistakes: [
      {
        title: "Remote clearance",
        body: "A photo, timer, symptom-free moment, or model response cannot validate construction, physiology, or safety.",
      },
    ],
    aftercare:
      "For an incident, stop and release. Call emergency services for emergency signs; seek prompt medical assessment for persistent or worsening symptoms. Do not re-tie to test recovery.",
    variations: [],
  };
}

const CORE_TIES: Tie[] = [
  unoccupiedPractice({
    slug: "single-column",
    name: "Single Column: Unoccupied Practice",
    jp: "一本縛り",
    summary:
      "Learn to recognize and dress a non-cinching single-column structure on a smooth prop. This app does not teach wrist, ankle, limb, attachment, or loaded use.",
    level: "foundation",
    knots: ["somerville-bowline"],
    nerves: ["ulnar", "radial"],
    intent: ["foundation", "craft"],
    purpose: "The drill builds rope-handling vocabulary and makes a cinching error easier to see on an object.",
  }),
  unoccupiedPractice({
    slug: "double-column",
    name: "Double Column: Unoccupied Practice",
    jp: "二本縛り",
    summary:
      "Recognize a two-column structure on paired props. This app does not teach binding limbs or using a gap, color, warmth, or movement as clearance.",
    level: "foundation",
    knots: ["wrap-cinch", "somerville-bowline"],
    nerves: ["ulnar", "radial"],
    intent: ["foundation", "craft"],
    purpose: "The drill shows how two columns and a cinch differ from a single constricting bundle.",
    bands: 2,
  }),
  unoccupiedPractice({
    slug: "larks-head-cuff",
    name: "Lark's Head: Object-Only",
    jp: "雲雀結び",
    summary:
      "A fast hitch that cinches. Practice it on an object only; this app excludes it from body cuffs, neck contact, and person-bearing use.",
    level: "foundation",
    knots: ["larks-head"],
    nerves: [],
    intent: ["foundation", "object-only"],
    purpose: "The drill teaches recognition of a hitch whose constricting behavior matters.",
  }),
  instructorRoute({
    slug: "futomomo",
    name: "Futomomo",
    jp: "太腿",
    summary:
      "A folded-leg restraint category with joint, nerve, circulation, mobility, and rapid-release risks. This app provides recognition, not placement instructions.",
    nerves: ["peroneal", "saphenous"],
    intent: ["legs", "floor"],
    risks: "A folded limb can develop concerning symptoms and may be difficult to release quickly.",
    alternative: "Practice the rope pattern on an unoccupied bolster or choose an unrestrained, self-selected position.",
  }),
  unoccupiedPractice({
    slug: "karada",
    name: "Karada Pattern: Unoccupied Practice",
    jp: "体",
    summary:
      "A diamond-pattern vocabulary drill for an unoccupied dress form. This app excludes neck contact, intimate passes, restraint, and loaded use.",
    level: "foundation",
    knots: ["larks-head", "reverse-tension", "square"],
    nerves: [],
    intent: ["decorative", "craft"],
    purpose: "The drill develops even patterning and reversible rope handling without placing rope on a person.",
    bands: 3,
  }),
  instructorRoute({
    slug: "shinju",
    name: "Shinju",
    jp: "真珠",
    summary:
      "A chest-harness category with breathing, nerve, migration, tissue, and release risks. This app provides recognition only.",
    nerves: ["brachial"],
    intent: ["chest", "harness"],
    risks: "Torso bands can change breathing and migrate without a reliable visual or finger-width warning.",
    alternative: "Rehearse broad pattern recognition on an unoccupied dress form; keep all neck and body application out of the drill.",
  }),
  instructorRoute({
    slug: "takate-kote",
    name: "Takate-kote",
    jp: "高手小手",
    summary:
      "A behind-the-back box-tie category with significant nerve, shoulder, breathing, panic, and release risks. This app does not teach or assess it.",
    nerves: ["radial", "ulnar", "median"],
    intent: ["box-tie", "high-consequence"],
    risks: "Upper-body restraint can cause serious injury without an obvious visual warning and requires person-specific hands-on teaching.",
    alternative: "Use an unoccupied rope-handling drill and ask an instructor to teach risk recognition and emergency release in person.",
  }),
  unoccupiedPractice({
    slug: "tasuki",
    name: "Tasuki Pattern: Unoccupied Practice",
    jp: "襷",
    summary:
      "A diagonal decorative pattern demonstrated only on an unoccupied dress form. This app does not teach shoulder, chest, armpit, or neck placement.",
    level: "building",
    knots: ["reverse-tension"],
    nerves: [],
    intent: ["decorative", "craft"],
    purpose: "The drill develops diagonal pattern recognition while keeping body placement out of scope.",
    bands: 2,
  }),
  instructorRoute({
    slug: "hip-harness",
    name: "Hip Harness",
    jp: "腰縄",
    summary:
      "A pelvis-harness category that is sometimes adapted for loading. This app does not teach body placement or person-bearing use.",
    nerves: ["femoral", "lateral-femoral-cutaneous"],
    intent: ["hips", "harness"],
    risks: "A ground-level appearance does not establish that a harness is suitable for pressure, attachment, or loading.",
    alternative: "Practice a decorative band on an unoccupied form with no attachment, tension multiplication, or loading.",
  }),
  instructorRoute({
    slug: "tengu",
    name: "Tengu",
    jp: "天狗",
    summary:
      "A folded-arm restraint category with shoulder, nerve, breathing, circulation, and rapid-release risks. This app provides recognition only.",
    nerves: ["radial", "brachial"],
    intent: ["arms", "shape"],
    risks: "A briefly tolerable unrestrained pose does not clear the restrained form.",
    alternative: "Choose a neutral, unrestrained pose or an unoccupied pattern drill.",
  }),
  instructorRoute({
    slug: "ebi",
    name: "Ebi",
    jp: "海老",
    summary:
      "A compact historical restraint-position category with breathing, mobility, panic, joint, nerve, and release risks. This app identifies the term only.",
    nerves: ["peroneal", "radial"],
    intent: ["compact", "historical"],
    risks: "Compact positions can compromise several systems without a single reliable visible warning.",
    alternative: "Choose a neutral, unrestrained, ground-level rehearsal and discuss the history without reconstructing the position.",
  }),
  instructorRoute({
    slug: "chair",
    name: "Chair Tie",
    jp: "椅子",
    summary:
      "A furniture-restraint category with structural, fall, breathing, circulation, migration, abandonment, and release risks. This app does not teach attachment.",
    nerves: ["peroneal", "ulnar"],
    intent: ["furniture", "restraint"],
    risks: "Household chairs are not verified restraint systems and a seated person may slide or become unable to reposition.",
    alternative: "Keep the chair unoccupied and identify exits, instability, pinch points, and release-tool access.",
  }),
  unoccupiedPractice({
    slug: "hishi",
    name: "Hishi Pattern: Unoccupied Practice",
    jp: "菱",
    summary:
      "Diamond patterning as an unoccupied craft drill. Similar-looking diamonds do not establish even pressure or safe body fit.",
    level: "building",
    knots: ["reverse-tension", "square"],
    nerves: [],
    intent: ["decorative", "craft"],
    purpose: "The drill builds visual spacing and reversible handling on a dress form.",
    bands: 5,
  }),
  unoccupiedPractice({
    slug: "kikkou",
    name: "Kikkou Pattern: Unoccupied Practice",
    jp: "亀甲",
    summary:
      "Hexagonal patterning as an unoccupied craft drill. This app does not teach body wear, restraint, neck contact, or loading.",
    level: "building",
    knots: ["reverse-tension"],
    nerves: [],
    intent: ["decorative", "craft"],
    purpose: "The drill develops patient, reversible pattern construction on a stable prop.",
    bands: 6,
  }),
  instructorRoute({
    slug: "matanawa",
    name: "Matanawa",
    jp: "股縄",
    summary:
      "An intimate-rope category with consent, pressure, friction, swelling, nerve, skin, migration, and release risks. This app provides negotiation vocabulary only.",
    nerves: ["pudendal"],
    intent: ["intimate", "consent"],
    risks: "Intimate restraint requires explicit act-specific consent and cannot be assessed from a photo or generic placement rule.",
    alternative: "Discuss boundaries, hygiene, recording, stop signals, and a no-rope alternative while everyone is unrestrained.",
  }),
  instructorRoute({
    slug: "agura",
    name: "Agura",
    jp: "胡座",
    summary:
      "A compact seated restraint category with joint, nerve, circulation, mobility, panic, and release risks. This app identifies the term only.",
    nerves: ["peroneal"],
    intent: ["compact", "floor"],
    risks: "Being able to sit in a pose unrestrained does not clear a restrained version or establish a safe duration.",
    alternative: "Use a self-selected, unrestrained seated position or an unoccupied prop drill.",
  }),
  instructorRoute({
    slug: "gyaku-ebi",
    name: "Gyaku-ebi",
    jp: "逆海老",
    summary:
      "An extreme backbend restraint-position category with spinal, breathing, joint, panic, and release risks. This app identifies the term only.",
    nerves: ["radial"],
    intent: ["extreme-position", "historical"],
    risks: "Flexibility, a still image, or prior experience cannot establish tolerance or release readiness.",
    alternative: "Discuss history and risk recognition without reconstructing the position.",
  }),
  instructorRoute({
    slug: "partial-suspension",
    name: "Partial Suspension",
    jp: "部分吊り",
    summary:
      "Partial load bearing is a high-consequence activity. This app does not teach anchors, harnesses, uplines, lowering systems, placement, loading, or emergency release under load.",
    nerves: ["radial", "peroneal", "femoral"],
    intent: ["load-bearing", "high-consequence"],
    risks: "A remote tutorial or image cannot establish the complete load path, capacity, positioning, communication, or emergency competence.",
    alternative: "Keep rehearsal clothed, ground-level, unoccupied, and non-loaded; use a qualified in-person instructor for all person-bearing work.",
  }),
];

export const TIES: Tie[] = [...CORE_TIES, ...MORE_TIES];

export function getTie(slug: string) {
  if (!slug) return undefined;
  return TIES.find((t) => t.slug === slug);
}

export function tiesByLevel(level: Tie["level"]) {
  return TIES.filter((t) => t.level === level);
}
