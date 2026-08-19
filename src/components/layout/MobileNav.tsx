import { NavLink } from 'react-router-dom';
import { Building2, LayoutDashboard, Plus, TrendingUp, Wallet } from 'lucide-react';
import { cn } from '@/lib/cn';

const ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/expenses', label: 'Expenses', icon: Wallet },
  { to: '/analytics', label: 'Analytics', icon: TrendingUp },
  { to: '/financials', label: 'Financials', icon: Building2 },
];

/** Bottom bar on small screens; the sidebar takes over from `lg` upwards. */
export function MobileNav({ onNewTransaction }: { onNewTransaction: () => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t border-[var(--line)] bg-[color-mix(in_oklab,var(--surface)_92%,transparent)] px-2 backdrop-blur-xl lg:hidden">
      {ITEMS.slice(0, 2).map((item) => (
        <NavItem key={item.to} {...item} />
      ))}
      <button
        onClick={onNewTransaction}
        aria-label="Add transaction"
        className="grid h-12 w-12 -translate-y-3 place-items-center rounded-full bg-[var(--brand)] text-[var(--brand-ink)] shadow-[var(--shadow-md)] transition-transform active:scale-95"
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>
      {ITEMS.slice(2).map((item) => (
        <NavItem key={item.to} {...item} />
      ))}
    </nav>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
  end,
}: {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex w-16 flex-col items-center gap-1 py-2 text-[10.5px] transition-colors',
          isActive ? 'text-[var(--brand)]' : 'text-[var(--ink-muted)]',
        )
      }
    >
      <Icon size={19} />
      {label}
    </NavLink>
  );
}
