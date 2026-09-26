import type { MerchantProfile } from "@/types";

/**
 * The prototype runs on a fixed "demo clock" so every screenshot is stable.
 * 25 September 2026 is a Friday and payday week, which is why today is busier than average.
 */
export const DEMO_TODAY = "2026-09-25";
export const DEMO_NOW = "12:45";

export const merchantProfile: MerchantProfile = {
  id: "kopi-nusantara",
  name: "Kopi Nusantara",
  owner: "Andi Pratama",
  ownerFirstName: "Andi",
  initials: "AP",
  businessType: "Food & Beverage",
  location: "Tangerang",
  memberSince: "January 2025",
  businessAge: "2 Years",
  verificationStatus: "Verified",
  profileCompletion: 88,
  missingItems: ["Additional business document"],
  merchantId: "LM-7730-2291-04",
  phone: "+62 812-8840-2291",
  email: "andi@kopinusantara.id",
  address: "Ruko Golden Madrid II Blok D No. 12, Gading Serpong, Tangerang",
  npwpStatus: "Verified",
  nibStatus: "Verified",
  accountNumber: "Mandiri Business  ****  7730",
};

export const guestProfile: MerchantProfile = {
  id: "toko-maju-bersama",
  name: "Toko Maju Bersama",
  owner: "Guest Explorer",
  ownerFirstName: "Explorer",
  initials: "TM",
  businessType: "Cafe & Snacks (Sample)",
  location: "Tangerang",
  memberSince: "Demo account",
  businessAge: "2 Years",
  verificationStatus: "Demo",
  profileCompletion: 88,
  missingItems: ["Additional business document"],
  merchantId: "DEMO-0000-0000",
  phone: "Not available in Explore Mode",
  email: "Not available in Explore Mode",
  address: "Sample address for demonstration",
  npwpStatus: "Sample",
  nibStatus: "Sample",
  accountNumber: "Sample account",
};

/** Headline business figures from the brief, used where values are not derived from transactions. */
export const businessSummary = {
  monthlyRevenue: 48_750_000,
  previousMonthRevenue: 44_200_000,
  revenueGrowth: 10.3,
  monthlyTransactions: 1284,
  averageTransaction: 37_967,
  returningCustomers: 42,
  financingReadiness: 82,
  financingStatus: "Almost Ready",
  growthScore: 78,
  growthStage: "GROW",
  todaySales: 2_850_000,
  todayTransactions: 76,
  yesterdaySales: 2_629_000,
  yesterdayTransactions: 70,
} as const;
