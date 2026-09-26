import type { LucideIcon } from "lucide-react";

export type AppMode = "none" | "guest" | "merchant";

export type GrowthStageId = "BUILD" | "GROW" | "SCALE" | "THRIVE";

export interface MerchantProfile {
  id: string;
  name: string;
  owner: string;
  ownerFirstName: string;
  initials: string;
  businessType: string;
  location: string;
  memberSince: string;
  businessAge: string;
  verificationStatus: "Verified" | "Pending" | "Demo";
  profileCompletion: number;
  missingItems: string[];
  merchantId: string;
  phone: string;
  email: string;
  address: string;
  npwpStatus: string;
  nibStatus: string;
  accountNumber: string;
}

export type ProductCategory = "Coffee" | "Non-Coffee" | "Food" | "Snacks";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  lowStockThreshold: number;
  sku: string;
  active: boolean;
  /** Weight used by the data generator to mimic real popularity. */
  popularity: number;
}

export type PaymentMethod = "QRIS" | "Debit" | "Credit" | "Cash" | "Other";

export type TransactionType = "sale" | "settlement" | "refund";

export type TransactionStatus = "Completed" | "Refunded" | "Pending" | "Processing";

export interface LineItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  outletId: string;
  /** ISO date string yyyy-mm-dd */
  date: string;
  /** HH:mm */
  time: string;
  /** Unix ms, used for sorting and range filtering */
  timestamp: number;
  amount: number;
  method: PaymentMethod | "Bank Transfer";
  status: TransactionStatus;
  items: LineItem[];
  cashier: string;
  customerId?: string;
  discount?: number;
  tax?: number;
  service?: number;
  note?: string;
  reference?: string;
  /** Marks transactions created during this demo session */
  isNew?: boolean;
}

export interface DailyPoint {
  date: string;
  label: string;
  revenue: number;
  transactions: number;
}

export interface Outlet {
  id: string;
  area: string;
  status: "Active" | "Planned";
  address: string;
  monthlyRevenue: number;
  monthlyTransactions: number;
  staffCount: number;
  performance: number;
  openedAt: string;
  hours: string;
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
  transactionsHandled: number;
}

export interface Customer {
  id: string;
  label: string;
  segment: "Loyal" | "Regular" | "New" | "At Risk";
  transactions: number;
  totalSpending: number;
  lastVisit: string;
  favorite: string;
}

export type PromotionStatus = "Active" | "Scheduled" | "Ended" | "Draft";

export interface Promotion {
  id: string;
  name: string;
  schedule: string;
  benefit: string;
  status: PromotionStatus;
  revenue: number;
  transactions: number;
  redemptions: number;
  type: "Percentage" | "Bundle" | "Fixed";
  products: string;
}

export type NotificationCategory = "Growth" | "Transaction" | "Financing" | "Operational" | "Campaign";

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

export interface ScoreFactor {
  id: string;
  label: string;
  score: number;
  description: string;
  tip: string;
}

export interface GrowthStage {
  id: GrowthStageId;
  title: string;
  description: string;
  range: string;
  unlocks: string[];
}

export interface GrowthMission {
  id: string;
  title: string;
  progress: number;
  status: "In Progress" | "Completed";
  whyItMatters: string;
  outcome: string;
  deadline: string;
  steps: string[];
  metricLabel?: string;
  current?: string;
  target?: string;
  scoreImpact: number;
  action?: { label: string; to: string };
}

export interface Insight {
  id: string;
  category: "Revenue" | "Peak Hour" | "Transaction" | "Customer" | "Product";
  title: string;
  description: string;
  action: string;
  actionLink?: string;
  trend: "up" | "down" | "neutral";
  metric: string;
}

export type ReadinessLevel = "Strong" | "Good" | "Needs Improvement";

export interface ReadinessFactor {
  id: string;
  label: string;
  level: ReadinessLevel;
  value: number;
  detail: string;
}

export interface FinancingProduct {
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

export interface CartItem {
  productId: string;
  qty: number;
}

export interface SettlementRecord {
  id: string;
  date: string;
  period: string;
  gross: number;
  fee: number;
  net: number;
  status: "Completed" | "Processing" | "Scheduled";
  account: string;
}
