import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { compact, currency, longDate } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { InvoiceRow } from '@/api/business.types';

const STATUS_TONE: Record<string, 'neutral' | 'brand' | 'good' | 'warning' | 'critical'> = {
  DRAFT: 'neutral',
  OPEN: 'brand',
  PARTIAL: 'warning',
  PAID: 'good',
  OVERDUE: 'critical',
  VOID: 'neutral',
};

const HEADERS = ['Invoice', 'Vendor', 'Due', 'Total', 'Outstanding', 'Status', ''];

export function InvoiceTable({
  items,
  busy,
  onPay,
}: {
  items: InvoiceRow[];
  busy: boolean;
  onPay: (id: string, amount: number) => void;
}) {
  return (
    <Card padded={false}>
      <div className="p-5 pb-3">
        <CardHeader
          title="Invoices"
          subtitle="Recording a payment also posts the matching ledger entry"
          className="mb-0"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem] border-collapse text-left">
          <thead>
            <tr className="border-y border-[var(--line)] bg-[var(--surface-2)]">
              {HEADERS.map((h, i) => (
                <th
                  key={h || i}
                  className={cn(
                    'px-4 py-2.5 text-[11.5px] font-semibold uppercase tracking-wide text-[var(--ink-muted)]',
                    ['Total', 'Outstanding'].includes(h) && 'text-right',
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr
                key={i.id}
                className="group border-b border-[var(--line)] transition-colors last:border-0 hover:bg-[var(--surface-2)]"
              >
                <td className="px-4 py-3 text-[13px] font-medium">{i.number}</td>
                <td className="px-4 py-3 text-[12.5px] text-[var(--ink-2)]">
                  {i.vendor.name}
                  <span className="ml-1.5 text-[11px] text-[var(--ink-muted)]">
                    net {i.vendor.paymentTermsDays}d
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[12.5px] text-[var(--ink-2)]">{longDate(i.dueDate)}</span>
                  <span
                    className="ml-1.5 text-[11.5px]"
                    style={{ color: i.daysToDue < 0 ? 'var(--critical-text)' : 'var(--ink-muted)' }}
                  >
                    ({i.daysToDue < 0 ? `${-i.daysToDue}d late` : `${i.daysToDue}d`})
                  </span>
                </td>
                <td className="tabular px-4 py-3 text-right text-[13px]">{currency(i.total)}</td>
                <td className="tabular px-4 py-3 text-right text-[13px] font-medium">
                  {i.outstanding > 0 ? compact(i.outstanding) : '--'}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={STATUS_TONE[i.status] ?? 'neutral'}>{i.status.toLowerCase()}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  {i.outstanding > 0 ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={busy}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => {
                        const input = window.prompt(
                          `Record a payment for ${i.number}`,
                          String(i.outstanding),
                        );
                        if (input) onPay(i.id, Number(input));
                      }}
                    >
                      Pay
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
