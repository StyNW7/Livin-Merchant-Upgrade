import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle, Boxes, PackagePlus, PackageSearch, Pencil, Plus, Trash2 } from "lucide-react";
import type { Product, ProductCategory } from "@/types";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { IconButton, Button } from "@/components/common/Button";
import { ChipRow, FilterChip, Segmented } from "@/components/common/FilterChip";
import { SearchInput, SelectField, TextField, Toggle } from "@/components/common/Form";
import { BottomSheet } from "@/components/common/Overlay";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { InfoRow } from "@/components/cards/ListRow";
import { ProductThumb } from "@/components/cashier/ProductTile";
import { useData, useUI } from "@/hooks/useApp";
import { PRODUCT_CATEGORIES, categories } from "@/data/products";
import { categoryRevenue, completedSales, rangeStart } from "@/data/analytics";
import { formatRupiah } from "@/utils/format";

type Filter = "All" | "Low stock" | ProductCategory;

interface FormState {
  id?: string;
  name: string;
  category: ProductCategory;
  price: string;
  costPrice: string;
  stock: string;
  reorder: string;
  active: boolean;
}

const EMPTY_FORM: FormState = { name: "", category: "Coffee", price: "", costPrice: "", stock: "", reorder: "10", active: true };

export default function ProductsPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { products, saveProduct, deleteProduct, transactions } = useData();
  const { toast, confirm } = useUI();
  const [view, setView] = useState<"products" | "categories">(params.get("view") === "categories" ? "categories" : "products");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [detailId, setDetailId] = useState<string | null>(params.get("id"));
  const [form, setForm] = useState<FormState | null>(null);

  useEffect(() => {
    if (params.get("view") === "categories") setView("categories");
  }, [params]);

  useEffect(() => {
    const id = params.get("id");
    if (id) setDetailId(id);
  }, [params]);

  const detail = products.find((p) => p.id === detailId) ?? null;
  const lowCount = products.filter((p) => p.stock <= p.lowStockThreshold).length;
  const lowest = [...products].filter((p) => p.stock <= p.lowStockThreshold).sort((a, b) => a.stock / a.lowStockThreshold - b.stock / b.lowStockThreshold)[0];

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (filter === "Low stock" && p.stock > p.lowStockThreshold) return false;
      if (filter !== "All" && filter !== "Low stock" && p.category !== filter) return false;
      return !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    });
  }, [products, filter, query]);

  const categoryShare = useMemo(() => categoryRevenue(completedSales(transactions, rangeStart(30))), [transactions]);

  const openForm = (p?: Product) =>
    setForm(
      p
        ? { id: p.id, name: p.name, category: p.category, price: String(p.price), costPrice: String(p.costPrice), stock: String(p.stock), reorder: String(p.lowStockThreshold), active: p.active }
        : EMPTY_FORM,
    );

  const submit = () => {
    if (!form) return;
    const existing = products.find((p) => p.id === form.id);
    const prefix = { Coffee: "CF", "Non-Coffee": "NC", Food: "FD", Snacks: "SN" }[form.category];
    const count = products.filter((p) => p.category === form.category).length + 1;
    const product: Product = {
      ...(existing ?? { popularity: 1, hasVariants: false, hasAddons: false }),
      id: existing?.id ?? `p-${Date.now()}`,
      sku: existing?.sku ?? `${prefix}-${String(count).padStart(3, "0")}`,
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      costPrice: Number(form.costPrice || 0),
      stock: Number(form.stock || 0),
      lowStockThreshold: Number(form.reorder || 0),
      active: form.active,
    };
    saveProduct(product);
    setForm(null);
    toast(`${product.name} ${existing ? "updated" : "added"}`);
  };

  const formValid = form && form.name.trim().length >= 2 && Number(form.price) >= 1000 && Number(form.costPrice || 0) < Number(form.price);
  const margin = (p: Pick<Product, "price" | "costPrice">) => (p.price ? ((p.price - p.costPrice) / p.price) * 100 : 0);

  return (
    <>
      <TopAppBar
        title="Products"
        subtitle={`${products.length} products · ${lowCount} low stock`}
        right={
          <IconButton label="Add product" onClick={() => openForm()}>
            <Plus className="h-5 w-5" />
          </IconButton>
        }
      >
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: "products", label: "Products" },
            { value: "categories", label: "Categories" },
          ]}
        />
      </TopAppBar>

      {view === "categories" ? (
        <div className="space-y-3 px-5 pb-8 pt-4">
          {categories.map((c) => {
            const share = categoryShare.find((x) => x.name === c.id);
            const count = products.filter((p) => p.category === c.id).length;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setFilter(c.id);
                  setView("products");
                }}
                className="card flex w-full items-center gap-3 p-4 text-left transition hover:shadow-float"
              >
                <div className="h-12 w-12">
                  <ProductThumb product={{ name: c.id, category: c.id }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold text-ink">{c.id}</p>
                  <p className="text-[12px] text-ink-muted">{c.description}</p>
                  <p className="mt-0.5 text-[12px] text-ink-soft">
                    {count} products · {share?.share.toFixed(0)}% of 30-day sales
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3 px-5 pb-8 pt-4">
          {lowest && (
            <button type="button" onClick={() => navigate("/inventory?tab=low")} className="flex w-full items-center gap-3 rounded-2xl border border-warning/30 bg-warning-soft px-4 py-3 text-left">
              <AlertTriangle className="h-5 w-5 shrink-0 text-warning-dark" />
              <span className="flex-1 text-[13px] font-semibold text-ink">
                {lowest.name} is running low.
                {lowCount > 1 && <span className="font-normal text-ink-soft"> {lowCount - 1} more item{lowCount > 2 ? "s" : ""} need restock.</span>}
              </span>
              <span className="text-[12px] font-bold text-warning-dark">Restock</span>
            </button>
          )}
          <SearchInput value={query} onChange={setQuery} placeholder="Search name or SKU" />
          <ChipRow>
            {(["All", "Low stock", ...PRODUCT_CATEGORIES] as Filter[]).map((f) => (
              <FilterChip key={f} label={f} active={filter === f} onClick={() => setFilter(f)} count={f === "Low stock" ? lowCount : undefined} />
            ))}
          </ChipRow>

          {visible.length ? (
            <div className="card divide-y divide-surface-line overflow-hidden">
              {visible.map((p) => {
                const low = p.stock <= p.lowStockThreshold;
                return (
                  <button key={p.id} type="button" onClick={() => setDetailId(p.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface/70">
                    <ProductThumb product={p} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-ink">{p.name}</p>
                      <p className="text-[12px] text-ink-muted">
                        {p.category} · {p.sku}
                        {!p.active && " · Hidden"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="tabular text-[13.5px] font-bold text-ink">{formatRupiah(p.price)}</p>
                      <p className={low ? "text-[11.5px] font-bold text-warning-dark" : "text-[11.5px] text-ink-muted"}>
                        {low && <AlertTriangle className="mr-0.5 inline h-3 w-3" />}Stock {p.stock}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={PackageSearch} title="No products found" message="Try a different search or add a new product." action={<Button onClick={() => openForm()}>Add Product</Button>} />
          )}
        </div>
      )}

      <BottomSheet
        open={!!detail}
        onClose={() => {
          setDetailId(null);
          if (params.get("id")) setParams({}, { replace: true });
        }}
        title="Product detail"
      >
        {detail && (
          <>
            <div className="flex items-center gap-4">
              <div className="h-24 w-24">
                <ProductThumb product={detail} />
              </div>
              <div className="min-w-0">
                <p className="text-[18px] font-extrabold text-ink">{detail.name}</p>
                <p className="text-[12.5px] text-ink-muted">
                  {detail.sku} · {detail.category}
                </p>
                <div className="mt-1.5 flex gap-1.5">
                  <StatusBadge status={detail.active ? "Active" : "Inactive"} />
                  {detail.stock <= detail.lowStockThreshold && <StatusBadge status={detail.stock === 0 ? "Out of stock" : "Low stock"} />}
                </div>
              </div>
            </div>
            <div className="card mt-4 px-4 py-2">
              <InfoRow label="Selling price" value={formatRupiah(detail.price)} strong />
              <InfoRow label="Cost price" value={formatRupiah(detail.costPrice)} />
              <InfoRow label="Margin" value={`${margin(detail).toFixed(0)}% · ${formatRupiah(detail.price - detail.costPrice)} per item`} />
              <InfoRow label="Current stock" value={`${detail.stock} pcs`} />
              <InfoRow label="Reorder level" value={`${detail.lowStockThreshold} pcs`} />
              <InfoRow label="Options" value={[detail.hasVariants && "Sizes", detail.hasAddons && "Add-ons"].filter(Boolean).join(", ") || "None"} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="secondary" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => { openForm(detail); setDetailId(null); }}>
                Edit Product
              </Button>
              <Button leftIcon={<Boxes className="h-4 w-4" />} onClick={() => navigate(`/inventory?item=${detail.id}`)}>
                Adjust Stock
              </Button>
            </div>
            <button
              type="button"
              onClick={() =>
                confirm({
                  title: `Delete ${detail.name}?`,
                  message: "It will be removed from the cashier. Past transactions stay unchanged.",
                  confirmLabel: "Delete",
                  tone: "danger",
                  onConfirm: () => {
                    deleteProduct(detail.id);
                    setDetailId(null);
                    toast(`${detail.name} deleted`, "warning");
                  },
                })
              }
              className="mt-3 flex w-full items-center justify-center gap-1.5 py-2 text-[13px] font-semibold text-danger"
            >
              <Trash2 className="h-4 w-4" /> Delete product
            </button>
          </>
        )}
      </BottomSheet>

      <BottomSheet
        open={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? "Edit Product" : "Add Product"}
        footer={
          <Button block size="lg" disabled={!formValid} onClick={submit} leftIcon={<PackagePlus className="h-4 w-4" />}>
            {form?.id ? "Save changes" : "Add product"}
          </Button>
        }
      >
        {form && (
          <div className="space-y-3">
            <TextField label="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Pandan Latte" maxLength={40} />
            <SelectField label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })} options={PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c }))} />
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Selling price" prefix="Rp" inputMode="numeric" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value.replace(/\D/g, "") })} error={form.price && Number(form.price) < 1000 ? "Min Rp 1.000" : undefined} />
              <TextField
                label="Cost price"
                prefix="Rp"
                inputMode="numeric"
                value={form.costPrice}
                onChange={(e) => setForm({ ...form, costPrice: e.target.value.replace(/\D/g, "") })}
                error={form.costPrice && Number(form.costPrice) >= Number(form.price || 0) ? "Must be below price" : undefined}
              />
            </div>
            {Number(form.price) > 0 && (
              <p className="rounded-xl bg-success-soft px-3 py-2 text-[12.5px] text-success-dark">
                Margin {margin({ price: Number(form.price), costPrice: Number(form.costPrice || 0) }).toFixed(0)}% per item
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Current stock" inputMode="numeric" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value.replace(/\D/g, "") })} />
              <TextField label="Reorder level" inputMode="numeric" value={form.reorder} onChange={(e) => setForm({ ...form, reorder: e.target.value.replace(/\D/g, "") })} />
            </div>
            <div className="rounded-2xl bg-surface px-3">
              <Toggle checked={form.active} onChange={(v) => setForm({ ...form, active: v })} label="Show in cashier" />
            </div>
          </div>
        )}
      </BottomSheet>
    </>
  );
}
