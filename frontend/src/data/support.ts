export const HELP_CATEGORIES = [
  "Getting Started",
  "Payments",
  "Transactions",
  "Settlement",
  "Products",
  "Growth",
  "Financing",
  "Account",
  "Security",
] as const;

export type HelpCategory = (typeof HELP_CATEGORIES)[number];

export interface HelpArticle {
  id: string;
  category: HelpCategory;
  title: string;
  body: string[];
  popular?: boolean;
}

export const helpArticles: HelpArticle[] = [
  { id: "h-first-sale", category: "Getting Started", popular: true, title: "How do I make my first sale?", body: ["Open Cashier from the bottom bar.", "Tap products to add them to the cart, then tap Charge.", "Choose the payment method, confirm, and share or print the receipt."] },
  { id: "h-outlet", category: "Getting Started", title: "How do I switch outlets?", body: ["Tap the outlet name on Home.", "Choose the outlet you want to manage. Transactions, orders and reports follow your choice."] },
  { id: "h-qris", category: "Payments", popular: true, title: "How does QRIS payment work?", body: ["Open QR Payment from Home or choose QRIS at checkout.", "Your customer scans the code with any QRIS-supported app.", "The payment appears in Transactions once it succeeds."] },
  { id: "h-split", category: "Payments", title: "Can a customer pay with two methods?", body: ["Yes. At checkout choose Split payment.", "Enter the amount for the first method; the remainder is assigned to the second method."] },
  { id: "h-refund", category: "Transactions", popular: true, title: "How do I refund a transaction?", body: ["Open the transaction from Transactions.", "Tap Refund, choose the items and the reason, then confirm.", "Only Owners and Managers can process refunds."] },
  { id: "h-filter", category: "Transactions", title: "How do I find a specific transaction?", body: ["Use search with the invoice number or amount.", "Tap the filter icon to filter by date, payment, outlet, staff, amount or status."] },
  { id: "h-settlement-time", category: "Settlement", popular: true, title: "When will I receive my settlement?", body: ["Non-cash sales are settled to your Mandiri business account the next morning, around 06:15.", "Cash sales stay in your drawer and are not settled."] },
  { id: "h-settlement-diff", category: "Settlement", title: "Why is my settlement lower than my sales?", body: ["Settlement excludes cash sales and refunds.", "A small merchant discount rate (MDR) may apply to non-cash payments. See the settlement detail for the breakdown."] },
  { id: "h-stock", category: "Products", title: "How do I update stock?", body: ["Open Inventory and choose an item.", "Use Stock In, Stock Out, Adjustment, Damaged or Transfer. Every change is saved to Inventory History."] },
  { id: "h-variants", category: "Products", title: "How do sizes and add-ons work?", body: ["Drinks marked with variants show size options in Cashier.", "Add-ons like extra shot or oat milk are added to the item price automatically."] },
  { id: "h-score", category: "Growth", popular: true, title: "What is the Growth Score?", body: ["The Growth Score summarizes your recent business activity: transaction health, revenue stability, growth momentum, operations, business profile and customer retention.", "It supports business development insights and does not guarantee financing approval."] },
  { id: "h-missions", category: "Growth", title: "How do Growth Missions work?", body: ["Missions are practical goals based on your own data.", "When a mission reaches 100%, tap Claim to add its impact to your Growth Score."] },
  { id: "h-readiness", category: "Financing", popular: true, title: "What does Financing Readiness mean?", body: ["Financing Readiness shows how prepared your business profile looks for financing discovery.", "It is an indicative measure. Final eligibility and approval remain subject to Bank Mandiri's assessment."] },
  { id: "h-apply", category: "Financing", title: "How do I continue a financing recommendation?", body: ["Open Financing, choose a recommendation and tap Continue with Mandiri.", "You will be guided to share consent and your business documents with Bank Mandiri."] },
  { id: "h-profile", category: "Account", title: "How do I complete my business profile?", body: ["Open More, then Business Profile.", "Upload the missing document. Your profile strength and Growth Score update right away."] },
  { id: "h-staff", category: "Account", title: "How do I add staff?", body: ["Open More, then Staff.", "Tap Add Staff, choose the outlet and role. Permissions follow the role and can be adjusted."] },
  { id: "h-pin", category: "Security", title: "How do I change my transaction PIN?", body: ["Open Security Center and tap Transaction PIN.", "Enter your current PIN, then set and confirm a new 6-digit PIN."] },
  { id: "h-privacy", category: "Security", title: "How does Livin Merchant use my data?", body: ["Livin Merchant uses your recorded sales, stock, expenses and profile to show reports, insights and your Growth Score.", "Customers are identified only by anonymous codes. Card numbers and customer bank details are never shown.", "You can turn business insights off at any time in Security Center under Privacy consent.", "Financing Readiness is indicative. Nothing is shared with a financing team unless you choose to continue a recommendation."] },
  { id: "h-device", category: "Security", title: "I lost my phone. What should I do?", body: ["Log in from another device and open Security Center.", "Log out the lost device from Device Management, then change your PIN.", "Call Mandiri Call 14000 if you notice anything unusual."] },
];

