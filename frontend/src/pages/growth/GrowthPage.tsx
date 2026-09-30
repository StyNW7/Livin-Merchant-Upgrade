import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, ChevronRight, Info, Landmark, LineChart, Sparkles, Target, Trophy } from "lucide-react";
import type { GrowthStage } from "@/types";
import { TabHeader } from "@/components/layout/TopAppBar";
import { CoachMark } from "@/components/layout/Banners";
import { IconButton, Button } from "@/components/common/Button";
import { BottomSheet } from "@/components/common/Overlay";
import { ProgressRing } from "@/components/common/ProgressBar";
import { SectionHeader } from "@/components/common/SectionHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ScoreGauge, GrowthStageStepper } from "@/components/growth/GrowthVisuals";
import { MissionCard } from "@/components/growth/MissionCard";
import { insightIcons } from "@/components/icons";
import { useData, useUI } from "@/hooks/useApp";
import { useGrowth, useInsights, useNextActions, useOutlook } from "@/hooks/useBusiness";
import { growthStages, SCORE_DISCLAIMER } from "@/data/growth";
import { formatCompactRupiah } from "@/utils/format";
import { cn } from "@/utils/cn";

const priorityTone = {
  High: "danger",
  Medium: "gold",
  Operational: "info",
} as const;

export default function GrowthPage() {
  const navigate = useNavigate();
  const growth = useGrowth();
  const actions = useNextActions();
  const insights = useInsights();
  const outlook = useOutlook();
  const { claimedMissions, claimMission } = useData();
  const { openAssistant, celebrate } = useUI();
  const [stage, setStage] = useState<GrowthStage | null>(null);
  const delta = growth.score - growth.previous;

  const featuredMissions = [...growth.missions]
    .sort((a, b) => {
      const rank = (m: typeof a) => (m.status === "Completed" && !claimedMissions.includes(m.id) ? 0 : m.status === "Completed" ? 2 : 1);
      return rank(a) - rank(b) || b.progress - a.progress;
    })
    .slice(0, 2);

  return (
    <div className="pb-6">
      <TabHeader
        title="Grow Your Business"
        subtitle="Turn your transaction history into actionable progress."
        right={
          <IconButton label="Business Assistant" onClick={openAssistant}>
            <Sparkles className="h-5 w-5 text-gold-600" />
          </IconButton>
        }
      />

      <div className="space-y-6 px-5 pt-1">
        <CoachMark id="growth" title="Your Growth Score" text="Your Growth Score summarizes your recent business activity. It updates as you sell, manage stock and complete missions." />

        {/* Hero score */}
        <section className="hero-navy relative overflow-hidden rounded-[28px] px-5 pb-5 pt-5 text-white shadow-float">
          <div className="flex items-center justify-between">
            <p className="text-[12.5px] font-semibold text-white/85">Business Growth Score</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11.5px] font-bold">
              <ArrowUpRight className={cn("h-3.5 w-3.5", delta < 0 && "rotate-90")} />
              {delta >= 0 ? "+" : ""}
              {delta} since last month
            </span>
          </div>
          <div className="mt-4">
            <ScoreGauge score={growth.score} size={230} />
          </div>
          <div className="mt-2 flex flex-col items-center text-center">
            <p className="mt-1 inline-flex rounded-full bg-gold px-3 py-1 text-[13px] font-extrabold text-navy-900 shadow-glow">{growth.status}</p>
            <p className="mt-2 max-w-[300px] text-[12.5px] leading-relaxed text-white/85">
              Your score reflects transaction consistency, revenue stability, growth momentum and business activity.
            </p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-2xl bg-white/20 px-3 py-2.5">
              <p className="text-[11px] text-white/80">Growth Stage</p>
              <p className="text-[16px] font-extrabold tracking-wide">{growth.stage.id}</p>
            </div>
            <div className="rounded-2xl bg-white/20 px-3 py-2.5">
              <p className="text-[11px] text-white/80">Next Stage</p>
              <p className="text-[16px] font-extrabold tracking-wide text-white">{growth.nextStage?.id ?? "Top stage"}</p>
            </div>
          </div>
          <Button block variant="accent" className="mt-4" onClick={() => navigate("/growth/score")} rightIcon={<ChevronRight className="h-4 w-4" />}>
            View score breakdown
          </Button>
        </section>

        {/* Stage journey */}
        <section className="card p-4">
          <SectionHeader
            title="Business Growth Stage"
            subtitle={growth.nextStage ? `${growth.pointsToNext} points to ${growth.nextStage.id}` : "Highest stage reached"}
          />
          <GrowthStageStepper current={growth.stage.id} onSelect={setStage} />
          <p className="mt-3 rounded-xl bg-surface px-3 py-2.5 text-[12.5px] text-ink-soft">
            <span className="font-bold text-ink">{growth.stage.id}: </span>
            {growth.stage.description} Tap a stage to learn more.
          </p>
        </section>

        {/* Next best actions */}
        <section>
          <SectionHeader title="Your Next Best Actions" subtitle="Recommended next steps from your data" />
          <div className="card divide-y divide-surface-line overflow-hidden">
            {actions.map((a, i) => (
              <Link key={a.id} to={a.to} className="flex gap-3 px-4 py-3.5 hover:bg-surface/70">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-[13px] font-extrabold text-white">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-bold text-ink">{a.title}</span>
                    <StatusBadge status={a.priority} tone={priorityTone[a.priority]} hideIcon />
                  </span>
                  <span className="mt-0.5 block text-[12.5px] leading-snug text-ink-muted">{a.why}</span>
                  <span className="mt-1.5 inline-flex items-center gap-0.5 text-[12.5px] font-semibold text-sky-600">
                    {a.cta} <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Missions */}
        <section>
          <SectionHeader
            title="Growth Missions"
            subtitle={`${growth.completedMissions} of ${growth.missions.length} completed`}
            actionLabel="See all"
            to="/growth/missions"
          />
          <div className="space-y-3">
            {featuredMissions.map((m) => (
              <MissionCard
                key={m.id}
                mission={m}
                claimed={claimedMissions.includes(m.id)}
                onClaim={() => {
                  celebrate({ missionTitle: m.title, points: m.impactPoints, from: growth.score, to: Math.min(100, growth.score + m.impactPoints) });
                  claimMission(m.id);
                }}
              />
            ))}
          </div>
        </section>

        {/* Insights */}
        <section>
          <SectionHeader title="Business Insights" actionLabel="See all" to="/growth/insights" />
          <div className="no-scrollbar -mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-1">
            {insights.slice(0, 5).map((ins) => {
              const Icon = insightIcons[ins.category];
              return (
                <Link key={ins.id} to={`/growth/insights#${ins.id}`} className="card w-[240px] shrink-0 snap-start p-4 transition hover:shadow-float">
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">{ins.category}</span>
                  </div>
                  <p className="mt-3 line-clamp-3 text-[13.5px] font-bold leading-snug text-ink">{ins.title}</p>
                  <p className="mt-2 line-clamp-2 text-[12px] text-ink-muted">{ins.recommendation}</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Financing readiness */}
        <section className="card p-4">
          <div className="flex items-center gap-4">
            <ProgressRing value={growth.readiness} size={84} stroke={9} tone="#FFB600" label={`Financing readiness ${growth.readiness}%`}>
              <span className="tabular text-[19px] font-extrabold text-ink">{growth.readiness}%</span>
            </ProgressRing>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-muted">
                <Landmark className="h-3.5 w-3.5" /> Financing Readiness
              </p>
              <p className="mt-0.5 text-[17px] font-extrabold text-ink">{growth.readinessStatus}</p>
              <p className="mt-1 text-[12.5px] leading-snug text-ink-soft">
                {growth.strengthen[0] ? `Next: ${growth.strengthen[0].label.toLowerCase()}.` : "Your profile is in strong shape."}
              </p>
            </div>
          </div>
          <ul className="mt-4 grid grid-cols-1 gap-1.5">
            {growth.readinessFactors.map((f) => (
              <li key={f.id} className="flex items-center justify-between text-[12.5px]">
                <span className="text-ink-soft">{f.label}</span>
                <StatusBadge status={f.level} />
              </li>
            ))}
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => navigate("/growth/readiness")} className="whitespace-nowrap px-3">
              View Readiness
            </Button>
            <Button onClick={() => navigate("/financing")} className="whitespace-nowrap px-3">
              Explore Financing
            </Button>
          </div>
        </section>

        {/* Outlook */}
        <Link to="/growth/outlook" className="card flex items-center gap-3 p-4 transition hover:shadow-float">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
            <LineChart className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[12px] font-semibold text-ink-muted">Business Outlook</span>
            <span className="tabular block text-[15px] font-extrabold text-ink">
              {formatCompactRupiah(outlook.rangeLow, 0)} – {formatCompactRupiah(outlook.rangeHigh, 0)}
            </span>
            <span className="block text-[12px] text-ink-muted">Projected next 30 days · {outlook.confidence} confidence</span>
          </span>
          <ChevronRight className="h-5 w-5 text-ink-faint" />
        </Link>

        <p className="flex gap-2 rounded-2xl bg-white px-4 py-3 text-[11.5px] leading-relaxed text-ink-muted ring-1 ring-surface-line">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          {SCORE_DISCLAIMER}
        </p>
      </div>

      <BottomSheet open={!!stage} onClose={() => setStage(null)} title={stage ? `${stage.id} stage` : ""} subtitle={stage?.range}>
        {stage && (
          <>
            <p className="text-[14px] leading-relaxed text-ink-soft">{stage.description}</p>
            <p className="mb-2 mt-4 text-[12px] font-bold uppercase tracking-wide text-ink-muted">What this stage unlocks</p>
            <ul className="space-y-2">
              {stage.unlocks.map((u) => (
                <li key={u} className="flex items-center gap-2 text-[13.5px] text-ink">
                  {growthStages.indexOf(stage) <= growthStages.indexOf(growth.stage) ? (
                    <Trophy className="h-4 w-4 text-gold-600" />
                  ) : (
                    <Target className="h-4 w-4 text-ink-faint" />
                  )}
                  {u}
                </li>
              ))}
            </ul>
            {stage.id === growth.nextStage?.id && (
              <Button block className="mt-5" onClick={() => { setStage(null); navigate("/growth/score#requirements"); }}>
                See requirements to reach {stage.id}
              </Button>
            )}
          </>
        )}
      </BottomSheet>
    </div>
  );
}
