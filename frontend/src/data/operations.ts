import type { Device, Expense, ExpenseCategory, InventoryMovement, Order, PurchaseOrder, PurchaseOrderStatus, Supplier } from "@/types";

/* ---------------- Expenses ---------------- */

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Rent",
  "Ingredients",
  "Salary",
  "Utilities",
  "Marketing",
  "Delivery",
  "Equipment",
  "Others",
];

/**
 * Gading Serpong: the last 30 days add up to Rp 27.400.000 and today to Rp 780.000,
 * so Finance, Home cashflow and Reports reconcile.
 */
export const initialExpenses: Expense[] = [
  { id: "EXP-0926-03", outletId: "gading-serpong", category: "Others", title: "Ice cubes", amount: 200_000, method: "Cash", date: "2026-09-26" },
  { id: "EXP-0926-02", outletId: "gading-serpong", category: "Delivery", title: "Supplier delivery fee", amount: 60_000, method: "Cash", date: "2026-09-26" },
  { id: "EXP-0926-01", outletId: "gading-serpong", category: "Ingredients", title: "Fresh milk top-up 20L", amount: 520_000, method: "Cash", date: "2026-09-26", supplierId: "sup-susu" },
  { id: "EXP-0922-01", outletId: "gading-serpong", category: "Ingredients", title: "Pastry order - Roti Artisan", amount: 960_000, method: "Cash", date: "2026-09-22", supplierId: "sup-roti" },
  { id: "EXP-0917-01", outletId: "gading-serpong", category: "Equipment", title: "Grinder burr replacement", amount: 320_000, method: "Transfer", date: "2026-09-17" },
  { id: "EXP-0915-01", outletId: "gading-serpong", category: "Delivery", title: "Courier for catering order", amount: 150_000, method: "Cash", date: "2026-09-15" },
  { id: "EXP-0912-01", outletId: "gading-serpong", category: "Ingredients", title: "Weekly ingredients restock", amount: 2_450_000, method: "Transfer", date: "2026-09-12" },
  { id: "EXP-0910-01", outletId: "gading-serpong", category: "Marketing", title: "Instagram and TikTok ads", amount: 850_000, method: "Debit", date: "2026-09-10" },
  { id: "EXP-0909-02", outletId: "gading-serpong", category: "Others", title: "Cleaning supplies", amount: 210_000, method: "Cash", date: "2026-09-09" },
  { id: "EXP-0909-01", outletId: "gading-serpong", category: "Utilities", title: "Internet and POS data", amount: 450_000, method: "Livin' by Mandiri", date: "2026-09-09" },
  { id: "EXP-0908-02", outletId: "gading-serpong", category: "Utilities", title: "Water (PDAM)", amount: 280_000, method: "Livin' by Mandiri", date: "2026-09-08" },
  { id: "EXP-0908-01", outletId: "gading-serpong", category: "Utilities", title: "Electricity (PLN)", amount: 1_120_000, method: "Livin' by Mandiri", date: "2026-09-08" },
  { id: "EXP-0905-01", outletId: "gading-serpong", category: "Ingredients", title: "Fresh milk and oat milk", amount: 1_680_000, method: "Transfer", date: "2026-09-05", supplierId: "sup-susu" },
  { id: "EXP-0903-01", outletId: "gading-serpong", category: "Salary", title: "Staff payroll - September", amount: 8_400_000, method: "Livin' by Mandiri", date: "2026-09-03" },
  { id: "EXP-0901-02", outletId: "gading-serpong", category: "Ingredients", title: "Coffee beans - PT Rasa Nusantara", amount: 3_250_000, method: "Transfer", date: "2026-09-01", supplierId: "sup-rasa" },
  { id: "EXP-0901-01", outletId: "gading-serpong", category: "Rent", title: "Shop rent - September", amount: 6_500_000, method: "Transfer", date: "2026-09-01" },

  { id: "EXP-AS-0926-01", outletId: "alam-sutera", category: "Ingredients", title: "Fresh milk top-up 12L", amount: 310_000, method: "Cash", date: "2026-09-26" },
  { id: "EXP-AS-0920-01", outletId: "alam-sutera", category: "Ingredients", title: "Weekly ingredients restock", amount: 2_180_000, method: "Transfer", date: "2026-09-20" },
  { id: "EXP-AS-0912-01", outletId: "alam-sutera", category: "Ingredients", title: "Coffee beans and syrups", amount: 2_640_000, method: "Transfer", date: "2026-09-12" },
  { id: "EXP-AS-0908-01", outletId: "alam-sutera", category: "Utilities", title: "Electricity, water and internet", amount: 1_390_000, method: "Livin' by Mandiri", date: "2026-09-08" },
  { id: "EXP-AS-0905-01", outletId: "alam-sutera", category: "Marketing", title: "Local influencer visit", amount: 600_000, method: "Transfer", date: "2026-09-05" },
  { id: "EXP-AS-0903-01", outletId: "alam-sutera", category: "Salary", title: "Staff payroll - September", amount: 5_600_000, method: "Livin' by Mandiri", date: "2026-09-03" },
  { id: "EXP-AS-0901-01", outletId: "alam-sutera", category: "Rent", title: "Kiosk rent - September", amount: 5_200_000, method: "Transfer", date: "2026-09-01" },
  { id: "EXP-AS-0901-02", outletId: "alam-sutera", category: "Others", title: "Cleaning and small supplies", amount: 380_000, method: "Cash", date: "2026-09-01" },
];

