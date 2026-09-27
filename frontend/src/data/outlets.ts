import type { Outlet } from "@/types";

export const outlets: Outlet[] = [
  {
    id: "gading-serpong",
    area: "Gading Serpong",
    status: "Active",
    address: "Ruko Golden Madrid II Blok D No. 12, Gading Serpong",
    staffCount: 4,
    openedAt: "January 2025",
    hours: "07:00 - 22:00",
    manager: "Dimas",
  },
  {
    id: "alam-sutera",
    area: "Alam Sutera",
    status: "Active",
    address: "Jl. Alam Sutera Boulevard Kav. 21, Serpong Utara",
    staffCount: 2,
    openedAt: "March 2026",
    hours: "08:00 - 22:00",
    manager: "Bagus",
  },
  {
    id: "bsd",
    area: "BSD",
    status: "Planned",
    address: "BSD Green Office Park area (site survey)",
    staffCount: 0,
    openedAt: "Target Q1 2027",
    hours: "-",
    manager: "To be hired",
  },
];

export const ACTIVE_OUTLET_IDS = outlets.filter((o) => o.status === "Active").map((o) => o.id);

export function outletArea(id: string): string {
  return outlets.find((o) => o.id === id)?.area ?? id;
}
