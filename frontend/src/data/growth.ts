import type { GrowthMission, GrowthStage, Insight, ReadinessFactor, ScoreFactor } from "@/types";

export const BASE_GROWTH_SCORE = 78;
export const PREVIOUS_GROWTH_SCORE = 75;
export const BASE_READINESS = 82;
export const NEXT_STAGE_THRESHOLD = 85;

export const growthStatusLabel = (score: number) =>
  score >= 85 ? "Strong Growth" : score >= 70 ? "Healthy Growth" : score >= 50 ? "Building Momentum" : "Getting Started";

export const scoreFactors: ScoreFactor[] = [
  {
    id: "transaction-health",
    label: "Transaction Health",
    score: 84,
    description: "How regularly customers pay you through Livin Merchant.",
    tip: "Keep daily transactions above 40 to hold this level.",
  },
  {
    id: "revenue-stability",
    label: "Revenue Stability",
    score: 79,
    description: "How steady your weekly revenue is, without sharp drops.",
    tip: "Weekday revenue dips on Tuesdays. A weekday promo can steady it.",
  },
  {
    id: "growth-momentum",
    label: "Growth Momentum",
    score: 74,
    description: "Whether your revenue is trending upward month to month.",
    tip: "Revenue grew 10.3% this month. Two more months like this lifts momentum.",
  },
  {
    id: "business-consistency",
    label: "Business Consistency",
    score: 80,
    description: "Open days, operating hours and activity across outlets.",
    tip: "You traded 30 of the last 30 days. Keep it up.",
  },
  {
    id: "business-profile",
    label: "Business Profile",
    score: 72,
    description: "How complete and verified your business information is.",
    tip: "Upload one more business document to raise this score.",
  },
];

export const scoreHistory = [
  { month: "Apr", score: 64 },
  { month: "May", score: 68 },
  { month: "Jun", score: 71 },
  { month: "Jul", score: 73 },
  { month: "Aug", score: 75 },
  { month: "Sep", score: 78 },
];

export const growthStages: GrowthStage[] = [
  {
    id: "BUILD",
    title: "Build",
    description: "Build consistent digital transaction history.",
    range: "Score 0 - 59",
    unlocks: ["Digital payments with QRIS", "Daily sales reports", "Basic business tips"],
  },
  {
    id: "GROW",
    title: "Grow",
    description: "Strengthen revenue stability and business consistency.",
    range: "Score 60 - 84",
    unlocks: ["Growth Missions", "Smart Insights", "Financing Readiness preview"],
  },
  {
    id: "SCALE",
    title: "Scale",
    description: "Demonstrate sustainable growth and financing readiness.",
    range: "Score 85 - 94",
    unlocks: ["Personalized financing discovery", "Multi-outlet benchmarks", "Priority merchant programs"],
  },
  {
    id: "THRIVE",
    title: "Thrive",
    description: "Maintain strong performance and expand your business ecosystem.",
    range: "Score 95 - 100",
    unlocks: ["Dedicated relationship support", "Expansion planning tools", "Ecosystem partnerships"],
  },
];

export const CURRENT_STAGE_INDEX = 1;

