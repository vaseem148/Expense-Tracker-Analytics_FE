import { ShieldCheck } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { longDate } from '@/lib/format';

export interface Session {
  id: string;
  userAgent: string | null;
  ip: string | null;
  createdAt: string;
  expiresAt: string;
}

export function SessionsCard({
  sessions,
  onRevoke,
}: {
  sessions: Session[];
  onRevoke: (id: string) => void;
}) {
  return (
    <Card>
      <CardHeader
        title="Active sessions"
        subtitle="Refresh tokens rotate on every use; presenting a revoked one burns the whole family"
        icon={<ShieldCheck size={15} />}
        action={<Badge tone="neutral">{sessions.length} active</Badge>}
      />
      <ul className="space-y-2">
        {sessions.map((s) => (
          <li
            key={s.id}
            className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--line)] px-3 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] text-[var(--ink-2)]">
                {s.userAgent ?? 'Unknown client'}
              </p>
              <p className="text-[11.5px] text-[var(--ink-muted)]">
                {s.ip ?? 'no ip'} · started {longDate(s.createdAt)} · expires{' '}
                {longDate(s.expiresAt)}
              </p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => onRevoke(s.id)}>
              Revoke
            </Button>
          </li>
        ))}
        {!sessions.length ? (
          <li className="py-6 text-center text-[13px] text-[var(--ink-muted)]">
            No other sessions
          </li>
        ) : null}
      </ul>
    </Card>
  );
}
