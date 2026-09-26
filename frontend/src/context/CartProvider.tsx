import { useCallback, useMemo, type ReactNode } from "react";
import type { CartItem } from "@/types";
import { useData } from "@/hooks/useApp";
import { usePersistentState } from "@/hooks/usePersistentState";
import { STORAGE_KEYS } from "@/utils/storage";
import { CartContext, SERVICE_RATE, TAX_RATE, type CartState } from "./contexts";


interface StoredCart {
  items: CartItem[];
  discountPercent: number;
  note: string;
  applyTax: boolean;
  applyService: boolean;
}

const EMPTY_CART: StoredCart = { items: [], discountPercent: 0, note: "", applyTax: false, applyService: false };

export function CartProvider({ children, persist }: { children: ReactNode; persist: boolean }) {
  const { products } = useData();
  const [cart, setCart] = usePersistentState<StoredCart>(STORAGE_KEYS.cart, EMPTY_CART, persist);

  const add = useCallback(
    (productId: string) =>
      setCart((prev) => {
        const existing = prev.items.find((i) => i.productId === productId);
        const items = existing
          ? prev.items.map((i) => (i.productId === productId ? { ...i, qty: i.qty + 1 } : i))
          : [...prev.items, { productId, qty: 1 }];
        return { ...prev, items };
      }),
    [setCart],
  );

  const setQty = useCallback(
    (productId: string, qty: number) =>
      setCart((prev) => ({
        ...prev,
        items:
          qty <= 0
            ? prev.items.filter((i) => i.productId !== productId)
            : prev.items.map((i) => (i.productId === productId ? { ...i, qty } : i)),
      })),
    [setCart],
  );

  const remove = useCallback(
    (productId: string) => setCart((prev) => ({ ...prev, items: prev.items.filter((i) => i.productId !== productId) })),
    [setCart],
  );

  const clear = useCallback(() => setCart(EMPTY_CART), [setCart]);
  const setDiscountPercent = useCallback(
    (discountPercent: number) => setCart((prev) => ({ ...prev, discountPercent })),
    [setCart],
  );
  const setNote = useCallback((note: string) => setCart((prev) => ({ ...prev, note })), [setCart]);
  const setApplyTax = useCallback((applyTax: boolean) => setCart((prev) => ({ ...prev, applyTax })), [setCart]);
  const setApplyService = useCallback(
    (applyService: boolean) => setCart((prev) => ({ ...prev, applyService })),
    [setCart],
  );

  const value = useMemo<CartState>(() => {
    const priced = cart.items
      .map((item) => ({ item, product: products.find((p) => p.id === item.productId) }))
      .filter((entry) => entry.product);
    const subtotal = priced.reduce((sum, { item, product }) => sum + item.qty * product!.price, 0);
    const discount = Math.round((subtotal * cart.discountPercent) / 100);
    const base = subtotal - discount;
    const service = cart.applyService ? Math.round(base * SERVICE_RATE) : 0;
    const tax = cart.applyTax ? Math.round((base + service) * TAX_RATE) : 0;
    return {
      items: priced.map(({ item }) => item),
      discountPercent: cart.discountPercent,
      note: cart.note,
      applyTax: cart.applyTax,
      applyService: cart.applyService,
      add,
      setQty,
      remove,
      clear,
      setDiscountPercent,
      setNote,
      setApplyTax,
      setApplyService,
      count: priced.reduce((sum, { item }) => sum + item.qty, 0),
      subtotal,
      discount,
      tax,
      service,
      total: base + service + tax,
    };
  }, [cart, products, add, setQty, remove, clear, setDiscountPercent, setNote, setApplyTax, setApplyService]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
