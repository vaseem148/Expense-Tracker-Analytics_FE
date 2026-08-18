import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Measures the container so charts are responsive without a resize library. */
export function useMeasure<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width ?? 0;
      setWidth((prev) => (Math.abs(prev - next) > 1 ? next : prev));
    });
    observer.observe(node);
    setWidth(node.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const DEFAULT_MARGIN: Margin = { top: 12, right: 16, bottom: 26, left: 44 };

/** Builds a linear scale plus a few readable tick values. */
export function linearScale(domain: [number, number], range: [number, number]) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  return (value: number) => r0 + ((value - d0) / span) * (r1 - r0);
}

/** "Nice" ticks: rounded to 1/2/5 x 10^n so labels read cleanly. */
export function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0];
  const rough = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalised = rough / magnitude;
  const step = (normalised >= 5 ? 5 : normalised >= 2 ? 2 : 1) * magnitude;
  const ticks: number[] = [];
  for (let v = 0; v <= max * 1.001; v += step) ticks.push(v);
  if (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + step);
  return ticks;
}

/** Catmull-Rom to cubic Bezier: a smooth line without overshooting the data. */
export function smoothPath(points: { x: number; y: number }[], tension = 0.35): string {
  if (points.length === 0) return '';
  if (points.length < 3) {
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  }
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + ((p2.x - p0.x) / 6) * tension * 2;
    const c1y = p1.y + ((p2.y - p0.y) / 6) * tension * 2;
    const c2x = p2.x - ((p3.x - p1.x) / 6) * tension * 2;
    const c2y = p2.y - ((p3.y - p1.y) / 6) * tension * 2;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
  }
  return d;
}

export function GridLines({
  ticks,
  scale,
  x0,
  x1,
}: {
  ticks: number[];
  scale: (v: number) => number;
  x0: number;
  x1: number;
}) {
  return (
    <g aria-hidden>
      {ticks.map((t) => (
        <line
          key={t}
          x1={x0}
          x2={x1}
          y1={scale(t)}
          y2={scale(t)}
          stroke="var(--grid)"
          strokeWidth={1}
          shapeRendering="crispEdges"
        />
      ))}
    </g>
  );
}

export function AxisLabel({
  x,
  y,
  children,
  anchor = 'middle',
  className,
}: {
  x: number;
  y: number;
  children: ReactNode;
  anchor?: 'start' | 'middle' | 'end';
  className?: string;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      className={cn('fill-[var(--ink-muted)] text-[10.5px] tabular', className)}
      dominantBaseline="middle"
    >
      {children}
    </text>
  );
}

interface TooltipProps {
  x: number;
  y: number;
  containerWidth: number;
  children: ReactNode;
}

/** Floating tooltip that flips side near the right edge instead of clipping. */
export function ChartTooltip({ x, y, containerWidth, children }: TooltipProps) {
  const flip = x > containerWidth - 170;
  return (
    <div
      className="pointer-events-none absolute z-20 min-w-[9.5rem] rounded-xl border border-[var(--line)] bg-[var(--surface-raised)] px-3 py-2.5 shadow-[var(--shadow-lg)] animate-fade"
      style={{
        left: flip ? undefined : x + 14,
        right: flip ? containerWidth - x + 14 : undefined,
        top: Math.max(4, y - 12),
      }}
    >
      {children}
    </div>
  );
}

export function TooltipRow({
  color,
  label,
  value,
  strong,
}: {
  color?: string;
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-[12.5px] leading-6">
      <span className="flex items-center gap-1.5 text-[var(--ink-2)]">
        {color ? (
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ background: color }}
            aria-hidden
          />
        ) : null}
        {label}
      </span>
      <span className={cn('tabular', strong ? 'font-semibold text-[var(--ink)]' : 'text-[var(--ink)]')}>
        {value}
      </span>
    </div>
  );
}

export interface LegendItem {
  label: string;
  color: string;
  value?: string;
}

export function Legend({ items, className }: { items: LegendItem[]; className?: string }) {
  return (
    <ul className={cn('flex flex-wrap items-center gap-x-4 gap-y-1.5', className)}>
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5 text-[12px] text-[var(--ink-2)]">
          <span
            className="h-2.5 w-2.5 rounded-[3px] shrink-0"
            style={{ background: item.color }}
            aria-hidden
          />
          <span>{item.label}</span>
          {item.value ? <span className="tabular text-[var(--ink-muted)]">{item.value}</span> : null}
        </li>
      ))}
    </ul>
  );
}

export function EmptyChart({ message = 'Nothing to plot yet' }: { message?: string }) {
  return (
    <div className="grid h-full min-h-[10rem] place-items-center text-[13px] text-[var(--ink-muted)]">
      {message}
    </div>
  );
}

/** Tracks pointer position inside an SVG, in SVG coordinates. */
export function usePointer(onLeave?: () => void) {
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);

  const onMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPointer({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const onPointerLeave = useCallback(() => {
    setPointer(null);
    onLeave?.();
  }, [onLeave]);

  return { pointer, onMove, onPointerLeave };
}
