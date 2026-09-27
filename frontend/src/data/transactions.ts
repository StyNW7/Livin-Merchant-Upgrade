import type { DailyPoint, PaymentMethod, SalesChannel, ScenarioId, Settlement, Transaction, TransactionItem } from "@/types";
import { createRandom, type Random } from "@/utils/random";
import { formatShortDate, parseISODate, toISODate } from "@/utils/format";
import { initialProducts, productById } from "./products";
import { DEMO_TODAY, DEMO_NOW } from "./merchant";
import { scenarios, type OutletPlan } from "./scenarios";

/**
 * Deterministic transaction generator.
 *
 * Every outlet gets 90 days of sales. The last 30 days ("this month" in the app) add up exactly to
 * the scenario's headline figures, and today and yesterday are pinned to exact values, so Home,
 * Transactions, Reports, Growth and Finance always agree with each other.
 */

export const HISTORY_DAYS = 90;
const PERIOD_DAYS = 30;

/** Weekend demand is roughly 14% above weekdays. Index = Date.getDay(). */
const DOW_FACTOR = [1.13, 0.92, 0.9, 0.94, 0.96, 1.05, 1.18];

/** Relative traffic by hour of day, 07:00 - 21:00. */
const HOUR_WEIGHTS: Record<number, number> = {
  7: 5, 8: 8, 9: 6, 10: 5, 11: 9, 12: 11, 13: 10, 14: 6, 15: 5, 16: 6, 17: 7, 18: 6, 19: 6, 20: 4, 21: 2,
};

const METHOD_WEIGHTS: { method: PaymentMethod; weight: number }[] = [
  { method: "QRIS", weight: 48 },
  { method: "Cash", weight: 25 },
  { method: "Debit", weight: 15 },
  { method: "Credit", weight: 7 },
  { method: "Transfer", weight: 3 },
  { method: "Other", weight: 2 },
];

const CHANNEL_WEIGHTS: { channel: SalesChannel; weight: number }[] = [
  { channel: "Dine-in", weight: 52 },
  { channel: "Takeaway", weight: 36 },
  { channel: "Delivery", weight: 12 },
];

/** Blended merchant discount rate on non-cash settlements (QRIS UMi, debit and credit mixed). */
export const MDR_RATE = 0.0045;
export const SETTLEMENT_TIME = "06:15";

type Basket = Map<string, number>;

const sellable = initialProducts.filter((p) => p.active);
const priceK = (id: string) => (productById.get(id)?.price ?? 0) / 1000;
const basketTotal = (basket: Basket) => {
  let sum = 0;
  basket.forEach((qty, id) => (sum += qty * priceK(id)));
  return sum;
};

function addToBasket(basket: Basket, id: string, qty = 1) {
  basket.set(id, (basket.get(id) ?? 0) + qty);
}

function randomBasket(rng: Random): Basket {
  const basket: Basket = new Map();
  const roll = rng.next();
  const lines = roll < 0.55 ? 1 : roll < 0.87 ? 2 : roll < 0.97 ? 3 : 4;
  for (let i = 0; i < lines; i++) {
    const product = rng.weighted(sellable, (p) => p.popularity);
    addToBasket(basket, product.id, rng.next() < 0.12 ? 2 : 1);
  }
  return basket;
}

/** Smallest multiset of product prices (in thousands) that sums exactly to `amount`. */
function exactCombination(amount: number): string[] | null {
  if (amount === 0) return [];
  const best: (string[] | null)[] = Array(amount + 1).fill(null);
  best[0] = [];
  for (let value = 1; value <= amount; value++) {
    for (const product of sellable) {
      const price = product.price / 1000;
      if (price > value) continue;
      const prev = best[value - price];
      if (prev && (!best[value] || prev.length + 1 < best[value]!.length)) best[value] = [...prev, product.id];
    }
  }
  return best[amount];
}

/** Adjusts baskets so their combined value hits `targetK` exactly. */
function balanceBaskets(baskets: Basket[], targetK: number, rng: Random) {
  let diff = targetK - baskets.reduce((sum, b) => sum + basketTotal(b), 0);

  const removeOneUnit = () => {
    const candidates = baskets.filter((b) => [...b.values()].reduce((a, q) => a + q, 0) > 1);
    if (!candidates.length) return false;
    const basket = rng.pick(candidates);
    const id = rng.pick([...basket.keys()]);
    const qty = basket.get(id)!;
    if (qty > 1) basket.set(id, qty - 1);
    else basket.delete(id);
    diff += priceK(id);
    return true;
  };

  for (let guard = 0; guard < 400; guard++) {
    while (diff < 0 && removeOneUnit()) {
      /* keep trimming */
    }
    while (diff >= 60) {
      const affordable = sellable.filter((p) => p.price / 1000 <= diff - 28);
      const product = rng.weighted(affordable, (p) => p.popularity);
      addToBasket(rng.pick(baskets), product.id);
      diff -= product.price / 1000;
    }
    const combo = diff >= 0 ? exactCombination(diff) : null;
    if (combo) {
      combo.forEach((id) => addToBasket(rng.pick(baskets), id));
      return;
    }
    removeOneUnit();
  }
}

