import type { ScenarioId } from "@/types";

export interface OutletPlan {
  outletId: string;
  seed: number;
  /** Oldest to newest, 30 days each. The last one is "this month" in the app. */
  periods: { revenue: number; count: number }[];
  today: { revenue: number; count: number };
  yesterday: { revenue: number; count: number };
  cashiers: { name: string; weight: number }[];
}

export interface Scenario {
  id: ScenarioId;
  name: string;
  description: string;
  plans: Record<string, OutletPlan>;
  growth: {
    score: number;
    previous: number;
    history: number[];
    metrics: Record<string, [number, number]>;
    readiness: number;
    readinessLevels: Record<string, "Strong" | "Good" | "Needs Improvement">;
    returningRate: number;
    previousReturningRate: number;
  };
  /** Stock overrides applied on top of the catalog (operational issue scenario). */
  stockOverrides: Record<string, number>;
}

const GS_CASHIERS = [
  { name: "Rina", weight: 7 },
  { name: "Dimas", weight: 3 },
];
const AS_CASHIERS = [
  { name: "Sari", weight: 7 },
  { name: "Bagus", weight: 3 },
];

export const scenarios: Record<ScenarioId, Scenario> = {
  A: {
    id: "A",
    name: "Healthy merchant",
    description: "Growing steadily. Growth Score 78, financing readiness 82%.",
    plans: {
      "gading-serpong": {
        outletId: "gading-serpong",
        seed: 20250125,
        periods: [
          { revenue: 41_100_000, count: 1122 },
          { revenue: 44_200_000, count: 1196 },
          { revenue: 48_750_000, count: 1284 },
        ],
        today: { revenue: 2_850_000, count: 76 },
        yesterday: { revenue: 2_629_000, count: 70 },
        cashiers: GS_CASHIERS,
      },
      "alam-sutera": {
        outletId: "alam-sutera",
        seed: 20260301,
        periods: [
          { revenue: 31_200_000, count: 858 },
          { revenue: 34_030_000, count: 921 },
          { revenue: 35_800_000, count: 962 },
        ],
        today: { revenue: 2_040_000, count: 55 },
        yesterday: { revenue: 1_866_000, count: 51 },
        cashiers: AS_CASHIERS,
      },
    },
    growth: {
      score: 78,
      previous: 75,
      history: [68, 71, 73, 75, 78],
      metrics: {
        "transaction-health": [84, 82],
        "revenue-stability": [79, 76],
        "growth-momentum": [74, 73],
        "operational-consistency": [81, 79],
        "business-profile": [72, 72],
        "customer-retention": [76, 75],
      },
      readiness: 82,
      readinessLevels: {
        "transaction-history": "Strong",
        "revenue-stability": "Strong",
        "growth-momentum": "Good",
        "business-profile": "Needs Improvement",
        "cashflow-consistency": "Good",
      },
      returningRate: 42,
      previousReturningRate: 39,
    },
    stockOverrides: {},
  },
  B: {
    id: "B",
    name: "Almost financing-ready",
    description: "Strong three-month run. Growth Score 84, one step from SCALE.",
    plans: {
      "gading-serpong": {
        outletId: "gading-serpong",
        seed: 20250311,
        periods: [
          { revenue: 43_400_000, count: 1170 },
          { revenue: 46_600_000, count: 1236 },
          { revenue: 51_200_000, count: 1331 },
        ],
        today: { revenue: 3_120_000, count: 81 },
        yesterday: { revenue: 2_760_000, count: 72 },
        cashiers: GS_CASHIERS,
      },
      "alam-sutera": {
        outletId: "alam-sutera",
        seed: 20260411,
        periods: [
          { revenue: 33_100_000, count: 896 },
          { revenue: 35_400_000, count: 952 },
          { revenue: 38_300_000, count: 1018 },
        ],
        today: { revenue: 2_210_000, count: 59 },
        yesterday: { revenue: 1_980_000, count: 53 },
        cashiers: AS_CASHIERS,
      },
    },
    growth: {
      score: 84,
      previous: 80,
      history: [72, 75, 78, 80, 84],
      metrics: {
        "transaction-health": [89, 86],
        "revenue-stability": [86, 82],
        "growth-momentum": [83, 79],
        "operational-consistency": [85, 83],
        "business-profile": [76, 72],
        "customer-retention": [80, 78],
      },
      readiness: 84,
      readinessLevels: {
        "transaction-history": "Strong",
        "revenue-stability": "Strong",
        "growth-momentum": "Strong",
        "business-profile": "Good",
        "cashflow-consistency": "Strong",
      },
      returningRate: 45,
      previousReturningRate: 41,
    },
    stockOverrides: {},
  },
  C: {
    id: "C",
    name: "Operational issue",
    description: "Sales are slipping and several items are running low.",
    plans: {
      "gading-serpong": {
        outletId: "gading-serpong",
        seed: 20250707,
        periods: [
          { revenue: 46_300_000, count: 1250 },
          { revenue: 47_900_000, count: 1270 },
          { revenue: 44_100_000, count: 1190 },
        ],
        today: { revenue: 1_640_000, count: 47 },
        yesterday: { revenue: 1_860_000, count: 52 },
        cashiers: GS_CASHIERS,
      },
      "alam-sutera": {
        outletId: "alam-sutera",
        seed: 20260808,
        periods: [
          { revenue: 34_800_000, count: 940 },
          { revenue: 35_200_000, count: 948 },
          { revenue: 32_400_000, count: 880 },
        ],
        today: { revenue: 1_380_000, count: 39 },
        yesterday: { revenue: 1_540_000, count: 43 },
        cashiers: AS_CASHIERS,
      },
    },
    growth: {
      score: 71,
      previous: 75,
      history: [70, 73, 75, 75, 71],
      metrics: {
        "transaction-health": [76, 81],
        "revenue-stability": [68, 75],
        "growth-momentum": [58, 70],
        "operational-consistency": [66, 78],
        "business-profile": [72, 72],
        "customer-retention": [73, 75],
      },
      readiness: 68,
      readinessLevels: {
        "transaction-history": "Strong",
        "revenue-stability": "Needs Improvement",
        "growth-momentum": "Needs Improvement",
        "business-profile": "Needs Improvement",
        "cashflow-consistency": "Good",
      },
      returningRate: 38,
      previousReturningRate: 41,
    },
    stockOverrides: {
      "p-croissant": 6,
      "p-chicken-sandwich": 4,
      "p-matcha-latte": 9,
      "p-caramel-latte": 11,
    },
  },
};

export const SCENARIO_IDS: ScenarioId[] = ["A", "B", "C"];
