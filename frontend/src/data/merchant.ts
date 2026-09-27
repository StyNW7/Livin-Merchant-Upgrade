import type { Merchant } from "@/types";

/**
 * The prototype runs on a fixed "demo clock" so every screenshot is stable.
 * 26 September 2026 is a Saturday right after payday, a naturally busy trading day.
 */
export const DEMO_TODAY = "2026-09-26";
export const DEMO_NOW = "12:45";
export const APP_VERSION = "5.2.0";

export const merchantProfile: Merchant = {
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
  merchantId: "LM-7730-2291-04",
  phone: "+62 812-8840-2291",
  email: "andi@kopinusantara.id",
  address: "Ruko Golden Madrid II Blok D No. 12, Gading Serpong, Tangerang",
  accountNumber: "Mandiri Business ****7730",
};

export const guestProfile: Merchant = {
  id: "toko-maju-bersama",
  name: "Toko Maju Bersama",
  owner: "Guest Explorer",
  ownerFirstName: "Explorer",
  initials: "TM",
  businessType: "Cafe & Snacks (Sample)",
  location: "Tangerang",
  memberSince: "Explore Mode",
  businessAge: "2 Years",
  verificationStatus: "Demo",
  merchantId: "DEMO-0000-0000",
  phone: "Hidden in Explore Mode",
  email: "Hidden in Explore Mode",
  address: "Sample address for demonstration",
  accountNumber: "Sample account ****0000",
};

/** Profile strength checklist. The last item can be completed in the app. */
export const PROFILE_ITEMS = [
  { id: "business-identity", label: "Business identity (NIB)", weight: 20 },
  { id: "owner-identity", label: "Owner identity (KTP)", weight: 20 },
  { id: "location", label: "Business location", weight: 16 },
  { id: "business-type", label: "Business type", weight: 16 },
  { id: "business-age", label: "Business age", weight: 16 },
  { id: "additional-document", label: "Additional business document", weight: 12 },
] as const;

export const DAILY_REVENUE_GOAL = 3_500_000;
export const MONTHLY_REVENUE_TARGET = 50_000_000;
