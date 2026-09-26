import type { DailyPoint, LineItem, PaymentMethod, Transaction } from "@/types";
import { createRandom, type Random } from "@/utils/random";
import { formatShortDate, parseISODate, toISODate } from "@/utils/format";
import { initialProducts, productById } from "./products";
import { DEMO_TODAY } from "./merchant";

/**
 * Deterministic transaction generator.
 *
 * Every outlet gets 90 days of sales. The last 30 days ("this month" in the app) add up exactly
 * to the headline figures in the brief, and today and yesterday are pinned to exact values so the
 * Home dashboard, Transactions summary and Reports always agree with each other.
 */

export const HISTORY_DAYS = 90;
const PERIOD_DAYS = 30;

interface OutletPlan {
  outletId: string;
  seed: number;
  /** Oldest to newest, 30 days each. */
  periods: { revenue: number; count: number }[];
  fixedDays: Record<string, { revenue: number; count: number }>;
  cashiers: { name: string; weight: number }[];
}

const PLANS: Record<string, OutletPlan> = {
  "gading-serpong": {
    outletId: "gading-serpong",
    seed: 20250125,
    periods: [
      { revenue: 41_100_000, count: 1122 },
      { revenue: 44_200_000, count: 1196 },
      { revenue: 48_750_000, count: 1284 },
    ],
    fixedDays: {
      "2026-09-25": { revenue: 2_850_000, count: 76 },
      "2026-09-24": { revenue: 2_629_000, count: 70 },
    },
    cashiers: [
      { name: "Rina", weight: 7 },
      { name: "Dimas", weight: 3 },
    ],
  },
  "alam-sutera": {
    outletId: "alam-sutera",
    seed: 20260301,
    periods: [
      { revenue: 27_900_000, count: 770 },
      { revenue: 32_600_000, count: 884 },
      { revenue: 35_800_000, count: 962 },
    ],
    fixedDays: {
      "2026-09-25": { revenue: 2_040_000, count: 55 },
      "2026-09-24": { revenue: 1_866_000, count: 51 },
    },
    cashiers: [
      { name: "Sari", weight: 7 },
      { name: "Bagus", weight: 3 },
    ],
  },
};

/** Weekend demand is roughly 14% above weekdays. Index = Date.getDay(). */
const DOW_FACTOR = [1.13, 0.92, 0.9, 0.94, 0.96, 1.05, 1.18];

/** Relative traffic by hour of day, 07:00 - 21:00. */
const HOUR_WEIGHTS: Record<number, number> = {
  7: 5, 8: 8, 9: 6, 10: 5, 11: 9, 12: 11, 13: 10, 14: 6, 15: 5, 16: 6, 17: 7, 18: 6, 19: 6, 20: 4, 21: 2,
};

const METHOD_WEIGHTS: { method: PaymentMethod; weight: number }[] = [
  { method: "QRIS", weight: 46 },
  { method: "Cash", weight: 24 },
  { method: "Debit", weight: 17 },
  { method: "Credit", weight: 8 },
  { method: "Other", weight: 5 },
];

/** Blended merchant discount rate applied to non-cash settlements. */
const MDR_RATE = 0.0045;

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
      const prev = best[value - price];
      if (price <= value && prev && (!best[value] || prev.length + 1 < best[value]!.length)) {
        best[value] = [...prev, product.id];
      }
    }
  }
  return best[amount];
}

