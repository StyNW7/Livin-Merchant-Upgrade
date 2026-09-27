import { Link } from "react-router-dom";
import { RotateCcw, Wallet, ArrowDownToLine } from "lucide-react";
import type { Transaction } from "@/types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { METHOD_LABEL } from "@/data/analytics";
import { formatRupiah, formatShortDate } from "@/utils/format";
import { DEMO_TODAY } from "@/data/merchant";
import { cn } from "@/utils/cn";
import { methodIcon } from "@/components/icons";

export function TransactionItem({ transaction: t, compact, showDate }: { transaction: Transaction; compact?: boolean; showDate?: boolean }) {
  const Icon = t.type === "refund" ? RotateCcw : t.type === "settlement" ? ArrowDownToLine : methodIcon[t.method] ?? Wallet;
  const title =
    t.type === "settlement" ? "Settlement to business account" : t.type === "refund" ? `Refund ${t.reference ?? ""}` : METHOD_LABEL[t.method];
  const subtitle =
    t.type === "sale" ? `${t.id}${t.channel ? ` · ${t.channel}` : ""}` : t.type === "settlement" ? `${t.id} · ${t.note ?? ""}` : t.note ?? t.id;
  const negative = t.type === "refund";

  return (
    <Link
      to={`/transactions/${t.id}`}
      state={{ outletId: t.outletId }}
      className={cn(
        "flex items-center gap-3 transition-colors hover:bg-surface/70 active:bg-surface",
        compact ? "min-h-[60px] px-4 py-2.5" : "min-h-[68px] px-4 py-3",
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          t.type === "refund" && "bg-danger-soft text-danger-dark",
          t.type === "settlement" && "bg-success-soft text-success-dark",
          t.type === "sale" && (t.method === "QRIS" ? "bg-navy text-gold" : "bg-navy-50 text-navy"),
        )}
      >
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-[14px] font-semibold text-ink">{title}</span>
          {t.isNew && <span className="rounded-full bg-gold-100 px-1.5 text-[10px] font-bold text-gold-800">NEW</span>}
        </span>
        <span className="mt-0.5 block truncate text-[12px] text-ink-muted">{subtitle}</span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        <span className={cn("tabular text-[14px] font-bold", negative ? "text-danger-dark" : t.type === "settlement" ? "text-success-dark" : "text-ink")}>
          {negative ? "-" : t.type === "settlement" ? "+" : ""}
          {formatRupiah(t.amount)}
        </span>
        <span className="flex items-center gap-1.5">
          {t.status !== "Completed" && <StatusBadge status={t.status} className="px-1.5 text-[10px]" />}
          <span className="tabular text-[11.5px] text-ink-muted">
            {showDate || t.date !== DEMO_TODAY ? `${formatShortDate(t.date)}, ` : ""}
            {t.time}
          </span>
        </span>
      </span>
    </Link>
  );
}
