import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronRight, FileText, Plus, Printer, Share2, TrendingUp, UserPlus, Users } from "lucide-react";
import type { Transaction } from "@/types";
import { Button } from "@/components/common/Button";
import { BottomSheet } from "@/components/common/Overlay";
import { ProgressBar } from "@/components/common/ProgressBar";
import { ReceiptView } from "./Receipt";
import { useData, useSession, useUI } from "@/hooks/useApp";
import { useGrowth, useTodayStats } from "@/hooks/useBusiness";
import { useReceiptActions } from "@/hooks/useReceiptActions";
import { METHOD_LABEL } from "@/data/analytics";
import { TRANSACTION_MISSION } from "@/data/growth";
import { formatCompactRupiah, formatRupiah } from "@/utils/format";

/** Transaction success screen with receipt, print, share and customer actions. */
export function SuccessView({ transaction: t, onNew }: { transaction: Transaction; onNew: () => void }) {
  const navigate = useNavigate();
  const { isGuest } = useSession();
  const { customers, attachCustomer, addCustomer, settings } = useData();
  const { toast, haptic } = useUI();
  const { print: printReceipt, printing, share: shareReceipt } = useReceiptActions();
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [customerId, setCustomerId] = useState(t.customerId);
  const today = useTodayStats(t.outletId);
  const growth = useGrowth();
  const goalBefore = Math.max(0, ((today.revenue - t.amount) / today.goal) * 100);
  const goalAfter = today.goalProgress;

  const share = () => shareReceipt(t);
  const print = () => printReceipt(t.id, t.outletId);

  // Payment feedback and optional auto-print run once when the screen opens.
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    haptic([15, 40, 25]);
    if (settings.autoPrint) printReceipt(t.id, t.outletId);
  }, [haptic, settings.autoPrint, printReceipt, t.id, t.outletId]);

  const chooseCustomer = (id: string) => {
    attachCustomer(t.id, id);
    setCustomerId(id);
    setCustomerOpen(false);
    toast(`Sale linked to Customer ${id}`);
  };

  return (
    <div className="flex min-h-full flex-col bg-white px-6 pb-8 pt-10">
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <span className="absolute inset-0 animate-ring-pulse rounded-full bg-success/30" aria-hidden />
          <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-success text-white shadow-float">
            <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12.5l4.5 4.5L19 7.5" strokeDasharray={48} className="animate-check-draw" />
            </svg>
          </span>
        </div>
        <h1 className="mt-6 text-[20px] font-extrabold text-ink">Payment successful</h1>
        <p className="tabular mt-3 text-[34px] font-extrabold tracking-tight text-navy">{formatRupiah(t.amount)}</p>
        <p className="mt-1 text-[13px] text-ink-muted">
          {(t.payments ?? [{ method: t.method, amount: t.amount }]).map((p) => METHOD_LABEL[p.method]).join(" + ")} · {t.time}
        </p>
      </div>

      <div className="card mt-6 divide-y divide-surface-line text-[13.5px]">
        <div className="flex justify-between px-4 py-3">
          <span className="text-ink-muted">Receipt number</span>
          <span className="font-semibold text-ink">{t.id}</span>
        </div>
        {t.cashReceived ? (
          <div className="flex justify-between px-4 py-3">
            <span className="text-ink-muted">Change</span>
            <span className="font-bold text-success-dark">
              {formatRupiah(Math.max(0, t.cashReceived - (t.payments?.find((p) => p.method === "Cash")?.amount ?? t.amount)))}
            </span>
          </div>
        ) : null}
        <div className="flex justify-between px-4 py-3">
          <span className="text-ink-muted">Customer</span>
          <span className="font-semibold text-ink">{customerId ? `Customer ${customerId}` : "Walk-in"}</span>
        </div>
      </div>

      <section className="mt-4 overflow-hidden rounded-3xl bg-navy p-4 text-white shadow-float" aria-label="Business impact of this sale">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gold">
          <TrendingUp className="h-3.5 w-3.5" /> This sale moved your business forward
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <p className="text-[11.5px] text-white/60">Today’s sales</p>
            <p className="tabular text-[17px] font-extrabold">{formatCompactRupiah(today.revenue)}</p>
            <p className="text-[11.5px] font-semibold text-emerald-300">+{formatCompactRupiah(t.amount)}</p>
          </div>
          <div>
            <p className="text-[11.5px] text-white/60">Transactions today</p>
            <p className="tabular text-[17px] font-extrabold">{today.count}</p>
            <p className="text-[11.5px] font-semibold text-white/70">
              {today.count >= TRANSACTION_MISSION.minDaily ? "Daily mission target met" : `${TRANSACTION_MISSION.minDaily - today.count} to daily target`}
            </p>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11.5px]">
            <span className="text-white/70">Daily revenue goal</span>
            <span className="tabular font-bold">
              {Math.floor(goalBefore)}% <span className="text-white/50">→</span> <span className="text-gold">{Math.floor(goalAfter)}%</span>
            </span>
          </div>
          <ProgressBar value={goalAfter} tone="gold" size="sm" className="mt-1.5 bg-white/15" label="Daily goal progress" />
        </div>
        <button
          type="button"
          onClick={() => navigate("/growth")}
          className="mt-3 flex w-full items-center justify-between rounded-2xl bg-white/10 px-3 py-2.5 text-left text-[12.5px] transition hover:bg-white/15 active:scale-[0.99]"
        >
          <span>
            Growth Score <span className="font-extrabold text-gold">{growth.score}</span>
            <span className="text-white/70"> · recorded sales build your Transaction Health</span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-white/70" />
        </button>
      </section>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {[
          { icon: Share2, label: "Share", onClick: share },
          { icon: Printer, label: printing ? "Printing" : "Print", onClick: print },
          { icon: FileText, label: "Receipt", onClick: () => setReceiptOpen(true) },
          { icon: UserPlus, label: "Customer", onClick: () => setCustomerOpen(true) },
        ].map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={a.onClick}
            disabled={a.label === "Printing"}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-surface-line bg-white py-3 text-[12px] font-semibold text-ink-soft transition hover:bg-surface active:scale-95"
          >
            <a.icon className="h-5 w-5 text-navy" />
            {a.label}
          </button>
        ))}
      </div>

      <div className="mt-auto space-y-2.5 pt-6">
        <Button block size="lg" leftIcon={<Plus className="h-4 w-4" />} onClick={onNew}>
          Start new transaction
        </Button>
        <Button block variant="secondary" onClick={() => (isGuest ? navigate("/home") : navigate(`/transactions/${t.id}`))}>
          {isGuest ? "Done" : "View transaction"}
        </Button>
      </div>

      <BottomSheet open={receiptOpen} onClose={() => setReceiptOpen(false)} title="Receipt preview">
        <ReceiptView transaction={t} />
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <Button variant="secondary" leftIcon={<Share2 className="h-4 w-4" />} onClick={share}>
            Share
          </Button>
          <Button leftIcon={<Printer className="h-4 w-4" />} onClick={print} loading={printing}>
            Print
          </Button>
        </div>
      </BottomSheet>

      <BottomSheet open={customerOpen} onClose={() => setCustomerOpen(false)} title="Add customer" subtitle="Customers are anonymized. No personal data is stored.">
        <Button
          block
          variant="accent"
          leftIcon={<UserPlus className="h-4 w-4" />}
          onClick={() => chooseCustomer(addCustomer().id)}
        >
          Create new customer code
        </Button>
        <p className="mb-2 mt-5 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-ink-muted">
          <Users className="h-3.5 w-3.5" /> Existing customers
        </p>
        <div className="card divide-y divide-surface-line overflow-hidden">
          {customers.slice(0, 8).map((c) => (
            <button key={c.id} type="button" onClick={() => chooseCustomer(c.id)} className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-surface/70">
              <span>
                <span className="block text-[14px] font-semibold text-ink">{c.label}</span>
                <span className="block text-[12px] text-ink-muted">
                  {c.segment} · {c.visits} visits
                </span>
              </span>
              {customerId === c.id && <Check className="h-5 w-5 text-navy" />}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}
