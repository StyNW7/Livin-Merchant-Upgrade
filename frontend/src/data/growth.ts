import type { GrowthStage, MissionCategory } from "@/types";

export const SCORE_DISCLAIMER =
  "This score supports business development insights and does not guarantee financing approval.";

export const OUTLOOK_NOTE = "Projection based on recent recorded activity.";

export const growthStages: GrowthStage[] = [
  {
    id: "BUILD",
    title: "Build",
    description: "Build consistent digital transaction history.",
    range: "Score 0 - 59",
    min: 0,
    unlocks: ["Digital payments with QRIS", "Daily sales reports", "Basic business tips"],
  },
  {
    id: "GROW",
    title: "Grow",
    description: "Strengthen revenue stability and business consistency.",
    range: "Score 60 - 84",
    min: 60,
    unlocks: ["Growth Missions", "Business Insights", "Financing Readiness preview"],
  },
  {
    id: "SCALE",
    title: "Scale",
    description: "Demonstrate sustainable growth and financing readiness.",
    range: "Score 85 - 94",
    min: 85,
    unlocks: ["Personalized financing discovery", "Multi-outlet benchmarks", "Priority merchant programs"],
  },
  {
    id: "THRIVE",
    title: "Thrive",
    description: "Maintain strong performance and expand your business ecosystem.",
    range: "Score 95 - 100",
    min: 95,
    unlocks: ["Dedicated relationship support", "Expansion planning tools", "Ecosystem partnerships"],
  },
];

export const SCORE_MONTHS = ["May", "Jun", "Jul", "Aug", "Sep"];

export const metricDefinitions: { id: string; label: string; description: string; tip: string }[] = [
  {
    id: "transaction-health",
    label: "Transaction Health",
    description: "How regularly customers pay you through Livin Merchant.",
    tip: "Keep recording every sale, including cash, to hold this level.",
  },
  {
    id: "revenue-stability",
    label: "Revenue Stability",
    description: "How steady your weekly revenue is, without sharp drops.",
    tip: "Tuesdays are your quietest day. A weekday promotion can steady revenue.",
  },
  {
    id: "growth-momentum",
    label: "Growth Momentum",
    description: "Whether revenue is trending upward month to month.",
    tip: "Two more months of growth like this month lifts momentum.",
  },
  {
    id: "operational-consistency",
    label: "Operational Consistency",
    description: "Open days, operating hours and stock availability.",
    tip: "Avoid running out of best sellers during peak hours.",
  },
  {
    id: "business-profile",
    label: "Business Profile",
    description: "How complete and verified your business information is.",
    tip: "Upload the additional business document to raise this score.",
  },
  {
    id: "customer-retention",
    label: "Customer Retention",
    description: "How many customers come back to buy again.",
    tip: "A simple loyalty reward can bring regulars back more often.",
  },
];

export const missionCategoryMeta: Record<MissionCategory, { color: string; bg: string }> = {
  Transaction: { color: "#255BB3", bg: "#EEF5FF" },
  Revenue: { color: "#0B7A51", bg: "#E6F6EF" },
  Profile: { color: "#5192F6", bg: "#F0F6FF" },
  Customer: { color: "#6D4FC9", bg: "#F1EDFD" },
  Operations: { color: "#9A6200", bg: "#FFF4DE" },
  Learning: { color: "#7A4B1E", bg: "#F3E9DD" },
};

/** Missions start dates drive the "days" based progress so it stays consistent with transactions. */
export const TRANSACTION_MISSION = { minDaily: 20, days: 14, elapsed: 12 };
export const RETURNING_TARGET = 45;
export const STOCK_AVAILABILITY_TARGET = 90;
