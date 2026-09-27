import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle, ArrowDownLeft, ArrowRightLeft, ArrowUpRight, History, PackageCheck, PackageX, SlidersHorizontal, Truck } from "lucide-react";
import type { MovementType } from "@/types";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { ChipRow, FilterChip } from "@/components/common/FilterChip";
import { SearchInput, SelectField, TextField } from "@/components/common/Form";
import { BottomSheet } from "@/components/common/Overlay";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { ProgressBar } from "@/components/common/ProgressBar";
import { useData, useSession, useUI } from "@/hooks/useApp";
import { formatStock, useInventoryAlerts, type StockAlert } from "@/hooks/useBusiness";
import { outlets } from "@/data/outlets";
import { DEMO_TODAY } from "@/data/merchant";
import { formatRupiah, formatShortDate } from "@/utils/format";
import { cn } from "@/utils/cn";

type Tab = "products" | "ingredients" | "low" | "history";
const MOVEMENTS: { type: MovementType; icon: typeof ArrowDownLeft; hint: string }[] = [
  { type: "Stock In", icon: ArrowDownLeft, hint: "Received new stock" },
  { type: "Stock Out", icon: ArrowUpRight, hint: "Used or removed" },
  { type: "Adjustment", icon: SlidersHorizontal, hint: "Set counted stock" },
  { type: "Damaged", icon: PackageX, hint: "Spoiled or broken" },
  { type: "Transfer", icon: ArrowRightLeft, hint: "Move to another outlet" },
];

