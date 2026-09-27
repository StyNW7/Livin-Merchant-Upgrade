import { useMemo } from "react";
import {
  CheckCircle2,
  Clock3,
  MonitorX,
  Megaphone,
  PackageOpen,
  Target,
  type LucideIcon,
} from "lucide-react";
import type {
  AppNotification,
  BusinessInsight,
  GrowthMetric,
  GrowthMission,
  GrowthStage,
  NextAction,
  ReadinessFactor,
  ReadinessLevel,
  Transaction,
} from "@/types";
import { useData, useSession } from "./useApp";
import { DEMO_NOW, DEMO_TODAY, MONTHLY_REVENUE_TARGET, PROFILE_ITEMS } from "@/data/merchant";
import { scenarios } from "@/data/scenarios";
import {
  RETURNING_TARGET,
  SCORE_MONTHS,
  STOCK_AVAILABILITY_TARGET,
  TRANSACTION_MISSION,
  growthStages,
  metricDefinitions,
} from "@/data/growth";
import { customerGrowth } from "@/data/customers";
import { productById } from "@/data/products";
import { notificationTemplates } from "@/data/notifications";
import { lunchComboWeekly } from "@/data/promotions";
import { learningModules } from "@/data/learning";
import { ACTIVE_OUTLET_IDS, outletArea } from "@/data/outlets";
import { buildDailySeries, buildSettlements, timeToMinutes } from "@/data/transactions";
import {
  METHOD_LABEL,
  completedSales,
  dayOfWeekActivity,
  hourlyActivity,
  netAmount,
  periodTotals,
  rangeStart,
  shiftDate,
  sumAmount,
} from "@/data/analytics";
import { dayName, formatCompactRupiah, formatRupiah, formatShortDate } from "@/utils/format";

/* =====================================================================
 * Today & month
 * =================================================================== */

export function useTodayStats(outletOverride?: string) {
  const { transactions, allTransactions, expenses, settings } = useData();
  const { outletId } = useSession();
  const id = outletOverride ?? outletId;
  const list = useMemo(() => (outletOverride ? allTransactions[outletOverride] ?? [] : transactions), [outletOverride, allTransactions, transactions]);
  const goal = settings.dailyGoal;

  return useMemo(() => {
    const today = completedSales(list, DEMO_TODAY);
    const yesterdayISO = shiftDate(DEMO_TODAY, -1);
    const yesterday = completedSales(list, yesterdayISO, yesterdayISO);
    const revenue = sumAmount(today);
    const prevRevenue = sumAmount(yesterday);
    const change = prevRevenue ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;

    // Cumulative sales curve by hour for the hero sparkline.
    let running = 0;
    const curve = Array.from({ length: 16 }, (_, i) => 7 + i).map((hour) => {
      running += today.filter((t) => Number(t.time.slice(0, 2)) === hour).reduce((s, t) => s + netAmount(t), 0);
      return { hour: `${String(hour).padStart(2, "0")}:00`, value: hour * 60 <= timeToMinutes(latestTime(today)) + 59 ? running : null };
    });

    const lunch = today.filter((t) => t.time >= "11:00" && t.time < "14:00");
    const moneyOut = expenses.filter((e) => e.outletId === id && e.date === DEMO_TODAY).reduce((s, e) => s + e.amount, 0);

    return {
      revenue,
      count: today.length,
      average: today.length ? revenue / today.length : 0,
      prevRevenue,
      prevCount: yesterday.length,
      change,
      curve,
      lunchShare: revenue ? (sumAmount(lunch) / revenue) * 100 : 0,
      moneyIn: revenue,
      moneyOut,
      net: revenue - moneyOut,
      goal,
      goalProgress: (revenue / goal) * 100,
      recent: list.filter((t) => t.type === "sale" && t.date === DEMO_TODAY).slice(0, 5),
    };
  }, [list, expenses, id, goal]);
}

function latestTime(sales: Transaction[]) {
  return sales.reduce((max, t) => (t.time > max ? t.time : max), DEMO_NOW);
}

export function useMonthStats(outletOverride?: string) {
  const { transactions, allTransactions, expenses } = useData();
  const { outletId } = useSession();
  const id = outletOverride ?? outletId;
  const list = useMemo(() => (outletOverride ? allTransactions[outletOverride] ?? [] : transactions), [outletOverride, allTransactions, transactions]);
  return useMemo(() => {
    const totals = periodTotals(list, 30);
    const from = rangeStart(30);
    const monthExpenses = expenses.filter((e) => e.outletId === id && e.date >= from && e.date <= DEMO_TODAY);
    const expenseTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);
    return { ...totals, expenses: expenseTotal, profit: totals.revenue - expenseTotal, expenseList: monthExpenses };
  }, [list, expenses, id]);
}

/* =====================================================================
 * Profile strength
 * =================================================================== */

