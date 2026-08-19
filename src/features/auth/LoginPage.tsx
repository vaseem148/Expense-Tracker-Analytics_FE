import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Brain, Building2, ShieldCheck, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FieldError, Input, Label } from '@/components/ui/Field';
import { useAuth } from '@/store/auth';
import { toast } from '@/store/toast';
import { cn } from '@/lib/cn';

const HIGHLIGHTS = [
  {
    icon: Building2,
    title: 'Cost centres, not categories alone',
    body: 'Every rupee carries a department, a vendor and a project, so variance has an owner.',
  },
  {
    icon: TrendingUp,
    title: 'Runway you can act on',
    body: 'Burn, margin and a cash projection that includes invoices already committed.',
  },
  {
    icon: Brain,
    title: 'Spend controls that hold',
    body: 'Per-person caps, approval policies, and anomalies scored against each category.',
  },
  {
    icon: ShieldCheck,
    title: 'Connected to your stack',
    body: 'Tally, Zoho Books, QuickBooks and Xero, with credentials encrypted at rest.',
  },
];

export function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({
    email: 'demo@expense.app',
    password: 'Demo#1234',
    name: '',
    companyName: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else
        await register({
          email: form.email,
          password: form.password,
          name: form.name,
          companyName: form.companyName,
        });
      toast.success(mode === 'login' ? 'Welcome back' : 'Account created');
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-[var(--surface)] p-10 lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-[0.09] blur-3xl"
          style={{ background: 'var(--brand)' }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full opacity-[0.07] blur-3xl"
          style={{ background: 'var(--s3)' }}
          aria-hidden
        />

        <div className="relative flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--brand)] text-[var(--brand-ink)]">
            <TrendingUp size={20} strokeWidth={2.5} />
          </span>
          <div>
            <p className="text-[15px] font-semibold tracking-[-0.01em]">Expense Analytics</p>
            <p className="text-[12px] text-[var(--ink-muted)]">Company spend platform</p>
          </div>
        </div>

        <div className="relative max-w-lg">
          <h1 className="text-[34px] font-semibold leading-[1.15] tracking-[-0.03em] text-[var(--ink)]">
            Know what the company
            <br />
            <span className="text-[var(--brand)]">spends, and why.</span>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--ink-2)]">
            Connect your accounting stack, route claims through policy, and get a burn forecast,
            a supplier risk read and a cost-centre verdict that all trace back to a checkable number.
          </p>

          <ul className="mt-9 space-y-4">
            {HIGHLIGHTS.map((h) => (
              <li key={h.title} className="flex gap-3.5">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]">
                  <h.icon size={16} />
                </span>
                <div>
                  <p className="text-[13.5px] font-medium text-[var(--ink)]">{h.title}</p>
                  <p className="text-[12.5px] leading-snug text-[var(--ink-muted)]">{h.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-[12px] text-[var(--ink-muted)]">
          NestJS · Prisma · scikit-learn · React
        </p>
      </aside>

      <main className="flex items-center justify-center bg-[var(--plane)] p-6">
        <div className="animate-rise w-full max-w-sm">
          <div className="mb-7 lg:hidden">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--brand)] text-[var(--brand-ink)]">
              <TrendingUp size={22} strokeWidth={2.5} />
            </span>
          </div>

          <h2 className="text-[24px] font-semibold tracking-[-0.02em]">
            {mode === 'login' ? 'Sign in' : 'Set up your company'}
          </h2>
          <p className="mt-1.5 text-[13.5px] text-[var(--ink-muted)]">
            {mode === 'login'
              ? 'Use the seeded demo company or your own credentials.'
              : 'We provision your company, cost centres and approval policies.'}
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            {mode === 'register' ? (
              <>
                <div>
                  <Label>Your name</Label>
                  <Input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Mohamed Vaseem"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <Label hint="you become its owner">Company name</Label>
                  <Input
                    required
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    placeholder="Vaseem Technologies"
                    autoComplete="organization"
                  />
                </div>
              </>
            ) : null}

            <div>
              <Label>Email</Label>
              <Input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
                autoComplete="email"
              />
            </div>

            <div>
              <Label hint={mode === 'register' ? '8+ chars, mixed case, a digit' : undefined}>
                Password
              </Label>
              <Input
                required
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <FieldError>{error}</FieldError>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={busy}
              className="w-full justify-center"
            >
              {mode === 'login' ? 'Sign in' : 'Create company'}
              <ArrowRight size={16} />
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-[var(--line)]" />
            <span className="text-[11.5px] text-[var(--ink-muted)]">or</span>
            <span className="h-px flex-1 bg-[var(--line)]" />
          </div>

          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError(null);
            }}
            className={cn(
              'mt-5 w-full rounded-[10px] border border-[var(--line)] py-2.5 text-[13.5px]',
              'text-[var(--ink-2)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]',
            )}
          >
            {mode === 'login' ? 'Set up a new company' : 'I already have an account'}
          </button>

          {mode === 'login' ? (
            <p className="mt-6 rounded-[10px] border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-center text-[12px] text-[var(--ink-muted)]">
              Demo · <span className="text-[var(--ink-2)]">demo@expense.app</span> /{' '}
              <span className="text-[var(--ink-2)]">Demo#1234</span>
            </p>
          ) : null}
        </div>
      </main>
    </div>
  );
}
