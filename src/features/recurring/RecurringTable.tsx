import { Play, Trash2 } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { compact, currency, longDate } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { RecurringRule } from '@/api/types';

const HEADERS = ['Rule', 'Category', 'Frequency', 'Next run', 'Amount', 'Annual', ''];

export function RecurringTable({
  items,
  onRun,
  onDelete,
}: {
  items: RecurringRule[];
  onRun: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card padded={false}>
      <div className="p-5 pb-3">
        <CardHeader
          title="Declared rules"
          subtitle="Posting is idempotent - re-running the scheduler never duplicates a row"
          className="mb-0"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[48rem] border-collapse text-left">
          <thead>
            <tr className="border-y border-[var(--line)] bg-[var(--surface-2)]">
              {HEADERS.map((h, i) => (
                <th
                  key={h || i}
                  className={cn(
                    'px-4 py-2.5 text-[11.5px] font-semibold uppercase tracking-wide text-[var(--ink-muted)]',
                    ['Amount', 'Annual'].includes(h) && 'text-right',
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr
                key={r.id}
                className="group border-b border-[var(--line)] transition-colors last:border-0 hover:bg-[var(--surface-2)]"
              >
                <td className="px-4 py-2.5">
                  <p className="text-[13.5px] font-medium">{r.description}</p>
                  <p className="text-[11.5px] text-[var(--ink-muted)]">{r.accountName}</p>
                </td>
                <td className="px-4 py-2.5">
                  <span className="flex items-center gap-1.5 text-[12.5px] text-[var(--ink-2)]">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: r.categoryColor }}
                      aria-hidden
                    />
                    {r.categoryName}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-[12.5px] text-[var(--ink-2)]">
                  {r.interval > 1 ? `every ${r.interval} ` : ''}
                  {r.frequency.toLowerCase()}
                </td>
                <td className="px-4 py-2.5">
                  <span className="text-[12.5px] text-[var(--ink-2)]">{longDate(r.nextRunAt)}</span>
                  <span
                    className={cn(
                      'ml-1.5 text-[11.5px]',
                      r.daysUntilNext <= 3 ? 'text-[var(--warning-text)]' : 'text-[var(--ink-muted)]',
                    )}
                  >
                    ({r.daysUntilNext}d)
                  </span>
                </td>
                <td className="tabular px-4 py-2.5 text-right text-[13px] font-medium">
                  {currency(r.amount)}
                </td>
                <td className="tabular px-4 py-2.5 text-right text-[13px] text-[var(--ink-muted)]">
                  {compact(r.annualCost)}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => onRun(r.id)}
                      aria-label="Post now"
                      className="grid h-7 w-7 place-items-center rounded-md text-[var(--ink-muted)] hover:bg-[var(--surface)] hover:text-[var(--brand)]"
                    >
                      <Play size={13} />
                    </button>
                    <button
                      onClick={() => onDelete(r.id)}
                      aria-label="Delete rule"
                      className="grid h-7 w-7 place-items-center rounded-md text-[var(--ink-muted)] hover:bg-[var(--surface)] hover:text-[var(--critical-text)]"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
