import { cn } from "@/lib/utils";

type KnotFigureProps = {
  diagramId: string;
  className?: string;
  animate?: boolean;
};

/** Procedural knot diagrams for Academy foundation drills (prop-only, no body). */
export function KnotFigure({ diagramId, className, animate = true }: KnotFigureProps) {
  const rope = "var(--color-rope)";
  const ink = "var(--color-muted)";
  const accent = "var(--color-accent)";

  return (
    <svg
      viewBox="0 0 200 160"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label={`Knot diagram ${diagramId}`}
    >
      <defs>
        <linearGradient id="column-shade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-elevated)" />
          <stop offset="50%" stopColor="var(--color-border-strong)" />
          <stop offset="100%" stopColor="var(--color-elevated)" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="200" height="160" fill="var(--color-surface)" rx="8" />
      <Column x={100} ink={ink} />
      {diagramId.startsWith("somerville-bowline") && (
        <SomervilleBowline step={Number(diagramId.split("-").pop())} rope={rope} accent={accent} ink={ink} animate={animate} />
      )}
      {diagramId.startsWith("larks-head") && (
        <LarksHead step={Number(diagramId.split("-").pop())} rope={rope} accent={accent} ink={ink} animate={animate} />
      )}
      {diagramId.startsWith("double-half-hitch") && (
        <DoubleHalfHitch step={Number(diagramId.split("-").pop())} rope={rope} accent={accent} ink={ink} animate={animate} />
      )}
      {diagramId.startsWith("square") && (
        <SquareKnot step={Number(diagramId.split("-").pop())} rope={rope} accent={accent} ink={ink} animate={animate} />
      )}
      {diagramId.startsWith("half-hitch") && (
        <HalfHitch rope={rope} accent={accent} ink={ink} animate={animate} />
      )}
      {diagramId.startsWith("overhand-on-bight") && (
        <OverhandOnBight rope={rope} accent={accent} ink={ink} animate={animate} />
      )}
      {diagramId.startsWith("wrap-cinch") && (
        <WrapCinch step={Number(diagramId.split("-").pop())} rope={rope} accent={accent} ink={ink} animate={animate} />
      )}
      {diagramId.startsWith("reverse-tension") && (
        <ReverseTension step={Number(diagramId.split("-").pop())} rope={rope} accent={accent} ink={ink} animate={animate} />
      )}
      {diagramId.startsWith("sheet-bend") && (
        <SheetBend step={Number(diagramId.split("-").pop())} rope={rope} accent={accent} ink={ink} animate={animate} />
      )}
      {diagramId.startsWith("surgeon") && (
        <Surgeon step={Number(diagramId.split("-").pop())} rope={rope} accent={accent} ink={ink} animate={animate} />
      )}
      {diagramId.startsWith("daisy-chain") && (
        <DaisyChain step={Number(diagramId.split("-").pop())} rope={rope} accent={accent} ink={ink} animate={animate} />
      )}
      {diagramId.startsWith("truckers-hitch") && (
        <TruckersHitch step={Number(diagramId.split("-").pop())} rope={rope} accent={accent} ink={ink} animate={animate} />
      )}
      {isInstructorOnlyDiagram(diagramId) && <InstructorOnlyDiagram ink={ink} />}
      {!isKnownDiagram(diagramId) && (
        <text x="100" y="80" textAnchor="middle" fill={ink} fontSize="11" fontFamily="system-ui">
          Diagram
        </text>
      )}
    </svg>
  );
}

/**
 * Knots this app names for recognition only — friction hitches and loop
 * knots used in loaded, suspension-adjacent rigging. Their construction is
 * never drawn, on the same rule that keeps it out of the prose: a diagram
 * showing how to tie one would teach the thing the entry exists to withhold.
 * Distinguishing this from a missing diagram matters — the bare fallback
 * below reads as a bug (something nobody got round to), while this reads as
 * the deliberate choice it is.
 */
function isInstructorOnlyDiagram(id: string) {
  return (
    id.startsWith("munter") ||
    id.startsWith("portuguese-bowline") ||
    id.startsWith("prusik") ||
    id.startsWith("alpine-butterfly") ||
    id.startsWith("figure-eight")
  );
}

