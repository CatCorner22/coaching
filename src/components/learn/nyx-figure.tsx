import type { NyxNudePose } from "@/lib/learn/nyx-nudes";
import { cn } from "@/lib/utils";

const SKIN = "#c4a07a";
const SKIN_SHADOW = "#a98462";
const SKIN_DEEP = "#8f6b4e";
const AREOLA = "#b07a68";
const HAIR = "#1a1210";
const LIP = "#5a2430";
const INK = "#2a221c";
const EYE = "#1c1410";

type NyxFigureProps = {
  pose: NyxNudePose;
  className?: string;
};

/**
 * Illustrated adult nude of Nyx — life-drawing, not a stick figure.
 * Used when photoreal nudes cannot be generated. Unambiguously adult.
 */
export function NyxFigure({ pose, className }: NyxFigureProps) {
  return (
    <svg
      viewBox="0 0 240 480"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label={`Nyx nude study — ${pose}`}
    >
      <rect width="240" height="480" fill="#14110f" />
      <g transform="translate(0 8)">
        {pose === "standFront" && <StandFront />}
        {pose === "standSide" && <StandSide />}
        {pose === "standBack" && <StandBack />}
        {pose === "seated" && <Seated />}
        {pose === "kneeling" && <Kneeling />}
        {pose === "floor" && <Floor />}
        {pose === "armsUp" && <ArmsUp />}
        {pose === "wristOffer" && <WristOffer />}
        {pose === "hipTurn" && <HipTurn />}
        {pose === "walk" && <Walk />}
        {pose === "torsoStudy" && <TorsoStudy />}
        {pose === "hipStudy" && <HipStudy />}
        {pose === "recline" && <Recline />}
        {pose === "kneelSide" && <KneelSide />}
      </g>
    </svg>
  );
}

function Face({ cx, cy, scale = 1, profile = false }: { cx: number; cy: number; scale?: number; profile?: boolean }) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale})`}>
      <ellipse cx="0" cy="0" rx="22" ry="26" fill={SKIN} />
      <ellipse cx="0" cy="4" rx="18" ry="20" fill={SKIN_SHADOW} opacity="0.25" />
      {profile ? (
        <>
          <path d="M8 -6 C16 -2, 16 8, 8 12" fill="none" stroke={SKIN_DEEP} strokeWidth="1.4" />
          <circle cx="6" cy="-2" r="1.6" fill={EYE} />
          <path d="M10 10 C6 14, 0 14, -4 11" fill={LIP} />
        </>
      ) : (
        <>
          <circle cx="-7" cy="-2" r="1.8" fill={EYE} />
          <circle cx="7" cy="-2" r="1.8" fill={EYE} />
          <path d="M-6 12 C-2 16, 2 16, 6 12" fill={LIP} />
        </>
      )}
    </g>
  );
}

function HairDown({ cx, cy, scale = 1 }: { cx: number; cy: number; scale?: number }) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale})`} fill={HAIR}>
      <ellipse cx="0" cy="-8" rx="26" ry="18" />
      <rect x="-28" y="-6" width="56" height="10" />
      <path d="M-26 2 C-30 70, -18 110, -10 118 L-6 20 Z" />
      <path d="M26 2 C30 70, 18 110, 10 118 L6 20 Z" />
    </g>
  );
}

function Breast({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx="16" ry="14" fill={SKIN} />
      <ellipse cx={cx} cy={cy + 2} rx="16" ry="13" fill={SKIN_SHADOW} opacity="0.35" />
      <circle cx={cx} cy={cy + 3} r="4.2" fill={AREOLA} />
      <circle cx={cx} cy={cy + 3} r="1.6" fill={SKIN_DEEP} />
    </g>
  );
}

function Pubic({ cx, cy }: { cx: number; cy: number }) {
  return <ellipse cx={cx} cy={cy} rx="10" ry="7" fill={HAIR} opacity="0.55" />;
}

function MothTattoo({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`} fill={INK} opacity="0.55">
      <ellipse cx="0" cy="0" rx="3" ry="5" />
      <path d="M-3 0 C-16 -8, -18 8, -4 6 Z" />
      <path d="M3 0 C16 -8, 18 8, 4 6 Z" />
    </g>
  );
}

function RopeCoil({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`} fill="none" stroke="#b9a898" strokeWidth="3.2">
      <ellipse cx="0" cy="0" rx="16" ry="10" />
      <ellipse cx="0" cy="3" rx="14" ry="8" />
      <ellipse cx="0" cy="6" rx="12" ry="6" />
    </g>
  );
}

