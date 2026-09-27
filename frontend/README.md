# Livin Merchant

Mobile-first interactive prototype of the upgraded Livin Merchant by Mandiri:
a merchant operating system with POS, payments, operations, analytics, a Growth Engine and financing readiness.

Built with React, Vite, TypeScript, Tailwind CSS, React Router, Recharts and Lucide React. All data is local mock data.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```

On desktop the app renders inside a centered phone frame; on phones it fills the screen.

## Demo flow (2-3 minutes)

1. Welcome screen → **Explore as Guest** (or **Login with Mandiri**, any 6+ character password)
2. **Home** — today's sales, attention items, growth snapshot, cashflow, daily goal
3. **Cashier** — add products (sizes, add-ons), checkout with QRIS / cash / split payment
4. **Growth** — Growth Score, stages, Next Best Actions, Missions, Insights
5. **Financing Readiness** → Financing Center
6. **More** — operations, finance, growth and Mandiri modules

## Presenter controls (hidden)

- Open any URL with `?demo=true` (or tap *App version* five times in Settings) to show a small
  presenter button for switching scenarios, jumping to merchant / guest mode and resetting data.
- `?scenario=A|B|C` switches directly:
  - **A** healthy merchant (Growth Score 78)
  - **B** almost financing-ready (Growth Score 84)
  - **C** operational issue (declining sales, low stock)

Demo transaction PIN: `123456` (changeable in Security Center).

## Data model

- Demo clock is fixed at **Saturday 26 Sep 2026, 12:45**.
- `src/data/transactions.ts` deterministically generates 90 days of transactions per outlet that add up
  exactly to each scenario's figures (e.g. Rp 48.750.000 / 1,284 transactions in the last 30 days,
  Rp 2.850.000 / 76 transactions today), so Home, Transactions, Analytics, Growth, Finance and
  Settlement always reconcile.
- New sales, refunds, stock movements, expenses, purchase orders and settings persist in localStorage
  (merchant mode only; Explore Mode changes stay in memory).
