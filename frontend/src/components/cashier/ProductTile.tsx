import { Coffee, CupSoda, Cookie, Sandwich, Star, type LucideIcon } from "lucide-react";
import type { Product, ProductCategory } from "@/types";
import { categoryTone } from "@/data/products";
import { formatRupiah } from "@/utils/format";
import { cn } from "@/utils/cn";

export const categoryIcon: Record<ProductCategory, LucideIcon> = {
  Coffee: Coffee,
  "Non-Coffee": CupSoda,
  Food: Sandwich,
  Snacks: Cookie,
};

/** Photo placeholder: category color with the product initials and icon. */
export function ProductThumb({ product, size = "md" }: { product: Pick<Product, "name" | "category">; size?: "sm" | "md" | "lg" }) {
  const tone = categoryTone[product.category];
  const Icon = categoryIcon[product.category];
  const initials = product.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden",
        size === "sm" && "h-10 w-10 rounded-xl",
        size === "md" && "h-full w-full rounded-2xl",
        size === "lg" && "h-28 w-28 rounded-3xl",
      )}
      style={{ backgroundColor: tone.bg, color: tone.fg }}
      aria-hidden
    >
      <Icon className={cn("absolute opacity-15", size === "sm" ? "h-8 w-8" : "h-16 w-16")} strokeWidth={1.4} />
      <span className={cn("relative font-extrabold", size === "sm" ? "text-[13px]" : size === "lg" ? "text-3xl" : "text-xl")}>{initials}</span>
    </div>
  );
}

interface ProductTileProps {
  product: Product;
  qtyInCart: number;
  favorite: boolean;
  onAdd: () => void;
  onToggleFavorite: () => void;
}

export function ProductTile({ product: p, qtyInCart, favorite, onAdd, onToggleFavorite }: ProductTileProps) {
  const out = p.stock <= 0;
  const low = !out && p.stock <= p.lowStockThreshold;
  return (
    <div className={cn("relative overflow-hidden rounded-3xl border bg-white shadow-card transition", qtyInCart ? "border-navy ring-2 ring-navy/10" : "border-surface-line")}>
      <button type="button" onClick={onAdd} disabled={out} className="block w-full p-2.5 text-left active:scale-[0.98] disabled:opacity-50">
        <div className="relative h-[86px]">
          <ProductThumb product={p} />
          {qtyInCart > 0 && (
            <span className="absolute bottom-1.5 left-1.5 rounded-full bg-navy px-2 py-0.5 text-[11px] font-bold text-white">{qtyInCart} in cart</span>
          )}
        </div>
        <p className="mt-2 line-clamp-2 min-h-[36px] text-[13.5px] font-bold leading-tight text-ink">{p.name}</p>
        <div className="mt-1 flex items-center justify-between gap-1">
          <p className="tabular text-[13px] font-extrabold text-navy">{formatRupiah(p.price)}</p>
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
              out ? "bg-danger-soft text-danger-dark" : low ? "bg-warning-soft text-warning-dark" : "bg-surface text-ink-muted",
            )}
          >
            {out ? "Sold out" : `${low ? "Low " : ""}${p.stock}`}
          </span>
        </div>
        {(p.hasVariants || p.hasAddons) && <p className="mt-0.5 text-[10.5px] font-medium text-ink-faint">Options available</p>}
      </button>
      <button
        type="button"
        onClick={onToggleFavorite}
        aria-label={favorite ? `Remove ${p.name} from favorites` : `Add ${p.name} to favorites`}
        aria-pressed={favorite}
        className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 shadow-sm backdrop-blur"
      >
        <Star className={cn("h-4 w-4", favorite ? "fill-gold text-gold" : "text-ink-faint")} />
      </button>
    </div>
  );
}
