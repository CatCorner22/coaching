import { memo } from "react";
import type { FrameObservation } from "@/lib/ml/types";

export const WrapOverlay = memo(function WrapOverlay({
  src,
  obs,
}: {
  src: string;
  obs?: FrameObservation | null;
}) {
  if (!src) return null;
  const neck = (obs?.neckRope ?? 0) > 0.08;
  const width = Math.max(1, obs?.width ?? 4);
  const height = Math.max(1, obs?.height ?? 3);
  const maxWidth = Math.max(1, Math.round(320 * (width / height)));
  return (
    <div className="mt-3 overflow-hidden rounded-lg bg-elevated ring-1 ring-border">
      <div
        className="relative mx-auto w-full overflow-hidden"
        style={{ aspectRatio: `${width} / ${height}`, maxWidth: `${maxWidth}px` }}
      >
      <img src={src} alt="Selected still with observation overlay" className="absolute inset-0 h-full w-full object-contain" />
      {obs && (
        <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${obs.width} ${obs.height}`} preserveAspectRatio="xMidYMid meet">
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
                  fontFamily="system-ui, sans-serif"
                >
                  possible rope-like feature {i + 1}
                </text>
              </g>
            );
          })}
        </svg>
      )}
      <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-2 bg-gradient-to-t from-bg/90 to-transparent p-3 text-[11px]">
        <p className="text-fg">Limited image observation · not safety clearance</p>
      </div>
      {neck && (
        <p className="absolute left-3 top-3 rounded-full bg-danger px-2 py-0.5 text-[11px] uppercase tracking-wide text-danger-fg">
          Possible neck overlap — stop and release now
        </p>
      )}
      </div>
    </div>
  );
});