function isKnownDiagram(id: string) {
  return (
    id.startsWith("somerville-bowline") ||
    id.startsWith("larks-head") ||
    id.startsWith("double-half-hitch") ||
    id.startsWith("square") ||
    id.startsWith("half-hitch") ||
    id.startsWith("overhand-on-bight") ||
    id.startsWith("wrap-cinch") ||
    id.startsWith("reverse-tension") ||
    id.startsWith("sheet-bend") ||
    id.startsWith("surgeon") ||
    id.startsWith("daisy-chain") ||
    id.startsWith("truckers-hitch") ||
    isInstructorOnlyDiagram(id)
  );
}

function Column({ x, ink }: { x: number; ink: string }) {
  return (
    <g>
      <rect x={x - 14} y="24" width="28" height="112" rx="6" fill="url(#column-shade)" stroke={ink} strokeWidth="1.2" opacity="0.85" />
      <text x={x} y="148" textAnchor="middle" fill={ink} fontSize="8" opacity="0.6">
        practice column
      </text>
    </g>
  );
}

function RopePath({
  d,
  rope,
  animate,
  dash,
}: {
  d: string;
  rope: string;
  animate: boolean;
  dash?: boolean;
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={rope}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={dash ? "6 4" : undefined}
      className={animate ? "knot-rope-draw" : undefined}
    />
  );
}

function PulseDot({ cx, cy, accent }: { cx: number; cy: number; accent: string }) {
  return <circle cx={cx} cy={cy} r="5" fill={accent} className="knot-pulse" />;
}

function SomervilleBowline({
  step,
  rope,
  accent,
  ink,
  animate,
}: {
  step: number;
  rope: string;
  accent: string;
  ink: string;
  animate: boolean;
}) {
  const wraps = "M 68 58 Q 100 42 132 58 Q 100 74 68 58 M 68 78 Q 100 62 132 78 Q 100 94 68 78";
  const standing = "M 132 58 L 154 120";
  const bight = "M 68 58 L 46 120";
  if (step === 0) {
    return (
      <g>
        <RopePath d={wraps} rope={rope} animate={animate} />
        <RopePath d={bight} rope={rope} animate={animate} dash />
        <RopePath d={standing} rope={rope} animate={animate} dash />
        <PulseDot cx={68} cy={58} accent={accent} />
        <Label x={36} y={38} ink={ink} text="bight" />
        <Label x={116} y={112} ink={ink} text="two wraps" />
      </g>
    );
  }
  if (step === 1) {
    return (
      <g>
        <RopePath d={wraps} rope={rope} animate={animate} />
        <RopePath d="M 68 58 L 100 42 Q 132 30 132 58" rope={rope} animate={animate} />
        <RopePath d={standing} rope={rope} animate={animate} dash />
        <PulseDot cx={100} cy={56} accent={accent} />
        <Label x={104} y={30} ink={ink} text="loop on standing line" />
      </g>
    );
  }
  if (step === 2) {
    return (
      <g>
        <RopePath d={wraps} rope={rope} animate={animate} />
        <RopePath d="M 68 58 L 100 42 Q 132 30 132 58" rope={rope} animate={animate} />
        <RopePath d="M 68 58 Q 98 86 132 78" rope={rope} animate={animate} />
        <RopePath d={standing} rope={rope} animate={animate} dash />
        <PulseDot cx={98} cy={86} accent={accent} />
        <Label x={24} y={116} ink={ink} text="over X, under all" />
      </g>
    );
  }
  if (step === 3) {
    return (
      <g>
        <RopePath d={wraps} rope={rope} animate={animate} />
        <RopePath d="M 68 58 L 100 42 Q 132 30 132 58" rope={rope} animate={animate} />
        <RopePath d="M 68 58 Q 98 86 132 78 Q 146 68 132 58" rope={rope} animate={animate} />
        <RopePath d={standing} rope={rope} animate={animate} dash />
        <PulseDot cx={132} cy={58} accent={accent} />
        <Label x={30} y={116} ink={ink} text="up through, same way" />
      </g>
    );
  }
  if (step === 4) {
    return (
      <g>
        <RopePath d={wraps} rope={rope} animate={animate} />
        <RopePath d="M 68 58 Q 100 86 132 58" rope={rope} animate={animate} />
        <RopePath d={standing} rope={rope} animate={animate} dash />
        <circle cx={100} cy={72} r="25" fill="none" stroke={accent} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
        <Label x={52} y={124} ink={ink} text="rings unchanged" />
      </g>
    );
  }
  return (
    <g>
      <RopePath d={wraps} rope={rope} animate={animate} />
      <RopePath d={bight} rope={rope} animate={animate} dash />
      <RopePath d="M 132 58 Q 156 82 132 108" rope={rope} animate={animate} dash />
      <PulseDot cx={132} cy={108} accent={accent} />
      <Label x={28} y={124} ink={ink} text="pull tail / open loop" />
    </g>
  );
}

