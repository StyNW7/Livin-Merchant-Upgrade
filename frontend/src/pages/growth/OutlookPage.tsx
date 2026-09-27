import { Link } from "react-router-dom";
import { CalendarClock, Gauge, Info, PackageOpen, TrendingUp } from "lucide-react";
import { TopAppBar, PageBody } from "@/components/layout/TopAppBar";
import { ChartCard } from "@/components/charts/ChartKit";
import { TrendLine } from "@/components/charts/Charts";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useOutlook, formatStock } from "@/hooks/useBusiness";
import { OUTLOOK_NOTE } from "@/data/growth";
import { CHART_GOLD, CHART_NAVY } from "@/data/analytics";
import { formatCompactRupiah, formatRupiah } from "@/utils/format";

export default function OutlookPage() {
  const o = useOutlook();
  return (
    <>
      <TopAppBar title="Business Outlook" subtitle="A lightweight look at the next 30 days" backTo="/growth" />
      <PageBody>
        <section className="hero-navy rounded-[28px] p-5 text-white">
          <p className="flex items-center gap-1.5 text-[12px] font-semibold text-white/70">
            <TrendingUp className="h-4 w-4 text-gold" /> Projected monthly revenue
          </p>
          <p className="tabular mt-2 text-[28px] font-extrabold">
            {formatCompactRupiah(o.rangeLow, 0)} – {formatCompactRupiah(o.rangeHigh, 0)}
          </p>
          <p className="mt-1 text-[12.5px] text-white/70">Based on: recent transaction trend (last 14 days)</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[12px] text-white/70">Confidence</span>
            <StatusBadge status={o.confidence} tone={o.confidence === "High" ? "success" : o.confidence === "Moderate" ? "gold" : "warning"} icon={<Gauge className="h-3 w-3" />} />
          </div>
        </section>

        <ChartCard
          question="Where are my sales heading?"
          title="Recent sales and projection"
          legend={[
            { label: "Recorded", color: CHART_NAVY },
            { label: "Projected", color: CHART_GOLD, dashed: true },
          ]}
          insight={`Recent days average ${formatRupiah(Math.round(o.averageDaily))}. The dashed line applies your usual weekday pattern to the next 7 days.`}
        >
          <TrendLine
            data={o.projection}
            xKey="label"
            series={[
              { key: "actual", color: CHART_NAVY, label: "Recorded" },
              { key: "projected", color: CHART_GOLD, label: "Projected", dashed: true },
            ]}
            format={(v) => formatRupiah(v)}
            height={200}
            label="Revenue projection"
          />
        </ChartCard>

        <section className="card divide-y divide-surface-line">
          <div className="flex items-start gap-3 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-50 text-gold-700">
              <CalendarClock className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[12px] text-ink-muted">Expected busiest period</p>
              <p className="text-[15px] font-bold text-ink">{o.busiestPeriod}</p>
              <p className="text-[12px] text-ink-muted">Plan extra staff and stock for this window.</p>
            </div>
          </div>
          <div className="p-4">
            <p className="flex items-center gap-2 text-[12px] text-ink-muted">
              <PackageOpen className="h-4 w-4" /> Likely low-stock items
            </p>
            {o.likelyLowStock.length ? (
              <ul className="mt-2 space-y-2">
                {o.likelyLowStock.map((i) => (
                  <li key={i.id} className="flex items-center justify-between text-[13.5px]">
                    <span className="font-semibold text-ink">{i.name}</span>
                    <span className="text-[12px] text-ink-muted">
                      {formatStock(i.stock)} {i.unit} · about {Math.max(1, Math.round(i.daysLeft))} day{Math.round(i.daysLeft) > 1 ? "s" : ""}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[13px] text-ink-soft">No items are expected to run out this week.</p>
            )}
            <Link to="/inventory?tab=low" className="mt-3 inline-block text-[13px] font-semibold text-sky-600">
              Open Restock Recommendation
            </Link>
          </div>
        </section>

        <p className="flex gap-2 rounded-2xl bg-white px-4 py-3 text-[12px] leading-relaxed text-ink-muted ring-1 ring-surface-line">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          {OUTLOOK_NOTE} It is a planning aid, not a guarantee of future results.
        </p>
      </PageBody>
    </>
  );
}
