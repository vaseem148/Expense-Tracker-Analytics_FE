import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import type { Insight } from '@/api/types';
import { cn } from '@/lib/cn';

const TONE = {
  positive: { icon: CheckCircle2, color: 'var(--good-text)', ring: 'var(--good)' },
  neutral: { icon: Info, color: 'var(--ink-2)', ring: 'var(--line-strong)' },
  warning: { icon: AlertTriangle, color: 'var(--warning-text)', ring: 'var(--warning)' },
  critical: { icon: XCircle, color: 'var(--critical-text)', ring: 'var(--critical)' },
} as const;

/**
 * Insight cards carry an icon as well as a colour, so severity survives for
 * colourblind readers and in print - status colour never rides alone.
 */
export function InsightList({ insights }: { insights: Insight[] }) {
  if (!insights.length) {
    return (
      <p className="py-10 text-center text-[13px] text-[var(--ink-muted)]">
        Not enough history yet for insights
      </p>
    );
  }

  return (
    <ul className="space-y-2.5">
      {insights.slice(0, 6).map((insight, i) => {
        const tone = TONE[insight.severity];
        const Icon = tone.icon;
        return (
          <li
            key={insight.id}
            className="animate-rise flex gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3"
            style={{ animationDelay: `${i * 45}ms`, borderLeft: `3px solid ${tone.ring}` }}
          >
            <span className="mt-0.5 shrink-0" style={{ color: tone.color }}>
              <Icon size={16} />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-[var(--ink)]">{insight.title}</p>
              <p className="mt-0.5 text-[12.5px] leading-snug text-[var(--ink-muted)]">
                {insight.detail}
              </p>
              {insight.action ? (
                <p
                  className={cn('mt-1.5 text-[12px] font-medium')}
                  style={{ color: tone.color }}
                >
                  {insight.action}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
