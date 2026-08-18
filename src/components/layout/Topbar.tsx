import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Command, LogOut, Moon, Plus, Search, Sun, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import { initials, timeAgo } from '@/lib/format';
import { useMarkNotificationsRead, useNotifications } from '@/api/queries';
import { useAuth } from '@/store/auth';
import { useUi } from '@/store/ui';

export function Topbar({ onNewTransaction }: { onNewTransaction: () => void }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, setCommandOpen } = useUi();
  const { data } = useNotifications();
  const markRead = useMarkNotificationsRead();
  const [panel, setPanel] = useState<'none' | 'bell' | 'user'>('none');
  const navigate = useNavigate();
  const close = () => setPanel('none');

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--surface)_88%,transparent)] px-4 backdrop-blur-xl sm:px-6">
      <button
        onClick={() => setCommandOpen(true)}
        className="flex h-9 max-w-md flex-1 items-center gap-2.5 rounded-[10px] border border-[var(--line)] bg-[var(--surface-2)] px-3 text-[13px] text-[var(--ink-muted)] transition-colors hover:border-[var(--brand)] hover:text-[var(--ink-2)]"
      >
        <Search size={15} />
        <span className="flex-1 text-left">Search or jump to...</span>
        <kbd className="hidden items-center gap-0.5 rounded border border-[var(--line)] bg-[var(--surface)] px-1.5 py-0.5 text-[10.5px] sm:flex">
          <Command size={10} /> K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <Button size="sm" variant="primary" icon={<Plus size={15} />} onClick={onNewTransaction}>
          <span className="hidden sm:inline">Add</span>
        </Button>

        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="grid h-9 w-9 place-items-center rounded-[10px] text-[var(--ink-2)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <div className="relative">
          <button
            onClick={() => setPanel(panel === 'bell' ? 'none' : 'bell')}
            aria-label="Notifications"
            className="relative grid h-9 w-9 place-items-center rounded-[10px] text-[var(--ink-2)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
          >
            <Bell size={17} />
            {data?.unread ? (
              <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--critical)] px-1 text-[9.5px] font-semibold text-white">
                {data.unread > 9 ? '9+' : data.unread}
              </span>
            ) : null}
          </button>
          {panel === 'bell' ? (
            <NotificationPanel
              items={data?.items ?? []}
              unread={data?.unread ?? 0}
              onClose={close}
              onMarkRead={() => markRead.mutate()}
            />
          ) : null}
        </div>

        <div className="relative">
          <button
            onClick={() => setPanel(panel === 'user' ? 'none' : 'user')}
            className="grid h-9 w-9 place-items-center rounded-full text-[12px] font-semibold text-white transition-transform hover:scale-105"
            style={{ background: user?.avatarColor ?? 'var(--brand)' }}
            aria-label="Account menu"
          >
            {initials(user?.name ?? 'U')}
          </button>
          {panel === 'user' ? (
            <>
              <div className="fixed inset-0 z-40" onClick={close} aria-hidden />
              <div className="animate-scale-in absolute right-0 top-11 z-50 w-60 origin-top-right rounded-xl border border-[var(--line)] bg-[var(--surface-raised)] p-1.5 shadow-[var(--shadow-lg)]">
                <div className="border-b border-[var(--line)] px-2.5 py-2">
                  <p className="truncate text-[13.5px] font-medium">{user?.name}</p>
                  <p className="truncate text-[12px] text-[var(--ink-muted)]">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    close();
                    navigate('/settings');
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-[var(--ink-2)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
                >
                  <User size={15} /> Profile and settings
                </button>
                <button
                  onClick={() => void logout()}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-[var(--critical-text)] transition-colors hover:bg-[color-mix(in_oklab,var(--critical)_10%,transparent)]"
                >
                  <LogOut size={15} /> Sign out
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}

interface PanelProps {
  items: {
    id: string;
    title: string;
    body: string;
    severity: string;
    isRead: boolean;
    createdAt: string;
  }[];
  unread: number;
  onClose: () => void;
  onMarkRead: () => void;
}

function NotificationPanel({ items, unread, onClose, onMarkRead }: PanelProps) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden />
      <div className="animate-scale-in absolute right-0 top-11 z-50 w-[min(92vw,22rem)] origin-top-right rounded-xl border border-[var(--line)] bg-[var(--surface-raised)] shadow-[var(--shadow-lg)]">
        <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
          <p className="text-[13.5px] font-semibold">Notifications</p>
          {unread ? (
            <button onClick={onMarkRead} className="text-[12px] text-[var(--brand)] hover:underline">
              Mark all read
            </button>
          ) : null}
        </div>
        <ul className="max-h-80 overflow-y-auto">
          {items.length ? (
            items.slice(0, 12).map((n) => (
              <li
                key={n.id}
                className={cn(
                  'border-b border-[var(--line)] px-4 py-3 last:border-0',
                  !n.isRead && 'bg-[var(--brand-soft)]',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] font-medium text-[var(--ink)]">{n.title}</p>
                  <Badge
                    tone={
                      n.severity === 'critical'
                        ? 'critical'
                        : n.severity === 'warning'
                          ? 'warning'
                          : n.severity === 'success'
                            ? 'good'
                            : 'neutral'
                    }
                  >
                    {n.severity}
                  </Badge>
                </div>
                <p className="mt-0.5 text-[12.5px] leading-snug text-[var(--ink-muted)]">{n.body}</p>
                <p className="mt-1 text-[11px] text-[var(--ink-muted)]">{timeAgo(n.createdAt)}</p>
              </li>
            ))
          ) : (
            <li className="px-4 py-8 text-center text-[13px] text-[var(--ink-muted)]">
              Nothing to report
            </li>
          )}
        </ul>
      </div>
    </>
  );
}
