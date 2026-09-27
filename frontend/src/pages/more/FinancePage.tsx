import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDownLeft, ArrowUpRight, Download, Info, Plus, TrendingUp, Wallet } from "lucide-react";
import { TopAppBar, PageBody } from "@/components/layout/TopAppBar";
import { Button } from "@/components/common/Button";
import { ChartCard } from "@/components/charts/ChartKit";
import { GroupedBars, RankBars } from "@/components/charts/Charts";
import { useData, useSession, useUI } from "@/hooks/useApp";
import { useMonthStats, useSettlements, useTodayStats } from "@/hooks/useBusiness";
import { EXPENSE_CATEGORIES, previousExpenses } from "@/data/operations";
import { CHART_COLORS, completedSales, rangeStart, shiftDate, sumAmount } from "@/data/analytics";
import { DEMO_TODAY } from "@/data/merchant";
import { formatCompactRupiah, formatPercent, formatRupiah } from "@/utils/format";
import { cn } from "@/utils/cn";
import { downloadCsv } from "@/utils/download";

export default function FinancePage() {
  const navigate = useNavigate();
  const { outletId, outletName } = useSession();
  const { transactions } = useData();
  const { toast } = useUI();
  const month = useMonthStats();
  const today = useTodayStats();
  const settlements = useSettlements();
  const pending = settlements.find((s) => s.status === "Scheduled")?.breakdown.find((b) => b.outletId === outletId)?.gross ?? 0;
  const netCashflow = month.revenue - month.expenses - pending;
  const margin = month.revenue ? (month.profit / month.revenue) * 100 : 0;

  const periodRevenue = [2, 1, 0].map((o) =>
    sumAmount(completedSales(transactions, shiftDate(DEMO_TODAY, -(o * 30 + 29)), shiftDate(DEMO_TODAY, -(o * 30)))),
  );
  const prev = previousExpenses[outletId] ?? [0, 0];
  const trend = ["2 months ago", "Last month", "This month"].map((label, i) => ({
    label,
    revenue: periodRevenue[i],
    expenses: i < 2 ? prev[i] : month.expenses,
  }));
  const byCategory = EXPENSE_CATEGORIES.map((c) => ({ name: c, value: month.expenseList.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0) }))
    .filter((x) => x.value > 0)
    .sort((a, b) => b.value - a.value);

  const downloadReport = () => {
    const from = rangeStart(30);
    const rows: (string | number)[][] = [
      ["Livin Merchant - Monthly business summary"],
      ["Outlet", outletName],
      ["Period", `${from} to ${DEMO_TODAY}`],
      [],
      ["Item", "Amount (Rp)"],
      ["Revenue", month.revenue],
      ["Transactions", month.count],
      ["Expenses", month.expenses],
      ["Estimated gross profit", month.profit],
      ["Profit margin (%)", Math.round(margin * 10) / 10],
      ["Non-cash sales waiting for settlement", pending],
      ["Net cashflow estimate", netCashflow],
      [],
      ["Expenses by category", "Amount (Rp)"],
      ...byCategory.map((c) => [c.name, c.value]),
      [],
      ["Date", "Category", "Description", "Payment method", "Amount (Rp)"],
      ...month.expenseList.map((e) => [e.date, e.category, e.title, e.method, e.amount]),
      [],
      ["Based on recorded sales and expenses. Not a formal accounting statement."],
    ];
    downloadCsv(`livin-merchant-summary-${outletId}-${DEMO_TODAY}.csv`, rows);
    toast("Monthly summary downloaded (CSV). Open it in Excel or Google Sheets.");
  };

  return (
    <>
      <TopAppBar title="Business Finance" subtitle={`${outletName} · last 30 days`} backTo="/more" />
      <PageBody>
        <section className="hero-navy rounded-[28px] p-5 text-white">
          <p className="text-[12px] font-semibold text-white/70">Monthly Summary</p>
          <div className="mt-3 space-y-2.5">
            <Line label="Revenue" value={month.revenue} icon={<ArrowDownLeft className="h-4 w-4 text-emerald-300" />} />
            <Line label="Expenses" value={-month.expenses} icon={<ArrowUpRight className="h-4 w-4 text-red-300" />} />
            <div className="border-t border-white/15 pt-2.5">
              <Line label="Estimated Gross Profit" value={month.profit} bold icon={<TrendingUp className="h-4 w-4 text-gold" />} />
            </div>
          </div>
          <p className="mt-3 text-[12px] text-white/65">Based on recorded sales and expenses. Profit margin {formatPercent(margin, 0)}.</p>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <div className="card p-4">
            <p className="text-[11.5px] text-ink-muted">Net Cashflow Estimate</p>
            <p className={cn("tabular text-[18px] font-extrabold", netCashflow >= 0 ? "text-success-dark" : "text-danger-dark")}>{formatCompactRupiah(netCashflow)}</p>
            <p className="text-[11px] text-ink-muted">After {formatCompactRupiah(pending)} still to be settled</p>
          </div>
          <div className="card p-4">
            <p className="text-[11.5px] text-ink-muted">Today’s cashflow</p>
            <p className={cn("tabular text-[18px] font-extrabold", today.net >= 0 ? "text-success-dark" : "text-danger-dark")}>{formatCompactRupiah(today.net)}</p>
            <p className="text-[11px] text-ink-muted">
              In {formatCompactRupiah(today.moneyIn)} · Out {formatCompactRupiah(today.moneyOut)}
            </p>
          </div>
        </section>

        <ChartCard
          question="Am I earning more than I spend?"
          title="Revenue vs expenses"
          legend={[
            { label: "Revenue", color: CHART_COLORS[0] },
            { label: "Expenses", color: CHART_COLORS[1] },
          ]}
          insight={`Revenue covers expenses ${(month.revenue / (month.expenses || 1)).toFixed(1)}x this month. Expenses ${month.expenses > prev[1] ? "grew" : "fell"} ${formatPercent(Math.abs(((month.expenses - prev[1]) / (prev[1] || 1)) * 100), 1)} from last month.`}
        >
          <GroupedBars
            data={trend}
            xKey="label"
            series={[
              { key: "revenue", color: CHART_COLORS[0], label: "Revenue" },
              { key: "expenses", color: CHART_COLORS[1], label: "Expenses" },
            ]}
            format={formatRupiah}
            height={190}
          />
        </ChartCard>

        {byCategory.length > 0 && (
          <ChartCard question="What are my biggest costs?" title="Expense breakdown" insight={`${byCategory[0].name} accounts for ${((byCategory[0].value / (month.expenses || 1)) * 100).toFixed(0)}% of expenses.`}>
            <RankBars data={byCategory} labelKey="name" valueKey="value" format={formatRupiah} color={CHART_COLORS[1]} />
          </ChartCard>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate("/expenses?new=1")}>
            Add Expense
          </Button>
          <Button variant="secondary" leftIcon={<Wallet className="h-4 w-4" />} onClick={() => navigate("/settlement")}>
            Settlements
          </Button>
        </div>
        <Button block leftIcon={<Download className="h-4 w-4" />} onClick={downloadReport}>
          Download monthly summary (CSV)
        </Button>

        <p className="flex gap-2 rounded-2xl bg-white px-4 py-3 text-[11.5px] leading-relaxed text-ink-muted ring-1 ring-surface-line">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          This summary is designed for business monitoring and is not a formal accounting statement.
        </p>
      </PageBody>
    </>
  );
}

function Line({ label, value, bold, icon }: { label: string; value: number; bold?: boolean; icon: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn("flex items-center gap-2 text-[13.5px]", bold ? "font-bold text-white" : "text-white/80")}>
        {icon}
        {label}
      </span>
      <span className={cn("tabular", bold ? "text-[20px] font-extrabold text-gold" : "text-[15px] font-bold")}>
        {value < 0 ? "-" : ""}
        {formatRupiah(Math.abs(value))}
      </span>
    </div>
  );
}
