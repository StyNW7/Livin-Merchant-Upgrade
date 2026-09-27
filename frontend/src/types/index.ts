import type { LucideIcon } from "lucide-react";

/* =========================================================
 * Session
 * ======================================================= */

export type AppMode = "none" | "guest" | "merchant";

/** Presentation scenarios: A healthy, B almost financing-ready, C operational issue. */
export type ScenarioId = "A" | "B" | "C";

export interface Merchant {
  id: string;
  name: string;
  owner: string;
  ownerFirstName: string;
  initials: string;
  businessType: string;
  location: string;
  memberSince: string;
  businessAge: string;
  verificationStatus: "Verified" | "Pending";
  merchantId: string;
  phone: string;
  email: string;
  address: string;
  accountNumber: string;
}
/** Kept for readability in older components. */
export type MerchantProfile = Merchant;

/* =========================================================
 * Catalog & inventory
 * ======================================================= */

export type ProductCategory = "Coffee" | "Non-Coffee" | "Food" | "Snacks";

export interface Category {
  id: ProductCategory;
  description: string;
}

export interface ProductVariant {
  id: string;
  label: string;
  priceDelta: number;
}

export interface ProductAddon {
  id: string;
  label: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  costPrice: number;
  stock: number;
  lowStockThreshold: number;
  sku: string;
  active: boolean;
  /** Weight used by the data generator to mimic real popularity. */
  popularity: number;
  hasVariants?: boolean;
  hasAddons?: boolean;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  stock: number;
  reorderLevel: number;
  dailyUsage: number;
  costPerUnit: number;
  supplierId: string;
}

export type MovementType = "Stock In" | "Stock Out" | "Adjustment" | "Damaged" | "Transfer" | "Sale" | "Purchase";

export interface InventoryMovement {
  id: string;
  itemId: string;
  itemName: string;
  itemKind: "product" | "ingredient";
  type: MovementType;
  quantity: number;
  unit: string;
  outletId: string;
  date: string;
  time: string;
  note: string;
  by: string;
}

/* =========================================================
 * Transactions
 * ======================================================= */

export type PaymentMethod = "QRIS" | "Debit" | "Credit" | "Cash" | "Transfer" | "Other";

export type SalesChannel = "Dine-in" | "Takeaway" | "Delivery";

export type TransactionType = "sale" | "settlement" | "refund";

export type TransactionStatus = "Completed" | "Refunded" | "Partially Refunded" | "Pending" | "Processing";

export interface TransactionItem {
  productId: string;
  name: string;
  qty: number;
  /** Unit price including variant and add-ons */
  price: number;
  variant?: string;
  addons?: string[];
  note?: string;
}
export type LineItem = TransactionItem;

export interface PaymentSplit {
  method: PaymentMethod;
  amount: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  outletId: string;
  /** ISO date string yyyy-mm-dd */
  date: string;
  /** HH:mm */
  time: string;
  timestamp: number;
  amount: number;
  method: PaymentMethod | "Bank Transfer";
  payments?: PaymentSplit[];
  status: TransactionStatus;
  items: TransactionItem[];
  cashier: string;
  channel?: SalesChannel;
  customerId?: string;
  orderRef?: string;
  subtotal?: number;
  discount?: number;
  tax?: number;
  service?: number;
  cashReceived?: number;
  note?: string;
  reference?: string;
  refundedAmount?: number;
  refundReason?: string;
  isNew?: boolean;
}

export interface DailyPoint {
  date: string;
  label: string;
  revenue: number;
  transactions: number;
}

export interface Settlement {
  id: string;
  date: string;
  time: string;
  salesDate: string;
  gross: number;
  fee: number;
  net: number;
  transactions: number;
  status: "Completed" | "Processing" | "Scheduled";
  account: string;
  breakdown: { outletId: string; gross: number; fee: number; net: number; transactions: number }[];
}
export type SettlementRecord = Settlement;

/* =========================================================
 * Operations
 * ======================================================= */

export interface Outlet {
  id: string;
  area: string;
  status: "Active" | "Planned";
  address: string;
  staffCount: number;
  openedAt: string;
  hours: string;
  manager: string;
}

