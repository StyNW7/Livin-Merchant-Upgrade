import type { AppSettings } from "@/types";
import { DAILY_REVENUE_GOAL } from "./merchant";

export const DEFAULT_SETTINGS: AppSettings = {
  autoPrint: false,
  receiptFooter: "Thank you for your visit",
  haptics: true,
  lowStockAlerts: true,
  dailySummary: true,
  dailyGoal: DAILY_REVENUE_GOAL,
};

export const VOUCHER_AMOUNT = 10_000;
