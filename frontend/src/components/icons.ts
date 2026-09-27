/**
 * Icon maps shared across screens. Kept in a plain module so component files only export
 * components (required for fast refresh).
 */
import {
  AlertOctagon,
  Banknote,
  Bike,
  BookOpen,
  Building,
  Carrot,
  CircleDollarSign,
  Clock3,
  Coffee,
  Cookie,
  CreditCard,
  CupSoda,
  Landmark,
  Megaphone,
  MoreHorizontal,
  PackageCheck,
  PackageSearch,
  QrCode,
  Receipt,
  Sandwich,
  Settings2,
  ShoppingBag,
  Store,
  TrendingUp,
  Users,
  Wallet,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { BusinessInsight, ExpenseCategory, MissionCategory, NotificationCategory, ProductCategory } from "@/types";

export const notificationMeta: Record<NotificationCategory, { icon: LucideIcon; tone: string }> = {
  Urgent: { icon: AlertOctagon, tone: "bg-danger-soft text-danger-dark" },
  Growth: { icon: TrendingUp, tone: "bg-gold-50 text-gold-700" },
  Finance: { icon: Wallet, tone: "bg-sky-50 text-sky-700" },
  Operations: { icon: Wrench, tone: "bg-navy-50 text-navy" },
  Campaign: { icon: Megaphone, tone: "bg-[#F1EDFD] text-[#6D4FC9]" },
  System: { icon: Settings2, tone: "bg-surface text-ink-soft" },
};

export const methodIcon: Record<string, LucideIcon> = {
  QRIS: QrCode,
  Debit: CreditCard,
  Credit: CreditCard,
  Cash: Banknote,
  Transfer: Landmark,
  Other: Wallet,
  "Bank Transfer": Landmark,
};

export const categoryIcon: Record<ProductCategory, LucideIcon> = {
  Coffee: Coffee,
  "Non-Coffee": CupSoda,
  Food: Sandwich,
  Snacks: Cookie,
};

export const insightIcons: Record<BusinessInsight["category"], LucideIcon> = {
  Revenue: Wallet,
  Products: ShoppingBag,
  Customers: Users,
  Time: Clock3,
  Outlet: Store,
  Payments: CreditCard,
  Operations: PackageSearch,
};

export const missionIcons: Record<MissionCategory, LucideIcon> = {
  Transaction: Receipt,
  Revenue: CircleDollarSign,
  Profile: Store,
  Customer: Users,
  Operations: PackageCheck,
  Learning: BookOpen,
};

export const expenseIcons: Record<ExpenseCategory, LucideIcon> = {
  Rent: Building,
  Ingredients: Carrot,
  Salary: Users,
  Utilities: Zap,
  Marketing: Megaphone,
  Delivery: Bike,
  Equipment: Wrench,
  Others: MoreHorizontal,
};
