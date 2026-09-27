import { AlertOctagon, Bell, Megaphone, Settings2, TrendingUp, Wallet, Wrench, type LucideIcon } from "lucide-react";
import type { AppNotification, NotificationCategory } from "@/types";
import { cn } from "@/utils/cn";

export const notificationMeta: Record<NotificationCategory, { icon: LucideIcon; tone: string }> = {
  Urgent: { icon: AlertOctagon, tone: "bg-danger-soft text-danger-dark" },
  Growth: { icon: TrendingUp, tone: "bg-gold-50 text-gold-700" },
  Finance: { icon: Wallet, tone: "bg-sky-50 text-sky-700" },
  Operations: { icon: Wrench, tone: "bg-navy-50 text-navy" },
  Campaign: { icon: Megaphone, tone: "bg-[#F1EDFD] text-[#6D4FC9]" },
  System: { icon: Settings2, tone: "bg-surface text-ink-soft" },
};

export function NotificationItem({ notification: n, onClick }: { notification: AppNotification; onClick: () => void }) {
  const meta = notificationMeta[n.category] ?? { icon: Bell, tone: "bg-surface text-ink" };
  const Icon = meta.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface/70",
        !n.read && "bg-gold-50/40",
      )}
    >
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", meta.tone)}>
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">{n.category}</span>
          <span className="text-[11px] text-ink-faint">{n.time}</span>
        </span>
        <span className="mt-0.5 block text-[14px] font-semibold text-ink">{n.title}</span>
        <span className="mt-0.5 block text-[13px] leading-snug text-ink-soft">{n.message}</span>
      </span>
      {!n.read && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-gold" aria-label="Unread" />}
    </button>
  );
}
