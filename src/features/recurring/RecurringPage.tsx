import { useState } from 'react';
import { CalendarClock, Plus } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { StatTile } from '@/components/charts/StatTile';
import { useDeleteRecurring, useRecurring, useRecurringCandidates } from '@/api/queries';
import { useRange } from '@/hooks/useRange';
import { api } from '@/api/client';
import { compact, currency, longDate } from '@/lib/format';
import { toast } from '@/store/toast';
import { RecurringModal } from './RecurringModal';
import { RecurringTable } from './RecurringTable';

export function RecurringPage() {
  const { range } = useRange('12m');
  const { data, isLoading, refetch } = useRecurring();
  const candidates = useRecurringCandidates(range);
  const remove = useDeleteRecurring();
  const [open, setOpen] = useState(false);

  const runNow = async (id: string) => {
    try {
      await api.post(`/recurring/${id}/run`);
      toast.success('Rule posted');
      void refetch();
    } catch (err) {
      toast.error('Could not post', (err as Error).message);
    }
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Subscriptions</h1>
          <p className="mt-0.5 text-[13px] text-[var(--ink-muted)]">
            The fixed cost base: declared commitments plus charges mined from the ledger
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={15} />} onClick={() => setOpen(true)}>
          New rule
        </Button>
      </header>

      {isLoading || !data ? (
        <SkeletonCard height="h-72" />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            <StatTile
              label="Active commitments"
              value={String(data.summary.active)}
              hint="Posting automatically"
              accent="var(--s1)"
              icon={<CalendarClock size={15} />}
            />
            <StatTile
              label="Monthly commitment"
              value={currency(data.summary.monthlyCommitment)}
              hint="Fixed cost before any decision"
              accent="var(--s2)"
            />
            <StatTile
              label="Annual commitment"
              value={currency(data.summary.annualCommitment)}
              hint="What these rules cost per year"
              accent="var(--s4)"
            />
          </section>

          <RecurringTable
            items={data.items}
            onRun={runNow}
            onDelete={async (id) => {
              await remove.mutateAsync(id);
              toast.success('Rule removed');
            }}
          />

          {candidates.data?.items.length ? (
            <Card>
              <CardHeader
                title="Detected, but not declared"
                subtitle="Charges repeating with a stable gap and a stable amount - likely subscriptions"
                action={
                  <Badge tone="warning">
                    {compact(candidates.data.totalMonthlyCost)} a month undeclared
                  </Badge>
                }
              />
              <ul className="grid gap-2.5 md:grid-cols-2">
                {candidates.data.items.slice(0, 8).map((c) => (
                  <li
                    key={c.merchantKey}
                    className="flex items-center gap-3 rounded-xl border border-[var(--line)] p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium">{c.name}</p>
                      <p className="text-[11.5px] text-[var(--ink-muted)]">
                        {c.occurrences} charges · every ~{Math.round(c.medianGapDays)}d · next around{' '}
                        {longDate(c.nextExpected)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="tabular text-[13px] font-medium">{compact(c.averageAmount)}</p>
                      <p className="text-[11px] text-[var(--ink-muted)]">{c.confidence}% match</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </>
      )}

      <RecurringModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
