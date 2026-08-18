import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl';
}

const WIDTHS = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

export function Modal({ open, onClose, title, description, children, footer, width = 'md' }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    // Lock the page behind the dialog so background content cannot scroll.
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div
        className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-[2px] animate-fade"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative w-full bg-[var(--surface)] border border-[var(--line)] shadow-[var(--shadow-lg)]',
          'rounded-t-2xl sm:rounded-2xl animate-scale-in max-h-[92vh] flex flex-col',
          WIDTHS[width],
        )}
      >
        <header className="flex items-start justify-between gap-4 px-5 pt-5 pb-4 border-b border-[var(--line)]">
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-[-0.01em]">{title}</h2>
            {description ? (
              <p className="text-[13px] text-[var(--ink-muted)] mt-0.5">{description}</p>
            ) : null}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="grid place-items-center h-8 w-8 rounded-lg text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] transition-colors"
          >
            <X size={16} />
          </button>
        </header>
        <div className="px-5 py-5 overflow-y-auto">{children}</div>
        {footer ? (
          <footer className="px-5 py-4 border-t border-[var(--line)] flex justify-end gap-2 bg-[var(--surface-2)]/40 rounded-b-2xl">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