export const supportScript: { match: RegExp; reply: string }[] = [
  { match: /settle|pencair|dana/i, reply: "Settlement for non-cash sales arrives the next morning around 06:15 in your Mandiri business account. You can check each settlement in the Settlement Center." },
  { match: /refund|kembali/i, reply: "Refunds can be processed from the transaction detail by an Owner or Manager. Choose the items, the reason, then confirm." },
  { match: /qris|qr/i, reply: "For QRIS issues, make sure the QR stand belongs to the correct outlet and the device is online. You can run a check from Devices." },
  { match: /print|printer|struk/i, reply: "Try reconnecting the printer from More, Devices, Receipt Printer. The troubleshooting guide will walk you through a test print." },
  { match: /financ|loan|pinjam|kredit/i, reply: "Financing recommendations are indicative and depend on your recorded business activity. Final eligibility follows Bank Mandiri's assessment." },
];

export const DEFAULT_SUPPORT_REPLY =
  "Thanks, we have noted your question. A Livin Merchant support agent usually replies within 5 minutes during operating hours (07:00 - 22:00).";

export const securityActivity = [
  { id: "sa-1", title: "Login from this device", detail: "Android POS - Gading Serpong", time: "Today, 06:38" },
  { id: "sa-2", title: "Transaction PIN verified", detail: "Refund INV-2026-0926-072", time: "Today, 11:52" },
  { id: "sa-3", title: "Settlement account confirmed", detail: "Mandiri Business ****7730", time: "12 Sep, 09:14" },
  { id: "sa-4", title: "Password changed", detail: "Livin' by Mandiri app", time: "2 Sep, 20:03" },
];

export const initialSessions = [
  { id: "dev-this", name: "Android POS", location: "Gading Serpong, Tangerang", lastActive: "Active now", current: true },
  { id: "dev-web", name: "Chrome on Windows", location: "Tangerang", lastActive: "Last used 3 days ago", current: false },
];

export const searchReports = [
  { id: "r-sales", title: "Sales and revenue report", to: "/reports" },
  { id: "r-finance", title: "Cashflow and profit summary", to: "/finance" },
  { id: "r-settlement", title: "Settlement report", to: "/settlement" },
  { id: "r-products", title: "Top products and margin", to: "/reports?section=product" },
  { id: "r-customers", title: "Customer insights", to: "/customers" },
  { id: "r-outlets", title: "Outlet comparison", to: "/outlets" },
  { id: "r-growth", title: "Growth Score report", to: "/growth/score" },
  { id: "r-outlook", title: "Business Outlook", to: "/growth/outlook" },
];

