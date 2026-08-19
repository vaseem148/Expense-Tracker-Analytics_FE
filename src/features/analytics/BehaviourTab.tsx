import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Heatmap } from '@/components/charts/Heatmap';
import { BarChart, ColumnChart } from '@/components/charts/BarChart';
import { compact, longDate } from '@/lib/format';
import type { HeatmapResponse } from '@/api/queries';
import type { MerchantSlice } from '@/api/types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Props {
  heatmap?: HeatmapResponse;
  merchants?: MerchantSlice[];
  loading: boolean;
  currencyCode: string;
}

/** When and where money leaves - timing patterns and merchant cadence. */
export function BehaviourTab({ heatmap, merchants, loading, currencyCode }: Props) {
  if (loading || !heatmap) return <SkeletonCard height="h-96" />;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="When you spend"
          subtitle={`Busiest on ${DAYS[heatmap.peakWeekday]} around ${heatmap.peakHour}:00`}
          action={
            <Badge tone={heatmap.weekendShare > 40 ? 'warning' : 'neutral'}>
              {heatmap.weekendShare.toFixed(0)}% at the weekend
            </Badge>
          }
        />
        <Heatmap grid={heatmap.grid} currencyCode={currencyCode} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="By weekday" subtitle="Total spend per day of the week" />
          <ColumnChart
            data={DAYS.map((d, i) => ({
              label: d,
              value: heatmap.byWeekday[i] ?? 0,
              color: i === heatmap.peakWeekday ? 'var(--s2)' : 'var(--s1)',
            }))}
            height={170}
            currencyCode={currencyCode}
            highlightIndex={heatmap.peakWeekday}
          />
        </Card>

        <Card>
          <CardHeader title="By hour" subtitle="Three-hour blocks across the day" />
          <ColumnChart
            data={Array.from({ length: 8 }, (_, block) => ({
              label: `${block * 3}h`,
              value: heatmap.byHour.slice(block * 3, block * 3 + 3).reduce((a, b) => a + b, 0),
              color: Math.floor(heatmap.peakHour / 3) === block ? 'var(--s2)' : 'var(--s1)',
            }))}
            height={170}
            currencyCode={currencyCode}
          />
        </Card>
      </div>

      {merchants?.length ? (
        <Card>
          <CardHeader
            title="Merchant leaderboard"
            subtitle="Cadence is the median gap between visits - a stable gap usually means a subscription"
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <BarChart
              data={merchants.slice(0, 8).map((m) => ({
                label: m.name,
                value: m.total,
                meta: `${m.count} visits · avg ${compact(m.average)}`,
              }))}
              currencyCode={currencyCode}
            />
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[var(--line)]">
                    {['Merchant', 'Cadence', 'Last seen', 'Share'].map((h) => (
                      <th
                        key={h}
                        className="py-2 text-[11.5px] font-semibold uppercase tracking-wide text-[var(--ink-muted)]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {merchants.slice(0, 8).map((m) => (
                    <tr key={m.merchantKey} className="border-b border-[var(--line)] last:border-0">
                      <td className="py-2 text-[13px] font-medium">{m.name}</td>
                      <td className="py-2 text-[12.5px] text-[var(--ink-2)]">
                        {m.cadenceDays ? `every ~${Math.round(m.cadenceDays)}d` : 'irregular'}
                      </td>
                      <td className="py-2 text-[12.5px] text-[var(--ink-muted)]">
                        {longDate(m.lastSeen)}
                      </td>
                      <td className="tabular py-2 text-[12.5px] text-[var(--ink-muted)]">
                        {m.share.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
