import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  Blocks,
  Brain,
  Building2,
  CornerDownLeft,
  FileSpreadsheet,
  LayoutDashboard,
  Moon,
  PiggyBank,
  Plus,
  Receipt,
  Repeat,
  Search,
  Settings,
  Sun,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useUi } from '@/store/ui';

interface Command {
  id: string;
  label: string;
  hint?: string;
  group: string;
  icon: typeof Search;
  run: () => void;
}

/**
 * Cmd/Ctrl+K palette. Keyboard-first: arrows move, Enter runs, Escape closes,
 * and the active row scrolls into view so long lists stay navigable.
 */
export function CommandPalette({ onNewTransaction }: { onNewTransaction: () => void }) {
  const { commandOpen, setCommandOpen, toggleTheme, theme } = useUi();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const commands = useMemo<Command[]>(() => {
    const go = (to: string) => () => {
      navigate(to);
      setCommandOpen(false);
    };
    return [
      {
        id: 'new-tx',
        label: 'Add transaction',
        hint: 'Record an expense or income',
        group: 'Actions',
        icon: Plus,
        run: () => {
          setCommandOpen(false);
          onNewTransaction();
        },
      },
      {
        id: 'theme',
        label: `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`,
        group: 'Actions',
        icon: theme === 'dark' ? Sun : Moon,
        run: () => {
          toggleTheme();
          setCommandOpen(false);
        },
      },
      { id: 'dash', label: 'Dashboard', group: 'Navigate', icon: LayoutDashboard, run: go('/') },
      { id: 'tx', label: 'Transactions', group: 'Navigate', icon: ArrowLeftRight, run: go('/transactions') },
      { id: 'analytics', label: 'Analytics', group: 'Navigate', icon: TrendingUp, run: go('/analytics') },
      { id: 'budgets', label: 'Budgets', group: 'Navigate', icon: PiggyBank, run: go('/budgets') },
      { id: 'goals', label: 'Savings goals', group: 'Navigate', icon: Target, run: go('/goals') },
      { id: 'recurring', label: 'Recurring rules', group: 'Navigate', icon: Repeat, run: go('/recurring') },
      { id: 'business', label: 'Business workspace', group: 'Navigate', icon: Building2, run: go('/business') },
      { id: 'claims', label: 'Expense claims', group: 'Navigate', icon: Receipt, run: go('/business/claims') },
      { id: 'invoices', label: 'Accounts payable', group: 'Navigate', icon: Wallet, run: go('/business/invoices') },
      { id: 'insights', label: 'AI insights', group: 'Navigate', icon: Brain, run: go('/insights') },
      { id: 'integrations', label: 'Integrations', group: 'Navigate', icon: Blocks, run: go('/integrations') },
      { id: 'data', label: 'Import and export', group: 'Navigate', icon: FileSpreadsheet, run: go('/data') },
      { id: 'settings', label: 'Settings', group: 'Navigate', icon: Settings, run: go('/settings') },
    ];
  }, [navigate, setCommandOpen, toggleTheme, theme, onNewTransaction]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q),
    );
  }, [commands, query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen(!commandOpen);
      }
      if (e.key === 'Escape' && commandOpen) setCommandOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [commandOpen, setCommandOpen]);

  useEffect(() => {
    if (commandOpen) {
      setQuery('');
      setIndex(0);
    }
  }, [commandOpen]);

  useEffect(() => {
    listRef.current?.querySelectorAll('li')[index]?.scrollIntoView({ block: 'nearest' });
  }, [index]);

  if (!commandOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[12vh]">
      <div
        className="animate-fade absolute inset-0 bg-[var(--overlay)] backdrop-blur-[3px]"
        onClick={() => setCommandOpen(false)}
        aria-hidden
      />
      <div
        role="dialog"
        aria-label="Command palette"
        className="animate-scale-in relative w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-raised)] shadow-[var(--shadow-lg)]"
      >
        <div className="flex items-center gap-3 border-b border-[var(--line)] px-4">
          <Search size={16} className="text-[var(--ink-muted)]" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setIndex((i) => Math.min(filtered.length - 1, i + 1));
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                setIndex((i) => Math.max(0, i - 1));
              }
              if (e.key === 'Enter') {
                e.preventDefault();
                filtered[index]?.run();
              }
            }}
            placeholder="Type a command or search..."
            className="h-12 flex-1 bg-transparent text-[14px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-muted)]"
          />
          <kbd className="rounded border border-[var(--line)] px-1.5 py-0.5 text-[10.5px] text-[var(--ink-muted)]">
            ESC
          </kbd>
        </div>

        <ul ref={listRef} className="max-h-80 overflow-y-auto p-2">
          {filtered.length ? (
            filtered.map((cmd, i) => {
              const showGroup = i === 0 || filtered[i - 1].group !== cmd.group;
              return (
                <li key={cmd.id}>
                  {showGroup ? (
                    <p className="px-2 pb-1 pt-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-muted)]">
                      {cmd.group}
                    </p>
                  ) : null}
                  <button
                    onMouseEnter={() => setIndex(i)}
                    onClick={cmd.run}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-[10px] px-2.5 py-2 text-left text-[13.5px] transition-colors',
                      i === index
                        ? 'bg-[var(--brand-soft)] text-[var(--ink)]'
                        : 'text-[var(--ink-2)] hover:bg-[var(--surface-2)]',
                    )}
                  >
                    <cmd.icon size={16} className="shrink-0 text-[var(--ink-muted)]" />
                    <span className="flex-1 truncate">{cmd.label}</span>
                    {cmd.hint ? (
                      <span className="hidden truncate text-[11.5px] text-[var(--ink-muted)] sm:block">
                        {cmd.hint}
                      </span>
                    ) : null}
                    {i === index ? (
                      <CornerDownLeft size={13} className="shrink-0 text-[var(--ink-muted)]" />
                    ) : null}
                  </button>
                </li>
              );
            })
          ) : (
            <li className="px-3 py-8 text-center text-[13px] text-[var(--ink-muted)]">
              No matching command
            </li>
          )}
        </ul>
      </div>
    </div>,
    document.body,
  );
}
