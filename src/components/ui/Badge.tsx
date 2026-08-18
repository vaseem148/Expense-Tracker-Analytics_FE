import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'brand' | 'good' | 'warning' | 'critical' | 'serious';

const TONES: Record<Tone, string> = {
  neutral: 'bg-[var(--surface-2)] text-[var(--ink-2)] border-[var(--line)]',
  brand: 'bg-[var(--brand-soft)] text-[var(--brand)] border-[color-mix(in_oklab,var(--brand)_30%,transparent)]',
  good: 'bg-[color-mix(in_oklab,var(--good)_14%,transparent)] text-[var(--good-text)] border-[color-mix(in_oklab,var(--good)_32%,transparent)]',
  warning:
    'bg-[color-mix(in_oklab,var(--warning)_16%,transparent)] text-[var(--warning-text)] border-[color-mix(in_oklab,var(--warning)_36%,transparent)]',
  serious:
    'bg-[color-mix(in_oklab,var(--serious)_16%,transparent)] text-[var(--serious)] border-[color-mix(in_oklab,var(--serious)_36%,transparent)]',
  critical:
    'bg-[color-mix(in_oklab,var(--critical)_14%,transparent)] text-[var(--critical-text)] border-[color-mix(in_oklab,var(--critical)_32%,transparent)]',
};

export function Badge({
  children,
  tone = 'neutral',
  icon,
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11.5px] font-medium leading-5',
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
