import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { compact, currency } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { DepartmentRow } from '@/api/business.types';

const STATUS = {
  healthy: { tone: 'good' as const, label: 'Healthy' },
  'at-risk': { tone: 'warning' as const, label: 'At risk' },
  over: { tone: 'critical' as const, label: 'Over budget' },
  'no-budget': { tone: 'neutral' as const, label: 'No budget' },
};

const HEADERS = ['Department', 'Consumption', 'Budget', 'Spent', 'Variance', 'Per head', 'Status'];

interface Props {
  data?: {
    items: DepartmentRow[];
    unassigned: { total: number; count: number };
    totalBudget: number;
    totalSpent: number;
  };
  currencyCode: string;
}

export function DepartmentTable({ data, currencyCode }: Props) {
  if (!data) return null;

  return (
    <Card padded={false}>
      <div className="p-5 pb-3">
        <CardHeader
          title="Departments"
          subtitle={`${compact(data.totalSpent)} spent against ${compact(data.totalBudget)} budgeted`}
          className="mb-0"
          action={
            data.unassigned.count ? (
              <Badge tone="warning">
                {data.unassigned.count} unassigned · {compact(data.unassigned.total)}
              </Badge>
            ) : null
          }
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem] border-collapse text-left">
          <thead>
            <tr className="border-y border-[var(--line)] bg-[var(--surface-2)]">
              {HEADERS.map((h) => (
                <th
                  key={h}
                  className={cn(
                    'px-4 py-2.5 text-[11.5px] font-semibold uppercase tracking-wide text-[var(--ink-muted)]',
                    !['Department', 'Consumption', 'Status'].includes(h) && 'text-right',
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.items.map((d) => {
              const status = STATUS[d.status];
              const pct = Math.min(100, d.consumedPct ?? 0);
              return (
                <tr
                  key={d.id}
                  className="border-b border-[var(--line)] transition-colors last:border-0 hover:bg-[var(--surface-2)]"
                >
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-[3px]"
                        style={{ background: d.color }}
                        aria-hidden
                      />
                      <span className="text-[13.5px] font-medium">{d.name}</span>
                      <span className="text-[11px] text-[var(--ink-muted)]">
                        {d.code} · {d.headcount} people
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-2 w-36 overflow-hidden rounded-[4px] bg-[var(--surface-2)]">
                      <div
                        className="h-full rounded-[4px] transition-[width] duration-500"
                        style={{
                          width: `${pct}%`,
                          background:
                            d.status === 'over'
                              ? 'var(--critical)'
                              : d.status === 'at-risk'
                                ? 'var(--warning)'
                                : d.color,
                        }}
                      />
                    </div>
                    <span className="tabular mt-1 block text-[11px] text-[var(--ink-muted)]">
                      {d.consumedPct !== null ? `${d.consumedPct}% of budget` : 'no budget set'}
                    </span>
                  </td>
                  <td className="tabular px-4 py-3 text-right text-[13px] text-[var(--ink-2)]">
                    {compact(d.budget)}
                  </td>
                  <td className="tabular px-4 py-3 text-right text-[13px] font-medium">
                    {currency(d.spent, currencyCode)}
                  </td>
                  <td
                    className="tabular px-4 py-3 text-right text-[13px]"
                    style={{ color: d.variance < 0 ? 'var(--critical-text)' : 'var(--good-text)' }}
                  >
                    {compact(d.variance)}
                  </td>
                  <td className="tabular px-4 py-3 text-right text-[13px] text-[var(--ink-2)]">
                    {compact(d.perHead)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
