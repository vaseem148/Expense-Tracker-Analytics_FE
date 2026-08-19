import { useState } from 'react';
import { CheckCircle2, Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useContributeGoal, useDeleteGoal, useGoals } from '@/api/queries';
import { compact } from '@/lib/format';
import { toast } from '@/store/toast';
import type { Goal } from '@/api/types';
import { GoalCard } from './GoalCard';
import { GoalModal } from './GoalModal';

export function GoalsPage() {
  const { data, isLoading } = useGoals();
  const contribute = useContributeGoal();
  const remove = useDeleteGoal();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);

  const active = (data ?? []).filter((g) => !g.isAchieved);
  const done = (data ?? []).filter((g) => g.isAchieved);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Savings goals</h1>
          <p className="mt-0.5 text-[13px] text-[var(--ink-muted)]">
            Each goal shows what you must set aside monthly to land on time
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={15} />}
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          New goal
        </Button>
      </header>

      {isLoading ? (
        <SkeletonCard height="h-64" />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {active.map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                contributing={contribute.isPending}
                onEdit={() => {
                  setEditing(g);
                  setOpen(true);
                }}
                onContribute={async (amount) => {
                  await contribute.mutateAsync({ id: g.id, amount });
                  toast.success('Contribution recorded');
                }}
                onDelete={async () => {
                  await remove.mutateAsync(g.id);
                  toast.success('Goal removed');
                }}
              />
            ))}

            {!active.length ? (
              <Card className="col-span-full py-16 text-center">
                <p className="text-[14px] font-medium">No active goals</p>
                <p className="mt-1 text-[13px] text-[var(--ink-muted)]">
                  A target with a date turns saving into one monthly number.
                </p>
              </Card>
            ) : null}
          </div>

          {done.length ? (
            <Card>
              <p className="mb-3 flex items-center gap-2 text-[13.5px] font-semibold">
                <CheckCircle2 size={16} className="text-[var(--good-text)]" />
                Achieved
              </p>
              <ul className="flex flex-wrap gap-2">
                {done.map((g) => (
                  <li key={g.id}>
                    <Badge tone="good">
                      {g.name} · {compact(g.target)}
                    </Badge>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </>
      )}

      <GoalModal open={open} onClose={() => setOpen(false)} editing={editing} />
    </div>
  );
}
