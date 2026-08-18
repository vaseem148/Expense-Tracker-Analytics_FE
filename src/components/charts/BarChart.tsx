import { useState } from 'react';
import { compact, currency } from '@/lib/format';
import { EmptyChart } from './primitives';

export interface BarRow {
  label: string;
  value: number;
  color?: string;
  secondary?: number;
  meta?: string;
}

interface Props {
  data: BarRow[];
  currencyCode?: string;
  maxRows?: number;
  showSecondary?: boolean;
  secondaryLabel?: string;
}

/**
 * Horizontal bars - the right form when the category names are the point.
 * Bars are anchored to a shared baseline with 4px rounded data-ends, and an
 * optional lighter track behind each bar shows the comparison value.
 */
export function BarChart({
  data,
  currencyCode = 'INR',
  maxRows = 10,
  showSecondary = false,
  secondaryLabel = 'Previous',
}: Props) {
  const [active, setActive] = useState<string | null>(null);
  const rows = data.slice(0, maxRows);
  if (!rows.length) return <EmptyChart />;

  const max = Math.max(...rows.map((r) => Math.max(r.value, r.secondary ?? 0)), 1);

  return (
    <div className="space-y-2.5">
      {rows.map((row, i) => {
        const pct = (row.value / max) * 100;
        const secondaryPct = ((row.secondary ?? 0) / max) * 100;
        const color = row.color ?? `var(--s${(i % 8) + 1})`;
        return (
          <div
            key={row.label}
            onPointerEnter={() => setActive(row.label)}
            onPointerLeave={() => setActive(null)}
            className="group"
          >
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate text-[13px] text-[var(--ink-2)]">{row.label}</span>
              <span className="tabular shrink-0 text-[13px] font-medium text-[var(--ink)]">
                {currency(row.value, currencyCode)}
              </span>
            </div>
            <div className="relative h-2.5 overflow-hidden rounded-[4px] bg-[var(--surface-2)]">
              {showSecondary && row.secondary ? (
                <div
                  className="absolute inset-y-0 left-0 rounded-[4px] bg-[var(--line-strong)] opacity-60"
                  style={{ width: `${secondaryPct}%` }}
                  title={`${secondaryLabel}: ${compact(row.secondary)}`}
                />
              ) : null}
              <div
                className="absolute inset-y-0 left-0 rounded-[4px] transition-[width,filter] duration-500 ease-out"
                style={{
                  width: `${pct}%`,
                  background: color,
                  filter: active && active !== row.label ? 'saturate(0.5) opacity(0.55)' : undefined,
                }}
              />
            </div>
            {row.meta ? (
              <p className="mt-1 text-[11.5px] text-[var(--ink-muted)]">{row.meta}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

interface ColumnProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  currencyCode?: string;
  highlightIndex?: number;
}

/** Vertical columns for short ordered series (weekday spend, aging buckets). */
export function ColumnChart({
  data,
  height = 160,
  currencyCode = 'INR',
  highlightIndex,
}: ColumnProps) {
  const [active, setActive] = useState<number | null>(null);
  if (!data.length) return <EmptyChart />;
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div>
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((d, i) => {
          const pct = (d.value / max) * 100;
          const isActive = active === i || highlightIndex === i;
          return (
            <button
              key={d.label}
              type="button"
              onPointerEnter={() => setActive(i)}
              onPointerLeave={() => setActive(null)}
              className="group relative flex h-full flex-1 flex-col justify-end"
              aria-label={`${d.label}: ${currency(d.value, currencyCode)}`}
            >
              {isActive ? (
                <span className="tabular absolute -top-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-[var(--line)] bg-[var(--surface-raised)] px-1.5 py-0.5 text-[11px] shadow-[var(--shadow-sm)]">
                  {compact(d.value)}
                </span>
              ) : null}
              <span
                className="w-full rounded-t-[4px] transition-[height,opacity] duration-500 ease-out"
                style={{
                  height: `${Math.max(pct, 2)}%`,
                  background: d.color ?? 'var(--s1)',
                  opacity: active !== null && active !== i ? 0.45 : 1,
                }}
              />
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1.5">
        {data.map((d) => (
          <span
            key={d.label}
            className="flex-1 truncate text-center text-[11px] text-[var(--ink-muted)]"
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
