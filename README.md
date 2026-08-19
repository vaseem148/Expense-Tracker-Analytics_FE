# Expense Analytics — Frontend

React 19 + Vite + Tailwind v4 client for the Expense Analytics API — a
**company spend platform**. Charts are hand-built SVG (no charting library)
against a **validated** data-viz palette.

```bash
pnpm install
pnpm dev          # http://localhost:5173  (proxies /api to :4000)
```

Backend: https://github.com/vaseem148/Expense-Tracker-Analytics_BE

## Pages

| Route | What it does |
| --- | --- |
| `/` | Company overview: revenue, opex, margin, burn, runway, cost per head, forecast, health score, insights |
| `/expenses` | Company ledger with cost-centre / vendor / project filters, bulk actions, CSV export |
| `/analytics` | Trends · Categories (Pareto, volatility) · Behaviour (heatmap, supplier cadence) · Compare |
| `/financials` | P&L statement, cost-centre variance, supplier concentration, cash projection with committed outflow |
| `/budgets` | Category and cost-centre caps against a pace marker |
| `/subscriptions` | Declared commitments plus recurring charges mined from the ledger |
| `/claims` | Reimbursement pipeline: submit → approve / reject → reimburse |
| `/payables` | Vendor bills with aging buckets and payment recording |
| `/vendors` | Supplier ledger, GSTIN compliance, spend share, ML risk scoring |
| `/projects` | Client engagements: budget vs actual and what is re-billable |
| `/team` | Members, roles, per-person spend caps and cost centres |
| `/insights` | ML anomalies, supplier clusters, cash-flow risk, auto-categorise |
| `/integrations` | Connector catalogue with sandbox connect, test and sync |
| `/data` | CSV import with column mapping and dry run; CSV/JSON export |
| `/settings` | Profile, theme, company accounts, active sessions |

What a role sees is decided by the API, not by hiding UI: FINANCE and above get
company-wide figures, MANAGER and EMPLOYEE get their own spend, and the
dashboard says so explicitly.

## Chart colour policy

Series colours come from a fixed eight-slot categorical order, validated with
the data-viz palette checker in **both** modes:

| Check | Light | Dark |
| --- | --- | --- |
| Lightness band | PASS | PASS |
| Chroma floor | PASS | PASS |
| CVD separation (adjacent) | PASS ΔE 9.1 | PASS ΔE 8.4 |
| Normal-vision floor | PASS ΔE 19.6 | PASS ΔE 19.3 |
| Contrast vs surface | WARN (3 slots) | PASS |

The light-mode warning is answered by the **relief rule**: every chart using
those slots ships direct labels (the donut labels each slice, bars label each
row), so identity never depends on colour alone.

Rules that are not negotiable here:
- Colour follows the **entity**, never its rank — filtering never repaints survivors
- Beyond eight entities the tail folds into "Other"; no ninth hue is generated
- One y-axis, always. Two measures of different scale get two charts
- Sequential heatmap = one hue light→dark; status colours ship with an icon
