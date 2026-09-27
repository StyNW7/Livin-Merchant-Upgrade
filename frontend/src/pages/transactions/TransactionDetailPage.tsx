import { useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Check, FileText, Printer, ReceiptText, RotateCcw, Share2 } from "lucide-react";
import { TopAppBar, PageBody } from "@/components/layout/TopAppBar";
import { Button } from "@/components/common/Button";
import { BottomSheet } from "@/components/common/Overlay";
import { EmptyState } from "@/components/common/EmptyState";
import { Stepper } from "@/components/common/Form";
import { StatusBadge } from "@/components/common/StatusBadge";
import { InfoRow } from "@/components/cards/ListRow";
import { methodIcon } from "@/components/icons";
import { ReceiptView } from "@/components/cashier/Receipt";
import { useData, useSession, useUI } from "@/hooks/useApp";
import { METHOD_LABEL, shiftDate } from "@/data/analytics";
import { DEMO_TODAY } from "@/data/merchant";
import { ACTIVE_OUTLET_IDS, outletArea } from "@/data/outlets";
import { SETTLEMENT_TIME } from "@/data/transactions";
import { formatDate, formatRupiah, formatShortDate } from "@/utils/format";
import { cn } from "@/utils/cn";

const REASONS = ["Customer changed order", "Wrong item prepared", "Item unavailable", "Duplicate payment", "Quality issue"];

