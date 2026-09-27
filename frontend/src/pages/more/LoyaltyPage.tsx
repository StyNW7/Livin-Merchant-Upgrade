import { useState } from "react";
import { Gift, Info, Plus, Repeat, Target, Ticket, type LucideIcon } from "lucide-react";
import type { LoyaltyProgram } from "@/types";
import { TopAppBar, PageBody } from "@/components/layout/TopAppBar";
import { IconButton, Button } from "@/components/common/Button";
import { BottomSheet } from "@/components/common/Overlay";
import { TextField, Toggle } from "@/components/common/Form";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useData, useUI } from "@/hooks/useApp";
import { cn } from "@/utils/cn";

const TYPES: { type: LoyaltyProgram["type"]; icon: LucideIcon; hint: string; rule: string; reward: string }[] = [
  { type: "Repeat Visit", icon: Repeat, hint: "Reward customers after a number of visits", rule: "Buy 5 drinks", reward: "Get Rp 20.000 voucher" },
  { type: "Transaction Milestone", icon: Target, hint: "Reward total spending in a period", rule: "Spend Rp 500.000 in a month", reward: "Free pastry of choice" },
  { type: "Voucher", icon: Ticket, hint: "A one-time voucher to bring customers back", rule: "Second visit within 14 days", reward: "Rp 10.000 off" },
];

export default function LoyaltyPage() {
  const { loyaltyPrograms, saveLoyaltyProgram } = useData();
  const { toast } = useUI();
  const [form, setForm] = useState<{ type: LoyaltyProgram["type"]; name: string; rule: string; reward: string } | null>(null);
  const members = loyaltyPrograms.filter((p) => p.status === "Active").reduce((s, p) => s + p.members, 0);
  const redemptions = loyaltyPrograms.reduce((s, p) => s + p.redemptions, 0);

  return (
    <>
      <TopAppBar
        title="Customer Loyalty"
        subtitle="Rewards you give your customers"
        right={
          <IconButton label="Create reward" onClick={() => setForm({ type: TYPES[0].type, name: "", rule: TYPES[0].rule, reward: TYPES[0].reward })}>
            <Plus className="h-5 w-5" />
          </IconButton>
        }
      />
      <PageBody>
        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-navy p-4 text-white">
            <p className="text-[11.5px] text-white/65">Active members</p>
            <p className="text-[22px] font-extrabold">{members}</p>
          </div>
          <div className="card p-4">
            <p className="text-[11.5px] text-ink-muted">Total redemptions</p>
            <p className="text-[22px] font-extrabold text-ink">{redemptions}</p>
          </div>
        </section>

        <div className="space-y-3">
          {loyaltyPrograms.map((p) => {
            const meta = TYPES.find((t) => t.type === p.type)!;
            return (
              <article key={p.id} className="card p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-50 text-gold-700">
                    <meta.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[15px] font-bold text-ink">{p.name}</p>
                      <StatusBadge status={p.status} tone={p.status === "Active" ? "success" : "warning"} />
                    </div>
                    <p className="text-[12px] text-ink-muted">{p.type}</p>
                    <p className="mt-2 text-[13.5px] font-semibold text-ink">
                      {p.rule} <span className="text-ink-faint">→</span> {p.reward}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-xl bg-surface px-3 py-2 text-[12.5px]">
                  <span className="text-ink-soft">
                    <span className="font-bold text-ink">{p.members}</span> members · <span className="font-bold text-ink">{p.redemptions}</span> redemptions
                  </span>
                </div>
                <div className="mt-2 rounded-2xl px-1">
                  <Toggle
                    checked={p.status === "Active"}
                    label={p.status === "Active" ? "Program is running" : "Program is paused"}
                    onChange={(v) => {
                      saveLoyaltyProgram({ ...p, status: v ? "Active" : "Paused" });
                      toast(`${p.name} ${v ? "resumed" : "paused"}`);
                    }}
                  />
                </div>
              </article>
            );
          })}
        </div>

        <p className="flex gap-2 rounded-2xl bg-white px-4 py-3 text-[12px] leading-relaxed text-ink-muted ring-1 ring-surface-line">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          These are your own rewards for your customers. Livin&apos;poin benefits from Mandiri for your business are in the Livin&apos; Ecosystem.
        </p>
      </PageBody>

      <BottomSheet
        open={!!form}
        onClose={() => setForm(null)}
        title="Create customer reward"
        footer={
          <Button
            block
            size="lg"
            leftIcon={<Gift className="h-4 w-4" />}
            disabled={!form || form.name.trim().length < 3 || form.rule.trim().length < 3 || form.reward.trim().length < 3}
            onClick={() => {
              if (!form) return;
              saveLoyaltyProgram({
                id: `loy-${Date.now()}`,
                name: form.name.trim(),
                type: form.type,
                rule: form.rule.trim(),
                reward: form.reward.trim(),
                members: 0,
                redemptions: 0,
                status: "Active",
              });
              toast(`${form.name.trim()} is live for your customers`);
              setForm(null);
            }}
          >
            Launch reward
          </Button>
        }
      >
        {form && (
          <div className="space-y-4">
            <div className="space-y-2">
              {TYPES.map((t) => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => setForm({ ...form, type: t.type, rule: t.rule, reward: t.reward })}
                  className={cn("flex w-full items-center gap-3 rounded-2xl border p-3 text-left", form.type === t.type ? "border-navy bg-navy-50" : "border-surface-line")}
                >
                  <t.icon className="h-5 w-5 text-navy" />
                  <span>
                    <span className="block text-[14px] font-bold text-ink">{t.type}</span>
                    <span className="block text-[12px] text-ink-muted">{t.hint}</span>
                  </span>
                </button>
              ))}
            </div>
            <TextField label="Program name" placeholder="e.g. Coffee Lovers" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={30} />
            <TextField label="Rule" value={form.rule} onChange={(e) => setForm({ ...form, rule: e.target.value })} maxLength={40} />
            <TextField label="Reward" value={form.reward} onChange={(e) => setForm({ ...form, reward: e.target.value })} maxLength={40} />
          </div>
        )}
      </BottomSheet>
    </>
  );
}
