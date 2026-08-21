import type { Pose, View, WrapSpec } from "@/lib/kb/types";
import { cn } from "@/lib/utils";

const CUFF: Record<WrapSpec extends { kind: "cuff" } ? never : string, string> = {};

function cuffPos(at: Extract<WrapSpec, { kind: "cuff" }>["at"]) {
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
  className,
}: {
  pose?: Pose;
  view?: View;
  wraps?: WrapSpec[];
  className?: string;
}) {
  const gote = pose === "gote" || wraps.some((w) => w.kind === "gote") || view === "back";
  return (
    <svg
      viewBox="0 0 200 420"
      className={cn("h-full w-full text-fg", className)}
      aria-hidden
    >
      <ellipse cx="100" cy="42" rx="22" ry="26" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M100 68 L100 86"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d={
          gote
            ? "M64 96 C70 88, 130 88, 136 96 L128 200 C124 208, 76 208, 72 200 Z"
            : "M62 96 C72 86, 128 86, 138 96 L148 210 C140 222, 60 222, 52 210 Z"
        }
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      {!gote && (
        <>
          <path d="M62 100 C40 150, 42 200, 54 232" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M138 100 C160 150, 158 200, 146 232" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </>
      )}
      {gote && (
        <path
          d="M78 200 C70 230, 80 248, 96 252 M122 200 C130 230, 120 248, 104 252"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        />
      )}
      <path
        d={
          pose === "kneel" || pose === "sit"
            ? "M78 210 C70 250, 62 280, 58 300 L78 300 L88 230 M122 210 C130 250, 138 280, 142 300 L122 300 L112 230"
            : "M84 210 L78 360 M116 210 L122 360"
        }
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      {wraps.map((w, i) => (
        <Wrap key={i} spec={w} last={i === wraps.length - 1} />
      ))}
    </svg>
  );
}

function Wrap({ spec, last }: { spec: WrapSpec; last: boolean }) {
  const stroke = last ? "var(--color-accent)" : "var(--color-rope)";
  const sw = last ? 2.4 : 1.8;
  if (spec.kind === "band") {
    const y = spec.y < 2 ? spec.y * 420 : spec.y;
    return (
      <ellipse cx="100" cy={y} rx={spec.w ?? 44} ry="7" fill="none" stroke={stroke} strokeWidth={sw} />
    );
  }
  if (spec.kind === "stem") {
    return (
      <path
        d={`M${spec.x ?? 100} ${spec.y1 < 2 ? spec.y1 * 420 : spec.y1} L${spec.x ?? 100} ${spec.y2 < 2 ? spec.y2 * 420 : spec.y2}`}
        stroke={stroke}
        strokeWidth={sw}
        fill="none"
      />
    );
  }
  if (spec.kind === "cuff") {
    const p = cuffPos(spec.at);
    return <circle cx={p.cx} cy={p.cy} r="11" fill="none" stroke={stroke} strokeWidth={sw} />;
  }
  if (spec.kind === "diamond") {
    const cy = spec.cy < 2 ? spec.cy * 420 : spec.cy;
    return (
      <path
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
        d={`M68 ${y - 22} L132 ${y + 22} M132 ${y - 22} L68 ${y + 22}`}
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
      />
    );
  }
  if (spec.kind === "chest") {
    return (
      <>
        <ellipse cx="100" cy="128" rx="42" ry="8" fill="none" stroke={stroke} strokeWidth={sw} />
        <ellipse cx="100" cy="156" rx="44" ry="8" fill="none" stroke={stroke} strokeWidth={sw} />
      </>
    );
  }
  if (spec.kind === "hip") {
    return <ellipse cx="100" cy="208" rx="48" ry="10" fill="none" stroke={stroke} strokeWidth={sw} />;
  }
  if (spec.kind === "futomomo") {
    const x = spec.side === "l" ? 78 : spec.side === "r" ? 122 : 100;
    if (spec.side === "both") {
      return (
        <>
          <ellipse cx="78" cy="300" rx="16" ry="28" fill="none" stroke={stroke} strokeWidth={sw} />
          <ellipse cx="122" cy="300" rx="16" ry="28" fill="none" stroke={stroke} strokeWidth={sw} />
        </>
      );
    }
    return <ellipse cx={x} cy="300" rx="16" ry="28" fill="none" stroke={stroke} strokeWidth={sw} />;
  }
  if (spec.kind === "gote") {
    return (
      <path
        d="M74 168 C90 188, 110 188, 126 168"
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
      />
    );
  }
  void CUFF;
  return null;
}

export function MiniTie({ wraps }: { wraps: WrapSpec[] }) {
  return (
    <div className="aspect-[1/2] w-16 overflow-hidden rounded-md bg-bg">
      <RopeFigure wraps={wraps} />
    </div>
  );
}
