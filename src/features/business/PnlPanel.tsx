import { Card, CardHeader } from '@/components/ui/Card';
import { compact, currency, signedPercent } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { PnlResponse } from '@/api/business.types';

/** A statement, not a chart - line items with a comparison column read faster. */
export function PnlPanel({ data, currencyCode }: { data?: PnlResponse; currencyCode: string }) {
  if (!data) return null;

  return (
    <Card>
      <CardHeader
        title="Profit and loss"
        subtitle={`Net ${currency(data.netProfit, currencyCode)}${
          data.netMargin !== null ? ` · ${data.netMargin}% margin` : ''
        }`}
      />

      <Section title="Revenue" total={data.revenue.total} currencyCode={currencyCode}>
        {data.revenue.lines.slice(0, 5).map((l) => (
          <Line key={l.name} name={l.name} amount={l.amount} changePct={l.changePct} />
        ))}
      </Section>

      <Section title="Expenses" total={data.expenses.total} currencyCode={currencyCode}>
        {data.expenses.lines.slice(0, 8).map((l) => (
          <Line
            key={l.name}
            name={l.name}
            amount={l.amount}
            changePct={l.changePct}
            share={l.share}
          />
        ))}
      </Section>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-3.5 py-3">
        <span className="text-[13px] font-medium">Net profit</span>
        <span
          className="tabular text-[16px] font-semibold"
          style={{ color: data.netProfit >= 0 ? 'var(--good-text)' : 'var(--critical-text)' }}
        >
          {currency(data.netProfit, currencyCode)}
        </span>
      </div>
    </Card>
  );
}

function Section({
  title,
  total,
  currencyCode,
  children,
}: {
  title: string;
  total: number;
  currencyCode: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-1.5 flex items-baseline justify-between border-b border-[var(--line)] pb-1.5">
        <span className="text-[11.5px] font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
          {title}
        </span>
        <span className="tabular text-[13px] font-semibold">{currency(total, currencyCode)}</span>
      </div>
      <ul className="space-y-1">{children}</ul>
    </div>
  );
}

function Line({
  name,
  amount,
  changePct,
  share,
}: {
  name: string;
  amount: number;
  changePct: number | null;
  share?: number;
}) {
  return (
    <li className="flex items-baseline justify-between gap-3 py-0.5">
      <span className="min-w-0 truncate text-[12.5px] text-[var(--ink-2)]">
        {name}
        {share !== undefined ? (
          <span className="ml-1.5 text-[11px] text-[var(--ink-muted)]">{share.toFixed(0)}%</span>
        ) : null}
      </span>
      <span className="flex shrink-0 items-baseline gap-2.5">
        {changePct !== null ? (
          <span
            className={cn('tabular text-[11.5px]')}
            style={{
              color:
                Math.abs(changePct) < 5
                  ? 'var(--ink-muted)'
                  : changePct > 0
                    ? 'var(--critical-text)'
                    : 'var(--good-text)',
            }}
          >
            {signedPercent(changePct, 0)}
          </span>
        ) : null}
        <span className="tabular w-20 text-right text-[12.5px] font-medium">{compact(amount)}</span>
      </span>
    </li>
  );
}