function StandFront() {
  return (
    <g>
      <HairDown cx={120} cy={58} />
      <ellipse cx="120" cy="150" rx="38" ry="52" fill={SKIN} />
      <path d="M88 118 C70 170, 68 210, 78 248" stroke={SKIN} strokeWidth="16" fill="none" strokeLinecap="round" />
      <path d="M152 118 C170 170, 172 210, 162 248" stroke={SKIN} strokeWidth="16" fill="none" strokeLinecap="round" />
      <ellipse cx="104" cy="340" rx="13" ry="70" fill={SKIN} />
      <ellipse cx="136" cy="340" rx="13" ry="70" fill={SKIN} />
      <ellipse cx="120" cy="248" rx="34" ry="28" fill={SKIN} />
      <Breast cx={104} cy={148} />
      <Breast cx={136} cy={148} />
      <MothTattoo cx={120} cy={128} />
      <Pubic cx={120} cy={262} />
      <Face cx={120} cy={58} />
      <RopeCoil cx={78} cy={248} />
    </g>
  );
}

function StandSide() {
  return (
    <g>
      <HairDown cx={118} cy={58} />
      <ellipse cx="128" cy="150" rx="22" ry="52" fill={SKIN} />
      <ellipse cx="138" cy="148" rx="16" ry="14" fill={SKIN} />
      <circle cx="146" cy="150" r="4" fill={AREOLA} />
      <path d="M120 118 C100 160, 90 210, 96 250" stroke={SKIN} strokeWidth="15" fill="none" strokeLinecap="round" />
      <ellipse cx="124" cy="248" rx="22" ry="26" fill={SKIN} />
      <ellipse cx="122" cy="340" rx="13" ry="70" fill={SKIN} />
      <ellipse cx="136" cy="340" rx="11" ry="68" fill={SKIN_SHADOW} />
      <Face cx={122} cy={58} profile />
      <RopeCoil cx={96} cy={250} />
    </g>
  );
}

function StandBack() {
  return (
    <g>
      <HairDown cx={120} cy={58} />
      <ellipse cx="120" cy="150" rx="36" ry="52" fill={SKIN} />
      <path d="M88 118 C70 170, 68 210, 78 248" stroke={SKIN} strokeWidth="16" fill="none" strokeLinecap="round" />
      <path d="M152 118 C170 170, 172 210, 162 248" stroke={SKIN} strokeWidth="16" fill="none" strokeLinecap="round" />
      <ellipse cx="104" cy="340" rx="13" ry="70" fill={SKIN} />
      <ellipse cx="136" cy="340" rx="13" ry="70" fill={SKIN} />
      <ellipse cx="120" cy="248" rx="32" ry="26" fill={SKIN} />
      <path d="M120 96 L120 230" stroke={SKIN_DEEP} strokeWidth="2" opacity="0.45" />
      <ellipse cx="104" cy="140" rx="8" ry="14" fill={SKIN_SHADOW} opacity="0.4" />
      <ellipse cx="136" cy="140" rx="8" ry="14" fill={SKIN_SHADOW} opacity="0.4" />
      <Face cx={120} cy={58} />
    </g>
  );
}

function Seated() {
  return (
    <g>
      <HairDown cx={120} cy={78} />
      <ellipse cx="120" cy="168" rx="36" ry="46" fill={SKIN} />
      <Breast cx={104} cy={166} />
      <Breast cx={136} cy={166} />
      <MothTattoo cx={120} cy={148} />
      <ellipse cx="120" cy="248" rx="40" ry="24" fill={SKIN} />
      <Pubic cx={120} cy={258} />
      <path d="M90 250 C60 270, 48 300, 54 330" stroke={SKIN} strokeWidth="18" fill="none" strokeLinecap="round" />
      <path d="M150 250 C180 270, 192 300, 186 330" stroke={SKIN} strokeWidth="18" fill="none" strokeLinecap="round" />
      <ellipse cx="50" cy="338" rx="22" ry="10" fill={SKIN} />
      <ellipse cx="190" cy="338" rx="22" ry="10" fill={SKIN} />
      <path d="M86 150 C60 190, 54 220, 58 248" stroke={SKIN} strokeWidth="14" fill="none" strokeLinecap="round" />
      <path d="M154 150 C180 190, 186 220, 182 248" stroke={SKIN} strokeWidth="14" fill="none" strokeLinecap="round" />
      <Face cx={120} cy={78} />
      <RopeCoil cx={120} cy={300} />
    </g>
  );
}

