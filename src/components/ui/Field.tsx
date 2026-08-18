import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const BASE =
  'w-full h-9.5 rounded-[10px] border border-[var(--line)] bg-[var(--surface-2)] px-3 text-sm text-[var(--ink)] ' +
  'placeholder:text-[var(--ink-muted)] transition-[border-color,box-shadow] duration-150 ' +
  'focus:outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]';

export function Label({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <label className="block text-[12.5px] font-medium text-[var(--ink-2)] mb-1.5">
      {children}
      {hint ? <span className="ml-1.5 font-normal text-[var(--ink-muted)]">{hint}</span> : null}
    </label>
  );
}

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="mt-1 text-[12px] text-[var(--critical-text)]">{children}</p>;
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} className={cn(BASE, className)} />;
}

export function Select({
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...rest} className={cn(BASE, 'pr-8 cursor-pointer', className)}>
      {children}
    </select>
  );
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...rest} className={cn(BASE, 'h-auto min-h-20 py-2 leading-relaxed', className)} />;
}

export function FieldRow({ children, cols = 2 }: { children: ReactNode; cols?: 1 | 2 | 3 }) {
  return (
    <div
      className={cn(
        'grid gap-4',
        cols === 1 && 'grid-cols-1',
        cols === 2 && 'grid-cols-1 sm:grid-cols-2',
        cols === 3 && 'grid-cols-1 sm:grid-cols-3',
      )}
    >
      {children}
    </div>
  );
}