/** Every screen a merchant can jump to from search, with the words people usually type. */
export const searchFeatures = [
  { id: "f-cashier", title: "Cashier", section: "Sell", to: "/cashier", keywords: "pos sale kasir checkout" },
  { id: "f-qr", title: "QR Payment", section: "Sell", to: "/qr-payment", keywords: "qris scan poster" },
  { id: "f-orders", title: "Orders", section: "Operate", to: "/orders", keywords: "kitchen pesanan order" },
  { id: "f-products", title: "Products", section: "Operate", to: "/products", keywords: "menu catalog item category" },
  { id: "f-inventory", title: "Inventory", section: "Operate", to: "/inventory", keywords: "stock stok restock low" },
  { id: "f-suppliers", title: "Suppliers", section: "Operate", to: "/suppliers", keywords: "supplier purchase order po" },
  { id: "f-staff", title: "Staff", section: "Operate", to: "/employees", keywords: "employee karyawan shift attendance permission" },
  { id: "f-outlets", title: "Outlets", section: "Operate", to: "/outlets", keywords: "branch cabang compare" },
  { id: "f-calendar", title: "Business Calendar", section: "Operate", to: "/calendar", keywords: "agenda schedule jadwal" },
  { id: "f-devices", title: "Devices", section: "Operate", to: "/devices", keywords: "printer drawer device troubleshoot" },
  { id: "f-settlement", title: "Settlements", section: "Finance", to: "/settlement", keywords: "settlement pencairan dana" },
  { id: "f-expenses", title: "Expenses", section: "Finance", to: "/expenses", keywords: "expense biaya pengeluaran" },
  { id: "f-finance", title: "Business Finance", section: "Finance", to: "/finance", keywords: "cashflow profit bookkeeping laporan" },
  { id: "f-financing", title: "Financing Center", section: "Finance", to: "/financing", keywords: "loan pinjaman kredit modal" },
  { id: "f-analytics", title: "Business Analytics", section: "Grow", to: "/reports", keywords: "analytics report chart" },
  { id: "f-growth", title: "Growth Score", section: "Grow", to: "/growth", keywords: "growth score stage" },
  { id: "f-missions", title: "Growth Missions", section: "Grow", to: "/growth/missions", keywords: "mission target" },
  { id: "f-insights", title: "Business Insights", section: "Grow", to: "/growth/insights", keywords: "insight recommendation" },
  { id: "f-outlook", title: "Business Outlook", section: "Grow", to: "/growth/outlook", keywords: "forecast projection" },
  { id: "f-readiness", title: "Financing Readiness", section: "Grow", to: "/growth/readiness", keywords: "readiness" },
  { id: "f-promotions", title: "Promotions", section: "Grow", to: "/promotions", keywords: "promo discount campaign" },
  { id: "f-customers", title: "Customers", section: "Grow", to: "/customers", keywords: "crm pelanggan voucher" },
  { id: "f-loyalty", title: "Customer Loyalty", section: "Grow", to: "/loyalty", keywords: "loyalty reward member" },
  { id: "f-learn", title: "Learn", section: "Grow", to: "/learn", keywords: "learning course tutorial" },
  { id: "f-ecosystem", title: "Livin’ Ecosystem", section: "Mandiri", to: "/ecosystem", keywords: "livin mandiri account livinpoin poin" },
  { id: "f-programs", title: "Program Center", section: "Mandiri", to: "/programs", keywords: "program event class community" },
  { id: "f-profile", title: "Business Profile", section: "Account", to: "/profile", keywords: "profile document verification" },
  { id: "f-security", title: "Security Center", section: "Account", to: "/security", keywords: "pin password device privacy" },
  { id: "f-settings", title: "Settings", section: "Account", to: "/settings", keywords: "receipt footer print haptic" },
  { id: "f-help", title: "Help Center", section: "Account", to: "/help", keywords: "help support chat report" },
];
