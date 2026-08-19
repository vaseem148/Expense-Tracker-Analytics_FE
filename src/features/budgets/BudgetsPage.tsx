import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { StatTile } from '@/components/charts/StatTile';
import { useBudgets, useDeleteBudget } from '@/api/queries';
import { currency } from '@/lib/format';
import { toast } from '@/store/toast';
import type { BudgetItem } from '@/api/types';
import { BudgetCard } from './BudgetCard';
import { BudgetModal } from './BudgetModal';

export function BudgetsPage() {
  const { data, isLoading } = useBudgets();
  const remove = useDeleteBudget();
  const [editing, setEditing] = useState<BudgetItem | null>(null);
  const [open, setOpen] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (b: BudgetItem) => {
    setEditing(b);
    setOpen(true);
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Budgets</h1>
          <p className="mt-0.5 text-[13px] text-[var(--ink-muted)]">
            Cost-centre and category caps, measured against the clock rather than the cap alone
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={15} />} onClick={openCreate}>
          New budget
        </Button>
      </header>

      {isLoading || !data ? (
        <SkeletonCard height="h-72" />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label="Budgeted"
              value={currency(data.totalBudgeted)}
              hint={`${data.items.length} active budgets`}
              accent="var(--s1)"
            />
            <StatTile
              label="Spent"
              value={currency(data.totalSpent)}
              hint={`${((data.totalSpent / Math.max(1, data.totalBudgeted)) * 100).toFixed(0)}% of the total cap`}
              accent="var(--s2)"
            />
            <StatTile
              label="Adherence"
              value={`${data.adherencePct}%`}
              hint="Weighted by budget size"
              accent="var(--s3)"
            />
            <StatTile
              label="Needs attention"
              value={String(data.exceeded + data.atRisk)}
              hint={`${data.exceeded} exceeded · ${data.atRisk} at risk`}
              accent={data.exceeded ? 'var(--critical)' : 'var(--s4)'}
            />
          </section>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.items.map((b) => (
              <BudgetCard
                key={b.id}
                budget={b}
                onEdit={() => openEdit(b)}
                onDelete={async () => {
                  await remove.mutateAsync(b.id);
                  toast.success('Budget removed');
                }}
              />
            ))}

            {!data.items.length ? (
              <Card className="col-span-full py-16 text-center">
                <p className="text-[14px] font-medium">No budgets yet</p>
                <p className="mt-1 text-[13px] text-[var(--ink-muted)]">
                  A cap plus a pace marker turns company spend into something you can steer.
                </p>
                <Button variant="primary" className="mx-auto mt-4" onClick={openCreate}>
                  Create your first budget
                </Button>
              </Card>
            ) : null}
          </div>
        </>
      )}

      <BudgetModal open={open} onClose={() => setOpen(false)} editing={editing} />
    </div>
  );
}
