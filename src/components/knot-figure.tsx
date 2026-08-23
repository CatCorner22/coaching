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
      {diagramId.startsWith("figure-eight") && (
        <FigureEight rope={rope} accent={accent} ink={ink} animate={animate} />
      )}
      {!isKnownDiagram(diagramId) && (
        <text x="100" y="80" textAnchor="middle" fill={ink} fontSize="11" fontFamily="system-ui">
          Diagram
        </text>
      )}
    </svg>
  );
}

function isKnownDiagram(id: string) {
  return (
    id.startsWith("somerville-bowline") ||
    id.startsWith("larks-head") ||
    id.startsWith("double-half-hitch") ||
    id.startsWith("square") ||
    id.startsWith("half-hitch") ||
    id.startsWith("figure-eight")
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
  const base = "M 62 68 Q 86 52 100 56 Q 114 52 138 68";
  if (step === 0) {
    return (
      <g>
        <RopePath d={base} rope={rope} animate={animate} />
        <RopePath d="M 62 68 L 48 120" rope={rope} animate={animate} dash />
        <RopePath d="M 138 68 L 152 120" rope={rope} animate={animate} dash />
        <PulseDot cx={100} cy={56} accent={accent} />
        <Label x={36} y={40} ink={ink} text="bight" />
      </g>
    );
  }
  if (step === 1) {
    return (
      <g>
        <RopePath d={base} rope={rope} animate={animate} />
        <RopePath d="M 100 56 L 100 92" rope={rope} animate={animate} />
        <RopePath d="M 62 68 L 48 120" rope={rope} animate={animate} />
        <RopePath d="M 138 68 L 152 120" rope={rope} animate={animate} />
        <PulseDot cx={100} cy={92} accent={accent} />
        <Label x={108} y={78} ink={ink} text="up through" />
      </g>
    );
  }
  if (step === 2) {
    return (
      <g>
        <RopePath d={base} rope={rope} animate={animate} />
        <RopePath d="M 100 56 L 100 92 Q 118 98 128 78 Q 118 58 100 56" rope={rope} animate={animate} />
        <RopePath d="M 62 68 L 48 120" rope={rope} animate={animate} />
        <RopePath d="M 138 68 L 152 120" rope={rope} animate={animate} />
        <PulseDot cx={128} cy={78} accent={accent} />
        <Label x={132} y={64} ink={ink} text="around" />
      </g>
    );
  }
  return (
    <g>
      <RopePath d={base} rope={rope} animate={animate} />
      <RopePath d="M 100 56 L 100 92 Q 118 98 128 78 Q 118 58 100 56" rope={rope} animate={animate} />
      <RopePath d="M 62 68 L 48 120" rope={rope} animate={animate} />
      <RopePath d="M 138 68 L 152 120" rope={rope} animate={animate} />
      <circle cx={100} cy={74} r="18" fill="none" stroke={accent} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
      <Label x={36} y={40} ink={ink} text="non-cinching" />
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
      <Label x={36} y={40} ink={ink} text="one hitch" />
    </g>
  );
}

function FigureEight({ rope, accent, ink, animate }: { rope: string; accent: string; ink: string; animate: boolean }) {
  return (
    <g>
      <RopePath
        d="M 60 100 Q 60 60 100 60 Q 140 60 140 100 Q 140 140 100 140 Q 60 140 60 100 Q 60 80 100 80 Q 140 80 140 100"
        rope={rope}
        accent={accent}
        animate={animate}
      />
      <PulseDot cx={100} cy={100} accent={accent} />
      <Label x={36} y={40} ink={ink} text="8 shape" />
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

export const FOUNDATION_DIAGRAM_IDS = [
  "somerville-bowline-0",
  "somerville-bowline-1",
  "somerville-bowline-2",
  "somerville-bowline-3",
  "larks-head-0",
  "larks-head-1",
  "double-half-hitch-0",
  "double-half-hitch-1",
  "square-0",
  "square-1",
  "half-hitch-0",
  "figure-eight-0",
] as const;
