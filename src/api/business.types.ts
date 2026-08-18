export interface OrgSummary {
  orgId: string;
  id: string;
  name: string;
  slug: string;
  currency: string;
  logoColor: string;
  gstin: string | null;
  city: string | null;
  role: 'OWNER' | 'ADMIN' | 'FINANCE' | 'MANAGER' | 'EMPLOYEE';
  title: string | null;
  department: { id: string; name: string } | null;
  joinedAt: string;
  counts: { members: number; transactions: number; vendors: number };
}

export interface OrgKpis {
  currency: string;
  period: { from: string; to: string; days: number };
  revenue: number;
  opex: number;
  grossProfit: number;
  margin: number | null;
  monthlyBurn: number;
  netBurn: number;
  cashOnHand: number;
  runwayMonths: number | null;
  headcount: number;
  costPerEmployee: number;
  billableSpend: number;
  taxPaid: number;
  transactions: number;
  change: { opexPct: number | null; revenuePct: number | null };
}

export interface DepartmentRow {
  id: string;
  name: string;
  code: string;
  color: string;
  headcount: number;
  budget: number;
  spent: number;
  variance: number;
  consumedPct: number | null;
  share: number;
  perHead: number;
  transactions: number;
  topCategory: { name: string; total: number } | null;
  status: 'healthy' | 'at-risk' | 'over' | 'no-budget';
}

export interface VendorRow {
  id: string;
  name: string;
  gstin: string | null;
  category: string | null;
  paymentTermsDays: number;
  isPreferred: boolean;
  riskScore: number;
  totalSpend: number;
  spendShare: number;
  lastTransaction: string | null;
  outstanding: number;
  transactionCount: number;
  invoiceCount: number;
}

export interface VendorAnalysis {
  items: {
    vendorId: string;
    name: string;
    spend: number;
    share: number;
    transactions: number;
    averageTicket: number;
    firstSeen: string;
    lastSeen: string;
  }[];
  totalVendorSpend: number;
  vendorCount: number;
  concentration: {
    gini: number;
    top1Share: number;
    top3Share: number;
    risk: 'low' | 'moderate' | 'high';
  };
}

export interface PnlResponse {
  period: { from: string; to: string };
  revenue: { lines: PnlLine[]; total: number };
  expenses: { lines: (PnlLine & { share: number })[]; total: number };
  netProfit: number;
  netMargin: number | null;
  series: { label: string; expense: number; income: number; net: number }[];
}

export interface PnlLine {
  name: string;
  color: string;
  amount: number;
  previous: number;
  changePct: number | null;
}

export interface ClaimRow {
  id: string;
  title: string;
  description: string | null;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REIMBURSED';
  total: number;
  itemCount: number;
  claimant: { id: string; name: string; email: string; avatarColor: string };
  decidedBy: { id: string; name: string } | null;
  decisionNote: string | null;
  policyFlags: string[];
  submittedAt: string | null;
  decidedAt: string | null;
  reimbursedAt: string | null;
  createdAt: string;
  ageingHours: number | null;
}

export interface ClaimsResponse {
  items: ClaimRow[];
  pipeline: { status: string; count: number; total: number }[];
  canApprove: boolean;
}

export interface InvoiceRow {
  id: string;
  number: string;
  vendor: { id: string; name: string; paymentTermsDays: number };
  issueDate: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  total: number;
  paid: number;
  outstanding: number;
  status: string;
  daysToDue: number;
  agingBucket: string;
  notes: string | null;
}

export interface InvoicesResponse {
  items: InvoiceRow[];
  summary: {
    count: number;
    totalOutstanding: number;
    overdueCount: number;
    overdueValue: number;
    dueThisWeek: number;
    aging: { bucket: string; count: number; value: number }[];
  };
}

export interface TaxSummary {
  period: { from: string; to: string };
  slabs: { ratePct: number; taxableValue: number; taxAmount: number; transactions: number }[];
  inputTaxCredit: number;
  outputTaxLiability: number;
  netPayable: number;
  missingVendorGstin: number;
}

export interface OrgMemberRow {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarColor: string;
  role: string;
  title: string | null;
  department: { id: string; name: string; color: string } | null;
  monthlyLimit: number;
  monthToDateSpend: number;
  limitUsedPct: number | null;
  isActive: boolean;
  joinedAt: string;
  lastLoginAt: string | null;
}

export interface IntegrationRow {
  id: string;
  provider: string;
  displayName: string;
  category: string;
  capabilities: string[];
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'SYNCING';
  mode: 'SANDBOX' | 'LIVE';
  config: Record<string, unknown>;
  credentialPreview: string | null;
  lastSyncAt: string | null;
  lastError: string | null;
  syncInterval: number;
  isActive: boolean;
  lastRun: {
    status: string;
    direction: string;
    recordsRead: number;
    recordsWritten: number;
    recordsSkipped: number;
    startedAt: string;
    finishedAt: string | null;
  } | null;
}

export interface ConnectorSpec {
  provider: string;
  displayName: string;
  capabilities: string[];
  category: string;
  requiredCredentials: { key: string; label: string; secret: boolean }[];
  configSchema: { key: string; label: string; type: string }[];
}
