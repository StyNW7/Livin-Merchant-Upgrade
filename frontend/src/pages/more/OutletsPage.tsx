import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDownRight, ArrowUpRight, Check, Landmark, MapPin, Medal, Store, Users } from "lucide-react";
import { TopAppBar, PageBody } from "@/components/layout/TopAppBar";
import { Button } from "@/components/common/Button";
import { Segmented } from "@/components/common/FilterChip";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ChartCard } from "@/components/charts/ChartKit";
import { SimpleBars } from "@/components/charts/Charts";
import { useData, useSession, useUI } from "@/hooks/useApp";
import { outlets } from "@/data/outlets";
import { periodTotals } from "@/data/analytics";
import { formatCompactRupiah, formatCount, formatPercent, formatRupiah } from "@/utils/format";
import { cn } from "@/utils/cn";

export default function OutletsPage() {
  const navigate = useNavigate();
  const { allTransactions, employees } = useData();
  const { outletId, setOutletId, merchant } = useSession();
  const { toast } = useUI();
  const [view, setView] = useState<"ranking" | "consolidated">("ranking");

  const stats = useMemo(
    () =>
      outlets
        .filter((o) => o.status === "Active")
        .map((o) => {
          const p = periodTotals(allTransactions[o.id] ?? [], 30);
          return { outlet: o, ...p, staff: employees.filter((e) => e.outletId === o.id && e.active).length };
        })
        .sort((a, b) => b.revenue - a.revenue),
    [allTransactions, employees],
  );

  const total = stats.reduce(
    (acc, s) => ({ revenue: acc.revenue + s.revenue, count: acc.count + s.count, prev: acc.prev + s.prevRevenue }),
    { revenue: 0, count: 0, prev: 0 },
  );
  const totalGrowth = total.prev ? ((total.revenue - total.prev) / total.prev) * 100 : 0;
  const [first, second] = stats;
  const gap = second ? ((first.revenue - second.revenue) / second.revenue) * 100 : 0;

  return (
    <>
      <TopAppBar title="Outlets" subtitle={`${stats.length} active · 1 planned`}>
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: "ranking", label: "Performance ranking" },
            { value: "consolidated", label: "Consolidated view" },
          ]}
        />
      </TopAppBar>
      <PageBody>
        {view === "consolidated" ? (
          <>
            <section className="hero-navy rounded-[28px] p-5 text-white">
              <p className="text-[12px] text-white/85">All outlets · last 30 days</p>
              <p className="tabular mt-1 text-[28px] font-extrabold">{formatRupiah(total.revenue)}</p>
              <p className="mt-1 inline-flex items-center gap-1 text-[12.5px] font-bold text-white">
                <ArrowUpRight className="h-4 w-4" /> {formatPercent(totalGrowth, 1, true)} vs previous 30 days
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/20 pt-3">
                <div>
                  <p className="text-[11.5px] text-white/80">Transactions</p>
                  <p className="text-[17px] font-extrabold">{formatCount(total.count)}</p>
                </div>
                <div>
                  <p className="text-[11.5px] text-white/80">Average order</p>
                  <p className="text-[17px] font-extrabold">{formatRupiah(Math.round(total.revenue / (total.count || 1)))}</p>
                </div>
              </div>
            </section>
            <ChartCard question="Which outlet contributes most?" title="Revenue share" insight={`${first.outlet.area} contributes ${((first.revenue / total.revenue) * 100).toFixed(0)}% of combined revenue.`}>
              <SimpleBars
                data={stats.map((s) => ({ label: s.outlet.area, value: s.revenue, highlight: s.outlet.id === outletId }))}
                xKey="label"
                yKey="value"
                format={formatRupiah}
                highlightKey="highlight"
                height={170}
              />
            </ChartCard>
          </>
        ) : (
          <ChartCard
            question="Which outlet performs best?"
            title="Revenue growth vs last month"
            insight={`${first.outlet.area} generates ${gap.toFixed(0)}% higher revenue than ${second?.outlet.area}.`}
          >
            <SimpleBars
              data={stats.map((s) => ({ label: s.outlet.area, value: Math.round(s.growth * 10) / 10, highlight: true }))}
              xKey="label"
              yKey="value"
              format={(v) => `${v.toFixed(1)}%`}
              axisFormat={(v) => `${v}%`}
              highlightKey="highlight"
              height={160}
            />
          </ChartCard>
        )}

        {stats.map((s, i) => {
          const active = s.outlet.id === outletId;
          const up = s.growth >= 0;
          return (
            <section key={s.outlet.id} className={cn("card p-4", active && "ring-2 ring-navy/15")}>
              <div className="flex items-start gap-3">
                <span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", i === 0 ? "bg-gold text-navy-900" : "bg-navy-50 text-navy-600")}>
                  {i === 0 ? <Medal className="h-5 w-5" /> : <Store className="h-5 w-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">Rank #{i + 1}</p>
                  <p className="text-[15px] font-bold text-ink">
                    {merchant.name} — {s.outlet.area}
                  </p>
                  <p className="flex items-center gap-1 text-[12px] text-ink-muted">
                    <MapPin className="h-3.5 w-3.5" /> {s.outlet.address}
                  </p>
                </div>
                <StatusBadge status="Active" />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Metric label="Revenue" value={formatCompactRupiah(s.revenue)} />
                <Metric label="Transactions" value={formatCount(s.count)} />
                <Metric
                  label="Growth"
                  value={
                    <span className={cn("inline-flex items-center gap-0.5", up ? "text-success-dark" : "text-danger-dark")}>
                      {up ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      {formatPercent(s.growth, 1, true)}
                    </span>
                  }
                />
                <Metric label="Staff" value={<span className="inline-flex items-center gap-1"><Users className="h-4 w-4 text-ink-muted" />{s.staff} active</span>} />
              </div>
              <Button
                block
                variant={active ? "soft" : "primary"}
                className="mt-3"
                disabled={active}
                leftIcon={active ? <Check className="h-4 w-4" /> : undefined}
                onClick={() => {
                  setOutletId(s.outlet.id);
                  toast(`Switched to ${s.outlet.area}`);
                  navigate("/home");
                }}
              >
                {active ? "Current outlet" : "Switch to this outlet"}
              </Button>
            </section>
          );
        })}

        {outlets
          .filter((o) => o.status === "Planned")
          .map((o) => (
            <section key={o.id} className="card border-dashed p-4">
              <div className="flex items-center justify-between">
                <p className="text-[15px] font-bold text-ink">
                  {merchant.name} — {o.area}
                </p>
                <StatusBadge status="Planned" />
              </div>
              <p className="mt-1 text-[12.5px] text-ink-muted">
                {o.address} · {o.openedAt}
              </p>
              <Button block variant="secondary" className="mt-3" leftIcon={<Landmark className="h-4 w-4" />} onClick={() => navigate("/financing/expansion")}>
                Explore Outlet Expansion financing
              </Button>
            </section>
          ))}
      </PageBody>
    </>
  );
}

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl bg-surface px-3 py-2">
      <p className="text-[11px] text-ink-muted">{label}</p>
      <p className="tabular text-[14px] font-extrabold text-ink">{value}</p>
    </div>
  );
}
