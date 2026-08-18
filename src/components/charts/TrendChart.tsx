import { useMemo, useState } from 'react';
import { compact, currency } from '@/lib/format';
import {
  AxisLabel,
  ChartTooltip,
  DEFAULT_MARGIN,
  EmptyChart,
  GridLines,
  Legend,
  TooltipRow,
  linearScale,
  niceTicks,
  smoothPath,
  useMeasure,
  usePointer,
} from './primitives';

export interface TrendPoint {
  label: string;
  expense: number;
  income?: number;
  movingAvg?: number | null;
}

export interface TrendForecast {
  label: string;
  value: number;
  lower: number;
  upper: number;
}

interface Props {
  data: TrendPoint[];
  forecast?: TrendForecast[];
  height?: number;
  currencyCode?: string;
  showIncome?: boolean;
  showMovingAverage?: boolean;
}

interface Geometry {
  all: { label: string; expense: number; income?: number; movingAvg?: number | null; forecast: boolean }[];
  ticks: number[];
  y: (v: number) => number;
  x: (i: number) => number;
  step: number;
  historyCount: number;
}

/**
 * Spend over time with an optional forecast tail.
 *
 * One y-axis only: expense and income are the same measure in the same unit, so
 * they share a scale. The forecast is dashed inside a translucent prediction
 * band and separated by a dotted seam - a projection that looks identical to
 * history is the fastest way to mislead someone.
 */
