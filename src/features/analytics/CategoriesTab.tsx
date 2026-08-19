import { useState } from 'react';
import { PieChart, Table2 } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { DonutChart } from '@/components/charts/DonutChart';
import { currency } from '@/lib/format';
import { foldToPalette } from '@/lib/palette';
import { cn } from '@/lib/cn';
import type { CategorySlice, ParetoResponse } from '@/api/types';
import { CategoryTable } from './CategoryTable';

interface Props {
  data?: { type: string; slices: CategorySlice[]; pareto: ParetoResponse };
  loading: boolean;
  currencyCode: string;
}

/**
 * Category view. The table toggle is not decoration - three light-mode palette
 * slots sit under 3:1 against the surface, and a table view is one of the two
 * accepted reliefs for that (direct labels, which the donut already ships,
 * being the other).
 */
export function CategoriesTab({ data, loading, currencyCode }: Props) {
  const [view, setView] = useState<'chart' | 'table'>('chart');

  if (loading || !data) return <SkeletonCard height="h-96" />;

  const coloured = foldToPalette(
    data.slices.map((s) => ({ ...s, name: s.name, total: s.total })),
    7,
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Category split"
            subtitle={`${data.slices.length} categories · ${data.pareto.concentration} concentration`}
            action={
              <div className="flex rounded-lg border border-[var(--line)] p-0.5">
                {(['chart', 'table'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    aria-label={`${v} view`}
                    className={cn(
                      'grid h-7 w-7 place-items-center rounded-md transition-colors',
                      view === v
                        ? 'bg-[var(--surface-2)] text-[var(--ink)]'
                        : 'text-[var(--ink-muted)] hover:text-[var(--ink)]',
                    )}
                  >
                    {v === 'chart' ? <PieChart size={14} /> : <Table2 size={14} />}
                  </button>
                ))}
              </div>
            }
          />
          {view === 'chart' ? (
            <DonutChart
              data={data.slices.map((s) => ({ name: s.name, total: s.total }))}
              currencyCode={currencyCode}
              size={200}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[var(--line)]">
                    {['Category', 'Total', 'Share', 'Count'].map((h) => (
                      <th
                        key={h}
                        className={cn(
                          'py-2 text-[11.5px] font-semibold uppercase tracking-wide text-[var(--ink-muted)]',
                          h !== 'Category' && 'text-right',
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {coloured.map((s) => (
                    <tr key={s.name} className="border-b border-[var(--line)] last:border-0">
                      <td className="py-2">
                        <span className="flex items-center gap-2 text-[13px]">
                          <span
                            className="h-2.5 w-2.5 rounded-[3px]"
                            style={{ background: s.color }}
                            aria-hidden
                          />
                          {s.name}
                        </span>
                      </td>
                      <td className="tabular py-2 text-right text-[13px]">
                        {currency(s.total, currencyCode)}
                      </td>
                      <td className="tabular py-2 text-right text-[13px] text-[var(--ink-muted)]">
                        {s.share.toFixed(1)}%
                      </td>
                      <td className="tabular py-2 text-right text-[13px] text-[var(--ink-muted)]">
                        {s.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Concentration"
            subtitle="How much of your spend a handful of categories carries"
            action={
              <Badge
                tone={
                  data.pareto.concentration === 'high'
                    ? 'critical'
                    : data.pareto.concentration === 'moderate'
                      ? 'warning'
                      : 'good'
                }
              >
                Gini {data.pareto.gini.toFixed(2)}
              </Badge>
            }
          />
          <div className="mb-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3.5">
            <p className="text-[13px] text-[var(--ink-2)]">
              <span className="font-semibold text-[var(--ink)]">
                {data.pareto.vitalFew.length} categories
              </span>{' '}
              account for {data.pareto.vitalFewShare.toFixed(1)}% of everything you spend.
            </p>
            <p className="mt-1 text-[12px] text-[var(--ink-muted)]">
              {data.pareto.vitalFew.join(' · ')}
            </p>
          </div>

          <ul className="space-y-2">
            {data.pareto.points.slice(0, 8).map((p, i) => (
              <li key={p.name}>
                <div className="mb-1 flex items-baseline justify-between gap-2">
                  <span className="truncate text-[12.5px] text-[var(--ink-2)]">{p.name}</span>
                  <span className="tabular text-[12px] text-[var(--ink-muted)]">
                    {p.cumulativeShare.toFixed(1)}% cumulative
                  </span>
                </div>
                <div className="relative h-2 overflow-hidden rounded-[4px] bg-[var(--surface-2)]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-[4px] opacity-30"
                    style={{ width: `${p.cumulativeShare}%`, background: 'var(--s1)' }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 rounded-[4px] transition-[width] duration-500"
                    style={{
                      width: `${(p.total / data.pareto.points[0].total) * 100}%`,
                      background: `var(--s${(i % 8) + 1})`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11.5px] text-[var(--ink-muted)]">
            Solid bar is the category total; the pale bar behind it is the running cumulative share.
          </p>
        </Card>
      </div>

      <CategoryTable slices={data.slices} currencyCode={currencyCode} />
    </div>
  );
}
