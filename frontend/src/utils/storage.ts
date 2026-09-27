const PREFIX = "livin-merchant:";

export const STORAGE_KEYS = {
  onboarded: "onboarded",
  mode: "mode",
  outlet: "outlet",
  cart: "cart",
  claimedMissions: "claimed-missions",
  products: "products",
  employees: "employees",
  promotions: "promotions",
  transactions: "transactions",
  refunds: "refunds",
  notificationsRead: "notifications-read",
  consent: "insight-consent",
  profileDocs: "profile-docs",
  settings: "settings",
  tickets: "support-tickets",
  vouchers: "customer-vouchers",
  helpful: "helpful-articles",
  scenario: "scenario",
  ingredients: "ingredients",
  movements: "movements",
  orders: "orders",
  heldOrders: "held-orders",
  favorites: "favorites",
  expenses: "expenses",
  suppliers: "suppliers",
  purchaseOrders: "purchase-orders",
  loyalty: "loyalty",
  learning: "learning",
  programs: "programs",
  events: "events",
  devices: "devices",
  sessions: "sessions",
  hints: "hints",
  clearedNotifications: "notifications-cleared",
  customers: "customers-added",
  outletView: "outlet-view",
} as const;

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage may be unavailable (private mode); the app keeps working in memory */
  }
}

export function removeStorage(key: string): void {
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}

export function clearAppStorage(): void {
  try {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => window.localStorage.removeItem(key));
  } catch {
    /* ignore */
  }
}
