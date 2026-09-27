import { useState } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { Mail, PackageCheck, Phone, Plus, StickyNote, Wallet, XCircle } from "lucide-react";
import { TopAppBar, PageBody } from "@/components/layout/TopAppBar";
import { Button } from "@/components/common/Button";
import { BottomSheet } from "@/components/common/Overlay";
import { StatusBadge } from "@/components/common/StatusBadge";
import { InfoRow } from "@/components/cards/ListRow";
import { PurchaseOrderSheet } from "@/components/cards/PurchaseOrderSheet";
import { useData, useUI } from "@/hooks/useApp";
import { formatDate, formatRupiah, formatShortDate } from "@/utils/format";
import { poTone } from "@/data/operations";

export default function SupplierDetailPage() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const { suppliers, purchaseOrders, receivePurchaseOrder, payPurchaseOrder, cancelPurchaseOrder, paySupplierOutstanding, expenses } = useData();
  const { toast, confirm, requirePin } = useUI();
  const [createOpen, setCreateOpen] = useState(false);
  const supplier = suppliers.find((s) => s.id === id);
  if (!supplier) return <Navigate to="/suppliers" replace />;

  const orders = purchaseOrders.filter((p) => p.supplierId === supplier.id);
  const openPo = orders.find((p) => p.id === params.get("po")) ?? null;
  const history = expenses.filter((e) => e.supplierId === supplier.id);
  const closePo = () => setParams({}, { replace: true });

  return (
    <>
      <TopAppBar title={supplier.name} subtitle={supplier.category} backTo="/suppliers" />
      <PageBody>
        <section className="card p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-surface p-3">
              <p className="text-[11.5px] text-ink-muted">Last purchase</p>
              <p className="tabular text-[15px] font-extrabold text-ink">{formatRupiah(supplier.lastPurchase)}</p>
              <p className="text-[11.5px] text-ink-muted">{formatDate(supplier.lastPurchaseDate)}</p>
            </div>
            <div className="rounded-2xl bg-surface p-3">
              <p className="text-[11.5px] text-ink-muted">Outstanding payable</p>
              <p className="tabular text-[15px] font-extrabold text-ink">{formatRupiah(supplier.outstanding)}</p>
              <StatusBadge status={supplier.paymentStatus} tone={supplier.paymentStatus === "Paid" ? "success" : "warning"} className="mt-0.5" />
            </div>
          </div>
          {supplier.outstanding > 0 && (
            <Button
              block
              className="mt-3"
              leftIcon={<Wallet className="h-4 w-4" />}
              onClick={() =>
                requirePin(`Pay ${formatRupiah(supplier.outstanding)}`, () => {
                  paySupplierOutstanding(supplier.id);
                  toast(`Paid ${supplier.name}. Recorded as an expense.`);
                })
              }
            >
              Pay outstanding via Livin&apos; by Mandiri
            </Button>
          )}
        </section>

        <section className="card px-4 py-2">
          <InfoRow label="Contact" value={supplier.contactName} />
          <InfoRow label="Phone" value={<a href={`tel:${supplier.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1 font-semibold text-sky-600"><Phone className="h-3.5 w-3.5" />{supplier.phone}</a>} />
          <InfoRow label="Email" value={<a href={`mailto:${supplier.email}`} className="inline-flex items-center gap-1 font-semibold text-sky-600"><Mail className="h-3.5 w-3.5" />{supplier.email}</a>} />
          <InfoRow label="Payment terms" value={supplier.paymentTerms} />
          <InfoRow label="Products" value={supplier.products.join(", ")} />
        </section>

        <section className="rounded-2xl bg-gold-50 p-4">
          <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-gold-800">
            <StickyNote className="h-3.5 w-3.5" /> Notes
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{supplier.notes}</p>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-ink">Purchase orders</h2>
            <Button size="sm" variant="soft" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
              New PO
            </Button>
          </div>
          <div className="card divide-y divide-surface-line overflow-hidden">
            {orders.length ? (
              orders.map((po) => (
                <button key={po.id} type="button" onClick={() => setParams({ po: po.id })} className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-surface/70">
                  <span>
                    <span className="block text-[14px] font-bold text-ink">{po.id}</span>
                    <span className="text-[12px] text-ink-muted">{formatShortDate(po.createdAt)} · expected {formatShortDate(po.expectedAt)}</span>
                  </span>
                  <span className="text-right">
                    <span className="tabular block text-[13.5px] font-bold">{formatRupiah(po.total)}</span>
                    <StatusBadge status={po.status} tone={poTone[po.status]} />
                  </span>
                </button>
              ))
            ) : (
              <p className="px-4 py-5 text-center text-[13px] text-ink-muted">No purchase orders yet.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-[15px] font-bold text-ink">Purchase history</h2>
          <div className="card divide-y divide-surface-line overflow-hidden">
            {history.length ? (
              history.map((e) => (
                <div key={e.id} className="flex justify-between px-4 py-3 text-[13.5px]">
                  <span>
                    <span className="block font-semibold text-ink">{e.title}</span>
                    <span className="text-[12px] text-ink-muted">{formatDate(e.date)} · {e.method}</span>
                  </span>
                  <span className="tabular font-bold">{formatRupiah(e.amount)}</span>
                </div>
              ))
            ) : (
              <p className="px-4 py-5 text-center text-[13px] text-ink-muted">No recorded payments in the last 30 days.</p>
            )}
          </div>
        </section>
      </PageBody>

      <PurchaseOrderSheet open={createOpen} onClose={() => setCreateOpen(false)} supplierId={supplier.id} />

      <BottomSheet open={!!openPo} onClose={closePo} title={openPo?.id ?? ""} subtitle={openPo ? `Created ${formatDate(openPo.createdAt)}` : undefined}>
        {openPo && (
          <>
            <div className="mb-3 flex items-center justify-between">
              <StatusBadge status={openPo.status} tone={poTone[openPo.status]} />
              <span className="text-[12.5px] text-ink-muted">Expected {formatDate(openPo.expectedAt)}</span>
            </div>
            <div className="card px-4 py-2">
              {openPo.lines.map((l) => (
                <InfoRow key={l.name} label={`${l.name} ${l.qty}${l.unit === "pcs" ? " pcs" : l.unit}`} value={formatRupiah(l.qty * l.unitPrice)} />
              ))}
              <InfoRow label="Total" value={formatRupiah(openPo.total)} strong />
            </div>
            {openPo.note && <p className="mt-3 text-[12.5px] text-ink-muted">Note: {openPo.note}</p>}
            <div className="mt-4 space-y-2">
              {openPo.status === "Pending" && (
                <>
                  <Button
                    block
                    leftIcon={<PackageCheck className="h-4 w-4" />}
                    onClick={() => {
                      receivePurchaseOrder(openPo.id);
                      toast("Goods received. Ingredient stock updated.");
                    }}
                  >
                    Mark as received
                  </Button>
                  <Button
                    block
                    variant="secondary"
                    leftIcon={<XCircle className="h-4 w-4" />}
                    onClick={() =>
                      confirm({
                        title: `Cancel ${openPo.id}?`,
                        message: "The supplier will be notified that this order is cancelled.",
                        confirmLabel: "Cancel PO",
                        tone: "danger",
                        onConfirm: () => {
                          cancelPurchaseOrder(openPo.id);
                          toast(`${openPo.id} cancelled`, "warning");
                        },
                      })
                    }
                  >
                    Cancel order
                  </Button>
                </>
              )}
              {openPo.status === "Received" && (
                <Button
                  block
                  leftIcon={<Wallet className="h-4 w-4" />}
                  onClick={() =>
                    requirePin(`Pay ${formatRupiah(openPo.total)}`, () => {
                      payPurchaseOrder(openPo.id);
                      toast("Payment sent. Added to Expenses.");
                    })
                  }
                >
                  Pay {formatRupiah(openPo.total)}
                </Button>
              )}
            </div>
          </>
        )}
      </BottomSheet>
    </>
  );
}
