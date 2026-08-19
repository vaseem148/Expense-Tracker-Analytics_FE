import { Star } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { compact, currency, longDate } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { VendorRow } from '@/api/business.types';

const HEADERS = ['Supplier', 'Category', 'GSTIN', 'Terms', 'Spend', 'Outstanding', 'Risk'];

export function VendorTable({ vendors }: { vendors: VendorRow[] }) {
  return (
    <Card padded={false}>
      <div className="p-5 pb-3">
        <CardHeader
          title="Supplier ledger"
          subtitle="Risk combines overdue exposure, missing tax identity and how thin the history is"
          className="mb-0"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[56rem] border-collapse text-left">
          <thead>
            <tr className="border-y border-[var(--line)] bg-[var(--surface-2)]">
              {HEADERS.map((h) => (
                <th
                  key={h}
                  className={cn(
                    'px-4 py-2.5 text-[11.5px] font-semibold uppercase tracking-wide text-[var(--ink-muted)]',
                    ['Spend', 'Outstanding'].includes(h) && 'text-right',
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => (
              <tr
                key={v.id}
                className="border-b border-[var(--line)] transition-colors last:border-0 hover:bg-[var(--surface-2)]"
              >
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5 text-[13.5px] font-medium">
                    {v.isPreferred ? (
                      <Star size={12} className="text-[var(--warning)]" fill="currentColor" />
                    ) : null}
                    {v.name}
                  </span>
                  {v.lastTransaction ? (
                    <span className="text-[11px] text-[var(--ink-muted)]">
                      last {longDate(v.lastTransaction)}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-[12.5px] text-[var(--ink-2)]">{v.category}</td>
                <td className="px-4 py-3">
                  {v.gstin ? (
                    <span className="tabular text-[11.5px] text-[var(--ink-2)]">{v.gstin}</span>
                  ) : (
                    <Badge tone="warning">missing</Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-[12.5px] text-[var(--ink-2)]">
                  net {v.paymentTermsDays}d
                </td>
                <td className="tabular px-4 py-3 text-right text-[13px] font-medium">
                  {currency(v.totalSpend)}
                  <span className="ml-1.5 text-[11px] font-normal text-[var(--ink-muted)]">
                    {v.spendShare}%
                  </span>
                </td>
                <td className="tabular px-4 py-3 text-right text-[13px]">
                  {v.outstanding > 0 ? compact(v.outstanding) : '--'}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    tone={v.riskScore >= 60 ? 'critical' : v.riskScore >= 30 ? 'warning' : 'good'}
                  >
                    {Math.round(v.riskScore)}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
