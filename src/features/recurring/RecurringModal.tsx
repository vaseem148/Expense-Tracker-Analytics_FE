import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { FieldRow, Input, Label, Select } from '@/components/ui/Field';
import { useAccounts, useCategories, useSaveRecurring } from '@/api/queries';
import { toast } from '@/store/toast';

const FREQUENCIES = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'];

export function RecurringModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const save = useSaveRecurring();

  const [form, setForm] = useState({
    description: '',
    amount: '',
    accountId: '',
    categoryId: '',
    frequency: 'MONTHLY',
    interval: '1',
    dayOfMonth: '1',
    startDate: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    if (open && accounts?.length) {
      setForm((f) => ({ ...f, accountId: f.accountId || accounts[0].id }));
    }
  }, [open, accounts]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await save.mutateAsync({
        description: form.description.trim(),
        amount: Number(form.amount),
        accountId: form.accountId,
        categoryId: form.categoryId || undefined,
        frequency: form.frequency,
        interval: Number(form.interval),
        dayOfMonth: form.frequency === 'MONTHLY' ? Number(form.dayOfMonth) : undefined,
        startDate: form.startDate,
      });
      toast.success('Recurring rule created');
      onClose();
    } catch (err) {
      toast.error('Could not save rule', (err as Error).message);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New recurring rule"
      description="A start date in the past advances to the next future slot rather than back-posting."
      width="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="recurring-form" loading={save.isPending}>
            Create rule
          </Button>
        </>
      }
    >
      <form id="recurring-form" onSubmit={submit} className="space-y-4">
        <FieldRow>
          <div>
            <Label>Description</Label>
            <Input
              required
              autoFocus
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Netflix subscription"
            />
          </div>
          <div>
            <Label>Amount</Label>
            <Input
              required
              type="number"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="649"
            />
          </div>
        </FieldRow>

        <FieldRow>
          <div>
            <Label>Account</Label>
            <Select
              required
              value={form.accountId}
              onChange={(e) => setForm({ ...form, accountId: e.target.value })}
            >
              <option value="">Select an account</option>
              {(accounts ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label hint="optional">Category</Label>
            <Select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">Uncategorised</option>
              {(categories ?? [])
                .filter((c) => c.kind === 'EXPENSE')
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </Select>
          </div>
        </FieldRow>

        <FieldRow cols={3}>
          <div>
            <Label>Frequency</Label>
            <Select
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value })}
            >
              {FREQUENCIES.map((f) => (
                <option key={f} value={f}>
                  {f.charAt(0) + f.slice(1).toLowerCase()}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label hint="every N periods">Interval</Label>
            <Input
              type="number"
              min="1"
              max="52"
              value={form.interval}
              onChange={(e) => setForm({ ...form, interval: e.target.value })}
            />
          </div>
          <div>
            <Label>Start date</Label>
            <Input
              required
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>
        </FieldRow>

        {form.frequency === 'MONTHLY' ? (
          <div>
            <Label hint="clamped in shorter months">Day of month</Label>
            <Input
              type="number"
              min="1"
              max="31"
              value={form.dayOfMonth}
              onChange={(e) => setForm({ ...form, dayOfMonth: e.target.value })}
            />
          </div>
        ) : null}
      </form>
    </Modal>
  );
}