export const growthMissions: GrowthMission[] = [
  {
    id: "m-weekly-consistency",
    title: "Maintain Weekly Transaction Consistency",
    progress: 86,
    status: "In Progress",
    whyItMatters:
      "Consistent transaction activity helps create a stronger picture of your business performance.",
    outcome: "Improve Transaction Consistency score",
    deadline: "4 days remaining",
    steps: [
      "Record at least 250 transactions every week",
      "Open the cashier every scheduled operating day",
      "Keep cash sales recorded in Livin Merchant, not only QRIS",
    ],
    metricLabel: "This week",
    current: "215 transactions",
    target: "250 transactions",
    scoreImpact: 2,
    action: { label: "Open Cashier", to: "/cashier" },
  },
  {
    id: "m-business-profile",
    title: "Complete Business Profile",
    progress: 100,
    status: "Completed",
    whyItMatters:
      "A complete profile helps Livin Merchant understand your business type, scale and operating history.",
    outcome: "Business Profile score unlocked",
    deadline: "Completed on 12 Sep 2026",
    steps: ["Add business category and address", "Verify owner identity", "Link Mandiri business account"],
    metricLabel: "Profile items",
    current: "3 of 3 items",
    target: "3 items",
    scoreImpact: 3,
    action: { label: "View Profile", to: "/profile" },
  },
  {
    id: "m-monthly-revenue",
    title: "Reach Rp 50M Monthly Revenue",
    progress: 97,
    status: "In Progress",
    whyItMatters:
      "Reaching a steady revenue milestone shows that your business can sustain a larger operation.",
    outcome: "Strengthen Growth Momentum and Financing Readiness",
    deadline: "5 days remaining",
    steps: [
      "Keep recording every sale in the cashier",
      "Run a lunch bundle during your peak hours",
      "Promote weekend deals to returning customers",
    ],
    metricLabel: "Monthly revenue",
    current: "Rp 48.75M",
    target: "Rp 50M",
    scoreImpact: 3,
    action: { label: "Create Promotion", to: "/promotions" },
  },
];

export const MONTHLY_REVENUE_TARGET = 50_000_000;

export const smartInsights: Insight[] = [
  {
    id: "i-revenue",
    category: "Revenue",
    title: "Revenue increased 10.3% this month.",
    description: "You earned Rp 48.75M in the last 30 days, up from Rp 44.2M the month before.",
    action: "Keep your weekday promotions running to hold this momentum.",
    actionLink: "/reports",
    trend: "up",
    metric: "+10.3%",
  },
  {
    id: "i-peak-hour",
    category: "Peak Hour",
    title: "Your strongest sales period is 11:00–14:00.",
    description: "Lunch-hour transactions are 21% higher than your daily average.",
    action: "Consider adding a lunch bundle between 11:00–14:00.",
    actionLink: "/promotions",
    trend: "up",
    metric: "+21%",
  },
  {
    id: "i-weekend",
    category: "Transaction",
    title: "Weekend transactions are 14% higher than weekdays.",
    description: "Saturdays are your busiest day. Tuesdays are your quietest.",
    action: "Schedule extra staff on Saturday mornings.",
    actionLink: "/employees",
    trend: "up",
    metric: "+14%",
  },
  {
    id: "i-customer",
    category: "Customer",
    title: "Returning-customer activity increased 6%.",
    description: "42% of your non-cash customers came back at least twice this month.",
    action: "Reward loyal customers with a stamp card program.",
    actionLink: "/loyalty",
    trend: "up",
    metric: "+6%",
  },
  {
    id: "i-product",
    category: "Product",
    title: "Croissant sells out before 14:00 on weekdays.",
    description: "Stock ran below 20 units on 4 of the last 5 weekdays.",
    action: "Increase your morning pastry order by 15 pieces.",
    actionLink: "/inventory",
    trend: "neutral",
    metric: "Low stock",
  },
];

export const readinessFactors: ReadinessFactor[] = [
  { id: "r-history", label: "Transaction History", level: "Strong", value: 88, detail: "9 months of steady digital transactions" },
  { id: "r-stability", label: "Revenue Stability", level: "Strong", value: 84, detail: "Weekly revenue varies less than 12%" },
  { id: "r-momentum", label: "Growth Momentum", level: "Good", value: 76, detail: "Revenue up 10.3% month over month" },
  { id: "r-profile", label: "Business Profile", level: "Needs Improvement", value: 64, detail: "One business document still missing" },
];

export const peakHourSeries = [
  { hour: "07", value: 52 },
  { hour: "09", value: 61 },
  { hour: "11", value: 88 },
  { hour: "12", value: 100 },
  { hour: "13", value: 92 },
  { hour: "15", value: 58 },
  { hour: "17", value: 70 },
  { hour: "19", value: 64 },
  { hour: "21", value: 30 },
];

export const returningSeries = [
  { month: "Apr", value: 31 },
  { month: "May", value: 33 },
  { month: "Jun", value: 35 },
  { month: "Jul", value: 37 },
  { month: "Aug", value: 36 },
  { month: "Sep", value: 42 },
];