export function TrendChart({
  data,
  forecast = [],
  height = 260,
  currencyCode = 'INR',
  showIncome = true,
  showMovingAverage = true,
}: Props) {
  const { ref, width } = useMeasure<HTMLDivElement>();
  const { pointer, onMove, onPointerLeave } = usePointer();
  const [, setHover] = useState<number | null>(null);

  const margin = DEFAULT_MARGIN;
  const innerW = Math.max(0, width - margin.left - margin.right);
  const innerH = height - margin.top - margin.bottom;

  const geometry = useMemo<Geometry | null>(() => {
    if (!data.length || innerW <= 0) return null;
    const all = [
      ...data.map((d) => ({ ...d, forecast: false })),
      ...forecast.map((f) => ({
        label: f.label,
        expense: f.value,
        income: undefined,
        movingAvg: null,
        forecast: true,
      })),
    ];
    const maxValue = Math.max(
      1,
      ...data.map((d) => Math.max(d.expense, showIncome ? (d.income ?? 0) : 0)),
      ...forecast.map((f) => f.upper),
    );
    const ticks = niceTicks(maxValue, 4);
    const yMax = ticks[ticks.length - 1];
    const y = linearScale([0, yMax], [innerH, 0]);
    const step = all.length > 1 ? innerW / (all.length - 1) : 0;
    return { all, ticks, y, x: (i: number) => i * step, step, historyCount: data.length };
  }, [data, forecast, innerW, innerH, showIncome]);

  if (!data.length) return <EmptyChart />;

  const activeIndex =
    pointer && geometry
      ? (() => {
          const relative = pointer.x - margin.left;
          if (relative < -12 || relative > innerW + 12) return null;
          return Math.min(
            geometry.all.length - 1,
            Math.max(0, Math.round(relative / (geometry.step || 1))),
          );
        })()
      : null;

  const active = activeIndex !== null && geometry ? geometry.all[activeIndex] : null;
  const activeForecast =
    activeIndex !== null && geometry && activeIndex >= geometry.historyCount
      ? forecast[activeIndex - geometry.historyCount]
      : null;

  return (
    <div ref={ref} className="relative w-full">
      {geometry && width > 0 ? (
        <>
          <svg
            width={width}
            height={height}
            role="img"
            aria-label="Spending over time with forecast"
            onPointerMove={(e) => {
              onMove(e);
              setHover(activeIndex);
            }}
            onPointerLeave={onPointerLeave}
            className="overflow-visible touch-none"
          >
            <defs>
              <linearGradient id="trend-expense-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--s1)" stopOpacity="0.26" />
                <stop offset="100%" stopColor="var(--s1)" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="trend-income-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--s3)" stopOpacity="0.18" />
                <stop offset="100%" stopColor="var(--s3)" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            <g transform={`translate(${margin.left},${margin.top})`}>
              <GridLines ticks={geometry.ticks} scale={geometry.y} x0={0} x1={innerW} />

              {geometry.ticks.map((t) => (
                <AxisLabel key={t} x={-10} y={geometry.y(t)} anchor="end">
                  {compact(t)}
                </AxisLabel>
              ))}

              {forecast.length ? (
                <path d={buildBand(forecast, geometry)} fill="var(--s1)" fillOpacity={0.1} />
              ) : null}

              <path
                d={`${smoothPath(data.map((d, i) => ({ x: geometry.x(i), y: geometry.y(d.expense) })))} L${geometry.x(data.length - 1)},${innerH} L0,${innerH} Z`}
                fill="url(#trend-expense-fill)"
              />
              <path
                d={smoothPath(data.map((d, i) => ({ x: geometry.x(i), y: geometry.y(d.expense) })))}
                fill="none"
                stroke="var(--s1)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="chart-line"
                style={{ ['--dash' as string]: '2600' }}
              />

              {showIncome && data.some((d) => (d.income ?? 0) > 0) ? (
                <>
                  <path
                    d={`${smoothPath(data.map((d, i) => ({ x: geometry.x(i), y: geometry.y(d.income ?? 0) })))} L${geometry.x(data.length - 1)},${innerH} L0,${innerH} Z`}
                    fill="url(#trend-income-fill)"
                  />
                  <path
                    d={smoothPath(
                      data.map((d, i) => ({ x: geometry.x(i), y: geometry.y(d.income ?? 0) })),
                    )}
                    fill="none"
                    stroke="var(--s3)"
                    strokeWidth={2}
                    strokeLinecap="round"
                    className="chart-line"
                    style={{ ['--dash' as string]: '2600' }}
                  />
                </>
              ) : null}

              {showMovingAverage && data.some((d) => d.movingAvg != null) ? (
                <path
                  d={smoothPath(
                    data
                      .map((d, i) =>
                        d.movingAvg == null
                          ? null
                          : { x: geometry.x(i), y: geometry.y(d.movingAvg) },
                      )
                      .filter(Boolean) as { x: number; y: number }[],
                  )}
                  fill="none"
                  stroke="var(--ink-muted)"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  opacity={0.85}
                />
              ) : null}

              {forecast.length ? (
                <>
                  <line
                    x1={geometry.x(data.length - 1)}
                    x2={geometry.x(data.length - 1)}
                    y1={0}
                    y2={innerH}
                    stroke="var(--line-strong)"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                  />
                  <path
                    d={smoothPath([
                      {
                        x: geometry.x(data.length - 1),
                        y: geometry.y(data[data.length - 1].expense),
                      },
                      ...forecast.map((f, i) => ({
                        x: geometry.x(data.length + i),
                        y: geometry.y(f.value),
                      })),
                    ])}
                    fill="none"
                    stroke="var(--s1)"
                    strokeWidth={2}
                    strokeDasharray="6 5"
                    strokeLinecap="round"
                    opacity={0.9}
                  />
                </>
              ) : null}

              {activeIndex !== null ? (
                <g pointerEvents="none">
                  <line
                    x1={geometry.x(activeIndex)}
                    x2={geometry.x(activeIndex)}
                    y1={0}
                    y2={innerH}
                    stroke="var(--line-strong)"
                    strokeWidth={1}
                  />
                  <circle
                    cx={geometry.x(activeIndex)}
                    cy={geometry.y(geometry.all[activeIndex].expense)}
                    r={4.5}
                    fill="var(--s1)"
                    stroke="var(--surface)"
                    strokeWidth={2}
                  />
                  {showIncome && geometry.all[activeIndex].income ? (
                    <circle
                      cx={geometry.x(activeIndex)}
                      cy={geometry.y(geometry.all[activeIndex].income ?? 0)}
                      r={4.5}
                      fill="var(--s3)"
                      stroke="var(--surface)"
                      strokeWidth={2}
                    />
                  ) : null}
                </g>
              ) : null}

              {geometry.all.map((point, i) => {
                const every = Math.max(1, Math.ceil(geometry.all.length / (innerW < 420 ? 4 : 8)));
                if (i % every !== 0 && i !== geometry.all.length - 1) return null;
                return (
                  <AxisLabel key={`${point.label}-${i}`} x={geometry.x(i)} y={innerH + 16}>
                    {point.label}
                  </AxisLabel>
                );
              })}
            </g>
          </svg>

          {active && pointer ? (
            <ChartTooltip x={pointer.x} y={pointer.y} containerWidth={width}>
              <p className="mb-1.5 text-[11.5px] font-medium uppercase tracking-wide text-[var(--ink-muted)]">
                {active.label}
                {activeForecast ? ' · forecast' : ''}
              </p>
              <TooltipRow
                color="var(--s1)"
                label={activeForecast ? 'Projected' : 'Spent'}
                value={currency(active.expense, currencyCode)}
                strong
              />
              {activeForecast ? (
                <TooltipRow
                  label="Likely range"
                  value={`${compact(activeForecast.lower)} - ${compact(activeForecast.upper)}`}
                />
              ) : null}
              {showIncome && active.income ? (
                <TooltipRow
                  color="var(--s3)"
                  label="Received"
                  value={currency(active.income, currencyCode)}
                />
              ) : null}
              {!activeForecast && active.movingAvg != null ? (
                <TooltipRow
                  color="var(--ink-muted)"
                  label="Moving average"
                  value={currency(active.movingAvg, currencyCode)}
                />
              ) : null}
            </ChartTooltip>
          ) : null}
        </>
      ) : (
        <div style={{ height }} />
      )}

      <Legend
        className="mt-3 pl-1"
        items={[
          { label: 'Spent', color: 'var(--s1)' },
          ...(showIncome ? [{ label: 'Received', color: 'var(--s3)' }] : []),
          ...(showMovingAverage ? [{ label: 'Moving average', color: 'var(--ink-muted)' }] : []),
          ...(forecast.length ? [{ label: 'Forecast', color: 'var(--s1)' }] : []),
        ]}
      />
    </div>
  );
}

/** Upper edge forward, lower edge back - one closed path for the interval. */
function buildBand(forecast: TrendForecast[], geometry: Geometry): string {
  const upper = forecast.map((f, i) => ({
    x: geometry.x(geometry.historyCount + i),
    y: geometry.y(f.upper),
  }));
  const lower = forecast
    .map((f, i) => ({ x: geometry.x(geometry.historyCount + i), y: geometry.y(f.lower) }))
    .reverse();
  if (!upper.length) return '';
  return `${smoothPath(upper)} L${lower[0].x},${lower[0].y} ${lower
    .slice(1)
    .map((p) => `L${p.x},${p.y}`)
    .join(' ')} Z`;
}
