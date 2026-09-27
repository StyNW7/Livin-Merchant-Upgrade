import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Receipt, Repeat, ShoppingBasket, Wallet } from "lucide-react";
import { TopAppBar, PageBody } from "@/components/layout/TopAppBar";
import { ChipRow, FilterChip, Segmented } from "@/components/common/FilterChip";
import { ErrorState, PageSkeleton } from "@/components/common/PageSkeleton";
import { MetricCard } from "@/components/cards/MetricCard";
import { ChartCard } from "@/components/charts/ChartKit";
import { Donut, GroupedBars, RankBars, SimpleBars, TrendArea, TrendLine } from "@/components/charts/Charts";
import { useData, useSession } from "@/hooks/useApp";
import { useSimulatedLoad } from "@/hooks/useSimulatedLoad";
import { buildDailySeries } from "@/data/transactions";
import {
  CHART_COLORS,
  CHART_NAVY,
  RANGE_DAYS,
  categoryRevenue,
  completedSales,
  dayOfWeekActivity,
  hourlyActivity,
  paymentDistribution,
  periodTotals,
  productPerformance,
  rangeStart,
  trendSeries,
  weeklyComparison,
  type RangeKey,
} from "@/data/analytics";
import { customerGrowth, customerValueTiers, visitFrequency } from "@/data/customers";
import { scenarios } from "@/data/scenarios";
import { ACTIVE_OUTLET_IDS, outletArea } from "@/data/outlets";
import { formatCompactRupiah, formatCount, formatRupiah } from "@/utils/format";

const SECTIONS = [
  ["overview", "Overview"],
  ["sales", "Sales"],
  ["product", "Product"],
  ["customer", "Customer"],
  ["time", "Time"],
  ["payment", "Payment"],
  ["outlet", "Outlet"],
] as const;

