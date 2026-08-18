import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { FieldRow, Input, Label, Select, Textarea } from '@/components/ui/Field';
import {
  useAccounts,
  useCategories,
  useCreateTransaction,
  useUpdateTransaction,
} from '@/api/queries';
import type { Transaction } from '@/api/types';
import { toast } from '@/store/toast';
import { cn } from '@/lib/cn';

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: Transaction | null;
}

const TYPES = [
  { value: 'EXPENSE', label: 'Expense' },
  { value: 'INCOME', label: 'Income' },
  { value: 'TRANSFER', label: 'Transfer' },
] as const;

const METHODS = ['UPI', 'CARD', 'CASH', 'NETBANKING', 'AUTO_DEBIT', 'OTHER'];
const today = () => new Date().toISOString().slice(0, 16);

export function TransactionDrawer({ open, onClose, editing }: Props) {
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const create = useCreateTransaction();
  const update = useUpdateTransaction();

  const [form, setForm] = useState({
    type: 'EXPENSE' as (typeof TYPES)[number]['value'],
    amount: '',
    description: '',
    date: today(),
    accountId: '',
    toAccountId: '',
    categoryId: '',
    merchant: '',
    paymentMethod: 'UPI',
    notes: '',
    tags: '',
  });

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        type: editing.type,
        amount: String(editing.amount),
        description: editing.description,
        date: new Date(editing.date).toISOString().slice(0, 16),
        accountId: editing.account?.id ?? '',
        toAccountId: editing.toAccount?.id ?? '',
        categoryId: editing.category?.id ?? '',
        merchant: editing.merchant ?? '',
        paymentMethod: editing.paymentMethod,
        notes: editing.notes ?? '',
        tags: editing.tags.map((t) => t.name).join(', '),
      });
    } else {
      setForm((f) => ({
        ...f,
        type: 'EXPENSE',
        amount: '',
        description: '',
        date: today(),
        accountId: accounts?.[0]?.id ?? '',
        categoryId: '',
        merchant: '',
        notes: '',
        tags: '',
      }));
    }
  }, [open, editing, accounts]);

  // Income and expense have disjoint category sets - offering both invites
  // mis-categorisation the analytics can never untangle afterwards.
  const visibleCategories = (categories ?? []).filter((c) =>
    form.type === 'INCOME' ? c.kind === 'INCOME' : c.kind === 'EXPENSE',
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, unknown> = {
      type: form.type,
      amount: Number(form.amount),
      description: form.description.trim(),
      date: new Date(form.date).toISOString(),
      accountId: form.accountId,
      paymentMethod: form.paymentMethod,
      ...(form.type === 'TRANSFER' ? { toAccountId: form.toAccountId } : {}),
      ...(form.categoryId && form.type !== 'TRANSFER' ? { categoryId: form.categoryId } : {}),
      ...(form.merchant ? { merchant: form.merchant.trim() } : {}),
      ...(form.notes ? { notes: form.notes.trim() } : {}),
      ...(form.tags ? { tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) } : {}),
    };

    try {
      if (editing) await update.mutateAsync({ id: editing.id, ...payload });
      else await create.mutateAsync(payload);
      toast.success(editing ? 'Transaction updated' : 'Transaction recorded');
      onClose();
    } catch (err) {
      toast.error('Could not save', (err as Error).message);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit transaction' : 'New transaction'}
      description={editing ? 'Changes recompute every analytic on the page.' : undefined}
      width="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            form="tx-form"
            type="submit"
            loading={create.isPending || update.isPending}
          >
            {editing ? 'Save changes' : 'Record it'}
          </Button>
        </>
      }
    >
      <form id="tx-form" onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-3 gap-1.5 rounded-[10px] border border-[var(--line)] bg-[var(--surface-2)] p-1">
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setForm({ ...form, type: t.value, categoryId: '' })}
              className={cn(
                'h-8 rounded-lg text-[13px] transition-colors',
                form.type === t.value
                  ? 'bg-[var(--surface)] font-medium text-[var(--ink)] shadow-[var(--shadow-sm)]'
                  : 'text-[var(--ink-muted)] hover:text-[var(--ink)]',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <FieldRow>
          <div>
            <Label>Amount</Label>
            <Input
              required
              type="number"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="249.50"
              autoFocus
            />
          </div>
          <div>
            <Label>Date and time</Label>
            <Input
              required
              type="datetime-local"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
        </FieldRow>

        <div>
          <Label>Description</Label>
          <Input
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Swiggy order"
          />
        </div>

        <FieldRow>
          <div>
            <Label>{form.type === 'TRANSFER' ? 'From account' : 'Account'}</Label>
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

          {form.type === 'TRANSFER' ? (
            <div>
              <Label>To account</Label>
              <Select
                required
                value={form.toAccountId}
                onChange={(e) => setForm({ ...form, toAccountId: e.target.value })}
              >
                <option value="">Select a destination</option>
                {(accounts ?? [])
                  .filter((a) => a.id !== form.accountId)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
              </Select>
            </div>
          ) : (
            <div>
              <Label hint="optional">Category</Label>
              <Select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                <option value="">Uncategorised</option>
                {visibleCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </FieldRow>

        <FieldRow>
          <div>
            <Label hint="optional">Merchant</Label>
            <Input
              value={form.merchant}
              onChange={(e) => setForm({ ...form, merchant: e.target.value })}
              placeholder="Swiggy"
            />
          </div>
          <div>
            <Label>Payment method</Label>
            <Select
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
            >
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m.replace('_', ' ')}
                </option>
              ))}
            </Select>
          </div>
        </FieldRow>

        <div>
          <Label hint="comma separated">Tags</Label>
          <Input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="work, reimbursable"
          />
        </div>

        <div>
          <Label hint="optional">Notes</Label>
          <Textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Anything worth remembering later"
          />
        </div>
      </form>
    </Modal>
  );
}
