import type { Customer } from "@/types";

export const customerSummary = {
  total: 1024,
  returningRate: 42,
  newThisMonth: 116,
  averageVisits: 2.6,
};

export const customerGrowth = [
  { month: "Apr", newCustomers: 88, returning: 31 },
  { month: "May", newCustomers: 94, returning: 33 },
  { month: "Jun", newCustomers: 97, returning: 35 },
  { month: "Jul", newCustomers: 103, returning: 37 },
  { month: "Aug", newCustomers: 109, returning: 36 },
  { month: "Sep", newCustomers: 116, returning: 42 },
];

/**
 * Customers are identified by anonymized IDs derived from QRIS and card payments.
 * No names, phone numbers or account details are exposed.
 */
export const customers: Customer[] = [
  { id: "CUST-1042", label: "Customer #1042", segment: "Loyal", transactions: 38, totalSpending: 1_392_000, lastVisit: "Today", favorite: "Cafe Latte" },
  { id: "CUST-1187", label: "Customer #1187", segment: "Loyal", transactions: 31, totalSpending: 1_148_000, lastVisit: "Today", favorite: "Kopi Susu Gula Aren" },
  { id: "CUST-1305", label: "Customer #1305", segment: "Loyal", transactions: 27, totalSpending: 1_083_000, lastVisit: "Yesterday", favorite: "Caramel Latte" },
  { id: "CUST-1521", label: "Customer #1521", segment: "Regular", transactions: 19, totalSpending: 736_000, lastVisit: "Yesterday", favorite: "Americano" },
  { id: "CUST-1099", label: "Customer #1099", segment: "Regular", transactions: 16, totalSpending: 688_000, lastVisit: "2 days ago", favorite: "Matcha Latte" },
  { id: "CUST-1760", label: "Customer #1760", segment: "Regular", transactions: 14, totalSpending: 602_000, lastVisit: "3 days ago", favorite: "Chicken Sandwich" },
  { id: "CUST-1433", label: "Customer #1433", segment: "Regular", transactions: 12, totalSpending: 455_000, lastVisit: "4 days ago", favorite: "Cafe Latte" },
  { id: "CUST-1904", label: "Customer #1904", segment: "New", transactions: 3, totalSpending: 121_000, lastVisit: "Today", favorite: "Croissant" },
  { id: "CUST-1958", label: "Customer #1958", segment: "New", transactions: 2, totalSpending: 87_000, lastVisit: "Today", favorite: "Cafe Latte" },
  { id: "CUST-1971", label: "Customer #1971", segment: "New", transactions: 1, totalSpending: 38_000, lastVisit: "Yesterday", favorite: "Caramel Latte" },
  { id: "CUST-1268", label: "Customer #1268", segment: "At Risk", transactions: 11, totalSpending: 402_000, lastVisit: "24 days ago", favorite: "Americano" },
  { id: "CUST-1377", label: "Customer #1377", segment: "At Risk", transactions: 9, totalSpending: 318_000, lastVisit: "31 days ago", favorite: "Signature Chocolate" },
];
