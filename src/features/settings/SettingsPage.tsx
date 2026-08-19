import { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FieldRow, Input, Label, Select } from '@/components/ui/Field';
import { api } from '@/api/client';
import { useAuth } from '@/store/auth';
import { toast } from '@/store/toast';
import { AppearanceCard } from './AppearanceCard';
import { AccountsCard } from './AccountsCard';
import { SessionsCard, type Session } from './SessionsCard';

export function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState({ name: '', currency: 'INR', locale: 'en-IN' });
  const [sessions, setSessions] = useState<Session[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfile({
      name: user.name,
      currency: user.currency,
      locale: user.locale ?? 'en-IN',
    });
    void api
      .get<Session[]>('/auth/sessions')
      .then(setSessions)
      .catch(() => undefined);
  }, [user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.patch('/users/me', {
        name: profile.name.trim(),
        currency: profile.currency,
        locale: profile.locale,
      });
      await refreshUser();
      toast.success('Profile saved');
    } catch (err) {
      toast.error('Could not save', (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Settings</h1>
        <p className="mt-0.5 text-[13px] text-[var(--ink-muted)]">
          Your profile, appearance, company accounts and active sessions
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Profile"
            subtitle="How amounts and dates are formatted for you"
            icon={<User size={15} />}
          />
          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <FieldRow>
              <div>
                <Label>Currency</Label>
                <Select
                  value={profile.currency}
                  onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                >
                  {['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD'].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Locale</Label>
                <Select
                  value={profile.locale}
                  onChange={(e) => setProfile({ ...profile, locale: e.target.value })}
                >
                  {['en-IN', 'en-US', 'en-GB', 'de-DE'].map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </Select>
              </div>
            </FieldRow>
            <Button type="submit" variant="primary" loading={busy}>
              Save profile
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          <AppearanceCard />
          <AccountsCard />
        </div>
      </div>

      <SessionsCard
        sessions={sessions}
        onRevoke={async (id) => {
          await api.del(`/auth/sessions/${id}`);
          setSessions((s) => s.filter((x) => x.id !== id));
          toast.success('Session revoked');
        }}
      />
    </div>
  );
}
