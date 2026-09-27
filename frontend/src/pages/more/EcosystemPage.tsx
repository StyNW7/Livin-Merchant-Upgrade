import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BadgeCheck, Building2, Coins, ExternalLink, Info, Landmark, Smartphone, Target, type LucideIcon } from "lucide-react";
import { TopAppBar, PageBody } from "@/components/layout/TopAppBar";
import { Button } from "@/components/common/Button";
import { BottomSheet } from "@/components/common/Overlay";
import { StatusBadge } from "@/components/common/StatusBadge";
import { InfoRow } from "@/components/cards/ListRow";
import { useSession, useUI } from "@/hooks/useApp";
import { useGrowth, useSettlements } from "@/hooks/useBusiness";
import { formatRupiah, formatShortDate } from "@/utils/format";

const MANDIRI_SITE = "https://www.bankmandiri.co.id";
const POINTS_PER_MISSION = 250;
const BENEFITS = [
  { title: "Fuel and e-wallet top-up vouchers", points: 5_000 },
  { title: "Merchant supply discounts", points: 8_000 },
  { title: "Airline miles conversion", points: 10_000 },
];

interface Card {
  id: string;
  icon: LucideIcon;
  title: string;
  text: string;
  cta: string;
  action: "external" | "account" | "financing" | "programs";
}

const CARDS: Card[] = [
  { id: "livin", icon: Smartphone, title: "Livin’ by Mandiri", text: "Manage personal and banking needs.", cta: "Visit bankmandiri.co.id", action: "external" },
  { id: "account", icon: Building2, title: "Business Account", text: "Keep your merchant finances connected.", cta: "View account summary", action: "account" },
  { id: "financing", icon: Landmark, title: "Business Financing", text: "Discover financing opportunities as your business grows.", cta: "Explore financing", action: "financing" },
  { id: "programs", icon: BadgeCheck, title: "Merchant Programs", text: "Discover selected Mandiri merchant programs.", cta: "See programs", action: "programs" },
];

export default function EcosystemPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { merchant, isGuest } = useSession();
  const { requireAccount } = useUI();
  const growth = useGrowth();
  const settlements = useSettlements();
  const [sheet, setSheet] = useState<"account" | "points" | null>(null);
  const points = isGuest ? 0 : 12_480 + growth.completedMissions * POINTS_PER_MISSION;
  const lastSettlement = settlements.find((st) => st.status === "Completed");
  const nextSettlement = settlements.find((st) => st.status === "Scheduled");

  useEffect(() => {
    if (location.hash === "#livinpoin") window.setTimeout(() => document.getElementById("livinpoin")?.scrollIntoView({ behavior: "smooth" }), 250);
  }, [location.hash]);

  const handle = (card: Card) => {
    if (card.action === "financing") return navigate("/financing");
    if (card.action === "programs") return navigate("/programs");
    if (card.action === "account") return requireAccount(card.title) && setSheet("account");
    window.open(MANDIRI_SITE, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <TopAppBar title="Connected with Mandiri" subtitle="Livin’ Ecosystem" />
      <PageBody>
        <section className="hero-navy rounded-[28px] p-5 text-white">
          <img src="/Images/livin-logo.png" alt="livin' by mandiri" className="h-10 w-auto" />
          <p className="mt-4 text-[15px] font-bold">One ecosystem for your business and banking.</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-white/75">Livin Merchant works alongside your Mandiri accounts, financing discovery and loyalty benefits.</p>
        </section>

        <div className="space-y-3">
          {CARDS.map((c) => (
            <article key={c.id} className="card p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy-50 text-navy">
                  <c.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold text-ink">{c.title}</p>
                  <p className="text-[13px] text-ink-muted">{c.text}</p>
                </div>
              </div>
              <Button block variant="soft" size="sm" className="mt-3" rightIcon={c.action === "external" ? <ExternalLink className="h-3.5 w-3.5" /> : undefined} onClick={() => handle(c)}>
                {c.cta}
              </Button>
            </article>
          ))}
        </div>

        <section id="livinpoin" className="scroll-mt-24 rounded-3xl border border-gold-200 bg-gold-50 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold text-navy-900">
              <Coins className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[15px] font-bold text-ink">Livin’poin</p>
              <p className="text-[12.5px] text-ink-soft">Access eligible loyalty benefits.</p>
            </div>
          </div>
          <p className="tabular mt-4 text-[26px] font-extrabold text-navy">{points.toLocaleString("id-ID")} poin</p>
          <p className="text-[12px] text-ink-muted">{isGuest ? "Log in to see your points." : `Worth about ${formatRupiah(points)} in eligible benefits`}</p>
          <Button block className="mt-4" onClick={() => requireAccount("Livin'poin") && setSheet("points")}>
            How to earn and use points
          </Button>
        </section>

        <p className="flex gap-2 text-[11.5px] leading-relaxed text-ink-muted">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          Prototype concept. Connections shown here illustrate the intended experience and do not represent live integrations.
        </p>
      </PageBody>

      <BottomSheet open={sheet === "account"} onClose={() => setSheet(null)} title="Business Account" subtitle="Settlement destination for non-cash sales">
        <div className="card px-4 py-2">
          <InfoRow label="Account" value={merchant.accountNumber} />
          <InfoRow label="Account holder" value={merchant.name} />
          {lastSettlement && <InfoRow label="Last credited" value={`${formatRupiah(lastSettlement.net)} · ${formatShortDate(lastSettlement.date)}`} />}
          {nextSettlement && <InfoRow label="Next settlement" value={`${formatRupiah(nextSettlement.net)} · ${formatShortDate(nextSettlement.date)}`} />}
        </div>
        <Button block className="mt-4" onClick={() => { setSheet(null); navigate("/settlement"); }}>
          Open Settlement Center
        </Button>
      </BottomSheet>

      <BottomSheet open={sheet === "points"} onClose={() => setSheet(null)} title="Livin’poin" subtitle={`${points.toLocaleString("id-ID")} poin available`}>
        <div className="flex items-start gap-3 rounded-2xl bg-navy-50 p-4">
          <Target className="mt-0.5 h-5 w-5 shrink-0 text-navy" />
          <p className="text-[13px] leading-relaxed text-ink-soft">
            You earn <span className="font-bold text-ink">{POINTS_PER_MISSION} poin</span> for every completed Growth Mission.
            {" "}{growth.completedMissions} of {growth.missions.length} missions completed so far.
          </p>
        </div>
        <p className="mb-2 mt-5 text-[12px] font-bold uppercase tracking-wide text-ink-muted">Example benefits</p>
        <div className="card divide-y divide-surface-line overflow-hidden">
          {BENEFITS.map((b) => (
            <div key={b.title} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="min-w-0 text-[13.5px] font-semibold text-ink">{b.title}</span>
              {points >= b.points ? (
                <StatusBadge status="Available" tone="success" />
              ) : (
                <span className="shrink-0 text-[12px] text-ink-muted">{(b.points - points).toLocaleString("id-ID")} more</span>
              )}
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11.5px] leading-relaxed text-ink-muted">Concept only. Redemption would happen in Livin’ by Mandiri; benefits shown are examples.</p>
        <Button block variant="secondary" className="mt-4" onClick={() => { setSheet(null); navigate("/growth/missions"); }}>
          Earn more with Growth Missions
        </Button>
      </BottomSheet>
    </>
  );
}
