import { Link } from "react-router-dom";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import type { BusinessInsight } from "@/types";
import { SimpleBars, TrendLine } from "@/components/charts/Charts";
import { CHART_NAVY } from "@/data/analytics";
import { formatCompactRupiah } from "@/utils/format";
import { cn } from "@/utils/cn";
import { insightIcons } from "@/components/icons";

const formatters = {
  rupiah: (v: number) => formatCompactRupiah(v),
  percent: (v: number) => `${v.toFixed(0)}%`,
  count: (v: number) => v.toFixed(0),
};

/** Insight + supporting chart + recommendation, as required for every insight. */
export function InsightCard({ insight, showChart = true }: { insight: BusinessInsight; showChart?: boolean }) {
  const Icon = insightIcons[insight.category];
  const TrendIcon = insight.trend === "down" ? TrendingDown : TrendingUp;
  const format = formatters[insight.valueFormat];
  const axisFormat = insight.valueFormat === "rupiah" ? undefined : formatters[insight.valueFormat];
  return (
    <article className="card p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">{insight.category}</p>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold",
                insight.trend === "down" ? "bg-danger-soft text-danger-dark" : insight.trend === "up" ? "bg-success-soft text-success-dark" : "bg-surface text-ink-soft",
              )}
            >
              {insight.trend !== "neutral" && <TrendIcon className="h-3 w-3" />}
              {insight.metric}
            </span>
          </div>
          <h3 className="mt-1 text-[14.5px] font-bold leading-snug text-ink">{insight.title}</h3>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">{insight.detail}</p>
        </div>
      </div>
      {showChart && insight.chart.length > 0 && (
        <div className="-mx-1 mt-3">
          {insight.chartKind === "line" ? (
            <TrendLine
              data={insight.chart}
              xKey="label"
              series={[{ key: "value", color: CHART_NAVY, label: insight.category }]}
              format={format}
              height={140}
              label={insight.title}
              yDomain={["dataMin", "dataMax"]}
            />
          ) : (
            <SimpleBars
              data={insight.chart}
              xKey="label"
              yKey="value"
              format={format}
              height={140}
              highlightKey="highlight"
              label={insight.title}
              axisFormat={axisFormat}
            />
          )}
        </div>
      )}
      <div className="mt-3 rounded-xl bg-gold-50 px-3 py-2.5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-gold-800">Recommended next step</p>
        <p className="mt-0.5 text-[13px] leading-relaxed text-ink">{insight.recommendation}</p>
        {insight.link && (
          <Link to={insight.link} className="mt-1.5 inline-flex items-center gap-1 text-[12.5px] font-semibold text-sky-600">
            Take action <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </article>
  );
}