export type EmployeeRole = "Owner" | "Manager" | "Cashier";

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  outletId: string;
  active: boolean;
  phone: string;
  joinedAt: string;
  shift: { label: string; start: string; end: string; days: string };
  attendance: { status: "Clocked In" | "Clocked Out" | "Not Started" | "Off"; clockIn?: string; clockOut?: string };
  permissions: string[];
}

export type OrderStatus = "New" | "Preparing" | "Ready" | "Completed" | "Cancelled";

export interface Order {
  id: string;
  outletId: string;
  reference: string;
  channel: SalesChannel;
  items: TransactionItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  invoiceId?: string;
  note?: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  contactName: string;
  phone: string;
  email: string;
  products: string[];
  lastPurchase: number;
  lastPurchaseDate: string;
  paymentStatus: "Paid" | "Unpaid" | "Partially Paid";
  outstanding: number;
  paymentTerms: string;
  notes: string;
}

export type PurchaseOrderStatus = "Draft" | "Pending" | "Received" | "Paid" | "Cancelled";

export interface PurchaseOrderLine {
  ingredientId?: string;
  name: string;
  qty: number;
  unit: string;
  unitPrice: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  outletId: string;
  lines: PurchaseOrderLine[];
  total: number;
  status: PurchaseOrderStatus;
  createdAt: string;
  expectedAt: string;
  note?: string;
}

export type ExpenseCategory =
  | "Rent"
  | "Ingredients"
  | "Salary"
  | "Utilities"
  | "Marketing"
  | "Delivery"
  | "Equipment"
  | "Others";

export interface Expense {
  id: string;
  outletId: string;
  category: ExpenseCategory;
  title: string;
  amount: number;
  method: "Cash" | "Transfer" | "Debit" | "Livin' by Mandiri";
  date: string;
  note?: string;
  attachment?: string;
  supplierId?: string;
}

export interface Device {
  id: string;
  name: string;
  type: "printer" | "drawer" | "qr" | "pos";
  status: "Connected" | "Active" | "Online" | "Disconnected";
  detail: string;
  outletId: string;
  lastSeen: string;
}

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  category: "Finance" | "Operations" | "Campaign" | "Staff" | "Growth";
  time?: string;
  note?: string;
  link?: string;
  done?: boolean;
}

/* =========================================================
 * Customers & marketing
 * ======================================================= */

export interface Customer {
  id: string;
  label: string;
  segment: "Loyal" | "Regular" | "New" | "At Risk";
  visits: number;
  totalSpending: number;
  lastVisit: string;
  favorite: string;
  firstVisit: string;
  averageSpend: number;
  preferredTime: string;
}

export type PromotionStatus = "Active" | "Scheduled" | "Ended" | "Draft" | "Paused";

export interface Promotion {
  id: string;
  name: string;
  period: string;
  hours: string;
  benefit: string;
  status: PromotionStatus;
  revenue: number;
  transactions: number;
  redemptions: number;
  type: "Percentage" | "Bundle" | "Fixed";
  products: string;
  goal: string;
  endsOn?: string;
}

export interface PromotionTemplate {
  id: string;
  title: string;
  description: string;
  suggestion: Omit<Promotion, "id" | "status" | "revenue" | "transactions" | "redemptions">;
  icon: LucideIcon;
}

export interface LoyaltyProgram {
  id: string;
  name: string;
  type: "Repeat Visit" | "Transaction Milestone" | "Voucher";
  rule: string;
  reward: string;
  members: number;
  redemptions: number;
  status: "Active" | "Paused";
}

/* =========================================================
 * Notifications
 * ======================================================= */

export type NotificationCategory = "Urgent" | "Growth" | "Finance" | "Operations" | "Campaign" | "System";

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

/* =========================================================
 * Growth engine
 * ======================================================= */

export type GrowthStageId = "BUILD" | "GROW" | "SCALE" | "THRIVE";

export interface GrowthMetric {
  id: string;
  label: string;
  score: number;
  previous: number;
  description: string;
  tip: string;
}
export type ScoreFactor = GrowthMetric;

