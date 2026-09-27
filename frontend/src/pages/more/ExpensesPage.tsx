import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Bike,
  Building,
  Camera,
  Carrot,
  Megaphone,
  MoreHorizontal,
  Paperclip,
  Plus,
  Trash2,
  Users,
  Wallet,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { Expense, ExpenseCategory } from "@/types";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { IconButton, Button } from "@/components/common/Button";
import { ChipRow, FilterChip } from "@/components/common/FilterChip";
import { SelectField, TextField } from "@/components/common/Form";
import { BottomSheet } from "@/components/common/Overlay";
import { EmptyState } from "@/components/common/EmptyState";
import { ChartCard } from "@/components/charts/ChartKit";
import { RankBars } from "@/components/charts/Charts";
import { InfoRow } from "@/components/cards/ListRow";
import { useData, useSession, useUI } from "@/hooks/useApp";
import { EXPENSE_CATEGORIES } from "@/data/operations";
import { DEMO_TODAY } from "@/data/merchant";
import { rangeStart } from "@/data/analytics";
import { formatCompactRupiah, formatDate, formatRupiah, formatShortDate } from "@/utils/format";
import { cn } from "@/utils/cn";

export const expenseIcons: Record<ExpenseCategory, LucideIcon> = {
  Rent: Building,
  Ingredients: Carrot,
  Salary: Users,
  Utilities: Zap,
  Marketing: Megaphone,
  Delivery: Bike,
  Equipment: Wrench,
  Others: MoreHorizontal,
};

const METHODS: Expense["method"][] = ["Cash", "Transfer", "Debit", "Livin' by Mandiri"];

