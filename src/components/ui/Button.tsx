import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-[var(--brand)] text-[var(--brand-ink)] hover:brightness-110 active:brightness-95 shadow-[var(--shadow-sm)]',
  secondary:
    'bg-[var(--surface-2)] text-[var(--ink)] hover:bg-[color-mix(in_oklab,var(--surface-2)_80%,var(--line-strong))]',
  ghost: 'text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]',
  outline:
    'border border-[var(--line)] text-[var(--ink)] hover:border-[var(--brand)] hover:text-[var(--brand)] bg-transparent',
  danger: 'bg-[var(--critical)] text-white hover:brightness-110',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-9.5 px-4 text-sm gap-2 rounded-[10px]',
  lg: 'h-11 px-5 text-[15px] gap-2 rounded-xl',
  icon: 'h-9 w-9 rounded-[10px] justify-center',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  loading,
  icon,
  className,
  children,
  disabled,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center font-medium whitespace-nowrap select-none',
        'transition-[background-color,color,border-color,transform,filter] duration-150',
        'active:translate-y-px disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    >
      {loading ? <Loader2 size={15} className="animate-spin-slow" /> : icon}
      {children}
    </button>
  );
}