function randomTime(rng: Random, fromMinutes: number, toMinutes: number): number {
  const hours = Object.keys(HOUR_WEIGHTS).map(Number);
  for (let i = 0; i < 20; i++) {
    const hour = rng.weighted(hours, (h) => HOUR_WEIGHTS[h]);
    const minutes = hour * 60 + rng.int(0, 59);
    if (minutes >= fromMinutes && minutes <= toMinutes) return minutes;
  }
  return rng.int(fromMinutes, toMinutes);
}

const pad = (n: number, size = 2) => String(n).padStart(size, "0");
export const minutesToTime = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
export const timeToMinutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
export const timestampOf = (iso: string, minutes: number) => {
  const d = parseISODate(iso);
  d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return d.getTime();
};
const compactDate = (iso: string) => `${iso.slice(0, 4)}-${iso.slice(5, 7)}${iso.slice(8, 10)}`;

export function invoiceId(iso: string, seq: number) {
  return `INV-${compactDate(iso)}-${pad(seq, 3)}`;
}

function basketToItems(basket: Basket): TransactionItem[] {
  return [...basket.entries()].map(([productId, qty]) => {
    const product = productById.get(productId)!;
    return { productId, name: product.name, qty, price: product.price };
  });
}

interface DayPlan {
  date: string;
  revenue: number;
  count: number;
}

export function historyDates(): string[] {
  const today = parseISODate(DEMO_TODAY);
  const dates: string[] = [];
  for (let i = HISTORY_DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(toISODate(d));
  }
  return dates;
}

function buildDayPlans(plan: OutletPlan, rng: Random): DayPlan[] {
  const dates = historyDates();
  const yesterday = dates[dates.length - 2];
  const fixedDays: Record<string, { revenue: number; count: number }> = {
    [DEMO_TODAY]: plan.today,
    [yesterday]: plan.yesterday,
  };

  const weights = dates.map((iso, i) => {
    const d = parseISODate(iso);
    const payday = d.getDate() >= 25 || d.getDate() <= 1 ? 1.07 : 1;
    const noise = 0.93 + rng.next() * 0.14;
    return DOW_FACTOR[d.getDay()] * payday * noise * (1 + i * 0.0012);
  });
  const tickets = dates.map(() => 35_500 + rng.next() * 4_000);
  const plans: DayPlan[] = dates.map((date) => ({ date, revenue: 0, count: 0 }));

  plan.periods.forEach((period, p) => {
    const idx = Array.from({ length: PERIOD_DAYS }, (_, k) => p * PERIOD_DAYS + k);
    const fixed = idx.filter((i) => fixedDays[dates[i]]);
    const free = idx.filter((i) => !fixedDays[dates[i]]);

    fixed.forEach((i) => {
      plans[i].revenue = fixedDays[dates[i]].revenue;
      plans[i].count = fixedDays[dates[i]].count;
    });

    const remainingRevenue = period.revenue - fixed.reduce((s, i) => s + plans[i].revenue, 0);
    const remainingCount = period.count - fixed.reduce((s, i) => s + plans[i].count, 0);
    const weightSum = free.reduce((s, i) => s + weights[i], 0);

    free.forEach((i) => {
      plans[i].revenue = Math.round((remainingRevenue * weights[i]) / weightSum / 1000) * 1000;
    });
    plans[free[free.length - 1]].revenue += remainingRevenue - free.reduce((s, i) => s + plans[i].revenue, 0);

    const rawCounts = free.map((i) => plans[i].revenue / tickets[i]);
    const rawSum = rawCounts.reduce((a, b) => a + b, 0);
    free.forEach((i, k) => {
      plans[i].count = Math.max(8, Math.round((rawCounts[k] * remainingCount) / rawSum));
    });
    const busiest = free.reduce((a, b) => (plans[b].count > plans[a].count ? b : a), free[0]);
    plans[busiest].count += remainingCount - free.reduce((s, i) => s + plans[i].count, 0);
  });

  return plans;
}

interface FixedSale {
  minutes: number;
  method: PaymentMethod;
  channel: SalesChannel;
  items: [string, number][];
  refunded?: boolean;
}

