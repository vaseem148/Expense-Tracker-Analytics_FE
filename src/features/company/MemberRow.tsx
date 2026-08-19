import { Badge } from '@/components/ui/Badge';
import { compact, initials, longDate } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { OrgMemberRow } from '@/api/business.types';

const ROLE_TONE = {
  OWNER: 'brand',
  ADMIN: 'brand',
  FINANCE: 'good',
  MANAGER: 'neutral',
  EMPLOYEE: 'neutral',
} as const;

const ROLE_HINT: Record<string, string> = {
  OWNER: 'Full control of the company workspace',
  ADMIN: 'Manages members, departments and settings',
  FINANCE: 'Sees all spend, owns budgets and reimbursements',
  MANAGER: 'Approves claims, sees their own spend',
  EMPLOYEE: 'Records and claims their own spend',
};

export function MemberRow({ member: m }: { member: OrgMemberRow }) {
  const used = m.limitUsedPct ?? 0;

  return (
    <li className="flex flex-wrap items-center gap-4 p-4">
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[12px] font-semibold text-white"
        style={{ background: m.avatarColor }}
      >
        {initials(m.name)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 text-[14px] font-medium">
          {m.name}
          <Badge tone={ROLE_TONE[m.role as keyof typeof ROLE_TONE] ?? 'neutral'}>
            {m.role.toLowerCase()}
          </Badge>
          {!m.isActive ? <Badge tone="critical">inactive</Badge> : null}
        </p>
        <p className="text-[12px] text-[var(--ink-muted)]">
          {m.title ?? 'No title'}
          {m.department ? ` · ${m.department.name}` : ''}
          {m.lastLoginAt ? ` · last seen ${longDate(m.lastLoginAt)}` : ' · never signed in'}
        </p>
        <p className="mt-0.5 text-[11px] text-[var(--ink-muted)]">{ROLE_HINT[m.role]}</p>
      </div>

      <div className="w-44 shrink-0">
        {m.monthlyLimit > 0 ? (
          <>
            <div className="mb-1 flex items-baseline justify-between text-[11.5px]">
              <span className="text-[var(--ink-muted)]">
                {compact(m.monthToDateSpend)} / {compact(m.monthlyLimit)}
              </span>
              <span
                className={cn('tabular font-medium', used > 100 && 'text-[var(--critical-text)]')}
              >
                {used}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${Math.min(100, used)}%`,
                  background:
                    used > 100 ? 'var(--critical)' : used > 80 ? 'var(--warning)' : 'var(--good)',
                }}
              />
            </div>
          </>
        ) : (
          <p className="text-[11.5px] text-[var(--ink-muted)]">No spend cap set</p>
        )}
      </div>
    </li>
  );
}
