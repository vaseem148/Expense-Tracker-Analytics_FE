import { Monitor, Moon, Palette, Sun } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { useUi } from '@/store/ui';
import { cn } from '@/lib/cn';

export function AppearanceCard() {
  const { theme, setTheme } = useUi();

  return (
    <Card>
      <CardHeader title="Appearance" icon={<Palette size={15} />} />
      <div className="grid grid-cols-3 gap-2">
        {[
          { key: 'light' as const, label: 'Light', icon: Sun },
          { key: 'dark' as const, label: 'Dark', icon: Moon },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTheme(t.key)}
            className={cn(
              'flex flex-col items-center gap-2 rounded-xl border p-3.5 transition-colors',
              theme === t.key
                ? 'border-[var(--brand)] bg-[var(--brand-soft)]'
                : 'border-[var(--line)] hover:border-[var(--line-strong)]',
            )}
          >
            <t.icon size={18} className="text-[var(--ink-2)]" />
            <span className="text-[12.5px]">{t.label}</span>
          </button>
        ))}
        <button
          onClick={() =>
            setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          }
          className="flex flex-col items-center gap-2 rounded-xl border border-[var(--line)] p-3.5 transition-colors hover:border-[var(--line-strong)]"
        >
          <Monitor size={18} className="text-[var(--ink-2)]" />
          <span className="text-[12.5px]">System</span>
        </button>
      </div>
      <p className="mt-3 text-[11.5px] text-[var(--ink-muted)]">
        Both palettes are validated separately for colour-vision safety - dark mode is a stepped
        set of the same hues, not an inverted one.
      </p>
    </Card>
  );
}