/** The exact transactions the brief calls out for today at the main outlet. */
const TODAY_FIXED: Record<string, FixedSale[]> = {
  "gading-serpong": [
    { minutes: 12 * 60 + 43, method: "QRIS", channel: "Dine-in", items: [["p-cafe-latte", 1], ["p-matcha-latte", 1], ["p-espresso", 1]] },
    { minutes: 12 * 60 + 29, method: "Debit", channel: "Dine-in", items: [["p-chicken-sandwich", 1], ["p-caramel-latte", 1], ["p-americano", 1], ["p-espresso", 1]] },
    { minutes: 11 * 60 + 58, method: "Cash", channel: "Takeaway", items: [["p-chicken-sandwich", 1]] },
    { minutes: 11 * 60 + 41, method: "QRIS", channel: "Takeaway", items: [["p-cafe-latte", 1], ["p-cappuccino", 1]], refunded: true },
  ],
};

interface DraftSale {
  minutes: number;
  basket: Basket;
  method: PaymentMethod;
  channel: SalesChannel;
  refunded: boolean;
}

const REFUND_REASONS = ["Customer changed order", "Wrong item prepared", "Duplicate payment", "Item unavailable"];

function generateOutlet(plan: OutletPlan): Transaction[] {
  const rng = createRandom(plan.seed);
  const days = buildDayPlans(plan, rng);
  const all: Transaction[] = [];
  const cashierPick = () => rng.weighted(plan.cashiers, (c) => c.weight).name;
  const methodPick = () => rng.weighted(METHOD_WEIGHTS, (m) => m.weight).method;
  const channelPick = () => rng.weighted(CHANNEL_WEIGHTS, (c) => c.weight).channel;
  const nowMinutes = timeToMinutes(DEMO_NOW);

  let previousNonCash = 0;
  let previousCount = 0;
  let previousDate: string | null = null;

  days.forEach((day, dayIndex) => {
    const isToday = day.date === DEMO_TODAY;
    const fixed = isToday ? TODAY_FIXED[plan.outletId] ?? [] : [];
    const fixedCompleted = fixed.filter((f) => !f.refunded);
    const fixedValueK = fixedCompleted.reduce((s, f) => s + f.items.reduce((a, [id, q]) => a + priceK(id) * q, 0), 0);

    const openMinutes = 7 * 60;
    const closeMinutes = isToday ? (fixed.length ? 11 * 60 + 50 : nowMinutes - 5) : 21 * 60 + 45;

    const baskets = Array.from({ length: day.count - fixedCompleted.length }, () => randomBasket(rng));
    balanceBaskets(baskets, day.revenue / 1000 - fixedValueK, rng);

    const drafts: DraftSale[] = baskets.map((basket) => ({
      minutes: randomTime(rng, openMinutes, closeMinutes),
      basket,
      method: methodPick(),
      channel: channelPick(),
      refunded: false,
    }));

    fixed.forEach((f) => {
      const basket: Basket = new Map();
      f.items.forEach(([id, q]) => addToBasket(basket, id, q));
      drafts.push({ minutes: f.minutes, basket, method: f.method, channel: f.channel, refunded: !!f.refunded });
    });

    if (!isToday && dayIndex % 11 === 6) {
      drafts.push({ minutes: randomTime(rng, 9 * 60, 20 * 60), basket: randomBasket(rng), method: "QRIS", channel: "Takeaway", refunded: true });
    }

    drafts.sort((a, b) => a.minutes - b.minutes);

    let nonCash = 0;
    let nonCashCount = 0;
    drafts.forEach((draft, i) => {
      const items = basketToItems(draft.basket);
      const amount = items.reduce((s, it) => s + it.price * it.qty, 0);
      const id = invoiceId(day.date, i + 1);
      const cashier = cashierPick();
      const reason = rng.pick(REFUND_REASONS);
      all.push({
        id,
        type: "sale",
        outletId: plan.outletId,
        date: day.date,
        time: minutesToTime(draft.minutes),
        timestamp: timestampOf(day.date, draft.minutes),
        amount,
        subtotal: amount,
        method: draft.method,
        status: draft.refunded ? "Refunded" : "Completed",
        items,
        cashier,
        channel: draft.channel,
        customerId: draft.method === "Cash" ? undefined : `CUST-${rng.int(1000, 1999)}`,
        refundedAmount: draft.refunded ? amount : undefined,
        refundReason: draft.refunded ? reason : undefined,
      });
      if (!draft.refunded && draft.method !== "Cash") {
        nonCash += amount;
        nonCashCount += 1;
      }

      if (draft.refunded) {
        const refundMinutes = Math.min(draft.minutes + 11, 22 * 60);
        all.push({
          id: `REF-${compactDate(day.date)}-${pad(i + 1, 3)}`,
          type: "refund",
          outletId: plan.outletId,
          date: day.date,
          time: minutesToTime(refundMinutes),
          timestamp: timestampOf(day.date, refundMinutes),
          amount,
          method: draft.method,
          status: "Completed",
          items,
          cashier,
          reference: id,
          note: reason,
        });
      }
    });

    if (previousDate) {
      const fee = Math.round((previousNonCash * MDR_RATE) / 100) * 100;
      all.push({
        id: `STL-${compactDate(day.date)}-${plan.outletId === "gading-serpong" ? "GS" : "AS"}`,
        type: "settlement",
        outletId: plan.outletId,
        date: day.date,
        time: SETTLEMENT_TIME,
        timestamp: timestampOf(day.date, timeToMinutes(SETTLEMENT_TIME)),
        amount: previousNonCash - fee,
        subtotal: previousNonCash,
        method: "Bank Transfer",
        status: "Completed",
        items: [],
        cashier: "System",
        reference: previousDate,
        discount: fee,
        note: `${previousCount} non-cash transactions`,
      });
    }

    previousNonCash = nonCash;
    previousCount = nonCashCount;
    previousDate = day.date;
  });

  return all.sort((a, b) => b.timestamp - a.timestamp);
}

