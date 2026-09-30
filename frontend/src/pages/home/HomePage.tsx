import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  Goal,
  Lightbulb,
  MapPin,
  QrCode,
  ReceiptText,
  Search,
  ShoppingCart,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
  WalletCards,
} from "lucide-react";
import { IconButton, Button } from "@/components/common/Button";
import { Avatar } from "@/components/common/Brand";
import { BottomSheet } from "@/components/common/Overlay";
import { ProgressBar, ProgressRing } from "@/components/common/ProgressBar";
import { InstallBanner } from "@/components/pwa/InstallPrompt";
import { SectionHeader } from "@/components/common/SectionHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { QuickAction } from "@/components/cards/QuickAction";
import { TransactionItem } from "@/components/cards/TransactionItem";
import { Sparkline } from "@/components/charts/Charts";
import { useData, useSession, useUI } from "@/hooks/useApp";
import { useCountUp } from "@/hooks/useCountUp";
import { useAttention, useGrowth, useNotifications, useTodayStats } from "@/hooks/useBusiness";
import { outlets } from "@/data/outlets";
import { DEMO_TODAY } from "@/data/merchant";
import { formatCompactRupiah, formatDayDate, formatPercent, formatRupiah, greeting } from "@/utils/format";
import { cn } from "@/utils/cn";

const toneClass = {
  danger: "bg-danger-soft text-danger-dark",
  warning: "bg-warning-soft text-warning-dark",
  success: "bg-success-soft text-success-dark",
  info: "bg-sky-50 text-sky-700",
};

