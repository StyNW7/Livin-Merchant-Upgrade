import type { Customer } from "@/types";

export const customerSummary = {
  total: 1024,
  newThisMonth: 116,
  averageVisits: 2.8,
};

export const customerGrowth = [
  { month: "May", newCustomers: 94, returning: 33 },
  { month: "Jun", newCustomers: 97, returning: 35 },
  { month: "Jul", newCustomers: 103, returning: 37 },
  { month: "Aug", newCustomers: 109, returning: 39 },
  { month: "Sep", newCustomers: 116, returning: 42 },
];

export const visitFrequency = [
  { label: "1 visit", value: 594 },
  { label: "2-3", value: 246 },
  { label: "4-6", value: 118 },
  { label: "7-10", value: 44 },
  { label: "10+", value: 22 },
];

/**
 * Customers are identified by anonymized codes derived from QRIS and card payments.
 * No names, phone numbers or bank details are ever stored or shown.
 */
export const customers: Customer[] = [
  { id: "A-102", label: "Customer A-102", segment: "Loyal", visits: 12, totalSpending: 1_250_000, lastVisit: "Today", favorite: "Cafe Latte", firstVisit: "Feb 2025", averageSpend: 104_000, preferredTime: "Morning" },
  { id: "B-219", label: "Customer B-219", segment: "Loyal", visits: 8, totalSpending: 840_000, lastVisit: "Yesterday", favorite: "Kopi Susu Gula Aren", firstVisit: "Apr 2025", averageSpend: 105_000, preferredTime: "Lunch" },
  { id: "A-087", label: "Customer A-087", segment: "Loyal", visits: 15, totalSpending: 1_120_000, lastVisit: "Today", favorite: "Americano", firstVisit: "Jan 2025", averageSpend: 74_700, preferredTime: "Morning" },
  { id: "C-341", label: "Customer C-341", segment: "Regular", visits: 7, totalSpending: 612_000, lastVisit: "2 days ago", favorite: "Matcha Latte", firstVisit: "Jun 2025", averageSpend: 87_400, preferredTime: "Afternoon" },
  { id: "B-455", label: "Customer B-455", segment: "Regular", visits: 6, totalSpending: 498_000, lastVisit: "3 days ago", favorite: "Chicken Sandwich", firstVisit: "Jul 2025", averageSpend: 83_000, preferredTime: "Lunch" },
  { id: "D-118", label: "Customer D-118", segment: "Regular", visits: 5, totalSpending: 356_000, lastVisit: "4 days ago", favorite: "Caramel Latte", firstVisit: "Aug 2025", averageSpend: 71_200, preferredTime: "Evening" },
  { id: "C-502", label: "Customer C-502", segment: "Regular", visits: 4, totalSpending: 288_000, lastVisit: "Yesterday", favorite: "Cappuccino", firstVisit: "May 2026", averageSpend: 72_000, preferredTime: "Morning" },
  { id: "E-730", label: "Customer E-730", segment: "New", visits: 2, totalSpending: 121_000, lastVisit: "Today", favorite: "Croissant", firstVisit: "Sep 2026", averageSpend: 60_500, preferredTime: "Morning" },
  { id: "E-744", label: "Customer E-744", segment: "New", visits: 1, totalSpending: 87_000, lastVisit: "Today", favorite: "Cafe Latte", firstVisit: "Sep 2026", averageSpend: 87_000, preferredTime: "Lunch" },
  { id: "E-761", label: "Customer E-761", segment: "New", visits: 1, totalSpending: 38_000, lastVisit: "Yesterday", favorite: "Caramel Latte", firstVisit: "Sep 2026", averageSpend: 38_000, preferredTime: "Afternoon" },
  { id: "D-266", label: "Customer D-266", segment: "At Risk", visits: 9, totalSpending: 402_000, lastVisit: "24 days ago", favorite: "Americano", firstVisit: "Mar 2025", averageSpend: 44_700, preferredTime: "Morning" },
  { id: "D-377", label: "Customer D-377", segment: "At Risk", visits: 6, totalSpending: 318_000, lastVisit: "31 days ago", favorite: "Signature Chocolate", firstVisit: "May 2025", averageSpend: 53_000, preferredTime: "Evening" },
];

export const customerValueTiers = [
  { label: "Loyal", value: 3 },
  { label: "Regular", value: 4 },
  { label: "New", value: 3 },
  { label: "At Risk", value: 2 },
];