export function useProfileStrength() {
  const { uploadedDocs } = useData();
  return useMemo(() => {
    const items = PROFILE_ITEMS.map((item) => ({
      ...item,
      done: item.id !== "additional-document" || uploadedDocs.includes("additional-document"),
    }));
    const strength = items.filter((i) => i.done).reduce((s, i) => s + i.weight, 0);
    return { items, strength, completed: items.filter((i) => i.done), missing: items.filter((i) => !i.done) };
  }, [uploadedDocs]);
}

/* =====================================================================
 * Inventory alerts
 * =================================================================== */

export interface StockAlert {
  id: string;
  name: string;
  kind: "product" | "ingredient";
  stock: number;
  reorderLevel: number;
  unit: string;
  dailyUsage: number;
  daysLeft: number;
  suggestedQty: number;
}

export function useInventoryAlerts() {
  const { products, ingredients, transactions } = useData();
  return useMemo(() => {
    const weekSales = completedSales(transactions, rangeStart(7));
    const sold = new Map<string, number>();
    weekSales.forEach((t) => t.items.forEach((i) => sold.set(i.productId, (sold.get(i.productId) ?? 0) + i.qty)));

    const productRows: StockAlert[] = products
      .filter((p) => p.active)
      .map((p) => {
        const daily = (sold.get(p.id) ?? 0) / 7;
        return {
          id: p.id,
          name: p.name,
          kind: "product" as const,
          stock: p.stock,
          reorderLevel: p.lowStockThreshold,
          unit: "pcs",
          dailyUsage: daily,
          daysLeft: daily ? p.stock / daily : 99,
          suggestedQty: Math.max(p.lowStockThreshold * 2 - p.stock, Math.ceil(daily * 7)),
        };
      });

    const ingredientRows: StockAlert[] = ingredients.map((i) => ({
      id: i.id,
      name: i.name,
      kind: "ingredient" as const,
      stock: i.stock,
      reorderLevel: i.reorderLevel,
      unit: i.unit,
      dailyUsage: i.dailyUsage,
      daysLeft: i.dailyUsage ? i.stock / i.dailyUsage : 99,
      suggestedQty: Math.ceil(Math.max(i.reorderLevel * 2 - i.stock, i.dailyUsage * 7)),
    }));

    const all = [...productRows, ...ingredientRows];
    const low = all.filter((r) => r.stock <= r.reorderLevel).sort((a, b) => a.daysLeft - b.daysLeft);
    const activeProducts = productRows.length || 1;
    const availability = (productRows.filter((r) => r.stock > r.reorderLevel).length / activeProducts) * 100;
    return { all, productRows, ingredientRows, low, lowProducts: low.filter((r) => r.kind === "product"), availability };
  }, [products, ingredients, transactions]);
}

/* =====================================================================
 * Growth engine
 * =================================================================== */

const MISSION_IMPACT: Record<string, number> = {
  "m-transaction": 2,
  "m-revenue": 3,
  "m-profile": 3,
  "m-customer": 2,
  "m-operations": 2,
  "m-learning": 1,
};

function fmtPct(value: number) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

export function readinessStatus(value: number) {
  return value >= 85 ? "Ready to Explore" : value >= 70 ? "Almost Ready" : "Building Readiness";
}

export function growthStatus(score: number) {
  return score >= 85 ? "Strong Growth" : score >= 70 ? "Healthy Growth" : score >= 60 ? "Building Momentum" : "Getting Started";
}

