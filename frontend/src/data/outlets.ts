import type { Outlet } from "@/types";

export const outlets: Outlet[] = [
  {
    id: "gading-serpong",
    area: "Gading Serpong",
    status: "Active",
    address: "Ruko Golden Madrid II Blok D No. 12, Gading Serpong",
    monthlyRevenue: 48_750_000,
    monthlyTransactions: 1284,
    staffCount: 4,
    performance: 92,
    openedAt: "January 2025",
    hours: "07:00 - 22:00",
  },
  {
    id: "alam-sutera",
    area: "Alam Sutera",
    status: "Active",
    address: "Jl. Alam Sutera Boulevard Kav. 21, Serpong Utara",
    monthlyRevenue: 35_800_000,
    monthlyTransactions: 962,
    staffCount: 3,
    performance: 81,
    openedAt: "March 2026",
    hours: "08:00 - 22:00",
  },
  {
    id: "bsd",
    area: "BSD",
    status: "Planned",
    address: "BSD Green Office Park area (site survey)",
    monthlyRevenue: 0,
    monthlyTransactions: 0,
    staffCount: 0,
    performance: 0,
    openedAt: "Target Q1 2027",
    hours: "-",
  },
];

export const activeOutlets = outlets.filter((o) => o.status === "Active");

export function outletLabel(merchantName: string, outletId: string): string {
  const outlet = outlets.find((o) => o.id === outletId);
  return outlet ? `${merchantName} — ${outlet.area}` : merchantName;
}
