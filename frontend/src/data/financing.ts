import { Building2, Store, Wrench } from "lucide-react";
import type { FinancingProduct } from "@/types";

export const FINANCING_DISCLAIMER =
  "Final eligibility and approval remain subject to Bank Mandiri’s assessment and applicable requirements.";

export const SCORE_DISCLAIMER =
  "This score supports business development insights and does not guarantee financing approval.";

export const financingProducts: FinancingProduct[] = [
  {
    id: "working-capital",
    name: "Working Capital",
    tagline: "For operational expansion",
    purpose: "Buy raw materials in bulk, manage cash flow in busy seasons and cover day-to-day operations.",
    rangeMin: 50_000_000,
    rangeMax: 100_000_000,
    tenor: "12 - 36 months",
    icon: Building2,
    reason: "Your revenue consistency and transaction history indicate improving business stability.",
    requirements: [
      "Active Mandiri business account",
      "Business identity number (NIB)",
      "Minimum 6 months of transaction history",
      "Owner ID card (KTP) and tax number (NPWP)",
    ],
    readinessFactors: [
      { label: "9 months of transaction history", met: true },
      { label: "Stable monthly revenue", met: true },
      { label: "Verified owner identity", met: true },
      { label: "Complete business documents", met: false },
    ],
    recommended: true,
    matchLevel: "High Match",
  },
  {
    id: "equipment",
    name: "Equipment Financing",
    tagline: "For machines and equipment",
    purpose: "Upgrade to a dual-group espresso machine, grinders or kitchen equipment that increases capacity.",
    rangeMin: 25_000_000,
    rangeMax: 75_000_000,
    tenor: "12 - 24 months",
    icon: Wrench,
    reason: "Peak-hour demand is 21% above your daily average, so extra capacity can serve more customers.",
    requirements: [
      "Active Mandiri business account",
      "Quotation from the equipment supplier",
      "Minimum 6 months of transaction history",
      "Owner ID card (KTP) and tax number (NPWP)",
    ],
    readinessFactors: [
      { label: "Peak-hour demand above capacity", met: true },
      { label: "Stable monthly revenue", met: true },
      { label: "Supplier quotation", met: false },
    ],
    recommended: true,
    matchLevel: "Good Match",
  },
  {
    id: "expansion",
    name: "Business Expansion",
    tagline: "For outlet expansion",
    purpose: "Fund renovation, deposit and initial stock for the planned BSD outlet.",
    rangeMin: 100_000_000,
    rangeMax: 250_000_000,
    tenor: "24 - 60 months",
    icon: Store,
    reason: "Two active outlets with growing revenue show a repeatable business model.",
    requirements: [
      "Active Mandiri business account",
      "Minimum 12 months of transaction history",
      "Outlet expansion plan and location details",
      "Financial statements for the last 12 months",
    ],
    readinessFactors: [
      { label: "Two outlets actively trading", met: true },
      { label: "12 months of transaction history", met: false },
      { label: "Growth Stage SCALE reached", met: false },
    ],
    recommended: false,
    matchLevel: "Explore",
  },
];
