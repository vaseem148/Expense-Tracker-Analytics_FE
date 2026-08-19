import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Sparkline } from '@/components/charts/Sparkline';
import { compact, currency, signedPercent } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { CategorySlice } from '@/api/types';

const HEADERS = ['Category', 'Trend', 'Total', 'Share', 'Average', 'Largest', 'Volatility'];

export function CategoryTable({
  slices,
  currencyCode,
}: {
  slices: CategorySlice[];
  currencyCode: string;
}) {
  return (
    <Card padded={false}>
      <div className="p-5 pb-3">
        <CardHeader
          title="Category detail"
          subtitle="Trend slope, dispersion and typical ticket size"
          className="mb-0"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[46rem] border-collapse text-left">
          <thead>
            <tr className="border-y border-[var(--line)] bg-[var(--surface-2)]">
              {HEADERS.map((h) => (
                <th
                  key={h}
                  className={cn(
                    'px-4 py-2.5 text-[11.5px] font-semibold uppercase tracking-wide text-[var(--ink-muted)]',
                    !['Category', 'Trend'].includes(h) && 'text-right',
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slices.map((s, i) => (
              <tr
                key={s.categoryId ?? s.name}
                className="border-b border-[var(--line)] transition-colors last:border-0 hover:bg-[var(--surface-2)]"
              >
                <td className="px-4 py-2.5">
                  <span className="flex items-center gap-2 text-[13px] font-medium">
                    <span
                      className="h-2.5 w-2.5 rounded-[3px]"
                      style={{ background: `var(--s${(i % 8) + 1})` }}
                      aria-hidden
                    />
                    {s.name}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkline
                      data={s.sparkline}
                      width={72}
                      height={22}
                      color={`var(--s${(i % 8) + 1})`}
                    />
                    {s.trendPct !== null ? (
                      <span
                        className="tabular text-[11.5px]"
                        style={{
                          color:
                            s.trendPct > 8
                              ? 'var(--critical-text)'
                              : s.trendPct < -8
                                ? 'var(--good-text)'
                                : 'var(--ink-muted)',
                        }}
                      >
                        {signedPercent(s.trendPct, 0)}
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="tabular px-4 py-2.5 text-right text-[13px] font-medium">
                  {currency(s.total, currencyCode)}
                </td>
                <td className="tabular px-4 py-2.5 text-right text-[13px] text-[var(--ink-muted)]">
                  {s.share.toFixed(1)}%
                </td>
                <td className="tabular px-4 py-2.5 text-right text-[13px] text-[var(--ink-2)]">
                  {compact(s.average)}
                </td>
                <td className="tabular px-4 py-2.5 text-right text-[13px] text-[var(--ink-2)]">
                  {compact(s.largest)}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Badge tone={s.volatility > 0.8 ? 'warning' : 'neutral'}>
                    {s.volatility.toFixed(2)}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="px-5 py-3 text-[11.5px] text-[var(--ink-muted)]">
        Volatility is the coefficient of variation across buckets - above 0.8 the category is
        lumpy enough that an average tells you very little.
      </p>
    </Card>
  );
}
