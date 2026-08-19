import { Sparkles } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Gauge } from '@/components/charts/Gauge';

interface Props {
  data?: {
    source: string;
    model: string;
    riskScore: number;
    probabilityNegative: number;
    drivers: string[];
  };
  loading: boolean;
}

export function RiskPanel({ data, loading }: Props) {
  return (
    <Card>
      <CardHeader
        title="Cash-flow risk"
        subtitle={data ? data.model : 'Probability the next period ends negative'}
        icon={<Sparkles size={15} />}
      />
      {loading || !data ? (
        <div className="h-48" />
      ) : (
        <div className="flex flex-col items-center gap-5 sm:flex-row">
          <Gauge
            value={data.riskScore}
            sublabel="risk score"
            color={
              data.riskScore >= 60
                ? 'var(--critical)'
                : data.riskScore >= 30
                  ? 'var(--warning)'
                  : 'var(--good)'
            }
          />
          <div className="min-w-0 flex-1">
            <p className="mb-2 text-[13px] text-[var(--ink-2)]">
              <span className="font-semibold text-[var(--ink)]">{data.probabilityNegative}%</span>{' '}
              chance the next period closes in deficit.
            </p>
            <ul className="space-y-1.5">
              {data.drivers.map((d) => (
                <li key={d} className="flex gap-2 text-[12.5px] text-[var(--ink-muted)]">
                  <span
                    className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--ink-muted)]"
                    aria-hidden
                  />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}