const cache = new Map<string, Transaction[]>();

/** All seeded transactions for an outlet in a scenario, newest first. */
export function getSeedTransactions(outletId: string, scenario: ScenarioId = "A"): Transaction[] {
  const plan = scenarios[scenario].plans[outletId];
  if (!plan) return [];
  const key = `${scenario}:${outletId}`;
  if (!cache.has(key)) cache.set(key, generateOutlet(plan));
  return cache.get(key)!;
}

/** Daily completed-sales series for charts, oldest first. */
export function buildDailySeries(transactions: Transaction[]): DailyPoint[] {
  const map = new Map<string, DailyPoint>();
  historyDates().forEach((iso) => map.set(iso, { date: iso, label: formatShortDate(iso), revenue: 0, transactions: 0 }));
  transactions.forEach((t) => {
    if (t.type !== "sale" || t.status === "Refunded") return;
    const point = map.get(t.date);
    if (!point) return;
    point.revenue += t.amount - (t.refundedAmount ?? 0);
    point.transactions += 1;
  });
  return [...map.values()];
}

/**
 * Consolidated settlements: every morning Mandiri settles the previous day's non-cash sales of
 * all outlets into the single merchant business account. Today's non-cash sales are scheduled.
 */
export function buildSettlements(byOutlet: Record<string, Transaction[]>, account: string): Settlement[] {
  const map = new Map<string, Settlement>();
  Object.entries(byOutlet).forEach(([outletId, list]) => {
    list
      .filter((t) => t.type === "settlement")
      .forEach((t) => {
        const entry =
          map.get(t.date) ??
          ({
            id: `STL-${compactDate(t.date)}`,
            date: t.date,
            time: t.time,
            salesDate: t.reference ?? t.date,
            gross: 0,
            fee: 0,
            net: 0,
            transactions: 0,
            status: "Completed",
            account,
            breakdown: [],
          } satisfies Settlement);
        const count = Number((t.note ?? "0").split(" ")[0]) || 0;
        entry.gross += t.subtotal ?? t.amount;
        entry.fee += t.discount ?? 0;
        entry.net += t.amount;
        entry.transactions += count;
        entry.breakdown.push({ outletId, gross: t.subtotal ?? t.amount, fee: t.discount ?? 0, net: t.amount, transactions: count });
        map.set(t.date, entry);
      });
  });

  // Tomorrow's settlement for today's non-cash sales so far (live, includes new sales).
  const tomorrow = parseISODate(DEMO_TODAY);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const scheduled: Settlement = {
    id: `STL-${compactDate(toISODate(tomorrow))}`,
    date: toISODate(tomorrow),
    time: SETTLEMENT_TIME,
    salesDate: DEMO_TODAY,
    gross: 0,
    fee: 0,
    net: 0,
    transactions: 0,
    status: "Scheduled",
    account,
    breakdown: [],
  };
  Object.entries(byOutlet).forEach(([outletId, list]) => {
    const sales = list.filter(
      (t) => t.type === "sale" && t.date === DEMO_TODAY && t.status !== "Refunded" && t.method !== "Cash",
    );
    const gross = sales.reduce((s, t) => s + t.amount - (t.refundedAmount ?? 0), 0);
    const fee = Math.round((gross * MDR_RATE) / 100) * 100;
    scheduled.gross += gross;
    scheduled.fee += fee;
    scheduled.net += gross - fee;
    scheduled.transactions += sales.length;
    scheduled.breakdown.push({ outletId, gross, fee, net: gross - fee, transactions: sales.length });
  });

  return [scheduled, ...[...map.values()].sort((a, b) => (a.date < b.date ? 1 : -1))];
}
