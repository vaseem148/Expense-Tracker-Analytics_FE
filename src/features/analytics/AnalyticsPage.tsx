import { useState } from 'react';
import { CalendarClock, GitCompare, Layers, TrendingUp } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { TrendChart } from '@/components/charts/TrendChart';
import { ColumnChart } from '@/components/charts/BarChart';
import { RangePicker } from '@/components/layout/RangePicker';
import { useRange } from '@/hooks/useRange';
import {
  useAnalyticsCategories,
  useCashflow,
  useCompare,
  useHeatmap,
  useMerchants,
  useTimeseries,
} from '@/api/queries';
import { compact, currency } from '@/lib/format';
import { cn } from '@/lib/cn';
import { CategoriesTab } from './CategoriesTab';
import { BehaviourTab } from './BehaviourTab';
import { CompareTab } from './CompareTab';
import { Stat } from './Stat';

const TABS = [
  { key: 'trends', label: 'Trends', icon: TrendingUp },
  { key: 'categories', label: 'Categories', icon: Layers },
  { key: 'behaviour', label: 'Behaviour', icon: CalendarClock },
  { key: 'compare', label: 'Compare', icon: GitCompare },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export function AnalyticsPage() {
  const { range, preset, choosePreset, granularity, setGranularity } = useRange('12m');
  const [tab, setTab] = useState<TabKey>('trends');

  const timeseries = useTimeseries(range);
  const categories = useAnalyticsCategories(range);
  const merchants = useMerchants(range);
  const heatmap = useHeatmap(range);
  const cashflow = useCashflow(range);
  const compare = useCompare(range);
  const currencyCode = 'INR';

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Analytics</h1>
          <p className="mt-0.5 text-[13px] text-[var(--ink-muted)]">
            Forecasts, concentration, timing and period-over-period movement
          </p>
        </div>
        <RangePicker
          preset={preset}
          onPreset={choosePreset}
          granularity={granularity}
          onGranularity={setGranularity}
        />
      </header>

      <nav className="flex gap-1 overflow-x-auto rounded-[10px] border border-[var(--line)] bg-[var(--surface-2)] p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-[13px] transition-colors',
              tab === t.key
                ? 'bg-[var(--surface)] font-medium text-[var(--ink)] shadow-[var(--shadow-sm)]'
                : 'text-[var(--ink-muted)] hover:text-[var(--ink)]',
            )}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'trends' ? (
        <div className="space-y-4">
          {timeseries.isLoading || !timeseries.data ? (
            <SkeletonCard height="h-96" />
          ) : (
            <Card>
              <CardHeader
                title="Spend, income and forecast"
                subtitle={
                  timeseries.data.forecast
                    ? `${timeseries.data.forecast.method} · ${timeseries.data.forecast.confidence} confidence`
                    : undefined
                }
                action={
                  <div className="flex gap-1.5">
                    <Badge tone="neutral">avg {compact(timeseries.data.stats.average)}</Badge>
                    <Badge tone={timeseries.data.stats.volatility > 0.4 ? 'warning' : 'good'}>
                      volatility {timeseries.data.stats.volatility.toFixed(2)}
                    </Badge>
                  </div>
                }
              />
              <TrendChart
                data={timeseries.data.series.map((s) => ({
                  label: s.label,
                  expense: s.expense,
                  income: s.income,
                  movingAvg: s.movingAvg,
                }))}
                forecast={timeseries.data.forecast?.points.map((p) => ({
                  label: p.label,
                  value: p.value,
                  lower: p.lower,
                  upper: p.upper,
                }))}
                height={320}
                currencyCode={currencyCode}
              />
            </Card>
          )}

          {cashflow.data ? (
            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <Card>
                <CardHeader
                  title="Cash flow"
                  subtitle={`${cashflow.data.summary.positivePeriods} positive vs ${cashflow.data.summary.negativePeriods} negative periods`}
                />
                <ColumnChart
                  data={cashflow.data.series.map((s) => ({
                    label: s.label,
                    value: Math.abs(s.net),
                    color: s.net >= 0 ? 'var(--s3)' : 'var(--s2)',
                  }))}
                  height={200}
                  currencyCode={currencyCode}
                />
                <p className="mt-3 text-[11.5px] text-[var(--ink-muted)]">
                  Bar height is the size of each period net position; green is a surplus, orange a
                  deficit.
                </p>
              </Card>

              <Card>
                <CardHeader title="Period extremes" subtitle="Where the window peaked and dipped" />
                <dl className="space-y-3">
                  <Stat
                    label="Total inflow"
                    value={currency(cashflow.data.summary.inflow, currencyCode)}
                    tone="good"
                  />
                  <Stat
                    label="Total outflow"
                    value={currency(cashflow.data.summary.outflow, currencyCode)}
                  />
                  <Stat
                    label="Net position"
                    value={currency(cashflow.data.summary.net, currencyCode)}
                    tone={cashflow.data.summary.net >= 0 ? 'good' : 'critical'}
                  />
                  {cashflow.data.summary.bestPeriod ? (
                    <Stat
                      label={`Best · ${cashflow.data.summary.bestPeriod.label}`}
                      value={currency(cashflow.data.summary.bestPeriod.net, currencyCode)}
                      tone="good"
                    />
                  ) : null}
                  {cashflow.data.summary.worstPeriod ? (
                    <Stat
                      label={`Worst · ${cashflow.data.summary.worstPeriod.label}`}
                      value={currency(cashflow.data.summary.worstPeriod.net, currencyCode)}
                      tone="critical"
                    />
                  ) : null}
                </dl>
              </Card>
            </div>
          ) : null}
        </div>
      ) : null}

      {tab === 'categories' ? (
        <CategoriesTab
          data={categories.data}
          loading={categories.isLoading}
          currencyCode={currencyCode}
        />
      ) : null}

      {tab === 'behaviour' ? (
        <BehaviourTab
          heatmap={heatmap.data}
          merchants={merchants.data}
          loading={heatmap.isLoading}
          currencyCode={currencyCode}
        />
      ) : null}

      {tab === 'compare' ? (
        <CompareTab data={compare.data} loading={compare.isLoading} currencyCode={currencyCode} />
      ) : null}
    </div>
  );
}
