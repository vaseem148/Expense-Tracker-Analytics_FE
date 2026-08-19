import { AlertTriangle, ShieldCheck, Store } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { StatTile } from '@/components/charts/StatTile';
import { BarChart } from '@/components/charts/BarChart';
import { useOrgVendorAnalysis, useOrgVendors } from '@/api/queries';
import { api } from '@/api/client';
import { useRange } from '@/hooks/useRange';
import { currency } from '@/lib/format';
import { toast } from '@/store/toast';
import { useActiveOrg } from '../business/useActiveOrg';
import { NoOrgState } from '../business/OrgSwitcher';
import { VendorTable } from './VendorTable';

export function VendorsPage() {
  const { range } = useRange('12m');
  const { orgs, orgId, isLoading: orgsLoading } = useActiveOrg();
  const { data: vendors, isLoading, refetch } = useOrgVendors(orgId);
  const analysis = useOrgVendorAnalysis(orgId, range);

  if (orgsLoading) return <SkeletonCard height="h-72" />;
  if (!orgs.length) return <NoOrgState />;

  const scoreRisk = async () => {
    try {
      const result = await api.post<{ scored: number; source: string }>(
        `/ml/risk/vendors/${orgId}`,
        {},
      );
      toast.success(`Scored ${result.scored} suppliers`, `Model: ${result.source}`);
      void refetch();
    } catch (err) {
      toast.error('Scoring failed', (err as Error).message);
    }
  };

  const missingGstin = (vendors ?? []).filter((v) => !v.gstin).length;
  const outstanding = (vendors ?? []).reduce((a, v) => a + v.outstanding, 0);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Vendors</h1>
          <p className="mt-0.5 text-[13px] text-[var(--ink-muted)]">
            Supplier spend, payment terms, tax compliance and concentration risk
          </p>
        </div>
        <Button variant="primary" icon={<ShieldCheck size={15} />} onClick={scoreRisk}>
          Score risk
        </Button>
      </header>

      {isLoading || !vendors ? (
        <SkeletonCard height="h-72" />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label="Suppliers"
              value={String(vendors.length)}
              hint={`${vendors.filter((v) => v.isPreferred).length} marked preferred`}
              icon={<Store size={15} />}
              accent="var(--s1)"
            />
            <StatTile
              label="Outstanding"
              value={currency(outstanding)}
              hint="Unpaid across every open bill"
              accent="var(--s2)"
            />
            <StatTile
              label="Missing GSTIN"
              value={String(missingGstin)}
              hint="Input tax credit is at risk without one"
              icon={<AlertTriangle size={15} />}
              accent={missingGstin ? 'var(--warning)' : 'var(--s3)'}
            />
            <StatTile
              label="Top three share"
              value={`${analysis.data?.concentration.top3Share ?? 0}%`}
              hint={`${analysis.data?.concentration.risk ?? 'unknown'} concentration risk`}
              accent={analysis.data?.concentration.risk === 'high' ? 'var(--critical)' : 'var(--s4)'}
            />
          </section>

          {analysis.data ? (
            <Card>
              <CardHeader
                title="Where the money goes"
                subtitle="One supplier carrying most of the spend is an operational dependency, not a discount"
              />
              <BarChart
                data={analysis.data.items.slice(0, 8).map((v) => ({
                  label: v.name,
                  value: v.spend,
                  meta: `${v.share}% of supplier spend · ${v.transactions} entries`,
                }))}
              />
            </Card>
          ) : null}

          <VendorTable vendors={vendors} />
        </>
      )}
    </div>
  );
}
