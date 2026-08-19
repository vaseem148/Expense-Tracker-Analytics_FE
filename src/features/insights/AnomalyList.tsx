import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { currency, longDate } from '@/lib/format';
import type { Anomaly } from '@/api/types';

export function AnomalyList({
  items,
  model,
  loading,
}: {
  items: Anomaly[];
  model?: string;
  loading: boolean;
}) {
  return (
    <Card padded={false}>
      <div className="p-5 pb-3">
        <CardHeader
          title="Detected anomalies"
          subtitle={model ? `${model} · ${items.length} flagged` : 'Statistically unusual charges'}
          className="mb-0"
        />
      </div>
      {loading ? (
        <div className="p-5">
          <SkeletonCard height="h-40" />
        </div>
      ) : items.length ? (
        <ul className="divide-y divide-[var(--line)] border-t border-[var(--line)]">
          {items.slice(0, 12).map((a) => (
            <li
              key={a.transactionId}
              className="flex flex-wrap items-center gap-3 p-4 transition-colors hover:bg-[var(--surface-2)]"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: a.categoryColor }}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-medium">{a.description}</p>
                <p className="text-[11.5px] text-[var(--ink-muted)]">
                  {a.category} · {longDate(a.date)}
                  {a.reason ? ` · ${a.reason}` : ''}
                </p>
              </div>
              <span className="tabular text-[14px] font-semibold">{currency(a.amount)}</span>
              <Badge tone={a.score > 4 ? 'critical' : 'warning'}>{a.score.toFixed(1)}</Badge>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-5 py-16 text-center text-[13px] text-[var(--ink-muted)]">
          Nothing unusual in this window
        </p>
      )}
    </Card>
  );
}
