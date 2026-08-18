import { ArrowDownLeft, ArrowUpRight, Pencil, Repeat, Trash2 } from 'lucide-react';
import type { Transaction } from '@/api/types';
import { currency, longDate } from '@/lib/format';
import { cn } from '@/lib/cn';

const TYPE_META = {
  EXPENSE: { icon: ArrowUpRight, color: 'var(--s2)', sign: '-' },
  INCOME: { icon: ArrowDownLeft, color: 'var(--s3)', sign: '+' },
  TRANSFER: { icon: Repeat, color: 'var(--ink-muted)', sign: '' },
} as const;

interface Props {
  items: Transaction[];
  selected: Set<string>;
  allSelected: boolean;
  onToggleAll: () => void;
  onToggleOne: (id: string) => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionTable({
  items,
  selected,
  allSelected,
  onToggleAll,
  onToggleOne,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[54rem] border-collapse">
        <thead>
          <tr className="border-b border-[var(--line)] text-left">
            <th className="w-10 px-3 py-2.5">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleAll}
                aria-label="Select all on this page"
                className="h-3.5 w-3.5 accent-[var(--brand)]"
              />
            </th>
            {['Description', 'Category', 'Account', 'Date', 'Amount', ''].map((h, i) => (
              <th
                key={h || i}
                className={cn(
                  'px-3 py-2.5 text-[11.5px] font-semibold uppercase tracking-wide text-[var(--ink-muted)]',
                  h === 'Amount' && 'text-right',
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((t) => {
            const meta = TYPE_META[t.type];
            const Icon = meta.icon;
            return (
              <tr
                key={t.id}
                className={cn(
                  'group border-b border-[var(--line)] transition-colors last:border-0 hover:bg-[var(--surface-2)]',
                  selected.has(t.id) && 'bg-[var(--brand-soft)]',
                )}
              >
                <td className="px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={selected.has(t.id)}
                    onChange={() => onToggleOne(t.id)}
                    aria-label={`Select ${t.description}`}
                    className="h-3.5 w-3.5 accent-[var(--brand)]"
                  />
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-lg"
                      style={{
                        background: `color-mix(in oklab, ${meta.color} 14%, transparent)`,
                        color: meta.color,
                      }}
                    >
                      <Icon size={14} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-medium text-[var(--ink)]">
                        {t.description}
                      </p>
                      {t.merchant || t.tags.length ? (
                        <p className="truncate text-[11.5px] text-[var(--ink-muted)]">
                          {t.merchant}
                          {t.tags.length ? ` · ${t.tags.map((x) => x.name).join(', ')}` : ''}
                        </p>
                      ) : null}
                    </div>
                    {t.isRecurring ? (
                      <Repeat size={12} className="shrink-0 text-[var(--ink-muted)]" />
                    ) : null}
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  {t.category ? (
                    <span className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--ink-2)]">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: t.category.color }}
                        aria-hidden
                      />
                      {t.category.name}
                    </span>
                  ) : (
                    <span className="text-[12.5px] text-[var(--ink-muted)]">Uncategorised</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-[12.5px] text-[var(--ink-2)]">{t.account?.name}</td>
                <td className="px-3 py-2.5 text-[12.5px] text-[var(--ink-muted)]">
                  {longDate(t.date)}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <span
                    className="tabular text-[13.5px] font-semibold"
                    style={{ color: t.type === 'INCOME' ? 'var(--good-text)' : 'var(--ink)' }}
                  >
                    {meta.sign}
                    {currency(t.amount, t.currency)}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => onEdit(t)}
                      aria-label="Edit"
                      className="grid h-7 w-7 place-items-center rounded-md text-[var(--ink-muted)] hover:bg-[var(--surface)] hover:text-[var(--ink)]"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => onDelete(t.id)}
                      aria-label="Delete"
                      className="grid h-7 w-7 place-items-center rounded-md text-[var(--ink-muted)] hover:bg-[var(--surface)] hover:text-[var(--critical-text)]"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
