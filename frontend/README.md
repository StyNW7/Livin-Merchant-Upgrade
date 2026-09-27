# Livin Merchant

Mobile-first web app (installable PWA) of Livin Merchant by Mandiri:
a merchant operating system with POS, payments, operations, analytics, a Growth Engine and financing readiness.

Built with React, Vite, TypeScript, Tailwind CSS, React Router, Recharts and Lucide React. Business data is generated on the device and kept in local storage.

## Install as an app (PWA)

Livin Merchant is a Progressive Web App (vite-plugin-pwa + Workbox):

- When the website opens, an **Install Livin Merchant** sheet appears (once per visit). *Install app*
  opens the browser's install dialog on Chrome, Edge and Android; on iPhone/iPad it shows the
  *Share → Add to Home Screen* steps. It can be reopened from **More → Get the Livin Merchant app**,
  **Settings → Install Livin Merchant**, or the *Install* button next to the phone on desktop.
- Installed, it opens full screen without the browser bar, with home-screen shortcuts for New Sale,
  QR Payment, Growth and Transactions (press and hold the icon).
- All screens are precached, so the app keeps working offline; *You're offline* appears when the
  connection drops.
- New versions are detected automatically (and via **Settings → Check for updates**); an
  *A new version is ready → Update* banner applies them.

Installing requires HTTPS (or `localhost`). Deploy the `dist` folder, e.g. to Vercel, and open the site.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build (includes the service worker)
npm run preview  # serve the production build locally to try installing
```

On desktop the app renders inside a centered phone frame; on phones it fills the screen.

## Presentation flow (2-3 minutes)

1. Welcome screen → **Explore as Guest** (or **Login with Mandiri**, any 6+ character password)
2. **Home** — today's sales, attention items, growth snapshot, cashflow, daily goal
3. **Cashier** — add products (sizes, add-ons), checkout with QRIS (on-screen code) / cash / split payment.
   The success screen shows how the sale moved today's sales, the daily goal and the Growth Score.
4. **Growth** — Growth Score, stages, Next Best Actions, Missions, Insights. Complete a mission
   (e.g. *Learn → Cashflow Basics*) and claim it to see the score move.
5. **Financing Readiness** → Financing Center
6. **More** — operations, finance, growth and Mandiri modules

## Presenter controls (hidden)

- Open any URL with `?demo=true` (or tap *App version* five times in Settings) to show a small
  presenter button for switching scenarios, jumping to merchant / guest mode and resetting data.
- `?scenario=A|B|C` switches directly:
  - **A** healthy merchant (Growth Score 78)
  - **B** almost financing-ready (Growth Score 84)
  - **C** operational issue (declining sales, low stock)

Default transaction PIN: `123456` (changeable in Security Center).

## Data model

- The business day is fixed at **Saturday 26 Sep 2026, 12:45** so every screen agrees.
- `src/data/transactions.ts` deterministically generates 90 days of transactions per outlet that add up
  exactly to each scenario's figures (e.g. Rp 48.750.000 / 1,284 transactions in the last 30 days,
  Rp 2.850.000 / 76 transactions today), so Home, Transactions, Analytics, Growth, Finance and
  Settlement always reconcile.
- New sales, refunds, stock movements, expenses, purchase orders and settings persist in localStorage
  (merchant mode only; Explore Mode changes stay in memory).

## What is connected

Every action changes real app state (localStorage in merchant mode, memory in Explore Mode):

- **Cashier** respects stock (cannot sell more than is on hand), applies active percentage
  promotions (their revenue, transactions and redemptions update) and deducts customer vouchers.
- **Customers**: vouchers sent from a customer's page are redeemed when that customer is selected at
  checkout; visits and spending grow with recorded sales.
- **Settings**: receipt footer prints on receipts, auto-print runs after payment, haptics vibrate on
  supported phones, stock alerts and the daily summary control Notifications, and the daily goal
  drives Home and the payment success screen.
- **Devices**: printing uses the outlet's receipt printer; a disconnected printer blocks printing
  and appears in Home → Needs Your Attention.
- **Downloads**: Outlet QR → *Download QR poster* saves a printable PNG;
  Business Finance → *Download monthly summary* saves a CSV built from the figures on screen.
- **Programs** with a date are added to the Business Calendar; **Help** problem reports are listed
  under *Your reports*.
