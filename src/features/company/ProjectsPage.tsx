import { Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { StatTile } from '@/components/charts/StatTile';
import { useOrgProjects } from '@/api/queries';
import { compact, currency, longDate } from '@/lib/format';
import { useActiveOrg } from '../business/useActiveOrg';
import { NoOrgState } from '../business/OrgSwitcher';

const STATUS_TONE = {
  ACTIVE: 'brand',
  ON_HOLD: 'warning',
  COMPLETED: 'good',
} as const;

export function ProjectsPage() {
  const { orgs, orgId, isLoading: orgsLoading } = useActiveOrg();
  const { data, isLoading } = useOrgProjects(orgId);

  if (orgsLoading) return <SkeletonCard height="h-72" />;
  if (!orgs.length) return <NoOrgState />;

  const projects = data ?? [];
  const billable = projects.reduce((a, p) => a + p.billableSpend, 0);
  const overBudget = projects.filter((p) => p.isOverBudget).length;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Projects</h1>
        <p className="mt-0.5 text-[13px] text-[var(--ink-muted)]">
          Cost against budget per client engagement, and what is re-billable
        </p>
      </header>

      {isLoading ? (
        <SkeletonCard height="h-64" />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            <StatTile
              label="Active projects"
              value={String(projects.filter((p) => p.status === 'ACTIVE').length)}
              hint={`${projects.length} on the books`}
              icon={<Briefcase size={15} />}
              accent="var(--s1)"
            />
            <StatTile
              label="Billable spend"
              value={currency(billable)}
              hint="Recoverable from clients"
              accent="var(--s3)"
            />
            <StatTile
              label="Over budget"
              value={String(overBudget)}
              hint={overBudget ? 'Needs a scope conversation' : 'Every project inside its budget'}
              accent={overBudget ? 'var(--critical)' : 'var(--s4)'}
            />
          </section>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((p) => {
              const pct = Math.min(100, p.consumedPct ?? 0);
              return (
                <Card key={p.id} hover className="flex flex-col">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[14.5px] font-semibold">{p.name}</p>
                      <p className="truncate text-[11.5px] text-[var(--ink-muted)]">
                        {p.code}
                        {p.clientName ? ` · ${p.clientName}` : ' · internal'}
                      </p>
                    </div>
                    <Badge tone={STATUS_TONE[p.status as keyof typeof STATUS_TONE] ?? 'neutral'}>
                      {p.status.replace('_', ' ').toLowerCase()}
                    </Badge>
                  </div>

                  <p className="tabular mb-3 text-[22px] font-semibold leading-none tracking-[-0.02em]">
                    {currency(p.spent)}
                    <span className="text-[13px] font-normal text-[var(--ink-muted)]">
                      {' '}
                      / {compact(p.budget)}
                    </span>
                  </p>

                  <div className="mb-2 h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
                    <div
                      className="h-full rounded-full transition-[width] duration-700 ease-out"
                      style={{
                        width: `${pct}%`,
                        background: p.isOverBudget ? 'var(--critical)' : 'var(--s1)',
                      }}
                    />
                  </div>

                  <div className="mb-3 flex items-baseline justify-between text-[12px]">
                    <span className="text-[var(--ink-muted)]">
                      {p.consumedPct !== null ? `${p.consumedPct}% consumed` : 'no budget set'}
                    </span>
                    <span
                      className="tabular font-medium"
                      style={{ color: p.remaining < 0 ? 'var(--critical-text)' : undefined }}
                    >
                      {p.remaining >= 0
                        ? `${compact(p.remaining)} left`
                        : `${compact(-p.remaining)} over`}
                    </span>
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-[var(--line)] pt-3 text-[11.5px] text-[var(--ink-muted)]">
                    <span>started {longDate(p.startDate)}</span>
                    {p.isBillable ? (
                      <span className="text-[var(--good-text)]">
                        {compact(p.billableSpend)} billable
                      </span>
                    ) : (
                      <span>internal</span>
                    )}
                  </div>
                </Card>
              );
            })}

            {!projects.length ? (
              <Card className="col-span-full py-16 text-center">
                <p className="text-[14px] font-medium">No projects yet</p>
                <p className="mt-1 text-[13px] text-[var(--ink-muted)]">
                  Tagging spend to a project is what makes client work recoverable.
                </p>
              </Card>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
