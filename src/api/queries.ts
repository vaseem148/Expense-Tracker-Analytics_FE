import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type {
  Account,
  Anomaly,
  BudgetPerformance,
  Category,
  DashboardResponse,
  MerchantSlice,
  NotificationItem,
  Overview,
  PageMeta,
  RecurringCandidate,
  RecurringRule,
  TimeseriesResponse,
  Transaction,
} from './types';
import type {
  ClaimsResponse,
  ConnectorSpec,
  DepartmentRow,
  IntegrationRow,
  InvoicesResponse,
  OrgKpis,
  OrgMemberRow,
  OrgSummary,
  PnlResponse,
  TaxSummary,
  VendorAnalysis,
  VendorRow,
} from './business.types';

export interface RangeParams {
  from?: string;
  to?: string;
  granularity?: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

/** Query keys live in one place so invalidation is never guesswork. */
export const qk = {
  dashboard: (r: RangeParams) => ['dashboard', r] as const,
  overview: (r: RangeParams) => ['overview', r] as const,
  timeseries: (r: RangeParams) => ['timeseries', r] as const,
  categories: (r: RangeParams, type?: string) => ['analytics-categories', r, type] as const,
  merchants: (r: RangeParams) => ['merchants', r] as const,
  heatmap: (r: RangeParams) => ['heatmap', r] as const,
  cashflow: (r: RangeParams) => ['cashflow', r] as const,
  compare: (r: RangeParams) => ['compare', r] as const,
  anomalies: (r: RangeParams) => ['anomalies', r] as const,
  recurringCandidates: (r: RangeParams) => ['recurring-candidates', r] as const,
  transactions: (f: Record<string, unknown>) => ['transactions', f] as const,
  accounts: () => ['accounts'] as const,
  categoryList: () => ['categories'] as const,
  budgets: () => ['budgets'] as const,
  recurring: () => ['recurring'] as const,
  notifications: () => ['notifications'] as const,
  orgs: () => ['orgs'] as const,
  orgKpis: (id: string, r: RangeParams) => ['org-kpis', id, r] as const,
  orgPnl: (id: string, r: RangeParams) => ['org-pnl', id, r] as const,
  orgDepartments: (id: string, r: RangeParams) => ['org-departments', id, r] as const,
  orgVendorAnalysis: (id: string, r: RangeParams) => ['org-vendor-analysis', id, r] as const,
  orgVendors: (id: string) => ['org-vendors', id] as const,
  orgMembers: (id: string) => ['org-members', id] as const,
  orgClaims: (id: string, status?: string) => ['org-claims', id, status] as const,
  orgInvoices: (id: string) => ['org-invoices', id] as const,
  orgTax: (id: string, r: RangeParams) => ['org-tax', id, r] as const,
  orgCashflow: (id: string, r: RangeParams) => ['org-cashflow', id, r] as const,
  integrations: (orgId?: string) => ['integrations', orgId] as const,
  connectors: () => ['connectors'] as const,
  mlStatus: () => ['ml-status'] as const,
  mlAnomalies: (r: RangeParams) => ['ml-anomalies', r] as const,
  mlClusters: (r: RangeParams) => ['ml-clusters', r] as const,
  mlCashflowRisk: (r: RangeParams) => ['ml-cashflow-risk', r] as const,
};

// --- analytics ------------------------------------------------------

export const useDashboard = (range: RangeParams) =>
  useQuery({
    queryKey: qk.dashboard(range),
    queryFn: () => api.get<DashboardResponse>('/analytics/dashboard', { ...range }),
    staleTime: 30_000,
  });

export const useOverview = (range: RangeParams) =>
  useQuery({
    queryKey: qk.overview(range),
    queryFn: () => api.get<Overview>('/analytics/overview', { ...range }),
  });

export const useTimeseries = (range: RangeParams) =>
  useQuery({
    queryKey: qk.timeseries(range),
    queryFn: () => api.get<TimeseriesResponse>('/analytics/timeseries', { ...range }),
  });

export const useAnalyticsCategories = (range: RangeParams, type: 'EXPENSE' | 'INCOME' = 'EXPENSE') =>
  useQuery({
    queryKey: qk.categories(range, type),
    queryFn: () =>
      api.get<DashboardResponse['categories']>('/analytics/categories', { ...range, type }),
  });

export const useMerchants = (range: RangeParams) =>
  useQuery({
    queryKey: qk.merchants(range),
    queryFn: () => api.get<MerchantSlice[]>('/analytics/merchants', { ...range, limit: 20 }),
  });

export interface HeatmapResponse {
  grid: number[][];
  byWeekday: number[];
  byHour: number[];
  calendar: { date: string; value: number }[];
  peakWeekday: number;
  peakHour: number;
  weekendShare: number;
}

export const useHeatmap = (range: RangeParams) =>
  useQuery({
    queryKey: qk.heatmap(range),
    queryFn: () => api.get<HeatmapResponse>('/analytics/heatmap', { ...range }),
  });

export interface CashflowResponse {
  series: TimeseriesResponse['series'];
  summary: {
    inflow: number;
    outflow: number;
    net: number;
    positivePeriods: number;
    negativePeriods: number;
    bestPeriod: { label: string; net: number } | null;
    worstPeriod: { label: string; net: number } | null;
  };
}

export const useCashflow = (range: RangeParams) =>
  useQuery({
    queryKey: qk.cashflow(range),
    queryFn: () => api.get<CashflowResponse>('/analytics/cashflow', { ...range }),
  });

export interface CompareResponse {
  current: { from: string; to: string; expense: number };
  previous: { from: string; to: string; expense: number };
  deltaPct: number | null;
  byCategory: {
    name: string;
    color: string;
    current: number;
    previous: number;
    delta: number;
    deltaPct: number | null;
  }[];
  biggestIncrease: { name: string; delta: number } | null;
  biggestDecrease: { name: string; delta: number } | null;
}

export const useCompare = (range: RangeParams) =>
  useQuery({
    queryKey: qk.compare(range),
    queryFn: () => api.get<CompareResponse>('/analytics/compare', { ...range }),
  });

export const useAnomalies = (range: RangeParams) =>
  useQuery({
    queryKey: qk.anomalies(range),
    queryFn: () =>
      api.get<{ threshold: number; items: Anomaly[]; distribution: Record<string, number> }>(
        '/analytics/anomalies',
        { ...range },
      ),
  });

export const useRecurringCandidates = (range: RangeParams) =>
  useQuery({
    queryKey: qk.recurringCandidates(range),
    queryFn: () =>
      api.get<{ items: RecurringCandidate[]; totalAnnualCost: number; totalMonthlyCost: number }>(
        '/analytics/recurring-candidates',
        { ...range },
      ),
  });

// --- ledger ---------------------------------------------------------

export interface TransactionFilters extends Record<string, unknown> {
  page?: number;
  limit?: number;
  q?: string;
  type?: string;
  categoryIds?: string;
  accountIds?: string;
  from?: string;
  to?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export const useTransactions = (filters: TransactionFilters) =>
  useQuery({
    queryKey: qk.transactions(filters),
    queryFn: async () => {
      const res = await api.getWithMeta<Transaction[]>(
        '/transactions',
        filters as Record<string, string | number | boolean | undefined>,
      );
      return { items: res.data, meta: res.meta as unknown as PageMeta };
    },
    staleTime: 15_000,
  });

export const useAccounts = () =>
  useQuery({ queryKey: qk.accounts(), queryFn: () => api.get<Account[]>('/accounts') });

export const useCategories = () =>
  useQuery({ queryKey: qk.categoryList(), queryFn: () => api.get<Category[]>('/categories') });

export const useBudgets = () =>
  useQuery({ queryKey: qk.budgets(), queryFn: () => api.get<BudgetPerformance>('/budgets') });

export const useRecurring = () =>
  useQuery({
    queryKey: qk.recurring(),
    queryFn: () =>
      api.get<{ items: RecurringRule[]; summary: { active: number; monthlyCommitment: number; annualCommitment: number } }>(
        '/recurring',
      ),
  });

export const useNotifications = () =>
  useQuery({
    queryKey: qk.notifications(),
    queryFn: () => api.get<{ items: NotificationItem[]; unread: number }>('/notifications'),
    refetchInterval: 60_000,
  });

/** Invalidates everything that a ledger write can change. */
export function useLedgerInvalidator() {
  const qc = useQueryClient();
  return () => {
    for (const key of [
      'dashboard',
      'overview',
      'timeseries',
      'analytics-categories',
      'merchants',
      'heatmap',
      'cashflow',
      'compare',
      'anomalies',
      'recurring-candidates',
      'transactions',
      'accounts',
      'budgets',
    ]) {
      void qc.invalidateQueries({ queryKey: [key] });
    }
  };
}

export function useCreateTransaction() {
  const invalidate = useLedgerInvalidator();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post<Transaction>('/transactions', body),
    onSuccess: invalidate,
  });
}