export default function HomePage() {
  const navigate = useNavigate();
  const { merchant, outletId, setOutletId } = useSession();
  const { openAssistant, toast } = useUI();
  const { transactions } = useData();
  const today = useTodayStats();
  const growth = useGrowth();
  const attention = useAttention();
  const unread = useNotifications().filter((n) => !n.read).length;
  const [outletOpen, setOutletOpen] = useState(false);
  const [insightOpen, setInsightOpen] = useState(false);
  const outlet = outlets.find((o) => o.id === outletId)!;
  const up = today.change >= 0;
  const revenueShown = Math.round(useCountUp(today.revenue, { duration: 1000 }));
  const scoreShown = Math.round(useCountUp(growth.score, { duration: 1000 }));
  const hasSales = transactions.some((t) => t.date === DEMO_TODAY && t.type === "sale");

  return (
    <div className="relative pb-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[260px] bg-gradient-to-b from-navy-100/80 via-navy-50/60 to-transparent" aria-hidden />
      {/* Header */}
      <header className="relative px-5 pb-4 pt-3">
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={() => navigate("/profile")} className="flex min-w-0 items-center gap-3 text-left">
            <Avatar initials={merchant.initials} size={46} className="shadow-soft ring-[3px] ring-white" />
            <div className="min-w-0">
              <p className="truncate text-[13px] text-ink-muted">{greeting()},</p>
              <p className="truncate text-[17px] font-extrabold tracking-tight text-ink">{merchant.ownerFirstName}</p>
            </div>
          </button>
          <div className="flex items-center gap-1.5">
            <IconButton label="Search" onClick={() => navigate("/search")}>
              <Search className="h-5 w-5" />
            </IconButton>
            <IconButton label="Business Assistant" onClick={openAssistant}>
              <Sparkles className="h-5 w-5 text-gold-600" />
            </IconButton>
            <IconButton label={`Notifications, ${unread} unread`} badge={unread > 0} onClick={() => navigate("/notifications")}>
              <Bell className="h-5 w-5" />
            </IconButton>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOutletOpen(true)}
          className="mt-3.5 inline-flex max-w-full items-center gap-1.5 rounded-full border border-white bg-white/90 py-1 pl-1 pr-3 text-[12.5px] font-bold text-navy-600 shadow-soft backdrop-blur hover:border-navy-200"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold text-navy-900">
            <MapPin className="h-3.5 w-3.5" />
          </span>
          <span className="truncate">
            {merchant.name} — {outlet.area}
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0" />
        </button>
      </header>

      <div className="relative space-y-6 px-5">
        {/* A. Hero business summary */}
        <section className="hero-navy relative overflow-hidden rounded-[30px] p-5 text-white shadow-float">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-2 truncate text-[12px] font-semibold text-white/90">
                <span className="relative flex h-2 w-2" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
                </span>
                Today’s sales · {formatDayDate(DEMO_TODAY)}
              </p>
              <p className="tabular mt-2.5 text-[34px] font-extrabold leading-none tracking-tight drop-shadow-sm">{formatRupiah(revenueShown)}</p>
              <p className={cn("mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-bold", up ? "bg-white/20 text-white" : "bg-danger/80 text-white")}>
                {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {formatPercent(today.change, 1, true)} vs yesterday
              </p>
            </div>
          </div>
          <div className="-mx-1 mt-3">
            <Sparkline data={today.curve} color="#FFD466" height={62} fillOpacity={0.45} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl bg-white/20 px-3 py-2.5 backdrop-blur-sm">
              <p className="text-[11.5px] font-medium text-white/90">Transactions</p>
              <p className="tabular text-[18px] font-extrabold">{today.count}</p>
            </div>
            <div className="rounded-2xl bg-white/20 px-3 py-2.5 backdrop-blur-sm">
              <p className="text-[11.5px] font-medium text-white/90">Average transaction</p>
              <p className="tabular text-[18px] font-extrabold">{formatRupiah(Math.round(today.average))}</p>
            </div>
          </div>
          <Link
            to="/reports"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-sm transition hover:bg-white/35 active:scale-90"
            aria-label="Open Business Analytics"
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
        </section>

        {/* B. Quick actions */}
        <section className="-mx-2 grid grid-cols-4 gap-1" aria-label="Quick actions">
          <QuickAction icon={ShoppingCart} label="New Sale" to="/cashier" highlight />
          <QuickAction icon={QrCode} label="QR Payment" to="/qr-payment" />
          <QuickAction icon={WalletCards} label="Add Expense" to="/expenses?new=1" />
          <QuickAction icon={ReceiptText} label="Settlement" to="/settlement" />
        </section>

        <InstallBanner />

        {/* C. Needs your attention */}
        {attention.length > 0 && (
          <section className="card overflow-hidden">
            <div className="flex items-center justify-between px-4 pb-2 pt-4">
              <h2 className="text-[15.5px] font-extrabold tracking-tight text-ink">Needs Your Attention</h2>
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-danger px-1.5 text-[11.5px] font-extrabold text-white">{attention.length}</span>
            </div>
            <ul className="divide-y divide-surface-line">
              {attention.slice(0, 4).map((a) => (
                <li key={a.id}>
                  <Link to={a.to} className="flex min-h-[60px] items-center gap-3 px-4 py-2.5 transition hover:bg-navy-50/60">
                    <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl", toneClass[a.tone])}>
                      <a.icon className="h-[17px] w-[17px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-semibold text-ink">{a.title}</span>
                      <span className="block truncate text-[12px] text-ink-muted">{a.detail}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* D. Growth snapshot */}
        <section className="card p-4">
          <div className="flex items-center gap-4">
            <ProgressRing value={scoreShown} size={84} stroke={9} tone="#5192F6" track="#E1EDFE" label={`Growth Score ${growth.score} of 100`}>
              <span className="flex flex-col items-center leading-none">
                <span className="tabular text-[24px] font-extrabold text-ink">{scoreShown}</span>
                <span className="mt-0.5 text-[10px] font-bold text-ink-muted">/ 100</span>
              </span>
            </ProgressRing>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-ink-muted">Business Growth Score</p>
              <p className="mt-0.5 truncate text-[16px] font-extrabold tracking-tight text-ink">{growth.status}</p>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] font-extrabold tracking-wide">
                <span className="rounded-full bg-navy px-2.5 py-1 text-white">{growth.stage.id}</span>
                <ChevronRight className="h-3.5 w-3.5 text-ink-faint" />
                <span className="rounded-full bg-gold-100 px-2.5 py-1 text-gold-800">{growth.nextStage?.id ?? "TOP"}</span>
              </div>
            </div>
          </div>
          <ProgressBar value={growth.stageProgress} tone="gold" size="md" className="mt-4" label="Progress to next stage" />
          <p className="mt-2 text-[12.5px] text-ink-soft">
            {growth.nextStage
              ? `${growth.pointsToNext} points to reach the next growth milestone.`
              : "You have reached the highest growth stage."}
          </p>
          <div className="mt-3 flex items-center justify-between rounded-2xl bg-surface px-3 py-2.5">
            <span className="text-[12.5px] text-ink-soft">
              Financing Readiness <span className="font-bold text-ink">{growth.readiness}%</span>
            </span>
            <StatusBadge status={growth.readinessStatus} tone={growth.readiness >= 85 ? "success" : growth.readiness >= 70 ? "gold" : "warning"} />
          </div>
          <Button block variant="soft" className="mt-3" onClick={() => navigate("/growth")} rightIcon={<ChevronRight className="h-4 w-4" />}>
            View Growth Details
          </Button>
        </section>

        {/* E. Smart daily insight */}
        <section className="relative overflow-hidden rounded-3xl border border-gold-200 bg-gradient-to-br from-gold-50 via-white to-navy-50 p-4 shadow-card">
          <span className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gold-200/60 blur-2xl" aria-hidden />
          <div className="relative flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-300 to-gold-500 text-navy-900 shadow-glow">
              <Lightbulb className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wide text-gold-800">Smart daily insight</p>
              <p className="mt-1 text-[14.5px] font-bold leading-snug text-ink">
                Lunch sales contribute {today.lunchShare.toFixed(0)}% of today’s revenue.
              </p>
              <button type="button" onClick={() => setInsightOpen(true)} className="mt-3 inline-flex h-9 items-center gap-1 rounded-full bg-navy px-3.5 text-[12.5px] font-bold text-white shadow-brand active:scale-95">
                View Recommendation <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* F. Cashflow snapshot + G. Daily goal */}
        <section className="grid grid-cols-1 gap-3">
          <Link to="/finance" className="card card-hover block p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-ink">Cashflow Today</h2>
              <ChevronRight className="h-4 w-4 text-ink-faint" />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div>
                <p className="flex items-center gap-1 text-[11.5px] text-ink-muted">
                  <ArrowDownLeft className="h-3.5 w-3.5 text-success" /> Money In
                </p>
                <p className="tabular mt-0.5 text-[15px] font-extrabold text-ink">{formatCompactRupiah(today.moneyIn)}</p>
              </div>
              <div>
                <p className="flex items-center gap-1 text-[11.5px] text-ink-muted">
                  <ArrowUpRight className="h-3.5 w-3.5 text-danger" /> Money Out
                </p>
                <p className="tabular mt-0.5 text-[15px] font-extrabold text-ink">{formatCompactRupiah(today.moneyOut)}</p>
              </div>
              <div>
                <p className="flex items-center gap-1 text-[11.5px] text-ink-muted">
                  <Wallet className="h-3.5 w-3.5 text-navy-600" /> Est. Net
                </p>
                <p className={cn("tabular mt-0.5 text-[15px] font-extrabold", today.net >= 0 ? "text-success-dark" : "text-danger-dark")}>
                  {formatCompactRupiah(today.net)}
                </p>
              </div>
            </div>
          </Link>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-navy-50 text-navy-600">
                  <Goal className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[12px] text-ink-muted">Daily Revenue Goal</p>
                  <p className="tabular text-[14px] font-bold text-ink">{formatCompactRupiah(today.goal, 1)}</p>
                </div>
              </div>
              <p className="tabular text-[20px] font-extrabold text-navy-600">{Math.min(999, Math.floor(today.goalProgress))}%</p>
            </div>
            <ProgressBar value={today.goalProgress} tone={today.goalProgress >= 100 ? "success" : "navy"} size="md" className="mt-3" label="Daily goal progress" />
            <p className="mt-2 text-[12px] text-ink-muted">
              {today.goalProgress >= 100
                ? "Goal reached. Great work today."
                : `${formatRupiah(today.goal - today.revenue)} more to reach today’s goal.`}
            </p>
          </div>
        </section>

        {/* Recent transactions */}
        <section>
          <SectionHeader title="Recent Transactions" actionLabel="See all" to="/transactions" />
          <div className="card divide-y divide-surface-line overflow-hidden">
            {hasSales ? (
              today.recent.slice(0, 5).map((t) => <TransactionItem key={t.id} transaction={t} compact />)
            ) : (
              <p className="px-4 py-6 text-center text-[13px] text-ink-muted">Your transactions will appear here once you start selling.</p>
            )}
          </div>
        </section>
      </div>

      <BottomSheet open={outletOpen} onClose={() => setOutletOpen(false)} title="Choose outlet" subtitle="Home, cashier and reports follow this outlet">
        <div className="space-y-2">
          {outlets.map((o) => {
            const disabled = o.status !== "Active";
            const active = o.id === outletId;
            return (
              <button
                key={o.id}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setOutletId(o.id);
                  setOutletOpen(false);
                  toast(`Switched to ${o.area}`);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition",
                  active ? "border-navy bg-navy-50" : "border-surface-line hover:bg-surface",
                  disabled && "opacity-60",
                )}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-navy-600 shadow-card">
                  <MapPin className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-bold text-ink">
                    {merchant.name} — {o.area}
                  </span>
                  <span className="block truncate text-[12px] text-ink-muted">{o.address}</span>
                </span>
                {disabled ? <StatusBadge status="Planned" /> : active && <Check className="h-5 w-5 text-navy-600" />}
              </button>
            );
          })}
        </div>
        <Button block variant="secondary" className="mt-4" onClick={() => { setOutletOpen(false); navigate("/outlets"); }}>
          Compare outlets
        </Button>
      </BottomSheet>

      <BottomSheet open={insightOpen} onClose={() => setInsightOpen(false)} title="Recommended next step">
        <div className="rounded-2xl bg-surface p-4 text-[13.5px] leading-relaxed text-ink-soft">
          <p>
            Between 11:00 and 14:00 you earned <span className="font-bold text-ink">{today.lunchShare.toFixed(0)}%</span> of today’s sales.
            Lunch is when customers are most willing to add a second item.
          </p>
          <p className="mt-2 font-semibold text-ink">Consider a lunch combo: any coffee plus a sandwich or rice bowl at 10% off, 11:00–14:00.</p>
        </div>
        <div className="mt-4 space-y-2.5">
          <Button block onClick={() => { setInsightOpen(false); navigate("/promotions?template=tpl-lunch"); }}>
            Create Lunch Combo
          </Button>
          <Button block variant="secondary" onClick={() => { setInsightOpen(false); navigate("/growth/insights"); }}>
            See All Insights
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
