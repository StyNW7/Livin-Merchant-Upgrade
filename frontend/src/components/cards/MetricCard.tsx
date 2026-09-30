import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/utils/cn";

interface MetricCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  change?: number;
  changeLabel?: string;
  hint?: string;
  tone?: "white" | "navy" | "soft";
  className?: string;
  footer?: ReactNode;
}

/** Compact stat tile. Change is shown with an arrow and sign, never color alone. */
export function MetricCard({ label, value, icon: Icon, change, changeLabel, hint, tone = "white", className, footer }: MetricCardProps) {
  const positive = (change ?? 0) >= 0;
  return (
    <div
      className={cn(
        "rounded-2xl p-3.5",
        tone === "white" && "border border-surface-line bg-white shadow-card",
        tone === "navy" && "hero-navy overflow-hidden text-white shadow-float",
        tone === "soft" && "brand-soft border border-navy-100",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {Icon && (
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-xl",
              tone === "navy" ? "bg-gold text-navy-900" : "bg-navy-50 text-navy-600",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
        <p className={cn("text-[12px] font-medium", tone === "navy" ? "text-white/85" : "text-ink-muted")}>{label}</p>
      </div>
      <p className={cn("tabular mt-2 text-[19px] font-extrabold tracking-tight", tone === "navy" ? "text-white" : "text-ink")}>{value}</p>
      {change !== undefined && (
        <p
          className={cn(
            "mt-0.5 inline-flex items-center gap-0.5 text-[11.5px] font-semibold",
            positive ? "text-success-dark" : "text-danger-dark",
            tone === "navy" && "text-white",
          )}
        >
          {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {positive ? "+" : ""}
          {change.toFixed(1)}% {changeLabel}
        </p>
      )}
      {hint && <p className={cn("mt-0.5 text-[11.5px]", tone === "navy" ? "text-white/80" : "text-ink-muted")}>{hint}</p>}
      {footer}
    </div>
  );
}