/** Adjusts baskets so their combined value hits `targetK` exactly. */
function balanceBaskets(baskets: Basket[], targetK: number, rng: Random) {
  let diff = targetK - baskets.reduce((sum, b) => sum + basketTotal(b), 0);

  const removeOneUnit = () => {
    const candidates = baskets.filter((b) => [...b.values()].reduce((a, q) => a + q, 0) > 1);
    const basket = candidates.length ? rng.pick(candidates) : null;
    if (!basket) return false;
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
  for (let i = 0; i < 20; i++) {
    const hour = rng.weighted(
      Object.keys(HOUR_WEIGHTS).map(Number),
      (h) => HOUR_WEIGHTS[h],
    );
    const minutes = hour * 60 + rng.int(0, 59);
    if (minutes >= fromMinutes && minutes <= toMinutes) return minutes;
  }
  return rng.int(fromMinutes, toMinutes);
}

const pad = (n: number, size = 2) => String(n).padStart(size, "0");
const minutesToTime = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
const timestampOf = (iso: string, minutes: number) => {
  const d = parseISODate(iso);
  d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return d.getTime();
};
const compactDate = (iso: string) => iso.replace(/-/g, "").slice(0, 4) + "-" + iso.slice(5, 7) + iso.slice(8, 10);

export function invoiceId(iso: string, seq: number) {
  return `INV-${compactDate(iso)}-${pad(seq, 3)}`;
}

function basketToItems(basket: Basket): LineItem[] {
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

function buildDayPlans(plan: OutletPlan, rng: Random): DayPlan[] {
  const today = parseISODate(DEMO_TODAY);
  const dates: string[] = [];
  for (let i = HISTORY_DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(toISODate(d));
  }

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
    const fixed = idx.filter((i) => plan.fixedDays[dates[i]]);
    const free = idx.filter((i) => !plan.fixedDays[dates[i]]);

    fixed.forEach((i) => {
      plans[i].revenue = plan.fixedDays[dates[i]].revenue;
      plans[i].count = plan.fixedDays[dates[i]].count;
    });

    const remainingRevenue = period.revenue - fixed.reduce((s, i) => s + plans[i].revenue, 0);
    const remainingCount = period.count - fixed.reduce((s, i) => s + plans[i].count, 0);
    const weightSum = free.reduce((s, i) => s + weights[i], 0);

    free.forEach((i) => {
      plans[i].revenue = Math.round((remainingRevenue * weights[i]) / weightSum / 1000) * 1000;
    });
    const revenueDrift = remainingRevenue - free.reduce((s, i) => s + plans[i].revenue, 0);
    plans[free[free.length - 1]].revenue += revenueDrift;

    const rawCounts = free.map((i) => plans[i].revenue / tickets[i]);
    const rawSum = rawCounts.reduce((a, b) => a + b, 0);
    free.forEach((i, k) => {
      plans[i].count = Math.max(8, Math.round((rawCounts[k] * remainingCount) / rawSum));
    });
    const countDrift = remainingCount - free.reduce((s, i) => s + plans[i].count, 0);
    const busiest = free.reduce((a, b) => (plans[b].count > plans[a].count ? b : a), free[0]);
    plans[busiest].count += countDrift;
  });

  return plans;
}

interface FixedSale {
  minutes: number;
  method: PaymentMethod;
  items: [string, number][];
  refunded?: boolean;
}

/** The exact transactions the brief calls out for today at the main outlet. */
const TODAY_FIXED: Record<string, FixedSale[]> = {
  "gading-serpong": [
    { minutes: 12 * 60 + 43, method: "QRIS", items: [["p-cafe-latte", 1], ["p-matcha-latte", 1], ["p-espresso", 1]] },
    { minutes: 12 * 60 + 29, method: "Debit", items: [["p-chicken-sandwich", 1], ["p-caramel-latte", 1], ["p-americano", 1], ["p-espresso", 1]] },
    { minutes: 11 * 60 + 58, method: "Cash", items: [["p-chicken-sandwich", 1]] },
    { minutes: 11 * 60 + 41, method: "QRIS", items: [["p-cafe-latte", 1], ["p-cappuccino", 1]], refunded: true },
  ],
};

interface DraftSale {
  minutes: number;
  basket: Basket;
  method: PaymentMethod;
  refunded: boolean;
}