function LarksHead({
  step,
  rope,
  accent,
  ink,
  animate,
}: {
  step: number;
  rope: string;
  accent: string;
  ink: string;
  animate: boolean;
}) {
  if (step === 0) {
    return (
      <g>
        <RopePath d="M 48 100 L 152 100" rope={rope} animate={animate} />
        <RopePath d="M 100 100 L 100 56" rope={rope} animate={animate} dash />
        <PulseDot cx={100} cy={56} accent={accent} />
        <Label x={108} y={48} ink={ink} text="midpoint bight" />
      </g>
    );
  }
  return (
    <g>
      <RopePath d="M 48 100 Q 74 56 100 56 Q 126 56 152 100" rope={rope} animate={animate} />
      <RopePath d="M 72 78 L 128 78" rope={rope} animate={animate} />
      <PulseDot cx={100} cy={78} accent={accent} />
      <Label x={108} y={90} ink={ink} text="tails through" />
    </g>
  );
}

function DoubleHalfHitch({
  step,
  rope,
  accent,
  ink,
  animate,
}: {
  step: number;
  rope: string;
  accent: string;
  ink: string;
  animate: boolean;
}) {
  return (
    <g>
      <RopePath d="M 40 100 L 160 100" rope={rope} animate={animate} />
      <RopePath d="M 160 100 Q 140 72 120 88 Q 100 104 120 120 Q 140 136 160 100" rope={rope} animate={animate} />
      {step >= 1 && (
        <RopePath d="M 120 88 Q 100 72 80 88 Q 60 104 80 120 Q 100 136 120 88" rope={rope} animate={animate} />
      )}
      <PulseDot cx={step === 0 ? 120 : 80} cy={104} accent={accent} />
      <Label x={36} y={40} ink={ink} text={step === 0 ? "first hitch" : "same direction"} />
    </g>
  );
}

function SquareKnot({
  step,
  rope,
  accent,
  ink,
  animate,
}: {
  step: number;
  rope: string;
  accent: string;
  ink: string;
  animate: boolean;
}) {
  if (step === 0) {
    return (
      <g>
        <RopePath d="M 48 88 L 152 112" rope={rope} animate={animate} />
        <RopePath d="M 152 88 L 48 112" rope={rope} animate={animate} dash />
        <PulseDot cx={100} cy={100} accent={accent} />
        <Label x={36} y={40} ink={ink} text="right over left" />
      </g>
    );
  }
  return (
    <g>
      <RopePath d="M 48 88 Q 100 72 152 112" rope={rope} animate={animate} />
      <RopePath d="M 152 88 Q 100 128 48 112" rope={rope} animate={animate} />
      <PulseDot cx={100} cy={100} accent={accent} />
      <Label x={36} y={40} ink={ink} text="left over right" />
    </g>
  );
}

function HalfHitch({ rope, accent, ink, animate }: { rope: string; accent: string; ink: string; animate: boolean }) {
  return (
    <g>
      <RopePath d="M 40 100 L 160 100" rope={rope} animate={animate} />
      <RopePath d="M 160 100 Q 140 72 120 88 Q 100 104 120 120 Q 140 136 160 100" rope={rope} animate={animate} />
      <PulseDot cx={120} cy={104} accent={accent} />
      <Label x={36} y={40} ink={ink} text="half hitch" />
    </g>
  );
}

function OverhandOnBight({
  rope,
  accent,
  ink,
  animate,
}: {
  rope: string;
  accent: string;
  ink: string;
  animate: boolean;
}) {
  return (
    <g>
      <RopePath d="M 56 88 Q 100 52 144 88" rope={rope} animate={animate} />
      <RopePath d="M 144 88 Q 100 124 56 88" rope={rope} animate={animate} />
      <RopePath d="M 100 52 L 100 128" rope={rope} animate={animate} dash />
      <PulseDot cx={100} cy={88} accent={accent} />
      <Label x={36} y={40} ink={ink} text="loop + tuck" />
    </g>
  );
}

