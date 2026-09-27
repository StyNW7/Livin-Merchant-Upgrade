import { createContext } from "react";
import type { Celebration } from "@/components/growth/MissionCelebration";
import type {
  AppMode,
  CalendarEvent,
  CartLine,
  Customer,
  Device,
  Employee,
  Expense,
  HeldOrder,
  Ingredient,
  InventoryMovement,
  LoyaltyProgram,
  Merchant,
  MovementType,
  Order,
  OrderStatus,
  PaymentSplit,
  Product,
  Promotion,
  PurchaseOrder,
  SalesChannel,
  ScenarioId,
  Supplier,
  Transaction,
} from "@/types";

/* ---------- Session ---------- */

export interface SessionState {
  mode: AppMode;
  isGuest: boolean;
  isMerchant: boolean;
  onboarded: boolean;
  merchant: Merchant;
  outletId: string;
  outletName: string;
  scenario: ScenarioId;
  insightConsent: boolean;
  online: boolean;
  completeOnboarding: () => void;
  loginAsMerchant: () => void;
  exploreAsGuest: () => void;
  logout: () => void;
  setOutletId: (id: string) => void;
  setScenario: (id: ScenarioId) => void;
  setInsightConsent: (value: boolean) => void;
  hintSeen: (id: string) => boolean;
  dismissHint: (id: string) => void;
  resetDemo: () => void;
}

export const SessionContext = createContext<SessionState | null>(null);

/* ---------- Business data ---------- */

export interface NewSaleInput {
  lines: CartLine[];
  payments: PaymentSplit[];
  channel: SalesChannel;
  orderRef: string;
  customerId?: string;
  subtotal: number;
  discount: number;
  tax: number;
  service: number;
  total: number;
  cashReceived?: number;
  note?: string;
  /** Kitchen order for Orders; false for direct QR payments. */
  createOrder?: boolean;
}

export interface MovementInput {
  itemId: string;
  itemKind: "product" | "ingredient";
  type: MovementType;
  quantity: number;
  note: string;
  targetOutletId?: string;
}

export interface DataState {
  /* catalog & inventory */
  products: Product[];
  ingredients: Ingredient[];
  movements: InventoryMovement[];
  favorites: string[];
  saveProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  toggleFavorite: (id: string) => void;
  recordMovement: (input: MovementInput) => void;

  /* transactions */
  transactions: Transaction[];
  transactionsFor: (outletId: string) => Transaction[];
  allTransactions: Record<string, Transaction[]>;
  sessionSales: Transaction[];
  recordSale: (input: NewSaleInput) => Transaction;
  refundTransaction: (id: string, items: { index: number; qty: number }[], reason: string) => number;
  attachCustomer: (transactionId: string, customerId: string) => void;

  /* orders */
  orders: Order[];
  heldOrders: HeldOrder[];
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  holdOrder: (order: HeldOrder) => void;
  removeHeldOrder: (id: string) => void;

  /* finance */
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, "id">) => void;
  deleteExpense: (id: string) => void;
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  createPurchaseOrder: (po: Omit<PurchaseOrder, "id" | "createdAt" | "status">) => PurchaseOrder;
  receivePurchaseOrder: (id: string) => void;
  payPurchaseOrder: (id: string) => void;
  cancelPurchaseOrder: (id: string) => void;
  paySupplierOutstanding: (id: string) => void;
  saveSupplier: (supplier: Supplier) => void;

  /* people */
  employees: Employee[];
  saveEmployee: (employee: Employee) => void;
  customers: Customer[];
  addCustomer: () => Customer;

  /* marketing */
  promotions: Promotion[];
  savePromotion: (promotion: Promotion) => void;
  loyaltyPrograms: LoyaltyProgram[];
  saveLoyaltyProgram: (program: LoyaltyProgram) => void;

  /* growth, learning & programs */
  claimedMissions: string[];
  claimMission: (id: string) => void;
  learningProgress: Record<string, number>;
  completeLesson: (moduleId: string, lessonIndex: number) => void;
  joinedPrograms: string[];
  toggleProgram: (id: string) => void;
  uploadedDocs: string[];
  uploadDocument: (name: string) => void;

  /* operations */
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, "id">) => void;
  toggleEvent: (id: string) => void;
  devices: Device[];
  updateDevice: (device: Device) => void;
  sessions: { id: string; name: string; location: string; lastActive: string; current: boolean }[];
  logoutSession: (id: string) => void;

  /* notifications */
  readNotifications: string[];
  clearedNotifications: string[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (ids: string[]) => void;
  clearReadNotifications: (ids: string[]) => void;
}

export const DataContext = createContext<DataState | null>(null);

/* ---------- Cart ---------- */

export const TAX_RATE = 0.1;
export const SERVICE_RATE = 0.05;

export interface AddLineInput {
  productId: string;
  name: string;
  basePrice: number;
  unitPrice: number;
  variant?: string;
  addons?: string[];
  note?: string;
  qty?: number;
  manualPrice?: boolean;
}

export interface CartState {
  lines: CartLine[];
  discountPercent: number;
  note: string;
  applyTax: boolean;
  applyService: boolean;
  channel: SalesChannel;
  orderRef: string;
  customerId?: string;
  addLine: (input: AddLineInput) => void;
  quickAdd: (productId: string) => void;
  setQty: (key: string, qty: number) => void;
  updateLine: (key: string, patch: Partial<CartLine>) => void;
  removeLine: (key: string) => void;
  clear: () => void;
  loadLines: (lines: CartLine[], meta?: { channel?: SalesChannel; orderRef?: string; customerId?: string }) => void;
  setDiscountPercent: (value: number) => void;
  setNote: (value: string) => void;
  setApplyTax: (value: boolean) => void;
  setApplyService: (value: boolean) => void;
  setChannel: (value: SalesChannel) => void;
  setOrderRef: (value: string) => void;
  setCustomerId: (value?: string) => void;
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
  /** Returns true when the action may continue; shows the Explore Mode gate otherwise. */
  requireAccount: (feature?: string) => boolean;
  confirm: (options: ConfirmOptions) => void;
  /** Asks for the 6-digit transaction PIN before a sensitive action. */
  requirePin: (title: string, onSuccess: () => void) => void;
  openAssistant: () => void;
  /** Celebrates a claimed Growth Mission with the score moving from `from` to `to`. */
  celebrate: (celebration: Celebration) => void;
}

export const UIContext = createContext<UIState | null>(null);
