import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { compact, longDate } from '@/lib/format';
import type { OrgCashflow } from '@/api/queries';

/**
 * Forecast plus already-committed invoice outflow. Committed money is not a
 * prediction, so it is listed separately rather than folded into the model.
 */
export function CashProjection({
  data,
  currencyCode: _currencyCode,
}: {
  data?: OrgCashflow;
  currencyCode: string;
}) {
  if (!data) return null;

  return (
    <Card>
      <CardHeader
        title="Cash projection"
        subtitle={`${data.method} · ${data.confidence} confidence`}
        action={
          data.cashOutMonth ? (
            <Badge tone="critical">cash-out in {data.cashOutMonth} periods</Badge>
          ) : (
            <Badge tone="good">no shortfall projected</Badge>
          )
        }
      />

      <ul className="mb-4 space-y-2">
        {data.projection.map((p) => (
          <li
            key={p.period}
            className="flex items-center justify-between gap-3 rounded-lg border border-[var(--line)] px-3 py-2"
          >
            <span className="text-[12.5px] text-[var(--ink-muted)]">Period +{p.period}</span>
            <span className="flex items-center gap-4 text-[12.5px]">
              <span className="tabular text-[var(--s3)]">+{compact(p.projectedInflow)}</span>
              <span className="tabular text-[var(--s2)]">-{compact(p.projectedOutflow)}</span>
              <span
                className="tabular w-20 text-right font-semibold"
                style={{ color: p.projectedCash < 0 ? 'var(--critical-text)' : 'var(--ink)' }}
              >
                {compact(p.projectedCash)}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <p className="mb-2 text-[12px] font-medium text-[var(--ink-2)]">
        Committed outflow · {compact(data.committedOutflow.next30Days)} due within 30 days
      </p>
      <ul className="space-y-1.5">
        {data.committedOutflow.items.slice(0, 5).map((i) => (
          <li key={i.number} className="flex items-center justify-between gap-3 text-[12.5px]">
            <span className="min-w-0 truncate text-[var(--ink-2)]">
              {i.vendor} · {i.number}
            </span>
            <span
              className="shrink-0 text-[var(--ink-muted)]"
              style={{ color: i.daysToDue < 0 ? 'var(--critical-text)' : undefined }}
            >
              {longDate(i.dueDate)}
            </span>
            <span className="tabular w-16 shrink-0 text-right font-medium">
              {compact(i.amount)}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
