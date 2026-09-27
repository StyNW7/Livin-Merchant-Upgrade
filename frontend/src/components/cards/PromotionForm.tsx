import { useEffect, useState } from "react";
import type { Promotion } from "@/types";
import { BottomSheet } from "@/components/common/Overlay";
import { Button } from "@/components/common/Button";
import { SelectField, TextField, Toggle } from "@/components/common/Form";
import { useData, useUI } from "@/hooks/useApp";

const GOALS = ["Increase Lunch Sales", "Increase Repeat Visits", "Boost Slow Days", "Promote New Product"];

/** Create or edit a promotion. A draft with an id edits, without an id creates. */
export function PromotionForm({ draft, onClose }: { draft: Partial<Promotion> | null; onClose: () => void }) {
  const { savePromotion } = useData();
  const { toast } = useUI();
  const [form, setForm] = useState<Partial<Promotion>>({});
  const [startNow, setStartNow] = useState(true);

  useEffect(() => {
    if (draft) {
      setForm({ type: "Percentage", goal: GOALS[0], hours: "All day", ...draft });
      setStartNow(draft.status ? draft.status === "Active" : true);
    }
  }, [draft]);

  const valid = (form.name?.trim().length ?? 0) >= 3 && (form.benefit?.trim().length ?? 0) >= 2 && (form.period?.trim().length ?? 0) >= 3;

  return (
    <BottomSheet
      open={!!draft}
      onClose={onClose}
      title={form.id ? "Edit promotion" : "Create promotion"}
      subtitle="Set the offer, schedule and products"
      footer={
        <Button
          block
          size="lg"
          disabled={!valid}
          onClick={() => {
            const promo: Promotion = {
              id: form.id ?? `promo-${Date.now()}`,
              name: form.name!.trim(),
              period: form.period!.trim(),
              hours: form.hours?.trim() || "All day",
              benefit: form.benefit!.trim(),
              status: form.status === "Ended" ? "Ended" : startNow ? "Active" : "Scheduled",
              revenue: form.revenue ?? 0,
              transactions: form.transactions ?? 0,
              redemptions: form.redemptions ?? 0,
              type: form.type ?? "Percentage",
              products: form.products?.trim() || "All menu",
              goal: form.goal ?? GOALS[0],
              endsOn: form.endsOn,
            };
            savePromotion(promo);
            toast(`${promo.name} ${form.id ? "updated" : startNow ? "is now live" : "scheduled"}`);
            onClose();
          }}
        >
          {form.id ? "Save changes" : startNow ? "Launch promotion" : "Schedule promotion"}
        </Button>
      }
    >
      <div className="space-y-3">
        <SelectField label="Goal" value={form.goal ?? GOALS[0]} onChange={(e) => setForm({ ...form, goal: e.target.value })} options={GOALS.map((g) => ({ value: g, label: g }))} />
        <TextField label="Promotion name" value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={30} />
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Type"
            value={form.type ?? "Percentage"}
            onChange={(e) => setForm({ ...form, type: e.target.value as Promotion["type"] })}
            options={[
              { value: "Percentage", label: "Percent off" },
              { value: "Bundle", label: "Bundle" },
              { value: "Fixed", label: "Fixed amount" },
            ]}
          />
          <TextField label="Benefit" placeholder="e.g. 10% off" value={form.benefit ?? ""} onChange={(e) => setForm({ ...form, benefit: e.target.value })} maxLength={30} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Period" placeholder="e.g. 1 Oct – 14 Oct" value={form.period ?? ""} onChange={(e) => setForm({ ...form, period: e.target.value })} maxLength={30} />
          <TextField label="Hours" placeholder="All day" value={form.hours ?? ""} onChange={(e) => setForm({ ...form, hours: e.target.value })} maxLength={20} />
        </div>
        <TextField label="Products" placeholder="All menu" value={form.products ?? ""} onChange={(e) => setForm({ ...form, products: e.target.value })} maxLength={60} />
        {!form.id && (
          <div className="rounded-2xl bg-surface px-3">
            <Toggle checked={startNow} onChange={setStartNow} label="Start immediately" description="Turn off to schedule it" />
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
