import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronRight, Megaphone, Plus } from "lucide-react";
import type { Promotion, PromotionStatus } from "@/types";
import { TopAppBar, PageBody } from "@/components/layout/TopAppBar";
import { IconButton } from "@/components/common/Button";
import { ChipRow, FilterChip } from "@/components/common/FilterChip";
import { EmptyState } from "@/components/common/EmptyState";
import { SectionHeader } from "@/components/common/SectionHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PromotionForm } from "@/components/cards/PromotionForm";
import { useData } from "@/hooks/useApp";
import { promotionTemplates } from "@/data/promotions";
import { formatCompactRupiah } from "@/utils/format";

export default function PromotionsPage() {
  const [params, setParams] = useSearchParams();
  const { promotions } = useData();
  const [filter, setFilter] = useState<"All" | PromotionStatus>("All");
  const [draft, setDraft] = useState<Partial<Promotion> | null>(null);

  useEffect(() => {
    const id = params.get("template");
    const tpl = promotionTemplates.find((t) => t.id === id);
    if (tpl) setDraft({ ...tpl.suggestion });
  }, [params]);

  const visible = promotions.filter((p) => filter === "All" || p.status === filter);
  const active = promotions.filter((p) => p.status === "Active");
  const revenue = active.reduce((s, p) => s + p.revenue, 0);

  return (
    <>
      <TopAppBar
        title="Grow Your Sales"
        subtitle="Promotion Center"
        right={
          <IconButton label="Create promotion" onClick={() => setDraft({})}>
            <Plus className="h-5 w-5" />
          </IconButton>
        }
      />
      <PageBody>
        <section className="hero-navy rounded-[28px] p-5 text-white">
          <p className="text-[12px] text-white/70">Active campaigns</p>
          <p className="text-[28px] font-extrabold">{active.length}</p>
          <p className="text-[12.5px] text-white/75">Generated {formatCompactRupiah(revenue)} in revenue so far</p>
        </section>

        <section>
          <SectionHeader title="Start from a goal" subtitle="Templates based on your data" />
          <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
            {promotionTemplates.map((t) => (
              <button key={t.id} type="button" onClick={() => setDraft({ ...t.suggestion })} className="card w-[200px] shrink-0 p-4 text-left transition hover:shadow-float">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-50 text-gold-700">
                  <t.icon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-[14px] font-bold text-ink">{t.title}</p>
                <p className="mt-1 text-[12px] leading-snug text-ink-muted">{t.description}</p>
              </button>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title="Campaign Performance" />
          <ChipRow className="mb-3">
            {(["All", "Active", "Scheduled", "Paused", "Ended"] as const).map((f) => (
              <FilterChip key={f} label={f} active={filter === f} onClick={() => setFilter(f)} />
            ))}
          </ChipRow>
          {visible.length ? (
            <div className="space-y-3">
              {visible.map((p) => (
                <Link key={p.id} to={`/promotions/${p.id}`} className="card block p-4 transition hover:shadow-float">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[15px] font-bold text-ink">{p.name}</p>
                      <p className="text-[12px] text-ink-muted">
                        {p.period} · {p.hours}
                      </p>
                      <p className="mt-1 text-[13px] font-semibold text-navy">{p.benefit}</p>
                    </div>
                    <StatusBadge status={p.status} tone={p.status === "Active" ? "success" : p.status === "Scheduled" ? "info" : p.status === "Paused" ? "warning" : "neutral"} />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-surface p-2.5 text-center">
                    <Stat label="Revenue" value={formatCompactRupiah(p.revenue)} />
                    <Stat label="Transactions" value={String(p.transactions)} />
                    <Stat label="Redemptions" value={String(p.redemptions)} />
                  </div>
                  <p className="mt-2 flex items-center justify-end text-[12px] font-semibold text-sky-600">
                    Details <ChevronRight className="h-3.5 w-3.5" />
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={Megaphone} title="No campaigns here" message="Create a promotion from a template to grow your sales." />
          )}
        </section>
      </PageBody>

      <PromotionForm
        draft={draft}
        onClose={() => {
          setDraft(null);
          if (params.get("template")) setParams({}, { replace: true });
        }}
      />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10.5px] text-ink-muted">{label}</p>
      <p className="tabular text-[13.5px] font-extrabold text-ink">{value}</p>
    </div>
  );
}