export interface GrowthScore {
  score: number;
  previous: number;
  stage: GrowthStageId;
  nextStage: GrowthStageId | null;
  status: string;
  metrics: GrowthMetric[];
  history: { month: string; score: number }[];
}

export interface GrowthStage {
  id: GrowthStageId;
  title: string;
  description: string;
  range: string;
  min: number;
  unlocks: string[];
}

export type MissionCategory = "Transaction" | "Revenue" | "Profile" | "Customer" | "Operations" | "Learning";

export interface GrowthMission {
  id: string;
  title: string;
  category: MissionCategory;
  progress: number;
  status: "In Progress" | "Completed";
  reason: string;
  impact: string;
  impactPoints: number;
  current: string;
  target: string;
  deadline: string;
  steps: string[];
  action?: { label: string; to: string };
}

export interface BusinessInsight {
  id: string;
  category: "Revenue" | "Products" | "Customers" | "Time" | "Outlet" | "Payments" | "Operations";
  title: string;
  detail: string;
  recommendation: string;
  link?: string;
  trend: "up" | "down" | "neutral";
  metric: string;
  chart: { label: string; value: number; highlight?: boolean }[];
  chartKind: "bar" | "line";
  valueFormat: "rupiah" | "percent" | "count";
}
export type Insight = BusinessInsight;

export type ReadinessLevel = "Strong" | "Good" | "Needs Improvement";

export interface ReadinessFactor {
  id: string;
  label: string;
  level: ReadinessLevel;
  value: number;
  detail: string;
}

export interface NextAction {
  id: string;
  title: string;
  priority: "High" | "Medium" | "Operational";
  why: string;
  cta: string;
  to: string;
}

export interface FinancingRecommendation {
  id: string;
  name: string;
  tagline: string;
  purpose: string;
  rangeMin: number;
  rangeMax: number;
  tenor: string;
  icon: LucideIcon;
  reason: string;
  requirements: string[];
  readinessFactors: { label: string; met: boolean }[];
  recommended: boolean;
  matchLevel: "High Match" | "Good Match" | "Explore";
}
export type FinancingProduct = FinancingRecommendation;

/* =========================================================
 * Learning & programs
 * ======================================================= */

export interface LearningModule {
  id: string;
  title: string;
  minutes: number;
  summary: string;
  lessons: { title: string; body: string }[];
  missionId?: string;
}

export interface MerchantProgram {
  id: string;
  section: "Merchant Programs" | "Growth Challenges" | "Livin'poin" | "Business Events" | "Education" | "Community";
  title: string;
  description: string;
  status: "Active" | "Upcoming" | "Registration Open" | "Joined";
  date?: string;
  /** ISO start date; joining adds the program to the Business Calendar. */
  startsOn?: string;
  time?: string;
}

/* =========================================================
 * Cashier
 * ======================================================= */

export interface CartLine {
  key: string;
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
  basePrice: number;
  variant?: string;
  addons: string[];
  note?: string;
  manualPrice?: boolean;
}
/** @deprecated kept for compatibility */
export interface CartItem {
  productId: string;
  qty: number;
}

export interface HeldOrder {
  id: string;
  reference: string;
  lines: CartLine[];
  total: number;
  heldAt: string;
  customerId?: string;
  channel: SalesChannel;
}

/* =========================================================
 * Preferences
 * ======================================================= */

export interface AppSettings {
  /** Print the receipt as soon as a payment succeeds. */
  autoPrint: boolean;
  /** Last line printed on every receipt. */
  receiptFooter: string;
  /** Vibrate on key cashier moments (devices that support it). */
  haptics: boolean;
  /** Show stock alerts in the notification center. */
  lowStockAlerts: boolean;
  /** Add yesterday's sales summary to the notification center. */
  dailySummary: boolean;
  /** Daily revenue goal per outlet shown on Home. */
  dailyGoal: number;
}

export interface SupportTicket {
  id: string;
  topic: string;
  detail: string;
  createdAt: string;
  status: "Received" | "In Review" | "Resolved";
}

export interface CustomerVoucher {
  customerId: string;
  amount: number;
  sentAt: string;
  reason: "Thank-you" | "Come-back";
  /** Invoice where the voucher was redeemed. */
  usedOn?: string;
}
