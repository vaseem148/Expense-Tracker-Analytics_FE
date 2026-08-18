import { useMemo, useState } from 'react';
import { compact, currency } from '@/lib/format';
import { SEQUENTIAL_VARS } from '@/lib/palette';
import { EmptyChart } from './primitives';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Props {
  grid: number[][];
  currencyCode?: string;
}

/**
 * Weekday x hour spend grid on a single-hue sequential ramp - magnitude is one
 * variable, so it gets one hue from light to dark, never a rainbow.
 * Hours are bucketed into 3-hour blocks so each cell stays a legible size.
 */
export function Heatmap({ grid, currencyCode = 'INR' }: Props) {
  const [hover, setHover] = useState<{ day: number; block: number } | null>(null);

  const { blocks, max } = useMemo(() => {
    if (!grid.length) return { blocks: [] as number[][], max: 0 };
    const bucketed = grid.map((row) => {
      const out: number[] = [];
      for (let h = 0; h < 24; h += 3) {
        out.push(row.slice(h, h + 3).reduce((a, b) => a + b, 0));
      }
      return out;
    });
    return { blocks: bucketed, max: Math.max(...bucketed.flat(), 1) };
  }, [grid]);

  if (!blocks.length) return <EmptyChart />;

  const active = hover ? blocks[hover.day][hover.block] : null;

  return (
    <div>
      <div className="flex gap-1.5">
        <div className="flex w-9 shrink-0 flex-col gap-1 pt-5">
          {DAYS.map((d) => (
            <span
              key={d}
              className="flex h-6 items-center text-[11px] text-[var(--ink-muted)]"
            >
              {d}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex gap-1">
            {['12a', '3a', '6a', '9a', '12p', '3p', '6p', '9p'].map((h) => (
              <span key={h} className="flex-1 text-center text-[10.5px] text-[var(--ink-muted)]">
                {h}
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            {blocks.map((row, day) => (
              <div key={day} className="flex gap-1">
                {row.map((value, block) => {
                  const intensity = value / max;
                  const step =
                    value === 0
                      ? 'var(--surface-2)'
                      : SEQUENTIAL_VARS[
                          Math.min(
                            SEQUENTIAL_VARS.length - 1,
                            Math.floor(Math.sqrt(intensity) * SEQUENTIAL_VARS.length),
                          )
                        ];
                  const isHover = hover?.day === day && hover?.block === block;
                  return (
                    <button
                      key={block}
                      type="button"
                      onPointerEnter={() => setHover({ day, block })}
                      onPointerLeave={() => setHover(null)}
                      className="h-6 flex-1 rounded-[4px] transition-[transform,box-shadow] duration-150"
                      style={{
                        background: step,
                        transform: isHover ? 'scale(1.12)' : undefined,
                        boxShadow: isHover ? '0 0 0 2px var(--surface), 0 0 0 3px var(--brand)' : undefined,
                      }}
                      aria-label={`${DAYS[day]} ${block * 3}:00 - ${currency(value, currencyCode)}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="text-[12px] text-[var(--ink-muted)]">
          {hover ? (
            <>
              <span className="font-medium text-[var(--ink)]">
                {DAYS[hover.day]} {hover.block * 3}:00-{hover.block * 3 + 3}:00
              </span>{' '}
              · {currency(active ?? 0, currencyCode)}
            </>
          ) : (
            'Hover a block to see the total'
          )}
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[var(--ink-muted)]">Less</span>
          {SEQUENTIAL_VARS.map((v) => (
            <span key={v} className="h-3 w-3 rounded-[3px]" style={{ background: v }} />
          ))}
          <span className="text-[11px] text-[var(--ink-muted)]">
            More · {compact(max)}
          </span>
        </div>
      </div>
    </div>
  );
}
