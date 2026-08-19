import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Flame,
  Percent,
  Repeat,
  Sparkles,
  Timer,
  Users,
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { StatTile } from '@/components/charts/StatTile';
import { TrendChart } from '@/components/charts/TrendChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { Gauge } from '@/components/charts/Gauge';
import { BarChart } from '@/components/charts/BarChart';
import { RangePicker } from '@/components/layout/RangePicker';
import { useDashboard } from '@/api/queries';
import { useRange } from '@/hooks/useRange';
import { compact, currency, longDate } from '@/lib/format';
import { InsightList } from './InsightList';
import { BudgetStrip } from './BudgetStrip';

export function DashboardPage() {
  const { range, preset, choosePreset, granularity, setGranularity } = useRange('12m');
  const { data, isLoading, error } = useDashboard(range);

  const trend = useMemo(
    () =>
      (data?.series.series ?? []).map((s) => ({
        label: s.label,
        expense: s.expense,
        income: s.income,
        movingAvg: s.movingAvg,
      })),
    [data],
  );

  const forecast = useMemo(
    () =>
      (data?.series.forecast?.points ?? []).map((p) => ({
        label: p.label,
        value: p.value,
        lower: p.lower,
        upper: p.upper,
      })),
    [data],
  );

  if (error) {
    return (
      <Card className="border-[var(--critical)]">
        <p className="text-[14px] text-[var(--critical-text)]">
          Could not load the company overview: {(error as Error).message}
        </p>
      </Card>
    );
  }

  const currencyCode = data?.overview.currency ?? 'INR';
  const runway = data?.overview.runway;
  const lowRunway = runway?.months !== null && (runway?.months ?? 99) < 6;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em]">
            {data?.overview.org.name ?? 'Company overview'}
          </h1>
          <p className="mt-0.5 text-[13px] text-[var(--ink-muted)]">
            {data
              ? `${longDate(data.overview.range.from)} - ${longDate(data.overview.range.to)} · ${data.overview.totals.transactions} entries${
                  data.overview.org.scopedToSelf ? ' · showing your own spend only' : ''
                }`
              : 'Loading the company ledger...'}
          </p>
        </div>
        <RangePicker
          preset={preset}
          onPreset={choosePreset}
          granularity={granularity}
          onGranularity={setGranularity}
        />
      </header>

      {isLoading || !data ? (
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
              value={currency(data.overview.totals.income, currencyCode)}
              delta={data.overview.comparison.incomeChangePct}
              hint={
                data.overview.rates.margin !== null
                  ? `${data.overview.rates.margin}% net margin`
                  : 'No revenue booked yet'
              }
              icon={<Banknote size={15} />}
              accent="var(--s3)"
              spark={trend.map((t) => t.income ?? 0)}
            />
            <StatTile
              label="Operating spend"
              value={currency(data.overview.totals.expense, currencyCode)}
              delta={data.overview.comparison.expenseChangePct}
              deltaGoodWhenUp={false}
              hint={`${compact(data.overview.rates.monthlyRunRate)} monthly run-rate`}
              icon={<Flame size={15} />}
              accent="var(--s2)"
              spark={trend.map((t) => t.expense)}
            />
            <StatTile
              label="Runway"
              value={runway?.months !== null ? `${runway?.months} mo` : 'Cash positive'}
              hint={`${compact(runway?.cashOnHand ?? 0)} cash on hand`}
              icon={<Timer size={15} />}
              accent={lowRunway ? 'var(--critical)' : 'var(--s1)'}
            />
            <StatTile
              label="Cost per employee"
              value={currency(data.overview.team.costPerEmployee, currencyCode)}
              hint={`${data.overview.team.headcount} people on the plan`}
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
                  Net burn is {currency(runway?.netBurn ?? 0, currencyCode)} a month against{' '}
                  {compact(runway?.cashOnHand ?? 0)} of cash.
                </p>
              </div>
            </div>
          ) : null}

          <section className="grid gap-4 xl:grid-cols-[1.65fr_1fr]">
            <Card>
              <CardHeader
                title="Revenue and spend"
                subtitle={
                  data.series.forecast
                    ? `${data.series.forecast.method} forecast · ${data.series.forecast.confidence} confidence`
                    : 'Company-wide, bucketed with a trailing average'
                }
                action={
                  <Badge tone="neutral">
                    peak {compact(data.series.stats.peak.value)} · {data.series.stats.peak.label}
                  </Badge>
                }
              />
              <TrendChart data={trend} forecast={forecast} currencyCode={currencyCode} height={280} />
            </Card>

            <Card>
              <CardHeader
                title="Cost breakdown"
                subtitle={`${data.categories.slices.length} cost categories in this window`}
                action={
                  <Link to="/analytics" className="text-[12.5px] text-[var(--brand)] hover:underline">
                    Details
                  </Link>
                }
              />
              <DonutChart
                data={data.categories.slices.map((s) => ({ name: s.name, total: s.total }))}
                currencyCode={currencyCode}
                centerLabel="Total opex"
              />
            </Card>
          </section>

          <BudgetStrip budgets={data.budgets} currencyCode={currencyCode} />

          <section className="grid gap-4 xl:grid-cols-[1fr_1.1fr]">
            <Card>
              <CardHeader
                title="Financial health"
                subtitle={data.health.summary}
                icon={<Percent size={15} />}
              />
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <Gauge
                  value={data.health.score}
                  sublabel={`Grade ${data.health.grade}`}
                  color={
                    data.health.score >= 70
                      ? 'var(--good)'
                      : data.health.score >= 50
                        ? 'var(--warning)'
                        : 'var(--critical)'
                  }
                />
                <ul className="min-w-0 flex-1 space-y-2.5">
                  {data.health.pillars.map((p) => (
                    <li key={p.key}>
                      <div className="mb-1 flex items-baseline justify-between gap-2">
                        <span className="text-[12.5px] text-[var(--ink-2)]" title={p.hint}>
                          {p.label}
                        </span>
                        <span className="tabular text-[12.5px] font-medium">{p.score}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
                        <div
                          className="h-full rounded-full transition-[width] duration-700 ease-out"
                          style={{
                            width: `${p.score}%`,
                            background:
                              p.score >= 70
                                ? 'var(--good)'
                                : p.score >= 40
                                  ? 'var(--warning)'
                                  : 'var(--critical)',
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            <Card>
              <CardHeader
                title="What changed"
                subtitle="Rules that fired against this period"
                icon={<Sparkles size={15} />}
              />
              <InsightList insights={data.insights} />
            </Card>
          </section>

          <section className="grid gap-4 xl:grid-cols-3">
            <Card>
              <CardHeader
                title="Top suppliers"
                subtitle="By spend in this window"
                action={
                  <Link to="/vendors" className="text-[12.5px] text-[var(--brand)] hover:underline">
                    All
                  </Link>
                }
              />
              <BarChart
                data={data.merchants.slice(0, 6).map((m) => ({
                  label: m.name,
                  value: m.total,
                  meta: `${m.count} entries · avg ${compact(m.average)}`,
                }))}
                currencyCode={currencyCode}
              />
            </Card>

            <Card>
              <CardHeader
                title="Unusual spend"
                subtitle="Scored against each category on its own"
                icon={<AlertTriangle size={15} />}
                action={
                  <Badge tone={data.anomalies.length ? 'warning' : 'good'}>
                    {data.anomalies.length}
                  </Badge>
                }
              />
              {data.anomalies.length ? (
                <ul className="space-y-2.5">
                  {data.anomalies.slice(0, 5).map((a) => (
                    <li
                      key={a.transactionId}
                      className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-[var(--surface-2)]"
                    >
                      <span
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                        style={{ background: a.categoryColor }}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-[var(--ink)]">
                          {a.description}
                        </p>
                        <p className="text-[11.5px] text-[var(--ink-muted)]">
                          {a.category} · {longDate(a.date)}
                          {a.expected ? ` · usual ${compact(a.expected)}` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="tabular text-[13px] font-semibold text-[var(--ink)]">
                          {compact(a.amount)}
                        </p>
                        <p className="tabular text-[11px] text-[var(--critical-text)]">
                          {a.score.toFixed(1)}x
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-8 text-center text-[13px] text-[var(--ink-muted)]">
                  Nothing unusual in this window
                </p>
              )}
            </Card>

            <Card>
              <CardHeader
                title="Undeclared subscriptions"
                subtitle={`${compact(data.recurring.totalMonthlyCost)} a month of unmanaged fixed cost`}
                icon={<Repeat size={15} />}
                action={
                  <Link
                    to="/subscriptions"
                    className="text-[12.5px] text-[var(--brand)] hover:underline"
                  >
                    Manage
                  </Link>
                }
              />
              {data.recurring.items.length ? (
                <ul className="space-y-2">
                  {data.recurring.items.slice(0, 6).map((r) => (
                    <li
                      key={r.merchantKey}
                      className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-[var(--surface-2)]"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium">{r.name}</p>
                        <p className="text-[11.5px] text-[var(--ink-muted)]">
                          {r.frequency.toLowerCase()} · every ~{Math.round(r.medianGapDays)}d ·{' '}
                          {r.confidence}% match
                        </p>
                      </div>
                      <span className="tabular shrink-0 text-[13px] font-medium">
                        {compact(r.averageAmount)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-8 text-center text-[13px] text-[var(--ink-muted)]">
                  Every repeating charge is already declared
                </p>
              )}
            </Card>
          </section>

          <Card className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[14px] font-medium">Go deeper</p>
              <p className="text-[12.5px] text-[var(--ink-muted)]">
                P and L statement, cost-centre variance, supplier concentration, cash projection.
              </p>
            </div>
            <div className="flex gap-2">
              <Link to="/financials">
                <Button variant="outline" size="sm">
                  Financials <ArrowRight size={14} />
                </Button>
              </Link>
              <Link to="/insights">
                <Button variant="primary" size="sm">
                  AI insights <Sparkles size={14} />
                </Button>
              </Link>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
