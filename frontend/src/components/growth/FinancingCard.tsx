import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { FinancingRecommendation } from "@/types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ProgressBar } from "@/components/common/ProgressBar";
import { formatCompactRupiah } from "@/utils/format";
import { cn } from "@/utils/cn";

export function FinancingCard({ product: p, readiness, featured }: { product: FinancingRecommendation; readiness: number; featured?: boolean }) {
  const Icon = p.icon;
  const met = p.readinessFactors.filter((f) => f.met).length;
  const factorReadiness = Math.round((met / p.readinessFactors.length) * 100);
  const shownReadiness = p.recommended ? readiness : factorReadiness;
  return (
    <Link
      to={`/financing/${p.id}`}
      className={cn(
        "block overflow-hidden rounded-3xl border transition-all hover:-translate-y-0.5 active:scale-[0.99]",
        featured ? "hero-navy border-transparent text-white shadow-float" : "border-surface-line bg-white shadow-card",
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", featured ? "bg-white/10 text-gold" : "bg-navy-50 text-navy")}>
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className={cn("text-[15px] font-bold", featured ? "text-white" : "text-ink")}>{p.name}</h3>
              <StatusBadge
                status={p.matchLevel}
                tone={p.matchLevel === "High Match" ? "gold" : p.matchLevel === "Good Match" ? "info" : "neutral"}
                hideIcon
              />
            </div>
            <p className={cn("text-[12.5px]", featured ? "text-white/70" : "text-ink-muted")}>{p.tagline}</p>
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className={cn("text-[11px] font-medium", featured ? "text-white/60" : "text-ink-muted")}>Estimated range</p>
            <p className={cn("tabular text-[17px] font-extrabold", featured ? "text-white" : "text-ink")}>
              {formatCompactRupiah(p.rangeMin, 0)} – {formatCompactRupiah(p.rangeMax, 0)}
            </p>
          </div>
          <ChevronRight className={cn("h-5 w-5", featured ? "text-white/60" : "text-ink-faint")} />
        </div>
        <div className="mt-3">
          <div className={cn("mb-1 flex justify-between text-[11.5px]", featured ? "text-white/70" : "text-ink-muted")}>
            <span>Readiness</span>
            <span className="font-bold">{shownReadiness}%</span>
          </div>
          <ProgressBar value={shownReadiness} tone={featured ? "gold" : "navy"} className={featured ? "bg-white/15" : undefined} />
        </div>
      </div>
    </Link>
  );
}
