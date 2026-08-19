import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { compact } from '@/lib/format';
import { seriesColor } from '@/lib/palette';
import type { ClusterResponse } from '@/api/queries';

export function ClusterPanel({ data, loading }: { data?: ClusterResponse; loading: boolean }) {
  return (
    <Card>
      <CardHeader
        title="Merchant segments"
        subtitle={
          data
            ? `${data.source === 'ml' ? 'KMeans' : 'Quartile'} segmentation across ${data.items.length} merchants`
            : 'Grouping merchants by frequency and ticket size'
        }
      />
      {loading || !data ? (
        <div className="h-48" />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {data.clusters.map((c) => (
              <Badge key={c.id} tone="neutral">
                <span
                  className="mr-1 inline-block h-2 w-2 rounded-full align-middle"
                  style={{ background: seriesColor(c.id) }}
                  aria-hidden
                />
                {c.label} · {c.size}
              </Badge>
            ))}
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {data.items.slice(0, 10).map((m) => (
              <li
                key={m.key}
                className="flex items-center gap-2.5 rounded-lg border border-[var(--line)] px-3 py-2"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                  style={{ background: seriesColor(Math.max(0, m.cluster)) }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate text-[12.5px]">{m.name}</span>
                <span className="tabular shrink-0 text-[12px] text-[var(--ink-muted)]">
                  {m.frequency}x · {compact(m.averageTicket)}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
