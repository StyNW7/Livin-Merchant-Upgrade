import type { Transaction } from "@/types";
import { METHOD_LABEL } from "@/data/analytics";
import { outletArea } from "@/data/outlets";
import { useData, useSession } from "@/hooks/useApp";
import { formatDate, formatRupiah } from "@/utils/format";

/** Printable receipt preview, laid out like a 58mm thermal receipt. */
export function ReceiptView({ transaction: t }: { transaction: Transaction }) {
  const { merchant } = useSession();
  const { settings } = useData();
  const subtotal = t.subtotal ?? t.items.reduce((s, i) => s + i.price * i.qty, 0);
  return (
    <div className="mx-auto w-full max-w-[300px] rounded-2xl border border-dashed border-navy-200 bg-white px-5 py-5 font-mono text-[11.5px] leading-relaxed text-ink">
      <div className="text-center">
        <p className="text-[13px] font-bold">{merchant.name}</p>
        <p>{outletArea(t.outletId)}</p>
        <p className="text-ink-muted">Powered by Livin Merchant</p>
      </div>
      <div className="my-3 border-t border-dashed border-navy-200" />
      <Row label="No" value={t.id} />
      <Row label="Date" value={`${formatDate(t.date)} ${t.time}`} />
      <Row label="Cashier" value={t.cashier} />
      {t.orderRef && <Row label="Order" value={t.orderRef} />}
      {t.channel && <Row label="Type" value={t.channel} />}
      <div className="my-3 border-t border-dashed border-navy-200" />
      {t.items.map((item, i) => (
        <div key={i} className="mb-1.5">
          <p className="font-semibold">{item.name}{item.variant ? ` (${item.variant})` : ""}</p>
          {item.addons?.length ? <p className="text-ink-muted">+ {item.addons.join(", ")}</p> : null}
          <Row label={`${item.qty} x ${formatRupiah(item.price)}`} value={formatRupiah(item.qty * item.price)} />
        </div>
      ))}
      <div className="my-3 border-t border-dashed border-navy-200" />
      <Row label="Subtotal" value={formatRupiah(subtotal)} />
      {t.discount ? <Row label="Discount" value={`-${formatRupiah(t.discount)}`} /> : null}
      {t.service ? <Row label="Service 5%" value={formatRupiah(t.service)} /> : null}
      {t.tax ? <Row label="PB1 Tax 10%" value={formatRupiah(t.tax)} /> : null}
      <Row label="TOTAL" value={formatRupiah(t.amount)} bold />
      <div className="my-2" />
      {(t.payments ?? [{ method: t.method, amount: t.amount }]).map((p, i) => (
        <Row key={i} label={METHOD_LABEL[p.method]} value={formatRupiah(p.amount)} />
      ))}
      {t.cashReceived ? (
        <>
          <Row label="Cash received" value={formatRupiah(t.cashReceived)} />
          <Row label="Change" value={formatRupiah(Math.max(0, t.cashReceived - (t.payments?.find((p) => p.method === "Cash")?.amount ?? t.amount)))} />
        </>
      ) : null}
      {t.refundedAmount ? <Row label="Refunded" value={`-${formatRupiah(t.refundedAmount)}`} /> : null}
      <div className="my-3 border-t border-dashed border-navy-200" />
      <p className="text-center text-ink-muted">{settings.receiptFooter}</p>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 ${bold ? "text-[13px] font-bold" : ""}`}>
      <span className="min-w-0 truncate">{label}</span>
      <span className="shrink-0">{value}</span>
    </div>
  );
}