/** Expenses of the two previous 30-day periods, for the finance trend. */
export const previousExpenses: Record<string, [number, number]> = {
  "gading-serpong": [25_600_000, 26_300_000],
  "alam-sutera": [17_900_000, 18_700_000],
};

/* ---------------- Suppliers & purchase orders ---------------- */

export const initialSuppliers: Supplier[] = [
  {
    id: "sup-rasa",
    name: "PT Rasa Nusantara",
    category: "Coffee Beans",
    contactName: "Pak Hendra",
    phone: "+62 21 5577 1020",
    email: "order@rasanusantara.co.id",
    products: ["House blend coffee beans", "Palm sugar syrup", "Matcha powder", "Cups and lids"],
    lastPurchase: 3_250_000,
    lastPurchaseDate: "2026-09-01",
    paymentStatus: "Paid",
    outstanding: 0,
    paymentTerms: "Net 14 days",
    notes: "Roast date must be within 7 days on delivery. Free delivery above Rp 2.000.000.",
  },
  {
    id: "sup-susu",
    name: "CV Susu Segar Lembang",
    category: "Dairy",
    contactName: "Bu Wulan",
    phone: "+62 812 2210 4455",
    email: "wulan@susulembang.id",
    products: ["Fresh milk", "Oat milk", "Whipping cream"],
    lastPurchase: 1_680_000,
    lastPurchaseDate: "2026-09-05",
    paymentStatus: "Paid",
    outstanding: 0,
    paymentTerms: "Cash on delivery",
    notes: "Deliveries Tuesday and Friday before 07:00.",
  },
  {
    id: "sup-kemasan",
    name: "UD Kemasan Jaya",
    category: "Packaging",
    contactName: "Koh Liem",
    phone: "+62 21 5421 8890",
    email: "sales@kemasanjaya.com",
    products: ["Cups 16oz", "Paper bags", "Straws", "Food boxes"],
    lastPurchase: 1_150_000,
    lastPurchaseDate: "2026-08-30",
    paymentStatus: "Partially Paid",
    outstanding: 575_000,
    paymentTerms: "Net 30 days",
    notes: "Remaining payment due 26 Sep.",
  },
  {
    id: "sup-roti",
    name: "Roti Artisan Serpong",
    category: "Pastry",
    contactName: "Mbak Tika",
    phone: "+62 878 9012 3344",
    email: "hello@rotiartisan.id",
    products: ["Croissant", "Chicken sandwich bread", "Glazed donut"],
    lastPurchase: 960_000,
    lastPurchaseDate: "2026-09-22",
    paymentStatus: "Paid",
    outstanding: 0,
    paymentTerms: "Cash on delivery",
    notes: "Order before 20:00 for next-morning delivery.",
  },
];

export const poTone: Record<PurchaseOrderStatus, "info" | "warning" | "success" | "neutral" | "danger"> = {
  Draft: "neutral",
  Pending: "warning",
  Received: "info",
  Paid: "success",
  Cancelled: "danger",
};

