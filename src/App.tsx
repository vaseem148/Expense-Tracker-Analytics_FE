import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './features/auth/LoginPage';
import { useAuth } from './store/auth';
import { SkeletonCard } from './components/ui/Skeleton';

// Route-level code splitting: the dashboard is the only page most sessions
// touch, so the rest should not sit in the initial bundle.
const DashboardPage = lazy(() =>
  import('./features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const TransactionsPage = lazy(() =>
  import('./features/transactions/TransactionsPage').then((m) => ({ default: m.TransactionsPage })),
);
const AnalyticsPage = lazy(() =>
  import('./features/analytics/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })),
);
const BudgetsPage = lazy(() =>
  import('./features/budgets/BudgetsPage').then((m) => ({ default: m.BudgetsPage })),
);
const GoalsPage = lazy(() =>
  import('./features/goals/GoalsPage').then((m) => ({ default: m.GoalsPage })),
);
const RecurringPage = lazy(() =>
  import('./features/recurring/RecurringPage').then((m) => ({ default: m.RecurringPage })),
);
const BusinessPage = lazy(() =>
  import('./features/business/BusinessPage').then((m) => ({ default: m.BusinessPage })),
);
const ClaimsPage = lazy(() =>
  import('./features/business/ClaimsPage').then((m) => ({ default: m.ClaimsPage })),
);
const InvoicesPage = lazy(() =>
  import('./features/business/InvoicesPage').then((m) => ({ default: m.InvoicesPage })),
);
const IntegrationsPage = lazy(() =>
  import('./features/integrations/IntegrationsPage').then((m) => ({ default: m.IntegrationsPage })),
);
const InsightsPage = lazy(() =>
  import('./features/insights/InsightsPage').then((m) => ({ default: m.InsightsPage })),
);
const DataPage = lazy(() =>
  import('./features/importexport/DataPage').then((m) => ({ default: m.DataPage })),
);
const SettingsPage = lazy(() =>
  import('./features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);

function PageFallback() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SkeletonCard height="h-72" />
      <SkeletonCard height="h-72" />
    </div>
  );
}

export function App() {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <div className="grid min-h-dvh place-items-center bg-[var(--plane)]">
        <div className="flex items-center gap-3 text-[13px] text-[var(--ink-muted)]">
          <span className="h-4 w-4 animate-spin-slow rounded-full border-2 border-[var(--line-strong)] border-t-[var(--brand)]" />
          Restoring your session...
        </div>
      </div>
    );
  }

  if (status === 'anonymous') {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route element={<AppShell />}>
        <Route
          index
          element={
            <Suspense fallback={<PageFallback />}>
              <DashboardPage />
            </Suspense>
          }
        />
        <Route
          path="transactions"
          element={
            <Suspense fallback={<PageFallback />}>
              <TransactionsPage />
            </Suspense>
          }
        />
        <Route
          path="analytics"
          element={
            <Suspense fallback={<PageFallback />}>
              <AnalyticsPage />
            </Suspense>
          }
        />
        <Route
          path="budgets"
          element={
            <Suspense fallback={<PageFallback />}>
              <BudgetsPage />
            </Suspense>
          }
        />
        <Route
          path="goals"
          element={
            <Suspense fallback={<PageFallback />}>
              <GoalsPage />
            </Suspense>
          }
        />
        <Route
          path="recurring"
          element={
            <Suspense fallback={<PageFallback />}>
              <RecurringPage />
            </Suspense>
          }
        />
        <Route
          path="business"
          element={
            <Suspense fallback={<PageFallback />}>
              <BusinessPage />
            </Suspense>
          }
        />
        <Route
          path="business/claims"
          element={
            <Suspense fallback={<PageFallback />}>
              <ClaimsPage />
            </Suspense>
          }
        />
        <Route
          path="business/invoices"
          element={
            <Suspense fallback={<PageFallback />}>
              <InvoicesPage />
            </Suspense>
          }
        />
        <Route
          path="integrations"
          element={
            <Suspense fallback={<PageFallback />}>
              <IntegrationsPage />
            </Suspense>
          }
        />
        <Route
          path="insights"
          element={
            <Suspense fallback={<PageFallback />}>
              <InsightsPage />
            </Suspense>
          }
        />
        <Route
          path="data"
          element={
            <Suspense fallback={<PageFallback />}>
              <DataPage />
            </Suspense>
          }
        />
        <Route
          path="settings"
          element={
            <Suspense fallback={<PageFallback />}>
              <SettingsPage />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
