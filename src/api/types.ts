export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  currency: string;
  monthlyIncome?: number;
  locale?: string;
  avatarColor?: string;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface Account {
  id: string;
  name: string;
  type: string;
  currency: string;
  color: string;
  icon: string;
  openingBalance: number;
  balance: number;
  creditLimit: number | null;
  utilisation: number | null;
  transactionCount: number;
  isArchived: boolean;
}

export interface Category {
  id: string;
  name: string;
  kind: 'EXPENSE' | 'INCOME';
  icon: string;
  color: string;
  parentId: string | null;
  monthlyLimit: number | null;
  isSystem: boolean;
  transactionCount: number;
}

export interface Transaction {
  id: string;
  type: 'EXPENSE' | 'INCOME' | 'TRANSFER';
  amount: number;
  currency: string;
  description: string;
  merchant: string | null;
  merchantKey: string | null;
  notes: string | null;
  date: string;
  paymentMethod: string;
  isRecurring: boolean;
  scope: string;
  taxAmount: number;
  taxRateBps: number;
  isBillable: boolean;
  isReimbursable: boolean;
  account: { id: string; name: string; color: string } | null;
  toAccount: { id: string; name: string } | null;
  category: { id: string; name: string; color: string; icon: string } | null;
  vendor: { id: string; name: string } | null;
  department: { id: string; name: string; color: string } | null;
  project: { id: string; name: string } | null;
  tags: { id: string; name: string; color: string }[];
  isDeleted: boolean;
  createdAt: string;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  totals?: { expense: number; income: number; transfer: number; net: number };
}

export interface SeriesPoint {
  key: string;
  label: string;
  date: string;
  expense: number;
  income: number;
  net: number;
  count: number;
  movingAvg: number | null;
  cumulative: number;
}

export interface ForecastPoint {
  label: string;
  date: string | null;
  value: number;
  lower: number;
  upper: number;
}

export interface TimeseriesResponse {
  granularity: string;
  series: SeriesPoint[];
  stats: {
    total: number;
    average: number;
    peak: { label: string; value: number };
    volatility: number;
  };
  forecast: {
    method: string;
    confidence: 'high' | 'medium' | 'low';
    mape: number | null;
    points: ForecastPoint[];
  } | null;
}

export interface CategorySlice {
  categoryId: string | null;
  name: string;
  color: string;
  icon: string;
  total: number;
  count: number;
  share: number;
  average: number;
  largest: number;
  trendPct: number | null;
  volatility: number;
  sparkline: number[];
}

export interface Overview {
  org: { id: string; name: string; role: string; scopedToSelf: boolean };
  currency: string;
  range: { from: string; to: string; days: number };
  totals: {
    expense: number;
    income: number;
    net: number;
    transactions: number;
    transfers: number;
    tax: number;
    billable: number;
  };
  rates: {
    dailyBurn: number;
    monthlyRunRate: number;
    margin: number | null;
    expenseToIncome: number | null;
    averageTransaction: number;
  };
  runway: { cashOnHand: number; netBurn: number; months: number | null };
  team: { headcount: number; costPerEmployee: number };
  comparison: {
    expenseChangePct: number | null;
    incomeChangePct: number | null;
    previousExpense: number;
    previousIncome: number;
  };
  topCategory: { name: string; color: string; total: number; share: number } | null;
  projectedMonthEnd: number;
}

export interface Insight {
  id: string;
  severity: 'positive' | 'neutral' | 'warning' | 'critical';
  title: string;
  detail: string;
  metric?: number;
  unit?: string;
  action?: string;
  tag: string;
}

export interface HealthScore {
  score: number;
  grade: string;
  summary: string;
  pillars: { key: string; label: string; weight: number; score: number; hint: string }[];
}

export interface BudgetItem {
  id: string;
  name: string;
  period: string;
  categoryId: string | null;
  departmentId: string | null;
  categoryName: string;
  categoryColor: string;
  limit: number;
  spent: number;
  remaining: number;
  consumedPct: number;
  pacePct: number;
  status: 'on-track' | 'at-risk' | 'exceeded';
  projectedSpend: number;
  transactions: number;
  alertThresholdPct: number;
  windowStart: string;
  windowEnd: string;
}

export interface BudgetPerformance {
  items: BudgetItem[];
  adherencePct: number;
  totalBudgeted: number;
  totalSpent: number;
  exceeded: number;
  atRisk: number;
}

export interface Anomaly {
  transactionId: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  categoryColor: string;
  score: number;
  method?: string;
  reason?: string;
  expected?: number;
  deviation?: number;
}

export interface RecurringCandidate {
  merchantKey: string;
  name: string;
  categoryName: string;
  occurrences: number;
  medianGapDays: number;
  frequency: string;
  averageAmount: number;
  lastCharged: string;
  nextExpected: string;
  annualisedCost: number;
  confidence: number;
}

export interface DashboardResponse {
  overview: Overview;
  series: TimeseriesResponse;
  categories: { type: string; slices: CategorySlice[]; pareto: ParetoResponse };
  merchants: MerchantSlice[];
  anomalies: Anomaly[];
  recurring: { items: RecurringCandidate[]; totalAnnualCost: number; totalMonthlyCost: number };
  budgets: BudgetPerformance;
  health: HealthScore;
  insights: Insight[];
}

export interface ParetoResponse {
  points: { name: string; color: string; total: number; cumulative: number; cumulativeShare: number }[];
  vitalFew: string[];
  vitalFewShare: number;
  gini: number;
  concentration: string;
}

export interface MerchantSlice {
  merchantKey: string;
  name: string;
  total: number;
  count: number;
  average: number;
  share: number;
  firstSeen: string;
  lastSeen: string;
  cadenceDays: number | null;
}

export interface RecurringRule {
  id: string;
  description: string;
  merchant: string | null;
  amount: number;
  type: string;
  frequency: string;
  interval: number;
  nextRunAt: string;
  lastRunAt: string | null;
  autoPost: boolean;
  isActive: boolean;
  accountName: string;
  categoryName: string;
  categoryColor: string;
  postedCount: number;
  annualCost: number;
  daysUntilNext: number;
}

export interface NotificationItem {
  id: string;
  type: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}
