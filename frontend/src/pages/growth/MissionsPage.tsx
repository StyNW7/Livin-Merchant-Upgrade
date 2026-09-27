import { useState } from "react";
import { Target } from "lucide-react";
import type { MissionCategory } from "@/types";
import { TopAppBar, PageBody } from "@/components/layout/TopAppBar";
import { ChipRow, FilterChip } from "@/components/common/FilterChip";
import { EmptyState } from "@/components/common/EmptyState";
import { ProgressBar } from "@/components/common/ProgressBar";
import { MissionCard } from "@/components/growth/MissionCard";
import { useData, useUI } from "@/hooks/useApp";
import { useGrowth } from "@/hooks/useBusiness";

type Filter = "All" | "Active" | "Completed" | MissionCategory;
const FILTERS: Filter[] = ["All", "Active", "Completed", "Transaction", "Revenue", "Profile", "Customer", "Operations", "Learning"];

export default function MissionsPage() {
  const growth = useGrowth();
  const { claimedMissions, claimMission } = useData();
  const { toast } = useUI();
  const [filter, setFilter] = useState<Filter>("All");

  const visible = growth.missions.filter((m) =>
    filter === "All" ? true : filter === "Active" ? m.status !== "Completed" : filter === "Completed" ? m.status === "Completed" : m.category === filter,
  );

  return (
    <>
      <TopAppBar title="Growth Missions" subtitle="Practical goals built from your data" backTo="/growth">
        <ChipRow>
          {FILTERS.map((f) => (
            <FilterChip key={f} label={f} active={filter === f} onClick={() => setFilter(f)} />
          ))}
        </ChipRow>
      </TopAppBar>
      <PageBody>
        <section className="card flex items-center gap-4 p-4">
          <div className="min-w-0 flex-1">
            <p className="text-[12px] text-ink-muted">Missions completed</p>
            <p className="text-[22px] font-extrabold text-ink">
              {growth.completedMissions} <span className="text-[14px] text-ink-muted">of {growth.missions.length}</span>
            </p>
            <ProgressBar value={growth.completedMissions} max={growth.missions.length} tone="gold" className="mt-2" />
          </div>
          <div className="rounded-2xl bg-navy-50 px-3 py-2 text-center">
            <p className="text-[11px] text-ink-muted">Ready to claim</p>
            <p className="text-[20px] font-extrabold text-navy">{growth.claimable.length}</p>
          </div>
        </section>

        {visible.length ? (
          <div className="space-y-3">
            {visible.map((m, i) => (
              <MissionCard
                key={m.id}
                mission={m}
                defaultOpen={i === 0 && filter === "All"}
                claimed={claimedMissions.includes(m.id)}
                onClaim={() => {
                  claimMission(m.id);
                  toast(`Mission claimed. +${m.impactPoints} Growth Score`);
                }}
              />
            ))}
          </div>
        ) : (
          <EmptyState icon={Target} title="No missions here" message="Keep transacting to unlock personalized Growth Missions." />
        )}
      </PageBody>
    </>
  );
}