export function useGrowth() {
  const { scenario, merchant } = useSession();
  const { claimedMissions, learningProgress, allTransactions, transactions } = useData();
  const inventory = useInventoryAlerts();
  const profile = useProfileStrength();
  const config = scenarios[scenario].growth;

  return useMemo(() => {
    /* ---- missions ---- */
    const dailyCounts = buildDailySeries(transactions);
    const window = dailyCounts.slice(-TRANSACTION_MISSION.elapsed);
    const qualifyingDays = window.filter((d) => d.transactions >= TRANSACTION_MISSION.minDaily).length;
    const monthRevenue = sumAmount(completedSales(transactions, rangeStart(30)));
    const cashflowLessons = learningProgress["learn-cashflow"] ?? 0;
    const cashflowModule = learningModules.find((m) => m.id === "learn-cashflow")!;

    const raw: Omit<GrowthMission, "status">[] = [
      {
        id: "m-transaction",
        title: `Maintain ${TRANSACTION_MISSION.minDaily}+ daily transactions for ${TRANSACTION_MISSION.days} days`,
        category: "Transaction",
        progress: Math.min(100, Math.round((qualifyingDays / TRANSACTION_MISSION.days) * 100)),
        reason: "Consistent transaction activity helps create a stronger picture of your business performance.",
        impact: "Supports Transaction Health.",
        impactPoints: MISSION_IMPACT["m-transaction"],
        current: `${qualifyingDays} days`,
        target: `${TRANSACTION_MISSION.days} days`,
        deadline: `${TRANSACTION_MISSION.days - TRANSACTION_MISSION.elapsed} days remaining`,
        steps: ["Open the cashier every operating day", "Record cash sales too, not only QRIS", "Keep at least 20 sales per day"],
        action: { label: "Open Cashier", to: "/cashier" },
      },
      {
        id: "m-revenue",
        title: `Reach Rp ${MONTHLY_REVENUE_TARGET / 1_000_000}M monthly revenue`,
        category: "Revenue",
        progress: Math.min(100, Math.round((monthRevenue / MONTHLY_REVENUE_TARGET) * 1000) / 10),
        reason: "A steady revenue milestone shows your business can sustain a larger operation.",
        impact: "Supports Growth Momentum.",
        impactPoints: MISSION_IMPACT["m-revenue"],
        current: formatCompactRupiah(monthRevenue),
        target: formatCompactRupiah(MONTHLY_REVENUE_TARGET),
        deadline: "Rolling 30 days",
        steps: ["Keep recording every sale", "Run a lunch combo during peak hours", "Promote weekend deals to returning customers"],
        action: { label: "Create Promotion", to: "/promotions" },
      },
      {
        id: "m-profile",
        title: "Complete business information",
        category: "Profile",
        progress: profile.strength,
        reason: "A complete profile helps Livin Merchant understand your business type, scale and history.",
        impact: "Supports Business Profile and Financing Readiness.",
        impactPoints: MISSION_IMPACT["m-profile"],
        current: `${profile.strength}%`,
        target: "100%",
        deadline: "No deadline",
        steps: profile.items.map((i) => i.label),
        action: { label: "Complete Profile", to: "/profile" },
      },
      {
        id: "m-customer",
        title: `Increase returning customers to ${RETURNING_TARGET}%`,
        category: "Customer",
        progress: Math.min(100, Math.round((config.returningRate / RETURNING_TARGET) * 100)),
        reason: "Returning customers make revenue more predictable and cost less to reach.",
        impact: "Supports Customer Retention.",
        impactPoints: MISSION_IMPACT["m-customer"],
        current: `${config.returningRate}%`,
        target: `${RETURNING_TARGET}%`,
        deadline: "End of October",
        steps: ["Activate a loyalty reward", "Send a come-back voucher", "Ask regulars to pay with QRIS so visits are recognized"],
        action: { label: "Open Loyalty", to: "/loyalty" },
      },
      {
        id: "m-operations",
        title: `Maintain product stock availability above ${STOCK_AVAILABILITY_TARGET}%`,
        category: "Operations",
        progress: Math.min(100, Math.round((inventory.availability / STOCK_AVAILABILITY_TARGET) * 100)),
        reason: "Running out of best sellers loses sales and disappoints regular customers.",
        impact: "Supports Operational Consistency.",
        impactPoints: MISSION_IMPACT["m-operations"],
        current: `${Math.round(inventory.availability)}% available`,
        target: `${STOCK_AVAILABILITY_TARGET}%`,
        deadline: "Checked daily",
        steps: ["Restock items below reorder level", "Review Restock Recommendation daily", "Record damaged stock"],
        action: { label: "Open Low Stock", to: "/inventory?tab=low" },
      },
      {
        id: "m-learning",
        title: "Complete Cashflow Basics tutorial",
        category: "Learning",
        progress: Math.round((cashflowLessons / cashflowModule.lessons.length) * 100),
        reason: "Understanding cashflow helps you plan for rent, payroll and supplier bills.",
        impact: "Supports Business Profile.",
        impactPoints: MISSION_IMPACT["m-learning"],
        current: `${cashflowLessons} of ${cashflowModule.lessons.length} lessons`,
        target: `${cashflowModule.lessons.length} lessons`,
        deadline: `${cashflowModule.minutes} min`,
        steps: cashflowModule.lessons.map((l) => l.title),
        action: { label: "Start Lesson", to: "/learn/learn-cashflow" },
      },
    ];
    const missions: GrowthMission[] = raw.map((m) => ({ ...m, status: m.progress >= 100 ? "Completed" : "In Progress" }));
    const claimable = missions.filter((m) => m.status === "Completed" && !claimedMissions.includes(m.id));
    const claimedPoints = missions
      .filter((m) => claimedMissions.includes(m.id) && m.status === "Completed")
      .reduce((s, m) => s + m.impactPoints, 0);

    /* ---- score & metrics ---- */
    const profileBoost = profile.missing.length === 0 ? 12 : 0;
    const metrics: GrowthMetric[] = metricDefinitions.map((def) => {
      const [score, previous] = config.metrics[def.id];
      return { ...def, score: def.id === "business-profile" ? Math.min(100, score + profileBoost) : score, previous };
    });
    const score = Math.min(100, config.score + claimedPoints);
    const stageIndex = [...growthStages].reverse().findIndex((s) => score >= s.min);
    const stage = growthStages[growthStages.length - 1 - stageIndex];
    const nextStage: GrowthStage | null = growthStages[growthStages.indexOf(stage) + 1] ?? null;
    const pointsToNext = nextStage ? nextStage.min - score : 0;
    const stageSpan = nextStage ? nextStage.min - stage.min : 1;
    const stageProgress = nextStage ? ((score - stage.min) / stageSpan) * 100 : 100;
    const history = SCORE_MONTHS.map((month, i) => ({ month, score: i === SCORE_MONTHS.length - 1 ? score : config.history[i] }));

    const improved = metrics
      .filter((m) => m.score > m.previous)
      .sort((a, b) => b.score - b.previous - (a.score - a.previous))
      .slice(0, 3);
    const attention = [...metrics].sort((a, b) => a.score - b.score).slice(0, 2);

    /* ---- stage requirements ---- */
    const periodRevenue = (list: Transaction[], offset: number) =>
      sumAmount(completedSales(list, shiftDate(DEMO_TODAY, -(offset * 30 + 29)), shiftDate(DEMO_TODAY, -(offset * 30))));
    const periods = [2, 1, 0].map((o) =>
      ACTIVE_OUTLET_IDS.reduce((s, id) => s + periodRevenue(allTransactions[id] ?? [], o), 0),
    );
    const stableRevenue = periods[1] >= periods[0] * 0.97 && periods[2] >= periods[1] * 0.97;
    const requirements = [
      { label: "Growth Score 85+", met: score >= 85, detail: `Current score ${score}` },
      { label: "Verified business profile", met: merchant.verificationStatus !== "Pending", detail: "Business identity and owner verified" },
      { label: "Maintain stable revenue for 3 months", met: stableRevenue, detail: stableRevenue ? "Revenue held or grew for 3 months" : "Revenue dropped in the latest month" },
      { label: "Maintain transaction consistency", met: missions[0].progress >= 80, detail: `${missions[0].current} of ${missions[0].target} on track` },
    ];

    /* ---- financing readiness ---- */
    const readiness = Math.min(100, config.readiness + claimedPoints);
    const levelValue: Record<ReadinessLevel, number> = { Strong: 88, Good: 76, "Needs Improvement": 62 };
    const readinessFactors: ReadinessFactor[] = [
      { id: "transaction-history", label: "Transaction History", detail: "Months of steady digital transactions" },
      { id: "revenue-stability", label: "Revenue Stability", detail: stableRevenue ? "Revenue steady over 3 months" : "Revenue dropped this month" },
      { id: "growth-momentum", label: "Growth Momentum", detail: "Month-over-month revenue trend" },
      { id: "business-profile", label: "Business Profile", detail: profile.missing.length ? "One business document still missing" : "All business information complete" },
      { id: "cashflow-consistency", label: "Cashflow Consistency", detail: "Sales cover recorded expenses each month" },
    ].map((f) => {
      const level: ReadinessLevel =
        f.id === "business-profile" && profile.missing.length === 0 ? "Strong" : config.readinessLevels[f.id];
      return { ...f, level, value: levelValue[level] };
    });

    const strengthen: { label: string; impact: "High" | "Medium" | "Low" }[] = [];
    if (profile.missing.length) strengthen.push({ label: "Complete Business Profile", impact: "High" });
    if (!stableRevenue) strengthen.push({ label: "Recover weekly revenue to last month's level", impact: "High" });
    strengthen.push({ label: "Maintain stable transactions for another 30 days", impact: "Medium" });
    if (missions[3].status !== "Completed") strengthen.push({ label: "Bring more customers back with loyalty rewards", impact: "Low" });

    return {
      score,
      previous: config.previous,
      status: growthStatus(score),
      stage,
      nextStage,
      pointsToNext,
      stageProgress,
      metrics,
      history,
      improved,
      attention,
      requirements,
      missions,
      claimable,
      completedMissions: missions.filter((m) => m.status === "Completed").length,
      readiness,
      readinessStatus: readinessStatus(readiness),
      readinessFactors,
      improving: readinessFactors.filter((f) => f.level === "Strong"),
      strengthen,
      periods,
    };
  }, [config, claimedMissions, learningProgress, transactions, allTransactions, inventory.availability, profile, merchant.verificationStatus]);
}

