import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Pause, Pencil, Play, Square } from "lucide-react";
import type { Promotion } from "@/types";
import { TopAppBar, PageBody } from "@/components/layout/TopAppBar";
import { Button } from "@/components/common/Button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { InfoRow } from "@/components/cards/ListRow";
import { MetricCard } from "@/components/cards/MetricCard";
import { PromotionForm } from "@/components/cards/PromotionForm";
import { ChartCard } from "@/components/charts/ChartKit";
import { SimpleBars } from "@/components/charts/Charts";
import { useData, useUI } from "@/hooks/useApp";
import { lunchComboWeekly } from "@/data/promotions";
import { formatCompactRupiah, formatRupiah } from "@/utils/format";

export default function PromotionDetailPage() {
  const { id } = useParams();
  const { promotions, savePromotion } = useData();
  const { toast, confirm } = useUI();
  const [edit, setEdit] = useState<Partial<Promotion> | null>(null);
  const p = promotions.find((x) => x.id === id);
  if (!p) return <Navigate to="/promotions" replace />;

  const avgOrder = p.transactions ? p.revenue / p.transactions : 0;
  const redemptionRate = p.transactions ? (p.redemptions / p.transactions) * 100 : 0;
  const setStatus = (status: Promotion["status"], message: string) => {
    savePromotion({ ...p, status });
    toast(message);
  };

  return (
    <>
      <TopAppBar title={p.name} subtitle={p.goal} backTo="/promotions" />
      <PageBody>
        <section className="card p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[18px] font-extrabold text-navy">{p.benefit}</p>
              <p className="text-[12.5px] text-ink-muted">
                {p.period} · {p.hours}
              </p>
            </div>
            <StatusBadge status={p.status} tone={p.status === "Active" ? "success" : p.status === "Scheduled" ? "info" : p.status === "Paused" ? "warning" : "neutral"} />
          </div>
          <div className="mt-3 border-t border-surface-line pt-2">
            <InfoRow label="Type" value={p.type} />
            <InfoRow label="Products" value={p.products} />
            <InfoRow label="Goal" value={p.goal} />
          </div>
        </section>

        <section className="grid grid-cols-3 gap-2">
          <MetricCard label="Revenue" value={formatCompactRupiah(p.revenue)} />
          <MetricCard label="Transactions" value={String(p.transactions)} />
          <MetricCard label="Redemptions" value={String(p.redemptions)} />
        </section>

        {p.id === "promo-lunch" ? (
          <ChartCard question="Is the campaign still working?" title="Weekly revenue from Lunch Combo" insight="Lunch Combo generated Rp 1.2M so far this week, on track to match last week.">
            <SimpleBars data={lunchComboWeekly.map((w, i, arr) => ({ ...w, highlight: i === arr.length - 1 }))} xKey="week" yKey="revenue" format={formatRupiah} highlightKey="highlight" height={160} />
          </ChartCard>
        ) : p.transactions > 0 ? (
          <section className="card p-4 text-[13px] leading-relaxed text-ink-soft">
            Average order with this promotion is <span className="font-bold text-ink">{formatRupiah(Math.round(avgOrder))}</span> and {redemptionRate.toFixed(0)}% of eligible transactions used it.
          </section>
        ) : (
          <section className="card p-4 text-[13px] text-ink-muted">Performance will appear once the campaign starts.</section>
        )}

        <div className="space-y-2">
          {p.status !== "Ended" && (
            <Button block variant="secondary" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => setEdit({ ...p })}>
              Edit promotion
            </Button>
          )}
          {p.status === "Active" && (
            <Button block variant="secondary" leftIcon={<Pause className="h-4 w-4" />} onClick={() => setStatus("Paused", `${p.name} paused`)}>
              Pause
            </Button>
          )}
          {(p.status === "Paused" || p.status === "Scheduled") && (
            <Button block leftIcon={<Play className="h-4 w-4" />} onClick={() => setStatus("Active", `${p.name} is now live`)}>
              {p.status === "Paused" ? "Resume" : "Start now"}
            </Button>
          )}
          {p.status !== "Ended" && (
            <Button
              block
              variant="ghost"
              className="text-danger"
              leftIcon={<Square className="h-4 w-4" />}
              onClick={() =>
                confirm({
                  title: `End ${p.name}?`,
                  message: "Customers will no longer get this benefit. Performance data is kept.",
                  confirmLabel: "End promotion",
                  tone: "danger",
                  onConfirm: () => setStatus("Ended", `${p.name} ended`),
                })
              }
            >
              End promotion
            </Button>
          )}
        </div>
      </PageBody>
      <PromotionForm draft={edit} onClose={() => setEdit(null)} />
    </>
  );
}
