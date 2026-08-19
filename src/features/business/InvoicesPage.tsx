import { AlertTriangle, Wallet } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { StatTile } from '@/components/charts/StatTile';
import { ColumnChart } from '@/components/charts/BarChart';
import { useOrgInvoices, usePayInvoice } from '@/api/queries';
import { currency } from '@/lib/format';
import { toast } from '@/store/toast';
import { NoOrgState, OrgSwitcher } from './OrgSwitcher';
import { useActiveOrg } from './useActiveOrg';
import { InvoiceTable } from './InvoiceTable';

const BUCKET_COLOR: Record<string, string> = {
  current: 'var(--s3)',
  '1-30': 'var(--s4)',
  '31-60': 'var(--s2)',
  '61-90': 'var(--serious)',
  '90+': 'var(--critical)',
};

export function InvoicesPage() {
  const { orgs, org, orgId, isLoading: orgsLoading, setActiveOrg } = useActiveOrg();
  const { data, isLoading } = useOrgInvoices(orgId);
  const pay = usePayInvoice(orgId);

  if (orgsLoading) return <SkeletonCard height="h-72" />;
  if (!orgs.length) return <NoOrgState />;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Accounts payable</h1>
          <p className="mt-0.5 text-[13px] text-[var(--ink-muted)]">
            Vendor bills with aging derived from the due date, not a stored flag
          </p>
        </div>
        <OrgSwitcher orgs={orgs} active={org} onSelect={setActiveOrg} />
      </header>

      {isLoading || !data ? (
        <SkeletonCard height="h-72" />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label="Outstanding"
              value={currency(data.summary.totalOutstanding)}
              hint={`${data.summary.count} invoices on file`}
              icon={<Wallet size={15} />}
              accent="var(--s1)"
            />
            <StatTile
              label="Overdue"
              value={currency(data.summary.overdueValue)}
              hint={`${data.summary.overdueCount} bills past their due date`}
              icon={<AlertTriangle size={15} />}
              accent={data.summary.overdueCount ? 'var(--critical)' : 'var(--s3)'}
            />
            <StatTile
              label="Due this week"
              value={String(data.summary.dueThisWeek)}
              hint="Invoices falling due in the next 7 days"
              accent="var(--s4)"
            />
            <StatTile
              label="Oldest bucket"
              value={data.summary.aging.filter((a) => a.count).slice(-1)[0]?.bucket ?? 'none'}
              hint="Where the tail of your payables sits"
              accent="var(--s2)"
            />
          </section>

          <Card>
            <CardHeader
              title="Aging"
              subtitle="Value outstanding by how long each bill has been overdue"
            />
            <ColumnChart
              data={data.summary.aging.map((a) => ({
                label: a.bucket,
                value: a.value,
                color: BUCKET_COLOR[a.bucket] ?? 'var(--s1)',
              }))}
              height={150}
            />
          </Card>

          <InvoiceTable
            items={data.items}
            busy={pay.isPending}
            onPay={async (id, amount) => {
              await pay.mutateAsync({ id, amount });
              toast.success('Payment recorded');
            }}
          />
        </>
      )}
    </div>
  );
}