/* =====================================================================
 * Next best actions
 * =================================================================== */

export function useNextActions(): NextAction[] {
  const growth = useGrowth();
  const inventory = useInventoryAlerts();
  const profile = useProfileStrength();
  const month = useMonthStats();

  return useMemo(() => {
    const actions: NextAction[] = [];
    if (profile.missing.length) {
      actions.push({
        id: "a-profile",
        title: "Complete Business Profile",
        priority: "High",
        why: "Missing business information is limiting your Growth Score.",
        cta: "Complete now",
        to: "/profile",
      });
    }
    const revenueMission = growth.missions.find((m) => m.id === "m-revenue")!;
    if (month.growth < 0) {
      actions.push({
        id: "a-recover",
        title: "Recover Weekly Revenue",
        priority: "High",
        why: `Revenue is ${Math.abs(month.growth).toFixed(1)}% lower than last month. A lunch promotion can help.`,
        cta: "Create promotion",
        to: "/promotions",
      });
    } else if (revenueMission.status !== "Completed") {
      actions.push({
        id: "a-revenue",
        title: "Maintain Current Revenue",
        priority: "Medium",
        why: "You are close to completing a 3-month revenue stability milestone.",
        cta: "View mission",
        to: "/growth/missions",
      });
    }
    growth.claimable.slice(0, 1).forEach((m) =>
      actions.push({
        id: `a-claim-${m.id}`,
        title: `Claim "${m.title}"`,
        priority: "Medium",
        why: `This mission is complete. Claiming adds +${m.impactPoints} to your Growth Score.`,
        cta: "Claim",
        to: "/growth/missions",
      }),
    );
    inventory.low.slice(0, 2).forEach((item) =>
      actions.push({
        id: `a-restock-${item.id}`,
        title: `Restock ${item.name}`,
        priority: "Operational",
        why:
          item.daysLeft < 1.5
            ? "Stock may run out by tomorrow."
            : `Stock may run out within approximately ${Math.max(1, Math.round(item.daysLeft))} days.`,
        cta: "Restock",
        to: item.kind === "product" ? "/inventory?tab=low" : "/inventory?tab=ingredients",
      }),
    );
    const order = { High: 0, Medium: 1, Operational: 2 };
    return actions.sort((a, b) => order[a.priority] - order[b.priority]).slice(0, 4);
  }, [growth, inventory.low, profile.missing.length, month.growth]);
}