export default function ExpensesPage() {
  const [params, setParams] = useSearchParams();
  const { expenses, addExpense, deleteExpense } = useData();
  const { outletId, outletName, isGuest } = useSession();
  const { toast, confirm } = useUI();
  const [filter, setFilter] = useState<"All" | ExpenseCategory>("All");
  const [formOpen, setFormOpen] = useState(params.get("new") === "1");
  const [detail, setDetail] = useState<Expense | null>(null);
  const [form, setForm] = useState({ category: "Ingredients" as ExpenseCategory, title: "", amount: "", method: "Cash" as Expense["method"], date: DEMO_TODAY, note: "", attachment: "" });

  useEffect(() => {
    if (params.get("new") === "1") setFormOpen(true);
  }, [params]);

  const monthStart = rangeStart(30);
  const outletExpenses = useMemo(() => expenses.filter((e) => e.outletId === outletId && e.date >= monthStart).sort((a, b) => (a.date < b.date ? 1 : -1)), [expenses, outletId, monthStart]);
  const visible = outletExpenses.filter((e) => filter === "All" || e.category === filter);
  const total = outletExpenses.reduce((s, e) => s + e.amount, 0);
  const today = outletExpenses.filter((e) => e.date === DEMO_TODAY).reduce((s, e) => s + e.amount, 0);
  const byCategory = EXPENSE_CATEGORIES.map((c) => ({ name: c, value: outletExpenses.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0) }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);

  const close = () => {
    setFormOpen(false);
    if (params.get("new")) setParams({}, { replace: true });
  };

  const valid = form.title.trim().length >= 2 && Number(form.amount) >= 1000 && form.date >= monthStart && form.date <= DEMO_TODAY;

  return (
    <>
      <TopAppBar
        title="Expenses"
        subtitle={outletName}
        right={
          <IconButton label="Add expense" onClick={() => setFormOpen(true)}>
            <Plus className="h-5 w-5" />
          </IconButton>
        }
      >
        <ChipRow>
          {(["All", ...EXPENSE_CATEGORIES] as const).map((c) => (
            <FilterChip key={c} label={c} active={filter === c} onClick={() => setFilter(c)} />
          ))}
        </ChipRow>
      </TopAppBar>

      <div className="space-y-4 px-5 pb-8 pt-4">
        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-navy p-4 text-white">
            <p className="text-[11.5px] text-white/65">Last 30 days</p>
            <p className="tabular text-[20px] font-extrabold">{formatCompactRupiah(total)}</p>
          </div>
          <div className="card p-4">
            <p className="text-[11.5px] text-ink-muted">Today</p>
            <p className="tabular text-[20px] font-extrabold text-ink">{formatCompactRupiah(today)}</p>
          </div>
        </section>

        {byCategory.length > 0 && filter === "All" && (
          <ChartCard
            question="Where does my money go?"
            title="Expenses by category"
            insight={`${byCategory[0].name} is your largest cost at ${((byCategory[0].value / total) * 100).toFixed(0)}% of expenses.`}
          >
            <RankBars data={byCategory} labelKey="name" valueKey="value" format={formatRupiah} />
          </ChartCard>
        )}

        {visible.length ? (
          <div className="card divide-y divide-surface-line overflow-hidden">
            {visible.map((e) => {
              const Icon = expenseIcons[e.category];
              return (
                <button key={e.id} type="button" onClick={() => setDetail(e)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface/70">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold text-ink">{e.title}</span>
                    <span className="block truncate text-[12px] text-ink-muted">
                      {e.category} · {e.method} · {e.date === DEMO_TODAY ? "Today" : formatShortDate(e.date)}
                    </span>
                  </span>
                  <span className="tabular text-[14px] font-bold text-ink">-{formatRupiah(e.amount)}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={Wallet} title="No expenses recorded" message="Record rent, ingredients and bills to see your real profit." action={<Button onClick={() => setFormOpen(true)}>Add Expense</Button>} />
        )}
      </div>

      <BottomSheet
        open={formOpen}
        onClose={close}
        title="Add Expense"
        subtitle="Recorded expenses feed your cashflow and profit"
        footer={
          <Button
            block
            size="lg"
            disabled={!valid}
            onClick={() => {
              addExpense({
                outletId,
                category: form.category,
                title: form.title.trim(),
                amount: Number(form.amount),
                method: form.method,
                date: form.date,
                note: form.note.trim() || undefined,
                attachment: form.attachment || undefined,
              });
              toast(`Expense of ${formatRupiah(Number(form.amount))} recorded${isGuest ? " (Explore Mode)" : ""}`);
              setForm({ category: "Ingredients", title: "", amount: "", method: "Cash", date: DEMO_TODAY, note: "", attachment: "" });
              close();
            }}
          >
            Save expense
          </Button>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[13px] font-bold text-ink">Category</p>
            <div className="grid grid-cols-4 gap-2">
              {EXPENSE_CATEGORIES.map((c) => {
                const Icon = expenseIcons[c];
                const active = form.category === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, category: c })}
                    aria-pressed={active}
                    className={cn("flex flex-col items-center gap-1 rounded-2xl border py-2.5 text-[11px] font-semibold", active ? "border-navy bg-navy text-white" : "border-surface-line text-ink-soft")}
                  >
                    <Icon className={cn("h-[18px] w-[18px]", active ? "text-gold" : "text-navy")} />
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
          <TextField label="Description" placeholder="e.g. Electricity (PLN)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={50} />
          <TextField label="Amount" prefix="Rp" inputMode="numeric" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value.replace(/\D/g, "").slice(0, 10) })} />
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Payment method" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value as Expense["method"] })} options={METHODS.map((m) => ({ value: m, label: m }))} />
            <TextField label="Date" type="date" min={monthStart} max={DEMO_TODAY} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value || DEMO_TODAY })} />
          </div>
          <TextField label="Note" placeholder="Optional" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} maxLength={80} />
          <button
            type="button"
            onClick={() => setForm({ ...form, attachment: form.attachment ? "" : `receipt-${Date.now().toString().slice(-5)}.jpg` })}
            className={cn("flex w-full items-center gap-3 rounded-2xl border border-dashed px-4 py-3 text-left", form.attachment ? "border-success bg-success-soft" : "border-navy-200")}
          >
            {form.attachment ? <Paperclip className="h-5 w-5 text-success-dark" /> : <Camera className="h-5 w-5 text-navy" />}
            <span className="text-[13px] font-semibold text-ink">{form.attachment ? `Attached ${form.attachment} (tap to remove)` : "Attach receipt photo"}</span>
          </button>
        </div>
      </BottomSheet>

      <BottomSheet open={!!detail} onClose={() => setDetail(null)} title={detail?.title ?? ""} subtitle={detail?.id}>
        {detail && (
          <>
            <div className="card px-4 py-2">
              <InfoRow label="Amount" value={formatRupiah(detail.amount)} strong />
              <InfoRow label="Category" value={detail.category} />
              <InfoRow label="Payment method" value={detail.method} />
              <InfoRow label="Date" value={formatDate(detail.date)} />
              {detail.note && <InfoRow label="Note" value={detail.note} />}
              <InfoRow label="Attachment" value={detail.attachment ?? "None"} />
            </div>
            <Button
              block
              variant="secondary"
              className="mt-4 text-danger"
              leftIcon={<Trash2 className="h-4 w-4" />}
              onClick={() =>
                confirm({
                  title: "Delete this expense?",
                  message: "Your cashflow and profit summary will be updated.",
                  confirmLabel: "Delete",
                  tone: "danger",
                  onConfirm: () => {
                    deleteExpense(detail.id);
                    setDetail(null);
                    toast("Expense deleted", "warning");
                  },
                })
              }
            >
              Delete expense
            </Button>
          </>
        )}
      </BottomSheet>
    </>
  );
}