function generateOutlet(plan: OutletPlan): Transaction[] {
  const rng = createRandom(plan.seed);
  const days = buildDayPlans(plan, rng);
  const all: Transaction[] = [];
  const cashierPick = () => rng.weighted(plan.cashiers, (c) => c.weight).name;
  const methodPick = () => rng.weighted(METHOD_WEIGHTS, (m) => m.weight).method;

  let previousNonCash = 0;
  let previousDate: string | null = null;

  days.forEach((day, dayIndex) => {
    const isToday = day.date === DEMO_TODAY;
    const fixed = isToday ? TODAY_FIXED[plan.outletId] ?? [] : [];
    const fixedCompleted = fixed.filter((f) => !f.refunded);
    const fixedValueK = fixedCompleted.reduce(
      (s, f) => s + f.items.reduce((a, [id, q]) => a + priceK(id) * q, 0),
      0,
    );

    const openMinutes = 7 * 60;
    const closeMinutes = isToday ? (fixed.length ? 11 * 60 + 50 : 12 * 60 + 40) : 21 * 60 + 45;

    const baskets = Array.from({ length: day.count - fixedCompleted.length }, () => randomBasket(rng));
    balanceBaskets(baskets, day.revenue / 1000 - fixedValueK, rng);

    const drafts: DraftSale[] = baskets.map((basket) => ({
      minutes: randomTime(rng, openMinutes, closeMinutes),
      basket,
      method: methodPick(),
      refunded: false,
    }));

    fixed.forEach((f) => {
      const basket: Basket = new Map();
      f.items.forEach(([id, q]) => addToBasket(basket, id, q));
      drafts.push({ minutes: f.minutes, basket, method: f.method, refunded: !!f.refunded });
    });

    // A handful of historical refunds keep the Refund tab realistic.
    if (!isToday && dayIndex % 11 === 6) {
      drafts.push({ minutes: randomTime(rng, 9 * 60, 20 * 60), basket: randomBasket(rng), method: "QRIS", refunded: true });
    }

    drafts.sort((a, b) => a.minutes - b.minutes);

    let nonCash = 0;
    drafts.forEach((draft, i) => {
      const items = basketToItems(draft.basket);
      const amount = items.reduce((s, it) => s + it.price * it.qty, 0);
      const id = invoiceId(day.date, i + 1);
      const cashier = cashierPick();
      const sale: Transaction = {
        id,
        type: "sale",
        outletId: plan.outletId,
        date: day.date,
        time: minutesToTime(draft.minutes),
        timestamp: timestampOf(day.date, draft.minutes),
        amount,
        method: draft.method,
        status: draft.refunded ? "Refunded" : "Completed",
        items,
        cashier,
        customerId: draft.method === "Cash" ? undefined : `CUST-${rng.int(1000, 1999)}`,
      };
      all.push(sale);
      if (!draft.refunded && draft.method !== "Cash") nonCash += amount;

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
          note: rng.pick(["Customer changed order", "Wrong item prepared", "Duplicate payment"]),
        });
      }
    });

    if (previousDate) {
      const fee = Math.round((previousNonCash * MDR_RATE) / 100) * 100;
      all.push({
        id: `STL-${compactDate(day.date)}-01`,
        type: "settlement",
        outletId: plan.outletId,
        date: day.date,
        time: "06:15",
        timestamp: timestampOf(day.date, 6 * 60 + 15),
        amount: previousNonCash - fee,
        method: "Bank Transfer",
        status: "Completed",
        items: [],
        cashier: "System",
        reference: `Sales of ${formatShortDate(previousDate)}`,
        discount: fee,
      });
    }

    previousNonCash = nonCash;
    previousDate = day.date;
  });

  return all.sort((a, b) => b.timestamp - a.timestamp);
}

const cache = new Map<string, Transaction[]>();

/** All seeded transactions for an outlet, newest first. */
export function getSeedTransactions(outletId: string): Transaction[] {
  if (!PLANS[outletId]) return [];
  if (!cache.has(outletId)) cache.set(outletId, generateOutlet(PLANS[outletId]));
  return cache.get(outletId)!;
}

/** The latest seeded settlement amount still waiting for today's non-cash sales. */
export function pendingSettlement(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === "sale" && t.status === "Completed" && t.date === DEMO_TODAY && t.method !== "Cash")
    .reduce((s, t) => s + t.amount, 0);
}

/** Daily completed-sales series for charts, oldest first. */
export function buildDailySeries(transactions: Transaction[]): DailyPoint[] {
  const map = new Map<string, DailyPoint>();
  const today = parseISODate(DEMO_TODAY);
  for (let i = HISTORY_DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = toISODate(d);
    map.set(iso, { date: iso, label: formatShortDate(iso), revenue: 0, transactions: 0 });
  }
  transactions.forEach((t) => {
    if (t.type !== "sale" || t.status !== "Completed") return;
    const point = map.get(t.date);
    if (!point) return;
    point.revenue += t.amount;
    point.transactions += 1;
  });
  return [...map.values()];
}
