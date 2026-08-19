import { Wallet } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { useAccounts } from '@/api/queries';
import { currency } from '@/lib/format';

export function AccountsCard() {
  const { data: accounts } = useAccounts();

  return (
    <Card>
      <CardHeader
        title="Company accounts"
        subtitle="Balances are derived from the ledger, never stored"
        icon={<Wallet size={15} />}
      />
      <ul className="space-y-2">
        {(accounts ?? []).map((a) => (
          <li
            key={a.id}
            className="flex items-center gap-3 rounded-lg border border-[var(--line)] px-3 py-2"
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
              style={{ background: a.color }}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium">{a.name}</p>
              <p className="text-[11.5px] text-[var(--ink-muted)]">
                {a.type.replace('_', ' ').toLowerCase()} · {a.transactionCount} transactions
                {a.utilisation !== null ? ` · ${a.utilisation}% of limit used` : ''}
              </p>
            </div>
            <span
              className="tabular text-[13px] font-semibold"
              style={{ color: a.balance < 0 ? 'var(--critical-text)' : undefined }}
            >
              {currency(a.balance, a.currency)}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
