import { CalendarRange, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { PRESETS, type PresetKey } from '@/hooks/useRange';
import type { RangeParams } from '@/api/queries';

interface Props {
  preset: PresetKey;
  onPreset: (key: PresetKey) => void;
  granularity: RangeParams['granularity'];
  onGranularity: (g: RangeParams['granularity']) => void;
  compact?: boolean;
}

const GRANULARITIES: RangeParams['granularity'][] = ['day', 'week', 'month', 'quarter'];

/** Filters live in one row above the charts, never inside them. */
export function RangePicker({ preset, onPreset, granularity, onGranularity, compact }: Props) {
  const [open, setOpen] = useState(false);
  const active = PRESETS.find((p) => p.key === preset);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex h-9 items-center gap-2 rounded-[10px] border border-[var(--line)] bg-[var(--surface-2)] px-3 text-[13px] text-[var(--ink)] transition-colors hover:border-[var(--brand)]"
        >
          <CalendarRange size={15} className="text-[var(--ink-muted)]" />
          {active?.label ?? 'Range'}
          <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
        </button>
        {open ? (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
            <ul className="animate-scale-in absolute right-0 z-50 mt-1.5 w-48 origin-top-right rounded-xl border border-[var(--line)] bg-[var(--surface-raised)] p-1.5 shadow-[var(--shadow-lg)]">
              {PRESETS.map((p) => (
                <li key={p.key}>
                  <button
                    onClick={() => {
                      onPreset(p.key);
                      setOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-[13px] transition-colors',
                      p.key === preset
                        ? 'bg-[var(--brand-soft)] font-medium text-[var(--brand)]'
                        : 'text-[var(--ink-2)] hover:bg-[var(--surface-2)]',
                    )}
                  >
                    {p.label}
                    {p.key === preset ? <span className="text-[15px] font-bold">✓</span> : null}
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>

      {!compact ? (
        <div className="flex h-9 items-center rounded-[10px] border border-[var(--line)] bg-[var(--surface-2)] p-0.5">
          {GRANULARITIES.map((g) => (
            <button
              key={g}
              onClick={() => onGranularity(g)}
              className={cn(
                'h-8 rounded-lg px-2.5 text-[12.5px] capitalize transition-colors',
                granularity === g
                  ? 'bg-[var(--surface)] font-medium text-[var(--ink)] shadow-[var(--shadow-sm)]'
                  : 'text-[var(--ink-muted)] hover:text-[var(--ink)]',
              )}
            >
              {g}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
