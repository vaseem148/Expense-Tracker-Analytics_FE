import { Link } from 'react-router-dom';
import { PiggyBank } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { BudgetPerformance } from '@/api/types';
import { compact, currency } from '@/lib/format';

const STATUS_TONE = {
  'on-track': { tone: 'good' as const, color: 'var(--good)' },
  'at-risk': { tone: 'warning' as const, color: 'var(--warning)' },
  exceeded: { tone: 'critical' as const, color: 'var(--critical)' },
};

/**
 * Budgets read against the clock, not just the cap: the thin marker is where
 * you *should* be by now, so "80% spent" on day 5 looks wrong immediately.
 */
export function BudgetStrip({
  budgets,
  currencyCode,
}: {
  budgets: BudgetPerformance;
  currencyCode: string;
}) {
  if (!budgets.items.length) return null;

  return (
    <Card>
      <CardHeader
        title="Budgets"
        subtitle={`${compact(budgets.totalSpent)} of ${compact(budgets.totalBudgeted)} used · ${budgets.adherencePct}% adherence`}
        icon={<PiggyBank size={15} />}
        action={
          <Link to="/budgets" className="text-[12.5px] text-[var(--brand)] hover:underline">
            Manage
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {budgets.items.slice(0, 6).map((b) => {
          const status = STATUS_TONE[b.status];
          return (
            <article key={b.id} className="rounded-xl border border-[var(--line)] p-3.5">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-medium">{b.name}</p>
                  <p className="truncate text-[11.5px] text-[var(--ink-muted)]">{b.categoryName}</p>
                </div>
                <Badge tone={status.tone}>{b.status.replace('-', ' ')}</Badge>
              </div>

              <div className="relative h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
                <div
                  className="h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{
                    width: `${Math.min(100, b.consumedPct)}%`,
                    background: status.color,
                  }}
                />
                {/* pace marker: where the clock says you should be */}
                <span
                  className="absolute top-[-2px] h-3 w-0.5 rounded-full bg-[var(--ink)]"
                  style={{ left: `${Math.min(100, b.pacePct)}%`, opacity: 0.45 }}
                  title={`Pace: ${b.pacePct}% of the period elapsed`}
                />
              </div>

              <div className="mt-2 flex items-baseline justify-between gap-2">
                <span className="tabular text-[12.5px] text-[var(--ink-2)]">
                  {currency(b.spent, currencyCode)}{' '}
                  <span className="text-[var(--ink-muted)]">
                    / {compact(b.limit)}
                  </span>
                </span>
                <span
                  className="tabular text-[12.5px] font-medium"
                  style={{ color: b.consumedPct >= 100 ? 'var(--critical-text)' : undefined }}
                >
                  {b.consumedPct}%
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </Card>
  );
}
