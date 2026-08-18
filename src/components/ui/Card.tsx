import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padded?: boolean;
}

export function Card({ children, className, hover, padded = true }: CardProps) {
  return (
    <section className={cn('card', hover && 'card-hover', padded && 'p-5', className)}>
      {children}
    </section>
  );
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, icon, className }: HeaderProps) {
  return (
    <header className={cn('flex items-start justify-between gap-4 mb-4', className)}>
      <div className="flex items-start gap-3 min-w-0">
        {icon ? (
          <span className="grid place-items-center h-8 w-8 rounded-lg bg-[var(--brand-soft)] text-[var(--brand)] shrink-0">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--ink)] truncate">
            {title}
          </h2>
          {subtitle ? (
            <p className="text-[12.5px] text-[var(--ink-muted)] mt-0.5 truncate">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
