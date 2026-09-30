import type { DailyPoint, PaymentMethod, ProductCategory, Transaction } from "@/types";
import { dayName, parseISODate, toISODate } from "@/utils/format";
import { DEMO_TODAY } from "./merchant";
import { PRODUCT_CATEGORIES, productById } from "./products";

export type RangeKey = "7d" | "30d" | "90d";

export const RANGE_DAYS: Record<RangeKey, number> = { "7d": 7, "30d": 30, "90d": 90 };

/**
 * Chart palette derived from the Mandiri brand and validated for color-vision deficiency.
 * Order is fixed: an entity keeps its color regardless of rank.
 */
export const CHART_COLORS = ["#5192F6", "#F2A900", "#0EA5A0", "#8B6FE0", "#F47C5A"] as const;
export const CHART_NAVY = "#5192F6";
export const CHART_GOLD = "#FFB600";
export const CHART_MUTED = "#C7D8F2";

export const PAYMENT_METHODS: PaymentMethod[] = ["QRIS", "Debit", "Credit", "Cash", "Transfer", "Other"];

export const METHOD_LABEL: Record<PaymentMethod | "Bank Transfer", string> = {
  QRIS: "QRIS",
  Debit: "Mandiri Debit",
  Credit: "Credit Card",
  Cash: "Cash",
  Transfer: "Bank Transfer",
  Other: "Other",
  "Bank Transfer": "Bank Transfer",
};

/** Chart groups: Transfer and Other are folded together to stay within five categorical hues. */
export const PAYMENT_GROUPS: { name: string; methods: PaymentMethod[]; color: string }[] = [
  { name: "QRIS", methods: ["QRIS"], color: CHART_COLORS[0] },
  { name: "Cash", methods: ["Cash"], color: CHART_COLORS[1] },
  { name: "Debit", methods: ["Debit"], color: CHART_COLORS[2] },
  { name: "Credit", methods: ["Credit"], color: CHART_COLORS[3] },
  { name: "Transfer & Other", methods: ["Transfer", "Other"], color: CHART_COLORS[4] },
];

export const CATEGORY_COLORS: Record<ProductCategory, string> = {
  Coffee: CHART_COLORS[0],
  "Non-Coffee": CHART_COLORS[3],
  Food: CHART_COLORS[1],
  Snacks: CHART_COLORS[2],
};

export const OUTLET_COLORS: Record<string, string> = {
  "gading-serpong": CHART_COLORS[0],
  "alam-sutera": CHART_COLORS[1],
};

/** Revenue that counts: completed sales minus any partial refund. */
export function netAmount(t: Transaction): number {
  return t.amount - (t.refundedAmount ?? 0);
}

export function isCountedSale(t: Transaction): boolean {
  return t.type === "sale" && (t.status === "Completed" || t.status === "Partially Refunded");
}