function Kneeling() {
  return (
    <g>
      <HairDown cx={120} cy={90} />
      <ellipse cx="120" cy="178" rx="34" ry="44" fill={SKIN} />
      <Breast cx={104} cy={176} />
      <Breast cx={136} cy={176} />
      <MothTattoo cx={120} cy={158} />
      <ellipse cx="120" cy="248" rx="32" ry="20" fill={SKIN} />
      <Pubic cx={120} cy={256} />
      <path d="M96 248 C80 300, 70 340, 78 370" stroke={SKIN} strokeWidth="18" fill="none" strokeLinecap="round" />
      <path d="M144 248 C160 300, 170 340, 162 370" stroke={SKIN} strokeWidth="18" fill="none" strokeLinecap="round" />
      <ellipse cx="78" cy="382" rx="16" ry="8" fill={SKIN} />
      <ellipse cx="162" cy="382" rx="16" ry="8" fill={SKIN} />
      <Face cx={120} cy={90} />
      <RopeCoil cx={58} cy={248} />
    </g>
  );
}

function Floor() {
  return (
    <g transform="translate(0 40)">
      <ellipse cx="70" cy="210" rx="24" ry="20" fill={SKIN} />
      <Face cx={70} cy={210} scale={0.85} />
      <HairDown cx={70} cy={210} scale={0.7} />
      <ellipse cx="140" cy="220" rx="56" ry="22" fill={SKIN} />
      <ellipse cx="128" cy="206" rx="14" ry="11" fill={SKIN} />
      <circle cx="132" cy="206" r="3.4" fill={AREOLA} />
      <ellipse cx="200" cy="228" rx="30" ry="18" fill={SKIN} />
      <path d="M220 228 C250 210, 270 190, 280 170" stroke={SKIN} strokeWidth="14" fill="none" strokeLinecap="round" />
      <path d="M220 236 C248 250, 268 270, 274 290" stroke={SKIN} strokeWidth="14" fill="none" strokeLinecap="round" />
      <RopeCoil cx={200} cy={200} />
    </g>
  );
}

function ArmsUp() {
  return (
    <g>
      <HairDown cx={120} cy={70} />
      <ellipse cx="120" cy="168" rx="36" ry="50" fill={SKIN} />
      <path d="M90 120 C60 70, 48 40, 52 18" stroke={SKIN} strokeWidth="15" fill="none" strokeLinecap="round" />
      <path d="M150 120 C180 70, 192 40, 188 18" stroke={SKIN} strokeWidth="15" fill="none" strokeLinecap="round" />
      <ellipse cx="50" cy="14" rx="10" ry="8" fill={SKIN} />
      <ellipse cx="190" cy="14" rx="10" ry="8" fill={SKIN} />
      <Breast cx={104} cy={160} />
      <Breast cx={136} cy={160} />
      <MothTattoo cx={120} cy={140} />
      <ellipse cx="120" cy="250" rx="32" ry="26" fill={SKIN} />
      <Pubic cx={120} cy={264} />
      <ellipse cx="104" cy="350" rx="13" ry="68" fill={SKIN} />
      <ellipse cx="136" cy="350" rx="13" ry="68" fill={SKIN} />
      <Face cx={120} cy={70} />
    </g>
  );
}

function WristOffer() {
  return (
    <g>
      <HairDown cx={108} cy={58} />
      <ellipse cx="108" cy="150" rx="34" ry="50" fill={SKIN} />
      <Breast cx={94} cy={148} />
      <Breast cx={124} cy={148} />
      <MothTattoo cx={108} cy={128} />
      <path d="M80 120 C50 150, 30 190, 28 230" stroke={SKIN} strokeWidth="15" fill="none" strokeLinecap="round" />
      <path d="M136 118 C170 140, 200 150, 214 148" stroke={SKIN} strokeWidth="15" fill="none" strokeLinecap="round" />
      <ellipse cx="226" cy="148" rx="12" ry="9" fill={SKIN} />
      <ellipse cx="226" cy="148" rx="16" ry="8" fill="none" stroke="#b9a898" strokeWidth="3" />
      <ellipse cx="226" cy="148" rx="20" ry="10" fill="none" stroke="#b9a898" strokeWidth="2.4" />
      <ellipse cx="108" cy="248" rx="30" ry="24" fill={SKIN} />
      <Pubic cx={108} cy={260} />
      <ellipse cx="94" cy="340" rx="13" ry="68" fill={SKIN} />
      <ellipse cx="124" cy="340" rx="13" ry="68" fill={SKIN} />
      <Face cx={108} cy={58} />
    </g>
  );
}

function HipTurn() {
  return (
    <g>
      <HairDown cx={128} cy={58} />
      <ellipse cx="132" cy="150" rx="30" ry="50" fill={SKIN} />
      <ellipse cx="148" cy="148" rx="15" ry="13" fill={SKIN} />
      <circle cx="154" cy="150" r="3.8" fill={AREOLA} />
      <ellipse cx="140" cy="250" rx="36" ry="26" fill={SKIN} />
      <Pubic cx={136} cy={262} />
      <ellipse cx="124" cy="346" rx="13" ry="66" fill={SKIN} />
      <ellipse cx="150" cy="344" rx="12" ry="64" fill={SKIN} />
      <path d="M112 120 C90 170, 84 210, 90 248" stroke={SKIN} strokeWidth="14" fill="none" strokeLinecap="round" />
      <Face cx={128} cy={58} profile />
    </g>
  );
}

