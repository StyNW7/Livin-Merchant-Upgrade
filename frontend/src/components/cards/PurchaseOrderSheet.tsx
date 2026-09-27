import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import type { PurchaseOrderLine } from "@/types";
import { BottomSheet } from "@/components/common/Overlay";
import { Button } from "@/components/common/Button";
import { SelectField, TextField } from "@/components/common/Form";
import { useData, useSession, useUI } from "@/hooks/useApp";
import { shiftDate } from "@/data/analytics";
import { DEMO_TODAY } from "@/data/merchant";
import { formatRupiah } from "@/utils/format";

interface Props {
  open: boolean;
  onClose: () => void;
  supplierId?: string;
}

/** Purchase order: choose supplier, add lines from ingredients, submit as Pending. */
export function PurchaseOrderSheet({ open, onClose, supplierId }: Props) {
  const navigate = useNavigate();
  const { suppliers, ingredients, createPurchaseOrder } = useData();
  const { outletId } = useSession();
  const { toast } = useUI();
  const [supplier, setSupplier] = useState(supplierId ?? suppliers[0]?.id ?? "");
  const [lines, setLines] = useState<PurchaseOrderLine[]>([]);
  const [pick, setPick] = useState(ingredients[0]?.id ?? "");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setSupplier(supplierId ?? suppliers[0]?.id ?? "");
      setLines([]);
      setQty("");
      setNote("");
    }
  }, [open, supplierId, suppliers]);

  const total = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
  const ingredient = ingredients.find((i) => i.id === pick);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="New purchase order"
      subtitle="Sent to your supplier for confirmation"
      footer={
        <Button
          block
          size="lg"
          disabled={!lines.length || !supplier}
          onClick={() => {
            const po = createPurchaseOrder({ supplierId: supplier, outletId, lines, total, expectedAt: shiftDate(DEMO_TODAY, 2), note: note || undefined });
            toast(`${po.id} sent to supplier`);
            onClose();
            navigate(`/suppliers/${supplier}?po=${po.id}`);
          }}
        >
          Send order · {formatRupiah(total)}
        </Button>
      }
    >
      <div className="space-y-3">
        <SelectField label="Supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} options={suppliers.map((s) => ({ value: s.id, label: `${s.name} (${s.category})` }))} />
        <div className="rounded-2xl border border-surface-line p-3">
          <p className="mb-2 text-[13px] font-bold text-ink">Add item</p>
          <SelectField label="Item" value={pick} onChange={(e) => setPick(e.target.value)} options={ingredients.map((i) => ({ value: i.id, label: `${i.name} (${formatRupiah(i.costPerUnit)}/${i.unit})` }))} />
          <div className="mt-3 grid grid-cols-[1fr_auto] items-end gap-2">
            <TextField label={`Quantity (${ingredient?.unit ?? ""})`} inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value.replace(/[^\d.]/g, "").slice(0, 6))} />
            <Button
              variant="soft"
              size="lg"
              disabled={!ingredient || !(Number(qty) > 0)}
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => {
                if (!ingredient) return;
                setLines((prev) => [
                  ...prev.filter((l) => l.ingredientId !== ingredient.id),
                  { ingredientId: ingredient.id, name: ingredient.name, qty: Number(qty), unit: ingredient.unit, unitPrice: ingredient.costPerUnit },
                ]);
                setQty("");
              }}
            >
              Add
            </Button>
          </div>
        </div>
        {lines.length > 0 && (
          <div className="card divide-y divide-surface-line">
            {lines.map((l) => (
              <div key={l.name} className="flex items-center gap-3 px-4 py-3 text-[13.5px]">
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-ink">{l.name}</span>
                  <span className="text-[12px] text-ink-muted">
                    {l.qty} {l.unit} × {formatRupiah(l.unitPrice)}
                  </span>
                </span>
                <span className="tabular font-bold">{formatRupiah(l.qty * l.unitPrice)}</span>
                <button type="button" aria-label={`Remove ${l.name}`} onClick={() => setLines((prev) => prev.filter((x) => x !== l))} className="p-1 text-ink-faint hover:text-danger">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <TextField label="Note for supplier" placeholder="e.g. deliver before 08:00" value={note} onChange={(e) => setNote(e.target.value)} maxLength={60} />
      </div>
    </BottomSheet>
  );
}
