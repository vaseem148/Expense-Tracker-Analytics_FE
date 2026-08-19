import { Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Gauge } from '@/components/charts/Gauge';
import { compact, longDate } from '@/lib/format';
import type { Goal } from '@/api/types';

interface Props {
  goal: Goal;
  contributing: boolean;
  onEdit: () => void;
  onContribute: (amount: number) => void;
  onDelete: () => void;
}

export function GoalCard({ goal: g, contributing, onEdit, onContribute, onDelete }: Props) {
  // "Tight" = a near deadline with most of the target still outstanding.
  const tight = g.daysLeft !== null && g.daysLeft < 45 && g.progressPct < 80;

  return (
    <Card hover className="flex flex-col">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[14.5px] font-semibold">{g.name}</p>
          <p className="text-[12px] text-[var(--ink-muted)]">
            {g.targetDate ? `by ${longDate(g.targetDate)}` : 'no deadline'}
            {g.daysLeft !== null ? ` · ${g.daysLeft} days left` : ''}
          </p>
        </div>
        {tight ? <Badge tone="warning">tight</Badge> : null}
      </div>

      <div className="flex items-center gap-5">
        <Gauge value={g.progressPct} size={104} thickness={8} color={g.color} sublabel="%" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="tabular text-[18px] font-semibold leading-none">
            {compact(g.saved)}
            <span className="text-[13px] font-normal text-[var(--ink-muted)]">
              {' '}
              / {compact(g.target)}
            </span>
          </p>
          <p className="text-[12px] text-[var(--ink-muted)]">{compact(g.remaining)} to go</p>
          {g.requiredMonthly ? (
            <p className="text-[12px] text-[var(--ink-2)]">
              Set aside{' '}
              <span className="font-medium text-[var(--ink)]">{compact(g.requiredMonthly)}</span> a
              month
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button
          size="sm"
          variant="primary"
          className="flex-1"
          loading={contributing}
          onClick={() => {
            const input = window.prompt(`Add to "${g.name}"`, '5000');
            if (input) onContribute(Number(input));
          }}
        >
          Add funds
        </Button>
        <Button size="sm" variant="secondary" onClick={onEdit}>
          Edit
        </Button>
        <Button size="icon" variant="ghost" aria-label="Delete goal" onClick={onDelete}>
          <Trash2 size={15} />
        </Button>
      </div>
    </Card>
  );
}
