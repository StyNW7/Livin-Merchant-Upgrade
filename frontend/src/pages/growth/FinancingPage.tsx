import { Link } from "react-router-dom";
import { ChevronRight, Info, Sprout } from "lucide-react";
import { TopAppBar, PageBody } from "@/components/layout/TopAppBar";
import { CoachMark } from "@/components/layout/Banners";
import { SectionHeader } from "@/components/common/SectionHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ProgressBar } from "@/components/common/ProgressBar";
import { FinancingCard } from "@/components/growth/FinancingCard";
import { useGrowth } from "@/hooks/useBusiness";
import { FINANCING_DISCLAIMER, financingProducts } from "@/data/financing";

export default function FinancingPage() {
  const growth = useGrowth();
  const eligible = growth.readiness >= 70;
  const recommended = financingProducts.filter((p) => p.recommended);
  const others = financingProducts.filter((p) => !p.recommended);

  return (
    <>
      <TopAppBar title="Financing Center" subtitle="Discover options as your business grows" backTo="/growth" />
      <PageBody>
        <CoachMark id="financing" text="Financing recommendations depend on recorded business activity." />

        <Link to="/growth/readiness" className="card flex items-center gap-4 p-4 transition hover:shadow-float">
          <div className="min-w-0 flex-1">
            <p className="text-[12px] text-ink-muted">Your Financing Readiness</p>
            <p className="text-[20px] font-extrabold text-ink">
              {growth.readiness}% <span className="text-[13px] font-bold text-gold-700">{growth.readinessStatus}</span>
            </p>
            <ProgressBar value={growth.readiness} tone="gold" className="mt-2" />
          </div>
          <ChevronRight className="h-5 w-5 text-ink-faint" />
        </Link>

        <section>
          <SectionHeader title="Recommended for You" />
          {eligible ? (
            <div className="space-y-3">
              {recommended.map((p) => (
                <FinancingCard key={p.id} product={p} readiness={growth.readiness} featured />
              ))}
              <div className="rounded-2xl bg-gold-50 px-4 py-3 text-[12.5px] leading-relaxed text-ink-soft">
                <span className="font-bold text-ink">Recommended because: </span>
                {recommended[0].reason}
              </div>
            </div>
          ) : (
            <div className="card">
              <EmptyState
                icon={Sprout}
                title="No recommendation yet"
                message="We’re still learning about your business. Continue building your transaction history."
              />
            </div>
          )}
        </section>

        <section>
          <SectionHeader title="Other Options" subtitle="Explore what may fit later" />
          <div className="space-y-3">
            {others.map((p) => (
              <FinancingCard key={p.id} product={p} readiness={growth.readiness} />
            ))}
          </div>
        </section>

        <p className="flex gap-2 rounded-2xl bg-white px-4 py-3 text-[12px] leading-relaxed text-ink-muted ring-1 ring-surface-line">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          {FINANCING_DISCLAIMER}
        </p>
      </PageBody>
    </>
  );
}