export const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: "PO-0926-001",
    supplierId: "sup-rasa",
    outletId: "gading-serpong",
    lines: [
      { ingredientId: "i-beans", name: "Coffee Beans", qty: 10, unit: "kg", unitPrice: 285_000 },
      { ingredientId: "i-milk", name: "Fresh Milk", qty: 30, unit: "L", unitPrice: 25_000 },
      { ingredientId: "i-cups", name: "Cups 16oz with Lid", qty: 500, unit: "pcs", unitPrice: 2_500 },
    ],
    total: 4_850_000,
    status: "Pending",
    createdAt: "2026-09-26",
    expectedAt: "2026-09-28",
    note: "Deliver before 08:00",
  },
  {
    id: "PO-0922-002",
    supplierId: "sup-roti",
    outletId: "gading-serpong",
    lines: [{ name: "Croissant", qty: 40, unit: "pcs", unitPrice: 11_000 }, { name: "Glazed Donut", qty: 20, unit: "pcs", unitPrice: 7_400 }],
    total: 588_000,
    status: "Paid",
    createdAt: "2026-09-22",
    expectedAt: "2026-09-23",
  },
  {
    id: "PO-0830-001",
    supplierId: "sup-kemasan",
    outletId: "gading-serpong",
    lines: [{ ingredientId: "i-cups", name: "Cups 16oz with Lid", qty: 460, unit: "pcs", unitPrice: 2_500 }],
    total: 1_150_000,
    status: "Received",
    createdAt: "2026-08-30",
    expectedAt: "2026-09-01",
    note: "Rp 575.000 paid, remainder due 26 Sep",
  },
];

/* ---------------- Orders ---------------- */

export const initialOrders: Order[] = [
  {
    id: "ORD-1026",
    outletId: "gading-serpong",
    reference: "GrabFood GF-2291",
    channel: "Delivery",
    items: [
      { productId: "p-matcha-latte", name: "Matcha Latte", qty: 2, price: 35_000 },
      { productId: "p-french-fries", name: "French Fries", qty: 1, price: 28_000 },
    ],
    total: 98_000,
    status: "New",
    createdAt: "12:41",
    updatedAt: "12:41",
    note: "Less ice",
  },
  {
    id: "ORD-1025",
    outletId: "gading-serpong",
    reference: "Takeaway #18",
    channel: "Takeaway",
    items: [
      { productId: "p-americano", name: "Americano", qty: 1, price: 25_000 },
      { productId: "p-kopi-susu", name: "Kopi Susu Gula Aren", qty: 1, price: 28_000 },
    ],
    total: 53_000,
    status: "New",
    createdAt: "12:38",
    updatedAt: "12:38",
  },
  {
    id: "ORD-1024",
    outletId: "gading-serpong",
    reference: "Table 7",
    channel: "Dine-in",
    items: [
      { productId: "p-cafe-latte", name: "Cafe Latte", qty: 2, price: 32_000 },
      { productId: "p-croissant", name: "Croissant", qty: 1, price: 24_000 },
    ],
    total: 88_000,
    status: "Preparing",
    createdAt: "12:33",
    updatedAt: "12:35",
  },
  {
    id: "ORD-1023",
    outletId: "gading-serpong",
    reference: "Table 3",
    channel: "Dine-in",
    items: [
      { productId: "p-rice-bowl", name: "Rice Bowl Sambal Matah", qty: 1, price: 45_000 },
      { productId: "p-lychee-tea", name: "Lychee Tea", qty: 1, price: 24_000 },
    ],
    total: 69_000,
    status: "Ready",
    createdAt: "12:21",
    updatedAt: "12:31",
  },
  {
    id: "ORD-1022",
    outletId: "gading-serpong",
    reference: "Takeaway #17",
    channel: "Takeaway",
    items: [{ productId: "p-caramel-latte", name: "Caramel Latte", qty: 1, price: 38_000 }],
    total: 38_000,
    status: "Completed",
    createdAt: "12:10",
    updatedAt: "12:16",
  },
  {
    id: "ORD-1021",
    outletId: "gading-serpong",
    reference: "Table 5",
    channel: "Dine-in",
    items: [
      { productId: "p-cappuccino", name: "Cappuccino", qty: 2, price: 33_000 },
      { productId: "p-pisang-goreng", name: "Pisang Goreng Keju", qty: 1, price: 22_000 },
    ],
    total: 88_000,
    status: "Completed",
    createdAt: "11:52",
    updatedAt: "12:04",
  },
  {
    id: "ORD-1020",
    outletId: "gading-serpong",
    reference: "ShopeeFood SF-8812",
    channel: "Delivery",
    items: [{ productId: "p-chicken-sandwich", name: "Chicken Sandwich", qty: 1, price: 42_000 }],
    total: 42_000,
    status: "Cancelled",
    createdAt: "11:30",
    updatedAt: "11:36",
    note: "Cancelled by customer",
  },
  {
    id: "ORD-2051",
    outletId: "alam-sutera",
    reference: "Table 2",
    channel: "Dine-in",
    items: [{ productId: "p-kopi-susu", name: "Kopi Susu Gula Aren", qty: 2, price: 28_000 }],
    total: 56_000,
    status: "Preparing",
    createdAt: "12:36",
    updatedAt: "12:37",
  },
];

