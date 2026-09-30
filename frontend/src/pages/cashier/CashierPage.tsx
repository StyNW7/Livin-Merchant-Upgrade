import { useMemo, useState } from "react";
import { ChevronRight, ClipboardList, History, PackageSearch, PenLine, ShoppingBag, Star } from "lucide-react";
import type { HeldOrder, PaymentSplit, Product, ProductCategory, Transaction } from "@/types";
import { TabHeader } from "@/components/layout/TopAppBar";
import { CoachMark } from "@/components/layout/Banners";
import { IconButton, Button } from "@/components/common/Button";
import { ChipRow, FilterChip } from "@/components/common/FilterChip";
import { SearchInput, TextField } from "@/components/common/Form";
import { BottomSheet } from "@/components/common/Overlay";
import { EmptyState } from "@/components/common/EmptyState";
import { ProductTile } from "@/components/cashier/ProductTile";
import { ProductOptionsSheet } from "@/components/cashier/ProductOptionsSheet";
import { CartSheet } from "@/components/cashier/CartSheet";
import { CheckoutSheet } from "@/components/cashier/CheckoutSheet";
import { SuccessView } from "@/components/cashier/SuccessView";
import { useCart, useData, useSession, useUI } from "@/hooks/useApp";
import { PRODUCT_CATEGORIES } from "@/data/products";
import { DEMO_TODAY } from "@/data/merchant";
import { formatRupiah } from "@/utils/format";

type Filter = "All" | "Favorites" | "Recent" | ProductCategory;

