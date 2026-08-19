import { useState } from 'react';
import { Receipt } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useClaimAction, useOrgClaims } from '@/api/queries';
import { compact } from '@/lib/format';
import { toast } from '@/store/toast';
import { cn } from '@/lib/cn';
import { NoOrgState, OrgSwitcher } from './OrgSwitcher';
import { useActiveOrg } from './useActiveOrg';
import { ClaimRow } from './ClaimRow';

const PIPELINE_ORDER = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REIMBURSED', 'REJECTED'];

export function ClaimsPage() {
  const { orgs, org, orgId, isLoading: orgsLoading, setActiveOrg } = useActiveOrg();
  const [status, setStatus] = useState<string | undefined>();
  const { data, isLoading } = useOrgClaims(orgId, status);
  const action = useClaimAction(orgId);

  if (orgsLoading) return <SkeletonCard height="h-72" />;
  if (!orgs.length) return <NoOrgState />;

  const run = async (id: string, verb: string, label: string) => {
    try {
      await action.mutateAsync({ id, action: verb });
      toast.success(label);
    } catch (err) {
      toast.error('Action failed', (err as Error).message);
    }
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Expense claims</h1>
          <p className="mt-0.5 text-[13px] text-[var(--ink-muted)]">
            Reimbursement pipeline with policy checks evaluated on submit
          </p>
        </div>
        <OrgSwitcher orgs={orgs} active={org} onSelect={setActiveOrg} />
      </header>

      {isLoading || !data ? (
        <SkeletonCard height="h-72" />
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
            {PIPELINE_ORDER.map((s) => {
              const stage = data.pipeline.find((p) => p.status === s);
              const isActive = status === s;
              return (
                <button
                  key={s}
                  onClick={() => setStatus(isActive ? undefined : s)}
                  className={cn(
                    'card card-hover p-3.5 text-left',
                    isActive && 'border-[var(--brand)] bg-[var(--brand-soft)]',
                  )}
                >
                  <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--ink-muted)]">
                    {s.toLowerCase()}
                  </p>
                  <p className="tabular mt-1 text-[20px] font-semibold leading-none">
                    {stage?.count ?? 0}
                  </p>
                  <p className="tabular mt-1 text-[11.5px] text-[var(--ink-muted)]">
                    {compact(stage?.total ?? 0)}
                  </p>
                </button>
              );
            })}
          </section>

          <Card padded={false}>
            <div className="flex items-center justify-between gap-3 p-5 pb-3">
              <CardHeader
                title={status ? `${status.toLowerCase()} claims` : 'All claims'}
                subtitle={
                  data.canApprove
                    ? 'You can approve claims from others - never your own'
                    : 'Your own submissions'
                }
                icon={<Receipt size={15} />}
                className="mb-0"
              />
              {status ? (
                <Button size="sm" variant="ghost" onClick={() => setStatus(undefined)}>
                  Clear filter
                </Button>
              ) : null}
            </div>

            <ul className="divide-y divide-[var(--line)] border-t border-[var(--line)]">
              {data.items.map((c) => (
                <ClaimRow
                  key={c.id}
                  claim={c}
                  canApprove={data.canApprove}
                  busy={action.isPending}
                  onAction={run}
                />
              ))}

              {!data.items.length ? (
                <li className="px-4 py-16 text-center">
                  <p className="text-[14px] font-medium">No claims here</p>
                  <p className="mt-1 text-[13px] text-[var(--ink-muted)]">
                    {status ? 'Nothing in this stage right now.' : 'Nothing has been claimed yet.'}
                  </p>
                </li>
              ) : null}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