export function useUpdateTransaction() {
  const invalidate = useLedgerInvalidator();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      api.patch<Transaction>(`/transactions/${id}`, body),
    onSuccess: invalidate,
  });
}

export function useDeleteTransaction() {
  const invalidate = useLedgerInvalidator();
  return useMutation({
    mutationFn: (id: string) => api.del(`/transactions/${id}`),
    onSuccess: invalidate,
  });
}

export function useBulkDelete() {
  const invalidate = useLedgerInvalidator();
  return useMutation({
    mutationFn: (ids: string[]) => api.post<{ deleted: number }>('/transactions/bulk/delete', { ids }),
    onSuccess: invalidate,
  });
}

export function useBulkCategorize() {
  const invalidate = useLedgerInvalidator();
  return useMutation({
    mutationFn: (body: { ids: string[]; categoryId: string }) =>
      api.patch<{ updated: number }>('/transactions/bulk/categorize', body),
    onSuccess: invalidate,
  });
}

export function useSaveBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id?: string } & Record<string, unknown>) =>
      id ? api.patch(`/budgets/${id}`, body) : api.post('/budgets', body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['budgets'] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/budgets/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['budgets'] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useSaveRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id?: string } & Record<string, unknown>) =>
      id ? api.patch(`/recurring/${id}`, body) : api.post('/recurring', body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['recurring'] }),
  });
}

