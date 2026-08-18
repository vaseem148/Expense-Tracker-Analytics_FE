import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { CommandPalette } from './CommandPalette';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { TransactionDrawer } from '@/features/transactions/TransactionDrawer';
import { useRealtime } from '@/hooks/useRealtime';

export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  useRealtime(true);

  return (
    <div className="flex min-h-dvh bg-[var(--plane)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onNewTransaction={() => setDrawerOpen(true)} />
        <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 pb-24 pt-5 sm:px-6 lg:pb-10">
          <Outlet />
        </main>
        <MobileNav onNewTransaction={() => setDrawerOpen(true)} />
      </div>
      <CommandPalette onNewTransaction={() => setDrawerOpen(true)} />
      <TransactionDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
