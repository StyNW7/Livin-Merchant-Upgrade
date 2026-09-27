import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Split } from "lucide-react";
import type { PaymentMethod, PaymentSplit } from "@/types";
import { BottomSheet } from "@/components/common/Overlay";
import { Button } from "@/components/common/Button";
import { TextField, Toggle } from "@/components/common/Form";
import { QrCodeGraphic } from "@/components/common/QrCode";
import { methodIcon } from "@/components/icons";
import { METHOD_LABEL, PAYMENT_METHODS } from "@/data/analytics";
import { useCart } from "@/hooks/useApp";
import { formatRupiah } from "@/utils/format";
import { cn } from "@/utils/cn";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (payments: PaymentSplit[], cashReceived?: number) => void;
  processing: boolean;
}

/** Payment selection (single or split), cash calculator and final confirmation. */
export function CheckoutSheet({ open, onClose, onConfirm, processing }: Props) {
  const cart = useCart();
  const [step, setStep] = useState<"pay" | "confirm">("pay");
  const [method, setMethod] = useState<PaymentMethod>("QRIS");
  const [split, setSplit] = useState(false);
  const [secondMethod, setSecondMethod] = useState<PaymentMethod>("Cash");
  const [firstAmount, setFirstAmount] = useState("");
  const [cashReceived, setCashReceived] = useState("");

  useEffect(() => {
    if (open) {
      setStep("pay");
      setSplit(false);
      setFirstAmount("");
      setCashReceived("");
    }
  }, [open]);

  const total = cart.total;
  const payments = useMemo<PaymentSplit[]>(() => {
    if (!split) return [{ method, amount: total }];
    const first = Math.min(total, Number(firstAmount || 0));
    return [
      { method, amount: first },
      { method: secondMethod, amount: total - first },
    ];
  }, [split, method, secondMethod, firstAmount, total]);

  const qrisAmount = payments.filter((p) => p.method === "QRIS").reduce((s, p) => s + p.amount, 0);
  const cashDue = payments.filter((p) => p.method === "Cash").reduce((s, p) => s + p.amount, 0);
  const received = Number(cashReceived || 0);
  const change = received - cashDue;
  const splitValid = !split || (payments[0].amount > 0 && payments[1].amount > 0 && method !== secondMethod);
  const cashValid = cashDue === 0 || received >= cashDue;
  const quickCash = useMemo(() => {
    const options = new Set<number>([cashDue]);
    [10_000, 20_000, 50_000, 100_000].forEach((step) => options.add(Math.ceil(cashDue / step) * step));
    return [...options].filter((v) => v >= cashDue && v > 0).sort((a, b) => a - b).slice(0, 4);
  }, [cashDue]);

  return (
    <BottomSheet
      open={open}
      onClose={processing ? () => undefined : onClose}
      title={step === "pay" ? "Payment" : "Confirm payment"}
      subtitle={`Total ${formatRupiah(total)}`}
      footer={
        step === "pay" ? (
          <Button block size="lg" disabled={!splitValid || !cashValid} onClick={() => setStep("confirm")}>
            Continue
          </Button>
        ) : (
          <div className="grid grid-cols-[auto_1fr] gap-2">
            <Button variant="secondary" size="lg" onClick={() => setStep("pay")} disabled={processing} aria-label="Back to payment">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button size="lg" loading={processing} onClick={() => onConfirm(payments, cashDue ? received : undefined)}>
              {processing ? "Processing" : `Pay ${formatRupiah(total)}`}
            </Button>
          </div>
        )
      }
    >
      {step === "pay" ? (
        <div className="space-y-4">
          <MethodGrid value={method} onChange={setMethod} label={split ? "First payment" : "Payment method"} />

          <div className="rounded-2xl bg-surface px-3">
            <Toggle checked={split} onChange={setSplit} label="Split payment" description="Pay with two methods" icon={<Split className="h-5 w-5 text-navy" />} />
          </div>

          {split && (
            <div className="space-y-3 rounded-2xl border border-surface-line p-3">
              <TextField
                label={`${METHOD_LABEL[method]} amount`}
                prefix="Rp"
                inputMode="numeric"
                value={firstAmount}
                onChange={(e) => setFirstAmount(e.target.value.replace(/\D/g, "").slice(0, 9))}
                hint={`Remaining ${formatRupiah(Math.max(0, total - Number(firstAmount || 0)))} goes to the second method`}
                error={Number(firstAmount || 0) >= total ? "First amount must be less than the total" : undefined}
              />
              <MethodGrid value={secondMethod} onChange={setSecondMethod} label="Second payment" exclude={method} />
            </div>
          )}

          {cashDue > 0 && (
            <div className="space-y-3 rounded-2xl border border-gold-200 bg-gold-50 p-3">
              <p className="text-[13px] font-bold text-ink">Cash due {formatRupiah(cashDue)}</p>
              <div className="flex flex-wrap gap-2">
                {quickCash.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setCashReceived(String(v))}
                    className={cn("h-9 rounded-full border px-3 text-[12.5px] font-semibold", received === v ? "border-navy bg-navy text-white" : "border-gold-300 bg-white text-ink")}
                  >
                    {v === cashDue ? "Exact" : formatRupiah(v)}
                  </button>
                ))}
              </div>
              <TextField
                label="Cash received"
                prefix="Rp"
                inputMode="numeric"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value.replace(/\D/g, "").slice(0, 9))}
                error={cashReceived && change < 0 ? `Short by ${formatRupiah(-change)}` : undefined}
              />
              <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5">
                <span className="text-[13px] text-ink-muted">Change</span>
                <span className="tabular text-[18px] font-extrabold text-success-dark">{formatRupiah(Math.max(0, change))}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl bg-navy p-4 text-white">
            <p className="text-[12px] text-white/70">Amount to charge</p>
            <p className="tabular text-[28px] font-extrabold">{formatRupiah(total)}</p>
          </div>
          {qrisAmount > 0 && (
            <div className="flex flex-col items-center rounded-3xl border border-surface-line bg-white p-4 text-center">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-navy">QRIS</p>
              <div className="mt-2 rounded-2xl border border-surface-line p-2">
                <QrCodeGraphic seed={`checkout-${total}-${qrisAmount}`} size={168} />
              </div>
              <p className="tabular mt-3 text-[18px] font-extrabold text-ink">{formatRupiah(qrisAmount)}</p>
              <p className="mt-1 inline-flex items-center gap-2 text-[12px] font-semibold text-ink-muted">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                {processing ? "Payment received, confirming" : "Show this code to the customer to scan"}
              </p>
            </div>
          )}
          <div className="card divide-y divide-surface-line text-[13.5px]">
            {payments.map((p, i) => (
              <div key={i} className="flex justify-between px-4 py-3">
                <span className="text-ink-muted">{METHOD_LABEL[p.method]}</span>
                <span className="tabular font-bold text-ink">{formatRupiah(p.amount)}</span>
              </div>
            ))}
            {cashDue > 0 && (
              <>
                <div className="flex justify-between px-4 py-3">
                  <span className="text-ink-muted">Cash received</span>
                  <span className="tabular font-semibold">{formatRupiah(received)}</span>
                </div>
                <div className="flex justify-between px-4 py-3">
                  <span className="text-ink-muted">Change</span>
                  <span className="tabular font-bold text-success-dark">{formatRupiah(change)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between px-4 py-3">
              <span className="text-ink-muted">Items</span>
              <span className="font-semibold">{cart.count}</span>
            </div>
            <div className="flex justify-between px-4 py-3">
              <span className="text-ink-muted">Order</span>
              <span className="font-semibold">
                {cart.channel}
                {cart.orderRef ? ` · ${cart.orderRef}` : ""}
              </span>
            </div>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}

function MethodGrid({ value, onChange, label, exclude }: { value: PaymentMethod; onChange: (m: PaymentMethod) => void; label: string; exclude?: PaymentMethod }) {
  return (
    <section>
      <p className="mb-2 text-[13px] font-bold text-ink">{label}</p>
      <div className="grid grid-cols-3 gap-2">
        {PAYMENT_METHODS.filter((m) => m !== exclude).map((m) => {
          const Icon = methodIcon[m];
          const active = value === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => onChange(m)}
              aria-pressed={active}
              className={cn(
                "flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-2xl border px-1 text-center text-[12px] font-semibold transition active:scale-95",
                active ? "border-navy bg-navy text-white shadow-float" : "border-surface-line bg-white text-ink-soft hover:border-navy-200",
              )}
            >
              <Icon className={cn("h-5 w-5", active ? "text-gold" : "text-navy")} />
              {METHOD_LABEL[m]}
            </button>
          );
        })}
      </div>
    </section>
  );
}
