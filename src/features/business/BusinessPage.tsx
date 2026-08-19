import { AlertTriangle, Banknote, Flame, Timer, Users } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { StatTile } from '@/components/charts/StatTile';
import { TrendChart } from '@/components/charts/TrendChart';
import { BarChart } from '@/components/charts/BarChart';
import { RangePicker } from '@/components/layout/RangePicker';
import { useRange } from '@/hooks/useRange';
import {
  useOrgCashflow,
  useOrgDepartments,
  useOrgKpis,
  useOrgPnl,
  useOrgVendorAnalysis,
} from '@/api/queries';
import { compact, currency } from '@/lib/format';
import { NoOrgState, OrgSwitcher } from './OrgSwitcher';
import { useActiveOrg } from './useActiveOrg';
import { DepartmentTable } from './DepartmentTable';
import { PnlPanel } from './PnlPanel';
import { CashProjection } from './CashProjection';

export function BusinessPage() {
  const { range, preset, choosePreset, granularity, setGranularity } = useRange('12m');
  const { orgs, org, orgId, isLoading: orgsLoading, setActiveOrg } = useActiveOrg();

  const kpis = useOrgKpis(orgId, range);
  const departments = useOrgDepartments(orgId, range);
  const vendors = useOrgVendorAnalysis(orgId, range);
  const pnl = useOrgPnl(orgId, range);
  const cashflow = useOrgCashflow(orgId, range);

  if (orgsLoading) return <SkeletonCard height="h-72" />;
  if (!orgs.length) return <NoOrgState />;

  const currencyCode = kpis.data?.currency ?? 'INR';
  const lowRunway = kpis.data?.runwayMonths !== null && (kpis.data?.runwayMonths ?? 99) < 6;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Business</h1>
          <p className="mt-0.5 text-[13px] text-[var(--ink-muted)]">
            {org?.gstin ? `GSTIN ${org.gstin} · ` : ''}
            {org?.city ?? 'Company workspace'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <OrgSwitcher orgs={orgs} active={org} onSelect={setActiveOrg} />
          <RangePicker
            preset={preset}
            onPreset={choosePreset}
            granularity={granularity}
            onGranularity={setGranularity}
            compact
          />
        </div>
      </header>

      {kpis.isLoading || !kpis.data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} height="h-32" />
          ))}
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label="Revenue"
              value={currency(kpis.data.revenue, currencyCode)}
              delta={kpis.data.change.revenuePct}
              hint={kpis.data.margin !== null ? `${kpis.data.margin}% gross margin` : undefined}
              icon={<Banknote size={15} />}
              accent="var(--s3)"
            />
            <StatTile
              label="Operating spend"
              value={currency(kpis.data.opex, currencyCode)}
              delta={kpis.data.change.opexPct}
              deltaGoodWhenUp={false}
              hint={`${currency(kpis.data.monthlyBurn, currencyCode)} monthly burn`}
              icon={<Flame size={15} />}
              accent="var(--s2)"
            />
            <StatTile
              label="Runway"
              value={
                kpis.data.runwayMonths !== null ? `${kpis.data.runwayMonths} mo` : 'Cash positive'
              }
              hint={`${compact(kpis.data.cashOnHand)} cash on hand`}
              icon={<Timer size={15} />}
              accent={lowRunway ? 'var(--critical)' : 'var(--s1)'}
            />
            <StatTile
              label="Cost per employee"
              value={currency(kpis.data.costPerEmployee, currencyCode)}
              hint={`${kpis.data.headcount} active members`}
              icon={<Users size={15} />}
              accent="var(--s4)"
            />
          </section>

          {lowRunway ? (
            <div className="flex items-start gap-3 rounded-xl border border-[color-mix(in_oklab,var(--critical)_30%,transparent)] bg-[color-mix(in_oklab,var(--critical)_10%,transparent)] p-4">
              <AlertTriangle size={17} className="mt-0.5 shrink-0 text-[var(--critical-text)]" />
              <div>
                <p className="text-[13.5px] font-medium text-[var(--critical-text)]">
                  Runway under six months
                </p>
                <p className="mt-0.5 text-[12.5px] text-[var(--ink-2)]">
                  At the current net burn of {currency(kpis.data.netBurn, currencyCode)} a month,
                  cash runs out in about {kpis.data.runwayMonths} months.
                </p>
              </div>
            </div>
          ) : null}

          <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
            <Card>
              <CardHeader title="Revenue and spend" subtitle="Company-wide, every member included" />
              {pnl.data ? (
                <TrendChart
                  data={pnl.data.series.map((s) => ({
                    label: s.label,
                    expense: s.expense,
                    income: s.income,
                  }))}
                  height={280}
                  currencyCode={currencyCode}
                  showMovingAverage={false}
                />
              ) : (
                <div className="h-64" />
              )}
            </Card>

            <Card>
              <CardHeader
                title="Vendor concentration"
                subtitle="Losing a vendor that carries most of the spend is an operational event"
                action={
                  vendors.data ? (
                    <Badge
                      tone={
                        vendors.data.concentration.risk === 'high'
                          ? 'critical'
                          : vendors.data.concentration.risk === 'moderate'
                            ? 'warning'
                            : 'good'
                      }
                    >
                      {vendors.data.concentration.risk} risk
                    </Badge>
                  ) : null
                }
              />
              {vendors.data ? (
                <>
                  <div className="mb-4 grid grid-cols-3 gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3">
                    <Metric label="Top vendor" value={`${vendors.data.concentration.top1Share}%`} />
                    <Metric label="Top three" value={`${vendors.data.concentration.top3Share}%`} />
                    <Metric label="Gini" value={vendors.data.concentration.gini.toFixed(2)} />
                  </div>
                  <BarChart
                    data={vendors.data.items.slice(0, 6).map((v) => ({
                      label: v.name,
                      value: v.spend,
                      meta: `${v.transactions} entries · avg ${compact(v.averageTicket)}`,
                    }))}
                    currencyCode={currencyCode}
                  />
                </>
              ) : null}
            </Card>
          </section>

          <DepartmentTable data={departments.data} currencyCode={currencyCode} />

          <section className="grid gap-4 xl:grid-cols-2">
            <PnlPanel data={pnl.data} currencyCode={currencyCode} />
            <CashProjection data={cashflow.data} currencyCode={currencyCode} />
          </section>
        </>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-[var(--ink-muted)]">{label}</p>
      <p className="tabular mt-0.5 text-[16px] font-semibold">{value}</p>
    </div>
  );
}
