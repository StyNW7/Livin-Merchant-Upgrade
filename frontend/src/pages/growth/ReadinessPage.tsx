import { useNavigate } from "react-router-dom";
import { ArrowRight, Info, Sparkles, TrendingUp } from "lucide-react";
import { TopAppBar, PageBody } from "@/components/layout/TopAppBar";
import { CoachMark } from "@/components/layout/Banners";
import { Button } from "@/components/common/Button";
import { ProgressBar, ProgressRing } from "@/components/common/ProgressBar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useGrowth, useProfileStrength } from "@/hooks/useBusiness";
import { FINANCING_DISCLAIMER } from "@/data/financing";
import { cn } from "@/utils/cn";

const impactTone = { High: "danger", Medium: "gold", Low: "neutral" } as const;

export default function ReadinessPage() {
  const navigate = useNavigate();
  const growth = useGrowth();
  const profile = useProfileStrength();

  return (
    <>
      <TopAppBar title="Financing Readiness" subtitle="Preliminary readiness, not a credit decision" backTo="/growth" />
      <PageBody>
        <CoachMark id="financing" text="Financing recommendations depend on recorded business activity. The more consistently you record sales, the clearer your picture." />

        <section className="hero-navy rounded-[28px] p-5 text-white">
          <div className="flex items-center gap-5">
            <ProgressRing value={growth.readiness} size={112} stroke={11} tone="#FFB600" track="rgba(255,255,255,0.15)" label={`Readiness ${growth.readiness}%`}>
              <span className="tabular text-[26px] font-extrabold">{growth.readiness}%</span>
            </ProgressRing>
            <div>
              <p className="text-[12px] text-white/70">Readiness status</p>
              <p className="text-[21px] font-extrabold text-gold">{growth.readinessStatus}</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-white/75">
                {growth.readiness >= 85
                  ? "Your business profile looks ready to explore financing options."
                  : growth.readiness >= 70
                    ? "Complete one more Growth Mission to strengthen your financing profile."
                    : "Keep building your transaction history to strengthen readiness."}
              </p>
            </div>
          </div>
        </section>

        <section className="card p-4">
          <h2 className="text-[15px] font-bold text-ink">Readiness factors</h2>
          <ul className="mt-3 space-y-3.5">
            {growth.readinessFactors.map((f) => (
              <li key={f.id}>
                <div className="flex items-center justify-between">
                  <span className="text-[13.5px] font-semibold text-ink">{f.label}</span>
                  <StatusBadge status={f.level} />
                </div>
                <ProgressBar
                  value={f.value}
                  tone={f.level === "Strong" ? "success" : f.level === "Good" ? "sky" : "warning"}
                  className="mt-1.5"
                  label={f.label}
                />
                <p className="mt-1 text-[12px] text-ink-muted">{f.detail}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-4">
          <h2 className="flex items-center gap-2 text-[15px] font-bold text-ink">
            <TrendingUp className="h-4 w-4 text-success" /> What is improving your readiness?
          </h2>
          <ul className="mt-3 space-y-2">
            {growth.improving.length ? (
              growth.improving.map((f) => (
                <li key={f.id} className="flex items-center gap-2 rounded-xl bg-success-soft/60 px-3 py-2.5 text-[13px] text-ink">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  {f.label}: {f.detail.toLowerCase()}
                </li>
              ))
            ) : (
              <li className="text-[13px] text-ink-muted">No strong factors yet. Keep recording every sale.</li>
            )}
          </ul>
        </section>

        <section className="card p-4">
          <h2 className="flex items-center gap-2 text-[15px] font-bold text-ink">
            <Sparkles className="h-4 w-4 text-gold-600" /> What can strengthen it?
          </h2>
          <ul className="mt-3 divide-y divide-surface-line">
            {growth.strengthen.map((s) => (
              <li key={s.label} className="flex items-center justify-between gap-3 py-3">
                <span className="text-[13.5px] font-semibold text-ink">{s.label}</span>
                <span className="shrink-0 text-right">
                  <span className="block text-[10.5px] text-ink-muted">Potential impact</span>
                  <StatusBadge status={s.impact} tone={impactTone[s.impact]} hideIcon />
                </span>
              </li>
            ))}
          </ul>
          {profile.missing.length > 0 && (
            <Button block variant="soft" className="mt-2" onClick={() => navigate("/profile")} rightIcon={<ArrowRight className="h-4 w-4" />}>
              Complete business profile ({profile.strength}%)
            </Button>
          )}
        </section>

        <Button block size="lg" onClick={() => navigate("/financing")}>
          Explore Financing
        </Button>

        <p className={cn("flex gap-2 text-[11.5px] leading-relaxed text-ink-muted")}>
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          {FINANCING_DISCLAIMER}
        </p>
      </PageBody>
    </>
  );
}