export default function TransactionDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { allTransactions, refundTransaction } = useData();
  const { isGuest, merchant } = useSession();
  const { toast, requirePin, requireAccount } = useUI();
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [reason, setReason] = useState(REASONS[0]);
  const [printing, setPrinting] = useState(false);

  const preferred = (location.state as { outletId?: string } | null)?.outletId;
  const t = useMemo(() => {
    const order = preferred ? [preferred, ...ACTIVE_OUTLET_IDS.filter((o) => o !== preferred)] : ACTIVE_OUTLET_IDS;
    for (const o of order) {
      const found = allTransactions[o]?.find((x) => x.id === id);
      if (found) return found;
    }
    return undefined;
  }, [allTransactions, id, preferred]);

  const refunds = useMemo(
    () => (t ? (allTransactions[t.outletId] ?? []).filter((x) => x.type === "refund" && x.reference === t.id) : []),
    [allTransactions, t],
  );

  if (!t) {
    return (
      <>
        <TopAppBar title="Transaction" backTo="/transactions" />
        <EmptyState icon={ReceiptText} title="Transaction not found" message="It may belong to another outlet or be older than 90 days." />
      </>
    );
  }

  const Icon = methodIcon[t.method];
  const refundable = t.type === "sale" && t.status !== "Refunded";
  const remaining = t.amount - (t.refundedAmount ?? 0);
  const ratio = t.subtotal ? t.amount / t.subtotal : 1;
  const selectedGross = Object.entries(selected).reduce((s, [i, q]) => s + (t.items[Number(i)]?.price ?? 0) * q, 0);
  const refundAmount = Math.min(remaining, Math.round(selectedGross * ratio));

  const settlement =
    t.type !== "sale"
      ? null
      : t.method === "Cash" && !t.payments
        ? { label: "Cash sale", detail: "Kept in your cash drawer, not settled" }
        : t.status === "Refunded"
          ? { label: "Excluded", detail: "Refunded before settlement" }
          : t.date === DEMO_TODAY
            ? { label: "Scheduled", detail: `Tomorrow at ${SETTLEMENT_TIME} to ${merchant.accountNumber}` }
            : { label: "Settled", detail: `${formatShortDate(shiftDate(t.date, 1))} at ${SETTLEMENT_TIME} to ${merchant.accountNumber}` };

  const share = async () => {
    const text = `Receipt ${t.id} - ${formatRupiah(t.amount)} (${METHOD_LABEL[t.method]})`;
    try {
      if (navigator.share) await navigator.share({ title: t.id, text });
      else {
        await navigator.clipboard.writeText(text);
        toast("Receipt copied to clipboard");
      }
    } catch {
      toast("Receipt ready to share", "info");
    }
  };

  const confirmRefund = () => {
    const items = Object.entries(selected)
      .filter(([, q]) => q > 0)
      .map(([index, qty]) => ({ index: Number(index), qty }));
    setRefundOpen(false);
    requirePin("Authorize refund", () => {
      const amount = refundTransaction(t.id, items, reason);
      setSelected({});
      toast(`Refund of ${formatRupiah(amount)} processed`);
    });
  };

  const title = t.type === "sale" ? "Sale details" : t.type === "refund" ? "Refund details" : "Settlement details";

  return (
    <>
      <TopAppBar title={title} subtitle={t.id} backTo="/transactions" />
      <PageBody>
        <section className="card flex flex-col items-center p-5 text-center">
          <span
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl",
              t.type === "refund" ? "bg-danger-soft text-danger-dark" : t.type === "settlement" ? "bg-success-soft text-success-dark" : "bg-navy text-gold",
            )}
          >
            {t.type === "refund" ? <RotateCcw className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
          </span>
          <p className="tabular mt-3 text-[30px] font-extrabold tracking-tight text-ink">
            {t.type === "refund" ? "-" : ""}
            {formatRupiah(t.amount)}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <StatusBadge status={t.status} />
            <span className="text-[12.5px] text-ink-muted">
              {formatDate(t.date)}, {t.time}
            </span>
          </div>
          {t.refundedAmount ? <p className="mt-2 text-[12.5px] font-semibold text-danger-dark">Refunded {formatRupiah(t.refundedAmount)}</p> : null}
        </section>

        {t.items.length > 0 && (
          <section className="card p-4">
            <h2 className="mb-2 text-[14px] font-bold text-ink">Items</h2>
            <ul className="divide-y divide-surface-line">
              {t.items.map((item, i) => (
                <li key={i} className="flex justify-between gap-3 py-2.5 text-[13.5px]">
                  <span className="min-w-0">
                    <span className="block font-semibold text-ink">
                      {item.qty}x {item.name}
                    </span>
                    {(item.variant || item.addons?.length || item.note) && (
                      <span className="block text-[12px] text-ink-muted">
                        {[item.variant, ...(item.addons ?? []), item.note ? `“${item.note}”` : ""].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </span>
                  <span className="tabular shrink-0 font-semibold text-ink">{formatRupiah(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 border-t border-surface-line pt-2">
              {t.subtotal !== undefined && t.subtotal !== t.amount && <InfoRow label="Subtotal" value={formatRupiah(t.subtotal)} />}
              {t.discount && t.type === "sale" ? <InfoRow label="Discount" value={`-${formatRupiah(t.discount)}`} /> : null}
              {t.service ? <InfoRow label="Service 5%" value={formatRupiah(t.service)} /> : null}
              <InfoRow label="Tax" value={t.tax ? formatRupiah(t.tax) : "Included in price"} />
              <InfoRow label="Total" value={formatRupiah(t.amount)} strong />
            </div>
          </section>
        )}

        <section className="card px-4 py-2">
          <InfoRow label="Invoice" value={t.id} />
          {t.type === "sale" && (
            <InfoRow
              label="Payment"
              value={(t.payments ?? [{ method: t.method as never, amount: t.amount }]).map((p) => `${METHOD_LABEL[p.method]} ${t.payments ? formatRupiah(p.amount) : ""}`).join(" + ")}
            />
          )}
          {t.type !== "sale" && <InfoRow label="Method" value={METHOD_LABEL[t.method]} />}
          {t.cashReceived ? <InfoRow label="Cash received" value={formatRupiah(t.cashReceived)} /> : null}
          {t.channel && <InfoRow label="Sales channel" value={`${t.channel}${t.orderRef ? ` · ${t.orderRef}` : ""}`} />}
          <InfoRow label="Cashier" value={t.cashier} />
          <InfoRow label="Outlet" value={outletArea(t.outletId)} />
          {t.type === "sale" && <InfoRow label="Customer" value={t.customerId ? `Customer ${t.customerId.replace("CUST-", "")}` : "Walk-in"} />}
          {t.type === "refund" && t.reference && (
            <InfoRow label="Original sale" value={<Link to={`/transactions/${t.reference}`} className="font-semibold text-sky-600">{t.reference}</Link>} />
          )}
          {t.type === "refund" && t.note && <InfoRow label="Reason" value={t.note} />}
          {t.refundReason && <InfoRow label="Refund reason" value={t.refundReason} />}
          {t.type === "settlement" && (
            <>
              <InfoRow label="Sales date" value={formatDate(t.reference ?? t.date)} />
              <InfoRow label="Gross non-cash sales" value={formatRupiah(t.subtotal ?? t.amount)} />
              <InfoRow label="Merchant discount rate" value={`-${formatRupiah(t.discount ?? 0)}`} />
              <InfoRow label="Net settled" value={formatRupiah(t.amount)} strong />
              <InfoRow label="Destination" value={merchant.accountNumber} />
            </>
          )}
          {settlement && <InfoRow label="Settlement" value={<span><span className="font-bold text-ink">{settlement.label}</span><br /><span className="text-[12px]">{settlement.detail}</span></span>} />}
          {t.note && t.type === "sale" && <InfoRow label="Note" value={t.note} />}
        </section>

        {refunds.length > 0 && (
          <section className="card p-4">
            <h2 className="mb-1 text-[14px] font-bold text-ink">Refund history</h2>
            {refunds.map((r) => (
              <Link key={r.id} to={`/transactions/${r.id}`} className="flex justify-between py-2 text-[13px]">
                <span className="text-ink-soft">
                  {r.id} · {r.time}
                </span>
                <span className="font-bold text-danger-dark">-{formatRupiah(r.amount)}</span>
              </Link>
            ))}
          </section>
        )}

        {t.type === "settlement" && (
          <Link to="/settlement" className="block text-center text-[13px] font-semibold text-sky-600">
            Open Settlement Center
          </Link>
        )}

        {t.type === "sale" && (
          <div className="grid grid-cols-3 gap-2">
            <Button variant="secondary" leftIcon={<FileText className="h-4 w-4" />} onClick={() => setReceiptOpen(true)}>
              Receipt
            </Button>
            <Button variant="secondary" leftIcon={<Share2 className="h-4 w-4" />} onClick={share}>
              Share
            </Button>
            <Button
              variant="secondary"
              loading={printing}
              leftIcon={<Printer className="h-4 w-4" />}
              onClick={() => {
                setPrinting(true);
                window.setTimeout(() => {
                  setPrinting(false);
                  toast("Receipt sent to printer");
                }, 1100);
              }}
            >
              Print
            </Button>
          </div>
        )}

        {refundable && (
          <Button
            block
            variant="danger"
            leftIcon={<RotateCcw className="h-4 w-4" />}
            onClick={() => {
              if (isGuest && !requireAccount("refunds")) return;
              setSelected(Object.fromEntries(t.items.map((it, i) => [i, it.qty])));
              setRefundOpen(true);
            }}
          >
            Refund
          </Button>
        )}
      </PageBody>

      <BottomSheet open={receiptOpen} onClose={() => setReceiptOpen(false)} title="Receipt">
        <ReceiptView transaction={t} />
      </BottomSheet>

      <BottomSheet
        open={refundOpen}
        onClose={() => setRefundOpen(false)}
        title="Refund"
        subtitle={`Refundable up to ${formatRupiah(remaining)}`}
        footer={
          <Button block size="lg" variant="danger" disabled={refundAmount <= 0} onClick={confirmRefund}>
            Confirm refund {formatRupiah(refundAmount)}
          </Button>
        }
      >
        <p className="mb-2 text-[13px] font-bold text-ink">1. Choose items</p>
        <div className="card divide-y divide-surface-line">
          {t.items.map((item, i) => {
            const qty = selected[i] ?? 0;
            return (
              <div key={i} className="flex items-center gap-3 px-3.5 py-3">
                <button
                  type="button"
                  aria-pressed={qty > 0}
                  onClick={() => setSelected((s) => ({ ...s, [i]: qty > 0 ? 0 : item.qty }))}
                  className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2", qty > 0 ? "border-navy bg-navy text-white" : "border-navy-200")}
                >
                  {qty > 0 && <Check className="h-4 w-4" strokeWidth={3} />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-semibold text-ink">{item.name}</p>
                  <p className="text-[12px] text-ink-muted">{formatRupiah(item.price)} each</p>
                </div>
                <Stepper value={qty} onChange={(v) => setSelected((s) => ({ ...s, [i]: Math.min(item.qty, Math.max(0, v)) }))} label={item.name} />
              </div>
            );
          })}
        </div>

        <p className="mb-2 mt-5 text-[13px] font-bold text-ink">2. Choose reason</p>
        <div className="flex flex-wrap gap-2">
          {REASONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReason(r)}
              className={cn("rounded-full border px-3 py-2 text-[12.5px] font-semibold", reason === r ? "border-navy bg-navy text-white" : "border-surface-line text-ink-soft")}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-2xl bg-danger-soft/60 p-4">
          <p className="text-[13px] font-bold text-ink">3. Refund amount</p>
          <p className="tabular mt-1 text-[24px] font-extrabold text-danger-dark">{formatRupiah(refundAmount)}</p>
          <p className="text-[12px] text-ink-muted">
            Returned via {METHOD_LABEL[t.method]}. Discounts and taxes are applied proportionally. You will be asked for your PIN.
          </p>
        </div>
      </BottomSheet>
    </>
  );
}
