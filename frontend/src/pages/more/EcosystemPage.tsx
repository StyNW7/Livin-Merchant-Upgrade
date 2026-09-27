import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BadgeCheck, Building2, Coins, ExternalLink, Info, Landmark, Smartphone, type LucideIcon } from "lucide-react";
import { TopAppBar, PageBody } from "@/components/layout/TopAppBar";
import { Button } from "@/components/common/Button";
import { useSession, useUI } from "@/hooks/useApp";
import { useGrowth } from "@/hooks/useBusiness";
import { formatRupiah } from "@/utils/format";

interface Card {
  id: string;
  icon: LucideIcon;
  title: string;
  text: string;
  cta: string;
  action: "external" | "financing" | "programs";
}

const CARDS: Card[] = [
  { id: "livin", icon: Smartphone, title: "Livin’ by Mandiri", text: "Manage personal and banking needs.", cta: "Open Livin’ by Mandiri", action: "external" },
  { id: "account", icon: Building2, title: "Business Account", text: "Keep your merchant finances connected.", cta: "View account summary", action: "external" },
  { id: "financing", icon: Landmark, title: "Business Financing", text: "Discover financing opportunities as your business grows.", cta: "Explore financing", action: "financing" },
  { id: "programs", icon: BadgeCheck, title: "Merchant Programs", text: "Discover selected Mandiri merchant programs.", cta: "See programs", action: "programs" },
];

export default function EcosystemPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { merchant, isGuest } = useSession();
  const { requireAccount, toast } = useUI();
  const growth = useGrowth();
  const points = isGuest ? 0 : 12_480 + growth.completedMissions * 250;

  useEffect(() => {
    if (location.hash === "#livinpoin") window.setTimeout(() => document.getElementById("livinpoin")?.scrollIntoView({ behavior: "smooth" }), 250);
  }, [location.hash]);

  const handle = (card: Card) => {
    if (card.action === "financing") return navigate("/financing");
    if (card.action === "programs") return navigate("/programs");
    if (!requireAccount(card.title)) return;
    toast(card.id === "account" ? `${merchant.accountNumber} is linked for settlement` : "Opening Livin' by Mandiri", "info");
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
          <Button block className="mt-4" onClick={() => requireAccount("Livin'poin") && toast("Livin'poin catalog would open in Livin' by Mandiri", "info")}>
            View benefits
          </Button>
        </section>

        <p className="flex gap-2 text-[11.5px] leading-relaxed text-ink-muted">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          Prototype concept. Connections shown here illustrate the intended experience and do not represent live integrations.
        </p>
      </PageBody>
    </>
  );
}
