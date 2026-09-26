import { useCallback, useMemo, type ReactNode } from "react";
import type { Employee, Product, Promotion, Transaction, TransactionStatus } from "@/types";
import { initialProducts, productById } from "@/data/products";
import { initialEmployees, cashierOnShift } from "@/data/employees";
import { initialPromotions } from "@/data/promotions";
import { initialNotifications } from "@/data/notifications";
import { getSeedTransactions, invoiceId } from "@/data/transactions";
import { DEMO_NOW, DEMO_TODAY } from "@/data/merchant";
import { formatRupiah } from "@/utils/format";
import { parseISODate } from "@/utils/format";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useSession } from "@/hooks/useApp";
import { STORAGE_KEYS } from "@/utils/storage";
import { DataContext, type DataState, type NewSaleInput } from "./contexts";

const toMinutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
const toTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60) % 24).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

/**
 * New sales use the real clock when it is later than the demo's "now",
 * otherwise they continue one minute after the latest transaction so ordering stays natural.
 */
function nextSaleTime(latest: Transaction | undefined) {
  const now = new Date();
  const realMinutes = now.getHours() * 60 + now.getMinutes();
  const floor = Math.max(toMinutes(DEMO_NOW), latest ? toMinutes(latest.time) + 1 : 0);
  return toTime(Math.min(Math.max(realMinutes, floor), 23 * 60 + 59));
}