function WrapCinch({
  step,
  rope,
  accent,
  ink,
  animate,
}: {
  step: number;
  rope: string;
  accent: string;
  ink: string;
  animate: boolean;
}) {
  const bands = [64, 78, 92].map((y) => `M 60 ${y} Q 100 ${y - 6} 140 ${y}`);
  return (
    <g>
      {bands.map((d) => (
        <RopePath key={d} d={d} rope={rope} animate={animate} />
      ))}
      {step === 0 && <Label x={36} y={40} ink={ink} text="parallel wraps" />}
      {step >= 1 && (
        <g>
          <RopePath d="M 148 56 Q 108 60 108 78 Q 108 96 148 100" rope={rope} animate={animate} />
          <PulseDot cx={108} cy={78} accent={accent} />
          <Label x={36} y={40} ink={ink} text="cinch draws tight" />
        </g>
      )}
    </g>
  );
}

function ReverseTension({
  step,
  rope,
  accent,
  ink,
  animate,
}: {
  step: number;
  rope: string;
  accent: string;
  ink: string;
  animate: boolean;
}) {
  const wrap = "M 60 78 Q 100 66 140 78";
  return (
    <g>
      <RopePath d={wrap} rope={rope} animate={animate} />
      {step === 0 && (
        <g>
          <PulseDot cx={100} cy={71} accent={accent} />
          <Label x={36} y={40} ink={ink} text="turning point" />
        </g>
      )}
      {step >= 1 && (
        <RopePath d="M 92 100 Q 100 84 108 100" rope={rope} animate={animate} dash={step === 1} />
      )}
      {step === 1 && (
        <g>
          <PulseDot cx={100} cy={97} accent={accent} />
          <Label x={36} y={40} ink={ink} text="under the wrap" />
        </g>
      )}
      {step >= 2 && (
        <RopePath d="M 92 100 L 92 70 Q 100 62 108 70 L 108 100" rope={rope} animate={animate} />
      )}
      {step === 2 && <Label x={36} y={40} ink={ink} text="fold back 180°" />}
      {step >= 3 && (
        <g>
          <RopePath d="M 108 100 L 108 122" rope={rope} animate={animate} dash />
          <path d="M 108 122 L 104 114 M 108 122 L 112 114" stroke={accent} strokeWidth="2" fill="none" />
          <Label x={36} y={40} ink={ink} text="pull to test" />
        </g>
      )}
    </g>
  );
}

function SheetBend({
  step,
  rope,
  accent,
  ink,
  animate,
}: {
  step: number;
  rope: string;
  accent: string;
  ink: string;
  animate: boolean;
}) {
  return (
    <g>
      <RopePath d="M 100 60 Q 60 60 60 82 Q 60 104 100 104" rope={rope} animate={animate} />
      {step === 0 && (
        <g>
          <PulseDot cx={60} cy={82} accent={accent} />
          <Label x={104} y={56} ink={ink} text="bight" />
        </g>
      )}
      {step >= 1 && (
        <g>
          <RopePath
            d="M 140 96 Q 100 96 100 82 Q 100 68 60 68 Q 44 68 44 82 Q 44 92 60 96"
            rope={rope}
            animate={animate}
            dash
          />
          <PulseDot cx={60} cy={96} accent={accent} />
          <Label x={104} y={56} ink={ink} text="through, around, under" />
        </g>
      )}
    </g>
  );
}

function Surgeon({
  step,
  rope,
  accent,
  ink,
  animate,
}: {
  step: number;
  rope: string;
  accent: string;
  ink: string;
  animate: boolean;
}) {
  return (
    <g>
      <RopePath d="M 48 84 Q 100 68 152 108" rope={rope} animate={animate} />
      <RopePath d="M 152 84 Q 100 100 48 108" rope={rope} animate={animate} />
      {step === 0 && (
        <g>
          <RopePath d="M 48 92 Q 100 76 152 116" rope={rope} animate={animate} dash />
          <PulseDot cx={100} cy={96} accent={accent} />
          <Label x={36} y={40} ink={ink} text="doubled first throw" />
        </g>
      )}
      {step >= 1 && (
        <g>
          <RopePath d="M 48 116 Q 100 132 152 92" rope={rope} animate={animate} />
          <PulseDot cx={100} cy={110} accent={accent} />
          <Label x={36} y={40} ink={ink} text="single finishing throw" />
        </g>
      )}
    </g>
  );
}