/* =====================================================================
 * Business insights
 * =================================================================== */

export function useInsights(): BusinessInsight[] {
  const { transactions, allTransactions } = useData();
  const { outletId, scenario } = useSession();
  const inventory = useInventoryAlerts();
  const growth = scenarios[scenario].growth;

  return useMemo(() => {
    const month = completedSales(transactions, rangeStart(30));
    const totals = periodTotals(transactions, 30);

    // Revenue: last three 30-day periods.
    const periodValues = [2, 1, 0].map((o) =>
      sumAmount(completedSales(transactions, shiftDate(DEMO_TODAY, -(o * 30 + 29)), shiftDate(DEMO_TODAY, -(o * 30)))),
    );

    // Products: beverage share.
    const beverage = new Map<string, number>();
    month.forEach((t) =>
      t.items.forEach((i) => {
        const category = productById.get(i.productId)?.category;
        if (category === "Coffee" || category === "Non-Coffee") beverage.set(i.name, (beverage.get(i.name) ?? 0) + i.price * i.qty);
      }),
    );
    const beverageTotal = [...beverage.values()].reduce((a, b) => a + b, 0) || 1;
    const topBeverages = [...beverage.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topShare = topBeverages.length ? (topBeverages[0][1] / beverageTotal) * 100 : 0;

    // Time: average order value by time block.
    const blocks = [
      { label: "07-11", from: "07:00", to: "11:00" },
      { label: "11-14", from: "11:00", to: "14:00" },
      { label: "14-17", from: "14:00", to: "17:00" },
      { label: "17-22", from: "17:00", to: "22:00" },
    ].map((b) => {
      const subset = month.filter((t) => t.time >= b.from && t.time < b.to);
      return { label: b.label, value: subset.length ? sumAmount(subset) / subset.length : 0 };
    });
    const bestBlock = blocks.reduce((a, b) => (b.value > a.value ? b : a), blocks[0]);

    // Outlet comparison.
    const outletRevenue = ACTIVE_OUTLET_IDS.map((id) => ({
      id,
      label: outletArea(id),
      value: sumAmount(completedSales(allTransactions[id] ?? [], rangeStart(30))),
    }));
    const [first, second] = [...outletRevenue].sort((a, b) => b.value - a.value);
    const outletGap = second?.value ? ((first.value - second.value) / second.value) * 100 : 0;

    // Payments: QRIS share of digital transactions (by count).
    const digital = month.filter((t) => t.method !== "Cash");
    const byMethod = ["QRIS", "Debit", "Credit", "Transfer", "Other"].map((m) => ({
      label: METHOD_LABEL[m as keyof typeof METHOD_LABEL].replace("Mandiri ", ""),
      value: digital.length ? (digital.filter((t) => t.method === m).length / digital.length) * 100 : 0,
    }));
    const qrisShare = byMethod[0].value;

    const customerSeries = customerGrowth.map((c, i, arr) => ({
      label: c.month,
      value: i === arr.length - 1 ? growth.returningRate : i === arr.length - 2 ? growth.previousReturningRate : c.returning,
    }));

    const lowItems = inventory.low.slice(0, 4);

    return [
      {
        id: "ins-revenue",
        category: "Revenue",
        title:
          totals.growth >= 0
            ? `Revenue is ${totals.growth.toFixed(1)}% higher than last month.`
            : `Revenue is ${Math.abs(totals.growth).toFixed(1)}% lower than last month.`,
        detail: `${formatCompactRupiah(totals.revenue)} in the last 30 days, compared with ${formatCompactRupiah(totals.prevRevenue)} before.`,
        recommendation:
          totals.growth >= 0
            ? "Keep your lunch combo running to hold this momentum."
            : "Run a weekday promotion to recover traffic on slow days.",
        link: "/reports",
        trend: totals.growth >= 0 ? "up" : "down",
        metric: `${totals.growth >= 0 ? "+" : ""}${totals.growth.toFixed(1)}%`,
        chart: periodValues.map((value, i) => ({ label: ["2 months ago", "Last month", "This month"][i], value, highlight: i === 2 })),
        chartKind: "bar",
        valueFormat: "rupiah",
      },
      {
        id: "ins-product",
        category: "Products",
        title: `${topBeverages[0]?.[0] ?? "Your top drink"} contributes ${topShare.toFixed(0)}% of beverage revenue.`,
        detail: "Your top five drinks make up most of what customers order.",
        recommendation: `Feature ${topBeverages[0]?.[0] ?? "your best seller"} in combos and keep its ingredients well stocked.`,
        link: "/reports?section=product",
        trend: "neutral",
        metric: `${topShare.toFixed(0)}%`,
        chart: topBeverages.map(([label, value], i) => ({ label: label.replace("Kopi Susu Gula Aren", "Kopi Susu"), value: (value / beverageTotal) * 100, highlight: i === 0 })),
        chartKind: "bar",
        valueFormat: "percent",
      },
      {
        id: "ins-customer",
        category: "Customers",
        title:
          growth.returningRate >= growth.previousReturningRate
            ? `Returning customers increased from ${growth.previousReturningRate}% to ${growth.returningRate}%.`
            : `Returning customers dropped from ${growth.previousReturningRate}% to ${growth.returningRate}%.`,
        detail: "Based on repeat QRIS and card payments, identified anonymously.",
        recommendation: "Reward regulars with the Coffee Loyalty program to keep them coming back.",
        link: "/customers",
        trend: growth.returningRate >= growth.previousReturningRate ? "up" : "down",
        metric: `${growth.returningRate}%`,
        chart: customerSeries.map((c, i, arr) => ({ ...c, highlight: i === arr.length - 1 })),
        chartKind: "line",
        valueFormat: "percent",
      },
      {
        id: "ins-time",
        category: "Time",
        title: `${bestBlock.label.replace("-", ":00–")}:00 generates the highest average order value.`,
        detail: `Average order is ${formatRupiah(Math.round(bestBlock.value))} in that window.`,
        recommendation: "Offer an add-on such as a pastry at checkout during this window.",
        link: "/reports?section=time",
        trend: "up",
        metric: formatCompactRupiah(bestBlock.value),
        chart: blocks.map((b) => ({ ...b, highlight: b.label === bestBlock.label })),
        chartKind: "bar",
        valueFormat: "rupiah",
      },
      {
        id: "ins-outlet",
        category: "Outlet",
        title: `${first.label} generates ${outletGap.toFixed(0)}% higher revenue than ${second?.label ?? "your other outlet"}.`,
        detail: "Compared over the last 30 days.",
        recommendation: `Apply ${first.label}'s best-selling bundles at ${second?.label ?? "your other outlet"}.`,
        link: "/outlets",
        trend: "neutral",
        metric: `+${outletGap.toFixed(0)}%`,
        chart: outletRevenue.map((o) => ({ label: o.label, value: o.value, highlight: o.id === outletId })),
        chartKind: "bar",
        valueFormat: "rupiah",
      },
      {
        id: "ins-payment",
        category: "Payments",
        title: `QRIS represents ${qrisShare.toFixed(0)}% of total digital transactions.`,
        detail: "Digital payments settle automatically to your Mandiri business account.",
        recommendation: "Keep the QR stand visible at the counter and on tables.",
        link: "/reports?section=payment",
        trend: "up",
        metric: `${qrisShare.toFixed(0)}%`,
        chart: byMethod.map((m, i) => ({ ...m, highlight: i === 0 })),
        chartKind: "bar",
        valueFormat: "percent",
      },
      {
        id: "ins-operations",
        category: "Operations",
        title: lowItems.length
          ? `${lowItems.length} item${lowItems.length > 1 ? "s are" : " is"} at or below reorder level.`
          : "All items are above their reorder level.",
        detail: lowItems.length ? `${lowItems.map((i) => i.name).join(", ")} need attention.` : "Stock availability is healthy.",
        recommendation: lowItems.length ? "Use Restock Recommendation to create a purchase order." : "Keep reviewing stock daily.",
        link: "/inventory?tab=low",
        trend: lowItems.length ? "down" : "up",
        metric: `${Math.round(inventory.availability)}%`,
        chart: lowItems.map((i) => ({ label: i.name.split(" ")[0], value: Math.round((i.stock / i.reorderLevel) * 100), highlight: true })),
        chartKind: "bar",
        valueFormat: "percent",
      },
    ];
  }, [transactions, allTransactions, outletId, inventory, growth]);
}

/* =====================================================================
 * Business outlook
 * =================================================================== */

export function useOutlook() {
  const { transactions } = useData();
  const inventory = useInventoryAlerts();
  return useMemo(() => {
    const series = buildDailySeries(transactions);
    const recent = series.slice(-15, -1);
    const avg = recent.reduce((s, p) => s + p.revenue, 0) / (recent.length || 1);
    const variance = recent.reduce((s, p) => s + (p.revenue - avg) ** 2, 0) / (recent.length || 1);
    const cv = Math.sqrt(variance) / (avg || 1);
    const projected = avg * 30;
    const low = Math.floor((projected * 0.98) / 1_000_000);
    const high = Math.ceil((projected * 1.02) / 1_000_000);

    const dow = dayOfWeekActivity(series);
    const bestDay = dow.reduce((a, b) => (b.revenue > a.revenue ? b : a), dow[0]);
    const dayNames: Record<string, string> = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" };
    const hours = hourlyActivity(completedSales(transactions, rangeStart(28)), 28);
    let best = 0;
    let bestStart = 11;
    for (let i = 0; i + 4 <= hours.length; i++) {
      const sum = hours.slice(i, i + 4).reduce((s, h) => s + h.value, 0);
      if (sum > best) {
        best = sum;
        bestStart = Number(hours[i].hour);
      }
    }

    const projection = series.slice(-14).map((p) => ({ label: p.label, actual: p.revenue, projected: null as number | null }));
    for (let i = 1; i <= 7; i++) {
      const iso = shiftDate(DEMO_TODAY, i);
      const factor = dow.find((d) => d.day === dayName(iso))!.revenue / (dow.reduce((s, d) => s + d.revenue, 0) / 7 || 1);
      projection.push({ label: formatShortDate(iso), actual: null as unknown as number, projected: Math.round(avg * factor) });
    }
    projection[13] = { ...projection[13], projected: projection[13].actual };

    return {
      rangeLow: low * 1_000_000,
      rangeHigh: high * 1_000_000,
      averageDaily: avg,
      confidence: cv < 0.12 ? "High" : cv < 0.22 ? "Moderate" : "Low",
      busiestPeriod: `${dayNames[bestDay.day]} ${String(bestStart).padStart(2, "0")}:00–${String(bestStart + 4).padStart(2, "0")}:00`,
      likelyLowStock: inventory.all.filter((i) => i.daysLeft <= 7).sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 4),
      projection,
    };
  }, [transactions, inventory.all]);
}