export default function InventoryPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { movements, recordMovement, ingredients, suppliers, createPurchaseOrder } = useData();
  const { outletId, isGuest } = useSession();
  const { toast } = useUI();
  const inv = useInventoryAlerts();
  const [tab, setTab] = useState<Tab>((params.get("tab") as Tab) || "products");
  const [query, setQuery] = useState("");
  const [item, setItem] = useState<StockAlert | null>(null);
  const [type, setType] = useState<MovementType>("Stock In");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  const [target, setTarget] = useState(outlets.find((o) => o.status === "Active" && o.id !== outletId)?.id ?? "");

  useEffect(() => {
    const t = params.get("tab") as Tab | null;
    if (t) setTab(t);
    const id = params.get("item");
    if (id) {
      const found = inv.all.find((i) => i.id === id);
      if (found) openMovement(found);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  function openMovement(row: StockAlert, preset: MovementType = "Stock In", presetQty = "") {
    setItem(row);
    setType(preset);
    setQty(presetQty);
    setNote("");
  }

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const source = tab === "products" ? inv.productRows : tab === "ingredients" ? inv.ingredientRows : inv.low;
    return source.filter((r) => !q || r.name.toLowerCase().includes(q));
  }, [tab, inv, query]);

  const restockIngredients = inv.low.filter((i) => i.kind === "ingredient");
  const bySupplier = useMemo(() => {
    const map = new Map<string, StockAlert[]>();
    restockIngredients.forEach((row) => {
      const supplierId = ingredients.find((i) => i.id === row.id)?.supplierId ?? "sup-rasa";
      map.set(supplierId, [...(map.get(supplierId) ?? []), row]);
    });
    return [...map.entries()];
  }, [restockIngredients, ingredients]);

  const submitMovement = () => {
    if (!item) return;
    const quantity = Number(qty);
    recordMovement({ itemId: item.id, itemKind: item.kind, type, quantity, note: note.trim(), targetOutletId: type === "Transfer" ? target : undefined });
    toast(`${item.name}: ${type} recorded${isGuest ? " (not saved in Explore Mode)" : ""}`);
    setItem(null);
  };

  const qtyNumber = Number(qty);
  const qtyValid = qty !== "" && qtyNumber >= 0 && (type === "Adjustment" || qtyNumber > 0) && (["Stock Out", "Damaged", "Transfer"].includes(type) ? qtyNumber <= (item?.stock ?? 0) : true);

  return (
    <>
      <TopAppBar title="Inventory" subtitle={`${inv.low.length} items need attention`}>
        <ChipRow>
          {(
            [
              ["products", "Products"],
              ["ingredients", "Ingredients"],
              ["low", "Low Stock Center"],
              ["history", "History"],
            ] as [Tab, string][]
          ).map(([v, l]) => (
            <FilterChip key={v} label={l} active={tab === v} onClick={() => setTab(v)} count={v === "low" ? inv.low.length : undefined} />
          ))}
        </ChipRow>
      </TopAppBar>

      <div className="space-y-4 px-5 pb-8 pt-4">
        {tab === "low" && (
          <section className="rounded-3xl bg-navy p-4 text-white">
            <p className="flex items-center gap-2 text-[13px] font-bold">
              <PackageCheck className="h-4 w-4 text-gold" /> Restock Recommendation
            </p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-white/75">
              Suggested quantities cover about one week of your recent usage. Stock availability is {Math.round(inv.availability)}%.
            </p>
            {bySupplier.map(([supplierId, rows]) => {
              const supplier = suppliers.find((s) => s.id === supplierId);
              const total = rows.reduce((s, r) => s + r.suggestedQty * (ingredients.find((i) => i.id === r.id)?.costPerUnit ?? 0), 0);
              return (
                <div key={supplierId} className="mt-3 rounded-2xl bg-white/10 p-3">
                  <p className="text-[12px] text-white/70">{supplier?.name}</p>
                  <ul className="mt-1 space-y-0.5 text-[13px]">
                    {rows.map((r) => (
                      <li key={r.id} className="flex justify-between">
                        <span>{r.name}</span>
                        <span className="font-bold">
                          {r.suggestedQty} {r.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    size="sm"
                    variant="accent"
                    className="mt-3 w-full"
                    leftIcon={<Truck className="h-4 w-4" />}
                    onClick={() => {
                      const po = createPurchaseOrder({
                        supplierId,
                        outletId,
                        lines: rows.map((r) => {
                          const ing = ingredients.find((i) => i.id === r.id)!;
                          return { ingredientId: r.id, name: r.name, qty: r.suggestedQty, unit: r.unit, unitPrice: ing.costPerUnit };
                        }),
                        total,
                        expectedAt: DEMO_TODAY,
                      });
                      toast(`${po.id} created for ${formatRupiah(total)}`);
                      navigate(`/suppliers/${supplierId}`);
                    }}
                  >
                    Create purchase order · {formatRupiah(total)}
                  </Button>
                </div>
              );
            })}
          </section>
        )}

        {tab !== "history" && <SearchInput value={query} onChange={setQuery} placeholder="Search item" />}

        {tab === "history" ? (
          movements.length ? (
            <div className="card divide-y divide-surface-line overflow-hidden">
              {movements.map((m) => (
                <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                  <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", m.quantity >= 0 ? "bg-success-soft text-success-dark" : "bg-danger-soft text-danger-dark")}>
                    {m.quantity >= 0 ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold text-ink">{m.itemName}</p>
                    <p className="truncate text-[12px] text-ink-muted">
                      {m.type} · {m.note || "No note"} · {m.by}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn("tabular text-[13.5px] font-bold", m.quantity >= 0 ? "text-success-dark" : "text-danger-dark")}>
                      {m.quantity > 0 ? "+" : ""}
                      {formatStock(m.quantity)} {m.unit}
                    </p>
                    <p className="text-[11.5px] text-ink-muted">
                      {m.date === DEMO_TODAY ? "Today" : formatShortDate(m.date)}, {m.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={History} title="No stock changes yet" message="Every stock in, out, adjustment and transfer will be listed here." />
          )
        ) : list.length ? (
          <div className="card divide-y divide-surface-line overflow-hidden">
            {list.map((row) => {
              const low = row.stock <= row.reorderLevel;
              return (
                <button key={row.id} type="button" onClick={() => openMovement(row, low ? "Stock In" : "Adjustment", low ? String(row.suggestedQty) : "")} className="block w-full px-4 py-3 text-left hover:bg-surface/70">
                  <div className="flex items-center justify-between gap-3">
                    <p className="min-w-0 truncate text-[14px] font-semibold text-ink">{row.name}</p>
                    <p className={cn("tabular shrink-0 text-[13.5px] font-bold", low ? "text-warning-dark" : "text-ink")}>
                      {low && <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />}
                      {formatStock(row.stock)} {row.unit}
                    </p>
                  </div>
                  <ProgressBar value={Math.min(row.stock, row.reorderLevel * 3)} max={row.reorderLevel * 3} tone={low ? "warning" : "success"} size="xs" className="mt-2" marker={row.reorderLevel} />
                  <p className="mt-1.5 text-[11.5px] text-ink-muted">
                    Reorder at {formatStock(row.reorderLevel)}
                    {row.dailyUsage > 0 && ` · uses ${formatStock(Math.round(row.dailyUsage * 10) / 10)}/day · ~${Math.max(0, Math.round(row.daysLeft))} days left`}
                    {tab === "low" && ` · suggest +${row.suggestedQty}`}
                  </p>
                </button>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={PackageCheck} title={tab === "low" ? "Everything is well stocked" : "No items found"} message={tab === "low" ? "No item is below its reorder level." : "Try another search."} />
        )}
      </div>

      <BottomSheet
        open={!!item}
        onClose={() => setItem(null)}
        title={item?.name ?? ""}
        subtitle={item ? `Current stock ${formatStock(item.stock)} ${item.unit} · reorder at ${formatStock(item.reorderLevel)}` : undefined}
        footer={
          <Button block size="lg" disabled={!qtyValid || (type === "Transfer" && !target)} onClick={submitMovement}>
            Save {type.toLowerCase()}
          </Button>
        }
      >
        {item && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {MOVEMENTS.filter((m) => m.type !== "Transfer" || item.kind === "product").map((m) => (
                <button
                  key={m.type}
                  type="button"
                  onClick={() => setType(m.type)}
                  aria-pressed={type === m.type}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-2xl border px-1 py-3 text-[12px] font-semibold",
                    type === m.type ? "border-navy bg-navy text-white" : "border-surface-line text-ink-soft",
                  )}
                >
                  <m.icon className={cn("h-5 w-5", type === m.type ? "text-gold" : "text-navy")} />
                  {m.type}
                </button>
              ))}
            </div>
            <p className="text-[12.5px] text-ink-muted">{MOVEMENTS.find((m) => m.type === type)?.hint}</p>
            <TextField
              label={type === "Adjustment" ? `Counted stock (${item.unit})` : `Quantity (${item.unit})`}
              inputMode="decimal"
              value={qty}
              onChange={(e) => setQty(e.target.value.replace(/[^\d.]/g, "").slice(0, 7))}
              error={qty && !qtyValid ? `Cannot exceed current stock of ${formatStock(item.stock)}` : undefined}
            />
            {type === "Transfer" && (
              <SelectField
                label="Transfer to"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                options={outlets.filter((o) => o.status === "Active" && o.id !== outletId).map((o) => ({ value: o.id, label: o.area }))}
              />
            )}
            <TextField label="Note" placeholder="Optional" value={note} onChange={(e) => setNote(e.target.value)} maxLength={60} />
          </div>
        )}
      </BottomSheet>
    </>
  );
}