export function DataProvider({ children, persist }: { children: ReactNode; persist: boolean }) {
  const { outletId, merchant } = useSession();

  const [products, setProducts] = usePersistentState<Product[]>(STORAGE_KEYS.products, initialProducts, persist);
  const [employees, setEmployees] = usePersistentState<Employee[]>(STORAGE_KEYS.employees, initialEmployees, persist);
  const [promotions, setPromotions] = usePersistentState<Promotion[]>(STORAGE_KEYS.promotions, initialPromotions, persist);
  const [sessionTransactions, setSessionTransactions] = usePersistentState<Transaction[]>(
    STORAGE_KEYS.transactions,
    [],
    persist,
  );
  const [statusOverrides, setStatusOverrides] = usePersistentState<Record<string, TransactionStatus>>(
    STORAGE_KEYS.refunds,
    {},
    persist,
  );
  const [claimedMissions, setClaimedMissions] = usePersistentState<string[]>(STORAGE_KEYS.claimedMissions, [], persist);
  const [readNotifications, setReadNotifications] = usePersistentState<string[]>(
    STORAGE_KEYS.notificationsRead,
    [],
    persist,
  );
  const [uploadedDocs, setUploadedDocs] = usePersistentState<string[]>(STORAGE_KEYS.profileDocs, [], persist);

  const transactionsFor = useCallback(
    (id: string) => {
      const seed = getSeedTransactions(id);
      const extra = sessionTransactions.filter((t) => t.outletId === id);
      const merged = extra.length ? [...extra, ...seed].sort((a, b) => b.timestamp - a.timestamp) : seed;
      const overridden = Object.keys(statusOverrides);
      if (!overridden.length) return merged;
      return merged.map((t) => (statusOverrides[t.id] ? { ...t, status: statusOverrides[t.id] } : t));
    },
    [sessionTransactions, statusOverrides],
  );

  const transactions = useMemo(() => transactionsFor(outletId), [transactionsFor, outletId]);

  const statusOf = useCallback(
    (t: Transaction) => statusOverrides[t.id] ?? t.status,
    [statusOverrides],
  );

  const latestSettlement = useMemo(
    () => getSeedTransactions("gading-serpong").find((t) => t.type === "settlement"),
    [],
  );

  const notifications = useMemo(
    () =>
      initialNotifications.map((n) => ({
        ...n,
        message: n.message.replace("{settlement}", formatRupiah(latestSettlement?.amount ?? 0)),
        read: n.read || readNotifications.includes(n.id),
      })),
    [readNotifications, latestSettlement],
  );

  const saveProduct = useCallback(
    (product: Product) =>
      setProducts((prev) =>
        prev.some((p) => p.id === product.id)
          ? prev.map((p) => (p.id === product.id ? product : p))
          : [product, ...prev],
      ),
    [setProducts],
  );

  const deleteProduct = useCallback(
    (id: string) => setProducts((prev) => prev.filter((p) => p.id !== id)),
    [setProducts],
  );

  const adjustStock = useCallback(
    (id: string, delta: number) =>
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p))),
    [setProducts],
  );

  const saveEmployee = useCallback(
    (employee: Employee) =>
      setEmployees((prev) =>
        prev.some((e) => e.id === employee.id)
          ? prev.map((e) => (e.id === employee.id ? employee : e))
          : [...prev, employee],
      ),
    [setEmployees],
  );

  const savePromotion = useCallback(
    (promotion: Promotion) =>
      setPromotions((prev) =>
        prev.some((p) => p.id === promotion.id)
          ? prev.map((p) => (p.id === promotion.id ? promotion : p))
          : [promotion, ...prev],
      ),
    [setPromotions],
  );

  const recordSale = useCallback(
    (input: NewSaleInput): Transaction => {
      const current = transactionsFor(outletId);
      const todaySales = current.filter((t) => t.type === "sale" && t.date === DEMO_TODAY);
      const time = nextSaleTime(current.find((t) => t.date === DEMO_TODAY));
      const date = parseISODate(DEMO_TODAY);
      date.setHours(Number(time.slice(0, 2)), Number(time.slice(3, 5)), new Date().getSeconds());

      const sale: Transaction = {
        id: invoiceId(DEMO_TODAY, todaySales.length + 1),
        type: "sale",
        outletId,
        date: DEMO_TODAY,
        time,
        timestamp: date.getTime(),
        amount: input.total,
        method: input.method,
        status: "Completed",
        items: input.items.map(({ productId, qty }) => {
          const product = products.find((p) => p.id === productId) ?? productById.get(productId)!;
          return { productId, name: product.name, qty, price: product.price };
        }),
        cashier: merchant.id === "kopi-nusantara" ? cashierOnShift[outletId] ?? "Owner" : "Demo Cashier",
        discount: input.discount || undefined,
        tax: input.tax || undefined,
        service: input.service || undefined,
        note: input.note || undefined,
        customerId: input.method === "Cash" ? undefined : `CUST-${1000 + Math.floor(Math.random() * 999)}`,
        isNew: true,
      };

      setSessionTransactions((prev) => [sale, ...prev]);
      setProducts((prev) =>
        prev.map((p) => {
          const line = input.items.find((i) => i.productId === p.id);
          return line ? { ...p, stock: Math.max(0, p.stock - line.qty) } : p;
        }),
      );
      return sale;
    },
    [transactionsFor, outletId, products, merchant.id, setSessionTransactions, setProducts],
  );

  const refundTransaction = useCallback(
    (id: string) => {
      const original = transactionsFor(outletId).find((t) => t.id === id);
      if (!original) return;
      const now = new Date();
      const time = nextSaleTime(transactionsFor(outletId).find((t) => t.date === DEMO_TODAY));
      const date = parseISODate(DEMO_TODAY);
      date.setHours(Number(time.slice(0, 2)), Number(time.slice(3, 5)), now.getSeconds());
      const refund: Transaction = {
        ...original,
        id: original.id.replace("INV", "REF"),
        type: "refund",
        date: DEMO_TODAY,
        time,
        timestamp: date.getTime(),
        status: "Completed",
        reference: original.id,
        note: "Refund approved by owner",
        isNew: true,
      };
      setStatusOverrides((prev) => ({ ...prev, [id]: "Refunded" }));
      setSessionTransactions((prev) => [refund, ...prev]);
    },
    [transactionsFor, outletId, setStatusOverrides, setSessionTransactions],
  );

  const claimMission = useCallback(
    (id: string) => setClaimedMissions((prev) => (prev.includes(id) ? prev : [...prev, id])),
    [setClaimedMissions],
  );

  const markNotificationRead = useCallback(
    (id: string) => setReadNotifications((prev) => (prev.includes(id) ? prev : [...prev, id])),
    [setReadNotifications],
  );

  const markAllNotificationsRead = useCallback(
    () => setReadNotifications(initialNotifications.map((n) => n.id)),
    [setReadNotifications],
  );

  const uploadDocument = useCallback(
    (name: string) => setUploadedDocs((prev) => (prev.includes(name) ? prev : [...prev, name])),
    [setUploadedDocs],
  );

  // Sessions sales that are still "completed" feed growth and home metrics.
  const sessionSales = useMemo(
    () => sessionTransactions.filter((t) => t.type === "sale" && (statusOverrides[t.id] ?? t.status) === "Completed"),
    [sessionTransactions, statusOverrides],
  );

  const value = useMemo<DataState>(
    () => ({
      products,
      employees,
      promotions,
      notifications,
      transactions,
      transactionsFor,
      sessionSales,
      claimedMissions,
      uploadedDocs,
      saveProduct,
      deleteProduct,
      adjustStock,
      saveEmployee,
      savePromotion,
      recordSale,
      refundTransaction,
      statusOf,
      claimMission,
      markNotificationRead,
      markAllNotificationsRead,
      uploadDocument,
    }),
    [
      products,
      employees,
      promotions,
      notifications,
      transactions,
      transactionsFor,
      sessionSales,
      claimedMissions,
      uploadedDocs,
      saveProduct,
      deleteProduct,
      adjustStock,
      saveEmployee,
      savePromotion,
      recordSale,
      refundTransaction,
      statusOf,
      claimMission,
      markNotificationRead,
      markAllNotificationsRead,
      uploadDocument,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
