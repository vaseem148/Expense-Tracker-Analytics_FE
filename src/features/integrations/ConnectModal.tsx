import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Label, Select } from '@/components/ui/Field';
import { useConnectIntegration } from '@/api/queries';
import { toast } from '@/store/toast';
import type { ConnectorSpec } from '@/api/business.types';

/**
 * Sandbox is the default on purpose: the whole flow - connect, test, sync,
 * dedupe - is demonstrable with placeholder credentials before anyone pastes a
 * real secret.
 */
export function ConnectModal({
  spec,
  onClose,
}: {
  spec: ConnectorSpec | null;
  onClose: () => void;
}) {
  const connect = useConnectIntegration();
  const [mode, setMode] = useState<'SANDBOX' | 'LIVE'>('SANDBOX');
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [config, setConfig] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!spec) return;
    setMode('SANDBOX');
    setCredentials(
      Object.fromEntries(spec.requiredCredentials.map((c) => [c.key, `sandbox-${c.key}`])),
    );
    setConfig({});
  }, [spec]);

  if (!spec) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = (await connect.mutateAsync({
        provider: spec.provider,
        credentials,
        config,
        mode,
      })) as { test?: { ok: boolean; message: string } };
      if (result.test?.ok) toast.success(`${spec.displayName} connected`, result.test.message);
      else toast.warning('Saved, but the test failed', result.test?.message);
      onClose();
    } catch (err) {
      toast.error('Could not connect', (err as Error).message);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`Connect ${spec.displayName}`}
      description={spec.capabilities.join(' · ').toLowerCase()}
      width="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="connect-form" loading={connect.isPending}>
            Connect and test
          </Button>
        </>
      }
    >
      <form id="connect-form" onSubmit={submit} className="space-y-4">
        <div className="flex items-start gap-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[var(--good-text)]" />
          <p className="text-[12px] leading-snug text-[var(--ink-2)]">
            Secrets are encrypted with AES-256-GCM before they touch the database, and never come
            back out of the API in readable form.
          </p>
        </div>

        <div>
          <Label>Mode</Label>
          <Select value={mode} onChange={(e) => setMode(e.target.value as 'SANDBOX' | 'LIVE')}>
            <option value="SANDBOX">Sandbox - replay deterministic sample data</option>
            <option value="LIVE">Live - talk to the real provider</option>
          </Select>
        </div>

        {spec.requiredCredentials.map((c) => (
          <div key={c.key}>
            <Label hint={c.secret ? 'encrypted at rest' : undefined}>{c.label}</Label>
            <Input
              required
              type={c.secret && mode === 'LIVE' ? 'password' : 'text'}
              value={credentials[c.key] ?? ''}
              onChange={(e) => setCredentials({ ...credentials, [c.key]: e.target.value })}
            />
          </div>
        ))}

        {spec.configSchema.map((c) => (
          <div key={c.key}>
            <Label hint="optional">{c.label}</Label>
            <Input
              value={config[c.key] ?? ''}
              onChange={(e) => setConfig({ ...config, [c.key]: e.target.value })}
            />
          </div>
        ))}
      </form>
    </Modal>
  );
}
