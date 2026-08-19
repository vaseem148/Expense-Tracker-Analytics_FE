import { Brain, Cpu, Wand2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { RangePicker } from '@/components/layout/RangePicker';
import { useRange } from '@/hooks/useRange';
import {
  useAutoCategorize,
  useMlAnomalies,
  useMlCashflowRisk,
  useMlClusters,
  useMlStatus,
  useTrainModel,
} from '@/api/queries';
import { toast } from '@/store/toast';
import { RiskPanel } from './RiskPanel';
import { ClusterPanel } from './ClusterPanel';
import { AnomalyList } from './AnomalyList';

export function InsightsPage() {
  const { range, preset, choosePreset, granularity, setGranularity } = useRange('12m');
  const status = useMlStatus();
  const anomalies = useMlAnomalies(range);
  const clusters = useMlClusters(range);
  const risk = useMlCashflowRisk(range);
  const autoCategorize = useAutoCategorize();
  const train = useTrainModel();

  const online = status.data?.serviceAvailable;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em]">AI insights</h1>
          <p className="mt-0.5 text-[13px] text-[var(--ink-muted)]">
            Models run in a separate Python service; when it is offline the API falls back to
            deterministic in-process versions
          </p>
        </div>
        <RangePicker
          preset={preset}
          onPreset={choosePreset}
          granularity={granularity}
          onGranularity={setGranularity}
          compact
        />
      </header>

      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="grid h-10 w-10 place-items-center rounded-xl"
            style={{
              background: online
                ? 'color-mix(in oklab, var(--good) 14%, transparent)'
                : 'var(--surface-2)',
              color: online ? 'var(--good-text)' : 'var(--ink-muted)',
            }}
          >
            <Cpu size={19} />
          </span>
          <div>
            <p className="flex flex-wrap items-center gap-2 text-[14px] font-medium">
              Data-science service
              <Badge tone={online ? 'good' : 'neutral'}>
                {online ? 'online' : 'fallback mode'}
              </Badge>
            </p>
            <p className="text-[12px] text-[var(--ink-muted)]">
              {online
                ? 'Isolation Forest, KMeans and a per-user Naive Bayes classifier are live'
                : 'Using MAD outliers, quartile segmentation and keyword rules instead'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={<Brain size={15} />}
            loading={train.isPending}
            onClick={async () => {
              const result = await train.mutateAsync();
              if (result.trained) {
                toast.success(
                  'Model trained',
                  `${result.samples} samples · ${Math.round((result.accuracy ?? 0) * 100)}% cross-validated accuracy`,
                );
              } else {
                toast.warning('Not trained', result.reason);
              }
            }}
          >
            Train on my data
          </Button>
          <Button
            variant="primary"
            icon={<Wand2 size={15} />}
            loading={autoCategorize.isPending}
            onClick={async () => {
              const result = await autoCategorize.mutateAsync();
              toast.success(
                `Categorised ${result.updated} transactions`,
                `${result.skipped} left for review - the model was not confident enough`,
              );
            }}
          >
            Auto-categorise
          </Button>
        </div>
      </Card>

      <section className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
        <RiskPanel data={risk.data} loading={risk.isLoading} />
        <ClusterPanel data={clusters.data} loading={clusters.isLoading} />
      </section>

      <AnomalyList
        items={anomalies.data?.items ?? []}
        model={anomalies.data?.model}
        loading={anomalies.isLoading}
      />
    </div>
  );
}
