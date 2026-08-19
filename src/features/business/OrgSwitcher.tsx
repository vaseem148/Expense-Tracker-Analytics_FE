import { useState } from 'react';
import { Building2, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { OrgSummary } from '@/api/business.types';

interface Props {
  orgs: OrgSummary[];
  active?: OrgSummary;
  onSelect: (id: string) => void;
}

export function OrgSwitcher({ orgs, active, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  if (!orgs.length) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 items-center gap-2.5 rounded-[10px] border border-[var(--line)] bg-[var(--surface-2)] px-3 text-[13px] transition-colors hover:border-[var(--brand)]"
      >
        <span
          className="grid h-5 w-5 place-items-center rounded-md text-[10px] font-bold text-white"
          style={{ background: active?.logoColor ?? 'var(--brand)' }}
        >
          {active?.name.charAt(0) ?? '?'}
        </span>
        <span className="max-w-40 truncate font-medium">{active?.name ?? 'Select org'}</span>
        <span className="text-[11px] text-[var(--ink-muted)]">{active?.role.toLowerCase()}</span>
        <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <ul className="animate-scale-in absolute left-0 z-50 mt-1.5 w-64 origin-top-left rounded-xl border border-[var(--line)] bg-[var(--surface-raised)] p-1.5 shadow-[var(--shadow-lg)]">
            {orgs.map((o) => (
              <li key={o.orgId}>
                <button
                  onClick={() => {
                    onSelect(o.orgId);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors',
                    o.orgId === active?.orgId
                      ? 'bg-[var(--brand-soft)]'
                      : 'hover:bg-[var(--surface-2)]',
                  )}
                >
                  <span
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[11px] font-bold text-white"
                    style={{ background: o.logoColor }}
                  >
                    {o.name.charAt(0)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium">{o.name}</span>
                    <span className="block truncate text-[11.5px] text-[var(--ink-muted)]">
                      {o.role.toLowerCase()} · {o.counts.members} members
                    </span>
                  </span>
                  {o.orgId === active?.orgId ? (
                    <Check size={14} className="text-[var(--brand)]" />
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

export function NoOrgState() {
  return (
    <div className="card grid place-items-center px-6 py-20 text-center">
      <span className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
        <Building2 size={22} />
      </span>
      <p className="text-[15px] font-semibold">No organization yet</p>
      <p className="mt-1 max-w-sm text-[13px] text-[var(--ink-muted)]">
        A business workspace adds departments, vendors, approval workflows, GST reporting and
        runway on top of the same ledger.
      </p>
    </div>
  );
}