export function shiftDate(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function rangeStart(days: number): string {
  return shiftDate(DEMO_TODAY, -(days - 1));
}

export function completedSales(transactions: Transaction[], fromISO: string, toISO = DEMO_TODAY) {
  return transactions.filter((t) => isCountedSale(t) && t.date >= fromISO && t.date <= toISO);
}

export function sumAmount(transactions: Transaction[]) {
  return transactions.reduce((s, t) => s + netAmount(t), 0);
}

export function periodTotals(transactions: Transaction[], days: number) {
  const current = completedSales(transactions, rangeStart(days));
  const prevEnd = shiftDate(rangeStart(days), -1);
  const prevStart = shiftDate(prevEnd, -(days - 1));
  const previous = completedSales(transactions, prevStart, prevEnd);
  const revenue = sumAmount(current);
  const prevRevenue = sumAmount(previous);
  return {
    revenue,
    count: current.length,
    average: current.length ? revenue / current.length : 0,
    prevRevenue,
    prevCount: previous.length,
    prevAverage: previous.length ? prevRevenue / previous.length : 0,
    growth: prevRevenue ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0,
    countGrowth: previous.length ? ((current.length - previous.length) / previous.length) * 100 : 0,
    hasPrevious: previous.length > 0,
  };
}

/** For the 90 day view, aggregate to weeks so the trend stays readable on a phone. */
export function trendSeries(series: DailyPoint[], range: RangeKey) {
  const slice = series.slice(-RANGE_DAYS[range]);
  if (range !== "90d") return slice.map((p) => ({ ...p, average: p.transactions ? p.revenue / p.transactions : 0 }));
  const weeks = [];
  for (let i = slice.length % 7; i < slice.length; i += 7) {
    const chunk = slice.slice(i, i + 7);
    const revenue = chunk.reduce((s, p) => s + p.revenue, 0);
    const transactions = chunk.reduce((s, p) => s + p.transactions, 0);
    weeks.push({ date: chunk[0].date, label: chunk[0].label, revenue, transactions, average: transactions ? revenue / transactions : 0 });
  }
  return weeks;
}

export function paymentDistribution(sales: Transaction[]) {
  const total = sumAmount(sales) || 1;
  return PAYMENT_GROUPS.map((group) => {
    const subset = sales.filter((t) => group.methods.includes(t.method as PaymentMethod));
    const value = sumAmount(subset);
    return { name: group.name, value, count: subset.length, share: (value / total) * 100, color: group.color };
  });
}

export function categoryRevenue(sales: Transaction[]) {
  const totals = new Map<ProductCategory, number>(PRODUCT_CATEGORIES.map((c) => [c, 0]));
  sales.forEach((t) =>
    t.items.forEach((item) => {
      const category = productById.get(item.productId)?.category;
      if (category) totals.set(category, (totals.get(category) ?? 0) + item.price * item.qty);
    }),
  );
  const total = [...totals.values()].reduce((a, b) => a + b, 0) || 1;
  return PRODUCT_CATEGORIES.map((category) => ({
    name: category,
    value: totals.get(category) ?? 0,
    share: ((totals.get(category) ?? 0) / total) * 100,
    color: CATEGORY_COLORS[category],
  }));
}

export function productPerformance(sales: Transaction[], costOf: (productId: string) => number | undefined) {
  const map = new Map<string, { id: string; name: string; qty: number; revenue: number; cost: number }>();
  sales.forEach((t) =>
    t.items.forEach((item) => {
      const entry = map.get(item.productId) ?? { id: item.productId, name: item.name, qty: 0, revenue: 0, cost: 0 };
      entry.qty += item.qty;
      entry.revenue += item.qty * item.price;
      entry.cost += item.qty * (costOf(item.productId) ?? item.price * 0.35);
      map.set(item.productId, entry);
    }),
  );
  return [...map.values()]
    .map((p) => ({ ...p, margin: p.revenue ? ((p.revenue - p.cost) / p.revenue) * 100 : 0 }))
    .sort((a, b) => b.revenue - a.revenue);
}

/** Average transactions and order value per hour of day across the selected days. */
export function hourlyActivity(sales: Transaction[], days: number) {
  const buckets = new Map<number, { count: number; revenue: number }>();
  for (let h = 7; h <= 21; h++) buckets.set(h, { count: 0, revenue: 0 });
  sales.forEach((t) => {
    const b = buckets.get(Number(t.time.slice(0, 2)));
    if (b) {
      b.count += 1;
      b.revenue += netAmount(t);
    }
  });
  return [...buckets.entries()].map(([hour, b]) => ({
    hour: String(hour).padStart(2, "0"),
    label: `${String(hour).padStart(2, "0")}:00`,
    value: Math.round((b.count / days) * 10) / 10,
    revenue: b.revenue / days,
    aov: b.count ? b.revenue / b.count : 0,
  }));
}

export function dayOfWeekActivity(series: DailyPoint[]) {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const recent = series.slice(-28);
  return labels.map((label) => {
    const points = recent.filter((p) => dayName(p.date) === label);
    const revenue = points.reduce((s, p) => s + p.revenue, 0) / (points.length || 1);
    return { day: label, revenue };
  });
}

/** This week (Mon - today) against the same weekdays last week. */
export function weeklyComparison(series: DailyPoint[]) {
  const today = parseISODate(DEMO_TODAY);
  const mondayOffset = (today.getDay() + 6) % 7;
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const byDate = new Map(series.map((p) => [p.date, p]));
  return labels.map((label, i) => {
    const thisDay = new Date(today);
    thisDay.setDate(today.getDate() - mondayOffset + i);
    const lastDay = new Date(thisDay);
    lastDay.setDate(thisDay.getDate() - 7);
    const thisPoint = thisDay <= today ? byDate.get(toISODate(thisDay)) : undefined;
    const lastPoint = byDate.get(toISODate(lastDay));
    return { day: label, thisWeek: thisPoint ? thisPoint.revenue : null, lastWeek: lastPoint ? lastPoint.revenue : null };
  });
}

export function weekdayWeekendLift(series: DailyPoint[]) {
  const recent = series.slice(-29, -1);
  const isWeekend = (p: DailyPoint) => ["Sat", "Sun"].includes(dayName(p.date));
  const avg = (points: DailyPoint[]) => points.reduce((s, p) => s + p.transactions, 0) / (points.length || 1);
  const weekday = avg(recent.filter((p) => !isWeekend(p)));
  return ((avg(recent.filter(isWeekend)) - weekday) / (weekday || 1)) * 100;
}
