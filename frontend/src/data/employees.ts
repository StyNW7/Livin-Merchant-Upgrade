import type { Employee, EmployeeRole } from "@/types";

export const initialEmployees: Employee[] = [
  { id: "e-andi", name: "Andi Pratama", role: "Owner", outletId: "gading-serpong", active: true, phone: "+62 812-8840-2291", joinedAt: "Jan 2025", transactionsHandled: 64 },
  { id: "e-dimas", name: "Dimas", role: "Manager", outletId: "gading-serpong", active: true, phone: "+62 813-1022-4410", joinedAt: "Feb 2025", transactionsHandled: 312 },
  { id: "e-rina", name: "Rina", role: "Cashier", outletId: "gading-serpong", active: true, phone: "+62 857-7781-2230", joinedAt: "Mar 2025", transactionsHandled: 908 },
  { id: "e-yoga", name: "Yoga", role: "Cashier", outletId: "gading-serpong", active: false, phone: "+62 821-3345-9012", joinedAt: "Jun 2025", transactionsHandled: 0 },
  { id: "e-sari", name: "Sari", role: "Cashier", outletId: "alam-sutera", active: true, phone: "+62 878-5520-1187", joinedAt: "Mar 2026", transactionsHandled: 701 },
  { id: "e-bagus", name: "Bagus", role: "Manager", outletId: "alam-sutera", active: true, phone: "+62 812-9901-3321", joinedAt: "Mar 2026", transactionsHandled: 244 },
];

export const rolePermissions: Record<EmployeeRole, { summary: string; permissions: string[] }> = {
  Owner: {
    summary: "Full access to every outlet, finance and growth feature.",
    permissions: ["All cashier actions", "Refunds and voids", "Reports and growth", "Financing and settlement", "Staff management"],
  },
  Manager: {
    summary: "Runs daily outlet operations and staff shifts.",
    permissions: ["All cashier actions", "Refunds and voids", "Outlet reports", "Product and stock"],
  },
  Cashier: {
    summary: "Processes sales and prints receipts.",
    permissions: ["Create sales", "Accept payments", "Print and share receipts"],
  },
};

/** Which staff member is on shift per outlet - used as the default cashier on new sales. */
export const cashierOnShift: Record<string, string> = {
  "gading-serpong": "Rina",
  "alam-sutera": "Sari",
};