/* =====================================================================
 * Settlements
 * =================================================================== */

export function useSettlements() {
  const { allTransactions } = useData();
  const { merchant } = useSession();
  return useMemo(() => buildSettlements(allTransactions, merchant.accountNumber), [allTransactions, merchant.accountNumber]);
}

/* =====================================================================
 * Attention & notifications
 * =================================================================== */

export interface AttentionItem {
  id: string;
  title: string;
  detail: string;
  icon: LucideIcon;
  tone: "danger" | "warning" | "success" | "info";
  to: string;
}

export function useAttention(): AttentionItem[] {
  const { employees, promotions, devices } = useData();
  const { outletId } = useSession();
  const inventory = useInventoryAlerts();
  const growth = useGrowth();
  const settlements = useSettlements();

  return useMemo(() => {
    const items: AttentionItem[] = [];
    devices
      .filter((d) => d.outletId === outletId && d.status === "Disconnected")
      .forEach((d) =>
        items.push({
          id: `att-device-${d.id}`,
          title: `${d.name} disconnected`,
          detail: "Run troubleshooting to reconnect it",
          icon: MonitorX,
          tone: "danger",
          to: "/devices",
        }),
      );
    inventory.low.slice(0, 2).forEach((i) =>
      items.push({
        id: `att-${i.id}`,
        title: `${i.name} stock below ${i.reorderLevel}`,
        detail: `${formatStock(i.stock)} ${i.unit} left${i.daysLeft < 7 ? `, about ${Math.max(1, Math.round(i.daysLeft))} day${Math.round(i.daysLeft) > 1 ? "s" : ""} of use` : ""}`,
        icon: PackageOpen,
        tone: i.daysLeft < 2 ? "danger" : "warning",
        to: i.kind === "product" ? "/inventory?tab=low" : "/inventory?tab=ingredients",
      }),
    );
    const completed = settlements.find((s) => s.status === "Completed" && s.date === DEMO_TODAY);
    if (completed) {
      items.push({
        id: "att-settlement",
        title: "Settlement completed",
        detail: `${formatRupiah(completed.net)} sent to your business account at ${completed.time}`,
        icon: CheckCircle2,
        tone: "success",
        to: `/settlement/${completed.id}`,
      });
    }
    growth.missions
      .filter((m) => m.status !== "Completed" && m.progress >= 90)
      .slice(0, 1)
      .forEach((m) =>
        items.push({
          id: `att-${m.id}`,
          title: "Growth Mission almost completed",
          detail: `${m.title} - ${fmtPct(m.progress)}%`,
          icon: Target,
          tone: "info",
          to: "/growth/missions",
        }),
      );
    employees
      .filter((e) => e.active && e.outletId === outletId && e.attendance.status === "Not Started" && e.shift.start > DEMO_NOW)
      .slice(0, 1)
      .forEach((e) =>
        items.push({
          id: `att-shift-${e.id}`,
          title: "Employee shift starts soon",
          detail: `${e.name} (${e.role}) starts at ${e.shift.start}`,
          icon: Clock3,
          tone: "info",
          to: "/employees",
        }),
      );
    const tomorrow = shiftDate(DEMO_TODAY, 1);
    promotions
      .filter((p) => p.status === "Active" && p.endsOn === tomorrow)
      .forEach((p) =>
        items.push({
          id: `att-promo-${p.id}`,
          title: "Promotion ending tomorrow",
          detail: `${p.name} ends on ${formatShortDate(tomorrow)}`,
          icon: Megaphone,
          tone: "warning",
          to: `/promotions/${p.id}`,
        }),
      );
    return items;
  }, [inventory.low, settlements, growth.missions, employees, outletId, promotions, devices]);
}