export default function CashierPage() {
  const cart = useCart();
  const { products, favorites, toggleFavorite, transactions, heldOrders, holdOrder, removeHeldOrder, recordSale } = useData();
  const { outletName } = useSession();
  const { toast, confirm, haptic } = useUI();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [optionsFor, setOptionsFor] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [heldOpen, setHeldOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState<Transaction | null>(null);

  const recentIds = useMemo(() => {
    const ids: string[] = [];
    for (const t of transactions) {
      if (t.type !== "sale" || t.date !== DEMO_TODAY) continue;
      for (const item of t.items) if (!ids.includes(item.productId) && item.productId !== "custom") ids.push(item.productId);
      if (ids.length >= 8) break;
    }
    return ids;
  }, [transactions]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => p.active);
    if (filter === "Favorites") list = list.filter((p) => favorites.includes(p.id));
    else if (filter === "Recent") list = recentIds.map((id) => list.find((p) => p.id === id)).filter((p): p is Product => !!p);
    else if (filter !== "All") list = list.filter((p) => p.category === filter);
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    return list;
  }, [products, filter, favorites, recentIds, query]);

  const qtyFor = (id: string) => cart.lines.filter((l) => l.productId === id).reduce((s, l) => s + l.qty, 0);

  const add = (p: Product) => {
    if (qtyFor(p.id) >= p.stock) {
      toast(`Only ${p.stock} ${p.name} in stock. Restock it in Inventory.`, "warning");
      return;
    }
    if (p.hasVariants || p.hasAddons) setOptionsFor(p);
    else {
      cart.quickAdd(p.id);
      haptic();
      toast(`${p.name} added`, "info");
    }
  };

  const hold = () => {
    const ref = cart.orderRef || `Order ${heldOrders.length + 1}`;
    const order: HeldOrder = {
      id: `HOLD-${Date.now()}`,
      reference: ref,
      lines: cart.lines,
      total: cart.total,
      heldAt: new Date().toTimeString().slice(0, 5),
      customerId: cart.customerId,
      channel: cart.channel,
    };
    holdOrder(order);
    cart.clear();
    setCartOpen(false);
    toast(`${ref} is on hold`);
  };

  const pay = (payments: PaymentSplit[], cashReceived?: number) => {
    setProcessing(true);
    window.setTimeout(() => {
      const sale = recordSale({
        lines: cart.lines,
        payments,
        channel: cart.channel,
        orderRef: cart.orderRef,
        customerId: cart.customerId,
        subtotal: cart.subtotal,
        discount: cart.discount + cart.voucher,
        voucher: cart.voucher,
        promotionId: cart.promotionId,
        tax: cart.tax,
        service: cart.service,
        total: cart.total,
        cashReceived,
        note: cart.note,
      });
      cart.clear();
      setProcessing(false);
      setCheckoutOpen(false);
      setCartOpen(false);
      setCompleted(sale);
    }, 1100);
  };

  if (completed) return <SuccessView transaction={completed} onNew={() => setCompleted(null)} />;

  const filters: Filter[] = ["All", "Favorites", "Recent", ...PRODUCT_CATEGORIES];

  return (
    <div className="pb-4">
      <TabHeader
        title="Cashier"
        subtitle={outletName}
        right={
          <>
            <IconButton label="Custom amount item" onClick={() => setCustomOpen(true)}>
              <PenLine className="h-5 w-5" />
            </IconButton>
            <IconButton label={`Held orders, ${heldOrders.length}`} badge={heldOrders.length > 0} onClick={() => setHeldOpen(true)}>
              <ClipboardList className="h-5 w-5" />
            </IconButton>
          </>
        }
      />

      <div className="space-y-3 px-5 pt-1">
        <CoachMark id="cashier" title="Welcome to Cashier" text="Add products to start your first sale. Tap the star to pin favorites." />
        <SearchInput value={query} onChange={setQuery} placeholder="Search products or SKU" />
        <ChipRow>
          {filters.map((f) => (
            <FilterChip
              key={f}
              label={f === "Recent" ? "Recently sold" : f}
              active={filter === f}
              onClick={() => setFilter(f)}
              icon={f === "Favorites" ? <Star className="h-3.5 w-3.5" /> : f === "Recent" ? <History className="h-3.5 w-3.5" /> : undefined}
            />
          ))}
        </ChipRow>
      </div>

      <div className="px-5 pt-4">
        {visible.length ? (
          <div className="grid grid-cols-2 gap-3">
            {visible.map((p) => (
              <ProductTile
                key={p.id}
                product={p}
                qtyInCart={qtyFor(p.id)}
                favorite={favorites.includes(p.id)}
                onAdd={() => add(p)}
                onToggleFavorite={() => toggleFavorite(p.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={filter === "Favorites" ? Star : PackageSearch}
            title={filter === "Favorites" ? "No favorites yet" : "No products found"}
            message={filter === "Favorites" ? "Tap the star on a product to keep it here." : "Try another name or category."}
          />
        )}
      </div>

      {cart.count > 0 && (
        <div className="sticky bottom-0 z-10 mt-4 px-5 pb-2 pt-2">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="flex w-full animate-toast-in items-center gap-3 rounded-2xl bg-gradient-to-r from-navy-400 via-navy to-navy-700 px-4 py-3 text-white shadow-float active:scale-[0.99]"
          >
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <ShoppingBag className="h-5 w-5 text-white" />
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[11px] font-extrabold text-navy-900 ring-2 ring-navy">
                {cart.count}
              </span>
            </span>
            <span className="flex-1 text-left">
              <span className="block text-[12px] text-white/85">View cart</span>
              <span className="tabular block text-[16px] font-extrabold">{formatRupiah(cart.total)}</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-xl bg-gold px-3 py-2 text-[13px] font-bold text-navy-900">
              Checkout <ChevronRight className="h-4 w-4" />
            </span>
          </button>
        </div>
      )}

      <ProductOptionsSheet
        product={optionsFor}
        onClose={() => setOptionsFor(null)}
        available={optionsFor ? optionsFor.stock - qtyFor(optionsFor.id) : undefined}
        onAdd={(line) => {
          cart.addLine(line);
          haptic();
          toast(`${line.qty ?? 1}x ${line.name} added`, "info");
        }}
      />

      <CartSheet
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onHold={hold}
        onCharge={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      <CheckoutSheet open={checkoutOpen} onClose={() => setCheckoutOpen(false)} onConfirm={pay} processing={processing} />

      <BottomSheet open={heldOpen} onClose={() => setHeldOpen(false)} title="Held orders" subtitle="Retrieve an order to continue checkout">
        {heldOrders.length ? (
          <div className="space-y-2.5">
            {heldOrders.map((o) => (
              <div key={o.id} className="rounded-2xl border border-surface-line p-3.5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[14px] font-bold text-ink">{o.reference}</p>
                    <p className="text-[12px] text-ink-muted">
                      {o.channel} · {o.lines.reduce((s, l) => s + l.qty, 0)} items · held at {o.heldAt}
                    </p>
                  </div>
                  <p className="tabular text-[14px] font-extrabold text-navy-600">{formatRupiah(o.total)}</p>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      confirm({
                        title: "Discard held order?",
                        message: `${o.reference} will be removed.`,
                        confirmLabel: "Discard",
                        tone: "danger",
                        onConfirm: () => removeHeldOrder(o.id),
                      })
                    }
                  >
                    Discard
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      const retrieve = () => {
                        cart.loadLines(o.lines, { channel: o.channel, orderRef: o.reference, customerId: o.customerId });
                        removeHeldOrder(o.id);
                        setHeldOpen(false);
                        setCartOpen(true);
                      };
                      if (cart.lines.length) {
                        confirm({
                          title: "Replace current cart?",
                          message: "Your current cart will be replaced by this held order.",
                          confirmLabel: "Replace",
                          onConfirm: retrieve,
                        });
                      } else retrieve();
                    }}
                  >
                    Retrieve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={ClipboardList} title="No held orders" message="Use Hold in the cart to park an order and serve the next customer." />
        )}
      </BottomSheet>

      <BottomSheet
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        title="Custom amount"
        subtitle="For items not in your catalog"
        footer={
          <Button
            block
            size="lg"
            disabled={!customName.trim() || Number(customPrice) < 1000}
            onClick={() => {
              const price = Number(customPrice);
              cart.addLine({ productId: "custom", name: customName.trim(), basePrice: price, unitPrice: price, manualPrice: true });
              toast(`${customName.trim()} added`, "info");
              setCustomName("");
              setCustomPrice("");
              setCustomOpen(false);
            }}
          >
            Add to cart
          </Button>
        }
      >
        <div className="space-y-3">
          <TextField label="Item name" placeholder="e.g. Catering add-on" value={customName} onChange={(e) => setCustomName(e.target.value)} maxLength={40} />
          <TextField label="Price" prefix="Rp" inputMode="numeric" value={customPrice} onChange={(e) => setCustomPrice(e.target.value.replace(/\D/g, "").slice(0, 9))} hint="Minimum Rp 1.000" />
        </div>
      </BottomSheet>
    </div>
  );
}
