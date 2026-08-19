import { useState } from 'react';
import { Download, FileSpreadsheet, Upload } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Label, Select, Textarea } from '@/components/ui/Field';
import { api } from '@/api/client';
import { useAccounts, useLedgerInvalidator } from '@/api/queries';
import { toast } from '@/store/toast';
import { MappingForm, type Preview } from './MappingForm';

const SAMPLE = `Date,Narration,Withdrawal Amt.,Deposit Amt.
18/08/2026,UPI/SWIGGY BANGALORE/4238912,349.00,
17/08/2026,SALARY CREDIT ACME ANALYTICS,,125000.00
16/08/2026,POS 4321 BIGBASKET,2140.50,`;

function save(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** CSV import: preview headers, map columns, dry-run, then commit. */
export function DataPage() {
  const { data: accounts } = useAccounts();
  const invalidate = useLedgerInvalidator();

  const [csv, setCsv] = useState('');
  const [preview, setPreview] = useState<Preview | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [accountId, setAccountId] = useState('');
  const [busy, setBusy] = useState(false);

  const runPreview = async () => {
    setBusy(true);
    try {
      const result = await api.post<Preview>('/data/import/preview', { csv });
      setPreview(result);
      setMapping(
        Object.fromEntries(
          Object.entries(result.suggestedMapping).filter(([, v]) => v) as [string, string][],
        ),
      );
      toast.success(`Found ${result.headers.length} columns`);
    } catch (err) {
      toast.error('Could not read that file', (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const runImport = async (dryRun: boolean) => {
    setBusy(true);
    try {
      const result = await api.post<{
        imported?: number;
        skipped?: number;
        failed?: number;
        parsed?: number;
        errors?: { line: number; reason: string }[];
      }>('/data/import', {
        csv,
        accountId,
        mapping,
        dryRun,
        skipDuplicates: true,
        autoCategorize: true,
      });

      if (dryRun) {
        toast.info(
          `${result.parsed} rows parse cleanly`,
          result.errors?.length ? `${result.errors.length} rows would fail` : 'No errors found',
        );
      } else {
        toast.success(
          `Imported ${result.imported} transactions`,
          `${result.skipped} duplicates skipped, ${result.failed} failed`,
        );
        invalidate();
        setCsv('');
        setPreview(null);
      }
    } catch (err) {
      toast.error('Import failed', (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const download = async (format: 'csv' | 'json') => {
    try {
      if (format === 'csv') {
        const text = await api.getText('/data/export/csv');
        save(new Blob([text], { type: 'text/csv' }), 'expenses.csv');
      } else {
        const json = await api.get<unknown>('/data/export/json');
        save(new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' }), 'backup.json');
      }
      toast.success('Download started');
    } catch (err) {
      toast.error('Export failed', (err as Error).message);
    }
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Import and export</h1>
        <p className="mt-0.5 text-[13px] text-[var(--ink-muted)]">
          Bring in a bank statement, or take everything with you
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader
            title="Import a CSV"
            subtitle="Duplicates are caught by hash, so re-importing an overlapping statement is safe"
            icon={<Upload size={15} />}
            action={
              <Button size="sm" variant="ghost" onClick={() => setCsv(SAMPLE)}>
                Use sample
              </Button>
            }
          />

          <Label hint="paste the file contents including the header row">CSV content</Label>
          <Textarea
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            placeholder={SAMPLE}
            className="min-h-32 font-mono text-[12px]"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="secondary" loading={busy} disabled={!csv.trim()} onClick={runPreview}>
              Read columns
            </Button>
            {preview ? (
              <>
                <Button
                  variant="secondary"
                  loading={busy}
                  disabled={!accountId}
                  onClick={() => runImport(true)}
                >
                  Dry run
                </Button>
                <Button
                  variant="primary"
                  loading={busy}
                  disabled={!accountId}
                  onClick={() => runImport(false)}
                >
                  Import for real
                </Button>
              </>
            ) : null}
          </div>

          {preview ? (
            <div className="mt-5 space-y-4 border-t border-[var(--line)] pt-4">
              <div>
                <Label>Target account</Label>
                <Select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                  <option value="">Choose where these rows belong</option>
                  {(accounts ?? []).map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </Select>
              </div>
              <MappingForm preview={preview} mapping={mapping} onChange={setMapping} />
            </div>
          ) : null}
        </Card>

        <Card>
          <CardHeader
            title="Export"
            subtitle="Your ledger, in a format something else can read"
            icon={<Download size={15} />}
          />
          <div className="space-y-3">
            <button
              onClick={() => download('csv')}
              className="flex w-full items-center gap-3 rounded-xl border border-[var(--line)] p-3.5 text-left transition-colors hover:border-[var(--brand)]"
            >
              <FileSpreadsheet size={18} className="shrink-0 text-[var(--brand)]" />
              <div>
                <p className="text-[13.5px] font-medium">CSV of every transaction</p>
                <p className="text-[11.5px] text-[var(--ink-muted)]">
                  Category, account, vendor, department, tax and tags included
                </p>
              </div>
            </button>

            <button
              onClick={() => download('json')}
              className="flex w-full items-center gap-3 rounded-xl border border-[var(--line)] p-3.5 text-left transition-colors hover:border-[var(--brand)]"
            >
              <Download size={18} className="shrink-0 text-[var(--brand)]" />
              <div>
                <p className="text-[13.5px] font-medium">Full JSON backup</p>
                <p className="text-[11.5px] text-[var(--ink-muted)]">
                  Accounts, categories, budgets, goals and recurring rules too
                </p>
              </div>
            </button>
          </div>

          <div className="mt-5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3.5">
            <p className="text-[12.5px] font-medium text-[var(--ink-2)]">On duplicates</p>
            <p className="mt-1 text-[11.5px] leading-snug text-[var(--ink-muted)]">
              A row is fingerprinted by account, day, amount and normalised description, so the same
              charge arriving from both a bank feed and a statement upload lands once.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
