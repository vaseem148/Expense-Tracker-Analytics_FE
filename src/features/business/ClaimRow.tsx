import { AlertTriangle, Check, Clock, X } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { currency, initials, timeAgo } from '@/lib/format';
import type { ClaimRow as Claim } from '@/api/business.types';

const STATUS_TONE = {
  DRAFT: 'neutral',
  SUBMITTED: 'warning',
  APPROVED: 'brand',
  REJECTED: 'critical',
  REIMBURSED: 'good',
} as const;

interface Props {
  claim: Claim;
  canApprove: boolean;
  busy: boolean;
  onAction: (id: string, verb: string, label: string) => void;
}

export function ClaimRow({ claim: c, canApprove, busy, onAction }: Props) {
  return (
    <li className="p-4 transition-colors hover:bg-[var(--surface-2)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white"
            style={{ background: c.claimant.avatarColor }}
          >
            {initials(c.claimant.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-medium">{c.title}</p>
            <p className="text-[12px] text-[var(--ink-muted)]">
              {c.claimant.name} · {c.itemCount} items ·{' '}
              {c.submittedAt ? `submitted ${timeAgo(c.submittedAt)}` : 'not submitted'}
            </p>
            {c.policyFlags.length ? (
              <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-[color-mix(in_oklab,var(--warning)_14%,transparent)] px-2 py-0.5 text-[11.5px] text-[var(--warning-text)]">
                <AlertTriangle size={11} />
                {c.policyFlags.join(' · ').replace(/_/g, ' ').toLowerCase()}
              </p>
            ) : null}
            {c.decisionNote ? (
              <p className="mt-1 text-[11.5px] italic text-[var(--ink-muted)]">{c.decisionNote}</p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {c.ageingHours !== null && c.ageingHours > 48 ? (
            <span className="flex items-center gap-1 text-[11.5px] text-[var(--warning-text)]">
              <Clock size={12} />
              {Math.round(c.ageingHours / 24)}d waiting
            </span>
          ) : null}
          <span className="tabular text-[15px] font-semibold">{currency(c.total)}</span>
          <Badge tone={STATUS_TONE[c.status]}>{c.status.toLowerCase()}</Badge>
        </div>
      </div>

      {c.status === 'DRAFT' ? (
        <div className="mt-3">
          <Button
            size="sm"
            variant="secondary"
            loading={busy}
            onClick={() => onAction(c.id, 'submit', 'Claim submitted for approval')}
          >
            Submit for approval
          </Button>
        </div>
      ) : null}

      {canApprove && c.status === 'SUBMITTED' ? (
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            variant="primary"
            icon={<Check size={14} />}
            loading={busy}
            onClick={() => onAction(c.id, 'approve', 'Claim approved')}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={<X size={14} />}
            onClick={() => onAction(c.id, 'reject', 'Claim rejected')}
          >
            Reject
          </Button>
        </div>
      ) : null}

      {canApprove && c.status === 'APPROVED' ? (
        <div className="mt-3">
          <Button
            size="sm"
            variant="secondary"
            loading={busy}
            onClick={() => onAction(c.id, 'reimburse', 'Marked as reimbursed')}
          >
            Mark reimbursed
          </Button>
        </div>
      ) : null}
    </li>
  );
}