export function useDeleteRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/recurring/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['recurring'] }),
  });
}

export function useMarkNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

// --- business -------------------------------------------------------

export const useOrgs = () =>
  useQuery({ queryKey: qk.orgs(), queryFn: () => api.get<OrgSummary[]>('/orgs') });

export const useOrgKpis = (orgId: string | undefined, range: RangeParams) =>
  useQuery({
    queryKey: qk.orgKpis(orgId ?? '', range),
    queryFn: () => api.get<OrgKpis>(`/orgs/${orgId}/analytics/kpis`, { ...range }),
    enabled: Boolean(orgId),
  });

export const useOrgPnl = (orgId: string | undefined, range: RangeParams) =>
  useQuery({
    queryKey: qk.orgPnl(orgId ?? '', range),
    queryFn: () => api.get<PnlResponse>(`/orgs/${orgId}/analytics/pnl`, { ...range }),
    enabled: Boolean(orgId),
  });

export const useOrgDepartments = (orgId: string | undefined, range: RangeParams) =>
  useQuery({
    queryKey: qk.orgDepartments(orgId ?? '', range),
    queryFn: () =>
      api.get<{ items: DepartmentRow[]; unassigned: { total: number; count: number }; totalBudget: number; totalSpent: number }>(
        `/orgs/${orgId}/analytics/departments`,
        { ...range },
      ),
    enabled: Boolean(orgId),
  });

export const useOrgVendorAnalysis = (orgId: string | undefined, range: RangeParams) =>
  useQuery({
    queryKey: qk.orgVendorAnalysis(orgId ?? '', range),
    queryFn: () => api.get<VendorAnalysis>(`/orgs/${orgId}/analytics/vendors`, { ...range }),
    enabled: Boolean(orgId),
  });

export const useOrgVendors = (orgId: string | undefined) =>
  useQuery({
    queryKey: qk.orgVendors(orgId ?? ''),
    queryFn: () => api.get<VendorRow[]>(`/orgs/${orgId}/vendors`),
    enabled: Boolean(orgId),
  });

export interface ProjectRow {
  id: string;
  name: string;
  code: string;
  clientName: string | null;
  status: string;
  isBillable: boolean;
  startDate: string;
  endDate: string | null;
  budget: number;
  spent: number;
  billableSpend: number;
  remaining: number;
  consumedPct: number | null;
  transactions: number;
  isOverBudget: boolean;
}

export const useOrgProjects = (orgId: string | undefined) =>
  useQuery({
    queryKey: ['org-projects', orgId] as const,
    queryFn: () => api.get<ProjectRow[]>(`/orgs/${orgId}/projects`),
    enabled: Boolean(orgId),
  });

export const useOrgMembers = (orgId: string | undefined) =>
  useQuery({
    queryKey: qk.orgMembers(orgId ?? ''),
    queryFn: () => api.get<OrgMemberRow[]>(`/orgs/${orgId}/members`),
    enabled: Boolean(orgId),
  });

export const useOrgClaims = (orgId: string | undefined, status?: string) =>
  useQuery({
    queryKey: qk.orgClaims(orgId ?? '', status),
    queryFn: () => api.get<ClaimsResponse>(`/orgs/${orgId}/claims`, { status }),
    enabled: Boolean(orgId),
  });

