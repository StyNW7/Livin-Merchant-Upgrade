import type { NotificationCategory } from "@/types";

export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  "Urgent",
  "Growth",
  "Finance",
  "Operations",
  "Campaign",
  "System",
];

/**
 * Notification templates. Values in braces are filled from live business data
 * by useNotifications, so messages always match what the rest of the app shows.
 */
export const notificationTemplates: {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  time: string;
  read: boolean;
  link: string;
  when?: "milkLow" | "stockLow" | "missionClose" | "always";
}[] = [
  { id: "n-milk", category: "Urgent", title: "Fresh milk running low", message: "Fresh milk stock may run out {milkDays}. {milkStock} left.", time: "Today, 07:05", read: false, link: "/inventory?tab=ingredients", when: "milkLow" },
  { id: "n-croissant", category: "Urgent", title: "Low stock alert", message: "{lowStockNames} {lowStockVerb} below the reorder level.", time: "Today, 07:32", read: false, link: "/inventory?tab=low", when: "stockLow" },
  { id: "n-score", category: "Growth", title: "Growth Score updated", message: "Your Growth Score changed from {prevScore} to {score}.", time: "Today, 08:10", read: false, link: "/growth/score" },
  { id: "n-mission", category: "Growth", title: "Growth Mission almost done", message: "You are {revenueGap} away from completing this month’s revenue mission.", time: "Today, 08:05", read: false, link: "/growth/missions", when: "missionClose" },
  { id: "n-settlement", category: "Operations", title: "Settlement completed", message: "Settlement of {settlement} completed to {account}.", time: "Today, 06:15", read: false, link: "/settlement" },
  { id: "n-readiness", category: "Finance", title: "Financing readiness", message: "You are approaching financing readiness. Current readiness: {readiness}%.", time: "Yesterday, 19:20", read: true, link: "/growth/readiness" },
  { id: "n-campaign", category: "Campaign", title: "Lunch Combo performance", message: "Lunch Combo generated Rp 1.2M this week.", time: "Yesterday, 15:02", read: true, link: "/promotions/promo-lunch" },
  { id: "n-promo-end", category: "Campaign", title: "Promotion ending tomorrow", message: "Payday Treat ends on 27 Sep. Review its performance.", time: "Yesterday, 10:00", read: true, link: "/promotions/promo-payday" },
  { id: "n-po", category: "Operations", title: "Purchase order sent", message: "PO-0926-001 to PT Rasa Nusantara is waiting for delivery.", time: "Today, 06:50", read: true, link: "/suppliers" },
  { id: "n-system", category: "System", title: "App updated", message: "Livin Merchant 5.2.0 adds Business Outlook and Order Management.", time: "2 days ago", read: true, link: "/growth/outlook" },
  { id: "n-security", category: "System", title: "New login", message: "Your account was accessed from Android POS in Gading Serpong.", time: "Today, 06:38", read: true, link: "/security" },
];
