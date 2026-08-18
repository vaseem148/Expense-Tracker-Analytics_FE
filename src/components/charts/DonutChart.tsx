import { useMemo, useState } from 'react';
import { compact, currency } from '@/lib/format';
import { foldToPalette } from '@/lib/palette';
import { EmptyChart } from './primitives';

export interface DonutSlice {
  name: string;
  total: number;
  count?: number;
}

interface Props {
  data: DonutSlice[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  currencyCode?: string;
  maxSlices?: number;
}

interface Arc {
  name: string;
  total: number;
  color: string;
  share: number;
  path: string;
  labelX: number;
  labelY: number;
  midAngle: number;
}

/**
 * Category split. The tail folds into "Other" rather than inventing a ninth
 * hue, and each visible slice carries a direct label - which is also the relief
 * the palette requires for its lower-contrast light-mode slots.
 */
export function DonutChart({
  data,
  size = 220,
  thickness = 26,
  centerLabel = 'Total',
  currencyCode = 'INR',
  maxSlices = 6,
}: Props) {
  const [active, setActive] = useState<string | null>(null);

  const { arcs, total } = useMemo(() => {
    const folded = foldToPalette(
      data.filter((d) => d.total > 0),
      maxSlices,
    );
    const sum = folded.reduce((acc, s) => acc + s.total, 0);
    if (!sum) return { arcs: [] as Arc[], total: 0 };

    const radius = size / 2;
    const inner = radius - thickness;
    let angle = -Math.PI / 2;

    const result: Arc[] = folded.map((slice) => {
      const sweep = (slice.total / sum) * Math.PI * 2;
      // A 2px surface gap between neighbouring fills, expressed as an angle.
      const gap = Math.min(sweep * 0.12, 0.03);
      const start = angle + gap / 2;
      const end = angle + sweep - gap / 2;
      const mid = angle + sweep / 2;
      angle += sweep;

      return {
        name: slice.name,
        total: slice.total,
        color: slice.color,
        share: (slice.total / sum) * 100,
        path: arcPath(radius, radius, inner, radius, start, end),
        labelX: radius + Math.cos(mid) * (radius + 14),
        labelY: radius + Math.sin(mid) * (radius + 14),
        midAngle: mid,
      };
    });

    return { arcs: result, total: sum };
  }, [data, size, thickness, maxSlices]);

  if (!arcs.length) return <EmptyChart message="No spending in this window" />;

  const focused = arcs.find((a) => a.name === active);

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} role="img" aria-label="Spending by category">
          <g>
            {arcs.map((arc) => (
              <path
                key={arc.name}
                d={arc.path}
                fill={arc.color}
                opacity={active && active !== arc.name ? 0.32 : 1}
                stroke="var(--surface)"
                strokeWidth={2}
                className="cursor-pointer transition-opacity duration-200"
                onPointerEnter={() => setActive(arc.name)}
                onPointerLeave={() => setActive(null)}
              >
                <title>{`${arc.name}: ${currency(arc.total, currencyCode)} (${arc.share.toFixed(1)}%)`}</title>
              </path>
            ))}
          </g>
        </svg>

        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-[var(--ink-muted)]">
              {focused ? focused.name : centerLabel}
            </p>
            <p className="tabular text-[22px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
              {compact(focused ? focused.total : total)}
            </p>
            {focused ? (
              <p className="tabular text-[12px] text-[var(--ink-muted)]">
                {focused.share.toFixed(1)}%
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Direct labels double as the legend and as contrast relief */}
      <ul className="min-w-0 flex-1 space-y-1.5">
        {arcs.map((arc) => (
          <li
            key={arc.name}
            onPointerEnter={() => setActive(arc.name)}
            onPointerLeave={() => setActive(null)}
            className="flex items-center gap-2.5 rounded-lg px-2 py-1 transition-colors hover:bg-[var(--surface-2)]"
            style={{ opacity: active && active !== arc.name ? 0.5 : 1 }}
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
              style={{ background: arc.color }}
              aria-hidden
            />
            <span className="min-w-0 flex-1 truncate text-[13px] text-[var(--ink-2)]">
              {arc.name}
            </span>
            <span className="tabular text-[13px] font-medium text-[var(--ink)]">
              {compact(arc.total)}
            </span>
            <span className="tabular w-11 text-right text-[12px] text-[var(--ink-muted)]">
              {arc.share.toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Annulus segment path - outer arc forward, inner arc back. */
function arcPath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  start: number,
  end: number,
): string {
  const largeArc = end - start > Math.PI ? 1 : 0;
  const x0 = cx + Math.cos(start) * outerR;
  const y0 = cy + Math.sin(start) * outerR;
  const x1 = cx + Math.cos(end) * outerR;
  const y1 = cy + Math.sin(end) * outerR;
  const x2 = cx + Math.cos(end) * innerR;
  const y2 = cy + Math.sin(end) * innerR;
  const x3 = cx + Math.cos(start) * innerR;
  const y3 = cy + Math.sin(start) * innerR;
  return [
    `M${x0},${y0}`,
    `A${outerR},${outerR} 0 ${largeArc} 1 ${x1},${y1}`,
    `L${x2},${y2}`,
    `A${innerR},${innerR} 0 ${largeArc} 0 ${x3},${y3}`,
    'Z',
  ].join(' ');
}
