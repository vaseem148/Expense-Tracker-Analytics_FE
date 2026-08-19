import { ShieldCheck, Users } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { StatTile } from '@/components/charts/StatTile';
import { useOrgDepartments, useOrgMembers } from '@/api/queries';
import { useRange } from '@/hooks/useRange';
import { compact, currency } from '@/lib/format';
import { useActiveOrg } from '../business/useActiveOrg';
import { NoOrgState } from '../business/OrgSwitcher';
import { MemberRow } from './MemberRow';

export function TeamPage() {
  const { range } = useRange('12m');
  const { orgs, orgId, isLoading: orgsLoading } = useActiveOrg();
  const { data: members, isLoading } = useOrgMembers(orgId);
  const departments = useOrgDepartments(orgId, range);

  if (orgsLoading) return <SkeletonCard height="h-72" />;
  if (!orgs.length) return <NoOrgState />;

  const list = members ?? [];
  const overLimit = list.filter((m) => (m.limitUsedPct ?? 0) > 100).length;
  const totalMtd = list.reduce((a, m) => a + m.monthToDateSpend, 0);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Team</h1>
        <p className="mt-0.5 text-[13px] text-[var(--ink-muted)]">
          Who can spend what, and how much of it they have used this month
        </p>
      </header>

      {isLoading ? (
        <SkeletonCard height="h-64" />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            <StatTile
              label="Headcount"
              value={String(list.filter((m) => m.isActive).length)}
              hint={`${departments.data?.items.length ?? 0} cost centres`}
              icon={<Users size={15} />}
              accent="var(--s1)"
            />
            <StatTile
              label="Spend this month"
              value={currency(totalMtd)}
              hint="Across everyone with a company card"
              accent="var(--s2)"
            />
            <StatTile
              label="Over their cap"
              value={String(overLimit)}
              hint={overLimit ? 'Review before the period closes' : 'Everyone inside their limit'}
              icon={<ShieldCheck size={15} />}
              accent={overLimit ? 'var(--critical)' : 'var(--s3)'}
            />
          </section>

          <Card padded={false}>
            <div className="p-5 pb-3">
              <CardHeader
                title="Members"
                subtitle="FINANCE and above see company-wide data; everyone else sees only their own"
                className="mb-0"
              />
            </div>
            <ul className="divide-y divide-[var(--line)] border-t border-[var(--line)]">
              {list.map((m) => (
                <MemberRow key={m.id} member={m} />
              ))}
            </ul>
          </Card>

          {departments.data ? (
            <Card>
              <CardHeader
                title="Cost centres"
                subtitle="Headcount and spend per department in the selected window"
              />
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {departments.data.items.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center gap-3 rounded-xl border border-[var(--line)] p-3"
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                      style={{ background: d.color }}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium">{d.name}</p>
                      <p className="text-[11.5px] text-[var(--ink-muted)]">
                        {d.headcount} people · {compact(d.perHead)} per head
                      </p>
                    </div>
                    <span className="tabular text-[13px] font-medium">{compact(d.spent)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}
