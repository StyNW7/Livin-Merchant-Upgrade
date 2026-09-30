import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowDown, ArrowUp, CheckCircle2, ChevronDown, Circle, Info } from "lucide-react";
import { TopAppBar, PageBody } from "@/components/layout/TopAppBar";
import { ProgressBar } from "@/components/common/ProgressBar";
import { SectionHeader } from "@/components/common/SectionHeader";
import { ChartCard } from "@/components/charts/ChartKit";
import { TrendLine } from "@/components/charts/Charts";
import { ScoreGauge, GrowthStageStepper } from "@/components/growth/GrowthVisuals";
import { useGrowth } from "@/hooks/useBusiness";
import { SCORE_DISCLAIMER } from "@/data/growth";
import { CHART_NAVY } from "@/data/analytics";
import { cn } from "@/utils/cn";

export default function ScorePage() {
  const growth = useGrowth();
  const location = useLocation();
  const [open, setOpen] = useState<string | null>(null);
  const met = growth.requirements.filter((r) => r.met).length;

  useEffect(() => {
    if (location.hash === "#requirements") {
      window.setTimeout(() => document.getElementById("requirements")?.scrollIntoView({ behavior: "smooth" }), 300);
    }
  }, [location.hash]);

  return (
    <>
      <TopAppBar title="Growth Score" subtitle="How your business is progressing" backTo="/growth" />
      <PageBody>
        <section className="card px-4 pb-4 pt-5">
          <ScoreGauge score={growth.score} tone="light" size={220} />
          <p className="mt-2 text-center text-[14px] font-bold text-navy-600">{growth.status}</p>
          <div className="mt-4">
            <GrowthStageStepper current={growth.stage.id} />
          </div>
        </section>

        <ChartCard
          question="How has my score changed?"
          title="Growth trend"
          insight={`Your score moved from ${growth.history[0].score} in ${growth.history[0].month} to ${growth.score} this month.`}
        >
          <TrendLine
            data={growth.history}
            xKey="month"
            series={[{ key: "score", color: CHART_NAVY, label: "Score" }]}
            format={(v) => String(v)}
            height={170}
            yDomain={[50, 100]}
            label="Growth Score history"
          />
        </ChartCard>

        <section>
          <SectionHeader title="Score breakdown" subtitle="Tap a factor to see how to improve it" />
          <div className="card divide-y divide-surface-line overflow-hidden">
            {growth.metrics.map((m) => {
              const d = m.score - m.previous;
              const expanded = open === m.id;
              return (
                <div key={m.id}>
                  <button type="button" onClick={() => setOpen(expanded ? null : m.id)} aria-expanded={expanded} className="w-full px-4 py-3.5 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[14px] font-semibold text-ink">{m.label}</span>
                      <span className="flex items-center gap-2">
                        {d !== 0 && (
                          <span className={cn("inline-flex items-center text-[11.5px] font-bold", d > 0 ? "text-success-dark" : "text-danger-dark")}>
                            {d > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                            {Math.abs(d)}
                          </span>
                        )}
                        <span className="tabular w-8 text-right text-[16px] font-extrabold text-ink">{m.score}</span>
                        <ChevronDown className={cn("h-4 w-4 text-ink-faint transition-transform", expanded && "rotate-180")} />
                      </span>
                    </div>
                    <ProgressBar value={m.score} tone={m.score >= 80 ? "success" : m.score >= 70 ? "gold" : "warning"} className="mt-2" label={m.label} />
                  </button>
                  {expanded && (
                    <div className="animate-fade-in space-y-1.5 bg-surface/60 px-4 pb-4 pt-1 text-[12.5px] leading-relaxed">
                      <p className="text-ink-soft">{m.description}</p>
                      <p className="text-ink">
                        <span className="font-bold">Tip: </span>
                        {m.tip}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <section className="card p-4">
            <p className="text-[12px] font-bold uppercase tracking-wide text-success-dark">What improved</p>
            <ul className="mt-2 space-y-2.5">
              {growth.improved.length ? (
                growth.improved.map((m) => (
                  <li key={m.id}>
                    <p className="text-[18px] font-extrabold text-success-dark">+{m.score - m.previous}</p>
                    <p className="text-[12px] leading-tight text-ink-soft">{m.label}</p>
                  </li>
                ))
              ) : (
                <li className="text-[12px] text-ink-muted">No gains this month yet.</li>
              )}
            </ul>
          </section>
          <section className="card p-4">
            <p className="text-[12px] font-bold uppercase tracking-wide text-warning-dark">Needs attention</p>
            <ul className="mt-2 space-y-2.5">
              {growth.attention.map((m) => (
                <li key={m.id}>
                  <p className="text-[18px] font-extrabold text-ink">{m.score}</p>
                  <p className="text-[12px] leading-tight text-ink-soft">{m.label}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section id="requirements" className="card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-ink">To reach {growth.nextStage?.id ?? "the next stage"}</h2>
            <span className="rounded-full bg-navy px-2.5 py-1 text-[12px] font-extrabold text-white">
              {met} / {growth.requirements.length}
            </span>
          </div>
          <ProgressBar value={met} max={growth.requirements.length} tone="gold" size="md" className="mt-3" />
          <ul className="mt-4 space-y-3">
            {growth.requirements.map((r) => (
              <li key={r.label} className="flex gap-3">
                {r.met ? <CheckCircle2 className="h-5 w-5 shrink-0 text-success" /> : <Circle className="h-5 w-5 shrink-0 text-ink-faint" />}
                <div>
                  <p className={cn("text-[13.5px] font-semibold", r.met ? "text-ink" : "text-ink-soft")}>{r.label}</p>
                  <p className="text-[12px] text-ink-muted">
                    {r.met ? "Done · " : "Not yet · "}
                    {r.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <p className="flex gap-2 text-[11.5px] leading-relaxed text-ink-muted">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          {SCORE_DISCLAIMER}
        </p>
      </PageBody>
    </>
  );
}
