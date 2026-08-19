import { Blocks, RefreshCw, TriangleAlert } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useSyncIntegration, useTestIntegration } from '@/api/queries';
import { timeAgo } from '@/lib/format';
import { toast } from '@/store/toast';
import type { IntegrationRow } from '@/api/business.types';

const STATUS_TONE = {
  CONNECTED: 'good',
  SYNCING: 'brand',
  ERROR: 'critical',
  DISCONNECTED: 'neutral',
} as const;

export function ConnectedList({ items }: { items: IntegrationRow[] }) {
  const sync = useSyncIntegration();
  const test = useTestIntegration();

  return (
    <Card padded={false}>
      <div className="p-5 pb-3">
        <CardHeader
          title="Connected"
          subtitle="Sync de-duplicates against the same hash the CSV importer uses"
          className="mb-0"
        />
      </div>
      <ul className="divide-y divide-[var(--line)] border-t border-[var(--line)]">
        {items.map((i) => (
          <li key={i.id} className="flex flex-wrap items-center gap-3 p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]">
              <Blocks size={17} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 text-[13.5px] font-medium">
                {i.displayName}
                <Badge tone={STATUS_TONE[i.status]}>{i.status.toLowerCase()}</Badge>
                {i.mode === 'SANDBOX' ? <Badge tone="neutral">sandbox</Badge> : null}
              </p>
              <p className="text-[11.5px] text-[var(--ink-muted)]">
                {i.category} · {i.capabilities.join(', ').toLowerCase()}
                {i.lastSyncAt ? ` · synced ${timeAgo(i.lastSyncAt)}` : ' · never synced'}
              </p>
              {i.lastRun ? (
                <p className="mt-1 text-[11.5px] text-[var(--ink-2)]">
                  Last run read {i.lastRun.recordsRead}, wrote {i.lastRun.recordsWritten}, skipped{' '}
                  {i.lastRun.recordsSkipped} duplicates
                </p>
              ) : null}
              {i.lastError ? (
                <p className="mt-1 flex items-center gap-1.5 text-[11.5px] text-[var(--critical-text)]">
                  <TriangleAlert size={11} />
                  {i.lastError}
                </p>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                loading={test.isPending}
                onClick={async () => {
                  const result = await test.mutateAsync(i.id);
                  if (result.ok) toast.success('Connection healthy', result.message);
                  else toast.error('Connection failed', result.message);
                }}
              >
                Test
              </Button>
              {i.capabilities.includes('PULL') ? (
                <Button
                  size="sm"
                  variant="primary"
                  icon={<RefreshCw size={14} />}
                  loading={sync.isPending}
                  onClick={async () => {
                    const result = await sync.mutateAsync({ id: i.id, direction: 'PULL' });
                    toast.success(
                      `Imported ${result.written} new records`,
                      `${result.skipped} duplicates skipped`,
                    );
                  }}
                >
                  Sync
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
