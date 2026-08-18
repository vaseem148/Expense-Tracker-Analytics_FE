import { NavLink } from 'react-router-dom';
import {
  ArrowLeftRight,
  Blocks,
  Brain,
  Building2,
  ChevronsLeft,
  FileSpreadsheet,
  LayoutDashboard,
  PiggyBank,
  Receipt,
  Repeat,
  Settings,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useUi } from '@/store/ui';

const PERSONAL = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/analytics', label: 'Analytics', icon: TrendingUp },
  { to: '/budgets', label: 'Budgets', icon: PiggyBank },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/recurring', label: 'Recurring', icon: Repeat },
];

const BUSINESS = [
  { to: '/business', label: 'Business', icon: Building2 },
  { to: '/business/claims', label: 'Claims', icon: Receipt },
  { to: '/business/invoices', label: 'Payables', icon: Wallet },
];

const PLATFORM = [
  { to: '/insights', label: 'AI insights', icon: Brain },
  { to: '/integrations', label: 'Integrations', icon: Blocks },
  { to: '/data', label: 'Import / export', icon: FileSpreadsheet },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUi();

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-[var(--line)] bg-[var(--surface)] lg:flex',
        'transition-[width] duration-200 ease-out',
        sidebarCollapsed ? 'w-[68px]' : 'w-[236px]',
      )}
    >
      <div className="flex h-14 items-center gap-2.5 px-4">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-[var(--brand)] text-[var(--brand-ink)]">
          <TrendingUp size={17} strokeWidth={2.5} />
        </span>
        {!sidebarCollapsed ? (
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-semibold leading-tight tracking-[-0.01em]">
              Expense Analytics
            </p>
            <p className="truncate text-[11px] text-[var(--ink-muted)]">Personal + business</p>
          </div>
        ) : null}
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 pb-4">
        <NavGroup title="Personal" items={PERSONAL} collapsed={sidebarCollapsed} />
        <NavGroup title="Business" items={BUSINESS} collapsed={sidebarCollapsed} />
        <NavGroup title="Platform" items={PLATFORM} collapsed={sidebarCollapsed} />
      </nav>

      <button
        onClick={toggleSidebar}
        className="flex h-11 items-center gap-2.5 border-t border-[var(--line)] px-4 text-[12.5px] text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
      >
        <ChevronsLeft
          size={16}
          className={cn('transition-transform duration-200', sidebarCollapsed && 'rotate-180')}
        />
        {!sidebarCollapsed ? 'Collapse' : null}
      </button>
    </aside>
  );
}

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

function NavGroup({
  title,
  items,
  collapsed,
}: {
  title: string;
  items: NavItem[];
  collapsed: boolean;
}) {
  return (
    <div className="mt-4 first:mt-2">
      {!collapsed ? (
        <p className="mb-1.5 px-2.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-muted)]">
          {title}
        </p>
      ) : (
        <div className="mx-2.5 mb-2 h-px bg-[var(--line)]" />
      )}
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-[13.5px] transition-colors duration-150',
                  isActive
                    ? 'bg-[var(--brand-soft)] font-medium text-[var(--brand)]'
                    : 'text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]',
                  collapsed && 'justify-center px-0',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <span
                      className="absolute left-0 h-4 w-[3px] rounded-r-full bg-[var(--brand)]"
                      aria-hidden
                    />
                  ) : null}
                  <item.icon size={17} strokeWidth={2} className="shrink-0" />
                  {!collapsed ? <span className="truncate">{item.label}</span> : null}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
