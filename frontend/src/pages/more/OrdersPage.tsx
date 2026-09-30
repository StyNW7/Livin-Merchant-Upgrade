import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bike, ChefHat, ClipboardList, Clock, ShoppingBag, UtensilsCrossed, XCircle } from "lucide-react";
import type { Order, OrderStatus } from "@/types";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { ChipRow, FilterChip } from "@/components/common/FilterChip";
import { EmptyState } from "@/components/common/EmptyState";
import { BottomSheet } from "@/components/common/Overlay";
import { Button } from "@/components/common/Button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { InfoRow } from "@/components/cards/ListRow";
import { useData, useSession, useUI } from "@/hooks/useApp";
import { formatRupiah } from "@/utils/format";

const TABS: OrderStatus[] = ["New", "Preparing", "Ready", "Completed", "Cancelled"];
const NEXT: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  New: { status: "Preparing", label: "Start preparing" },
  Preparing: { status: "Ready", label: "Mark ready" },
  Ready: { status: "Completed", label: "Complete" },
};
const channelIcon = { "Dine-in": UtensilsCrossed, Takeaway: ShoppingBag, Delivery: Bike };
const statusTone = { New: "info", Preparing: "gold", Ready: "success", Completed: "neutral", Cancelled: "danger" } as const;

export default function OrdersPage() {
  const { orders, updateOrderStatus } = useData();
  const { outletId, outletName } = useSession();
  const { toast, confirm } = useUI();
  const [tab, setTab] = useState<OrderStatus>("New");
  const [openId, setOpenId] = useState<string | null>(null);

  const outletOrders = useMemo(() => orders.filter((o) => o.outletId === outletId), [orders, outletId]);
  const visible = outletOrders.filter((o) => o.status === tab);
  const open = outletOrders.find((o) => o.id === openId) ?? null;

  const advance = (o: Order) => {
    const next = NEXT[o.status];
    if (!next) return;
    updateOrderStatus(o.id, next.status);
    toast(`${o.id} ${next.status === "Completed" ? "completed" : `moved to ${next.status}`}`);
  };

  const cancel = (o: Order) =>
    confirm({
      title: `Cancel ${o.id}?`,
      message: "The customer should be informed. Paid orders can be refunded from Transactions.",
      confirmLabel: "Cancel order",
      tone: "danger",
      onConfirm: () => {
        updateOrderStatus(o.id, "Cancelled");
        setOpenId(null);
        toast(`${o.id} cancelled`, "warning");
      },
    });

  return (
    <>
      <TopAppBar title="Order Management" subtitle={outletName}>
        <ChipRow>
          {TABS.map((s) => (
            <FilterChip key={s} label={s} active={tab === s} onClick={() => setTab(s)} count={outletOrders.filter((o) => o.status === s).length} />
          ))}
        </ChipRow>
      </TopAppBar>

      <div className="space-y-3 px-5 pb-8 pt-4">
        {visible.length ? (
          visible.map((o) => {
            const Icon = channelIcon[o.channel];
            const next = NEXT[o.status];
            return (
              <article key={o.id} className="card p-4">
                <button type="button" onClick={() => setOpenId(o.id)} className="block w-full text-left">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-[15px] font-extrabold text-ink">#{o.id}</p>
                        <p className="text-[12px] text-ink-muted">
                          {o.reference} · {o.channel}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={o.status} tone={statusTone[o.status]} />
                  </div>
                  <ul className="mt-3 space-y-0.5 text-[13.5px] text-ink-soft">
                    {o.items.map((i, k) => (
                      <li key={k}>
                        {i.qty}x {i.name}
                        {i.variant ? ` (${i.variant})` : ""}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex items-center justify-between border-t border-surface-line pt-3">
                    <span className="inline-flex items-center gap-1 text-[12px] text-ink-muted">
                      <Clock className="h-3.5 w-3.5" /> {o.createdAt}
                    </span>
                    <span className="tabular text-[15px] font-extrabold text-navy-600">{formatRupiah(o.total)}</span>
                  </div>
                </button>
                {next && (
                  <div className="mt-3 grid grid-cols-[auto_1fr] gap-2">
                    <Button size="sm" variant="secondary" onClick={() => cancel(o)} aria-label={`Cancel ${o.id}`}>
                      <XCircle className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={() => advance(o)} leftIcon={o.status === "New" ? <ChefHat className="h-4 w-4" /> : undefined}>
                      {next.label}
                    </Button>
                  </div>
                )}
              </article>
            );
          })
        ) : (
          <EmptyState icon={ClipboardList} title={`No ${tab.toLowerCase()} orders`} message="New orders from the cashier appear here so the kitchen can prepare them." />
        )}
      </div>

      <BottomSheet open={!!open} onClose={() => setOpenId(null)} title={open ? `#${open.id}` : ""} subtitle={open ? `${open.reference} · ${open.channel}` : undefined}>
        {open && (
          <>
            <div className="card px-4 py-2">
              {open.items.map((i, k) => (
                <InfoRow key={k} label={`${i.qty}x ${i.name}${i.variant ? ` (${i.variant})` : ""}`} value={formatRupiah(i.qty * i.price)} />
              ))}
              <InfoRow label="Total" value={formatRupiah(open.total)} strong />
            </div>
            <div className="card mt-3 px-4 py-2">
              <InfoRow label="Status" value={<StatusBadge status={open.status} tone={statusTone[open.status]} />} />
              <InfoRow label="Created" value={open.createdAt} />
              <InfoRow label="Last update" value={open.updatedAt} />
              {open.note && <InfoRow label="Note" value={open.note} />}
              {open.invoiceId && (
                <InfoRow label="Payment" value={<Link to={`/transactions/${open.invoiceId}`} className="font-semibold text-sky-600">{open.invoiceId}</Link>} />
              )}
            </div>
            {NEXT[open.status] && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => cancel(open)}>
                  Cancel order
                </Button>
                <Button onClick={() => advance(open)}>{NEXT[open.status]!.label}</Button>
              </div>
            )}
          </>
        )}
      </BottomSheet>
    </>
  );
}
