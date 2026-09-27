import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, FileText, Plus, Printer, Share2, UserPlus, Users } from "lucide-react";
import type { Transaction } from "@/types";
import { Button } from "@/components/common/Button";
import { BottomSheet } from "@/components/common/Overlay";
import { DemoTag } from "@/components/common/StatusBadge";
import { ReceiptView } from "./Receipt";
import { useData, useSession, useUI } from "@/hooks/useApp";
import { METHOD_LABEL } from "@/data/analytics";
import { formatRupiah } from "@/utils/format";

/** Transaction success screen with receipt, print, share and customer actions. */
export function SuccessView({ transaction: t, onNew }: { transaction: Transaction; onNew: () => void }) {
  const navigate = useNavigate();
  const { isGuest } = useSession();
  const { customers, attachCustomer, addCustomer } = useData();
  const { toast } = useUI();
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [customerId, setCustomerId] = useState(t.customerId);

  const share = async () => {
    const text = `Receipt ${t.id} - ${formatRupiah(t.amount)} paid by ${METHOD_LABEL[t.method]}. Thank you!`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `Receipt ${t.id}`, text });
        return;
      }
      await navigator.clipboard.writeText(text);
      toast("Receipt link copied to clipboard");
    } catch {
      toast("Receipt ready to share via WhatsApp or email", "info");
    }
  };

  const print = () => {
    setPrinting(true);
    window.setTimeout(() => {
      setPrinting(false);
      toast("Receipt sent to printer");
    }, 1200);
  };

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
        {isGuest && <DemoTag className="mt-2" label="Simulation — not recorded" />}
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

      <div className="mt-auto space-y-2.5 pt-8">
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
