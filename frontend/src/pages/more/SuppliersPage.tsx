import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ClipboardList, Plus, Truck } from "lucide-react";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { Segmented } from "@/components/common/FilterChip";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { IconButton } from "@/components/common/Button";
import { PurchaseOrderSheet } from "@/components/cards/PurchaseOrderSheet";
import { useData } from "@/hooks/useApp";
import { poTone } from "@/data/operations";
import { formatRupiah, formatShortDate } from "@/utils/format";

export default function SuppliersPage() {
  const { suppliers, purchaseOrders } = useData();
  const [tab, setTab] = useState<"suppliers" | "po">("suppliers");
  const [createOpen, setCreateOpen] = useState(false);
  const outstanding = suppliers.reduce((s, x) => s + x.outstanding, 0);

  return (
    <>
      <TopAppBar
        title="Suppliers"
        subtitle={`${suppliers.length} suppliers · ${formatRupiah(outstanding)} payable`}
        right={
          <IconButton label="New purchase order" onClick={() => setCreateOpen(true)}>
            <Plus className="h-5 w-5" />
          </IconButton>
        }
      >
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: "suppliers", label: "Suppliers" },
            { value: "po", label: `Purchase Orders (${purchaseOrders.length})` },
          ]}
        />
      </TopAppBar>

      <div className="space-y-3 px-5 pb-8 pt-4">
        {tab === "suppliers" ? (
          suppliers.map((s) => (
            <Link key={s.id} to={`/suppliers/${s.id}`} className="card block p-4 transition hover:shadow-float">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy-50 text-navy">
                    <Truck className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[14.5px] font-bold text-ink">{s.name}</p>
                    <p className="text-[12px] text-ink-muted">Category: {s.category}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-ink-faint" />
              </div>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-surface px-3 py-2 text-[12.5px]">
                <span className="text-ink-muted">
                  Last purchase <span className="font-bold text-ink">{formatRupiah(s.lastPurchase)}</span>
                </span>
                <StatusBadge status={s.paymentStatus} tone={s.paymentStatus === "Paid" ? "success" : "warning"} />
              </div>
            </Link>
          ))
        ) : purchaseOrders.length ? (
          purchaseOrders.map((po) => {
            const supplier = suppliers.find((s) => s.id === po.supplierId);
            return (
              <Link key={po.id} to={`/suppliers/${po.supplierId}?po=${po.id}`} className="card block p-4 transition hover:shadow-float">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[14.5px] font-extrabold text-ink">{po.id}</p>
                    <p className="text-[12px] text-ink-muted">
                      {supplier?.name} · {formatShortDate(po.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={po.status} tone={poTone[po.status]} />
                </div>
                <p className="mt-2 text-[12.5px] text-ink-soft">{po.lines.map((l) => `${l.name} ${l.qty}${l.unit}`).join(", ")}</p>
                <p className="tabular mt-2 text-right text-[15px] font-extrabold text-navy">{formatRupiah(po.total)}</p>
              </Link>
            );
          })
        ) : (
          <EmptyState icon={ClipboardList} title="No purchase orders" message="Create a purchase order to restock from a supplier." />
        )}
      </div>

      <PurchaseOrderSheet open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