function Walk() {
  return (
    <g>
      <HairDown cx={120} cy={58} />
      <ellipse cx="120" cy="150" rx="34" ry="50" fill={SKIN} />
      <Breast cx={106} cy={148} />
      <Breast cx={136} cy={148} />
      <MothTattoo cx={120} cy={128} />
      <ellipse cx="120" cy="248" rx="30" ry="24" fill={SKIN} />
      <Pubic cx={120} cy={260} />
      <ellipse cx="96" cy="336" rx="12" ry="70" fill={SKIN} transform="rotate(-8 96 336)" />
      <ellipse cx="144" cy="340" rx="12" ry="70" fill={SKIN} transform="rotate(10 144 340)" />
      <path d="M90 120 C70 160, 64 200, 70 236" stroke={SKIN} strokeWidth="14" fill="none" strokeLinecap="round" />
      <path d="M150 120 C168 150, 174 190, 168 230" stroke={SKIN} strokeWidth="14" fill="none" strokeLinecap="round" />
      <Face cx={120} cy={58} />
      <RopeCoil cx={70} cy={236} />
    </g>
  );
}

function TorsoStudy() {
  return (
    <g transform="translate(0 40) scale(1.25)">
      <HairDown cx={96} cy={40} scale={0.85} />
      <ellipse cx="96" cy="130" rx="42" ry="48" fill={SKIN} />
      <Breast cx={78} cy={128} />
      <Breast cx={114} cy={128} />
      <MothTattoo cx={96} cy={108} />
      <ellipse cx="96" cy="198" rx="36" ry="22" fill={SKIN} />
      <Face cx={96} cy={40} scale={0.9} />
    </g>
  );
}

function HipStudy() {
  return (
    <g transform="translate(0 80)">
      <ellipse cx="120" cy="80" rx="40" ry="30" fill={SKIN} />
      <ellipse cx="120" cy="130" rx="48" ry="36" fill={SKIN} />
      <Pubic cx={120} cy={142} />
      <ellipse cx="98" cy="230" rx="16" ry="80" fill={SKIN} />
      <ellipse cx="142" cy="230" rx="16" ry="80" fill={SKIN} />
      <path d="M80 70 C60 90, 54 120, 58 150" stroke={SKIN} strokeWidth="12" fill="none" />
      <path d="M160 70 C180 90, 186 120, 182 150" stroke={SKIN} strokeWidth="12" fill="none" />
    </g>
  );
}

function Recline() {
  return (
    <g transform="translate(10 90)">
      <ellipse cx="50" cy="80" rx="22" ry="18" fill={SKIN} />
      <Face cx={50} cy={80} scale={0.8} />
      <HairDown cx={50} cy={80} scale={0.65} />
      <ellipse cx="120" cy="96" rx="58" ry="24" fill={SKIN} />
      <ellipse cx="108" cy="82" rx="14" ry="11" fill={SKIN} />
      <circle cx="112" cy="82" r="3.2" fill={AREOLA} />
      <ellipse cx="186" cy="104" rx="28" ry="16" fill={SKIN} />
      <Pubic cx={170} cy={108} />
      <path d="M200 100 C230 80, 250 60, 258 44" stroke={SKIN} strokeWidth="13" fill="none" strokeLinecap="round" />
      <RopeCoil cx={186} cy={70} />
    </g>
  );
}

function KneelSide() {
  return (
    <g>
      <HairDown cx={130} cy={90} />
      <ellipse cx="138" cy="176" rx="24" ry="42" fill={SKIN} />
      <ellipse cx="150" cy="172" rx="14" ry="12" fill={SKIN} />
      <circle cx="156" cy="174" r="3.6" fill={AREOLA} />
      <ellipse cx="132" cy="248" rx="26" ry="18" fill={SKIN} />
      <path d="M122 248 C100 300, 90 350, 108 372" stroke={SKIN} strokeWidth="18" fill="none" strokeLinecap="round" />
      <ellipse cx="120" cy="382" rx="20" ry="9" fill={SKIN} />
      <path d="M120 140 C96 170, 88 210, 94 246" stroke={SKIN} strokeWidth="14" fill="none" strokeLinecap="round" />
      <Face cx={130} cy={90} profile />
      <RopeCoil cx={94} cy={246} />
    </g>
  );
}
