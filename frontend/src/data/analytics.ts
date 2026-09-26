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
export const CHART_COLORS = ["#2B5E9C", "#E8A200", "#5192F6", "#0E9F8E", "#8B6FE0"] as const;

export const METHOD_COLORS: Record<PaymentMethod, string> = {
  QRIS: CHART_COLORS[0],
  Cash: CHART_COLORS[1],
  Debit: CHART_COLORS[2],
  Credit: CHART_COLORS[3],
  Other: CHART_COLORS[4],
};

export const CATEGORY_COLORS: Record<ProductCategory, string> = {
  Coffee: CHART_COLORS[0],
  "Non-Coffee": CHART_COLORS[3],
  Food: CHART_COLORS[1],
  Snacks: CHART_COLORS[2],
};

export function rangeStart(days: number): string {
  const d = parseISODate(DEMO_TODAY);
  d.setDate(d.getDate() - (days - 1));
  return toISODate(d);
}

export function completedSales(transactions: Transaction[], fromISO: string, toISO = DEMO_TODAY) {
  return transactions.filter(
    (t) => t.type === "sale" && t.status === "Completed" && t.date >= fromISO && t.date <= toISO,
  );
}

export function sumAmount(transactions: Transaction[]) {
  return transactions.reduce((s, t) => s + t.amount, 0);
}

export function periodTotals(transactions: Transaction[], days: number) {
  const current = completedSales(transactions, rangeStart(days));
  const prevEnd = parseISODate(rangeStart(days));
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - (days - 1));
  const previous = completedSales(transactions, toISODate(prevStart), toISODate(prevEnd));
  const revenue = sumAmount(current);
  const prevRevenue = sumAmount(previous);
  return {
    revenue,
    count: current.length,
    average: current.length ? revenue / current.length : 0,
    prevRevenue,
    prevCount: previous.length,
    growth: prevRevenue ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0,
    countGrowth: previous.length ? ((current.length - previous.length) / previous.length) * 100 : 0,
    hasPrevious: previous.length > 0,
  };
}

/** For the 90 day view, aggregate to weeks so the trend stays readable on a phone. */
export function trendSeries(series: DailyPoint[], range: RangeKey) {
  const days = RANGE_DAYS[range];
  const slice = series.slice(-days);
  if (range !== "90d") return slice;
  const weeks: DailyPoint[] = [];
  for (let i = 0; i < slice.length; i += 7) {
    const chunk = slice.slice(i, i + 7);
    weeks.push({
      date: chunk[0].date,
      label: chunk[0].label,
      revenue: chunk.reduce((s, p) => s + p.revenue, 0),
      transactions: chunk.reduce((s, p) => s + p.transactions, 0),
    });
  }
  return weeks;
}

export function paymentDistribution(sales: Transaction[]) {
  const methods: PaymentMethod[] = ["QRIS", "Cash", "Debit", "Credit", "Other"];
  const total = sumAmount(sales) || 1;
  return methods.map((method) => {
    const subset = sales.filter((t) => t.method === method);
    const value = sumAmount(subset);
    return { name: method, value, count: subset.length, share: (value / total) * 100, color: METHOD_COLORS[method] };
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

export function topProducts(sales: Transaction[], limit = 5) {
  const map = new Map<string, { name: string; qty: number; revenue: number }>();
  sales.forEach((t) =>
    t.items.forEach((item) => {
      const entry = map.get(item.productId) ?? { name: item.name, qty: 0, revenue: 0 };
      entry.qty += item.qty;
      entry.revenue += item.qty * item.price;
      map.set(item.productId, entry);
    }),
  );
  return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}

/** Average transactions per hour of day across the selected days. */
export function hourlyActivity(sales: Transaction[], days: number) {
  const buckets = new Map<number, number>();
  for (let h = 7; h <= 21; h++) buckets.set(h, 0);
  sales.forEach((t) => {
    const hour = Number(t.time.slice(0, 2));
    if (buckets.has(hour)) buckets.set(hour, (buckets.get(hour) ?? 0) + 1);
  });
  return [...buckets.entries()].map(([hour, count]) => ({
    hour: String(hour).padStart(2, "0"),
    label: `${String(hour).padStart(2, "0")}:00`,
    value: Math.round((count / days) * 10) / 10,
  }));
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
    return {
      day: label,
      thisWeek: thisPoint ? thisPoint.revenue : null,
      lastWeek: lastPoint ? lastPoint.revenue : null,
    };
  });
}

export function weekdayWeekendLift(series: DailyPoint[]) {
  const recent = series.slice(-28);
  const weekend = recent.filter((p) => ["Sat", "Sun"].includes(dayName(p.date)));
  const weekday = recent.filter((p) => !["Sat", "Sun"].includes(dayName(p.date)));
  const avg = (points: DailyPoint[]) => points.reduce((s, p) => s + p.transactions, 0) / (points.length || 1);
  return ((avg(weekend) - avg(weekday)) / (avg(weekday) || 1)) * 100;
}
