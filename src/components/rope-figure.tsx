import type { Pose, View, WrapSpec } from "@/lib/kb/types";
import { NERVES } from "@/lib/kb/nerves";
import { cn } from "@/lib/utils";

function cuffPos(at: Extract<WrapSpec, { kind: "cuff" }>["at"], pose: Pose) {
  if (pose === "prone" || pose === "supine") {
    const map = {
      lw: { cx: 28, cy: 150 },
      rw: { cx: 372, cy: 150 },
      la: { cx: 90, cy: 150 },
      ra: { cx: 310, cy: 150 },
      ll: { cx: 70, cy: 230 },
      rl: { cx: 330, cy: 230 },
      lk: { cx: 110, cy: 210 },
      rk: { cx: 290, cy: 210 },
    };
    return map[at];
  }
  const map = {
    lw: { cx: 58, cy: 228 },
    rw: { cx: 142, cy: 228 },
    la: { cx: 62, cy: 150 },
    ra: { cx: 138, cy: 150 },
    ll: { cx: 84, cy: 360 },
    rl: { cx: 116, cy: 360 },
    lk: { cx: 84, cy: 300 },
    rk: { cx: 116, cy: 300 },
  };
  return map[at];
}

export function RopeFigure({
  pose = "stand",
  view = "front",
  wraps = [],
  nerves = [],
  activeNerve,
  highlightIndex,
  compact = false,
  className,
}: {
  pose?: Pose;
  view?: View;
  wraps?: WrapSpec[];
  nerves?: string[];
  activeNerve?: string;
  /** Which wrap band to accent; defaults to the last wrap. */
  highlightIndex?: number;
  compact?: boolean;
  className?: string;
}) {
  const gote = pose === "gote" || wraps.some((w) => w.kind === "gote") || view === "back";
  const floor = pose === "prone" || pose === "supine";
  const vb = floor ? "0 0 400 280" : "0 0 200 420";
  const body = compact ? 2.6 : 1.6;
  const ink = "currentColor";

  return (
    <svg
      viewBox={vb}
      className={cn("h-full w-full text-muted", className)}
      aria-hidden
    >
      {floor ? (
        <FloorBody pose={pose} sw={body} ink={ink} />
      ) : (
        <UprightBody pose={pose} gote={gote} sw={body} ink={ink} />
      )}
      {wraps.map((w, i) => (
        <Wrap
          key={i}
          spec={w}
          highlight={highlightIndex !== undefined ? i === highlightIndex : i === wraps.length - 1}
          pose={pose}
          compact={compact}
        />
      ))}
      {NERVES.filter((n) => nerves.includes(n.slug) || n.slug === activeNerve).map((n) => {
        const hot = n.slug === activeNerve || nerves.includes(n.slug);
        const cx = floor ? n.x * 400 : n.x * 200;
        const cy = floor ? 40 + n.y * 200 : n.y * 420;
        return (
          <g key={n.slug}>
            <circle cx={cx} cy={cy} r={hot ? 7 : 4} fill="var(--color-danger)" opacity={hot ? 0.9 : 0.45} />
            {!compact && (
              <text x={cx + 10} y={cy + 4} fill="var(--color-danger)" fontSize="11" fontFamily="Figtree, sans-serif">
                {n.name}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function UprightBody({
  pose,
  gote,
  sw,
  ink,
}: {
  pose: Pose;
  gote: boolean;
  sw: number;
  ink: string;
}) {
  const sit = pose === "kneel" || pose === "sit";
  return (
    <g fill="none" stroke={ink} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="100" cy="42" rx="20" ry="24" fill="color-mix(in oklab, var(--color-elevated) 80%, black)" />
      <path d="M100 66 L100 84" />
      <path
        d={
          gote
            ? "M68 96 C74 88, 126 88, 132 96 L124 198 C120 208, 80 208, 76 198 Z"
            : "M64 96 C74 86, 126 86, 136 96 L146 208 C138 220, 62 220, 54 208 Z"
        }
        fill="color-mix(in oklab, var(--color-elevated) 70%, black)"
      />
      {!gote && (
        <>
          <path d="M64 102 C42 148, 40 196, 54 230" />
          <path d="M136 102 C158 148, 160 196, 146 230" />
        </>
      )}
      {gote && (
        <path d="M78 198 C68 228, 78 250, 94 254 M122 198 C132 228, 122 250, 106 254" />
      )}
      {sit ? (
        <>
          <path d="M78 210 C68 248, 58 278, 52 298 L78 302 L90 228" />
          <path d="M122 210 C132 248, 142 278, 148 298 L122 302 L110 228" />
          {pose === "kneel" && (
            <>
              <path d="M52 298 L48 348" />
              <path d="M148 298 L152 348" />
            </>
          )}
        </>
      ) : (
        <>
          <path d="M84 210 L76 362" />
          <path d="M116 210 L124 362" />
        </>
      )}
    </g>
  );
}

function FloorBody({ pose, sw, ink }: { pose: Pose; sw: number; ink: string }) {
  const prone = pose === "prone";
  return (
    <g fill="none" stroke={ink} strokeWidth={sw} strokeLinecap="round">
      <ellipse cx="200" cy="150" rx="28" ry="22" fill="color-mix(in oklab, var(--color-elevated) 80%, black)" />
      <path d="M172 150 L60 150 M228 150 L340 150" />
      <path d={prone ? "M200 128 L200 108" : "M200 172 L200 192"} />
      <path d="M60 150 L28 128 M60 150 L36 178" />
      <path d="M340 150 L372 128 M340 150 L364 178" />
      <path d="M90 150 L70 230 M310 150 L330 230" />
    </g>
  );
}

function Wrap({
  spec,
  highlight,
  pose,
  compact,
}: {
  spec: WrapSpec;
  highlight: boolean;
  pose: Pose;
  compact: boolean;
}) {
  const stroke = highlight ? "var(--color-accent)" : "var(--color-rope)";
  const sw = compact ? (highlight ? 4.2 : 3.2) : highlight ? 3.2 : 2.4;
  const floor = pose === "prone" || pose === "supine";
  const cls = highlight ? "learn-wrap-highlight" : undefined;

  if (spec.kind === "band") {
    const y = spec.y < 2 ? spec.y * (floor ? 280 : 420) : spec.y;
    return (
      <ellipse
        className={cls}
        cx={floor ? 200 : 100}
        cy={y}
        rx={spec.w ? spec.w * (floor ? 140 : 80) : floor ? 90 : 44}
        ry={compact ? 9 : 7}
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
      />
    );
  }
  if (spec.kind === "stem") {
    // x follows the same fraction-or-raw convention as every y: an authored
    // 0.5 means centred, not five units from the left edge.
    const rawX = spec.x ?? (floor ? 200 : 100);
    const x = rawX < 2 ? rawX * (floor ? 400 : 200) : rawX;
    return (
      <path
        className={cls}
        d={`M${x} ${spec.y1 < 2 ? spec.y1 * 420 : spec.y1} L${x} ${spec.y2 < 2 ? spec.y2 * 420 : spec.y2}`}
        stroke={stroke}
        strokeWidth={sw}
        fill="none"
      />
    );
  }
  if (spec.kind === "cuff") {
    const p = cuffPos(spec.at, pose);
    return (
      <circle
        className={cls}
        cx={p.cx}
        cy={p.cy}
        r={compact ? 14 : 12}
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
      />
    );
  }
  if (spec.kind === "diamond") {
    const cy = spec.cy < 2 ? spec.cy * 420 : spec.cy;
    return (
      <path
        className={cls}
        d={`M100 ${cy - 18} L124 ${cy} L100 ${cy + 18} L76 ${cy} Z`}
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
      />
    );
  }
  if (spec.kind === "x") {
    const y = spec.y < 2 ? spec.y * 420 : spec.y;
    return (
      <path
        className={cls}
        d={`M68 ${y - 22} L132 ${y + 22} M132 ${y - 22} L68 ${y + 22}`}
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
      />
    );
  }
  if (spec.kind === "chest") {
    return (
      <g className={cls} fill="none" stroke={stroke} strokeWidth={sw}>
        <ellipse cx="100" cy="128" rx="42" ry="8" />
        <ellipse cx="100" cy="156" rx="44" ry="8" />
      </g>
    );
  }
  if (spec.kind === "hip") {
    return (
      <ellipse
        className={cls}
        cx="100"
        cy="208"
        rx="48"
        ry="10"
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
      />
    );
  }
  if (spec.kind === "futomomo") {
    if (spec.side === "both") {
      return (
        <g className={cls} fill="none" stroke={stroke} strokeWidth={sw}>
          <ellipse cx="78" cy="300" rx="18" ry="30" />
          <ellipse cx="122" cy="300" rx="18" ry="30" />
        </g>
      );
    }
    const x = spec.side === "l" ? 78 : 122;
    return (
      <ellipse
        className={cls}
        cx={x}
        cy="300"
        rx="18"
        ry="30"
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
      />
    );
  }
  if (spec.kind === "gote") {
    return (
      <path
        className={cls}
        d="M74 168 C90 188, 110 188, 126 168 M80 188 C94 206, 106 206, 120 188"
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
      />
    );
  }
  return null;
}

export function MiniTie({ wraps, pose = "stand" }: { wraps: WrapSpec[]; pose?: Pose }) {
  return (
    <div className="flex aspect-[1/2] w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-bg ring-1 ring-border">
      <RopeFigure wraps={wraps} pose={pose} compact className="h-[118%] w-[118%] text-rope" />
    </div>
  );
}

export function ClockRing({
  elapsed,
  limitSec,
  label,
}: {
  elapsed: number;
  limitSec: number;
  label: string;
}) {
  const t = Math.min(1, limitSec > 0 ? elapsed / limitSec : 0);
  const r = 42;
  const c = 2 * Math.PI * r;
  const warn = t > 0.75;
  return (
    <div className="relative size-28">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-border)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={warn ? "var(--color-warn)" : "var(--color-accent)"}
          strokeWidth="8"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - t)}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-display text-2xl leading-none tabular-nums text-fg">{fmt(elapsed)}</p>
        <p className="text-[10px] uppercase tracking-wide text-subtle">{label}</p>
      </div>
    </div>
  );
}

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
