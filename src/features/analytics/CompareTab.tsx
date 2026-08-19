import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { StatTile } from '@/components/charts/StatTile';
import { compact, currency, longDate } from '@/lib/format';
import type { CompareResponse } from '@/api/queries';

interface Props {
  data?: CompareResponse;
  loading: boolean;
  currencyCode: string;
}

/**
 * This window against the one before it. Movement is drawn as a diverging bar
 * from a centre line, so an increase and a decrease read as opposites instead
 * of two lengths you have to compare mentally.
 */
export function CompareTab({ data, loading, currencyCode }: Props) {
  if (loading || !data) return <SkeletonCard height="h-96" />;

  const maxDelta = Math.max(...data.byCategory.map((c) => Math.abs(c.delta)), 1);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          label="This period"
          value={currency(data.current.expense, currencyCode)}
          hint={`${longDate(data.current.from)} - ${longDate(data.current.to)}`}
          delta={data.deltaPct}
          deltaGoodWhenUp={false}
          accent="var(--s1)"
        />
        <StatTile
          label="Previous period"
          value={currency(data.previous.expense, currencyCode)}
          hint={`${longDate(data.previous.from)} - ${longDate(data.previous.to)}`}
          accent="var(--ink-muted)"
        />
        <StatTile
          label="Difference"
          value={currency(data.current.expense - data.previous.expense, currencyCode)}
          hint={
            data.biggestIncrease
              ? `Driven mostly by ${data.biggestIncrease.name}`
              : 'Spread across categories'
          }
          accent={data.current.expense > data.previous.expense ? 'var(--s2)' : 'var(--s3)'}
        />
      </div>

      <Card>
        <CardHeader
          title="What moved"
          subtitle="Change per category against the previous period of the same length"
        />
        <ul className="space-y-2.5">
          {data.byCategory.slice(0, 14).map((c) => {
            const up = c.delta > 0;
            const width = (Math.abs(c.delta) / maxDelta) * 50;
            return (
              <li key={c.name} className="grid grid-cols-[9.5rem_1fr_6rem] items-center gap-3">
                <span className="truncate text-[13px] text-[var(--ink-2)]">{c.name}</span>
                <div className="relative h-5">
                  <span
                    className="absolute inset-y-0 left-1/2 w-px bg-[var(--line-strong)]"
                    aria-hidden
                  />
                  <span
                    className="absolute top-1/2 h-2.5 -translate-y-1/2 rounded-[4px] transition-[width] duration-500"
                    style={{
                      width: `${width}%`,
                      left: up ? '50%' : undefined,
                      right: up ? undefined : '50%',
                      background: up ? 'var(--s2)' : 'var(--s3)',
                    }}
                  />
                </div>
                <span className="flex items-center justify-end gap-1 text-right">
                  {up ? (
                    <ArrowUpRight size={12} className="text-[var(--critical-text)]" />
                  ) : (
                    <ArrowDownRight size={12} className="text-[var(--good-text)]" />
                  )}
                  <span className="tabular text-[12.5px] font-medium">{compact(c.delta)}</span>
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-[11.5px] text-[var(--ink-muted)]">
          Bars grow right for an increase and left for a decrease from a shared centre line; the
          arrows repeat the direction so it survives without colour.
        </p>
      </Card>
    </div>
  );
}
