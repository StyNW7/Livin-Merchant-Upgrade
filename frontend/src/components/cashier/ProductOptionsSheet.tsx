import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import type { Product } from "@/types";
import { BottomSheet } from "@/components/common/Overlay";
import { Button } from "@/components/common/Button";
import { Stepper, TextField, Toggle } from "@/components/common/Form";
import { DRINK_VARIANTS, addonsFor } from "@/data/products";
import type { AddLineInput } from "@/context/contexts";
import { formatRupiah } from "@/utils/format";
import { cn } from "@/utils/cn";
import { ProductThumb } from "./ProductTile";

interface Props {
  product: Product | null;
  onClose: () => void;
  onAdd: (line: AddLineInput) => void;
  /** Units still available after what is already in the cart. */
  available?: number;
}

/** Variant, add-on, quantity, note and manual price selection for a product. */
export function ProductOptionsSheet({ product, onClose, onAdd, available }: Props) {
  const [variant, setVariant] = useState("regular");
  const [addons, setAddons] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [manual, setManual] = useState(false);
  const [manualPrice, setManualPrice] = useState("");

  useEffect(() => {
    setVariant("regular");
    setAddons([]);
    setQty(1);
    setNote("");
    setManual(false);
    setManualPrice("");
  }, [product?.id]);

  if (!product) return null;
  const variants = product.hasVariants ? DRINK_VARIANTS : [];
  const addonList = addonsFor(product);
  const variantDelta = variants.find((v) => v.id === variant)?.priceDelta ?? 0;
  const addonTotal = addonList.filter((a) => addons.includes(a.id)).reduce((s, a) => s + a.price, 0);
  const computed = product.price + variantDelta + addonTotal;
  const unitPrice = manual && Number(manualPrice) > 0 ? Number(manualPrice) : computed;

  return (
    <BottomSheet
      open={!!product}
      onClose={onClose}
      title={product.name}
      subtitle={`${product.category} · Base price ${formatRupiah(product.price)}`}
      footer={
        <Button
          block
          size="lg"
          onClick={() => {
            onAdd({
              productId: product.id,
              name: product.name,
              basePrice: product.price,
              unitPrice,
              variant: variants.length ? variants.find((v) => v.id === variant)?.label : undefined,
              addons: addonList.filter((a) => addons.includes(a.id)).map((a) => a.label),
              note: note.trim() || undefined,
              qty,
              manualPrice: manual && Number(manualPrice) > 0,
            });
            onClose();
          }}
        >
          Add {qty} to cart · {formatRupiah(unitPrice * qty)}
        </Button>
      }
    >
      <div className="mb-4 flex justify-center">
        <ProductThumb product={product} size="lg" />
      </div>

      {variants.length > 0 && (
        <section className="mb-4">
          <p className="mb-2 text-[13px] font-bold text-ink">Size</p>
          <div className="grid grid-cols-2 gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariant(v.id)}
                aria-pressed={variant === v.id}
                className={cn(
                  "flex items-center justify-between rounded-2xl border px-3.5 py-3 text-left",
                  variant === v.id ? "border-navy bg-navy-50" : "border-surface-line",
                )}
              >
                <span className="text-[14px] font-semibold text-ink">{v.label}</span>
                <span className="text-[12px] text-ink-muted">{v.priceDelta ? `+${formatRupiah(v.priceDelta)}` : "Included"}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {addonList.length > 0 && (
        <section className="mb-4">
          <p className="mb-2 text-[13px] font-bold text-ink">Add-ons</p>
          <div className="card divide-y divide-surface-line overflow-hidden">
            {addonList.map((a) => {
              const on = addons.includes(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setAddons((prev) => (on ? prev.filter((x) => x !== a.id) : [...prev, a.id]))}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <span className={cn("flex h-5 w-5 items-center justify-center rounded-md border-2", on ? "border-navy bg-navy text-white" : "border-navy-200")}>
                    {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  </span>
                  <span className="flex-1 text-[14px] text-ink">{a.label}</span>
                  <span className="text-[12.5px] text-ink-muted">{a.price ? `+${formatRupiah(a.price)}` : "Free"}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="mb-4 flex items-center justify-between">
        <p className="text-[13px] font-bold text-ink">Quantity</p>
        <Stepper value={qty} onChange={(v) => setQty(Math.max(1, v))} min={1} max={available} label="quantity" />
      </section>

      <TextField label="Note for kitchen" placeholder="e.g. less ice, warm up" value={note} onChange={(e) => setNote(e.target.value)} maxLength={60} />

      <div className="mt-3 rounded-2xl bg-surface px-3">
        <Toggle checked={manual} onChange={setManual} label="Manual price" description="Override the price for this item" />
        {manual && (
          <div className="pb-3">
            <TextField
              label="Price per item"
              prefix="Rp"
              inputMode="numeric"
              value={manualPrice}
              onChange={(e) => setManualPrice(e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder={String(computed)}
            />
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
