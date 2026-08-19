import { cn } from '@/lib/cn';

const TONES = {
  neutral: 'text-[var(--ink)]',
  good: 'text-[var(--good-text)]',
  critical: 'text-[var(--critical-text)]',
} as const;

export function Stat({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  tone?: keyof typeof TONES;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[var(--line)] pb-2.5 last:border-0 last:pb-0">
      <dt className="text-[12.5px] text-[var(--ink-2)]">{label}</dt>
      <dd className={cn('tabular text-[13.5px] font-medium', TONES[tone])}>{value}</dd>
    </div>
  );
}