export function formatStock(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function useNotifications(): AppNotification[] {
  const { readNotifications, clearedNotifications, settings, transactions, promotions } = useData();
  const { merchant } = useSession();
  const inventory = useInventoryAlerts();
  const growth = useGrowth();
  const settlements = useSettlements();
  const month = useMonthStats();

  return useMemo(() => {
    const milk = inventory.all.find((i) => i.id === "i-milk");
    const lowNames = inventory.lowProducts.map((i) => i.name);
    const completed = settlements.find((s) => s.status === "Completed");
    const revenueMission = growth.missions.find((m) => m.id === "m-revenue")!;
    const gap = Math.max(0, MONTHLY_REVENUE_TARGET - month.revenue);

    const values: Record<string, string> = {
      milkDays: milk && milk.daysLeft < 1.5 ? "tomorrow" : `in about ${Math.round(milk?.daysLeft ?? 0)} days`,
      milkStock: `${formatStock(milk?.stock ?? 0)} L`,
      lowStockNames: lowNames.slice(0, 2).join(" and ") + (lowNames.length > 2 ? ` and ${lowNames.length - 2} more` : ""),
      lowStockVerb: lowNames.length > 1 ? "are" : "is",
      prevScore: String(growth.previous),
      score: String(growth.score),
      revenueGap: formatCompactRupiah(gap),
      settlement: formatRupiah(completed?.net ?? 0),
      account: merchant.accountNumber,
      readiness: String(growth.readiness),
    };

    const yesterdayISO = shiftDate(DEMO_TODAY, -1);
    const yesterdaySales = completedSales(transactions, yesterdayISO, yesterdayISO);
    const yesterdayRevenue = sumAmount(yesterdaySales);
    const lunch = promotions.find((p) => p.id === "promo-lunch");
    const closedWeeks = lunchComboWeekly.slice(0, -1).reduce((sum, w) => sum + w.revenue, 0);
    values.lunchWeek = formatCompactRupiah(Math.max(0, (lunch?.revenue ?? 0) - closedWeeks));
    values.yesterdayRevenue = formatRupiah(yesterdayRevenue);
    values.yesterdayCount = String(yesterdaySales.length);
    values.yesterdayAverage = formatRupiah(Math.round(yesterdaySales.length ? yesterdayRevenue / yesterdaySales.length : 0));

    return notificationTemplates
      .filter((n) => {
        if (clearedNotifications.includes(n.id)) return false;
        if (!settings.lowStockAlerts && (n.when === "milkLow" || n.when === "stockLow")) return false;
        if (!settings.dailySummary && n.when === "dailySummary") return false;
        if (n.when === "milkLow") return !!milk && milk.stock <= milk.dailyUsage * 2;
        if (n.when === "stockLow") return lowNames.length > 0;
        if (n.when === "missionClose") return revenueMission.status !== "Completed" && revenueMission.progress >= 90;
        return true;
      })
      .map((n) => ({
        id: n.id,
        category: n.category,
        title: n.title,
        link: n.link,
        time: n.time,
        read: n.read || readNotifications.includes(n.id),
        message: n.message.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? ""),
      }));
  }, [inventory, growth, settlements, month.revenue, merchant.accountNumber, readNotifications, clearedNotifications, settings, transactions, promotions]);
}