export default function ReportsPage() {
  const [params] = useSearchParams();
  const { transactions, allTransactions, products } = useData();
  const { outletName, scenario, outletId } = useSession();
  const { status, retry } = useSimulatedLoad(350);
  const [range, setRange] = useState<RangeKey>("30d");
  const [section, setSection] = useState<string>(params.get("section") ?? "overview");
  const days = RANGE_DAYS[range];
  const growth = scenarios[scenario].growth;

  useEffect(() => {
    const s = params.get("section");
    if (s && status === "ready") window.setTimeout(() => document.getElementById(`sec-${s}`)?.scrollIntoView({ behavior: "smooth" }), 80);
  }, [params, status]);

  const data = useMemo(() => {
    const series = buildDailySeries(transactions);
    const sales = completedSales(transactions, rangeStart(days));
    const totals = periodTotals(transactions, days);
    const trend = trendSeries(series, range);
    const products30 = productPerformance(sales, (id) => products.find((p) => p.id === id)?.costPrice);
    const categories = categoryRevenue(sales);
    const hours = hourlyActivity(sales, days);
    const peak = hours.reduce((a, b) => (b.value > a.value ? b : a), hours[0]);
    const dow = dayOfWeekActivity(series);
    const bestDay = dow.reduce((a, b) => (b.revenue > a.revenue ? b : a), dow[0]);
    const weekly = weeklyComparison(series);
    const payments = paymentDistribution(sales);
    const outletsData = ACTIVE_OUTLET_IDS.map((id) => {
      const p = periodTotals(allTransactions[id] ?? [], days);
      return { label: outletArea(id), revenue: p.revenue, growth: p.growth, count: p.count, highlight: id === outletId };
    });
    return { series, sales, totals, trend, products30, categories, hours, peak, dow, bestDay, weekly, payments, outletsData };
  }, [transactions, allTransactions, products, days, range, outletId]);

  const jump = (id: string) => {
    setSection(id);
    document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const rangeLabel = range === "7d" ? "7 days" : range === "30d" ? "30 days" : "90 days";
  const top = data.products30[0];
  const coffee = data.categories.find((c) => c.name === "Coffee");
  const topMargin = [...data.products30].filter((p) => p.qty >= 5).sort((a, b) => b.margin - a.margin).slice(0, 5);
  const qris = data.payments.find((p) => p.name === "QRIS");
  const weekThis = data.weekly.reduce((s, d) => s + (d.thisWeek ?? 0), 0);
  const weekLastSameDays = data.weekly.filter((d) => d.thisWeek !== null).reduce((s, d) => s + (d.lastWeek ?? 0), 0);

  return (
    <>
      <TopAppBar title="Business Analytics" subtitle={outletName} backTo="/more">
        <Segmented
          value={range}
          onChange={setRange}
          options={[
            { value: "7d", label: "7 days" },
            { value: "30d", label: "30 days" },
            { value: "90d", label: "90 days" },
          ]}
        />
        <ChipRow className="mt-2">
          {SECTIONS.map(([id, label]) => (
            <FilterChip key={id} label={label} active={section === id} onClick={() => jump(id)} />
          ))}
        </ChipRow>
      </TopAppBar>

      {status === "loading" ? (
        <PageSkeleton />
      ) : status === "error" ? (
        <PageBody>
          <ErrorState message="Unable to load business analytics." onRetry={retry} />
        </PageBody>
      ) : (
        <PageBody>
          <section id="sec-overview" className="scroll-mt-40 space-y-3">
            <h2 className="text-[16px] font-bold text-ink">Overview · last {rangeLabel}</h2>
            <div className="grid grid-cols-2 gap-3">
              <MetricCard icon={Wallet} label="Revenue" value={formatCompactRupiah(data.totals.revenue)} change={data.totals.hasPrevious ? data.totals.growth : undefined} changeLabel="vs prev." />
              <MetricCard icon={Receipt} label="Transactions" value={formatCount(data.totals.count)} change={data.totals.hasPrevious ? data.totals.countGrowth : undefined} changeLabel="vs prev." />
              <MetricCard
                icon={ShoppingBasket}
                label="Average Order"
                value={formatRupiah(Math.round(data.totals.average))}
                change={data.totals.prevAverage ? ((data.totals.average - data.totals.prevAverage) / data.totals.prevAverage) * 100 : undefined}
                changeLabel="vs prev."
              />
              <MetricCard icon={Repeat} label="Customer Return Rate" value={`${growth.returningRate}%`} hint={`${growth.previousReturningRate}% last month`} />
            </div>
          </section>

          <section id="sec-sales" className="scroll-mt-40 space-y-3">
            <h2 className="text-[16px] font-bold text-ink">Sales</h2>
            <ChartCard
              question="How are my sales changing?"
              title={range === "90d" ? "Weekly revenue" : "Daily revenue"}
              insight={
                data.totals.hasPrevious
                  ? `Revenue is ${data.totals.growth >= 0 ? "up" : "down"} ${Math.abs(data.totals.growth).toFixed(1)}% compared with the previous ${rangeLabel}.`
                  : "Not enough history to compare with the previous period."
              }
            >
              <TrendArea data={data.trend} xKey="label" yKey="revenue" format={formatRupiah} label="Revenue trend" />
            </ChartCard>
            <ChartCard question="Are more customers paying?" title="Transactions trend" insight={`${formatCount(data.totals.count)} transactions, about ${Math.round(data.totals.count / days)} per day.`}>
              <SimpleBars data={data.trend} xKey="label" yKey="transactions" format={(v) => `${formatCount(v)} transactions`} axisFormat={(v) => String(v)} height={160} />
            </ChartCard>
            <ChartCard question="Are customers spending more per visit?" title="Average order value" insight={`Average order is ${formatRupiah(Math.round(data.totals.average))} in this period.`}>
              <TrendLine data={data.trend} xKey="label" series={[{ key: "average", color: CHART_NAVY, label: "Average order" }]} format={formatRupiah} height={160} yDomain={["dataMin", "dataMax"]} />
            </ChartCard>
            <ChartCard
              question="Is this week better than last week?"
              title="Weekly comparison"
              legend={[
                { label: "This week", color: CHART_COLORS[0] },
                { label: "Last week", color: CHART_COLORS[1] },
              ]}
              insight={`So far this week you earned ${formatCompactRupiah(weekThis)}, ${weekThis >= weekLastSameDays ? "ahead of" : "behind"} the same days last week (${formatCompactRupiah(weekLastSameDays)}).`}
            >
              <GroupedBars
                data={data.weekly}
                xKey="day"
                series={[
                  { key: "thisWeek", color: CHART_COLORS[0], label: "This week" },
                  { key: "lastWeek", color: CHART_COLORS[1], label: "Last week" },
                ]}
                format={formatRupiah}
              />
            </ChartCard>
          </section>

          <section id="sec-product" className="scroll-mt-40 space-y-3">
            <h2 className="text-[16px] font-bold text-ink">Product</h2>
            <ChartCard question="Which products sell best?" title="Top-selling products" insight={top ? `${top.name} leads with ${formatCount(top.qty)} sold and ${formatCompactRupiah(top.revenue)} revenue.` : undefined}>
              <RankBars data={data.products30.slice(0, 6)} labelKey="name" valueKey="revenue" format={formatRupiah} />
            </ChartCard>
            <ChartCard question="Which category drives sales?" title="Revenue by category" insight={coffee ? `Coffee contributes ${coffee.share.toFixed(0)}% of total sales in this period.` : undefined}>
              <Donut data={data.categories} format={formatRupiah} centerLabel="Total" centerValue={formatCompactRupiah(data.categories.reduce((s, c) => s + c.value, 0))} />
            </ChartCard>
            <ChartCard question="Where do I earn the most per item?" title="Product margin" insight={topMargin[0] ? `${topMargin[0].name} has your best margin at ${topMargin[0].margin.toFixed(0)}%. Feature it in combos.` : undefined}>
              <div className="divide-y divide-surface-line px-1">
                {topMargin.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2 text-[13px]">
                    <span className="min-w-0 truncate font-semibold text-ink">{p.name}</span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="text-ink-muted">{formatCompactRupiah(p.revenue - p.cost)} profit</span>
                      <span className="w-10 text-right font-extrabold text-success-dark">{p.margin.toFixed(0)}%</span>
                    </span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </section>

          <section id="sec-customer" className="scroll-mt-40 space-y-3">
            <h2 className="text-[16px] font-bold text-ink">Customer</h2>
            <ChartCard question="Am I gaining new customers?" title="New customers per month" insight={`${customerGrowth[customerGrowth.length - 1].newCustomers} new customers this month, the highest in five months.`}>
              <SimpleBars data={customerGrowth} xKey="month" yKey="newCustomers" format={(v) => `${v} customers`} axisFormat={(v) => String(v)} height={150} />
            </ChartCard>
            <ChartCard
              question="Do customers come back?"
              title="Returning customer rate"
              insight={`${growth.returningRate}% of identified customers returned this month, ${growth.returningRate >= growth.previousReturningRate ? "up" : "down"} from ${growth.previousReturningRate}%.`}
            >
              <TrendLine
                data={customerGrowth.map((c, i, arr) => ({ month: c.month, rate: i === arr.length - 1 ? growth.returningRate : i === arr.length - 2 ? growth.previousReturningRate : c.returning }))}
                xKey="month"
                series={[{ key: "rate", color: CHART_NAVY, label: "Returning" }]}
                format={(v) => `${v}%`}
                height={150}
                yDomain={[25, 50]}
              />
            </ChartCard>
            <ChartCard question="How often do customers visit?" title="Visit frequency" insight="Most customers visit once. Moving 1-visit customers to a second visit is the biggest opportunity.">
              <SimpleBars data={visitFrequency} xKey="label" yKey="value" format={(v) => `${v} customers`} axisFormat={(v) => String(v)} height={150} />
            </ChartCard>
            <ChartCard question="Who are my most valuable customers?" title="Customer value" insight="Loyal customers spend over Rp 1M each in total. Keep them engaged with rewards.">
              <div className="grid grid-cols-4 gap-2 text-center">
                {customerValueTiers.map((t) => (
                  <div key={t.label} className="rounded-xl bg-surface py-2.5">
                    <p className="text-[11px] text-ink-muted">{t.label}</p>
                    <p className="text-[16px] font-extrabold text-ink">{t.value}</p>
                  </div>
                ))}
              </div>
            </ChartCard>
          </section>

          <section id="sec-time" className="scroll-mt-40 space-y-3">
            <h2 className="text-[16px] font-bold text-ink">Time</h2>
            <ChartCard question="What time is strongest?" title="Sales by hour" insight={`Your busiest hour is ${data.peak.label} with about ${data.peak.value} transactions per day.`}>
              <SimpleBars
                data={data.hours.map((h) => ({ ...h, highlight: h.hour === data.peak.hour || h.hour === String(Number(data.peak.hour) + 1).padStart(2, "0") }))}
                xKey="hour"
                yKey="value"
                format={(v) => `${v} trx/day`}
                axisFormat={(v) => String(v)}
                highlightKey="highlight"
                height={160}
              />
            </ChartCard>
            <ChartCard question="Which day is busiest?" title="Sales by day" insight={`${data.bestDay.day} is your strongest day on average (${formatCompactRupiah(data.bestDay.revenue)}).`}>
              <SimpleBars data={data.dow.map((d) => ({ ...d, highlight: d.day === data.bestDay.day }))} xKey="day" yKey="revenue" format={formatRupiah} highlightKey="highlight" height={160} />
            </ChartCard>
          </section>

          <section id="sec-payment" className="scroll-mt-40 space-y-3">
            <h2 className="text-[16px] font-bold text-ink">Payment</h2>
            <ChartCard question="How do customers pay?" title="Payment method distribution" insight={qris ? `QRIS accounts for ${qris.share.toFixed(0)}% of sales value. Digital payments settle automatically.` : undefined}>
              <Donut data={data.payments} format={formatRupiah} centerLabel="Sales" centerValue={formatCompactRupiah(data.totals.revenue)} />
            </ChartCard>
          </section>

          <section id="sec-outlet" className="scroll-mt-40 space-y-3">
            <h2 className="text-[16px] font-bold text-ink">Outlet</h2>
            <ChartCard
              question="Which outlet performs best?"
              title="Outlet comparison"
              insight={(() => {
                const [a, b] = [...data.outletsData].sort((x, y) => y.revenue - x.revenue);
                return b ? `${a.label} generates ${(((a.revenue - b.revenue) / b.revenue) * 100).toFixed(0)}% higher revenue than ${b.label}.` : undefined;
              })()}
            >
              <SimpleBars data={data.outletsData} xKey="label" yKey="revenue" format={formatRupiah} highlightKey="highlight" height={170} />
            </ChartCard>
          </section>
        </PageBody>
      )}
    </>
  );
}
