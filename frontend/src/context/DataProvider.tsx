import { useCallback, useMemo, type ReactNode } from "react";
import type {
  AppSettings,
  CalendarEvent,
  CustomerVoucher,
  SupportTicket,
  Customer,
  Device,
  Employee,
  Expense,
  HeldOrder,
  Ingredient,
  InventoryMovement,
  LoyaltyProgram,
  Order,
  OrderStatus,
  Product,
  Promotion,
  PurchaseOrder,
  Supplier,
  Transaction,
} from "@/types";
import { DEFAULT_FAVORITES, initialIngredients, initialProducts } from "@/data/products";
import { initialEmployees } from "@/data/employees";
import { initialLoyaltyPrograms, initialPromotions } from "@/data/promotions";
import { customers as seedCustomers } from "@/data/customers";
import { initialDevices, initialExpenses, initialMovements, initialOrders, initialPurchaseOrders, initialSuppliers } from "@/data/operations";
import { initialEvents } from "@/data/learning";
import { initialSessions } from "@/data/support";
import { scenarios } from "@/data/scenarios";
import { DEFAULT_SETTINGS, VOUCHER_AMOUNT } from "@/data/settings";
import { getSeedTransactions, invoiceId, minutesToTime, timeToMinutes, timestampOf } from "@/data/transactions";
import { ACTIVE_OUTLET_IDS, outletArea } from "@/data/outlets";
import { DEMO_NOW, DEMO_TODAY } from "@/data/merchant";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useSession } from "@/hooks/useApp";
import { STORAGE_KEYS } from "@/utils/storage";
import { DataContext, type DataState, type MovementInput, type NewSaleInput } from "./contexts";

const pad = (n: number, size = 2) => String(n).padStart(size, "0");
const MMDD = DEMO_TODAY.slice(5, 7) + DEMO_TODAY.slice(8, 10);

/**
 * The demo clock: new activity uses the real time when it is later than the demo's "now",
 * otherwise it continues one minute after the latest activity so ordering stays natural.
 */
function nextTime(latestTime?: string) {
  const now = new Date();
  const real = now.getHours() * 60 + now.getMinutes();
  const floor = Math.max(timeToMinutes(DEMO_NOW), latestTime ? timeToMinutes(latestTime) + 1 : 0);
  return minutesToTime(Math.min(Math.max(real, floor), 23 * 60 + 59));
}

type TxPatch = Partial<Pick<Transaction, "status" | "refundedAmount" | "refundReason" | "customerId">>;

