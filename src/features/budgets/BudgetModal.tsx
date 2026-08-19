import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { FieldRow, Input, Label, Select } from '@/components/ui/Field';
import { useCategories, useSaveBudget } from '@/api/queries';
import { toast } from '@/store/toast';
import type { BudgetItem } from '@/api/types';

const PERIODS = ['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'];

export function BudgetModal({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: BudgetItem | null;
}) {
  const { data: categories } = useCategories();
  const save = useSaveBudget();
  const [form, setForm] = useState({
    name: '',
    amount: '',
    period: 'MONTHLY',
    categoryId: '',
    alertThreshold: '0.8',
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      name: editing?.name ?? '',
      amount: editing ? String(editing.limit) : '',
      period: editing?.period ?? 'MONTHLY',
      categoryId: editing?.categoryId ?? '',
      alertThreshold: editing ? String(editing.alertThresholdPct / 100) : '0.8',
    });
  }, [open, editing]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await save.mutateAsync({
        id: editing?.id,
        name: form.name.trim(),
        amount: Number(form.amount),
        period: form.period,
        categoryId: form.categoryId || undefined,
        alertThreshold: Number(form.alertThreshold),
      });
      toast.success(editing ? 'Budget updated' : 'Budget created');
      onClose();
    } catch (err) {
      toast.error('Could not save budget', (err as Error).message);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit budget' : 'New budget'}
      description="The alert threshold decides when a notification fires."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="budget-form" loading={save.isPending}>
            {editing ? 'Save changes' : 'Create budget'}
          </Button>
        </>
      }
    >
      <form id="budget-form" onSubmit={submit} className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input
            required
            autoFocus
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Food cap"
          />
        </div>

        <FieldRow>
          <div>
            <Label>Limit</Label>
            <Input
              required
              type="number"
              min="1"
              step="1"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="18000"
            />
          </div>
          <div>
            <Label>Period</Label>
            <Select value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })}>
              {PERIODS.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0) + p.slice(1).toLowerCase()}
                </option>
              ))}
            </Select>
          </div>
        </FieldRow>

        <FieldRow>
          <div>
            <Label hint="empty caps all spending">Category</Label>
            <Select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">All categories</option>
              {(categories ?? [])
                .filter((c) => c.kind === 'EXPENSE')
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </Select>
          </div>
          <div>
            <Label hint="fraction consumed">Alert at</Label>
            <Select
              value={form.alertThreshold}
              onChange={(e) => setForm({ ...form, alertThreshold: e.target.value })}
            >
              {['0.5', '0.7', '0.8', '0.9', '1'].map((v) => (
                <option key={v} value={v}>
                  {Number(v) * 100}%
                </option>
              ))}
            </Select>
          </div>
        </FieldRow>
      </form>
    </Modal>
  );
}
