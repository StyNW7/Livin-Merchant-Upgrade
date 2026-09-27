import { useState } from "react";
import { PauseCircle, Percent, ShoppingBag, Trash2, UserRound } from "lucide-react";
import type { SalesChannel } from "@/types";
import { BottomSheet } from "@/components/common/Overlay";
import { Button } from "@/components/common/Button";
import { Segmented } from "@/components/common/FilterChip";
import { SelectField, Stepper, TextField, Toggle } from "@/components/common/Form";
import { EmptyState } from "@/components/common/EmptyState";
import { useCart, useData } from "@/hooks/useApp";
import { formatRupiah } from "@/utils/format";
import { cn } from "@/utils/cn";
import { ProductThumb } from "./ProductTile";
import { productById } from "@/data/products";

const DISCOUNTS = [0, 5, 10, 15];

interface Props {
  open: boolean;
  onClose: () => void;
  onCharge: () => void;
  onHold: () => void;
}

export function CartSheet({ open, onClose, onCharge, onHold }: Props) {
  const cart = useCart();
  const { customers, products, promotions } = useData();
  const promoOptions = promotions
    .filter((p) => p.status === "Active" && p.type === "Percentage")
    .map((p) => ({ id: p.id, name: p.name, hours: p.hours, percent: Number(/(\d+)%/.exec(p.benefit)?.[1] ?? 0) }))
    .filter((p) => p.percent > 0);
  const stockLeft = (productId: string, key: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return undefined;
    return product.stock - cart.lines.filter((l) => l.productId === productId && l.key !== key).reduce((s, l) => s + l.qty, 0);
  };
  const [customDiscount, setCustomDiscount] = useState("");

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Current order"
      subtitle={cart.count ? `${cart.count} item${cart.count > 1 ? "s" : ""}` : undefined}
      footer={
        cart.lines.length ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-ink-muted">Total</span>
              <span className="tabular text-[20px] font-extrabold text-ink">{formatRupiah(cart.total)}</span>
            </div>
            <div className="grid grid-cols-[auto_1fr] gap-2">
              <Button variant="secondary" size="lg" leftIcon={<PauseCircle className="h-4 w-4" />} onClick={onHold}>
                Hold
              </Button>
              <Button size="lg" onClick={onCharge}>
                Charge {formatRupiah(cart.total)}
              </Button>
            </div>
          </div>
        ) : undefined
      }
    >
      {!cart.lines.length ? (
        <EmptyState icon={ShoppingBag} title="Your cart is empty" message="Add products to start your first sale." />
      ) : (
        <div className="space-y-5">
          <section className="space-y-2.5">
            {cart.lines.map((line) => {
              const product = productById.get(line.productId);
              return (
                <div key={line.key} className="flex gap-3 rounded-2xl border border-surface-line p-3">
                  <ProductThumb product={{ name: line.name, category: product?.category ?? "Snacks" }} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-bold text-ink">{line.name}</p>
                        <p className="truncate text-[11.5px] text-ink-muted">
                          {[line.variant, ...line.addons].filter(Boolean).join(" · ") || "Standard"}
                          {line.manualPrice && " · Manual price"}
                        </p>
                        {line.note && <p className="truncate text-[11.5px] italic text-ink-muted">“{line.note}”</p>}
                      </div>
                      <button type="button" aria-label={`Remove ${line.name}`} onClick={() => cart.removeLine(line.key)} className="rounded-lg p-1.5 text-ink-faint hover:bg-danger-soft hover:text-danger">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="tabular text-[13.5px] font-extrabold text-navy">{formatRupiah(line.unitPrice * line.qty)}</span>
                      <Stepper value={line.qty} onChange={(v) => cart.setQty(line.key, v)} max={stockLeft(line.productId, line.key)} label={line.name} />
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="space-y-3">
            <p className="text-[13px] font-bold text-ink">Order details</p>
            <Segmented<SalesChannel>
              value={cart.channel}
              onChange={cart.setChannel}
              options={[
                { value: "Dine-in", label: "Dine-in" },
                { value: "Takeaway", label: "Takeaway" },
                { value: "Delivery", label: "Delivery" },
              ]}
            />
            <TextField
              label={cart.channel === "Dine-in" ? "Table number" : cart.channel === "Delivery" ? "Delivery order reference" : "Order reference"}
              placeholder={cart.channel === "Dine-in" ? "e.g. Table 7" : cart.channel === "Delivery" ? "e.g. GrabFood GF-2301" : "e.g. Takeaway #19"}
              value={cart.orderRef}
              onChange={(e) => cart.setOrderRef(e.target.value)}
              maxLength={30}
            />
            <SelectField
              label="Customer"
              value={cart.customerId ?? ""}
              onChange={(e) => cart.setCustomerId(e.target.value || undefined)}
              options={[{ value: "", label: "Walk-in customer" }, ...customers.map((c) => ({ value: c.id, label: `${c.label} · ${c.segment}` }))]}
            />
            <TextField label="Order note" placeholder="Optional" value={cart.note} onChange={(e) => cart.setNote(e.target.value)} maxLength={80} />
          </section>

          <section>
            <p className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-ink">
              <Percent className="h-4 w-4 text-ink-muted" /> Discount
            </p>
            <div className="flex flex-wrap gap-2">
              {DISCOUNTS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    cart.setDiscountPercent(d);
                    setCustomDiscount("");
                  }}
                  className={cn(
                    "h-9 rounded-full border px-3.5 text-[13px] font-semibold",
                    cart.discountPercent === d && !customDiscount && !cart.promotionId ? "border-navy bg-navy text-white" : "border-surface-line text-ink-soft",
                  )}
                >
                  {d ? `${d}%` : "None"}
                </button>
              ))}
              {promoOptions.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    cart.applyPromotion(p.id, p.percent);
                    setCustomDiscount("");
                  }}
                  title={`Valid ${p.hours}`}
                  className={cn(
                    "h-9 rounded-full border px-3.5 text-[13px] font-semibold",
                    cart.promotionId === p.id ? "border-gold-600 bg-gold text-navy-900" : "border-gold-300 bg-gold-50 text-gold-800",
                  )}
                >
                  {p.name} {p.percent}%
                </button>
              ))}
              <input
                inputMode="numeric"
                aria-label="Custom discount percent"
                placeholder="Custom %"
                value={customDiscount}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 2);
                  setCustomDiscount(v);
                  cart.setDiscountPercent(Math.min(50, Number(v || 0)));
                }}
                className="h-9 w-24 rounded-full border border-surface-line px-3 text-[13px]"
              />
            </div>
          </section>

          <section className="rounded-2xl bg-surface px-3">
            <Toggle checked={cart.applyService} onChange={cart.setApplyService} label="Service charge 5%" />
            <Toggle checked={cart.applyTax} onChange={cart.setApplyTax} label="PB1 restaurant tax 10%" description="Calculated after discount and service" />
          </section>

          <section className="space-y-1.5 text-[13.5px]">
            <Row label="Subtotal" value={formatRupiah(cart.subtotal)} />
            {cart.discount > 0 && (
              <Row
                label={`${promoOptions.find((p) => p.id === cart.promotionId)?.name ?? "Discount"} ${cart.discountPercent}%`}
                value={`-${formatRupiah(cart.discount)}`}
              />
            )}
            {cart.voucher > 0 && <Row label="Customer voucher" value={`-${formatRupiah(cart.voucher)}`} />}
            {cart.service > 0 && <Row label="Service 5%" value={formatRupiah(cart.service)} />}
            {cart.tax > 0 && <Row label="PB1 tax 10%" value={formatRupiah(cart.tax)} />}
            {cart.customerId && (
              <p className="flex items-center gap-1.5 pt-1 text-[12px] text-ink-muted">
                <UserRound className="h-3.5 w-3.5" /> Linked to Customer {cart.customerId}
              </p>
            )}
          </section>

          <button type="button" onClick={cart.clear} className="w-full py-2 text-[13px] font-semibold text-danger">
            Clear cart
          </button>
        </div>
      )}
    </BottomSheet>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-muted">{label}</span>
      <span className="tabular font-semibold text-ink">{value}</span>
    </div>
  );
}