export function DataProvider({ children, persist }: { children: ReactNode; persist: boolean }) {
  const { outletId, scenario, merchant } = useSession();
  const ns = (key: string) => `${scenario}.${key}`;
  const scenarioConfig = scenarios[scenario];

  const seedProducts = useMemo(
    () => initialProducts.map((p) => ({ ...p, stock: scenarioConfig.stockOverrides[p.id] ?? p.stock })),
    [scenarioConfig],
  );

  const [products, setProducts] = usePersistentState<Product[]>(ns(STORAGE_KEYS.products), seedProducts, persist);
  const [ingredients, setIngredients] = usePersistentState<Ingredient[]>(ns(STORAGE_KEYS.ingredients), initialIngredients, persist);
  const [movements, setMovements] = usePersistentState<InventoryMovement[]>(ns(STORAGE_KEYS.movements), initialMovements, persist);
  const [favorites, setFavorites] = usePersistentState<string[]>(ns(STORAGE_KEYS.favorites), DEFAULT_FAVORITES, persist);
  const [sessionTx, setSessionTx] = usePersistentState<Transaction[]>(ns(STORAGE_KEYS.transactions), [], persist);
  const [txPatches, setTxPatches] = usePersistentState<Record<string, TxPatch>>(ns(STORAGE_KEYS.refunds), {}, persist);
  const [orders, setOrders] = usePersistentState<Order[]>(ns(STORAGE_KEYS.orders), initialOrders, persist);
  const [heldOrders, setHeldOrders] = usePersistentState<HeldOrder[]>(ns(STORAGE_KEYS.heldOrders), [], persist);
  const [expenses, setExpenses] = usePersistentState<Expense[]>(ns(STORAGE_KEYS.expenses), initialExpenses, persist);
  const [suppliers, setSuppliers] = usePersistentState<Supplier[]>(ns(STORAGE_KEYS.suppliers), initialSuppliers, persist);
  const [purchaseOrders, setPurchaseOrders] = usePersistentState<PurchaseOrder[]>(
    ns(STORAGE_KEYS.purchaseOrders),
    initialPurchaseOrders,
    persist,
  );
  const [employees, setEmployees] = usePersistentState<Employee[]>(ns(STORAGE_KEYS.employees), initialEmployees, persist);
  const [addedCustomers, setAddedCustomers] = usePersistentState<Customer[]>(ns(STORAGE_KEYS.customers), [], persist);
  const [promotions, setPromotions] = usePersistentState<Promotion[]>(ns(STORAGE_KEYS.promotions), initialPromotions, persist);
  const [loyaltyPrograms, setLoyaltyPrograms] = usePersistentState<LoyaltyProgram[]>(
    ns(STORAGE_KEYS.loyalty),
    initialLoyaltyPrograms,
    persist,
  );
  const [claimedMissions, setClaimedMissions] = usePersistentState<string[]>(ns(STORAGE_KEYS.claimedMissions), [], persist);
  const [learningProgress, setLearningProgress] = usePersistentState<Record<string, number>>(ns(STORAGE_KEYS.learning), {}, persist);
  const [joinedPrograms, setJoinedPrograms] = usePersistentState<string[]>(ns(STORAGE_KEYS.programs), [], persist);
  const [uploadedDocs, setUploadedDocs] = usePersistentState<string[]>(ns(STORAGE_KEYS.profileDocs), [], persist);
  const [events, setEvents] = usePersistentState<CalendarEvent[]>(ns(STORAGE_KEYS.events), initialEvents, persist);
  const [storedDevices, setDevices] = usePersistentState<Device[]>(ns(STORAGE_KEYS.devices), initialDevices, persist);
  // Devices added to the seed later still appear for merchants with saved data.
  const devices = useMemo(
    () => [...storedDevices, ...initialDevices.filter((d) => !storedDevices.some((s) => s.id === d.id))],
    [storedDevices],
  );
  const [sessions, setSessions] = usePersistentState(ns(STORAGE_KEYS.sessions), initialSessions, persist);
  const [storedSettings, setSettings] = usePersistentState<AppSettings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS, persist);
  const settings = useMemo(() => ({ ...DEFAULT_SETTINGS, ...storedSettings }), [storedSettings]);
  const [tickets, setTickets] = usePersistentState<SupportTicket[]>(STORAGE_KEYS.tickets, [], persist);
  const [helpfulArticles, setHelpfulArticles] = usePersistentState<string[]>(STORAGE_KEYS.helpful, [], persist);
  const [vouchers, setVouchers] = usePersistentState<CustomerVoucher[]>(ns(STORAGE_KEYS.vouchers), [], persist);
  const [readNotifications, setReadNotifications] = usePersistentState<string[]>(ns(STORAGE_KEYS.notificationsRead), [], persist);
  const [clearedNotifications, setClearedNotifications] = usePersistentState<string[]>(
    ns(STORAGE_KEYS.clearedNotifications),
    [],
    persist,
  );

  /* ------------------------------------------------------------------ transactions */

  const transactionsFor = useCallback(
    (id: string) => {
      const seed = getSeedTransactions(id, scenario);
      const extra = sessionTx.filter((t) => t.outletId === id);
      const merged = extra.length ? [...extra, ...seed].sort((a, b) => b.timestamp - a.timestamp) : seed;
      if (!Object.keys(txPatches).length) return merged;
      return merged.map((t) => (txPatches[t.id] ? { ...t, ...txPatches[t.id] } : t));
    },
    [scenario, sessionTx, txPatches],
  );

  const allTransactions = useMemo(
    () => Object.fromEntries(ACTIVE_OUTLET_IDS.map((id) => [id, transactionsFor(id)])),
    [transactionsFor],
  );
  const transactions = useMemo(() => allTransactions[outletId] ?? [], [allTransactions, outletId]);

  const sessionSales = useMemo(
    () => sessionTx.filter((t) => t.type === "sale").map((t) => (txPatches[t.id] ? { ...t, ...txPatches[t.id] } : t)),
    [sessionTx, txPatches],
  );

  const logMovement = useCallback(
    (entries: Omit<InventoryMovement, "id" | "date" | "time" | "outletId" | "by">[], time: string) =>
      setMovements((prev) => [
        ...entries.map((e, i) => ({
          ...e,
          id: `MV-${Date.now()}-${i}`,
          date: DEMO_TODAY,
          time,
          outletId,
          by: merchant.ownerFirstName,
        })),
        ...prev,
      ]),
    [setMovements, outletId, merchant.ownerFirstName],
  );

  const recordSale = useCallback(
    (input: NewSaleInput): Transaction => {
      const current = transactionsFor(outletId);
      const todaySales = current.filter((t) => t.type === "sale" && t.date === DEMO_TODAY);
      const time = nextTime(current.find((t) => t.date === DEMO_TODAY)?.time);
      const primary = [...input.payments].sort((a, b) => b.amount - a.amount)[0];
      const cashier =
        employees.find((e) => e.outletId === outletId && e.role === "Cashier" && e.attendance.status === "Clocked In")?.name ??
        merchant.ownerFirstName;

      const sale: Transaction = {
        id: invoiceId(DEMO_TODAY, todaySales.length + 1),
        type: "sale",
        outletId,
        date: DEMO_TODAY,
        time,
        timestamp: timestampOf(DEMO_TODAY, timeToMinutes(time)) + new Date().getSeconds() * 1000,
        amount: input.total,
        subtotal: input.subtotal,
        method: primary.method,
        payments: input.payments.length > 1 ? input.payments : undefined,
        status: "Completed",
        items: input.lines.map((l) => ({
          productId: l.productId,
          name: l.name,
          qty: l.qty,
          price: l.unitPrice,
          variant: l.variant,
          addons: l.addons.length ? l.addons : undefined,
          note: l.note,
        })),
        cashier,
        channel: input.channel,
        orderRef: input.orderRef || undefined,
        customerId: input.customerId,
        discount: input.discount || undefined,
        tax: input.tax || undefined,
        service: input.service || undefined,
        cashReceived: input.cashReceived,
        note: input.note || undefined,
        isNew: true,
      };

      setSessionTx((prev) => [sale, ...prev]);
      if (input.promotionId) {
        const promotionId = input.promotionId;
        setPromotions((prev) =>
          prev.map((p) =>
            p.id === promotionId
              ? { ...p, revenue: p.revenue + input.total, transactions: p.transactions + 1, redemptions: p.redemptions + 1 }
              : p,
          ),
        );
      }
      if (input.voucher && input.customerId) {
        const customerId = input.customerId;
        setVouchers((prev) => prev.map((v) => (v.customerId === customerId && !v.usedOn ? { ...v, usedOn: sale.id } : v)));
      }

      const soldQty = new Map<string, number>();
      input.lines.forEach((l) => soldQty.set(l.productId, (soldQty.get(l.productId) ?? 0) + l.qty));
      setProducts((prev) => prev.map((p) => (soldQty.has(p.id) ? { ...p, stock: Math.max(0, p.stock - soldQty.get(p.id)!) } : p)));
      logMovement(
        [...soldQty.entries()]
          .filter(([id]) => products.some((p) => p.id === id))
          .map(([id, qty]) => ({
            itemId: id,
            itemName: products.find((p) => p.id === id)!.name,
            itemKind: "product" as const,
            type: "Sale" as const,
            quantity: -qty,
            unit: "pcs",
            note: sale.id,
          })),
        time,
      );

      if (input.createOrder !== false) setOrders((prev) => {
        const maxId = prev.reduce((m, o) => Math.max(m, Number(o.id.replace("ORD-", "")) || 0), 1026);
        const order: Order = {
          id: `ORD-${maxId + 1}`,
          outletId,
          reference: input.orderRef || input.channel,
          channel: input.channel,
          items: sale.items,
          total: sale.amount,
          status: "New",
          createdAt: time,
          updatedAt: time,
          invoiceId: sale.id,
          note: input.note || undefined,
        };
        return [order, ...prev];
      });

      return sale;
    },
    [transactionsFor, outletId, employees, merchant.ownerFirstName, setSessionTx, setPromotions, setVouchers, setProducts, logMovement, products, setOrders],
  );

  const refundTransaction = useCallback(
    (id: string, items: { index: number; qty: number }[], reason: string) => {
      const original = ACTIVE_OUTLET_IDS.map((o) => transactionsFor(o).find((t) => t.id === id)).find(Boolean);
      if (!original) return 0;
      const already = original.refundedAmount ?? 0;
      const gross = items.reduce((s, it) => s + (original.items[it.index]?.price ?? 0) * it.qty, 0);
      // Distribute any order-level discount, tax and service proportionally.
      const ratio = original.subtotal ? original.amount / original.subtotal : 1;
      const amount = Math.min(original.amount - already, Math.round(gross * ratio));
      if (amount <= 0) return 0;
      const refundedAmount = already + amount;
      const status = refundedAmount >= original.amount ? "Refunded" : "Partially Refunded";
      const time = nextTime(transactionsFor(original.outletId).find((t) => t.date === DEMO_TODAY)?.time);
      const refundCount = transactionsFor(original.outletId).filter((t) => t.type === "refund" && t.reference === id).length;

      const refund: Transaction = {
        id: `${original.id.replace("INV", "REF")}${refundCount ? `-${refundCount + 1}` : ""}`,
        type: "refund",
        outletId: original.outletId,
        date: DEMO_TODAY,
        time,
        timestamp: timestampOf(DEMO_TODAY, timeToMinutes(time)) + new Date().getSeconds() * 1000,
        amount,
        method: original.method,
        status: "Completed",
        items: items.map((it) => ({ ...original.items[it.index], qty: it.qty })),
        cashier: merchant.ownerFirstName,
        reference: original.id,
        note: reason,
        isNew: true,
      };
      setTxPatches((prev) => ({ ...prev, [id]: { ...prev[id], status, refundedAmount, refundReason: reason } }));
      setSessionTx((prev) => [refund, ...prev]);
      return amount;
    },
    [transactionsFor, merchant.ownerFirstName, setTxPatches, setSessionTx],
  );

  const attachCustomer = useCallback(
    (transactionId: string, customerId: string) =>
      setTxPatches((prev) => ({ ...prev, [transactionId]: { ...prev[transactionId], customerId } })),
    [setTxPatches],
  );

  /* ------------------------------------------------------------------ catalog & inventory */

  const saveProduct = useCallback(
    (product: Product) =>
      setProducts((prev) =>
        prev.some((p) => p.id === product.id) ? prev.map((p) => (p.id === product.id ? product : p)) : [product, ...prev],
      ),
    [setProducts],
  );
  const deleteProduct = useCallback((id: string) => setProducts((prev) => prev.filter((p) => p.id !== id)), [setProducts]);
  const toggleFavorite = useCallback(
    (id: string) => setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id])),
    [setFavorites],
  );

  const recordMovement = useCallback(
    (input: MovementInput) => {
      const isProduct = input.itemKind === "product";
      const item = isProduct ? products.find((p) => p.id === input.itemId) : ingredients.find((i) => i.id === input.itemId);
      if (!item) return;
      const currentStock = item.stock;
      let delta = 0;
      switch (input.type) {
        case "Stock In":
        case "Purchase":
          delta = input.quantity;
          break;
        case "Adjustment":
          delta = input.quantity - currentStock;
          break;
        default:
          delta = -Math.min(input.quantity, currentStock);
      }
      const round = (n: number) => Math.round(n * 100) / 100;
      if (isProduct) {
        setProducts((prev) => prev.map((p) => (p.id === input.itemId ? { ...p, stock: Math.max(0, round(p.stock + delta)) } : p)));
      } else {
        setIngredients((prev) =>
          prev.map((i) => (i.id === input.itemId ? { ...i, stock: Math.max(0, round(i.stock + delta)) } : i)),
        );
      }
      const note =
        input.type === "Transfer" && input.targetOutletId
          ? `To ${outletArea(input.targetOutletId)}${input.note ? ` - ${input.note}` : ""}`
          : input.note;
      logMovement(
        [
          {
            itemId: input.itemId,
            itemName: item.name,
            itemKind: input.itemKind,
            type: input.type,
            quantity: round(delta),
            unit: isProduct ? "pcs" : (item as Ingredient).unit,
            note,
          },
        ],
        nextTime(),
      );
    },
    [products, ingredients, setProducts, setIngredients, logMovement],
  );

  /* ------------------------------------------------------------------ orders */

  const updateOrderStatus = useCallback(
    (id: string, status: OrderStatus) =>
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status, updatedAt: nextTime(o.updatedAt) } : o))),
    [setOrders],
  );
  const holdOrder = useCallback((order: HeldOrder) => setHeldOrders((prev) => [order, ...prev]), [setHeldOrders]);
  const removeHeldOrder = useCallback(
    (id: string) => setHeldOrders((prev) => prev.filter((o) => o.id !== id)),
    [setHeldOrders],
  );

  /* ------------------------------------------------------------------ finance */

  const addExpense = useCallback(
    (expense: Omit<Expense, "id">) =>
      setExpenses((prev) => {
        const sameDay = prev.filter((e) => e.date === expense.date).length;
        return [{ ...expense, id: `EXP-${expense.date.slice(5, 7)}${expense.date.slice(8, 10)}-N${sameDay + 1}` }, ...prev];
      }),
    [setExpenses],
  );
  const deleteExpense = useCallback((id: string) => setExpenses((prev) => prev.filter((e) => e.id !== id)), [setExpenses]);

  const saveSupplier = useCallback(
    (supplier: Supplier) =>
      setSuppliers((prev) =>
        prev.some((s) => s.id === supplier.id) ? prev.map((s) => (s.id === supplier.id ? supplier : s)) : [...prev, supplier],
      ),
    [setSuppliers],
  );

  const createPurchaseOrder = useCallback(
    (po: Omit<PurchaseOrder, "id" | "createdAt" | "status">) => {
      const todayCount = purchaseOrders.filter((p) => p.id.startsWith(`PO-${MMDD}`)).length;
      const created: PurchaseOrder = { ...po, id: `PO-${MMDD}-${pad(todayCount + 1, 3)}`, createdAt: DEMO_TODAY, status: "Pending" };
      setPurchaseOrders((prev) => [created, ...prev]);
      return created;
    },
    [purchaseOrders, setPurchaseOrders],
  );

  const receivePurchaseOrder = useCallback(
    (id: string) => {
      const po = purchaseOrders.find((p) => p.id === id);
      if (!po) return;
      setPurchaseOrders((prev) => prev.map((p) => (p.id === id ? { ...p, status: "Received" } : p)));
      const lines = po.lines.filter((l) => l.ingredientId);
      setIngredients((prev) =>
        prev.map((i) => {
          const line = lines.find((l) => l.ingredientId === i.id);
          return line ? { ...i, stock: Math.round((i.stock + line.qty) * 100) / 100 } : i;
        }),
      );
      logMovement(
        lines.map((l) => ({
          itemId: l.ingredientId!,
          itemName: l.name,
          itemKind: "ingredient" as const,
          type: "Purchase" as const,
          quantity: l.qty,
          unit: l.unit,
          note: po.id,
        })),
        nextTime(),
      );
    },
    [purchaseOrders, setPurchaseOrders, setIngredients, logMovement],
  );

  const payPurchaseOrder = useCallback(
    (id: string) => {
      const po = purchaseOrders.find((p) => p.id === id);
      if (!po) return;
      const supplier = suppliers.find((s) => s.id === po.supplierId);
      setPurchaseOrders((prev) => prev.map((p) => (p.id === id ? { ...p, status: "Paid" } : p)));
      addExpense({
        outletId: po.outletId,
        category: "Ingredients",
        title: `${po.id} - ${supplier?.name ?? "Supplier"}`,
        amount: po.total,
        method: "Livin' by Mandiri",
        date: DEMO_TODAY,
        supplierId: po.supplierId,
      });
      if (supplier) saveSupplier({ ...supplier, lastPurchase: po.total, lastPurchaseDate: DEMO_TODAY });
    },
    [purchaseOrders, suppliers, setPurchaseOrders, addExpense, saveSupplier],
  );

  const cancelPurchaseOrder = useCallback(
    (id: string) => setPurchaseOrders((prev) => prev.map((p) => (p.id === id ? { ...p, status: "Cancelled" } : p))),
    [setPurchaseOrders],
  );

  const paySupplierOutstanding = useCallback(
    (id: string) => {
      const supplier = suppliers.find((s) => s.id === id);
      if (!supplier || supplier.outstanding <= 0) return;
      addExpense({
        outletId,
        category: "Others",
        title: `Supplier payment - ${supplier.name}`,
        amount: supplier.outstanding,
        method: "Livin' by Mandiri",
        date: DEMO_TODAY,
        supplierId: id,
      });
      saveSupplier({ ...supplier, outstanding: 0, paymentStatus: "Paid" });
      setEvents((prev) => prev.map((e) => (e.link === `/suppliers/${id}` ? { ...e, done: true } : e)));
    },
    [suppliers, outletId, addExpense, saveSupplier, setEvents],
  );

  /* ------------------------------------------------------------------ people & marketing */

  const saveEmployee = useCallback(
    (employee: Employee) =>
      setEmployees((prev) =>
        prev.some((e) => e.id === employee.id) ? prev.map((e) => (e.id === employee.id ? employee : e)) : [...prev, employee],
      ),
    [setEmployees],
  );

  // Sales recorded in the app add to each customer's visits and spending.
  const customers = useMemo(() => {
    const activity = new Map<string, { visits: number; spend: number }>();
    sessionSales.forEach((t) => {
      if (!t.customerId || t.status === "Refunded") return;
      const a = activity.get(t.customerId) ?? { visits: 0, spend: 0 };
      activity.set(t.customerId, { visits: a.visits + 1, spend: a.spend + t.amount - (t.refundedAmount ?? 0) });
    });
    return [...addedCustomers, ...seedCustomers].map((c) => {
      const a = activity.get(c.id);
      if (!a) return c;
      const visits = c.visits + a.visits;
      const totalSpending = c.totalSpending + a.spend;
      return { ...c, visits, totalSpending, averageSpend: Math.round(totalSpending / visits), lastVisit: "Today" };
    });
  }, [addedCustomers, sessionSales]);
  const addCustomer = useCallback(() => {
    const code = `F-${800 + addedCustomers.length + 1}`;
    const customer: Customer = {
      id: code,
      label: `Customer ${code}`,
      segment: "New",
      visits: 0,
      totalSpending: 0,
      lastVisit: "Today",
      favorite: "-",
      firstVisit: "Sep 2026",
      averageSpend: 0,
      preferredTime: "Lunch",
    };
    setAddedCustomers((prev) => [customer, ...prev]);
    return customer;
  }, [addedCustomers.length, setAddedCustomers]);

  const savePromotion = useCallback(
    (promotion: Promotion) =>
      setPromotions((prev) =>
        prev.some((p) => p.id === promotion.id) ? prev.map((p) => (p.id === promotion.id ? promotion : p)) : [promotion, ...prev],
      ),
    [setPromotions],
  );
  const saveLoyaltyProgram = useCallback(
    (program: LoyaltyProgram) =>
      setLoyaltyPrograms((prev) =>
        prev.some((p) => p.id === program.id) ? prev.map((p) => (p.id === program.id ? program : p)) : [program, ...prev],
      ),
    [setLoyaltyPrograms],
  );

  /* ------------------------------------------------------------------ growth & learning */

  const claimMission = useCallback(
    (id: string) => setClaimedMissions((prev) => (prev.includes(id) ? prev : [...prev, id])),
    [setClaimedMissions],
  );
  const completeLesson = useCallback(
    (moduleId: string, lessonIndex: number) =>
      setLearningProgress((prev) => ({ ...prev, [moduleId]: Math.max(prev[moduleId] ?? 0, lessonIndex + 1) })),
    [setLearningProgress],
  );
  const toggleProgram = useCallback(
    (id: string) => setJoinedPrograms((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id])),
    [setJoinedPrograms],
  );
  const uploadDocument = useCallback(
    (name: string) => setUploadedDocs((prev) => (prev.includes(name) ? prev : [...prev, name])),
    [setUploadedDocs],
  );

  /* ------------------------------------------------------------------ operations */

  const addEvent = useCallback(
    (event: Omit<CalendarEvent, "id"> & { id?: string }) =>
      setEvents((prev) => {
        const id = event.id ?? `ev-${Date.now()}`;
        return prev.some((e) => e.id === id) ? prev : [...prev, { ...event, id }];
      }),
    [setEvents],
  );
  const removeEvent = useCallback((id: string) => setEvents((prev) => prev.filter((e) => e.id !== id)), [setEvents]);
  const toggleEvent = useCallback(
    (id: string) => setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, done: !e.done } : e))),
    [setEvents],
  );
  const updateDevice = useCallback(
    (device: Device) =>
      setDevices((prev) => (prev.some((d) => d.id === device.id) ? prev.map((d) => (d.id === device.id ? device : d)) : [...prev, device])),
    [setDevices],
  );
  const logoutSession = useCallback((id: string) => setSessions((prev) => prev.filter((s) => s.id !== id)), [setSessions]);

  /* ------------------------------------------------------------------ preferences & support */

  const updateSettings = useCallback(
    (patch: Partial<AppSettings>) => setSettings((prev) => ({ ...DEFAULT_SETTINGS, ...prev, ...patch })),
    [setSettings],
  );
  const createTicket = useCallback(
    (topic: string, detail: string) => {
      const ticket: SupportTicket = {
        id: `LM-${Date.now().toString().slice(-6)}`,
        topic,
        detail,
        createdAt: `${DEMO_TODAY} ${nextTime()}`,
        status: "Received",
      };
      setTickets((prev) => [ticket, ...prev]);
      return ticket;
    },
    [setTickets],
  );
  const markArticleHelpful = useCallback(
    (id: string) => setHelpfulArticles((prev) => (prev.includes(id) ? prev : [...prev, id])),
    [setHelpfulArticles],
  );
  const sendVoucher = useCallback(
    (customerId: string, reason: CustomerVoucher["reason"]) => {
      const voucher: CustomerVoucher = { customerId, amount: VOUCHER_AMOUNT, sentAt: `${DEMO_TODAY} ${nextTime()}`, reason };
      setVouchers((prev) => [voucher, ...prev.filter((v) => v.customerId !== customerId)]);
      return voucher;
    },
    [setVouchers],
  );

  /* ------------------------------------------------------------------ notifications */

  const markNotificationRead = useCallback(
    (id: string) => setReadNotifications((prev) => (prev.includes(id) ? prev : [...prev, id])),
    [setReadNotifications],
  );
  const markAllNotificationsRead = useCallback(
    (ids: string[]) => setReadNotifications((prev) => [...new Set([...prev, ...ids])]),
    [setReadNotifications],
  );
  const clearReadNotifications = useCallback(
    (ids: string[]) => setClearedNotifications((prev) => [...new Set([...prev, ...ids])]),
    [setClearedNotifications],
  );

  const value = useMemo<DataState>(
    () => ({
      products,
      ingredients,
      movements,
      favorites,
      saveProduct,
      deleteProduct,
      toggleFavorite,
      recordMovement,
      transactions,
      transactionsFor,
      allTransactions,
      sessionSales,
      recordSale,
      refundTransaction,
      attachCustomer,
      orders,
      heldOrders,
      updateOrderStatus,
      holdOrder,
      removeHeldOrder,
      expenses,
      addExpense,
      deleteExpense,
      suppliers,
      purchaseOrders,
      createPurchaseOrder,
      receivePurchaseOrder,
      payPurchaseOrder,
      cancelPurchaseOrder,
      paySupplierOutstanding,
      saveSupplier,
      employees,
      saveEmployee,
      customers,
      addCustomer,
      promotions,
      savePromotion,
      loyaltyPrograms,
      saveLoyaltyProgram,
      claimedMissions,
      claimMission,
      learningProgress,
      completeLesson,
      joinedPrograms,
      toggleProgram,
      uploadedDocs,
      uploadDocument,
      events,
      addEvent,
      removeEvent,
      toggleEvent,
      devices,
      updateDevice,
      sessions,
      logoutSession,
      settings,
      updateSettings,
      tickets,
      createTicket,
      helpfulArticles,
      markArticleHelpful,
      vouchers,
      sendVoucher,
      readNotifications,
      clearedNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      clearReadNotifications,
    }),
    [
      products,
      ingredients,
      movements,
      favorites,
      saveProduct,
      deleteProduct,
      toggleFavorite,
      recordMovement,
      transactions,
      transactionsFor,
      allTransactions,
      sessionSales,
      recordSale,
      refundTransaction,
      attachCustomer,
      orders,
      heldOrders,
      updateOrderStatus,
      holdOrder,
      removeHeldOrder,
      expenses,
      addExpense,
      deleteExpense,
      suppliers,
      purchaseOrders,
      createPurchaseOrder,
      receivePurchaseOrder,
      payPurchaseOrder,
      cancelPurchaseOrder,
      paySupplierOutstanding,
      saveSupplier,
      employees,
      saveEmployee,
      customers,
      addCustomer,
      promotions,
      savePromotion,
      loyaltyPrograms,
      saveLoyaltyProgram,
      claimedMissions,
      claimMission,
      learningProgress,
      completeLesson,
      joinedPrograms,
      toggleProgram,
      uploadedDocs,
      uploadDocument,
      events,
      addEvent,
      removeEvent,
      toggleEvent,
      devices,
      updateDevice,
      sessions,
      logoutSession,
      settings,
      updateSettings,
      tickets,
      createTicket,
      helpfulArticles,
      markArticleHelpful,
      vouchers,
      sendVoucher,
      readNotifications,
      clearedNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      clearReadNotifications,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
