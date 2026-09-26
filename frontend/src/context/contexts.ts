import { createContext } from "react";
import type {
  AppMode,
  AppNotification,
  CartItem,
  Employee,
  MerchantProfile,
  Product,
  Promotion,
  Transaction,
  TransactionStatus,
} from "@/types";

/* ---------- Session ---------- */

export interface SessionState {
  mode: AppMode;
  isGuest: boolean;
  isMerchant: boolean;
  onboarded: boolean;
  merchant: MerchantProfile;
  outletId: string;
  outletName: string;
  insightConsent: boolean;
  completeOnboarding: () => void;
  loginAsMerchant: () => void;
  exploreAsGuest: () => void;
  logout: () => void;
  setOutletId: (id: string) => void;
  setInsightConsent: (value: boolean) => void;
  resetDemo: () => void;
}

export const SessionContext = createContext<SessionState | null>(null);

/* ---------- Business data ---------- */

export interface NewSaleInput {
  items: { productId: string; qty: number }[];
  method: Transaction["method"];
  discount: number;
  tax: number;
  service: number;
  total: number;
  note?: string;
}

export interface DataState {
  products: Product[];
  employees: Employee[];
  promotions: Promotion[];
  notifications: AppNotification[];
  /** All transactions for the selected outlet, newest first. */
  transactions: Transaction[];
  transactionsFor: (outletId: string) => Transaction[];
  sessionSales: Transaction[];
  claimedMissions: string[];
  uploadedDocs: string[];
  saveProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, delta: number) => void;
  saveEmployee: (employee: Employee) => void;
  savePromotion: (promotion: Promotion) => void;
  recordSale: (input: NewSaleInput) => Transaction;
  refundTransaction: (id: string) => void;
  statusOf: (transaction: Transaction) => TransactionStatus;
  claimMission: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  uploadDocument: (name: string) => void;
}

export const DataContext = createContext<DataState | null>(null);

/* ---------- Cart ---------- */

export const TAX_RATE = 0.1;
export const SERVICE_RATE = 0.05;

export interface CartState {
  items: CartItem[];
  discountPercent: number;
  note: string;
  applyTax: boolean;
  applyService: boolean;
  add: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  setDiscountPercent: (value: number) => void;
  setNote: (value: string) => void;
  setApplyTax: (value: boolean) => void;
  setApplyService: (value: boolean) => void;
  count: number;
  subtotal: number;
  discount: number;
  tax: number;
  service: number;
  total: number;
}

export const CartContext = createContext<CartState | null>(null);

/* ---------- UI ---------- */

export type ToastTone = "success" | "info" | "warning" | "error";

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  onConfirm: () => void;
}

export interface UIState {
  toast: (message: string, tone?: ToastTone) => void;
  /** Returns true when the action may continue; shows the guest gate otherwise. */
  requireAccount: (feature?: string) => boolean;
  confirm: (options: ConfirmOptions) => void;
}

export const UIContext = createContext<UIState | null>(null);
