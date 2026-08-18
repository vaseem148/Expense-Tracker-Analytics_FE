import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { signedPercent } from '@/lib/format';
import { Sparkline } from './Sparkline';

interface Props {
  label: string;
  value: string;
  hint?: string;
  delta?: number | null;
  /** true when a rising number is good (income), false when it is bad (spend) */
  deltaGoodWhenUp?: boolean;
  icon?: ReactNode;
  spark?: number[];
  sparkColor?: string;
  accent?: string;
  className?: string;
}

/**
 * A single headline number. Not a chart - a chart would bury the one figure
 * that matters. The delta chip carries an arrow as well as colour, so the
 * direction survives for colourblind readers and in print.
 */
export function StatTile({
  label,
  value,
  hint,
  delta,
  deltaGoodWhenUp = true,
  icon,
  spark,
  sparkColor,
  accent = 'var(--brand)',
  className,
}: Props) {
  const hasDelta = delta !== null && delta !== undefined && Number.isFinite(delta);
  const isFlat = hasDelta && Math.abs(delta as number) < 0.05;
  const isUp = hasDelta && (delta as number) > 0;
  const isGood = isFlat ? null : isUp === deltaGoodWhenUp;

  return (
    <article
      className={cn(
        'card card-hover sheen relative overflow-hidden p-4',
        className,
      )}
    >
      <span
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{ background: accent }}
        aria-hidden
      />
      <header className="flex items-start justify-between gap-3">
        <p className="text-[12px] font-medium tracking-wide text-[var(--ink-muted)] uppercase">
          {label}
        </p>
        {icon ? (
          <span
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg"
            style={{ background: `color-mix(in oklab, ${accent} 14%, transparent)`, color: accent }}
          >
            {icon}
          </span>
        ) : null}
      </header>

      <p className="tabular mt-2 text-[26px] font-semibold leading-none tracking-[-0.02em] text-[var(--ink)]">
        {value}
      </p>

      <footer className="mt-2.5 flex items-end justify-between gap-3">
        <div className="min-w-0">
          {hasDelta ? (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11.5px] font-medium tabular',
                isFlat && 'bg-[var(--surface-2)] text-[var(--ink-muted)]',
                isGood === true &&
                  'bg-[color-mix(in_oklab,var(--good)_14%,transparent)] text-[var(--good-text)]',
                isGood === false &&
                  'bg-[color-mix(in_oklab,var(--critical)_14%,transparent)] text-[var(--critical-text)]',
              )}
            >
              {isFlat ? (
                <Minus size={12} />
              ) : isUp ? (
                <ArrowUpRight size={12} />
              ) : (
                <ArrowDownRight size={12} />
              )}
              {signedPercent(delta)}
            </span>
          ) : null}
          {hint ? (
            <p className="mt-1 truncate text-[11.5px] text-[var(--ink-muted)]">{hint}</p>
          ) : null}
        </div>
        {spark && spark.length > 1 ? (
          <Sparkline data={spark} color={sparkColor ?? accent} width={84} height={26} />
        ) : null}
      </footer>
    </article>
  );
}
