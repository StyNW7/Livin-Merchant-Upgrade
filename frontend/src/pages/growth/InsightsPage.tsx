import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Lightbulb } from "lucide-react";
import type { BusinessInsight } from "@/types";
import { TopAppBar, PageBody } from "@/components/layout/TopAppBar";
import { ChipRow, FilterChip } from "@/components/common/FilterChip";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState, PageSkeleton } from "@/components/common/PageSkeleton";
import { InsightCard } from "@/components/growth/InsightCard";
import { useInsights } from "@/hooks/useBusiness";
import { useSimulatedLoad } from "@/hooks/useSimulatedLoad";
import { useSession } from "@/hooks/useApp";

type Filter = "All" | BusinessInsight["category"];
const FILTERS: Filter[] = ["All", "Revenue", "Products", "Customers", "Time", "Outlet", "Payments", "Operations"];

export default function InsightsPage() {
  const insights = useInsights();
  const location = useLocation();
  const { insightConsent, setInsightConsent } = useSession();
  const { status, retry } = useSimulatedLoad();
  const [filter, setFilter] = useState<Filter>("All");
  const visible = insights.filter((i) => filter === "All" || i.category === filter);

  useEffect(() => {
    if (status === "ready" && location.hash) {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [status, location.hash]);

  return (
    <>
      <TopAppBar title="Business Insights" subtitle="What your data says, in plain language" backTo="/growth">
        <ChipRow>
          {FILTERS.map((f) => (
            <FilterChip key={f} label={f} active={filter === f} onClick={() => setFilter(f)} />
          ))}
        </ChipRow>
      </TopAppBar>
      {!insightConsent ? (
        <PageBody>
          <EmptyState
            icon={Lightbulb}
            title="Insights are turned off"
            message="You chose not to use transaction data for business insights. Turn it back on to see recommendations."
            action={
              <button type="button" onClick={() => setInsightConsent(true)} className="rounded-xl bg-navy px-4 py-2.5 text-[13px] font-semibold text-white">
                Turn on insights
              </button>
            }
          />
        </PageBody>
      ) : status === "loading" ? (
        <PageSkeleton />
      ) : status === "error" ? (
        <PageBody>
          <ErrorState message="Unable to load business insights." onRetry={retry} />
        </PageBody>
      ) : (
        <PageBody className="space-y-4">
          {visible.length ? (
            visible.map((ins) => (
              <div key={ins.id} id={ins.id} className="scroll-mt-32">
                <InsightCard insight={ins} />
              </div>
            ))
          ) : (
            <EmptyState icon={Lightbulb} title="No insights yet" message="Keep transacting and new insights will appear here." />
          )}
        </PageBody>
      )}
    </>
  );
}
