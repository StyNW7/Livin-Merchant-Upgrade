import { useCallback, useMemo, type ReactNode } from "react";
import type { CartLine, SalesChannel } from "@/types";
import { useData } from "@/hooks/useApp";
import { usePersistentState } from "@/hooks/usePersistentState";
import { STORAGE_KEYS } from "@/utils/storage";
import { CartContext, SERVICE_RATE, TAX_RATE, type AddLineInput, type CartState } from "./contexts";

interface StoredCart {
  lines: CartLine[];
  discountPercent: number;
  note: string;
  applyTax: boolean;
  applyService: boolean;
  channel: SalesChannel;
  orderRef: string;
  customerId?: string;
}

const EMPTY_CART: StoredCart = {
  lines: [],
  discountPercent: 0,
  note: "",
  applyTax: false,
  applyService: false,
  channel: "Dine-in",
  orderRef: "",
};

/** Lines with the same product, variant, add-ons, note and price merge into one. */
const lineKey = (input: AddLineInput) =>
  [input.productId, input.variant ?? "", [...(input.addons ?? [])].sort().join("+"), input.note ?? "", input.unitPrice].join("|");

export function CartProvider({ children, persist }: { children: ReactNode; persist: boolean }) {
  const { products } = useData();
  const [cart, setCart] = usePersistentState<StoredCart>(STORAGE_KEYS.cart, EMPTY_CART, persist);

  const addLine = useCallback(
    (input: AddLineInput) =>
      setCart((prev) => {
        const key = lineKey(input);
        const qty = input.qty ?? 1;
        const existing = prev.lines.find((l) => l.key === key);
        const lines = existing
          ? prev.lines.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l))
          : [
              ...prev.lines,
              {
                key,
                productId: input.productId,
                name: input.name,
                qty,
                unitPrice: input.unitPrice,
                basePrice: input.basePrice,
                variant: input.variant,
                addons: input.addons ?? [],
                note: input.note,
                manualPrice: input.manualPrice,
              },
            ];
        return { ...prev, lines };
      }),
    [setCart],
  );

  const quickAdd = useCallback(
    (productId: string) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return;
      addLine({ productId, name: product.name, basePrice: product.price, unitPrice: product.price });
    },
    [products, addLine],
  );

  const setQty = useCallback(
    (key: string, qty: number) =>
      setCart((prev) => ({
        ...prev,
        lines: qty <= 0 ? prev.lines.filter((l) => l.key !== key) : prev.lines.map((l) => (l.key === key ? { ...l, qty } : l)),
      })),
    [setCart],
  );

  const updateLine = useCallback(
    (key: string, patch: Partial<CartLine>) =>
      setCart((prev) => ({ ...prev, lines: prev.lines.map((l) => (l.key === key ? { ...l, ...patch } : l)) })),
    [setCart],
  );

  const removeLine = useCallback(
    (key: string) => setCart((prev) => ({ ...prev, lines: prev.lines.filter((l) => l.key !== key) })),
    [setCart],
  );

  const clear = useCallback(() => setCart(EMPTY_CART), [setCart]);
  const loadLines = useCallback(
    (lines: CartLine[], meta?: { channel?: SalesChannel; orderRef?: string; customerId?: string }) =>
      setCart({ ...EMPTY_CART, lines, channel: meta?.channel ?? "Dine-in", orderRef: meta?.orderRef ?? "", customerId: meta?.customerId }),
    [setCart],
  );

  const patch = useCallback(
    <K extends keyof StoredCart>(field: K) =>
      (value: StoredCart[K]) =>
        setCart((prev) => ({ ...prev, [field]: value })),
    [setCart],
  );

  const setDiscountPercent = useMemo(() => patch("discountPercent"), [patch]);
  const setNote = useMemo(() => patch("note"), [patch]);
  const setApplyTax = useMemo(() => patch("applyTax"), [patch]);
  const setApplyService = useMemo(() => patch("applyService"), [patch]);
  const setChannel = useMemo(() => patch("channel"), [patch]);
  const setOrderRef = useMemo(() => patch("orderRef"), [patch]);
  const setCustomerId = useMemo(() => patch("customerId"), [patch]);

  const value = useMemo<CartState>(() => {
    const subtotal = cart.lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
    const discount = Math.round((subtotal * cart.discountPercent) / 100);
    const base = subtotal - discount;
    const service = cart.applyService ? Math.round(base * SERVICE_RATE) : 0;
    const tax = cart.applyTax ? Math.round((base + service) * TAX_RATE) : 0;
    return {
      ...cart,
      addLine,
      quickAdd,
      setQty,
      updateLine,
      removeLine,
      clear,
      loadLines,
      setDiscountPercent,
      setNote,
      setApplyTax,
      setApplyService,
      setChannel,
      setOrderRef,
      setCustomerId,
      count: cart.lines.reduce((sum, l) => sum + l.qty, 0),
      subtotal,
      discount,
      tax,
      service,
      total: base + service + tax,
    };
  }, [
    cart,
    addLine,
    quickAdd,
    setQty,
    updateLine,
    removeLine,
    clear,
    loadLines,
    setDiscountPercent,
    setNote,
    setApplyTax,
    setApplyService,
    setChannel,
    setOrderRef,
    setCustomerId,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
