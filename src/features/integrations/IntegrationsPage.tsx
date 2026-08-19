import { useState } from 'react';
import { Check, Plug } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useConnectors, useIntegrations } from '@/api/queries';
import { cn } from '@/lib/cn';
import type { ConnectorSpec } from '@/api/business.types';
import { ConnectModal } from './ConnectModal';
import { ConnectedList } from './ConnectedList';

export function IntegrationsPage() {
  const { data: integrations, isLoading } = useIntegrations();
  const { data: connectors } = useConnectors();
  const [connecting, setConnecting] = useState<ConnectorSpec | null>(null);

  const connectedProviders = new Set((integrations ?? []).map((i) => i.provider));
  const groups = (connectors ?? []).reduce<Record<string, ConnectorSpec[]>>((acc, c) => {
    (acc[c.category] ??= []).push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Integrations</h1>
        <p className="mt-0.5 text-[13px] text-[var(--ink-muted)]">
          Connect the systems your company already runs on. Credentials are encrypted at rest and
          every connector ships a sandbox mode.
        </p>
      </header>

      {isLoading ? (
        <SkeletonCard height="h-64" />
      ) : integrations?.length ? (
        <ConnectedList items={integrations} />
      ) : null}

      {Object.entries(groups).map(([category, specs]) => (
        <section key={category}>
          <h2 className="mb-2.5 flex items-center gap-2 text-[13px] font-semibold text-[var(--ink-2)]">
            <Plug size={14} className="text-[var(--ink-muted)]" />
            {category}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {specs.map((spec) => {
              const connected = connectedProviders.has(spec.provider);
              return (
                <Card key={spec.provider} hover className="flex flex-col">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="text-[14px] font-semibold">{spec.displayName}</p>
                    {connected ? (
                      <Badge tone="good" icon={<Check size={11} />}>
                        connected
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mb-3 text-[12px] text-[var(--ink-muted)]">
                    {spec.capabilities
                      .map((c) =>
                        c === 'PULL'
                          ? 'imports data'
                          : c === 'PUSH'
                            ? 'exports data'
                            : 'sends alerts',
                      )
                      .join(' · ')}
                  </p>
                  <ul className="mb-4 space-y-1">
                    {spec.requiredCredentials.slice(0, 3).map((c) => (
                      <li
                        key={c.key}
                        className="flex items-center gap-1.5 text-[11.5px] text-[var(--ink-muted)]"
                      >
                        <span
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            c.secret ? 'bg-[var(--warning)]' : 'bg-[var(--line-strong)]',
                          )}
                          aria-hidden
                        />
                        {c.label}
                        {c.secret ? ' (secret)' : ''}
                      </li>
                    ))}
                  </ul>
                  <Button
                    size="sm"
                    variant={connected ? 'secondary' : 'primary'}
                    className="mt-auto"
                    onClick={() => setConnecting(spec)}
                  >
                    {connected ? 'Reconfigure' : 'Connect'}
                  </Button>
                </Card>
              );
            })}
          </div>
        </section>
      ))}

      <ConnectModal spec={connecting} onClose={() => setConnecting(null)} />
    </div>
  );
}
