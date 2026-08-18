# Expense Analytics — Frontend

React 19 + Vite + Tailwind v4 client for the Expense Analytics API.
Charts are hand-built SVG (no charting library) against a **validated**
data-viz palette.

```bash
pnpm install
pnpm dev          # http://localhost:5173  (proxies /api to :4000)
```

Backend: https://github.com/vaseem148/Expense-Tracker-Analytics_BE

## Status

**Done**
- Design tokens, light/dark theme (pre-paint, no flash), motion + reduced-motion
- API client with single-flight token refresh, typed query/mutation layer
- Chart kit: trend + forecast band, donut, bars, columns, heatmap, sparkline,
  gauge, stat tiles, crosshair tooltips, legends
- App shell: sidebar, topbar, notifications, ⌘K command palette, mobile nav
- Realtime socket wiring, toasts, modals, form primitives
- Pages: Login/Register, Dashboard, Transactions (filters, bulk ops, CSV export)

**Next**
- Analytics deep-dive, Budgets, Goals, Recurring pages
- Business workspace (KPIs, P&L, departments, vendors, claims, payables)
- Integrations, AI insights, Import/Export, Settings
- Router + `main.tsx` wiring, production build

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