function DaisyChain({
  step,
  rope,
  accent,
  ink,
  animate,
}: {
  step: number;
  rope: string;
  accent: string;
  ink: string;
  animate: boolean;
}) {
  const link = (cy: number) => `M 100 ${cy - 12} Q 116 ${cy - 12} 116 ${cy} Q 116 ${cy + 12} 100 ${cy + 12} Q 84 ${cy + 12} 84 ${cy} Q 84 ${cy - 12} 100 ${cy - 12}`;
  return (
    <g>
      <RopePath d={link(52)} rope={rope} animate={animate} />
      <RopePath d={link(76)} rope={rope} animate={animate} />
      {step === 0 && <Label x={36} y={40} ink={ink} text="bight through bight" />}
      {step >= 1 && <RopePath d={link(100)} rope={rope} animate={animate} />}
      {step === 1 && <Label x={36} y={40} ink={ink} text="repeat the same pull" />}
      {step >= 2 && (
        <g>
          <RopePath d="M 100 112 L 100 128" rope={rope} animate={animate} />
          <PulseDot cx={100} cy={124} accent={accent} />
          <Label x={36} y={40} ink={ink} text="lock the last loop" />
        </g>
      )}
    </g>
  );
}

function TruckersHitch({
  step,
  rope,
  accent,
  ink,
  animate,
}: {
  step: number;
  rope: string;
  accent: string;
  ink: string;
  animate: boolean;
}) {
  return (
    <g>
      <RopePath d="M 60 60 Q 76 48 92 60 Q 76 72 60 60" rope={rope} animate={animate} />
      {step === 0 && (
        <g>
          <PulseDot cx={76} cy={60} accent={accent} />
          <Label x={36} y={40} ink={ink} text="fixed mid-line loop" />
        </g>
      )}
      {step >= 1 && (
        <g>
          <RopePath d="M 60 60 L 60 128 Q 60 138 70 138 L 132 138 Q 142 138 142 128 L 142 60 L 76 60" rope={rope} animate={animate} />
          {step === 1 && <Label x={36} y={40} ink={ink} text="reeved and pulled" />}
        </g>
      )}
      {step >= 2 && (
        <g>
          <RopePath d="M 142 60 Q 158 52 152 40 Q 146 30 138 40" rope={rope} animate={animate} />
          <PulseDot cx={148} cy={44} accent={accent} />
          <Label x={36} y={40} ink={ink} text="locked off" />
        </g>
      )}
    </g>
  );
}

/**
 * The deliberate stand-in for an instructor-route knot: the practice column
 * with nothing tied on it, and a lock glyph in place of rope. Recognisable at
 * a glance as "not shown on purpose" rather than "diagram missing" — the two
 * read identically if both are just an empty column.
 */
function InstructorOnlyDiagram({ ink }: { ink: string }) {
  return (
    <g opacity="0.85">
      <rect x="86" y="70" width="28" height="22" rx="3" fill="none" stroke={ink} strokeWidth="2" />
      <path d="M 92 70 L 92 60 Q 92 48 100 48 Q 108 48 108 60 L 108 70" fill="none" stroke={ink} strokeWidth="2" />
      <circle cx="100" cy="81" r="2.4" fill={ink} />
      <text x="100" y="112" textAnchor="middle" fill={ink} fontSize="9" fontFamily="system-ui" opacity="0.8">
        Recognition only
      </text>
      <text x="100" y="123" textAnchor="middle" fill={ink} fontSize="8" fontFamily="system-ui" opacity="0.6">
        not shown here
      </text>
    </g>
  );
}

function Label({ x, y, ink, text }: { x: number; y: number; ink: string; text: string }) {
  return (
    <text x={x} y={y} fill={ink} fontSize="9" fontFamily="system-ui" opacity="0.75">
      {text}
    </text>
  );
}
