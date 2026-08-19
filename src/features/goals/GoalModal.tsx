import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { FieldRow, Input, Label } from '@/components/ui/Field';
import { useSaveGoal } from '@/api/queries';
import { toast } from '@/store/toast';
import type { Goal } from '@/api/types';

export function GoalModal({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: Goal | null;
}) {
  const save = useSaveGoal();
  const [form, setForm] = useState({ name: '', target: '', saved: '0', targetDate: '' });

  useEffect(() => {
    if (!open) return;
    setForm({
      name: editing?.name ?? '',
      target: editing ? String(editing.target) : '',
      saved: editing ? String(editing.saved) : '0',
      targetDate: editing?.targetDate ? editing.targetDate.slice(0, 10) : '',
    });
  }, [open, editing]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await save.mutateAsync({
        id: editing?.id,
        name: form.name.trim(),
        target: Number(form.target),
        saved: Number(form.saved || 0),
        targetDate: form.targetDate || undefined,
      });
      toast.success(editing ? 'Goal updated' : 'Goal created');
      onClose();
    } catch (err) {
      toast.error('Could not save goal', (err as Error).message);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit goal' : 'New savings goal'}
      description="A deadline is what turns a target into a monthly contribution."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="goal-form" loading={save.isPending}>
            {editing ? 'Save changes' : 'Create goal'}
          </Button>
        </>
      }
    >
      <form id="goal-form" onSubmit={submit} className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input
            required
            autoFocus
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Emergency fund"
          />
        </div>
        <FieldRow>
          <div>
            <Label>Target</Label>
            <Input
              required
              type="number"
              min="1"
              value={form.target}
              onChange={(e) => setForm({ ...form, target: e.target.value })}
              placeholder="600000"
            />
          </div>
          <div>
            <Label hint="already saved">Starting balance</Label>
            <Input
              type="number"
              min="0"
              value={form.saved}
              onChange={(e) => setForm({ ...form, saved: e.target.value })}
            />
          </div>
        </FieldRow>
        <div>
          <Label hint="optional">Target date</Label>
          <Input
            type="date"
            value={form.targetDate}
            onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
          />
        </div>
      </form>
    </Modal>
  );
}
