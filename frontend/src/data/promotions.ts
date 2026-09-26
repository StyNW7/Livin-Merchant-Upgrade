import type { Promotion } from "@/types";

export const initialPromotions: Promotion[] = [
  {
    id: "promo-lunch",
    name: "Lunch Bundle",
    schedule: "Daily, 11:00–14:00",
    benefit: "10% off",
    status: "Active",
    revenue: 6_240_000,
    transactions: 158,
    redemptions: 142,
    type: "Percentage",
    products: "Any coffee + Chicken Sandwich or Rice Bowl",
  },
  {
    id: "promo-weekend",
    name: "Weekend Coffee Deal",
    schedule: "Saturday–Sunday",
    benefit: "Buy 2 Save 15%",
    status: "Scheduled",
    revenue: 0,
    transactions: 0,
    redemptions: 0,
    type: "Bundle",
    products: "All coffee drinks",
  },
  {
    id: "promo-payday",
    name: "Payday Treat",
    schedule: "25–28 Aug 2026",
    benefit: "Rp 10.000 off above Rp 75.000",
    status: "Ended",
    revenue: 3_880_000,
    transactions: 46,
    redemptions: 46,
    type: "Fixed",
    products: "All menu",
  },
];

export const campaignWeekly = [
  { week: "W1", revenue: 1_320_000, redemptions: 30 },
  { week: "W2", revenue: 1_510_000, redemptions: 34 },
  { week: "W3", revenue: 1_640_000, redemptions: 37 },
  { week: "W4", revenue: 1_770_000, redemptions: 41 },
];

export const loyaltyProgram = {
  name: "Kopi Nusantara Stamp Card",
  rule: "Buy 9 drinks, get the 10th free",
  members: 312,
  rewardsRedeemed: 58,
  repeatRateLift: 9,
};