/* ---------------- Devices ---------------- */

export const initialDevices: Device[] = [
  { id: "dev-printer", name: "Receipt Printer", type: "printer", status: "Connected", detail: "Bluetooth thermal printer 58mm", outletId: "gading-serpong", lastSeen: "Just now" },
  { id: "dev-drawer", name: "Cash Drawer", type: "drawer", status: "Connected", detail: "Opens with printer kick signal", outletId: "gading-serpong", lastSeen: "Just now" },
  { id: "dev-qr", name: "QR Display", type: "qr", status: "Active", detail: "Customer-facing QRIS stand", outletId: "gading-serpong", lastSeen: "2 min ago" },
  { id: "dev-pos", name: "POS Device", type: "pos", status: "Online", detail: "Android POS, app version 5.2.0", outletId: "gading-serpong", lastSeen: "Just now" },
  { id: "dev-as-printer", name: "Receipt Printer", type: "printer", status: "Connected", detail: "Bluetooth thermal printer 58mm", outletId: "alam-sutera", lastSeen: "Just now" },
  { id: "dev-as-qr", name: "QR Display", type: "qr", status: "Active", detail: "Customer-facing QRIS stand", outletId: "alam-sutera", lastSeen: "5 min ago" },
  { id: "dev-as-pos", name: "POS Device", type: "pos", status: "Online", detail: "Android tablet, app version 5.2.0", outletId: "alam-sutera", lastSeen: "Just now" },
];

export const troubleshootingSteps: Record<Device["type"], string[]> = {
  printer: ["Check the printer is switched on and has paper", "Make sure Bluetooth is enabled on this device", "Reconnect the printer", "Print a test receipt"],
  drawer: ["Check the drawer cable is plugged into the printer", "Make sure the drawer is not locked", "Send an open-drawer signal"],
  qr: ["Check the QR stand is visible to customers", "Confirm the QR belongs to this outlet", "Run a Rp 1 test payment check"],
  pos: ["Check internet connection", "Sync transactions with Livin Merchant", "Restart the Livin Merchant app if needed"],
};

/* ---------------- Inventory history (seed) ---------------- */

export const initialMovements: InventoryMovement[] = [
  { id: "MV-S5", itemId: "i-milk", itemName: "Fresh Milk", itemKind: "ingredient", type: "Stock In", quantity: 20, unit: "L", outletId: "gading-serpong", date: "2026-09-26", time: "06:55", note: "Top-up from CV Susu Segar Lembang", by: "Rina" },
  { id: "MV-S4", itemId: "p-croissant", itemName: "Croissant", itemKind: "product", type: "Damaged", quantity: -3, unit: "pcs", outletId: "gading-serpong", date: "2026-09-25", time: "21:40", note: "Unsold at closing", by: "Dimas" },
  { id: "MV-S3", itemId: "p-chicken-sandwich", itemName: "Chicken Sandwich", itemKind: "product", type: "Transfer", quantity: -6, unit: "pcs", outletId: "gading-serpong", date: "2026-09-25", time: "10:12", note: "To Alam Sutera", by: "Dimas" },
  { id: "MV-S2", itemId: "p-croissant", itemName: "Croissant", itemKind: "product", type: "Stock In", quantity: 40, unit: "pcs", outletId: "gading-serpong", date: "2026-09-23", time: "06:30", note: "PO-0922-002 Roti Artisan", by: "Rina" },
  { id: "MV-S1", itemId: "i-beans", itemName: "Coffee Beans (House Blend)", itemKind: "ingredient", type: "Adjustment", quantity: -0.4, unit: "kg", outletId: "gading-serpong", date: "2026-09-21", time: "22:05", note: "Weekly stock count", by: "Dimas" },
];
