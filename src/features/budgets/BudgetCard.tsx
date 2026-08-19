import { Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { compact, currency, longDate } from '@/lib/format';
import type { BudgetItem } from '@/api/types';

const STATUS = {
  'on-track': { tone: 'good' as const, color: 'var(--good)', label: 'On track' },
  'at-risk': { tone: 'warning' as const, color: 'var(--warning)', label: 'At risk' },
  exceeded: { tone: 'critical' as const, color: 'var(--critical)', label: 'Exceeded' },
};

interface Props {
  budget: BudgetItem;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * The pace marker is the point of this card: a bar at 80% means nothing until
 * you know whether 20% or 90% of the period has elapsed.
 */
export function BudgetCard({ budget: b, onEdit, onDelete }: Props) {
  const status = STATUS[b.status];
  const overPace = b.consumedPct > b.pacePct + 10;

  return (
    <Card hover className="flex flex-col">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[14.5px] font-semibold">{b.name}</p>
          <p className="truncate text-[12px] text-[var(--ink-muted)]">
            {b.categoryName} · {b.period.toLowerCase()}
          </p>
        </div>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>

      <p className="tabular mb-1 text-[24px] font-semibold leading-none tracking-[-0.02em]">
        {currency(b.spent)}
        <span className="text-[14px] font-normal text-[var(--ink-muted)]"> / {compact(b.limit)}</span>
      </p>

      <div className="relative mb-2 mt-3 h-2.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${Math.min(100, b.consumedPct)}%`, background: status.color }}
        />
        <span
          className="absolute top-[-3px] h-4 w-0.5 rounded-full bg-[var(--ink)]"
          style={{ left: `${Math.min(100, b.pacePct)}%`, opacity: 0.5 }}
          title={`${b.pacePct}% of the period has elapsed`}
        />
      </div>

      <div className="mb-3 flex items-baseline justify-between text-[12px]">
        <span className="text-[var(--ink-muted)]">
          {b.consumedPct}% used · {b.pacePct}% elapsed
        </span>
        <span
          className="tabular font-medium"
          style={{ color: b.remaining < 0 ? 'var(--critical-text)' : undefined }}
        >
          {b.remaining >= 0 ? `${compact(b.remaining)} left` : `${compact(-b.remaining)} over`}
        </span>
      </div>

      {overPace ? (
        <p className="mb-3 rounded-lg bg-[color-mix(in_oklab,var(--warning)_12%,transparent)] px-2.5 py-1.5 text-[11.5px] text-[var(--warning-text)]">
          Burning faster than the clock. Projected {compact(b.projectedSpend)} by{' '}
          {longDate(b.windowEnd)}.
        </p>
      ) : null}

      <div className="mt-auto flex gap-2 pt-1">
        <Button size="sm" variant="secondary" onClick={onEdit} className="flex-1">
          Edit
        </Button>
        <Button size="icon" variant="ghost" aria-label="Delete budget" onClick={onDelete}>
          <Trash2 size={15} />
        </Button>
      </div>
    </Card>
  );
}
