import type { Article } from "./types";

export const MORE_ARTICLES: Article[] = [
  {
    slug: "check-in-script",
    title: "The Check-in Script",
    section: "protocol",
    minutes: 5,
    summary: "Ask directly about sensation, movement, pain, swelling, temperature, breathing, speech, and alertness. A check can reveal concern, never prove safety.",
    related: ["circulation", "safewords", "nerve-atlas"],
    blocks: [
      { type: "h", text: "Direct questions; no automatic clearance" },
      {
        type: "ul",
        items: [
          "Has sensation, movement, strength, pain, swelling, or temperature changed from baseline or the other side?",
          "Is breathing, speech, or alertness different or difficult?",
          "Is anything persistent, worsening, unfamiliar, or hard to describe?",
          "Do you want an immediate release or stop? No explanation is required.",
          "After release, does any weakness, numbness, severe pain, swelling, or temperature change persist?",
        ],
      },
      {
        type: "p",
        text: "Release for any concern or uncertainty. Call emergency services for unresponsiveness, abnormal breathing, severe confusion, collapse, or another emergency sign. Persistent or worsening neurologic or vascular symptoms need prompt medical assessment; this app cannot diagnose their cause.",
      },
      {
        type: "callout",
        title: "Studio",
        text: "Studio reminders do not monitor a person and never authorize continuation. Use the Check-in page to record explicit direct answers in session memory.",
      },
    ],
  },
  {
    slug: "yellow-vs-red",
    title: "Yellow Is Information",
    section: "consent",
    minutes: 4,
    summary: "Red stops the night. Yellow changes the night. Treating yellow like a nuisance is how people stop saying it.",
    related: ["safewords", "check-in-script", "rigger-mindset"],
    blocks: [
      {
        type: "p",
        text: "When anyone says yellow, stop adding and check directly. Do not bargain or finish another pass before responding.",
      },
      {
        type: "p",
        text: "When anyone says red, stop the activity and release as safely and quickly as the situation permits. Prevent a fall, use release tools only within your training, and follow emergency-dispatcher instructions when needed; there is no universal cutting order.",
      },
      {
        type: "warn",
        text: "Ignoring yellow teaches people that their boundary will be negotiated. Silence, a timer, or a camera result is never consent or a continuation signal.",
      },
    ],
  },
  {
    slug: "photo-for-coaching",
    title: "Privacy-Minimized Camera Input",
    section: "craft",
    minutes: 5,
    summary: "Prefer equipment-only or clothed, non-identifying media. A still can support broad observation, never physiology, technique validation, or clearance.",
    related: ["photography-ethics", "circulation"],
    blocks: [
      { type: "h", text: "Use the least sensitive useful view" },
      {
        type: "ul",
        items: [
          "Start with unoccupied equipment or rope laid on a surface.",
          "If a person must appear, keep the view clothed, non-explicit, and non-identifying.",
          "Include enough ordinary context to avoid treating crop or overlap as contact or load.",
          "Use neutral light; do not ask a camera to judge skin color or circulation.",
          "For video, choose one to three labeled stills yourself; the clip is not uploaded.",
        ],
      },
      {
        type: "p",
        text: "Do not move closer if that would expose a face, intimate area, tattoo, screen, mail, or another identifier. An insufficient view is the correct result when a less-sensitive image cannot support a broad category.",
      },
      {
        type: "callout",
        title: "If xAI declines or the view is insufficient",
        text: "Do not chase a more intimate image and do not treat local color/edge hints as validation. Use direct communication, lower-consequence unrestrained learning, or a qualified in-person instructor.",
      },
    ],
  },
  {
    slug: "rope-burns-hair",
    title: "Burns, Hair, and Skin",
    section: "body",
    minutes: 4,
    summary: "Friction, trapped hair, or broken skin requires a prompt response; an image cannot grade the injury.",
    related: ["aftercare", "marks-vs-injury", "gear-care"],
    blocks: [
      {
        type: "p",
        text: "Stop if hair or skin is trapped. Release without pulling on the trapped area, using the rehearsed rapid-release method within your training. Seek medical care for significant bleeding, severe pain, a large wound, or uncertainty.",
      },
      {
        type: "p",
        text: "Do not diagnose a mark from this app. Broken skin, blistering, severe or worsening pain, swelling, numbness, weakness, or a marked color or temperature change requires stopping; persistent or worsening symptoms need prompt medical assessment.",
      },
      {
        type: "warn",
        text: "Broken skin under a wrap is a stop for that limb. Rope is not a bandage.",
      },
    ],
  },
  {
    slug: "pole-and-rope",
    title: "The Pole Is Scenery",
    section: "scene",
    minutes: 5,
    summary: "A dance pole is scenery and exercise equipment, not a verified rope anchor or person-bearing system.",
    related: ["furniture-not-hardpoints", "pole-cuffs"],
    blocks: [
      {
        type: "p",
        text: "Do not attach a person to a pole from app instructions or combine pole restraint with impact or spinning. A base, label, household test, or photograph cannot establish installation, capacity, condition, or a safe release path.",
      },
      {
        type: "ul",
        items: [
          "Use Studio only for an unoccupied view of labels, guards, base condition, and clear access around the equipment.",
          "Keep app-guided rope practice separate, ground-level, and non-loaded.",
          "Route any attachment, impact combination, or person-bearing question to qualified in-person instruction.",
          "Never use an image or equipment label as clearance to load the installation.",
        ],
      },
    ],
  },
  {
    slug: "swing-and-rope",
    title: "Keep Swing and Rope Systems Separate",
    section: "scene",
    minutes: 5,
    summary: "A sex swing is not a verified Shibari rig, and shared hardware can make release and load paths harder to understand.",
    related: ["furniture-not-hardpoints", "hip-harness"],
    blocks: [
      {
        type: "p",
        text: "Do not attach restraint rope to swing hardware or add body ties from app instructions. A photograph cannot verify the mount, straps, connectors, capacity, loading, or emergency release. Keep app learning unoccupied or ground-level and non-loaded.",
      },
      {
        type: "warn",
        text: "Use qualified in-person instruction and manufacturer guidance before any person-bearing combination. Consent does not establish structural safety, and a product rating does not validate a modified system.",
      },
    ],
  },
  {
    slug: "temperature-and-drop",
    title: "Cold Hands, Late Drop",
    section: "aftercare",
    minutes: 5,
    summary: "Coldness, unusual quiet, or delayed distress can have many causes and should not be diagnosed as routine after-effects.",
    related: ["drop", "aftercare", "circulation"],
    blocks: [
      {
        type: "p",
        text: "Plan a comfortable environment and ask before offering warmth, water, food, touch, or company. A marked temperature change in a restrained limb is an immediate-release signal; persistent or worsening symptoms need prompt medical assessment.",
      },
      {
        type: "p",
        text: "Irritability, unusual quiet, coldness, confusion, or distress after a scene is not automatically 'drop.' Check directly, respect requests for space or support, and seek urgent help for abnormal breathing, unresponsiveness, severe confusion, collapse, or other emergency signs.",
      },
    ],
  },
  {
    slug: "rigger-hands",
    title: "Your Hands Are in This Too",
    section: "craft",
    minutes: 4,
    summary: "Tendonitis, dry jute cuts, and pride. A rigger who cannot close a fist should not be tying a TK.",
    related: ["rigger-mindset", "warmup-stretch", "gear-care"],
    blocks: [
      {
        type: "p",
        text: "Warm up within your ordinary range and maintain your hands and nails. If a pass is fighting you, stop rather than pulling harder or using another person's body as leverage.",
      },
      {
        type: "p",
        text: "You will also drop. Aftercare is not only for the person who was tied. Eat. Sit. Do not drive on adrenaline and a scene that went red.",
      },
    ],
  },
];
