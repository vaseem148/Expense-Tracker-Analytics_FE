import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Field';
import { SkeletonRows } from '@/components/ui/Skeleton';
import { TransactionDrawer } from './TransactionDrawer';
import { TransactionTable } from './TransactionTable';
import {
  useAccounts,
  useBulkCategorize,
  useBulkDelete,
  useCategories,
  useDeleteTransaction,
  useTransactions,
  type TransactionFilters,
} from '@/api/queries';
import type { Transaction } from '@/api/types';
import { compact } from '@/lib/format';
import { cn } from '@/lib/cn';
import { toast } from '@/store/toast';
import { api } from '@/api/client';

export function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilters>({ page: 1, limit: 25, sortDir: 'desc' });
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useTransactions(filters);
  const { data: categories } = useCategories();
  const { data: accounts } = useAccounts();
  const remove = useDeleteTransaction();
  const bulkDelete = useBulkDelete();
  const bulkCategorize = useBulkCategorize();

  const items = data?.items ?? [];
  const meta = data?.meta;

  const allSelected = items.length > 0 && items.every((t) => selected.has(t.id));
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(items.map((t) => t.id)));
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const activeFilterCount = useMemo(
    () =>
      ['type', 'categoryIds', 'accountIds', 'from', 'to', 'minAmount', 'maxAmount'].filter(
        (k) => filters[k as keyof TransactionFilters],
      ).length,
    [filters],
  );

  const applySearch = (value: string) => {
    setSearch(value);
    setFilters((f) => ({ ...f, q: value || undefined, page: 1 }));
  };

  const exportCsv = async () => {
    try {
      const csv = await api.getText('/data/export/csv', { from: filters.from, to: filters.to });
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    } catch (err) {
      toast.error('Export failed', (err as Error).message);
    }
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Expenses</h1>
          <p className="mt-0.5 text-[13px] text-[var(--ink-muted)]">
            {meta ? `${meta.total.toLocaleString('en-IN')} entries` : 'Loading the company ledger...'}
            {meta?.totals
              ? ` · ${compact(meta.totals.expense)} spent, ${compact(meta.totals.income)} received`
              : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" icon={<Download size={14} />} onClick={exportCsv}>
            Export
          </Button>
          <Button
            size="sm"
            variant={showFilters ? 'primary' : 'secondary'}
            icon={<Filter size={14} />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
          </Button>
        </div>
      </header>

      <Card padded={false}>
        <div className="flex items-center gap-2 border-b border-[var(--line)] p-3">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]"
            />
            <Input
              value={search}
              onChange={(e) => applySearch(e.target.value)}
              placeholder="Search description, vendor or notes"
              className="pl-9"
            />
          </div>
          <Select
            value={filters.sortBy ?? 'date'}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value, page: 1 })}
            className="w-36"
          >
            <option value="date">Date</option>
            <option value="amountMinor">Amount</option>
            <option value="description">Description</option>
          </Select>
          <Button
            size="icon"
            variant="secondary"
            onClick={() =>
              setFilters({ ...filters, sortDir: filters.sortDir === 'asc' ? 'desc' : 'asc' })
            }
            title={filters.sortDir === 'asc' ? 'Ascending' : 'Descending'}
          >
            <ArrowUpRight
              size={15}
              className={cn('transition-transform', filters.sortDir === 'desc' && 'rotate-90')}
            />
          </Button>
        </div>

        {showFilters ? (
          <div className="animate-rise grid gap-3 border-b border-[var(--line)] bg-[var(--surface-2)] p-3 sm:grid-cols-2 lg:grid-cols-5">
            <Select
              value={filters.type ?? ''}
              onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined, page: 1 })}
            >
              <option value="">All types</option>
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
              <option value="TRANSFER">Transfer</option>
            </Select>
            <Select
              value={filters.categoryIds ?? ''}
              onChange={(e) =>
                setFilters({ ...filters, categoryIds: e.target.value || undefined, page: 1 })
              }
            >
              <option value="">All categories</option>
              {(categories ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Select
              value={filters.accountIds ?? ''}
              onChange={(e) =>
                setFilters({ ...filters, accountIds: e.target.value || undefined, page: 1 })
              }
            >
              <option value="">All accounts</option>
              {(accounts ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
            <Input
              type="date"
              value={filters.from ?? ''}
              onChange={(e) => setFilters({ ...filters, from: e.target.value || undefined, page: 1 })}
            />
            <Input
              type="date"
              value={filters.to ?? ''}
              onChange={(e) => setFilters({ ...filters, to: e.target.value || undefined, page: 1 })}
            />
          </div>
        ) : null}

        {selected.size ? (
          <div className="animate-rise flex flex-wrap items-center gap-2 border-b border-[var(--line)] bg-[var(--brand-soft)] px-3 py-2">
            <span className="text-[13px] font-medium">{selected.size} selected</span>
            <Select
              className="h-8 w-48"
              value=""
              onChange={async (e) => {
                if (!e.target.value) return;
                await bulkCategorize.mutateAsync({
                  ids: [...selected],
                  categoryId: e.target.value,
                });
                toast.success(`Re-categorised ${selected.size} transactions`);
                setSelected(new Set());
              }}
            >
              <option value="">Move to category...</option>
              {(categories ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Button
              size="sm"
              variant="danger"
              icon={<Trash2 size={14} />}
              loading={bulkDelete.isPending}
              onClick={async () => {
                await bulkDelete.mutateAsync([...selected]);
                toast.success(`Deleted ${selected.size} transactions`);
                setSelected(new Set());
              }}
            >
              Delete
            </Button>
            <Button size="sm" variant="ghost" icon={<X size={14} />} onClick={() => setSelected(new Set())}>
              Clear
            </Button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="p-4">
            <SkeletonRows rows={8} />
          </div>
        ) : items.length ? (
          <TransactionTable
            items={items}
            selected={selected}
            allSelected={allSelected}
            onToggleAll={toggleAll}
            onToggleOne={toggleOne}
            onEdit={setEditing}
            onDelete={async (id) => {
              await remove.mutateAsync(id);
              toast.success('Transaction deleted');
            }}
          />
        ) : (
          <div className="px-4 py-16 text-center">
            <p className="text-[14px] font-medium">Nothing matches those filters</p>
            <p className="mt-1 text-[13px] text-[var(--ink-muted)]">
              Widen the date range or clear the search.
            </p>
          </div>
        )}

        {meta && meta.totalPages > 1 ? (
          <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] px-3 py-2.5">
            <p className="text-[12.5px] text-[var(--ink-muted)]">
              Page {meta.page} of {meta.totalPages}
            </p>
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant="secondary"
                disabled={!meta.hasPrev}
                onClick={() => setFilters({ ...filters, page: (filters.page ?? 1) - 1 })}
                icon={<ChevronLeft size={14} />}
              >
                Prev
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={!meta.hasNext}
                onClick={() => setFilters({ ...filters, page: (filters.page ?? 1) + 1 })}
              >
                Next <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        ) : null}
      </Card>

      <TransactionDrawer
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        editing={editing}
      />
    </div>
  );
}
