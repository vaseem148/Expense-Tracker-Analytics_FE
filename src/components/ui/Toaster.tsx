import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useToasts } from '@/store/toast';

const ICONS = {
  success: <CheckCircle2 size={16} />,
  error: <XCircle size={16} />,
  warning: <AlertTriangle size={16} />,
  info: <Info size={16} />,
};

const TONES = {
  success: 'text-[var(--good-text)] border-l-[var(--good)]',
  error: 'text-[var(--critical-text)] border-l-[var(--critical)]',
  warning: 'text-[var(--warning-text)] border-l-[var(--warning)]',
  info: 'text-[var(--brand)] border-l-[var(--brand)]',
};

export function Toaster() {
  const { toasts, dismiss } = useToasts();
  if (!toasts.length) return null;

  return createPortal(
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2.5 w-[min(92vw,22rem)]">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="card animate-rise flex items-start gap-3 p-3.5 border-l-[3px] shadow-[var(--shadow-lg)]"
          style={{ borderLeftColor: 'currentColor' }}
        >
          <span className={`mt-0.5 shrink-0 ${TONES[t.variant]}`}>{ICONS[t.variant]}</span>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-medium text-[var(--ink)]">{t.title}</p>
            {t.description ? (
              <p className="text-[12.5px] text-[var(--ink-muted)] mt-0.5 leading-snug">
                {t.description}
              </p>
            ) : null}
          </div>
          <button
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss notification"
            className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>,
    document.body,
  );
}
