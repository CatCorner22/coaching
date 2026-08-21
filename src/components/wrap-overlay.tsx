import type { FrameObservation } from "@/lib/ml/types";

export function WrapOverlay({
  src,
  obs,
}: {
  src: string;
  obs?: FrameObservation | null;
}) {
  if (!src) return null;
  const wraps = obs?.wrapBands.length ?? 0;
  const pale = obs?.paleness ?? 0;
  const neck = (obs?.neckRope ?? 0) > 0.15;
  return (
    <div className="relative overflow-hidden rounded-lg ring-1 ring-border">
      <img src={src} alt="Captured still with wrap overlay" className="max-h-80 w-full object-cover" />
      {obs && (
        <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${obs.width} ${obs.height}`} preserveAspectRatio="none">
          {obs.body && (
            <rect
              x={obs.body.x}
              y={obs.body.y}
              width={obs.body.w}
              height={obs.body.h}
              fill="none"
              stroke="rgba(222,216,207,0.55)"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
          )}
          {obs.wrapBands.map((b, i) => {
            const y = Number.isFinite(b.yNorm) ? b.yNorm * obs.height : 0;
            const sw = 3 + (Number.isFinite(b.strength) ? Math.min(8, b.strength) : 0) * 5;
            return (
              <g key={i}>
                <line
                  x1={obs.body?.x ?? 0}
                  x2={(obs.body?.x ?? 0) + (obs.body?.w ?? obs.width)}
                  y1={y}
                  y2={y}
                  stroke="rgba(185,168,152,0.95)"
                  strokeWidth={sw}
                />
                <text
                  x={(obs.body?.x ?? 8) + 6}
                  y={y - 6}
                  fill="#ded8cf"
                  fontSize="11"
                  fontFamily="Figtree, sans-serif"
                >
                  wrap {i + 1}
                </text>
              </g>
            );
          })}
        </svg>
      )}
      <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-2 bg-gradient-to-t from-bg/90 to-transparent p-3 text-[11px]">
        <p className="tabular-nums text-fg">
          {wraps} wrap{wraps === 1 ? "" : "s"}
          {obs ? ` · rope ${Math.round(obs.ropeShare * 100)}%` : ""}
        </p>
        <p className={pale > 0.35 ? "text-warn" : "text-muted"}>
          paleness {Math.round(pale * 100)}
        </p>
      </div>
      {neck && (
        <p className="absolute left-3 top-3 rounded-full bg-danger px-2 py-0.5 text-[11px] uppercase tracking-wide text-danger-fg">
          Neck flag
        </p>
      )}
    </div>
  );
}