export const useOrgInvoices = (orgId: string | undefined) =>
  useQuery({
    queryKey: qk.orgInvoices(orgId ?? ''),
    queryFn: () => api.get<InvoicesResponse>(`/orgs/${orgId}/invoices`),
    enabled: Boolean(orgId),
  });

export const useOrgTax = (orgId: string | undefined, range: RangeParams) =>
  useQuery({
    queryKey: qk.orgTax(orgId ?? '', range),
    queryFn: () => api.get<TaxSummary>(`/orgs/${orgId}/analytics/tax`, { ...range }),
    enabled: Boolean(orgId),
  });

export interface OrgCashflow {
  series: TimeseriesResponse['series'];
  projection: {
    period: number;
    projectedOutflow: number;
    projectedInflow: number;
    projectedCash: number;
    lower: number;
    upper: number;
  }[];
  method: string;
  confidence: string;
  committedOutflow: {
    next30Days: number;
    total: number;
    items: { number: string; vendor: string; dueDate: string; amount: number; daysToDue: number }[];
  };
  cashOnHand: number;
  cashOutMonth: number | null;
}

export const useOrgCashflow = (orgId: string | undefined, range: RangeParams) =>
  useQuery({
    queryKey: qk.orgCashflow(orgId ?? '', range),
    queryFn: () => api.get<OrgCashflow>(`/orgs/${orgId}/analytics/cashflow`, { ...range }),
    enabled: Boolean(orgId),
  });

export function useClaimAction(orgId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, note }: { id: string; action: string; note?: string }) =>
      api.post(`/orgs/${orgId}/claims/${id}/${action}`, { note }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['org-claims'] });
    },
  });
}

export function usePayInvoice(orgId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      api.post(`/orgs/${orgId}/invoices/${id}/pay`, { amount }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['org-invoices'] });
      void qc.invalidateQueries({ queryKey: ['org-vendors'] });
    },
  });
}

// --- integrations & ML ----------------------------------------------

export const useIntegrations = (orgId?: string) =>
  useQuery({
    queryKey: qk.integrations(orgId),
    queryFn: () => api.get<IntegrationRow[]>('/integrations', { orgId }),
  });

export const useConnectors = () =>
  useQuery({
    queryKey: qk.connectors(),
    queryFn: () => api.get<ConnectorSpec[]>('/integrations/catalogue'),
    staleTime: 10 * 60_000,
  });

export function useConnectIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/integrations/connect', body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['integrations'] }),
  });
}

export function useSyncIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, direction }: { id: string; direction?: 'PULL' | 'PUSH' }) =>
      api.post<{ read: number; written: number; skipped: number; log: string[] }>(
        `/integrations/${id}/sync`,
        { direction },
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['integrations'] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
      void qc.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useTestIntegration() {
  return useMutation({
    mutationFn: (id: string) => api.post<{ ok: boolean; message: string }>(`/integrations/${id}/test`),
  });
}

export const useMlStatus = () =>
  useQuery({
    queryKey: qk.mlStatus(),
    queryFn: () =>
      api.get<{ serviceAvailable: boolean; mode: string; capabilities: string[] }>('/ml/status'),
    staleTime: 60_000,
  });

export const useMlAnomalies = (range: RangeParams) =>
  useQuery({
    queryKey: qk.mlAnomalies(range),
    queryFn: () =>
      api.get<{ source: string; model: string; items: Anomaly[] }>('/ml/anomalies', { ...range }),
  });

export interface ClusterResponse {
  source: string;
  clusters: { id: number; label: string; size: number }[];
  items: { key: string; name: string; total: number; frequency: number; averageTicket: number; cluster: number }[];
}

export const useMlClusters = (range: RangeParams) =>
  useQuery({
    queryKey: qk.mlClusters(range),
    queryFn: () => api.get<ClusterResponse>('/ml/clusters/merchants', { ...range }),
  });

export const useMlCashflowRisk = (range: RangeParams) =>
  useQuery({
    queryKey: qk.mlCashflowRisk(range),
    queryFn: () =>
      api.get<{
        source: string;
        model: string;
        riskScore: number;
        probabilityNegative: number;
        drivers: string[];
      }>('/ml/risk/cashflow', { ...range }),
  });

export function useAutoCategorize() {
  const invalidate = useLedgerInvalidator();
  return useMutation({
    mutationFn: () =>
      api.post<{ candidates: number; updated: number; skipped: number }>('/ml/auto-categorize', {}),
    onSuccess: invalidate,
  });
}

export function useTrainModel() {
  return useMutation({
    mutationFn: () =>
      api.post<{ trained: boolean; accuracy?: number; samples: number; reason?: string }>(
        '/ml/train/category',
        {},
      ),
  });
}
